import { useState, useEffect } from "react";
import { auth, db } from "../components/firebase/config";
import { getDocs, collection, query, where } from "firebase/firestore";
import { useRouter } from "next/router";

export const useIsSuperuser = () => {
  const [isSuperuser, setIsSuperuser] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const usersCollection = collection(db, "users");
        const superUserQuery = query(
          usersCollection,
          where("userId", "==", currentUser.uid),
          where("isSuperuser", "==", true),
        );
        const querySnapshot = await getDocs(superUserQuery);
        if (!querySnapshot.empty) {
          setIsSuperuser(true);
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

  return isSuperuser;
};
