# SkillSafe Deployment Guide

## Quick Deploy to Vercel

### Option 1: CLI (Recommended)
```bash
cd ~/.openclaw/workspace/projects/skillsafe
vercel login  # Authenticate with your Vercel account
vercel --prod # Deploy to production
```

### Option 2: GitHub + Vercel Dashboard
1. Create a new GitHub repo: `gh repo create skillsafe --public --source=.`
2. Push: `git push -u origin main`
3. Go to vercel.com → New Project → Import from GitHub → Select skillsafe
4. Deploy

## Environment Variables (Required)
Set these in Vercel Dashboard → Settings → Environment Variables:

- `GITHUB_TOKEN` - Personal access token for GitHub API (read:user, repo scopes)

## Custom Domain
After deploy:
1. Vercel Dashboard → Project → Domains
2. Add `skillsafe.dev` (or your preferred domain)
3. Update DNS: Add CNAME to `cname.vercel-dns.com`

## Post-Deploy Checklist
- [ ] Test the scanner with a real ClawHub URL
- [ ] Verify OG image shows correctly when shared
- [ ] Set up @skillsafe_ Twitter account
- [ ] Announce on OpenClaw Discord
