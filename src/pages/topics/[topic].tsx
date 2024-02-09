import { BaseLayout } from "../layouts/baseLayout";
import { useRouter } from "next/router";
import topics from "../../../public/testing-data/topics.json";
import Link from "next/link";

export default function TopicPage() {
  const router = useRouter();
  // This gets the topic parameter from the URL.
  const { topic: topicTitle } = router.query;

  // This gets the topic parameter from the URL, decoding it, and then finding the topic in the topics array using Next.js
  const topic = topics.find(
    (topic) => topic.title === decodeURIComponent(topicTitle as string),
  );

  // This is some error handling.
  if (!topic) {
    return (
      <BaseLayout>
        <div>Topic not found</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="lg:w-7/12 rounded-lg border-2 border-solid lg:p-10 text-center">
        <div className="grid grid-cols-6 items-center">
          <h1 className="col-span-5 flex justify-start text-3xl font-bold">
            {topic.title}
          </h1>
          <div className="flex justify-end">
            {/* We want to have it so this is a boolean later on */}
            <span className="flex decoration-5 rounded-full border border-solid border-black bg-slate-200 p-1.5 text-xs font-bold ">
              ❌{/* Complete ✅ */}
            </span>
          </div>
        </div>
        <p className="border-b-4 py-3">{topic.description}</p>
        <div className="flex flex-col text-start">
          {topic.chapters.map((chapter, index) => (
            <Link
              key={index}
              href={`/topics/${encodeURIComponent(topic.title)}/${encodeURIComponent(chapter.title)}`}
              className="px-3 pt-3 hover:bg-slate-200"
            >
              <div>
                <div className="grid grid-cols-6 items-center">
                  <h3 className="col-span-5 text-xl font-bold">
                    {chapter.title}
                  </h3>
                  {/* Same here, boolean stuff */}
                  <div className="flex justify-end">
                    <span className="decoration-5 rounded-full border border-solid border-black bg-slate-200 p-1.5 text-xs font-bold">
                      ❌{/* Complete ✅ */}
                    </span>
                  </div>
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
