import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Page {
  id: string;
  title: string;
  section: string;
  url: string;
  content: string;
  summary: string;
}

interface KnowledgeBase {
  pages: Page[];
  sections: string[];
  stats: {
    totalPages: number;
    bySection: Record<string, number>;
  };
  generatedAt: string;
}

// Load knowledge base at startup
let kb: KnowledgeBase;
try {
  const filePath = join(process.cwd(), 'public', 'knowledge-base.json');
  kb = JSON.parse(readFileSync(filePath, 'utf-8'));
} catch {
  kb = { pages: [], sections: [], stats: { totalPages: 0, bySection: {} }, generatedAt: '' };
}

// Simple text search scoring
function scoreMatch(page: Page, query: string): number {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 2);

  let score = 0;

  // Title match (highest weight)
  const lowerTitle = page.title.toLowerCase();
  if (lowerTitle.includes(lowerQuery)) {
    score += 100;
  }
  for (const word of words) {
    if (lowerTitle.includes(word)) {
      score += 20;
    }
  }

  // Content match
  const lowerContent = page.content.toLowerCase();
  for (const word of words) {
    const matches = (lowerContent.match(new RegExp(word, 'gi')) || []).length;
    score += Math.min(matches, 10) * 2; // Cap at 10 matches per word
  }

  // Exact phrase match in content
  if (lowerContent.includes(lowerQuery)) {
    score += 30;
  }

  return score;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const section = searchParams.get('section') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  // If no query, return stats
  if (!query) {
    return NextResponse.json({
      stats: kb.stats,
      sections: kb.sections,
      generatedAt: kb.generatedAt
    });
  }

  // Filter by section if provided
  let pages = kb.pages;
  if (section) {
    pages = pages.filter(p => p.section.toLowerCase() === section.toLowerCase());
  }

  // Score and sort pages
  const scored = pages
    .map(page => ({ page, score: scoreMatch(page, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Return results with summaries (not full content)
  const results = scored.map(({ page, score }) => ({
    id: page.id,
    title: page.title,
    section: page.section,
    url: page.url,
    summary: page.summary,
    score
  }));

  return NextResponse.json({
    query,
    section: section || null,
    count: results.length,
    results
  });
}

// POST endpoint for chatbot context retrieval
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, limit = 5, includeContent = true } = body;

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // Score and sort pages
  const scored = kb.pages
    .map(page => ({ page, score: scoreMatch(page, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Return results with full content for chatbot context
  const results = scored.map(({ page, score }) => ({
    id: page.id,
    title: page.title,
    section: page.section,
    url: page.url,
    content: includeContent ? page.content : undefined,
    summary: page.summary,
    score
  }));

  return NextResponse.json({
    query,
    count: results.length,
    results
  });
}
