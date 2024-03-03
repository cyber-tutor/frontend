import React, { useEffect, useState } from "react";
import { db } from "../../pages/firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../layouts/baseLayout";
import QuestionForm, { Question } from "../../components/QuestionForm";

export default function AdminPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "questions"),
      (querySnapshot) => {
        const fetchedQuestions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Question[];
        setQuestions(fetchedQuestions);
      },
    );
    return () => unsubscribe();
  }, []);

  const createQuestion = async (question: Question) => {
    await addDoc(collection(db, "questions"), question);
  };

  const editQuestion = async (id: string, updatedQuestion: Question) => {
    const { id: _, ...questionData } = updatedQuestion;
    const questionDoc = doc(db, "questions", id);
    await updateDoc(questionDoc, questionData);
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
              <QuestionForm
                question={question}
                onSubmit={(updatedQuestion) =>
                  editQuestion(question.id!, updatedQuestion)
                }
              />
              <button onClick={() => deleteQuestion(question.id!)}>
                Delete
              </button>
            </div>
          ))}
          <QuestionForm onSubmit={createQuestion} />
        </div>
      </BaseLayout>
    </>
  );
}
