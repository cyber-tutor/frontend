import React from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  findUserDocId,
  getNextChapterId,
  increaseLevel,
} from "~/components/firebase/FirebaseFunctions";
import { db } from "~/components/firebase/config";
import { useRouter } from "next/router";

interface NextChapterButtonProps {
  uid: string | null;
  chapterId: string | number | string[];
  secondsElapsed: number;
  chapterOrder: number;
}

const NextChapterButton: React.FC<NextChapterButtonProps> = ({
  uid,
  chapterId,
  secondsElapsed,
  chapterOrder,
}) => {
  const router = useRouter();

  const id = Array.isArray(chapterId) ? chapterId[0] : chapterId;

  return (
    <button
      className="m-3 w-full rounded bg-blue-500 px-4 py-2 font-bold text-white transition duration-150 ease-in-out hover:bg-blue-700"
      onClick={async () => {
        const userDocId = await findUserDocId(uid ?? "");
        if (typeof id === "string" && userDocId) {
          const userDocRef = doc(db, "users", userDocId);
          const minutes = Math.floor(secondsElapsed / 60);
          const seconds = secondsElapsed % 60;
          const timeElapsed = `${minutes}:${String(seconds).padStart(2, "0")}`;
          await updateDoc(userDocRef, {
            timeOnPage: timeElapsed,
          });

          const progressRef = doc(db, "users", userDocId, "progress", id);
          const progressSnapshot = await getDoc(progressRef);

          if (progressSnapshot.exists()) {
            const progressData = progressSnapshot.data();
            const attempts = progressData.attempts ?? {};
            const nextAttemptNumber = Object.keys(attempts).length + 1;
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
              chapterOrder,
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
  );
};

export default NextChapterButton;
