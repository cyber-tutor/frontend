// Navigation.tsx
import { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
} from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";

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

export const Navigation = ({
  topics,
  screenSize,
  showSidebar,
  userDocument,
}: Props) => {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(true);

  const handleLogoClick = () => router.push("/");

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
      {screenSize !== "lg" && screenSize !== "md" && showSidebar ? (
        <Navbar className="fixed left-0 top-0 w-full">
          <NavbarBrand className="pr-7">
            <Image
              src="/Cyber-Tutor_Logo.png"
              alt="Cyber Tutor Logo"
              width={40}
              height={40}
              layout="fixed"
              onClick={handleLogoClick}
            />
            <p className="font-bold text-inherit" onClick={handleLogoClick}>
              Cyber Tutor{" "}
            </p>
          </NavbarBrand>
          <NavbarContent className="gap-2 sm:flex" justify="center">
            {!user && (
              <>
                <NavbarItem isActive>
                  <Link
                    onClick={() => router.push("/users/sign-in")}
                    className="text-sm"
                  >
                    Login
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link
                    onClick={() => router.push("/users/sign-up")}
                    className="text-sm"
                  >
                    Register
                  </Link>
                </NavbarItem>
              </>
            )}
          </NavbarContent>
          <NavbarContent justify="end">
            {user && (
              <>
                <NavbarItem>
                  <p className="mr-20 text-sm">
                    Hi {userDocument?.data().name}
                  </p>
                </NavbarItem>
                <Dropdown>
                  <DropdownTrigger>
                    <Button className="text-sm" radius="sm">
                      Menu↓
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem onClick={() => router.push("/")}>
                      Home
                    </DropdownItem>
                    <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown>
                  <NavbarItem>
                    <DropdownTrigger>
                      <Button className="text-sm" radius="sm">
                        Topics↓
                      </Button>
                    </DropdownTrigger>
                  </NavbarItem>
                  <DropdownMenu>
                    {topics.map((topic) => (
                      <DropdownItem
                        key={topic.topicId}
                        onClick={() => {
                          if (
                            user &&
                            userDocument &&
                            userDocument.data().initialSurveyComplete
                          ) {
                            handleTopicClick(topic);
                          }
                        }}
                      >
                        {user &&
                        userDocument &&
                        userDocument.data().initialSurveyComplete ? (
                          topic.topicTitle + (topic.isComplete ? " 💯" : "")
                        ) : (
                          <div className="relative">
                            <div className="pointer-events-none select-none blur-sm">
                              {topic.topicTitle}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-white bg-opacity-75">
                              <span>Sign in to unlock</span>
                            </div>
                          </div>
                        )}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </>
            )}
          </NavbarContent>
        </Navbar>
      ) : null}
      <div className="flex min-h-screen items-stretch bg-slate-50">
        <div className="flex h-screen flex-col items-center bg-slate-400 ">
          <div className="flex h-full flex-col justify-between">
            {(screenSize === "lg" || screenSize === "md") && showSidebar ? (
              <Sidebar className="flex h-full flex-col">
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
                      <span onClick={handleLogoClick}>Cyber Tutor </span>
                    </div>
                  </MenuItem>
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
                    {user && (
                      <MenuItem>
                        <br />
                        <p>
                          Welcome {userDocument ? userDocument.data().name : ""}
                        </p>
                        <button
                          onClick={() => router.push("/")}
                          type="button"
                          className="pointer-events-auto rounded px-3 hover:bg-blue-500"
                        >
                          Home
                        </button>
                        <br />

                        <button
                          type="button"
                          className="pointer-events-auto rounded px-3 hover:bg-blue-500"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </MenuItem>
                    )}
                  </Menu>
                </div>
              </Sidebar>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
