import { BaseLayout } from "../../../../components/layouts/baseLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/defaultV2.min.css";
import ReactPlayer from "react-player";
import getVideoDuration from "~/components/youtube_data";
import { db, auth } from "~/components/firebase/config";
import {
  DocumentData,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  findUserDocId,
  handleVideoEnd,
  isWatched,
  getNextChapterId,
  increaseLevel,
  isChapterComplete,
} from "~/components/firebase/firebase_functions";
import TimerComponent from "~/components/Timer";
import DynamicSurvey from "../../../../components/DynamicSurvey";
import { progress } from "framer-motion";
import queryUserDocument from "~/components/firebase/firebase_functions";
import { motion } from "framer-motion";

type Chapter = {
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  chapterType: string;
  controlGroupContent: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  controlGroupVideoURLs: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  controlGroupImageURLs: string[];
  experimentalGroupContent: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  experimentalGroupVideoURLs: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  experimentalGroupImageURLs: string[];
  order: number;
  proficiency: string;
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

export default function ChapterPage() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [played, setPlayed] = useState(0);
  const [userDocument, setUserDocument] = useState<DocumentData | null>(null);
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [progressComplete, setProgressComplete] = useState(false);
  const [userGroup, setUserGroup] = useState<string | null>(null);
  const [userProficiency, setUserProficiency] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<DocumentData | null>(null);
  const [chapterComplete, setChapterComplete] = useState<boolean>(false);
  const [contentPreference, setContentPreference] = useState<string | null>(
    null,
  );
  const [controlGroupImageIndex, setControlGroupImageIndex] =
    useState<number>();
  const [experimentalGroupImageIndex, setExperimentalGroupImageIndex] =
    useState<number>();

  useEffect(() => {
    if (chapter && chapter.controlGroupImageURLs) {
      setControlGroupImageIndex(
        Math.floor(Math.random() * chapter.controlGroupImageURLs.length),
      );
    }
    if (chapter && chapter.controlGroupImageURLs) {
      setExperimentalGroupImageIndex(
        Math.floor(Math.random() * chapter.experimentalGroupImageURLs.length),
      );
    }
  }, [chapter]);

  const router = useRouter();
  const { topic: topicId, chapter: chapterId } = router.query;

  useEffect(() => {
    const fetchChapter = async () => {
      if (
        !topicId ||
        !chapterId ||
        Array.isArray(topicId) ||
        Array.isArray(chapterId)
      )
        return;

      setLoading(true);
      try {
        const chapterRef = doc(db, `topics/${topicId}/chapters/${chapterId}`);
        const chapterSnapshot = await getDoc(chapterRef);

        if (chapterSnapshot.exists()) {
          setChapter({
            chapterId: chapterSnapshot.id,
            ...chapterSnapshot.data(),
          } as Chapter);
        } else {
          // console.error("No such chapter!");
          setError("Chapter not found");
        }
      } catch (err) {
        // console.error("Error fetching chapter:", err);
        setError("Failed to fetch chapter");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [topicId, chapterId]);

  useEffect(() => {
    // Check if 1 minute and 30 seconds has passed
    if (secondsElapsed >= 5) {
      setProgressComplete(true);
    }
  }, [secondsElapsed]);

  const user = auth.currentUser;
  const uid = user ? user.uid : null;

  useEffect(() => {
    const fetchUserGroup = async () => {
      if (!uid) return;

      try {
        const userDocument = await queryUserDocument(uid);

        if (userDocument && userDocument.exists()) {
          setUserGroup(userDocument.data().group);
        } else {
          // console.error("No such user!");
        }
      } catch (err) {
        // console.error("Error fetching user:", err);
      }
    };

    fetchUserGroup();
  }, [uid]);

  function removeBreakTags(text?: string) {
    if (!text) return;
    const textWithoutBr = text.replace(/<br\s*\/?>/gi, "");
    return { __html: textWithoutBr };
  }

  useEffect(() => {
    const fetchContentPreference = async () => {
      if (!uid) return;

      try {
        const userDocument = await queryUserDocument(uid);

        if (userDocument && userDocument.exists()) {
          setContentPreference(userDocument.data().contentPreference);
        } else {
          // console.error("No such user!");
        }
      } catch (err) {
        // console.error("Error fetching user:", err);
      }
    };

    fetchContentPreference();
  }, [uid]);

  useEffect(() => {
    const fetchUserProficiency = async () => {
      if (!uid) return;

      const userDocId = await findUserDocId(uid);

      if (!userDocId) return;

      const userProficiencyRef = doc(
        db,
        "users",
        userDocId,
        "proficiency",
        String(topicId),
      );
      const proficiencySnapshot = await getDoc(userProficiencyRef);
      const proficiencyData = proficiencySnapshot.data();

      if (proficiencyData && proficiencyData.proficiency) {
        setUserProficiency(proficiencyData.proficiency);
      }
    };

    fetchUserProficiency();
  }, [uid, progressData]);

  if (loading)
    return (
      <BaseLayout>
        <div>please wait, loading... 🦧</div>
      </BaseLayout>
    );
  if (error)
    return (
      <BaseLayout>
        <div>uh oh, error 🦧: {error}</div>
      </BaseLayout>
    );
  if (!chapter)
    return (
      <BaseLayout>
        <div>uh oh, chapter not found 🦧</div>
      </BaseLayout>
    );

  const handleChapterComplete = async () => {
    setChapterComplete(
      await isChapterComplete(user?.uid ?? "", chapterId?.toString() ?? ""),
    );
  };

  handleChapterComplete();

  return (
    <BaseLayout>
      <div className="mx-auto w-full">
        <div className="text-center">
          <h1 className="py-3 text-3xl font-bold">{chapter.chapterTitle}</h1>
          <p className="border-b-4 py-3">{chapter.chapterDescription}</p>
          {(progressComplete || chapterComplete) &&
            chapter.chapterType !== "assessment" && (
              <button
                className="my-3 rounded bg-blue-500 px-4 py-2 font-bold text-white transition duration-150 ease-in-out hover:bg-blue-700"
                onClick={async () => {
                  const userDocId = await findUserDocId(uid ?? "");
                  if (typeof chapterId === "string" && userDocId) {
                    const userDocRef = doc(db, "users", userDocId);
                    const minutes = Math.floor(secondsElapsed / 60);
                    const seconds = secondsElapsed % 60;
                    const timeElapsed = `${minutes}:${String(seconds).padStart(2, "0")}`;
                    await updateDoc(userDocRef, {
                      timeOnPage: timeElapsed,
                    });

                    const progressRef = doc(
                      db,
                      "users",
                      userDocId,
                      "progress",
                      chapterId,
                    );
                    const progressSnapshot = await getDoc(progressRef);

                    if (progressSnapshot.exists()) {
                      const progressData = progressSnapshot.data();
                      const attempts = progressData.attempts ?? {};
                      const nextAttemptNumber =
                        Object.keys(attempts).length + 1;
                      const updatedAttempts = {
                        ...attempts,
                        [nextAttemptNumber]: {
                          timeElapsed,
                        },
                      };

                      if (progressData.complete === false) {
                        await updateDoc(progressRef, {
                          complete: true,
                          attempts: updatedAttempts,
                        });

                        await increaseLevel(progressData.topicId, userDocId);
                      }

                      const userLevel = doc(
                        db,
                        "users",
                        userDocId,
                        "levels",
                        progressData.topicId,
                      );
                      const levelSnapshot = await getDoc(userLevel);
                      const levelData = levelSnapshot.data();

                      const topicString: String | null = await getNextChapterId(
                        chapter.order,
                        progressData.topicId,
                        levelData?.level,
                      );

                      if (topicString === null) {
                        alert(
                          "Your knowledge level is too low to access the next chapter. Please complete some other chapters to raise it.",
                        );
                        router.push(`/topics/${progressData.topicId}`);
                      } else if (topicString !== null) {
                        router.push(
                          `/topics/${progressData.topicId}/chapters/${topicString}`,
                        );
                      }
                    } else {
                      // If no progress document exists, create the first attempt
                      await updateDoc(progressRef, {
                        complete: true,
                        attempts: {
                          1: {
                            timeElapsed,
                          },
                        },
                      });
                    }
                  }
                }}
              >
                Next
              </button>
            )}
        </div>
        {contentPreference === "text" && (
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
                      ? chapter.controlGroupImageURLs[
                          controlGroupImageIndex ?? 0
                        ]
                      : userGroup === "experimental" &&
                          chapter.experimentalGroupImageURLs.length > 0
                        ? chapter.experimentalGroupImageURLs[
                            experimentalGroupImageIndex ?? 0
                          ]
                        : undefined
                  }
                  alt={
                    chapter.chapterTitle
                      ? String(chapter.chapterTitle)
                      : undefined
                  }
                  title={
                    chapter.chapterTitle
                      ? String(chapter.chapterTitle)
                      : undefined
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
                        ],
                      )}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={removeBreakTags(
                        chapter.experimentalGroupContent?.[
                          userProficiency as keyof typeof chapter.experimentalGroupContent
                        ],
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {contentPreference === "video" &&
          chapter.chapterType !== "assessment" && (
            <div className="flex h-screen flex-grow justify-center">
              <ReactPlayer
                url={
                  userGroup === "control"
                    ? chapter.controlGroupVideoURLs?.[
                        userProficiency as keyof typeof chapter.controlGroupVideoURLs
                      ]
                    : chapter.experimentalGroupVideoURLs?.[
                        userProficiency as keyof typeof chapter.experimentalGroupVideoURLs
                      ]
                }
                onProgress={(progress) => {
                  setPlayed(progress.playedSeconds);
                }}
                className="h-full w-full"
                allowFullScreen
                controls={false}
                onEnded={() => {
                  const playedMinutes = Math.floor(played / 60);
                  handleVideoEnd(playedMinutes, userDocument?.id);
                  setIsVideoWatched(true);
                }}
                seekTo={20}
              />
            </div>
          )}

        <br />
        {/* video progress: {Math.floor(played / 60)}:
        {String(Math.floor(played % 60)).padStart(2, "0")}
        <br />
        <p>User's time spent on this chapter:</p> */}
        <TimerComponent
          secondsElapsed={secondsElapsed}
          setSecondsElapsed={setSecondsElapsed}
        />
        {chapter && chapter.chapterType === "assessment" && (
          <div className="w-full px-4 md:px-0">
            <DynamicSurvey
              chapterId={chapter.chapterId}
              userId={userDocument?.data().userId}
            />
          </div>
        )}
      </div>

      {chapter.chapterType !== "assessment" && !chapterComplete && (
        <div className="sticky bottom-0 w-full bg-white px-4 pb-8 lg:px-8 lg:pb-0">
          <div className="mx-auto">
            <div>
              {chapter.chapterType !== "assessment" && (
                <div className="text-sm text-gray-700">
                  It takes 1 minute and 30 seconds to go to the next chapter and
                  complete this chapter.
                </div>
              )}
            </div>

            <div className="relative h-2 w-full bg-gray-200">
              <motion.div
                className="absolute h-2 bg-blue-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((secondsElapsed / 90) * 100, 100)}%`,
                }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
}
