import { BaseLayout } from "../../layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";

type Chapter = {
  title: string;
  description: string;
};

type Topic = {
  title: string;
  description: string;
  chapters: Chapter[];
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
      const topicsRef = ref(db, "/");

      get(topicsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const topics: Topic[] = Object.values(snapshot.val());
            const foundTopic = topics.find(
              (t) => t.title === decodeURIComponent(topicTitle as string),
            );
            if (foundTopic) {
              const foundChapter = foundTopic.chapters.find(
                (c) => c.title === decodeURIComponent(chapterTitle as string),
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
      <h1 className="text-3xl font-bold">{chapter.title}</h1>
      <p className="border-b-4 py-3">{chapter.description}</p>
      {/* We want to have the content on this page be similar to Coursera. We should probably structure our test data to reflect what we actually want in Firebase. For example, we would probably want to have a field that tells us what type of content should be displayed (video, text-based, quiz, etc.) then have conditionals. Like, for a YouTube video, we would want the video as well as a transcript, but for text, we would just want text, or for an assessment, we would want just the SurveyJS implementation. */}
    </BaseLayout>
  );
}
