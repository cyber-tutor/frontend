import { useRouter } from "next/router";
import { BaseLayout } from "../../layouts/baseLayout";
import topics from "../../../../public/testing-data/topics.json";

export default function ChapterPage() {
  
  const router = useRouter();
  // This gets the topic and chapter parameters from the URL.
  const { topic: topicTitle, chapter: chapterTitle } = router.query;

  // This gets the topic parameter from the URL, decoding it, and then finding the topic in the topics array using Next.js
  const topic = topics.find(
    (topic) => topic.title === decodeURIComponent(topicTitle as string),
  );
  const chapter = topic?.chapters.find(
    (chapter) => chapter.title === decodeURIComponent(chapterTitle as string),
  );

  // This is some error handling.
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
      {/* We want to have the content on this page be similar to Coursera. We should probably structure our test data to reflect what we actually want in Firebase. For example, we would probably want to have a field that tells us what type of content should be displayed (video, text-based, quiz, etc.) then have conditionals. Like, for a YouTube video, we would want the video as well as a transcript, but for text, we would just want text, or for an assessment, we would want just the SurveyJS implementation. */}
    </BaseLayout>
  );
}
