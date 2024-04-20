import React from "react";
import DynamicSurvey from "../../assessments/DynamicSurvey";
import { Chapter } from "../../../types";
import { DocumentData } from "firebase/firestore";

interface ChapterTypeAssessmentProps {
  chapter: Chapter;
  userDocument: DocumentData | null;
}

const ChapterTypeAssessment: React.FC<ChapterTypeAssessmentProps> = ({
  chapter,
  userDocument,
}) => {
  if (!chapter || chapter.chapterType !== "assessment") {
    return null;
  }

  return (
    <div className="mt-10 w-full md:px-0">
      <DynamicSurvey
        chapterId={chapter.chapterId}
        userId={userDocument?.data().userId}
      />
    </div>
  );
};

export default ChapterTypeAssessment;
