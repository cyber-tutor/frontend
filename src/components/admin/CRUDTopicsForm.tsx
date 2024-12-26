import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  addTopic,
  updateTopic,
  deleteTopic,
} from "../../utils/topicsCRUDOperations";
import { useTopics } from "../../hooks/useTopics";
import { Topic } from "src/types";

const CRUDTopicsForm: React.FC = () => {
  const topics = useTopics();
  const [currentTopicId, setCurrentTopicId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [orderInputs, setOrderInputs] = useState<{ [key: string]: number }>({});
  const [newTopic, setNewTopic] = useState<Topic>({
    topicId: "",
    topicTitle: "",
    topicDescription: "",
    order: 0,
    isComplete: false,
    chapters: [],
  });

  const handleTopicChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (currentTopicId) {
      await updateTopic(currentTopicId, {
        topicTitle,
        topicDescription,
        order,
      });
    } else {
      const topicId = newTopic.topicTitle.toLowerCase().replace(/ /g, "_");
      await addTopic(topicId, { topicTitle, topicDescription, order });
    }

    setNewTopic({
      topicId: "",
      topicTitle: "",
      topicDescription: "",
      order: 0,
      isComplete: false,
      chapters: [],
    });
    setCurrentTopicId("");
  };
  const handleEditTopic = (topic: Topic) => {
    setCurrentTopicId(topic.topicId || "");
    setNewTopic({
      topicId: topic.topicId,
      topicTitle: topic.topicTitle,
      topicDescription: topic.topicDescription,
      order: topic.order,
      isComplete: topic.isComplete,
      chapters: topic.chapters || [],
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentTopicId("");
    setNewTopic({
      topicId: "",
      topicTitle: "",
      topicDescription: "",
      order: 0,
      isComplete: false,
      chapters: [],
    });
    setIsEditing(false);
  };

  useEffect(() => {
    const newOrderInputs: { [key: string]: number } = {};
    topics.forEach((topic) => {
      newOrderInputs[topic.topicId || ""] = topic.order;
    });
    setOrderInputs(newOrderInputs);
  }, [topics]);

  const handleSubmitOrder = async () => {
    for (const topicId in orderInputs) {
      await updateTopic(topicId, { order: orderInputs[topicId] });
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const handleDeleteTopic = async (id: string) => {
    await deleteTopic(id);
  };

  return (
    <div className="grid grid-cols-6 p-6">
      <ol className="col-span-2">
        {topics.map((topic) => (
          <li
            key={topic.topicId}
            className="mb-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              <input
                type="number"
                value={orderInputs[topic.topicId || ""]}
                className="mr-2 w-12"
                onChange={(e) =>
                  setOrderInputs({
                    ...orderInputs,
                    [topic.topicId || ""]: Number(e.target.value),
                  })
                }
              />
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
                className={`rounded px-2 py-1 text-xs text-white ${
                  isLocked ? "bg-gray-500" : "bg-red-500"
                }`}
                disabled={isLocked}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        <div className="text-right">
          <button
            onClick={toggleLock}
            className="mr-2 block w-full rounded bg-blue-500 px-2 py-1 text-xs text-white"
          >
            {isLocked ? "🔓 Unlock Delete" : "🔒 Lock Delete"}
          </button>
          <button
            onClick={handleSubmitOrder}
            className="mt-4 rounded bg-blue-500 px-2 py-1 text-xs text-white"
          >
            Submit Order
          </button>
        </div>
      </ol>
      <form onSubmit={handleAddTopic} className="col-span-4 mx-4">
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
        {!isEditing && (
          <input
            type="number"
            name="order"
            placeholder="Order"
            value={newTopic.order || ""}
            onChange={handleTopicChange}
            className="mb-2 block w-full rounded border border-gray-300 p-2"
          />
        )}
        <div className="text-center">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            {currentTopicId ? "Save Changes" : "Add Topic"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CRUDTopicsForm;
