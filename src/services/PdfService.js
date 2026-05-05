import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const PDF_DIR    = path.join(__dirname, "../../uploads/pdfs");

class PdfService {
  constructor() {
    if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
  }

  _buildHtml(cv) {
    const tplId  = cv.templateId || "modern-tech";
    const styles = this._styles(tplId);
    const body   = this._body(cv, tplId);
    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
      <title>${cv.title}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:9pt;color:#1e293b;}${styles}</style>
    </head><body>${body}</body></html>`;
  }

  _styles(tplId) {
    const common = `.sec{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;padding-bottom:4px;}
      .entry{margin-bottom:10px;}.et{font-size:9.5pt;font-weight:700;}.es{font-size:8pt;font-weight:600;}.ed{font-size:7.5pt;color:#94a3b8;}.ep{font-size:8pt;color:#475569;line-height:1.6;margin-top:3px;}`;
    const map = {
      "modern-tech": `${common}body{display:flex;min-height:297mm;}.sb{width:72mm;background:#1e40af;padding:8mm;color:white;flex-shrink:0;}.main{flex:1;padding:8mm;}
        .av{width:20mm;height:20mm;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:14pt;font-weight:800;color:white;margin-bottom:4mm;}
        .nm{font-size:13pt;font-weight:800;}.jt{font-size:8pt;color:rgba(255,255,255,0.7);padding-bottom:4mm;border-bottom:1px solid rgba(255,255,255,0.2);margin-bottom:6mm;}
        .sb .sec{color:rgba(255,255,255,0.5);border-bottom:1px solid rgba(255,255,255,0.15);}.sil{margin-bottom:4px;}
        .sil label{font-size:6.5pt;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;}.sil span{font-size:7.5pt;color:rgba(255,255,255,0.85);}
        .skbg{height:2.5mm;background:rgba(255,255,255,0.15);border-radius:1mm;margin-top:1mm;overflow:hidden;}.skfill{height:100%;background:rgba(255,255,255,0.7);border-radius:1mm;}
        .main .sec{color:#1e40af;border-bottom:1.5px solid #1e40af;}.main .es{color:#1e40af;}
        .sum{background:#f8fafc;border-left:3px solid #1e40af;padding:3mm;margin-bottom:5mm;font-size:7.5pt;color:#475569;line-height:1.6;}`,
      "corporate": `${common}.hd{background:#1e293b;padding:8mm;color:white;display:flex;justify-content:space-between;align-items:flex-end;}
        .hn{font-size:18pt;font-weight:800;}.hj{font-size:10pt;color:#94a3b8;margin-top:2px;}.hc{text-align:right;font-size:7.5pt;color:#64748b;}
        .ab{height:3px;background:#b45309;}.ct{padding:7mm;}.sec{color:#1e293b;border-bottom:1.5px solid #b45309;}.es{color:#b45309;}
        .tl{display:flex;gap:4mm;}.td{width:22mm;flex-shrink:0;font-size:7pt;color:#94a3b8;}.tc{flex:1;}
        .sk{display:inline-block;background:#f1f5f9;color:#475569;font-size:7pt;padding:1mm 3mm;border-radius:3px;margin:1mm 1mm 0 0;}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:6mm;}`,
      "minimal": `${common}body{padding:10mm 14mm;}.hd{text-align:center;margin-bottom:6mm;padding-bottom:5mm;border-bottom:1px solid #e2e8f0;}
        .hn{font-size:20pt;font-weight:800;letter-spacing:1px;color:#0f172a;text-transform:uppercase;}.hj{font-size:9pt;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:3px;}
        .hc{font-size:7.5pt;color:#cbd5e1;margin-top:4px;}.sec{font-size:7pt;font-weight:700;color:#94a3b8;letter-spacing:2px;border-bottom:none;}
        .tl{display:flex;gap:6mm;}.td{width:18mm;flex-shrink:0;font-size:7pt;color:#94a3b8;}`,
      "creative": `${common}body{background:#0f172a;color:#e2e8f0;min-height:297mm;}.at{height:4px;background:#f59e0b;}
        .hd{padding:7mm 8mm 4mm;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between;align-items:flex-end;}
        .hn{font-size:18pt;font-weight:800;color:#f8fafc;}.hj{font-size:9pt;color:#f59e0b;margin-top:2px;}.hc{text-align:right;font-size:7pt;color:#475569;}
        .g2{display:grid;grid-template-columns:68mm 1fr;}.sb{padding:5mm 5mm 5mm 7mm;border-right:1px solid #1e293b;}.main{padding:5mm 7mm 5mm 5mm;}
        .sec{color:#f59e0b;border-bottom:none;}.skbg{height:2px;background:#1e293b;border-radius:1px;}.skfill{height:100%;background:#f59e0b;border-radius:1px;}
        .entry{border-left:2px solid rgba(245,158,11,0.2);padding-left:3mm;margin-bottom:4mm;}.et{color:#e2e8f0;}.es{color:#f59e0b;}.ep{color:#64748b;}`,
    };
    return map[tplId] || map["modern-tech"];
  }

  _body(cv, tplId) {
    const p  = cv.personalInfo || {};
    const initials = `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`;
    const exps = (cv.experiences || []).map(e => `<div class="entry"><div class="et">${e.position||""}</div><div class="es">${e.company||""}</div><div class="ed">${e.startDate||""} — ${e.current?"Présent":e.endDate||""}</div>${e.description?`<div class="ep">${e.description}</div>`:""}</div>`).join("");
    const edus = (cv.education || []).map(e => `<div class="entry"><div class="et">${e.degree||""}</div><div class="es">${e.school||""}</div><div class="ed">${e.year||""}${e.mention?` · ${e.mention}`:""}</div></div>`).join("");
    const sks  = (cv.skills || []).map(s => `<div style="margin-bottom:3mm"><div style="font-size:7.5pt;color:rgba(255,255,255,0.85);margin-bottom:1mm">${s.name}</div><div class="skbg"><div class="skfill" style="width:${s.level}%"></div></div></div>`).join("");
    const langs= (cv.languages || []).map(l => `<div style="display:flex;justify-content:space-between;font-size:7.5pt;margin-bottom:1.5mm"><span>${l.name}</span><span style="opacity:.6">${l.level}</span></div>`).join("");
    const contact = [p.email, p.phone, p.location].filter(Boolean);

    if (tplId === "modern-tech") return `
      <div class="sb">
        <div class="av">${initials}</div><div class="nm">${p.firstName||""} ${p.lastName||""}</div>
        <div class="jt">${p.jobTitle||""}</div>
        <div class="sec">Contact</div>
        ${p.email?`<div class="sil"><label>Email</label><span>${p.email}</span></div>`:""}
        ${p.phone?`<div class="sil"><label>Tél</label><span>${p.phone}</span></div>`:""}
        ${p.location?`<div class="sil"><label>Lieu</label><span>${p.location}</span></div>`:""}
        ${sks?`<br/><div class="sec">Compétences</div>${sks}`:""}
        ${langs?`<br/><div class="sec">Langues</div>${langs}`:""}
      </div>
      <div class="main">
        ${p.summary?`<div class="sum">${p.summary}</div>`:""}
        ${exps?`<div class="sec">Expérience</div>${exps}`:""}
        ${edus?`<div class="sec" style="margin-top:5mm">Formation</div>${edus}`:""}
      </div>`;

    if (tplId === "corporate") return `
      <div class="hd"><div><div class="hn">${p.firstName||""} ${p.lastName||""}</div><div class="hj">${p.jobTitle||""}</div></div>
      <div class="hc">${contact.map(v=>`<div>${v}</div>`).join("")}</div></div>
      <div class="ab"></div>
      <div class="ct">
        ${p.summary?`<p style="font-style:italic;color:#475569;font-size:8pt;margin-bottom:5mm">${p.summary}</p>`:""}
        ${exps?`<div class="sec">Expérience</div>${(cv.experiences||[]).map(e=>`<div class="tl entry"><div class="td">${e.startDate}<br/>— ${e.current?"Présent":e.endDate}</div><div class="tc"><div class="et">${e.position}</div><div class="es">${e.company}</div>${e.description?`<div class="ep">${e.description}</div>`:""}</div></div>`).join("")}`:""}
        <div class="g2" style="margin-top:5mm">
          ${edus?`<div><div class="sec">Formation</div>${edus}</div>`:""}
          ${cv.skills?.length?`<div><div class="sec">Compétences</div>${cv.skills.map(s=>`<span class="sk">${s.name}</span>`).join("")}</div>`:""}
        </div>
      </div>`;

    if (tplId === "minimal") return `
      <div class="hd"><div class="hn">${p.firstName?.toUpperCase()||""} ${p.lastName?.toUpperCase()||""}</div>
      <div class="hj">${p.jobTitle||""}</div><div class="hc">${contact.join("  ·  ")}</div></div>
      ${p.summary?`<p style="font-style:italic;text-align:center;color:#475569;margin-bottom:6mm;font-size:8pt">${p.summary}</p>`:""}
      ${exps?`<div class="sec" style="margin-bottom:3mm">Expérience</div>${(cv.experiences||[]).map(e=>`<div class="tl entry"><div class="td">${e.startDate}<br/>— ${e.current?"Présent":e.endDate}</div><div><div class="et">${e.position} <span style="font-weight:400;color:#94a3b8">@ ${e.company}</span></div>${e.description?`<div class="ep">${e.description}</div>`:""}</div></div>`).join("")}`:""}
      ${edus?`<div class="sec" style="margin:5mm 0 3mm">Formation</div>${edus}`:""}
      ${cv.skills?.length?`<div class="sec" style="margin:5mm 0 3mm">Compétences</div><div>${cv.skills.map(s=>s.name).join(" · ")}</div>`:""}`;

    // creative
    return `
      <div class="at"></div>
      <div class="hd"><div><div class="hn">${p.firstName||""} ${p.lastName||""}</div><div class="hj">${p.jobTitle||""}</div></div>
      <div class="hc">${contact.map(v=>`<div>${v}</div>`).join("")}</div></div>
      <div class="g2">
        <div class="sb">
          ${p.summary?`<p style="font-size:7.5pt;color:#64748b;margin-bottom:5mm">${p.summary}</p>`:""}
          ${sks?`<div class="sec">Compétences</div><br/>${(cv.skills||[]).map(s=>`<div style="margin-bottom:3mm"><div style="display:flex;justify-content:space-between;font-size:7.5pt;margin-bottom:1mm"><span style="color:#cbd5e1">${s.name}</span><span style="color:#475569">${s.level}%</span></div><div class="skbg"><div class="skfill" style="width:${s.level}%"></div></div></div>`).join("")}`:""}
          ${langs?`<br/><div class="sec">Langues</div><br/>${langs}`:""}
        </div>
        <div class="main">
          ${exps?`<div class="sec">Expérience</div><br/>${(cv.experiences||[]).map(e=>`<div class="entry"><div style="display:flex;justify-content:space-between"><div class="et">${e.position}</div><div class="ed">${e.startDate} — ${e.current?"Présent":e.endDate}</div></div><div class="es">${e.company}</div>${e.description?`<div class="ep">${e.description}</div>`:""}</div>`).join("")}`:""}
          ${edus?`<br/><div class="sec">Formation</div><br/>${edus}`:""}
        </div>
      </div>`;
  }

  async generateCVPdf(cv) {
    const html     = this._buildHtml(cv);
    const fileName = `cv_${cv._id}_${Date.now()}.pdf`;
    const filePath = path.join(PDF_DIR, fileName);

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      await page.pdf({ path: filePath, format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      logger.info(`PDF généré : ${fileName}`);
      return `/uploads/pdfs/${fileName}`;
    } finally {
      if (browser) await browser.close();
    }
  }
}

export default new PdfService();
