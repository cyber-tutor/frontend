import React from "react";

interface ContentPreferenceTextProps {
  contentPreference: string;
  userGroup: string;
  chapter: any;
  controlGroupImageIndex: number | null;
  experimentalGroupImageIndex: number | null;
  userDocument: any;
  userProficiency: any;
}

function removeBreakTags(text?: string) {
  if (!text) return;
  const textWithoutBr = text.replace(/<br\s*\/?>/gi, "");
  return { __html: textWithoutBr };
}

const ContentPreferenceText: React.FC<ContentPreferenceTextProps> = ({
  contentPreference,
  userGroup,
  chapter,
  controlGroupImageIndex,
  experimentalGroupImageIndex,
  userDocument,
  userProficiency,
}) => {
  if (contentPreference !== "text") {
    return null;
  }

  return (
    <div className="m-4 rounded p-4 ">
      <div className="overflow-auto">
        {(userGroup === "control"
          ? chapter.controlGroupImageURLs
          : chapter.experimentalGroupImageURLs
        )?.length > 0 && (
          <img
            className="float-right ml-5 mt-5 w-1/3 shadow-lg"
            src={
              userGroup === "control" &&
              chapter.controlGroupImageURLs.length > 0
                ? chapter.controlGroupImageURLs[controlGroupImageIndex ?? 0]
                : userGroup === "experimental" &&
                    chapter.experimentalGroupImageURLs.length > 0
                  ? chapter.experimentalGroupImageURLs[
                      experimentalGroupImageIndex ?? 0
                    ]
                  : undefined
            }
            alt={
              chapter.chapterTitle ? String(chapter.chapterTitle) : undefined
            }
            title={
              chapter.chapterTitle ? String(chapter.chapterTitle) : undefined
            }
          />
        )}
        {userDocument?.data().id}
        {userProficiency && (
          <div className="prose">
            {userGroup === "control" ? (
              <div
                dangerouslySetInnerHTML={removeBreakTags(
                  chapter.controlGroupContent?.[
                    userProficiency as keyof typeof chapter.controlGroupContent
                  ] ?? "",
                )}
              />
            ) : (
              <div
                dangerouslySetInnerHTML={removeBreakTags(
                  chapter.experimentalGroupContent?.[
                    userProficiency as keyof typeof chapter.experimentalGroupContent
                  ] ?? "",
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPreferenceText;
