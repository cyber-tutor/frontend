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
    Each value should be separated by commas. 
    The values in the array should be ordered according to the order of the topics. 

    From the question choices, each choice is ordered alphabetically, like so: starting from a, to b, to c, to d, to e, and continue if more choices.
    Look at the description attribute of the question to determine the proficiency, which maps the proficiency value to the letter of the choice.
   
    If the user answered a behavioral question the way a beginner would (No, I don't know), 
    they should be marked as beginner for that topic, and not be able to answer any knowledge based questions.
    If the user answers all behavioral question as an expert would, then keep track of the user's response to the knowledge questions for that topic.
    When the user answers a knowledge question for a topic and chooses a certain choice that maps to a proficiency level, 
    keep track of that proficiency level, ignoring the ones that are for that topic's behavioral questions.

    If the user answers more knowledge questions for a topic as a intermediate than beginner and expert than they are intermediate for that topic.
    If the user answers more knowledge questions for a topic as a expert than intermediate and beginner than they are expert for that topic.
    If the user answers more knowledge questions for a topic as a beginner than intermediate and expert than they are beginner for that topic.
    If the user equally answers knowledge questions for a topic as a beginner, intermediate, and/or expert, then they are choose the intermediate level for that topic.

    If the question category is knowledge, keep track of whether the user provided an expert response or intermediate or beginner response and point tally them, then assign the value.
    Choose only one of the following options for each topic: beginner, intermediate, or expert. 
    Responses: ${responses}
    `;
    const response = await model.generateContent(prompt);
    const textContent = await response.response.text();
    const proficiency = textContent.trim().toLowerCase();

    // console.log("User Level: ", proficiency);

    return proficiency;
  } catch (error) {
    // console.error("Error determining proficiency:", error);
    return "error"; 
  }
};

export default determineProficiency;
