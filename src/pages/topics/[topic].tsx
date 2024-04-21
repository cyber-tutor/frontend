import { BaseLayout } from "../../components/layouts/BaseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../../components/firebase/config";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  DocumentData,
  where,
} from "firebase/firestore";
import Link from "next/link";
import CircularWithValueLabel from "~/components/ui/ProgressCircle";
import { auth } from "../../components/firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import queryUserDocument from "../../components/firebase/FirebaseFunctions";

type Topic = {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  chapters: Chapter[];
};

type Chapter = {
  chapterId: string;
  chapterType: string;
  chapterTitle: string;
  chapterDescription: string;
  controlGroupContent: string;
  experimentalGroupContent: string;
  controlGroupImageURL: string;
  experimentalGroupImageURL: string;
  order: number;
  proficiency: number;
};

const updateChapterCompletion = (
  chapterId: string,
  complete: boolean,
  setChapterCompletion: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >,
): void => {
  setChapterCompletion((prev: Record<string, boolean>) => {
    const updated: Record<string, boolean> = { ...prev, [chapterId]: complete };
    if (typeof window !== "undefined") {
      localStorage.setItem("chapterCompletion", JSON.stringify(updated));
    }
    return updated;
  });
};

export default function TopicPage() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDocument, setUserDocument] = useState<DocumentData | null>(null);
  const [userProficiency, setUserProficiency] = useState<number | null>(null);
  const [chapterCompletion, setChapterCompletion] = useState<
    Record<string, boolean>
  >({});
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const router = useRouter();
  const { topic: topicId } = router.query;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/users/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      if (uid) {
        const userDoc = await queryUserDocument(uid);
        setUserDocument(userDoc);

        const levelRef = doc(
          db,
          `users/${userDoc?.id}/levels`,
          topicId?.toString() ?? "",
        );
        const levelSnapshot = await getDoc(levelRef);
        if (levelSnapshot.exists()) {
          const userLevel = levelSnapshot.data().level;
          setUserProficiency(userLevel);
          if (typeof window !== "undefined") {
            localStorage.setItem("userLevel", userLevel.toString());
          }
        }

        const progressCollectionRef = collection(
          db,
          `users/${userDoc?.id}/progress`,
        );
        const progressQuery = query(
          progressCollectionRef,
          where("topicId", "==", topicId?.toString() ?? ""),
        );
        const progressSnapshot = await getDocs(progressQuery);

        const completionStatus: Record<string, boolean> = {};
        progressSnapshot.forEach((doc) => {
          completionStatus[doc.id] = doc.data().complete;
        });

        setChapterCompletion(completionStatus);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "chapterCompletion",
            JSON.stringify(completionStatus),
          );
        }
      }

      setUserDataLoaded(true);
    };

    fetchUserData();
  }, [topicId, topic]);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId || Array.isArray(topicId)) return;

      setLoading(true);
      try {
        const topicRef = doc(db, "topics", topicId);

        const topicSnapshot = await getDoc(topicRef);

        if (topicSnapshot.exists()) {
          const topicData = topicSnapshot.data();

          const chaptersCollectionRef = collection(
            db,
            `topics/${topicId}/chapters`,
          );

          const chaptersQuery = query(chaptersCollectionRef, orderBy("order"));
          const chaptersSnapshot = await getDocs(chaptersQuery);

          const chapters = chaptersSnapshot.docs.map((doc) => {
            const chapterData = doc.data();
            return {
              chapterId: doc.id,
              chapterType: chapterData.chapterType,
              chapterTitle: chapterData.chapterTitle,
              chapterDescription: chapterData.chapterDescription,
              controlGroupContent: chapterData.controlGroupContent,
              experimentalGroupContent: chapterData.experimentalGroupContent,
              controlGroupImageURL: chapterData.controlGroupImageURL,
              experimentalGroupImageURL: chapterData.experimentalGroupImageURL,
              order: chapterData.order,
              proficiency: chapterData.proficiency,
            };
          });

          setTopic({
            topicId: topicSnapshot.id,
            topicTitle: topicData.topicTitle,
            topicDescription: topicData.topicDescription,
            chapters,
          });
        } else {
          setError("The requested topic was not found.");
        }
      } catch (err) {
        setError("An error occurred while fetching the topic.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProficiency = localStorage.getItem("userProficiency");
      if (storedProficiency) {
        setUserProficiency(parseInt(storedProficiency));
      }

      const storedCompletion = localStorage.getItem("chapterCompletion");
      if (storedCompletion) {
        setChapterCompletion(JSON.parse(storedCompletion));
      }
    }
  }, []);
  if (loading || !userDataLoaded)
    return (
      <BaseLayout>
        <div className="mt-5 text-center">Loading, please wait...</div>
      </BaseLayout>
    );
  if (error)
    return (
      <BaseLayout>
        <div className="mt-5 text-center">An error occurred: {error}</div>
      </BaseLayout>
    );
  if (!topic)
    return (
      <BaseLayout>
        <div className="mt-5 text-center">Topic not found.</div>
      </BaseLayout>
    );
  const proficiencyRatio =
    userProficiency !== null && topic
      ? Math.round((userProficiency / topic.chapters.length) * 100)
      : 0;

  return (
    <BaseLayout>
      <div className="flex w-full flex-col items-center">
        <div className="mt-20 overflow-y-auto rounded-lg border-2 border-solid  text-center md:mt-20 lg:mt-10 p-5">
          <div className="grid grid-cols-6 items-center">
            <h1 className="col-span-5 flex justify-start text-3xl font-bold">
              {topic.topicTitle}
            </h1>
            <div className="flex justify-end">
              <span className="decoration-5 flex rounded-full border-solid border-black  p-1.5 text-xs font-bold ">
                <CircularWithValueLabel value={proficiencyRatio} />
              </span>
            </div>
          </div>
          <p className="border-b-4 py-3">{topic.topicDescription}</p>
          <div className="flex flex-col text-start">
            {topic.chapters.map((chapter) =>
              userProficiency !== null &&
              userProficiency >= chapter.proficiency ? (
                <Link
                  key={chapter.chapterId}
                  href={`/topics/${encodeURIComponent(
                    topic.topicId,
                  )}/chapters/${encodeURIComponent(chapter.chapterId)}`}
                  className="px-3 pt-3 hover:bg-slate-200"
                >
                  <div>
                    <div className="grid grid-cols-6 items-center">
                      <h3 className="col-span-5 text-xl font-bold">
                        {chapter.chapterType.toLowerCase() === "assessment" && (
                          <p className="text-xs font-bold">
                            {chapter.chapterType.toUpperCase()}
                          </p>
                        )}
                        {chapter.chapterTitle}
                        {chapterCompletion[chapter.chapterId] ? " ✅" : ""}
                      </h3>
                      <div className="flex justify-end">
                        <span className="decoration-5 rounded-full border border-solid border-black bg-slate-200 p-1.5 text-xs font-bold">
                          🔓
                        </span>
                      </div>
                    </div>
                    <p className="border-b-2 pb-3">
                      {chapter.chapterDescription}
                    </p>
                  </div>
                </Link>
              ) : (
                <div
                  key={chapter.chapterId}
                  className="cursor-not-allowed bg-slate-200 px-3 pt-3"
                >
                  <div>
                    <div className="grid grid-cols-6 items-center">
                      <h3 className="col-span-5 text-xl font-bold">
                        <p className="text-xs font-bold">
                          {chapter.chapterType.toUpperCase()}
                        </p>
                        {chapter.chapterTitle}
                      </h3>
                      <div className="flex justify-end">
                        <span className="decoration-5 rounded-full border border-solid border-black bg-red-500 p-1.5 text-xs font-bold">
                          🔒
                        </span>
                      </div>
                    </div>
                    <p className="border-b-2 pb-3">
                      {chapter.chapterDescription}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
