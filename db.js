const fs = require('fs');
const path = require('path');
require('dotenv').config();

if (!process.env.DB_PASSWORD && fs.existsSync(path.join(__dirname, '.env.production'))) {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
}

const mysql = require('mysql2/promise');

const DB_TYPE = (process.env.DB_TYPE || 'mysql').toLowerCase();
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'kaif_portfolio_db';

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

// Test Connection & check if tables exist
async function testConnection() {
  try {
    const conn = await getPool().getConnection();
    conn.release();
    return { ok: true, message: `Connected to MySQL database "${DB_NAME}" at ${DB_HOST}:${DB_PORT}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Helper to safely parse JSON columns
function parseJson(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// Fetch Full Portfolio Data from Database
async function getPortfolioData() {
  const p = getPool();
  try {
    // 1. Profile
    const [profileRows] = await p.query('SELECT * FROM `profile` WHERE `id` = 1 LIMIT 1');
    const prof = profileRows[0] || {};
    const profile = {
      name: prof.name || '',
      shortName: prof.short_name || '',
      title: prof.title || '',
      tagline: prof.tagline || '',
      heroTagline: prof.hero_tagline || '',
      heroSub: prof.hero_sub || '',
      watermark: prof.watermark || '',
      aboutImage: prof.about_image || '/assets/about-developer.gif',
      aboutHeadline: prof.about_headline || '',
      bioParagraph1: prof.bio_paragraph_1 || '',
      bioParagraph2: prof.bio_paragraph_2 || '',
      email: prof.email || '',
      phone: prof.phone || '',
      location: prof.location || '',
      github: prof.github || '',
      githubHandle: prof.github_handle || '',
      linkedin: prof.linkedin || '',
      linkedinHandle: prof.linkedin_handle || '',
      resumeUrl: prof.resume_url || ''
    };

    // 2. Stats
    const [statRows] = await p.query('SELECT * FROM `stats` ORDER BY `order_idx` ASC, `id` ASC');
    const stats = statRows.map(s => ({
      id: s.id,
      count: s.count_num,
      unit: s.unit || '',
      label: s.label
    }));

    // 3. Marquee Tools
    const [marqueeRows] = await p.query('SELECT * FROM `marquee_tools` ORDER BY `order_idx` ASC, `id` ASC');
    const marqueeTools = marqueeRows.map(m => [m.slug, m.label]);

    // 4. Series
    const [seriesRows] = await p.query('SELECT * FROM `series` ORDER BY `order_idx` ASC, `id` ASC');
    const series = seriesRows.map(s => ({
      id: s.id,
      tag: s.tag,
      title: s.title,
      description: s.description,
      image: s.image,
      link: s.link,
      cta: s.cta
    }));

    // 5. Skill Categories
    const [skillRows] = await p.query('SELECT * FROM `skill_categories` ORDER BY `order_idx` ASC, `id` ASC');
    const skillCategories = skillRows.map(sc => ({
      id: sc.id,
      title: sc.title,
      icon: sc.icon_svg,
      chips: sc.chips
    }));

    // 6. Experience
    const [expRows] = await p.query('SELECT * FROM `experience` ORDER BY `order_idx` ASC, `id` ASC');
    const experience = expRows.map(e => ({
      id: e.id,
      role: e.role,
      company: e.company,
      location: e.location,
      period: e.period,
      bullets: parseJson(e.bullets, [])
    }));

    // 7. Projects
    const [projRows] = await p.query('SELECT * FROM `projects` ORDER BY `order_idx` ASC, `id` ASC');
    const projects = projRows.map(pr => ({
      id: pr.id,
      title: pr.title,
      tag: pr.tag,
      year: pr.year,
      isWide: !!pr.is_wide,
      description: pr.description,
      outcomes: parseJson(pr.outcomes, []),
      chips: pr.chips,
      diagramUrl: pr.diagram_url,
      diagramAlt: pr.diagram_alt,
      githubUrl: pr.github_url || '',
      liveUrl: pr.live_url || ''
    }));

    // 8. Certifications
    const [certRows] = await p.query('SELECT * FROM `certifications` ORDER BY `order_idx` ASC, `id` ASC');
    const certifications = certRows.map(c => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      link: c.link
    }));

    // 9. Education
    const [eduRows] = await p.query('SELECT * FROM `education` ORDER BY `order_idx` ASC, `id` ASC');
    const education = eduRows.map(ed => ({
      id: ed.id,
      degree: ed.degree,
      institution: ed.institution,
      period: ed.period,
      coursework: ed.coursework
    }));

    // 10. Availability
    const [availRows] = await p.query('SELECT * FROM `availability` WHERE `id` = 1 LIMIT 1');
    const av = availRows[0] || {};
    const availability = {
      openToWork: !!av.open_to_work,
      badgeText: av.badge_text || 'Open to work',
      engagement: av.engagement || 'Full-time · contract · freelance',
      targetRoles: av.target_roles || '',
      location: av.location || '',
      workMode: av.work_mode || '',
      subtext: av.subtext || ''
    };

    return {
      profile,
      stats,
      marqueeTools,
      series,
      skillCategories,
      experience,
      projects,
      certifications,
      education,
      availability
    };
  } catch (err) {
    console.error('Error fetching portfolio data from DB:', err.message);
    throw err;
  }
}

// Save Full Portfolio Data to Database
async function savePortfolioData(data) {
  const p = getPool();
  const conn = await p.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Profile
    if (data.profile) {
      const pr = data.profile;
      await conn.query(`
        INSERT INTO \`profile\` (
          \`id\`, \`name\`, \`short_name\`, \`title\`, \`tagline\`, \`hero_tagline\`, \`hero_sub\`,
          \`watermark\`, \`about_image\`, \`about_headline\`, \`bio_paragraph_1\`, \`bio_paragraph_2\`,
          \`email\`, \`phone\`, \`location\`, \`github\`, \`github_handle\`, \`linkedin\`, \`linkedin_handle\`, \`resume_url\`
        ) VALUES (
          1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        ) ON DUPLICATE KEY UPDATE
          \`name\`=VALUES(\`name\`),
          \`short_name\`=VALUES(\`short_name\`),
          \`title\`=VALUES(\`title\`),
          \`tagline\`=VALUES(\`tagline\`),
          \`hero_tagline\`=VALUES(\`hero_tagline\`),
          \`hero_sub\`=VALUES(\`hero_sub\`),
          \`watermark\`=VALUES(\`watermark\`),
          \`about_image\`=VALUES(\`about_image\`),
          \`about_headline\`=VALUES(\`about_headline\`),
          \`bio_paragraph_1\`=VALUES(\`bio_paragraph_1\`),
          \`bio_paragraph_2\`=VALUES(\`bio_paragraph_2\`),
          \`email\`=VALUES(\`email\`),
          \`phone\`=VALUES(\`phone\`),
          \`location\`=VALUES(\`location\`),
          \`github\`=VALUES(\`github\`),
          \`github_handle\`=VALUES(\`github_handle\`),
          \`linkedin\`=VALUES(\`linkedin\`),
          \`linkedin_handle\`=VALUES(\`linkedin_handle\`),
          \`resume_url\`=VALUES(\`resume_url\`)
      `, [
        pr.name || '', pr.shortName || '', pr.title || '', pr.tagline || '',
        pr.heroTagline || '', pr.heroSub || '', pr.watermark || '',
        pr.aboutImage || '/assets/about-developer.gif',
        pr.aboutHeadline || '', pr.bioParagraph1 || '', pr.bioParagraph2 || '',
        pr.email || '', pr.phone || '', pr.location || '',
        pr.github || '', pr.githubHandle || '', pr.linkedin || '', pr.linkedinHandle || '',
        pr.resumeUrl || ''
      ]);
    }

    // 2. Stats
    if (Array.isArray(data.stats)) {
      await conn.query('DELETE FROM `stats`');
      const seenStats = new Set();
      let sIdx = 1;
      for (let i = 0; i < data.stats.length; i++) {
        const s = data.stats[i];
        const key = (s.label || '').trim().toLowerCase();
        if (key && seenStats.has(key)) continue;
        if (key) seenStats.add(key);
        await conn.query(
          'INSERT INTO `stats` (`count_num`, `unit`, `label`, `order_idx`) VALUES (?, ?, ?, ?)',
          [s.count || 0, s.unit || '', s.label || '', sIdx++]
        );
      }
    }

    // 3. Marquee Tools
    if (Array.isArray(data.marqueeTools)) {
      await conn.query('DELETE FROM `marquee_tools`');
      const seenTools = new Set();
      let tIdx = 1;
      for (let i = 0; i < data.marqueeTools.length; i++) {
        const [slug, label] = data.marqueeTools[i];
        const key = (slug || label || '').trim().toLowerCase();
        if (key && seenTools.has(key)) continue;
        if (key) seenTools.add(key);
        await conn.query(
          'INSERT INTO `marquee_tools` (`slug`, `label`, `order_idx`) VALUES (?, ?, ?)',
          [slug, label, tIdx++]
        );
      }
    }

    // 4. Series
    if (Array.isArray(data.series)) {
      await conn.query('DELETE FROM `series`');
      const seenSeries = new Set();
      let serIdx = 1;
      for (let i = 0; i < data.series.length; i++) {
        const s = data.series[i];
        const key = (s.title || '').trim().toLowerCase();
        if (key && seenSeries.has(key)) continue;
        if (key) seenSeries.add(key);
        await conn.query(
          'INSERT INTO `series` (`tag`, `title`, `description`, `image`, `link`, `cta`, `order_idx`) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s.tag || '', s.title, s.description || '', s.image || '', s.link || '#projects', s.cta || 'Explore architecture →', serIdx++]
        );
      }
    }

    // 5. Skill Categories
    if (Array.isArray(data.skillCategories)) {
      await conn.query('DELETE FROM `skill_categories`');
      const seenCats = new Set();
      let scIdx = 1;
      for (let i = 0; i < data.skillCategories.length; i++) {
        const sc = data.skillCategories[i];
        const key = (sc.title || '').trim().toLowerCase();
        if (key && seenCats.has(key)) continue;
        if (key) seenCats.add(key);
        await conn.query(
          'INSERT INTO `skill_categories` (`title`, `icon_svg`, `chips`, `order_idx`) VALUES (?, ?, ?, ?)',
          [sc.title, sc.icon || '', sc.chips || '', scIdx++]
        );
      }
    }

    // 6. Experience
    if (Array.isArray(data.experience)) {
      await conn.query('DELETE FROM `experience`');
      const seenExp = new Set();
      let expIdx = 1;
      for (let i = 0; i < data.experience.length; i++) {
        const exp = data.experience[i];
        const key = (exp.role + '|' + exp.company).trim().toLowerCase();
        if (key && seenExp.has(key)) continue;
        if (key) seenExp.add(key);
        await conn.query(
          'INSERT INTO `experience` (`role`, `company`, `location`, `period`, `bullets`, `order_idx`) VALUES (?, ?, ?, ?, ?, ?)',
          [exp.role, exp.company, exp.location || '', exp.period, JSON.stringify(exp.bullets || []), expIdx++]
        );
      }
    }

    // 7. Projects
    if (Array.isArray(data.projects)) {
      await conn.query('DELETE FROM `projects`');
      for (let i = 0; i < data.projects.length; i++) {
        const pr = data.projects[i];
        await conn.query(
          'INSERT INTO `projects` (`title`, `tag`, `year`, `is_wide`, `description`, `outcomes`, `chips`, `diagram_url`, `diagram_alt`, `github_url`, `live_url`, `order_idx`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            pr.title, pr.tag || '', pr.year || '', pr.isWide ? 1 : 0,
            pr.description || '', JSON.stringify(pr.outcomes || []),
            pr.chips || '', pr.diagramUrl || '', pr.diagramAlt || '',
            pr.githubUrl || pr.githubLink || '', pr.liveUrl || pr.livePreview || '',
            i + 1
          ]
        );
      }
    }

    // 8. Certifications
    if (Array.isArray(data.certifications)) {
      await conn.query('DELETE FROM `certifications`');
      const seenC = new Set();
      let certIdx = 1;
      for (let i = 0; i < data.certifications.length; i++) {
        const c = data.certifications[i];
        const key = (c.title + '|' + c.issuer).trim().toLowerCase();
        if (key && seenC.has(key)) continue;
        if (key) seenC.add(key);
        await conn.query(
          'INSERT INTO `certifications` (`title`, `issuer`, `link`, `order_idx`) VALUES (?, ?, ?, ?)',
          [c.title, c.issuer || '', c.link || '#', certIdx++]
        );
      }
    }

    // 9. Education
    if (Array.isArray(data.education)) {
      await conn.query('DELETE FROM `education`');
      const seenEdu = new Set();
      let eduIdx = 1;
      for (let i = 0; i < data.education.length; i++) {
        const ed = data.education[i];
        const key = (ed.degree + '|' + ed.institution).trim().toLowerCase();
        if (key && seenEdu.has(key)) continue;
        if (key) seenEdu.add(key);
        await conn.query(
          'INSERT INTO `education` (`degree`, `institution`, `period`, `coursework`, `order_idx`) VALUES (?, ?, ?, ?, ?)',
          [ed.degree, ed.institution, ed.period || '', ed.coursework || '', eduIdx++]
        );
      }
    }

    // 10. Availability
    if (data.availability) {
      const av = data.availability;
      await conn.query(`
        INSERT INTO \`availability\` (
          \`id\`, \`open_to_work\`, \`badge_text\`, \`engagement\`, \`target_roles\`, \`location\`, \`work_mode\`, \`subtext\`
        ) VALUES (
          1, ?, ?, ?, ?, ?, ?, ?
        ) ON DUPLICATE KEY UPDATE
          \`open_to_work\`=VALUES(\`open_to_work\`),
          \`badge_text\`=VALUES(\`badge_text\`),
          \`engagement\`=VALUES(\`engagement\`),
          \`target_roles\`=VALUES(\`target_roles\`),
          \`location\`=VALUES(\`location\`),
          \`work_mode\`=VALUES(\`work_mode\`),
          \`subtext\`=VALUES(\`subtext\`)
      `, [
        av.openToWork ? 1 : 0, av.badgeText || 'Open to work',
        av.engagement || '', av.targetRoles || '',
        av.location || '', av.workMode || '', av.subtext || ''
      ]);
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    console.error('Error saving portfolio to DB:', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

// Authentication Database Queries
async function getAuthUser(username) {
  const p = getPool();
  try {
    const [rows] = await p.query('SELECT * FROM `admin_users` WHERE `username` = ? LIMIT 1', [username]);
    if (rows.length > 0) {
      return {
        username: rows[0].username,
        passwordHash: rows[0].password_hash,
        salt: rows[0].salt
      };
    }
  } catch (err) {
    console.error('Error fetching auth user from DB:', err.message);
    throw err;
  }
  return null;
}

async function updateAuthUser(currentUsername, newUsername, passwordHash, salt) {
  const p = getPool();
  try {
    await p.query(
      'UPDATE `admin_users` SET `username` = ?, `password_hash` = ?, `salt` = ? WHERE `username` = ?',
      [newUsername || currentUsername, passwordHash, salt, currentUsername]
    );
    return true;
  } catch (err) {
    console.error('Error updating auth user in DB:', err.message);
    throw err;
  }
}

async function syncAdminUser(username, passwordHash, salt) {
  const p = getPool();
  try {
    await p.query(
      `INSERT INTO \`admin_users\` (\`username\`, \`password_hash\`, \`salt\`)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE \`password_hash\` = VALUES(\`password_hash\`), \`salt\` = VALUES(\`salt\`)`,
      [username, passwordHash, salt]
    );
    return true;
  } catch (err) {
    console.error('Error syncing admin user in DB:', err.message);
    return false;
  }
}

// Reset / Seed database from setup.sql
async function resetDatabaseToDefault() {
  const setupSqlPath = path.join(__dirname, 'database', 'setup.sql');
  if (!fs.existsSync(setupSqlPath)) {
    throw new Error('database/setup.sql not found');
  }

  const sqlContent = fs.readFileSync(setupSqlPath, 'utf-8');
  // Execute SQL commands
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true
  });

  try {
    await connection.query(sqlContent);
    return true;
  } finally {
    await connection.end();
  }
}

module.exports = {
  testConnection,
  getPortfolioData,
  savePortfolioData,
  getAuthUser,
  updateAuthUser,
  syncAdminUser,
  resetDatabaseToDefault,
  config: { DB_TYPE, DB_HOST, DB_PORT, DB_USER, DB_NAME }
};
