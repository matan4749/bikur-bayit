function scrollToPageTop() {
  if (window.location.hash) {
    return;
  }

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function ensurePageStartsAtTop() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  scrollToPageTop();
  window.addEventListener('load', scrollToPageTop, { once: true });
  window.addEventListener('pageshow', scrollToPageTop);

  if (isIOS()) {
    [0, 50, 150, 300, 600, 1000].forEach((delay) => {
      setTimeout(scrollToPageTop, delay);
    });
  }
}

function preventInitialInputFocusScroll() {
  if (!isIOS() || window.location.hash) {
    return;
  }

  let allowFocus = false;

  setTimeout(() => {
    allowFocus = true;
  }, 1200);

  document.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener(
      'focus',
      (event) => {
        if (!allowFocus) {
          event.preventDefault();
          field.blur();
          scrollToPageTop();
        }
      },
      true
    );
  });
}

ensurePageStartsAtTop();

document.addEventListener('DOMContentLoaded', () => {
  scrollToPageTop();
  requestAnimationFrame(scrollToPageTop);
  preventInitialInputFocusScroll();

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
    bookingForm.classList.add('hidden');
    bookingSuccess.classList.remove('hidden');
  });

  const trackingForm = document.getElementById('trackingForm');
  const trackingAlert = document.getElementById('trackingAlert');
  const trackingSuccess = document.getElementById('trackingSuccess');

  trackingForm.addEventListener('submit', (e) => {
    e.preventDefault();

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
  let youtubePlayer = null;

  const openVideo = (title, youtubeId) => {
    modalTitle.textContent = title;
    videoEmbedWrap.innerHTML = '';

    youtubePlayer = document.createElement('iframe');
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
    youtubePlayer = null;
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
