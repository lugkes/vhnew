document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.querySelector('.mobile-menu-icon');
  const navList = document.getElementById('navListContainer');

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      navList.classList.toggle('open');

      // Acessibilidade opcional:
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !expanded);
    });
  }
});
