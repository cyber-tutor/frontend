// index.tsx
import Head from "next/head";
import { BaseLayout } from "./layouts/baseLayout";
import { api } from "~/utils/api";
import Link from "next/link";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <> 
      <Head>
        <title>Cyber Tutor</title>
        <meta name="description" content="Cyber Tutor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BaseLayout>
        <p>Select a topic from the menu.</p>
      </BaseLayout>
    </>
  );
}