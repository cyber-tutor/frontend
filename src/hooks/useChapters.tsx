import { useState, useEffect } from "react";
import { db } from "../components/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Chapter } from "../types";

const createChapter = (chapterDoc: any): Chapter => {
  const chapterData = chapterDoc.data();
  const chapterId = chapterDoc.id;
  return {
    chapterId: chapterId,
    ...chapterData,
  };
};

export const useChapters = (topicId: string) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const fetchChapters = async () => {
      const chaptersCollectionRef = collection(
        db,
        "topics",
        topicId,
        "chapters",
      );
      const chaptersSnapshot = await getDocs(chaptersCollectionRef);
      const chapters: Chapter[] = chaptersSnapshot.docs.map(createChapter);

      setChapters(chapters);
    };

    fetchChapters();
  }, [topicId]);

  return chapters;
};
