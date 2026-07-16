/* ============================================================
   OW LOGISTICS — SHARED FORM HANDLER  (Contact + Demo pages)
   Floating-label validation, inline errors, button states, and
   submission to the live OWL HubSpot form via the Forms API.

   Usage:
     OwlForms.init({
       formId:'contactForm', cardId:'contactCard', errorId:'contactError',
       portalId:'43156652', guid:'<hubspot-form-guid>'
     });

   When the page is opened from file:// (concept preview) the network
   call is skipped and a successful send is simulated, so the full
   UX flow is reviewable offline. In production (https) it performs the
   real HubSpot submission and only shows success on a 200 response.
   Designed & built by Studio Nine — https://studionine.agency
   ============================================================ */
window.OwlForms = (function () {
  'use strict';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function input(field) { return field.querySelector('input, textarea'); }

  function validate(field) {
    var el = input(field), v = el.value.trim(), msgEl = field.querySelector('.field-msg');
    var ok = true, msg = '';
    if (el.required && !v) { ok = false; msg = el.getAttribute('data-msg') || 'This field is required'; }
    else if (v && el.type === 'email' && !EMAIL.test(v)) { ok = false; msg = 'Enter a valid email address'; }
    else if (v && el.getAttribute('data-kind') === 'url' && !/[a-z0-9][a-z0-9-]*\.[a-z]{2,}/i.test(v)) { ok = false; msg = 'Enter a valid website'; }
    field.classList.toggle('invalid', !ok);
    if (msgEl && msg) msgEl.textContent = msg;
    return ok;
  }

  function init(opts) {
    var form = document.getElementById(opts.formId);
    if (!form) return;
    var card = document.getElementById(opts.cardId);
    var errEl = opts.errorId ? document.getElementById(opts.errorId) : null;
    var btn = form.querySelector('.form-submit');
    var fields = [].slice.call(form.querySelectorAll('.field'));

    fields.forEach(function (f) {
      var el = input(f);
      el.addEventListener('blur', function () { if (el.value.trim() || el.required) validate(f); });
      el.addEventListener('input', function () { if (f.classList.contains('invalid')) validate(f); });
    });

    function value(name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }

    function payload() {
      var web = value('website');
      if (web && !/^https?:\/\//i.test(web)) web = 'https://' + web;
      var f = [
        { name: 'firstname', value: value('firstname') },
        { name: 'lastname',  value: value('lastname') },
        { name: 'email',     value: value('email') },
        { name: 'company',   value: value('company') },
        { name: 'website',   value: web },
        { name: 'comment',   value: value('comment') }
      ].filter(function (x) { return x.value !== ''; });
      return { fields: f, context: { pageUri: location.href, pageName: document.title } };
    }

    function succeed() {
      if (card) {
        card.classList.add('done');
        if (card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    function fail() {
      btn.classList.remove('loading'); btn.disabled = false;
      if (errEl) errEl.style.display = 'block';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errEl) errEl.style.display = 'none';
      var allOK = true, firstBad = null;
      fields.forEach(function (f) { var ok = validate(f); if (!ok) { allOK = false; if (!firstBad) firstBad = f; } });
      if (!allOK) { if (firstBad) input(firstBad).focus(); return; }

      btn.classList.add('loading'); btn.disabled = true;

      // Concept preview from file:// — simulate a real send so the flow is reviewable.
      if (location.protocol === 'file:') { setTimeout(succeed, 950); return; }

      var url = 'https://api.hsforms.com/submissions/v3/integration/submit/' + opts.portalId + '/' + opts.guid;
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
        .then(function (r) { if (r.ok) succeed(); else fail(); })
        .catch(fail);
    });
  }

  return { init: init };
})();
