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
  const [isEditing, setIsEditing] = useState(false);
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
    setNewTopic({
      ...newTopic,
      [name]: name === "order" ? Number(value) : value,
    });
  };

  const handleAddTopic = async (event: FormEvent) => {
    event.preventDefault();
    if (!newTopic.topicTitle || !newTopic.topicDescription) return;

    const { topicTitle, topicDescription, order } = newTopic;

    const topicsCollection = collection(db, "topics");
    if (currentTopicId) {
      const topicDoc = doc(topicsCollection, currentTopicId);
      await updateDoc(topicDoc, { topicTitle, topicDescription, order });
    } else {
      const topicId = newTopic.topicTitle.toLowerCase().replace(/ /g, "_");
      const topicDoc = doc(topicsCollection, topicId);
      await setDoc(topicDoc, { topicTitle, topicDescription, order });
    }

    setNewTopic({ topicTitle: "", topicDescription: "", order: 0 });
    setCurrentTopicId("");
  };

  const handleEditTopic = (topic: Topic) => {
    setCurrentTopicId(topic.topicId || "");
    setNewTopic({
      topicTitle: topic.topicTitle,
      topicDescription: topic.topicDescription,
      order: topic.order,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentTopicId("");
    setNewTopic({ topicTitle: "", topicDescription: "", order: 0 });
    setIsEditing(false);
  };

  const handleDeleteTopic = async (id: string) => {
    const topicsCollection = collection(db, "topics");
    const topicDoc = doc(topicsCollection, id);
    await deleteDoc(topicDoc);
  };

  return (
    <div className="grid grid-cols-2 p-6">
      <div>
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
            {currentTopicId ? "Save Changes" : "Add Topic"}
          </button>
        </form>
      </div>
      <div>
        {topics.map((topic) => (
          <div
            key={topic.topicId}
            className="mb-4 flex items-center justify-between"
          >
            <div>
              <h3>{topic.topicTitle}</h3>
            </div>
            <div>
              {isEditing && currentTopicId === topic.topicId ? (
                <button
                  onClick={handleCancelEdit}
                  className="mr-2 rounded bg-yellow-300 px-2 py-1 text-xs text-white"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => handleEditTopic(topic)}
                  className="mr-2 rounded bg-blue-500 px-2 py-1 text-xs text-white"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDeleteTopic(topic.topicId || "")}
                className="rounded bg-red-500 px-2 py-1 text-xs text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CRUDTopicsForm;
