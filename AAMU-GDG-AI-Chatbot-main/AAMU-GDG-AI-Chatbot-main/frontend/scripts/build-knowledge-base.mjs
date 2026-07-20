import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const BULLETIN_YEARS = ['2022-2023', '2023-2024', '2024-2025'];
const VERSION = '1.0.0';
const MAX_CHUNK_LENGTH = 900;
const CHUNK_OVERLAP = 120;
const MAX_INDEX_BYTES = 8 * 1024 * 1024;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(scriptDirectory, '..');
const pdfDirectory = path.resolve(frontendDirectory, '..', 'Pdfstore');
const outputDirectory = path.resolve(frontendDirectory, 'public', 'data');
const outputPath = path.join(outputDirectory, 'bulletin-index.json');

const sourceUrl = year => `https://www.aamu.edu/academics/catalogs/_documents/undergraduate-bulletins/undergraduate-bulletin-${year}.pdf`;
const normalizeText = value => value
  .replace(/\u00ad/g, '')
  .replace(/[\t\r\n]+/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim();

const chunkPage = text => {
  if (text.length <= MAX_CHUNK_LENGTH) return text.length >= 40 ? [text] : [];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const targetEnd = Math.min(start + MAX_CHUNK_LENGTH, text.length);
    let end = targetEnd;
    if (targetEnd < text.length) {
      const boundary = text.lastIndexOf(' ', targetEnd);
      if (boundary > start + Math.floor(MAX_CHUNK_LENGTH * 0.55)) end = boundary;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length >= 40) chunks.push(chunk);
    if (end >= text.length) break;
    const nextStart = Math.max(end - CHUNK_OVERLAP, start + 1);
    const nextBoundary = text.indexOf(' ', nextStart);
    start = nextBoundary > nextStart && nextBoundary < end ? nextBoundary + 1 : nextStart;
  }
  return chunks;
};

const extractBulletin = async year => {
  const pdfPath = path.join(pdfDirectory, `Bulletin-${year}.pdf`);
  let file;
  try {
    file = await fs.readFile(pdfPath);
  } catch {
    throw new Error(`Required bulletin is missing: ${pdfPath}`);
  }

  const document = await pdfjs.getDocument({
    data: new Uint8Array(file),
    disableWorker: true,
    verbosity: 0,
  }).promise;
  const chunks = [];
  let searchablePageCount = 0;

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = normalizeText(content.items.flatMap(item => 'str' in item ? [item.str] : []).join(' '));
    const pageChunks = chunkPage(text);
    if (pageChunks.length) searchablePageCount += 1;
    pageChunks.forEach((chunk, chunkIndex) => chunks.push({
      id: `${year}-p${String(pageNumber).padStart(3, '0')}-c${String(chunkIndex + 1).padStart(2, '0')}`,
      year,
      page: pageNumber,
      text: chunk,
      sourceUrl: `${sourceUrl(year)}#page=${pageNumber}`,
    }));
  }

  if (!chunks.length) throw new Error(`No searchable text was extracted from Bulletin-${year}.pdf`);
  return {
    metadata: {
      year,
      title: `AAMU Undergraduate Bulletin ${year}`,
      pageCount: document.numPages,
      searchablePageCount,
      sourceUrl: sourceUrl(year),
    },
    chunks,
  };
};

const bulletins = [];
for (const year of BULLETIN_YEARS) {
  process.stdout.write(`Indexing Bulletin-${year}.pdf... `);
  const bulletin = await extractBulletin(year);
  bulletins.push(bulletin);
  process.stdout.write(`${bulletin.metadata.pageCount} pages, ${bulletin.chunks.length} chunks\n`);
}

const chunks = bulletins.flatMap(bulletin => bulletin.chunks);
const index = {
  metadata: {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    bulletinCount: bulletins.length,
    pageCount: bulletins.reduce((sum, bulletin) => sum + bulletin.metadata.pageCount, 0),
    searchablePageCount: bulletins.reduce((sum, bulletin) => sum + bulletin.metadata.searchablePageCount, 0),
    chunkCount: chunks.length,
    bulletins: bulletins.map(bulletin => bulletin.metadata),
  },
  chunks,
};

const serialized = JSON.stringify(index);
if (Buffer.byteLength(serialized) > MAX_INDEX_BYTES) {
  throw new Error(`Knowledge index exceeds the 8 MB limit (${(Buffer.byteLength(serialized) / 1024 / 1024).toFixed(2)} MB).`);
}

await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(outputPath, serialized);
process.stdout.write(`Wrote ${outputPath} (${(Buffer.byteLength(serialized) / 1024 / 1024).toFixed(2)} MB)\n`);
