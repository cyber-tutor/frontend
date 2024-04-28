import React, { useState, useEffect } from "react";
import { doc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

interface Chapter {
  chapterId?: string;
  chapterTitle: string;
  chapterDescription: string;
  chapterType: string;
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
  order: number;
  proficiency: number;
}

const CRUDChaptersForm: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [orderInputs, setOrderInputs] = useState<{ [key: string]: number }>({});
  const [newChapter, setNewChapter] = useState<Chapter>({
    chapterTitle: "",
    chapterDescription: "",
    chapterType: "",
    controlGroupContent: { beginner: "", intermediate: "", expert: "" },
    controlGroupVideoURLs: { beginner: "", intermediate: "", expert: "" },
    controlGroupImageURLs: [],
    experimentalGroupContent: { beginner: "", intermediate: "", expert: "" },
    experimentalGroupVideoURLs: { beginner: "", intermediate: "", expert: "" },
    experimentalGroupImageURLs: [],
    order: 0,
    proficiency: 0,
  });

  useEffect(() => {
    const fetchTopics = async () => {
      const topicsCollection = collection(db, "topics");
      const topicsQuery = query(topicsCollection, orderBy("order"));
      const snapshot = await getDocs(topicsQuery);
      const topicsData = snapshot.docs.map((doc) => ({
        topicId: doc.id,
        ...doc.data(),
      })) as Topic[];
      setTopics(topicsData);
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      if (selectedTopic === null) {
        return;
      }

      const chaptersCollection = collection(
        doc(db, "topics", selectedTopic),
        "chapters",
      );
      const chaptersQuery = query(chaptersCollection, orderBy("order"));
      const snapshot = await getDocs(chaptersQuery);
      const chaptersData = snapshot.docs.map((doc) => ({
        chapterId: doc.id,
        ...doc.data(),
      })) as Chapter[];
      setChapters(chaptersData);
    };

    fetchChapters();
  }, [selectedTopic]);

  const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(event.target.value);
  };

  return (
    <div>
      <select onChange={handleTopicChange}>
        {topics.map((topic) => (
          <option key={topic.topicId} value={topic.topicId}>
            {topic.topicTitle}
          </option>
        ))}
      </select>

      <select>
        {chapters.map((chapter) => (
          <option key={chapter.chapterId} value={chapter.chapterId}>
            {chapter.chapterTitle}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CRUDChaptersForm;
