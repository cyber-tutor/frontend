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

// Self-explanatory. This function fetches the topics from the Realtime Database.
// Why this, instead of setting rules to have read = true? Because we don't want those annoying reminder emails, and more importantly, we don't want to expose our database to the public. Now we can have strict rules and still fetch the data.
export const getTopics = functions.https.onRequest(
  async (request, response) => {
    // This is a CORS header that allows the function to be called from any domain.
    response.set("Access-Control-Allow-Origin", "*");
    // This is a CORS header that allows the function to be called with the GET method.
    response.set("Access-Control-Allow-Methods", "GET");

    try {
      // This fetches the topics from the Realtime Database.
      const topicsSnapshot = await admin
        .database()
        .ref("/topics")
        .once("value");
      const topics = topicsSnapshot.val();

      const topicsArray = topics
        ? Object.keys(topics).map((key) => ({
            id: key,
            ...topics[key],
          }))
        : [];

      response.json(topicsArray);
    } catch (error) {
      console.error("uh oh, fetch failed 🦧:", error);
      response.status(500).send(error);
    }
  },
);
