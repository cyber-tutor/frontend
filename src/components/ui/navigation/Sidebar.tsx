import { useState } from "react";
import {
  Sidebar as ReactProSidebar,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";
import Image from "next/image";
import { useRouter } from "next/router";
import { IoPersonCircleSharp, IoLogOutOutline } from "react-icons/io5";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useIsSuperuser } from "../../../hooks/useIsSuperuser";
import { Topic } from "../../../types";

type SidebarProps = {
  topics: Topic[];
  screenSize: string;
  showSidebar: boolean;
  userDocument: any;
  user: any;
  handleTopicClick: (topic: Topic) => void;
  handleLogout: () => void;
};

export const Sidebar = ({
  topics,
  screenSize,
  showSidebar,
  userDocument,
  user,
  handleTopicClick,
  handleLogout,
}: SidebarProps) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(true);
  const router = useRouter();
  const isSuperuser = useIsSuperuser();

  return (
    <div className="flex min-h-screen items-stretch bg-slate-50">
      <div className="flex h-screen flex-col items-center bg-slate-400">
        <div className="flex h-full flex-col justify-between">
          {(screenSize === "lg" || screenSize === "md") && showSidebar ? (
            <ReactProSidebar className="flex h-full flex-col">
              <Menu>
                <div className="flex flex-col justify-center p-2 text-center">
                  <div className="flex items-center justify-center">
                    <Image
                      src="/Cyber-Tutor_Logo.png"
                      alt="Cyber Tutor Logo"
                      width={40}
                      height={40}
                      layout="fixed"
                    />
                    <span>Cyber Tutor</span>
                  </div>
                </div>
                <MenuItem onClick={() => router.push("/")}>Home</MenuItem>
                <SubMenu
                  label="Topics"
                  open={isSubMenuOpen}
                  onOpenChange={() => setIsSubMenuOpen(!isSubMenuOpen)}
                >
                  {user &&
                  userDocument &&
                  userDocument.data().initialSurveyComplete ? (
                    topics.map((topic) => (
                      <MenuItem
                        key={topic.topicId}
                        onClick={() => handleTopicClick(topic)}
                      >
                        <span className="text-sm">{topic.topicTitle}</span>
                        {topic.isComplete && <span> 💯</span>}
                      </MenuItem>
                    ))
                  ) : (
                    <div className="relative">
                      <div className="pointer-events-none select-none blur-sm">
                        {topics.map((topic) => (
                          <MenuItem key={topic.topicId}>
                            {topic.topicTitle}
                          </MenuItem>
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-white bg-opacity-75">
                        <span>Sign in to unlock</span>
                      </div>
                    </div>
                  )}
                </SubMenu>
                <div className="absolute bottom-0 w-full">
                  {user && (
                    <>
                      <br />
                      <div className="border-t-2 border-gray-400"></div>
                      <div className="flex min-h-[3rem] justify-between">
                        <button
                          className="flex flex-grow items-center bg-slate-50 px-2 py-3 text-left text-gray-700 transition duration-200 ease-in-out hover:bg-gray-300"
                          onClick={() =>
                            router.push(`/users/profile/${userDocument.id}`)
                          }
                        >
                          <IoPersonCircleSharp />
                          <span className="ml-2">
                            {userDocument ? userDocument.data().name : ""}
                          </span>
                        </button>
                        {isSuperuser && (
                          <button
                            className="flex w-12 items-center justify-center border-l-2 bg-slate-50 py-3 text-gray-700 transition duration-200 ease-in-out hover:bg-gray-300"
                            onClick={() => router.push("/admin")}
                          >
                            <MdOutlineAdminPanelSettings className="text-blue-500" />
                          </button>
                        )}
                        <button
                          className="flex w-12 items-center justify-center border-l-2 bg-slate-50 py-3 text-gray-700 transition duration-200 ease-in-out hover:bg-gray-300"
                          onClick={handleLogout}
                        >
                          <IoLogOutOutline className="text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </Menu>
            </ReactProSidebar>
          ) : null}
        </div>
      </div>
    </div>
  );
};
