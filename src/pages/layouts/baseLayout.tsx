import { ReactNode, Dispatch, SetStateAction } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import Image from "next/image";
import topics from "../../../public/testing-data/topics.json";

type Topic = {
  title: string;
  description: string;
  chapters: Chapter[];
};

type Chapter = {
  title: string;
  description: string;
};

type LayoutProps = {
  children: ReactNode;
  selectedTopic: Topic | null;
  setSelectedTopic: Dispatch<SetStateAction<Topic | null>>;
};

export const BaseLayout = ({ children, selectedTopic, setSelectedTopic }: LayoutProps) => {
  return (
    <div className="flex min-h-screen items-stretch bg-slate-50">
      <div className="flex h-screen flex-col items-center bg-slate-400">
        <div className="flex h-full flex-col justify-between">
          <Sidebar className="flex h-full flex-col">
            <Menu>
              <MenuItem className="flex flex-col justify-center text-center">
                <div className="flex items-center justify-center">
                  <Image
                    src="/Cyber-Tutor_Logo.png"
                    alt="Cyber Tutor Logo"
                    width={50}
                    height={50}
                    layout="fixed"
                  />
                  <span className="font-mono">Cyber Tutor</span>
                </div>
              </MenuItem>
              <SubMenu label="Sections">
                {topics.map((topic) => (
                  <MenuItem
                    key={topic.title}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic.title}
                  </MenuItem>
                ))}
              </SubMenu>
            </Menu>
          </Sidebar>
          <div>
            <Menu className="text-center">
              <MenuItem> PUT USER STUFF HERE </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        {children}
      </div>
    </div>
  );
};