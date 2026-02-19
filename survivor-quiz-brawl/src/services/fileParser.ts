import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import JSZip from 'jszip';
import type { FileParseResult, FileParseProgress } from '../types/quiz';

// PDF.js worker 설정 - unpkg CDN 사용 (CORS 지원)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB

export function getFileType(fileName: string): 'pdf' | 'pptx' | 'txt' | 'md' | null {
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'pptx') return 'pptx';
  if (ext === 'txt') return 'txt';
  if (ext === 'md') return 'md';
  return null;
}

export function isFileSizeValid(file: File): { valid: boolean; message?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, message: `파일 크기가 50MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)` };
  }
  return { valid: true };
}

export function isLargeFile(file: File): boolean {
  return file.size > LARGE_FILE_THRESHOLD;
}

/**
 * PDF 파일에서 텍스트 추출
 */
export async function parsePDF(
  file: File,
  onProgress?: (progress: FileParseProgress) => void
): Promise<FileParseResult> {
  try {
    onProgress?.({ stage: 'loading', progress: 0, message: 'PDF 파일 로딩 중...' });

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.({ stage: 'loading', progress: 20, message: 'PDF 문서 파싱 중...' });

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const textParts: string[] = [];

    onProgress?.({ stage: 'extracting', progress: 30, message: `총 ${numPages} 페이지 추출 시작...` });

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => item.str)
        .join(' ');
      textParts.push(pageText);

      const progressPercent = 30 + Math.round((i / numPages) * 65);
      onProgress?.({
        stage: 'extracting',
        progress: progressPercent,
        message: `페이지 ${i}/${numPages} 추출 중...`,
      });
    }

    const fullText = textParts.join('\n\n').trim();

    if (!fullText) {
      return {
        success: false,
        error: '텍스트를 추출할 수 없습니다. 이미지 기반 PDF일 수 있습니다. (OCR 미지원)',
      };
    }

    onProgress?.({ stage: 'complete', progress: 100, message: '추출 완료!' });

    return {
      success: true,
      text: fullText,
      fileName: file.name,
      fileType: 'pdf',
      pageCount: numPages,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';

    if (errorMessage.includes('password')) {
      return { success: false, error: '암호화된 PDF 파일입니다. 암호 해제 후 다시 시도해주세요.' };
    }

    return { success: false, error: `PDF 파싱 실패: ${errorMessage}` };
  }
}

/**
 * PPTX 파일에서 텍스트 추출
 */
export async function parsePPTX(
  file: File,
  onProgress?: (progress: FileParseProgress) => void
): Promise<FileParseResult> {
  try {
    onProgress?.({ stage: 'loading', progress: 0, message: 'PPTX 파일 로딩 중...' });

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.({ stage: 'loading', progress: 20, message: 'ZIP 압축 해제 중...' });

    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles: string[] = [];

    // 슬라이드 파일 찾기 (ppt/slides/slide1.xml, slide2.xml, ...)
    zip.forEach((relativePath) => {
      if (relativePath.match(/^ppt\/slides\/slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });

    // 슬라이드 번호순 정렬
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });

    if (slideFiles.length === 0) {
      return { success: false, error: '슬라이드를 찾을 수 없습니다. 올바른 PPTX 파일인지 확인해주세요.' };
    }

    onProgress?.({ stage: 'extracting', progress: 30, message: `총 ${slideFiles.length} 슬라이드 추출 시작...` });

    const textParts: string[] = [];

    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const content = await zip.file(slideFile)?.async('string');

      if (content) {
        // XML에서 텍스트 추출 (<a:t> 태그 내용)
        const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
        const slideText = textMatches
          .map((match) => match.replace(/<\/?a:t>/g, ''))
          .filter((text) => text.trim())
          .join(' ');

        if (slideText.trim()) {
          textParts.push(`[슬라이드 ${i + 1}]\n${slideText}`);
        }
      }

      const progressPercent = 30 + Math.round(((i + 1) / slideFiles.length) * 65);
      onProgress?.({
        stage: 'extracting',
        progress: progressPercent,
        message: `슬라이드 ${i + 1}/${slideFiles.length} 추출 중...`,
      });
    }

    const fullText = textParts.join('\n\n').trim();

    if (!fullText) {
      return { success: false, error: '텍스트를 추출할 수 없습니다. 이미지만 있는 슬라이드일 수 있습니다.' };
    }

    onProgress?.({ stage: 'complete', progress: 100, message: '추출 완료!' });

    return {
      success: true,
      text: fullText,
      fileName: file.name,
      fileType: 'pptx',
      pageCount: slideFiles.length,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
    return { success: false, error: `PPTX 파싱 실패: ${errorMessage}` };
  }
}

/**
 * 텍스트 파일 읽기 (txt, md)
 */
export async function parseTextFile(
  file: File,
  onProgress?: (progress: FileParseProgress) => void
): Promise<FileParseResult> {
  return new Promise((resolve) => {
    onProgress?.({ stage: 'loading', progress: 0, message: '텍스트 파일 로딩 중...' });

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      onProgress?.({ stage: 'complete', progress: 100, message: '로딩 완료!' });

      resolve({
        success: true,
        text,
        fileName: file.name,
        fileType: file.name.endsWith('.md') ? 'md' : 'txt',
      });
    };

    reader.onerror = () => {
      resolve({ success: false, error: '파일을 읽을 수 없습니다.' });
    };

    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * 통합 파일 파서 - 확장자에 따라 자동 분기
 */
export async function parseFile(
  file: File,
  onProgress?: (progress: FileParseProgress) => void
): Promise<FileParseResult> {
  // 파일 크기 검증
  const sizeCheck = isFileSizeValid(file);
  if (!sizeCheck.valid) {
    return { success: false, error: sizeCheck.message };
  }

  // 파일 타입 확인
  const fileType = getFileType(file.name);

  if (!fileType) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'ppt') {
      return {
        success: false,
        error: '레거시 .ppt 파일은 지원되지 않습니다. PowerPoint에서 .pptx로 다시 저장해주세요.'
      };
    }
    return { success: false, error: '지원하지 않는 파일 형식입니다. (지원: .txt, .md, .pdf, .pptx)' };
  }

  switch (fileType) {
    case 'pdf':
      return parsePDF(file, onProgress);
    case 'pptx':
      return parsePPTX(file, onProgress);
    case 'txt':
    case 'md':
      return parseTextFile(file, onProgress);
    default:
      return { success: false, error: '지원하지 않는 파일 형식입니다.' };
  }
}
