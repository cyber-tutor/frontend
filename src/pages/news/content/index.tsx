import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { auth } from '~/components/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

const CyberSecurityNews = () => {
  const [user, loading, error] = useAuthState(auth); 
  const [article, setArticle] = useState(null);      
  const router = useRouter();                      


  useEffect(() => {
    if (loading) return; 
    if (!user) {
      router.push('/'); 
    }
  }, [user, loading, router]);


  useEffect(() => {
    if (!user || loading) return; 

    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=cybersecurity&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY}`
        );
        const articles = response.data.articles;
        if (articles.length > 0) {
          const randomIndex = Math.floor(Math.random() * articles.length);
          setArticle(articles[randomIndex]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, [user, loading]); 

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <p>You do not have access to this page</p>
    </div>;
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <div className="w-full p-4">
        <button
          onClick={() => router.push('/')}
          className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
      <div className="max-w-xl mx-auto my-auto bg-white rounded-xl shadow-md overflow-hidden p-6 text-black">
        <h1 className="font-semibold text-3xl mb-6">Cybersecurity News</h1>
        {article ? (
          <div>
            <p className="mb-4 text-xl">{(article as any).title}</p>
            <div className="flex justify-start items-center space-x-4">
              <a
                href={(article as any).url}
                onClick={(e) => {
                  e.preventDefault(); 
                  router.push('/');
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white font-bold py-4 px-8 text-xl rounded hover:bg-blue-800 transition duration-300"
              >
                Read More
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white font-bold py-4 px-8 text-xl rounded hover:bg-green-800 transition duration-300"
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
