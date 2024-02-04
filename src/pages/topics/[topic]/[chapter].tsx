import { useRouter } from "next/router";
import { BaseLayout } from "../../layouts/baseLayout";
import topics from "../../../../public/testing-data/topics.json";

export default function ChapterPage() {
  const router = useRouter();
  const { topic: topicTitle, chapter: chapterTitle } = router.query;

  const topic = topics.find(
    (topic) => topic.title === decodeURIComponent(topicTitle as string),
  );

  const chapter = topic?.chapters.find(
    (chapter) => chapter.title === decodeURIComponent(chapterTitle as string),
  );

  if (!chapter) {
    return (
      <BaseLayout>
        <div>Chapter not found</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <h1 className="text-3xl font-bold">{chapter.title}</h1>
      <p className="border-b-4 py-3">{chapter.description}</p>
    </BaseLayout>
  );
}