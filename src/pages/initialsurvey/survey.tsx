import { useEffect, useState } from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { db } from "../firebase/config";

Survey.StylesManager.applyTheme("default");

export default function SurveyComponent(): JSX.Element {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [surveyJson, setSurveyJson] = useState<any>(null);

  useEffect(() => {
    const fetchSurveyQuestions = async () => {
      const surveyCollectionRef = collection(db, "initialSurveyQuestions");
      const querySnapshot = await getDocs(surveyCollectionRef);
      const questions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let question = {
          name: doc.id,
          title: data.question,
          isRequired: true,
        };
        if (data.questionType === "radiogroup") {
          question = {
            ...question,
            type: "radiogroup",
            choices: Object.values(data.choices),
          } as { name: string; title: any; isRequired: boolean; type: string };
        } else if (data.questionType === "comment") {
          question = { ...question, type: "comment", maxLength: 400 } as {
            name: string;
            title: any;
            isRequired: boolean;
            type: string;
          };
        }
        return question;
      });

      setSurveyJson({
        showProgressBar: "bottom",
        pages: questions.map((question) => ({
          questions: [question],
        })),
      });
    };

    fetchSurveyQuestions();
  }, []);

  const survey = new Survey.Model(surveyJson || {});

  survey.onComplete.add((surveyResult) => {
    setIsComplete(true);
    const userResponses = surveyResult.data;
    console.log(JSON.stringify(userResponses));
  });

  return (
    <div>
      {surveyJson ? (
        <Survey.Survey model={survey} />
      ) : (
        <div>Loading survey...</div>
      )}
    </div>
  );
}
