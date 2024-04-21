import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const newsApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=cybersecurity&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY}`,
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching news" });
  }
};

export default newsApiHandler;
