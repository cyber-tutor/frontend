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
        <div>Loading...</div>
      </BaseLayout>
    );
  }
  return (
    <BaseLayout>
      <div>
        <h1>{userData?.name}'s Profile</h1>
        <form onSubmit={handleFormSubmit}>
          <label>
            Content Preference:
            <select
              value={contentPreference ?? ""}
              onChange={handleContentPreferenceChange}
            >
              <option value="text">Text</option>
              <option value="video">Video</option>
            </select>
            {successMessage && <p>{successMessage}</p>}
          </label>
          <button type="submit">Save</button>
        </form>
      </div>
    </BaseLayout>
  );
};

export default UserProfile;
