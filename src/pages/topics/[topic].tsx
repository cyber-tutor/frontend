import { BaseLayout } from "../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import CircularWithValueLabel from "~/components/ProgressCircle";
import { auth } from "../firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import queryUserDocument from "../firebase/firebase_functions";

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
  controlGroupImageURLs: string[];
  experimentalGroupImageURLs: string[];
  order: number;
  proficiency: number; // Add proficiency property
};

// Utility function for updating chapter completion status
const updateChapterCompletion = (
  chapterId: string,
  complete: boolean,
  setChapterCompletion: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
): void => {
  setChapterCompletion((prev: Record<string, boolean>) => {
    const updated: Record<string, boolean> = { ...prev, [chapterId]: complete };
    if (typeof window !== 'undefined') {
      localStorage.setItem('chapterCompletion', JSON.stringify(updated));
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
  const [chapterCompletion, setChapterCompletion] = useState<Record<string, boolean>>({});
  const [userDataLoaded, setUserDataLoaded] = useState(false); // New state variable to track user data loading

  const router = useRouter();
  const { topic: topicId } = router.query;

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/users/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch user data (proficiency and chapter completion status)
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      if (uid) {
        const userDoc = await queryUserDocument(uid);
        setUserDocument(userDoc);

        // Fetch user proficiency for the topic
        const proficiencyRef = doc(db, `users/${userDoc?.id}/proficiency`, topicId?.toString() ?? "");
        const proficiencySnapshot = await getDoc(proficiencyRef);
        if (proficiencySnapshot.exists()) {
          const proficiency = proficiencySnapshot.data().number;
          setUserProficiency(proficiency);
          if (typeof window !== 'undefined') {
            localStorage.setItem('userProficiency', proficiency.toString()); // Store proficiency in local storage
          }
        }

        // Fetch chapter completion status
        const progressCollectionRef = collection(db, `users/${userDoc?.id}/progress`);
        const progressSnapshot = await getDocs(progressCollectionRef);
        const completionStatus: Record<string, boolean> = {};
        progressSnapshot.forEach((doc) => {
          completionStatus[doc.id] = doc.data().complete;
        });
        setChapterCompletion(completionStatus);
        if (typeof window !== 'undefined') {
          localStorage.setItem('chapterCompletion', JSON.stringify(completionStatus)); // Store completion status in local storage
        }
      }

      setUserDataLoaded(true); // Set user data loaded to true once everything is fetched
    };

    fetchUserData();
  }, [topicId]);

  // Fetch topic data
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
              controlGroupImageURLs: chapterData.controlGroupImageURLs,
              experimentalGroupImageURLs: chapterData.experimentalGroupImageURLs,
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
          console.error("uh oh, topic not found 🦧");
          setError("uh oh, topic not found 🦧");
        }
      } catch (err) {
        console.error("uh oh, error fetching topic 🦧:", err);
        setError("uh oh, error fetching topic 🦧");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  // Load user proficiency and chapter completion from local storage when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProficiency = localStorage.getItem('userProficiency');
      if (storedProficiency) {
        setUserProficiency(parseInt(storedProficiency));
      }

      const storedCompletion = localStorage.getItem('chapterCompletion');
      if (storedCompletion) {
        setChapterCompletion(JSON.parse(storedCompletion));
      }
    }
  }, []);

  if (loading || !userDataLoaded)
    return (
      <BaseLayout>
        <div>please wait, loading... 🦧</div>
      </BaseLayout>
    );
  if (error)
    return (
      <BaseLayout>
        <div>uh oh, error 🦧: {error}</div>
      </BaseLayout>
    );
  if (!topic)
    return (
      <BaseLayout>
        <div>uh oh, topic not found 🦧</div>
      </BaseLayout>
    );

  const proficiencyRatio = userProficiency !== null && topic ? Math.round((userProficiency / topic.chapters.length) * 100) : 0;
      
  return (
    <BaseLayout>
      <div className="overflow-y-auto rounded-lg border-2 border-solid text-center lg:w-7/12 lg:p-10">
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
          {topic.chapters.map((chapter) => (
            userProficiency !== null && userProficiency >= chapter.proficiency ? (
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
                      <p className="text-xs font-bold">
                        {chapter.chapterType.toUpperCase()}
                      </p>
                      {chapter.chapterTitle}
                      {chapterCompletion[chapter.chapterId] ? ' ✅' : ''}
                    </h3>
                    <div className="flex justify-end">
                      <span className="decoration-5 rounded-full border border-solid border-black bg-slate-200 p-1.5 text-xs font-bold">
                        🔓
                      </span>
                    </div>
                  </div>
                  <p className="border-b-2 pb-3">{chapter.chapterDescription}</p>
                </div>
              </Link>
            ) : (
              <div
                key={chapter.chapterId}
                className="px-3 pt-3 bg-slate-200 cursor-not-allowed"
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
                  <p className="border-b-2 pb-3">{chapter.chapterDescription}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </BaseLayout>
  );
}
