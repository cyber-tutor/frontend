import {
  Navbar as NextUINavbar,
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

type Topic = {
  topicId: string;
  topicTitle: string;
  isComplete: boolean;
};

type NavbarProps = {
  screenSize: string;
  showSidebar: boolean;
  userDocument: any;
  user: any;
  topics: Topic[];
  handleLogoClick: () => void;
  handleLogout: () => void;
  handleTopicClick: (topic: Topic) => void;
};

export const Navbar = ({
  screenSize,
  showSidebar,
  userDocument,
  user,
  topics, // Add this line
  handleTopicClick,
  handleLogoClick,
  handleLogout,
}: NavbarProps) => {
  const router = useRouter();

  return screenSize !== "lg" && screenSize !== "md" && showSidebar ? (
    <NextUINavbar className="fixed left-0 top-0 w-full">
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
      <NavbarContent justify="end">
        {user && (
          <>
            <NavbarItem>
              <p className="mr-20 text-sm">Hi {userDocument?.data().name}</p>
            </NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Button className="text-sm" radius="sm">
                  Topics
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {topics.map((topic) => (
                  <DropdownItem
                    key={topic.topicId}
                    onClick={() => handleTopicClick(topic)}
                  >
                    {topic.topicTitle}
                    {topic.isComplete && <span> 💯</span>}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
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
    </NextUINavbar>
  ) : null;
};

export default Navbar;
