import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { auth } from "~/components/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

const CyberSecurityNews = () => {
  const [user, loading, error] = useAuthState(auth);
  const [article, setArticle] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || loading) return;

    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=cybersecurity&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY}`,
        );
        const articles = response.data.articles;
        if (articles.length > 0) {
          const randomIndex = Math.floor(Math.random() * articles.length);
          setArticle(articles[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You do not have access to this page</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-800 text-white">
      <div className="w-full p-4">
        <button
          onClick={() => router.push("/")}
          className="rounded bg-blue-800 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
      <div className="mx-auto my-auto max-w-xl overflow-hidden rounded-xl bg-white p-6 text-black shadow-md">
        <h1 className="mb-6 text-3xl font-semibold">Cybersecurity News</h1>
        {article ? (
          <div>
            <p className="mb-4 text-xl">{(article as any).title}</p>
            <div className="flex items-center justify-start space-x-4">
              <a
                href={(article as any).url}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/");
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-blue-600 px-8 py-4 text-xl font-bold text-white transition duration-300 hover:bg-blue-800"
              >
                Read More
              </a>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-green-600 px-8 py-4 text-xl font-bold text-white transition duration-300 hover:bg-green-800"
              >
                Give me a different article
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xl">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default CyberSecurityNews;
