import { getAuth } from 'firebase/auth';
import { updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';
import queryUserDocument from '../firebase/firebase_functions';

Survey.StylesManager.applyTheme("default");

const surveyJson = {
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "radiogroup",
          name: "question1",
          title: "What is phishing?",
          choices: [
            "A fishing activity",
            "A type of cyberattack",
            "A computer virus",
            "A social media platform"
          ],
          correctAnswer: "A type of cyberattack"
        }
      ]
    },
    {
      name: "page2",
      elements: [
        {
          type: "radiogroup",
          name: "question2",
          title: "What is a firewall?",
          choices: [
            "A protective barrier around a building",
            "A security feature in computer networks",
            "A type of computer virus",
            "A programming language"
          ],
          correctAnswer: "A security feature in computer networks"
        }
      ]
    },
  ]
};

export default function SurveyComponent(): JSX.Element {
  const survey = new Survey.Model(surveyJson);
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [incorrectCount, setIncorrectCount] = useState<string>("0/2");

  const onComplete = (result: any) => {
    setIsComplete(true);
    setResult(result.data);
    console.log(JSON.stringify(result.data)); 
  };

  useEffect(() => {
    if (isComplete) {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;

        const { incorrect, total } = surveyJson.pages.reduce((count, page) => {
          return page.elements.reduce((pageCount, element) => {
            const questionId = element.name;
            const userAnswer = result[questionId];
            const correctAnswer = element.correctAnswer;
            return userAnswer !== correctAnswer ? { incorrect: pageCount.incorrect + 1, total: pageCount.total + 1 } : pageCount;
          }, count);
        }, { incorrect: 0, total: 0 });

        setIncorrectCount(`${incorrect}/${total}`);

        queryUserDocument(userId).then((docSnapshot) => {
          if (docSnapshot) {
            updateDoc(docSnapshot.ref, { 
              initialSurveyResults: result, 
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
  }, [router, isComplete, result]);

  return (
    <div>
      <Survey.Survey model={survey} onComplete={onComplete} />
      <div>Incorrect answers: {incorrectCount}</div>
    </div>
  );
}

