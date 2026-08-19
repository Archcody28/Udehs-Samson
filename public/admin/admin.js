const STORAGE = 'udeh_portfolio_static';
const AUTH_STORAGE = 'udeh_portfolio_auth';
const LOCKOUT_STORAGE = 'udeh_portfolio_lockout';
const ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const TABS = [
  {id:'projects', label:'Projects'},
  {id:'blog', label:'Blog'},
  {id:'skills', label:'Skills'},
  {id:'experience', label:'Experience'},
  {id:'messages', label:'Messages'},
  {id:'stats', label:'Stats'},
  {id:'socials', label:'Socials'},
  {id:'cv', label:'CV'},
  {id:'profile', label:'Profile'},
  {id:'settings', label:'Settings'}
];
const DEFAULT = {
  profile: { name:'Udeh Samson', title:'Full Stack Engineer', tagline:'Building scalable digital experiences that blend performance, design, and intelligence.', bio:"I'm Udeh Samson, a results-driven Full Stack Engineer with a passion for turning complex problems into elegant, high-performance web and mobile applications.", email:'hello@udehsamson.dev', phone:'+234 800 000 0000', avatar:'/images/profile.jpg' },
  stats: { yearsExperience:7, projectsDelivered:45, happyClients:30, satisfaction:99 },
  socials: { github:'https://github.com/udehsamson', linkedin:'https://linkedin.com/in/udehsamson', x:'https://x.com/udehsamson', whatsapp:'https://wa.me/2348000000000' },
  cv: null,
  messages: [],
  projects: [
    { id:'p1', slug:'fintrack-pro', title:'FinTrack Pro', description:'A real-time personal finance dashboard.', content:'FinTrack Pro helps users take control of their finances.', categories:'SaaS, Fintech', tech:'Next.js, TypeScript, Node.js, PostgreSQL, Prisma', featured:true, status:'published', date:'2024-11-15' },
    { id:'p2', slug:'nexus-commerce', title:'Nexus Commerce', description:'Headless e-commerce storefront.', content:'Nexus Commerce reimagines online retail.', categories:'E-commerce, SaaS', tech:'Next.js, React, Node.js, Stripe', featured:true, status:'published', date:'2024-08-20' },
    { id:'p3', slug:'taskflow-ai', title:'TaskFlow AI', description:'AI-assisted project management.', content:'TaskFlow AI combines kanban with NLP.', categories:'Productivity, AI', tech:'React, Node.js, Python, OpenAI', featured:false, status:'draft', date:'2024-05-10' }
  ],
  blog: [
    { id:'b1', slug:'scalable-nextjs', title:'Scalable Next.js Architecture', excerpt:'Deep dive into Next.js patterns.', content:'Building enterprise Next.js apps.', categories:'Engineering, Next.js', tags:'nextjs, architecture', featured:true, status:'published', date:'2025-01-10' },
    { id:'b2', slug:'typescript-patterns', title:'TypeScript Strict Patterns', excerpt:'Prevent bugs with strict types.', content:'Strict mode and branded types.', categories:'TypeScript', tags:'typescript', featured:false, status:'published', date:'2024-12-05' }
  ],
  skills: [
    { id:'s1', name:'React / Next.js', category:'Frontend', proficiency:98 },
    { id:'s2', name:'TypeScript', category:'Frontend', proficiency:96 },
    { id:'s3', name:'Node.js', category:'Backend', proficiency:94 }
  ],
  experiences: [
    { id:'e1', role:'Senior Full Stack Engineer', company:'TechVerse Solutions', location:'Remote', start:'2022-03-01', end:'', current:true, desc:'Leading frontend architecture for a multi-tenant SaaS platform.' },
    { id:'e2', role:'Full Stack Developer', company:'Innovate Digital', location:'Lagos, Nigeria', start:'2020-06-01', end:'2022-02-28', current:false, desc:'Built fintech applications serving over 50,000 monthly active users.' }
  ]
};
let data = JSON.parse(localStorage.getItem(STORAGE)) || JSON.parse(JSON.stringify(DEFAULT));
data = { ...JSON.parse(JSON.stringify(DEFAULT)), ...data };
function save(){ localStorage.setItem(STORAGE, JSON.stringify(data)); }

async function sha256(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function isLockedOut() {
  const raw = sessionStorage.getItem(LOCKOUT_STORAGE);
  if (!raw) return false;
  const until = parseInt(raw, 10);
  if (Date.now() >= until) { sessionStorage.removeItem(LOCKOUT_STORAGE); sessionStorage.removeItem(AUTH_STORAGE + '_attempts'); return false; }
  return true;
}
function recordFailedAttempt() {
  const attempts = (parseInt(sessionStorage.getItem(AUTH_STORAGE + '_attempts'), 10) || 0) + 1;
  sessionStorage.setItem(AUTH_STORAGE + '_attempts', attempts);
  if (attempts >= MAX_ATTEMPTS) {
    sessionStorage.setItem(LOCKOUT_STORAGE, Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    return true;
  }
  return false;
}
async function verifyPassword(input) { return await sha256(input) === ADMIN_HASH; }

document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const errorEl = document.getElementById('loginError');
  errorEl.classList.add('hidden');
  if (isLockedOut()) { errorEl.textContent = 'Too many attempts. Please try again later.'; errorEl.classList.remove('hidden'); return; }
  const password = document.getElementById('password').value;
  if (await verifyPassword(password)) {
    sessionStorage.removeItem(AUTH_STORAGE + '_attempts');
    sessionStorage.removeItem(LOCKOUT_STORAGE);
    sessionStorage.setItem(AUTH_STORAGE, '1');
    document.getElementById('login').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    initNav(); renderAll();
  } else {
    const locked = recordFailedAttempt();
    errorEl.textContent = locked ? `Too many attempts. Locked out for ${LOCKOUT_MINUTES} minutes.` : 'Incorrect password.';
    errorEl.classList.remove('hidden');
    document.getElementById('password').value = '';
  }
};
if(sessionStorage.getItem(AUTH_STORAGE) === '1'){
  document.getElementById('login').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  initNav(); renderAll();
}
function logout(){ sessionStorage.removeItem(AUTH_STORAGE); location.reload(); }
function resetData(){ if(confirm('Reset all content to defaults?')){ data=JSON.parse(JSON.stringify(DEFAULT)); save(); renderAll(); } }

function initNav(){
  const unread = (data.messages || []).filter(m => !m.read).length;
  document.getElementById('nav').innerHTML = TABS.map(t => {
    let label = t.label;
    if (t.id === 'messages' && unread > 0) label += ` <span class="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">${unread}</span>`;
    return `<button onclick="showTab('${t.id}')" class="tab-btn w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" data-tab="${t.id}">${label}</button>`;
  }).join('');
}
function showTab(tab){
  document.querySelectorAll('.tab-pane').forEach(el=>el.classList.add('hidden'));
  document.getElementById('tab-'+tab).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    const active = btn.dataset.tab===tab;
    btn.className = active ? 'tab-btn w-full rounded-lg px-4 py-2 text-left text-sm font-medium tab-active' : 'tab-btn w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800';
  });
}

function renderAll(){ renderProjects(); renderBlog(); renderSkills(); renderExperience(); renderMessages(); renderStatsForm(); renderSocialsForm(); renderCvTab(); renderProfileForm(); showTab('projects'); }

function renderProjects(){
  document.getElementById('projectsList').innerHTML = data.projects.map(p=>`
    <div class="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900/60">
      <div><p class="font-medium">${p.title} ${p.featured?'<span class="ml-2 text-amber-400">★</span>':''}</p><p class="text-xs text-slate-500">${p.status} &middot; ${p.categories}</p></div>
      <div class="flex gap-2">
        <button onclick="toggleFeatured('${p.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Star</button>
        <button onclick="editProject('${p.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Edit</button>
        <button onclick="deleteProject('${p.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 dark:border-slate-700">Del</button>
      </div>
    </div>`).join('');
}
function toggleFeatured(id){ const p=data.projects.find(x=>x.id===id); p.featured=!p.featured; save(); renderProjects(); }
function deleteProject(id){ if(confirm('Delete this project?')){ data.projects=data.projects.filter(x=>x.id!==id); save(); renderProjects(); } }

function renderBlog(){
  document.getElementById('blogList').innerHTML = data.blog.map(b=>`
    <div class="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900/60">
      <div><p class="font-medium">${b.title} ${b.featured?'<span class="ml-2 text-amber-400">★</span>':''}</p><p class="text-xs text-slate-500">${b.status} &middot; ${b.date}</p></div>
      <div class="flex gap-2">
        <button onclick="toggleBlogFeatured('${b.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Star</button>
        <button onclick="editBlog('${b.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Edit</button>
        <button onclick="deleteBlog('${b.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 dark:border-slate-700">Del</button>
      </div>
    </div>`).join('');
}
function toggleBlogFeatured(id){ const b=data.blog.find(x=>x.id===id); b.featured=!b.featured; save(); renderBlog(); }
function deleteBlog(id){ if(confirm('Delete this post?')){ data.blog=data.blog.filter(x=>x.id!==id); save(); renderBlog(); } }

function renderSkills(){
  document.getElementById('skillsList').innerHTML = data.skills.map(s=>`
    <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="flex items-start justify-between">
        <div><p class="font-medium">${s.name}</p><p class="text-xs text-slate-500">${s.category}</p></div>
        <div class="flex gap-1">
          <button onclick="editSkill('${s.id}')" class="rounded-lg border border-slate-200 p-1.5 text-slate-500 dark:border-slate-700">Edit</button>
          <button onclick="deleteSkill('${s.id}')" class="rounded-lg border border-slate-200 p-1.5 text-red-500 dark:border-slate-700">Del</button>
        </div>
      </div>
      <div class="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style="width:${s.proficiency}%"></div></div>
    </div>`).join('');
}
function deleteSkill(id){ if(confirm('Delete this skill?')){ data.skills=data.skills.filter(x=>x.id!==id); save(); renderSkills(); } }

function renderExperience(){
  document.getElementById('experienceList').innerHTML = data.experiences.map(e=>`
    <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p class="font-medium">${e.role} ${e.current?'<span class="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Current</span>':''}</p>
          <p class="text-xs text-slate-500">${e.company} &middot; ${e.location} &middot; ${formatDate(e.start)} - ${e.current?'Present':formatDate(e.end)}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="editExperience('${e.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Edit</button>
          <button onclick="deleteExperience('${e.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 dark:border-slate-700">Del</button>
        </div>
      </div>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">${e.desc}</p>
    </div>`).join('');
}
function deleteExperience(id){ if(confirm('Delete this experience?')){ data.experiences=data.experiences.filter(x=>x.id!==id); save(); renderExperience(); } }

function renderMessages(){
  const list = data.messages || [];
  if(!list.length){ document.getElementById('messagesList').innerHTML = '<p class="text-slate-500">No messages yet.</p>'; return; }
  document.getElementById('messagesList').innerHTML = list.slice().reverse().map(m=>`
    <div class="rounded-xl border ${m.read ? 'border-slate-200 dark:border-slate-800' : 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'} p-4">
      <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p class="font-medium">${m.name} <span class="text-xs font-normal text-slate-500">&lt;${m.email}&gt;</span></p>
          <p class="text-xs text-slate-500">${m.subject} &middot; ${new Date(m.date).toLocaleString()}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="toggleRead('${m.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">${m.read ? 'Mark Unread' : 'Mark Read'}</button>
          <a href="mailto:${m.email}?subject=Re: ${esc(m.subject)}" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Reply</a>
          <button onclick="deleteMessage('${m.id}')" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 dark:border-slate-700">Del</button>
        </div>
      </div>
      <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">${esc(m.message)}</p>
    </div>`).join('');
  initNav();
}
function toggleRead(id){ const m = data.messages.find(x=>x.id===id); if(m){ m.read = !m.read; save(); renderMessages(); } }
function deleteMessage(id){ if(confirm('Delete this message?')){ data.messages = data.messages.filter(x=>x.id!==id); save(); renderMessages(); } }
function clearMessages(){ if(confirm('Delete all messages?')){ data.messages = []; save(); renderMessages(); } }

function renderStatsForm(){
  const f = document.getElementById('statsForm');
  f.yearsExperience.value = data.stats.yearsExperience;
  f.projectsDelivered.value = data.stats.projectsDelivered;
  f.happyClients.value = data.stats.happyClients;
  f.satisfaction.value = data.stats.satisfaction;
}
document.getElementById('statsForm').onsubmit = e => {
  e.preventDefault(); const f=e.target;
  data.stats = { yearsExperience:+f.yearsExperience.value, projectsDelivered:+f.projectsDelivered.value, happyClients:+f.happyClients.value, satisfaction:+f.satisfaction.value };
  save(); alert('Stats saved.');
};

function renderSocialsForm(){
  const f = document.getElementById('socialsForm');
  f.github.value = data.socials.github;
  f.linkedin.value = data.socials.linkedin;
  f.x.value = data.socials.x;
  f.whatsapp.value = data.socials.whatsapp;
}
document.getElementById('socialsForm').onsubmit = e => {
  e.preventDefault(); const f=e.target;
  data.socials = { github:f.github.value, linkedin:f.linkedin.value, x:f.x.value, whatsapp:f.whatsapp.value };
  save(); alert('Social links saved.');
};

function renderCvTab(){
  const status = document.getElementById('cvStatus');
  const link = document.getElementById('cvLink');
  if(data.cv){
    status.textContent = data.cv.startsWith('data:') ? 'CV uploaded (base64).' : 'CV linked.';
    link.href = data.cv; link.classList.remove('hidden');
  } else { status.textContent = 'No CV uploaded.'; link.classList.add('hidden'); }
  document.getElementById('cvUrl').value = data.cv && !data.cv.startsWith('data:') ? data.cv : '';
}
let pendingCv = null;
document.getElementById('cvFile').onchange = e => {
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => { pendingCv = ev.target.result; };
  reader.readAsDataURL(file);
};
function saveCv(){
  const url = document.getElementById('cvUrl').value.trim();
  data.cv = pendingCv || url || null;
  pendingCv = null; document.getElementById('cvFile').value = '';
  save(); renderCvTab(); alert('CV saved.');
}

function renderProfileForm(){
  const p = data.profile;
  const form = document.getElementById('profileForm');
  form.name.value = p.name; form.title.value = p.title; form.tagline.value = p.tagline;
  form.bio.value = p.bio; form.email.value = p.email; form.phone.value = p.phone;
  document.getElementById('profilePreview').src = p.avatar || '/images/profile.jpg';
}
let pendingAvatar = null;
document.getElementById('profileImage').onchange = e => {
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => { pendingAvatar = ev.target.result; document.getElementById('profilePreview').src = pendingAvatar; };
  reader.readAsDataURL(file);
};
document.getElementById('profileForm').onsubmit = e => {
  e.preventDefault(); const f=e.target;
  data.profile = { name:f.name.value, title:f.title.value, tagline:f.tagline.value, bio:f.bio.value, email:f.email.value, phone:f.phone.value, avatar: pendingAvatar || data.profile.avatar || '/images/profile.jpg' };
  pendingAvatar = null; save(); alert('Profile saved.');
};

function openProjectForm(id){
  const p = id ? data.projects.find(x=>x.id===id) : {};
  document.getElementById('formContent').innerHTML = `
    <h3 class="mb-4 font-display text-xl font-bold">${id?'Edit':'Add'} Project</h3>
    <form id="pForm" class="space-y-4">
      <input name="title" value="${esc(p.title||'')}" placeholder="Title" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <textarea name="description" placeholder="Description" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">${esc(p.description||'')}</textarea>
      <textarea name="content" rows="4" placeholder="Content" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">${esc(p.content||'')}</textarea>
      <input name="categories" value="${esc(p.categories||'')}" placeholder="Categories (comma separated)" class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <input name="tech" value="${esc(p.tech||'')}" placeholder="Technologies (comma separated)" class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <select name="status" class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"><option value="draft">Draft</option><option value="published" ${p.status==='published'?'selected':''}>Published</option></select>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" ${p.featured?'checked':''}> Featured</label>
      <button type="submit" class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2 text-white">Save</button>
    </form>`;
  showModal(); document.getElementById('pForm').onsubmit = e => handleProjectSubmit(e,id,p);
}
function handleProjectSubmit(e,id,p){
  e.preventDefault(); const f=e.target;
  const item = { id: p?.id||'p'+Date.now(), slug:(p?.title||f.title.value).toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''), title:f.title.value, description:f.description.value, content:f.content.value, categories:f.categories.value, tech:f.tech.value, status:f.status.value, featured:f.featured.checked, date:p?.date||new Date().toISOString().split('T')[0] };
  if(id){ const i=data.projects.findIndex(x=>x.id===id); data.projects[i]=item; } else data.projects.unshift(item);
  save(); renderProjects(); closeForm();
}
function editProject(id){ openProjectForm(id); }

function openBlogForm(id){
  const b = id ? data.blog.find(x=>x.id===id) : {};
  document.getElementById('formContent').innerHTML = `
    <h3 class="mb-4 font-display text-xl font-bold">${id?'Edit':'Add'} Blog Post</h3>
    <form id="bForm" class="space-y-4">
      <input name="title" value="${esc(b.title||'')}" placeholder="Title" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <textarea name="excerpt" placeholder="Excerpt" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">${esc(b.excerpt||'')}</textarea>
      <textarea name="content" rows="4" placeholder="Content" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">${esc(b.content||'')}</textarea>
      <input name="categories" value="${esc(b.categories||'')}" placeholder="Categories" class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <input name="tags" value="${esc(b.tags||'')}" placeholder="Tags" class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <select name="status" class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"><option value="draft">Draft</option><option value="published" ${b.status==='published'?'selected':''}>Published</option></select>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" ${b.featured?'checked':''}> Featured</label>
      <button type="submit" class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2 text-white">Save</button>
    </form>`;
  showModal(); document.getElementById('bForm').onsubmit = e => handleBlogSubmit(e,id,b);
}
function handleBlogSubmit(e,id,b){
  e.preventDefault(); const f=e.target;
  const item = { id: b?.id||'b'+Date.now(), slug:(b?.title||f.title.value).toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''), title:f.title.value, excerpt:f.excerpt.value, content:f.content.value, categories:f.categories.value, tags:f.tags.value, status:f.status.value, featured:f.featured.checked, date:b?.date||new Date().toISOString().split('T')[0] };
  if(id){ const i=data.blog.findIndex(x=>x.id===id); data.blog[i]=item; } else data.blog.unshift(item);
  save(); renderBlog(); closeForm();
}
function editBlog(id){ openBlogForm(id); }

function openSkillForm(id){
  const s = id ? data.skills.find(x=>x.id===id) : {};
  document.getElementById('formContent').innerHTML = `
    <h3 class="mb-4 font-display text-xl font-bold">${id?'Edit':'Add'} Skill</h3>
    <form id="sForm" class="space-y-4">
      <input name="name" value="${esc(s.name||'')}" placeholder="Skill name" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <input name="category" value="${esc(s.category||'')}" placeholder="Category" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <input name="proficiency" type="number" min="0" max="100" value="${s.proficiency||50}" placeholder="Proficiency 0-100" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <button type="submit" class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2 text-white">Save</button>
    </form>`;
  showModal(); document.getElementById('sForm').onsubmit = e => {
    e.preventDefault(); const f=e.target;
    const item = { id: s?.id||'s'+Date.now(), name:f.name.value, category:f.category.value, proficiency:+f.proficiency.value };
    if(id){ const i=data.skills.findIndex(x=>x.id===id); data.skills[i]=item; } else data.skills.push(item);
    save(); renderSkills(); closeForm();
  };
}
function editSkill(id){ openSkillForm(id); }

function openExperienceForm(id){
  const ex = id ? data.experiences.find(x=>x.id===id) : {};
  document.getElementById('formContent').innerHTML = `
    <h3 class="mb-4 font-display text-xl font-bold">${id?'Edit':'Add'} Experience</h3>
    <form id="eForm" class="space-y-4">
      <input name="role" value="${esc(ex.role||'')}" placeholder="Role" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <input name="company" value="${esc(ex.company||'')}" placeholder="Company" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <input name="location" value="${esc(ex.location||'')}" placeholder="Location" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      <div class="grid gap-4 sm:grid-cols-2">
        <input name="start" type="date" value="${ex.start||''}" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
        <input name="end" type="date" value="${ex.end||''}" class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
      </div>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="current" ${ex.current?'checked':''}> Current role</label>
      <textarea name="desc" rows="3" placeholder="Description" required class="w-full rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">${esc(ex.desc||'')}</textarea>
      <button type="submit" class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2 text-white">Save</button>
    </form>`;
  showModal(); document.getElementById('eForm').onsubmit = e => {
    e.preventDefault(); const f=e.target;
    const item = { id: ex?.id||'e'+Date.now(), role:f.role.value, company:f.company.value, location:f.location.value, start:f.start.value, end:f.end.value, current:f.current.checked, desc:f.desc.value };
    if(id){ const i=data.experiences.findIndex(x=>x.id===id); data.experiences[i]=item; } else data.experiences.unshift(item);
    save(); renderExperience(); closeForm();
  };
}
function editExperience(id){ openExperienceForm(id); }

function showModal(){ document.getElementById('formModal').classList.remove('hidden'); document.getElementById('formModal').classList.add('flex'); }
function closeForm(){ document.getElementById('formModal').classList.add('hidden'); document.getElementById('formModal').classList.remove('flex'); }
function formatDate(d){ if(!d) return ''; return new Date(d).toLocaleDateString(undefined,{year:'numeric',month:'short'}); }
function esc(s){ return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
