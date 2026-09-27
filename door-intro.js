(function () {
  var overlay = document.getElementById('doorIntro');
  if (!overlay) return;

  var zoom = document.getElementById('siteZoom');
  var root = document.documentElement;
  root.classList.add('door-lock');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    overlay.classList.add('hidden');
    root.classList.remove('door-lock');
  }

  function openDoors() {
    if (reduced) {
      overlay.style.transition = 'opacity .5s ease';
      requestAnimationFrame(function () { overlay.style.opacity = '0'; });
      setTimeout(finish, 550);
      return;
    }
    requestAnimationFrame(function () {
      overlay.classList.add('opening');
      if (zoom) zoom.classList.add('zoomed');
    });
    overlay.addEventListener('transitionend', function (e) {
      if (e.target === overlay.querySelector('.door-left') && e.propertyName === 'transform') {
        finish();
      }
    });
    // Fallback in case transitionend doesn't fire on this target/browser.
    setTimeout(finish, 4000);
  }

  if (document.readyState === 'complete') {
    setTimeout(openDoors, 850);
  } else {
    window.addEventListener('load', function () { setTimeout(openDoors, 850); });
  }
})();
