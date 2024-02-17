import { BaseLayout } from "../../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";

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
    if (topicTitle && chapterTitle) {
      const db = getDatabase();
      const topicsRef = ref(db, "/topics");

      get(topicsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const topics: Topic[] = Object.values(snapshot.val());
            const foundTopic = topics.find(
              (t) => t.topicTitle === decodeURIComponent(topicTitle as string),
            );
            if (foundTopic) {
              const foundChapter = foundTopic.chapters.find(
                (c) =>
                  c.chapterTitle === decodeURIComponent(chapterTitle as string),
              );
              setChapter(foundChapter || null);
            } else {
              setError("Topic not found");
            }
          } else {
            setError("No topics available");
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
        <div>Loading...</div>
      </BaseLayout>
    );
  if (error)
    return (
      <BaseLayout>
        <div>Error: {error}</div>
      </BaseLayout>
    );
  if (!chapter)
    return (
      <BaseLayout>
        <div>Chapter not found</div>
      </BaseLayout>
    );

  return (
    <BaseLayout>
      <h1 className="text-3xl font-bold">{chapter.chapterTitle}</h1>
      <p className="border-b-4 py-3">{chapter.chapterDescription}</p>
      {/* Later on, AFTER we set up user profiles, we want to implement conditional logic to determine what content we want to display based on what group they are assigned after either signing up/completing initial assessment */}
      {chapter.chapterType === "text" && (
        <div>{chapter.controlGroup.chapterContent}</div>
      )}
      {chapter.chapterType === "video" && (
        <div>
          <iframe
            title="YouTube video player"
            width="560"
            height="315"
            allowFullScreen
            src={chapter.controlGroup.chapterContent}
          ></iframe>
        </div>
      )}
      {chapter.chapterType === "assessment" && (
        <div>{/* Blah blah, assessment */}This is an assessment chapter</div>
      )}
    </BaseLayout>
  );
}
