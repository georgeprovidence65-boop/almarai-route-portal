(function () {
  const SESSION_KEYS = ['almaraiToken', 'almaraiRole'];

  function getLoginPath() {
    return window.location.protocol === 'file:' ? 'http://localhost:5000/portal-login' : '/portal-login';
  }

  function logout() {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
    window.location.href = getLoginPath();
  }

  function getRoleLabel() {
    const role = localStorage.getItem('almaraiRole');
    if (!role) return '';
    return role.replace(/_/g, ' ');
  }

  function createLogo() {
    const frame = document.createElement('div');
    frame.className = 'brand-logo-frame';

    const img = document.createElement('img');
    img.src = '/almarai-logo.png';
    img.alt = 'Almarai';
    img.loading = 'eager';

    frame.appendChild(img);
    return frame;
  }

  function enhanceHeader() {
    const header = document.querySelector('header[data-language-target], header');
    if (!header || header.dataset.themeReady === 'true') return;
    header.dataset.themeReady = 'true';
    header.classList.add('brand-shell');

    const heading = header.querySelector('h1');
    const subheading = header.querySelector('p');
    const brand = document.createElement('div');
    brand.className = 'brand-block';

    const copy = document.createElement('div');
    copy.className = 'brand-copy';

    if (heading) copy.appendChild(heading);
    if (subheading) copy.appendChild(subheading);

    brand.appendChild(createLogo());
    brand.appendChild(copy);
    header.insertBefore(brand, header.firstChild);

    const token = localStorage.getItem('almaraiToken');
    const actions = document.createElement('div');
    actions.className = 'portal-actions';

    const roleLabel = getRoleLabel();
    if (roleLabel) {
      const role = document.createElement('span');
      role.className = 'role-pill';
      role.textContent = roleLabel;
      actions.appendChild(role);
    }

    if (token) {
      const button = document.createElement('button');
      button.className = 'logout-button';
      button.type = 'button';
      button.setAttribute('data-i18n', 'logout');
      button.textContent = 'Logout';
      button.addEventListener('click', logout);
      actions.appendChild(button);
    }

    if (actions.children.length > 0) {
      header.appendChild(actions);
    }
  }

  function enhanceQrCard() {
    const target = document.querySelector('main[data-language-target]');
    if (!target || document.querySelector('header')) return;
    if (target.dataset.themeReady === 'true') return;
    target.dataset.themeReady = 'true';
    target.classList.add('qr-brand-card');
    target.insertBefore(createLogo(), target.firstChild);
  }

  function start() {
    enhanceHeader();
    enhanceQrCard();
  }

  window.AlmaraiTheme = {
    logout,
    enhanceHeader,
    enhanceQrCard
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());
