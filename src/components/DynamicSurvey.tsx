import React, { useState, useEffect } from "react";
import { Survey, StylesManager, Model } from "survey-react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { db } from "../pages/firebase/config";

interface Question {
  question: string;
  choices: Record<string, string>;
}

const DynamicSurvey = () => {
  const [surveyJson, setSurveyJson] = useState<Model>(new Model({}));

  useEffect(() => {
    const fetchQuestions = async () => {
      const questions: Question[] = [];
      const querySnapshot = await getDocs(collection(db, "quizQuestions"));
      querySnapshot.forEach((doc) => {
        questions.push(doc.data() as Question);
      });
      return questions;
    };

    const formatQuestionsForSurveyJS = (questions: Question[]) => {
      return {
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
  }, []);

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
