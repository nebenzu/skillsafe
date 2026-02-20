'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

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
  const { data: session } = useSession();
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

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Failed to analyze skill. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return 'from-emerald-500 to-green-400';
    if (score >= 40) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-rose-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return { text: 'Safe', color: 'text-emerald-400' };
    if (score >= 40) return { text: 'Caution', color: 'text-amber-400' };
    return { text: 'Risky', color: 'text-red-400' };
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-sm">🛡️</span>
            </div>
            <span className="font-semibold text-lg">SkillSafe</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            {session ? (
              <a href="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition">
                Dashboard
              </a>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-lg text-white font-medium transition"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            230+ malicious skills uploaded last week
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Know what you're installing
            <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              before it's too late.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Instant security reports for ClawHub skills. Paste a URL, get a trust score in seconds.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste ClawHub URL or GitHub repo..."
                  className="flex-1 px-5 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Scanning
                    </span>
                  ) : 'Scan'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-6 text-red-400 text-sm">{error}</p>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="max-w-4xl mx-auto px-6 pb-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              {/* Score Header */}
              <div className="flex items-center gap-8 mb-8 pb-8 border-b border-white/10">
                <div className="relative">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-white/10"
                    />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${result.trustScore * 2.51} 251`}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={result.trustScore >= 70 ? 'text-emerald-500' : result.trustScore >= 40 ? 'text-amber-500' : 'text-red-500'} stopColor="currentColor" />
                        <stop offset="100%" className={result.trustScore >= 70 ? 'text-green-400' : result.trustScore >= 40 ? 'text-yellow-400' : 'text-rose-400'} stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{result.trustScore}</span>
                    <span className={`text-sm font-medium ${getScoreLabel(result.trustScore).color}`}>
                      {getScoreLabel(result.trustScore).text}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">Trust Score</h2>
                  <p className="text-slate-400">{result.summary}</p>
                </div>
              </div>

              {/* Red Flags */}
              {result.redFlags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Security Concerns
                  </h3>
                  <div className="space-y-3">
                    {result.redFlags.map((flag, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${getSeverityStyle(flag.severity)}`}
                      >
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-current/10">
                          {flag.severity}
                        </span>
                        <span className="text-slate-200">{flag.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions */}
              {result.permissions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Permissions Required
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.permissions.map((perm, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                  {result.authorInfo.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">@{result.authorInfo.username}</div>
                  <div className="text-sm text-slate-400">
                    {result.authorInfo.accountAge} days old · {result.authorInfo.totalRepos} repos · {result.authorInfo.followers} followers
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {!result && (
          <section id="features" className="max-w-6xl mx-auto px-6 pb-24">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🔍',
                  title: 'Deep Analysis',
                  desc: 'Scans for eval(), shell pipes, pastebin refs, and 15+ known malware patterns.'
                },
                {
                  icon: '👤',
                  title: 'Author Reputation',
                  desc: 'Account age, repo history, community standing, and behavioral patterns.'
                },
                {
                  icon: '⚡',
                  title: 'Instant Results',
                  desc: 'Get a comprehensive trust report in under 3 seconds. No signup required.'
                }
              ].map((feature, i) => (
                <div key={i} className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        {!result && (
          <section className="max-w-4xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-3 gap-8 p-8 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl">
              {[
                { value: '7.1%', label: 'of skills have flaws' },
                { value: '230+', label: 'malicious last week' },
                { value: '15+', label: 'patterns detected' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        {!result && (
          <section id="pricing" className="max-w-5xl mx-auto px-6 pb-24">
            <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-center mb-12">Start free, upgrade when you need more.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Free',
                  price: '$0',
                  features: ['5 scans per month', 'Basic trust score', 'Red flag detection'],
                  cta: 'Get Started',
                  highlight: false
                },
                {
                  name: 'Pro',
                  price: '$9',
                  features: ['Unlimited scans', 'Browser extension', 'Slack & Discord alerts', 'API access'],
                  cta: 'Start Free Trial',
                  highlight: true
                },
                {
                  name: 'Team',
                  price: '$29',
                  features: ['Everything in Pro', 'Team dashboard', 'Policy enforcement', 'Audit logs'],
                  cta: 'Contact Us',
                  highlight: false
                }
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-gradient-to-b from-emerald-500/10 to-cyan-500/5 border-emerald-500/30 scale-105'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-400">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        {!result && (
          <section className="max-w-4xl mx-auto px-6 pb-24">
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20" />
              <div className="relative p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to scan safely?</h2>
                <p className="text-slate-400 mb-8">Join thousands of developers who verify before they install.</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition"
                  >
                    Try It Free
                  </button>
                  <a
                    href="https://twitter.com/skillsafe_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
                  >
                    Follow Updates
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs">
                  🛡️
                </div>
                <span className="text-sm text-slate-400">SkillSafe — Built to keep the community safe.</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <a href="https://twitter.com/skillsafe_" className="hover:text-white transition">Twitter</a>
                <a href="https://github.com/nebenzu/skillsafe" className="hover:text-white transition">GitHub</a>
                <span>Not affiliated with OpenClaw or ClawHub</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
