/* =====================================================
   الفكرة الاحترافية — السكربت
   ===================================================== */

/* ---------------------------------------------------
   1) الإعدادات: غيّر الروابط ورقم الواتساب من هنا فقط
   --------------------------------------------------- */
const CONFIG = {
  shopName: "الفكرة الاحترافية",
  // رقم الواتساب بالصيغة الدولية بدون + وبدون أصفار
  whatsapp: "963983784007",
  facebook: "https://www.facebook.com/share/17pakLz4Ye/",
  instagram: "https://www.instagram.com/alfkraalahtrafia?exln=Zjc5OWs3dmlkY2k2",
  location: "دمشق، سوريا",
  // اسم الشركة في نص الحقوق (استبدل ¥ باسم شركتك)
  company: "¥",
  // أقصى عدد للصور والفيديوهات التي يبحث عنها الموقع تلقائياً
  maxPieces: 60,
  maxVideos: 20,
  // عدد الإطارات الظاهرة دائماً: 8 للصور و6 للفيديوهات. الفارغ منها ينتظر ملفك،
  // وإذا زادت ملفاتك عن هذا العدد تظهر كلها. اجعل الرقم 0 لإخفاء الإطارات الفارغة.
  placeholderPieces: 8,
  placeholderVideos: 6
};

/* ---------------------------------------------------
   2) إضافة الصور والفيديوهات (بدون أي تعديل في الكود)
   الصور:   ضعها في مجلد images بأسماء 1.jpg ثم 2.jpg ثم 3.jpg ...
            (أو png / jpeg / webp). تظهر في المعرض تلقائياً بالترتيب.
            صورة المدخل الكبيرة: hero.jpg أو hero.png في نفس المجلد.
   الفيديو: ضعه في مجلد videos بأسماء 1.mp4 ثم 2.mp4 ثم 3.mp4 ... (يُفضّل mp4).
   - الترقيم متتالٍ بدون فراغ: إذا غاب رقم يتوقف العرض عنده.
   - لحذف صورة: احذف الملف وأعد ترقيم الباقي.
   - الموقع ثابت وليس فيه أي واجهة رفع، فالإضافة بيدك أنت فقط
     ولا يستطيع أي زائر إضافة محتوى. لا توجد أسعار هنا عمداً.
   --------------------------------------------------- */
const IMG_EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];
const VID_EXTS = ["mp4", "webm", "mov", "MP4"];

/* ---------------------------------------------------
   3) أوصاف القطع (اختياري، بيدك أنت فقط)
   - المفتاح = رقم الصورة (1 هي 1.jpg). name اسم القطعة، desc وصفها.
   - الزائر يقرأ الوصف كنص ثابت ولا يستطيع تعديله.
   - اتركها فارغة فلا يظهر أي وصف. مثال لتفعيل وصف:
       1: { name: "صينية منقوشة", desc: "قطر 40 سم، نقش يدوي" },
   --------------------------------------------------- */
const DETAILS = {
  // 1: { name: "", desc: "" },
};

function detailsFor(n) {
  const d = DETAILS[n] || {};
  return { name: d.name || "", desc: d.desc || "" };
}

/* =====================================================
   البحث التلقائي عن الملفات في المجلدات
   ===================================================== */
function probe(url, kind) {
  return new Promise(resolve => {
    if (kind === "video") {
      const v = document.createElement("video");
      let done = false;
      const end = ok => {
        if (done) return;
        done = true;
        v.removeAttribute("src");
        v.load();
        resolve(ok);
      };
      v.preload = "metadata";
      v.onloadedmetadata = () => end(true);
      v.onerror = () => end(false);
      setTimeout(() => end(false), 5000);
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    }
  });
}

// يرجع مسار أول امتداد موجود، أو null
async function findFile(base, exts, kind) {
  for (const ext of exts) {
    const url = base + "." + ext;
    if (await probe(url, kind)) return url;
  }
  return null;
}

/* =====================================================
   إطار فارغ (Placeholder) يظهر حتى ترفع الصور الحقيقية
   ===================================================== */
function placeholderSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#174B63"/>
    <rect x="14" y="14" width="372" height="372" fill="none" stroke="#F0C75A" stroke-width="3" stroke-dasharray="10 8"/>
    <g fill="none" stroke="#FFD24A" stroke-width="5" stroke-linejoin="round">
      <rect x="160" y="172" width="80" height="58" rx="8"/>
      <circle cx="200" cy="201" r="16"/>
      <path d="M180 172l6-12h28l6 12"/>
    </g>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function sourceOf(item) {
  return item.img ? { src: item.img, cover: true } : { src: placeholderSVG(), cover: false };
}

/* =====================================================
   قطعة نحاسية للمدخل (دلة منقوشة) تظهر إذا لم تضع صورة hero.png
   ===================================================== */
function heroPieceSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
<linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="#5a3d0e"/><stop offset=".16" stop-color="#b8862b"/><stop offset=".36" stop-color="#f3dc8a"/><stop offset=".48" stop-color="#fff3c2"/><stop offset=".62" stop-color="#e0b95a"/><stop offset=".85" stop-color="#946a1b"/><stop offset="1" stop-color="#4f350b"/></linearGradient>
<linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc8a"/><stop offset=".5" stop-color="#c79a3c"/><stop offset="1" stop-color="#6b4a12"/></linearGradient>
<linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c970"/><stop offset=".5" stop-color="#b8862b"/><stop offset="1" stop-color="#6b4a12"/></linearGradient>
<radialGradient id="k" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff3c2"/><stop offset=".6" stop-color="#c79a3c"/><stop offset="1" stop-color="#6b4a12"/></radialGradient>
<radialGradient id="s"><stop offset="0" stop-color="#0c4a6e" stop-opacity=".45"/><stop offset="1" stop-color="#0c4a6e" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="200" cy="352" rx="120" ry="16" fill="url(#s)"/>
<path d="M166 160C98 166 88 252 128 294" fill="none" stroke="url(#h)" stroke-width="15" stroke-linecap="round"/>
<path d="M166 160C98 166 88 252 128 294" fill="none" stroke="#fff3c2" stroke-opacity=".45" stroke-width="3" stroke-linecap="round" transform="translate(-2 -2)"/>
<path d="M236 206C290 196 318 150 322 90L340 97C336 172 298 226 244 242z" fill="url(#d)"/>
<path d="M242 214C290 202 314 160 322 100" fill="none" stroke="#fff3c2" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="331" cy="93" rx="11" ry="5" transform="rotate(22 331 93)" fill="url(#k)"/>
<path d="M135 346Q135 334 148 332H252Q265 334 265 346z" fill="url(#b)"/>
<path d="M146 332C108 300 112 232 160 200L172 150H228L240 200C288 232 292 300 254 332z" fill="url(#b)"/>
<path d="M170 150L177 112H223L230 150z" fill="url(#b)"/>
<ellipse cx="200" cy="150" rx="33" ry="7" fill="#e0b95a" stroke="#6b4a12" stroke-width="1.5"/>
<path d="M172 112Q200 76 228 112z" fill="url(#b)"/>
<ellipse cx="200" cy="112" rx="28" ry="6" fill="#d8ae4c" stroke="#6b4a12" stroke-width="1.5"/>
<circle cx="200" cy="80" r="9" fill="url(#k)"/>
<g fill="none" stroke="#5a3d0e" stroke-opacity=".75" stroke-width="2" stroke-linecap="round">
<path d="M178 127H222M175 139H225"/>
<path d="M124 262Q200 292 276 262M120 290Q200 322 280 290"/>
<circle cx="200" cy="235" r="30"/>
</g>
<path d="M130 276Q200 306 270 276" fill="none" stroke="#fff3c2" stroke-opacity=".7" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
<polygon points="200.0,211.0 205.0,223.0 217.0,218.0 212.0,230.0 224.0,235.0 212.0,240.0 217.0,252.0 205.0,247.0 200.0,259.0 195.0,247.0 183.0,252.0 188.0,240.0 176.0,235.0 188.0,230.0 183.0,218.0 195.0,223.0" fill="#6b4a12" fill-opacity=".45" stroke="#fff3c2" stroke-opacity=".8" stroke-width="1.4"/>
<circle cx="200" cy="235" r="4" fill="#fff3c2"/>
<path d="M150 302C122 270 126 236 158 214" fill="none" stroke="#fff7d6" stroke-opacity=".55" stroke-width="6" stroke-linecap="round"/>
<path d="M214 168L217 204" fill="none" stroke="#fff7d6" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>
</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* =====================================================
   التأثير المائي (Water Ripple)
   محاكاة موجات على لوحة Canvas تُزيح بكسلات الصورة
   ===================================================== */
const activeRipples = new Set();
let loopRunning = false;

function loop(now) {
  activeRipples.forEach(r => {
    if (now < r.until) {
      r.step();
      r.render();
    } else {
      r.drawClean();
      activeRipples.delete(r);
    }
  });
  if (activeRipples.size) requestAnimationFrame(loop);
  else loopRunning = false;
}
function wake(r, ms) {
  r.until = performance.now() + ms;
  activeRipples.add(r);
  if (!loopRunning) { loopRunning = true; requestAnimationFrame(loop); }
}

class Ripple {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    this.w = canvas.width;
    this.h = canvas.height;
    this.size = this.w * this.h;
    this.cur = new Int32Array(this.size);
    this.prev = new Int32Array(this.size);
    this.src = null;
    this.until = 0;
  }

  // تحميل صورة داخل اللوحة (cover = ملء الإطار، وإلا احتواء الصورة كاملة)
  setSource({ src, cover }) {
    this.cur.fill(0);
    this.prev.fill(0);
    activeRipples.delete(this);
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const off = document.createElement("canvas");
        off.width = this.w;
        off.height = this.h;
        const o = off.getContext("2d");
        const k = (cover ? Math.max : Math.min)(this.w / img.width, this.h / img.height);
        const dw = img.width * k, dh = img.height * k;
        o.drawImage(img, (this.w - dw) / 2, (this.h - dh) / 2, dw, dh);
        try {
          this.src = o.getImageData(0, 0, this.w, this.h);
          this.out = this.ctx.createImageData(this.w, this.h);
          this.drawClean();
        } catch (err) {
          // فتح الملف مباشرة (file://) يمنع قراءة بكسلات صور المجلدات:
          // نعرض الصورة بدون تأثير مائي. استعمل Live Server لتفعيله.
          this.src = null;
          this.ctx.drawImage(off, 0, 0);
        }
        resolve();
      };
      img.onerror = resolve;
      img.src = src;
    });
  }

  drawClean() {
    if (this.src) this.ctx.putImageData(this.src, 0, 0);
  }

  // قطرة عند نقطة (x, y) بإحداثيات اللوحة
  drop(x, y, radius = 8, strength = 400) {
    const w = this.w, h = this.h;
    for (let j = -radius; j <= radius; j++) {
      for (let i = -radius; i <= radius; i++) {
        const px = Math.round(x + i), py = Math.round(y + j);
        if (px < 1 || py < 1 || px >= w - 1 || py >= h - 1) continue;
        const d = Math.hypot(i, j);
        if (d <= radius) this.cur[py * w + px] += strength * (1 - d / radius);
      }
    }
    wake(this, 3800);
  }

  // قطرة من حدث مؤشر (ماوس أو لمس)
  dropAt(e, radius, strength) {
    const r = this.canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * this.w;
    const y = (e.clientY - r.top) / r.height * this.h;
    if (x < 0 || y < 0 || x > this.w || y > this.h) return;
    this.drop(x, y, radius, strength);
  }

  dropCenter(strength = 500) {
    this.drop(this.w / 2, this.h / 2, 12, strength);
  }

  step() {
    const w = this.w, n = this.size, a = this.cur, b = this.prev;
    for (let i = w + 1; i < n - w - 1; i++) {
      const v = ((a[i - 1] + a[i + 1] + a[i - w] + a[i + w]) >> 1) - b[i];
      b[i] = v - (v >> 5);          // تخميد تدريجي
    }
    this.cur = b;
    this.prev = a;
  }

  render() {
    if (!this.src) return;
    const w = this.w, h = this.h, a = this.cur;
    const s = this.src.data, o = this.out.data;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const dx = a[i - 1] - a[i + 1];
        const dy = a[i - w] - a[i + w];
        let sx = x + (dx >> 3), sy = y + (dy >> 3);
        sx = sx < 0 ? 0 : sx >= w ? w - 1 : sx;
        sy = sy < 0 ? 0 : sy >= h ? h - 1 : sy;
        const si = (sy * w + sx) * 4, oi = i * 4;
        const shine = dx >> 2;       // لمعان خفيف على قمم الموجات
        o[oi] = s[si] + shine;
        o[oi + 1] = s[si + 1] + shine;
        o[oi + 2] = s[si + 2] + shine;
        o[oi + 3] = s[si + 3];
      }
    }
    this.ctx.putImageData(this.out, 0, 0);
  }
}

// ربط أحداث المؤشر بعنصر: مرور = موجة صغيرة، ضغط = موجة كبيرة
function bindRipple(el, ripple) {
  let last = 0;
  el.addEventListener("pointerenter", () => ripple.dropCenter(350));
  el.addEventListener("pointermove", e => {
    const t = performance.now();
    if (t - last < 40) return;
    last = t;
    ripple.dropAt(e, 6, 140);
  });
  el.addEventListener("pointerdown", e => ripple.dropAt(e, 14, 520));
}

/* =====================================================
   الروابط (فيسبوك / إنستغرام / واتساب)
   ===================================================== */
function waLink(text) {
  const base = "https://wa.me/" + CONFIG.whatsapp;
  return text ? base + "?text=" + encodeURIComponent(text) : base;
}

function applyConfig() {
  document.querySelectorAll('[data-social="facebook"]').forEach(a => a.href = CONFIG.facebook);
  document.querySelectorAll('[data-social="instagram"]').forEach(a => a.href = CONFIG.instagram);
  document.querySelectorAll('[data-social="whatsapp"]').forEach(a =>
    a.href = waLink("السلام عليكم، أود الاستفسار عن منتجاتكم النحاسية."));
  document.getElementById("footerLocation").textContent = CONFIG.location;
  document.getElementById("companyName").textContent = CONFIG.company;
}

/* =====================================================
   معرض القطع والنافذة المنبثقة
   ===================================================== */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalWa = document.getElementById("modalWa");
const modalDesc = document.getElementById("modalDesc");
let currentItem = null, currentIdx = 0;
const modalRipple = new Ripple(document.getElementById("modalCanvas"));
let lastFocus = null;

// نص رسالة واتساب: رقم القطعة + الاسم والوصف الذي حددته أنت (إن وُجدا)
function buildMessage() {
  let msg = "السلام عليكم، أود الاستفسار عن إحدى القطع النحاسية (رقم " + (currentIdx + 1) + " في المعرض)";
  if (currentItem && currentItem.name) msg += ": " + currentItem.name;
  if (currentItem && currentItem.desc) msg += "\nالوصف: " + currentItem.desc;
  return msg;
}

async function openModal(item, idx) {
  lastFocus = document.activeElement;
  currentItem = item;
  currentIdx = idx;
  modalTitle.textContent = item.name || "";
  modalTitle.hidden = !item.name;          // العنوان يظهر فقط إن كتبت اسماً للقطعة
  modalDesc.textContent = item.desc || "";   // نص ثابت للقراءة فقط
  modalDesc.hidden = !item.desc;
  modalWa.href = waLink(buildMessage());
  modal.hidden = false;
  document.body.classList.add("lock");
  await modalRipple.setSource(sourceOf(item));
  modalRipple.dropCenter(650);
  document.getElementById("modalClose").focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("lock");
  if (lastFocus) lastFocus.focus();
}

bindRipple(document.getElementById("modalCanvas"), modalRipple);
document.getElementById("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!modal.hidden) closeModal();
  if (!privacyModal.hidden) closePrivacy();
  if (!termsModal.hidden) closeTerms();
});

function addPieceCard(grid, item, idx) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.setAttribute("aria-label", "عرض القطعة " + (item.name || (idx + 1)));
  card.innerHTML = '<span class="frame"><canvas width="400" height="400"></canvas></span>';
  grid.appendChild(card);

  const ripple = new Ripple(card.querySelector("canvas"));
  ripple.setSource(sourceOf(item));
  bindRipple(card, ripple);
  card.addEventListener("click", () => openModal(item, idx));
}

async function buildGallery() {
  const grid = document.getElementById("galleryGrid");
  let count = 0;
  for (let n = 1; n <= CONFIG.maxPieces; n++) {
    const src = await findFile("images/" + n, IMG_EXTS, "image");
    if (!src) break;
    addPieceCard(grid, { ...detailsFor(n), img: src }, n - 1);
    count++;
  }
  // إكمال العدد بإطارات فارغة جاهزة لصورك
  for (let n = count + 1; n <= CONFIG.placeholderPieces; n++) {
    addPieceCard(grid, { ...detailsFor(n), img: "" }, n - 1);
  }
}

/* =====================================================
   الفيديوهات
   ===================================================== */
function addVideoCard(grid, src) {
  const card = document.createElement("article");
  card.className = "video-card";
  if (src) {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.src = src;
    card.appendChild(video);
  } else {
    card.insertAdjacentHTML("beforeend",
      '<div class="video-empty"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></div>');
  }
  grid.appendChild(card);
}

async function buildVideos() {
  const grid = document.getElementById("videoGrid");
  let count = 0;
  for (let n = 1; n <= CONFIG.maxVideos; n++) {
    const src = await findFile("videos/" + n, VID_EXTS, "video");
    if (!src) break;
    addVideoCard(grid, src);
    count++;
  }
  // إكمال العدد بإطارات فارغة جاهزة لفيديوهاتك
  for (let n = count + 1; n <= CONFIG.placeholderVideos; n++) addVideoCard(grid, "");
}

/* =====================================================
   مدخل الموقع: دلة تتموج، مع قطرة واحدة عند التحميل
   ===================================================== */
// يستخدم images/hero.* إن وُجدت، وإلا قطعة نحاسية مرسومة
async function heroSource() {
  const found = await findFile("images/hero", IMG_EXTS, "image");
  return found ? { src: found, cover: true } : { src: heroPieceSVG(), cover: false };
}

function buildHero() {
  const frame = document.getElementById("heroFrame");
  const ripple = new Ripple(document.getElementById("heroCanvas"));
  heroSource().then(src => ripple.setSource(src)).then(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTimeout(() => ripple.dropCenter(600), 700);
    }
  });
  bindRipple(frame, ripple);
}

/* =====================================================
   قائمة الهاتف
   ===================================================== */
function setupNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));
}

/* =====================================================
   سياسة الخصوصية
   ===================================================== */
const privacyModal = document.getElementById("privacyModal");
function openPrivacy() {
  privacyModal.hidden = false;
  document.body.classList.add("lock");
  document.getElementById("privacyClose").focus();
}
function closePrivacy() {
  privacyModal.hidden = true;
  document.body.classList.remove("lock");
  document.getElementById("privacyOpen").focus();
}
document.getElementById("privacyOpen").addEventListener("click", openPrivacy);
document.getElementById("privacyClose").addEventListener("click", closePrivacy);
privacyModal.addEventListener("click", e => { if (e.target === privacyModal) closePrivacy(); });

/* =====================================================
   بنود الخدمة
   ===================================================== */
const termsModal = document.getElementById("termsModal");
function openTerms() {
  termsModal.hidden = false;
  document.body.classList.add("lock");
  document.getElementById("termsClose").focus();
}
function closeTerms() {
  termsModal.hidden = true;
  document.body.classList.remove("lock");
  document.getElementById("termsOpen").focus();
}
document.getElementById("termsOpen").addEventListener("click", openTerms);
document.getElementById("termsClose").addEventListener("click", closeTerms);
termsModal.addEventListener("click", e => { if (e.target === termsModal) closeTerms(); });

/* ---------- التشغيل ---------- */
applyConfig();
buildHero();
buildGallery();
buildVideos();
setupNav();
