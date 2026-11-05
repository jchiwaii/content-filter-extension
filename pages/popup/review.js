(() => {
  const DELAY = 2 * 24 * 60 * 60 * 1000;
  const REVIEW_URL = 'https://chromewebstore.google.com/detail/safe-browse-content-filte/iipiknfekcemmookpphbkdiabdaiipje/reviews';
  document.addEventListener('DOMContentLoaded', async () => {
    // Do not show an installation-based prompt in the standalone HTML preview.
    if (!chrome.runtime?.id) return;
    const prompt = document.getElementById('reviewPrompt');
    const open = document.getElementById('reviewOpen');
    const stars = document.getElementById('reviewStars');
    const dismiss = document.getElementById('reviewDismiss');
    const error = document.getElementById('reviewError');
    try {
      const state = await chrome.storage.local.get(['installTime', 'reviewPromptChoice']);
      if (state.reviewPromptChoice || !Number.isFinite(state.installTime) ||
          state.installTime <= 0 || Date.now() - state.installTime < DELAY) return;
      prompt.hidden = false;
    } catch (err) {
      console.warn('[Safe Browse] Review prompt unavailable:', err);
      return;
    }
    async function choose(choice) {
      if (open.disabled) return;
      open.disabled = dismiss.disabled = stars.disabled = true;
      error.hidden = true;
      try {
        // Save first: opening a tab can close the action popup immediately.
        await chrome.storage.local.set({ reviewPromptChoice: choice });
        if (choice === 'opened') {
          try {
            await chrome.tabs.create({ url: REVIEW_URL });
          } catch (err) {
            await chrome.storage.local.remove('reviewPromptChoice');
            throw err;
          }
        }
        prompt.hidden = true;
      } catch (err) {
        error.textContent = choice === 'opened'
          ? 'Could not open the store. Please try again.'
          : 'Could not save your choice. Please try again.';
        error.hidden = false;
      } finally {
        open.disabled = dismiss.disabled = stars.disabled = false;
      }
    }
    open.addEventListener('click', () => choose('opened'));
    stars.addEventListener('click', () => choose('opened'));
    dismiss.addEventListener('click', () => choose('dismissed'));
  });
})();
