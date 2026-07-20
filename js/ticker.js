/**
 * Client logo ticker — HTML5 JS replacement for <marquee>
 * Seamless infinite scroll using requestAnimationFrame.
 * Falls back gracefully to the CSS keyframe animation if JS doesn't run.
 *
 * Root cause fix: we wait for `window.load` before measuring scrollWidth,
 * because images must be fully loaded for the browser to report correct sizes.
 */
(function () {
  'use strict';

  function initTicker() {
    // Respect user's OS-level motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wrap   = document.querySelector('.client-ticker-wrap');
    const ticker = document.querySelector('.client-ticker');
    if (!wrap || !ticker) return;

    // Cancel the CSS animation — JS takes full control
    ticker.style.animation = 'none';
    ticker.style.willChange = 'transform';

    // Speed: pixels moved per animation frame (~60fps → ~36px/s at 0.6)
    const SPEED = 0.6;

    let x         = 0;
    let paused    = false;
    // scrollWidth / 2 because HTML contains two identical image sets for seamless loop
    let loopWidth = ticker.scrollWidth / 2;

    // Re-measure when container resizes (zoom, font-scale, orientation changes)
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        loopWidth = ticker.scrollWidth / 2;
      }).observe(ticker);
    }

    // Pause on hover
    wrap.addEventListener('mouseenter', function () { paused = true;  });
    wrap.addEventListener('mouseleave', function () { paused = false; });

    // Pause on keyboard focus for accessibility
    wrap.addEventListener('focusin',  function () { paused = true;  });
    wrap.addEventListener('focusout', function () { paused = false; });

    // Pause when tab is in background (saves battery)
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
    });

    function animate() {
      if (!paused && loopWidth > 0) {
        x -= SPEED;
        // When we've scrolled exactly one full set width, snap back seamlessly
        if (Math.abs(x) >= loopWidth) {
          x = 0;
        }
        ticker.style.transform = 'translateX(' + x + 'px)';
      }
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // KEY FIX: wait for ALL resources (images) to finish loading
  // before measuring scrollWidth, otherwise it returns 0 or wrong values.
  if (document.readyState === 'complete') {
    initTicker();
  } else {
    window.addEventListener('load', initTicker);
  }

})();
