import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { db } from "../firebase/config";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  DocumentData,
  setDoc,
} from "firebase/firestore";

interface Topic {
  topicId?: string;
  topicTitle: string;
  topicDescription: string;
  order: number;
}

const CRUDTopicsForm: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>("");

  const [newTopic, setNewTopic] = useState<Topic>({
    topicTitle: "",
    topicDescription: "",
    order: 0,
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

  const handleTopicChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setNewTopic({ ...newTopic, [name]: value });
  };

  const handleAddTopic = async (event: FormEvent) => {
    event.preventDefault();
    if (!newTopic.topicTitle || !newTopic.topicDescription) return;

    const topicId = newTopic.topicTitle.toLowerCase().replace(/ /g, "_");

    const topicsCollection = collection(db, "topics");
    const topicDoc = doc(topicsCollection, topicId);
    await setDoc(topicDoc, newTopic);
    setNewTopic({ topicTitle: "", topicDescription: "", order: 0 });
  };

  return (
    <div className="flex w-full flex-col items-center">
      <h2 className="mb-4">Add or Update Topics</h2>
      <form onSubmit={handleAddTopic} className="mb-12 w-4/5">
        <input
          type="text"
          name="topicTitle"
          placeholder="Topic Title"
          value={newTopic.topicTitle}
          onChange={handleTopicChange}
          className="mb-2 block w-full rounded border border-gray-300 p-2"
        />
        <textarea
          name="topicDescription"
          placeholder="Topic Description"
          value={newTopic.topicDescription}
          onChange={handleTopicChange}
          className="mb-2 block w-full rounded border border-gray-300 p-2"
        />
        <input
          type="number"
          name="order"
          placeholder="Order"
          value={newTopic.order}
          onChange={handleTopicChange}
          className="mb-2 block w-full rounded border border-gray-300 p-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Add Topic
        </button>
      </form>
      <div className="w-full">
        {topics.map((topic) => (
          <div key={topic.topicId}>
            <h3>{topic.topicTitle}</h3>
            <p>{topic.topicDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CRUDTopicsForm;
