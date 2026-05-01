# Site Build Process Summary

## Goal

Use this checklist the next time you build a site so the project starts clean, stays organized, and deploys without the common mistakes we hit this time.

## 1. Start With The Right Structure

- Pick the stack first.
- For a React site with Node.js, Vite is a good default.
- Create the app structure before moving page code into it.
- Keep pages in `src/pages`.
- Keep shared hooks in `src/hooks`.
- Keep shared styles in `src/styles.css`.
- Keep routing in `src/App.jsx`.

## 2. Set Up The Project Correctly

- Create `package.json` with clear scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- Add `vite.config.js`.
- Add `index.html`.
- Add `src/main.jsx`.
- Add `vercel.json` if the site uses React Router and needs rewrites.

## 3. Add Git Protection Early

Create `.gitignore` before the first big commit.

Always ignore:

- `node_modules/`
- `dist/`
- `.vercel/`
- `.env*`
- editor or OS junk

This prevents deployment failures and huge bad commits.

## 4. Move Page Code Carefully

- Put each page in `src/pages`.
- Fix imports after moving files.
- Make sure all pages use the same storage approach.
- If you use local storage, all pages should use the same hook like `useLocalStorage`.
- Avoid mixing storage patterns unless you really need to.

## 5. Build Shared App Features Once

Set up these shared pieces early:

- routing
- navigation
- homepage
- shared card/table styles
- shared form styles
- shared storage hook

This avoids repeating code in every page.

## 6. Verify Before Deploying

Run these locally:

```bash
npm install
npm run build
```

If build fails, fix local errors before pushing.

A successful local build is the best pre-deployment check.

## 7. Deployment Rules For Vercel

- Vercel should install dependencies itself.
- Never commit `node_modules/`.
- Never commit `dist/`.
- Keep build command as `npm run build`.
- Keep output directory as `dist`.
- Add rewrite support for React Router using `vercel.json`.

## 8. Safe Git Workflow

Recommended flow:

```bash
git status
git add .
git commit -m "Describe the change clearly"
git push
```

Before pushing, confirm:

- no accidental generated files are tracked
- no secrets are committed
- the build passes

## 9. Common Mistakes To Avoid

- starting from loose JSX files without a real app scaffold
- committing `node_modules`
- committing `dist`
- mixing multiple storage systems by accident
- deploying before running `npm run build`
- forgetting route rewrites on Vercel
- leaving page-specific styles unsupported by the global stylesheet

## 10. Best Order Next Time

Follow this order:

1. Create Vite app structure.
2. Add `.gitignore`.
3. Add routing and shared layout.
4. Add shared storage hook.
5. Move page files into `src/pages`.
6. Fix imports and shared styles.
7. Run `npm install`.
8. Run `npm run build`.
9. Commit only source files and config.
10. Push to GitHub.
11. Deploy to Vercel.

## 11. Final Quick Checklist

- Project scaffold exists
- `.gitignore` exists
- Pages are in `src/pages`
- Shared hook is consistent
- App builds locally
- `node_modules` is not tracked
- `dist` is not tracked
- GitHub repo is clean
- Vercel settings are correct

## Short Rule

Build first, verify locally, commit only source code, then deploy.
