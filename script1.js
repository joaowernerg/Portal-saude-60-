document.addEventListener('DOMContentLoaded', () => {
  // ===== Menu mobile =====
  const menuBtn = document.getElementById('menuBtn');
  const topNav = document.getElementById('topNav');
  if (menuBtn && topNav) {
    menuBtn.addEventListener('click', () => {
      const open = topNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ===== Voltar ao topo =====
  const toTop = document.getElementById('toTop');
  const showToTop = () => {
    if (!toTop) return;
    if (window.scrollY > 400) toTop.classList.add('show');
    else toTop.classList.remove('show');
  };
  document.addEventListener('scroll', showToTop);
  showToTop();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== Links de âncora com rolagem suave (inclui logo e "Início") =====
  document.querySelectorAll('a[href="#"], a[href="#inicio"], a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href === '#') {
        e.preventDefault();
        document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (href.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Barra de progresso de leitura =====
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height ? (scrollTop / height) * 100 : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
  };
  document.addEventListener('scroll', updateProgress);
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // ===== Data e ano no rodapé =====
  const dataHoje = document.getElementById('dataHoje');
  const anoAtual = document.getElementById('anoAtual');
  const now = new Date();
  dataHoje && (dataHoje.textContent = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }));
  anoAtual && (anoAtual.textContent = now.getFullYear());

  // ===== Inserir link do vídeo da Professora Clarisse (placeholder) =====
  document.querySelectorAll('[data-addlink]').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = prompt('Cole o link do vídeo (YouTube, Vimeo etc.):');
      if (!url) return;
      const card = btn.closest('.card');
      const thumb = card?.querySelector('.thumb.placeholder');
      if (thumb) {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('title', 'Vídeo Professora Clarisse');
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('allowfullscreen', '');

        // YouTube (formatos comuns)
        if (url.includes('youtube.com/watch?v=')) {
          const id = new URL(url).searchParams.get('v');
          iframe.src = `https://www.youtube.com/embed/${id}`;
          thumb.replaceWith(iframe);
        } else if (url.includes('youtu.be/')) {
          const id = url.split('youtu.be/')[1].split(/[?&]/)[0];
          iframe.src = `https://www.youtube.com/embed/${id}`;
          thumb.replaceWith(iframe);
        } else {
          // Fallback: vira link externo
          const wrapper = document.createElement('a');
          wrapper.href = url; wrapper.target = '_blank'; wrapper.rel = 'noopener';
          wrapper.className = 'thumb canva';
          wrapper.innerHTML = '<span class="chip"><i class="fa-solid fa-up-right-from-square"></i> Abrir vídeo</span>';
          thumb.replaceWith(wrapper);
        }

        const p = card.querySelector('.card-body p');
        if (p) p.textContent = 'Assista ao conteúdo enviado.';
        btn.remove();
      }
    });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  // ===== Menu mobile =====
  const menuBtn = document.getElementById('menuBtn');
  const topNav = document.getElementById('topNav');
  if (menuBtn && topNav) {
    menuBtn.addEventListener('click', () => {
      const open = topNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ===== Data no hero & ano no rodapé =====
  const dataHoje = document.getElementById('dataHoje');
  const anoAtual = document.getElementById('anoAtual');
  const now = new Date();
  dataHoje && (dataHoje.textContent = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }));
  anoAtual && (anoAtual.textContent = now.getFullYear());

  // ===== Busca rápida por seções (notícias / jogos / vídeos / dicas) =====
  const form = document.getElementById('buscaForm');
  const input = document.getElementById('busca');
  const mapa = {
    'noticia':'#noticias','notícias':'#noticias','noticias':'#noticias',
    'jogo':'#jogos','jogos':'#jogos',
    'video':'#videos','vídeo':'#videos','videos':'#videos','vídeos':'#videos',
    'dica':'#dicas','dicas':'#dicas'
  };
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (input?.value || '').trim().toLowerCase();
    let destino = null;
    for (const chave in mapa) {
      if (q.includes(chave)) { destino = mapa[chave]; break; }
    }
    if (!destino) destino = '#noticias'; // fallback
    document.querySelector(destino)?.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});
