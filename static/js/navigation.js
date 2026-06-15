/**
 * navigation.js
 * Handles switching between the "home" (editor) view and the "features" view.
 */

(function () {
  const links = document.querySelectorAll('[data-view-link]');
  const views = {
    home: document.getElementById('view-home'),
    features: document.getElementById('view-features'),
  };

  function setActive(target) {
    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.viewLink === target);
    });

    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle('is-hidden', key !== target);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setActive(link.dataset.viewLink);
    });
  });
})();
