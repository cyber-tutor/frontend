import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BaseLayout } from "../../../components/layouts/BaseLayout";
import CRUDTopicsForm from "../../../components/admin/CRUDTopicsForm";
import { useIsSuperuser } from "../../../hooks/useIsSuperuser";

export default function CRUDTopics() {
  const { isSuperuser, isLoading } = useIsSuperuser();
  const router = useRouter();

  useEffect(() => {
    if (!isSuperuser && !isLoading) {
      router.push("/");
    }
  }, [isSuperuser, isLoading, router]);

  return (
    <BaseLayout>
      <Head>
        <title>Admin Interface: Topics CRUD</title>
      </Head>
      <h1 className="mt-20 text-center font-bold md:mt-20 lg:mt-10">
        Admin Interface: Topics CRUD
      </h1>
      {isSuperuser && (
        <div className="h-100 w-full">
          <CRUDTopicsForm />
        </div>
      )}
    </BaseLayout>
  );
}
