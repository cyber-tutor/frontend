import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { updateDoc, doc, collection, getDocs } from "firebase/firestore";
import { db } from "../pages/firebase/config";
import InputField from "./InputField";

interface Chapter {
  chapterId: string;
  chapterTitle: string;
  controlGroupContent: string;
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

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsCollection = collection(db, "topics");
        const topicsSnapshot = await getDocs(topicsCollection);
        const fetchedTopics = topicsSnapshot.docs.map((doc) => ({
          topicId: doc.id,
          ...doc.data(),
        })) as Topic[];
        setTopics(fetchedTopics);
      } catch (error) {
        console.error("Error fetching topics:", error);
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
        const chaptersSnapshot = await getDocs(chaptersCollection);
        const fetchedChapters = chaptersSnapshot.docs.map((doc) => ({
          chapterId: doc.id,
          ...doc.data(),
        })) as Chapter[];
        setChapters(fetchedChapters);
      } catch (error) {
        console.error("Error fetching chapters:", error);
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
    setSelectedChapterId(e.target.value);
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
      console.log("Control group content updated successfully");
    } catch (error) {
      console.error("Error updating control group content:", error);
    }
  };

  return (
    <div>
      <h2>Update Control Group Content</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="topic">Select Topic:</label>
        <select id="topic" onChange={(e) => setSelectedTopicId(e.target.value)}>
          <option value="">Select a Topic</option>
          {topics.map((topic) => (
            <option key={topic.topicId} value={topic.topicId}>
              {topic.topicTitle}
            </option>
          ))}
        </select>
        {selectedTopicId && (
          <>
            <label htmlFor="chapter">Select Chapter:</label>
            <select id="chapter" onChange={handleChapterChange}>
              <option value="">Select a Chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.chapterId} value={chapter.chapterId}>
                  {chapter.chapterTitle}
                </option>
              ))}
            </select>
            {selectedChapterId && (
              <div>
                <label htmlFor="content">Control Group Content:</label>
                <InputField
                  name="content"
                  value={updatedContent}
                  onChange={handleContentChange}
                  placeholder="Enter control group content"
                />
              </div>
            )}
          </>
        )}
        <button type="submit">Update Control Group Content</button>
      </form>
    </div>
  );
};

export default ControlGroupForm;
