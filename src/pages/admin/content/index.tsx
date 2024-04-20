import React, { useState, useEffect } from "react";
import { auth, db } from "../../../components/firebase/config";
import {
  getDocs,
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../../../components/layouts/BaseLayout";
import ControlGroupForm from "../../../components/admin/CRUDControlGroupForm";
import queryUserDocument from "~/components/firebase/FirebaseFunctions";
import { User } from "firebase/auth";
import { useRouter } from "next/router";

interface UserData {
  userId: string;
  isSuperUser: boolean;
}

export default function CRUD_ControlGroupContent() {
  const [topicId, setTopicId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const usersCollection = collection(db, "users");
        const superUserQuery = query(
          usersCollection,
          where("userId", "==", currentUser.uid),
          where("isSuperuser", "==", true),
        );
        const querySnapshot = await getDocs(superUserQuery);
        if (!querySnapshot.empty) {
          // console.log("You are a superuser");
        } else {
          // console.log("You are not a superuser");
          router.push("/");
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchTopicId = async () => {
      try {
        const topicsCollection = collection(db, "topics");
        const topicsSnapshot = await getDocs(topicsCollection);
        if (!topicsSnapshot.empty) {
          const topicDoc = topicsSnapshot.docs[0];
          if (topicDoc) {
            setTopicId(topicDoc.id);
          }
        }
      } catch (error) {
        console.error("Error fetching topic ID:", error);
      }
    };
    fetchTopicId();
  }, []);

  return (
    <BaseLayout>
      <Head>
        <title>Admin Interface: Control Group Content CRUD</title>
      </Head>
      <h1 className="question-3xl font-bold">
        Admin Interface: Control Group Content CRUD
      </h1>
      <div className="h-100 h-full w-full overflow-auto sm:overflow-scroll">
        <div className="sticky top-0 z-10 bg-white">
          <ControlGroupForm topicId={topicId} />
        </div>
      </div>
    </BaseLayout>
  );
}
