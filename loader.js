'use strict';
(function () {
  var el = document.createElement('div');
  el.id = 'page-loader';
  document.body.prepend(el);
  document.body.style.overflow = 'hidden';

  function dismiss() {
    document.body.style.overflow = '';
    el.classList.add('hidden');
    setTimeout(function () { el.remove(); }, 450);
  }

  if (document.readyState === 'complete') {
    setTimeout(dismiss, 100);
  } else {
    window.addEventListener('load', dismiss, { once: true });
    setTimeout(dismiss, 3000);
  }
})();
