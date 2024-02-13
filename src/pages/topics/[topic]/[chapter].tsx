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
      {/* Depending on the chapter type, render different content */}
      {chapter.chapterType === "text" && (
        <div>
          {/* Blah blah, paraphrased text */}This is a text-based chapter
        </div>
      )}
      {chapter.chapterType === "video" && (
        <div>{/* Blah blah, video */}This is a video chapter.</div>
      )}
      {chapter.chapterType === "quiz" && (
        <div>{/* Blah blah, quiz */}This is an assessment chapter</div>
      )}
    </BaseLayout>
  );
}
