if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
