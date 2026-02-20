/**
 * SkillSafe Core Analyzer
 * Analyzes ClawHub skills and generates trust scores
 */

import { Octokit } from 'octokit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OctokitInstance = any;

export interface SkillAnalysis {
  url: string;
  repoOwner: string;
  repoName: string;
  trustScore: number;
  summary: string;
  permissions: string[];
  redFlags: RedFlag[];
  authorInfo: AuthorInfo;
  rawSkillMd: string;
  analyzedAt: Date;
}

export interface RedFlag {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  line?: number;
}

export interface AuthorInfo {
  username: string;
  accountAge: number; // days
  totalRepos: number;
  totalSkills: number;
  followers: number;
}

// Suspicious patterns to check
const SUSPICIOUS_PATTERNS = [
  { pattern: /curl\s+.*\|\s*sh/gi, type: 'pipe_to_shell', severity: 'critical' as const, desc: 'Pipes remote content directly to shell' },
  { pattern: /curl\s+.*\|\s*bash/gi, type: 'pipe_to_shell', severity: 'critical' as const, desc: 'Pipes remote content directly to bash' },
  { pattern: /wget.*\|\s*sh/gi, type: 'pipe_to_shell', severity: 'critical' as const, desc: 'Pipes remote content directly to shell' },
  { pattern: /pastebin\.com/gi, type: 'pastebin', severity: 'high' as const, desc: 'References pastebin (common malware host)' },
  { pattern: /eval\s*\(/gi, type: 'eval', severity: 'high' as const, desc: 'Uses eval() which can execute arbitrary code' },
  { pattern: /base64\s+(-d|--decode)/gi, type: 'base64_decode', severity: 'high' as const, desc: 'Decodes base64 (often used to hide payloads)' },
  { pattern: /\.ssh\//gi, type: 'ssh_access', severity: 'high' as const, desc: 'Accesses SSH directory' },
  { pattern: /\/etc\/passwd/gi, type: 'passwd_access', severity: 'critical' as const, desc: 'Accesses system password file' },
  { pattern: /\/etc\/shadow/gi, type: 'shadow_access', severity: 'critical' as const, desc: 'Accesses system shadow file' },
  { pattern: /keychain|keyring/gi, type: 'keychain_access', severity: 'high' as const, desc: 'Accesses system keychain' },
  { pattern: /OPENAI_API_KEY|ANTHROPIC_API_KEY|API_KEY/gi, type: 'api_key_ref', severity: 'medium' as const, desc: 'References API keys' },
  { pattern: /nc\s+-l|netcat/gi, type: 'netcat', severity: 'critical' as const, desc: 'Uses netcat (potential reverse shell)' },
  { pattern: /\/dev\/tcp\//gi, type: 'tcp_redirect', severity: 'critical' as const, desc: 'Uses /dev/tcp (bash network redirect)' },
  { pattern: /chmod\s+\+x/gi, type: 'chmod_exec', severity: 'medium' as const, desc: 'Makes files executable' },
  { pattern: /rm\s+-rf\s+\//gi, type: 'destructive_rm', severity: 'critical' as const, desc: 'Recursive delete from root' },
  { pattern: /cryptocurrency|bitcoin|ethereum|wallet/gi, type: 'crypto_ref', severity: 'medium' as const, desc: 'References cryptocurrency' },
];

// Permission detection patterns
const PERMISSION_PATTERNS = [
  { pattern: /exec|shell|command|subprocess/gi, perm: 'Shell Access' },
  { pattern: /file|read|write|fs\./gi, perm: 'File System Access' },
  { pattern: /http|fetch|request|axios/gi, perm: 'Network Requests' },
  { pattern: /browser|puppeteer|playwright/gi, perm: 'Browser Control' },
  { pattern: /email|smtp|sendmail/gi, perm: 'Email Access' },
  { pattern: /database|sql|mongo|redis/gi, perm: 'Database Access' },
  { pattern: /env|environment|process\.env/gi, perm: 'Environment Variables' },
  { pattern: /cron|schedule|timer/gi, perm: 'Scheduled Tasks' },
];

export async function parseClawHubUrl(url: string): Promise<{ owner: string; repo: string } | null> {
  // Handle various ClawHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/i,
    /clawhub\.com\/skills\/([^\/]+)\/([^\/]+)/i,
    /^([^\/]+)\/([^\/]+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }
  return null;
}

export async function analyzeSkill(url: string, octokit: OctokitInstance): Promise<SkillAnalysis> {
  const parsed = await parseClawHubUrl(url);
  if (!parsed) {
    throw new Error('Invalid ClawHub/GitHub URL');
  }

  const { owner, repo } = parsed;

  // Fetch repo info
  const repoInfo = await octokit.rest.repos.get({ owner, repo });
  
  // Fetch SKILL.md
  let skillMd = '';
  try {
    const skillFile = await octokit.rest.repos.getContent({ 
      owner, 
      repo, 
      path: 'SKILL.md' 
    });
    if ('content' in skillFile.data) {
      skillMd = Buffer.from(skillFile.data.content, 'base64').toString('utf-8');
    }
  } catch {
    // No SKILL.md - that's a red flag itself
  }

  // Fetch author info
  const userInfo = await octokit.rest.users.get({ username: owner });
  const authorAge = Math.floor((Date.now() - new Date(userInfo.data.created_at).getTime()) / (1000 * 60 * 60 * 24));

  // Analyze red flags
  const redFlags = detectRedFlags(skillMd);

  // Detect permissions
  const permissions = detectPermissions(skillMd);

  // Calculate trust score
  const trustScore = calculateTrustScore({
    authorAge,
    repoStars: repoInfo.data.stargazers_count,
    repoForks: repoInfo.data.forks_count,
    hasSkillMd: skillMd.length > 0,
    skillMdLength: skillMd.length,
    redFlags,
    authorFollowers: userInfo.data.followers,
    authorPublicRepos: userInfo.data.public_repos,
  });

  return {
    url,
    repoOwner: owner,
    repoName: repo,
    trustScore,
    summary: generateSummary(skillMd, redFlags),
    permissions,
    redFlags,
    authorInfo: {
      username: owner,
      accountAge: authorAge,
      totalRepos: userInfo.data.public_repos,
      totalSkills: 0, // Would need to scan repos for SKILL.md
      followers: userInfo.data.followers,
    },
    rawSkillMd: skillMd,
    analyzedAt: new Date(),
  };
}

function detectRedFlags(content: string): RedFlag[] {
  const flags: RedFlag[] = [];
  
  for (const { pattern, type, severity, desc } of SUSPICIOUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        severity,
        type,
        description: desc,
      });
    }
  }

  // Check for missing SKILL.md
  if (!content || content.length < 50) {
    flags.push({
      severity: 'high',
      type: 'missing_docs',
      description: 'Missing or minimal SKILL.md documentation',
    });
  }

  // Check for vague descriptions
  if (content && !content.includes('##')) {
    flags.push({
      severity: 'medium',
      type: 'poor_structure',
      description: 'SKILL.md lacks proper structure/sections',
    });
  }

  return flags;
}

function detectPermissions(content: string): string[] {
  const perms = new Set<string>();
  
  for (const { pattern, perm } of PERMISSION_PATTERNS) {
    if (pattern.test(content)) {
      perms.add(perm);
    }
  }

  return Array.from(perms);
}

function calculateTrustScore(factors: {
  authorAge: number;
  repoStars: number;
  repoForks: number;
  hasSkillMd: boolean;
  skillMdLength: number;
  redFlags: RedFlag[];
  authorFollowers: number;
  authorPublicRepos: number;
}): number {
  let score = 50; // Start at neutral

  // Author age (max +10)
  if (factors.authorAge > 365) score += 10;
  else if (factors.authorAge > 180) score += 5;
  else if (factors.authorAge < 30) score -= 15;

  // Repo popularity (max +15)
  if (factors.repoStars > 100) score += 10;
  else if (factors.repoStars > 10) score += 5;
  if (factors.repoForks > 20) score += 5;

  // Documentation (max +15)
  if (factors.hasSkillMd && factors.skillMdLength > 500) score += 15;
  else if (factors.hasSkillMd && factors.skillMdLength > 200) score += 10;
  else if (!factors.hasSkillMd) score -= 20;

  // Author reputation (max +10)
  if (factors.authorFollowers > 100) score += 5;
  if (factors.authorPublicRepos > 20) score += 5;

  // Red flags (penalties)
  for (const flag of factors.redFlags) {
    switch (flag.severity) {
      case 'critical': score -= 30; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 5; break;
      case 'low': score -= 2; break;
    }
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

function generateSummary(skillMd: string, redFlags: RedFlag[]): string {
  if (!skillMd) {
    return 'This skill has no SKILL.md documentation, making it impossible to verify its purpose.';
  }

  const criticalFlags = redFlags.filter(f => f.severity === 'critical').length;
  const highFlags = redFlags.filter(f => f.severity === 'high').length;

  if (criticalFlags > 0) {
    return `⚠️ DANGER: This skill contains ${criticalFlags} critical security issue(s). Do not install without thorough review.`;
  }

  if (highFlags > 0) {
    return `⚠️ WARNING: This skill contains ${highFlags} high-severity concern(s). Review carefully before installing.`;
  }

  // Extract first paragraph as summary
  const firstPara = skillMd.split('\n\n')[0].replace(/^#.*\n/, '').trim();
  return firstPara.slice(0, 200) + (firstPara.length > 200 ? '...' : '');
}
