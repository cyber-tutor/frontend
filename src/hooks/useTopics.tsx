import { useEffect, useState } from "react";
import { db } from "../components/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Topic } from "../types";

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const topicsCollectionRef = collection(db, "topics");
      const topicsQuery = query(topicsCollectionRef, orderBy("order"));
      const topicsSnapshot = await getDocs(topicsQuery);
      const fetchedTopics = topicsSnapshot.docs.map((doc) => {
        const data = doc.data() as Topic;
        return {
          ...data,
          topicId: doc.id,
          isComplete: false,
        };
      });

      setTopics(fetchedTopics);
    };

    fetchTopics();
  }, []);

  return topics;
};
