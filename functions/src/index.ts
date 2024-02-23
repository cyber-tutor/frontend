// MQ: Any commented code and documentation was here to begin with. I'll remove later once I understand what needs to be here and what doesn't after setting up Firebase Cloud Functions.

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

// Self-explanatory. This function fetches the topics from Firestore.
// Why this, instead of setting rules to have read = true? Because we don't want those annoying reminder emails, and more importantly, we don't want to expose our database to the public. Now we can have strict rules and still fetch the data.
export const getTopics = functions.https.onRequest(
  async (request, response) => {
    // CORS headers, blah, blah, blah.
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET");

    try {
      // This fetches the "topics" document from the "cyber-tutor" collection.
      const topicsDocSnapshot = await admin
        .firestore()
        .collection("cyber-tutor")
        .doc("topics")
        .get();

      if (!topicsDocSnapshot.exists) {
        response
          .status(404)
          .send("uh oh, the topics document was not found 🦧");
        return;
      }

      const topicsData = topicsDocSnapshot.data();

      // This transforms the topics data into a format that we can use on our frontend.
      const topicsArray = Object.keys(topicsData || {}).map((topicKey) => {
        const topic = topicsData?.[topicKey];

        // More complex transformations are needed for controlGroup and experimentalGroup chapterContent.
        // Why? Because the way we had it before was that we originally structured our data using keys for each chapter (dictionary), and we were mapping this in parallel to the chapters array.
        // So basically, we are taking the parallel structure of controlGroup and experimentalGroup, including it's nested contents, and transforming it into the chapters array.
        const chaptersArray = Object.keys(topic.chapters || {}).map(
          (chapterKey) => {
            const chapter = topic.chapters[chapterKey];
            const controlContent =
              topic.controlGroup && topic.controlGroup[chapterKey]
                ? topic.controlGroup[chapterKey].chapterContent
                : null;
            const chapterPrompt =
              topic.experimentalGroup && topic.experimentalGroup[chapterKey]
                ? topic.experimentalGroup[chapterKey].chapterPrompt
                : null;
            const experimentalContent =
              topic.experimentalGroup && topic.experimentalGroup[chapterKey]
                ? topic.experimentalGroup[chapterKey].chapterContent
                : null;

            // This is the structure of the chapters array that will be sent to our frontend.
            return {
              chapterId: chapterKey,
              chapterTitle: chapter.chapterTitle,
              chapterDescription: chapter.chapterDescription,
              chapterType: chapter.chapterType,
              controlGroupContent: controlContent,
              chapterPrompt: chapterPrompt,
              experimentalGroupContent: experimentalContent,
            };
          },
        );

        // This is the structure of the topics array that will be sent to our frontend.
        return {
          topicId: topicKey,
          topicTitle: topic.topicTitle,
          topicDescription: topic.topicDescription,
          chapters: chaptersArray,
        };
      });

      response.json(topicsArray);
    } catch (error) {
      console.error("uh oh, fetch failed 🦧:", error);
      response.status(500).send(error);
    }
  },
);

export const getQuestions = functions.https.onRequest(
  async (request, response) => {
    response.set("Access-Control-Allow-Methods", "GET");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    try {
      // This fetches the "questions" document from the "cyber-tutor" collection.
      const questionsDocSnapshot = await admin
        .firestore()
        .collection("cyber-tutor")
        .doc("questions")
        .get();

      if (!questionsDocSnapshot.exists) {
        response
          .status(404)
          .send("uh oh, the questions document was not found 🦧");
        return;
      }

      const questionsData = questionsDocSnapshot.data();
      if (!questionsData) {
        response.status(500).send("uh oh, questions data is missing 🦧");
        return;
      }

      const { quizQuestions } = questionsData;
      if (!quizQuestions) {
        response.status(500).send("uh oh, quizQuestions data is missing 🦧");
        return;
      }

      const staticContent = quizQuestions.static || {};
      const experimentalContent = quizQuestions.experimental || {};

      const staticQuestionsArray = Object.keys(staticContent).map((topicId) => {
        const topicQuestions = staticContent[topicId];
        const chapters = Object.keys(topicQuestions).map((chapterId) => {
          const questions = Object.keys(topicQuestions[chapterId]).map(
            (questionId) => {
              const { correctAnswer, options, question } =
                topicQuestions[chapterId][questionId];
              return {
                questionId,
                correctAnswer,
                options,
                question,
              };
            },
          );

          return {
            chapterId,
            questions,
          };
        });

        return {
          topicId,
          chapters,
        };
      });

      const experimentalQuestionsArray = Object.keys(experimentalContent).map(
        (topicId) => {
          const topicQuestions = experimentalContent[topicId];
          const chapters = Object.keys(topicQuestions).map((chapterId) => {
            const questions = Object.keys(topicQuestions[chapterId]).map(
              (questionId) => {
                const { correctAnswer, options, question } =
                  topicQuestions[chapterId][questionId];
                return {
                  questionId,
                  correctAnswer,
                  options,
                  question,
                };
              },
            );

            return {
              chapterId,
              questions,
            };
          });

          return {
            topicId,
            chapters,
          };
        },
      );

      response.json({
        static: staticQuestionsArray,
        experimental: experimentalQuestionsArray,
      });
    } catch (error) {
      console.error("uh oh, fetch failed 🦧:", error);
      response.status(500).send("uh oh, fetch failed 🦧");
    }
  },
);
