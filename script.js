function scrollToPageTop() {
  if (window.location.hash) {
    return;
  }

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function enableFormFields() {
  document.querySelectorAll('[tabindex="-1"]').forEach((field) => {
    field.removeAttribute('tabindex');
  });
}

function setupAnchorNavigation() {
  document.documentElement.classList.add('nav-smooth');

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      enableFormFields();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupFormFieldUnlock() {
  const unlock = () => {
    enableFormFields();
  };

  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('click', unlock, { once: true });
  window.setTimeout(unlock, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  scrollToPageTop();
  setupFormFieldUnlock();
  setupAnchorNavigation();

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
    });
  });

  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    enableFormFields();
    bookingForm.classList.add('hidden');
    bookingSuccess.classList.remove('hidden');
  });

  const trackingForm = document.getElementById('trackingForm');
  const trackingAlert = document.getElementById('trackingAlert');
  const trackingSuccess = document.getElementById('trackingSuccess');

  trackingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    enableFormFields();

    const feedings = parseInt(document.getElementById('feedings').value, 10) || 0;
    const wetDiapers = parseInt(document.getElementById('wetDiapers').value, 10) || 0;
    const mood = document.getElementById('mood').value;

    trackingAlert.classList.add('hidden');
    trackingSuccess.classList.add('hidden');

    const needsAttention =
      feedings < 6 ||
      wetDiapers < 4 ||
      mood === 'bad';

    if (needsAttention) {
      trackingAlert.classList.remove('hidden');
    } else {
      trackingSuccess.classList.remove('hidden');
    }
  });

  const videoModal = document.getElementById('videoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');
  const videoEmbedWrap = document.getElementById('videoEmbedWrap');

  const openVideo = (title, youtubeId) => {
    enableFormFields();
    modalTitle.textContent = title;
    videoEmbedWrap.innerHTML = '';

    const youtubePlayer = document.createElement('iframe');
    youtubePlayer.title = title;
    youtubePlayer.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    youtubePlayer.allowFullscreen = true;
    youtubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&hl=he&playsinline=1`;
    videoEmbedWrap.appendChild(youtubePlayer);

    videoModal.classList.remove('hidden');
    videoModal.removeAttribute('aria-hidden');
    videoModal.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    videoEmbedWrap.innerHTML = '';
    videoModal.classList.add('hidden');
    videoModal.setAttribute('aria-hidden', 'true');
    videoModal.setAttribute('inert', '');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.video-btn, .video-link').forEach(btn => {
    btn.addEventListener('click', () => {
      openVideo(btn.dataset.video, btn.dataset.youtubeId);
    });
  });

  modalClose.addEventListener('click', closeVideo);

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeVideo();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
      closeVideo();
    }
  });
});

window.addEventListener('load', scrollToPageTop);
