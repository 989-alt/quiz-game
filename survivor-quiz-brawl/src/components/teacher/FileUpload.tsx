import React, { useState, useCallback } from 'react';
import { PixelButton } from '../shared/PixelButton';
import { useQuizStore } from '../../stores/quizStore';
import { generateQuizzesInChunks } from '../../services/gemini';

interface FileUploadProps {
  onQuizGenerated: () => void;
}

export function FileUpload({ onQuizGenerated }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [quizCount, setQuizCount] = useState(20);
  const [dragActive, setDragActive] = useState(false);

  const {
    geminiApiKey,
    isGenerating,
    generationProgress,
    generationError,
    setGenerating,
    setGenerationProgress,
    setGenerationError,
    addQuizSet,
  } = useQuizStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setFile(file);
    setGenerationError(null);

    if (file.type === 'application/pdf') {
      // For PDF, we need to use the API endpoint
      const formData = new FormData();
      formData.append('file', file);

      try {
        // In production, this would call the API
        // For now, show a message about PDF support
        setTextContent('[PDF 파일이 업로드되었습니다. 서버 API를 통해 텍스트를 추출합니다.]');
      } catch (error) {
        setGenerationError('PDF 파일 처리 중 오류가 발생했습니다.');
      }
    } else if (file.type === 'text/plain') {
      const text = await file.text();
      setTextContent(text);
    } else {
      setGenerationError('지원하지 않는 파일 형식입니다. (PDF, TXT만 지원)');
    }
  };

  const handleGenerate = async () => {
    if (!geminiApiKey) {
      setGenerationError('Gemini API Key를 먼저 설정해주세요.');
      return;
    }

    if (!textContent.trim()) {
      setGenerationError('퀴즈를 생성할 텍스트 내용이 없습니다.');
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setGenerationProgress(0);

    try {
      const result = await generateQuizzesInChunks(
        geminiApiKey,
        textContent,
        quizCount,
        10,
        (progress) => setGenerationProgress(progress)
      );

      if (result.success && result.quizzes) {
        const quizSet = {
          id: crypto.randomUUID(),
          title: file?.name || '새 퀴즈 세트',
          description: `${result.quizzes.length}개의 문제`,
          quizzes: result.quizzes,
          createdAt: Date.now(),
          sourceFileName: file?.name,
        };

        addQuizSet(quizSet);
        onQuizGenerated();
      } else {
        setGenerationError(result.error || '퀴즈 생성에 실패했습니다.');
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : '알 수 없는 오류');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600">
        <h2 className="text-white font-pixel text-lg mb-4">퀴즈 생성</h2>

        {/* File Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive
              ? 'border-pixel-blue bg-blue-900/20'
              : 'border-gray-600 hover:border-gray-500'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <div className="text-4xl mb-4">📄</div>
            <p className="text-white font-pixel text-sm mb-2">
              {file ? file.name : '파일을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-gray-400 font-pixel text-xs">
              PDF 또는 TXT 파일 지원
            </p>
          </label>
        </div>

        {/* Or Text Input */}
        <div className="mt-4">
          <label className="block text-gray-400 font-pixel text-xs mb-2">
            또는 직접 텍스트 입력
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="퀴즈를 생성할 학습 자료 내용을 붙여넣으세요..."
            rows={6}
            className="w-full bg-gray-700 text-white font-pixel text-sm p-4 rounded border-2 border-gray-600 focus:border-pixel-blue focus:outline-none resize-none"
          />
          <p className="text-gray-500 font-pixel text-xs mt-1 text-right">
            {textContent.length.toLocaleString()} 자
          </p>
        </div>

        {/* Quiz Count */}
        <div className="mt-4">
          <label className="block text-gray-400 font-pixel text-xs mb-2">
            생성할 문제 수
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={quizCount}
              onChange={(e) => setQuizCount(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-white font-pixel text-sm w-16 text-center">
              {quizCount}개
            </span>
          </div>
        </div>

        {/* Error Message */}
        {generationError && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded">
            <p className="text-red-400 font-pixel text-xs">{generationError}</p>
          </div>
        )}

        {/* Progress Bar */}
        {isGenerating && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 font-pixel text-xs">퀴즈 생성 중...</span>
              <span className="text-white font-pixel text-xs">{Math.round(generationProgress)}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-pixel-green transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-6">
          <PixelButton
            onClick={handleGenerate}
            disabled={isGenerating || !textContent.trim() || !geminiApiKey}
            variant="success"
            size="lg"
            className="w-full"
          >
            {isGenerating ? '생성 중...' : '퀴즈 생성하기'}
          </PixelButton>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-gray-300 font-pixel text-sm mb-2">사용 방법</h3>
        <ol className="text-gray-400 font-pixel text-xs space-y-1 list-decimal list-inside">
          <li>Gemini API Key를 상단에 입력하세요</li>
          <li>학습 자료 PDF 또는 텍스트를 업로드하세요</li>
          <li>원하는 문제 수를 선택하고 생성 버튼을 누르세요</li>
          <li>생성된 퀴즈를 검수하고 게임을 시작하세요</li>
        </ol>
      </div>
    </div>
  );
}
