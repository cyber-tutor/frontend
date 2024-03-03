import React, { useState, FormEvent } from "react";

export interface Question {
  id?: string;
  text: string;
  options: string[];
  topicId: string;
  chapterId: string;
  difficulty: string;
  explanation: string;
  tags: string[];
}

interface QuestionFormProps {
  question?: Question;
  onSubmit: (updatedQuestion: Question) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onSubmit }) => {
  const [editMode, setEditMode] = useState<boolean>(!question);
  const [editedQuestion, setEditedQuestion] = useState<Question>(
    question || {
      text: "",
      options: [],
      topicId: "",
      chapterId: "",
      difficulty: "",
      explanation: "",
      tags: [],
    },
  );

  const handleEditToggle = () => {
    setEditedQuestion(
      question || {
        text: "",
        options: [],
        topicId: "",
        chapterId: "",
        difficulty: "",
        explanation: "",
        tags: [],
      },
    );
    setEditMode(!editMode);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedQuestion((prevQuestion) => ({
      ...prevQuestion,
      [name]: value,
    }));
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const options = e.target.value.split(",").map((option) => option.trim());
    setEditedQuestion((prevQuestion) => ({
      ...prevQuestion,
      options,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(editedQuestion);
    setEditMode(false);
  };

  return (
    <>
      <div className="p-5">
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="text"
              value={editedQuestion.text}
              onChange={handleChange}
              placeholder="Question"
              className="mb-4 w-full rounded border p-2"
            />
            <input
              type="text"
              name="options"
              value={editedQuestion.options.join(",")}
              onChange={handleOptionsChange}
              placeholder="Options (comma-separated)"
              className="mb-4 w-full rounded border p-2"
            />
            <input
              type="text"
              name="topicId"
              value={editedQuestion.topicId}
              onChange={handleChange}
              placeholder="Topic ID"
              className="mb-4 w-full rounded border p-2"
            />
            <input
              type="text"
              name="chapterId"
              value={editedQuestion.chapterId}
              onChange={handleChange}
              placeholder="Chapter ID"
              className="mb-4 w-full rounded border p-2"
            />
            <input
              type="text"
              name="difficulty"
              value={editedQuestion.difficulty}
              onChange={handleChange}
              placeholder="Difficulty"
              className="mb-4 w-full rounded border p-2"
            />
            <textarea
              name="explanation"
              value={editedQuestion.explanation}
              onChange={handleChange}
              placeholder="Explanation"
              className="mb-4 w-full rounded border p-2"
            />
            <input
              type="text"
              name="tags"
              value={editedQuestion.tags.join(", ")}
              onChange={handleChange}
              placeholder="Tags (comma-separated)"
              className="mb-4 w-full rounded border p-2"
            />
            <button type="submit">Submit</button>
          </form>
        ) : (
          <>
            <p>{question?.text}</p>
            <p>Options: {question?.options.join(", ")}</p>
            <p>Topic ID: {question?.topicId}</p>
            <p>Chapter ID: {question?.chapterId}</p>
            <p>Difficulty: {question?.difficulty}</p>
            <p>Explanation: {question?.explanation}</p>
            <p>Tags: {question?.tags.join(", ")}</p>
            <button onClick={handleEditToggle}>Edit</button>
          </>
        )}
      </div>
    </>
  );
};

export default QuestionForm;
