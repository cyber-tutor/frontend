import { BaseLayout } from "../../../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/defaultV2.min.css";
import ReactPlayer from "react-player";
import getVideoDuration from "~/components/youtube_data";
import { db, auth } from "~/pages/firebase/config";
import { DocumentData, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { findUserDocId, handleVideoEnd, isWatched, getNextChapterId, increaseLevel} from "~/pages/firebase/firebase_functions";
import TimerComponent from "~/components/Timer";
import DynamicSurvey from "../../../../components/DynamicSurvey";
import { progress } from "framer-motion";



type Chapter = {
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  chapterType: string;
  controlGroupContent: string;
  experimentalGroupContent: string;
  controlGroupImageURLs: string[];
  experimentalGroupImageURLs: string[];
  order: number;
};

type Question = {
  questionId: string;
  questionTitle: string;
  questionDifficulty: string;
  options: Option[];
};

type Option = {
  optionId: string;
  optionTitle: string;
  optionCorrectness: string;
  optionReasoning: string;
};

export default function ChapterPage() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [played, setPlayed] = useState(0);
  const [userDocument, setUserDocument] = useState<DocumentData | null>(null);
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [progressComplete, setProgressComplete] = useState(false);

  const router = useRouter();
  const { topic: topicId, chapter: chapterId } = router.query;

  useEffect(() => {
    const fetchChapter = async () => {
      if (
        !topicId ||
        !chapterId ||
        Array.isArray(topicId) ||
        Array.isArray(chapterId)
      )
        return;

      setLoading(true);
      try {
        const chapterRef = doc(
          db,
          "topics",
          String(topicId),
          "chapters",
          String(chapterId),
        );
        const chapterSnapshot = await getDoc(chapterRef);

        if (chapterSnapshot.exists()) {
          setChapter({
            chapterId: chapterSnapshot.id,
            ...chapterSnapshot.data(),
          } as Chapter);
        } else {
          console.error("No such chapter!");
          setError("Chapter not found");
        }
      } catch (err) {
        console.error("Error fetching chapter:", err);
        setError("Failed to fetch chapter");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [topicId, chapterId]);

  useEffect(() => {
    // Check if 1 minute has passed
    if (secondsElapsed >= 3) {
      setProgressComplete(true);
    }
  }, [secondsElapsed]);

  if (loading)
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
  if (!chapter)
    return (
      <BaseLayout>
        <div>uh oh, chapter not found 🦧</div>
      </BaseLayout>
    );

  const user = auth.currentUser;
  const uid = user ? user.uid : null;
  console.log("User:", uid);

  

  return (
    <BaseLayout>
      <h1 className="text-3xl font-bold">{chapter.chapterTitle}</h1>
      <p className="border-b-4 py-3">{chapter.chapterDescription}</p>
      <div className="mx-auto w-full overflow-y-auto">
        {chapter.chapterType === "text" && (
          <div className="m-4 rounded border p-4 shadow"> 
            {userDocument?.data().id}

            {chapter.controlGroupContent}
            {chapter.controlGroupImageURLs[0] && (
              <img
                className="mx-auto mt-5 w-1/3 shadow-lg"
                src={chapter.controlGroupImageURLs[0]}
                alt={
                  chapter.chapterTitle
                    ? String(chapter.chapterTitle)
                    : undefined
                }
                title={
                  chapter.chapterTitle
                    ? String(chapter.chapterTitle)
                    : undefined
                }
              />
            )}
          </div>
        )}
        {chapter.chapterType === "video" && (
          <div className="flex aspect-[16/9] flex-grow">
            <ReactPlayer
              url={chapter.controlGroupContent}
              onProgress={(progress) => {
                setPlayed(progress.playedSeconds);
              }}
              className="h-full w-full"
              allowFullScreen
              controls={false}
              onEnded={() => {
                const playedMinutes = Math.floor(played / 60);
                console.log("video ended");
                handleVideoEnd(playedMinutes, userDocument?.id);
                setIsVideoWatched(true);
              }}
              seekTo={20}
            />
          </div>
          
        )}

{progressComplete && chapter.chapterType !== "assessment" && (
  <button
    className="rounded bg-blue-500 px-4 py-2 font-bold text-white transition duration-150 ease-in-out hover:bg-blue-700"
    onClick={async () => {
      const userDocId = await findUserDocId(uid ?? "");
      if (typeof chapterId === 'string' && userDocId) {
        const userDocRef = doc(db, "users", userDocId);
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        const timeElapsed = `${minutes}:${String(seconds).padStart(2, "0")}`;
        await updateDoc(userDocRef, {
          timeOnPage: timeElapsed,
        });
        console.log(
          "User time watched pushed successfully to firestore:",
          timeElapsed,
        );

        const progressRef = doc(db, "users", userDocId, "progress", chapterId);
        const progressSnapshot = await getDoc(progressRef);

        if (progressSnapshot.exists()) {
          const progressData = progressSnapshot.data();
          const attempts = progressData.attempts ?? {};
          const nextAttemptNumber = Object.keys(attempts).length + 1;
          const updatedAttempts = {
            ...attempts,
            [nextAttemptNumber]: {
              timeElapsed,
            },
          };


          const userLevel = doc(db, "users", userDocId, "levels", progressData.topicId);
          const levelSnapshot = await getDoc(userLevel);
          const levelData = levelSnapshot.data();

          const topicString: String|null = await getNextChapterId(chapter.order, progressData.topicId, levelData?.level);

          

          if(progressData.complete === false){
          await updateDoc(progressRef, {
            complete: true,
            attempts: updatedAttempts,
          });

          await increaseLevel(progressData.topicId, userDocId);
          
        }

        if (topicString === null){
          alert("Your knowledge level is too low to access the next chapter. Please complete some other chapters to raise it.");
          router.push(`/topics/${progressData.topicId}`);
        }
        else if (topicString !== null){
            router.push(`/topics/${progressData.topicId}/chapters/${topicString}`);
          } 
        } else {
          // If no progress document exists, create the first attempt
          await updateDoc(progressRef, {
            complete: true,
            attempts: {
              1: {
                timeElapsed,
              },
            },
          });
        }
      }
    }}
  >
    Next
  </button>
)}




        <br />
        video progress: {Math.floor(played / 60)}:
        {String(Math.floor(played % 60)).padStart(2, "0")}
        <br />
        <p>User's time spent on this chapter:</p>
        <TimerComponent
          secondsElapsed={secondsElapsed}
          setSecondsElapsed={setSecondsElapsed}
        />
        {chapter && chapter.chapterType === "assessment" && (
          <div className="w-full px-4 md:px-0">
            <DynamicSurvey chapterId={chapter.chapterId} userId={userDocument?.data().userId} />
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
