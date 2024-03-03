import { ReactNode, useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// I redefined the types again because of the data transformation that happens through the Firebase Cloud Function.
type Topic = {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  order: number;
  chapters: Chapter[];
};

type Chapter = {
  chapterId: string;
  chapterType: string;
  chapterTitle: string;
  chapterDescription: string;
  controlGroupContent: string;
  experimentalGroupContent: string;
  controlGroupImageURLs: string[];
  experimentalGroupImageURLs: string[];
  order: number;
};

type Question = {
  questionId: string;
  questionTitle: string;
  questionDifficulty: string;
  options: Option[];
};

type Option = {
  optionId: string;
  optionTitle: string;
  optionCorrectness: string;
  optionReasoning: string;
};

type LayoutProps = {
  children: ReactNode;
};

export const BaseLayout = ({ children }: LayoutProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);

  // This sets a state variable for the currently selected topic. We intent to use this to highlight the selected topic in the sidebar.
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // This sets a state variable for the open state of the submenu.
  const [isSubMenuOpen, setSubMenuOpen] = useState<boolean>(() => {
    // This checks if window is defined to make sure we're not on the server.
    if (typeof window !== "undefined") {
      const persistedState = localStorage.getItem("isSubMenuOpen");
      // This returns the persisted state if it exists. If not, then it returns true.
      return persistedState ? JSON.parse(persistedState) : true;
    }
    // If we're on the server, just return true.
    return true;
  });

  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  // This stores the state of isSubMenuOpen in localStorage whenever it changes. This allows the state to persist across page reloads.
  useEffect(() => {
    // This checks if window is defined to make sure we're not on the server.
    if (typeof window !== "undefined") {
      localStorage.setItem("isSubMenuOpen", JSON.stringify(isSubMenuOpen));
    }
  }, [isSubMenuOpen]);

  useEffect(() => {
    const fetchTopics = async () => {
      const topicsCollectionRef = collection(db, "topics");
      const topicsArray: Topic[] = [];

      try {
        const topicsSnapshot = await getDocs(
          query(topicsCollectionRef, orderBy("order")),
        );
        topicsSnapshot.forEach((topicDoc) => {
          const topicData = topicDoc.data();
          const topicId = topicDoc.id;

          const newTopic = {
            topicId: topicId,
            topicTitle: topicData.topicTitle,
            topicDescription: topicData.topicDescription,
            order: topicData.order,
            chapters: [],
          };

          topicsArray.push(newTopic);
        });

        setTopics(topicsArray);
      } catch (error) {
        console.error("uh oh, error fetching topics 🦧:", error);
      }
    };

    fetchTopics();
  }, []);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    router.push(`/topics/${encodeURIComponent(topic.topicId)}`);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/users/sign-in");
    } catch (error) {
      console.error("uh oh, logout error 🦧::", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-stretch bg-slate-50">
      <div className="flex h-screen flex-col items-center bg-slate-400">
        <div className="flex h-full flex-col justify-between">
          <Sidebar collapsed={collapsed} className="flex h-full flex-col">
            <Menu>
              <MenuItem className="flex flex-col justify-center p-2 text-center">
                <div className="flex items-center justify-center">
                  <Image
                    src="/Cyber-Tutor_Logo.png"
                    alt="Cyber Tutor Logo"
                    width={40}
                    height={40}
                    layout="fixed"
                    onClick={handleLogoClick}
                  />
                  {!collapsed && (
                    <span className="pe-2 font-mono" onClick={handleLogoClick}>
                      Cyber Tutor{" "}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="sb-button font-mono"
                  onClick={() => setCollapsed(!collapsed)}
                  aria-label="Sidebar Toggle Button"
                >
                  <FiMenu />
                </button>
              </MenuItem>
              <SubMenu
                label="Topics"
                open={isSubMenuOpen}
                onOpenChange={toggleSubMenu}
              >
                {topics.map((topic) => (
                  <MenuItem
                    key={topic.topicId}
                    onClick={() => handleTopicClick(topic)}
                  >
                    {topic.topicTitle}
                  </MenuItem>
                ))}
              </SubMenu>
            </Menu>

            <div>
              <Menu
                className="text-center"
                menuItemStyles={{
                  button: {
                    "&:hover": {
                      background: "none",
                      color: "inherit",
                    },
                    pointerEvents: "none",
                  },
                }}
              >
                {!user && !loading && (
                  <MenuItem>
                    <button
                      type="button"
                      className="pointer-events-auto rounded px-3 hover:bg-blue-500"
                      onClick={() => router.push("/users/sign-in")}
                    >
                      {collapsed ? "L" : "Login"}
                    </button>
                    <button
                      type="button"
                      className="pointer-events-auto rounded px-3 hover:bg-blue-500"
                      onClick={() => router.push("/users/sign-up")}
                    >
                      {collapsed ? "R" : "Register"}
                    </button>
                  </MenuItem>
                )}
                {user && (
                  <MenuItem>
                    <p>Welcome {user.displayName}</p>
                    <button
                      type="button"
                      className="pointer-events-auto rounded px-3 hover:bg-blue-500"
                      onClick={handleLogout}
                    >
                      {collapsed ? "L" : "Logout"}
                    </button>
                  </MenuItem>
                )}
              </Menu>
            </div>
          </Sidebar>
        </div>
      </div>
      <div className="container flex h-screen flex-col items-center gap-4 lg:py-16">
        {children}
      </div>
    </div>
  );
};
