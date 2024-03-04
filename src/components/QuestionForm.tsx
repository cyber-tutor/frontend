import React, { useState, FormEvent, ChangeEvent } from "react";
import InputField from "../components/InputField";

export interface Question {
  id?: string;
  question: string;
  choices: { [key: string]: string };
  answer: string;
  topicId: string;
  chapterId: string;
  difficulty: string;
  explanation: string;
  topics: string[];
}

const QuestionForm: React.FC<{
  question?: Question;
  onSubmit: (updatedQuestion: Question) => void;
}> = ({ question, onSubmit }) => {
  const [editedQuestion, setEditedQuestion] = useState<Question>(
    question || {
      question: "",
      choices: {},
      answer: "",
      topicId: "",
      chapterId: "",
      difficulty: "",
      explanation: "",
      topics: [],
    },
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Question, string>>>(
    {},
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    setEditedQuestion((prevQuestion) => ({
      ...prevQuestion,
      [name]: value, // Change this line
    }));
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

    if (!question.question) {
      errors.question = "uh oh 🦧, you need a question.";
    }

    if (Object.keys(question.choices).length < 2) {
      errors.choices = "uh oh 🦧, you need at least 2 choices.";
    }

    if (!question.answer) {
      errors.answer = "uh oh 🦧, you need a correct answer.";
    }

    if (!Object.values(question.choices).includes(question.answer)) {
      errors.answer =
        "uh oh 🦧, the correct answer should be one of the choices.";
    }

    if (!question.explanation) {
      errors.explanation = "uh oh 🦧, you need an explanation.";
    }

    if (!question.topicId) {
      errors.topicId = "uh oh 🦧, you need a topic ID.";
    }

    if (!question.chapterId) {
      errors.chapterId = "uh oh 🦧, you need a chapter ID.";
    }

    if (question.topics.length < 1) {
      errors.topics = "uh oh 🦧, you need at least 1 tag.";
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
      question: "",
      choices: {},
      answer: "",
      topicId: "",
      chapterId: "",
      difficulty: "",
      explanation: "",
      topics: [],
    });
  };

  return (
    <div className="p-5">
      <form
        onSubmit={handleSubmit}
        className="xs:grid-cols-1 grid gap-4 sm:grid-cols-2 md:grid-cols-4"
      >
        <div className="flex flex-col">
          <label htmlFor="question" className="mb-1 font-bold">
            Question
          </label>
          <InputField
            name="question"
            value={editedQuestion.question}
            onChange={handleChange}
            placeholder="Question"
            isTextArea
            error={errors.question}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="choices" className="mb-1 font-bold">
            Choices
          </label>
          <InputField
            name="choices"
            value={Object.values(editedQuestion.choices).join(", ")}
            onChange={handleArrayChange}
            placeholder="Options (comma-separated)"
            error={errors.choices}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="answer" className="mb-1 font-bold">
            Answer
          </label>
          <InputField
            name="answer"
            value={editedQuestion.answer}
            onChange={handleChange}
            placeholder="Correct Answer"
            error={errors.answer}
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
          <label htmlFor="difficulty" className="mb-1 font-bold">
            Difficulty
          </label>
          <select
            name="difficulty"
            value={editedQuestion.difficulty}
            onChange={handleChange}
            className="your-classname-for-styling"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Hard">Hard</option>
          </select>
          {errors.difficulty && (
            <p className="error-message">{errors.difficulty}</p>
          )}
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
          <label htmlFor="topics" className="mb-1 font-bold">
            Topics
          </label>
          <InputField
            name="topics"
            value={editedQuestion.topics.join(", ")}
            onChange={handleArrayChange}
            placeholder="Tags (comma-separated)"
            error={errors.topics}
          />
        </div>
        <button
          type="submit"
          className="question-white col-span-full rounded bg-green-600 p-2 font-mono"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default QuestionForm;
