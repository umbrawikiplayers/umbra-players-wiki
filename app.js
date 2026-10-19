(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  try { if (localStorage.getItem('umbra-theme') === 'light') document.body.classList.add('light'); } catch (_) {}
  $('theme').addEventListener('click', () => {
    const light = document.body.classList.toggle('light');
    try { localStorage.setItem('umbra-theme', light ? 'light' : 'dark'); } catch (_) {}
  });
  const mobile = window.matchMedia('(max-width:760px)');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    $('menu').setAttribute('aria-expanded', String(open));
    $('shade').hidden = !open;
    $('sidebar').inert = mobile.matches && !open;
    $('conteudo').inert = mobile.matches && open;
    if (open) $('sidebar').querySelector('summary').focus();
  };
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);
  $('menu').addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $('shade').addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); $('menu').focus(); }
  });
  const dialog = $('search-dialog');
  const clean = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const search = () => {
    const raw = $('search-input').value.trim();
    const terms = clean(raw).split(/\s+/).filter(Boolean);
    const target = $('search-results'); target.replaceChildren();
    if (!terms.length) { $('search-status').textContent = 'Procure um nome ou assunto. A busca ignora acentos.'; return; }
    const matches = (window.UMBRA_SEARCH || []).map(p => {
      const title = clean(p.title), text = clean(p.text), desc = clean(p.desc);
      return {...p, score: terms.every(t => (title+' '+text+' '+desc).includes(t)) ? terms.reduce((n,t) => n + (title.includes(t)?10:0)+(desc.includes(t)?3:0)+1,0) : 0};
    }).filter(p => p.score).sort((a,b) => b.score-a.score);
    $('search-status').textContent = matches.length ? `${matches.length} página${matches.length === 1 ? '' : 's'} encontrada${matches.length === 1 ? '' : 's'}.` : 'Nenhuma página encontrada. Tente outro termo.';
    matches.forEach(p => {
      const a = document.createElement('a'); a.href = p.url;
      const group = document.createElement('small'); group.textContent = p.group;
      const title = document.createElement('strong'); title.textContent = p.title;
      const excerpt = document.createElement('span');
      let pos = clean(p.text).indexOf(terms[0]);
      const start = Math.max(0,pos-55);
      excerpt.textContent = start ? '…'+p.text.slice(start,start+180).trim()+'…' : p.desc;
      a.append(group,title,excerpt); target.append(a);
    });
  };
  const openSearch = () => { setMenu(false); if (!dialog.open) dialog.showModal(); $('search-input').focus(); search(); };
  $('search-open').addEventListener('click', openSearch);
  $('search-close').addEventListener('click', () => dialog.close());
  $('search-input').addEventListener('input', search);
  dialog.addEventListener('click', e => { if(e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); } });
})();
