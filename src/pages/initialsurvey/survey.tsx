import { getAuth } from 'firebase/auth';
import { updateDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';
import queryUserDocument from '../firebase/firebase_functions';

Survey.StylesManager.applyTheme("default");

interface SurveyResult {
  [key: string]: any;
}

interface SurveyJson {
  pages: {
    elements: {
      name: string;
      correctAnswer?: string;
    }[];
  }[];
}

export default function SurveyComponent(): JSX.Element {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [incorrectCount, setIncorrectCount] = useState<string>("0/2");
  const [surveyJson, setSurveyJson] = useState<SurveyJson | null>(null);

  useEffect(() => {
    const fetchSurveyJson = async () => {
      const db = getFirestore();
      const surveyRef = doc(db, "userResponses", "initialSurvey");
      const surveyDoc = await getDoc(surveyRef);

      if (surveyDoc.exists()) {
        const surveyData = surveyDoc.data();
        if (typeof surveyData.JSON === 'string') {
          setSurveyJson(JSON.parse(surveyData.JSON) as SurveyJson);
        } else {
          console.log("Survey JSON is not a string.");
        }
      } else {
        console.log("No such document!");
      }
    };

    fetchSurveyJson();
  }, []);

  const survey = new Survey.Model(surveyJson || {});

  const onComplete = (result: SurveyResult) => {
    setIsComplete(true);
    setResult(result);
    console.log(JSON.stringify(result));
  };

  useEffect(() => {
    if (isComplete && surveyJson) {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;

        const { incorrect, total } = surveyJson.pages.reduce((count, page) => {
          return page.elements.reduce((pageCount, element) => {
            const questionId = element.name;
            const userAnswer = result ? result[questionId] : undefined;
            const correctAnswer = element.correctAnswer;
            return userAnswer !== correctAnswer ? { incorrect: pageCount.incorrect + 1, total: pageCount.total + 1 } : pageCount;
          }, count);
        }, { incorrect: 0, total: 0 });

        setIncorrectCount(`${incorrect}/${total}`);

        queryUserDocument(userId).then((docSnapshot) => {
          if (docSnapshot) {
            // Convert the SurveyModel object to a plain object
            const surveyResultsPlainObject = result ? JSON.parse(JSON.stringify(result)) : {};

            updateDoc(docSnapshot.ref, {
              initialSurveyResults: surveyResultsPlainObject,
              initialSurveyComplete: true,
              initialSurveyIncorrectCount: `${incorrect}/${total}`
            }).then(() => {
              console.log('Document successfully updated');

              if (docSnapshot.data().group === "experimental") {
                router.push('/initialsurvey/generating');
              } else {
                router.push('/');
              }
            }).catch((error) => {
              console.error('Error updating document: ', error);
            });
          } else {
            console.log('No document found or error occurred');
          }
        });
      }
    }
  }, [router, isComplete, result, surveyJson]);

  return (
    <div>
      {surveyJson ? (
        <>
          <Survey.Survey model={survey} onComplete={onComplete} />
          <div>Incorrect answers: {incorrectCount}</div>
        </>
      ) : (
        <div>Loading survey...</div>
      )}
    </div>
  );
}
