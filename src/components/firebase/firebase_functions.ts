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
  arrayUnion,
  increment,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";
import { User } from "firebase/auth";
import { Console } from "console";
import router, { useRouter } from "next/router";

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
      // console.log("Success.");
      //   return firstDoc.data();
      return firstDoc;
    } else {
      // console.log("No matching documents.");
      return null;
    }
  } catch (error) {
    // console.error("Error fetching user document:", error);
    return null;
  }
}

export async function handleVideoEnd(
  played: number,
  userDocumentId: string,
): Promise<void> {
  try {
    if (!userDocumentId) {
      // console.error("User document ID is undefined.");
      return;
    }

    // Set videoWatched to true in Firestore
    const videoDocRef = doc(db, "users", userDocumentId);
    await updateDoc(videoDocRef, {
      videoCompleted: true,
    });
  } catch (error) {
    // console.error("Error updating video progress:", error);
  }
}

export async function isWatched(userDocumentId: string): Promise<boolean> {
  try {
    if (!userDocumentId) {
      // console.error("User document ID is undefined.");
      return false;
    }

    const videoDocRef = doc(db, "users", userDocumentId);
    const docSnap = await getDoc(videoDocRef);

    if (docSnap.exists()) {
      const videoCompleted = docSnap.data().videoCompleted || false;
      return videoCompleted;
    } else {
      // console.log("No such document!");
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

  const batch = writeBatch(db);

  const userRef = doc(collection(db, "users"));
  batch.set(userRef, {
    userId: user.uid,
    group: group,
    name: userName || "",
    initialSurveyComplete: false,
    demographicSurveyComplete: false,
    isSuperuser: false,
    initialSurveyIncorrectCount: 0,
    contentPreference: "text",
  });

  const topicsCollectionRef = collection(db, "topics");
  try {
    const topicsSnapshot = await getDocs(
      query(topicsCollectionRef, orderBy("order")),
    );
    for (const topicDoc of topicsSnapshot.docs) {
      const topicId = topicDoc.id;

      // Proficiency collection with proficiency attribute as string
      const proficiencyRef = doc(
        collection(db, "users", userRef.id, "proficiency"),
        topicId,
      );
      batch.set(proficiencyRef, {
        proficiency: "",
      });

      // Level collection with value attribute as number
      const levelRef = doc(
        collection(db, "users", userRef.id, "levels"),
        topicId,
      );
      batch.set(levelRef, {
        level: 0,
      });

      const chaptersCollectionRef = collection(
        db,
        "topics",
        topicId,
        "chapters",
      );
      const chaptersSnapshot = await getDocs(chaptersCollectionRef);

      for (const chapterDoc of chaptersSnapshot.docs) {
        const chapterData = chapterDoc.data();
        const chapterId = chapterDoc.id;

        const progressData: {
          complete: boolean;
          topicId: string;
          attempts?: { [key: string]: number };
        } = {
          complete: false,
          topicId: topicId,
        };

        if (chapterData.chapterType === "assessment") {
          progressData.attempts = {
            // exampleAttemptId: { score: 0, date: Firebase.firestore.Timestamp.now(), ...otherAttemptDetails }
          };
        }

        const progressRef = doc(
          collection(db, "users", userRef.id, "progress"),
          chapterId,
        );
        batch.set(progressRef, progressData);
      }
    }

    await batch.commit();
    // console.log(
    //   "User document and subcollections created with ID: ",
    //   userRef.id,
    // );
  } catch (error) {
    // console.error(
    //   "Error fetching topics or chapters, or error in batch write:",
    //   error,
    // );
  }
}


export const findUserDocId = async (userId: string): Promise<string | null> => {
  if (!userId) {
    // console.error("User ID is undefined");
    return null;
  }
  const q = query(collection(db, "users"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const userDoc = querySnapshot.docs[0];
  return userDoc ? userDoc.id : null;
};

export const updateProgress = async (
  userId: string,
  chapterId: string,
  timeElapsed: number
) => {
  const progressDocRef = doc(db, "users", userId, "progress", chapterId);

  await updateDoc(progressDocRef, {
    complete: true,
    attempts: arrayUnion({ timeElapsed }),
  });
};

export async function getNextChapterId(order: number, documentId: string, userProficiency: number) {


  const topicsCollection = collection(db, 'topics', documentId, 'chapters');
  const q = query(topicsCollection, where('order', '==', order + 1));

  const querySnapshot = await getDocs(q);
  let nextChapterId = null;
  let nextChapterProficiency = 0;

  querySnapshot.forEach((doc) => {
    // console.log(doc.id, " => ", doc.data());
    nextChapterId = doc.id;
    nextChapterProficiency = doc.data().proficiency;
  });

  if (nextChapterProficiency > userProficiency) {
    return null;
  } else {
    return nextChapterId;
  }
}

export async function increaseLevel(topicId: string, userId: string) {
 
  const userDoc = doc(db, 'users', userId, 'levels', topicId);

  await updateDoc(userDoc, {
    level: increment(1)
  });
}

export async function initialSurveyComplete(userId: string, quizResponse: any) {
  const docId = await findUserDocId(userId);
  const userDoc = doc(db, 'users', docId ? docId : '');

  await setDoc(userDoc, {
    initialSurveyComplete: true
  });

  const surveyResponseCollection = collection(userDoc, 'initialSurveyResponse');
  const surveyResponseDoc = doc(surveyResponseCollection, userId);
  await setDoc(surveyResponseDoc, {
    response: quizResponse
  });
}

export async function demographicSurveyComplete(userId: string, quizResponse: any) {
  const docId = await findUserDocId(userId);
  const userDoc = doc(db, 'users', docId ? docId : '');

  await updateDoc(userDoc, {
    demographicSurveyComplete: true
  });

  // const surveyResponseCollection = collection(userDoc, 'demographicSurveyResponse');
  // const surveyResponseDoc = doc(surveyResponseCollection, userId);
  // await setDoc(surveyResponseDoc, {
  //   response: quizResponse
  // });
}

// Topic Methods

export async function numberOfTopicsCompleted(userId: string) {
  const docId = await findUserDocId(userId);
  const userDoc = doc(db, 'users', docId ? docId : '');

  const topicsCollection = collection(db, 'topics');
  const topicsSnapshot = await getDocs(topicsCollection);

  let completedTopicsCount = 0;

  for (const topicDoc of topicsSnapshot.docs) {
    const topicId = topicDoc.id;

    const progressCollection = collection(userDoc, 'progress');
    const q = query(progressCollection, where('topicId', '==', topicId));

    const progressSnapshot = await getDocs(q);

    if (progressSnapshot.docs.every(doc => doc.data().complete)) {
      completedTopicsCount++;
    }
  }

  return completedTopicsCount;
}

export async function isTopicComplete(userId: string, topicId: string) {
  const docId = await findUserDocId(userId);
  if (!docId) {
    // console.error('User document ID not found');
    return false;
  }

  const userDoc = doc(db, 'users', docId);
  const progressCollection = collection(userDoc, 'progress');
  const q = query(progressCollection, where('topicId', '==', topicId));

  const querySnapshot = await getDocs(q);
  
  let allComplete = true;
  querySnapshot.forEach((doc) => {
    if (!doc.data().complete) {
      allComplete = false;
    }
  });

  return allComplete;
}
