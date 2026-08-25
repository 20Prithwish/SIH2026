import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────
type Screen = "dashboard" | "crop" | "pest" | "irrigation" | "disaster" | "analytics" | "alerts";
type Scenario = "normal" | "heatwave" | "rainfall" | "drought";

// ── Tiny SVG icons ────────────────────────────────────────────────────────────
const Ic = {
  leaf:   (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  grid:   (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  bug:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 4-4"/><path d="M17.47 9c1.93-.2 3.53-1.9 3.53-4"/><path d="M18 13h4"/><path d="M21 21c0-2.1-1.7-3.9-4-4"/></svg>,
  drop:   (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  zap:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  chart:  (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  bell:   (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  gear:   (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.41 14.14M5.34 4.34a10 10 0 0 0 0 14.14"/></svg>,
  user:   (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  wifi:   (sz=14) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  cam:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  cpu:    (sz=14) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="6" height="6"/><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="9" y1="2" x2="9" y2="6"/><line x1="15" y1="2" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="22"/><line x1="15" y1="18" x2="15" y2="22"/><line x1="2" y1="9" x2="6" y2="9"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="22" y2="9"/><line x1="18" y1="15" x2="22" y2="15"/></svg>,
  sun:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  thermo: (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>,
  cloud:  (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>,
  alert:  (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  map:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  check:  (sz=14) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  menu:   (sz=20) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  up:     (sz=14) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  arrow:  (sz=14) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  pin:    (sz=12) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const riskColor = (v: number) => v >= 70 ? "#dc2626" : v >= 40 ? "#d97706" : "#16a34a";
const riskLabel = (v: number) => v >= 70 ? "HIGH" : v >= 40 ? "MEDIUM" : "LOW";
const riskBadge = (v: number) => v >= 70 ? "badge-red" : v >= 40 ? "badge-amber" : "badge-green";

// ── Sample chart data ─────────────────────────────────────────────────────────
const moistureWeek = [
  {d:"Mon",v:34},{d:"Tue",v:30},{d:"Wed",v:27},{d:"Thu",v:24},{d:"Fri",v:21},{d:"Sat",v:19},{d:"Sun",v:18},
];
const tempWeek = [
  {d:"Mon",v:31},{d:"Tue",v:33},{d:"Wed",v:34},{d:"Thu",v:36},{d:"Fri",v:37},{d:"Sat",v:38},{d:"Sun",v:38},
];
const pestWeek = [
  {d:"Mon",v:3},{d:"Tue",v:5},{d:"Wed",v:7},{d:"Thu",v:10},{d:"Fri",v:13},{d:"Sat",v:15},{d:"Sun",v:17},
];
const cropHealthWeek = [
  {d:"Mon",v:89},{d:"Tue",v:87},{d:"Wed",v:84},{d:"Thu",v:81},{d:"Fri",v:78},{d:"Sat",v:76},{d:"Sun",v:74},
];
const rainfallMonths = [
  {m:"Mar",v:10},{m:"Apr",v:36},{m:"May",v:62},{m:"Jun",v:130},{m:"Jul",v:178},{m:"Aug",v:0},
];

// ── CircularScore ─────────────────────────────────────────────────────────────
function RingScore({ val, size=130, stroke=11, color="#16a34a", label="" }: {
  val:number; size?:number; stroke?:number; color?:string; label?:string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (val / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display:"block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:"stroke-dasharray .7s cubic-bezier(.4,0,.2,1)" }}/>
      <text x={size/2} y={size/2 - 6} textAnchor="middle" dominantBaseline="central"
        fontSize={size/4} fontWeight="800" fill="#0f1f12" fontFamily="Inter">{val}%</text>
      {label && <text x={size/2} y={size/2 + size/6} textAnchor="middle" fontSize={size/11}
        fill="#6b7280" fontFamily="Inter" fontWeight="500">{label}</text>}
    </svg>
  );
}

// ── MiniBar ───────────────────────────────────────────────────────────────────
function MiniBar({ label, val, color }: { label:string; val:number; color:string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:12, color:"#6b7280", width:120, flexShrink:0 }}>{label}</span>
      <div className="risk-bar-bg" style={{ flex:1, height:6 }}>
        <div className="risk-bar" style={{ width:`${val}%`, background:color }}/>
      </div>
      <span style={{ fontSize:12, fontWeight:700, color, width:34, textAlign:"right", flexShrink:0 }}>{val}%</span>
    </div>
  );
}

// ── EdgePipeline banner ───────────────────────────────────────────────────────
function EdgePipeline() {
  const steps = [
    { icon:"📷", label:"Camera", sub:"Live capture" },
    { icon:"📡", label:"Sensors", sub:"IoT readings" },
    { icon:"🌦️", label:"Weather", sub:"Forecast data" },
    { label:"→", sub:"" },
    { icon:"🔲", label:"Edge AI", sub:"On-device inference", highlight:true },
    { label:"→", sub:"" },
    { icon:"⚠️", label:"Risk Detection", sub:"Real-time scoring" },
    { label:"→", sub:"" },
    { icon:"💬", label:"Farmer Advice", sub:"Simple actions" },
  ];
  return (
    <div style={{
      background:"linear-gradient(135deg,#052e16 0%,#14532d 100%)",
      borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center",
      gap:6, flexWrap:"wrap", marginBottom:20,
    }}>
      {steps.map((s,i) => s.label === "→"
        ? <span key={i} style={{ color:"#4ade80", fontSize:18, fontWeight:300 }}>→</span>
        : (
          <div key={i} style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            background: s.highlight ? "rgba(74,222,128,.18)" : "rgba(255,255,255,.06)",
            border: s.highlight ? "1px solid rgba(74,222,128,.4)" : "1px solid rgba(255,255,255,.08)",
            borderRadius:9, padding:"7px 12px", minWidth:74,
          }}>
            <span style={{ fontSize:18 }}>{s.icon}</span>
            <span style={{ color: s.highlight ? "#4ade80" : "#fff", fontSize:10, fontWeight:700, marginTop:2, letterSpacing:".04em" }}>{s.label}</span>
            {s.sub && <span style={{ color:"#6ee7b7", fontSize:9, marginTop:1, opacity:.8 }}>{s.sub}</span>}
          </div>
        )
      )}
      <div style={{ marginLeft:"auto", display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, color:"#4ade80", fontSize:11, fontWeight:700 }}>
          <span style={{ width:6, height:6, background:"#4ade80", borderRadius:"50%", animation:"blink 2s infinite", display:"inline-block" }}/>
          EDGE AI: ACTIVE
        </div>
        <span style={{ color:"#6ee7b7", fontSize:10 }}>Last Sync: 2 min ago</span>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }: { active:Screen; onNav:(s:Screen)=>void }) {
  const nav: {id:Screen; label:string; icon:(n?:number)=>JSX.Element}[] = [
    { id:"crop",       label:"Crop Health",      icon:Ic.leaf },
    { id:"pest",       label:"Pest Detection",   icon:Ic.bug  },
    { id:"irrigation", label:"Smart Irrigation", icon:Ic.drop },
    { id:"disaster",   label:"Disaster Monitor", icon:Ic.zap  },
    { id:"analytics",  label:"Farm Analytics",   icon:Ic.chart},
    { id:"alerts",     label:"Alerts",           icon:Ic.bell },
  ];
  return (
    <aside style={{
      width:214, background:"linear-gradient(175deg,#0f3d1f 0%,#052e16 100%)",
      display:"flex", flexDirection:"column", padding:"18px 10px", flexShrink:0, zIndex:10,
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:9, padding:"2px 6px", marginBottom:24 }}>
        <div style={{
          width:36, height:36, background:"linear-gradient(135deg,#16a34a,#4ade80)",
          borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", flexShrink:0, boxShadow:"0 2px 8px rgba(22,163,74,.4)",
        }}>
          {Ic.leaf(18)}
        </div>
        <div>
          <div style={{ color:"#fff", fontWeight:800, fontSize:15, lineHeight:1.1, letterSpacing:"-.02em" }}>AgriEdge</div>
          <div style={{ color:"#4ade80", fontSize:9, fontWeight:700, letterSpacing:".14em" }}>AI PLATFORM</div>
        </div>
      </div>

      {/* Edge status pill */}
      <div style={{
        background:"rgba(74,222,128,.1)", border:"1px solid rgba(74,222,128,.22)",
        borderRadius:9, padding:"9px 11px", marginBottom:18,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
          <span style={{ width:7, height:7, background:"#4ade80", borderRadius:"50%", animation:"blink 2s infinite", display:"inline-block" }}/>
          <span style={{ color:"#4ade80", fontSize:10.5, fontWeight:700, letterSpacing:".04em" }}>EDGE AI: ACTIVE</span>
        </div>
        <div style={{ color:"#86efac", fontSize:10 }}>Local inference enabled</div>
        <div style={{ color:"#6ee7b7", fontSize:10, marginTop:1 }}>Internet: Limited</div>
        <div style={{ color:"#86efac", fontSize:9, marginTop:3, opacity:.7 }}>Last Sync: 2 min ago</div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
        {nav.map(n => (
          <button key={n.id} className={`nav-item${active===n.id?" active":""}`} onClick={()=>onNav(n.id)}>
            {n.icon()}
            {n.label}
            {n.id==="alerts" && <span style={{
              marginLeft:"auto", background:"#dc2626", color:"#fff",
              borderRadius:99, fontSize:9.5, fontWeight:700, padding:"1px 6px",
            }}>3</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:12, display:"flex", flexDirection:"column", gap:2 }}>
        <button className="nav-item">{Ic.gear()} Settings</button>
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px" }}>
          <span style={{ color:"#4ade80" }}>{Ic.wifi()}</span>
          <span style={{ fontSize:10, color:"#6ee7b7" }}>Connected · Limited data</span>
        </div>
      </div>
    </aside>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({ onNav, onMenuOpen }: { onNav:(s:Screen)=>void; onMenuOpen:()=>void }) {
  return (
    <div style={{
      height:54, background:"#fff", borderBottom:"1px solid #e5e7eb",
      display:"flex", alignItems:"center", padding:"0 22px", gap:14, flexShrink:0,
    }}>
      {/* Hamburger menu trigger */}
      <button onClick={onMenuOpen} style={{
        background:"none", border:"1.5px solid #e5e7eb", borderRadius:8,
        width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", color:"#374151", flexShrink:0, transition:"background .15s",
      }}
        onMouseEnter={e=>e.currentTarget.style.background="#f3f4f6"}
        onMouseLeave={e=>e.currentTarget.style.background="none"}
        aria-label="Open navigation menu"
      >
        {Ic.menu()}
      </button>

      <div style={{
        background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8,
        padding:"5px 12px", fontSize:12.5, fontWeight:600, color:"#166634",
        display:"flex", alignItems:"center", gap:5,
      }}>
        🌾 Farm 01 — West Bengal
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#6b7280" }}>
        {Ic.pin()} Murshidabad, West Bengal
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
        {/* Edge badge */}
        <div style={{
          display:"flex", alignItems:"center", gap:5,
          background:"#f0fdf4", border:"1px solid #bbf7d0",
          borderRadius:99, padding:"4px 10px", fontSize:10.5, fontWeight:700, color:"#166534",
        }}>
          {Ic.cpu()} EDGE AI ACTIVE
          <span style={{ width:6, height:6, background:"#16a34a", borderRadius:"50%", animation:"blink 2s infinite", display:"inline-block" }}/>
        </div>
        <div style={{ fontSize:11, color:"#16a34a", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ width:7, height:7, background:"#16a34a", borderRadius:"50%", display:"inline-block" }}/>
          Edge Device: Online
        </div>
        <button onClick={()=>onNav("alerts")} style={{
          background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8,
          width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", position:"relative",
        }}>
          {Ic.bell()}
          <span style={{ position:"absolute", top:7, right:7, width:7, height:7, background:"#dc2626", borderRadius:"50%", display:"block" }}/>
        </button>
        <div style={{
          width:32, height:32, background:"linear-gradient(135deg,#16a34a,#4ade80)",
          borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", fontWeight:800, fontSize:12.5,
        }}>R</div>
      </div>
    </div>
  );
}

// ── SCREEN 1: Dashboard ───────────────────────────────────────────────────────
function Dashboard({ onNav }: { onNav:(s:Screen)=>void }) {
  const [activeField, setActiveField] = useState<string|null>(null);

  const fields = [
    { id:"A", crop:"Tomato", ha:"1.2 ha", status:"Healthy",       color:"#16a34a", bg:"#dcfce7", border:"#bbf7d0", health:91, moisture:"34%", risk:"Low",    emoji:"🟢" },
    { id:"B", crop:"Tomato", ha:"0.8 ha", status:"Moderate Risk",  color:"#d97706", bg:"#fef3c7", border:"#fde68a", health:74, moisture:"21%", risk:"Medium", emoji:"🟡" },
    { id:"C", crop:"Potato", ha:"1.0 ha", status:"High Risk",      color:"#dc2626", bg:"#fee2e2", border:"#fecaca", health:61, moisture:"18%", risk:"High",   emoji:"🔴" },
    { id:"D", crop:"Paddy",  ha:"1.5 ha", status:"Healthy",        color:"#16a34a", bg:"#dcfce7", border:"#bbf7d0", health:88, moisture:"38%", risk:"Low",    emoji:"🟢" },
  ];

  return (
    <div style={{ padding:"24px 24px 40px", maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em", marginBottom:4 }}>
            Good Morning, Rajan 🌱
          </h1>
          <p style={{ color:"#6b7280", fontSize:13.5 }}>
            Here's the current health of your farm — <strong>Sunday, 22 August 2026</strong>
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, color:"#6b7280" }}>Today's Weather Forecast</div>
          <div style={{ fontSize:20, marginTop:2 }}>☀️ 34–38°C &nbsp;💧 0 mm</div>
        </div>
      </div>

      {/* Edge AI Pipeline */}
      <EdgePipeline/>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {([
          { label:"Crop Health",    val:"82/100", sub:"Good",          icon:Ic.leaf,   accent:"#16a34a", bg:"#dcfce7", bar:82 },
          { label:"Soil Moisture",  val:"21%",    sub:"Below Optimal", icon:Ic.drop,   accent:"#d97706", bg:"#fef3c7", bar:21 },
          { label:"Temperature",    val:"34°C",   sub:"Elevated",      icon:Ic.sun,    accent:"#f59e0b", bg:"#fef9c3", bar:68 },
          { label:"Overall Risk",   val:"MEDIUM", sub:"3 active risks",icon:Ic.alert,  accent:"#dc2626", bg:"#fee2e2", bar:55 },
        ] as const).map((c,i)=>(
          <div key={i} className="card" style={{ padding:"18px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:36, height:36, background:c.bg, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:c.accent }}>
                {c.icon()}
              </div>
              <span style={{ fontSize:12, color:"#6b7280", fontWeight:500 }}>{c.label}</span>
            </div>
            <div style={{ fontSize:24, fontWeight:900, color:"#0f1f12", letterSpacing:"-.02em", marginBottom:4 }}>{c.val}</div>
            <div style={{ fontSize:11, color:c.accent, fontWeight:700, marginBottom:10 }}>{c.sub}</div>
            <div className="risk-bar-bg" style={{ height:4 }}>
              <div className="risk-bar" style={{ width:`${c.bar}%`, background:c.accent }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Main row */}
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:18, marginBottom:18 }}>
        {/* Farm Health */}
        <div className="card" style={{ padding:"22px 20px", display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:18, alignSelf:"flex-start" }}>
            Farm Health Overview
          </div>
          <RingScore val={82} size={148} stroke={13} label="Overall Health"/>
          <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:11, marginTop:20 }}>
            <MiniBar label="Crop Health"       val={82} color="#16a34a"/>
            <MiniBar label="Soil Condition"    val={62} color="#d97706"/>
            <MiniBar label="Water Availability"val={52} color="#3b82f6"/>
            <MiniBar label="Weather Risk"      val={35} color="#10b981"/>
          </div>
        </div>

        {/* Priority Alerts */}
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:12 }}>Priority Alerts</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {/* Alert 1 - red */}
            <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderLeft:"4px solid #dc2626", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span className="badge badge-red">HIGH</span>
                <span style={{ fontWeight:700, fontSize:14 }}>High Heat Stress Risk</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>Today, 9:00 AM</span>
              </div>
              <p style={{ fontSize:12.5, color:"#4b5563", marginBottom:10, lineHeight:1.5 }}>
                Temperature expected to reach 38°C today — above safe threshold for tomatoes. Irrigate early morning.
              </p>
              <button className="btn btn-red" onClick={()=>onNav("disaster")}>
                {Ic.alert()} View Details
              </button>
            </div>
            {/* Alert 2 - amber */}
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderLeft:"4px solid #d97706", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span className="badge badge-amber">MEDIUM</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Low Soil Moisture</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>Today, 8:30 AM</span>
              </div>
              <p style={{ fontSize:12.5, color:"#4b5563", marginBottom:10, lineHeight:1.5 }}>
                Field B moisture has dropped to 21% — below the 30% recommended level for tomatoes.
              </p>
              <button className="btn btn-green" onClick={()=>onNav("irrigation")}>
                {Ic.drop()} Irrigation Advice
              </button>
            </div>
            {/* Alert 3 - amber */}
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderLeft:"4px solid #d97706", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span className="badge badge-amber">MEDIUM</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Possible Early Blight</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>Yesterday</span>
              </div>
              <p style={{ fontSize:12.5, color:"#4b5563", marginBottom:10, lineHeight:1.5 }}>
                AI detected early blight symptoms in Field B — Possible Disease, 94% confidence.
              </p>
              <button className="btn btn-green" onClick={()=>onNav("crop")}>
                {Ic.leaf()} Inspect Crop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions + Farm map */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:18 }}>
        {/* Quick actions */}
        <div className="card" style={{ padding:"18px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:14 }}>Quick Actions</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {([
              { label:"Analyze Crop Image",  emoji:"🔬", screen:"crop"      as Screen, bg:"#f0fdf4", color:"#166534" },
              { label:"Check Irrigation",    emoji:"💧", screen:"irrigation"as Screen, bg:"#eff6ff", color:"#1e40af" },
              { label:"Disaster Risk",       emoji:"⛈️",  screen:"disaster"  as Screen, bg:"#fff5f5", color:"#991b1b" },
              { label:"Farm Analytics",      emoji:"📊", screen:"analytics" as Screen, bg:"#f5f3ff", color:"#5b21b6" },
            ]).map(a=>(
              <button key={a.label} onClick={()=>onNav(a.screen)} style={{
                background:a.bg, border:"1px solid transparent", borderRadius:10,
                padding:"14px 12px", cursor:"pointer", textAlign:"left",
                transition:"transform .12s, box-shadow .12s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none"}}
              >
                <div style={{ fontSize:22, marginBottom:6 }}>{a.emoji}</div>
                <div style={{ fontSize:12.5, fontWeight:700, color:a.color, lineHeight:1.3 }}>{a.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Farm map */}
        <div className="card" style={{ padding:"18px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
            {Ic.map()} Farm Map — West Bengal
          </div>
          {/* SVG aerial view */}
          <div style={{ position:"relative", background:"linear-gradient(135deg,#166534 0%,#1a7a3c 100%)", borderRadius:10, overflow:"hidden", marginBottom:12, height:140 }}>
            {/* Field shapes */}
            <svg width="100%" height="140" viewBox="0 0 400 140" preserveAspectRatio="none">
              <rect x="10" y="10" width="170" height="55" rx="4" fill="#22c55e" fillOpacity=".7" onClick={()=>setActiveField(activeField==="A"?null:"A")} style={{cursor:"pointer"}}/>
              <rect x="10" y="75" width="80" height="55" rx="4" fill="#f59e0b" fillOpacity=".8" onClick={()=>setActiveField(activeField==="B"?null:"B")} style={{cursor:"pointer"}}/>
              <rect x="100" y="75" width="80" height="55" rx="4" fill="#ef4444" fillOpacity=".8" onClick={()=>setActiveField(activeField==="C"?null:"C")} style={{cursor:"pointer"}}/>
              <rect x="190" y="10" width="200" height="120" rx="4" fill="#4ade80" fillOpacity=".6" onClick={()=>setActiveField(activeField==="D"?null:"D")} style={{cursor:"pointer"}}/>
              <text x="95" y="40" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter">Field A</text>
              <text x="50" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter">Field B</text>
              <text x="140" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter">Field C</text>
              <text x="290" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter">Field D</text>
            </svg>
            <div style={{ position:"absolute", bottom:6, right:8, fontSize:9, color:"rgba(255,255,255,.6)", fontFamily:"JetBrains Mono,monospace" }}>
              Murshidabad District, WB
            </div>
          </div>
          {/* Field legend / detail */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {fields.map(f=>(
              <div key={f.id} style={{
                background: activeField===f.id ? f.bg : "#f9fafb",
                border:`1.5px solid ${activeField===f.id ? f.border : "#f3f4f6"}`,
                borderRadius:8, padding:"9px 11px", cursor:"pointer", transition:"all .15s",
              }} onClick={()=>setActiveField(activeField===f.id?null:f.id)}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                  <span style={{ fontSize:10 }}>{f.emoji}</span>
                  <span style={{ fontWeight:700, fontSize:12, color:"#0f1f12" }}>Field {f.id}</span>
                  <span style={{ marginLeft:"auto", fontSize:9, color:"#6b7280" }}>{f.ha}</span>
                </div>
                <div style={{ fontSize:10.5, color:f.color, fontWeight:600 }}>{f.status}</div>
                {activeField===f.id && (
                  <div style={{ marginTop:6, paddingTop:6, borderTop:`1px solid ${f.border}`, animation:"slideIn .2s ease" }}>
                    <div style={{ fontSize:10, color:"#374151" }}>Crop: <b>{f.crop}</b></div>
                    <div style={{ fontSize:10, color:"#374151" }}>Health: <b>{f.health}/100</b></div>
                    <div style={{ fontSize:10, color:"#374151" }}>Moisture: <b>{f.moisture}</b></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 2: Crop Health ─────────────────────────────────────────────────────
function CropHealth() {
  const [state, setState] = useState<"idle"|"loading"|"done">("idle");

  return (
    <div style={{ padding:"24px 24px 40px", maxWidth:1100 }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:24, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em" }}>Crop Health Monitoring</h1>
        <p style={{ color:"#6b7280", fontSize:13.5, marginTop:4 }}>Use AI-powered image analysis to detect visible crop diseases and stress.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        {/* Upload */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:14 }}>Upload Crop Image</div>
          {state==="idle" && (
            <div style={{
              border:"2px dashed #bbf7d0", borderRadius:12,
              padding:"36px 20px", background:"#f0fdf4",
              display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              cursor:"pointer", transition:"border-color .2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#16a34a"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#bbf7d0"}
              onClick={()=>{setState("loading");setTimeout(()=>setState("done"),2200)}}
            >
              <div style={{ fontSize:40, marginBottom:4 }}>📸</div>
              <div style={{ fontWeight:700, fontSize:14, color:"#166534" }}>Upload a leaf or crop image</div>
              <div style={{ fontSize:12, color:"#6b7280" }}>Drag &amp; drop or click to browse · JPG, PNG</div>
              <div style={{ marginTop:6, background:"#dcfce7", border:"1px solid #86efac", borderRadius:8, padding:"8px 16px", fontSize:12, color:"#166534", fontWeight:600 }}>
                📷 Or capture using device camera
              </div>
              <button className="btn btn-green" style={{ marginTop:8 }}>
                {Ic.cam()} Analyze Image
              </button>
            </div>
          )}
          {state==="loading" && (
            <div style={{ textAlign:"center", padding:"48px 20px" }}>
              <div style={{ width:52, height:52, border:"4px solid #bbf7d0", borderTopColor:"#16a34a", borderRadius:"50%", animation:"spin .9s linear infinite", margin:"0 auto 16px" }}/>
              <div style={{ fontWeight:700, color:"#166534", fontSize:14 }}>Running AI analysis on edge device…</div>
              <div style={{ fontSize:11.5, color:"#6b7280", marginTop:5 }}>No internet required for inference</div>
              <div style={{ marginTop:14, display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
                {["Preprocessing image","Loading model","Running inference"].map((s,i)=>(
                  <span key={i} style={{ background:"#f0fdf4", color:"#166534", border:"1px solid #bbf7d0", borderRadius:99, padding:"3px 10px", fontSize:10.5 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {state==="done" && (
            <div className="anim-in">
              <div style={{ background:"#1a1a2e", borderRadius:10, padding:12, marginBottom:12, position:"relative", overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(135deg,#14532d,#4ade80)", borderRadius:8, height:160, display:"flex", alignItems:"center", justifyContent:"center", fontSize:72 }}>
                  🍅
                </div>
                {/* Blight overlay */}
                <div style={{ position:"absolute", top:22, left:22, width:60, height:48, border:"2.5px solid #ef4444", borderRadius:6 }}>
                  <span style={{ position:"absolute", top:-14, left:-1, background:"#ef4444", color:"#fff", fontSize:9, padding:"1px 5px", borderRadius:3, fontWeight:700, fontFamily:"JetBrains Mono,monospace" }}>BLIGHT</span>
                </div>
                <div style={{ position:"absolute", top:48, right:30, width:42, height:34, border:"2px solid #f59e0b", borderRadius:5 }}>
                  <span style={{ position:"absolute", top:-12, left:-1, background:"#f59e0b", color:"#fff", fontSize:9, padding:"1px 5px", borderRadius:3, fontWeight:700, fontFamily:"JetBrains Mono,monospace" }}>LESION</span>
                </div>
                <div style={{ position:"absolute", bottom:20, right:10, background:"rgba(0,0,0,.7)", color:"#fff", fontSize:10, padding:"3px 8px", borderRadius:5, fontFamily:"JetBrains Mono,monospace" }}>
                  Edge AI · 94% confidence
                </div>
              </div>
              <button className="btn btn-outline" style={{ width:"100%" }} onClick={()=>setState("idle")}>Upload New Image</button>
            </div>
          )}
        </div>

        {/* AI Result */}
        {state==="done" ? (
          <div className="card anim-in" style={{ padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ fontSize:22 }}>🔬</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12" }}>AI Diagnosis</div>
                <div style={{ fontSize:11, color:"#6b7280" }}>Field B · 22 Aug 2026 · 9:22 AM</div>
              </div>
              <span className="badge badge-red" style={{ marginLeft:"auto" }}>HIGH RISK</span>
            </div>

            <div style={{ fontSize:22, fontWeight:900, color:"#0f1f12", letterSpacing:"-.02em", marginBottom:3 }}>Tomato Early Blight</div>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>Possible Disease — 94% confidence</div>

            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                <span style={{ color:"#6b7280" }}>Confidence Score</span>
                <span style={{ fontWeight:700, color:"#dc2626" }}>94%</span>
              </div>
              <div className="risk-bar-bg" style={{ height:8 }}>
                <div className="risk-bar" style={{ width:"94%", background:"#dc2626" }}/>
              </div>
            </div>

            <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:10, padding:"13px 14px", marginBottom:12 }}>
              <div style={{ fontSize:12.5, fontWeight:700, color:"#991b1b", marginBottom:8 }}>What happened? — Detected Symptoms</div>
              {["Brown target-ring lesions on leaves","Yellowing (chlorosis) around affected areas","Irregular dark spots on lower leaves"].map(s=>(
                <div key={s} style={{ display:"flex", gap:6, fontSize:12, color:"#374151", marginBottom:4, lineHeight:1.4 }}>
                  <span style={{ color:"#dc2626", flexShrink:0, marginTop:1 }}>•</span>{s}
                </div>
              ))}
            </div>

            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"13px 14px", marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#92400e", marginBottom:5 }}>How serious? — Risk Level: HIGH</div>
              <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.6 }}>
                Early-stage infection detected. Without intervention, this can spread to 40–60% of Field B within 5 days.
              </div>
            </div>

            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"13px 14px" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#166534", marginBottom:5 }}>What should you do?</div>
              <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.6 }}>
                Inspect all plants in Field B. Remove severely affected leaves. Consult your local agricultural officer or Krishi Vigyan Kendra for targeted treatment guidance.
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding:"20px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:16 }}>Crop Health Score — Field B</div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
              <RingScore val={74} size={130} color="#d97706" label="Health Score"/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <MiniBar label="Leaf Condition"      val={74} color="#16a34a"/>
              <MiniBar label="Disease Probability" val={72} color="#dc2626"/>
              <MiniBar label="Growth Condition"    val={81} color="#16a34a"/>
              <MiniBar label="Environmental Stress"val={62} color="#d97706"/>
            </div>
          </div>
        )}
      </div>

      {/* Recent detections */}
      <div className="card" style={{ padding:"20px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:16 }}>Recent AI Detections</div>
        <table>
          <thead>
            <tr>
              {["Date","Field","Crop","Detection","Confidence","Risk"].map(h=><th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              { date:"22 Aug", field:"Field B", crop:"Tomato", det:"Early Blight",  conf:"94%", risk:"HIGH" },
              { date:"20 Aug", field:"Field C", crop:"Potato", det:"Late Blight",   conf:"78%", risk:"HIGH" },
              { date:"18 Aug", field:"Field A", crop:"Tomato", det:"Healthy",       conf:"97%", risk:"LOW"  },
              { date:"15 Aug", field:"Field D", crop:"Paddy",  det:"Healthy",       conf:"93%", risk:"LOW"  },
              { date:"10 Aug", field:"Field B", crop:"Tomato", det:"Nutrient Deficiency", conf:"81%", risk:"MEDIUM"},
            ].map((r,i)=>(
              <tr key={i}>
                <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12 }}>{r.date}</td>
                <td><strong>{r.field}</strong></td>
                <td>{r.crop}</td>
                <td style={{ fontWeight:500 }}>{r.det}</td>
                <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12 }}>{r.conf}</td>
                <td><span className={`badge ${riskBadge(r.risk==="HIGH"?80:r.risk==="MEDIUM"?50:20)}`}>{r.risk}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SCREEN 3: Pest Detection ──────────────────────────────────────────────────
function PestDetection() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding:"24px 24px 40px", maxWidth:1100 }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:24, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em" }}>Pest Detection</h1>
        <p style={{ color:"#6b7280", fontSize:13.5, marginTop:4 }}>Detect and monitor insect activity using computer vision.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        {/* Upload / analyzed image */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:14 }}>Field Image Analysis</div>

          {!done ? (
            <div>
              <div style={{ border:"2px dashed #bbf7d0", borderRadius:12, padding:"32px 20px", background:"#f0fdf4", textAlign:"center", marginBottom:12 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🌿</div>
                <div style={{ fontWeight:600, fontSize:13, color:"#166534" }}>Upload or capture a field image</div>
                <div style={{ fontSize:11.5, color:"#6b7280", marginTop:3 }}>AI will detect pests and count them automatically</div>
              </div>
              <button className="btn btn-green" style={{ width:"100%", padding:"10px" }} onClick={()=>{
                setLoading(true); setTimeout(()=>{setLoading(false);setDone(true);},2000);
              }}>
                {loading ? "🔄 Analyzing…" : <>{Ic.cam()} Analyze Field Image</>}
              </button>
            </div>
          ) : (
            <div className="anim-in">
              {/* Simulated image with bounding boxes */}
              <div style={{ position:"relative", height:210, background:"linear-gradient(135deg,#1a3a0a 0%,#2d5a1b 40%,#4a8c2e 100%)", borderRadius:10, overflow:"hidden", marginBottom:12 }}>
                {/* Leaf elements */}
                <div style={{ position:"absolute", fontSize:60, top:20, left:30, opacity:.8 }}>🌿</div>
                <div style={{ position:"absolute", fontSize:48, top:60, right:20, opacity:.7 }}>🍃</div>
                <div style={{ position:"absolute", fontSize:36, bottom:20, left:60, opacity:.6 }}>🌱</div>
                {/* Bounding boxes */}
                {[
                  { top:15, left:55, w:62, h:50, conf:"94%" },
                  { top:88, left:130, w:54, h:44, conf:"89%" },
                  { top:130, left:42, w:70, h:54, conf:"91%" },
                ].map((b,i)=>(
                  <div key={i} style={{ position:"absolute", top:b.top, left:b.left, width:b.w, height:b.h, border:"2.5px solid #ef4444", borderRadius:5 }}>
                    <div style={{ position:"absolute", top:-16, left:-1, background:"#ef4444", color:"#fff", fontSize:9, padding:"2px 5px", borderRadius:3, fontWeight:700, whiteSpace:"nowrap", fontFamily:"JetBrains Mono,monospace" }}>
                      Aphid {b.conf}
                    </div>
                  </div>
                ))}
                {/* Count badge */}
                <div style={{ position:"absolute", top:8, right:8, background:"rgba(239,68,68,.9)", color:"#fff", borderRadius:99, padding:"3px 9px", fontSize:11, fontWeight:700, fontFamily:"JetBrains Mono,monospace" }}>
                  17 detected
                </div>
                <div style={{ position:"absolute", bottom:6, right:8, background:"rgba(0,0,0,.65)", color:"#fff", fontSize:9, padding:"2px 6px", borderRadius:4, fontFamily:"JetBrains Mono,monospace" }}>
                  Field C · 22 Aug 14:33
                </div>
              </div>
              <button className="btn btn-outline" style={{ width:"100%" }} onClick={()=>setDone(false)}>Analyze New Image</button>
            </div>
          )}
        </div>

        {/* AI Result */}
        <div className="card" style={{ padding:"20px" }}>
          {done ? (
            <div className="anim-in">
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <div style={{ fontSize:24 }}>🐛</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12" }}>Pest Detected</div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>Field C · Tomato crop</div>
                </div>
                <span className="badge badge-red" style={{ marginLeft:"auto" }}>HIGH</span>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:16 }}>
                {[
                  { k:"Pest Species",      v:"Aphid",  mono:false },
                  { k:"Objects Detected",  v:"17",     mono:true  },
                  { k:"Confidence",        v:"91%",    mono:true  },
                  { k:"Infestation Level", v:"HIGH",   mono:false },
                ].map(d=>(
                  <div key={d.k} style={{ background:"#f9fafb", borderRadius:8, padding:"10px 12px", border:"1px solid #f3f4f6" }}>
                    <div style={{ fontSize:10.5, color:"#6b7280", fontWeight:500, marginBottom:3 }}>{d.k}</div>
                    <div style={{ fontSize:18, fontWeight:900, color:d.v==="HIGH"?"#dc2626":"#0f1f12", fontFamily:d.mono?"JetBrains Mono,monospace":"inherit" }}>{d.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                  <span style={{ color:"#6b7280" }}>Infestation Level</span>
                  <span style={{ fontWeight:700, color:"#dc2626" }}>HIGH · 91%</span>
                </div>
                <div className="risk-bar-bg" style={{ height:9 }}>
                  <div className="risk-bar" style={{ width:"91%", background:"#dc2626" }}/>
                </div>
              </div>

              <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#991b1b", marginBottom:5 }}>What happened?</div>
                <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.6 }}>Aphid infestation detected in Field C — 17 insects identified across 3 locations in the image.</div>
              </div>
              <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#92400e", marginBottom:5 }}>What should you do?</div>
                <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.6 }}>Inspect surrounding plants in Field C. Consider targeted biological controls. Avoid blanket pesticide application to protect beneficial insects.</div>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"#9ca3af", textAlign:"center", padding:30 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
              <div style={{ fontWeight:700, fontSize:14, color:"#6b7280" }}>Awaiting Image Analysis</div>
              <div style={{ fontSize:12, marginTop:5, lineHeight:1.5 }}>Upload a field image to detect and count pests automatically using computer vision</div>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:16 }}>Pest Activity — Last 7 Days (Field C)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pestWeek}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={.15}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="d" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e5e7eb", fontSize:12 }} formatter={(v)=>[`${v} insects`,"Count"]}/>
              <Area type="monotone" dataKey="v" stroke="#dc2626" fill="url(#pg)" strokeWidth={2.5} dot={{ fill:"#dc2626", r:3.5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:10 }}>Advisory — Field C Pest Alert</div>
          <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#991b1b", marginBottom:5 }}>⚠ Pest activity is increasing</div>
            <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.6 }}>
              Aphid count grew from 3 to 17 over 7 days — a 467% increase. This trend suggests rapid colony growth and requires immediate attention.
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {[
              "Inspect Field C plants row by row",
              "Use targeted biological controls (ladybird beetles)",
              "Avoid blanket pesticide — protect beneficial insects",
              "Re-scan in 3 days to monitor response",
            ].map((s,i)=>(
              <div key={i} style={{ display:"flex", gap:7, fontSize:12, color:"#374151", alignItems:"flex-start" }}>
                <span style={{ color:"#16a34a", marginTop:1, flexShrink:0 }}>{Ic.check()}</span>{s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 4: Smart Irrigation ────────────────────────────────────────────────
function SmartIrrigation() {
  const [soil, setSoil]   = useState(18);
  const [temp, setTemp]   = useState(35);
  const [hum, setHum]     = useState(44);
  const [rain, setRain]   = useState(0);
  const [touched, setTouch] = useState(false);

  const stressed = soil < 28 || (temp > 33 && hum < 50 && rain < 5);
  const priority = soil < 20 && temp > 34 ? "HIGH" : soil < 25 ? "MEDIUM" : "LOW";
  const reasons = [
    { text:`Soil moisture is ${soil}% — optimal range is 28–40%`, active: soil < 28 },
    { text:`High temperature (${temp}°C) increases evaporation`, active: temp > 33 },
    { text:`Low humidity (${hum}%) accelerates soil water loss`, active: hum < 50 },
    { text:`No significant rainfall expected`, active: rain < 5 },
  ].filter(r=>r.active);

  return (
    <div style={{ padding:"24px 24px 40px", maxWidth:1100 }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:24, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em" }}>Smart Irrigation</h1>
        <p style={{ color:"#6b7280", fontSize:13.5, marginTop:4 }}>Optimize irrigation using soil and environmental conditions.</p>
      </div>

      {/* Sensor cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
        {([
          { label:"Soil Moisture", val:`${soil}%`, icon:Ic.drop,   color:"#3b82f6", bg:"#eff6ff", warn:soil<28  },
          { label:"Temperature",   val:`${temp}°C`,icon:Ic.thermo, color:"#d97706", bg:"#fffbeb", warn:temp>33  },
          { label:"Humidity",      val:`${hum}%`,  icon:Ic.cloud,  color:"#8b5cf6", bg:"#f5f3ff", warn:hum<50   },
          { label:"Rainfall",      val:`${rain}mm`,icon:Ic.drop,   color:"#0ea5e9", bg:"#f0f9ff", warn:false    },
        ] as const).map(s=>(
          <div key={s.label} className="card" style={{ padding:"16px", borderTop:`3px solid ${s.warn?"#d97706":"#e5e7eb"}` }}>
            <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:8 }}>
              <span style={{ color:s.color }}>{s.icon()}</span>
              <span style={{ fontSize:11.5, color:"#6b7280", fontWeight:500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:900, color:"#0f1f12", fontFamily:"JetBrains Mono,monospace" }}>{s.val}</div>
            {s.warn && <div style={{ fontSize:10, color:"#d97706", fontWeight:700, marginTop:3 }}>⚠ Below optimal</div>}
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:18, marginBottom:18 }}>
        {/* Recommendation */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{
            background: stressed ? "linear-gradient(135deg,#052e16,#166534)" : "linear-gradient(135deg,#1e3a8a,#2563eb)",
            borderRadius:10, padding:"16px", marginBottom:16, textAlign:"center",
          }}>
            <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.7)", letterSpacing:".1em", marginBottom:4 }}>
              AI RECOMMENDATION
            </div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", letterSpacing:"-.01em" }}>
              {stressed ? "IRRIGATE NOW" : "NO IRRIGATION NEEDED"}
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.75)", marginTop:3 }}>
              Priority: <strong>{priority}</strong>
            </div>
          </div>

          {stressed && (
            <div style={{ fontSize:13, color:"#374151", marginBottom:14, lineHeight:1.6 }}>
              <strong>Irrigate within the next 4–6 hours</strong> to prevent water stress and yield loss in Field B and Field C.
            </div>
          )}

          <div style={{ fontSize:13, fontWeight:700, color:"#0f1f12", marginBottom:10 }}>Why?</div>
          {reasons.length > 0 ? reasons.map((r,i)=>(
            <div key={i} style={{ display:"flex", gap:7, fontSize:12, color:"#374151", marginBottom:7, alignItems:"flex-start" }}>
              <span style={{ color:"#16a34a", flexShrink:0, marginTop:1 }}>{Ic.check()}</span>{r.text}
            </div>
          )) : (
            <div style={{ fontSize:12, color:"#6b7280" }}>All conditions are within optimal range.</div>
          )}

          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <button className="btn btn-green" style={{ flex:1 }}>Schedule Irrigation</button>
            <button className="btn btn-outline">Notify</button>
          </div>
        </div>

        {/* Chart */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:16 }}>Soil Moisture — Last 7 Days</div>
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={moistureWeek}>
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={.18}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="d" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} domain={[0,50]}/>
              <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e5e7eb", fontSize:12 }} formatter={(v)=>[`${v}%`,"Moisture"]}/>
              {/* Optimal threshold line */}
              <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#mg)" strokeWidth={2.5} dot={{ fill:"#3b82f6", r:3 }}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize:11, color:"#6b7280", marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:8, height:8, background:"#fbbf24", borderRadius:"50%", display:"inline-block" }}/>
            Optimal threshold: 28% — moisture has been declining for 7 days
          </div>
        </div>
      </div>

      {/* Simulator */}
      <div className="card" style={{ padding:"20px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:4 }}>Irrigation Condition Simulator</div>
        <div style={{ fontSize:12, color:"#6b7280", marginBottom:18 }}>Adjust values to see how the recommendation changes — powered by edge AI model.</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:16 }}>
          {([
            { label:"Soil Moisture", val:soil, set:setSoil, min:5, max:60, unit:"%" },
            { label:"Temperature",   val:temp, set:setTemp, min:20, max:45, unit:"°C" },
            { label:"Humidity",      val:hum,  set:setHum,  min:10, max:90, unit:"%" },
            { label:"Expected Rainfall", val:rain, set:setRain, min:0, max:50, unit:"mm" },
          ] as const).map(s=>(
            <div key={s.label}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:8 }}>
                <span style={{ color:"#374151", fontWeight:500 }}>{s.label}</span>
                <span style={{ fontWeight:800, color:"#0f1f12", fontFamily:"JetBrains Mono,monospace" }}>{s.val}{s.unit}</span>
              </div>
              <input type="range" min={s.min} max={s.max} value={s.val}
                onChange={e=>{ (s.set as (v:number)=>void)(Number(e.target.value)); setTouch(true); }}/>
            </div>
          ))}
        </div>
        {touched && (
          <div className="anim-in" style={{
            background: stressed ? "#fff5f5" : "#f0fdf4",
            border:`1px solid ${stressed?"#fecaca":"#bbf7d0"}`,
            borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontSize:22 }}>{stressed?"⚠️":"✅"}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:13.5, color:stressed?"#991b1b":"#166534" }}>
                {stressed ? "Water Stress Detected" : "Conditions Look Good"}
              </div>
              <div style={{ fontSize:12, color:stressed?"#78350f":"#166534", marginTop:2 }}>
                {stressed ? "Irrigation recommended based on current sensor conditions." : "No irrigation required at this time."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SCREEN 5: Disaster Monitor ────────────────────────────────────────────────
function DisasterMonitor() {
  const [scenario, setScenario] = useState<Scenario>("normal");

  const data: Record<Scenario, { temp:number; rain:number; soil:number; drought:number; flood:number; heat:number; disease:number; desc:string }> = {
    normal:   { temp:34, rain:2,  soil:28, drought:45, flood:18, heat:55, disease:35, desc:"Conditions are stable. Monitor crops during peak afternoon hours." },
    heatwave: { temp:42, rain:0,  soil:14, drought:71, flood:8,  heat:92, disease:58, desc:"Extreme heat detected. Irrigate early morning and evening. Protect plants with shade cloth if available." },
    rainfall: { temp:28, rain:74, soil:76, drought:12, flood:82, heat:22, disease:68, desc:"Heavy rainfall risk. Ensure proper drainage. Monitor for waterlogging and fungal diseases." },
    drought:  { temp:38, rain:0,  soil:11, drought:89, flood:4,  heat:76, disease:44, desc:"Severe drought conditions. Implement strict water conservation. Prioritize critical crop stages." },
  };
  const d = data[scenario];

  const risks = [
    { label:"Drought Risk",           val:d.drought, emoji:"🌵" },
    { label:"Flood Risk",             val:d.flood,   emoji:"🌊" },
    { label:"Heat Stress",            val:d.heat,    emoji:"🌡️" },
    { label:"Disease Outbreak Risk",  val:d.disease, emoji:"🦠" },
  ];

  const envChart = [
    { d:"Mon", temp:d.temp-5, rain:d.rain*.3, soil:d.soil+8 },
    { d:"Tue", temp:d.temp-3, rain:d.rain*.6, soil:d.soil+5 },
    { d:"Wed", temp:d.temp-1, rain:d.rain*.8, soil:d.soil+3 },
    { d:"Thu", temp:d.temp,   rain:d.rain,    soil:d.soil   },
    { d:"Fri", temp:d.temp+1, rain:d.rain*.5, soil:d.soil-2 },
    { d:"Sat", temp:d.temp+1, rain:d.rain*.2, soil:d.soil-4 },
    { d:"Sun", temp:d.temp,   rain:0,         soil:d.soil-6 },
  ];

  return (
    <div style={{ padding:"24px 24px 40px", maxWidth:1100 }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:24, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em" }}>Environmental & Disaster Risk Monitor</h1>
        <p style={{ color:"#6b7280", fontSize:13.5, marginTop:4 }}>Identify drought, flood and heat risks before they affect your crop.</p>
      </div>

      {/* Risk cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
        {risks.map(r=>(
          <div key={r.label} className="card" style={{ padding:"20px", textAlign:"center", borderTop:`4px solid ${riskColor(r.val)}` }}>
            <div style={{ fontSize:32, marginBottom:8 }}>{r.emoji}</div>
            <div style={{ fontSize:34, fontWeight:900, color:riskColor(r.val), fontFamily:"JetBrains Mono,monospace", transition:"color .4s", letterSpacing:"-.02em" }}>{r.val}%</div>
            <div style={{ fontSize:11, fontWeight:800, color:riskColor(r.val), letterSpacing:".07em", marginBottom:5 }}>{riskLabel(r.val)}</div>
            <div style={{ fontSize:11.5, color:"#6b7280", marginBottom:10 }}>{r.label}</div>
            <div className="risk-bar-bg" style={{ height:7 }}>
              <div className="risk-bar" style={{ width:`${r.val}%`, background:riskColor(r.val) }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + explanation */}
      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:18, marginBottom:18 }}>
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:16 }}>Environmental Risk Timeline</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={envChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="d" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e5e7eb", fontSize:12 }}/>
              <Legend wrapperStyle={{ fontSize:11 }}/>
              <Line type="monotone" dataKey="temp"  stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Temperature (°C)"/>
              <Line type="monotone" dataKey="rain"  stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Rainfall (mm)"/>
              <Line type="monotone" dataKey="soil"  stroke="#16a34a" strokeWidth={2.5} dot={false} name="Soil Moisture (%)"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:14 }}>Risk Explanation</div>
          <div style={{ background: d.heat >= 70 ? "#fff5f5" : d.flood >= 70 ? "#eff6ff" : "#fffbeb", border:`1px solid ${d.heat>=70?"#fecaca":d.flood>=70?"#bfdbfe":"#fde68a"}`, borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:13, color:d.heat>=70?"#991b1b":d.flood>=70?"#1e40af":"#92400e", marginBottom:10 }}>
              {d.heat>=70 ? "🌡️ Heat Stress Risk — HIGH" : d.flood>=70 ? "🌊 Flood Risk — HIGH" : d.drought>=70 ? "🌵 Drought Risk — HIGH" : "⚠️ Elevated Risk"}
            </div>
            {[
              { k:"Temperature",    v:`${d.temp}°C` },
              { k:"Rainfall",       v:`${d.rain} mm` },
              { k:"Soil Moisture",  v:`${d.soil}%` },
              { k:"Forecast",       v:`${d.temp-2}–${d.temp+1}°C` },
            ].map(f=>(
              <div key={f.k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#4b5563", marginBottom:5, paddingBottom:5, borderBottom:"1px solid rgba(0,0,0,.05)" }}>
                <span>{f.k}</span>
                <span style={{ fontWeight:700, fontFamily:"JetBrains Mono,monospace" }}>{f.v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.7, fontStyle:"italic" }}>{d.desc}</div>
        </div>
      </div>

      {/* Scenario simulator */}
      <div className="card" style={{ padding:"20px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#0f1f12", marginBottom:5 }}>Simulate Disaster Scenario</div>
        <div style={{ fontSize:12, color:"#6b7280", marginBottom:16 }}>Select a scenario to update risk indicators and sensor readings in real time.</div>
        <div style={{ display:"flex", gap:12 }}>
          {([
            { id:"normal",   label:"Normal Conditions", emoji:"☀️",  desc:"Baseline" },
            { id:"heatwave", label:"Heat Wave",          emoji:"🔥",  desc:"Temp: 42°C" },
            { id:"rainfall", label:"Heavy Rainfall",     emoji:"🌧️",  desc:"Rain: 74mm" },
            { id:"drought",  label:"Drought",            emoji:"🌵",  desc:"No rain" },
          ] as {id:Scenario; label:string; emoji:string; desc:string}[]).map(s=>(
            <button key={s.id} onClick={()=>setScenario(s.id)} style={{
              flex:1, padding:"14px 10px", borderRadius:11, border:"2px solid",
              borderColor: scenario===s.id ? "#16a34a" : "#e5e7eb",
              background: scenario===s.id ? "#f0fdf4" : "#fff",
              cursor:"pointer", transition:"all .2s", fontFamily:"Inter,sans-serif",
            }}>
              <div style={{ fontSize:26, marginBottom:5 }}>{s.emoji}</div>
              <div style={{ fontSize:13, fontWeight:700, color:scenario===s.id?"#166534":"#374151", marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:10.5, color:"#9ca3af" }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 6: Farm Analytics ──────────────────────────────────────────────────
function FarmAnalytics() {
  const [range, setRange] = useState("7d");

  const fields = [
    { name:"Field A", crop:"Tomato", health:91, moisture:"34%", disease:"LOW",    yieldRisk:"LOW"    },
    { name:"Field B", crop:"Tomato", health:74, moisture:"21%", disease:"HIGH",   yieldRisk:"MEDIUM" },
    { name:"Field C", crop:"Potato", health:61, moisture:"18%", disease:"HIGH",   yieldRisk:"HIGH"   },
    { name:"Field D", crop:"Paddy",  health:88, moisture:"38%", disease:"LOW",    yieldRisk:"LOW"    },
  ];

  const MiniChart = ({ data, color, id }: { data:{d:string;v:number}[]; color:string; id:string }) => (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={.18}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f8f8f8" vertical={false}/>
        <XAxis dataKey="d" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{ borderRadius:8, fontSize:11, border:"1px solid #e5e7eb" }}/>
        <Area type="monotone" dataKey="v" stroke={color} fill={`url(#${id})`} strokeWidth={2}/>
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div style={{ padding:"24px 24px 40px", maxWidth:1100 }}>
      <div style={{ marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em" }}>Farm Analytics</h1>
          <p style={{ color:"#6b7280", fontSize:13.5, marginTop:4 }}>Understand long-term crop and environmental trends.</p>
        </div>
        <div style={{ display:"flex", gap:6, background:"#f3f4f6", borderRadius:9, padding:3 }}>
          {["7d","30d","90d"].map(r=>(
            <button key={r} onClick={()=>setRange(r)} style={{
              padding:"6px 16px", borderRadius:7, border:"none",
              background:range===r?"#fff":"transparent",
              color:range===r?"#166534":"#6b7280",
              fontWeight:700, fontSize:12.5, cursor:"pointer",
              boxShadow:range===r?"0 1px 3px rgba(0,0,0,.08)":"none",
              fontFamily:"Inter,sans-serif", transition:"all .15s",
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Charts grid 2x2 + 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {([
          { title:"Soil Moisture Trend",  data:moistureWeek,  color:"#3b82f6", id:"g1" },
          { title:"Temperature Trend",    data:tempWeek,      color:"#f59e0b", id:"g2" },
          { title:"Crop Health Trend",    data:cropHealthWeek,color:"#16a34a", id:"g4" },
          { title:"Pest Activity Trend",  data:pestWeek,      color:"#dc2626", id:"g5" },
        ]).map(c=>(
          <div key={c.id} className="card" style={{ padding:"18px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#0f1f12", marginBottom:14 }}>{c.title}</div>
            <MiniChart data={c.data} color={c.color} id={c.id}/>
          </div>
        ))}
      </div>

      {/* Rainfall bar chart */}
      <div className="card" style={{ padding:"18px", marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#0f1f12", marginBottom:14 }}>Rainfall Trend — Monthly (mm)</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={rainfallMonths}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
            <XAxis dataKey="m" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ borderRadius:8, fontSize:12, border:"1px solid #e5e7eb" }} formatter={(v)=>[`${v} mm`,"Rainfall"]}/>
            <Bar dataKey="v" fill="#0ea5e9" radius={[5,5,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yield forecast + field comparison */}
      <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:16 }}>
        <div className="card" style={{ padding:"20px", background:"linear-gradient(160deg,#f0fdf4,#dcfce7)", border:"1px solid #bbf7d0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#166534", marginBottom:12 }}>Yield Risk Forecast</div>
          <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>Expected Yield — Tomato (Farm 01)</div>
          <div style={{ fontSize:36, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em", marginBottom:4 }}>4.2</div>
          <div style={{ fontSize:13, color:"#6b7280", marginBottom:14 }}>tons / hectare</div>
          <span className="badge badge-amber">MEDIUM YIELD RISK</span>
          <div style={{ fontSize:11.5, color:"#4b5563", marginTop:14, lineHeight:1.7 }}>
            Based on current health (74/100), soil moisture deficit, and early blight detection. Yield may reduce 10–15% without intervention.
          </div>
        </div>

        <div className="card" style={{ padding:"18px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#0f1f12", marginBottom:14 }}>Field Comparison</div>
          <table>
            <thead>
              <tr>
                {["Field","Crop","Health Score","Moisture","Disease Risk","Yield Risk"].map(h=><th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {fields.map((f,i)=>(
                <tr key={i}>
                  <td style={{ fontWeight:700 }}>{f.name}</td>
                  <td>{f.crop}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className="risk-bar-bg" style={{ width:44, height:6 }}>
                        <div className="risk-bar" style={{ width:`${f.health}%`, background:f.health>80?"#16a34a":f.health>65?"#d97706":"#dc2626" }}/>
                      </div>
                      <span style={{ fontWeight:700, fontSize:12, fontFamily:"JetBrains Mono,monospace" }}>{f.health}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12 }}>{f.moisture}</td>
                  <td><span className={`badge ${riskBadge(f.disease==="HIGH"?80:f.disease==="MEDIUM"?50:20)}`}>{f.disease}</span></td>
                  <td><span className={`badge ${riskBadge(f.yieldRisk==="HIGH"?80:f.yieldRisk==="MEDIUM"?50:20)}`}>{f.yieldRisk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 7: Alerts ──────────────────────────────────────────────────────────
function Alerts({ onNav }: { onNav:(s:Screen)=>void }) {
  const [filter, setFilter] = useState("All");
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number|null>(null);

  const all = [
    { id:1, type:"Heat",      sev:"HIGH",   title:"Heat Stress Warning",       field:"Field B & C", time:"Today 9:14 AM",   desc:"Temperature expected to exceed 38°C — above safe threshold for tomatoes.", rec:"Monitor crops 12–4 PM. Apply mulch. Irrigate early morning.", screen:"disaster" as Screen, actionLabel:"View Risk" },
    { id:2, type:"Irrigation",sev:"HIGH",   title:"Irrigation Required",        field:"Field B & C", time:"Today 8:30 AM",   desc:"Soil moisture has dropped to 21% in Field B and 18% in Field C — both below optimal.", rec:"Irrigate both fields within 4–6 hours. Start with Field C.", screen:"irrigation" as Screen, actionLabel:"Irrigation Guide" },
    { id:3, type:"Disease",   sev:"HIGH",   title:"Early Blight Detected",      field:"Field B",     time:"Yesterday 4:22 PM",desc:"AI detected tomato early blight symptoms — Possible Disease, 94% confidence.", rec:"Inspect all Field B plants. Remove affected leaves. Consult local officer.", screen:"crop" as Screen, actionLabel:"Inspect Crop" },
    { id:4, type:"Pest",      sev:"MEDIUM", title:"Aphid Infestation Growing",  field:"Field C",     time:"Today 7:05 AM",   desc:"Aphid count at 17 insects — growing rapidly over 7 days.", rec:"Use targeted biological controls. Inspect surrounding plants.", screen:"pest" as Screen, actionLabel:"View Pests" },
    { id:5, type:"Drought",   sev:"MEDIUM", title:"Drought Risk Elevated",      field:"All Fields",  time:"Yesterday 6:00 AM",desc:"No rainfall expected for 5+ days. Drought risk now at 71%.", rec:"Conservative irrigation scheduling. Prioritize critical growth stages.", screen:"disaster" as Screen, actionLabel:"Risk Monitor" },
    { id:6, type:"Flood",     sev:"LOW",    title:"Low Flood Risk",             field:"All Fields",  time:"2 days ago",       desc:"Current flood risk is low at 18%. No immediate action required.", rec:"Maintain field drainage channels. Monitor weather updates.", screen:"disaster" as Screen, actionLabel:"View Risk" },
    { id:7, type:"Disease",   sev:"LOW",    title:"Field A Confirmed Healthy",  field:"Field A",     time:"3 days ago",       desc:"AI scan confirmed Field A tomato crop is healthy — 97% confidence.", rec:"Continue current management. Schedule next scan in 7 days.", screen:"crop" as Screen, actionLabel:"View Report" },
  ];

  const filters = ["All","Disease","Pest","Irrigation","Heat","Flood","Drought"];
  const filtered = all.filter(a => filter === "All" || a.type === filter);
  const active = filtered.filter(a => !resolved.has(a.id));
  const done = filtered.filter(a => resolved.has(a.id));

  const borderC = (sev:string) => sev==="HIGH"?"#dc2626":sev==="MEDIUM"?"#d97706":"#16a34a";
  const bgC     = (sev:string) => sev==="HIGH"?"#fff5f5":sev==="MEDIUM"?"#fffbeb":"#f0fdf4";
  const badgeC  = (sev:string) => sev==="HIGH"?"badge-red":sev==="MEDIUM"?"badge-amber":"badge-green";

  const AlertCard = ({ a, faded=false }: { a:typeof all[0]; faded?:boolean }) => (
    <div style={{
      borderLeft:`4px solid ${faded?"#d1d5db":borderC(a.sev)}`,
      background: faded?"#f9fafb":bgC(a.sev),
      border:`1px solid ${faded?"#e5e7eb":borderC(a.sev)+"40"}`,
      borderRadius:11, padding:"15px 18px",
      opacity: faded?.65:1, transition:"opacity .3s",
      animation:"slideIn .2s ease",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
            <span className={`badge ${faded?"badge-green":badgeC(a.sev)}`}>{faded?"RESOLVED":a.sev}</span>
            <span style={{ fontWeight:700, fontSize:14, color:faded?"#6b7280":"#0f1f12" }}>{a.title}</span>
          </div>
          <div style={{ fontSize:11.5, color:"#9ca3af", marginBottom:6, display:"flex", gap:12 }}>
            <span>{Ic.pin()} {a.field}</span>
            <span>🕐 {a.time}</span>
          </div>
          <div style={{ fontSize:12.5, color:faded?"#9ca3af":"#4b5563", lineHeight:1.55 }}>{a.desc}</div>
          {expanded===a.id && !faded && (
            <div className="anim-in" style={{ marginTop:10, background:"rgba(255,255,255,.8)", borderRadius:8, padding:"10px 12px", backdropFilter:"blur(4px)" }}>
              <div style={{ fontSize:11.5, fontWeight:700, color:"#374151", marginBottom:4 }}>Recommendation</div>
              <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.65 }}>{a.rec}</div>
            </div>
          )}
        </div>
        {!faded && (
          <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
            <button className="btn btn-green" style={{ padding:"7px 12px" }} onClick={()=>onNav(a.screen)}>{a.actionLabel}</button>
            <button className="btn btn-outline" style={{ padding:"6px 12px" }} onClick={()=>setExpanded(expanded===a.id?null:a.id)}>
              {expanded===a.id?"Less":"Details"}
            </button>
            <button style={{ background:"none", border:"none", fontSize:11, color:"#16a34a", cursor:"pointer", fontWeight:600, fontFamily:"Inter", padding:"3px 0" }}
              onClick={()=>setResolved(prev=>new Set([...prev, a.id]))}>
              ✓ Mark Resolved
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding:"24px 24px 40px", maxWidth:900 }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:24, fontWeight:900, color:"#0f1f12", letterSpacing:"-.03em" }}>Alerts & Recommendations</h1>
        <p style={{ color:"#6b7280", fontSize:13.5, marginTop:4 }}>
          {active.length} active alert{active.length!==1?"s":""} require your attention.
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display:"flex", gap:7, marginBottom:20, flexWrap:"wrap" }}>
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:"6px 14px", borderRadius:99, border:"1.5px solid",
            borderColor:filter===f?"#16a34a":"#e5e7eb",
            background:filter===f?"#16a34a":"#fff",
            color:filter===f?"#fff":"#6b7280",
            fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"Inter",
            transition:"all .15s",
          }}>{f}</button>
        ))}
      </div>

      {active.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {active.map(a=><AlertCard key={a.id} a={a}/>)}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#9ca3af", letterSpacing:".06em", marginBottom:10 }}>RESOLVED</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {done.map(a=><AlertCard key={a.id} a={a} faded/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Edge Device Panel ─────────────────────────────────────────────────────────
function EdgePanel({ onClose }: { onClose:()=>void }) {
  const [timer, setTimer] = useState(12);
  useEffect(()=>{
    const id = setInterval(()=>setTimer(t=>t<=1?12:t-1),1000);
    return ()=>clearInterval(id);
  },[]);

  return (
    <div style={{
      position:"fixed", bottom:78, right:18, width:290,
      background:"#fff", borderRadius:14, boxShadow:"0 8px 36px rgba(0,0,0,.16)",
      border:"1px solid #e5e7eb", zIndex:200, overflow:"hidden", animation:"slideIn .2s ease",
    }}>
      <div style={{ background:"linear-gradient(135deg,#052e16,#14532d)", padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, color:"#fff", fontWeight:700, fontSize:13 }}>
            {Ic.cpu()} Edge Device Status
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#86efac", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:8 }}>
          <span style={{ width:7, height:7, background:"#4ade80", borderRadius:"50%", animation:"blink 2s infinite", display:"inline-block" }}/>
          <span style={{ color:"#4ade80", fontSize:10.5, fontWeight:700 }}>AgriEdge Node 01 — ONLINE</span>
        </div>
      </div>
      <div style={{ padding:"12px 16px" }}>
        {[
          { label:"AI Inference",      val:"Active",      ok:true  },
          { label:"Camera",            val:"Connected",   ok:true  },
          { label:"Soil Sensor",       val:"Connected",   ok:true  },
          { label:"Weather Sensor",    val:"Connected",   ok:true  },
          { label:"Battery",           val:"87%",         ok:true  },
          { label:"Last Inference",    val:`${timer}s ago`,ok:true },
          { label:"Internet",          val:"Limited",     ok:false },
          { label:"Offline AI",        val:"Available",   ok:true  },
        ].map(r=>(
          <div key={r.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"7px 0", borderBottom:"1px solid #f3f4f6" }}>
            <span style={{ color:"#6b7280" }}>{r.label}</span>
            <span style={{ fontWeight:600, color:r.ok?"#16a34a":"#d97706", fontFamily:"JetBrains Mono,monospace", fontSize:11.5 }}>{r.val}</span>
          </div>
        ))}
      </div>
      <div style={{ background:"#f0fdf4", padding:"10px 14px 14px" }}>
        <div style={{ fontSize:10.5, color:"#166534", lineHeight:1.65 }}>
          💡 Crop images and sensor data are processed locally. Internet is only needed for optional sync and external weather updates.
        </div>
      </div>
    </div>
  );
}

// ── Slide-in Nav Menu ─────────────────────────────────────────────────────────
function NavMenu({ active, onNav, onClose }: { active:Screen; onNav:(s:Screen)=>void; onClose:()=>void }) {
  const nav: {id:Screen; label:string; icon:(n?:number)=>JSX.Element}[] = [
    { id:"dashboard",  label:"Dashboard",       icon:Ic.grid },
    { id:"crop",       label:"Crop Health",      icon:Ic.leaf },
    { id:"pest",       label:"Pest Detection",   icon:Ic.bug  },
    { id:"irrigation", label:"Smart Irrigation", icon:Ic.drop },
    { id:"disaster",   label:"Disaster Monitor", icon:Ic.zap  },
    { id:"analytics",  label:"Farm Analytics",   icon:Ic.chart},
    { id:"alerts",     label:"Alerts",           icon:Ic.bell },
  ];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,.35)",
        zIndex:300, animation:"fadeIn .2s ease",
      }}/>
      {/* Drawer */}
      <div style={{
        position:"fixed", top:0, left:214, bottom:0, width:240,
        background:"#fff", zIndex:301, boxShadow:"4px 0 24px rgba(0,0,0,.14)",
        display:"flex", flexDirection:"column",
        animation:"menuSlideIn .22s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#374151", letterSpacing:".02em" }}>Navigation</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:20, lineHeight:1, padding:"2px 4px" }}>×</button>
        </div>
        <nav style={{ padding:"10px 10px", display:"flex", flexDirection:"column", gap:2 }}>
          {nav.map(n => (
            <button key={n.id} onClick={()=>{ onNav(n.id); onClose(); }} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 12px", borderRadius:9, border:"none",
              background: active===n.id ? "#f0fdf4" : "transparent",
              color: active===n.id ? "#166534" : "#374151",
              fontWeight: active===n.id ? 700 : 500,
              fontSize:13.5, cursor:"pointer", textAlign:"left", width:"100%",
              fontFamily:"Inter,sans-serif", transition:"background .12s",
            }}
              onMouseEnter={e=>{ if(active!==n.id) e.currentTarget.style.background="#f9fafb"; }}
              onMouseLeave={e=>{ if(active!==n.id) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{ color: active===n.id ? "#16a34a" : "#6b7280" }}>{n.icon()}</span>
              {n.label}
              {n.id==="alerts" && <span style={{ marginLeft:"auto", background:"#dc2626", color:"#fff", borderRadius:99, fontSize:9.5, fontWeight:700, padding:"1px 6px" }}>3</span>}
              {n.id==="dashboard" && <span style={{ marginLeft:"auto", fontSize:10, color:"#9ca3af" }}>Overview</span>}
            </button>
          ))}
        </nav>
      </div>
      <style>{`
        @keyframes menuSlideIn {
          from { opacity:0; transform:translateX(-16px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("crop");
  const [showEdge, setShowEdge] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const screens: Record<Screen, JSX.Element> = {
    dashboard:  <Dashboard  onNav={setScreen}/>,
    crop:       <CropHealth/>,
    pest:       <PestDetection/>,
    irrigation: <SmartIrrigation/>,
    disaster:   <DisasterMonitor/>,
    analytics:  <FarmAnalytics/>,
    alerts:     <Alerts onNav={setScreen}/>,
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar active={screen} onNav={setScreen}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <TopBar onNav={setScreen} onMenuOpen={()=>setShowMenu(true)}/>
        <main style={{ flex:1, overflowY:"auto", background:"#eef7f0" }}>
          {screens[screen]}
        </main>
      </div>

      {/* Slide-in nav menu (hamburger) */}
      {showMenu && (
        <NavMenu
          active={screen}
          onNav={setScreen}
          onClose={()=>setShowMenu(false)}
        />
      )}

      {/* Floating Edge AI button */}
      <button onClick={()=>setShowEdge(v=>!v)} style={{
        position:"fixed", bottom:18, right:18,
        background:"linear-gradient(135deg,#052e16,#166534)",
        color:"#fff", border:"none", borderRadius:99,
        padding:"9px 16px", fontSize:11, fontWeight:800,
        display:"flex", alignItems:"center", gap:6, cursor:"pointer",
        boxShadow:"0 4px 18px rgba(21,128,61,.4)", zIndex:100,
        fontFamily:"Inter,sans-serif", letterSpacing:".04em",
      }}>
        {Ic.cpu()} EDGE AI ACTIVE
        <span style={{ width:7, height:7, background:"#4ade80", borderRadius:"50%", animation:"pulse 2s infinite", display:"inline-block" }}/>
      </button>

      {showEdge && <EdgePanel onClose={()=>setShowEdge(false)}/>}
    </div>
  );
}
