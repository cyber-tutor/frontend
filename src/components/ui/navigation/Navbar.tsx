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
import { IoPersonCircleSharp, IoChevronDownOutline } from "react-icons/io5";

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
  topics,
  handleTopicClick,
  handleLogoClick,
  handleLogout,
}: NavbarProps) => {
  const router = useRouter();

  return screenSize !== "lg" && screenSize !== "md" && showSidebar ? (
    <NextUINavbar className="fixed left-0 top-0 w-full shadow-lg">
      <NavbarBrand className="pr-7">
        <Image
          src="/Cyber-Tutor_Logo.png"
          alt="Cyber Tutor Logo"
          width={40}
          height={40}
          layout="fixed"
        />
        <div onClick={() => router.push("/")}>Home</div>
      </NavbarBrand>
      <NavbarContent justify="end">
        {user && (
          <>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  disableRipple
                  className="bg-transparent p-0 data-[hover=true]:bg-transparent"
                  endContent={<IoChevronDownOutline />}
                >
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
                <Button
                  disableRipple
                  className="bg-transparent p-0 data-[hover=true]:bg-transparent"
                  endContent={<IoChevronDownOutline />}
                >
                  <IoPersonCircleSharp size="2em" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  onClick={() =>
                    router.push(`/users/profile/${userDocument.id}`)
                  }
                >
                  {userDocument?.data().name}
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
