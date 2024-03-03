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

  return (
    <BaseLayout>
      <div className="max-h-screen overflow-y-auto">
        {editingId && (
          <QuestionForm
            question={editedQuestion ?? undefined}
            onSubmit={handleEditSubmit}
          />
        )}
        {!editingId && <QuestionForm onSubmit={createQuestion} />}
        <table>
          <thead>
            <tr>
              <th>Text</th>
              <th>Options</th>
              <th>Topic ID</th>
              <th>Chapter ID</th>
              <th>Difficulty</th>
              <th>Explanation</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>{question.text}</td>
                <td>{question.options.join(", ")}</td>
                <td>{question.topicId}</td>
                <td>{question.chapterId}</td>
                <td>{question.difficulty}</td>
                <td>{question.explanation}</td>
                <td>{question.tags.join(", ")}</td>
                <td>
                  <button onClick={() => deleteQuestion(question.id!)}>
                    Delete
                  </button>
                  {editingId === question.id ? (
                    <button onClick={stopEditing}>Cancel</button>
                  ) : (
                    <button onClick={() => startEditing(question)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaseLayout>
  );
}
