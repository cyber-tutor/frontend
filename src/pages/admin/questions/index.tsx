import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../../layouts/baseLayout";
import QuestionForm, { Question } from "../../../components/QuestionForm";
import StickyHeadTable from "../../../components/StickyHeadTable";

interface TableRowData {
  id?: string;
  text: string;
  options: string;
  correctAnswer: string;
  topicId: string;
  chapterId: string;
  proficiencyLevel: number;
  explanation: string;
  tags: string;
  actions: JSX.Element;
}

export default function CRUD_Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);

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

  const startEditing = (question: Question) => {
    setEditingId(question.id ?? null);
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
    text: question.text,
    options: question.options.join(", "),
    correctAnswer: question.correctAnswer,
    topicId: question.topicId,
    chapterId: question.chapterId,
    proficiencyLevel: question.proficiencyLevel,
    explanation: question.explanation,
    tags: question.tags.join(", "),
    actions: (
      <div>
<button onClick={() => deleteQuestion(question.id!)}>Delete</button>
        {editingId === question.id ? (
          <button onClick={stopEditing}>Cancel</button>
        ) : (
          <button onClick={() => startEditing(question)}>Edit</button>
        )}
              </div>
    ),
  }));

  return (
    <BaseLayout>
      <h1 className="text-3xl font-bold">Admin Interface: Question CRUD</h1>
      <div className="sticky top-0 z-10 bg-white">
        {editingId && (
          <QuestionForm
            question={editedQuestion ?? undefined}
            onSubmit={handleEditSubmit}
          />
        )}
        {!editingId && <QuestionForm onSubmit={createQuestion} />}
      </div>
      <div className="overflow-y-auto">
        <StickyHeadTable
          columns={[
            { id: "text", label: "Text", minWidth: 150 },
            // { id: "options", label: "Options", minWidth: 100 },
            { id: "correctAnswer", label: "Correct Answer", minWidth: 40 },
            { id: "topicId", label: "Topic ID", minWidth: 40 },
            { id: "chapterId", label: "Chapter ID", minWidth: 40 },
            {
              id: "proficiencyLevel",
              label: "Proficiency Level",
              minWidth: 40,
            },
            // { id: "explanation", label: "Explanation", minWidth: 150 },
            { id: "tags", label: "Tags", minWidth: 150 },
            { id: "actions", label: "Actions", minWidth: 170 },
          ]}
          rows={transformedRows}
        />
      </div>
    </BaseLayout>
  );
}
