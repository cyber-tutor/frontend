import React, { useState, useEffect } from "react";
import { Survey, Model } from "survey-react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../pages/firebase/config";

interface Question {
  question: string;
  choices: Record<string, string>;
  correctAnswer: string; 
  chapterId: string;
}

interface DynamicSurveyProps {
  chapterId: string;
}

const DynamicSurvey = ({ chapterId }: DynamicSurveyProps) => {
  const [surveyJson, setSurveyJson] = useState<Model>(new Model({}));
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>({}); 

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
        correctAnswers[`question${questions.length}`] = questionData.correctAnswer; 
      });
      setCorrectAnswers(correctAnswers);
      return questions;
    };

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

    fetchQuestions().then((questions) => {
      const formattedQuestions = formatQuestionsForSurveyJS(questions);
      setSurveyJson(new Model(formattedQuestions));
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

  return (
    <Survey
      model={surveyJson}
      onComplete={(result: Model) => {
        console.log("Survey results: ", result.data);
        const { percentage, resultMessage } = calculateResults(result.data);
        console.log(`Survey results: ${resultMessage} (${percentage.toFixed(2)}%)`);
      }}
    />
  );
};

export default DynamicSurvey;
