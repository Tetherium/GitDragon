# 🐲 Git Dragon — The GitHub Tamagotchi

> A retro 16-bit pixel art Tamagotchi dragon that lives on your GitHub profile README and evolves or dies based on your commit streaks! Feed your dragon by staying active and writing code.

<p align="center">
  <a href="https://git-dragon.vercel.app">
    <!-- Live Demo Badge -->
    <img src="https://git-dragon.vercel.app/api/dragon?username=gaearon" alt="Git Dragon Live Demo" />
  </a>
</p>

<p align="center">
  <a href="https://git-dragon.vercel.app"><strong>Hatch Yours Now »</strong></a>
</p>

---

## 🚀 How It Works (Paste Once, Run Forever)

You don't need to install any scripts, configure workflows, or run cron jobs. Everything updates **automatically and in real-time**:

1. **Get Your Code**: Go to [git-dragon.vercel.app](https://git-dragon.vercel.app), type in your GitHub username, and copy the Markdown snippet.
2. **Add to Profile**: Paste the snippet into your GitHub Profile `README.md`.
3. **Write Code**: As you push commits to GitHub, the serverless API dynamically scrapes your contribution graph, updates your dragon's stats, and renders its new evolved state instantly.

---

## 🧬 Evolution Guide

Keep your commit streak active to hatch and evolve your dragon. You don't have to commit every day: **you can skip up to 3 days between commits** and your dragon keeps growing from where it left off. Only days with commits count toward the streak. If you go more than 3 days without a commit, your pet turns into a ghost!

| Stage | Commit Streak | State | Sprite Preview |
| :--- | :--- | :--- | :---: |
| **Egg** | 0 - 2 Commit Days | A mystical dragon egg pulsing with potential life. | <img src="public/egg.png" width="48" height="48" image-rendering="pixelated" /> |
| **Baby** | 3 - 7 Commit Days | A tiny, adorable newborn dragon exploring the world. | <img src="public/baby.png" width="48" height="48" image-rendering="pixelated" /> |
| **Teenager** | 8 - 20 Commit Days | A proud, energetic teenager testing its wings. | <img src="public/teenager.png" width="48" height="48" image-rendering="pixelated" /> |
| **Legendary** | 21+ Commit Days | A magnificent adult dragon breathing pixelated plasma. | <img src="public/legendary.png" width="48" height="48" image-rendering="pixelated" /> |
| **Sad / Starving** | 2 - 3 Day Gap | Droopy wings and crying eyes. Commit in time and it keeps its stage and progress! | <img src="public/sad.png" width="48" height="48" image-rendering="pixelated" /> |
| **Dead (Ghost)** | 4+ Day Gap | The streak is lost and it turns into a ghost. A new commit hatches a new egg. | <img src="public/dead.png" width="48" height="48" image-rendering="pixelated" /> |

---

## 🛠️ Local Development

If you want to run the project locally or customize the sprites/logic:

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the interactive dashboard.

---

## 🎨 Asset Customization

The dragon assets are processed and embedded as base64 PNGs inside `lib/dragonAssets.js` to ensure the serverless API routes render instantly without disk lag. 

If you replace the images in the `public/` folder, you can re-run the asset processing script to re-generate the base64 map:
```bash
# Autocrops borders, sets white to transparent, resizes to 128x128 nearest-neighbor, updates lib/dragonAssets.js
node .gemini/antigravity/brain/bcec44de-3d40-46fe-9141-7f55f6e29563/scratch/process_assets.js
```

---

## 📄 License

This project is open-source and licensed under the MIT License. Feel free to fork and build your own custom Tamagotchi extensions!
