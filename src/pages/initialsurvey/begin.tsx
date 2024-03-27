import React from 'react';
import { useRouter } from "next/router";

export default function InitialSurvey() {
    

    const router = useRouter();

    const handleRouter = () => {
        router.push('/initialsurvey/survey');
    };

    return (
        <div className="bg-gray-800 flex justify-center items-center h-screen">
            <div className="text-center animate-fadeIn">
                <h1 className="text-white text-3xl mb-4">Let's get to know how much cyber security you know</h1>
                <button onClick={handleRouter} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    Start
                </button>
            </div>
        </div>
    );
}


