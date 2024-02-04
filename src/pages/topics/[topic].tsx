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
      <div className="w-7/12 rounded-lg border-2 border-solid p-10 text-center">
        <h1 className="text-3xl font-bold">{topic.title}</h1>
        <p className="border-b-4 py-3">{topic.description}</p>
        <div className="flex flex-col text-start">
          {topic.chapters.map((chapter, index) => (
            <Link
              key={index}
              href={`/chapters/${chapter.title}`}
              className="px-3 pt-3 hover:bg-cyan-200"
            >
              <div>
                <div className="grid grid-cols-6">
                  <h3 className="col-span-5 text-xl font-bold">
                    {chapter.title}
                  </h3>
                  <p> Complete?:❌ </p>
                </div>
                <div></div>
                <p className="border-b-2 pb-3">{chapter.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </BaseLayout>
  );
}
