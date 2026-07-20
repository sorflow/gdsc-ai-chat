// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { KnowledgeIndex } from '../types/knowledge';

const indexPath = path.resolve(process.cwd(), 'public', 'data', 'bulletin-index.json');

describe('generated bulletin index', () => {
  it('contains all three expected bulletins with deterministic source IDs', () => {
    const raw = fs.readFileSync(indexPath, 'utf8');
    const index = JSON.parse(raw) as KnowledgeIndex;
    expect(index.metadata.bulletins.map(item => item.year)).toEqual(['2022-2023', '2023-2024', '2024-2025']);
    expect(index.metadata.pageCount).toBeGreaterThan(1000);
    expect(index.metadata.chunkCount).toBe(index.chunks.length);
    expect(index.chunks.every(chunk => /^20\d{2}-20\d{2}-p\d{3}-c\d{2}$/.test(chunk.id))).toBe(true);
    expect(new Set(index.chunks.map(chunk => chunk.id)).size).toBe(index.chunks.length);
    expect(Buffer.byteLength(raw)).toBeLessThanOrEqual(8 * 1024 * 1024);
  });
});
