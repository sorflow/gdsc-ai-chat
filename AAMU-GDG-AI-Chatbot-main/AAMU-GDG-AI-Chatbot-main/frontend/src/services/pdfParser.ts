import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export const MAX_PDF_BYTES = 15 * 1024 * 1024;

export type PdfErrorCode = 'too-large' | 'invalid-type' | 'invalid-signature' | 'encrypted' | 'no-text' | 'corrupt' | 'irrelevant';

export class PdfProcessingError extends Error {
  constructor(public readonly code: PdfErrorCode, message: string) {
    super(message);
    this.name = 'PdfProcessingError';
  }
}

export interface ParsedDegreeWorks {
  gpa: number;
  totalCredits: number;
  completedCourses: string[];
  ongoingCourses: string[];
  major: string;
  studentName: string;
  studentId: string;
}

export const validatePdfFile = async (file: File): Promise<void> => {
  if (file.size > MAX_PDF_BYTES) {
    throw new PdfProcessingError('too-large', 'The PDF is larger than the 15 MB local-processing limit.');
  }
  if (file.type !== 'application/pdf') {
    throw new PdfProcessingError('invalid-type', 'The selected file is not identified as a PDF.');
  }
  const signature = new TextDecoder('ascii').decode(await file.slice(0, 5).arrayBuffer());
  if (signature !== '%PDF-') {
    throw new PdfProcessingError('invalid-signature', 'The file extension says PDF, but its contents are not a valid PDF.');
  }
};

export const pdfParserService = {
  async uploadAndParsePdf(file: File): Promise<ParsedDegreeWorks> {
    await validatePdfFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const line = content.items.flatMap(item => 'str' in item ? [item.str] : []).join(' ');
        fullText += `${line}\n`;
      }

      if (fullText.replace(/\s+/g, '').length < 50) {
        throw new PdfProcessingError('no-text', 'No searchable text was found. Scanned PDFs require OCR, which this local demo does not perform.');
      }
      return parseDegreeWorksText(fullText);
    } catch (error: unknown) {
      if (error instanceof PdfProcessingError) throw error;
      const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
      if (name === 'PasswordException') {
        throw new PdfProcessingError('encrypted', 'This PDF is password-protected. Export an unlocked copy and try again.');
      }
      throw new PdfProcessingError('corrupt', 'The PDF could not be opened. It may be corrupt or use an unsupported format.');
    }
  },
};

export function parseDegreeWorksText(text: string): ParsedDegreeWorks {
  const result: ParsedDegreeWorks = {
    gpa: 0,
    totalCredits: 0,
    completedCourses: [],
    ongoingCourses: [],
    major: '',
    studentName: '',
    studentId: '',
  };

  const studentNameMatch = text.match(/Student:\s*([^\n]{1,100})/i);
  if (studentNameMatch) result.studentName = studentNameMatch[1].trim();
  const studentIdMatch = text.match(/ID:\s*([^\n]{1,50})/i);
  if (studentIdMatch) result.studentId = studentIdMatch[1].trim();
  const majorMatch = text.match(/Major:\s*([^\n]{1,100})/i);
  if (majorMatch) result.major = majorMatch[1].trim();

  const gpaPatterns = [
    /Overall GPA[\s:]+([0-9.]+)/i,
    /Cumulative GPA[\s:]+([0-9.]+)/i,
    /GPA[\s:]+([0-9.]+)/i,
    /Grade Point Average[\s:]+([0-9.]+)/i,
  ];
  for (const pattern of gpaPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.gpa = Number.parseFloat(match[1]);
      break;
    }
  }

  const creditPatterns = [
    /Total Credits[\s:]+([0-9.]+)/i,
    /Credits Earned[\s:]+([0-9.]+)/i,
    /Total Hours[\s:]+([0-9.]+)/i,
    /Earned Hours[\s:]+([0-9.]+)/i,
    /Total Credit Hours[\s:]+([0-9.]+)/i,
  ];
  for (const pattern of creditPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.totalCredits = Number.parseInt(match[1], 10);
      break;
    }
  }

  const completedMatches = Array.from(text.matchAll(/([A-Z]{2,4}\s*\d{3,4})[\s\S]{0,50}?(?:A|B|C|D|F)[+-]?/g));
  result.completedCourses = [...new Set(completedMatches.map(match => {
    const courseCode = match[1].trim();
    const grade = match[0].match(/(?:A|B|C|D|F)[+-]?/)?.[0] ?? '';
    return `${courseCode} (${grade})`;
  }))];

  const ongoingMatches = Array.from(text.matchAll(/([A-Z]{2,4}\s*\d{3,4})[\s\S]{0,50}?(?:IP|REG|ENROLLED|IN PROGRESS)/gi));
  result.ongoingCourses = [...new Set(ongoingMatches.map(match => match[1].trim()))];

  if (result.gpa === 0 && result.totalCredits === 0 && !result.completedCourses.length && !result.ongoingCourses.length) {
    throw new PdfProcessingError('irrelevant', 'The PDF opened successfully, but it does not appear to contain DegreeWorks academic data.');
  }
  return result;
}
