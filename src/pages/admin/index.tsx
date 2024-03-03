import { useState, useEffect, FormEvent } from "react";
import { db } from "../../pages/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { DocumentData } from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../layouts/baseLayout";

export default function AdminPanel() {
  const [questions, setQuestions] = useState<
    {
      id: string;
      text: string;
      options: string[];
      topicId: string;
      chapterId: string;
      difficulty: string;
      explanation: string;
      tags: string[];
    }[]
  >([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState("");
  const [newTopicId, setNewTopicId] = useState("");
  const [newChapterId, setNewChapterId] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editTopicId, setEditTopicId] = useState("");
  const [editChapterId, setEditChapterId] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
  const [editTags, setEditTags] = useState("");

  useEffect(() => {
    // This uses onSnapshot, which allows for real-time updates to the questions array.
    const unsubscribe = onSnapshot(
      collection(db, "questions"),
      (querySnapshot) => {
        const fetchedQuestions: {
          id: string;
          text: string;
          options: string[];
          topicId: string;
          chapterId: string;
          difficulty: string;
          explanation: string;
          tags: string[];
        }[] = [];
        querySnapshot.forEach((doc) => {
          fetchedQuestions.push({
            id: doc.id,
            text: doc.data().text,
            options: doc.data().options,
            topicId: doc.data().topicId,
            chapterId: doc.data().chapterId,
            difficulty: doc.data().difficulty,
            explanation: doc.data().explanation,
            tags: doc.data().tags,
          });
        });
        setQuestions(fetchedQuestions);
      },
    );

    // This returns the unsubscribe function to stop listening for updates when the component finishes rendering.
    return () => unsubscribe();
  }, []);

  const createQuestion = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "questions"), {
      text: newQuestion,
      options: newOptions.split(",").map((option) => option.trim()),
      topicId: newTopicId,
      chapterId: newChapterId,
      difficulty: newDifficulty,
      explanation: newExplanation,
      tags: newTags.split(",").map((tag) => tag.trim()),
    });
    setNewQuestion("");
    setNewOptions("");
    setNewTopicId("");
    setNewChapterId("");
    setNewDifficulty("");
    setNewExplanation("");
    setNewTags("");
  };

  const startEdit = (
    id: string,
    text: string,
    options: string[],
    topicId: string,
    chapterId: string,
    difficulty: string,
    explanation: string,
    tags: string[],
  ) => {
    setEditId(id);
    setEditText(text);
    setEditOptions(options);
    setEditTopicId(topicId);
    setEditChapterId(chapterId);
    setEditDifficulty(difficulty);
    setEditExplanation(explanation);
    setEditTags(tags.join(", "));
  };

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    const questionDoc = doc(db, "questions", editId as string);
    await updateDoc(questionDoc, {
      text: editText,
      options: editOptions,
      topicId: editTopicId,
      chapterId: editChapterId,
      difficulty: editDifficulty,
      explanation: editExplanation,
      tags: editTags.split(",").map((tag) => tag.trim()),
    });
    setEditId(null);
    setEditText("");
    setEditOptions([]);
    setEditTopicId("");
    setEditChapterId("");
    setEditDifficulty("");
    setEditExplanation("");
    setEditTags("");
  };

  const deleteQuestion = async (id: string) => {
    const questionDoc = doc(db, "questions", id);
    await deleteDoc(questionDoc);
  };

  return (
    <>
      <Head>
        <title>Admin - Cyber Tutor</title>
        <meta name="description" content="Cyber Tutor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BaseLayout>
        <div>
          {questions.map((question) => (
            <div key={question.id}>
              {editId === question.id ? (
                <form onSubmit={submitEdit}>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Question Text"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <input
                    value={editOptions.join(",")}
                    onChange={(e) =>
                      setEditOptions(
                        e.target.value
                          .split(",")
                          .map((option) => option.trim()),
                      )
                    }
                    placeholder="Question Options"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <input
                    value={editTopicId}
                    onChange={(e) => setEditTopicId(e.target.value)}
                    placeholder="Topic ID"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <input
                    value={editChapterId}
                    onChange={(e) => setEditChapterId(e.target.value)}
                    placeholder="Chapter ID"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <input
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    placeholder="Proficiency Level"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <textarea
                    value={editExplanation}
                    onChange={(e) => setEditExplanation(e.target.value)}
                    placeholder="Explanation"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Tags"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <button type="submit">Submit Edit</button>
                </form>
              ) : (
                <>
                  <p>{question.text}</p>
                  <p>
                    Options:{" "}
                    {question.options ? question.options.join(", ") : ""}
                  </p>
                  <p>Topic ID: {question.topicId}</p>
                  <p>Chapter ID: {question.chapterId}</p>
                  <p>Difficulty: {question.difficulty}</p>
                  <p>Explanation: {question.explanation}</p>
                  <p>Tags: {question.tags ? question.tags.join(", ") : ""}</p>
                  <button
                    className="px-1"
                    onClick={() =>
                      startEdit(
                        question.id,
                        question.text,
                        question.options,
                        question.topicId,
                        question.chapterId,
                        question.difficulty,
                        question.explanation,
                        question.tags,
                      )
                    }
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteQuestion(question.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
          <form onSubmit={createQuestion}>
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              value={newOptions}
              onChange={(e) => setNewOptions(e.target.value)}
              placeholder="Options (comma-separated)"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              value={newTopicId}
              onChange={(e) => setNewTopicId(e.target.value)}
              placeholder="Topic ID"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              value={newChapterId}
              onChange={(e) => setNewChapterId(e.target.value)}
              placeholder="Chapter ID"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(e.target.value)}
              placeholder="Difficulty Level"
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              placeholder="Explanation"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="w-full p-2 mb-4 border rounded"
            />
            <button type="submit">Add Question</button>
          </form>
        </div>
      </BaseLayout>
    </>
  );
}
