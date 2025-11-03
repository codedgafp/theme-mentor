document.addEventListener('DOMContentLoaded', function () {
  function removeH5PTooltips() {
    document.querySelectorAll('.h5p-container .h5p-tooltip').forEach(el => el.remove());
  }

  removeH5PTooltips();

  const observer = new MutationObserver(removeH5PTooltips);
  observer.observe(document.body, { childList: true, subtree: true });
});