# Nova Arena — Flat Upload Package

This is the complete Nova Arena web app in one folder with exactly three
top-level directories: `app`, `public`, and `dist`. None of those directories
contains another directory. All source imports have been updated for this
flat layout.

## Run locally

```bash
npm install
npm run dev
```

## Build for hosting

```bash
npm run build
```

The production output is `dist`. The app uses `/` as its base path and
includes SPA fallback routing, so `/chat`, `/giveaways`, `/leaderboard`, and
profile pages continue to work after refresh.

The app includes local demo data and works without extra keys or services.