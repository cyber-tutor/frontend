import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import InputField from "../components/InputField";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase/config";

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
  topics: string[];
  fromChapter: string;
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
      choices: { a: "", b: "", c: "", d: "" },
      answer: "",
      topicId: "",
      chapterId: "",
      difficulty: "",
      explanation: "",
      topics: [],
      fromChapter: "",
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

    if (name.startsWith("choice-")) {
      const choiceKey = name.split("-")[1]!;

      setEditedQuestion((prevQuestion) => ({
        ...prevQuestion,
        choices: {
          ...prevQuestion.choices,
          [choiceKey]: value,
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

    if (!question.fromChapter) {
      errors.fromChapter = "uh oh 🦧, you need to specify the chapter.";
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
      choices: { a: "", b: "", c: "", d: "" },
      answer: "",
      topicId: "",
      chapterId: "",
      difficulty: "",
      explanation: "",
      topics: [],
      fromChapter: "",
    });
  };

  return (
    <div className="p-5">
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
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
            <label htmlFor="difficulty" className="mb-1 font-bold">
              Difficulty
            </label>
            <InputField
              name="difficulty"
              value={editedQuestion.difficulty}
              onChange={handleChange}
              placeholder="Difficulty"
              error={errors.difficulty}
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
            <label htmlFor="imageURL" className="mb-1 font-bold">
              Image URL
            </label>
            <InputField
              name="imageURL"
              value={editedQuestion.imageURL || ""}
              onChange={handleChange}
              placeholder="Image URL"
              error={errors.imageURL}
            />
          </div>
        </div>

        <div className="col-span-1 col-start-2">
          {["a", "b", "c", "d"].map((choiceKey) => (
            <div className="flex flex-col" key={choiceKey}>
              <label htmlFor={`choice-${choiceKey}`} className="mb-1 font-bold">
                Choice {choiceKey.toUpperCase()}
              </label>
              <InputField
                name={`choice-${choiceKey}`}
                value={editedQuestion.choices[choiceKey] || ""}
                onChange={handleChange}
                placeholder={`Choice ${choiceKey.toUpperCase()}`}
                error={errors.choices}
              />
            </div>
          ))}
        </div>

        <div className="col-span-1 col-start-3">
          <div className="flex flex-col">
            <label htmlFor="topicId" className="mb-1 font-bold">
              Topic ID
            </label>
            <InputField
              name="topicId"
              value={editedQuestion.topicId}
              onChange={handleChange}
              placeholder="Topic ID"
              error={errors.topicId}
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
              error={errors.chapterId}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="fromChapter" className="mb-1 font-bold">
              From Chapter
            </label>
            <InputField
              name="fromChapter"
              value={editedQuestion.fromChapter}
              onChange={handleChange}
              placeholder="From Chapter"
              error={errors.fromChapter}
            />
          </div>
        </div>

        <button
          type="submit"
          className="col-span-full rounded bg-green-600 p-2 font-mono"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default QuestionForm;
