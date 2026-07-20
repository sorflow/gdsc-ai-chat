import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createKnowledgeRetriever } from '../src/services/retrieval';
import type { KnowledgeIndex } from '../src/types/knowledge';

interface GroundedQuestion {
  id: string;
  kind: 'grounded';
  query: string;
  expectedYear: string;
  expectedTerms: string[];
}

interface UnsupportedQuestion {
  id: string;
  kind: 'unsupported';
  query: string;
}

type EvaluationQuestion = GroundedQuestion | UnsupportedQuestion;

const directory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(directory, '..');
const indexPath = path.join(frontendDirectory, 'public', 'data', 'bulletin-index.json');
const fixturePath = path.join(frontendDirectory, 'evaluation', 'evaluation-questions.json');
const outputPath = path.join(frontendDirectory, 'public', 'data', 'evaluation-results.json');
const index = JSON.parse(await fs.readFile(indexPath, 'utf8')) as KnowledgeIndex;
const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8')) as { version: string; questions: EvaluationQuestion[] };
const search = createKnowledgeRetriever(index);
const chunkTextById = new Map(index.chunks.map(chunk => [chunk.id, chunk.text.toLowerCase()]));

// Warm the prebuilt retriever before measuring individual queries.
search('AAMU academic policy');
const details = fixture.questions.map(question => {
  const runs = [search(question.query), search(question.query), search(question.query)];
  const result = runs[0];
  const runLatencies = runs.map(run => run.latencyMs).sort((a, b) => a - b);
  const latencyMs = runLatencies[1];
  if (question.kind === 'unsupported') {
    return {
      id: question.id,
      kind: question.kind,
      passed: result.status === 'no-answer' && result.citations.length === 0,
      latencyMs,
      status: result.status,
    };
  }

  const expectedTerms = question.expectedTerms.map(term => term.toLowerCase());
  const relevantCitation = result.citations.some(citation => (
    citation.year === question.expectedYear
      && expectedTerms.some(term => (chunkTextById.get(citation.id) ?? citation.excerpt.toLowerCase()).includes(term))
  ));
  return {
    id: question.id,
    kind: question.kind,
    passed: result.status === 'answered' && relevantCitation,
    latencyMs,
    status: result.status,
    topCitation: result.citations[0]?.id ?? null,
  };
});

const grounded = details.filter(detail => detail.kind === 'grounded');
const unsupported = details.filter(detail => detail.kind === 'unsupported');
const groundedPassed = grounded.filter(detail => detail.passed).length;
const unsupportedPassed = unsupported.filter(detail => detail.passed).length;
const latencies = details.map(detail => detail.latencyMs).sort((a, b) => a - b);
const percentile = (position: number) => latencies[Math.min(Math.ceil(latencies.length * position) - 1, latencies.length - 1)] ?? 0;
const groundedAccuracy = groundedPassed / Math.max(grounded.length, 1);
const abstentionAccuracy = unsupportedPassed / Math.max(unsupported.length, 1);
const medianLatencyMs = percentile(0.5);
const p95LatencyMs = percentile(0.95);
const results = {
  version: fixture.version,
  generatedAt: new Date().toISOString(),
  totalQuestions: details.length,
  groundedQuestions: grounded.length,
  groundedPassed,
  groundedAccuracy,
  unsupportedQuestions: unsupported.length,
  unsupportedPassed,
  abstentionAccuracy,
  medianLatencyMs,
  p95LatencyMs,
  targetMet: groundedAccuracy >= 0.8 && abstentionAccuracy === 1 && p95LatencyMs < 150,
  details,
};

await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
process.stdout.write(`Evaluation: ${groundedPassed}/${grounded.length} grounded, ${unsupportedPassed}/${unsupported.length} abstentions, P95 ${p95LatencyMs.toFixed(2)} ms\n`);
if (!results.targetMet) process.exitCode = 1;
