const revealItems = document.querySelectorAll(".reveal");
const smoothRoot = document.querySelector("[data-smooth-scroll]");
const header = document.querySelector(".site-header");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.documentElement.classList.add("js-reveal");

if (reducedMotion.matches) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 80, 280)}ms`);
    revealObserver.observe(item);
  });
}

if (smoothRoot && !reducedMotion.matches) {
  const root = document.documentElement;
  const ease = 0.052;
  let currentY = window.scrollY;
  let targetY = window.scrollY;
  let pageHeight = 0;

  root.classList.add("has-smooth-scroll");

  const getHeaderHeight = () => header?.offsetHeight || 0;

  const updatePageHeight = () => {
    const headerHeight = getHeaderHeight();
    pageHeight = smoothRoot.scrollHeight + headerHeight;
    root.style.setProperty("--header-height", `${headerHeight}px`);
    root.style.setProperty("--smooth-height", `${pageHeight}px`);
    document.body.style.height = `${pageHeight}px`;
  };

  const animateScrollTo = (destination) => {
    const start = window.scrollY;
    const distance = destination - start;
    const duration = 1200;
    const startedAt = performance.now();

    const step = (now) => {
      const elapsed = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      window.scrollTo(0, start + distance * eased);

      if (elapsed < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const render = () => {
    targetY = window.scrollY;
    currentY += (targetY - currentY) * ease;

    if (Math.abs(targetY - currentY) < 0.08) {
      currentY = targetY;
    }

    smoothRoot.style.transform = `translate3d(0, ${-currentY}px, 0)`;
    requestAnimationFrame(render);
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const target = hash === "#top" ? document.body : document.querySelector(hash);

      if (!target) return;

      event.preventDefault();

      const destination = hash === "#top" ? 0 : Math.max(0, target.offsetTop);

      history.pushState(null, "", hash);
      animateScrollTo(destination);
    });
  });

  updatePageHeight();
  requestAnimationFrame(render);

  window.addEventListener("resize", updatePageHeight);
  window.addEventListener("load", updatePageHeight);

  if (document.fonts) {
    document.fonts.ready.then(updatePageHeight);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(updatePageHeight).observe(smoothRoot);
  }
}
