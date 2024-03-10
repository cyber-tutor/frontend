import Head from "next/head";
import { BaseLayout } from "./layouts/baseLayout";
import { auth } from "./firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import queryUserDocument from "./firebase/firebase_functions";
import { DocumentData } from "firebase/firestore";
import { useRouter } from "next/router";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [userDocument, setUserDocument] = useState<DocumentData | null>(null);
  const router = useRouter();

  const uid = user ? user.uid : null;

  console.log("User Id:", uid);

  // If user is logged in, query and retreive the reference to their document in the users collection in firestore
  if (uid) {
    queryUserDocument(uid).then((userDocument) => {
      console.log("User Document:", userDocument?.data());

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
        <BaseLayout showSidebar={true}>
          <p>Select a topic from the menu.</p>
        </BaseLayout>
      ) : (
        <BaseLayout showSidebar={false}>
  <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
    <div className="w-full max-w-4xl px-4 py-8 bg-white bg-opacity-90 rounded-xl shadow-2xl">
      {/* Responsive container */}
      {typeof window !== "undefined" && (
        <ReactPlayer
          url="https://www.youtube.com/watch?v=8BoovULyJeg&list=PLVEnBuMmQvXukhIgRrTIwOxWBoLwYYL0A"
          playing={false}
          controls={true}
          width="100%"
          height="100%"
          className="aspect-video rounded-lg shadow-xl"
        />
      )}
    </div>
    <p className="mt-8 text-center text-xl font-semibold md:text-2xl lg:text-3xl">
      Welcome to CyberTutor! Dive into the world of cyber security and
      fortify your digital life today. Explore our curated video series
      to become a savvy internet user and protect yourself against
      online threats.
    </p>
    <div className="mt-8 flex space-x-4">
      <button
        className="rounded-lg bg-blue-700 px-6 py-3 font-bold text-white transition duration-150 ease-in-out hover:bg-blue-800"
        onClick={() => router.push("/users/sign-in")}
      >
        Register
      </button>
      <button
        className="rounded-lg bg-green-700 px-6 py-3 font-bold text-white transition duration-150 ease-in-out hover:bg-green-800"
        onClick={() => router.push("/users/sign-up")}
      >
        Login
      </button>
    </div>
  </div>
</BaseLayout>

      )}
    </>
  );
}
