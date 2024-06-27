import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BaseLayout } from "../../../components/layouts/BaseLayout";
import CRUDChaptersForm from "../../../components/admin/CRUDChaptersForm";
import { useIsSuperuser } from "../../../hooks/useIsSuperuser";

export default function CRUDChapters() {
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
        <title>Admin Interface: Chapters CRUD</title>
      </Head>
      <h1 className="mt-20 text-center font-bold md:mt-20 lg:mt-10">
        Admin Interface: Chapters CRUD
      </h1>
      {isSuperuser && (
        <div className="h-100 w-full">
          <CRUDChaptersForm />
        </div>
      )}
    </BaseLayout>
  );
}
