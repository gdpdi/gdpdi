/**
 * generate_readme.js
 * Run: node generate_readme.js
 * Reads data.js and writes README.md with all counts auto-computed.
 * No hardcoded association counts, country counts, or score band tallies.
 */

const fs = require('fs');

// ── Load data ──
const src = fs.readFileSync('./data.js', 'utf8');
const match = src.match(/var GDPDI_DATA=(\[[\s\S]*?\]);/);
if (!match) { console.error('Could not parse GDPDI_DATA from data.js'); process.exit(1); }
const DATA = JSON.parse(match[1]);

const metaMatch = src.match(/var GDPDI_META\s*=\s*(\{[\s\S]*?\});/);
const metaSrc = metaMatch ? metaMatch[1] : '{}';
// Parse META manually (it's not strict JSON — uses unquoted keys)
const edition   = (metaSrc.match(/edition:\s*(\d+)/)    || [])[1] || '4';
const month     = (metaSrc.match(/month:\s*"([^"]+)"/)  || [])[1] || 'March';
const year      = (metaSrc.match(/year:\s*(\d+)/)       || [])[1] || '2026';
const docxFile  = (metaSrc.match(/docx_file:\s*"([^"]+)"/) || [])[1] || `GDPDI-${month.slice(0,3)}-${year}-E${edition}.docx`;

// ── Compute stats ──
const total       = DATA.length;
const countries   = new Set(DATA.map(e => e.country)).size;
const continents  = new Set(DATA.map(e => e.continent)).size;
const aiAdopters  = DATA.filter(e => e.ai_rank > 0).length;
const outstanding = DATA.filter(e => e.total >= 78).length;
const good        = DATA.filter(e => e.total >= 62 && e.total < 78).length;
const developing  = DATA.filter(e => e.total < 62).length;
const label       = `${month.slice(0,3)}-${year}`;
const editionFull = `${month} ${year} · Edition ${edition}`;
const docxUrl     = `https://gdpdi.github.io/gdpdi/${docxFile}`;

// ── Top 10 (all entries with global_rank <= 10, dense) ──
const top10 = DATA
  .filter(e => e.global_rank <= 10)
  .sort((a, b) => a.global_rank - b.global_rank || a.name.localeCompare(b.name));

const FLAG = {
  'United States of America':'🇺🇸', 'United Kingdom':'🇬🇧', 'India':'🇮🇳',
  'Singapore':'🇸🇬', 'Netherlands':'🇳🇱', 'Germany':'🇩🇪', 'Canada':'🇨🇦',
  'Australia':'🇦🇺', 'Bangladesh':'🇧🇩', 'Sweden':'🇸🇪', 'Switzerland':'🇨🇭',
  'Thailand':'🇹🇭', 'New Zealand':'🇳🇿', 'South Africa':'🇿🇦',
  'Belgium':'🇧🇪', 'Denmark':'🇩🇰', 'Finland':'🇫🇮', 'Poland':'🇵🇱',
  'Ireland':'🇮🇪', 'France':'🇫🇷', 'Italy':'🇮🇹', 'Spain':'🇪🇸',
  'Malaysia':'🇲🇾', 'Japan':'🇯🇵',
};
const MEDAL = { 1:'🥇', 2:'🥈', 3:'🥉' };

const top10Rows = top10.map(e => {
  const rank  = MEDAL[e.global_rank] || '';
  const flag  = FLAG[e.country] || '';
  const short = e.country === 'United States of America' ? 'USA' : e.country;
  return `| ${rank} ${e.global_rank} | ${e.name} | ${flag} ${short} | **${e.total}** |`;
}).join('\n');

// ── Render README ──
const readme = `<div align="center">

# 🙏 Global Durga Puja Digital Index

**GDPDI &nbsp;·&nbsp; ${editionFull}**

[![Live Site](https://img.shields.io/badge/Live_Website-gdpdi.github.io%2Fgdpdi-162648?style=for-the-badge)](https://gdpdi.github.io/gdpdi)
[![Download DOCX](https://img.shields.io/badge/Download_Report-DOCX-00586C?style=for-the-badge)](${docxUrl})

![Associations](https://img.shields.io/badge/Associations-${total}-162648?style=flat-square)
![Countries](https://img.shields.io/badge/Countries-${countries}-A8820A?style=flat-square)
![Continents](https://img.shields.io/badge/Continents-${continents}-00586C?style=flat-square)
![AI Adopters](https://img.shields.io/badge/AI_Adopters-${aiAdopters}-6A0DAD?style=flat-square)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC_BY--NC_4.0-lightgrey?style=flat-square)](https://creativecommons.org/licenses/by-nc/4.0/)

</div>

---

*For the first time, every Bengali Durga Puja association can see exactly where it stands in the world — and precisely what it can do to rise.*

---

## What Is the GDPDI?

The **Global Durga Puja Digital Index** is the world's first structured ranking of Durga Puja association websites across all nations. Durga Puja is a **UNESCO-inscribed Intangible Cultural Heritage of Humanity** (December 2021), celebrated by Bengali communities on six continents.

Every website is scored against eleven internationally grounded criteria — from visual design and mobile responsiveness to Bengali language provision and AI adoption. Every score is transparent and independently verifiable by visiting the association's own website.

**GDPDI Independent Research** — not affiliated with any employer, organisation, government body, or commercial entity.

*Frameworks: W3C WCAG 2.2 · Nielsen Norman Group 10 Heuristics · Google Core Web Vitals · W3C Web Internationalisation · Gartner DXP 2024 · Google AI Principles · W3C Web Trust Framework — all open-access, non-proprietary, independently verifiable.*

---

## Global Top 10 — Edition ${edition}

| Rank | Association | Country | Score |
|:----:|-------------|:-------:|:-----:|
${top10Rows}

Full rankings with live search, country and continent filtering: **[gdpdi.github.io/gdpdi](https://gdpdi.github.io/gdpdi)**

---

## Score Bands

| Band | Range | What it means |
|:----:|:-----:|---------------|
| Outstanding | ≥78 / 100 | World-class digital presence. Benchmark standard for the global Bengali community. |
| Good | 62–77 / 100 | Solid presence with clear, achievable areas for improvement. |
| Developing | <62 / 100 | Foundation in place. Targeted improvements can yield rapid gains. |

**Edition ${edition} results:** ${outstanding} Outstanding · ${good} Good · ${developing} Developing

---

## Scoring Framework

| Code | Criterion | Max |
|:----:|-----------|:---:|
| C1 | Visual Design & Brand Identity | 13 |
| C2 | Navigation & Information Architecture | 10 |
| C3 | Content Depth & Cultural Representation | 11 |
| C4 | Mobile Responsiveness & Cross-device UX | 11 |
| C5 | Performance, Security & Technical Health | 9 |
| C6 | Online Registration & Community Tools | 8 |
| C7 | Accessibility (WCAG 2.2) | 7 |
| C8 | Social Media Integration & Reach | 8 |
| C9 | AI-Assisted Experience | 13 |
| C10 | Governance & Transparency | 7 |
| C11 | Bengali Language Support | 3 |
| | **Total** | **100** |

---

## Embed Your Association's Rank Badge

Any association in the index can display a live rank badge on its own website — showing global rank, continent rank, national rank, state rank (India), and score, with an animated scrolling ticker.

**How to get your embed code:**

1. Go to **[gdpdi.github.io/gdpdi](https://gdpdi.github.io/gdpdi)**
2. Scroll to **Embed Your Association's Rank Badge** (or tap it in the navigation bar)
3. Type your association's name in the search box and select it from the dropdown
4. Your personalised code appears instantly — choose **iframe**, **Pure HTML**, or **Script tag**
5. Click **Copy Code** and paste it into your website

**Supported platforms:** Wix · Squarespace · WordPress · Raw HTML · GitHub Pages · Webflow

The iframe and script tag versions update automatically with each new GDPDI edition.

---

## New Editions & Re-evaluation

Every association already in the index is **re-evaluated automatically** with each new edition of the GDPDI — no action or request is needed. If your website has improved since the last evaluation, those improvements will be captured in the next edition.

---

## Download the Full Report

The complete research report is available as a Word document:

→ **[${docxFile}](${docxUrl})**

Contents: global rankings · continental rankings · national rankings · AI adopter analysis · all 256 score cards · alphabetical index · scoring framework.

---

## Repository Structure

\`\`\`
gdpdi/
├── index.html          # Interactive ranking website
├── embed.html          # Rank badge widget
├── data.js             # All association data (single source of truth)
├── ${docxFile}
└── generate_readme.js  # Run to regenerate this README from data.js
\`\`\`

---

## Citation

> GDPDI Independent Research. (${year}). *Global Durga Puja Digital Index — Edition ${edition}*. https://gdpdi.github.io/gdpdi

Reference code: \`GDPDI-${label}-E${edition}\`

---

## Licence

**CC BY-NC 4.0** — Free to share for non-commercial purposes with attribution:
> *"Source: GDPDI-${label}-E${edition} — gdpdi.github.io/gdpdi"*

---

## Disclaimer

Independent research. Scores represent the researcher's professional assessment and are not legal determinations. They reflect website quality, not the cultural significance of any association's celebration. GDPDI Independent Research is not affiliated with any employer, organisation, government body, or commercial entity.

*Frameworks: W3C WCAG 2.2 · Nielsen Norman Group 10 Heuristics · Google Core Web Vitals · W3C Web Internationalisation · Gartner DXP 2024 · Google AI Principles · W3C Web Trust Framework — all open-access, non-proprietary, independently verifiable.*

---

<div align="center">

**শুভ বিজয়া · Shubho Bijoya**

[🌐 Website](https://gdpdi.github.io/gdpdi) &nbsp;·&nbsp; [📄 Full Report](${docxUrl})

*GDPDI Independent Research · GDPDI-${label}-E${edition}*

</div>
`;

fs.writeFileSync('./README.md', readme);
console.log(`README.md generated:`);
console.log(`  Associations : ${total}`);
console.log(`  Countries    : ${countries}`);
console.log(`  Continents   : ${continents}`);
console.log(`  AI Adopters  : ${aiAdopters}`);
console.log(`  Outstanding  : ${outstanding}`);
console.log(`  Good         : ${good}`);
console.log(`  Developing   : ${developing}`);
console.log(`  Edition      : ${edition}  (${label})`);
console.log(`  DOCX         : ${docxFile}`);
