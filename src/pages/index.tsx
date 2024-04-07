import Head from "next/head";
import { BaseLayout } from "../components/layouts/baseLayout";
import { auth, db } from "../components/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import queryUserDocument, {
  numberOfTopicsCompleted,
} from "../components/firebase/firebase_functions";
import {
  DocumentData,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import CircularWithValueLabel from "~/components/ProgressCircle";
import { set } from "firebase/database";
import { jsPDF } from "jspdf";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface UserDocument extends DocumentData {
  initialSurveyComplete?: boolean;
  lastLoginDate?: { seconds: number };
  streakCount?: number;
}

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [userDocument, setUserDocument] = useState<UserDocument | null>(null);
  const [proficiencyRatio, setProficiencyRatio] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [topicsCompleted, setTopicsCompleted] = useState<number>(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [completedChapters, setCompletedChapters] = useState(0);
  const router = useRouter();

  // Get the user ID
  const uid = user ? user.uid : null;

  // Query for the user document from Firestore
  useEffect(() => {
    if (uid) {
      queryUserDocument(uid).then((userDoc: DocumentData | null) => {
        setUserDocument(userDoc as UserDocument);
      });
    }
  }, [uid]);

  // Check if the user has completed the initial survey, demographic survey and update the streak count. If not, redirect to the respective survey page
  useEffect(() => {
    if (userDocument) {
      if (!userDocument.data().initialSurveyComplete) {
        router.push("/initialsurvey/begin");
      } else if (!userDocument.data().demographicSurveyComplete) {
        router.push("/demographicsurvey/survey");
      } else {
        updateUserStreak(uid, userDocument.data().lastLoginDate);
      }
    }
  }, [userDocument, uid, router]);

  // Fetch the number of topics completed by the user by calling the function numberOfTopicsCompleted from firebase_functions.ts
  if (uid) {
    const getTopicsCompleted = async () => {
      const topicsNum = await numberOfTopicsCompleted(uid);
      setTopicsCompleted(topicsNum);
    };
    getTopicsCompleted();
  }

  // Load the proficiency ratio from local storage
  useEffect(() => {
    const savedRatio = localStorage.getItem("proficiencyRatio");
    if (savedRatio) {
      setProficiencyRatio(parseFloat(savedRatio));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("proficiencyRatio", proficiencyRatio.toString());
  }, [proficiencyRatio]);

  

  // Fetch the progress of the user for number of chapters completed
  useEffect(() => {
    if (userDocument && userDocument.id) {
      const progressRef = collection(db, `users/${userDocument.id}/progress`);
      getDocs(progressRef).then((snapshot) => {
        const totalDocuments = snapshot.size;
        const completedDocumentsCount = snapshot.docs.filter(
          (doc) => doc.data().complete === true,
        ).length;
        const ratio =
          totalDocuments > 0
            ? (completedDocumentsCount / totalDocuments) * 100
            : 0;
        setProficiencyRatio(ratio);
        setTotalChapters(totalDocuments);
        setCompletedChapters(completedDocumentsCount);
      });
    }
  }, [userDocument]);

  

  async function updateUserStreak(
    uid: string | null,
    lastLoginDate: { seconds: number } | undefined,
  ) {
    if (!uid || !userDocument) return;

    const userDocRef = doc(db, "users", userDocument.id);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let newStreakCount = userDocument.streakCount || 0;
    let shouldUpdateFirebase = false;

    if (lastLoginDate) {
      const lastLogin = new Date(lastLoginDate.seconds * 1000);
      lastLogin.setHours(0, 0, 0, 0);
      const diffInDays =
        (currentDate.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24);

      if (diffInDays >= 1 && diffInDays < 2) {
        newStreakCount += 1;
        shouldUpdateFirebase = true;
      } else if (diffInDays >= 2) {
        newStreakCount = 0;
        shouldUpdateFirebase = true;
      }
    } else {
      newStreakCount = 1;
      shouldUpdateFirebase = true;
    }

    setStreakCount(newStreakCount);

    if (shouldUpdateFirebase) {
      await updateDoc(userDocRef, {
        lastLoginDate: currentDate,
        streakCount: newStreakCount,
      });
    }
  }

  // Function to create the UI of the certificate and download it as a PDF

  function downloadCertificate(userName: any) {

    // Create the UI of the certificate
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(30);
    doc.setTextColor(60, 60, 60);
    doc.text("Certificate of Completion", 105, 40, { align: "center" });

    doc.setFontSize(20);
    doc.text(`Congratulations, ${userName}!`, 105, 60, { align: "center" });

    doc.setFontSize(16);
    doc.text("You have successfully completed Cyber Tutor.", 105, 80, {
      align: "center",
    });

    // Save the Certificate as a PDF
    doc.save("CyberTutor_Certificate.pdf");
  }

  return (
    <>
      <Head>
        <title>Cyber Tutor</title>
        <meta name="description" content="Cyber Tutor" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="flex min-h-screen w-full flex-col">
        {user ? (

          // If user is logged in, show the dashboard with their progress information
          <BaseLayout>
            <div className="bg-white">
              <div className="mx-auto max-w-xl px-4 pb-8 pt-12">
                <h1 className="text-center text-2xl font-bold text-gray-800">
                  <i className="fas fa-shield-alt mr-2 text-indigo-500"></i>
                  Ready to fortify your digital life and stay protected?
                </h1>
                <p className="mt-4 text-center text-lg text-gray-600">
                  <i className="fas fa-list-ul mr-2 text-gray-400"></i>
                  Select a topic from the menu.
                </p>
                <div className="mt-6 text-center">
                  <span className="text-xl font-semibold text-gray-800">
                    <i className="fas fa-chart-line mr-2 text-green-500"></i>
                    Progress:
                  </span>
                  <br />
                  Topics Complete: {topicsCompleted} / 5
                  <br />
                  Chapters Complete: {completedChapters} / {totalChapters}
                  <br />
                  <br />
                  <CircularWithValueLabel value={proficiencyRatio} size={80} />
                </div>

                {topicsCompleted === 5 && (
                  <div className="text-center">
                    <p>
                      Congratulations on completing Cyber Tutor!!! You can now
                      download your certificate.
                    </p>
                    <button
                      className="mt-4 rounded-lg bg-blue-700 px-6 py-3 font-bold text-white shadow-lg transition duration-150 ease-in-out hover:bg-blue-800"
                      onClick={() =>
                        downloadCertificate(userDocument?.data().name || "User")
                      }
                    >
                      Download Certificate
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center">
                  {streakCount > 0 ? (
                    <span className="text-xl font-semibold text-green-600">
                      <i className="fas fa-fire mr-2"></i>
                      Streak: {streakCount} day(s)
                    </span>
                  ) : (
                    <span className="text-lg text-gray-600">
                      <i className="fas fa-clock mr-2 text-blue-500"></i>
                      Start your streak by logging in daily.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </BaseLayout>
        ) : (

          // If user is not logged in, show the landing page with the introduction video
          <div className="flex grow flex-col items-center justify-center bg-gray-200 p-4 text-gray-900">
            {typeof window !== "undefined" && (
              <ReactPlayer
                url="https://youtu.be/027hGcCeoHc"
                playing={false}
                controls={true}
                className="mb-8 max-w-full rounded-lg shadow-2xl"
              />
            )}
            <p className="mx-auto mt-8 rounded-lg bg-white p-4 text-center text-xl font-semibold shadow-lg md:text-2xl lg:w-1/2">
              Welcome to CyberTutor! Dive into the world of cyber security and
              fortify your digital life today. Explore our curated video series
              to become a savvy internet user and protect yourself against
              online threats.
            </p>
            <div className="mt-10 flex space-x-6">
              <button
                className="rounded-lg bg-blue-700 px-6 py-3 font-bold text-white shadow-lg transition duration-150 ease-in-out hover:bg-blue-800"
                onClick={() => router.push("/users/sign-up")}
              >
                Register
              </button>
              <button
                className="rounded-lg bg-green-700 px-6 py-3 font-bold text-white shadow-lg transition duration-150 ease-in-out hover:bg-green-800"
                onClick={() => router.push("/users/sign-in")}
              >
                Login
              </button>
            </div>
          </div>
        )}
        <footer className="w-full border-t border-gray-300 bg-white py-4 text-center text-gray-900">
          <div className="mx-auto px-4">
            <p>&copy; 2024 Cyber Tutor. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
