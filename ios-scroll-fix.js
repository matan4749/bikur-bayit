(function () {
  if (window.location.hash) {
    return;
  }

  var docEl = document.documentElement;
  var body = document.body;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  function scrollToTop() {
    window.scrollTo(0, 0);
    docEl.scrollTop = 0;
    body.scrollTop = 0;
  }

  function lockScroll() {
    docEl.classList.add('ios-scroll-lock');
    scrollToTop();
  }

  function unlockScroll() {
    docEl.classList.remove('ios-scroll-lock');
    scrollToTop();
  }

  scrollToTop();
  lockScroll();

  document.addEventListener('DOMContentLoaded', function () {
    scrollToTop();
    window.setTimeout(unlockScroll, 1200);
  });

  window.addEventListener('load', function () {
    scrollToTop();
    [0, 100, 300, 600, 1200].forEach(function (delay) {
      window.setTimeout(scrollToTop, delay);
    });
    window.setTimeout(unlockScroll, 1300);
  });

  window.addEventListener('pageshow', function (event) {
    lockScroll();
    scrollToTop();
    window.setTimeout(unlockScroll, event.persisted ? 800 : 1200);
  });
})();
