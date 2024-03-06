import React from 'react';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';

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
    {
      name: "page3",
      elements: [
        {
          type: "comment",
          name: "question3",
          title: "What do you like most about the selected programming language?"
        }
      ]
    }
  ]
};

export default function SurveyComponent(): JSX.Element {
  const survey = new Survey.Model(surveyJson);

  const onComplete = (result: any) => {
    console.log(result.data);
  };

  return (
    <div>
      <Survey.Survey
        model={survey}
        onComplete={onComplete}
      />
    </div>
  );
}
