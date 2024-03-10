import React, { useState, useEffect } from "react";
import { Survey, StylesManager, Model } from "survey-react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../pages/firebase/config";

interface Question {
  question: string;
  choices: Record<string, string>;
  chapterId: string;
}

interface DynamicSurveyProps {
  chapterId: string;
}

const DynamicSurvey = ({ chapterId }: DynamicSurveyProps) => {
  const [surveyJson, setSurveyJson] = useState<Model>(new Model({}));

  useEffect(() => {
    const fetchQuestions = async () => {
      const questions: Question[] = [];
      // Create a query against the collection, filtering by chapterId
      const q = query(
        collection(db, "quizQuestions"),
        where("chapterId", "==", chapterId),
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        questions.push(doc.data() as Question);
      });
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

  return (
    <Survey
      model={surveyJson}
      onComplete={(result: Model) => {
        console.log("Survey results: ", result.data);
      }}
    />
  );
};

export default DynamicSurvey;
