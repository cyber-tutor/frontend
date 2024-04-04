import Head from "next/head";
import { BaseLayout } from "../components/layouts/baseLayout";
import { auth } from "../components/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import queryUserDocument from "../components/firebase/firebase_functions";
import { DocumentData } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [userDocument, setUserDocument] = useState<DocumentData | null>(null);
  const router = useRouter();

  const uid = user ? user.uid : null;

  console.log("User Id:", uid);

  // If user is logged in, query and retrieve the reference to their document in the users collection in firestore
  if (uid) {
    queryUserDocument(uid).then((userDocument) => {
      setUserDocument(userDocument);
    });
  }

  // Check if user completed initial survey, if not then redirect to initial survey
  if (userDocument && !userDocument.data().initialSurveyComplete) {
    router.push("/initialsurvey/begin");
  }

  return (
    <>
      <Head>
        <title>Cyber Tutor</title>
        <meta name="description" content="Cyber Tutor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {user ? (
        <BaseLayout>
          <p>Select a topic from the menu.</p>
        </BaseLayout>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 p-4 text-gray-900">
          {typeof window !== "undefined" && (
            <ReactPlayer
              url="https://www.youtube.com/watch?v=8BoovULyJeg&list=PLVEnBuMmQvXukhIgRrTIwOxWBoLwYYL0A"
              playing={false}
              controls={true}
              className="mb-8 max-w-full rounded-lg shadow-2xl"
            />
          )}
          <p className="mx-auto mt-8 rounded-lg bg-white p-4 text-center text-xl font-semibold shadow-lg  md:text-2xl lg:w-1/2">
            Welcome to CyberTutor! Dive into the world of cyber security and
            fortify your digital life today. Explore our curated video series to
            become a savvy internet user and protect yourself against online
            threats.
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

          <footer className="mt-auto w-full border-t border-gray-300 bg-white py-4 text-center text-gray-900">
            <div className="container mx-auto flex flex-col items-center justify-between space-y-4 px-4 md:flex-row md:space-y-0">
              <p>&copy; 2024 Cyber Tutor. All rights reserved.</p>
              <nav>
                <ul className="flex space-x-4">
                 
                </ul>
              </nav>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
