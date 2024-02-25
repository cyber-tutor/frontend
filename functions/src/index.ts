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
      // This fetches the "topics" collection.
      const topicsCollection = await admin
        .firestore()
        .collection("topics")
        .get();

      const topicsArray = [];

      for (const topicDoc of topicsCollection.docs) {
        const topicData = topicDoc.data();
        const topicId = topicDoc.id;

        // This fetches the "chapters" collection for each topic within the "topics" collection.
        const chaptersCollection = await admin
          .firestore()
          .collection("topics")
          .doc(topicId)
          .collection("chapters")
          .get();

        const chaptersArray: { [key: string]: any }[] = [];

        chaptersCollection.docs.forEach((chapterDoc) => {
          const chapterData = chapterDoc.data();
          const chapterId = chapterDoc.id;

          //  This is the structure of the chapters array that will be sent in the JSON response.
          chaptersArray.push({
            chapterId: chapterId,
            chapterTitle: chapterData.chapterTitle,
            chapterDescription: chapterData.chapterDescription,
            chapterType: chapterData.chapterType,
            controlGroupContent: chapterData.controlGroupContent,
            experimentalGroupContent: chapterData.experimentalGroupContent,
            controlGroupImageURLs: chapterData.controlGroupImageURLs || [],
            experimentalGroupImageURLs:
              chapterData.experimentalGroupImageURLs || [],
          });
        });

        // This is the structure of the topics array that will be sent in the JSON response.
        topicsArray.push({
          topicId: topicId,
          topicTitle: topicData.topicTitle,
          topicDescription: topicData.topicDescription,
          chapters: chaptersArray,
        });
      }

      // I added this because the topics were not being sorted by topicId and were being sent depending on the order they were fetched from Firestore.
      topicsArray.sort((a, b) => a.topicId.localeCompare(b.topicId));

      response.json(topicsArray);
    } catch (error) {
      console.error("Error fetching topics:", error);
      response.status(500).send("Error fetching topics");
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
