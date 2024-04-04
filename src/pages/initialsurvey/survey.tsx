import React, { useState, useEffect } from 'react';
import { Survey, Model } from 'survey-react';
import { collection, query, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '~/components/firebase/config';
import 'survey-react/survey.css';
import { StylesManager } from 'survey-react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import queryUserDocument from '~/components/firebase/firebase_functions';
import determineProficiency from '~/components/ai/gemini';
import { Serializer } from 'survey-react';

// Apply the Tailwind CSS theme
StylesManager.applyTheme('default');

interface Question {
  question: string;
  questionCategory: string;
  questionType: string;
  choices?: Record<string, string>;
  difficulty?: string;
  explanation?: string;
  description: string;
  visibilityCondition: string;
  topic: string;
}

const customCss = {
  root: 'survey-root',
  header: 'text-3xl font-bold text-gray-100 bg-gradient-to-r from-blue-700 to-gray-800 p-5 border-b-2 border-blue-800',
  body: 'survey-body',
  question: 'font-bold text-xl my-4 p-3',
  questionTitle: 'text-2xl text-white p-3', 
  answerRow: 'flex flex-col items-start p-3',
  radiogroupItem: 'my-4 p-3 bg-gray-700 rounded-lg',
  radiogroupControl: 'form-radio text-blue-500 mr-3',
  radiogroupLabel: 'text-gray-300 ml-2 text-lg',
  navigationButton: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500 focus:outline-none focus:shadow-outline',
};


const InitialSurvey = () => {
  const router = useRouter();
  const [surveyJson, setSurveyJson] = useState<Model | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [incorrectCount, setIncorrectCount] = useState<string>('0/0');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<string>('');

  useEffect(() => {
    const fetchQuestions = async () => {
      const questions: { id: string; data: Question }[] = [];
      const q = query(collection(db, 'initialSurveyQuestions'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const questionData = doc.data() as Question;
        questionData.topic = doc.data().topic.toString();
        questionData.questionCategory = doc.data().questionCategory.toString();

        console.log('Question Category:', questionData.questionCategory);
        console.log('Question Topic:', questionData.topic);

        questions.push({ id: doc.id, data: questionData });
      });
      return questions;
    };

    Serializer.addProperty('question', { name: 'topic:string' });
    Serializer.addProperty('question', { name: 'questionCategory:string' });
    const formatQuestionsForSurveyJS = (questions: { id: string; data: Question }[]) => {
      return {
        showProgressBar: 'bottom',
        showPageNumbers: false, // Hide page numbers
        showPrevButton: false, // Hide previous button
        showPageTitles: false, // Hide page titles
        pages: questions.map((q, index) => ({
          name: `page${index + 1}`,
          elements: [
            {
              type: q.data.questionType,
              topic: q.data.topic,
              questionCategory: q.data.questionCategory,
              name: q.id,
              title: q.data.question,
              isRequired: false,
              ...(q.data.questionType === 'comment' && { maxLength: 400 }),
              ...(q.data.questionType === 'radiogroup' && {
                choices: Object.entries(q.data.choices || {})
                  .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                  .map(([key, value]) => ({
                    value: key,
                    text: value,
                  })),
                description: q.data.description,
              }),
              ...(q.data.visibilityCondition && {
                visibleIf: q.data.visibilityCondition,
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

        const { incorrect, total, points } = surveyJson.pages.reduce((count: any, page: any) => {
          return page.elements.reduce((pageCount: any, element: any) => {
            const questionId = element.name;
            const userAnswer = result ? result[questionId] : undefined;
            const answer = element.correctAnswer;
            const difficulty = element.data.difficulty;
            let isIncorrect = userAnswer !== answer;

            if (Array.isArray(userAnswer) && typeof answer === 'string') {
              isIncorrect = !userAnswer.includes(answer);
            }

            const userDocRef = doc(db, 'initialSurveyQuestions', questionId, 'users', userId);
            setDoc(userDocRef, {
              response: userAnswer !== undefined ? userAnswer : null,
              name: user.displayName || 'Anonymous',
            });

            const pointsForQuestion = isIncorrect ? 0 : difficulty === 'hard' ? 3 : difficulty === 'intermediate' ? 2 : 1;

            return {
              incorrect: isIncorrect ? pageCount.incorrect + 1 : pageCount.incorrect,
              total: pageCount.total + 1,
              points: pageCount.points + pointsForQuestion,
            };
          }, count);
        }, { incorrect: 0, total: 0, points: 0 });

        setTotalPoints(points);

        const level = points >= total * 2.5 ? 'hard' : points >= total * 1.5 ? 'intermediate' : 'beginner';
        setUserLevel(level);

        const correct = total - incorrect;
        setIncorrectCount(`${incorrect}/${total}`);

        queryUserDocument(userId).then((userDocRef) => {
          if (userDocRef) {
            return updateDoc(userDocRef.ref, {
              initialSurveyComplete: true,
              initialSurveyCorrectCount: correct,
              userLevel: level,
            });
          } else {
            console.log('No user document found');
          }
        }).then(() => {
          console.log('User document successfully updated');
          router.push('/demographicsurvey/survey');
        }).catch((error) => {
          console.error('Error updating documents: ', error);
        });
      }
    }
  }, [router, isComplete, surveyJson, result]);

  useEffect(() => {
    if (isComplete && result && surveyJson) {
      const responseString = surveyJson.pages.flatMap((page) =>
        page.elements.map((question: any) => {
  
          const questionData = question as {topic: string; questionCategory: string; title: string; name: string; choices?: any[]; correctAnswer?: string; description?: string;  };
          const userResponse = result[questionData.name] ?? 'User did not answer';
          let responseText;
          let correctAnswerText;

          if (questionData.choices) {
            const userResponseText = questionData.choices.find((choice: any) => choice.value === userResponse)?.text ?? 'No response provided';
            correctAnswerText = questionData.choices.find((choice: any) => choice.value === questionData.correctAnswer)?.text ?? 'No correct answer provided';
            responseText = userResponseText;
          } else {
            responseText = userResponse;
            correctAnswerText = questionData.correctAnswer ?? 'No correct answer provided';
          }

          return `Question Title: ${questionData.title},
            Question Category: ${questionData.questionCategory},
            Topic: ${questionData.topic},
            User Response: ${responseText},
            Question Choices: ${questionData.choices ? Object.values(questionData.choices).map((choice: any) => choice.text).join(', ') : 'None'},
            Question Description: ${questionData.description}`;
        })
      ).join('\n');

      determineProficiency(responseString)
        .then((proficiency) => {
          const proficiencyLevels = proficiency.split(', ');
          const topics = ['online_privacy', 'password_security', 'phishing', 'software_updates', 'two_factor_authentication'];
          const userDocRef = queryUserDocument(getAuth().currentUser?.uid || '');

          console.log('Proficiency levels:', proficiencyLevels);

          userDocRef.then((docRef) => {
            if (docRef) {
              topics.forEach((topic, index) => {
                const proficiencyRef = doc(collection(doc(db, 'users', docRef.id), 'proficiency'), topic);
                setDoc(proficiencyRef, {
                  proficiency: proficiencyLevels[index]?.trim() ?? '',
                });
              });
              console.log('Proficiency levels updated successfully.');
            }
          });
        })
        .catch((error) => {
          console.error('Error determining proficiency:', error);
          const proficiency = 'beginner, beginner, beginner, beginner, beginner';
          const proficiencyLevels = proficiency.split(', ');
          const topics = ['online_privacy', 'password_security', 'phishing', 'software_updates', 'two_factor_authentication'];
          const userDocRef = queryUserDocument(getAuth().currentUser?.uid || '');
          
          userDocRef.then((docRef) => {
            if (docRef) {
              topics.forEach((topic, index) => {
                const proficiencyRef = doc(collection(doc(db, 'users', docRef.id), 'proficiency'), topic);
                setDoc(proficiencyRef, {
                  proficiency: proficiencyLevels[index]?.trim() ?? '',
                });
              });
              console.log('Proficiency levels updated successfully.');
            }
          });
        });
    }
  }, [isComplete, result, surveyJson]);

  return (
    <div className="min-h-screen bg-gray-800 flex justify-center items-center">
      {surveyJson && (
        <div className="w-full max-w-4xl p-10 bg-gray-900 text-white rounded-lg shadow-lg">
          <Survey
            model={surveyJson}
            css={customCss}
          />
        </div>
      )}
      {isComplete && (
        <div className="text-white text-center mt-4">
          <div className="text-lg">Incorrect count: {incorrectCount}</div>
          <div className="text-lg">Total points: {totalPoints}</div>
          <div className="text-lg">User level: {userLevel}</div>
        </div>
      )}
    </div>
  );
      };

export default InitialSurvey;
