import React, { useEffect, useState } from "react";
import { auth, db } from "../../../components/firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../../../components/layouts/baseLayout";
import QuestionForm, { Question } from "../../../components/QuestionForm";
import StickyHeadTable from "../../../components/StickyHeadTable";
import queryUserDocument from "~/components/firebase/firebase_functions";

interface TableRowData {
  id?: string;
  question: string;
  choices: string;
  answer: string;
  topicId: string;
  chapterId: string;
  difficulty: string;
  explanation: string;
  topics: string;
  actions: JSX.Element;
}

export default function CRUD_Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);

  const user = auth.currentUser;
  const isSuperUser = queryUserDocument(user ? user.uid : "");

  if (!isSuperUser || !user) {
    return <div>Unauthorized</div>;
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "quizQuestions"),
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
    await addDoc(collection(db, "quizQuestions"), question);
  };

  const editQuestion = async (id: string, updatedQuestion: Question) => {
    const { id: _, ...questionData } = updatedQuestion;
    const questionDoc = doc(db, "questions", id);
    await updateDoc(questionDoc, questionData);
  };

  const deleteQuestion = async (id: string) => {
    const questionDoc = doc(db, "quizQuestions", id);
    await deleteDoc(questionDoc);
  };

  const startEditing = (question: Question) => {
    setEditingId(question.id || null);
    setEditedQuestion(question);
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditedQuestion(null);
  };

  const handleEditSubmit = async (updatedQuestion: Question) => {
    if (editingId) {
      await editQuestion(editingId, updatedQuestion);
    }
    stopEditing();
  };

  const transformedRows: TableRowData[] = questions.map((question) => ({
    id: question.id,
    question: question.question,
    choices: Array.isArray(question.choices) ? question.choices.join(", ") : "",
    answer: question.answer,
    topicId: question.topicId,
    chapterId: question.chapterId,
    difficulty: question.difficulty,
    explanation: question.explanation,
    topics: Array.isArray(question.topics) ? question.topics.join(", ") : "",
    actions: (
      <div>
        {editingId === question.id ? (
          <button
            className="mx-1 rounded bg-yellow-300 p-1 font-mono"
            onClick={stopEditing}
          >
            Cancel
          </button>
        ) : (
          <button
            className="mx-1 rounded bg-yellow-300 p-1 font-mono"
            onClick={() => startEditing(question)}
          >
            Edit
          </button>
        )}
        <button
          className="mx-1 rounded bg-red-700 p-1 font-mono text-white"
          onClick={() => deleteQuestion(question.id!)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const columns = [
    { id: "question", label: "Question", minWidth: 150 },
    { id: "actions", label: "Actions", minWidth: 170 },
  ];

  if (windowWidth > 1200) {
    columns.splice(
      1,
      0,
      { id: "answer", label: "Answer", minWidth: 40 },
      { id: "topicId", label: "Topic ID", minWidth: 40 },
      { id: "chapterId", label: "Chapter ID", minWidth: 40 },
      { id: "difficulty", label: "Difficulty", minWidth: 40 },
      { id: "topics", label: "Topics", minWidth: 150 },
    );
  } else if (windowWidth > 768) {
    columns.splice(
      1,
      0,
      { id: "answer", label: "Answer", minWidth: 40 },
      { id: "topicId", label: "Topic ID", minWidth: 40 },
      { id: "chapterId", label: "Chapter ID", minWidth: 40 },
    );
  }

  return (
    <BaseLayout>
      <h1 className="question-3xl font-bold">Admin Interface: Question CRUD</h1>
      <div className="h-100 h-full w-full overflow-auto sm:overflow-scroll">
        <div className="sticky top-0 z-10 bg-white">
          {editingId && (
            <QuestionForm
              question={editedQuestion || undefined}
              onSubmit={handleEditSubmit}
            />
          )}
        </div>
        {!editingId && <QuestionForm onSubmit={createQuestion} />}
      </div>
      <div className="overflow-y-auto">
        <StickyHeadTable columns={columns} rows={transformedRows} />
      </div>
    </BaseLayout>
  );
}
