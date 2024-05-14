import React from "react";
import { FaBook } from "react-icons/fa";

interface NewsCardProps {
  urlToImage: string;
  title: string;
  url: string;
  description: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  urlToImage,
  title,
  url,
  description,
}) => {
  return (
    <div className="mx-auto mb-6 flex max-w-6xl flex-col overflow-hidden rounded-lg shadow-lg md:flex-row">
      {urlToImage && (
        <div className="relative h-64 w-64 md:h-64 md:w-64">
          <img
            src={urlToImage}
            alt="Article"
            className="absolute inset-0 h-full w-full rounded-lg object-cover"
          />
        </div>
      )}
      <div className="flex flex-auto flex-col justify-between p-6">
        <h2 className="mb-4 text-2xl font-semibold md:text-3xl">{title}</h2>
        <p className="text-md mb-4 md:text-lg">{description}</p>
        <div className="mt-4 w-full">
          <button
            onClick={() => window.open(url, "_blank")}
            className="flex w-full items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white transition duration-300 hover:bg-blue-700 md:w-auto md:text-xl"
          >
            <FaBook className="mr-2" /> Read More
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
