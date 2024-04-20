import React from "react";
import ContentPreferenceText from "./ContentPreferenceText";
import ContentPreferenceVideo from "./ContentPreferenceVideo";
import ChapterTypeAssessment from "./ChapterTypeAssessment";
import { Chapter } from "../../../types";
import { DocumentData } from "firebase/firestore";

interface ChapterContentManagerProps {
  contentPreference: string;
  userGroup: string;
  chapter: Chapter;
  controlGroupImageIndex: number | null;
  experimentalGroupImageIndex: number | null;
  userDocument: DocumentData | null;
  userProficiency: string;
  setPlayed: React.Dispatch<React.SetStateAction<number>>;
  setIsVideoWatched: React.Dispatch<React.SetStateAction<boolean>>;
  played: number;
}

const ChapterContentManager: React.FC<ChapterContentManagerProps> = ({
  contentPreference,
  userGroup,
  chapter,
  controlGroupImageIndex,
  experimentalGroupImageIndex,
  userDocument,
  userProficiency,
  setPlayed,
  setIsVideoWatched,
  played,
}) => {
  return (
    <>
      <ContentPreferenceText
        contentPreference={contentPreference || ""}
        userGroup={userGroup || ""}
        chapter={chapter}
        controlGroupImageIndex={controlGroupImageIndex ?? null}
        experimentalGroupImageIndex={experimentalGroupImageIndex ?? null}
        userDocument={userDocument}
        userProficiency={userProficiency}
      />
      <ContentPreferenceVideo
        userGroup={userGroup || ""}
        chapter={chapter}
        userProficiency={userProficiency || ""}
        userDocument={userDocument}
        setPlayed={setPlayed}
        setIsVideoWatched={setIsVideoWatched}
        played={played}
        contentPreference={contentPreference || ""}
      />
      <ChapterTypeAssessment chapter={chapter} userDocument={userDocument} />
    </>
  );
};

export default ChapterContentManager;
