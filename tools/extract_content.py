#!/usr/bin/env python3
"""Turn mirrored WP pages into Hugo content bundles (raw passthrough)."""
import os, re, sys, html as htmllib

MIRROR = "/private/tmp/claude-502/-Users-matei-mattbox/f5c0284d-bc2c-4b0e-8b57-64863f585a20/scratchpad/mirror/stefaniapana.design"
EXTRAS = "/private/tmp/claude-502/-Users-matei-mattbox/f5c0284d-bc2c-4b0e-8b57-64863f585a20/scratchpad/extras"
REPO = "/Users/matei/mattbox/stefaniapana.design"

def find_pages():
    pages = []
    for root, dirs, files in os.walk(MIRROR):
        rel = os.path.relpath(root, MIRROR)
        if "index.html" in files:
            if rel == ".":
                pages.append("")
            elif "feed" in rel.split(os.sep) or rel == "wp-json" or rel.startswith("comments"):
                continue
            else:
                pages.append(rel)
    return sorted(pages)

def title_of(doc):
    m = re.search(r"<title>(.*?)</title>", doc, re.S)
    return htmllib.unescape(m.group(1)).strip() if m else ""

FORM_JS_OLD = "wp-content/plugins/kadence-blocks/includes/assets/js/kb-form-block.min.js?ver=3.6.7"
FORM_JS_NEW = "wp-content/plugins/kadence-blocks/includes/assets/js/kb-form-static.js?ver=1.0.0"

def write_page(urlpath, doc, outdir_rel):
    # Static hosting: Kadence form JS posts to admin-ajax.php which no longer
    # exists; swap in the drop-in that posts to FormSubmit instead.
    doc = doc.replace(FORM_JS_OLD, FORM_JS_NEW)
    title = title_of(doc).replace('"', '\\"')
    fm = f'---\ntitle: "{title}"\nurl: "{urlpath}"\n---\n'
    outdir = os.path.join(REPO, "content", outdir_rel)
    os.makedirs(outdir, exist_ok=True)
    name = "_index.html" if outdir_rel == "" else "index.html"
    with open(os.path.join(outdir, name), "w") as f:
        f.write(fm + doc)

count = 0
for rel in find_pages():
    src = os.path.join(MIRROR, rel if rel else "", "index.html")
    doc = open(src).read()
    if rel == "":
        write_page("/", doc, "")
    else:
        write_page(f"/{rel}/", doc, rel)
    count += 1

# 404 page as a regular output at /404.html
doc404 = open(os.path.join(EXTRAS, "404.html")).read()
write_page("/404.html", doc404, "page-not-found")

print(f"wrote {count} pages + 404")
