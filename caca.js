/* =========================================================
   Caça-Palavras • Tema: FRUTAS (10 níveis)
   - Só HORIZONTAL e VERTICAL (direita/baixo)
   - Clique/toque: início e fim (arrastar opcional)
   - "Novo Jogo" vira "Próximo nível" após vencer
   - Sem alterar seu HTML/CSS
   ========================================================= */

(() => {
  const gridEl   = document.getElementById('grid');
  const listEl   = document.getElementById('lista');
  const foundEl  = document.getElementById('found');
  const totalEl  = document.getElementById('total');
  const btnNovo  = document.getElementById('btn-novo');
  const btnDica  = document.getElementById('btn-dica');
  const tempoEl  = document.getElementById('tempo');
  const winDialog = document.getElementById('win');

  // Título dinâmico do painel (se existir)
  const titleEl = document.querySelector('.cp-title');

  // ===== NÍVEIS (1..10) =====
  // Palavras SEM acento.
  const L = (size, words) => ({ size, words: words.map(w => w.toUpperCase()) });

  const LEVELS = [
    L(8,  ["UVA","PERA","KIWI","LIMA","COCO","CAJU"]),
    L(9,  ["UVA","PERA","KIWI","LIMA","COCO","CAJU","FIGO","MANGA"]),
    L(9,  ["UVA","PERA","KIWI","LIMA","COCO","CAJU","FIGO","MANGA","GOIABA"]),
    L(10, ["UVA","Pera","Kiwi","Lima","Coco","Caju","Figo","Manga","Goiaba","LARANJA"]),
    L(10, ["ABACATE","UVA","PESSEGO","PERA","KIWI","COCO","CAJU","FIGO","MANGA","GOIABA"]),
    L(11, ["ABACAXI","ABACATE","UVA","PESSEGO","PERA","KIWI","COCO","LARANJA","MELAO","MANGA","GOIABA"]),
    L(11, ["ABACAXI","ABACATE","UVA","PESSEGO","PERA","KIWI","COCO","LARANJA","MELAO","MANGA","ROMA","MELANCIA"]),
    L(12, ["ABACAXI","ABACATE","UVA","PESSEGO","PERA","KIWI","COCO","LARANJA","MELAO","MANGA","ROMA","MELANCIA","PITAYA"]),
    L(12, ["ABACAXI","ABACATE","UVA","PESSEGO","PERA","KIWI","COCO","LARANJA","MELAO","MANGA","ROMA","MELANCIA","PITAYA","PITANGA"]),
    L(12, ["ABACAXI","ABACATE","UVA","PESSEGO","PERA","KIWI","COCO","LARANJA","MELAO","MANGA","ROMA","MELANCIA","PITAYA","PITANGA","JABUTICABA"])
  ];

  // Letras de preenchimento
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Direções permitidas (fácil): → e ↓
  const DIRS = [
    { dr: 0, dc: 1 }, // →
    { dr: 1, dc: 0 }  // ↓
  ];

  // ===== Estado =====
  let currentLevel = 1; // 1..10
  let SIZE = 10;
  let board = [];      // matriz de letras
  let placed = [];     // [{word, cells:[{r,c}], found:false}]
  let cells = [];      // matriz de elementos .cell
  let dragging = false;
  let startCell = null;
  let pathCells = [];
  let timer = null, seconds = 0;
  let nextMode = false; // se true, "Novo Jogo" avança para o próximo nível

  // ===== Utils =====
  const inBounds = (r,c) => r>=0 && c>=0 && r<SIZE && c<SIZE;
  const randInt = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const shuffle = arr => arr.sort(()=>Math.random()-0.5);
  const toId = (r,c) => `r${r}c${c}`;

  function setTitle() {
    if (!titleEl) return;
    titleEl.textContent = `Tema: Frutas — Nível ${currentLevel}/10`;
  }

  function lineOrtho(a,b){
    if (a.r !== b.r && a.c !== b.c) return null; // apenas H ou V
    const dr = Math.sign(b.r - a.r);
    const dc = Math.sign(b.c - a.c);
    const out = [{r:a.r,c:a.c}];
    let r=a.r, c=a.c;
    while (r!==b.r || c!==b.c){ r+=dr; c+=dc; out.push({r,c}); }
    return out;
  }

  function placeLevelWords(words){
    board = Array.from({length: SIZE}, () => Array(SIZE).fill(null));
    placed = [];

    const pool = shuffle([...words]);
    for (const raw of pool){
      const W = raw.normalize('NFD').replace(/[\u0300-\u036f]/g,''); // sem acento
      let ok = false;
      for (let t=0; t<300 && !ok; t++){
        const dir = DIRS[randInt(0, DIRS.length-1)];
        const len = W.length;
        const sr = randInt(0, SIZE-1);
        const sc = randInt(0, SIZE-1);
        const er = sr + dir.dr*(len-1);
        const ec = sc + dir.dc*(len-1);
        if (!inBounds(er, ec)) continue;

        let coords = [];
        let fits = true;
        for (let i=0;i<len;i++){
          const r = sr + dir.dr*i, c = sc + dir.dc*i;
          const exist = board[r][c];
          const ch = W[i];
          if (exist && exist !== ch){ fits = false; break; }
          coords.push({r,c});
        }
        if (!fits) continue;

        coords.forEach((pos,i)=> board[pos.r][pos.c] = W[i]);
        placed.push({ word: W, cells: coords, found:false });
        ok = true;
      }
    }

    // Preencher vazios
    for (let r=0;r<SIZE;r++){
      for (let c=0;c<SIZE;c++){
        if (!board[r][c]) board[r][c] = ALPHABET[randInt(0, ALPHABET.length-1)];
      }
    }
  }

  function buildGrid(){
    gridEl.innerHTML = '';
    gridEl.setAttribute('aria-rowcount', String(SIZE));
    gridEl.setAttribute('aria-colcount', String(SIZE));
    // Ajusta colunas dinamicamente sem mexer no CSS
    gridEl.style.gridTemplateColumns = `repeat(${SIZE}, minmax(30px, 1fr))`;

    cells = Array.from({length: SIZE}, () => Array(SIZE).fill(null));
    for (let r=0;r<SIZE;r++){
      for (let c=0;c<SIZE;c++){
        const div = document.createElement('div');
        div.className = 'cell';
        div.id = toId(r,c);
        div.textContent = board[r][c];
        div.setAttribute('role','gridcell');
        div.setAttribute('aria-label', `linha ${r+1}, coluna ${c+1}, letra ${board[r][c]}`);
        div.dataset.r = r;
        div.dataset.c = c;
        gridEl.appendChild(div);
        cells[r][c] = div;
      }
    }
  }

  function buildList(){
    listEl.innerHTML = '';
    for (const item of placed){
      const li = document.createElement('li');
      li.dataset.word = item.word;
      li.dataset.found = 'false';
      li.innerHTML = `<span>${item.word}</span><span class="badge">pendente</span>`;
      listEl.appendChild(li);
    }
    totalEl.textContent = placed.length;
    foundEl.textContent = '0';
  }

  // ===== Seleção =====
  function clearSelectionTemp(){
    pathCells.forEach(({r,c})=>{
      const el = cells[r][c];
      if (el && el.dataset.state !== 'found'){
        el.dataset.state = '';
      }
    });
    pathCells = [];
  }
  function showStart(el){
    document.querySelectorAll('.cell[data-state="start"]').forEach(x=>{
      if (x.dataset.state !== 'found') x.dataset.state='';
    });
    if (el && el.dataset.state !== 'found') el.dataset.state='start';
  }
  function setSelectionPath(a,b){
    clearSelectionTemp();
    const line = lineOrtho(a,b);
    if (!line) return;
    pathCells = line;
    for (const pos of line){
      const el = cells[pos.r][pos.c];
      if (el && el.dataset.state !== 'found') el.dataset.state='select';
    }
  }
  const posOf = el => ({ r:+el.dataset.r, c:+el.dataset.c });

  function tryMatch(){
    if (!pathCells.length) return false;
    const seq = pathCells.map(({r,c}) => board[r][c]).join('');
    const rev = [...seq].reverse().join('');
    const i = placed.findIndex(p => !p.found && (p.word === seq || p.word === rev));
    if (i === -1) return false;

    placed[i].found = true;
    for (const pos of placed[i].cells){
      cells[pos.r][pos.c].dataset.state = 'found';
    }
    const li = listEl.querySelector(`li[data-word="${placed[i].word}"]`);
    if (li){ li.dataset.found='true'; const b=li.querySelector('.badge'); if (b) b.textContent='ok'; }

    const foundCount = placed.filter(p=>p.found).length;
    foundEl.textContent = String(foundCount);

    if (foundCount === placed.length){
      stopTimer();
      nextMode = true;
      // Troca rótulo do botão
      if (btnNovo) btnNovo.textContent = (currentLevel < LEVELS.length) ? 'Próximo nível' : 'Reiniciar (nível 1)';
      try { winDialog.showModal(); } catch(_) {}
    }
    return true;
  }

  // Clique simples (início/fim)
  let clickStart = null;
  gridEl.addEventListener('click', (e)=>{
    const target = e.target.closest('.cell');
    if (!target) return;
    const pos = posOf(target);

    if (!clickStart){
      clickStart = pos;
      showStart(target);
      clearSelectionTemp();
      return;
    } else {
      if (clickStart.r === pos.r && clickStart.c === pos.c){
        clickStart = null; clearSelectionTemp(); showStart(null); return;
      }
      setSelectionPath(clickStart, pos);
      if (!tryMatch()){
        clearSelectionTemp();
        clickStart = pos;
        showStart(cells[pos.r][pos.c]);
      } else {
        clearSelectionTemp();
        clickStart = null;
        showStart(null);
      }
    }
  });

  // Arrastar (opcional)
  gridEl.addEventListener('pointerdown', (e)=>{
    const t = e.target.closest('.cell'); if (!t) return;
    e.preventDefault();
    dragging = true; try{ gridEl.setPointerCapture(e.pointerId); }catch(_){}
    startCell = posOf(t);
    showStart(t);
    clearSelectionTemp();
    pathCells = [startCell];
    if (t.dataset.state !== 'found') t.dataset.state='select';
  });
  gridEl.addEventListener('pointermove', (e)=>{
    if (!dragging || !startCell) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el?.closest?.('.cell'); if (!cell) return;
    setSelectionPath(startCell, posOf(cell));
  });
  const finishDrag = (e)=>{
    if (!dragging) return;
    dragging = false; try{ gridEl.releasePointerCapture(e.pointerId); }catch(_){}
    if (!tryMatch()){ clearSelectionTemp(); showStart(null); }
    else { clearSelectionTemp(); showStart(null); }
    startCell = null; clickStart = null;
  };
  gridEl.addEventListener('pointerup', finishDrag);
  gridEl.addEventListener('pointercancel', finishDrag);

  // ===== Dica =====
  function giveHint(){
    const pending = placed.filter(p=>!p.found);
    if (!pending.length) return;
    const pick = pending[randInt(0, pending.length-1)];
    const ends = [pick.cells[0], pick.cells[pick.cells.length-1]];
    ends.forEach((pos,i)=>{
      const el = cells[pos.r][pos.c]; if (!el) return;
      const orig = el.style.outline;
      el.style.outline = `3px solid ${i===0?'var(--brand)':'var(--ok)'}`;
      el.style.outlineOffset = '2px';
      setTimeout(()=>{ el.style.outline = orig || 'none'; }, 900);
    });
  }

  // ===== Timer =====
  function formatTime(s){
    const m = Math.floor(s/60).toString().padStart(2,'0');
    const ss = (s%60).toString().padStart(2,'0');
    return `${m}:${ss}`;
  }
  function startTimer(){
    stopTimer(); seconds = 0; tempoEl.textContent = '00:00';
    timer = setInterval(()=>{ seconds++; tempoEl.textContent = formatTime(seconds); }, 1000);
  }
  function stopTimer(){ if (timer){ clearInterval(timer); timer = null; } }

  // ===== Fluxo =====
  function loadLevel(n){
    currentLevel = Math.max(1, Math.min(n, LEVELS.length));
    const cfg = LEVELS[currentLevel-1];
    SIZE = cfg.size;
    setTitle();
    placeLevelWords(cfg.words);
    buildGrid();
    buildList();
    startTimer();
    nextMode = false;
    if (btnNovo) btnNovo.textContent = 'Novo Jogo';
  }

  function newGameOrNext(){
    if (nextMode){
      // avançar
      const nxt = (currentLevel < LEVELS.length) ? currentLevel+1 : 1;
      loadLevel(nxt);
    } else {
      // reiniciar mesmo nível
      loadLevel(currentLevel);
    }
  }

  // Botões
  btnNovo?.addEventListener('click', newGameOrNext);
  btnDica?.addEventListener('click', giveHint);

  // Ao fechar o diálogo, não faz nada automático
  winDialog?.addEventListener('close', ()=>{});

  // Inicializa no nível 1
  loadLevel(1);
})();
