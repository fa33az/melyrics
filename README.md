# Melyrics

A modern, transparent Spotify Lyrics Overlay built specifically for OBS/Streamlabs and VTubers. Fully synced with real-time lyrics, designed with Next.js, and heavily optimized for Serverless deployments like Vercel.

## Features
- **Real-Time Synced Lyrics**: Follows along with the Spotify song you're playing (Karaoke style).
- **OBS Ready**: Fully transparent background, just drop the URL into an OBS Browser Source.
- **Remote Web Editor**: Change overlay themes, font sizes, glassmorphism UI colors, and alignment dynamically via the `/editor` panel—without touching the code!
- **Serverless Persistence**: Supports Upstash Redis for Vercel deployments, preventing annoying logouts.

## Preview
(Insert screenshot here)

---

## 🚀 How to Deploy on Vercel (Recommended)

1. **Fork/Import** this repository into your Vercel Dashboard.
2. In the Vercel Project Settings > General, ensure **Framework Preset** is set to `Next.js`.
3. Add an **Upstash Redis** database from the Vercel Storage tab (this makes sure your login session doesn't expire every 5 minutes!). Click "Connect to Project".
4. Create an application on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) to get your credentials.
5. In your Spotify app's settings, add your Vercel URL to the **Redirect URIs** (e.g., `https://your-app.vercel.app/api/callback`).
6. Set the following **Environment Variables** in Vercel:
   - `SPOTIFY_CLIENT_ID`: (from Spotify Dashboard)
   - `SPOTIFY_CLIENT_SECRET`: (from Spotify Dashboard)
   - `SPOTIFY_REDIRECT_URI`: `https://your-app.vercel.app/api/callback`
7. **Deploy!**
8. Visit your Vercel URL, click "Login with Spotify", and you're good to go!

---

## 💻 How to Run Locally

If you prefer running this on your own machine (localhost):

1. Clone this repository.
2. Run `npm install`.
3. Rename `.env.example` to `.env` and fill in your Spotify credentials.
4. If you aren't using Redis locally, the app will safely fallback to your local File System and Memory.
5. Run `npm run dev`.
6. Open `http://localhost:3000` to authenticate.
7. Use `http://localhost:3000` as your OBS Browser Source URL!

---

## 🎨 How to Edit the Theme
Go to `https://your-app.vercel.app/editor` (or `http://localhost:3000/editor`).
Any changes you make here will automatically and instantly apply to the overlay in OBS!

---

**Author:** [fa33az](https://github.com/fa33az)
