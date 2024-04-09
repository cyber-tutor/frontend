// src/components/CyberSecurityNews.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CyberSecurityNews = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          'https://newsapi.org/v2/everything?q=cybersecurity&apiKey=${process.env.NEWS_API_KEY}'
        );
        setArticles(response.data.articles);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

return (
    <div>
        <h1>Cybersecurity News</h1>
        <ul>
            {articles.map((article: {
                url: string | undefined; title: string 
}, index: number) => (
                <li key={index}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);
};

export default CyberSecurityNews;
