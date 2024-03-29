import { GoogleGenerativeAI } from '@google/generative-ai';

const determineProficiency = async (responses: string): Promise<string> => {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? process.env.NEXT_PUBLIC_GOOGLE_API_KEY : "");

  console.log("User responses: ",responses);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
    Based on the provided responses from the user, determine the user's proficiency level. 
    Please return an array with values for each topic. There are 5 topics: 
    Two-Factor Authentication, Phishing, Password Security, Software Updates, and Online Privacy. 
    Each value should be enclosed in square brackets and separated by commas. 
    The values in the array should be ordered according to the order of the topics. 

    Look at the description attribute of the question to determine the proficiency.
    If the user answered a behavioral question the way a beginner would (No, I don't know), they should be marked as beginner for that topic.
    If the user answers a behavioral question as yes, then keep track of the user's response to the knowledge questions for that topic.

    From the question choices, each choice is ordered alphabetically, like so: starting from a, to b, to c, to d, to e, and continue if more choices.



    If the question category is knowledge, keep track of whether the user provided an expert response or intermediate or beginner response and point tally them, then assign the value.
    If the user did not answer the questions, the value should be beginner.
    Choose only one of the following options for each topic: beginner, intermediate, or expert. 
    Responses: ${responses}
    `;
    const response = await model.generateContent(prompt);
    const textContent = await response.response.text();
    const proficiency = textContent.trim().toLowerCase();

    console.log("User Level: ", proficiency);

    return proficiency;
  } catch (error) {
    console.error("Error determining proficiency:", error);
    return "error"; 
  }
};

export default determineProficiency;
