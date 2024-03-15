import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import Head from "next/head";
import { BaseLayout } from "../../layouts/baseLayout";
import ControlGroupForm from "../../../components/CRUDControlGroupForm"; // Import the ControlGroupForm component

export default function CRUD_ControlGroupContent() {
  const [topicId, setTopicId] = useState<string>(""); // State to store the topic ID

  useEffect(() => {
    // Fetch the topic ID from Firestore or any other source
    const fetchTopicId = async () => {
      try {
        // Example: Fetching the first topic ID from the topics collection
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
      <h1 className="question-3xl font-bold">
        Admin Interface: Control Group Content CRUD
      </h1>
      <div className="h-100 h-full w-full overflow-auto sm:overflow-scroll">
        <div className="sticky top-0 z-10 bg-white">
          {/* Render the ControlGroupForm component and pass the topic ID as a prop */}
          <ControlGroupForm topicId={topicId} />
        </div>
        {/* Render other components */}
      </div>
      {/* Render other components */}
    </BaseLayout>
  );
}
