(function () {
  const languages = {
    en: { label: 'English', dir: 'ltr' },
    ar: { label: 'العربية', dir: 'rtl' },
    hi: { label: 'हिन्दी', dir: 'ltr' },
    si: { label: 'සිංහල', dir: 'ltr' },
    bn: { label: 'বাংলা', dir: 'ltr' },
    ur: { label: 'اردو', dir: 'rtl' }
  };

  const translations = {
    en: {
      language: 'Language',
      portalTitle: 'Almarai Portal',
      portalIntro: 'Scan one company QR, login, and open the right dashboard for your role.',
      phone: 'Phone',
      password: 'Password',
      login: 'Login',
      checkingLogin: 'Checking login...',
      loginFailed: 'Login failed',
      qrCode: 'QR Code',
      print: 'Print',
      open: 'Open'
    },
    ar: {
      language: 'اللغة',
      portalTitle: 'بوابة المراعي',
      portalIntro: 'امسح رمز الشركة، سجل الدخول، وافتح لوحة التحكم المناسبة لدورك.',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      checkingLogin: 'جار التحقق من الدخول...',
      loginFailed: 'فشل تسجيل الدخول',
      qrCode: 'رمز الاستجابة السريعة',
      print: 'طباعة',
      open: 'فتح'
    },
    hi: {
      language: 'भाषा',
      portalTitle: 'अलमराई पोर्टल',
      portalIntro: 'कंपनी QR स्कैन करें, लॉगिन करें, और अपनी भूमिका का सही डैशबोर्ड खोलें।',
      phone: 'फोन',
      password: 'पासवर्ड',
      login: 'लॉगिन',
      checkingLogin: 'लॉगिन जांच रहे हैं...',
      loginFailed: 'लॉगिन विफल',
      qrCode: 'QR कोड',
      print: 'प्रिंट',
      open: 'खोलें'
    },
    si: {
      language: 'භාෂාව',
      portalTitle: 'Almarai ද්වාරය',
      portalIntro: 'සමාගම් QR එක ස්කෑන් කර, ලොගින් වී, ඔබේ භූමිකාවට අදාල පුවරුව විවෘත කරන්න.',
      phone: 'දුරකථනය',
      password: 'මුරපදය',
      login: 'ලොගින්',
      checkingLogin: 'ලොගින් පරීක්ෂා කරමින්...',
      loginFailed: 'ලොගින් අසාර්ථකයි',
      qrCode: 'QR කේතය',
      print: 'මුද්‍රණය',
      open: 'විවෘත කරන්න'
    },
    bn: {
      language: 'ভাষা',
      portalTitle: 'আলমারাই পোর্টাল',
      portalIntro: 'কোম্পানির QR স্ক্যান করুন, লগইন করুন, তারপর আপনার ভূমিকার সঠিক ড্যাশবোর্ড খুলুন।',
      phone: 'ফোন',
      password: 'পাসওয়ার্ড',
      login: 'লগইন',
      checkingLogin: 'লগইন যাচাই হচ্ছে...',
      loginFailed: 'লগইন ব্যর্থ',
      qrCode: 'QR কোড',
      print: 'প্রিন্ট',
      open: 'খুলুন'
    },
    ur: {
      language: 'زبان',
      portalTitle: 'المراعی پورٹل',
      portalIntro: 'کمپنی QR اسکین کریں، لاگ ان کریں، اور اپنے کردار کا درست ڈیش بورڈ کھولیں۔',
      phone: 'فون',
      password: 'پاس ورڈ',
      login: 'لاگ ان',
      checkingLogin: 'لاگ ان چیک ہو رہا ہے...',
      loginFailed: 'لاگ ان ناکام',
      qrCode: 'QR کوڈ',
      print: 'پرنٹ',
      open: 'کھولیں'
    }
  };

  function normalizeLanguage(code) {
    const value = String(code || '').toLowerCase();
    if (value.startsWith('ar')) return 'ar';
    if (value.startsWith('hi')) return 'hi';
    if (value.startsWith('si') || value.startsWith('si-lk')) return 'si';
    if (value.startsWith('bn')) return 'bn';
    if (value.startsWith('ur')) return 'ur';
    return 'en';
  }

  function getInitialLanguage() {
    const saved = localStorage.getItem('almaraiLanguage');
    if (saved && languages[saved]) return saved;
    return normalizeLanguage(navigator.language || (navigator.languages || [])[0]);
  }

  function translateText(key) {
    const lang = window.AlmaraiI18n.currentLanguage || 'en';
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  }

  function applyLanguage(lang) {
    const selected = languages[lang] ? lang : 'en';
    window.AlmaraiI18n.currentLanguage = selected;
    localStorage.setItem('almaraiLanguage', selected);
    document.documentElement.lang = selected;
    document.documentElement.dir = languages[selected].dir;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = translateText(node.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      node.placeholder = translateText(node.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-language-select]').forEach((select) => {
      select.value = selected;
    });
  }

  function createLanguageSelector() {
    const wrapper = document.createElement('div');
    wrapper.className = 'language-switcher';
    wrapper.innerHTML = `
      <label data-i18n="language" for="languageSelect">Language</label>
      <select id="languageSelect" data-language-select></select>
    `;

    const select = wrapper.querySelector('select');
    Object.entries(languages).forEach(([code, language]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = language.label;
      select.appendChild(option);
    });
    select.addEventListener('change', () => applyLanguage(select.value));

    return wrapper;
  }

  function mountLanguageSelector(targetSelector) {
    const target = document.querySelector(targetSelector || '[data-language-target]');
    if (!target || target.querySelector('[data-language-select]')) return;
    target.appendChild(createLanguageSelector());
  }

  window.AlmaraiI18n = {
    applyLanguage,
    currentLanguage: 'en',
    mountLanguageSelector,
    t: translateText
  };

  document.addEventListener('DOMContentLoaded', () => {
    mountLanguageSelector();
    applyLanguage(getInitialLanguage());
  });
}());
