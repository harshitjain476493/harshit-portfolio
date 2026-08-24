/* =========================================================
   HARSHIT JAIN — PORTFOLIO SCRIPT
   ---------------------------------------------------------
   1. Motion preferences + capability detection
   2. Mobile navigation
   3. Sticky header + scroll progress
   4. Scroll reveal
   5. 3D pointer tilt + spotlight
   6. Hero parallax orbs
   7. Hero typewriter
   8. Animated stat counters
   9. Image fallbacks
   10. Certificate lightbox
   11. Contact form — FormSubmit AJAX
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. Preferences & capabilities
     --------------------------------------------------------- */

  var reduceMotionQuery = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  var finePointerQuery = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  );

  function prefersReducedMotion() {
    return reduceMotionQuery.matches;
  }

  function supportsRichMotion() {
    return finePointerQuery.matches && !prefersReducedMotion();
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }


  /* ---------------------------------------------------------
     2. Mobile navigation
     --------------------------------------------------------- */

  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');

    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute(
        'aria-expanded',
        open ? 'true' : 'false'
      );

      toggle.setAttribute(
        'aria-label',
        open ? 'Close menu' : 'Open menu'
      );

      nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(
        toggle.getAttribute('aria-expanded') !== 'true'
      );
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;

      if (
        event.target.closest('#site-nav') ||
        event.target.closest('#nav-toggle')
      ) {
        return;
      }

      setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        setOpen(false);
      }
    });
  }


  /* ---------------------------------------------------------
     3. Sticky header + scroll progress
     --------------------------------------------------------- */

  function initScrollChrome() {
    var topbar = document.getElementById('topbar');
    var progress = document.getElementById('scroll-progress');
    var ticking = false;

    function update() {
      var scrolled =
        window.pageYOffset ||
        document.documentElement.scrollTop;

      if (topbar) {
        topbar.classList.toggle(
          'is-stuck',
          scrolled > 12
        );
      }

      if (progress) {
        var height =
          document.documentElement.scrollHeight -
          window.innerHeight;

        var ratio =
          height > 0
            ? Math.min(scrolled / height, 1)
            : 0;

        progress.style.transform =
          'scaleX(' + ratio + ')';
      }

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;

        ticking = true;

        window.requestAnimationFrame(update);
      },
      { passive: true }
    );

    update();
  }


  /* ---------------------------------------------------------
     4. Scroll reveal
     --------------------------------------------------------- */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');

    if (!items.length) return;

    if (
      !('IntersectionObserver' in window) ||
      prefersReducedMotion()
    ) {
      Array.prototype.forEach.call(
        items,
        function (el) {
          el.classList.add('is-visible');
        }
      );

      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('is-visible');

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    var groups = new Map();

    Array.prototype.forEach.call(
      items,
      function (el) {
        var parent =
          el.parentElement || document.body;

        var index = groups.get(parent) || 0;

        groups.set(parent, index + 1);

        el.style.transitionDelay =
          Math.min(index * 70, 350) + 'ms';

        observer.observe(el);
      }
    );
  }


  /* ---------------------------------------------------------
     5. 3D pointer tilt + spotlight
     --------------------------------------------------------- */

  function initTilt() {
    var cards = document.querySelectorAll('[data-tilt]');

    if (!cards.length) return;

    var enabled = supportsRichMotion();

    Array.prototype.forEach.call(
      cards,
      function (card) {
        var max =
          parseFloat(
            card.getAttribute('data-tilt-max')
          ) || 5;

        var frame = null;

        function reset() {
          card.classList.remove('is-tilting');

          card.style.setProperty(
            '--rx',
            '0deg'
          );

          card.style.setProperty(
            '--ry',
            '0deg'
          );
        }

        card.addEventListener(
          'pointermove',
          function (event) {
            var rect =
              card.getBoundingClientRect();

            var px =
              (event.clientX - rect.left) /
              rect.width;

            var py =
              (event.clientY - rect.top) /
              rect.height;

            card.style.setProperty(
              '--mx',
              (px * 100).toFixed(2) + '%'
            );

            card.style.setProperty(
              '--my',
              (py * 100).toFixed(2) + '%'
            );

            if (!enabled) return;

            if (frame) return;

            frame =
              window.requestAnimationFrame(
                function () {
                  frame = null;

                  card.classList.add(
                    'is-tilting'
                  );

                  card.style.setProperty(
                    '--ry',
                    (
                      (px - 0.5) *
                      2 *
                      max
                    ).toFixed(2) + 'deg'
                  );

                  card.style.setProperty(
                    '--rx',
                    (
                      (0.5 - py) *
                      2 *
                      max
                    ).toFixed(2) + 'deg'
                  );
                }
              );
          }
        );

        card.addEventListener(
          'pointerleave',
          reset
        );

        card.addEventListener(
          'blur',
          reset,
          true
        );
      }
    );

    if (
      typeof reduceMotionQuery.addEventListener ===
      'function'
    ) {
      reduceMotionQuery.addEventListener(
        'change',
        function () {
          enabled = supportsRichMotion();

          if (enabled) return;

          Array.prototype.forEach.call(
            cards,
            function (card) {
              card.classList.remove(
                'is-tilting'
              );

              card.style.setProperty(
                '--rx',
                '0deg'
              );

              card.style.setProperty(
                '--ry',
                '0deg'
              );
            }
          );
        }
      );
    }
  }


  /* ---------------------------------------------------------
     6. Hero parallax orbs
     --------------------------------------------------------- */

  function initParallax() {
    var orbs =
      document.querySelectorAll('[data-parallax]');

    if (
      !orbs.length ||
      !supportsRichMotion()
    ) {
      return;
    }

    var frame = null;
    var pointerX = 0;
    var pointerY = 0;

    function apply() {
      frame = null;

      Array.prototype.forEach.call(
        orbs,
        function (orb) {
          var depth =
            parseFloat(
              orb.getAttribute('data-parallax')
            ) || 12;

          orb.style.transform =
            'translate3d(' +
            (pointerX * depth).toFixed(2) +
            'px,' +
            (pointerY * depth).toFixed(2) +
            'px,0)';
        }
      );
    }

    window.addEventListener(
      'pointermove',
      function (event) {
        pointerX =
          event.clientX /
            window.innerWidth -
          0.5;

        pointerY =
          event.clientY /
            window.innerHeight -
          0.5;

        if (frame) return;

        frame =
          window.requestAnimationFrame(apply);
      },
      { passive: true }
    );
  }


  /* ---------------------------------------------------------
     7. Hero typewriter
     --------------------------------------------------------- */

  function initTypewriter() {
    var target =
      document.getElementById('typewriter');

    if (!target) return;

    var lines = [
      '<span class="tok-kw">const</span> <span class="tok-fn">engineer</span> <span class="tok-punc">=</span> <span class="tok-punc">{</span>',
      '&nbsp;&nbsp;<span class="tok-key">name</span><span class="tok-punc">:</span> <span class="tok-str">"Harshit Jain"</span><span class="tok-punc">,</span>',
      '&nbsp;&nbsp;<span class="tok-key">role</span><span class="tok-punc">:</span> <span class="tok-str">"Software Engineer"</span><span class="tok-punc">,</span>',
      '&nbsp;&nbsp;<span class="tok-key">based</span><span class="tok-punc">:</span> <span class="tok-str">"Indore, India"</span><span class="tok-punc">,</span>',
      '&nbsp;&nbsp;<span class="tok-key">stack</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"Java"</span><span class="tok-punc">,</span> <span class="tok-str">"Spring Boot"</span><span class="tok-punc">,</span> <span class="tok-str">"ReactJS"</span><span class="tok-punc">,</span> <span class="tok-str">"Node.js"</span><span class="tok-punc">],</span>',
      '&nbsp;&nbsp;<span class="tok-key">alsoWrites</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"REST APIs"</span><span class="tok-punc">,</span> <span class="tok-str">"Automation"</span><span class="tok-punc">,</span> <span class="tok-str">"Backend Systems"</span><span class="tok-punc">],</span>',
      '&nbsp;&nbsp;<span class="tok-key">dsaSolved</span><span class="tok-punc">:</span> <span class="tok-bool">300</span><span class="tok-punc">,</span>',
      '&nbsp;&nbsp;<span class="tok-key">openToWork</span><span class="tok-punc">:</span> <span class="tok-bool">true</span>',
      '<span class="tok-punc">};</span>'
    ];

    function renderAll() {
      target.innerHTML = '';

      lines.forEach(function (html, index) {
        var row =
          document.createElement('div');

        row.innerHTML =
          '<span class="ln">' +
          (index + 1) +
          '</span>' +
          html;

        target.appendChild(row);
      });

      var caret =
        document.createElement('div');

      caret.innerHTML =
        '<span class="ln">' +
        (lines.length + 1) +
        '</span><span class="cursor"></span>';

      target.appendChild(caret);
    }

    if (prefersReducedMotion()) {
      renderAll();
      return;
    }

    target.innerHTML = '';

    var lineIndex = 0;

    function renderLine() {
      if (lineIndex >= lines.length) {
        var caret =
          document.createElement('div');

        caret.innerHTML =
          '<span class="ln">' +
          (lines.length + 1) +
          '</span><span class="cursor"></span>';

        target.appendChild(caret);

        return;
      }

      var row =
        document.createElement('div');

      var gutter =
        document.createElement('span');

      gutter.className = 'ln';

      gutter.textContent =
        String(lineIndex + 1);

      row.appendChild(gutter);

      var content =
        document.createElement('span');

      row.appendChild(content);

      target.appendChild(row);

      var html = lines[lineIndex];

      var charIndex = 0;
      var chunk = 4;

      (function typeChunk() {
        charIndex += chunk;

        var slice =
          html.slice(0, charIndex);

        var open =
          (slice.match(/</g) || []).length;

        var close =
          (slice.match(/>/g) || []).length;

        if (open === close) {
          content.innerHTML = slice;
        }

        if (charIndex < html.length) {
          window.setTimeout(
            typeChunk,
            10
          );
        } else {
          content.innerHTML = html;

          lineIndex++;

          window.setTimeout(
            renderLine,
            85
          );
        }
      })();
    }

    window.setTimeout(
      renderLine,
      350
    );
  }


  /* ---------------------------------------------------------
     8. Animated stat counters
     --------------------------------------------------------- */

  function initCounters() {
    var counters =
      document.querySelectorAll(
        '[data-count]'
      );

    if (!counters.length) return;

    function paint(el, value) {
      var decimals =
        parseInt(
          el.getAttribute('data-decimals') ||
          '0',
          10
        );

      var prefix =
        el.getAttribute('data-prefix') ||
        '';

      var suffix =
        el.getAttribute('data-suffix') ||
        '';

      el.textContent =
        prefix +
        value.toFixed(decimals) +
        suffix;
    }

    function run(el) {
      var end =
        parseFloat(
          el.getAttribute('data-count')
        );

      if (isNaN(end)) return;

      if (prefersReducedMotion()) {
        paint(el, end);
        return;
      }

      var duration = 1100;
      var start = null;

      function step(timestamp) {
        if (start === null) {
          start = timestamp;
        }

        var progress =
          Math.min(
            (timestamp - start) /
              duration,
            1
          );

        var eased =
          1 -
          Math.pow(
            1 - progress,
            3
          );

        paint(
          el,
          end * eased
        );

        if (progress < 1) {
          window.requestAnimationFrame(
            step
          );
        }
      }

      window.requestAnimationFrame(step);
    }

    if (
      !('IntersectionObserver' in window)
    ) {
      Array.prototype.forEach.call(
        counters,
        run
      );

      return;
    }

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              if (!entry.isIntersecting) {
                return;
              }

              run(entry.target);

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.4
        }
      );

    Array.prototype.forEach.call(
      counters,
      function (el) {
        paint(el, 0);
        observer.observe(el);
      }
    );
  }


  /* ---------------------------------------------------------
     9. Image fallbacks
     --------------------------------------------------------- */

  function initImageFallbacks() {
    var images =
      document.querySelectorAll(
        '[data-fallback] img'
      );

    function markMissing(img) {
      var holder =
        img.closest('[data-fallback]');

      if (holder) {
        holder.classList.add(
          'is-missing'
        );
      }
    }

    Array.prototype.forEach.call(
      images,
      function (img) {
        img.addEventListener(
          'error',
          function () {
            markMissing(img);
          }
        );

        if (
          img.complete &&
          img.naturalWidth === 0
        ) {
          markMissing(img);
        }
      }
    );
  }


  /* ---------------------------------------------------------
     10. Certificate lightbox
     --------------------------------------------------------- */

  function initLightbox() {
    var triggers =
      document.querySelectorAll(
        '[data-lightbox]'
      );

    if (!triggers.length) return;

    var overlay =
      document.createElement('div');

    overlay.className = 'lightbox';

    overlay.setAttribute(
      'role',
      'dialog'
    );

    overlay.setAttribute(
      'aria-modal',
      'true'
    );

    overlay.setAttribute(
      'aria-label',
      'Certificate preview'
    );

    overlay.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Close preview">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg></button>' +
      '<figure class="lightbox__figure">' +
      '<img class="lightbox__img" src="" alt="">' +
      '<figcaption class="lightbox__caption"></figcaption>' +
      '</figure>';

    document.body.appendChild(
      overlay
    );

    var image =
      overlay.querySelector(
        '.lightbox__img'
      );

    var caption =
      overlay.querySelector(
        '.lightbox__caption'
      );

    var closeBtn =
      overlay.querySelector(
        '.lightbox__close'
      );

    var lastFocused = null;

    function open(src, label) {
      lastFocused =
        document.activeElement;

      image.setAttribute(
        'src',
        src
      );

      image.setAttribute(
        'alt',
        label
      );

      caption.textContent = label;

      overlay.classList.add(
        'is-open'
      );

      document.body.style.overflow =
        'hidden';

      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove(
        'is-open'
      );

      document.body.style.overflow =
        '';

      image.setAttribute(
        'src',
        ''
      );

      if (
        lastFocused &&
        typeof lastFocused.focus ===
          'function'
      ) {
        lastFocused.focus();
      }
    }

    Array.prototype.forEach.call(
      triggers,
      function (trigger) {
        trigger.addEventListener(
          'click',
          function (event) {
            var src =
              trigger.getAttribute(
                'data-lightbox'
              );

            if (!src) return;

            if (
              trigger.classList.contains(
                'is-missing'
              )
            ) {
              return;
            }

            event.preventDefault();

            open(
              src,
              trigger.getAttribute(
                'data-lightbox-label'
              ) || 'Certificate'
            );
          }
        );
      }
    );

    closeBtn.addEventListener(
      'click',
      close
    );

    overlay.addEventListener(
      'click',
      function (event) {
        if (
          event.target === overlay
        ) {
          close();
        }
      }
    );

    document.addEventListener(
      'keydown',
      function (event) {
        if (
          event.key === 'Escape' &&
          overlay.classList.contains(
            'is-open'
          )
        ) {
          close();
        }

        if (
          event.key === 'Tab' &&
          overlay.classList.contains(
            'is-open'
          )
        ) {
          event.preventDefault();
          closeBtn.focus();
        }
      }
    );
  }


  /* ---------------------------------------------------------
     11. CONTACT FORM
     FormSubmit AJAX
     --------------------------------------------------------- */

  function initContactForm() {
    var form =
      document.getElementById(
        'contact-form'
      );

    if (!form) return;

    var status =
      document.getElementById(
        'contact-status'
      );

    var submit =
      document.getElementById(
        'contact-submit'
      );

    var originalText =
      submit
        ? submit.textContent
        : 'Send message';

    function setStatus(
      message,
      type
    ) {
      if (!status) return;

      status.style.display =
        'block';

      status.className =
        'form-status' +
        (
          type
            ? ' form-status--' + type
            : ''
        );

      status.textContent =
        message;
    }

    form.addEventListener(
      'submit',
      async function (event) {
        /*
         * IMPORTANT:
         * Stop the browser from opening Outlook
         * or navigating away from the portfolio.
         */
        event.preventDefault();

        /*
         * Validate the form.
         */
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        /*
         * Disable button while sending.
         */
        if (submit) {
          submit.disabled = true;
          submit.textContent =
            'Sending…';
        }

        setStatus(
          'Sending your message…',
          'sending'
        );

        try {
          /*
           * Send directly to FormSubmit AJAX endpoint.
           */
          var response =
            await fetch(
              form.action,
              {
                method: 'POST',

                body:
                  new FormData(form),

                headers: {
                  'Accept':
                    'application/json'
                }
              }
            );

          /*
           * Try to read FormSubmit JSON response.
           */
          var result = {};

          try {
            result =
              await response.json();
          } catch (error) {
            /*
             * Ignore JSON parsing error.
             */
          }

          /*
           * FormSubmit returns success when
           * the message was accepted.
           */
          if (
            !response.ok ||
            result.success === false
          ) {
            throw new Error(
              result.message ||
              'Unable to send the message.'
            );
          }

          /*
           * Success.
           */
          form.reset();

          setStatus(
            "Message sent successfully! I'll get back to you soon.",
            'success'
          );

        } catch (error) {

          console.error(
            'Contact form error:',
            error
          );

          /*
           * Failure.
           */
          setStatus(
            'Unable to send the message right now. Please try again or email me directly at jharshit166@gmail.com.',
            'error'
          );

        } finally {

          /*
           * Enable button again.
           */
          if (submit) {
            submit.disabled = false;
            submit.textContent =
              originalText;
          }
        }
      }
    );
  }


  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */

  onReady(function () {

    initNav();

    initScrollChrome();

    initReveal();

    initTilt();

    initParallax();

    initTypewriter();

    initCounters();

    initImageFallbacks();

    initLightbox();

    initContactForm();

  });

})();