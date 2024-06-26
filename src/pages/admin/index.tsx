import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { BaseLayout } from "../../components/layouts/BaseLayout";
import Link from "next/link";
import { useIsSuperuser } from "../../hooks/useIsSuperuser";

interface AdminLinkProps {
  href: string;
  title: string;
}

const AdminLink: React.FC<AdminLinkProps> = ({ href, title }) => (
  <Link href={href}>
    <div className="m-3 cursor-pointer rounded-lg bg-white p-3 shadow-lg hover:bg-slate-200">
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const isSuperuser = useIsSuperuser();
  const router = useRouter();

  useEffect(() => {
    if (!isSuperuser) {
      router.push("/");
    }
  }, [isSuperuser, router]);

  return (
    <BaseLayout>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <h1 className="mt-20 text-center font-bold md:mt-20 lg:mt-10">
        Admin Dashboard
      </h1>
      {isSuperuser && (
        <div className="flex flex-col text-start">
          <AdminLink href="/admin/content" title="Content CRUD" />
          <AdminLink href="/admin/questions" title="Questions CRUD" />
          <AdminLink href="/admin/topics" title="Topics CRUD" />
          <AdminLink href="/admin/chapters" title="Chapters CRUD" />
        </div>
      )}
    </BaseLayout>
  );
}
