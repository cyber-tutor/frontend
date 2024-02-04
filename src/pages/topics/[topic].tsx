import { BaseLayout } from "../layouts/baseLayout";
import { useRouter } from "next/router";
import topics from "../../../public/testing-data/topics.json";
import Link from "next/link";

export default function TopicPage() {
  const router = useRouter();
  const { topic: topicTitle } = router.query;

  const topic = topics.find(
    (topic) => topic.title === decodeURIComponent(topicTitle as string),
  );

  if (!topic) {
    return (
      <BaseLayout>
        <div>Topic not found</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <h1 className="text-3xl font-bold">{topic.title}</h1>
      <p className="border-b-4 py-3">{topic.description}</p>
      <h2 className="text-2xl font-bold">Chapters</h2>
      <div className="flex flex-col text-center">
        {topic.chapters.map((chapter, index) => (
          <Link
            key={index}
            href={`/chapters/${chapter.title}`}
            className="p-4 hover:bg-gray-100"
          >
            <div>
              <h3 className="text-xl font-bold">{chapter.title}</h3>
              <p>{chapter.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </BaseLayout>
  );
}
