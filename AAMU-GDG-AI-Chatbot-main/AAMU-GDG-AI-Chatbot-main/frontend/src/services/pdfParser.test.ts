import { describe, expect, it } from 'vitest';
import { MAX_PDF_BYTES, PdfProcessingError, parseDegreeWorksText, validatePdfFile } from './pdfParser';

describe('PDF safety and DegreeWorks parsing', () => {
  it('accepts a PDF MIME type with a valid file signature', async () => {
    const file = new File(['%PDF-1.7\nexample'], 'degreeworks.pdf', { type: 'application/pdf' });
    await expect(validatePdfFile(file)).resolves.toBeUndefined();
  });

  it('rejects oversized files before reading their contents', async () => {
    const file = { size: MAX_PDF_BYTES + 1, type: 'application/pdf' } as File;
    await expect(validatePdfFile(file)).rejects.toMatchObject({ code: 'too-large' });
  });

  it('rejects incorrect MIME types and forged PDF extensions', async () => {
    const textFile = new File(['%PDF-1.7'], 'record.pdf', { type: 'text/plain' });
    const forged = new File(['not a PDF'], 'record.pdf', { type: 'application/pdf' });
    await expect(validatePdfFile(textFile)).rejects.toMatchObject({ code: 'invalid-type' });
    await expect(validatePdfFile(forged)).rejects.toMatchObject({ code: 'invalid-signature' });
  });

  it('extracts academic values without logging source text', () => {
    const result = parseDegreeWorksText(`
      Student: Jane Student\nMajor: Computer Science\nOverall GPA: 3.75\n
      Total Credits: 92\nCS 101 A\nCS 220 IN PROGRESS\n
    `);
    expect(result).toMatchObject({ gpa: 3.75, totalCredits: 92, major: 'Computer Science' });
    expect(result.completedCourses.length).toBeGreaterThan(0);
  });

  it('rejects searchable documents that are not DegreeWorks records', () => {
    expect(() => parseDegreeWorksText('A long unrelated document with no academic record fields.')).toThrowError(PdfProcessingError);
  });
});
