import React, { useState, useEffect } from "react";
import { Survey, Model } from "survey-react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "survey-react/survey.css";
import { StylesManager } from "survey-react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { initialSurveyComplete } from "../firebase/firebase_functions";

StylesManager.applyTheme("default");

interface Question {
  question: string;
  questionCategory: string;
  questionType: string;
  choices?: Record<string, string>;
  answer?: string;
  difficulty?: string;
  explanation?: string;
}

const InitialSurvey = () => {
  const router = useRouter();
  const [surveyJson, setSurveyJson] = useState<Model | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [result, setResult] = useState<unknown>(null);
  const [incorrectCount, setIncorrectCount] = useState<string>("0/0");
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<string>("");

  useEffect(() => {
    const fetchQuestions = async () => {
      const questions: { id: string; data: Question }[] = [];
      const q = query(collection(db, "initialSurveyQuestions"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const questionData = doc.data() as Question;
        questions.push({ id: doc.id, data: questionData });
      });
      return questions;
    };

    const formatQuestionsForSurveyJS = (
      questions: { id: string; data: Question }[],
    ) => {
      return {
        showProgressBar: "bottom",
        pages: questions.map((q, index) => ({
          name: `page${index + 1}`,
          elements: [
            {
              type: q.data.questionType,
              name: q.id,
              title: q.data.question,
              isRequired: false,
              answer: q.data.answer,
              difficulty: q.data.difficulty,
              ...(q.data.questionType === "comment" && { maxLength: 400 }),
              ...(q.data.questionType === "radiogroup" && {
                choices: Object.entries(q.data.choices ?? {}).map(
                  ([key, value]) => ({
                    value: key,
                    text: value,
                  }),
                ),
              }),
            },
          ],
        })),
      };
    };

    void fetchQuestions().then((questions) => {
      const formattedQuestions = formatQuestionsForSurveyJS(questions);
      setSurveyJson(new Model(formattedQuestions));
    });
  }, []);

  useEffect(() => {
    if (surveyJson) {
      surveyJson.onComplete.add((surveyResult: { data: unknown }) => {
        setIsComplete(true);
        setResult(surveyResult.data);
      });
    }
  }, [surveyJson]);

  useEffect(() => {
    const handleSurveyCompletion = async () => {
      if (isComplete && surveyJson) {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          try {
            // Await the promise returned by initialSurveyComplete
            await initialSurveyComplete(
              userId,
              result as Record<string, string | number | boolean>,
            );
            // Await the promise returned by router.push
            await router.push("/");
          } catch (error) {
            // Handle any errors here
            console.error(error);
          }
        }
      }
    };

    void handleSurveyCompletion();
  }, [router, isComplete, surveyJson, result]);

  return (
    <div>
      {surveyJson && <Survey model={surveyJson} />}
      {isComplete && (
        <div>
          <div>Incorrect count: {incorrectCount}</div>
          <div>Total points: {totalPoints}</div>
          <div>User level: {userLevel}</div>
        </div>
      )}
    </div>
  );
};

export default InitialSurvey;
