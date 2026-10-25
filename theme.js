(() => {
  const preference = matchMedia('(prefers-color-scheme: dark)');
  function apply() {
    document.documentElement.dataset.theme = preference.matches ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = preference.matches ? '#1c2221' : '#f5f4ef';
  }
  apply();
  preference.addEventListener('change', apply);
})();
