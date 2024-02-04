import { useRouter } from "next/router";
import { BaseLayout } from "../layouts/baseLayout";
import topics from "../../../public/testing-data/topics.json";

export default function ChapterPage() {
  const router = useRouter();
  const { chapter: chapterTitle } = router.query;

  const chapter = topics
    .flatMap((topic) => topic.chapters)
    .find(
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
