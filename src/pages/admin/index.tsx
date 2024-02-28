import { useState, useEffect, FormEvent } from "react";
import { db } from "../../pages/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { DocumentData } from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../layouts/baseLayout";

export default function AdminPanel() {
  const [questions, setQuestions] = useState<
    { id: string; [key: string]: any }[]
  >([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const fetchedQuestions: { id: string; [key: string]: any }[] = [];
      querySnapshot.forEach((doc) => {
        fetchedQuestions.push({ id: doc.id, ...(doc.data() as DocumentData) });
      });
      setQuestions(fetchedQuestions);
    };

    fetchQuestions();
  }, []);

  const createQuestion = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "questions"), { text: newQuestion });
    setNewQuestion("");
  };

  const startEdit = (id: string, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    const questionDoc = doc(db, "questions", editId as string);
    await updateDoc(questionDoc, { text: editText });
    setEditId(null);
    setEditText("");
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
                  />
                  <button type="submit">Submit Edit</button>
                </form>
              ) : (
                <>
                  <p>{question.text}</p>
                  <button onClick={() => startEdit(question.id, question.text)}>
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
            />
            <button type="submit">Add Question</button>
          </form>
        </div>
      </BaseLayout>
    </>
  );
}
