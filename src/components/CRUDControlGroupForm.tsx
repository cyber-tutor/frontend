import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../pages/firebase/config";
import InputField from "./InputField";

interface Chapter {
  chapterId: string;
  chapterTitle: string;
  controlGroupContent: string;
  controlGroupImageURLs: string[];
}

interface Topic {
  topicId: string;
  topicTitle: string;
}

interface ControlGroupFormProps {
  topicId: string;
}

const ControlGroupForm: React.FC<ControlGroupFormProps> = ({ topicId }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [updatedContent, setUpdatedContent] = useState("");
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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setUpdatedContent(e.target.value);
  };

  const handleChapterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedChapterId = e.target.value;
    setSelectedChapterId(selectedChapterId);

    const selectedChapter = chapters.find(
      (chapter) => chapter.chapterId === selectedChapterId,
    );

    if (selectedChapter) {
      setUpdatedContent(selectedChapter.controlGroupContent);
    } else {
      setUpdatedContent("");
    }
  };

  const handleImageUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newUrl = e.target.value;
    setChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter.chapterId === selectedChapterId
          ? {
              ...chapter,
              controlGroupImageURLs: chapter.controlGroupImageURLs.map(
                (url, urlIndex) => (urlIndex === index ? newUrl : url),
              ),
            }
          : chapter,
      ),
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) return;
    try {
      await updateDoc(
        doc(db, `topics/${selectedTopicId}/chapters`, selectedChapterId),
        {
          controlGroupContent: updatedContent,
        },
      );
      setFeedbackMessage("Control group content updated successfully");
      console.log("Control group content updated successfully");
    } catch (error) {
      console.error("Error updating control group content:", error);
      setFeedbackMessage("uh oh 🦧, error updating control group content.");
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
              {chapters.map((chapter) => (
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
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Control Group Content:
            </label>
            <textarea
              id="content"
              name="content"
              value={updatedContent}
              onChange={handleContentChange}
              placeholder="Enter control group content"
              className="w-full resize-y rounded-md border p-2 text-sm text-gray-500"
              rows={1}
            />
            <div className="mt-4">
              <h3 className="text-sm font-medium">Control Group Image URLs:</h3>
              {chapters
                .find((chapter) => chapter.chapterId === selectedChapterId)
                ?.controlGroupImageURLs.map((url, index) => (
                  <div key={index} className="mt-2 flex items-center space-x-2">
                    <label
                      htmlFor={`imageUrl-${index}`}
                      className="text-sm font-medium"
                    >
                      [{index + 1}]:
                    </label>
                    <input
                      id={`imageUrl-${index}`}
                      name={`imageUrl-${index}`}
                      value={url}
                      onChange={(e) => handleImageUrlChange(e, index)}
                      placeholder="Enter image URL"
                      className="flex-grow rounded-md border p-2 text-sm text-gray-500"
                    />
                  </div>
                ))}
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
