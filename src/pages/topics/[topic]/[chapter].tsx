import { BaseLayout } from "../../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/defaultV2.min.css";
import ReactPlayer from 'react-player'
import getVideoDuration from "~/components/youtube_data";

type Topic = {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  chapters: Chapter[];
};

type Chapter = {
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  chapterType: string;
  controlGroupContent: string;
  experimentalGroupContent: string;
  controlGroupImageURLs: string[]; // Add image URLs
  experimentalGroupImageURLs: string[]; // Add image URLs
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
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState("");

  const router = useRouter();
  // This gets the topic and chapter parameters from the URL.
  const { topic: topicTitle, chapter: chapterTitle } = router.query;

  useEffect(() => {
    if (topicTitle && chapterTitle) {
      const url = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_GET_TOPICS}?topicTitle=${encodeURIComponent(String(topicTitle))}&chapterTitle=${encodeURIComponent(String(chapterTitle))}`;

      fetch(url)
        .then((res) =>
          res.ok ? res.json() : Promise.reject(new Error(res.statusText)),
        )
        .then((data) => {
          const foundTopic = data.find(
            (t: Topic) => t.topicTitle === topicTitle,
          );
          const foundChapter = foundTopic?.chapters.find(
            (c: Chapter) => c.chapterTitle === chapterTitle,
          );
          setChapter(foundChapter || null);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          setError("Chapter fetch failed");
          setLoading(false);
        });
    }
  }, [topicTitle, chapterTitle]);

  // The following 3 conditionals are just to handle the different states of the page.
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



    if (chapter && chapter.chapterType === "video") {
      getVideoDuration(chapter.controlGroupContent)
        .then((duration) => {
          console.log("Video duration:", duration);

        })
        .catch((error) => {
          console.error("Error getting video duration:", error);
        });
    }
 






    


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
                className="mt-5 mx-auto shadow-lg w-1/3"
                src={chapter.controlGroupImageURLs[0]}
                alt={chapterTitle ? String(chapterTitle) : undefined}
                title={chapterTitle ? String(chapterTitle) : undefined}
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
            />
          </div>
        )}
        <br />
        progress: {Math.floor(played / 60)}:{String(Math.floor(played % 60)).padStart(2, '0')}

        {/* {chapter.chapterType === "assessment" && App()} */}
      </div>
    </BaseLayout>
  );
}
