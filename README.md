# stefaniapana.design

Static Hugo site for [stefaniapana.design](https://stefaniapana.design/),
migrated 1:1 from WordPress. Hosted on GitHub Pages (`gh-pages` branch),
DNS in Route 53.

## How it works

Every page under `content/` is the full HTML of that URL, emitted verbatim by
`layouts/all.html` (it only rewrites the domain to the build's `baseURL`).
Media and assets live in `static/` and are copied through unchanged.

## Test locally

Requires Hugo (`brew install hugo`). From the repo root:

```sh
hugo server
```

Then open <http://localhost:1313/> in your browser. Every page is served
exactly as in production (the domain in links/assets is rewritten to
localhost automatically), so you can click through the whole site — menu,
projects, blog, images — before deploying. The server live-reloads when you
edit content. Stop it with `Ctrl-C`.

To produce the deployable site instead:

```sh
hugo                                  # writes the static site into public/
```

Deploy: build with the production baseURL and push `public/` to the
`gh-pages` branch (include the `CNAME` and `.nojekyll` files).

## Add a new blog post

1. Pick the closest existing post as a template and copy its bundle:

   ```sh
   cp -R content/cum-iti-alegi-arhitectul content/noul-meu-articol
   ```

2. Edit `content/noul-meu-articol/index.html`:
   - front matter: set `title` and `url: "/noul-meu-articol/"`
   - `<head>`: update `<title>`, `meta description`, canonical and `og:` URLs
   - inside `<main>`: replace the article heading, date, categories and body
     text; swap image `src`/`srcset` to your new images
3. Add the new images under `static/wp-content/uploads/<year>/<month>/`.
4. Link the post from the listing pages so visitors can find it: edit
   `content/jurnal/index.html` (and `content/category/<cat>/index.html` if it
   belongs to a category) and duplicate one `<article>…</article>` block,
   pointing it at the new URL, title and thumbnail.
5. Add a `<url>` entry to `static/wp-sitemap-posts-post-1.xml`.
6. Check locally (`hugo server`), then deploy.

## Add a new page

Same procedure, using a page as the template (e.g. `content/consultanta/`),
and register it in `static/wp-sitemap-posts-page-1.xml`. To add it to the
navigation menu, edit the header `<nav>` markup — it appears in every
`content/*/index.html`, so do a search-and-replace across `content/` for one
of the existing menu items and add the new entry next to it in each file.

## Contact form

The homepage questionnaire posts to FormSubmit via
`static/wp-content/plugins/kadence-blocks/includes/assets/js/kb-form-static.js`.
The destination is configured by the `ENDPOINT` constant in that file.
