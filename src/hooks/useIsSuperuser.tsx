import { useState, useEffect } from "react";
import { auth, db } from "../components/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export const useIsSuperuser = () => {
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("userId", "==", currentUser.uid),
          where("isSuperuser", "==", true)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setIsSuperuser(true);
        } else {
          console.log("You are not a superuser.");
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isSuperuser, isLoading };
};
