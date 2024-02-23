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

      // This is some error handling.
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

// Going to uncomment this after getting the topics to work with Firestore.
// export const getQuestions = functions.https.onRequest(
//   async (request: functions.Request, response: functions.Response) => {
//     // This is a CORS header that allows the function to be called from any domain.
//     response.set("Access-Control-Allow-Origin", "*");
//     // This is a CORS header that allows the function to be called with the GET method.
//     response.set("Access-Control-Allow-Methods", "GET");

//     try {
//       // This fetches the questions from the Realtime Database.
//       const questionsSnapshot = await admin
//         .database()
//         .ref("/questions/quizQuestions/static")
//         .once("value");
//       const questions = questionsSnapshot.val();
//       response.json(questions);
//     } catch (error) {
//       console.error("uh oh, fetch failed 🦧:", error);
//       response.status(500).send(error);
//     }
//   },
// );
