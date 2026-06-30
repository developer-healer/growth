'use strict';
(function () {

  /* ── Header scroll state ── */
  var hd = document.getElementById('hd');
  var inner = document.body.classList.contains('inner-page');
  window.addEventListener('scroll', function () {
    var s = window.scrollY > 40 || inner;
    hd.classList.toggle('scrolled', s);
    hd.classList.toggle('top-light', !s && !inner);
  }, { passive: true });

  /* ── Mobile menu ── */
  var mm     = document.getElementById('mm');
  var mmbd   = document.getElementById('mm-bd');
  var burger = document.querySelector('.burger');

  function openMenu() {
    mm.classList.add('open');
    if (mmbd) mmbd.classList.add('open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var mc = mm.querySelector('.mclose');
    if (mc) mc.focus();
  }
  function closeMenu() {
    mm.classList.remove('open');
    if (mmbd) mmbd.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (burger) burger.focus();
  }

  if (burger) burger.addEventListener('click', openMenu);
  var mc = mm.querySelector('.mclose');
  if (mc) mc.addEventListener('click', closeMenu);
  if (mmbd) mmbd.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mm.classList.contains('open')) closeMenu();
  });
  mm.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ── QA accordion (exclusive) ── */
  document.querySelectorAll('.qitem').forEach(function (it) {
    var btn = it.querySelector('.qq');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = it.classList.contains('open');
      document.querySelectorAll('.qitem').forEach(function (el) {
        el.classList.remove('open');
        var qb = el.querySelector('.qbody');
        if (qb) qb.style.maxHeight = null;
        var qbtn = el.querySelector('.qq');
        if (qbtn) qbtn.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        it.classList.add('open');
        var qb = it.querySelector('.qbody');
        if (qb) qb.style.maxHeight = qb.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Scroll reveal ── */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* ── Contact form ── */
  var cform = document.querySelector('.cform');
  if (cform) {
    var SERVICE_LABELS = {
      asphalt:  'アスファルト舗装',
      carport:  'カーポート',
      turf:     '人工芝・植栽',
      garden:   '花壇・お庭づくり',
      fence:    'フェンス・門まわり',
      concrete: '土間コンクリート',
      deck:     'デッキ・テラス',
      other:    'その他・外構全般'
    };

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var TEL_RE   = /^[\d\-\+\(\)\s]{10,}$/;

    function clearErrors() {
      cform.querySelectorAll('.form-error').forEach(function (el) { el.remove(); });
      cform.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
    }

    function addError(field, msg) {
      field.classList.add('input-error');
      var p = document.createElement('p');
      p.className = 'form-error';
      p.textContent = msg;
      field.parentNode.appendChild(p);
    }

    function addCheckError(msg) {
      var row = cform.querySelector('.check-row').closest('.frow');
      var p = document.createElement('p');
      p.className = 'form-error';
      p.textContent = msg;
      row.appendChild(p);
    }

    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var name    = document.getElementById('name');
      var tel     = document.getElementById('tel');
      var email   = document.getElementById('email');
      var message = document.getElementById('message');
      var service = document.getElementById('service');
      var company = document.getElementById('company');
      var privacy = cform.querySelector('input[name="privacy"]');

      var ok = true;
      if (!name.value.trim())                       { addError(name,    'お名前を入力してください');                 ok = false; }
      if (!tel.value.trim())                        { addError(tel,     '電話番号を入力してください');               ok = false; }
      else if (!TEL_RE.test(tel.value.trim()))      { addError(tel,     '正しい電話番号を入力してください');         ok = false; }
      if (!email.value.trim())                      { addError(email,   'メールアドレスを入力してください');         ok = false; }
      else if (!EMAIL_RE.test(email.value.trim()))  { addError(email,   '正しいメールアドレスを入力してください'); ok = false; }
      if (!message.value.trim())                    { addError(message, 'お問い合わせ内容を入力してください');       ok = false; }
      if (!privacy.checked)                         { addCheckError('プライバシーポリシーに同意していません');       ok = false; }

      if (!ok) return;

      var endpoint  = cform.getAttribute('action');
      var submitBtn = cform.querySelector('.fsub');
      var serviceLabel = service.value ? (SERVICE_LABELS[service.value] || service.value) : '未選択';

      if (!endpoint || endpoint === '#') {
        var body = [
          'growth株式会社 お問い合わせフォームより',
          '',
          '【お名前】'           + name.value.trim(),
          '【会社名・屋号】'     + (company.value.trim() || 'なし'),
          '【電話番号】'         + tel.value.trim(),
          '【メールアドレス】'   + email.value.trim(),
          '【ご相談内容の種類】' + serviceLabel,
          '',
          '【お問い合わせ内容】',
          message.value.trim(),
        ].join('\n');
        window.location.href =
          'mailto:growth-0715@outlook.jp' +
          '?subject=' + encodeURIComponent('【growth】お問い合わせ') +
          '&body='    + encodeURIComponent(body);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '送信中…';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    name.value.trim(),
          company: company.value.trim(),
          tel:     tel.value.trim(),
          email:   email.value.trim(),
          service: serviceLabel,
          message: message.value.trim(),
        })
      })
      .then(function (res) {
        if (res.ok) {
          var success = document.createElement('div');
          success.className = 'form-success';
          success.innerHTML =
            '<div class="fs-icon">✓</div>' +
            '<h3>送信が完了しました</h3>' +
            '<p>2営業日以内にご連絡いたします。</p>';
          cform.replaceWith(success);
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = '送信する';
          alert('送信に失敗しました。お手数ですが、お電話にてご連絡ください。');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
        alert('送信に失敗しました。お手数ですが、お電話にてご連絡ください。');
      });
    });
  }

})();
