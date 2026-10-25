(() => {
  'use strict';
  const labels = {
    "all": "All",
    "products": "Product design",
    "handling": "Conveying",
    "machines": "Machinery",
    "structures": "Structures",
    "seeProject": "View project",
    "showLess": "Show fewer projects",
    "showMore": "View all projects",
    "project": "PROJECT",
    "application": "Application",
    "menuOpen": "Open menu",
    "menuClose": "Close menu"
  };
  const orderedIds = [18,16,17,13,19,3,20,22,14,21,10,9,8,15,12,4,6,5,11,2,1];
  const projects = orderedIds.map(id => window.PROJECTS.find(p => p.id === id));
  const categories = ['all','products','handling','machines','structures'];
  let category = 'all';
  let expanded = false;
  let currentProject = null;
  let modalProjects = projects;
  let returnFocus = null;
  const grid = document.querySelector('#project-grid');
  const dialog = document.querySelector('#project-dialog');
  const showMore = document.querySelector('#show-more');
  const nav = document.querySelector('#main-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const t = key => labels[key] ?? key;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const imageMarkup = (p, decorative = false) => p.render ? `<img class="project-render" src="${escape(p.image)}" alt="${decorative ? '' : escape(p.title)}" width="${p.width}" height="${p.height}" ${decorative ? 'loading="lazy"' : ''}>` : `<svg viewBox="${p.viewBox}" role="img" ${decorative ? 'aria-hidden="true"' : `aria-label="${escape(p.title)}"`}><image href="${p.image}" width="${p.width}" height="${p.height}" /></svg>`;
  const matchingProjects = () => category === 'all' ? projects : projects.filter(p => p.category === category);

  function renderFilters() {
    document.querySelector('.filters').innerHTML = categories.map(key => {
      return `<button type="button" class="filter ${category === key ? 'active' : ''}" data-filter="${key}" aria-pressed="${category === key}">${t(key)}</button>`;
    }).join('');
  }
  function renderProjects() {
    const filtered = matchingProjects();
    const visible = category === 'all' && !expanded ? filtered.slice(0,6) : filtered;
    grid.innerHTML = visible.map(p => `<button class="project-card" type="button" data-project="${p.id}" aria-label="${t('seeProject')}: ${escape(p.title)}"><div class="project-art">${imageMarkup(p,true)}<span class="project-open" aria-hidden="true">↗</span></div><div class="project-meta"><span>${t(p.category)}</span></div><h3>${escape(p.title)}</h3><p>${escape(p.summary)}</p></button>`).join('');
    showMore.closest('.show-more-wrap').hidden = category !== 'all';
    showMore.querySelector('span:first-child').textContent = expanded ? t('showLess') : `View all ${projects.length} projects`;
    showMore.querySelector('span:last-child').textContent = expanded ? '−' : '+';
    showMore.setAttribute('aria-expanded',String(expanded));
    showMore.setAttribute('aria-controls','project-grid');
  }
  function setCategory(value, moveToProjects = false) {
    category = value;
    expanded = false;
    renderFilters();
    renderProjects();
    if (moveToProjects) {
      document.querySelector('#projetos').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      grid.querySelector('button')?.focus({preventScroll:true});
    } else {
      document.querySelector(`[data-filter="${value}"]`)?.focus({preventScroll:true});
    }
  }
  function renderDialog() {
    const p = currentProject;
    const content = p;
    document.querySelector('.dialog-category').textContent = t(p.category).toUpperCase();
    document.querySelector('#dialog-title').textContent = content.title;
    document.querySelector('.dialog-description').textContent = content.description;
    document.querySelector('.dialog-image-wrap').innerHTML = imageMarkup(p);
    document.querySelector('.dialog-facts').innerHTML = `<div><dt>${t('application')}</dt><dd>${escape(content.application)}</dd></div>`;
    document.querySelector('.dialog-contribution').textContent = content.contribution;
    const i = modalProjects.findIndex(item => item.id === p.id);
    document.querySelector('.previous-project').disabled = i === 0;
    document.querySelector('.next-project').disabled = i === modalProjects.length-1;
  }
  function openProject(id, source) {
    currentProject = projects.find(p => p.id === id);
    if (!currentProject) return;
    const filtered = matchingProjects();
    modalProjects = filtered.some(p => p.id === id) ? filtered : projects;
    returnFocus = source;
    renderDialog();
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.scrollTop = 0;
    document.querySelector('.close-dialog').focus({preventScroll:true});
  }
  function navigateProject(direction) {
    const i = modalProjects.findIndex(p => p.id === currentProject.id) + direction;
    if (i < 0 || i >= modalProjects.length) return;
    currentProject = modalProjects[i];
    renderDialog();
    dialog.scrollTop = 0;
  }
  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label',t('menuOpen'));
  }
  document.addEventListener('click',event => {
    const projectButton = event.target.closest('[data-project]');
    if (projectButton) openProject(Number(projectButton.dataset.project),projectButton);
    const filter = event.target.closest('[data-filter]');
    if (filter) setCategory(filter.dataset.filter);
    const area = event.target.closest('[data-category]');
    if (area) setCategory(area.dataset.category,true);
  });
  showMore.addEventListener('click',() => {
    expanded = !expanded;
    renderProjects();
    if (expanded) grid.querySelectorAll('.project-card')[6]?.focus({preventScroll:true});
    else document.querySelector('#projetos').scrollIntoView();
  });
  document.querySelector('.close-dialog').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',() => {
    document.body.classList.remove('modal-open');
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  document.querySelector('.previous-project').addEventListener('click',() => navigateProject(-1));
  document.querySelector('.next-project').addEventListener('click',() => navigateProject(1));
  document.addEventListener('keydown',event => {
    if (dialog.open && event.key === 'ArrowRight') {event.preventDefault();navigateProject(1);}
    if (dialog.open && event.key === 'ArrowLeft') {event.preventDefault();navigateProject(-1);}
    if (event.key === 'Escape') closeMenu();
  });
  menuToggle.addEventListener('click',() => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.setAttribute('aria-label',t(open ? 'menuClose' : 'menuOpen'));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
  renderFilters();
  renderProjects();
})();
