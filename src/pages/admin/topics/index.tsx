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
import CRUDTopicsForm from "../../../components/admin/CRUDTopicsForm";
import { User } from "firebase/auth";
import { useRouter } from "next/router";

interface UserData {
  userId: string;
  isSuperUser: boolean;
}

export default function CRUDTopics() {
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
        } else {
          console.log("You are not a superuser.");
          router.push("/");
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <BaseLayout>
      <Head>
        <title>Admin Interface: Topics CRUD</title>
      </Head>
      <h1 className="text-center font-bold md:mt-20 lg:mt-10">
        Admin Interface: Topics CRUD
      </h1>
      <div className="h-100 w-full">
        <CRUDTopicsForm />
      </div>
    </BaseLayout>
  );
}
