import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Topic, Chapter } from "../../types";

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
        const topicData = topicDoc.data();
        const topicId = topicDoc.id;

        const chaptersCollectionRef = collection(topicDoc.ref, "chapters");
        const chaptersSnapshot = await getDocs(chaptersCollectionRef);
        const chapters: Chapter[] = [];
        chaptersSnapshot.forEach((chapterDoc) => {
          const chapterData = chapterDoc.data();
          const chapterId = chapterDoc.id;
          chapters.push({
            chapterId: chapterId,
            chapterType: chapterData.chapterType,
            chapterTitle: chapterData.chapterTitle,
            chapterDescription: chapterData.chapterDescription,
            controlGroupContent: chapterData.controlGroupContent,
            experimentalGroupContent: chapterData.experimentalGroupContent,
            controlGroupImageURLs: chapterData.controlGroupImageURL,
            experimentalGroupImageURLs: chapterData.experimentalGroupImageURL,
            controlGroupVideoURLs: chapterData.controlGroupVideoURLs,
            experimentalGroupVideoURLs: chapterData.experimentalGroupVideoURLs,
            order: chapterData.order,
            proficiency: chapterData.proficiency,
          });
        });

        const newTopic = {
          topicId: topicId,
          topicTitle: topicData.topicTitle,
          topicDescription: topicData.topicDescription,
          order: topicData.order,
          isComplete: topicData.isComplete,
          chapters: chapters,
        };

        topicsArray.push(newTopic);
      }

      setTopics(topicsArray);
    };

    fetchTopics();
  }, []);

  return topics;
};
