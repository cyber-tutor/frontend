import { BaseLayout } from "../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import Link from "next/link";
import CircularWithValueLabel from "~/components/ProgressCircle";

// I redefined the types again because of the data transformation that happens through the Firebase Cloud Function.
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

export default function TopicPage() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { topic: topicId } = router.query;

  useEffect(() => {
    if (topicId) {
      // I put URL in .env.local. If you visit that link, you can view the topics in the database with no authentication required. So keep it in .env.local or we're cooked.
      const url = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_GET_TOPICS}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const foundTopic = data.find((t: Topic) => t.topicId === topicId);
          setTopic(foundTopic);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          // Forgot to add this previously, but we need to setLoading to false or else it gets stuck in an infinite loop.
          setLoading(false);
        });
    }
  }, [topicId]);

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
  if (!topic)
    return (
      <BaseLayout>
        <div>uh oh, topic not found 🦧</div>
      </BaseLayout>
    );

  return (
    <BaseLayout>
      <div className="rounded-lg border-2 border-solid text-center lg:w-7/12 lg:p-10">
                <div className="grid grid-cols-6 items-center">
                  <h1 className="col-span-5 flex justify-start text-3xl font-bold">
                    {topic.topicTitle}
                  </h1>
                  <div className="flex justify-end">
                    {/* We want to have it so this is a boolean later on */}
                    <span className="decoration-5 flex rounded-full border -solid border-black  p-1.5 text-xs font-bold ">
                      <CircularWithValueLabel />
                    </span>
                  </div>
                </div>
        <p className="border-b-4 py-3">{topic.topicDescription}</p>
        <div className="flex flex-col text-start">
          {topic.chapters.map((chapter, index) => (
            <Link
              key={index}
              href={`/topics/${encodeURIComponent(topic.topicTitle)}/${encodeURIComponent(chapter.chapterTitle)}`}
              className="px-3 pt-3 hover:bg-slate-200"
            >
              <div>
                <div className="grid grid-cols-6 items-center">
                  <h3 className="col-span-5 text-xl font-bold">
                    {chapter.chapterTitle}
                  </h3>
                  {/* Same here, boolean stuff */}
                  <div className="flex justify-end">
                    <span className="decoration-5 rounded-full border border-solid border-black bg-slate-200 p-1.5 text-xs font-bold">
                      ❌{/* Complete ✅ */}
                    </span>
                  </div>
                </div>
                <div></div>
                <p className="border-b-2 pb-3">{chapter.chapterDescription}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </BaseLayout>
  );
}
