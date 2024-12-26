import axios from "axios";

const fetchNews = async () => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=cybersecurity&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching news");
  }
};

export default fetchNews;
