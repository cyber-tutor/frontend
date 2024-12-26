import React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Head from "next/head";

export default function InitialSurvey() {
  const router = useRouter();

  const handleRouter = () => {
    router.push("/pre_screening/initial_survey");
  };

  return (
    <motion.div
      className="flex h-screen items-center justify-center bg-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Head>
        <title>Initial Cyber Security Survey</title>
      </Head>
      <motion.div
        className="animate-fadeIn text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h1 className="mb-4 text-3xl text-white">
          Let&apos;s start by assessing how much cyber security you know
        </h1>
        <motion.button
          onClick={handleRouter}
          className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Start Survey
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
