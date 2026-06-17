# Kiota — Marketing Website

Static, scroll-driven marketing site (Lenis smooth scroll + GSAP ScrollTrigger).
Two pages plus a single PHP form handler — no build step, no framework.

## Pages

| File             | Audience            | Notes                                                        |
| ---------------- | ------------------- | ------------------------------------------------------------ |
| `index.html`     | Consumer ("For you")| Self-contained: its CSS and JS are inline.                   |
| `corporate.html` | Business            | Served at `/corporate`. Uses `styles.css` and `main.js`.     |

The `For you` / `For business` switcher links the two pages (`/` and `/corporate`).

## Structure

```
index.html        Consumer page (inline styles + script)
corporate.html    Business page  -> styles.css + main.js
styles.css        Business-page styles   (cache-busted via ?v=N in corporate.html)
main.js           Business-page scripts  (cache-busted via ?v=N in corporate.html)
api/contact.php   Form handler (contact modal + waitlist)
.htaccess         Clean URLs (/corporate) + 404 fallback
.cpanel.yml       cPanel Git deploy: copies site files into public_html

assets/           Images
fonts/            Self-hosted fonts
Kiota logos/      Brand logo variants
```

## Contact / waitlist form

Both forms POST JSON to `api/contact.php`, which mails a notification to a
kiota.ai inbox via the server's local mail. It is deliberately **notify-only**:
the visitor's address is set as `Reply-To`, never mailed directly, so the
endpoint can't be turned into a backscatter relay. It also has a hidden honeypot
field (`company_website`) and per-IP rate limiting.

## Deploy (cPanel)

Hosted on the existing cPanel account. Pushing to the deploy branch runs
`.cpanel.yml`, which copies the site files into `public_html/`. Static files
serve directly; `api/contact.php` runs on the server's PHP + mail.

## Editing notes

- After changing `styles.css` or `main.js`, bump their `?v=N` query string in
  `corporate.html` so browsers fetch the new file. The HTML is served `no-cache`;
  CSS/JS/images are cached long-term.
