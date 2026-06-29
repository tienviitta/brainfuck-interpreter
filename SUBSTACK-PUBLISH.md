# How to publish this post on Substack

## Quick checklist

- [ ] Substack account created and **email verified** (check inbox + spam)
- [ ] Using **desktop Chrome or Firefox** (not mobile app for first publish)
- [ ] On **substack.com** while logged in
- [ ] Post body pasted from `substack-paste.txt` (not raw markdown)
- [ ] `bf.png` uploaded via image button (not markdown syntax)
- [ ] Clicked **Continue** → **Publish now**

---

## Step-by-step

### 1. Open the editor

**If you have a publication (newsletter):**

1. Go to https://substack.com/sign-in
2. Open your **Dashboard** (profile menu → Publisher dashboard)
3. Click **Create** (or the orange **+** button) → **Article** / **Text post**

**If you only have a profile (no custom domain yet):**

1. Go to your profile on substack.com
2. Click **+** or **Write** → start a new post

You should see a large empty editor with “Title” at the top.

### 2. Set title and subtitle

| Field | Value |
|-------|-------|
| **Title** | Learning Rust by Stepping Through Brainfuck |
| **Subtitle** | How a tiny esoteric language became a WASM visual debugger — and what it taught me about Rust along the way. |

Subtitle is optional but recommended — set it in the field under the title, not as italic body text.

### 3. Paste the body

1. Open `substack-paste.txt` in this repo
2. Copy everything **after** the subtitle line (skip the title — you typed that in step 2)
3. Paste into the Substack editor

**If paste looks broken:** paste one section at a time (split at the ALL-CAPS headings like `WHY BRAINFUCK?`).

**If you get “Network error” / “Not saved”:** Substack sometimes blocks drafts with certain strings (file paths, exploit-like code). Use `substack-paste.txt` — it omits code blocks and sensitive phrases. Paste in smaller chunks if it still fails.

### 4. Format after paste

Substack will not auto-format markdown. For each ALL-CAPS line:

1. Select the line (e.g. `WHY BRAINFUCK?`)
2. Use the editor toolbar → **Heading 2**

Turn `•` bullets into real bullet lists (toolbar or type `-` at line start).

Select URLs and use **Link** if they are not clickable.

### 5. Insert the screenshot

1. Place cursor where `[INSERT IMAGE: bf.png]` is
2. Delete that placeholder line
3. Click **Image** in the toolbar (or drag `bf.png` from the repo root)
4. Add caption: *Brain Fog Visualizer running in the browser…*

Image must be under ~10 MB. `bf.png` in the repo is fine.

### 6. Publish

1. Click **Continue** (top right — scroll up if you do not see it)
2. **Audience:** Everyone (for a free post)
3. **Delivery:** Uncheck “Send via email” if you only want it on the web first
4. Click **Publish now**

Your post URL will look like: `https://yourname.substack.com/p/slug`

---

## Common problems

| Symptom | Fix |
|---------|-----|
| No **Create** / **+** button | Verify email; finish publication setup at substack.com/start |
| **Continue** grayed out | Add a title; wait for “Saved” indicator |
| **Network error** on save | Paste from `substack-paste.txt`; remove code blocks; paste in sections |
| Formatting is a mess | Use `substack-paste.txt`, not `substack-post.md` |
| Image will not upload | Use PNG/JPG under 10 MB; try Chrome |
| Post saved but not public | Dashboard → Posts → open draft → **Continue** → **Publish now** |
| Cannot find draft | Dashboard → **Posts** → **Drafts** tab |

---

## Files in this repo

| File | Use |
|------|-----|
| `substack-paste.txt` | **Paste this** into Substack editor |
| `substack-post.md` | Reference / markdown version |
| `bf.png` | Upload as figure in the “What the visualizer shows” section |

---

## Official Substack help

- [How to publish a post](https://support.substack.com/hc/en-us/articles/360037831771-How-do-I-publish-a-new-post-on-Substack)
- [Publisher dashboard](https://support.substack.com/hc/en-us/articles/29152946791188-How-can-I-publish-on-Substack)
