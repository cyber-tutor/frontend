import React, { useState, FormEvent, ChangeEvent } from "react";

export interface Question {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: string;
  topicId: string;
  chapterId: string;
  proficiencyLevel: number;
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
  const [editedQuestion, setEditedQuestion] = useState<Question>(
    question || {
      text: "",
      options: [],
      correctAnswer: "",
      topicId: "",
      chapterId: "",
      proficiencyLevel: 0,
      explanation: "",
      tags: [],
    },
  );

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
    const arrayValue = value
      ? Array.from(new Set(value.split(",").map((item) => item.trim())))
      : [];
    setEditedQuestion((prevQuestion) => ({
      ...prevQuestion,
      [name]: arrayValue,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!editedQuestion.options.includes(editedQuestion.correctAnswer)) {
      alert("uh oh, 🦧: that correct answer is not in the list of options!");
      return;
    }

    onSubmit(editedQuestion);
    setEditedQuestion({
      text: "",
      options: [],
      correctAnswer: "",
      topicId: "",
      chapterId: "",
      proficiencyLevel: 0,
      explanation: "",
      tags: [],
    });
  };

  return (
    <div className="p-5">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1"
      >
        <div className="flex flex-col">
          <label htmlFor="text" className="mb-1 font-bold">
            Question
          </label>
          <InputField
            name="text"
            value={editedQuestion.text}
            onChange={handleChange}
            placeholder="Question"
            isTextArea
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="options" className="mb-1 font-bold">
            Options
          </label>
          <InputField
            name="options"
            value={editedQuestion.options.join(", ")}
            onChange={handleArrayChange}
            placeholder="Options (comma-separated)"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="correctAnswer" className="mb-1 font-bold">
            Correct Answer
          </label>
          <InputField
            name="correctAnswer"
            value={editedQuestion.correctAnswer}
            onChange={handleChange}
            placeholder="Correct Answer"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="explanation" className="mb-1 font-bold">
            Explanation
          </label>
          <InputField
            name="explanation"
            value={editedQuestion.explanation}
            onChange={handleChange}
            placeholder="Explanation"
            isTextArea
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="topicId" className="mb-1 font-bold">
            Topic ID
          </label>
          <InputField
            name="topicId"
            value={editedQuestion.topicId}
            onChange={handleChange}
            placeholder="Topic ID (Needs to be a dropdown later)"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="proficiencyLevel" className="mb-1 font-bold">
            Proficiency Level
          </label>
          <InputField
            name="proficiencyLevel"
            value={editedQuestion.proficiencyLevel.toString()}
            onChange={handleChange}
            placeholder="Proficiency Level"
            type="number"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="chapterId" className="mb-1 font-bold">
            Chapter ID
          </label>
          <InputField
            name="chapterId"
            value={editedQuestion.chapterId}
            onChange={handleChange}
            placeholder="Chapter ID (Needs to be disabled if topicId is not selected, and a dropdown later)"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="tags" className="mb-1 font-bold">
            Tags
          </label>
          <InputField
            name="tags"
            value={editedQuestion.tags.join(", ")}
            onChange={handleArrayChange}
            placeholder="Tags (comma-separated)"
          />
        </div>
        <button
          type="submit"
          className="col-span-full rounded bg-green-600 p-2 font-mono text-white"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default QuestionForm;
