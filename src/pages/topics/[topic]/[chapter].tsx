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

  const router = useRouter();
  // This gets the topic and chapter parameters from the URL.
  const { topic: topicTitle, chapter: chapterTitle } = router.query;

  useEffect(() => {
    // I put URL in .env.local. If you visit that link, you can view the topics in the database with no authentication required. So keep it in .env.local or we're cooked.
    const url = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_GET_TOPICS;
    const quizUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_GET_QUSTIONS;
    if (!url) {
      console.error("uh oh, URL not recognized 🦧");
      return;
    }

    if (topicTitle && chapterTitle) {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("uh oh, HTTP response failed 🦧");
          }
          return response.json();
        })
        // This sets the topic and chapter state variables from the fetched topics based on the URL parameters with some error handling.
        .then((topics) => {
          const foundTopic = topics.find(
            (t: Topic) =>
              t.topicTitle === decodeURIComponent(topicTitle as string),
          );
          if (foundTopic) {
            const foundChapter = foundTopic.chapters.find(
              (c: Chapter) =>
                c.chapterTitle === decodeURIComponent(chapterTitle as string),
            );
            setChapter(foundChapter || null);
          } else {
            setError("uh oh, topic not found 🦧");
          }
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
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

  // This function renders the survey using the SurveyJS library.
  // https://surveyjs.io/form-library/documentation/get-started-react
  function App() {
    if (
      !chapter ||
      chapter.chapterType !== "assessment" ||
      !chapter.controlGroup.chapterContent
    ) {
      return <div>uh oh, no survey found 🦧</div>;
    }

    const surveyJson = chapter.controlGroup.chapterContent;
    const survey = new Model(surveyJson);
    survey.onComplete.add((sender) => {
      console.log("Survey results: ", sender.data);
    });

    return <Survey model={survey} />;
  }

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
      {chapter.chapterType === "assessment" && App()}
    </BaseLayout>
  );
}
