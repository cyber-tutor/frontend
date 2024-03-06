import { getAuth } from 'firebase/auth';
import { updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';
import queryUserDocument from '../firebase/firebase_functions';
import { set } from 'firebase/database';

Survey.StylesManager.applyTheme("default");

const surveyJson = {
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "text",
          name: "question1",
          title: "What is your name?"
        }
      ]
    },
    {
      name: "page2",
      elements: [
        {
          type: "radiogroup",
          name: "question2",
          title: "What is your favorite programming language?",
          choices: ["JavaScript", "Python", "TypeScript", "Java", "C#"]
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

  const onComplete = (result: any) => {
    setIsComplete(true);
    setResult(JSON.stringify(result.data));
    console.log(JSON.stringify(result.data)); 
  };

  useEffect(() => {
    if (isComplete) {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;

        queryUserDocument(userId).then((docSnapshot) => {
          if (docSnapshot) {

            updateDoc(docSnapshot.ref, { initialSurveyResults: result, initialSurveyComplete: true })
              .then(() => {
                console.log('Document successfully updated');

                if(docSnapshot.data().group === "experimental"){
                  router.push('/initialsurvey/generating');
                } else{
                  router.push('/');
                }
              })
              .catch((error) => {
                console.error('Error updating document: ', error);
              });
          }else {
            console.log('No document found or error occurred');
          }
        });
      } 
    }
  }, [router, isComplete]);

  

  return (
    <div>
      <Survey.Survey model={survey} onComplete={onComplete} />
    </div>
  );
}
