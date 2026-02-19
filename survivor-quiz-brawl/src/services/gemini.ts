import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Quiz, QuizGenerationRequest, QuizGenerationResponse } from '../types/quiz';

const QUIZ_GENERATION_PROMPT = `당신은 교육용 퀴즈 생성 전문가입니다.
주어진 텍스트를 분석하여 학습에 도움이 되는 4지선다 퀴즈를 생성해주세요.

규칙:
1. 각 문제는 명확하고 이해하기 쉬워야 합니다
2. 오답 선택지도 그럴듯해야 합니다
3. 정답은 반드시 하나만 있어야 합니다
4. 난이도를 적절히 조절해주세요
5. 한국어로 작성해주세요

다음 JSON 형식으로 정확히 응답해주세요:
{
  "quizzes": [
    {
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctIndex": 0,
      "explanation": "정답 설명",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

생성할 문제 수: {count}개
난이도: {difficulty}

텍스트 내용:
{content}`;

export async function generateQuizzes(
  apiKey: string,
  request: QuizGenerationRequest
): Promise<QuizGenerationResponse> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = QUIZ_GENERATION_PROMPT
      .replace('{count}', request.count.toString())
      .replace('{difficulty}', request.difficulty || 'mixed')
      .replace('{content}', request.content);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.quizzes || !Array.isArray(parsed.quizzes)) {
      throw new Error('Invalid quiz format');
    }

    // Validate and add IDs
    const quizzes: Quiz[] = parsed.quizzes.map((q: any, index: number) => ({
      id: `quiz_${Date.now()}_${index}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      category: q.category,
    }));

    return {
      success: true,
      quizzes,
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateQuizzesInChunks(
  apiKey: string,
  content: string,
  totalCount: number,
  chunkSize: number = 10,
  onProgress?: (progress: number) => void
): Promise<QuizGenerationResponse> {
  const allQuizzes: Quiz[] = [];
  const chunks = Math.ceil(totalCount / chunkSize);

  for (let i = 0; i < chunks; i++) {
    const count = Math.min(chunkSize, totalCount - i * chunkSize);

    // Use different part of content for each chunk
    const contentChunks = splitContent(content, chunks);
    const chunkContent = contentChunks[i] || content;

    const result = await generateQuizzes(apiKey, {
      content: chunkContent,
      count,
      difficulty: 'mixed',
    });

    if (!result.success) {
      return result;
    }

    allQuizzes.push(...(result.quizzes || []));

    // Progress callback
    if (onProgress) {
      onProgress(((i + 1) / chunks) * 100);
    }

    // Rate limiting delay
    if (i < chunks - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return {
    success: true,
    quizzes: allQuizzes,
  };
}

function splitContent(content: string, parts: number): string[] {
  const words = content.split(/\s+/);
  const chunkSize = Math.ceil(words.length / parts);
  const chunks: string[] = [];

  for (let i = 0; i < parts; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(' '));
  }

  return chunks;
}
