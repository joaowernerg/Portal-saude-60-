// Data de hoje e ano no rodapé
(function(){
  const dataHoje = document.getElementById('dataHoje');
  const anoAtual = document.getElementById('anoAtual');
  const hoje = new Date();
  const formatador = new Intl.DateTimeFormat('pt-BR', {
    weekday:'long', day:'2-digit', month:'long', year:'numeric'
  });
  if(dataHoje) dataHoje.textContent = formatador.format(hoje);
  if(anoAtual) anoAtual.textContent = hoje.getFullYear();
})();

// Menu mobile
(function(){
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('topNav');
  if(!btn || !nav) return;
  btn.addEventListener('click', ()=>{
    const aberto = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!aberto));
    nav.classList.toggle('open');
  });
})();

// Busca simples: rola até a seção se digitar a palavra
(function(){
  const form = document.getElementById('buscaForm');
  const input = document.getElementById('busca');
  if(!form || !input) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const q = input.value.toLowerCase().trim();
    const mapa = {
      'noticias':'#noticias', 'notícias':'#noticias',
      'jogos':'#jogos', 'videos':'#videos', 'vídeos':'#videos',
      'dicas':'#dicas', 'sobre':'#sobre'
    };
    const destino = mapa[q] || '#noticias';
    const alvo = document.querySelector(destino);
    if(alvo) alvo.scrollIntoView({ behavior:'smooth', block:'start' });
  });
})();

// Galeria com lightbox (usa as imagens dos botões)
(function(){
  const grid = document.getElementById('galeriaGrid');
  const lightbox = document.getElementById('galeriaLightbox');
  if(!grid || !lightbox) return;

  const viewer = lightbox.querySelector('.viewer');
  const prev = lightbox.querySelector('.prev');
  const next = lightbox.querySelector('.next');
  const closeBtn = lightbox.querySelector('.close');

  const itens = Array.from(grid.querySelectorAll('.media img'));
  let idxAtual = 0;

  function abrir(i){
    idxAtual = i;
    const src = itens[idxAtual].getAttribute('src');
    viewer.innerHTML = `<img src="${src}" alt="Imagem ampliada" />`;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function fechar(){
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    viewer.innerHTML = '';
  }
  function navegar(delta){
    idxAtual = (idxAtual + delta + itens.length) % itens.length;
    abrir(idxAtual);
  }

  itens.forEach((img, i)=>{
    img.closest('.media').addEventListener('click', ()=> abrir(i));
  });
  prev.addEventListener('click', ()=> navegar(-1));
  next.addEventListener('click', ()=> navegar(1));
  closeBtn.addEventListener('click', fechar);
  lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) fechar(); });
  window.addEventListener('keydown', (e)=>{
    if(!lightbox.classList.contains('active')) return;
    if(e.key === 'Escape') fechar();
    if(e.key === 'ArrowLeft') navegar(-1);
    if(e.key === 'ArrowRight') navegar(1);
  });
})();
