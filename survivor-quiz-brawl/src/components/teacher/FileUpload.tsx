import React, { useState, useRef } from 'react';
import { PixelButton } from '../shared/PixelButton';
import { generateQuizzes } from '../../services/gemini';
import { parseFile, isLargeFile, getFileType } from '../../services/fileParser';
import { useQuizStore } from '../../stores/quizStore';
import type { QuizSet, FileParseProgress } from '../../types/quiz';

interface ParsedFile {
  id: string;
  name: string;
  text: string;
  pageCount?: number;
  fileType: 'pdf' | 'pptx' | 'txt' | 'md';
}

interface FileUploadProps {
  apiKey: string;
  onQuizGenerated: (quizSet: QuizSet) => void;
}

export function FileUpload({ apiKey, onQuizGenerated }: FileUploadProps) {
  const { addQuizSet } = useQuizStore();
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [manualText, setManualText] = useState('');
  const [quizCount, setQuizCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState<FileParseProgress | null>(null);
  const [currentParsingFile, setCurrentParsingFile] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모든 텍스트 합치기 (파일들 + 수동 입력)
  const getCombinedText = () => {
    const fileTexts = parsedFiles.map(f => `[${f.name}]\n${f.text}`).join('\n\n---\n\n');
    const combined = [fileTexts, manualText].filter(Boolean).join('\n\n---\n\n');
    return combined.trim();
  };

  const handleFiles = async (files: FileList) => {
    setError('');
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // 파일 타입 검증
      const fileType = getFileType(file.name);
      if (!fileType) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'ppt') {
          setError(prev => prev + (prev ? '\n' : '') + `${file.name}: 레거시 .ppt 파일은 지원되지 않습니다.`);
        } else {
          setError(prev => prev + (prev ? '\n' : '') + `${file.name}: 지원하지 않는 파일 형식입니다.`);
        }
        continue;
      }

      // 중복 파일 체크
      if (parsedFiles.some(f => f.name === file.name)) {
        setError(prev => prev + (prev ? '\n' : '') + `${file.name}: 이미 추가된 파일입니다.`);
        continue;
      }

      // 대용량 파일 경고
      if (isLargeFile(file)) {
        console.log(`대용량 파일 감지: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      }

      setIsParsing(true);
      setCurrentParsingFile(file.name);
      setParseProgress({ stage: 'loading', progress: 0, message: '파일 로딩 중...' });

      try {
        const result = await parseFile(file, (progress) => {
          setParseProgress(progress);
        });

        if (result.success && result.text) {
          const newFile: ParsedFile = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            text: result.text,
            pageCount: result.pageCount,
            fileType: result.fileType!,
          };
          setParsedFiles(prev => [...prev, newFile]);
        } else {
          setError(prev => prev + (prev ? '\n' : '') + `${file.name}: ${result.error || '파싱 실패'}`);
        }
      } catch (err) {
        setError(prev => prev + (prev ? '\n' : '') + `${file.name}: ${err instanceof Error ? err.message : '오류 발생'}`);
      }
    }

    setIsParsing(false);
    setParseProgress(null);
    setCurrentParsingFile('');
  };

  const removeFile = (fileId: string) => {
    setParsedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Gemini API 키를 먼저 입력해주세요!');
      return;
    }

    const combinedText = getCombinedText();
    if (!combinedText) {
      setError('텍스트를 입력하거나 파일을 업로드해주세요!');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError('');

    try {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 15, 90));
      }, 500);

      const result = await generateQuizzes(apiKey, { content: combinedText, count: quizCount, difficulty: 'mixed' });
      clearInterval(interval);
      setProgress(100);

      if (!result.success || !result.quizzes) {
        throw new Error(result.error || '퀴즈 생성에 실패했습니다.');
      }

      const title = parsedFiles.length > 0
        ? parsedFiles.length === 1
          ? parsedFiles[0].name
          : `${parsedFiles[0].name} 외 ${parsedFiles.length - 1}개`
        : '새 퀴즈 세트';

      const quizSet: QuizSet = {
        id: `qs_${Date.now()}`,
        title,
        quizzes: result.quizzes,
        createdAt: Date.now(),
      };
      addQuizSet(quizSet);
      setTimeout(() => onQuizGenerated(quizSet), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '퀴즈 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '📕';
      case 'pptx': return '📊';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  return (
    <div className="pixel-card" style={{ padding: 'clamp(16px, 3vw, 36px)', maxWidth: 'clamp(400px, 50vw, 700px)', margin: '0 auto' }}>
      <h3 className="font-pixel" style={{
        fontSize: 'clamp(10px, 1.3vw, 16px)',
        color: '#fdcb6e',
        marginBottom: 'clamp(16px, 2.5vw, 28px)',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(6px, 0.8vw, 12px)',
      }}>
        <span style={{ fontSize: 'clamp(16px, 2vw, 28px)' }}>📄</span>
        학습 자료 업로드
      </h3>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        style={{
          padding: 'clamp(24px, 4vw, 48px) clamp(16px, 2vw, 32px)',
          borderRadius: '16px',
          border: `2px dashed ${isDragOver ? '#9b59b6' : 'rgba(255,255,255,0.15)'}`,
          background: isDragOver ? 'rgba(155,89,182,0.1)' : 'rgba(255,255,255,0.03)',
          textAlign: 'center',
          cursor: isParsing ? 'wait' : 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: 'clamp(16px, 2.5vw, 28px)',
          opacity: isParsing ? 0.7 : 1,
        }}
      >
        <div style={{ fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: 'clamp(8px, 1vw, 16px)', animation: isParsing ? 'none' : 'bounce-slow 2s ease-in-out infinite' }}>
          {isParsing ? '⏳' : '📁'}
        </div>
        <p className="font-pixel" style={{ fontSize: 'clamp(7px, 0.9vw, 11px)', color: '#b8b5c8', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
          {isParsing ? `${currentParsingFile} 처리 중...` : '파일을 드래그하거나 클릭하세요 (다중 선택 가능)'}
        </p>
        <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 8px)', color: '#6c6783' }}>
          .txt, .md, .pdf, .pptx 지원
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.pptx"
          multiple
          onChange={(e) => e.target.files && e.target.files.length > 0 && handleFiles(e.target.files)}
          style={{ display: 'none' }}
          disabled={isParsing}
        />
      </div>

      {/* Parsing Progress */}
      {isParsing && parseProgress && (
        <div style={{ marginBottom: 'clamp(12px, 1.5vw, 20px)' }}>
          <div style={{
            width: '100%',
            height: 'clamp(8px, 1vw, 14px)',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${parseProgress.progress}%`,
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #3498db, #1abc9c)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 8px)', color: '#b8b5c8', marginTop: 'clamp(4px, 0.5vw, 8px)', textAlign: 'center' }}>
            📂 {parseProgress.message} {Math.round(parseProgress.progress)}%
          </p>
        </div>
      )}

      {/* Uploaded Files List */}
      {parsedFiles.length > 0 && (
        <div style={{ marginBottom: 'clamp(16px, 2vw, 24px)' }}>
          <label className="font-pixel" style={{
            fontSize: 'clamp(7px, 0.8vw, 10px)',
            color: '#b8b5c8',
            display: 'block',
            marginBottom: 'clamp(6px, 0.8vw, 10px)',
          }}>
            업로드된 파일 ({parsedFiles.length}개):
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parsedFiles.map((file) => (
              <div
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(8px, 1vw, 12px)',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}>{getFileIcon(file.fileType)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="font-pixel" style={{
                      fontSize: 'clamp(6px, 0.7vw, 9px)',
                      color: '#e0e0e0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {file.name}
                    </p>
                    <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 7px)', color: '#6c6783' }}>
                      {file.pageCount ? `${file.pageCount}페이지` : `${(file.text.length / 1000).toFixed(1)}K 글자`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  style={{
                    background: 'rgba(214,48,49,0.2)',
                    border: '1px solid rgba(214,48,49,0.4)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    color: '#ff7675',
                    fontSize: 'clamp(10px, 1vw, 14px)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(214,48,49,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(214,48,49,0.2)';
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text Input */}
      <div style={{ marginBottom: 'clamp(16px, 2vw, 24px)' }}>
        <label className="font-pixel" style={{
          fontSize: 'clamp(7px, 0.8vw, 10px)',
          color: '#b8b5c8',
          display: 'block',
          marginBottom: 'clamp(6px, 0.8vw, 10px)',
        }}>
          추가 텍스트 입력 (선택):
        </label>
        <textarea
          className="pixel-input"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="추가 학습 내용을 여기에 붙여넣으세요..."
          style={{
            width: '100%',
            minHeight: 'clamp(60px, 10vw, 120px)',
            resize: 'vertical',
            fontSize: 'clamp(7px, 0.8vw, 10px)',
            padding: 'clamp(8px, 1vw, 14px)',
          }}
        />
      </div>

      {/* Quiz Count */}
      <div style={{ marginBottom: 'clamp(16px, 2vw, 24px)' }}>
        <label className="font-pixel" style={{ fontSize: 'clamp(7px, 0.8vw, 10px)', color: '#b8b5c8', display: 'block', marginBottom: 'clamp(6px, 0.8vw, 10px)' }}>
          퀴즈 개수: <span style={{ color: '#fdcb6e' }}>{quizCount}개</span>
        </label>
        <input
          type="range" min={5} max={30} step={5}
          value={quizCount}
          onChange={(e) => setQuizCount(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#9b59b6' }}
        />
      </div>

      {/* Progress */}
      {isGenerating && (
        <div style={{ marginBottom: 'clamp(12px, 1.5vw, 20px)' }}>
          <div style={{
            width: '100%',
            height: 'clamp(8px, 1vw, 14px)',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #9b59b6, #e84393, #fdcb6e)',
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 2s ease infinite',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 8px)', color: '#b8b5c8', marginTop: 'clamp(4px, 0.5vw, 8px)', textAlign: 'center' }}>
            🤖 AI가 퀴즈를 생성하고 있습니다... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: 'clamp(8px, 1vw, 14px)',
          borderRadius: '12px',
          background: 'rgba(214,48,49,0.1)',
          border: '1px solid rgba(214,48,49,0.3)',
          marginBottom: 'clamp(12px, 1.5vw, 20px)',
          animation: 'shake 0.4s ease-in-out',
          maxHeight: '100px',
          overflowY: 'auto',
        }}>
          <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 9px)', color: '#ff7675', whiteSpace: 'pre-line' }}>
            ❌ {error}
          </p>
        </div>
      )}

      {/* Generate Button */}
      <PixelButton
        onClick={handleGenerate}
        disabled={isGenerating || isParsing || !getCombinedText()}
        variant="primary"
        size="lg"
        className="w-full"
      >
        {isGenerating ? '⏳ 생성 중...' : '✨ AI 퀴즈 생성'}
      </PixelButton>
    </div>
  );
}
