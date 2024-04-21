import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

type Topic = {
  topicId: string;
  topicTitle: string;
  isComplete: boolean;
};

type Props = {
  topics: Topic[];
  screenSize: string;
  showSidebar: boolean;
  userDocument: any;
};

export const NavigationManager = ({
  topics,
  screenSize,
  showSidebar,
  userDocument,
}: Props) => {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(true);

  const handleTopicClick = (topic: Topic) => {
    router.push(`/topics/${encodeURIComponent(topic.topicId)}`);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <Navbar
        topics={topics}
        screenSize={screenSize}
        showSidebar={showSidebar}
        userDocument={userDocument}
        user={user}
        handleTopicClick={handleTopicClick}
        handleLogout={handleLogout}
      />
      <Sidebar
        topics={topics}
        screenSize={screenSize}
        showSidebar={showSidebar}
        userDocument={userDocument}
        user={user}
        handleTopicClick={handleTopicClick}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default NavigationManager;
