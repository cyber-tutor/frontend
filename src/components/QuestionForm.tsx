import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import InputField from "../components/InputField";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../pages/firebase/config";

type Topic = {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  chapters: Chapter[];
};

type Chapter = {
  chapterId: string;
  chapterType: string;
  chapterTitle: string;
  chapterDescription: string;
  controlGroupContent: string;
  experimentalGroupContent: string;
  controlGroupImageURL: string;
  experimentalGroupImageURL: string;
};

export interface Question {
  id?: string;
  question: string;
  choices: { [key: string]: string };
  answer: string;
  explanation: string;
  topicId: string;
  difficulty: string;
  chapterId: string;
  [key: string]: any;
}

const QuestionForm: React.FC<{
  question?: Question;
  onSubmit: (updatedQuestion: Question) => void;
}> = ({ question, onSubmit }) => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const topicsCollectionRef = collection(db, "topics");
      const topicsArray: Topic[] = [];

      try {
        const topicsSnapshot = await getDocs(
          query(topicsCollectionRef, orderBy("order")),
        );
        for (const topicDoc of topicsSnapshot.docs) {
          const topicData = topicDoc.data();
          const topicId = topicDoc.id;

          const chaptersCollectionRef = collection(topicDoc.ref, "chapters");
          const chaptersSnapshot = await getDocs(chaptersCollectionRef);
          const chapters: Chapter[] = [];
          chaptersSnapshot.forEach((chapterDoc) => {
            const chapterData = chapterDoc.data();
            const chapterId = chapterDoc.id;
            chapters.push({
              chapterId: chapterId,
              chapterType: chapterData.chapterType,
              chapterTitle: chapterData.chapterTitle,
              chapterDescription: chapterData.chapterDescription,
              controlGroupContent: chapterData.controlGroupContent,
              experimentalGroupContent: chapterData.experimentalGroupContent,
              controlGroupImageURL: chapterData.controlGroupImageURL,
              experimentalGroupImageURL: chapterData.experimentalGroupImageURL,
            });
          });

          const newTopic = {
            topicId: topicId,
            topicTitle: topicData.topicTitle,
            topicDescription: topicData.topicDescription,
            chapters: chapters,
          };

          topicsArray.push(newTopic);
        }

        setTopics(topicsArray);
      } catch (error) {
        console.error("uh oh, error fetching topics 🦧:", error);
      }
    };

    fetchTopics();
  }, []);
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

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    if (name === "choices") {
      const choiceKey = value.substring(0, 1);
      const choiceValue = value.substring(1).trim();

      setEditedQuestion((prevQuestion) => ({
        ...prevQuestion,
        choices: {
          ...prevQuestion.choices,
          [choiceKey]: choiceValue,
        },
      }));
    } else {
      setEditedQuestion((prevQuestion) => ({
        ...prevQuestion,
        [name]: value,
      }));
    }
    if (name === "topicId") {
      const selectedTopic = topics.find((topic) => topic.topicId === value);
      if (selectedTopic) {
        setChapters(selectedTopic.chapters);
      } else {
        setChapters([]);
      }
    }
  };

  const handleArrayChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "choices") {
      const choiceStrings = value.split(",").map((choice) => choice.trim());
      const choicesObject: { [key: string]: string | undefined } = {};
      for (let i = 0; i < choiceStrings.length; i++) {
        const key = String.fromCharCode(97 + i);
        choicesObject[key] = choiceStrings[i];
      }

      setEditedQuestion((prevQuestion) => ({
        ...prevQuestion,
        choices: choicesObject as { [key: string]: string },
      }));
    } else {
      setEditedQuestion((prevQuestion) => ({
        ...prevQuestion,
        [name]: value.split(",").map((item) => item.trim()),
      }));
    }
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

    if (!Object.keys(question.choices).includes(question.answer)) {
      errors.answer =
        "uh oh 🦧, the correct answer should be one of the choice keys.";
    }

    if (!question.explanation) {
      errors.explanation = "uh oh 🦧, you need an explanation.";
    }

    if (!question.difficulty || question.difficulty === "Select a difficulty") {
      errors.difficulty = "uh oh 🦧, you need to select a difficulty.";
    }

    if (!question.topicId) {
      errors.topicId = "uh oh 🦧, you need to choose a topic.";
    }

    if (!question.chapterId) {
      errors.chapterId = "uh oh 🦧, you need to choose a chapter.";
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
            isTextArea
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
            placeholder="Topic ID"
            isSelect={true}
            options={topics.map((topic) => ({
              value: topic.topicId,
              label: topic.topicTitle,
            }))}
            error={errors.topicId}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="difficulty" className="mb-1 font-bold">
            Difficulty
          </label>
          <InputField
            name="difficulty"
            value={editedQuestion.difficulty}
            onChange={handleChange}
            placeholder="Select a difficulty"
            isSelect={true}
            options={["Beginner", "Intermediate", "Hard"].map((difficulty) => ({
              value: difficulty,
              label: difficulty,
            }))}
            error={errors.difficulty}
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
            placeholder="Chapter ID"
            isSelect={true}
            options={chapters.map((chapter) => ({
              value: chapter.chapterId,
              label: chapter.chapterTitle,
            }))}
            disabled={!editedQuestion.topicId}
            error={errors.chapterId}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="topics" className="mb-1 font-bold">
            Topics
          </label>
          <InputField
            name="topics"
            value={
              Array.isArray(editedQuestion.topics)
                ? editedQuestion.topics.join(", ")
                : ""
            }
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
