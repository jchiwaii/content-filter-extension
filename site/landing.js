const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let smoothScroll = null;

function updateScrollMode() {
  smoothScroll?.destroy();
  smoothScroll = null;
  if (reducedMotion.matches || !finePointer.matches || typeof Lenis === 'undefined') return;
  smoothScroll = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    wheelMultiplier: 0.92,
    smoothWheel: true,
    syncTouch: false
  });
}

updateScrollMode();
reducedMotion.addEventListener('change', updateScrollMode);
finePointer.addEventListener('change', updateScrollMode);

const backToTop = document.querySelector('[data-back-to-top]');
if (backToTop) {
  const updateBackToTop = () => { backToTop.hidden = window.scrollY < 400; };
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  window.addEventListener('pageshow', updateBackToTop);
  updateBackToTop();
}

document.addEventListener('click', event => {
  if (!smoothScroll || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname ||
      url.search !== location.search || !url.hash) return;
  let target;
  try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
  if (!target) return;
  event.preventDefault();
  if (location.hash !== url.hash) history.pushState(null, '', url.hash);
  smoothScroll.scrollTo(target, {
    duration: 0.8,
    lerp: 0,
    onComplete() {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    }
  });
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
        observer.unobserve(entry.target);
      }
    }
  });
  document.querySelectorAll('.steps').forEach(el => observer.observe(el));
}
