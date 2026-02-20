import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { analyzeSkill } from '@/lib/analyzer';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeSkill(url, octokit);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skill' },
      { status: 500 }
    );
  }
}
