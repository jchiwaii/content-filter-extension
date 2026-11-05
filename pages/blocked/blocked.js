document.getElementById('goBack').addEventListener('click', () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // A directly opened or newly created tab has no previous page.
    window.location.replace('about:blank');
  }
});
