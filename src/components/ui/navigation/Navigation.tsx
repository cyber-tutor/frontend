import { useState, useEffect } from "react";
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
import { auth } from "../../firebase/config";
import { IoPersonCircleSharp } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { CustomSidebar } from "./Sidebar";

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
              </>
            )}
          </NavbarContent>
        </Navbar>
      ) : null}
      <CustomSidebar
        topics={topics}
        screenSize={screenSize}
        showSidebar={showSidebar}
        userDocument={userDocument}
        user={user}
        handleLogoClick={handleLogoClick}
        handleTopicClick={handleTopicClick}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Navigation;
