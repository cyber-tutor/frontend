import {
  Firestore,
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  updateDoc,
  getDoc,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import { User } from "firebase/auth";
import { Console } from "console";

export default async function queryUserDocument(
  userIdString: string,
): Promise<DocumentData | null> {
  const usersCollectionRef = collection(db, "users");

  // Hardcoded user ID for testing
  const q = query(usersCollectionRef, where("userId", "==", userIdString));

  try {
    const querySnapshot = await getDocs(q);
    // if (querySnapshot.empty || querySnapshot.docs.length === 0) {
    //   console.log('No matching documents.');
    //   return null;
    // }

    const firstDoc = querySnapshot.docs[0];
    if (firstDoc) {
      console.log("Success.");
      //   return firstDoc.data();
      return firstDoc;
    } else {
      console.log("No matching documents.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user document:", error);
    return null;
  }
}

export async function handleVideoEnd(
  played: number,
  userDocumentId: string,
): Promise<void> {
  try {
    if (!userDocumentId) {
      console.error("User document ID is undefined.");
      return;
    }

    // Set videoWatched to true in Firestore
    const videoDocRef = doc(db, "users", userDocumentId);
    await updateDoc(videoDocRef, {
      videoCompleted: true,
    });
  } catch (error) {
    console.error("Error updating video progress:", error);
  }
}

export async function isWatched(userDocumentId: string): Promise<boolean> {
  try {
    if (!userDocumentId) {
      console.error("User document ID is undefined.");
      return false;
    }

    const videoDocRef = doc(db, "users", userDocumentId);
    const docSnap = await getDoc(videoDocRef);

    if (docSnap.exists()) {
      const videoCompleted = docSnap.data().videoCompleted || false;
      return videoCompleted;
    } else {
      console.log("No such document!");
      return false;
    }
  } catch (error) {
    return false;
  }
}

export async function createUserDocument(
  user: User,
  userName: string,
): Promise<void> {
  const isExperimental = Math.random() < 0.5;
  const group = isExperimental ? "experimental" : "control";

  const mainBatch = writeBatch(db);

  // Create the main user document
  const userRef = doc(collection(db, "users"));
  mainBatch.set(userRef, {
    userId: user.uid,
    group: group,
    name: userName || "",
    initialSurveyComplete: false,
    isSuperuser: false,
  });

  const topicsCollectionRef = collection(db, "topics");
  try {
    const topicsSnapshot = await getDocs(
      query(topicsCollectionRef, orderBy("order")),
    );
    for (const topicDoc of topicsSnapshot.docs) {
      const topicId = topicDoc.id;

      const proficiencyRef = doc(
        collection(db, "users", userRef.id, "proficiency"),
        topicId,
      );
      mainBatch.set(proficiencyRef, {
        number: 0,
      });

      const chaptersCollectionRef = collection(
        db,
        "topics",
        topicId,
        "chapters",
      );
      const chaptersSnapshot = await getDocs(chaptersCollectionRef);

      for (const chapterDoc of chaptersSnapshot.docs) {
        const chapterId = chapterDoc.id;
        const progressRef = doc(
          collection(db, "users", userRef.id, "progress"),
          chapterId,
        );
        mainBatch.set(progressRef, {
          complete: false,
        });

        const quizScoreRef = doc(
          collection(
            db,
            "users",
            userRef.id,
            "progress",
            chapterId,
            "quizScores",
          ),
        );
        mainBatch.set(quizScoreRef, {
          attempt: 0,
          quizScore: 0,
        });
      }
    }

    // Commit the main batch
    await mainBatch.commit();
    console.log(
      "User document and subcollections created with ID: ",
      userRef.id,
    );
  } catch (error) {
    console.error(
      "Error fetching topics or chapters, or error in batch write:",
      error,
    );
  }
}
