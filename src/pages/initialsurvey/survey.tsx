import React, { useState, useEffect } from 'react';
import { Survey, Model } from 'survey-react';
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '~/components/firebase/config';
import 'survey-react/survey.css';
import { StylesManager } from 'survey-react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import queryUserDocument from '~/components/firebase/firebase_functions';
import determineProficiency from '~/components/ai/gemini';

StylesManager.applyTheme('default');

interface Question {
  question: string;
  questionCategory: string;
  questionType: string;
  choices?: Record<string, string>;
  difficulty?: string;
  explanation?: string;
  description: string;
  visibilityCondition?: string;
  topic: string;
}

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
        console.log("Question type: ",questionData.questionCategory);
        questions.push({ id: doc.id, data: questionData });
      });
      return questions;
    };

    const formatQuestionsForSurveyJS = (
      questions: { id: string; data: Question }[],
    ) => {
      return {
        showProgressBar: 'bottom',
        pages: questions.map((q, index) => ({
          name: `page${index + 1}`,
          elements: [
            {
              type: q.data.questionType,
              name: q.id,
              title: q.data.question,
              isRequired: false,
              topic: q.data.topic,
              category: q.data.questionCategory,
           
              
            
              ...(q.data.questionType === 'comment' && { maxLength: 400 }),
              ...(q.data.questionType === 'radiogroup' && {
                choices: Object.entries(q.data.choices || {}).map(
                  ([key, value]) => ({
                    value: key,
                    text: value,
                  }),
                ),
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

        const { incorrect, total, points } = surveyJson.pages.reduce(
          (count: any, page: any) => {
            return page.elements.reduce((pageCount: any, element: any) => {
              const questionId = element.name;
              const userAnswer = result ? result[questionId] : undefined;
              const answer = element.correctAnswer;
              const difficulty = element.difficulty;
              let isIncorrect = userAnswer !== answer;

              if (Array.isArray(userAnswer) && typeof answer === 'string') {
                isIncorrect = !userAnswer.includes(answer);
              }

              const userDocRef = doc(
                db,
                'initialSurveyQuestions',
                questionId,
                'users',
                userId,
              );
              setDoc(userDocRef, {
                response: userAnswer !== undefined ? userAnswer : null,
                name: user.displayName || 'Anonymous',
              });

              const pointsForQuestion = isIncorrect
                ? 0
                : difficulty === 'hard'
                ? 3
                : difficulty === 'intermediate'
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
            ? 'hard'
            : points >= total * 1.5
            ? 'intermediate'
            : 'beginner';
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
              console.log('No user document found');
            }
          })
          .then(() => {
            console.log('User document successfully updated');
            router.push('/');
          })
          .catch((error) => {
            console.error('Error updating documents: ', error);
          });
      }
    }
  }, [router, isComplete, surveyJson, result]);

  const formatSurveyForGemini = (surveyJson: Model, userResponses: any) => {
    if (!surveyJson || !surveyJson.pages) {
      return 'Survey data is not available.';
    }
  
    const questionsAndResponses = surveyJson.pages.flatMap((page) =>
      page.elements.map((question: any) => {
        const questionText = question.title;
        const userResponse = userResponses[question.name] ?? 'User did not answer';
        let responseText;
        let correctAnswerText;
  
        if (question.type === 'radiogroup' && question.choices) {
          const userResponseText = question.choices.find((choice: any) => choice.value === userResponse)?.text ?? 'No response provided';
          const correctAnswerText = question.choices.find((choice: any) => choice.value === question.correctAnswer)?.text ?? 'No correct answer provided';
          const allChoices = question.choices.map((choice: any) => choice.text).join(', ');
          responseText = userResponseText;
          return `${questionText} The User chose: [${allChoices}] User chose: ${responseText}, Correct Answer is: ${correctAnswerText}`;
        } else {
          responseText = userResponse;
          correctAnswerText = question.correctAnswer ?? 'No correct answer provided';
          const allChoices = question.choices ? question.choices.map((choice: any) => choice.text).join(', ') : 'There are no choices for this question, because its open ended.';
          return `Question Title: ${questionText},
          Question Category: ${question.category}, 
          Topic: ${question.topic},
          Question Choices: ${allChoices}, 
          User chose: ${responseText}, 
          Question description: ${question.description},
          `;

        }
      })
    );
  
    return questionsAndResponses.join(', ');
  };  

  useEffect(() => {
    if (isComplete && result && surveyJson) {
      const responseString = formatSurveyForGemini(surveyJson, result);
      determineProficiency(responseString).then((proficiency) => {
        console.log('User result:', result);
        console.log('Determined proficiency:', proficiency);
        const proficiencyArray = proficiency.slice(1, -1).split(',');
        console.log(proficiencyArray);

        const user = getAuth().currentUser;

        const topics = [
          'online_privacy',
          'password_security',
          'phishing',
          'software_updates',
          'two_factor_authentication',
        ];

        queryUserDocument(user?.uid ? user.uid : '').then((userDocRef) => {
          updateProficiencyLevels(userDocRef?.ref.id, proficiencyArray, topics);
        });
      }).catch((error) => {

        // If there is an error, set all proficiencies to beginner
        console.error('Error determining proficiency:', error);
        const proficiencyArray = ['beginner', 'beginner', 'beginner', 'beginner', 'beginner'];
        const user = getAuth().currentUser;

        const topics = [
          'online_privacy',
          'password_security',
          'phishing',
          'software_updates',
          'two_factor_authentication',
        ];

        queryUserDocument(user?.uid ? user.uid : '').then((userDocRef) => {
          updateProficiencyLevels(userDocRef?.ref.id, proficiencyArray, topics);
        });
      });
    }
  }, [isComplete, result, surveyJson]);

  const updateProficiencyLevels = async (
    userId: string,
    proficiencyArray: string[],
    topics: string[],
  ) => {
    try {
      proficiencyArray.forEach(async (level, index) => {
        const topicId = topics[index];
        const proficiencyRef = doc(
          collection(doc(db, 'users', userId), 'proficiency'),
          topicId,
        );
        await setDoc(proficiencyRef, {
          level: level.trim(),
        });
      });
      console.log('Proficiency levels updated successfully.');
    } catch (error) {
      console.error('Error updating proficiency levels:', error);
    }
  };

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