import React from "react";
import { useRouter } from "next/router";

export default function InitialSurvey() {
  const router = useRouter();

  const handleRouter = async () => {
    try {
      await router.push("/initialsurvey/survey");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-800">
      <div className="animate-fadeIn text-center">
        <h1 className="mb-4 text-3xl text-white">
          Let&apos;s get to know how much cyber security you know
        </h1>
        <button
          onClick={handleRouter}
          className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          type="button"
        >
          Start
        </button>
      </div>
    </div>
  );
}
