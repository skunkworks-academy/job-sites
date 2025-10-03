# Skunkworks Academy Job Sites

[![Made with ❤ by Skunkworks Academy](https://img.shields.io/badge/Made%20with-%E2%9D%A4-ff477e.svg)](https://skunkworksacademy.com)
[![Static JSON Powered](https://img.shields.io/badge/data-JSON-0f62fe.svg)](/public/jobsites.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-34c759.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-22c55e.svg)](#contributing)
[![Deploy: GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-6b7280.svg)](#deploy)

A simple, fast directory of **South African** and **global** job platforms — including **remote**, **freelance**, and vetted **recruitment agencies**. Data-driven (JSON), responsive UI, and easy to maintain.

---

## ✨ Features

- **Data-driven**: everything comes from `/public/jobsites.json`
- **Filters + search** (optional in UI) for **South Africa / Remote / Freelance / Agencies / NGO**
- **Copy / CSV export** actions for quick share
- **Dark mode**, buttery animations, a11y-friendly components
- **Zero backend** — works on GitHub Pages, Vercel, Firebase, Netlify
- **Easy contributions** via PRs that only touch `jobsites.json`

> **Screenshot**
>
> ![Job Sites Directory – Screenshot](./assets/screenshot-hero.png)
>
> *Optional:* add more shots like grid view, dark mode, and mobile.

---

## 📦 Structure

.
├── public/
│   └── jobsites.json        # master list (name, url, region, category)
├── src/
│   ├── index.html           # UI shell (loads app.js)
│   ├── js/
│   │   └── app.js           # fetch + render + search/filter + export
│   └── css/
│       └── style.css        # theme, layout, animations, responsive
└── README.md

**JSON schema (simple & stable):**
```json
[
  {
    "name": "PNet",
    "url": "https://www.pnet.co.za",
    "region": "South Africa",
    "category": "South Africa"
  }
]

Recommended category values:
South Africa · Recruitment Agency · Remote · Freelance · Agency / NGO

⸻

🚀 Run locally

# from repo root
npx serve src
# or
python3 -m http.server --directory src 5173
# then open http://localhost:3000 or http://localhost:5173


⸻

🚢 Deploy

GitHub Pages (static)

# commit your changes
git add .
git commit -m "Deploy job sites directory"
git push origin main

# if you use gh-pages branch
npm i -g gh-pages
gh-pages -d src

Vercel / Netlify / Firebase
	•	Vercel: “Import Project” → set root to /src.
	•	Netlify: Drag-and-drop /src or set publish directory to src/.
	•	Firebase:

firebase init hosting
# set public directory to src
firebase deploy



⸻

🧰 Usage (Frontend)
	•	Search: type to filter by name or URL.
	•	Filter chips: toggle by category (SA / Remote / Freelance / Agency / NGO).
	•	Sort: A–Z toggle (optional).
	•	Copy all: one click copies Name — URL.
	•	Export CSV: quick download for spreadsheets and ATS import.

Add a site
	1.	Edit /public/jobsites.json
	2.	Keep name, url, region, category consistent
	3.	Alphabetize within category (nice touch)
	4.	PR with a short description

⸻

🎨 Visuals & Graphics
	•	assets/ (screenshots, hero SVGs, icons)
	•	Subtle animated wave / particles in hero
	•	Font: IBM Plex Sans (clean, legible)
	•	Dark mode via prefers-color-scheme + toggle

Add these placeholders:
	•	assets/screenshot-hero.png
	•	assets/screenshot-dark.png
	•	assets/logo.svg

⸻

🤝 Contributing

We love PRs!
	•	Additions: must be English-friendly, active, and non-spammy
	•	Prefer South African boards + legit agencies, then remote/freelance
	•	Avoid duplicates / mirrors / dead links
	•	Keep categories tidy

Run lint (optional scripts) and validate JSON before committing:

jq . public/jobsites.json > /dev/null


⸻

📊 Data tips (quality)
	•	Use a simple dead-link checker weekly (GitHub Action or script) to validate 200 OK.
	•	Track outbound clicks via a redirector (/out?to=) to learn which boards work.
	•	Consider a last_checked (ISO date) later for maintenance.

⸻

🧭 Job-Search Playbook (Practical Tips)

Because a directory is only half the battle. Here’s the fast path:

Résumés (CVs)
	•	Keep it to 1–2 pages. Use achievement bullets: action verb + what you built + impact (numbers).
	•	Mirror keywords from the job spec (ATS-friendly). Don’t stuff; be accurate.
	•	Put skills stack (e.g., Asterisk/FreePBX, SIP, IBM Power, MQ, REST, OAuth, Terraform, Azure, Kubernetes) in a tidy section.

Cover letters (targeted, short)
	•	4–6 lines max:
	1.	Why this company/role (1 line)
	2.	Why you (1–2 lines; match their stack)
	3.	One mini-case: link to portfolio/GitHub/live demos
	4.	Close with a call to action

Interview prep
	•	Technical: practice SIP call flow, NAT traversal, RTP, TLS/SRTP; IBM Power basics (LPARs, VIOS, HMC); APIs (REST patterns, pagination, idempotency, OAuth2); cloud (IAM, VPC, KMS); security (Zero-Trust, MFA, least privilege).
	•	Behavioral: STAR stories aligned to 4–5 core themes (impact, conflict, leadership, failure, ambiguity).
	•	Company research: 30 mins—product, users, recent news, what you’d improve.

Salary & offers
	•	Use region-specific ranges; quote a range (Total Comp), not a single number.
	•	Ask about bonus, equity, remote stipend, training budget, visa/relocation.

Skills & signals
	•	Portfolio: ship something visible (demos, repos, docs).
	•	Certs: IBM, Microsoft, Cisco, EC-Council—credibility + upskilling.
	•	Courses: show recency (last 6–12 months).
	•	References: prime 2–3 people with specific examples they can cite.

⸻

🗂 Categories Covered
	•	South Africa: PNet, Careers24, CareerJunction, JobMail, Adzuna SA, CompuJobs, Bizcommunity Jobs, JobVine, DittoJobs, OfferZen, SAYouth, JobJack…
	•	Recruitment Agencies (SA): Michael Page, Robert Walters, Kelly, ManpowerGroup, Network Recruitment, CA Global, Tower Group, Isilumko, Prostaff, MASA, O’Neil…
	•	Remote: WeWorkRemotely, RemoteOK, FlexJobs, Remotive, Himalayas, DailyRemote, Jobspresso, JustRemote, Hubstaff Talent, PowerToFly…
	•	Freelance: Upwork, Fiverr, PeoplePerHour, Toptal, CodementorX, Kolabtree, Workana, Freelancermap, DesignCrowd…
	•	Agency / NGO: UN Jobs, ReliefWeb, NGO Pulse, GlobalJobs.org, 80,000 Hours, Impactpool, Devex…

(Full list lives in /public/jobsites.json.)

⸻

🧪 Testing & QA
	•	Validate JSON:

jq . public/jobsites.json > /dev/null


	•	Lighthouse checks (Performance, A11y, SEO)
	•	Cross-browser: Chrome, Firefox, Edge, Safari (desktop + mobile)
	•	Viewport: 320px → 1920px

⸻

🔐 Accessibility & Privacy
	•	Keyboard navigation, focus styles, ARIA labels
	•	Respects prefers-reduced-motion
	•	No cookies, trackers, or PII; outbound links open in new tabs with rel="noopener"

⸻

📈 Roadmap
	•	✅ CSV export, Copy-all
	•	⏳ Tag filtering & bookmarks
	•	⏳ Click tracking via /out?to= redirector
	•	⏳ Automated link health checks (GitHub Action)
	•	⏳ Multi-language (en → af/pt/es)

⸻

🙌 Acknowledgements

Built with curiosity in Johannesburg. Thanks to contributors and the broader community of job-seekers, devs, and recruiters.

⸻

🗣️ Support & Contact

Issues → GitHub Issues
General → hello@skunkworksacademy.com

### Extras you can add now
- Create `assets/` with `screenshot-hero.png` and `logo.svg`.
- Add a simple **GitHub Action** to validate `jobsites.json` (using `jq` or `jsonlint`).
- If you want, I can also generate a **CSV** version from your JSON and a small `/out` redirector script for click analytics.
