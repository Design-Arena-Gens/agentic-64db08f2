"use client";

import { useMemo, useRef, useState } from "react";

function toDataUrlFromSvg(svgEl, outWidth, outHeight) {
  return new Promise((resolve, reject) => {
    try {
      const clone = svgEl.cloneNode(true);
      clone.setAttribute("width", String(outWidth));
      clone.setAttribute("height", String(outHeight));
      const svgData = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = outWidth;
        canvas.height = outHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
          if (!b) return reject(new Error("PNG blob failed"));
          resolve({ pngBlob: b, dataUrl: canvas.toDataURL("image/png") });
        }, "image/png");
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    } catch (e) { reject(e); }
  });
}

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadSvg(svgEl, filename) {
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

function formatHex(hex) {
  if (!hex) return "#000000";
  if (hex.startsWith("#")) return hex;
  return `#${hex}`;
}

export default function Page() {
  const [channelName, setChannelName] = useState("??? ?? ????????");
  const [tagline, setTagline] = useState("????? ??? ?? ????????? ???????");
  const [primary, setPrimary] = useState("#ff3d9a");
  const [secondary, setSecondary] = useState("#7a5cff");
  const [bgDark, setBgDark] = useState("#0b0b10");
  const [showGuides, setShowGuides] = useState(true);

  const pfpRef = useRef(null);
  const bannerRef = useRef(null);
  const watermarkRef = useRef(null);

  const gradientId = useMemo(() => `g-${Math.random().toString(36).slice(2)}`, []);

  const gradStops = useMemo(() => {
    const p = formatHex(primary);
    const s = formatHex(secondary);
    return [p, s];
  }, [primary, secondary]);

  async function exportPng(type) {
    const map = {
      pfp: { ref: pfpRef, w: 800, h: 800, name: "profile.png" },
      banner: { ref: bannerRef, w: 2048, h: 1152, name: "banner.png" },
      wm: { ref: watermarkRef, w: 300, h: 300, name: "watermark.png" },
    };
    const conf = map[type];
    if (!conf?.ref?.current) return;
    const { pngBlob } = await toDataUrlFromSvg(conf.ref.current, conf.w, conf.h);
    downloadBlob(pngBlob, conf.name);
  }

  function exportSvg(type) {
    const map = {
      pfp: { ref: pfpRef, name: "profile.svg" },
      banner: { ref: bannerRef, name: "banner.svg" },
      wm: { ref: watermarkRef, name: "watermark.svg" },
    };
    const conf = map[type];
    if (!conf?.ref?.current) return;
    downloadSvg(conf.ref.current, conf.name);
  }

  return (
    <>
      <header className="header">
        <div className="brand">
          <div className="logo"><span>FA</span></div>
          <div>
            <div className="title">????? ??????? ????? ?????</div>
            <div className="subtitle">?????: ??? ?? ????????</div>
          </div>
        </div>
        <div className="linkbar">
          <a href="#previews">????????????</a>
        </div>
      </header>

      <div className="grid">
        <aside className="card">
          <h3>???????</h3>
          <div className="form">
            <div className="row">
              <label className="label">??? ?????</label>
              <input className="input" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
            </div>
            <div className="row">
              <label className="label">???????</label>
              <input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
              <div className="help">??????? ????? ???? ???</div>
            </div>
            <div className="row inline">
              <div>
                <label className="label">??? ????</label>
                <input className="color" type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </div>
              <div>
                <label className="label">??? ???</label>
                <input className="color" type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              </div>
            </div>
            <div className="row">
              <label className="label">???????? ????</label>
              <input className="color" type="color" value={bgDark} onChange={(e) => setBgDark(e.target.value)} />
            </div>
            <div className="row">
              <label className="label">
                <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} style={{ marginLeft: 8 }} />
                ????? ??????? ??? (????? ???)
              </label>
            </div>
          </div>
        </aside>

        <main id="previews" className="previews">
          <section className="preview-card">
            <div className="preview-head">
              <div>????? ??????? <span className="badge">1:1 ? 800?800</span></div>
              <div className="actions">
                <button className="button" onClick={() => exportSvg("pfp")}>????? SVG</button>
                <button className="button primary" onClick={() => exportPng("pfp")}>????? PNG</button>
              </div>
            </div>
            <div className="canvas-wrap">
              <svg ref={pfpRef} viewBox="0 0 800 800" width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradStops[0]} />
                    <stop offset="100%" stopColor={gradStops[1]} />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="18" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <rect width="800" height="800" rx="64" fill={bgDark} />
                <g transform="translate(400,400)">
                  <circle r="220" fill="url(#"+gradientId+")" filter="url(#glow)" opacity="0.9" />
                  <circle r="320" fill="none" stroke={gradStops[1]} strokeOpacity="0.25" strokeWidth="4" />
                  <circle r="140" fill="none" stroke={gradStops[0]} strokeOpacity="0.25" strokeWidth="4" />
                </g>
                <g transform="translate(400,470)">
                  <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontFamily="Vazirmatn, sans-serif" fontWeight="800" fontSize="56">
                    {channelName}
                  </text>
                </g>
                <g transform="translate(400,540)">
                  <text x="0" y="0" textAnchor="middle" fill="#cfd8e3" fontFamily="Vazirmatn, sans-serif" fontWeight="400" fontSize="28">
                    {tagline}
                  </text>
                </g>
              </svg>
            </div>
          </section>

          <section className="preview-card">
            <div className="preview-head">
              <div>??? ????? <span className="badge">2048?1152 ? ????? ??? 1235?338</span></div>
              <div className="actions">
                <button className="button" onClick={() => exportSvg("banner")}>????? SVG</button>
                <button className="button primary" onClick={() => exportPng("banner")}>????? PNG</button>
              </div>
            </div>
            <div className="canvas-wrap">
              <svg ref={bannerRef} viewBox="0 0 2048 1152" width="820" height="460" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={gradientId+"-b"} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradStops[0]} />
                    <stop offset="100%" stopColor={gradStops[1]} />
                  </linearGradient>
                </defs>
                <rect width="2048" height="1152" fill={bgDark} />

                <g opacity="0.20">
                  <circle cx="1600" cy="-80" r="520" fill={`url(#${gradientId+"-b"})`} />
                  <circle cx="280" cy="400" r="360" fill={`url(#${gradientId+"-b"})`} />
                </g>

                <g opacity="0.12">
                  <path d="M0 1020 C 300 960, 420 1120, 780 1070 S 1320 980, 2048 1080 L 2048 1152 L 0 1152 Z" fill={gradStops[1]} />
                </g>

                <g opacity="0.9">
                  <text x="1024" y="560" textAnchor="middle" fill="#fff" fontFamily="Vazirmatn, sans-serif" fontWeight="800" fontSize="96">{channelName}</text>
                  <text x="1024" y="640" textAnchor="middle" fill="#e6e9ef" fontFamily="Vazirmatn, sans-serif" fontWeight="400" fontSize="40">{tagline}</text>
                </g>

                {showGuides && (
                  <g>
                    <rect x="(2048-1235)/2" y="(1152-338)/2" width="1235" height="338" fill="none" stroke="#ffd166" strokeDasharray="10,10" strokeWidth="3" />
                    <text x="1024" y="(1152-338)/2 - 16" textAnchor="middle" fill="#ffd166" fontSize="24">????? ??? ????? ??? ??? ?????????</text>
                  </g>
                )}
              </svg>
            </div>
          </section>

          <section className="preview-card">
            <div className="preview-head">
              <div>???????? ????? <span className="badge">1:1 ? 300?300</span></div>
              <div className="actions">
                <button className="button" onClick={() => exportSvg("wm")}>????? SVG</button>
                <button className="button primary" onClick={() => exportPng("wm")}>????? PNG</button>
              </div>
            </div>
            <div className="canvas-wrap">
              <svg ref={watermarkRef} viewBox="0 0 300 300" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={gradientId+"-w"} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradStops[0]} />
                    <stop offset="100%" stopColor={gradStops[1]} />
                  </linearGradient>
                </defs>
                <rect width="300" height="300" rx="28" fill="#000" fillOpacity="0.0" />
                <g transform="translate(150,150)">
                  <circle r="90" fill={`url(#${gradientId+"-w"})`} opacity="0.95" />
                  <text x="0" y="10" textAnchor="middle" fill="#ffffff" fontFamily="Vazirmatn, sans-serif" fontWeight="900" fontSize="44">FA</text>
                </g>
              </svg>
            </div>
          </section>

          <div className="footer">????????? PNG ???? ????? ? ???? ????? ?? ????? ?????????.</div>
        </main>
      </div>
    </>
  );
}
