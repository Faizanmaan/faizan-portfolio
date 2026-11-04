# Faizan Mustafa — Portfolio

Animated, single-page portfolio for **Faizan Mustafa**, Software Engineer specializing in AI, Machine Learning & Automation.

Pure HTML/CSS/JS with no build step and no dependencies, so it deploys to Vercel as a static site.

## Structure

```
index.html             page markup and SEO meta
css/style.css          styles and animations
js/projects.js         ← project list (titles, descriptions, tags, links)
js/main.js             interactions; CONTACT CONFIG at the top
assets/projects/*.webp screenshots of every project (1440×900)
assets/og.png          social share image
assets/favicon.svg
vercel.json            caching and security headers
```

## Before you deploy

1. Open `js/main.js` and set your real email and social links in `CONFIG` at the top. An empty social link hides its icon.
2. (Optional) Edit project descriptions or tags in `js/projects.js`. Set `featured: true` to make a card span two columns.

## Run locally

Any static server works:

```bash
npx serve .
```

## Deploy to Vercel

**Option A: CLI**

```bash
npm i -g vercel
vercel --prod
```

**Option B: GitHub**

Push this folder to a GitHub repo, then on vercel.com choose **Add New → Project → Import**.
Framework preset: **Other**. No build command. Output directory: `./` (root).

## Adding a new project

1. Save a 1440×900 screenshot as `assets/projects/<id>.webp`.
2. Add an entry to `js/projects.js`.
