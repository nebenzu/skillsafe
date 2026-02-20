'use client';

import { useState } from 'react';

interface AnalysisResult {
  trustScore: number;
  summary: string;
  permissions: string[];
  redFlags: Array<{
    severity: string;
    type: string;
    description: string;
  }>;
  authorInfo: {
    username: string;
    accountAge: number;
    totalRepos: number;
    followers: number;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Failed to analyze skill. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            🛡️ SkillSafe
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Know what you're installing before it's too late.
          </p>
          <p className="text-slate-400 mb-8">
            230+ malicious skills uploaded to ClawHub last week. Don't be next.
          </p>

          {/* Search Box */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste ClawHub URL or GitHub repo..."
              className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Scanning...' : 'Scan Skill'}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-400">{error}</p>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            {/* Trust Score */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${result.trustScore * 2.51} 251`}
                    className={getScoreColor(result.trustScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor(result.trustScore)}`}>
                    {result.trustScore}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Trust Score</h2>
                <p className="text-slate-400">
                  {result.trustScore >= 70 && 'This skill appears relatively safe.'}
                  {result.trustScore >= 40 && result.trustScore < 70 && 'Review with caution.'}
                  {result.trustScore < 40 && 'High risk - do not install without thorough review.'}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Summary</h3>
              <p className="text-white">{result.summary}</p>
            </div>

            {/* Red Flags */}
            {result.redFlags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">
                  ⚠️ Security Concerns ({result.redFlags.length})
                </h3>
                <div className="space-y-2">
                  {result.redFlags.map((flag, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded border ${getSeverityColor(flag.severity)}`}
                    >
                      <span className="font-semibold uppercase text-xs">{flag.severity}</span>
                      <span className="mx-2">·</span>
                      <span>{flag.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions */}
            {result.permissions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">
                  Detected Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.permissions.map((perm, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Author</h3>
              <div className="flex gap-4 text-slate-300 text-sm">
                <span>@{result.authorInfo.username}</span>
                <span>·</span>
                <span>{result.authorInfo.accountAge} days old</span>
                <span>·</span>
                <span>{result.authorInfo.totalRepos} repos</span>
                <span>·</span>
                <span>{result.authorInfo.followers} followers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      {!result && (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Deep Analysis</h3>
              <p className="text-slate-400 text-sm">
                Scans SKILL.md for suspicious patterns, eval(), shell pipes, and known malware signatures.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="text-lg font-semibold text-white mb-2">Author Reputation</h3>
              <p className="text-slate-400 text-sm">
                Checks account age, other skills, community standing, and historical behavior.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Reports</h3>
              <p className="text-slate-400 text-sm">
                Get a trust score in seconds. No sign-up required for basic scans.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {!result && (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-white">7.1%</div>
              <div className="text-slate-400 text-sm">of skills have flaws</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">230+</div>
              <div className="text-slate-400 text-sm">malicious uploads last week</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">15+</div>
              <div className="text-slate-400 text-sm">red flag patterns detected</div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing */}
      {!result && (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-1">Free</h3>
              <div className="text-3xl font-bold text-white mb-4">$0<span className="text-sm text-slate-400">/mo</span></div>
              <ul className="text-slate-300 text-sm space-y-2 mb-6">
                <li>✓ 5 scans per month</li>
                <li>✓ Basic trust score</li>
                <li>✓ Red flag detection</li>
              </ul>
              <button className="w-full py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
                Get Started
              </button>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Pro</h3>
              <div className="text-3xl font-bold text-white mb-4">$9<span className="text-sm text-slate-400">/mo</span></div>
              <ul className="text-slate-300 text-sm space-y-2 mb-6">
                <li>✓ Unlimited scans</li>
                <li>✓ Browser extension</li>
                <li>✓ Slack/Discord alerts</li>
                <li>✓ API access</li>
              </ul>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Start Free Trial
              </button>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-1">Team</h3>
              <div className="text-3xl font-bold text-white mb-4">$29<span className="text-sm text-slate-400">/mo</span></div>
              <ul className="text-slate-300 text-sm space-y-2 mb-6">
                <li>✓ Everything in Pro</li>
                <li>✓ Team dashboard</li>
                <li>✓ Policy enforcement</li>
                <li>✓ Audit logs</li>
              </ul>
              <button className="w-full py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {!result && (
        <div className="bg-slate-900 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Don't let a bad skill compromise your system.
            </h2>
            <p className="text-slate-400 mb-6">
              Join thousands of developers who scan before they install.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                Try It Free
              </button>
              <a 
                href="https://twitter.com/skillsafe_" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
              >
                Follow @skillsafe_
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>SkillSafe is not affiliated with OpenClaw or ClawHub.</p>
        <p className="mt-1">Built to keep the community safe. 🛡️</p>
        <div className="mt-4 flex justify-center gap-4">
          <a href="https://twitter.com/skillsafe_" className="hover:text-slate-300">Twitter</a>
          <a href="#" className="hover:text-slate-300">GitHub</a>
          <a href="#" className="hover:text-slate-300">Discord</a>
        </div>
      </footer>
    </main>
  );
}
