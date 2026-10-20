(()=>{'use strict';
// Accessible image viewer shared by both editions; source images remain unchanged.
const viewer=document.createElement('dialog');viewer.className='image-viewer';viewer.setAttribute('aria-label','Imagem ampliada');
const close=document.createElement('button');close.type='button';close.textContent='Fechar ×';close.setAttribute('aria-label','Fechar imagem ampliada');
const zoom=document.createElement('button');zoom.type='button';zoom.textContent='Tamanho real';zoom.setAttribute('aria-pressed','false');zoom.addEventListener('click',()=>{const on=viewer.classList.toggle('actual-size');zoom.setAttribute('aria-pressed',String(on));zoom.textContent=on?'Ajustar à tela':'Tamanho real'});
const pic=document.createElement('img');const caption=document.createElement('p');const original=document.createElement('a');original.textContent='Abrir arquivo original';original.target='_blank';original.rel='noopener';
viewer.append(close,zoom,pic,caption,original);document.body.append(viewer);
close.addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
document.querySelectorAll('figure a[href],.bestiary-entry a[href]').forEach(a=>{const im=a.querySelector('img');if(!im)return;a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();viewer.classList.remove('actual-size');zoom.textContent='Tamanho real';zoom.setAttribute('aria-pressed','false');pic.src=a.href;pic.alt=im.alt;caption.textContent=im.alt;original.href=a.href;viewer.showModal();close.focus()})});
function reveal(){if(!location.hash)return;const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!el)return;for(let p=el;p;p=p.parentElement){if(p.tagName==='DETAILS')p.open=true}requestAnimationFrame(()=>el.scrollIntoView({block:'start'}))}window.addEventListener('hashchange',reveal);reveal();
document.querySelectorAll('.map-stage .map-pin').forEach(a=>{a.addEventListener('focus',()=>a.classList.add('pin-active'));a.addEventListener('blur',()=>a.classList.remove('pin-active'))});
})();
