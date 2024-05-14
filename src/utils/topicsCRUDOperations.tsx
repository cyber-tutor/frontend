import { db } from "../components/firebase/config";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";

export const getTopics = async () => {
  const topicsCollection = collection(db, "topics");
  const topicsQuery = query(topicsCollection, orderBy("order"));
  const snapshot = await getDocs(topicsQuery);
  return snapshot.docs.map((doc) => ({
    topicId: doc.id,
    topicTitle: doc.data().topicTitle,
    topicDescription: doc.data().topicDescription,
    order: doc.data().order,
  }));
};

export const addTopic = async (topicId: string, topic: any) => {
  const topicsCollection = collection(db, "topics");
  const topicDoc = doc(topicsCollection, topicId);
  return setDoc(topicDoc, topic);
};

export const updateTopic = async (topicId: string, topic: any) => {
  const topicsCollection = collection(db, "topics");
  const topicDoc = doc(topicsCollection, topicId);
  return updateDoc(topicDoc, topic);
};

export const deleteTopic = async (topicId: string) => {
  const topicsCollection = collection(db, "topics");
  const topicDoc = doc(topicsCollection, topicId);
  return deleteDoc(topicDoc);
};
