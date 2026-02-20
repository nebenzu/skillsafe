'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scansUsed] = useState(2); // TODO: Fetch from API
  const [scansLimit] = useState(5);
  const [plan] = useState('free'); // TODO: Fetch from Stripe

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  const handleUpgrade = async (selectedPlan: 'pro' | 'team') => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: selectedPlan,
        userId: (session?.user as any)?.id,
        email: session?.user?.email,
      }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-sm">🛡️</span>
            </div>
            <span className="font-semibold text-lg">SkillSafe</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-400">Manage your scans and subscription.</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-sm text-slate-400 mb-1">Scans Used</div>
            <div className="text-3xl font-bold">
              {scansUsed} <span className="text-lg text-slate-500">/ {plan === 'free' ? scansLimit : '∞'}</span>
            </div>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                style={{ width: plan === 'free' ? `${(scansUsed / scansLimit) * 100}%` : '10%' }}
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-sm text-slate-400 mb-1">Current Plan</div>
            <div className="text-3xl font-bold capitalize">{plan}</div>
            {plan === 'free' && (
              <button
                onClick={() => handleUpgrade('pro')}
                className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 transition"
              >
                Upgrade to Pro →
              </button>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-sm text-slate-400 mb-1">This Month</div>
            <div className="text-3xl font-bold">0 <span className="text-lg text-slate-500">threats blocked</span></div>
          </div>
        </div>

        {/* Quick Scan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Scan</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Paste ClawHub URL or GitHub repo..."
              className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all">
              Scan
            </button>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
          <div className="text-slate-400 text-center py-8">
            No scans yet. Try scanning a skill above!
          </div>
        </div>

        {/* Upgrade CTA */}
        {plan === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Need more scans?</h2>
            <p className="text-slate-400 mb-6">Upgrade to Pro for unlimited scans, browser extension, and API access.</p>
            <button
              onClick={() => handleUpgrade('pro')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              Upgrade to Pro — $9/mo
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
