import { BaseLayout } from "../../../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getDatabase, ref, get, set } from "firebase/database";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/defaultV2.min.css";
import ReactPlayer from "react-player";
import getVideoDuration from "~/components/youtube_data";
import { db, auth } from "~/pages/firebase/config";
import firebase from "firebase/app";
import queryUserDocument from "~/pages/firebase/firebase_functions";
import { DocumentData, doc, getDoc } from "firebase/firestore";
import { handleVideoEnd, isWatched } from "~/pages/firebase/firebase_functions";
import TimerComponent from "~/components/Timer";

type Chapter = {
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  chapterType: string;
  controlGroupContent: string;
  experimentalGroupContent: string;
  controlGroupImageURLs: string[];
  experimentalGroupImageURLs: string[];
};

// Old Question

// type Question = {
//   questionId: string;
//   questionTitle: string;
//   questionDifficulty: string;
//   options: Option[];
// };

// New Question

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

  // Youtube states
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState("");
  const [userDocument, setUserDocument] = useState<DocumentData | null>(null);
  const [isVideoWatched, setIsVideoWatched] = useState(false);

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

  // Currently commented out because I removed the JSON from the database. I will refactor this later. But we probably don't even want that in the database, and instead, dynamically generate the survey based on questions in the database as we have discussed. In other words, we have the empty template here, and we just fill in the questions from the database.
  // This function renders the survey using the SurveyJS library.
  // https://surveyjs.io/form-library/documentation/get-started-react
  // function App() {
  //   if (
  //     !chapter ||
  //     chapter.chapterType !== "assessment" ||
  //     !chapter.controlGroup.chapterContent
  //   ) {
  //     return <div>uh oh, no survey found 🦧</div>;
  //   }

  //   const surveyJson = chapter.controlGroup.chapterContent;
  //   const survey = new Model(surveyJson);
  //   survey.onComplete.add((sender) => {
  //     console.log("Survey results: ", sender.data);
  //   });

  //   return <Survey model={survey} />;
  // }

  // I will refactor this later. This is somewhat garbage at the moment, the way it's set up. I'm thinking either an if or switch statement to determine what to render based on the chapterType. I will refactor this later.

  // Function that console.logs the length of the video, can be changed to return other information too, it stopped working, will fix later
  // function formatDuration(duration: string): string {

  //   const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  //   const matches = duration.match(regex);

  //   const hours = matches && matches[1] ? parseInt(matches[1]) : 0;
  //   const minutes = matches && matches[2] ? parseInt(matches[2]) : 0;
  //   const seconds = matches && matches[3] ? parseInt(matches[3]) : 0;

  //   let formattedDuration = '';
  //   if (hours > 0) {
  //     formattedDuration += `${hours}:`;
  //   }
  //   formattedDuration += `${minutes}:${seconds.toString().padStart(2, '0')}`;

  //   return formattedDuration;
  // }

  // // Will be made dynamic later
  // async function fetchVideoDuration() {
  //   const videoUrl = 'https://www.youtube.com/watch?v=8BoovULyJeg';
  //   try {
  //     const duration = await getVideoDuration(videoUrl);
  //     const formattedDuration = formatDuration(duration);
  //     console.log('Video Duration:', formattedDuration);
  //   } catch (error) {
  //     console.error('Failed to fetch video duration', error);
  //   }
  // }
  // fetchVideoDuration();

  // Retreive the id of the user logged in and print it
  const user = auth.currentUser;
  const uid = user ? user.uid : null;
  console.log("User:", uid);

  // If user is logged in, query and retreive the reference to their document in the users collection in firestore
  if (uid) {
    queryUserDocument(uid).then((userDocument) => {
      console.log("User Document:", userDocument);

      setUserDocument(userDocument);
    });
  }
  console.log("User Document ID:", userDocument?.id);

  // Check if the isWatched key value pair is set to true in the user's document in firestore to decide if the next button should be visible
  (async () => {
    if (await isWatched(userDocument?.id)) {
      setIsVideoWatched(true);
    }
  })();

  return (
    <BaseLayout>
      <h1 className="text-3xl font-bold">{chapter.chapterTitle}</h1>
      <p className="border-b-4 py-3">{chapter.chapterDescription}</p>
      <div className="max-h-screen overflow-y-auto">
        {/* Later on, AFTER we set up user profiles, we want to implement conditional logic to determine what content we want to display based on what group they are assigned after either signing up/completing initial assessment */}
        {chapter.chapterType === "text" && (
          <div className="m-4 rounded border p-4 shadow">
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
            {/* <iframe
              title="YouTube video player"
              className="h-full w-full"
              allowFullScreen
              src={chapter.controlGroupContent}
            ></iframe> */}

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

                // console.log('User Document ID:' , userDocument?.id);
                handleVideoEnd(playedMinutes, userDocument?.id);
                setIsVideoWatched(true);
              }}
              // playing
              // progressInterval={1000}
              seekTo={20}
            />
          </div>
        )}
        {isVideoWatched && (
          <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white transition duration-150 ease-in-out hover:bg-blue-700">
            Next
          </button>
        )}
        <br />
        {/* Converts seconds to minutes and removes the decimal point */}
        video progress: {Math.floor(played / 60)}:
        {String(Math.floor(played % 60)).padStart(2, "0")}
        {/* Record how long a user spends on the chapter currently open */}
        <br />
        <p>User's time spent on this chapter:</p>
        <TimerComponent />
        {/* {chapter.chapterType === "assessment" && App()} */}
      </div>
    </BaseLayout>
  );
}
