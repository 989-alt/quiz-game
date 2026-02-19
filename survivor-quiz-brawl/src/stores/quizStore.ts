import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quiz, QuizSet, QuizResult } from '../types/quiz';
import { SoloQuizGenerator } from '../game/utils/SoloQuizGenerator';
import { SPELLING_QUIZZES, IDIOM_QUIZZES } from '../game/utils/SoloQuizData';

interface QuizState {
  // Quiz sets
  quizSets: QuizSet[];
  currentQuizSet: QuizSet | null;

  // Current quiz session
  currentQuizIndex: number;
  quizResults: QuizResult[];

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generationError: string | null;

  // API Key
  geminiApiKey: string | null;

  // Actions
  setGeminiApiKey: (key: string) => void;
  clearGeminiApiKey: () => void;

  addQuizSet: (quizSet: QuizSet) => void;
  removeQuizSet: (id: string) => void;
  updateQuizSet: (id: string, updates: Partial<QuizSet>) => void;
  setCurrentQuizSet: (quizSet: QuizSet | null) => void;

  // Quiz editing
  addQuiz: (setId: string, quiz: Quiz) => void;
  updateQuiz: (setId: string, quizId: string, updates: Partial<Quiz>) => void;
  removeQuiz: (setId: string, quizId: string) => void;
  reorderQuizzes: (setId: string, fromIndex: number, toIndex: number) => void;

  // Quiz session
  startQuizSession: (quizSet: QuizSet) => void;
  getCurrentQuiz: () => Quiz | null;
  submitAnswer: (selectedIndex: number, timeSpent: number) => boolean;
  nextQuiz: () => boolean;
  getQuizResults: () => QuizResult[];
  resetQuizSession: () => void;

  // Generation
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGenerationError: (error: string | null) => void;
  // ... inside interface
  generateSoloQuizSet: (config: { topic: string; grade?: number }) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizSets: [],

      generateSoloQuizSet: (config) => {
        const { topic, grade } = config;
        let quizzes: import('../types/quiz').Quiz[] = [];
        const quizCount = 20;

        if (topic === 'math') {
          for (let i = 0; i < quizCount; i++) {
            const q = SoloQuizGenerator.generateMathQuiz(grade || 1);
            quizzes.push({
              id: `math-${Date.now()}-${i}`,
              question: q.question!,
              options: q.options!,
              correctIndex: q.correctIndex!,
              difficulty: 'medium',
              timeLimit: 10,
            } as any);
          }
        } else if (topic === 'spelling' || topic === 'idiom') {
          const source = topic === 'spelling' ? SPELLING_QUIZZES : IDIOM_QUIZZES;
          // Shuffle and pick
          const shuffled = [...source].sort(() => 0.5 - Math.random()).slice(0, quizCount);
          quizzes = shuffled.map((q: any, i: number) => ({
            id: `${topic}-${Date.now()}-${i}`,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            difficulty: 'medium',
            timeLimit: 10,
          } as any));
        }

        const soloSet: QuizSet = {
          id: `solo-${Date.now()}`,
          title: `솔로 플레이: ${topic === 'math' ? `수학 (${grade}학년)` : topic === 'spelling' ? '맞춤법' : '속담'}`,
          quizzes,
          createdAt: new Date().toISOString(),
        };

        set({ currentQuizSet: soloSet, currentQuizIndex: 0, quizResults: [] });
      },
      // ... rest of store

      currentQuizSet: null,
      currentQuizIndex: 0,
      quizResults: [],
      isGenerating: false,
      generationProgress: 0,
      generationError: null,
      geminiApiKey: null,

      setGeminiApiKey: (key: string) => set({ geminiApiKey: key }),

      clearGeminiApiKey: () => set({ geminiApiKey: null }),

      addQuizSet: (quizSet: QuizSet) => {
        set((state) => ({
          quizSets: [...state.quizSets, quizSet],
        }));
      },

      removeQuizSet: (id: string) => {
        set((state) => ({
          quizSets: state.quizSets.filter((qs) => qs.id !== id),
          currentQuizSet: state.currentQuizSet?.id === id ? null : state.currentQuizSet,
        }));
      },

      updateQuizSet: (id: string, updates: Partial<QuizSet>) => {
        set((state) => ({
          quizSets: state.quizSets.map((qs) =>
            qs.id === id ? { ...qs, ...updates } : qs
          ),
          currentQuizSet:
            state.currentQuizSet?.id === id
              ? { ...state.currentQuizSet, ...updates }
              : state.currentQuizSet,
        }));
      },

      setCurrentQuizSet: (quizSet: QuizSet | null) => {
        set({ currentQuizSet: quizSet });
      },

      addQuiz: (setId: string, quiz: Quiz) => {
        set((state) => ({
          quizSets: state.quizSets.map((qs) =>
            qs.id === setId
              ? { ...qs, quizzes: [...qs.quizzes, quiz] }
              : qs
          ),
        }));
      },

      updateQuiz: (setId: string, quizId: string, updates: Partial<Quiz>) => {
        set((state) => ({
          quizSets: state.quizSets.map((qs) =>
            qs.id === setId
              ? {
                ...qs,
                quizzes: qs.quizzes.map((q) =>
                  q.id === quizId ? { ...q, ...updates } : q
                ),
              }
              : qs
          ),
        }));
      },

      removeQuiz: (setId: string, quizId: string) => {
        set((state) => ({
          quizSets: state.quizSets.map((qs) =>
            qs.id === setId
              ? { ...qs, quizzes: qs.quizzes.filter((q) => q.id !== quizId) }
              : qs
          ),
        }));
      },

      reorderQuizzes: (setId: string, fromIndex: number, toIndex: number) => {
        set((state) => ({
          quizSets: state.quizSets.map((qs) => {
            if (qs.id !== setId) return qs;
            const quizzes = [...qs.quizzes];
            const [removed] = quizzes.splice(fromIndex, 1);
            quizzes.splice(toIndex, 0, removed);
            return { ...qs, quizzes };
          }),
        }));
      },

      startQuizSession: (quizSet: QuizSet) => {
        set({
          currentQuizSet: quizSet,
          currentQuizIndex: 0,
          quizResults: [],
        });
      },

      getCurrentQuiz: () => {
        const { currentQuizSet, currentQuizIndex } = get();
        if (!currentQuizSet || currentQuizIndex >= currentQuizSet.quizzes.length) {
          return null;
        }
        return currentQuizSet.quizzes[currentQuizIndex];
      },

      submitAnswer: (selectedIndex: number, timeSpent: number) => {
        const quiz = get().getCurrentQuiz();
        if (!quiz) return false;

        const isCorrect = selectedIndex === quiz.correctIndex;
        const result: QuizResult = {
          quizId: quiz.id,
          selectedIndex,
          isCorrect,
          timeSpent,
        };

        set((state) => ({
          quizResults: [...state.quizResults, result],
        }));

        return isCorrect;
      },

      nextQuiz: () => {
        const { currentQuizSet, currentQuizIndex } = get();
        if (!currentQuizSet) return false;

        if (currentQuizIndex + 1 >= currentQuizSet.quizzes.length) {
          return false;
        }

        set({ currentQuizIndex: currentQuizIndex + 1 });
        return true;
      },

      getQuizResults: () => get().quizResults,

      resetQuizSession: () => {
        set({
          currentQuizIndex: 0,
          quizResults: [],
        });
      },

      setGenerating: (isGenerating: boolean) => set({ isGenerating }),

      setGenerationProgress: (progress: number) => set({ generationProgress: progress }),

      setGenerationError: (error: string | null) => set({ generationError: error }),
    }),
    {
      name: 'survivor-quiz-storage',
      partialize: (state) => ({
        quizSets: state.quizSets,
        geminiApiKey: state.geminiApiKey,
      }),
    }
  )
);
