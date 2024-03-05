import Head from "next/head";
import { BaseLayout } from "./layouts/baseLayout";
import { auth } from "./firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";


const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function Home() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <>
      <Head>
        <title>Cyber Tutor</title>
        <meta name="description" content="Cyber Tutor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BaseLayout>
        {user ? (
          <p>Select a topic from the menu.</p>
        ) : (
          <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-center items-center">
            {typeof window !== 'undefined' && (
              <ReactPlayer 
                url="https://www.youtube.com/watch?v=8BoovULyJeg&list=PLVEnBuMmQvXukhIgRrTIwOxWBoLwYYL0A" 
                playing={true} 
                controls={true} 
                className="max-w-full rounded-lg shadow-xl"
              />
            )}
            <p className="mt-8 text-center text-xl md:text-2xl font-semibold">
              Welcome to CyberTutor! Dive into the world of cyber security and fortify your digital life today. 
              Explore our curated video series to become a savvy internet user and protect yourself against online threats.
            </p>
          </div>
        )}
      </BaseLayout>
    </>
  );
}
