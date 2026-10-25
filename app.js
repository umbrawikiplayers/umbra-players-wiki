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
  const engine = UMBRA_SEARCH_ENGINE.create(window.UMBRA_SEARCH || []);
  const search = () => {
    const raw = $('search-input').value.trim(), target = $('search-results');
    target.replaceChildren();
    if (!raw) { $('search-status').textContent = 'Procure pelo nome, apelido ou assunto. Ex.: downtime, poção ou Haste.'; return; }
    const matches = engine.search(raw);
    $('search-status').textContent = matches.length ? (matches[0].approximate ? 'Resultados aproximados · ' : '') + matches.length + ' resultado(s) por relevância' : 'Nenhum resultado. Tente outro nome ou assunto.';
    matches.forEach(p => {
      const a = document.createElement('a'); a.href = p.url;
      const group = document.createElement('small'); group.textContent = p.group + ' · ' + p.reason;
      const title = document.createElement('strong'); title.textContent = p.title;
      const excerpt = document.createElement('span'); excerpt.textContent = UMBRA_SEARCH_ENGINE.excerpt(p, raw);
      a.append(group, title, excerpt); target.append(a);
    });
  };
  const openSearch = () => { setMenu(false); if (!dialog.open) dialog.showModal(); $('search-input').focus(); search(); };
  $('search-open').addEventListener('click', openSearch);
  $('search-close').addEventListener('click', () => dialog.close());
  $('search-input').addEventListener('input', search);
  dialog.addEventListener('click', e => { if(e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); } });
})();
