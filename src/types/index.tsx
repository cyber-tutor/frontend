export interface Topic {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  order: number;
  isComplete: boolean;
  chapters: Chapter[];
}

export interface Chapter {
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  chapterType: string;
  controlGroupContent: GroupContent;
  controlGroupVideoURLs: GroupVideoURLs;
  controlGroupImageURLs: string[];
  experimentalGroupContent: GroupContent;
  experimentalGroupVideoURLs: GroupVideoURLs;
  experimentalGroupImageURLs: string[];
  order: number;
  proficiency: number;
}

interface GroupContent {
  beginner: string;
  intermediate: string;
  expert: string;
}

interface GroupVideoURLs {
  beginner: string;
  intermediate: string;
  expert: string;
}

export interface User {
  userId: string;
  group: string;
  name: string;
  initialSurveyComplete: boolean;
  contentPreference: string;
  isSuperuser: boolean;
}

export interface UserProgress {
  chapterId: string;
  complete: boolean;
  topicId: string;
  attempts: { [key: string]: Attempt };
}

interface Attempt {
  timeElapsed: string;
}

export interface UserProficiency {
  topicId: string;
  proficiency: string;
}

export interface UserLevel {
  topicId: string;
  level: number;
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  choices: { a: string; b: string; c: string; d: string };
  answer: string;
  topicId: string;
  chapterId: string;
  difficulty: string;
  explanation: string;
  topics: string[];
  fromChapter: string;
}

export interface SurveyQuestion {
  questionId: string;
  question: string;
  questionCategory: string;
  questionType: string;
  choices: { a: string; b: string; c: string; d: string };
  answer: string;
  difficulty: string;
  explanation: string;
}

export interface DemographicQuestionResponse {
  userId: string;
  response: string;
}
