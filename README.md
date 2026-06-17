# Kiota — Website


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


