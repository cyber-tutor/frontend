import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../../components/firebase/config";
import { BaseLayout } from "../../../components/layouts/BaseLayout";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import Head from "next/head";

interface User {
  name: string;
  group: string;
  initialSurveyComplete: boolean;
  contentPreference: string;
  progress: DocumentData[];
  proficiency: DocumentData[];
  levels: DocumentData[];
  isSuperuser: boolean;
}

const UserProfile = () => {
  const router = useRouter();
  const { uid } = router.query;
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentPreference, setContentPreference] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (uid) {
      const userRef = doc(db, "users", uid as string);
      getDoc(userRef)
        .then((userDoc) => {
          if (userDoc.exists()) {
            const user: User = userDoc.data() as User;
            setUserData(user);
            setContentPreference(user.contentPreference);
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [uid]);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uid && contentPreference) {
      const userRef = doc(db, "users", uid as string);
      await updateDoc(userRef, {
        contentPreference: contentPreference,
      });
      setUserData((prevUserData) => {
        if (prevUserData) {
          return {
            ...prevUserData,
            contentPreference: contentPreference,
          };
        }
        return null;
      });

      setSuccessMessage("Profile updated successfully!");
    }
  };

  const handleContentPreferenceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setContentPreference(event.target.value);
  };

  if (loading) {
    return (
      <BaseLayout>
        <Head>
          <title>Loading User Profile...</title>
        </Head>
        <div>Loading...</div>
      </BaseLayout>
    );
  }
  return (
    <BaseLayout>
      <Head>
        <title>{userData?.name}'s Profile</title>
      </Head>
      <div className="mt-20 rounded-lg p-8 text-left md:mt-20 lg:mt-10">
        <h1 className="mb-6 text-2xl font-semibold">
          {userData?.name}'s Profile
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Content Preference:
            </label>
            <select
              value={contentPreference ?? ""}
              onChange={handleContentPreferenceChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2"
            >
              <option value="text">Text</option>
              <option value="video">Video</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            Save
          </button>
          {successMessage && (
            <p className="mt-2 text-center text-green-500">{successMessage}</p>
          )}
        </form>
      </div>
    </BaseLayout>
  );
};

export default UserProfile;
