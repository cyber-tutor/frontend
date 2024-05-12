import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Topic, Chapter } from "../../types";

const createChapter = (chapterDoc: any): Chapter => {
  const chapterData = chapterDoc.data();
  const chapterId = chapterDoc.id;
  return {
    chapterId: chapterId,
    ...chapterData,
  };
};

const createTopic = (topicDoc: any, chapters: Chapter[]): Topic => {
  const topicData = topicDoc.data();
  const topicId = topicDoc.id;
  return {
    topicId: topicId,
    ...topicData,
    chapters: chapters,
  };
};

export const useTopicsWithChapters = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const topicsCollectionRef = collection(db, "topics");
      const topicsArray: Topic[] = [];

      const topicsSnapshot = await getDocs(
        query(topicsCollectionRef, orderBy("order")),
      );
      for (const topicDoc of topicsSnapshot.docs) {
        const chaptersCollectionRef = collection(topicDoc.ref, "chapters");
        const chaptersSnapshot = await getDocs(chaptersCollectionRef);
        const chapters: Chapter[] = chaptersSnapshot.docs.map(createChapter);

        const newTopic = createTopic(topicDoc, chapters);

        topicsArray.push(newTopic);
      }

      setTopics(topicsArray);
    };

    fetchTopics();
  }, []);

  return topics;
};
