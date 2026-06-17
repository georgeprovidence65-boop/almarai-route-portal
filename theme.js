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

  function getPageTitle() {
    const title = document.querySelector('header h1')?.textContent?.trim();
    return title || 'Almarai Route Portal';
  }

  function createLogoutButton() {
    const button = document.createElement('button');
    button.className = 'logout-button';
    button.type = 'button';
    button.setAttribute('data-i18n', 'logout');
    button.textContent = 'Logout';
    button.addEventListener('click', logout);
    return button;
  }

  function createRolePill() {
    const roleLabel = getRoleLabel();
    if (!roleLabel) return null;
    const role = document.createElement('span');
    role.className = 'role-pill';
    role.textContent = roleLabel;
    return role;
  }

  function enhanceTopbar() {
    const token = localStorage.getItem('almaraiToken');
    if (!token || document.querySelector('.app-topbar')) return;
    document.body.classList.add('dashboard-app');

    const topbar = document.createElement('div');
    topbar.className = 'app-topbar';
    topbar.setAttribute('data-language-target', '');

    const left = document.createElement('div');
    left.className = 'app-topbar-left';
    left.appendChild(createLogo());

    const titleWrap = document.createElement('div');
    titleWrap.className = 'app-title-wrap';

    const title = document.createElement('strong');
    title.textContent = getPageTitle();

    const subtitle = document.createElement('span');
    subtitle.textContent = 'Route operations portal';

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);
    left.appendChild(titleWrap);

    const right = document.createElement('div');
    right.className = 'app-topbar-right';

    const role = createRolePill();
    if (role) right.appendChild(role);
    right.appendChild(createLogoutButton());

    topbar.appendChild(left);
    topbar.appendChild(right);
    document.body.insertBefore(topbar, document.body.firstChild);
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

    const actions = document.createElement('div');
    actions.className = 'portal-actions';

    const role = createRolePill();
    if (role) {
      actions.appendChild(role);
    }

    if (localStorage.getItem('almaraiToken')) {
      actions.appendChild(createLogoutButton());
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
    enhanceTopbar();
    enhanceHeader();
    enhanceQrCard();
  }

  window.AlmaraiTheme = {
    logout,
    enhanceTopbar,
    enhanceHeader,
    enhanceQrCard
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());
