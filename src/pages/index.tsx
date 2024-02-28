// index.tsx
import Head from "next/head";
import { BaseLayout } from "./layouts/baseLayout";

export default function Home() {

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