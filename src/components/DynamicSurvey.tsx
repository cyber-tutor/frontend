import { Survey, Model } from "survey-react";
import "survey-react/modern.min.css";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "./firebase/config";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { findUserDocId, increaseLevel } from "~/components/firebase/firebase_functions";
import { useRouter } from "next/router";

interface Question {
  question: string;
  choices: Record<string, string>;
  correctAnswer: string;
  chapterId: string;
  difficulty: string;
}

interface DynamicSurveyProps {
  chapterId: string;
  userId: string; 
}

const DynamicSurvey = ({ chapterId, userId }: DynamicSurveyProps) => {
  const [surveyJson, setSurveyJson] = useState<Model>(new Model({}));
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>({});
  const startTimeRef = useRef<Date | null>(null);

  const router = useRouter();
  const { topic: topicId } = router.query;

  useEffect(() => {
    const fetchQuestions = async () => {
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      const userDocId = await findUserDocId(uid ? uid : "");
      if (!userDocId) return;

      const proficiencyDocRef = doc(db, "users", userDocId, "proficiency", String(topicId));
      const proficiencyDocSnapshot = await getDoc(proficiencyDocRef);
      const proficiencyData = proficiencyDocSnapshot.data();
      console.log("Proficiency data:", proficiencyData?.proficiency);

      let proficiency = "beginner";
      if (proficiencyData && proficiencyData.proficiency) {
        proficiency = proficiencyData.proficiency;
        console.log("User proficiency:", proficiency);
      }

      const q = query(
        collection(db, "quizQuestions"),
        where("chapterId", "==", chapterId),
        where("difficulty", "==", proficiency)
      );
      const querySnapshot = await getDocs(q);

      const allQuestions: Question[] = [];
      querySnapshot.forEach((doc) => {
        const questionData = doc.data() as Question;
        allQuestions.push(questionData);
      });

      // Randomly select 10 questions
      const selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

      const correctAnswers: Record<string, string> = {};
      selectedQuestions.forEach((question, index) => {
        correctAnswers[`question${index + 1}`] = question.correctAnswer;
        console.log(`Question: ${question.question}, Difficulty: ${question.difficulty}`);
      });

      setCorrectAnswers(correctAnswers);
      return selectedQuestions;
    };

    console.log("Chapter ID:", chapterId);
    const formatQuestionsForSurveyJS = (questions: Question[]) => {
      return {
        title: "Chapter Assessment",
        showProgressBar: "bottom",
        pages: [
          {
            questions: questions.map((q, index) => ({
              type: "radiogroup",
              name: `question${index + 1}`,
              title: q.question,
              isRequired: true,
              choices: Object.entries(q.choices).map(([key, value]) => ({
                value: key,
                text: value,
              })),
            })),
          },
        ],
      };
    };

    fetchQuestions().then((questions) => {
      if (questions) {
        const formattedQuestions = formatQuestionsForSurveyJS(questions);
        setSurveyJson(new Model(formattedQuestions));
        startTimeRef.current = new Date();
      }
    });
  }, [chapterId, userId]);

  const calculateResults = (results: Record<string, string>) => {
    let correctCount = 0;
    Object.entries(results).forEach(([key, value]) => {
      if (correctAnswers[key] === value) {
        correctCount++;
      }
    });
    const totalQuestions = Object.keys(correctAnswers).length;
    const percentage = (correctCount / totalQuestions) * 100;
    const resultMessage = percentage >= 70 ? "User passed" : "User failed";
    return { percentage, resultMessage };
  };

  const updateUserProgress = async (score: number, passed: boolean, timeElapsed: number) => {
    const userDocId = await findUserDocId(userId);
    if (userDocId) {
      const progressDocRef = doc(db, "users", userDocId, "progress", chapterId);
      const progressDocSnapshot = await getDoc(progressDocRef);

      let currentAttempts = 0;
      if (progressDocSnapshot.exists()) {
        currentAttempts = Object.keys(progressDocSnapshot.data().attempts || {}).length;
      }

      const minutes = Math.floor(timeElapsed / 60);
      const seconds = Math.floor(timeElapsed % 60);
      const formattedTimeElapsed = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const newAttemptKey = `attempt${currentAttempts + 1}`;
      const updateData: Record<string, any> = {
        [`attempts.${newAttemptKey}`]: {
          score: score,
          timeElapsed: formattedTimeElapsed,
        },
      };

      if (progressDocSnapshot.exists()) {
        if (passed && !progressDocSnapshot.data().complete) {
          updateData.complete = true;
          await increaseLevel(userDocId, progressDocSnapshot.data().topicId);
        }
      }

      await updateDoc(progressDocRef, updateData);
    } else {
      console.error("User document not found");
    }
  };

  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg shadow-xl border border-gray-200">
    <div className="w-full max-w-2xl p-6 bg-white rounded-md mt-[-2rem]">
        <Survey
          model={surveyJson}
          onComplete={(result: Model) => {
            const { percentage, resultMessage } = calculateResults(result.data);
            const endTime = new Date();
            const timeElapsed = (endTime.getTime() - (startTimeRef.current?.getTime() || endTime.getTime())) / 1000;
  
            if (resultMessage === "User passed") {
              alert(`You passed with a score of ${percentage.toFixed(2)}%`);
              updateUserProgress(percentage, true, timeElapsed);
            } else {
              alert(`You failed with a score of ${percentage.toFixed(2)}%`);
              updateUserProgress(percentage, false, timeElapsed);
            }
          }}
         
        />
      </div>
    </div>
  );
  
};

export default DynamicSurvey;
