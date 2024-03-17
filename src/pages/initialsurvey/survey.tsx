import React, { useState, useEffect } from "react";
import { Survey, Model } from "survey-react";
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import "survey-react/survey.css";
import { StylesManager } from "survey-react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import queryUserDocument from "../firebase/firebase_functions";

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
  const [result, setResult] = useState<any | null>(null);
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
                choices: Object.entries(q.data.choices || {}).map(
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

    fetchQuestions().then((questions) => {
      const formattedQuestions = formatQuestionsForSurveyJS(questions);
      setSurveyJson(new Model(formattedQuestions));
    });
  }, []);

  useEffect(() => {
    if (surveyJson) {
      surveyJson.onComplete.add((surveyResult: any) => {
        setIsComplete(true);
        setResult(surveyResult.data);
      });
    }
  }, [surveyJson]);

  useEffect(() => {
    if (isComplete && surveyJson) {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;

        const { incorrect, total, points } = surveyJson.pages.reduce(
          (count: any, page: any) => {
            return page.elements.reduce((pageCount: any, element: any) => {
              const questionId = element.name;
              const userAnswer = result ? result[questionId] : undefined;
              const answer = element.answer;
              const difficulty = element.difficulty;
              let isIncorrect = userAnswer !== answer;

              // Handle multiple choice questions
              if (Array.isArray(userAnswer) && typeof answer === 'string') {
                isIncorrect = !userAnswer.includes(answer);
              }

              const userDocRef = doc(
                db,
                "initialSurveyQuestions",
                questionId,
                "users",
                userId,
              );
              setDoc(userDocRef, {
                response: userAnswer !== undefined ? userAnswer : null,
                name: user.displayName || "Anonymous",
              });

              const pointsForQuestion = isIncorrect
                ? 0
                : difficulty === "hard"
                ? 3
                : difficulty === "intermediate"
                ? 2
                : 1;

              return {
                incorrect: isIncorrect
                  ? pageCount.incorrect + 1
                  : pageCount.incorrect,
                total: pageCount.total + 1,
                points: pageCount.points + pointsForQuestion,
              };
            }, count);
          },
          { incorrect: 0, total: 0, points: 0 },
        );

        setTotalPoints(points);

        const level =
          points >= total * 2.5
            ? "hard"
            : points >= total * 1.5
            ? "intermediate"
            : "beginner";
        setUserLevel(level);

        const correct = total - incorrect;
        setIncorrectCount(`${incorrect}/${total}`);

        queryUserDocument(userId)
          .then((userDocRef) => {
            if (userDocRef) {
              return updateDoc(userDocRef.ref, {
                initialSurveyComplete: true,
                initialSurveyCorrectCount: correct,
                userLevel: level,
              });
            } else {
              console.log("No user document found");
            }
          })
          .then(() => {
            console.log("User document successfully updated");
            router.push("/");
          })
          .catch((error) => {
            console.error("Error updating documents: ", error);
          });
      }
    }
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
