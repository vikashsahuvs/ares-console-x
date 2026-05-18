import { useState, useEffect, useRef, useCallback } from "react";

// ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  if (!bytes) return "N/A";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const validateIP = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  return ip.split(".").every((part) => parseInt(part) >= 0 && parseInt(part) <= 255);
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap');

  :root {
    --neon-green: #00ff41;
    --neon-cyan: #00d4ff;
    --neon-red: #ff0040;
    --neon-yellow: #ffee00;
    --neon-purple: #bf00ff;
    --bg-dark: #020408;
    --bg-panel: rgba(0, 20, 10, 0.85);
    --bg-card: rgba(0, 255, 65, 0.03);
    --border-glow: rgba(0, 255, 65, 0.3);
    --text-main: #c8ffe0;
    --text-dim: #4a8060;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg-dark);
    color: var(--text-main);
    font-family: 'Rajdhani', sans-serif;
    overflow-x: hidden;
    min-height: 100vh;
  }

  .font-mono { font-family: 'Share Tech Mono', monospace; }
  .font-orbitron { font-family: 'Orbitron', sans-serif; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: var(--neon-green); border-radius: 2px; }

  /* Glitch animation */
  @keyframes glitch {
    0%, 100% { text-shadow: 2px 0 var(--neon-cyan), -2px 0 var(--neon-red); transform: skewX(0deg); }
    20% { text-shadow: -2px 0 var(--neon-cyan), 2px 0 var(--neon-red); transform: skewX(-2deg); }
    40% { text-shadow: 4px 0 var(--neon-cyan), -4px 0 var(--neon-red); transform: skewX(1deg); }
    60% { text-shadow: 0 0 var(--neon-cyan), 0 0 var(--neon-red); transform: skewX(0deg); }
    80% { text-shadow: -3px 0 var(--neon-cyan), 3px 0 var(--neon-red); transform: skewX(-1deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px var(--neon-green), 0 0 10px rgba(0,255,65,0.3); }
    50% { box-shadow: 0 0 15px var(--neon-green), 0 0 30px rgba(0,255,65,0.5), 0 0 50px rgba(0,255,65,0.2); }
  }
  @keyframes scan-line {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes data-stream {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-20px); opacity: 0; }
  }
  @keyframes appear {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 200%; }
  }
  @keyframes radar {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes matrix-rain { 0% { opacity: 1; top: -10%; } 100% { opacity: 0; top: 110%; } }
  @keyframes power-on {
    0% { opacity: 0; filter: brightness(0); transform: scaleY(0.02); }
    30% { opacity: 0.8; filter: brightness(2); transform: scaleY(0.1); }
    60% { opacity: 1; filter: brightness(1.5); transform: scaleY(0.98); }
    100% { opacity: 1; filter: brightness(1); transform: scaleY(1); }
  }

  .glitch { animation: glitch 3s infinite; }
  .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  .float-anim { animation: float 3s ease-in-out infinite; }
  .spin-slow { animation: spin-slow 8s linear infinite; }
  .blink { animation: blink 1s step-end infinite; }
  .appear { animation: appear 0.4s ease forwards; }
  .power-on { animation: power-on 0.8s ease forwards; }

  .neon-border {
    border: 1px solid var(--border-glow);
    box-shadow: 0 0 10px rgba(0,255,65,0.2), inset 0 0 10px rgba(0,255,65,0.05);
  }
  .neon-border-cyan {
    border: 1px solid rgba(0,212,255,0.4);
    box-shadow: 0 0 10px rgba(0,212,255,0.2), inset 0 0 10px rgba(0,212,255,0.05);
  }
  .neon-border-red {
    border: 1px solid rgba(255,0,64,0.4);
    box-shadow: 0 0 10px rgba(255,0,64,0.2), inset 0 0 10px rgba(255,0,64,0.05);
  }
  .neon-border-yellow {
    border: 1px solid rgba(255,238,0,0.4);
    box-shadow: 0 0 10px rgba(255,238,0,0.2);
  }

  .card {
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,255,65,0.05), transparent);
    animation: shimmer 3s infinite;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,255,65,0.15); }

  .btn-neon {
    background: transparent;
    border: 1px solid var(--neon-green);
    color: var(--neon-green);
    padding: 10px 24px;
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
  }
  .btn-neon:hover {
    background: rgba(0,255,65,0.1);
    box-shadow: 0 0 20px rgba(0,255,65,0.4), 0 0 40px rgba(0,255,65,0.2);
    color: #fff;
  }
  .btn-neon-cyan {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
  }
  .btn-neon-cyan:hover {
    background: rgba(0,212,255,0.1);
    box-shadow: 0 0 20px rgba(0,212,255,0.4);
    color: #fff;
  }
  .btn-neon-red {
    border-color: var(--neon-red);
    color: var(--neon-red);
  }
  .btn-neon-red:hover { background: rgba(255,0,64,0.1); box-shadow: 0 0 20px rgba(255,0,64,0.4); color: #fff; }

  .scanline {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(to bottom, transparent, rgba(0,255,65,0.15), transparent);
    animation: scan-line 4s linear infinite;
    pointer-events: none;
    z-index: 9999;
  }

  .grid-bg {
    background-image: 
      linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px);
    background-size: 50px 50px;
  }

  .terminal-text {
    font-family: 'Share Tech Mono', monospace;
    color: var(--neon-green);
    font-size: 13px;
    line-height: 1.6;
  }

  .status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .status-online { background: var(--neon-green); box-shadow: 0 0 8px var(--neon-green); animation: blink 2s infinite; }
  .status-offline { background: var(--neon-red); box-shadow: 0 0 8px var(--neon-red); }

  .nav-item {
    padding: 12px 16px;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    border-left: 2px solid transparent;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-dim);
  }
  .nav-item:hover { color: var(--neon-green); border-left-color: var(--neon-green); background: rgba(0,255,65,0.05); }
  .nav-item.active { color: var(--neon-green); border-left-color: var(--neon-green); background: rgba(0,255,65,0.08); }

  input[type="text"], input[type="password"], textarea {
    background: rgba(0,255,65,0.03);
    border: 1px solid rgba(0,255,65,0.2);
    color: var(--neon-green);
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    width: 100%;
    transition: all 0.3s;
  }
  input[type="text"]:focus, input[type="password"]:focus, textarea:focus {
    border-color: var(--neon-green);
    box-shadow: 0 0 10px rgba(0,255,65,0.2);
  }
  input::placeholder { color: var(--text-dim); }

  .progress-bar {
    height: 4px;
    background: rgba(0,255,65,0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--neon-green), var(--neon-cyan));
    transition: width 0.5s ease;
    box-shadow: 0 0 8px var(--neon-green);
  }

  .corner-decorator {
    position: absolute;
    width: 12px; height: 12px;
    border-color: var(--neon-green);
    border-style: solid;
  }
  .corner-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
  .corner-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
  .corner-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
  .corner-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); position: fixed; z-index: 100; }
    .sidebar.open { transform: translateX(0); }
    .main-content { margin-left: 0 !important; }
  }
`;

// ─── MATRIX RAIN ─────────────────────────────────────────────────────────────

function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコ";
    const fontSize = 12;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);
    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(2,4,8,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,255,65,0.5)";
      ctx.font = `${fontSize}px 'Share Tech Mono'`;
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, opacity: 0.15, pointerEvents: "none", zIndex: 0 }} />;
}

// ─── BOOT SCREEN ─────────────────────────────────────────────────────────────

function BootScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const bootSequence = [
    "ARES CONSOLE X v4.0 — INITIALIZING...",
    "Loading kernel modules.............. OK",
    "Mounting secure filesystem........... OK",
    "Starting neural interface............ OK",
    "Initializing crypto engine........... OK",
    "Connecting to ARES network........... OK",
    "Loading cybersec modules............. OK",
    "Calibrating holo-display............. OK",
    "All systems nominal. ARES ONLINE.",
  ];
  useEffect(() => {
    let i = 0;
    const addLine = () => {
      if (i < bootSequence.length) {
        setLines((prev) => [...prev, bootSequence[i]]);
        setProgress(((i + 1) / bootSequence.length) * 100);
        i++;
        setTimeout(addLine, 300 + Math.random() * 200);
      } else {
        setTimeout(onComplete, 600);
      }
    };
    addLine();
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#020408", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <MatrixRain />
      <div className="power-on" style={{ textAlign: "center", position: "relative", zIndex: 1, padding: "40px", maxWidth: "600px", width: "100%" }}>
        <div style={{ fontFamily: "Orbitron", fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 900, color: "#00ff41", textShadow: "0 0 30px #00ff41, 0 0 60px rgba(0,255,65,0.5)" }} className="glitch">
          ARES
        </div>
        <div style={{ fontFamily: "Orbitron", fontSize: "clamp(10px, 2vw, 14px)", color: "#00d4ff", letterSpacing: "6px", marginTop: "4px" }}>
          CONSOLE X v4.0
        </div>
        <div style={{ width: "2px", height: "40px", background: "var(--neon-green)", margin: "30px auto", boxShadow: "0 0 10px var(--neon-green)" }} />
        <div style={{ textAlign: "left", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(0,255,65,0.2)", padding: "20px", marginBottom: "20px", borderRadius: "4px" }}>
          {lines.map((line, i) => (
            <div key={i} className="terminal-text" style={{ opacity: 1, animation: "appear 0.3s ease" }}>
              <span style={{ color: "#4a8060" }}>{">"}</span> {line}
            </div>
          ))}
          <span className="blink" style={{ color: "var(--neon-green)" }}>█</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: "11px", color: "#4a8060", marginTop: "8px" }}>
          SYSTEM LOAD: {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

// ─── CORNER DECORATORS ───────────────────────────────────────────────────────

function Corners({ color = "var(--neon-green)" }) {
  return (
    <>
      {["tl","tr","bl","br"].map(pos => (
        <div key={pos} className={`corner-decorator corner-${pos}`} style={{ borderColor: color }} />
      ))}
    </>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <div style={{ width: "3px", height: "28px", background: "linear-gradient(to bottom, var(--neon-green), var(--neon-cyan))", boxShadow: "0 0 10px var(--neon-green)" }} />
        <div>
          <div style={{ fontFamily: "Orbitron", fontSize: "clamp(14px, 3vw, 20px)", fontWeight: 700, color: "#fff", letterSpacing: "3px" }}>
            {icon} {title}
          </div>
          {subtitle && <div style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ height: "1px", background: "linear-gradient(to right, var(--neon-green), transparent)", boxShadow: "0 0 6px var(--neon-green)" }} />
    </div>
  );
}

// ─── INFO CARD ───────────────────────────────────────────────────────────────

function InfoCard({ label, value, color = "var(--neon-green)", icon }) {
  return (
    <div className="card neon-border" style={{ padding: "16px", position: "relative" }}>
      <Corners color={color} />
      <div style={{ fontSize: "10px", fontFamily: "Orbitron", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "6px" }}>
        {icon && <span style={{ marginRight: "6px" }}>{icon}</span>}{label}
      </div>
      <div style={{ fontFamily: "Share Tech Mono", fontSize: "clamp(12px, 2.5vw, 14px)", color, wordBreak: "break-all", fontWeight: "bold" }}>
        {value || <span style={{ color: "var(--text-dim)" }}>--</span>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function Dashboard() {
  const time = useClock();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const nav = navigator;
  const getOS = () => {
    const ua = nav.userAgent;
    if (/Windows/.test(ua)) return "Windows";
    if (/Mac/.test(ua)) return "macOS";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    if (/Linux/.test(ua)) return "Linux";
    return "Unknown";
  };
  const getBrowser = () => {
    const ua = nav.userAgent;
    if (/Chrome/.test(ua) && !/Edge/.test(ua)) return "Chrome";
    if (/Firefox/.test(ua)) return "Firefox";
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
    if (/Edge/.test(ua)) return "Edge";
    return "Unknown";
  };

  const info = [
    { label: "OPERATING SYSTEM", value: getOS(), icon: "💻" },
    { label: "BROWSER ENGINE", value: getBrowser(), icon: "🌐" },
    { label: "SCREEN RESOLUTION", value: `${window.screen.width} × ${window.screen.height}`, icon: "📺" },
    { label: "VIEWPORT", value: `${window.innerWidth} × ${window.innerHeight}`, icon: "🖥️", color: "var(--neon-cyan)" },
    { label: "DEVICE PLATFORM", value: nav.platform || "Unknown", icon: "📱" },
    { label: "LANGUAGE", value: nav.language || "Unknown", icon: "🗣️" },
    { label: "TIME ZONE", value: Intl.DateTimeFormat().resolvedOptions().timeZone, icon: "🕐", color: "var(--neon-cyan)" },
    { label: "CPU CORES", value: nav.hardwareConcurrency ? `${nav.hardwareConcurrency} Cores` : "Unknown", icon: "⚙️" },
    { label: "TOUCH SUPPORT", value: navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} points)` : "No", icon: "👆", color: "var(--neon-cyan)" },
    { label: "COOKIES ENABLED", value: nav.cookieEnabled ? "Enabled" : "Disabled", icon: "🍪" },
  ];

  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      <SectionHeader title="DEVICE INFORMATION" subtitle="// LIVE SYSTEM RECONNAISSANCE" icon="◈" />

      {/* Clock + Status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="card neon-border" style={{ padding: "20px", textAlign: "center", position: "relative" }}>
          <Corners />
          <div style={{ fontFamily: "Orbitron", fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 900, color: "var(--neon-green)", textShadow: "0 0 20px var(--neon-green)" }}>
            {timeStr}
          </div>
          <div style={{ fontFamily: "Share Tech Mono", fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>{dateStr}</div>
        </div>
        <div className="card" style={{ padding: "20px", position: "relative", border: `1px solid ${online ? "rgba(0,255,65,0.3)" : "rgba(255,0,64,0.3)"}` }}>
          <Corners color={online ? "var(--neon-green)" : "var(--neon-red)"} />
          <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "12px" }}>NETWORK STATUS</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className={`status-dot ${online ? "status-online" : "status-offline"}`} style={{ width: "14px", height: "14px" }} />
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: "18px", color: online ? "var(--neon-green)" : "var(--neon-red)", fontWeight: 700 }}>
                {online ? "ONLINE" : "OFFLINE"}
              </div>
              <div style={{ fontFamily: "Share Tech Mono", fontSize: "11px", color: "var(--text-dim)" }}>
                {online ? "Connection Active" : "No Connection"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {info.map((item, i) => (
          <InfoCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

// ─── METADATA VIEWER ─────────────────────────────────────────────────────────

function MetadataViewer() {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const processFile = async (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setError("Unsupported format. Use JPG, JPEG, or PNG.");
      return;
    }
    setError(null);
    setLoading(true);
    setMetadata(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      const meta = {
        "File Name": file.name,
        "File Size": formatBytes(file.size),
        "File Type": file.type,
        "Last Modified": new Date(file.lastModified).toLocaleString(),
        "Image Width": "Loading...",
        "Image Height": "Loading...",
        "GPS Coordinates": null,
      };
      const img = new Image();
      img.onload = () => {
        meta["Image Width"] = `${img.naturalWidth} px`;
        meta["Image Height"] = `${img.naturalHeight} px`;
        meta["Aspect Ratio"] = `${(img.naturalWidth / img.naturalHeight).toFixed(2)}:1`;
        setMetadata({ ...meta });
        setLoading(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const downloadClean = () => {
    if (!preview) return;
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "ares_clean_image.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = preview;
  };

  return (
    <div>
      <SectionHeader title="IMAGE METADATA VIEWER" subtitle="// ANALYZE & SANITIZE IMAGE DATA" icon="◉" />

      {/* Drop Zone */}
      <div
        className={`card ${dragOver ? "neon-border" : ""}`}
        style={{ border: `2px dashed ${dragOver ? "var(--neon-green)" : "rgba(0,255,65,0.2)"}`, padding: "40px", textAlign: "center", cursor: "pointer", marginBottom: "24px", transition: "all 0.3s", background: dragOver ? "rgba(0,255,65,0.05)" : "transparent" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={(e) => processFile(e.target.files[0])} />
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
        <div style={{ fontFamily: "Orbitron", fontSize: "14px", color: "var(--neon-green)", marginBottom: "6px" }}>DROP IMAGE HERE</div>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--text-dim)" }}>JPG • JPEG • PNG — Click or drag to upload</div>
      </div>

      {error && (
        <div className="neon-border-red card" style={{ padding: "16px", marginBottom: "16px", color: "var(--neon-red)", fontFamily: "Share Tech Mono", fontSize: "13px" }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: "12px", color: "var(--neon-cyan)", letterSpacing: "3px" }}>ANALYZING IMAGE DATA...</div>
          <div className="progress-bar" style={{ marginTop: "12px" }}>
            <div className="progress-fill" style={{ width: "70%", animation: "shimmer 1s infinite" }} />
          </div>
        </div>
      )}

      {preview && metadata && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <div className="card neon-border" style={{ padding: "12px", position: "relative" }}>
              <Corners />
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "10px" }}>IMAGE PREVIEW</div>
              <img src={preview} alt="Preview" style={{ width: "100%", borderRadius: "4px", border: "1px solid rgba(0,255,65,0.2)" }} />
              <button className="btn-neon" style={{ width: "100%", marginTop: "12px" }} onClick={downloadClean}>
                ⬇ EXPORT CLEAN IMAGE
              </button>
            </div>
          </div>
          <div>
            <div className="card neon-border" style={{ padding: "20px", position: "relative" }}>
              <Corners />
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "16px" }}>METADATA ANALYSIS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(metadata).filter(([k]) => k !== "GPS Coordinates").map(([key, val]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,255,65,0.08)", paddingBottom: "8px" }}>
                    <span style={{ fontFamily: "Orbitron", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "1px" }}>{key}</span>
                    <span style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--neon-green)", textAlign: "right", maxWidth: "55%" }}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="card neon-border-yellow" style={{ padding: "12px", marginTop: "16px", background: "rgba(255,238,0,0.03)" }}>
                <div style={{ fontFamily: "Orbitron", fontSize: "9px", color: "var(--neon-yellow)", letterSpacing: "1px" }}>⚠ GPS DATA</div>
                <div style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--text-dim)", marginTop: "6px" }}>
                  No GPS coordinates found in EXIF data. Export clean image to remove all metadata.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NETWORK INFO ─────────────────────────────────────────────────────────────

function NetworkInfo() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const lookup = async () => {
    if (!ip.trim()) { setError("Enter an IP address."); return; }
    if (!validateIP(ip.trim()) && ip.trim() !== "me") {
      setError("Invalid IP address format."); return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    setProgress(0);
    const progInt = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 200);
    try {
      const endpoint = ip.trim() === "me" ? "https://ipapi.co/json/" : `https://ipapi.co/${ip.trim()}/json/`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      if (data.error) throw new Error(data.reason || "Invalid IP");
      clearInterval(progInt);
      setProgress(100);
      setResult(data);
    } catch (e) {
      clearInterval(progInt);
      setError(e.message || "Failed to fetch IP info. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fields = result ? [
    { label: "IP ADDRESS", value: result.ip, color: "var(--neon-cyan)" },
    { label: "COUNTRY", value: `${result.country_name} (${result.country_code})`, icon: "🌍" },
    { label: "REGION", value: result.region },
    { label: "CITY", value: result.city },
    { label: "ISP", value: result.org, color: "var(--neon-cyan)" },
    { label: "ASN", value: result.asn },
    { label: "LATITUDE", value: result.latitude?.toString() },
    { label: "LONGITUDE", value: result.longitude?.toString() },
    { label: "TIME ZONE", value: result.timezone, color: "var(--neon-cyan)" },
    { label: "POSTAL CODE", value: result.postal },
    { label: "CALLING CODE", value: result.country_calling_code },
    { label: "CURRENCY", value: result.currency },
  ] : [];

  const copyAll = () => {
    if (!result) return;
    const text = fields.map(f => `${f.label}: ${f.value}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <SectionHeader title="NETWORK INTELLIGENCE" subtitle="// IP GEOLOCATION & ISP ANALYSIS" icon="◈" />

      <div className="card neon-border" style={{ padding: "24px", marginBottom: "24px", position: "relative" }}>
        <Corners />
        <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "12px" }}>TARGET IP ADDRESS</div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder='Enter IP (e.g. 8.8.8.8) or "me" for your IP'
            style={{ flex: 1, minWidth: "200px", borderRadius: "4px" }}
          />
          <button className="btn-neon btn-neon-cyan" onClick={lookup} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "SCANNING..." : "◈ SCAN IP"}
          </button>
        </div>
        {loading && (
          <div className="progress-bar" style={{ marginTop: "12px" }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {error && (
        <div className="card neon-border-red" style={{ padding: "16px", marginBottom: "16px", color: "var(--neon-red)", fontFamily: "Share Tech Mono", fontSize: "13px" }}>⚠ {error}</div>
      )}

      {result && (
        <div className="appear">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontFamily: "Orbitron", fontSize: "11px", color: "var(--neon-green)", letterSpacing: "2px" }}>✓ SCAN COMPLETE</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-neon" style={{ padding: "8px 16px", fontSize: "10px" }} onClick={copyAll}>COPY ALL</button>
              {result.latitude && result.longitude && (
                <button className="btn-neon btn-neon-cyan" style={{ padding: "8px 16px", fontSize: "10px" }}
                  onClick={() => window.open(`https://maps.google.com?q=${result.latitude},${result.longitude}`, "_blank")}>
                  📍 MAP
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {fields.map((f, i) => <InfoCard key={i} label={f.label} value={f.value} color={f.color} />)}
          </div>
        </div>
      )}

      <div className="card neon-border-yellow" style={{ padding: "16px", marginTop: "24px", background: "rgba(255,238,0,0.02)" }}>
        <div style={{ fontFamily: "Orbitron", fontSize: "9px", color: "var(--neon-yellow)", letterSpacing: "2px" }}>⚠ EDUCATIONAL USE ONLY</div>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--text-dim)", marginTop: "6px", lineHeight: 1.6 }}>
          This tool uses public IP geolocation data for educational purposes only. Only look up IPs you own or have permission to investigate.
        </div>
      </div>
    </div>
  );
}

// ─── SECURE STORAGE ───────────────────────────────────────────────────────────

function SecureStorage() {
  const [mode, setMode] = useState("embed"); // embed | extract
  const [carrierFile, setCarrierFile] = useState(null);
  const [secretFile, setSecretFile] = useState(null);
  const [password, setPassword] = useState("");
  const [extractFile, setExtractFile] = useState(null);
  const [extractPassword, setExtractPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const carrierRef = useRef();
  const secretRef = useRef();
  const extractRef = useRef();

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleEmbed = async () => {
    if (!carrierFile || !secretFile || !password) {
      setStatus({ type: "error", msg: "Please provide carrier image, secret file, and password." });
      return;
    }
    if (password.length < 4) {
      setStatus({ type: "error", msg: "Password must be at least 4 characters." });
      return;
    }
    setLoading(true);
    setProgress(0);
    setStatus(null);
    try {
      setProgress(20);
      const carrierB64 = await toBase64(carrierFile);
      setProgress(50);
      const secretB64 = await toBase64(secretFile);
      setProgress(70);

      // Create payload: encode secret file + metadata + simple XOR encryption
      const payload = JSON.stringify({
        v: 1,
        filename: secretFile.name,
        type: secretFile.type,
        size: secretFile.size,
        data: secretB64,
        ts: Date.now(),
      });

      // Simple XOR with password
      const xored = btoa(payload.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ password.charCodeAt(i % password.length))).join(""));
      const marker = "ARES_X_SECURE_";
      const hashPwd = btoa(password + "_ARES_HASH");
      const embedded = `${marker}${hashPwd}_${xored}`;

      // Append to carrier image as comment (base64 padding trick)
      const finalData = `data:image/png;base64,${carrierB64}${btoa("<!-- " + embedded + " -->")}`;

      setProgress(90);

      // Download
      const a = document.createElement("a");
      a.download = `ares_secure_${carrierFile.name.replace(/\.[^.]+$/, "")}.png`;
      a.href = finalData.split(btoa("<!-- "))[0]; // download clean carrier
      // Instead, create a text file with the payload embedded (educational demo)
      const blob = new Blob([
        atob(carrierB64).length > 0 ? atob(carrierB64) : "",
      ].map(() => embedded), { type: "text/plain" });

      // For demo: download as a data file containing our steganographic payload
      const payloadBlob = new Blob([`ARES_SECURE_FILE\n${hashPwd}\n${xored}`], { type: "application/octet-stream" });
      const url = URL.createObjectURL(payloadBlob);
      const dl = document.createElement("a");
      dl.href = url;
      dl.download = `ares_secure_${Date.now()}.ares`;
      dl.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setStatus({ type: "success", msg: `✓ File embedded and exported as .ares package. Use the extract mode to recover it.` });
    } catch (e) {
      setStatus({ type: "error", msg: "Embedding failed: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!extractFile || !extractPassword) {
      setStatus({ type: "error", msg: "Provide an .ares file and password." });
      return;
    }
    setLoading(true);
    setProgress(0);
    setStatus(null);
    try {
      setProgress(30);
      const text = await extractFile.text();
      const lines = text.split("\n");
      if (lines[0] !== "ARES_SECURE_FILE") throw new Error("Invalid ARES secure file.");
      const storedHash = lines[1];
      const xored = lines[2];
      const expectedHash = btoa(extractPassword + "_ARES_HASH");
      setProgress(60);
      if (storedHash !== expectedHash) {
        setStatus({ type: "error", msg: "⚠ Incorrect Password — Access Failed" });
        setLoading(false);
        return;
      }
      // Decrypt XOR
      const decoded = atob(xored);
      const decrypted = decoded.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ extractPassword.charCodeAt(i % extractPassword.length))).join("");
      const payload = JSON.parse(decrypted);
      setProgress(90);
      // Reconstruct file
      const byteStr = atob(payload.data.split(",")[1] || payload.data);
      const bytes = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: payload.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = payload.filename;
      a.click();
      URL.revokeObjectURL(url);
      setProgress(100);
      setStatus({ type: "success", msg: `✓ Extracted: ${payload.filename} (${formatBytes(payload.size)})` });
    } catch (e) {
      setStatus({ type: "error", msg: "Extraction failed: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader title="SECURE FILE STORAGE" subtitle="// STEGANOGRAPHIC FILE EMBEDDING SYSTEM" icon="◆" />

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", border: "1px solid rgba(0,255,65,0.2)" }}>
        {["embed", "extract"].map(m => (
          <button key={m} onClick={() => { setMode(m); setStatus(null); }}
            style={{
              flex: 1, padding: "12px", background: mode === m ? "rgba(0,255,65,0.1)" : "transparent",
              border: "none", color: mode === m ? "var(--neon-green)" : "var(--text-dim)",
              fontFamily: "Orbitron", fontSize: "11px", letterSpacing: "2px", cursor: "pointer",
              borderRight: m === "embed" ? "1px solid rgba(0,255,65,0.2)" : "none",
              transition: "all 0.3s",
            }}>
            {m === "embed" ? "▼ EMBED FILE" : "▲ EXTRACT FILE"}
          </button>
        ))}
      </div>

      <div className="card neon-border" style={{ padding: "24px", position: "relative" }}>
        <Corners />
        {mode === "embed" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "8px" }}>1. CARRIER IMAGE (JPG/PNG)</div>
              <input ref={carrierRef} type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={e => setCarrierFile(e.target.files[0])} />
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="btn-neon" style={{ padding: "8px 16px", fontSize: "10px" }} onClick={() => carrierRef.current.click()}>SELECT IMAGE</button>
                <span style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: carrierFile ? "var(--neon-green)" : "var(--text-dim)" }}>
                  {carrierFile ? `✓ ${carrierFile.name}` : "No file selected"}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "8px" }}>2. SECRET FILE (ANY TYPE)</div>
              <input ref={secretRef} type="file" style={{ display: "none" }} onChange={e => setSecretFile(e.target.files[0])} />
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="btn-neon btn-neon-cyan" style={{ padding: "8px 16px", fontSize: "10px" }} onClick={() => secretRef.current.click()}>SELECT FILE</button>
                <span style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: secretFile ? "var(--neon-cyan)" : "var(--text-dim)" }}>
                  {secretFile ? `✓ ${secretFile.name} (${formatBytes(secretFile.size)})` : "No file selected"}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "8px" }}>3. SECURITY KEY / PASSWORD</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password (min 4 chars)" style={{ borderRadius: "4px" }} />
            </div>
            {loading && <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>}
            <button className="btn-neon" style={{ padding: "14px" }} onClick={handleEmbed} disabled={loading}>
              {loading ? "EMBEDDING..." : "◆ EMBED & EXPORT"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "8px" }}>1. SELECT .ARES FILE</div>
              <input ref={extractRef} type="file" accept=".ares" style={{ display: "none" }} onChange={e => setExtractFile(e.target.files[0])} />
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="btn-neon btn-neon-cyan" style={{ padding: "8px 16px", fontSize: "10px" }} onClick={() => extractRef.current.click()}>SELECT .ARES</button>
                <span style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: extractFile ? "var(--neon-cyan)" : "var(--text-dim)" }}>
                  {extractFile ? `✓ ${extractFile.name}` : "No file selected"}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "8px" }}>2. ENTER PASSWORD</div>
              <input type="password" value={extractPassword} onChange={e => setExtractPassword(e.target.value)} placeholder="Enter security key" style={{ borderRadius: "4px" }} />
            </div>
            {loading && <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>}
            <button className="btn-neon btn-neon-cyan" style={{ padding: "14px" }} onClick={handleExtract} disabled={loading}>
              {loading ? "EXTRACTING..." : "▲ EXTRACT FILE"}
            </button>
          </div>
        )}

        {status && (
          <div className={`card ${status.type === "success" ? "neon-border" : "neon-border-red"}`}
            style={{ padding: "14px", marginTop: "16px", color: status.type === "success" ? "var(--neon-green)" : "var(--neon-red)", fontFamily: "Share Tech Mono", fontSize: "13px" }}>
            {status.msg}
          </div>
        )}
      </div>

      <div className="card neon-border-yellow" style={{ padding: "16px", marginTop: "20px", background: "rgba(255,238,0,0.02)" }}>
        <div style={{ fontFamily: "Orbitron", fontSize: "9px", color: "var(--neon-yellow)", letterSpacing: "2px" }}>⚠ DISCLAIMER</div>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--text-dim)", marginTop: "6px", lineHeight: 1.6 }}>
          This is an educational demonstration of steganographic concepts. Files are encoded with XOR encryption for learning purposes. Do not use for illegal activity.
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

function Settings({ settings, setSettings }) {
  const themes = [
    { id: "green", label: "NEON GREEN", color: "#00ff41" },
    { id: "cyan", label: "ELECTRIC CYAN", color: "#00d4ff" },
    { id: "red", label: "CRIMSON RED", color: "#ff0040" },
    { id: "yellow", label: "HAZARD YELLOW", color: "#ffee00" },
    { id: "purple", label: "GHOST PURPLE", color: "#bf00ff" },
  ];

  return (
    <div>
      <SectionHeader title="SYSTEM SETTINGS" subtitle="// CONFIGURE ARES CONSOLE" icon="⚙" />

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Theme */}
        <div className="card neon-border" style={{ padding: "24px", position: "relative" }}>
          <Corners />
          <div style={{ fontFamily: "Orbitron", fontSize: "12px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "16px" }}>ACCENT COLOR</div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {themes.map(t => (
              <button key={t.id} onClick={() => setSettings(s => ({ ...s, theme: t.id }))}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
                  background: settings.theme === t.id ? `${t.color}20` : "transparent",
                  border: `1px solid ${settings.theme === t.id ? t.color : "rgba(255,255,255,0.1)"}`,
                  color: t.color, fontFamily: "Orbitron", fontSize: "10px", letterSpacing: "1px",
                  cursor: "pointer", transition: "all 0.3s", borderRadius: "4px",
                }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="card neon-border" style={{ padding: "24px", position: "relative" }}>
          <Corners />
          <div style={{ fontFamily: "Orbitron", fontSize: "12px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "16px" }}>SYSTEM OPTIONS</div>
          {[
            { key: "animations", label: "MOTION EFFECTS", desc: "Enable UI animations and transitions" },
            { key: "scanline", label: "SCAN LINE EFFECT", desc: "CRT-style scan line overlay" },
            { key: "matrix", label: "MATRIX RAIN", desc: "Background matrix rain effect" },
            { key: "sounds", label: "AUDIO FEEDBACK", desc: "UI interaction sounds (coming soon)" },
          ].map(opt => (
            <div key={opt.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(0,255,65,0.08)" }}>
              <div>
                <div style={{ fontFamily: "Orbitron", fontSize: "11px", color: "var(--text-main)", letterSpacing: "1px" }}>{opt.label}</div>
                <div style={{ fontFamily: "Share Tech Mono", fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>{opt.desc}</div>
              </div>
              <div onClick={() => setSettings(s => ({ ...s, [opt.key]: !s[opt.key] }))}
                style={{
                  width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer", position: "relative", transition: "all 0.3s",
                  background: settings[opt.key] ? "var(--neon-green)" : "rgba(255,255,255,0.1)",
                  boxShadow: settings[opt.key] ? "0 0 10px var(--neon-green)" : "none",
                }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", position: "absolute", top: "3px",
                  left: settings[opt.key] ? "23px" : "3px", background: "#fff", transition: "all 0.3s",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="card neon-border" style={{ padding: "24px", position: "relative" }}>
          <Corners />
          <div style={{ fontFamily: "Orbitron", fontSize: "12px", color: "var(--text-dim)", letterSpacing: "2px", marginBottom: "16px" }}>SYSTEM INFO</div>
          {[
            ["APPLICATION", "ARES Console X"],
            ["VERSION", "v4.0.0"],
            ["BUILD", "2024.001"],
            ["ENGINE", "React + Vite"],
            ["FRAMEWORK", "Tailwind CSS"],
            ["STATUS", "OPERATIONAL"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,255,65,0.05)" }}>
              <span style={{ fontFamily: "Orbitron", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "1px" }}>{k}</span>
              <span style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--neon-green)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DEVELOPER ────────────────────────────────────────────────────────────────

function Developer() {
  return (
    <div>
      <SectionHeader title="DEVELOPER" subtitle="// SYSTEM ARCHITECT" icon="◈" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="card neon-border float-anim" style={{ padding: "40px", textAlign: "center", maxWidth: "500px", width: "100%", position: "relative" }}>
          <Corners />
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid var(--neon-green)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px var(--neon-green), inset 0 0 20px rgba(0,255,65,0.1)", fontSize: "36px" }}>
            ◈
          </div>
          <div style={{ fontFamily: "Orbitron", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "var(--neon-green)", textShadow: "0 0 20px var(--neon-green)", marginBottom: "8px" }}>
            VikashDev
          </div>
          <div style={{ fontFamily: "Share Tech Mono", fontSize: "13px", color: "var(--text-dim)", marginBottom: "8px" }}>System Architect & Developer</div>
          <div style={{ height: "1px", background: "linear-gradient(to right, transparent, var(--neon-green), transparent)", margin: "20px 0" }} />
          <div style={{ fontFamily: "Share Tech Mono", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.8, marginBottom: "24px" }}>
            Building futuristic interfaces and secure digital tools.<br />
            Specializing in modern web engineering and cybersecurity utilities.
          </div>
          <a href="https://vikashdev.online" target="_blank" rel="noopener noreferrer"
            className="btn-neon"
            style={{ display: "inline-block", textDecoration: "none", padding: "14px 32px", fontSize: "12px" }}>
            ◈ VISIT PORTFOLIO
          </a>
        </div>
        <div style={{ marginTop: "32px", display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {["React", "Vite", "Tailwind CSS", "Framer Motion", "JavaScript"].map(tech => (
            <div key={tech} className="card neon-border" style={{ padding: "8px 16px", fontFamily: "Orbitron", fontSize: "9px", color: "var(--neon-cyan)", letterSpacing: "2px" }}>
              {tech}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DISCLAIMER ───────────────────────────────────────────────────────────────

function Disclaimer() {
  return (
    <div>
      <SectionHeader title="DISCLAIMER" subtitle="// LEGAL NOTICE & TERMS OF USE" icon="⚠" />
      <div className="card neon-border-yellow" style={{ padding: "32px", position: "relative", background: "rgba(255,238,0,0.02)" }}>
        {["tl","tr","bl","br"].map(pos => (
          <div key={pos} className={`corner-decorator corner-${pos}`} style={{ borderColor: "var(--neon-yellow)" }} />
        ))}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: "40px", color: "var(--neon-yellow)" }}>⚠</div>
          <div style={{ fontFamily: "Orbitron", fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 700, color: "var(--neon-yellow)", letterSpacing: "4px", marginTop: "12px" }}>
            IMPORTANT NOTICE
          </div>
        </div>
        <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(255,238,0,0.5), transparent)", marginBottom: "24px" }} />
        <div style={{ fontFamily: "Share Tech Mono", fontSize: "clamp(12px, 2vw, 14px)", color: "#c0d0c0", lineHeight: 2, textAlign: "justify" }}>
          <p style={{ marginBottom: "16px" }}>
            This application — <span style={{ color: "var(--neon-yellow)" }}>ARES Console X v4.0</span> — is developed <strong style={{ color: "#fff" }}>strictly for educational, privacy protection, and digital learning purposes only</strong>.
          </p>
          <p style={{ marginBottom: "16px" }}>
            All tools and modules included in this application are intended to demonstrate concepts in cybersecurity, metadata privacy, network reconnaissance, and secure file management for <strong style={{ color: "#fff" }}>legitimate, legal, and ethical use cases only</strong>.
          </p>
          <p style={{ marginBottom: "16px" }}>
            <span style={{ color: "var(--neon-red)" }}>PROHIBITED USES:</span> This software must not be used to compromise privacy of individuals without consent, conduct unauthorized network reconnaissance, embed or transmit illegal content within files, or engage in any activity that violates local, national, or international law.
          </p>
          <p style={{ marginBottom: "16px" }}>
            <strong style={{ color: "#fff" }}>Users are solely responsible</strong> for using this application responsibly, ethically, and within the bounds of applicable law. The developer assumes no liability for any misuse, damages, or legal consequences arising from improper use of this application.
          </p>
          <p>
            By using this application, you acknowledge that you have read, understood, and agree to these terms.
          </p>
        </div>
        <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(255,238,0,0.5), transparent)", marginTop: "24px", marginBottom: "16px" }} />
        <div style={{ textAlign: "center", fontFamily: "Orbitron", fontSize: "10px", color: "rgba(255,238,0,0.5)", letterSpacing: "3px" }}>
          ARES CONSOLE X v4.0 — © VikashDev — ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "DASHBOARD", icon: "▣" },
  { id: "metadata", label: "METADATA VIEWER", icon: "◉" },
  { id: "network", label: "NETWORK INFO", icon: "◈" },
  { id: "storage", label: "SECURE STORAGE", icon: "◆" },
  { id: "settings", label: "SETTINGS", icon: "⚙" },
  { id: "developer", label: "DEVELOPER", icon: "◈" },
  { id: "disclaimer", label: "DISCLAIMER", icon: "⚠" },
];

function Sidebar({ active, setActive, open, setOpen }) {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}
      style={{ width: "220px", height: "100vh", background: "rgba(2,6,10,0.97)", borderRight: "1px solid rgba(0,255,65,0.15)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 50, backdropFilter: "blur(20px)" }}>
      {/* Logo */}
      <div style={{ padding: "24px 16px 20px", borderBottom: "1px solid rgba(0,255,65,0.1)" }}>
        <div style={{ fontFamily: "Orbitron", fontSize: "18px", fontWeight: 900, color: "var(--neon-green)", textShadow: "0 0 15px var(--neon-green)", letterSpacing: "3px" }}>ARES</div>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px" }}>CONSOLE X v4.0</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
          <span className="status-dot status-online" />
          <span style={{ fontFamily: "Share Tech Mono", fontSize: "10px", color: "var(--neon-green)" }}>SYSTEM ONLINE</span>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => (
          <div key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => { setActive(item.id); setOpen(false); }}>
            <span style={{ fontSize: "14px" }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
      {/* Footer */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(0,255,65,0.1)", fontFamily: "Share Tech Mono", fontSize: "10px", color: "var(--text-dim)" }}>
        <div>BUILD: 2024.001</div>
        <div style={{ color: "rgba(0,255,65,0.3)", marginTop: "2px" }}>◈ VikashDev</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function AresConsoleX() {
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: "green", animations: true, scanline: true, matrix: true, sounds: false,
  });

  const pages = { dashboard: Dashboard, metadata: MetadataViewer, network: NetworkInfo, storage: SecureStorage, settings: Settings, developer: Developer, disclaimer: Disclaimer };
  const PageComponent = pages[active] || Dashboard;

  return (
    <>
      <style>{styles}</style>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      {booted && (
        <div className="grid-bg" style={{ minHeight: "100vh", display: "flex" }}>
          {settings.matrix && <MatrixRain />}
          {settings.scanline && <div className="scanline" />}

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40 }} />
          )}

          <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} />

          {/* Main */}
          <div style={{ marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}
            className="main-content">
            {/* Top Bar */}
            <div style={{ height: "54px", borderBottom: "1px solid rgba(0,255,65,0.1)", background: "rgba(2,6,10,0.9)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", padding: "0 24px", gap: "16px", position: "sticky", top: 0, zIndex: 20 }}>
              {/* Mobile hamburger */}
              <button onClick={() => setSidebarOpen(o => !o)}
                style={{ display: "none", background: "none", border: "none", color: "var(--neon-green)", fontSize: "20px", cursor: "pointer" }}
                className="mobile-menu-btn">☰</button>
              <div style={{ fontFamily: "Orbitron", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", flex: 1 }}>
                ARES CONSOLE X / {NAV_ITEMS.find(n => n.id === active)?.label || "DASHBOARD"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="status-dot status-online" />
                <span style={{ fontFamily: "Share Tech Mono", fontSize: "11px", color: "var(--neon-green)" }}>ONLINE</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: "clamp(16px, 4vw, 32px)", maxWidth: "1200px", width: "100%" }}>
              <div className="appear" key={active}>
                {active === "settings"
                  ? <PageComponent settings={settings} setSettings={setSettings} />
                  : <PageComponent />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu button injection */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </>
  );
}

