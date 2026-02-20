# SkillSafe - ClawHub Skill Trust Scanner

**One-click security reports for OpenClaw skills before you install them.**

## The Problem
- 230+ malicious skills uploaded to ClawHub in Feb 2026
- 7.1% of skills contain credential leaks or security flaws
- Users are told "always read the SKILL.md first" but most don't
- Existing tools (SecureClaw, VirusTotal) are post-install or enterprise

## The Solution
Paste a ClawHub URL → Get an instant trust report:
- **Trust Score (0-100)** based on multiple signals
- **Plain English Summary** of what the skill does
- **Permissions Analysis** - what it can access
- **Author Reputation** - history, other skills, community standing
- **Red Flags** - suspicious patterns, known bad behaviors

## Business Model
- **Free tier:** 5 scans/month
- **Pro ($9/mo):** Unlimited scans, browser extension, Slack alerts
- **Team ($29/mo):** Dashboard, policy enforcement, audit logs

## MVP Features (Week 1)
1. Landing page with URL input
2. GitHub repo analyzer (SKILL.md parser)
3. Basic trust scoring algorithm
4. Report generation

## Tech Stack
- Next.js + Tailwind (fast landing page)
- Vercel (free hosting)
- GitHub API (fetch skill repos)
- OpenAI API (summarize SKILL.md, detect red flags)

## Scoring Algorithm v0.1
| Signal | Weight | Notes |
|--------|--------|-------|
| Author age | 10% | New accounts are riskier |
| Author other skills | 10% | Established authors safer |
| Stars/forks | 10% | Community validation |
| SKILL.md clarity | 15% | Vague descriptions = red flag |
| Shell commands | 15% | Raw exec calls are risky |
| Network requests | 15% | Outbound calls to unknown domains |
| File access patterns | 15% | Sensitive paths = concern |
| Known bad patterns | 10% | Match against Snyk/VirusTotal DB |

## Competition
- **SecureClaw** - Post-install, open-source, technical
- **VirusTotal** - Hash matching only, no semantic analysis
- **Cisco AI Skill Scanner** - Enterprise, complex
- **Clawdex** - Lookup against known-bad DB only

**Our edge:** Simple, consumer-friendly, pre-install, freemium

## Progress
- [x] Concept validated (Feb 20, 2026)
- [ ] Landing page
- [ ] Core analyzer
- [ ] Trust score algorithm
- [ ] Launch on Product Hunt
