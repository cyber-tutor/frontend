import React, { useState, useEffect } from "react";
import {
  doc,
  collection,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useTopics } from "../../hooks/useTopics";
import { useChapters } from "../../hooks/useChapters";
import { Chapter } from "../../types";

const CRUDChaptersForm: React.FC = () => {
  const topics = useTopics();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const chapters = useChapters(selectedTopic);
  const [currentChapterId, setCurrentChapterId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [orderInputs, setOrderInputs] = useState<{ [key: string]: number }>({});
  const [newChapter, setNewChapter] = useState<Chapter>(initialChapterState());

  function initialChapterState(): Chapter {
    return {
      chapterId: "",
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
    };
  }

  const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(event.target.value);
  };

  const flattenChapter = (chapter: Chapter) => ({
    chapterId: chapter.chapterId,
    chapterTitle: chapter.chapterTitle,
    chapterDescription: chapter.chapterDescription,
    chapterType: chapter.chapterType,
    ...Object.entries(chapter.controlGroupContent).reduce((acc, [key, value]) => ({
      ...acc,
      [`controlGroupContent${key?.[0]?.toUpperCase() + key.slice(1)}`]: value,
    }), {}),
    ...Object.entries(chapter.controlGroupVideoURLs).reduce((acc, [key, value]) => ({
      ...acc,
      [`controlGroupVideoURLs${key?.[0]?.toUpperCase() + key.slice(1)}`]: value,
    }), {}),
    controlGroupImageURLs: chapter.controlGroupImageURLs,
    ...Object.entries(chapter.experimentalGroupContent).reduce((acc, [key, value]) => ({
      ...acc,
      [`experimentalGroupContent${key?.[0]?.toUpperCase() + key.slice(1)}`]: value,
    }), {}),
    ...Object.entries(chapter.experimentalGroupVideoURLs).reduce((acc, [key, value]) => ({
      ...acc,
      [`experimentalGroupVideoURLs${key?.[0]?.toUpperCase() + key.slice(1)}`]: value,
    }), {}),
    experimentalGroupImageURLs: chapter.experimentalGroupImageURLs,
    order: chapter.order,
    proficiency: chapter.proficiency,
  });

  const handleAddChapter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTopic) return;

    const chaptersCollection = collection(
      doc(db, "topics", selectedTopic),
      "chapters",
    );

    const flattenedChapter = flattenChapter(newChapter);

    if (isEditing) {
      const chapterDoc = doc(chaptersCollection, currentChapterId);
      await updateDoc(chapterDoc, flattenedChapter);
    } else {
      await addDoc(chaptersCollection, flattenedChapter);
    }

    resetChapterForm();
  };

  const resetChapterForm = () => {
    setNewChapter(initialChapterState());
    setIsEditing(false);
    setCurrentChapterId("");
  };

  const handleChapterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewChapter({
      ...newChapter,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditChapter = (chapter: Chapter) => {
    setCurrentChapterId(chapter.chapterId || "");
    setNewChapter({ ...chapter });
    setIsEditing(true);
  };

  const handleCancelEdit = resetChapterForm;

  useEffect(() => {
    const newOrderInputs = chapters.reduce((acc, chapter) => {
      acc[chapter.chapterId || ""] = chapter.order;
      return acc;
    }, {} as { [key: string]: number });

    setOrderInputs(newOrderInputs);
  }, [chapters]);

  const handleSubmitOrder = async () => {
    if (!selectedTopic) return;

    const chaptersCollection = collection(
      doc(db, "topics", selectedTopic),
      "chapters",
    );

    await Promise.all(
      Object.entries(orderInputs).map(([chapterId, order]) => {
        const chapterDoc = doc(chaptersCollection, chapterId);
        return updateDoc(chapterDoc, { order });
      }),
    );
  };

  const toggleLock = () => setIsLocked(!isLocked);

  const handleDeleteChapter = async (id: string) => {
    if (!selectedTopic) return;

    const chaptersCollection = collection(
      doc(db, "topics", selectedTopic),
      "chapters",
    );
    const chapterDoc = doc(chaptersCollection, id);
    await deleteDoc(chapterDoc);
  };

  return (
    <div className="grid grid-cols-7 p-6">
      <div className="col-span-3">
        <select onChange={handleTopicChange} className="mb-4 w-full">
          {topics.map((topic) => (
            <option key={topic.topicId} value={topic.topicId}>
              {topic.topicTitle}
            </option>
          ))}
        </select>
        <ol>
          {chapters.map((chapter) => (
            <li
              key={chapter.chapterId}
              className="mb-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <input
                  type="number"
                  value={orderInputs[chapter.chapterId || ""]}
                  className="mr-2 w-12"
                  onChange={(e) =>
                    setOrderInputs({
                      ...orderInputs,
                      [chapter.chapterId || ""]: Number(e.target.value),
                    })
                  }
                />
                <h3>{chapter.chapterTitle}</h3>
              </div>
              <div>
                {isEditing && currentChapterId === chapter.chapterId ? (
                  <button
                    onClick={handleCancelEdit}
                    className="mr-2 rounded bg-yellow-300 px-2 py-1 text-xs text-white"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditChapter(chapter)}
                    className="mr-2 rounded bg-blue-500 px-2 py-1 text-xs text-white"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteChapter(chapter.chapterId || "")}
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
        </ol>
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
      </div>
      <div className="col-span-4 mx-4">
        <form onSubmit={handleAddChapter} className="mt-4">
          <input
            type="text"
            name="chapterTitle"
            placeholder="Chapter Title"
            value={newChapter.chapterTitle}
            onChange={handleChapterChange}
            className="mb-2 block w-full rounded border border-gray-300 p-2"
          />
          <textarea
            name="chapterDescription"
            placeholder="Chapter Description"
            value={newChapter.chapterDescription}
            onChange={handleChapterChange}
            className="mb-2 block w-full rounded border border-gray-300 p-2"
          />
          {!isEditing && (
            <input
              type="number"
              name="order"
              placeholder="Order"
              value={newChapter.order || ""}
              onChange={handleChapterChange}
              className="mb-2 block w-full rounded border border-gray-300 p-2"
            />
          )}
          <div className="text-center">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              {currentChapterId ? "Save Changes" : "Add Chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CRUDChaptersForm;
