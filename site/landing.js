const examples = {
  words: ['01', 'Profanity filter', 'That was a damn good game.', 'That was a good game.', 'Removes matching words and links from a post, leaving the rest of the conversation intact.'],
  images: ['02', 'Image blur', 'An image loads with an explicit label.', 'The image is blurred.', 'Checks image labels, filenames and other page clues. It does not inspect the pixels, so an unlabelled image can slip through.'],
  sites: ['03', 'Site blocking', 'A link leads to a known adult site.', 'Safe Browse shows its blocked page.', 'Known adult domains and sites on your personal blocklist are blocked. You can allow sites you trust.'],
  search: ['04', 'Safer searches', 'A search opens without safe mode.', 'The search opens with safe mode on.', 'Enforces safer search settings on supported search engines, including Google, Bing and DuckDuckGo.']
};

const preview = document.getElementById('example');
const choices = Array.from(document.querySelectorAll('[data-filter]'));
for (const choice of choices) {
  choice.addEventListener('click', () => {
    const key = choice.dataset.filter;
    const [number, title, before, after, explanation] = examples[key];
    for (const item of choices) item.setAttribute('aria-pressed', String(item === choice));
    preview.dataset.kind = key;
    document.getElementById('example-index').textContent = number + ' / 04';
    document.getElementById('example-title').textContent = title;
    document.getElementById('before').textContent = before;
    document.getElementById('after').textContent = after;
    document.getElementById('explanation').textContent = explanation;
  });
}

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
        observer.unobserve(entry.target);
      }
    }
  });
  document.querySelectorAll('.example, .steps').forEach(el => observer.observe(el));
}
