// ============================================
// Kaif Zaki Portfolio Admin Portal Engine
// ============================================

let portfolioData = null;
let currentTab = "dashboard";

// Toast Notification
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === "success" 
        ? '<polyline points="20 6 9 17 4 12"/>' 
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Universal Image & GIF Uploader to public/assets folder
async function handleFileUpload(event, targetInputId, previewImgId = null) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  showToast(`Uploading ${file.name} to assets folder...`);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    if (res.ok && result.success) {
      if (targetInputId) {
        const inp = document.getElementById(targetInputId);
        if (inp) {
          inp.value = result.url;
          inp.dispatchEvent(new Event('input'));
        }
        if (targetInputId === 'profResumeUrl') {
          const dl = document.getElementById('profResumeDownloadLink');
          if (dl) dl.href = result.url;
        }
      }
      if (previewImgId) {
        const img = document.getElementById(previewImgId);
        if (img) img.src = result.url;
      }
      showToast(`Saved to ${result.url}! Remember to click Save.`, 'success');
      scanUnusedAssets();
    } else {
      showToast(result.error || 'Upload failed', 'error');
    }
  } catch (err) {
    showToast('Upload error: ' + err.message, 'error');
  } finally {
    event.target.value = '';
  }
}

// Check Authentication Status
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/status");
    const data = await res.json();
    if (data.authenticated) {
      document.getElementById("loginView").style.display = "none";
      document.getElementById("adminApp").style.display = "flex";
      loadPortfolioData();
      scanUnusedAssets();
    } else {
      document.getElementById("loginView").style.display = "flex";
      document.getElementById("adminApp").style.display = "none";
    }
  } catch (err) {
    document.getElementById("loginView").style.display = "flex";
    document.getElementById("adminApp").style.display = "none";
  }
}

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Signed in successfully!");
      checkAuth();
    } else {
      showToast(data.error || "Login failed", "error");
    }
  } catch (err) {
    showToast("Network error during login", "error");
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  showToast("Logged out successfully");
  checkAuth();
});

// Tab Switching
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.id === `tab-${tabId}`);
  });
  if (tabId === "profile" || tabId === "dashboard") {
    scanUnusedAssets();
  }
}

document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// Load Portfolio Data
async function loadPortfolioData() {
  try {
    const res = await fetch("/api/portfolio");
    if (res.ok) {
      portfolioData = await res.json();
      populateAllTabs();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || "Database connection error. Please check .env credentials.", "error");
    }
  } catch (err) {
    showToast("Failed to fetch portfolio data: " + err.message, "error");
  }
}

// Save Portfolio Data
async function savePortfolio(silent = false) {
  try {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(portfolioData)
    });
    const result = await res.json();
    if (res.ok && result.success) {
      if (!silent) showToast("Portfolio updated successfully!");
      populateAllTabs();
      scanUnusedAssets();
      return true;
    } else {
      showToast(result.error || "Save failed", "error");
    }
  } catch (err) {
    showToast("Network error while saving", "error");
  }
  return false;
}

// Populate UI Fields
function populateAllTabs() {
  if (!portfolioData) return;
  const { profile, stats, experience, projects, skillCategories, certifications, education, series, availability } = portfolioData;

  // 1. Dashboard counts
  document.getElementById("dashProjectsCount").textContent = (projects || []).length;
  document.getElementById("dashExpCount").textContent = (experience || []).length;
  document.getElementById("dashSkillsCount").textContent = (skillCategories || []).length;
  document.getElementById("dashCertsCount").textContent = (certifications || []).length;

  const quickToggle = document.getElementById("quickAvailToggle");
  const quickLabel = document.getElementById("quickAvailLabel");
  if (quickToggle && availability) {
    quickToggle.checked = !!availability.openToWork;
    quickLabel.textContent = `Open to Work: ${availability.openToWork ? 'Active' : 'Inactive'}`;
  }

  // 2. Profile tab
  if (profile) {
    document.getElementById("profName").value = profile.name || "";
    document.getElementById("profShortName").value = profile.shortName || "";
    document.getElementById("profTitle").value = profile.title || "";
    document.getElementById("profHeroTagline").value = profile.heroTagline || "";
    document.getElementById("profHeroSub").value = profile.heroSub || "";
    document.getElementById("profWatermark").value = profile.watermark || "";
    document.getElementById("profLocation").value = profile.location || "";
    document.getElementById("profEmail").value = profile.email || "";
    document.getElementById("profPhone").value = profile.phone || "";
    document.getElementById("profGithub").value = profile.github || "";
    document.getElementById("profGithubHandle").value = profile.githubHandle || "";
    document.getElementById("profLinkedin").value = profile.linkedin || "";
    document.getElementById("profLinkedinHandle").value = profile.linkedinHandle || "";
    document.getElementById("profResumeUrl").value = profile.resumeUrl || "";
    const resumeDownloadLink = document.getElementById("profResumeDownloadLink");
    if (resumeDownloadLink) resumeDownloadLink.href = profile.resumeUrl || "/assets/Kaif_Zaki_Resume.pdf";
    document.getElementById("profAboutHeadline").value = profile.aboutHeadline || "";
    document.getElementById("profBioP1").value = profile.bioParagraph1 || "";
    document.getElementById("profBioP2").value = profile.bioParagraph2 || "";
    const aboutImgInp = document.getElementById("profAboutImage");
    const aboutImgPrev = document.getElementById("aboutImgPreview");
    if (aboutImgInp) aboutImgInp.value = profile.aboutImage || "/assets/about-developer.gif";
    if (aboutImgPrev) aboutImgPrev.src = profile.aboutImage || "/assets/about-developer.gif";
  }

  // 3. Stats Editor
  renderStatsEditor(stats || []);

  // 4. Experience
  renderExperienceList(experience || []);

  // 5. Projects
  renderProjectsList(projects || []);

  // 6. Skills
  renderSkillsList(skillCategories || []);

  // 7. Certs & Edu
  renderCertsList(certifications || []);
  renderEduList(education || []);

  // 8. Series
  renderSeriesList(series || []);

  // 9. Availability
  if (availability) {
    document.getElementById("availOpenToWork").checked = !!availability.openToWork;
    document.getElementById("availBadgeText").value = availability.badgeText || "";
    document.getElementById("availEngagement").value = availability.engagement || "";
    document.getElementById("availTargetRoles").value = availability.targetRoles || "";
    document.getElementById("availLocation").value = availability.location || "";
    document.getElementById("availWorkMode").value = availability.workMode || "";
    document.getElementById("availSubtext").value = availability.subtext || "";
  }
}

// Quick availability toggle on dashboard
document.getElementById("quickAvailToggle").addEventListener("change", async (e) => {
  if (!portfolioData.availability) portfolioData.availability = {};
  portfolioData.availability.openToWork = e.target.checked;
  document.getElementById("quickAvailLabel").textContent = `Open to Work: ${e.target.checked ? 'Active' : 'Inactive'}`;
  await savePortfolio(true);
  showToast(`Availability status set to ${e.target.checked ? 'OPEN' : 'INACTIVE'}`);
});

// Save Profile Section
async function saveProfileSection() {
  if (!portfolioData.profile) portfolioData.profile = {};
  const p = portfolioData.profile;
  p.name = document.getElementById("profName").value;
  p.shortName = document.getElementById("profShortName").value;
  p.title = document.getElementById("profTitle").value;
  p.heroTagline = document.getElementById("profHeroTagline").value;
  p.heroSub = document.getElementById("profHeroSub").value;
  p.watermark = document.getElementById("profWatermark").value;
  p.location = document.getElementById("profLocation").value;
  p.email = document.getElementById("profEmail").value;
  p.phone = document.getElementById("profPhone").value;
  p.github = document.getElementById("profGithub").value;
  p.githubHandle = document.getElementById("profGithubHandle").value;
  p.linkedin = document.getElementById("profLinkedin").value;
  p.linkedinHandle = document.getElementById("profLinkedinHandle").value;
  p.resumeUrl = document.getElementById("profResumeUrl").value;
  await savePortfolio();
}

// Save About & Stats Section
async function saveAboutSection() {
  if (!portfolioData.profile) portfolioData.profile = {};
  portfolioData.profile.aboutHeadline = document.getElementById("profAboutHeadline").value;
  portfolioData.profile.bioParagraph1 = document.getElementById("profBioP1").value;
  portfolioData.profile.bioParagraph2 = document.getElementById("profBioP2").value;
  const aboutImgInp = document.getElementById("profAboutImage");
  if (aboutImgInp) {
    portfolioData.profile.aboutImage = aboutImgInp.value.trim() || "/assets/about-developer.gif";
  }

  // Collect stats
  const statItems = document.querySelectorAll(".stat-edit-item");
  portfolioData.stats = Array.from(statItems).map((item) => ({
    count: parseInt(item.querySelector(".stat-count-input").value, 10) || 0,
    unit: item.querySelector(".stat-unit-input").value,
    label: item.querySelector(".stat-label-input").value
  }));

  await savePortfolio();
}

function renderStatsEditor(stats) {
  const container = document.getElementById("statsEditorList");
  container.innerHTML = "";
  stats.forEach((s, idx) => {
    const div = document.createElement("div");
    div.className = "stat-edit-item form-grid form-grid--3";
    div.style.marginBottom = "14px";
    div.innerHTML = `
      <div class="form-group">
        <label>Number (Target Count)</label>
        <input type="number" class="stat-count-input" value="${s.count}">
      </div>
      <div class="form-group">
        <label>Unit / Suffix (+, %, etc.)</label>
        <input type="text" class="stat-unit-input" value="${s.unit || ''}">
      </div>
      <div class="form-group">
        <label>Description Label</label>
        <input type="text" class="stat-label-input" value="${s.label || ''}">
      </div>
    `;
    container.appendChild(div);
  });
}

// Experience List
function renderExperienceList(list) {
  const container = document.getElementById("experienceList");
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = `<p style="color:var(--text-muted)">No experience entries yet.</p>`;
    return;
  }

  list.forEach((exp, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    const bulletsHtml = (exp.bullets || []).map((b) => `<li style="color:var(--text-muted);font-size:0.88rem;margin-bottom:4px;">${b}</li>`).join("");

    card.innerHTML = `
      <div class="item-head">
        <div>
          <div class="item-title">${exp.role}</div>
          <div class="item-subtitle">${exp.company} ${exp.location ? '· ' + exp.location : ''} (${exp.period})</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditExpModal(${index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteExperience(${index})">Delete</button>
        </div>
      </div>
      <ul style="padding-left:18px;list-style:disc;">${bulletsHtml}</ul>
    `;
    container.appendChild(card);
  });
}

function openAddExpModal() {
  openExpModal();
}

function openEditExpModal(index) {
  openExpModal(portfolioData.experience[index], index);
}

function openExpModal(exp = null, index = null) {
  const isEdit = index !== null;
  document.getElementById("modalTitle").textContent = isEdit ? "Edit Experience Role" : "Add Experience Role";
  const body = document.getElementById("modalBody");
  const bullets = exp?.bullets ? exp.bullets.join("\n") : "";

  body.innerHTML = `
    <div class="form-grid form-grid--full">
      <div class="form-group">
        <label>Job Title / Role</label>
        <input type="text" id="mExpRole" value="${exp?.role || ''}" required placeholder="Junior Full Stack Developer">
      </div>
      <div class="form-group">
        <label>Company / Organization</label>
        <input type="text" id="mExpCompany" value="${exp?.company || ''}" required placeholder="Oncode Tech Solution (PVT) LTD">
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" id="mExpLocation" value="${exp?.location || ''}" placeholder="Jaffna">
      </div>
      <div class="form-group">
        <label>Period / Dates</label>
        <input type="text" id="mExpPeriod" value="${exp?.period || ''}" placeholder="03/2026 — Present">
      </div>
      <div class="form-group">
        <label>Bullet Points (One bullet per line)</label>
        <textarea id="mExpBullets" rows="5" placeholder="Engineered RESTful APIs with Spring Boot...">${bullets}</textarea>
      </div>
    </div>
  `;

  document.getElementById("modalSaveBtn").onclick = async () => {
    const role = document.getElementById("mExpRole").value.trim();
    const company = document.getElementById("mExpCompany").value.trim();
    if (!role || !company) return showToast("Role and Company are required", "error");

    const bulletsArray = document.getElementById("mExpBullets").value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newObj = {
      id: exp?.id || `exp_${Date.now()}`,
      role,
      company,
      location: document.getElementById("mExpLocation").value.trim(),
      period: document.getElementById("mExpPeriod").value.trim(),
      bullets: bulletsArray
    };

    if (!portfolioData.experience) portfolioData.experience = [];
    if (isEdit) {
      portfolioData.experience[index] = newObj;
    } else {
      portfolioData.experience.push(newObj);
    }
    await savePortfolio();
    closeModal();
  };

  openModal();
}

async function deleteExperience(index) {
  if (!confirm("Are you sure you want to delete this experience role?")) return;
  portfolioData.experience.splice(index, 1);
  await savePortfolio();
}

// Projects List
function renderProjectsList(list) {
  const container = document.getElementById("projectsList");
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = `<p style="color:var(--text-muted)">No projects yet.</p>`;
    return;
  }

  list.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-head">
        <div>
          <div class="item-title">${p.title} ${p.year ? `(${p.year})` : ''} ${p.isWide ? '<span class="admin-badge" style="margin-left:8px">Wide Card</span>' : ''}</div>
          <div class="item-subtitle">${p.tag || 'Project'}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditProjectModal(${index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject(${index})">Delete</button>
        </div>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:8px;">${p.description || ''}</p>
      <div style="font-size:0.8rem;color:var(--accent);margin-bottom:6px;">Tech Chips: <code>${p.chips || ''}</code></div>
      ${p.diagramUrl ? `<div style="font-size:0.78rem;color:var(--text-faint);margin-bottom:6px;">Diagram: ${p.diagramUrl}</div>` : ''}
      <div style="display:flex;gap:12px;font-size:0.82rem;flex-wrap:wrap;margin-top:6px;">
        ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" style="color:var(--accent);display:inline-flex;align-items:center;gap:4px;">📦 GitHub ↗</a>` : '<span style="color:var(--text-faint)">No GitHub link</span>'}
        ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" style="color:#00ffbe;display:inline-flex;align-items:center;gap:4px;">🌐 Live Demo ↗</a>` : '<span style="color:var(--text-faint)">No Live Demo link</span>'}
      </div>
    `;
    container.appendChild(card);
  });
}

function openAddProjectModal() { openProjectModal(); }
function openEditProjectModal(index) { openProjectModal(portfolioData.projects[index], index); }

function openProjectModal(proj = null, index = null) {
  const isEdit = index !== null;
  document.getElementById("modalTitle").textContent = isEdit ? "Edit Project" : "Add Project";
  const body = document.getElementById("modalBody");
  const outcomes = proj?.outcomes ? proj.outcomes.join("\n") : "";

  body.innerHTML = `
    <div class="form-grid form-grid--full">
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" id="mProjTitle" value="${proj?.title || ''}" required placeholder="Sri Lanka Railway Seat Booking System">
      </div>
      <div class="form-group">
        <label>Category Tag</label>
        <input type="text" id="mProjTag" value="${proj?.tag || ''}" placeholder="Distributed Logic & Booking Engine">
      </div>
      <div class="form-group">
        <label>Year</label>
        <input type="text" id="mProjYear" value="${proj?.year || '2026'}" placeholder="2026">
      </div>
      <div class="form-group">
        <label class="switch-label">
          <span>Wide 2-Column Showcase Card</span>
          <div class="switch">
            <input type="checkbox" id="mProjWide" ${proj?.isWide ? 'checked' : ''}>
            <span class="slider"></span>
          </div>
        </label>
      </div>
      <div class="form-group">
        <label>GitHub Repository URL</label>
        <div style="display:flex;align-items:center;gap:10px;">
          <input type="url" id="mProjGithub" value="${proj?.githubUrl || ''}" placeholder="https://github.com/Kaif-Zaki/your-repo">
        </div>
        <span style="font-size:0.75rem;color:var(--text-muted);">Direct link to source code on GitHub.</span>
      </div>
      <div class="form-group">
        <label>Live Preview / Hosted Demo URL</label>
        <div style="display:flex;align-items:center;gap:10px;">
          <input type="url" id="mProjLive" value="${proj?.liveUrl || ''}" placeholder="https://your-demo.com">
        </div>
        <span style="font-size:0.75rem;color:var(--text-muted);">Direct link to live running application or demo.</span>
      </div>
      <div class="form-group">
        <label>Description Overview</label>
        <textarea id="mProjDesc" rows="3" placeholder="Brief project summary...">${proj?.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Key Outcome Bullets (One per line)</label>
        <textarea id="mProjOutcomes" rows="4" placeholder="Segment allocation logic...\nPostgreSQL relational schema...">${outcomes}</textarea>
      </div>
      <div class="form-group">
        <label>Tech Chips (slug:Label format)</label>
        <input type="text" id="mProjChips" value="${proj?.chips || ''}" placeholder="postgresql:PostgreSQL,prisma:Prisma,docker:Docker">
      </div>
      <div class="form-group">
        <label>Architecture Diagram / Showcase GIF or Image</label>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
          <img id="projDiagramPreview" src="${proj?.diagramUrl || '/assets/diagram-railway.svg'}" alt="Diagram preview" style="width:90px;height:55px;border-radius:8px;object-fit:cover;border:1px solid var(--line);background:#090c10;">
          <input type="text" id="mProjDiagram" value="${proj?.diagramUrl || ''}" placeholder="/assets/diagram-railway.svg" style="flex:1;">
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">
            📁 Upload GIF / Image
            <input type="file" accept="image/*,.gif" style="display:none;" onchange="handleFileUpload(event, 'mProjDiagram', 'projDiagramPreview')">
          </label>
        </div>
        <span style="font-size:0.75rem;color:var(--text-muted);">Saved into <code>public/assets/</code> and path stored in database.</span>
      </div>
    </div>
  `;

  document.getElementById("modalSaveBtn").onclick = async () => {
    const title = document.getElementById("mProjTitle").value.trim();
    if (!title) return showToast("Title is required", "error");

    const outcomesArray = document.getElementById("mProjOutcomes").value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newObj = {
      id: proj?.id || `proj_${Date.now()}`,
      title,
      tag: document.getElementById("mProjTag").value.trim(),
      year: document.getElementById("mProjYear").value.trim(),
      isWide: document.getElementById("mProjWide").checked,
      githubUrl: document.getElementById("mProjGithub").value.trim(),
      liveUrl: document.getElementById("mProjLive").value.trim(),
      description: document.getElementById("mProjDesc").value.trim(),
      outcomes: outcomesArray,
      chips: document.getElementById("mProjChips").value.trim(),
      diagramUrl: document.getElementById("mProjDiagram").value.trim(),
      diagramAlt: title + " Architecture Diagram"
    };

    if (!portfolioData.projects) portfolioData.projects = [];
    if (isEdit) {
      portfolioData.projects[index] = newObj;
    } else {
      portfolioData.projects.push(newObj);
    }
    await savePortfolio();
    closeModal();
  };

  openModal();
}

async function deleteProject(index) {
  if (!confirm("Delete this project?")) return;
  portfolioData.projects.splice(index, 1);
  await savePortfolio();
}

// Skills Categories List
function renderSkillsList(list) {
  const container = document.getElementById("skillsList");
  container.innerHTML = "";
  list.forEach((sc, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-head">
        <div>
          <div class="item-title">${sc.title}</div>
          <div class="item-subtitle" style="word-break:break-all;">Chips: ${sc.chips || ''}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditSkillModal(${index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSkill(${index})">Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openAddSkillModal() { openSkillModal(); }
function openEditSkillModal(index) { openSkillModal(portfolioData.skillCategories[index], index); }

function openSkillModal(sc = null, index = null) {
  const isEdit = index !== null;
  document.getElementById("modalTitle").textContent = isEdit ? "Edit Skill Category" : "Add Skill Category";
  const body = document.getElementById("modalBody");

  body.innerHTML = `
    <div class="form-grid form-grid--full">
      <div class="form-group">
        <label>Category Title</label>
        <input type="text" id="mSkillTitle" value="${sc?.title || ''}" required placeholder="Frontend Engineering">
      </div>
      <div class="form-group">
        <label>Tech Chips (comma-separated, slug:Label)</label>
        <textarea id="mSkillChips" rows="3" placeholder="react:React,angular:Angular,tailwindcss:Tailwind CSS">${sc?.chips || ''}</textarea>
        <div class="input-hint">Icon slug corresponds to Simple Icons. Prefix with ':' for text badge without icon (e.g. <code>:REST APIs</code>).</div>
      </div>
    </div>
  `;

  document.getElementById("modalSaveBtn").onclick = async () => {
    const title = document.getElementById("mSkillTitle").value.trim();
    if (!title) return showToast("Category title required", "error");

    const newObj = {
      id: sc?.id || `sc_${Date.now()}`,
      title,
      icon: sc?.icon || '<circle cx="12" cy="12" r="8"/>',
      chips: document.getElementById("mSkillChips").value.trim()
    };

    if (!portfolioData.skillCategories) portfolioData.skillCategories = [];
    if (isEdit) {
      portfolioData.skillCategories[index] = newObj;
    } else {
      portfolioData.skillCategories.push(newObj);
    }
    await savePortfolio();
    closeModal();
  };

  openModal();
}

async function deleteSkill(index) {
  if (!confirm("Delete this skill category?")) return;
  portfolioData.skillCategories.splice(index, 1);
  await savePortfolio();
}

// Certs & Education
function renderCertsList(list) {
  const container = document.getElementById("certsList");
  container.innerHTML = "";
  if (!list || !list.length) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;">No certificates added yet.</p>`;
    return;
  }
  list.forEach((c, index) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "space-between";
    div.style.padding = "10px 0";
    div.style.borderBottom = "1px solid var(--line-soft)";
    div.style.gap = "12px";
    const hasLink = c.link && c.link.trim() !== "" && c.link.trim() !== "#";
    div.innerHTML = `
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;color:var(--text);">${c.title}</div>
        <div style="font-size:0.8rem;color:var(--text-faint);">${c.issuer || ''}</div>
        ${hasLink ? `<a href="${c.link}" target="_blank" style="font-size:0.75rem;color:var(--accent);text-decoration:none;display:inline-flex;align-items:center;gap:3px;margin-top:2px;">🔗 ${c.link} ↗</a>` : '<span style="font-size:0.75rem;color:var(--text-faint);">No verification link</span>'}
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button class="btn btn-ghost btn-sm" onclick="openEditCertModal(${index})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCert(${index})">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function openAddCertModal() {
  openCertModal();
}

function openEditCertModal(index) {
  openCertModal(portfolioData.certifications[index], index);
}

function openCertModal(cert = null, index = null) {
  const isEdit = index !== null;
  document.getElementById("modalTitle").textContent = isEdit ? "Edit Certification" : "Add Certification";
  const hasLink = cert?.link && cert.link !== "#";
  document.getElementById("modalBody").innerHTML = `
    <div class="form-grid form-grid--full">
      <div class="form-group">
        <label>Certificate Title</label>
        <input type="text" id="mCertTitle" value="${cert?.title || ''}" required placeholder="AI Engineer for Developers Associate">
      </div>
      <div class="form-group">
        <label>Issuer / Organization</label>
        <input type="text" id="mCertIssuer" value="${cert?.issuer || ''}" placeholder="DataCamp / Google / Scholar Hat">
      </div>
      <div class="form-group">
        <label>Certificate Link / Credential URL</label>
        <input type="url" id="mCertLink" value="${hasLink ? cert.link : ''}" placeholder="https://coursera.org/verify/... or https://datacamp.com/...">
        <span style="font-size:0.75rem;color:var(--text-muted);display:block;margin-top:4px;">
          Attach an online credential link, public verification URL, or badge. Leave blank if not available.
        </span>
      </div>
    </div>
  `;

  document.getElementById("modalSaveBtn").onclick = async () => {
    const title = document.getElementById("mCertTitle").value.trim();
    if (!title) return showToast("Title is required", "error");

    const linkVal = document.getElementById("mCertLink").value.trim();
    const certObj = {
      id: cert?.id || `cert_${Date.now()}`,
      title,
      issuer: document.getElementById("mCertIssuer").value.trim(),
      link: linkVal || "#"
    };

    if (!portfolioData.certifications) portfolioData.certifications = [];
    if (isEdit) {
      portfolioData.certifications[index] = certObj;
    } else {
      portfolioData.certifications.push(certObj);
    }
    await savePortfolio();
    closeModal();
  };

  openModal();
}

async function deleteCert(index) {
  portfolioData.certifications.splice(index, 1);
  await savePortfolio();
}

function renderEduList(list) {
  const container = document.getElementById("eduList");
  container.innerHTML = "";
  list.forEach((e, index) => {
    const div = document.createElement("div");
    div.style.padding = "14px 0";
    div.style.borderBottom = "1px solid var(--line-soft)";
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-weight:600;color:var(--text);">${e.degree}</div>
          <div style="font-size:0.85rem;color:var(--accent);">${e.institution} · ${e.period}</div>
          ${e.coursework ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${e.coursework}</div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteEdu(${index})">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function openAddEduModal() {
  document.getElementById("modalTitle").textContent = "Add Education";
  document.getElementById("modalBody").innerHTML = `
    <div class="form-grid form-grid--full">
      <div class="form-group">
        <label>Degree / Qualification</label>
        <input type="text" id="mEduDegree" required placeholder="Higher National Diploma in Software Engineering">
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" id="mEduInst" required placeholder="IJSE - Institute of Software Engineering">
      </div>
      <div class="form-group">
        <label>Period</label>
        <input type="text" id="mEduPeriod" placeholder="2023 — 2026">
      </div>
      <div class="form-group">
        <label>Relevant Coursework</label>
        <textarea id="mEduCoursework" rows="3" placeholder="OOP, Databases, DSA, Networks..."></textarea>
      </div>
    </div>
  `;
  document.getElementById("modalSaveBtn").onclick = async () => {
    const degree = document.getElementById("mEduDegree").value.trim();
    const inst = document.getElementById("mEduInst").value.trim();
    if (!degree || !inst) return showToast("Degree and Institution required", "error");
    portfolioData.education.push({
      degree,
      institution: inst,
      period: document.getElementById("mEduPeriod").value.trim(),
      coursework: document.getElementById("mEduCoursework").value.trim()
    });
    await savePortfolio();
    closeModal();
  };
  openModal();
}

async function deleteEdu(index) {
  portfolioData.education.splice(index, 1);
  await savePortfolio();
}

// Series List
function renderSeriesList(list) {
  const container = document.getElementById("seriesList");
  container.innerHTML = "";
  list.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-head">
        <div style="display:flex;align-items:center;gap:14px;">
          <img src="${item.image || '/assets/series-microservices.gif'}" alt="${item.title}" style="width:68px;height:44px;border-radius:6px;object-fit:cover;border:1px solid var(--line);background:#090c10;">
          <div>
            <div class="item-title">${item.title}</div>
            <div class="item-subtitle">${item.tag || 'Series'} · <span style="font-size:0.75rem;color:var(--text-faint);">${item.image || ''}</span></div>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditSeriesModal(${index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSeries(${index})">Delete</button>
        </div>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-top:8px;">${item.description || ''}</p>
    `;
    container.appendChild(card);
  });
}

function openAddSeriesModal() { openSeriesModal(); }
function openEditSeriesModal(index) { openSeriesModal(portfolioData.series[index], index); }

function openSeriesModal(item = null, index = null) {
  const isEdit = index !== null;
  document.getElementById("modalTitle").textContent = isEdit ? "Edit Series Deep Dive" : "Add Series Deep Dive";
  document.getElementById("modalBody").innerHTML = `
    <div class="form-grid form-grid--full">
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="mSeriesTitle" value="${item?.title || ''}" required placeholder="Scalable Microservices with Spring Boot & Docker">
      </div>
      <div class="form-group">
        <label>Tag / Category</label>
        <input type="text" id="mSeriesTag" value="${item?.tag || ''}" placeholder="Architecture & Cloud">
      </div>
      <div class="form-group">
        <label>Description Overview</label>
        <textarea id="mSeriesDesc" rows="3" placeholder="Deep dive explanation...">${item?.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Banner Image / Animated GIF</label>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
          <img id="seriesImgPreview" src="${item?.image || '/assets/series-microservices.gif'}" alt="Preview" style="width:90px;height:55px;border-radius:8px;object-fit:cover;border:1px solid var(--line);background:#090c10;">
          <input type="text" id="mSeriesImg" value="${item?.image || '/assets/series-microservices.gif'}" placeholder="/assets/series-microservices.gif" style="flex:1;">
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">
            📁 Upload GIF / Image
            <input type="file" accept="image/*,.gif" style="display:none;" onchange="handleFileUpload(event, 'mSeriesImg', 'seriesImgPreview')">
          </label>
        </div>
        <span style="font-size:0.75rem;color:var(--text-muted);">Saves directly into the <code>assets</code> folder and stores the path in the database.</span>
      </div>
      <div class="form-group">
        <label>Read More CTA Text</label>
        <input type="text" id="mSeriesCta" value="${item?.cta || 'Explore architecture →'}" placeholder="Explore architecture →">
      </div>
      <div class="form-group">
        <label>Destination Link (URL or Anchor)</label>
        <input type="text" id="mSeriesLink" value="${item?.link || '#projects'}" placeholder="#projects">
      </div>
    </div>
  `;

  document.getElementById("modalSaveBtn").onclick = async () => {
    const title = document.getElementById("mSeriesTitle").value.trim();
    if (!title) return showToast("Title is required", "error");

    const newObj = {
      id: item?.id || `s_${Date.now()}`,
      title,
      tag: document.getElementById("mSeriesTag").value.trim(),
      description: document.getElementById("mSeriesDesc").value.trim(),
      image: document.getElementById("mSeriesImg").value.trim() || "/assets/series-microservices.gif",
      link: document.getElementById("mSeriesLink").value.trim() || "#projects",
      cta: document.getElementById("mSeriesCta").value.trim() || "Explore architecture →"
    };

    if (!portfolioData.series) portfolioData.series = [];
    if (isEdit) {
      portfolioData.series[index] = newObj;
    } else {
      portfolioData.series.push(newObj);
    }
    await savePortfolio();
    closeModal();
  };

  openModal();
}

async function deleteSeries(index) {
  portfolioData.series.splice(index, 1);
  await savePortfolio();
}

// Save Availability Section
async function saveAvailabilitySection() {
  if (!portfolioData.availability) portfolioData.availability = {};
  const a = portfolioData.availability;
  a.openToWork = document.getElementById("availOpenToWork").checked;
  a.badgeText = document.getElementById("availBadgeText").value.trim();
  a.engagement = document.getElementById("availEngagement").value.trim();
  a.targetRoles = document.getElementById("availTargetRoles").value.trim();
  a.location = document.getElementById("availLocation").value.trim();
  a.workMode = document.getElementById("availWorkMode").value.trim();
  a.subtext = document.getElementById("availSubtext").value.trim();
  await savePortfolio();
}

// Change Password
document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const currentPassword = document.getElementById("currPassword").value;
  const newUsername = document.getElementById("newUsername").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newUsername, newPassword })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showToast("Credentials updated successfully!");
      document.getElementById("changePasswordForm").reset();
    } else {
      showToast(result.error || "Update failed", "error");
    }
  } catch (err) {
    showToast("Network error", "error");
  }
});

// Export Backup
function exportPortfolioJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `kaif-zaki-portfolio-backup-${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
  showToast("Portfolio backup JSON downloaded");
}

// Trigger Import
function triggerImportJSON() {
  document.getElementById("importFileInput").click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && parsed.profile) {
        portfolioData = parsed;
        await savePortfolio();
        showToast("Backup imported successfully!");
      } else {
        showToast("Invalid portfolio backup file", "error");
      }
    } catch (err) {
      showToast("Error parsing JSON file", "error");
    }
  };
  reader.readAsText(file);
}

// Reset to Defaults
async function resetToDefaults() {
  if (!confirm("DANGER: This will reset all portfolio data back to Kaif Zaki's original resume details. Continue?")) return;
  try {
    const res = await fetch("/api/portfolio/reset", { method: "POST" });
    const result = await res.json();
    if (res.ok && result.success) {
      portfolioData = result.data;
      populateAllTabs();
      showToast("Portfolio reset to original resume defaults!");
    } else {
      showToast(result.error || "Reset failed", "error");
    }
  } catch (err) {
    showToast("Network error during reset", "error");
  }
}

// Modal Controls
function openModal() {
  document.getElementById("modalOverlay").classList.add("active");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
}

// Close on outside click
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "modalOverlay") closeModal();
});

// Init on load
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});

// ============================================
// ASSET STORAGE & UNUSED FILE MANAGEMENT
// ============================================
let currentAssetAnalysis = null;

async function scanUnusedAssets() {
  const statusEl = document.getElementById("unusedFilesStatusSummary");
  if (statusEl) statusEl.textContent = "Scanning public/assets directory...";

  try {
    const res = await fetch("/api/assets/analysis");
    if (!res.ok) {
      if (res.status === 401) return; // not logged in yet
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Analysis failed");
    }

    currentAssetAnalysis = data.analysis || data;
    const a = currentAssetAnalysis;

    const unusedMediaCount = a.unusedMediaCount || 0;
    const unusedMediaSize = a.unusedMediaFormatted || a.unusedMediaSizeFormatted || "0 B";
    const unusedPdfCount = a.unusedPdfCount || 0;
    const unusedPdfSize = a.unusedPdfFormatted || a.unusedPdfSizeFormatted || "0 B";
    const unusedTotalCount = a.unusedTotalCount !== undefined ? a.unusedTotalCount : (unusedMediaCount + unusedPdfCount);
    const unusedTotalSize = a.unusedTotalFormatted || a.unusedTotalSizeFormatted || "0 B";
    const totalFilesCount = a.totalFiles || 0;
    const totalDiskSize = a.totalFormatted || a.totalSizeFormatted || "0 B";
    const usedCount = a.usedCount || 0;

    // Update counters
    const mediaCountEl = document.getElementById("unusedMediaCount");
    const mediaSizeEl = document.getElementById("unusedMediaSize");
    const pdfCountEl = document.getElementById("unusedPdfCount");
    const pdfSizeEl = document.getElementById("unusedPdfSize");
    const activeDbCountEl = document.getElementById("activeDbAssetsCount");
    const totalAssetsSizeEl = document.getElementById("totalAssetsSize");

    if (mediaCountEl) mediaCountEl.textContent = `${unusedMediaCount} ${unusedMediaCount === 1 ? 'file' : 'files'}`;
    if (mediaSizeEl) mediaSizeEl.textContent = `${unusedMediaSize} unused`;

    if (pdfCountEl) pdfCountEl.textContent = `${unusedPdfCount} ${unusedPdfCount === 1 ? 'file' : 'files'}`;
    if (pdfSizeEl) pdfSizeEl.textContent = `${unusedPdfSize} unused`;

    if (activeDbCountEl) activeDbCountEl.textContent = `${usedCount} active`;
    if (totalAssetsSizeEl) totalAssetsSizeEl.textContent = `${totalDiskSize} total disk (${totalFilesCount} files)`;

    // Update action buttons state
    const btnMedia = document.getElementById("btnDeleteUnusedMedia");
    const btnPdf = document.getElementById("btnDeleteUnusedPdfs");
    const btnAll = document.getElementById("btnDeleteAllUnused");

    if (btnMedia) {
      btnMedia.disabled = unusedMediaCount === 0;
      btnMedia.style.opacity = unusedMediaCount === 0 ? "0.45" : "1";
      btnMedia.style.cursor = unusedMediaCount === 0 ? "not-allowed" : "pointer";
    }
    if (btnPdf) {
      btnPdf.disabled = unusedPdfCount === 0;
      btnPdf.style.opacity = unusedPdfCount === 0 ? "0.45" : "1";
      btnPdf.style.cursor = unusedPdfCount === 0 ? "not-allowed" : "pointer";
    }
    if (btnAll) {
      btnAll.disabled = unusedTotalCount === 0;
      btnAll.style.opacity = unusedTotalCount === 0 ? "0.45" : "1";
      btnAll.style.cursor = unusedTotalCount === 0 ? "not-allowed" : "pointer";
    }

    // Render list
    const listEl = document.getElementById("unusedFilesList");
    if (statusEl) {
      if (unusedTotalCount === 0) {
        statusEl.textContent = "All Clean • 0 unused files";
      } else {
        statusEl.textContent = `${unusedTotalCount} unused file${unusedTotalCount > 1 ? 's' : ''} (${unusedTotalSize})`;
      }
    }

    if (listEl) {
      if (unusedTotalCount === 0) {
        listEl.innerHTML = `
          <div class="cleanup-empty-box">
            <span style="color:var(--accent);font-size:1.15rem;display:block;margin-bottom:6px;font-weight:600;">✨ All Assets Clean &amp; Optimized!</span>
            No unused images, GIFs, or PDFs found in <code>public/assets</code>. All current assets match active database records or core system files.
          </div>
        `;
      } else {
        const allUnused = [...(a.unusedMedia || []), ...(a.unusedPdfs || [])];
        listEl.innerHTML = allUnused.map(f => {
          const isPdf = f.isPdf;
          const badgeClass = isPdf ? 'unused-badge--pdf' : 'unused-badge--media';
          const badgeText = isPdf ? 'PDF' : (f.isGif ? 'GIF' : 'IMAGE');
          const thumbHtml = isPdf 
            ? `<div class="unused-file-pdf-icon">PDF</div>`
            : `<img src="${f.relativeUrl || f.url}" class="unused-file-thumb" alt="${f.filename}" onerror="this.src='/assets/hero-visual.gif'">`;

          const fileUrl = f.relativeUrl || f.url;

          return `
            <div class="unused-file-item">
              ${thumbHtml}
              <div class="unused-file-details">
                <div class="unused-file-name">${f.filename}</div>
                <div class="unused-file-meta">
                  <span class="unused-badge ${badgeClass}">${badgeText}</span>
                  <span>${f.sizeFormatted}</span>
                  <span style="color:var(--text-faint);">${fileUrl}</span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <a href="${fileUrl}" target="_blank" class="btn btn-ghost btn-sm" style="padding:5px 10px;font-size:0.75rem;">Preview</a>
                <button type="button" class="btn btn-danger btn-sm" style="padding:5px 10px;font-size:0.75rem;" onclick="deleteUnusedAssets('single', '${f.filename}')">🗑️ Delete</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = "Error scanning assets: " + err.message;
  }
}

async function deleteUnusedAssets(type, filename = null) {
  const a = currentAssetAnalysis || {};
  let promptMsg = "";
  if (type === "media") {
    const count = a.unusedMediaCount ?? 0;
    const size = a.unusedMediaFormatted || a.unusedMediaSizeFormatted || "";
    if (count === 0) {
      showToast("No unused images or GIFs to delete.", "info");
      return;
    }
    promptMsg = `Are you sure you want to permanently delete all ${count} unused Image and GIF file(s) (${size}) from public/assets?`;
  } else if (type === "pdf") {
    const count = a.unusedPdfCount ?? 0;
    const size = a.unusedPdfFormatted || a.unusedPdfSizeFormatted || "";
    if (count === 0) {
      showToast("No unused PDF documents to delete.", "info");
      return;
    }
    promptMsg = `Are you sure you want to permanently delete all ${count} unused PDF file(s) (${size}) from public/assets?`;
  } else if (type === "all") {
    const count = a.unusedTotalCount ?? ((a.unusedMediaCount || 0) + (a.unusedPdfCount || 0));
    const size = a.unusedTotalFormatted || a.unusedTotalSizeFormatted || "";
    if (count === 0) {
      showToast("No unused assets found to clean.", "info");
      return;
    }
    promptMsg = `Are you sure you want to permanently delete ALL ${count} unused file(s) (${size}) from public/assets?`;
  } else if (type === "single" && filename) {
    promptMsg = `Are you sure you want to permanently delete unused file "${filename}"?`;
  }

  if (promptMsg && !confirm(promptMsg)) {
    return;
  }

  showToast(`Deleting unused ${type === 'pdf' ? 'PDFs' : type === 'media' ? 'images & GIFs' : 'assets'}...`);

  try {
    const res = await fetch("/api/assets/delete-unused", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, filename })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showToast(result.message || "Cleanup complete!", "success");
      await scanUnusedAssets();
    } else {
      showToast(result.error || "Failed to delete files", "error");
    }
  } catch (err) {
    showToast("Error deleting assets: " + err.message, "error");
  }
}
