import React, { useState, useEffect } from "react";
import { auth, db } from "../../components/firebase/config";
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
import { BaseLayout } from "../../components/layouts/BaseLayout";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import Link from "next/link";

interface UserData {
  userId: string;
  isSuperUser: boolean;
}

interface AdminLinkProps {
  href: string;
  title: string;
}

const AdminLink: React.FC<AdminLinkProps> = ({ href, title }) => (
  <Link href={href}>
    <div className="m-3 cursor-pointer rounded-lg bg-white p-3 shadow-lg hover:bg-slate-200">
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
  </Link>
);

export default function AdminDashboard() {
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
        <title>Admin Dashboard</title>
      </Head>
      <h1 className="mt-20 text-center font-bold md:mt-20 lg:mt-10">
        Admin Dashboard
      </h1>
      <div className="flex flex-col text-start">
        <AdminLink href="/admin/content" title="Content CRUD" />
        <AdminLink href="/admin/questions" title="Questions CRUD" />
        <AdminLink href="/admin/topics" title="Topics CRUD" />
        <AdminLink href="/admin/chapters" title="Chapters CRUD" />
      </div>
    </BaseLayout>
  );
}
