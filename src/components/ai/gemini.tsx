import { GoogleGenerativeAI } from '@google/generative-ai';

const determineProficiency = async (responses: string): Promise<string> => {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? process.env.NEXT_PUBLIC_GOOGLE_API_KEY : "");

  console.log("User responses: ",responses);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
    Based on the provided responses, determine the user's proficiency level. 
    Please return an array with values for each topic. There are 5 topics: 
    Two-Factor Authentication, Phishing, Password Security, Software Updates, and Online Privacy. 
    For Software Updates, just put beginner, because there aren't any questions for it yet.
    Each value should be enclosed in square brackets and separated by commas. 
    The values in the array should be ordered according to the order of the topics. 
    The value should be intermediate only if the user got half of the questions for the topic correct in the knowledge based questions.
    If the user did not answer the questions, the value should be beginner.
    If there is no correct answer to the question, then it behavioral and only determine the proficiency based on the user's response.
    Choose one of the following options for each topic: beginner, intermediate, or expert. 
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
