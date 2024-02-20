import { BaseLayout } from "../../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/defaultV2.min.css";

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
  chapterPrompt: string;
  chapterQuestions?: Question[];
  chapterContent?: string;
  controlGroup: {
    chapterContent: string;
  };
  experimentalGroup: {
    chapterContent: string;
  };
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

  const router = useRouter();
  // This gets the topic and chapter parameters from the URL.
  const { topic: topicTitle, chapter: chapterTitle } = router.query;

  useEffect(() => {
    // I put URL in .env.local. If you visit that link, you can view the topics in the database with no authentication required. So keep it in .env.local or we're cooked.
    if (topicTitle && chapterTitle) {
      const url = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_GET_TOPICS}?topicTitle=${encodeURIComponent(topicTitle as string)}&chapterTitle=${encodeURIComponent(chapterTitle as string)}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const foundTopic = data.find(
            (t: Topic) =>
              t.topicTitle === decodeURIComponent(topicTitle as string),
          );
          if (foundTopic) {
            const foundChapterIndex = foundTopic.chapters.findIndex(
              (c: Chapter) =>
                c.chapterTitle === decodeURIComponent(chapterTitle as string),
            );
            if (foundChapterIndex !== -1) {
              const foundChapter = {
                ...foundTopic.chapters[foundChapterIndex],
                controlGroup: foundTopic.controlGroup[foundChapterIndex],
              };
              setChapter(foundChapter);
            } else {
              setChapter(null);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setError("Failed to fetch chapter data");
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

  return (
    <BaseLayout>
      <h1 className="text-3xl font-bold">{chapter.chapterTitle}</h1>
      <p className="border-b-4 py-3">{chapter.chapterDescription}</p>
      {/* Later on, AFTER we set up user profiles, we want to implement conditional logic to determine what content we want to display based on what group they are assigned after either signing up/completing initial assessment */}
      {chapter.chapterType === "text" && (
        <div className="m-4 rounded border p-4 shadow">
          {chapter.controlGroup.chapterContent}
        </div>
      )}
      {chapter.chapterType === "video" && (
        <div className="flex aspect-[16/9] flex-grow">
          <iframe
            title="YouTube video player"
            className="h-full w-full"
            allowFullScreen
            src={chapter.controlGroup.chapterContent}
          ></iframe>
        </div>
      )}
      {/* {chapter.chapterType === "assessment" && App()} */}
    </BaseLayout>
  );
}
