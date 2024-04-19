import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { get } from 'http';
import { useRouter } from 'next/router';

const CyberSecurityNews = () => {
  const [article, setArticle] = useState(null);

  useEffect(() => {
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
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };
  const router = useRouter();
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-4">
      <h1 className="font-semibold text-xl mb-4">Cybersecurity News</h1>
      {article ? (
        <div>
          {article && <p className="mb-2">{(article as any).title}</p>}
          <a
            href={(article as any).url}
            onClick={(e) => {
              
              router.push('/');
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Read More
          </a>
          <button
            onClick={refreshPage}
            className="ml-4 inline-block bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300"
          >
            Give me a different article
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CyberSecurityNews;
