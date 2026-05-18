⬡ ARES Console X v4.0
Futuristic Cyberpunk Web Application
Developed by VikashDev
�
�
�
�
Load image
Load image
Load image
Load image
◈ Features
Module
Description
Dashboard
Live device info — OS, browser, resolution, timezone, CPU cores
Metadata Viewer
Upload images, extract metadata, export clean (stripped) images
Network Intelligence
IP geolocation lookup with 12 data fields + Google Maps link
Secure Storage
XOR-encrypted file embedding + password-protected extraction
Settings
5 accent themes, animation/scanline/matrix toggles
Developer
VikashDev profile & portfolio link
Disclaimer
Legal notice and terms of use
◆ Quick Start
Prerequisites
Node.js ≥ 18.0.0
npm ≥ 9.0.0
Install & Run
Bash
Build for Production
Bash
◈ Project Structure
Code
◆ Deployment
Vercel (Recommended)
Bash
Or connect your GitHub repo on vercel.com — auto-detects Vite.
Netlify
Bash
Or set build settings:
Build command: npm run build
Publish directory: dist
GitHub Pages
Bash
◈ WebView APK
This app is optimized for Android WebView packaging:
Build the project: npm run build
Copy /dist into your Android project's assets/ folder
Load index.html in a WebView with JavaScript enabled
Enable setDomStorageEnabled(true) in your WebView settings
WebView Settings (Android):
Java
◆ Tech Stack
Technology
Version
Purpose
React
18.3.1
UI framework
Vite
5.4.8
Build tool & dev server
Tailwind CSS
3.4.13
Utility-first styling
PostCSS
8.4.47
CSS processing
Autoprefixer
10.4.20
CSS vendor prefixes
External APIs used:
ipapi.co — Free IP geolocation (1000 req/day on free tier)
fonts.googleapis.com — Orbitron, Share Tech Mono, Rajdhani fonts
◈ Customization
Change Accent Color
In src/App.jsx, locate :root inside the styles constant and change --neon-green.
Or use the Settings panel inside the app to switch between 5 built-in accent colors at runtime.
Modify Boot Sequence
Find bootSequence array in the BootScreen component in src/App.jsx.
Add New Pages
Create a new component in src/App.jsx (or extract to src/pages/)
Add it to the NAV_ITEMS array
Add it to the pages object in the main AresConsoleX component
◆ License
MIT — Free to use, modify, and distribute.
Attribution to VikashDev appreciated but not required.
◈ Developer
VikashDev
🌐 vikashdev.online
"The future is already here — it's just not evenly distributed."
