// ============================================
// Kaif Zaki Portfolio Frontend Engine
// Matches Harshit Sahu's Design Aesthetics & Interactions
// ============================================

const ICON_BASE = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Helper to generate tech icon image
function iconImg(slug, label) {
  if (!slug) return null;
  const img = document.createElement("img");
  img.src = `${ICON_BASE}${slug}.svg`;
  img.alt = "";
  img.loading = "lazy";
  img.setAttribute("aria-hidden", "true");
  img.onerror = () => img.remove();
  return img;
}

// Parses "slug:Label,slug2:Label2,:LabelNoIcon" into chip elements
function renderChips(container) {
  const raw = container.dataset.chips;
  if (!raw) return;
  container.innerHTML = "";
  raw.split(",").forEach((entry, i) => {
    const parts = entry.split(":");
    const slug = parts[0]?.trim();
    const label = (parts[1] || parts[0])?.trim();
    if (!label) return;
    const span = document.createElement("span");
    span.style.transitionDelay = `${i * 35}ms`;
    if (slug) {
      const img = iconImg(slug, label);
      if (img) span.appendChild(img);
    }
    span.appendChild(document.createTextNode(label));
    container.appendChild(span);
  });
}

// ============================================
// Fetch Data & Render Dynamic Content
// ============================================
let portfolioData = null;

async function loadPortfolio() {
  try {
    const res = await fetch("/api/portfolio");
    const existingBar = document.getElementById("dbNoticeBar");
    if (res.ok) {
      if (existingBar) existingBar.remove();
      portfolioData = await res.json();
      renderPortfolio(portfolioData);
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn("Database status:", err);
      if (err.hint && !existingBar) {
        const bar = document.createElement("div");
        bar.id = "dbNoticeBar";
        bar.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;background:#182230;border:1px solid #ff9f45;color:#ff9f45;padding:10px 20px;border-radius:100px;font-size:0.82rem;box-shadow:0 10px 30px rgba(0,0,0,0.6);text-align:center;";
        bar.innerHTML = `⚠️ <strong>Database Setup Required:</strong> Please configure your credentials in <code>.env</code> and run <code>database/setup.sql</code>`;
        document.body.appendChild(bar);
      }
    }
  } catch (err) {
    console.warn("Could not fetch /api/portfolio, using page contents:", err);
  }
}

function renderPortfolio(data) {
  if (!data || !data.profile) return;

  const { profile, stats, marqueeTools, series, skillCategories, experience, projects, certifications, education, availability } = data;

  // Nav mark
  const navMark = document.querySelector(".nav-mark");
  if (navMark && profile.shortName) {
    navMark.innerHTML = `${profile.shortName}<span>.</span>`;
  }

  // Availability pill in nav
  const navAvailPill = document.querySelector(".nav-end .availability-pill");
  if (navAvailPill) {
    navAvailPill.style.display = availability?.openToWork ? "inline-flex" : "none";
    if (availability?.badgeText) navAvailPill.textContent = availability.badgeText;
  }

  // Hero Copy
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle && profile.name) heroTitle.textContent = profile.name;

  const heroTagline = document.querySelector(".hero-tagline");
  if (heroTagline && profile.heroTagline) heroTagline.textContent = profile.heroTagline;

  const heroSub = document.querySelector(".hero-sub");
  if (heroSub && profile.heroSub) heroSub.textContent = profile.heroSub;

  // Hero Background Watermark
  if (profile.watermark) {
    updateHeroWordmark(profile.watermark);
  }

  // Hero Quick Links & Resume Download Buttons
  const linkResume = document.getElementById("heroLinkResume");
  const heroResumeBtn = document.getElementById("heroResumeBtn");
  const resumeHref = profile.resumeUrl || "/assets/Kaif_Zaki_Resume.pdf";
  const downloadName = (profile.name ? profile.name.replace(/\s+/g, '_') : 'Kaif_Zaki') + '_Resume.pdf';

  if (linkResume) {
    linkResume.href = resumeHref;
    if (resumeHref.endsWith('.pdf')) {
      linkResume.setAttribute('download', downloadName);
      const val = linkResume.querySelector(".hero-link-value");
      if (val) val.textContent = "PDF download";
    }
  }

  if (heroResumeBtn) {
    heroResumeBtn.href = resumeHref;
    if (resumeHref.endsWith('.pdf')) {
      heroResumeBtn.setAttribute('download', downloadName);
    }
  }

  const mobileResumeBtn = document.getElementById("mobileResumeBtn");
  if (mobileResumeBtn) {
    mobileResumeBtn.href = resumeHref;
    if (resumeHref.endsWith('.pdf')) {
      mobileResumeBtn.setAttribute('download', downloadName);
    }
  }

  const mobileAvailText = document.getElementById("mobileAvailText");
  if (mobileAvailText && availability?.badgeText) {
    mobileAvailText.textContent = availability.badgeText;
  }

  const linkLinkedin = document.getElementById("heroLinkLinkedin");
  if (linkLinkedin && profile.linkedin) {
    linkLinkedin.href = profile.linkedin;
    const val = linkLinkedin.querySelector(".hero-link-value");
    if (val) val.textContent = profile.linkedinHandle || "/in/kaif-zaki";
  }

  const linkGithub = document.getElementById("heroLinkGithub");
  if (linkGithub && profile.github) {
    linkGithub.href = profile.github;
    const val = linkGithub.querySelector(".hero-link-value");
    if (val) val.textContent = profile.githubHandle || "@Kaif-Zaki";
  }

  const linkEmail = document.getElementById("heroLinkEmail");
  if (linkEmail && profile.email) {
    linkEmail.href = `mailto:${profile.email}`;
    const val = linkEmail.querySelector(".hero-link-value");
    if (val) val.textContent = profile.email;
  }

  // Marquee Tools
  const marqueeTrack = document.getElementById("marqueeTrack");
  if (marqueeTrack && Array.isArray(marqueeTools)) {
    marqueeTrack.innerHTML = "";
    const buildSet = () =>
      marqueeTools.map(([slug, label]) => {
        const badge = document.createElement("div");
        badge.className = "tool-badge";
        const img = iconImg(slug, label);
        if (img) badge.appendChild(img);
        const span = document.createElement("span");
        span.textContent = label;
        badge.appendChild(span);
        return badge;
      });
    buildSet().forEach((el) => marqueeTrack.appendChild(el));
    buildSet().forEach((el) => marqueeTrack.appendChild(el));
  }

  // Series Showcase Slider
  const writingTrack = document.getElementById("writingTrack");
  if (writingTrack && Array.isArray(series)) {
    writingTrack.innerHTML = "";
    series.forEach((item) => {
      const card = document.createElement("a");
      card.className = "writing-card";
      card.href = item.link || "#projects";
      card.innerHTML = `
        <div class="writing-card-media">
          <img src="${item.image || '/assets/series-microservices.gif'}" alt="${item.title}" loading="lazy">
        </div>
        <div class="writing-card-body">
          <span class="writing-card-tag">${item.tag || 'Architecture'}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <span class="writing-card-cta">${item.cta || 'Read more →'}</span>
        </div>
      `;
      writingTrack.appendChild(card);
    });
  }

  // About Section Copy & Stats
  const aboutHead = document.querySelector(".about-copy h2");
  if (aboutHead && profile.aboutHeadline) aboutHead.textContent = profile.aboutHeadline;

  const aboutImg = document.getElementById("aboutPhotoImg") || document.querySelector(".about-photo img");
  if (aboutImg && profile.aboutImage) aboutImg.src = profile.aboutImage;

  const aboutP1 = document.getElementById("aboutP1");
  if (aboutP1 && profile.bioParagraph1) aboutP1.textContent = profile.bioParagraph1;

  const aboutP2 = document.getElementById("aboutP2");
  if (aboutP2 && profile.bioParagraph2) aboutP2.textContent = profile.bioParagraph2;

  const statRow = document.getElementById("statRow");
  if (statRow && Array.isArray(stats)) {
    statRow.innerHTML = "";
    stats.forEach((s) => {
      const div = document.createElement("div");
      div.className = "stat";
      div.innerHTML = `
        <span class="stat-num" data-count="${s.count}">${s.count}</span><span class="stat-unit">${s.unit || ''}</span>
        <p>${s.label}</p>
      `;
      statRow.appendChild(div);
    });
  }

  // Skills Categories
  const skillGrid = document.getElementById("skillGrid");
  if (skillGrid && Array.isArray(skillCategories)) {
    skillGrid.innerHTML = "";
    skillCategories.forEach((sc) => {
      const card = document.createElement("div");
      card.className = "skill-card reveal";
      card.innerHTML = `
        <div class="skill-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            ${sc.icon || '<circle cx="12" cy="12" r="8"/>'}
          </svg>
        </div>
        <h3>${sc.title}</h3>
        <div class="chips" data-chips="${sc.chips || ''}"></div>
      `;
      skillGrid.appendChild(card);
    });
  }

  // Experience Timeline
  const timelineEl = document.getElementById("timeline");
  if (timelineEl && Array.isArray(experience)) {
    timelineEl.innerHTML = "";
    experience.forEach((exp) => {
      const item = document.createElement("div");
      item.className = "tl-item reveal";
      const bulletsHtml = (exp.bullets || []).map((b) => `<li>${b}</li>`).join("");
      item.innerHTML = `
        <div class="tl-marker"></div>
        <div class="tl-date">${exp.period}</div>
        <div class="tl-body">
          <h3>${exp.role}</h3>
          <p class="tl-org">${exp.company} ${exp.location ? '· ' + exp.location : ''}</p>
          <ul>${bulletsHtml}</ul>
        </div>
      `;
      timelineEl.appendChild(item);
    });
  }

  // Projects Grid
  const projectGrid = document.getElementById("projectGrid");
  if (projectGrid && Array.isArray(projects)) {
    projectGrid.innerHTML = "";
    projects.forEach((p) => {
      const card = document.createElement("article");
      const hasDiag = !!p.diagramUrl;
      card.className = `project-card reveal ${p.isWide ? 'project-card--wide' : ''} ${hasDiag ? 'has-diagram' : ''}`;
      if (hasDiag) {
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-expanded", "false");
      }

      const outcomesHtml = (p.outcomes || []).map((o) => `<li>${o}</li>`).join("");
      const diagHtml = hasDiag ? `
        <p class="project-diagram-hint">Hover or tap to view architecture diagram</p>
        <figure class="project-diagram">
          <img src="${p.diagramUrl}" alt="${p.diagramAlt || p.title}" loading="lazy">
        </figure>
      ` : "";

      const hasLinks = !!(p.githubUrl || p.liveUrl);
      const linksHtml = hasLinks ? `
        <div class="project-links">
          ${p.githubUrl ? `
            <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link-btn project-link-btn--github" onclick="event.stopPropagation()" aria-label="View ${p.title} on GitHub">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span>GitHub</span>
              <span class="link-arrow">↗</span>
            </a>
          ` : ''}
          ${p.liveUrl ? `
            <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-link-btn project-link-btn--live" onclick="event.stopPropagation()" aria-label="Open live preview of ${p.title}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <span>Live Preview</span>
              <span class="link-arrow">↗</span>
            </a>
          ` : ''}
        </div>
      ` : "";

      card.innerHTML = `
        <div class="project-tag">${p.tag || 'Project'}</div>
        <h3>${p.title} ${p.year ? `<span style="font-size:0.85rem;color:var(--text-faint);font-weight:400">(${p.year})</span>` : ''}</h3>
        <p>${p.description}</p>
        <ul class="project-outcomes">${outcomesHtml}</ul>
        <div class="chips chips--dark" data-chips="${p.chips || ''}"></div>
        ${linksHtml}
        ${diagHtml}
      `;
      projectGrid.appendChild(card);
    });
  }

  // Certifications & Education
  const certList = document.getElementById("certList");
  if (certList && Array.isArray(certifications)) {
    certList.innerHTML = "";
    certifications.forEach((c, index) => {
      const li = document.createElement("li");
      if (index >= 3) {
        li.className = "cred-item-extra";
      }

      const hasLink = c.link && c.link.trim() !== "" && c.link.trim() !== "#";
      if (hasLink) {
        li.innerHTML = `
          <a href="${c.link.trim()}" target="_blank" rel="noopener noreferrer" class="cred-link" aria-label="View verified certificate for ${c.title}">
            <span>${c.title} <span class="cred-link-icon">↗</span></span>
            <em>${c.issuer || ''}</em>
          </a>
        `;
      } else {
        li.innerHTML = `
          <span>${c.title}</span>
          <em>${c.issuer || ''}</em>
        `;
      }
      certList.appendChild(li);
    });

    const badgeText = document.getElementById("certBadgeText");
    const badgeBtn = document.getElementById("certExpandBadge");
    const totalCount = certifications.length;
    const extraCount = totalCount - 3;

    if (extraCount > 0) {
      if (badgeText) badgeText.textContent = `+${extraCount} more · Hover to view all`;
      if (badgeBtn) badgeBtn.style.display = "inline-flex";
    } else {
      if (badgeBtn) badgeBtn.style.display = "none";
    }
  }

  // Certifications Hover & Touch Interaction
  const certBlock = document.getElementById("certBlock");
  if (certBlock && !certBlock.dataset.bound) {
    certBlock.dataset.bound = "true";
    certBlock.addEventListener("mouseenter", () => {
      const badgeText = document.getElementById("certBadgeText");
      if (badgeText && (certifications?.length || 0) > 3) {
        badgeText.textContent = `Showing all ${certifications.length} certificates`;
      }
    });

    certBlock.addEventListener("mouseleave", () => {
      if (!certBlock.classList.contains("is-expanded")) {
        const badgeText = document.getElementById("certBadgeText");
        const extraCount = (certifications?.length || 0) - 3;
        if (badgeText && extraCount > 0) {
          badgeText.textContent = `+${extraCount} more · Hover to view all`;
        }
      }
    });

    // Tap / Click support for touch screens
    certBlock.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        certBlock.classList.toggle("is-expanded");
        const isExp = certBlock.classList.contains("is-expanded");
        const badgeText = document.getElementById("certBadgeText");
        const extraCount = (certifications?.length || 0) - 3;
        if (badgeText && extraCount > 0) {
          badgeText.textContent = isExp
            ? `Showing all ${certifications.length} certificates (Tap to collapse)`
            : `+${extraCount} more · Tap to view all`;
        }
      }
    });
  }

  const eduList = document.getElementById("eduList");
  if (eduList && Array.isArray(education)) {
    eduList.innerHTML = "";
    education.forEach((e) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${e.degree}</span>
        <em>${e.institution} · ${e.period}</em>
        ${e.coursework ? `<div class="cred-coursework">Coursework: ${e.coursework}</div>` : ''}
      `;
      eduList.appendChild(li);
    });
  }

  // Availability Bento Hub
  const availCard = document.getElementById("open-to-work");
  if (availCard && availability) {
    if (availability.openToWork === false) {
      availCard.style.display = "none";
    } else {
      availCard.style.display = "";
    }

    const badgeEl = document.getElementById("availBadgeText");
    if (badgeEl) badgeEl.textContent = availability.badgeText || "Open to work";

    const engBadge = document.getElementById("availEngagement");
    if (engBadge) engBadge.textContent = availability.engagement || "Full-time · contract · freelance";

    const engText = document.getElementById("availEngagementText");
    if (engText) engText.textContent = availability.engagement || "Full-time, contract, or consulting roles";

    const rolesVal = document.getElementById("availRoles");
    if (rolesVal) rolesVal.textContent = availability.targetRoles || "Associate Software Engineer · Junior Full Stack Developer · Backend / Spring Boot Engineer";

    const locVal = document.getElementById("availLocation");
    if (locVal) locVal.textContent = availability.location || "Jaffna / Panadura, Sri Lanka · IST (UTC+5:30)";

    const modeVal = document.getElementById("availMode");
    if (modeVal) modeVal.textContent = availability.workMode || "Remote / Hybrid / On-site · Open to relocation";

    const sub = document.getElementById("contactSubtext");
    if (sub && availability.subtext) sub.textContent = availability.subtext;
  }

  // Bento Action Deck & Direct Connect Touchpoints
  if (profile) {
    const bentoCta = document.getElementById("bentoEmailCta");
    if (bentoCta && profile.email) {
      bentoCta.href = `mailto:${profile.email}`;
    }

    const emailLink = document.getElementById("contactEmailLink");
    const emailVal = document.getElementById("contactEmailVal");
    if (emailLink && profile.email) emailLink.href = `mailto:${profile.email}`;
    if (emailVal && profile.email) emailVal.textContent = profile.email;

    const phoneLink = document.getElementById("contactPhoneLink");
    const phoneVal = document.getElementById("contactPhoneVal");
    if (phoneLink && profile.phone) phoneLink.href = `tel:${profile.phone.replace(/[^+\d]/g, '')}`;
    if (phoneVal && profile.phone) phoneVal.textContent = profile.phone;

    const linkedinLink = document.getElementById("contactLinkedinLink");
    const linkedinVal = document.getElementById("contactLinkedinVal");
    if (linkedinLink && profile.linkedin) linkedinLink.href = profile.linkedin;
    if (linkedinVal && profile.linkedin) linkedinVal.textContent = profile.linkedinHandle || "/in/kaif-zaki";

    const githubLink = document.getElementById("contactGithubLink");
    const githubVal = document.getElementById("contactGithubVal");
    if (githubLink && profile.github) githubLink.href = profile.github;
    if (githubVal && profile.github) githubVal.textContent = profile.githubHandle || "@Kaif-Zaki";
  }

  // Footer
  const footerCredit = document.getElementById("footerCredit");
  if (footerCredit && profile) {
    footerCredit.textContent = `${profile.name} — ${profile.location}`;
  }

  // Initialize interactive behaviors on newly injected elements
  document.querySelectorAll(".chips[data-chips]").forEach(renderChips);
  attachDiagramHandlers();
  observeReveals();
  observeCounters();
}

// ============================================
// Hero Canvas: Interactive Connected Node Network
// ============================================
const canvas = document.getElementById("mesh");
const ctx = canvas ? canvas.getContext("2d") : null;
let width, height, nodes = [];
const LINK_DIST = 145;

function resizeCanvas() {
  if (!canvas) return;
  width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
}

function initNodes() {
  if (!canvas) return;
  const area = canvas.offsetWidth * canvas.offsetHeight;
  const count = Math.min(65, Math.max(26, Math.round(area / 18000)));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28 * window.devicePixelRatio,
    vy: (Math.random() - 0.5) * 0.28 * window.devicePixelRatio,
  }));
}

let pointerX = 0.5, pointerY = 0.5;
if (canvas && canvas.parentElement) {
  canvas.parentElement.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = (e.clientX - rect.left) / rect.width;
    pointerY = (e.clientY - rect.top) / rect.height;
  });
}

function stepCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  // Parallax offset towards cursor
  const parallaxX = (pointerX - 0.5) * 22 * window.devicePixelRatio;
  const parallaxY = (pointerY - 0.5) * 22 * window.devicePixelRatio;
  ctx.save();
  ctx.translate(parallaxX, parallaxY);

  // Update & bounce nodes
  nodes.forEach((n) => {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;
  });

  // Draw links
  const maxDist = LINK_DIST * window.devicePixelRatio;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.strokeStyle = `rgba(0, 214, 160, ${(1 - dist / maxDist) * 0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Draw node points
  nodes.forEach((n) => {
    ctx.fillStyle = "rgba(0, 214, 160, 0.55)";
    ctx.beginPath();
    ctx.arc(n.x, n.y, 1.6 * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
  if (!prefersReducedMotion) requestAnimationFrame(stepCanvas);
}

if (canvas && ctx) {
  resizeCanvas();
  initNodes();
  if (!prefersReducedMotion) {
    requestAnimationFrame(stepCanvas);
  } else {
    stepCanvas();
  }
  window.addEventListener("resize", () => {
    resizeCanvas();
    initNodes();
  });
}

// ============================================
// Hero Wordmark Responsive Auto-Fitting System
// ============================================
let currentWatermarkText = "SOFTWARE ENGINEER";

function updateHeroWordmark(watermarkText) {
  if (watermarkText) currentWatermarkText = watermarkText;
  const heroWordmark = document.querySelector(".hero-wordmark--main");
  if (!heroWordmark) return;

  const rawWm = (currentWatermarkText || "SOFTWARE ENGINEER").trim();
  const words = rawWm.split(/\s+/).filter(Boolean);

  heroWordmark.innerHTML = "";
  if (words.length > 0) {
    words.forEach(w => {
      const span = document.createElement("span");
      span.className = "wm-line";
      span.textContent = w;
      heroWordmark.appendChild(span);
    });
  } else {
    const span = document.createElement("span");
    span.className = "wm-line";
    span.textContent = rawWm;
    heroWordmark.appendChild(span);
  }

  fitHeroWordmark();
}

function fitHeroWordmark() {
  const heroWordmark = document.querySelector(".hero-wordmark--main");
  if (!heroWordmark) return;

  const lines = heroWordmark.querySelectorAll(".wm-line");
  if (!lines.length) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw <= 768;
  const isSmallPhone = vw <= 420;

  // Find longest word count
  let maxLen = 0;
  lines.forEach(line => {
    const len = line.textContent.trim().length;
    if (len > maxLen) maxLen = len;
  });
  if (maxLen === 0) maxLen = 8;

  // Safe container width ratio
  const paddingRatio = isSmallPhone ? 0.88 : (isMobile ? 0.90 : 0.92);
  const maxWidthPx = Math.min(vw * paddingRatio, 1360);

  // Height headroom so it never collides with hero content
  const maxHeightPx = vh * (isMobile ? 0.40 : 0.52);

  // Glyphs in bold Space Grotesk/Inter with tracking take ~0.64em width
  const charWidthRatio = 0.64;
  const fontByWidth = maxWidthPx / (maxLen * charWidthRatio);

  // Height limitation for N lines
  const lineCount = lines.length;
  const fontByHeight = maxHeightPx / (lineCount * 0.88);

  let computedSize = Math.min(fontByWidth, fontByHeight);

  // Min and Max clamps per device category
  const minAllowed = isSmallPhone ? 26 : (isMobile ? 32 : 54);
  const maxAllowed = isSmallPhone ? 54 : (isMobile ? 80 : 230);

  computedSize = Math.max(minAllowed, Math.min(Math.round(computedSize), maxAllowed));

  heroWordmark.style.fontSize = computedSize + "px";
  heroWordmark.style.lineHeight = isMobile ? "0.88" : "0.82";
}

window.addEventListener("resize", fitHeroWordmark, { passive: true });
window.addEventListener("orientationchange", () => setTimeout(fitHeroWordmark, 60), { passive: true });

// ============================================
// Hero Parallax on Scroll
// ============================================
const heroEl = document.getElementById("hero");
const heroWordmarks = document.getElementById("heroWordmarks");
const heroVisual = document.getElementById("heroVisual");

if (heroEl && heroWordmarks && heroVisual && !prefersReducedMotion) {
  const updateHeroParallax = () => {
    const rect = heroEl.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
    const yWord = progress * 70;
    const yVisual = progress * -24;
    const scaleWord = 1 + progress * 0.1;
    heroWordmarks.style.transform = `translate3d(0, ${yWord}px, 0) scale(${scaleWord})`;
    heroVisual.style.transform = `translate3d(0, ${yVisual}px, 0)`;
  };
  window.addEventListener("scroll", updateHeroParallax, { passive: true });
}

// ============================================
// Nav Scroll State
// ============================================
const nav = document.getElementById("nav");
const onScrollNav = () => {
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
};
onScrollNav();
window.addEventListener("scroll", onScrollNav, { passive: true });

// ============================================
// Writing / Showcase Slider
// ============================================
const writingViewport = document.getElementById("writingViewport");
const writingPrev = document.getElementById("writingPrev");
const writingNext = document.getElementById("writingNext");

if (writingViewport && writingPrev && writingNext) {
  const getCards = () => writingViewport.querySelectorAll(".writing-card");
  const getActiveIndex = () => {
    const cards = getCards();
    if (!cards.length) return 0;
    const viewRect = writingViewport.getBoundingClientRect();
    const mid = viewRect.left + viewRect.width / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const goToIndex = (index) => {
    const cards = getCards();
    if (!cards.length) return;
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    cards[clamped].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  writingPrev.addEventListener("click", (e) => {
    e.preventDefault();
    goToIndex(getActiveIndex() - 1);
  });
  writingNext.addEventListener("click", (e) => {
    e.preventDefault();
    goToIndex(getActiveIndex() + 1);
  });
}

// ============================================
// Timeline Scroll Progress Line
// ============================================
const timelineEl = document.getElementById("timeline");
if (timelineEl) {
  const updateTimelineProgress = () => {
    const rect = timelineEl.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height;
    const visible = Math.min(Math.max(viewportH * 0.6 - rect.top, 0), total);
    const pct = total > 0 ? (visible / total) * 100 : 0;
    timelineEl.style.setProperty("--tl-progress", `${pct}%`);
  };
  updateTimelineProgress();
  window.addEventListener("scroll", updateTimelineProgress, { passive: true });
  window.addEventListener("resize", updateTimelineProgress);
}

// ============================================
// Scroll Reveals
// ============================================
let revealObserver = null;
function observeReveals() {
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
    return;
  }
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ============================================
// Animated Stats Counters
// ============================================
let counterObserver = null;
function observeCounters() {
  const counters = document.querySelectorAll(".stat-num");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counterObserver) counterObserver.disconnect();
  counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));
}

// ============================================
// Project Architecture Diagrams (Hover / Click)
// ============================================
function attachDiagramHandlers() {
  const diagramCards = document.querySelectorAll(".project-card.has-diagram");
  const touchNoHover = window.matchMedia("(hover: none)").matches;

  const setDiagramOpen = (card, open) => {
    card.classList.toggle("is-diagram-open", open);
    card.setAttribute("aria-expanded", open ? "true" : "false");
  };

  diagramCards.forEach((card) => {
    if (touchNoHover) {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !card.classList.contains("is-diagram-open");
        diagramCards.forEach((other) => setDiagramOpen(other, other === card && willOpen));
      });
    } else {
      card.addEventListener("mouseenter", () => setDiagramOpen(card, true));
      card.addEventListener("mouseleave", () => setDiagramOpen(card, false));
      card.addEventListener("focusin", () => setDiagramOpen(card, true));
      card.addEventListener("focusout", (e) => {
        if (!card.contains(e.relatedTarget)) setDiagramOpen(card, false);
      });
    }
  });

  if (touchNoHover) {
    document.addEventListener("click", () => {
      diagramCards.forEach((card) => setDiagramOpen(card, false));
    });
  }
}

// Copy Email Clipboard helper
function copyContactEmail() {
  const email = (portfolioData && portfolioData.profile && portfolioData.profile.email) || "kaifzakey22@gmail.com";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(() => {
      const copyText = document.getElementById("bentoCopyText");
      const copyBtn = document.getElementById("bentoCopyBtn");
      if (copyText) copyText.textContent = "Copied! ✓";
      if (copyBtn) copyBtn.style.borderColor = "var(--accent)";
      setTimeout(() => {
        if (copyText) copyText.textContent = "Copy Email";
        if (copyBtn) copyBtn.style.borderColor = "";
      }, 2200);
    }).catch(() => {
      window.location.href = `mailto:${email}`;
    });
  } else {
    window.location.href = `mailto:${email}`;
  }
}

// ============================================
// Modern Mobile Navigation Drawer & Touch Handlers
// ============================================
function initMobileNav() {
  const toggleBtn = document.getElementById("mobileNavToggle");
  const drawer = document.getElementById("mobileNavDrawer");
  const backdrop = document.getElementById("mobileNavBackdrop");
  const closeBtn = document.getElementById("mobileNavClose");

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggleBtn.classList.add("is-active");
    toggleBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggleBtn.classList.remove("is-active");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  toggleBtn.addEventListener("click", () => {
    if (drawer.classList.contains("is-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  drawer.querySelectorAll(".mobile-nav-link, .mobile-avail-pill, .mobile-resume-btn, .mobile-cta-btn").forEach((link) => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });

  // Touch expansion for certifications
  const certsBlock = document.querySelector(".cred-block--certs");
  const certBadge = document.querySelector(".cred-expand-badge");
  if (certsBlock) {
    certsBlock.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // let link clicks work
      certsBlock.classList.toggle("is-expanded");
    });
  }
}

// Initial Run
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".chips[data-chips]").forEach(renderChips);
  attachDiagramHandlers();
  observeReveals();
  observeCounters();
  initMobileNav();
  fitHeroWordmark();
  loadPortfolio();
});
