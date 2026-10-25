/* Umbra search: MiniSearch 7.2.0, weighted fields plus wiki-style exact title/alias priority. */
((root)=>{'use strict';
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const stops=new Set('a o as os de da do das dos em na no nas nos e ou um uma para por com ao aos the of and'.split(' '));
const tokens=s=>normalize(s).split(' ').filter(t=>t&&!stops.has(t));
function create(entries){
 const docs=entries.map((p,id)=>({...p,id,aliases:p.aliases||[],headings:p.headings||'',aliasText:(p.aliases||[]).join(' ')}));
 const index=new root.MiniSearch({fields:['title','aliasText','headings','desc','text'],storeFields:['title','group','url','desc','text','aliases'],tokenize:tokens,processTerm:t=>t,searchOptions:{combineWith:'AND',boost:{title:10,aliasText:12,headings:4,desc:3,text:1},prefix:(term,i,all)=>i===all.length-1&&term.length>=3,fuzzy:false}});
 index.addAll(docs);
 function search(raw){
  const query=normalize(raw),words=tokens(query);if(!words.length)return [];
  let hits=index.search(query),approximate=false;
  // Typos are a fallback, not a reason to dilute exact results. At most one edit.
  if(!hits.length&&words.some(w=>w.length>=5)){
   hits=index.search(query,{fuzzy:term=>term.length>=5?1:false,maxFuzzy:1});approximate=true;
  }
  return hits.map(hit=>{
   const doc=docs[hit.id],title=normalize(doc.title),aliases=doc.aliases.map(normalize),titleWords=new Set(tokens(title));
   let tier=0,reason=approximate?'Correspondência aproximada':'Conteúdo relacionado';
   if(title===query){tier=5;reason='Título exato'}
   else if(aliases.includes(query)){tier=4;reason='Nome alternativo'}
   else if(words.every(w=>titleWords.has(w))){tier=3;reason='Título relacionado'}
   else if(words.every(w=>aliases.some(a=>tokens(a).includes(w)))){tier=2;reason='Nome alternativo relacionado'}
   const archive=/arquivo de prepara/i.test(doc.group)?0.65:1;
   return {...doc,score:hit.score*archive,tier,reason,approximate};
  }).sort((a,b)=>b.tier-a.tier||b.score-a.score||a.title.localeCompare(b.title,'pt-BR'));
 }
 return {search,size:docs.length};
}
function excerpt(p,raw){
 const query=tokens(raw),text=String(p.text||'').replace(/\s+/g,' ').trim();
 const found=query.map(t=>normalize(text).indexOf(t)).filter(n=>n>=0);if(!found.length)return p.desc;
 // Normalized coordinates are only approximate; the snippet is plain text, never HTML.
 const start=Math.max(0,Math.min(...found)-45);return (start?'…':'')+text.slice(start,start+180).trim()+(start+180<text.length?'…':'');
}
root.UMBRA_SEARCH_ENGINE={create,normalize,excerpt};
})(globalThis);
