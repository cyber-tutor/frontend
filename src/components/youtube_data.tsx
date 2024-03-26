import axios from "axios";
import type { AxiosResponse } from "axios";

interface ContentDetails {
  duration: string;
}

interface Item {
  contentDetails?: ContentDetails;
}

interface YouTubeResponse {
  items: Item[];
}

export default async function getVideoDuration(videoUrl: string) {
  try {
    const videoId = new URL(videoUrl).searchParams.get("v");
    if (!videoId) throw new Error("Invalid video URL");

    const response: AxiosResponse<YouTubeResponse> = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          id: videoId,
          part: "contentDetails",
          key: process.env.NEXT_PUBLIC_YOUTUBE_DATA_API_KEY,
        },
      },
    );

    const duration = response.data.items[0]?.contentDetails?.duration;
    if (!duration) throw new Error("Video duration not found");

    return duration;
  } catch (error) {
    console.error("Error fetching video duration:", error);
    throw error;
  }
}
