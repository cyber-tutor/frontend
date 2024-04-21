import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/config";
import InputField from "../ui/InputField";

interface Chapter {
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  order: number;
  proficiency: number;
  controlGroupContent: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  controlGroupVideoURLs: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  controlGroupImageURLs: string[];
  experimentalGroupContent: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  experimentalGroupVideoURLs: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  experimentalGroupImageURLs: string[];
}

interface Topic {
  topicId: string;
  topicTitle: string;
}

interface Chapter {
  chapterId: string;
  chapterTitle: string;
  chapterType: string;
}

interface ControlGroupFormProps {
  topicId: string;
}

type Proficiency = "beginner" | "intermediate" | "expert";

const ControlGroupForm: React.FC<ControlGroupFormProps> = ({ topicId }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [updatedContent, setUpdatedContent] = useState<{
    beginner: string;
    intermediate: string;
    expert: string;
  }>({
    beginner: "",
    intermediate: "",
    expert: "",
  });
  const [updatedVideoURLs, setUpdatedVideoURLs] = useState<{
    beginner: string;
    intermediate: string;
    expert: string;
  }>({
    beginner: "",
    intermediate: "",
    expert: "",
  });
  const [updatedImageURLs, setUpdatedImageURLs] = useState<string[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsCollection = collection(db, "topics");
        const topicsQuery = query(topicsCollection, orderBy("order"));
        const topicsSnapshot = await getDocs(topicsQuery);
        const fetchedTopics = topicsSnapshot.docs.map((doc) => ({
          topicId: doc.id,
          ...doc.data(),
        })) as Topic[];
        setTopics(fetchedTopics);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setFeedbackMessage("Error fetching topics. Please try again later.");
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (!selectedTopicId) return;
    const fetchChapters = async () => {
      try {
        const chaptersCollection = collection(
          db,
          `topics/${selectedTopicId}/chapters`,
        );
        const chaptersQuery = query(chaptersCollection, orderBy("order"));
        const chaptersSnapshot = await getDocs(chaptersQuery);
        const fetchedChapters = chaptersSnapshot.docs.map((doc) => ({
          chapterId: doc.id,
          ...doc.data(),
        })) as Chapter[];
        setChapters(fetchedChapters);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setFeedbackMessage("Error fetching chapters. Please try again later.");
      }
    };
    fetchChapters();
  }, [selectedTopicId]);

  const handleContentChange = (
    proficiency: Proficiency,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setUpdatedContent((prevContent) => ({
      ...prevContent,
      [proficiency]: e.target.value,
    }));
  };

  const handleChapterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedChapterId = e.target.value;
    setSelectedChapterId(selectedChapterId);

    const selectedChapter = chapters.find(
      (chapter) => chapter.chapterId === selectedChapterId,
    );

    if (selectedChapter && selectedChapter.controlGroupContent) {
      setUpdatedContent(selectedChapter.controlGroupContent);
    } else {
      setUpdatedContent({
        beginner: "",
        intermediate: "",
        expert: "",
      });
    }
    if (selectedChapter && selectedChapter.controlGroupVideoURLs) {
      setUpdatedVideoURLs(selectedChapter.controlGroupVideoURLs);
    } else {
      setUpdatedVideoURLs({
        beginner: "",
        intermediate: "",
        expert: "",
      });
    }

    if (selectedChapter && selectedChapter.controlGroupImageURLs) {
      setUpdatedImageURLs(selectedChapter.controlGroupImageURLs);
    } else {
      setUpdatedImageURLs([]);
    }
  };

  const handleAddImageUrl = () => {
    setUpdatedImageURLs((prevUrls) => [...prevUrls, ""]);
  };

  const handleImageUrlChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newUrl = e.target.value;
    setUpdatedImageURLs((prevUrls) =>
      prevUrls.map((url, i) => (i === index ? newUrl : url)),
    );
  };

  const handleVideoUrlChange = (
    proficiency: Proficiency,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setUpdatedVideoURLs((prevUrls) => ({
      ...prevUrls,
      [proficiency]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) return;
    try {
      const updatedChapter = chapters.find(
        (chapter) => chapter.chapterId === selectedChapterId,
      );
      if (!updatedChapter) return;
      await updateDoc(
        doc(db, `topics/${selectedTopicId}/chapters`, selectedChapterId),
        {
          controlGroupContent: updatedContent,
          controlGroupImageURLs: updatedImageURLs,
          controlGroupVideoURLs: updatedVideoURLs,
        },
      );
      setFeedbackMessage("Control group content updated successfully");
      console.log("Control group content updated successfully");
    } catch (error) {
      console.error("Error updating control group content:", error);
      setFeedbackMessage(
        "An error occurred while updating the control group content. Please try again.",
      );
    }
  };

  return (
    <div className="rounded bg-white p-6 shadow-md">
      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
        <div className="col-span-1 flex flex-col space-y-4">
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700"
            >
              Select Topic:
            </label>
            <select
              id="topic"
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm"
            >
              <option value="">Select a Topic</option>
              {topics.map((topic) => (
                <option key={topic.topicId} value={topic.topicId}>
                  {topic.topicTitle}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="chapter"
              className="block text-sm font-medium text-gray-700"
            >
              Select Chapter:
            </label>
            <select
              id="chapter"
              onChange={handleChapterChange}
              disabled={!selectedTopicId}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm"
            >
              <option value="">Select a Chapter</option>
              {chapters
                .filter((chapter) => chapter.chapterType !== "assessment")
                .map((chapter) => (
                  <option key={chapter.chapterId} value={chapter.chapterId}>
                    {chapter.chapterTitle}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
          >
            Update Control Group Content
          </button>
        </div>
        {selectedChapterId && (
          <div className="col-span-3 flex-grow">
            {(["beginner", "intermediate", "expert"] as Proficiency[]).map(
              (proficiency) => (
                <div key={proficiency}>
                  <label
                    htmlFor={`content-${proficiency}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Control Group Content ({proficiency}):
                  </label>
                  <textarea
                    id={`content-${proficiency}`}
                    name={`content-${proficiency}`}
                    value={updatedContent[proficiency]}
                    onChange={(e) => handleContentChange(proficiency, e)}
                    placeholder={`Enter control group content (${proficiency})`}
                    className="w-full resize-y rounded-md border p-2 text-sm text-gray-500"
                    rows={1}
                  />
                  <label
                    htmlFor={`videoUrl-${proficiency}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Control Group Video URL ({proficiency}):
                  </label>
                  <input
                    id={`videoUrl-${proficiency}`}
                    name={`videoUrl-${proficiency}`}
                    value={updatedVideoURLs[proficiency]}
                    onChange={(e) => handleVideoUrlChange(proficiency, e)}
                    placeholder={`Enter control group video URL (${proficiency})`}
                    className="w-full resize-y rounded-md border p-2 text-sm text-gray-500"
                  />
                </div>
              ),
            )}
            <div className="mt-4">
              <h3 className="text-sm font-medium">Control Group Image URLs:</h3>
              {updatedImageURLs.map((url, index) => (
                <div key={index} className="mt-2 flex items-center space-x-2">
                  <input
                    id={`imageUrl-${index}`}
                    name={`imageUrl-${index}`}
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e)}
                    placeholder="Enter image URL"
                    className="flex-grow rounded-md border p-2 text-sm text-gray-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                Add Image URL
              </button>
            </div>
          </div>
        )}
      </form>
      {feedbackMessage && (
        <div className="mt-4 text-green-500">{feedbackMessage}</div>
      )}
    </div>
  );
};

export default ControlGroupForm;
