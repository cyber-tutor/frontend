import Head from "next/head";
import { BaseLayout } from "../components/layouts/BaseLayout";
import { auth, db } from "../components/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import queryUserDocument, {
  numberOfTopicsCompleted,
} from "../components/firebase/FirebaseFunctions";
import {
  DocumentData,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import CircularWithValueLabel from "~/components/ui/ProgressCircle";
import { set } from "firebase/database";
import { jsPDF } from "jspdf";
import { FaNewspaper } from "react-icons/fa";

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
  const [hasReadToday, setHasReadToday] = useState(false);
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
    if (userDocument?.lastReadTime) {
      const lastReadTime = new Date(userDocument.lastReadTime.seconds * 1000);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - lastReadTime.getTime();
      const hoursDifference = timeDifference / (1000 * 3600);

      if (hoursDifference < 24) {
        setHasReadToday(true);
      } else {
        setHasReadToday(false);
      }
    } else {
      setHasReadToday(false);
    }
  }, [uid]);

  useEffect(() => {
    if (userDocument?.lastReadTime) {
      const lastReadTime = new Date(userDocument.lastReadTime.seconds * 1000);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - lastReadTime.getTime();
      const hoursDifference = timeDifference / (1000 * 3600);

      if (hoursDifference < 24) {
        setHasReadToday(true);
      } else {
        setHasReadToday(false);
      }
    } else {
      setHasReadToday(false);
    }
  }, [userDocument?.lastReadTime]);

  // Check if the user has completed the initial survey, demographic survey and update the streak count. If not, redirect to the respective survey page
  useEffect(() => {
    if (userDocument) {
      const lastLoginDate = new Date(
        userDocument?.lastLoginDate?.seconds
          ? userDocument?.lastLoginDate.seconds
          : 0 * 1000,
      );
      const today = new Date();
      const hasRead = lastLoginDate.toDateString() === today.toDateString();
      setHasReadToday(hasRead);

      if (!hasRead) {
        updateUserStreak(userDocument.id, userDocument.lastLoginDate);
      }
    }
  }, [userDocument]);

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
      } else if (diffInDays < 1) {
        return;
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
        lastReadTime: currentDate,
        streakCount: newStreakCount,
      });
    }
  }
  // Update the read streak count for the user

  async function updateReadStreak() {
    if (!uid || !userDocument) return;

    const userDocRef = doc(db, "users", userDocument.id);
    const currentTime = new Date();

    let newStreakCount = userDocument.streakCount || 0;
    newStreakCount += 1;

    await updateDoc(userDocRef, {
      lastReadTime: currentTime,
      streakCount: newStreakCount,
    });

    setStreakCount(newStreakCount);
    setHasReadToday(true);
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
      </Head>
      <div className="flex w-full flex-col ">
        {user ? (
          // If user is logged in, show the dashboard with their progress information
          <BaseLayout>
            <motion.div
              className="  mt-20 bg-white md:mt-16 lg:mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.div className="mx-auto max-w-xl px-4 pb-8  pt-12">
                <motion.h1 className="text-center text-2xl font-bold text-gray-800">
                  <i className="fas fa-shield-alt mr-2 text-indigo-500"></i>
                  Ready to fortify your digital life and stay protected?
                </motion.h1>
                <motion.p className="mt-4 text-center text-lg text-gray-600">
                  <i className="fas fa-list-ul mr-2 text-gray-400"></i>
                  Select a topic from the menu.
                </motion.p>
                <motion.div className="mt-6 text-center">
                  <motion.span className="text-xl font-semibold text-gray-800">
                    <i className="fas fa-chart-line mr-2 text-green-500"></i>
                    Progress:
                  </motion.span>
                  <br />
                  Topics Complete: {topicsCompleted} / 5
                  <br />
                  Chapters Complete: {completedChapters} / {totalChapters}
                  <br />
                  <br />
                  <CircularWithValueLabel value={proficiencyRatio} size={80} />
                </motion.div>

                {topicsCompleted === 5 && (
                  <motion.div className="text-center">
                    <motion.p>
                      Congratulations on completing Cyber Tutor!!! You can now
                      download your certificate.
                    </motion.p>
                    <motion.button
                      className="mt-4 rounded-lg bg-blue-700 px-6 py-3 font-bold text-white shadow-lg transition duration-150 ease-in-out hover:bg-blue-800"
                      onClick={() =>
                        downloadCertificate(userDocument?.data().name || "User")
                      }
                    >
                      Download Certificate
                    </motion.button>
                  </motion.div>
                )}

                <motion.div className="mt-4 text-center">
                  {streakCount > 0 ? (
                    <motion.span className="text-xl font-semibold text-green-600">
                      <i className="fas fa-fire mr-2"></i>
                      Streak: {streakCount} day(s)
                    </motion.span>
                  ) : (
                    <motion.span className="text-lg text-gray-600">
                      <i className="fas fa-clock mr-2 text-blue-500"></i>
                      Start your streak by logging in daily.
                    </motion.span>
                  )}
                </motion.div>

                {/* {hasReadToday ? (
                  <p>You have already read an article today.</p>
                ) : ( */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      updateReadStreak();
                      updateUserStreak(
                        userDocument?.id,
                        userDocument?.lastReadTime,
                      );
                      router.push("/news/content");
                    }}
                    className="button-class mt-5 flex items-center justify-center rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  >
                    <FaNewspaper className="mr-2 h-6 w-6" />
                    Read an Article
                  </button>
                </div>

                {/* )} */}
              </motion.div>
            </motion.div>
          </BaseLayout>
        ) : (
          // If user is not logged in, show the landing page with the introduction video

          <motion.div
            className="flex grow flex-col items-center justify-center bg-gray-200 p-4 text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {typeof window !== "undefined" && (
              <ReactPlayer
                url="https://youtu.be/027hGcCeoHc"
                playing={false}
                controls={true}
                className="mb-8 max-w-full rounded-lg shadow-2xl"
              />
            )}
            <motion.p
              className="mx-auto mt-8 rounded-lg bg-white p-4 text-center text-xl font-semibold shadow-lg md:text-2xl lg:w-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to CyberTutor! Dive into the world of cyber security and
              fortify your digital life today. Explore our curated video series
              to become a savvy internet user and protect yourself against
              online threats.
            </motion.p>
            <motion.div
              className="mt-10 flex space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}
