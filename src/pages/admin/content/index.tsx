import { useState, useEffect } from "react";
import { db } from "../../../components/firebase/config";
import { getDocs, collection } from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../../../components/layouts/BaseLayout";
import ControlGroupForm from "../../../components/admin/CRUDControlGroupForm";
import { useIsSuperuser } from "../../../hooks/useIsSuperuser";

export default function CRUD_ControlGroupContent() {
  const [topicId, setTopicId] = useState<string>("");
  const isSuperuser = useIsSuperuser();

  useEffect(() => {
    const fetchTopicId = async () => {
      try {
        const topicsCollection = collection(db, "topics");
        const topicsSnapshot = await getDocs(topicsCollection);
        if (!topicsSnapshot.empty) {
          const topicDoc = topicsSnapshot.docs[0];
          if (topicDoc) {
            setTopicId(topicDoc.id);
          }
        }
      } catch (error) {
        console.error("Error fetching topic ID:", error);
      }
    };
    fetchTopicId();
  }, []);

  return (
    <BaseLayout>
      <Head>
        <title>Admin Interface: Control Group Content CRUD</title>
      </Head>
      <h1 className="mt-20 text-center font-bold md:mt-20 lg:mt-10">
        Admin Interface: Control Group Content CRUD
      </h1>
      {isSuperuser && (
        <div className="h-100 h-full w-full">
          <div className="sticky top-0 z-10">
            <ControlGroupForm topicId={topicId} />
          </div>
        </div>
      )}
    </BaseLayout>
  );
}
