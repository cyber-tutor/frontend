import { Survey, Model } from "survey-react";
import "survey-react/modern.min.css";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "./firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  findUserDocId,
  increaseLevel,
} from "~/components/firebase/firebase_functions";
import { useRouter } from "next/router";
import { button, user } from "@nextui-org/react";

interface Question {
  question: string;
  choices: Record<string, string>;
  answer: string;
  chapterId: string;
  difficulty: string;
}

interface DynamicSurveyProps {
  chapterId: string;
  userId: string;
}

const DynamicSurvey = ({ chapterId, userId }: DynamicSurveyProps) => {
  const [surveyJson, setSurveyJson] = useState<Model>(new Model({}));
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>(
    {},
  );
  const [userFailed, setUserFailed] = useState<boolean>(false);
  const startTimeRef = useRef<Date | null>(null);

  const router = useRouter();
  const { topic: topicId } = router.query;

  useEffect(() => {
    const fetchQuestions = async () => {
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      const userDocId = await findUserDocId(uid ? uid : "");
      if (!userDocId) return;

      const proficiencyDocRef = doc(
        db,
        "users",
        userDocId,
        "proficiency",
        String(topicId),
      );
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
        where("difficulty", "==", proficiency),
      );
      const querySnapshot = await getDocs(q);

      const allQuestions: Question[] = [];
      querySnapshot.forEach((doc) => {
        const questionData = doc.data() as Question;
        allQuestions.push(questionData);
      });

      // Randomly select 10 questions
      const selectedQuestions = allQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);

      const correctAnswers: Record<string, string> = {};
      selectedQuestions.forEach((question, index) => {
        correctAnswers[`question${index + 1}`] = question.answer;
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
            questions: questions.map((q, index) => {
              const sortedChoices = ["a", "b", "c", "d"].map((key) => ({
                // Assuming these are all the keys that can exist
                value: key,
                text: q.choices[key],
              }));
              return {
                type: "radiogroup",
                name: `question${index + 1}`,
                title: q.question,
                // title: `${q.question} (Difficulty: ${q.difficulty})`,
                isRequired: true,
                choices: sortedChoices,
              };
            }),
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

  // useEffect(() => {
  //   console.log("Correct Answers:", correctAnswers);
  // }, [correctAnswers]);

  const calculateResults = (
    results: Record<string, string>,
    correctAnswers: Record<string, string>,
  ) => {
    let correctCount = 0;
    Object.entries(results).forEach(([key, userChoiceKey]) => {
      if (correctAnswers[key] === userChoiceKey) {
        correctCount++;
      }
      console.log("User choice Key: ", userChoiceKey);
    });
    const totalQuestions = Object.keys(correctAnswers).length;
    const percentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const resultMessage = percentage >= 70 ? "User passed" : "User failed";
    return { percentage, resultMessage };
  };

  const updateUserProgress = async (
    score: number,
    passed: boolean,
    timeElapsed: number,
  ) => {
    const { chapterId: String } = router.query;

    console.log("Chapter ID: ", chapterId);

    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    const userDocId = await findUserDocId(user.uid);
    if (!userDocId) {
      console.error("User document ID not found");
      return;
    }

    const progressDocRef = doc(db, "users", userDocId, "progress", chapterId);
    const progressDocSnapshot = await getDoc(progressDocRef);
    const progressData = progressDocSnapshot.data();

    let currentAttempts =
      progressData && progressData.attempts
        ? Object.keys(progressData.attempts).length
        : 0;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = Math.floor(timeElapsed % 60);
    const formattedTimeElapsed = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const newAttemptKey = `attempts.attempt${currentAttempts + 1}`;
    const attemptUpdate = {
      [newAttemptKey]: {
        score: score,
        timeElapsed: formattedTimeElapsed,
      },
    };

    try {
      await setDoc(progressDocRef, attemptUpdate, { merge: true });
      if (passed && (!progressData || !progressData.complete)) {
        await setDoc(progressDocRef, { complete: true }, { merge: true });
        await increaseLevel(
          progressData ? progressData.topicId : (topicId as string),
          userDocId,
        );
      }
    } catch (error) {
      console.error("Error updating user progress:", error);
    }
  };

  return (
    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
      <div className="mt-[-2rem] w-full max-w-2xl rounded-md bg-white p-6">
        <Survey
          model={surveyJson}
          onComplete={(result: {
            data: Record<string, string>;
            completedHtml: string;
            renderCompleted: () => void;
          }) => {
            const { percentage, resultMessage } = calculateResults(
              result.data,
              correctAnswers,
            );
            const endTime = new Date();
            const timeElapsed =
              (endTime.getTime() -
                (startTimeRef.current?.getTime() || endTime.getTime())) /
              1000;

            const completionMessage = `<h3>Assessment Finished</h3><h4>You scored ${percentage.toFixed(2)}% (${resultMessage.replace("User", "You")}).</h4>`;
            result.completedHtml = completionMessage; 


            if (resultMessage === "User passed") {
              alert(`You passed with a score of ${percentage.toFixed(2)}%`);
              updateUserProgress(percentage, true, timeElapsed).then(() => {
                router.push(`/topics/${topicId}`);
              });
            } else {
              alert(`You failed with a score of ${percentage.toFixed(2)}%`);
              updateUserProgress(percentage, false, timeElapsed);
              setUserFailed(true);
            }
          }}
        />

        {userFailed && (
          <div className="flex items-center justify-center">
            <button
              onClick={() => {
                router.reload();
              }}
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicSurvey;
