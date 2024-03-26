import React, { useState, useEffect, useRef } from "react";
import { Survey, Model } from "survey-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../pages/firebase/config";
import {
  findUserDocId,
  increaseLevel,
} from "~/pages/firebase/firebase_functions";

interface Question {
  question: string;
  choices: Record<string, string>;
  correctAnswer: string;
  chapterId: string;
}

interface DynamicSurveyProps {
  chapterId: string;
  userId: string; // Assuming you have the userId
}

const DynamicSurvey = ({ chapterId, userId }: DynamicSurveyProps) => {
  const [surveyJson, setSurveyJson] = useState<Model>(new Model({}));
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>(
    {},
  );
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const questions: Question[] = [];
      const correctAnswers: Record<string, string> = {};

      const q = query(
        collection(db, "quizQuestions"),
        where("chapterId", "==", chapterId),
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const questionData = doc.data() as Question;
        questions.push(questionData);
        correctAnswers[`question${questions.length}`] =
          questionData.correctAnswer;
      });
      setCorrectAnswers(correctAnswers);
      return questions;
    };

    console.log("Chapter ID:", chapterId);
    const formatQuestionsForSurveyJS = (questions: Question[]) => {
      return {
        title: "Chapter Assessment",
        showProgressBar: "bottom",
        pages: [
          {
            questions: questions.map((q, index) => ({
              type: "radiogroup",
              name: `question${index + 1}`,
              title: q.question,
              isRequired: true,
              choices: Object.entries(q.choices).map(([key, value]) => ({
                value: key,
                text: value,
              })),
            })),
          },
        ],
      };
    };

    void fetchQuestions().then((questions) => {
      const formattedQuestions = formatQuestionsForSurveyJS(questions);
      setSurveyJson(new Model(formattedQuestions));
      startTimeRef.current = new Date(); // Set the start time when the survey is loaded
    });
  }, [chapterId]);

  const calculateResults = (results: Record<string, string>) => {
    let correctCount = 0;
    Object.entries(results).forEach(([key, value]) => {
      if (correctAnswers[key] === value) {
        correctCount++;
      }
    });
    const totalQuestions = Object.keys(correctAnswers).length;
    const percentage = (correctCount / totalQuestions) * 100;
    const resultMessage = percentage >= 70 ? "User passed" : "User failed";
    return { percentage, resultMessage };
  };

  const updateUserProgress = async (
    score: number,
    passed: boolean,
    timeElapsed: number,
  ) => {
    const userDocId = await findUserDocId(userId);
    if (userDocId) {
      const progressDocRef = doc(db, "users", userDocId, "progress", chapterId);
      const progressDocSnapshot = await getDoc(progressDocRef);

      let currentAttempts = 0;
      if (progressDocSnapshot.exists()) {
        const data = progressDocSnapshot.data() as {
          attempts?: Record<string, unknown>;
        };
        currentAttempts = Object.keys(data.attempts ?? {}).length;
      }

      // Convert timeElapsed to minutes:seconds format
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = Math.floor(timeElapsed % 60);
      const formattedTimeElapsed = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      const newAttemptKey = `attempt${currentAttempts + 1}`;
      const updateData: Record<string, { score: number; timeElapsed: string }> =
        {
          [`attempts.${newAttemptKey}`]: {
            score: score,
            timeElapsed: formattedTimeElapsed,
          },
        };

      let updateDataComplete = {};

      if (progressDocSnapshot.exists()) {
        const data = progressDocSnapshot.data() as {
          complete?: boolean;
          topicId?: string;
        };
        if (passed && !data.complete) {
          updateDataComplete = { ...updateData, complete: true };
          if (
            typeof userDocId === "string" &&
            typeof data.topicId === "string"
          ) {
            await increaseLevel(userDocId, data.topicId);
          }
        }
      } else {
        updateDataComplete = updateData;
      }

      await updateDoc(progressDocRef, updateDataComplete);
    }
  };

  return (
    <Survey
      model={surveyJson}
      onComplete={(result: Model) => {
        console.log("Survey results: ", result.data);
        const data = result.data as Record<string, string>;
        const { percentage, resultMessage } = calculateResults(data);
        console.log(
          `Survey results: ${resultMessage} (${percentage.toFixed(2)}%)`,
        );

        // Calculate the time elapsed in seconds
        const endTime = new Date();
        const timeElapsed =
          (endTime.getTime() -
            (startTimeRef.current?.getTime() ?? endTime.getTime())) /
          1000;

        if (resultMessage === "User passed") {
          alert(`You passed with a score of ${percentage.toFixed(2)}%`);
          void updateUserProgress(percentage, true, timeElapsed); // Update user progress in Firebase
        } else {
          alert(`You failed with a score of ${percentage.toFixed(2)}%`);
          void updateUserProgress(percentage, false, timeElapsed); // Update user progress in Firebase
        }
      }}
    />
  );
};

export default DynamicSurvey;
