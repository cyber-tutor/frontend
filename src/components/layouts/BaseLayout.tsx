import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import queryUserDocument from "../firebase/FirebaseFunctions";
import { NavigationManager } from "../ui/navigation/NavigationManager";
import { Topic } from "../../types";

type LayoutProps = {
  children: ReactNode;
  showSidebar?: boolean;
};

export const BaseLayout = ({ children, showSidebar = true }: LayoutProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [screenSize, setScreenSize] = useState("");
  const [userDocument, setUserDocument] = useState<DocumentData | null>(null);

  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user ? user.uid : null;

    if (uid) {
      queryUserDocument(uid).then((document) => {
        if (document) {
          setUserDocument(document);
          const data = document.data();
          if (
            data &&
            (!data.initialSurveyComplete || !data.demographicSurveyComplete)
          ) {
            router.push(
              data.initialSurveyComplete
                ? "/pre_screening/demographics_survey"
                : "/pre_screening/begin",
            );
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(
        width > 1200 ? "lg" : width > 992 ? "md" : width > 768 ? "sm" : "xs",
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const topicsCollectionRef = collection(db, "topics");
      const topicsQuery = query(topicsCollectionRef, orderBy("order"));
      const topicsSnapshot = await getDocs(topicsQuery);
      const fetchedTopics = topicsSnapshot.docs.map((doc) => {
        const data = doc.data() as Topic;
        return {
          ...data,
          topicId: doc.id,
          isComplete: false,
        };
      });

      setTopics(fetchedTopics);
    };

    fetchTopics();
  }, []);

  return (
    <div className="flex min-h-screen items-stretch bg-slate-50">
      <NavigationManager
        topics={topics}
        screenSize={screenSize}
        showSidebar={showSidebar}
        userDocument={userDocument}
      />
      <div className={`$ flex h-screen w-full flex-col gap-4 overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
};
