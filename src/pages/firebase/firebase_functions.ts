import { Firestore, doc, addDoc, collection, query, where, getDocs, DocumentData, QueryDocumentSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config'; 
import { User } from "firebase/auth";


export default async function queryUserDocument(userIdString: string): Promise<DocumentData | null> {
  const usersCollectionRef = collection(db, 'users');


  // Hardcoded user ID for testing 
  const q = query(usersCollectionRef, where('userId', '==', userIdString)); 


  try {
    const querySnapshot = await getDocs(q);
    // if (querySnapshot.empty || querySnapshot.docs.length === 0) {
    //   console.log('No matching documents.');
    //   return null;
    // }


    const firstDoc = querySnapshot.docs[0];
    if (firstDoc) {
      console.log('Success.');
    //   return firstDoc.data();
    return firstDoc;
    
    } else {
      console.log('No matching documents.');
      return null;
    }
  } catch (error) {
    console.error("Error fetching user document:", error);
    return null;
  }
}


export async function handleVideoEnd(played: number, userDocumentId: string): Promise<void> {
  try {

    if (!userDocumentId) {
      console.error("User document ID is undefined.");
      return;
    }

    // Set videoWatched to true in Firestore
    const videoDocRef = doc(db, 'users', userDocumentId);
    await updateDoc(videoDocRef, {
      videoCompleted: true
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
  
      const videoDocRef = doc(db, 'users', userDocumentId);
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

  export const createUserDocument = async (user: User) => {
    const isExperimental = Math.random() < 0.5;
    const group = isExperimental ? "experimental" : "control";
  
    const docRef = await addDoc(collection(db, "users"), {
      userId: user.uid,
      group: group,
      name: user.displayName || "",
      initialSurveyComplete: false,
      progress: {
        0: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        1: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        2: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        3: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        4: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        5: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      proficiency: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      scoresQuiz: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      scoresTest: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
  
    return docRef;
  };