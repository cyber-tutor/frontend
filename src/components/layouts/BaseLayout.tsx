import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import queryUserDocument from "../firebase/FirebaseFunctions";
import { NavigationManager } from "../ui/navigation/NavigationManager";
import { useTopics } from "../../hooks/useTopics";

type LayoutProps = {
  children: ReactNode;
  showSidebar?: boolean;
};

export const BaseLayout = ({ children, showSidebar = true }: LayoutProps) => {
  const topics = useTopics();
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
                : "/pre_screening/begin"
            );
          }
        }
      });
    }
  }, [user, router]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(
        width > 1200 ? "lg" : width > 992 ? "md" : width > 768 ? "sm" : "xs"
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
