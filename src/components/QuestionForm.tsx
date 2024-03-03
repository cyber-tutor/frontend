import React, { useState, FormEvent, ChangeEvent } from "react";

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

interface InputProps {
  name: string;
  value: string | string[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  type?: string;
  isTextArea?: boolean;
}

const InputField: React.FC<InputProps> = ({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  isTextArea = false,
}) => {
  const InputComponent = isTextArea ? "textarea" : "input";

  return (
    <InputComponent
      type={type}
      name={name}
      value={value as string}
      onChange={onChange}
      placeholder={placeholder}
      className="mb-4 w-full rounded border p-2"
    />
  );
};

const QuestionForm: React.FC<{
  question?: Question;
  onSubmit: (updatedQuestion: Question) => void;
}> = ({ question, onSubmit }) => {
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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedQuestion((prevQuestion) => ({ ...prevQuestion, [name]: value }));
  };

  const handleArrayChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const arrayValue = value ? value.split(",").map((item) => item.trim()) : [];
    setEditedQuestion((prevQuestion) => ({
      ...prevQuestion,
      [name]: arrayValue,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(editedQuestion);
    setEditMode(false);
  };

  return (
    <div className="p-5">
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <InputField
            name="text"
            value={editedQuestion.text}
            onChange={handleChange}
            placeholder="Question"
          />
          <InputField
            name="options"
            value={editedQuestion.options.join(", ")}
            onChange={handleArrayChange}
            placeholder="Options (comma-separated)"
          />
          <InputField
            name="topicId"
            value={editedQuestion.topicId}
            onChange={handleChange}
            placeholder="Topic ID"
          />
          <InputField
            name="chapterId"
            value={editedQuestion.chapterId}
            onChange={handleChange}
            placeholder="Chapter ID"
          />
          <InputField
            name="difficulty"
            value={editedQuestion.difficulty}
            onChange={handleChange}
            placeholder="Difficulty"
          />
          <InputField
            name="explanation"
            value={editedQuestion.explanation}
            onChange={handleChange}
            placeholder="Explanation"
            isTextArea
          />
          <InputField
            name="tags"
            value={editedQuestion.tags.join(", ")}
            onChange={handleArrayChange}
            placeholder="Tags (comma-separated)"
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
  );
};

export default QuestionForm;
