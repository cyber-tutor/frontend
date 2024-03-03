import React, { useState, FormEvent, ChangeEvent } from "react";
import InputField from "../components/InputField";

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
  const [errors, setErrors] = useState<Partial<Record<keyof Question, string>>>(
    {},
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
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

  const validateQuestion = (
    question: Question,
  ): Partial<Record<keyof Question, string>> => {
    const errors: Partial<Record<keyof Question, string>> = {};

    if (!question.text) {
      errors.text = "uh oh 🦧, you need a question.";
    }

    if (question.options.length < 2) {
      errors.options = "uh oh 🦧, you need at least 2 options.";
    }

    if (!question.correctAnswer) {
      errors.correctAnswer = "uh oh 🦧, you need a correct answer.";
    }

    if (!question.options.includes(question.correctAnswer)) {
      errors.correctAnswer =
        "uh oh 🦧, the correct answer should be one of the options.";
    }

    if (!question.explanation) {
      errors.explanation = "uh oh 🦧, you need an explanation.";
    }

    if (!question.topicId) {
      errors.topicId = "uh oh 🦧, you need a topic ID.";
    }

    if (question.proficiencyLevel < 1 || question.proficiencyLevel > 5) {
      errors.proficiencyLevel =
        "uh oh 🦧, the proficiency level should be between 1 and 5.";
    }

    if (!question.chapterId) {
      errors.chapterId = "uh oh 🦧, you need a chapter ID.";
    }

    if (question.tags.length < 1) {
      errors.tags = "uh oh 🦧, you need at least 1 tag.";
    }

    return errors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors = validateQuestion(editedQuestion);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        className="xs:grid-cols-1 grid gap-4 sm:grid-cols-2 md:grid-cols-4"
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
            error={errors.text}
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
            error={errors.options}
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
            error={errors.correctAnswer}
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
            error={errors.explanation}
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
            error={errors.topicId}
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
            error={errors.proficiencyLevel}
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
            error={errors.chapterId}
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
            error={errors.tags}
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
