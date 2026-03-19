/* ========= Config: 10 níveis ========= */
const LEVEL_PAIRS = [2,3,4,5,6,7,8,9,10,12]; // nº de pares por nível

/* FRUTAS (únicas) */
const EMOJIS = [
  "🍎","🍏","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍈",
  "🍒","🍑","🥭","🍍","🥥","🫐","🥝","🍅","🥑","🍆","🫒","🍋"
];

/* ========= Estado ========= */
let level = 0, deck = [], flipped = [], matches = 0, moves = 0, seconds = 0;
let ticking = null, lock = false;

/* ========= Helpers ========= */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2,"0");
const timeFmt = s => `${pad(Math.floor(s/60))}:${pad(s%60)}`;
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a }

/* ========= Elementos ========= */
const uiLevel = $("#uiLevel");
const uiTime = $("#uiTime");
const uiMoves = $("#uiMoves");
const board = $("#board");

const modal = $("#modal");
const modalStats = $("#modalStats");
const mAgain = $("#mAgain");
const mNext = $("#mNext");

/* ========= Início ========= */
document.addEventListener("DOMContentLoaded", () => {
  startLevel(0);
  window.addEventListener("resize", layoutToFit);
  window.addEventListener("orientationchange", ()=> setTimeout(layoutToFit, 200));

  $("#btnRestartTop").addEventListener("click", ()=> startLevel(level));
  $("#btnNext").addEventListener("click", ()=> startLevel( Math.min(level+1, LEVEL_PAIRS.length-1) ));
  $("#btnPrev").addEventListener("click", ()=> startLevel( Math.max(level-1, 0) ));

  mAgain.addEventListener("click", ()=>{
    modal.classList.remove("show"); modal.setAttribute("aria-hidden","true");
    startLevel(level);
  });
  mNext.addEventListener("click", ()=>{
    modal.classList.remove("show"); modal.setAttribute("aria-hidden","true");
    const next = (level === LEVEL_PAIRS.length-1) ? 0 : level+1;
    startLevel(next);
  });
  modal.addEventListener("click", (e)=>{
    if(e.target === modal){
      modal.classList.remove("show"); modal.setAttribute("aria-hidden","true");
    }
  });
});

/* ========= Montagem do nível ========= */
function startLevel(i){
  level = i;
  stopTimer(); seconds=0; moves=0; matches=0; lock=false; flipped.length=0;
  uiLevel.textContent = `${level+1}/${LEVEL_PAIRS.length}`;
  uiTime.textContent = "00:00";
  uiMoves.textContent = "0";

  // cria baralho com FRUTAS
  const pairs = LEVEL_PAIRS[level];
  const uniqueFruits = Array.from(new Set(EMOJIS)); // garante unicidade
  const set = shuffle(uniqueFruits.slice()).slice(0,pairs);
  deck = shuffle([...set, ...set]);

  // monta DOM
  board.innerHTML = "";
  deck.forEach(v=>{
    const btn = document.createElement("button");
    btn.className="card"; btn.type="button"; btn.setAttribute("data-v", v);
    btn.style.touchAction = "manipulation";
    const front = document.createElement("div"); front.className="side front"; front.textContent="❓";
    const back = document.createElement("div"); back.className="side back"; back.textContent=v;
    btn.append(front,back);
    btn.addEventListener("click", ()=> flip(btn));
    board.appendChild(btn);
  });

  // ajusta grid para CABER 100% NA TELA
  layoutToFit();

  startTimer();
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ========= Layout que SEMPRE cabe ========= */
function layoutToFit(){
  const n = deck.length;
  if(n === 0) return;

  const gap = parseFloat(getComputedStyle(board).gap) || 8;

  const wrap = board.parentElement; // .board-wrap
  const W = wrap.clientWidth;

  const top = board.getBoundingClientRect().top;
  const H = window.innerHeight - top - 8; // respiro inferior

  let best = { size: 0, cols: 1, rows: n };
  for(let cols=1; cols<=n; cols++){
    const rows = Math.ceil(n / cols);
    const sizeW = (W - gap*(cols-1)) / cols;
    const sizeH = (H - gap*(rows-1)) / rows;
    const size = Math.floor(Math.min(sizeW, sizeH));
    if(size > best.size){
      best = { size, cols, rows };
    }
  }

  const finalSize = Math.max(best.size, 24); // evita ficar minúsculo demais
  board.style.setProperty('--cols', best.cols);
  board.style.setProperty('--card-size', finalSize + 'px');
}

/* ========= Lógica do jogo ========= */
function flip(card){
  if(lock || card.classList.contains("flip") || card.classList.contains("matched")) return;
  card.classList.add("flip");
  flipped.push(card);
  if(flipped.length===2){
    moves++; uiMoves.textContent = moves;
    lock = true;
    const [a,b] = flipped;
    const ok = a.dataset.v === b.dataset.v;
    setTimeout(()=>{
      if(ok){
        a.classList.add("matched"); b.classList.add("matched");
        matches++;
        if(matches === LEVEL_PAIRS[level]) { win() }
      }else{
        a.classList.remove("flip"); b.classList.remove("flip");
      }
      flipped.length=0; lock=false;
    }, 360);
  }
}

function win(){
  stopTimer();
  modalStats.textContent = `Tempo: ${timeFmt(seconds)} • Movimentos: ${moves}`;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}

/* ========= Timer ========= */
function startTimer(){
  stopTimer();
  ticking = setInterval(()=>{ seconds++; uiTime.textContent = timeFmt(seconds) }, 1000);
}
function stopTimer(){ if(ticking){ clearInterval(ticking); ticking=null }}
