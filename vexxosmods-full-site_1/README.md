# VexxosMods — Website

A fully static site (HTML/CSS/JS only — no build step, no backend, no database) styled with a neon-purple, space-themed, glassmorphism gaming aesthetic. Ready to host directly on **GitHub Pages**.

## What's inside

```
index.html         Main page (Home, Downloads, Video, Discord, Footer)
style.css          All styling (theme, layout, animations, responsive rules)
script.js          Starfield canvas, nav toggle, scroll reveal, navbar behavior
images/            Logo, favicon, OG banner, mod icons
images/mods/       Placeholder icons for each mod card
                   (Discord icon is drawn as inline SVG in index.html —
                   no image file, so it can never show up broken)
fonts/             (empty — site currently uses Google Fonts via CDN link)
assets/            (reserved for any extra static assets you add)
```

## How to publish on GitHub Pages

1. **Create a repository** named exactly `vexxosmods.github.io` under your `vexxosmods` GitHub account (this exact naming pattern is required for a *user/org* Pages site to be served at the root domain).
2. **Upload all the files in this ZIP** to the root of that repository (keep the folder structure — `images/`, `images/mods/`, etc. must stay where they are).
3. Commit and push (or use the GitHub web uploader: **Add file → Upload files**, drag in everything, then **Commit changes**).
4. Go to **Settings → Pages** in the repo.
5. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
6. Wait 1–2 minutes. Your site will be live at:
   `https://vexxosmods.github.io/`

No further configuration is needed — everything uses relative paths, so it works whether it's served from a root domain or a subpath.

## Replacing placeholders with your own art

Everything below was auto-generated as a placeholder and is safe to overwrite — just keep the **same filename and folder location**, and the site will pick up your new art automatically:

| File | Used for |
|---|---|
| `images/logo.png` | Small logo in the navbar |
| `images/favicon.png` / `images/favicon-32.png` | Browser tab icon |
| `images/og-banner.png` | Social share preview image (Open Graph / Twitter card) |
| `images/mods/opsec-icon.png` | OPSEC card icon (also represents the required addon) |
| `images/mods/rigmaster-icon.png` | Rig Master card icon |
| `images/mods/glazed-icon.png` | Glazed card icon |
| `images/mods/krypton-icon.png` | Krypton card icon |

The Discord icon in the Discord section is inline SVG (in `index.html`, inside `.discord-logo`), not an image file — so there's nothing that can fail to load. If you want your own Discord-branded art there instead, replace that `<svg>...</svg>` block with an `<img>` tag pointing at your own hosted image.

If an icon file is ever missing, the card will automatically fall back to a simple styled monogram, so the site never breaks.

## Editing text/content

- **Mod descriptions, versions, and download links** live in `index.html` inside each `<article class="mod-card">` block.
- **OPSEC's required addon**: the small "Required Addon" tag lives in the `.addon-row` block right inside the OPSEC card. Its link is a normal `<a>` tag (`class="addon-btn"`) — edit the `href` to update the addon download.
- **Glazed's version dropdown**: the `<select id="glazed-version">` holds one `<option>` per version, with the download URL as that option's `value`. To add a new version, copy an `<option>` line and change its `value` (URL) and label text — `script.js` will automatically wire it up, no JS edits needed. This pattern (`data-download-select` on the `<select>` matched to `data-download` on the `<a>`) can be reused for any other mod you want a version dropdown on later.
- **Discord invite link** appears in two places in `index.html`: the Discord section button and the footer.
- **YouTube video**: the embed URL is in the `<iframe src="...">` inside the Video section — swap the video ID to change it.
- **Colors/theme**: all colors are defined as CSS variables at the top of `style.css` under `:root` — change `--purple-500`, `--pink-accent`, etc. to retheme the whole site in one place.

## Notes

- Fonts (`Space Grotesk`, `Sora`) load from Google Fonts via a CDN `<link>` in `index.html`. If you'd rather self-host fonts, drop `.woff2` files into `fonts/` and update the `@font-face`/link references.
- The starfield background is drawn with a `<canvas>` in `script.js` — no external libraries, so it stays fast and lightweight.
- The site respects `prefers-reduced-motion` for accessibility (animations are minimized automatically for users who have that OS setting enabled).
