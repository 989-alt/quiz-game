export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description?: string;
  quizzes: Quiz[];
  createdAt: number;
  sourceFileName?: string;
}

export interface QuizResult {
  quizId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizGenerationRequest {
  content: string;
  count: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  language?: 'ko' | 'en';
}

export interface QuizGenerationResponse {
  success: boolean;
  quizzes?: Quiz[];
  error?: string;
}

export interface PDFParseResult {
  success: boolean;
  text?: string;
  pageCount?: number;
  error?: string;
}
