# HN Filter

A simple Chrome/Edge extension that fetches the live Hacker News front page, applies one or more filters, and shows you the results in a styled, scrollable interface. Rows that match multiple filters get a blended highlight color. Each item shows its age, title, and a link to the comments.

## Features

- **Fetch & scrape** Hacker News front page HTML (no external API keys)  
- **Filters**  
  - Recent posts (< 2 hr)  
  - Low‑comment posts (< 10 comments)  
  - Top 3 most commented  
  - Top 3 oldest  
- **Blended highlights** when multiple filters apply  
- **Age display** (e.g. `5m`, `2h`) in italic  
- **Comment count links** directly to the HN discussion  
- **Scrollable, responsive** interface with HN‑style colors

## Installation

1. **Download & unzip** the [latest release](./hn-filter-v3.5.zip).  
2. **Open your browser's extensions page**  
   - Chrome: `chrome://extensions`  
   - Edge:   `edge://extensions`  
3. **Enable Developer mode** (toggle in the top‐right or bottom‐left).  
4. Click **Load unpacked** and select the unzipped `hn-filter` folder.  
5. Navigate anywhere, click the **H** icon, and toggle your filters.

## Usage

1. Click the **HN Filter** icon in your toolbar.  
2. Check any combination of filters:  
   - ✅ Recent (< 2 hr)  
   - ✅ Low comments (< 10)  
   - ✅ Top 3 commented  
   - ✅ Top 3 oldest  
3. Scroll the results pane to browse matching posts.  
4. Click a title to open the story, or click the **(n comments)** link to jump to the discussion.

## Configuration

By default the thresholds are hard‑coded in `main.js`:

    // change these values:
    const RECENT_CUTOFF_MS   = 2 * 3600 * 1000  // ms in 2 hours
    const LOW_COMMENT_LIMIT  = 10               // comments threshold

After editing, reload the unpacked extension.

## File Overview

- **manifest.json**  
  Declares permissions, interface, and host permission for `news.ycombinator.com`  
- **index.html**  
  Structure and inline styles for controls + results pane  
- **main.js**  
  Scrapes HN HTML, applies filters, blends highlight colors, and injects results  
