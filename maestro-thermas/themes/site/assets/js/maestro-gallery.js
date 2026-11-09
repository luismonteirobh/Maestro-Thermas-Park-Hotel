(function() {
  let galleryData = null;
  let activeCatKey = 'fazendinha';
  let activePhotoIdx = 0;
  let savedScrollY = null;

  // Neste site quem rola é o <html>; mudar o overflow do <body> zera a posição.
  // Trava a rolagem no <html> e devolve o visitante ao mesmo ponto ao fechar.
  function lockPageScroll() {
    if (savedScrollY === null) savedScrollY = window.scrollY;
    document.documentElement.style.setProperty('overflow', 'hidden');
  }

  function unlockPageScroll() {
    document.documentElement.style.removeProperty('overflow');
    if (savedScrollY !== null) {
      window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
      savedScrollY = null;
    }
  }

  async function loadData() {
    if (galleryData) return galleryData;
    try {
      const res = await fetch('/maestro-thermas/shared/images/fotos-maestro/gallery-data.json');
      galleryData = await res.json();
      return galleryData;
    } catch (e) {
      console.error('Erro ao carregar fotos da galeria:', e);
      return null;
    }
  }

  // O texto da galeria usa apenas <strong> e <em>; todo o resto é exibido como texto.
  function formatIntro(text) {
    const escaped = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/&lt;(\/?)(strong|em)&gt;/g, '<$1$2>');
  }

  async function openMaestroGallery(catKey) {
    const dataObj = await loadData();
    if (!dataObj || !dataObj[catKey]) return;
    activeCatKey = catKey;
    activePhotoIdx = 0;
    const cat = dataObj[catKey];

    const badge = document.getElementById('modal-category-badge');
    const title = document.getElementById('modal-category-title');
    const seoTitle = document.getElementById('modal-seo-title');
    const seoIntro = document.getElementById('modal-seo-intro');

    if (badge) badge.textContent = cat.badge || '';
    if (title) title.textContent = cat.title || '';
    if (seoTitle) seoTitle.textContent = cat.seoTitle || cat.title || '';
    if (seoIntro) seoIntro.innerHTML = formatIntro(cat.seoIntro || '');

    updateModalPhoto(cat);
    renderThumbnails(cat);

    const modal = document.getElementById('maestro-gallery-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
      lockPageScroll();
    }
  }

  function updateModalPhoto(cat) {
    if (!cat) {
      if (!galleryData || !galleryData[activeCatKey]) return;
      cat = galleryData[activeCatKey];
    }
    if (!cat.photos || !cat.photos.length) return;
    const photo = cat.photos[activePhotoIdx];
    const img = document.getElementById('modal-active-img');
    const counter = document.getElementById('modal-photo-counter');
    const caption = document.getElementById('modal-photo-caption');

    if (img) {
      img.src = photo.src;
      img.alt = photo.title || cat.title || 'Foto do Maestro Thermas';
    }
    if (counter) counter.textContent = (activePhotoIdx + 1) + ' / ' + cat.photos.length;
    if (caption) caption.textContent = photo.title || '';

    const thumbs = document.querySelectorAll('.modal-thumb-item');
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === activePhotoIdx);
    });
  }

  function renderThumbnails(cat) {
    const container = document.getElementById('modal-thumbnails-scroll');
    if (!container) return;
    container.innerHTML = '';
    cat.photos.forEach((p, i) => {
      const thumb = document.createElement('img');
      thumb.src = p.src;
      thumb.alt = p.title || '';
      thumb.className = 'modal-thumb-item' + (i === activePhotoIdx ? ' active' : '');
      thumb.onclick = function() {
        activePhotoIdx = i;
        updateModalPhoto(cat);
      };
      container.appendChild(thumb);
    });
  }

  function nextMaestroPhoto() {
    if (!galleryData || !galleryData[activeCatKey]) return;
    const cat = galleryData[activeCatKey];
    if (!cat.photos) return;
    activePhotoIdx = (activePhotoIdx + 1) % cat.photos.length;
    updateModalPhoto(cat);
  }

  function prevMaestroPhoto() {
    if (!galleryData || !galleryData[activeCatKey]) return;
    const cat = galleryData[activeCatKey];
    if (!cat.photos) return;
    activePhotoIdx = (activePhotoIdx - 1 + cat.photos.length) % cat.photos.length;
    updateModalPhoto(cat);
  }

  function closeMaestroGallery() {
    const modal = document.getElementById('maestro-gallery-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
    unlockPageScroll();
  }

  function handleModalOverlayClick(e) {
    if (e.target && e.target.id === 'maestro-gallery-modal') {
      closeMaestroGallery();
    }
  }

  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('maestro-gallery-modal');
    if (modal && modal.style.display === 'flex') {
      if (e.key === 'Escape') closeMaestroGallery();
      if (e.key === 'ArrowRight') nextMaestroPhoto();
      if (e.key === 'ArrowLeft') prevMaestroPhoto();
    }
  });

  window.openMaestroGallery = openMaestroGallery;
  window.closeMaestroGallery = closeMaestroGallery;
  window.nextMaestroPhoto = nextMaestroPhoto;
  window.prevMaestroPhoto = prevMaestroPhoto;
  window.handleModalOverlayClick = handleModalOverlayClick;
})();
