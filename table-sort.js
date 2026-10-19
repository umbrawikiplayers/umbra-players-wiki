/* Ordenação de apresentação: nunca altera dados, saldos ou arquivos de origem. */
(() => {
  'use strict';
  const collator = new Intl.Collator('pt-BR', {numeric:true, sensitivity:'base'});
  const numeric = value => {
    const s=value.trim().replace(/\u00a0/g,' ');
    if (!/^[+−-]?\d[\d.\s]*(?:,\d+)?(?:\s*(?:ânima|anima))?$/i.test(s)) return null;
    const n=Number(s.replace(/(?:ânima|anima)/gi,'').replace(/[.\s]/g,'').replace(',','.').replace('−','-'));
    return Number.isFinite(n)?n:null;
  };
  const status=document.createElement('div');status.className='sort-status';status.setAttribute('role','status');document.body.append(status);
  document.querySelectorAll('article table').forEach(table => {
    const body=table.tBodies[0];
    const heads=[...table.querySelectorAll('thead th')];
    if (!body || !heads.length) return;
    const original=[...body.rows];
    const totals=original.filter(row=>/^total do grupo$/i.test(row.cells[0]?.textContent.trim()||''));
    const labels=heads.map(h=>h.textContent.trim());
    const order=new Map(original.map((row,i)=>[row,i]));
    let current=-1,ascending=true;
    let select=null,direction=null;
    const buttons=[];
    const sort=(column,asc) => {
      current=column;ascending=asc;
      const rows=[...body.rows].filter(row=>!totals.includes(row)).sort((a,b)=>{
        const x=a.cells[column]?.textContent.trim()||'',y=b.cells[column]?.textContent.trim()||'';
        if (!x || !y) return x===y?order.get(a)-order.get(b):!x?1:-1;
        const nx=numeric(x),ny=numeric(y);
        const result=nx!==null&&ny!==null?nx-ny:collator.compare(x,y);
        return (asc?result:-result)||order.get(a)-order.get(b);
      });
      rows.forEach(row=>body.append(row));
      totals.forEach(row=>body.append(row));
      heads.forEach((head,i)=>{
        const active=i===column;
        head.setAttribute('aria-sort',active?(asc?'ascending':'descending'):'none');
        buttons[i].querySelector('.sort-arrow').textContent=active?(asc?'↑':'↓'):'↕';
        buttons[i].setAttribute('aria-label',`Ordenar por ${labels[i]}, ${active&&asc?'decrescente':'crescente'}`);
      });
      if(select) {select.value=String(column);direction.disabled=false;direction.textContent=asc?'↑ Crescente':'↓ Decrescente';}
      status.textContent=`Ordenado por ${labels[column]}, ordem ${asc?'crescente':'decrescente'}.`;
    };
    heads.forEach((head,i)=>{
      const button=document.createElement('button');button.type='button';button.className='sort-heading';
      button.append(document.createTextNode(labels[i]+' '));
      const arrow=document.createElement('span');arrow.className='sort-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↕';button.append(arrow);
      button.setAttribute('aria-label',`Ordenar por ${labels[i]}, crescente`);
      button.addEventListener('click',()=>sort(i,current===i?!ascending:true));
      head.replaceChildren(button);head.setAttribute('aria-sort','none');buttons.push(button);
    });
    if(heads.length>2) {
      const bar=document.createElement('div');bar.className='table-sort-mobile';
      const label=document.createElement('label');label.textContent='Ordenar por';
      select=document.createElement('select');select.setAttribute('aria-label','Coluna para ordenar esta tabela');
      const empty=document.createElement('option');empty.value='';empty.textContent='Selecione';empty.selected=true;empty.disabled=true;select.append(empty);
      labels.forEach((name,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=name;select.append(option);});
      select.addEventListener('change',()=>sort(Number(select.value),true));label.append(select);
      direction=document.createElement('button');direction.type='button';direction.textContent='↑ Crescente';direction.disabled=true;
      direction.addEventListener('click',()=>sort(current,!ascending));
      bar.append(label,direction);table.before(bar);
    }
  });
})();
