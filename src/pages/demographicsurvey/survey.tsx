import { getAuth } from "firebase/auth";
import { doc, getDocs, collection, writeBatch } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";
import { db } from "../firebase/config";

Survey.StylesManager.applyTheme("default");

interface QuestionData {
  question: string;
  choices: Record<string, string>;
}

type SurveyResultData = Record<string, string | number | boolean>;

type Result = SurveyResultData;

export default function SurveyComponent(): JSX.Element {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [surveyJson, setSurveyJson] = useState<Survey.Model | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    const fetchSurveyJson = async () => {
      const surveyCollectionRef = collection(db, "demographicSurveyQuestions");
      const surveyDocsSnapshot = await getDocs(surveyCollectionRef);

      const surveyQuestions = surveyDocsSnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as QuestionData;
        const { question, choices } = data;
        return {
          type: "radiogroup",
          name: docSnapshot.id,
          title: question,
          isRequired: true,
          choices: Object.keys(choices).map((key) => ({
            value: key,
            text: choices[key],
          })),
        };
      });

      const surveyJson = {
        title: "Demographic Survey",
        showProgressBar: "bottom",
        pages: [{ elements: surveyQuestions }],
      };

      setSurveyJson(new Survey.Model(surveyJson));
    };

    void fetchSurveyJson();
  }, []);

  const onComplete = async (surveyResult: Survey.Model) => {
    setIsComplete(true);
    const surveyData = surveyResult.data as SurveyResultData;
    setResult(surveyData);

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const batch = writeBatch(db);

      Object.entries(surveyData).forEach(([questionId, answer]) => {
        const userResponseDocRef = doc(
          db,
          "demographicSurveyQuestions",
          questionId,
          "users",
          user.uid,
        );
        batch.set(userResponseDocRef, { answer: answer as string });
      });
    }
  };

  return (
    <div>
      {surveyJson ? (
        <Survey.Survey model={surveyJson} onComplete={onComplete} />
      ) : (
        <div>Loading survey...</div>
      )}
    </div>
  );
}
