// ============================================
// SPLASH SCREEN — First-visit only
// Runs immediately (defer guarantees DOM is parsed)
// ============================================
(function() {
  if (document.documentElement.classList.contains('splash-skip')) {
    var s = document.getElementById('splash-screen');
    if (s) s.remove();
    return;
  }

  try { localStorage.setItem('pp_splash_seen', '1'); } catch(e) {}

  var splash = document.getElementById('splash-screen');
  if (!splash) {
    document.documentElement.classList.remove('splash-active');
    return;
  }

  // Fade out after 1.5s, remove from DOM after transition
  setTimeout(function() {
    splash.classList.add('splash-hide');
    setTimeout(function() {
      splash.remove();
      document.documentElement.classList.remove('splash-active');
    }, 500);
  }, 1500);
})();

// ============================================
// SCROLL RESTORATION
// Prevent browser from restoring scroll position on reload
// ============================================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ============================================
// DOM REFERENCES
// ============================================
const year = document.querySelector('#year');
const mediaOpeners = document.querySelectorAll('[data-lightbox-src]');
const imageModal = document.querySelector('#image-modal');
const modalImage = imageModal ? imageModal.querySelector('img') : null;
const modalClose = imageModal ? imageModal.querySelector('.modal-close') : null;
const navToggle = document.querySelector('#nav-toggle');
const navMenu = document.querySelector('#nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
const menuBtn = document.querySelector('#menu-btn');
const menuPanel = document.querySelector('#menu-panel');
const menuClose = document.querySelector('#menu-close');
const menuItems = document.querySelectorAll('.menu-item');
const pageViews = document.querySelectorAll('.page-view');
let navItems = Array.from(document.querySelectorAll('[data-nav]'));

// ============================================
// UTILITIES
// ============================================
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function pauseAllVideos() {
  document.querySelectorAll('video').forEach(video => video.pause());
}

// Attach loading-state event handlers to a reel card's video element
function initVideoLoadingHandlers(card, video) {
  if (!card || !video) return;

  video.addEventListener('loadstart', () => card.classList.add('loading'));
  video.addEventListener('loadedmetadata', () => card.classList.remove('loading'));
  video.addEventListener('loadeddata', () => card.classList.remove('loading'));
  video.addEventListener('canplay', () => card.classList.remove('loading'));
  video.addEventListener('waiting', () => card.classList.add('loading'));
  video.addEventListener('playing', () => card.classList.remove('loading'));

  // Fallback: remove loading state after 5s (iOS)
  setTimeout(() => card.classList.remove('loading'), 5000);
}

// ============================================
// VIDEO CATEGORIES — TXT File System
// ============================================

const CATEGORIES = [
  { slug: 'ugc',      label: 'UGC',       txt: 'ugc.txt',      route: 'ugc',         icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>' },
  { slug: 'shoting',  label: 'Shooting',  txt: 'shooting.txt', route: 'shooting',    icon: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>' },
  { slug: 'stores',   label: 'Stores',    txt: 'stores.txt',   route: 'stores',      icon: '<path d="M3 9l1-5h16l1 5"></path><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"></path><path d="M9 21v-6h6v6"></path><path d="M3 9h18"></path>' },
  { slug: 'events',   label: 'Events',    txt: 'events.txt',   route: 'events',      icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>' },
  { slug: 'services', label: 'Services',  txt: 'services.txt',  route: 'services',    icon: '<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z"></path>' },
  { slug: 'gallery',  label: 'Gallery',   txt: 'gallery.txt',  route: 'gallery',     icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>', expanded: true },
  { slug: 'drone',    label: 'Drone',     txt: 'drone.txt',     route: 'drone',       icon: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.2.4.7.5 1.1.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>' }
];

// Build categoryLabels from CATEGORIES
const categoryLabels = {};
CATEGORIES.forEach(c => { categoryLabels[c.slug] = c.label; });

// Static nav items rendered in the expanded section (no TXT data files)
const EXPANDED_NAV_ITEMS = [
  { label: 'Model',       nav: 'models',      href: '/model',       icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
  { label: 'Media Buyer', nav: 'media-buyer', href: '/media-buyer', icon: '<path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>' },
  { label: 'Voice Over',  nav: 'voiceover',   href: '/voice-over',  icon: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>' }
];

// ============================================
// CENTRAL CONFIG — Loaded from data/config.json
// All editable content (titles, descriptions, SEO, etc.) is stored
// in data/config.json. Edit that single file to customize the site.
// ============================================
let siteConfig = null;

async function loadSiteConfig() {
  try {
    const response = await fetch('data/config.json');
    if (!response.ok) return;
    siteConfig = await response.json();
  } catch {
    siteConfig = null;
  }
}

// Get a config value for a category slug, with fallback
function getConfig(slug, key, fallback) {
  if (!siteConfig || !siteConfig.categories || !siteConfig.categories[slug]) return fallback;
  const val = siteConfig.categories[slug][key];
  return (val !== undefined && val !== '') ? val : fallback;
}

// Build pageMeta from config (replaces hardcoded pageMeta object)
// Fallback values ensure the site works even if config.json hasn't loaded yet.
function buildPageMeta() {
  const meta = {};

  // Static pages — from config or hardcoded fallbacks
  const sp = (siteConfig && siteConfig._static_pages) ? siteConfig._static_pages : {};
  meta['home'] = {
    title: sp.home ? sp.home.seoTitle : DEFAULT_TITLE,
    desc: sp.home ? sp.home.seoDescription : DEFAULT_DESC,
    crumb: sp.home ? sp.home.crumb : 'Home'
  };
  meta['home-portfolio'] = {
    title: (sp['home-portfolio'] && sp['home-portfolio'].seoTitle) || 'Portfolio | Photography Pixel',
    desc: (sp['home-portfolio'] && sp['home-portfolio'].seoDescription) || 'استعرض أحدث أعمالنا الإبداعية: فيديوهات UGC، تصوير، محلات تجارية، أعراس وخدمات احترافية في أيت ملول - أكادير.',
    crumb: (sp['home-portfolio'] && sp['home-portfolio'].crumb) || 'Portfolio'
  };
  meta['home-contact'] = {
    title: (sp['home-contact'] && sp['home-contact'].seoTitle) || 'Contact | Photography Pixel',
    desc: (sp['home-contact'] && sp['home-contact'].seoDescription) || 'تواصل مع وكالة Photography Pixel لخدمات التصوير والتسويق الرقمي في أيت ملول - أكادير. واتساب، إنستغرام، بريد إلكتروني.',
    crumb: (sp['home-contact'] && sp['home-contact'].crumb) || 'Contact'
  };
  meta['equipment'] = {
    title: (sp.equipment && sp.equipment.seoTitle) || 'Equipment | Photography Pixel',
    desc: (sp.equipment && sp.equipment.seoDescription) || 'تعرف على معدات الاستوديو الاحترافية المستخدمة في وكالة Photography Pixel.',
    crumb: (sp.equipment && sp.equipment.crumb) || 'Equipment'
  };
  meta['request'] = {
    title: (sp.request && sp.request.seoTitle) || 'Request a Project | Photography Pixel',
    desc: (sp.request && sp.request.seoDescription) || 'اطلب مشروعك من وكالة Photography Pixel — UGC، تصوير، درون، صوت، تصميم. نغطي أيت ملول، أكادير والمغرب.',
    crumb: (sp.request && sp.request.crumb) || 'Request a Project'
  };
  meta['start'] = {
    title: (sp.start && sp.start.seoTitle) || 'Start Your Project | Photography Pixel',
    desc: (sp.start && sp.start.seoDescription) || 'ابدأ مشروعك مع وكالة Photography Pixel — املأ النموذج وسنرسل تفاصيلك مباشرة عبر واتساب للحصول على عرض سريع.',
    crumb: (sp.start && sp.start.crumb) || 'Start Your Project'
  };

  // Category pages (cat-{slug})
  CATEGORIES.forEach(cat => {
    const pageKey = 'cat-' + cat.slug;
    meta[pageKey] = {
      title: getConfig(cat.slug, 'seoTitle', cat.label + ' | Photography Pixel'),
      desc: getConfig(cat.slug, 'seoDescription', ''),
      crumb: getConfig(cat.slug, 'label', cat.label)
    };
  });

  // Expanded nav items (models, media-buyer, voiceover)
  EXPANDED_NAV_ITEMS.forEach(item => {
    meta[item.nav] = {
      title: getConfig(item.nav, 'seoTitle', item.label + ' | Photography Pixel'),
      desc: getConfig(item.nav, 'seoDescription', ''),
      crumb: getConfig(item.nav, 'label', item.label)
    };
  });

  return meta;
}

// Apply config values to static HTML pages (models, media-buyer, voiceover)
function applyConfigToStaticPages() {
  if (!siteConfig) return;

  const pageMap = {
    'page-models': 'models',
    'page-media-buyer': 'media-buyer',
    'page-voiceover': 'voiceover',
    'page-equipment': 'equipment',
    'page-request': 'request',
    'page-start': 'start'
  };

  for (const [pageId, slug] of Object.entries(pageMap)) {
    const page = document.getElementById(pageId);
    if (!page) continue;
    const catConfig = siteConfig.categories && siteConfig.categories[slug];
    if (!catConfig) continue;

    const heading = page.querySelector('.sub-page-heading');
    if (heading && catConfig.title) heading.textContent = catConfig.title;

    const subtitle = page.querySelector('.sub-page-subtitle');
    if (subtitle && catConfig.subtitle) subtitle.textContent = catConfig.subtitle;
  }
}

// Fetch a TXT file and return an array of validated, deduplicated URLs
async function fetchCategoryUrls(txtFile) {
  try {
    const response = await fetch('data/' + txtFile);
    if (!response.ok) return [];
    const text = await response.text();

    // Remove UTF-8 BOM if present
    const cleaned = text.replace(/^\uFEFF/, '');

    const seen = new Set();
    const urls = [];

    for (const line of cleaned.split(/\r?\n/)) {
      const url = line.trim();
      if (!url) continue;
      if (!/^https?:\/\//.test(url)) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }

    return urls;
  } catch {
    return [];
  }
}

function createReelCard(url) {
  const card = document.createElement('article');
  card.className = 'reel-card';
  card.innerHTML =
    '<video controls controlsList="nodownload noplaybackrate" disablePictureInPicture playsinline webkit-playsinline preload="metadata">' +
      '<source data-src="' + url + '" type="video/mp4">' +
    '</video>';
  return card;
}

// Lazy-load video sources via IntersectionObserver
const lazyVideoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const source = entry.target.querySelector('source');
      if (source && source.dataset.src) {
        const video = entry.target.querySelector('video');
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
        if (video) video.load();
      }
      lazyVideoObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '300px 0px', threshold: 0.01 });

function renderVideoCards(urls, containerId, slug, limit) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  const list = limit ? urls.slice(0, limit) : urls;
  const fragment = document.createDocumentFragment();

  list.forEach(url => {
    const card = createReelCard(url);
    fragment.appendChild(card);

    const video = card.querySelector('video');
    initVideoLoadingHandlers(card, video);
    lazyVideoObserver.observe(card);

    card.classList.add('reveal-scale');
    const delay = Math.min(Math.floor(fragment.children.length / 3), 5);
    card.classList.add('reveal-delay-' + (delay + 1));
    revealObserver.observe(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);

  enhanceReelCards();
  forceActivateRevealCards(grid);
}

// Force-activate reveal cards already in viewport (iOS Safari fix)
function forceActivateRevealCards(grid) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      grid.querySelectorAll('.reveal-scale:not(.active), .reveal:not(.active), .reveal-fade:not(.active)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          el.classList.add('active');
        }
      });
    });
  });
}

function ensureCategoryContainers() {
  if (CATEGORIES.length === 0) return;

  const servicesNavMain = document.getElementById('services-nav-main');
  const servicesNavExpanded = document.getElementById('services-nav-expanded');
  const portfolioShell = document.querySelector('.portfolio-shell');
  const mainEl = document.querySelector('main.page');
  if (!portfolioShell) return;

  function createCircleElement(label, nav, href, icon) {
    const circle = document.createElement('a');
    circle.href = href;
    circle.className = 'service-circle';
    circle.setAttribute('data-nav', nav);
    circle.innerHTML =
      '<div class="service-circle-icon">' +
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          icon +
        '</svg>' +
      '</div>' +
      '<span class="service-circle-label">' + label + '</span>';
    return circle;
  }

  CATEGORIES.forEach(cat => {
    const slug = cat.slug;

    // Featured preview block on homepage
    if (!document.getElementById('home-grid-' + slug)) {
      const preview = document.createElement('div');
      preview.className = 'featured-preview';
      preview.innerHTML =
        '<h3 class="featured-preview-title">' + getConfig(slug, 'title', cat.label) + '</h3>' +
        '<div class="video-grid active" data-panel="' + slug + '" id="home-grid-' + slug + '"></div>' +
        '<a href="/' + cat.route + '" class="view-all-btn" data-nav="cat-' + slug + '">' + getConfig(slug, 'buttonLabel', 'View All →') + '</a>';
      portfolioShell.appendChild(preview);
    }

    // Service circle in nav — main or expanded section
    const navTarget = cat.expanded ? servicesNavExpanded : servicesNavMain;
    const navAttr = 'cat-' + slug;
    if (navTarget && !navTarget.querySelector('[data-nav="' + navAttr + '"]')) {
      navTarget.appendChild(createCircleElement(getConfig(slug, 'label', cat.label), navAttr, '/' + cat.route, cat.icon));
    }

    // Category page-view
    if (!document.getElementById('page-cat-' + slug)) {
      const pageView = document.createElement('div');
      pageView.className = 'page-view';
      pageView.id = 'page-cat-' + slug;
      pageView.setAttribute('data-page', 'cat-' + slug);
      pageView.innerHTML =
        '<section class="sub-page-section reveal">' +
          '<h2 class="sub-page-heading">' + getConfig(slug, 'title', cat.label) + '</h2>' +
          '<p class="sub-page-subtitle">' + getConfig(slug, 'subtitle', cat.label + ' Videos') + '</p>' +
          '<div class="video-grid" data-panel="' + slug + '-full" id="grid-cat-' + slug + '"></div>' +
        '</section>';
      if (mainEl) mainEl.appendChild(pageView);
    }
  });

  // Render static expanded nav items (Model, Media Buyer, Voice Over)
  if (servicesNavExpanded) {
    EXPANDED_NAV_ITEMS.forEach(item => {
      if (!servicesNavExpanded.querySelector('[data-nav="' + item.nav + '"]')) {
        servicesNavExpanded.appendChild(createCircleElement(getConfig(item.nav, 'label', item.label), item.nav, item.href, item.icon));
      }
    });
  }

  // Initialize toggle button
  const toggleBtn = document.getElementById('categories-toggle');
  if (toggleBtn && !toggleBtn._toggleBound) {
    toggleBtn._toggleBound = true;
    toggleBtn.addEventListener('click', function() {
      const isOpen = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!isOpen));
      if (servicesNavExpanded) {
        servicesNavExpanded.setAttribute('aria-hidden', String(isOpen));
        servicesNavExpanded.classList.toggle('open');
      }
    });
  }

  // Refresh navItems collection
  navItems = Array.from(document.querySelectorAll('[data-nav]'));
  navItems.forEach(item => {
    if (item.id === 'menu-btn') return;
    if (item._routerBound) return;
    item._routerBound = true;
    item.addEventListener('click', function(e) {
      const nav = this.dataset.nav;
      if (!nav) return;
      e.preventDefault();
      navigateTo(nav);
      if (menuPanel && menuPanel.classList.contains('active')) closeMenu();
    });
  });
}

async function loadVideoCategories() {
  await loadSiteConfig();
  pageMeta = buildPageMeta();
  applyConfigToStaticPages();
  ensureCategoryContainers();
  handleRoute();

  await Promise.all(CATEGORIES.map(async cat => {
    const urls = await fetchCategoryUrls(cat.txt);
    if (urls.length === 0) {
      // Remove empty featured preview block (e.g. gallery.txt is empty)
      const emptyPreview = document.getElementById('home-grid-' + cat.slug);
      if (emptyPreview) emptyPreview.parentElement.remove();
      return;
    }

    renderVideoCards(urls, 'home-grid-' + cat.slug, cat.slug, 3);
    renderVideoCards(urls, 'grid-cat-' + cat.slug, cat.slug);
  }));
}

// ============================================
// YEAR
// ============================================
if (year) {
  year.textContent = new Date().getFullYear();
}

// ============================================
// IMAGE PREVIEW / LIGHTBOX
// ============================================
function openImagePreview(opener) {
  if (!imageModal || !modalImage) return;

  modalImage.src = opener.dataset.lightboxSrc;
  modalImage.alt = opener.dataset.lightboxAlt || '';
  imageModal.classList.add('active');
  imageModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeImagePreview() {
  if (!imageModal || !modalImage) return;

  imageModal.classList.remove('active');
  imageModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  modalImage.removeAttribute('src');
  modalImage.alt = '';
}

mediaOpeners.forEach(opener => {
  opener.addEventListener('click', () => openImagePreview(opener));
});

if (modalClose) {
  modalClose.addEventListener('click', closeImagePreview);
}

if (imageModal) {
  imageModal.addEventListener('click', event => {
    if (event.target === imageModal) closeImagePreview();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeImagePreview();
});

// ============================================
// VIDEO SEARCH
// ============================================
let searchIndex = null;

async function getSearchIndex() {
  if (searchIndex) return searchIndex;

  searchIndex = [];

  const results = await Promise.all(
    CATEGORIES.map(async cat => {
      const urls = await fetchCategoryUrls(cat.txt);
      return urls.map(url => ({
        title: decodeURIComponent(url.split('/').pop() || '') || url,
        video: url,
        category: cat.slug
      }));
    })
  );

  searchIndex = results.flat();
  return searchIndex;
}

function renderSearchResults(query) {
  const resultsContainer = document.getElementById('video-search-results');
  const grid = document.getElementById('search-results-grid');
  const countEl = document.getElementById('search-results-count');
  const noResultsEl = document.getElementById('search-no-results');
  const featuredPreviews = document.querySelectorAll('.featured-preview');

  if (!resultsContainer || !grid) return;

  if (!query || query.trim() === '') {
    resultsContainer.hidden = true;
    if (noResultsEl) noResultsEl.hidden = true;
    featuredPreviews.forEach(el => el.style.display = '');
    return;
  }

  const q = query.toLowerCase().trim();
  const results = searchIndex.filter(item =>
    (item.title || '').toLowerCase().includes(q)
  );

  featuredPreviews.forEach(el => el.style.display = 'none');
  resultsContainer.hidden = false;

  if (countEl) {
    countEl.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + query.trim() + '"';
  }

  grid.innerHTML = '';

  if (results.length === 0) {
    if (noResultsEl) noResultsEl.hidden = false;
    return;
  }

  if (noResultsEl) noResultsEl.hidden = true;

  const fragment = document.createDocumentFragment();

  results.forEach(item => {
    const card = createReelCard(item.video);
    fragment.appendChild(card);

    const video = card.querySelector('video');
    initVideoLoadingHandlers(card, video);
    lazyVideoObserver.observe(card);

    card.classList.add('reveal-scale');
    const delay = Math.min(Math.floor(fragment.children.length / 3), 5);
    card.classList.add('reveal-delay-' + (delay + 1));
    revealObserver.observe(card);
  });

  grid.appendChild(fragment);
  enhanceReelCards();
  forceActivateRevealCards(grid);

  // Set correct category tag per card (enhanceReelCards uses grid's data-panel)
  grid.querySelectorAll('.reel-card').forEach((card, i) => {
    const tag = card.querySelector('.reel-tag');
    if (tag) {
      tag.textContent = categoryLabels[results[i].category] || results[i].category;
    }
  });
}

function initVideoSearch() {
  const input = document.getElementById('video-search-input');
  if (!input) return;

  const debouncedSearch = debounce(async function() {
    await getSearchIndex();
    renderSearchResults(input.value);
  }, 200);

  input.addEventListener('input', debouncedSearch);
}

// ============================================
// MOBILE NAVIGATION TOGGLE
// ============================================
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isActive = navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isActive));
    navToggle.setAttribute('aria-label', isActive ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'فتح القائمة');
    });
  });

  document.addEventListener('click', event => {
    if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'فتح القائمة');
    }
  });
}

// ============================================
// MENU PANEL
// ============================================
function closeMenu() {
  if (!menuPanel) return;
  menuPanel.classList.remove('active');
  menuPanel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
}

if (menuBtn && menuPanel) {
  menuBtn.addEventListener('click', () => {
    menuPanel.classList.add('active');
    menuPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  });

  if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
  }

  menuItems.forEach(item => {
    item.addEventListener('click', closeMenu);
  });

  menuPanel.addEventListener('click', e => {
    if (e.target === menuPanel) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuPanel.classList.contains('active')) {
      closeMenu();
    }
  });
}

// ============================================
// BOTTOM NAVIGATION
// Click handler: active state toggle + ripple effect
// ============================================
bottomNavItems.forEach(item => {
  item.addEventListener('click', function(e) {
    bottomNavItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');

    // Ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = this.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ============================================
// SPA ROUTER — Clean URL Routing
// ============================================

// Route map: URL path → page name
const ROUTES = {
  'ugc': 'cat-ugc',
  'stores': 'cat-stores',
  'events': 'cat-events',
  'shooting': 'cat-shoting',
  'photography': 'cat-services',
  'services': 'cat-services',
  'gallery': 'cat-gallery',
  'drone': 'cat-drone',
  'portfolio': 'home-portfolio',
  'voice-over': 'voiceover',
  'media-buyer': 'media-buyer',
  'model': 'models',
  'contact': 'home-contact',
  'equipment': 'equipment',
  'request': 'request',
  'start': 'start'
};

// Reverse map: page name → URL path
const PAGE_TO_ROUTE = {};
for (const [path, page] of Object.entries(ROUTES)) {
  PAGE_TO_ROUTE[page] = path;
}
PAGE_TO_ROUTE['home'] = '';

// Detect base path once at load time (handles root and subdirectory deployments)
const BASE_PATH = (function() {
  const segments = window.location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return '';

  // If first segment is a known route, we're at root
  if (ROUTES[segments[0]]) return '';

  // If second segment is a known route, first segment is the base
  if (segments.length > 1 && ROUTES[segments[1]]) return '/' + segments[0];

  // No route in URL — entire path (minus filename) is the base
  return window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
})();

function buildUrl(route) {
  return route ? BASE_PATH + '/' + route : BASE_PATH + '/';
}

function getCurrentRoute() {
  let path = window.location.pathname;
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length);
  }
  return path.replace(/^\//, '').replace(/\/$/, '');
}

function navigateTo(pageName) {
  const route = PAGE_TO_ROUTE[pageName] ?? '';
  const currentRoute = getCurrentRoute();

  // Don't push duplicate history entries
  if (route === currentRoute) {
    showPage(pageName);
    return;
  }

  history.pushState({ page: pageName }, '', buildUrl(route));
  showPage(pageName);
}

function handleRoute() {
  const route = getCurrentRoute();
  let pageName = ROUTES[route] || 'home';

  // If route is unknown, check if it matches a dynamic category pattern
  if (pageName === 'home' && route && !route.startsWith('api/')) {
    // Try matching as a category route — will be resolved after API loads
    // For now, show home; the real page will be shown once categories are registered
    pageName = 'home';
  }

  showPage(pageName);
}

window.addEventListener('popstate', handleRoute);

// ============================================
// DYNAMIC SEO META UPDATES
// ============================================
const BASE_URL = 'https://abdellahafkhar7-a11y.github.io/photographyportfolio';
const DEFAULT_TITLE = 'Photography Pixel | وكالة تصوير وتسويق رقمي في أيت ملول - أكادير';
const DEFAULT_DESC = 'Photography Pixel: وكالة تصوير وتسويق رقمي متخصصة في صناعة المحتوى، تصوير المنتجات، المحلات التجارية، فيديوهات UGC والأعراس في أيت ملول - أكادير.';

// pageMeta is now built dynamically from data/config.json via buildPageMeta().
// Fallback values ensure the site works even if config.json fails to load.
let pageMeta = buildPageMeta();

function updatePageMeta(pageName) {
  const meta = pageMeta[pageName] || pageMeta['home'];

  // Title
  document.title = meta.title;

  // Description
  setMetaContent('meta[name="description"]', meta.desc);

  // Canonical
  const route = PAGE_TO_ROUTE[pageName] ?? '';
  const canonical = BASE_URL + '/' + route;
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute('href', canonical);

  // Open Graph
  setMetaContent('meta[property="og:title"]', meta.title);
  setMetaContent('meta[property="og:description"]', meta.desc);
  setMetaContent('meta[property="og:url"]', canonical);

  // Twitter
  setMetaContent('meta[name="twitter:title"]', meta.title);
  setMetaContent('meta[name="twitter:description"]', meta.desc);

  // BreadcrumbList JSON-LD
  const breadcrumbScripts = document.querySelectorAll('script[type="application/ld+json"]');
  breadcrumbScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'BreadcrumbList') {
        data.itemListElement = [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL + '/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: meta.crumb,
            item: canonical
          }
        ];
        script.textContent = JSON.stringify(data, null, 2);
      }
    } catch (e) { /* skip non-JSON blocks */ }
  });
}

function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

// ============================================
// SPA PAGE NAVIGATION SYSTEM
// ============================================
function showPage(pageName) {
  pauseAllVideos();

  updatePageMeta(pageName);

  // Re-query page views to include dynamically created pages
  const allPageViews = document.querySelectorAll('.page-view');
  allPageViews.forEach(pv => pv.classList.remove('active'));

  const targetPage = document.getElementById('page-' + pageName);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update bottom nav active states
  bottomNavItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.nav === pageName) {
      item.classList.add('active');
    }
  });

  // Update category card active states
  document.querySelectorAll('.services-nav .service-circle, .services-nav-expanded .service-circle').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.nav === pageName) {
      item.classList.add('active');
    }
  });

  // Handle scroll targets for home page
  if (pageName === 'home' || pageName.indexOf('home') === 0) {
    const homePage = document.getElementById('page-home');
    if (homePage && !homePage.classList.contains('active')) {
      pageViews.forEach(pv => pv.classList.remove('active'));
      homePage.classList.add('active');
    }

    if (pageName === 'home-portfolio') {
      setTimeout(() => {
        const portfolio = document.getElementById('portfolio');
        if (portfolio) portfolio.scrollIntoView(true);
      }, 50);
    } else if (pageName === 'home-contact') {
      setTimeout(() => {
        const contact = document.getElementById('contact');
        if (contact) contact.scrollIntoView(true);
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  } else {
    window.scrollTo(0, 0);
  }

  // Trigger reveal observer for newly visible elements
  let revealContainer = targetPage;
  if (!revealContainer && pageName.indexOf('home') === 0) {
    revealContainer = document.getElementById('page-home');
  }
  if (revealContainer) {
    revealContainer.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach(el => {
      if (!el.classList.contains('active')) {
        revealObserver.observe(el);
      }
    });

    // Force-activate reveal elements already in viewport
    forceActivateRevealCards(revealContainer);
  }
}

// Attach click handlers to all [data-nav] elements
navItems.forEach(item => {
  if (item.id === 'menu-btn') return;

  item.addEventListener('click', function(e) {
    const nav = this.dataset.nav;
    if (!nav) return;

    e.preventDefault();
    navigateTo(nav);

    if (menuPanel && menuPanel.classList.contains('active')) {
      closeMenu();
    }
  });
});

// ============================================
// MODEL BOOKING - WHATSAPP MESSAGE
// Event delegation for dynamic cards
// ============================================
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.model-book-btn');
  if (!btn) return;

  e.preventDefault();

  const card = btn.closest('.model-card');
  if (!card) return;

  const name = card.dataset.modelName || '—';
  const city = card.dataset.modelCity || '—';
  const photo = card.dataset.modelPhoto || '';

  let msg = 'السلام عليكم،\n\n';
  msg += 'أرغب في حجز هذا المودل.\n\n';
  msg += 'الاسم: ' + name + '\n';
  msg += 'المدينة: ' + city + '\n';
  msg += 'نوع المشروع: \n';
  msg += 'تاريخ التصوير: \n';
  if (photo) {
    msg += '\nصورة المودل: ' + photo + '\n';
  }
  msg += '\nشكراً.';

  const waUrl = 'https://wa.me/212663493003?text=' + encodeURIComponent(msg);
  window.open(waUrl, '_blank');
});

// ============================================
// DYNAMIC MODELS LOADER
// ============================================
function createModelCard(model) {
  const card = document.createElement('article');
  card.className = 'model-card reveal-scale';
  card.dataset.modelName = model.name;
  card.dataset.modelCity = model.city;
  card.dataset.modelPhoto = model.photo;

  const availClass = model.available ? 'available' : 'unavailable';
  const availText = model.available ? 'متاح' : 'غير متاح';

  card.innerHTML = `
    <div class="model-photo">
      <img src="${model.photo}" alt="${model.name}" loading="lazy">
    </div>
    <div class="model-body">
      <h3 class="model-name">${model.name}</h3>
      <div class="model-availability ${availClass}">${availText}</div>
      <div class="model-attributes">
        <span class="model-attr"><span class="model-attr-label">العمر</span><span class="model-attr-value">${model.age}</span></span>
        <span class="model-attr"><span class="model-attr-label">الطول</span><span class="model-attr-value">${model.height}</span></span>
        <span class="model-attr"><span class="model-attr-label">المدينة</span><span class="model-attr-value">${model.city}</span></span>
        <span class="model-attr"><span class="model-attr-label">الفئات</span><span class="model-attr-value">${model.category}</span></span>
        <span class="model-attr"><span class="model-attr-label">الخبرة</span><span class="model-attr-value">${model.experience}</span></span>
      </div>
      <p class="model-desc">${model.description}</p>
      <a href="#" class="button primary model-book-btn">${getConfig('models', 'ctaText', 'احجز هذا المودل')}</a>
    </div>
  `;

  return card;
}

async function loadModels() {
  const grid = document.getElementById('models-grid');
  if (!grid) return;

  try {
    const response = await fetch('data/models.json');
    const models = await response.json();

    grid.innerHTML = '';

    models.forEach(model => {
      const card = createModelCard(model);
      grid.appendChild(card);
      revealObserver.observe(card);
    });
  } catch (error) {
    // Failed to load models — grid stays empty
  }
}

// ============================================
// DYNAMIC MEDIA BUYER LOADER
// ============================================
function createBuyerCard(campaign) {
  const card = document.createElement('article');
  card.className = 'buyer-card reveal-scale';

  card.innerHTML = `
    <div class="buyer-screenshot">
      <img src="${campaign.screenshot}" alt="${campaign.campaign}" loading="lazy">
    </div>
    <div class="buyer-body">
      <h3 class="buyer-campaign">${campaign.campaign}</h3>
      <div class="buyer-meta">
        <span class="buyer-platform">${campaign.platform}</span>
        <span class="buyer-objective">${campaign.objective}</span>
        <span class="buyer-messages">${campaign.messages}</span>
      </div>
      <div class="buyer-result">${campaign.result}</div>
      <p class="buyer-desc">${campaign.description}</p>
    </div>
  `;

  return card;
}

async function loadMediaBuyer() {
  const grid = document.getElementById('buyer-grid');
  if (!grid) return;

  try {
    const response = await fetch('data/media-buyer.json');
    const campaigns = await response.json();

    grid.innerHTML = '';

    campaigns.forEach(campaign => {
      const card = createBuyerCard(campaign);
      grid.appendChild(card);
      revealObserver.observe(card);
    });
  } catch (error) {
    // Failed to load media buyer campaigns — grid stays empty
  }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -100px 0px',
  threshold: 0.1
};

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

// ============================================
// DOM CONTENT LOADED
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  // loadVideoCategories() calls handleRoute() after dynamic pages are created.
  // Calling handleRoute() here would race — category page-views don't exist yet.

  // Critical path: load video categories first
  loadVideoCategories();
  initVideoSearch();

  // Defer non-critical loaders to idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => { loadModels(); loadMediaBuyer(); });
  } else {
    setTimeout(() => { loadModels(); loadMediaBuyer(); }, 200);
  }

  // Add reveal classes to key elements (single query batch)
  const revealAdditions = [
    ['.profile-card', 'reveal'],
    ['.portfolio-shell', 'reveal reveal-delay-2'],
    ['.footer', 'reveal reveal-delay-3'],
    ['.avatar-ring', 'reveal-scale'],
    ['.profile-info', 'reveal reveal-delay-1'],
    ['.profile-line', 'reveal reveal-delay-2'],
    ['.bio', 'reveal-fade reveal-delay-2']
  ];

  revealAdditions.forEach(([sel, cls]) => {
    const el = document.querySelector(sel);
    if (el) {
      el.classList.add(...cls.split(' '));
    }
  });

  // Observe all reveal elements in a single pass
  document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  // Page transition
  document.body.classList.add('page-transition');
  setTimeout(() => {
    document.body.classList.remove('page-transition');
  }, 600);

  // Force-activate reveal elements already in viewport (single layout pass)
  forceActivateRevealCards(document);

  // Defer overlay enhancement to idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => enhanceReelCards());
  } else {
    setTimeout(() => enhanceReelCards(), 200);
  }
});

// ============================================
// VIDEO CARD OVERLAYS
// ============================================
function enhanceReelCards() {
  document.querySelectorAll('.reel-card').forEach(card => {
    if (card.querySelector('.reel-overlay')) return;

    const grid = card.closest('.video-grid');
    const panel = grid ? (grid.dataset.panel || '').replace('-full', '') : '';
    const label = categoryLabels[panel] || '';

    const overlay = document.createElement('div');
    overlay.className = 'reel-overlay';
    overlay.innerHTML =
      '<span class="reel-tag">' + label + '</span>' +
      '<div class="reel-play-btn">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' +
      '</div>' +
      '<div class="reel-gradient"></div>';

    card.appendChild(overlay);

    const video = card.querySelector('video');
    if (video) {
      video.addEventListener('play', () => card.classList.add('playing'));
      video.addEventListener('pause', () => card.classList.remove('playing'));
      video.addEventListener('ended', () => card.classList.remove('playing'));
    }
  });
}

// ============================================
// RESIZE HANDLER
// Re-trigger reveal animations when crossing mobile/desktop breakpoint
// ============================================
let wasMobile = window.innerWidth <= 768;

window.addEventListener('resize', debounce(() => {
  const isNowMobile = window.innerWidth <= 768;
  if (isNowMobile !== wasMobile) {
    wasMobile = isNowMobile;
    document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach(el => {
      el.classList.remove('active');
      void el.offsetWidth;
      el.classList.add('active');
    });
  }
}, 250));

// Ensure we're at the top after everything loads
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// ============================================
// VOICE OVER SECTION
// ============================================
(function() {
  'use strict';

  const voGrid = document.getElementById('voiceover-grid');
  const voEmpty = document.getElementById('voiceover-empty');
  const voModal = document.getElementById('vo-modal');

  if (!voModal) return;

  // Modal elements
  const voOverlay = voModal.querySelector('.vo-modal-overlay');
  const voCloseBtn = voModal.querySelector('.vo-modal-close');
  const voCoverImg = voModal.querySelector('.vo-cover');
  const voTitle = voModal.querySelector('.vo-title');
  const voCategory = voModal.querySelector('.vo-category');
  const voDuration = voModal.querySelector('.vo-duration');
  const voDesc = voModal.querySelector('.vo-description');
  const voCanvas = document.getElementById('vo-waveform');
  const voCtx = voCanvas.getContext('2d');
  const voLoading = document.getElementById('vo-loading');
  const voPlayPauseBtn = voModal.querySelector('.vo-play-pause');
  const voPlayIcon = voModal.querySelector('.vo-icon-play');
  const voPauseIcon = voModal.querySelector('.vo-icon-pause');
  const voSkipBackBtn = voModal.querySelector('.vo-skip-back');
  const voSkipFwdBtn = voModal.querySelector('.vo-skip-forward');
  const voCurrentTime = voModal.querySelector('.vo-current-time');
  const voTotalTime = voModal.querySelector('.vo-total-time');
  const voVolumeSlider = voModal.querySelector('.vo-volume-slider');
  const voSpeedBtn = voModal.querySelector('.vo-speed-btn');
  const voSpeedMenu = voModal.querySelector('.vo-speed-menu');

  // State
  let audio = null;
  let audioCtx = null;
  let audioBlobUrl = null;
  let waveformBars = [];
  let rafId = null;
  let lastFocused = null;
  let isDragging = false;

  // ============================================
  // Helpers
  // ============================================
  function formatTime(sec) {
    if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function showPlayIcon() {
    voPlayIcon.style.display = '';
    voPauseIcon.style.display = 'none';
    voPlayPauseBtn.setAttribute('aria-label', 'Play');
  }

  function showPauseIcon() {
    voPlayIcon.style.display = 'none';
    voPauseIcon.style.display = '';
    voPlayPauseBtn.setAttribute('aria-label', 'Pause');
  }

  function showLoading(show) {
    voLoading.hidden = !show;
  }

  // Safari-compatible decode wrapper (callback-based API)
  function decodeAudioData(ctx, buffer) {
    return new Promise((resolve, reject) => {
      try {
        ctx.decodeAudioData(buffer, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  // ============================================
  // Card Creation
  // ============================================
  function createVoiceOverCard(item, index) {
    const card = document.createElement('article');
    card.className = 'vo-card reveal-scale';
    card.style.transitionDelay = (Math.min(index, 5) * 0.1) + 's';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Play voice over: ' + (item.title || ''));
    card.dataset.audio = item.audio || '';
    card.dataset.cover = item.cover || '';
    card.dataset.title = item.title || '';
    card.dataset.category = item.category || '';
    card.dataset.description = item.description || '';
    card.dataset.duration = item.duration || '';

    card.innerHTML = `
      <div class="vo-card-cover">
        <img src="${item.cover || ''}" alt="${item.title || ''}" loading="lazy">
        <div class="vo-card-overlay">
          <span class="vo-card-play">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </span>
        </div>
      </div>
      <div class="vo-card-body">
        <h3 class="vo-card-title">${item.title || ''}</h3>
        <div class="vo-card-meta">
          <span class="vo-card-category">${item.category || ''}</span>
          <span class="vo-card-duration">${item.duration || ''}</span>
        </div>
        <p class="vo-card-desc">${item.description || ''}</p>
      </div>
    `;

    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });

    return card;
  }

  // ============================================
  // Load Voice Overs
  // ============================================
  async function loadVoiceOvers() {
    if (!voGrid) return;

    try {
      const response = await fetch('data/voiceover.json');
      const items = await response.json();

      voGrid.innerHTML = '';

      if (!items || items.length === 0) {
        voGrid.hidden = true;
        voEmpty.hidden = false;
        if (typeof revealObserver !== 'undefined') {
          revealObserver.observe(voEmpty);
        } else {
          voEmpty.classList.add('active');
        }
        return;
      }

      voEmpty.hidden = true;
      voGrid.hidden = false;

      items.forEach((item, index) => {
        const card = createVoiceOverCard(item, index);
        voGrid.appendChild(card);
        if (typeof revealObserver !== 'undefined') {
          revealObserver.observe(card);
        }
      });
    } catch (err) {
      // Failed to load voice overs
      voGrid.hidden = true;
      voEmpty.hidden = false;
      if (typeof revealObserver !== 'undefined') {
        revealObserver.observe(voEmpty);
      }
    }
  }

  // ============================================
  // Modal
  // ============================================
  function openModal(card) {
    lastFocused = card;

    voCoverImg.src = card.dataset.cover || '';
    voCoverImg.alt = card.dataset.title || '';
    voTitle.textContent = card.dataset.title || '';
    voCategory.textContent = card.dataset.category || '';
    voDuration.textContent = card.dataset.duration || '';
    voDesc.textContent = card.dataset.description || '';

    showPlayIcon();
    voCurrentTime.textContent = '0:00';
    voTotalTime.textContent = card.dataset.duration || '0:00';
    voVolumeSlider.value = 1;

    waveformBars = [];
    voCtx.clearRect(0, 0, voCanvas.width, voCanvas.height);

    voModal.classList.add('active');
    voModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    loadAudio(card.dataset.audio);

    setTimeout(() => voPlayPauseBtn.focus(), 100);
  }

  function closeModal(restoreFocus) {
    if (restoreFocus === undefined) restoreFocus = true;

    voModal.classList.remove('active');
    voModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      audioBlobUrl = null;
    }

    voSpeedMenu.hidden = true;
    voSpeedBtn.setAttribute('aria-expanded', 'false');

    showPlayIcon();

    if (restoreFocus && lastFocused) {
      lastFocused.focus();
    }
  }

  // ============================================
  // Audio Loading & Waveform
  // ============================================
  async function loadAudio(url) {
    if (!url) {
      // No audio URL provided
      showLoading(false);
      return;
    }

    showLoading(true);

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
      audioBlobUrl = URL.createObjectURL(new Blob([arrayBuffer]));

      if (!audio) {
        audio = new Audio();
        audio.controlsList = 'nodownload';
        audio.preload = 'auto';
        audio.volume = 1;

        audio.addEventListener('loadedmetadata', () => {
          if (isFinite(audio.duration) && !isNaN(audio.duration)) {
            voTotalTime.textContent = formatTime(audio.duration);
          }
        });

        audio.addEventListener('ended', () => {
          showPlayIcon();
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          drawWaveform();
        });

        audio.addEventListener('canplay', () => showLoading(false));
        audio.addEventListener('waiting', () => showLoading(true));
        audio.addEventListener('playing', () => showLoading(false));
        audio.addEventListener('error', () => {
          showLoading(false);
          // Audio playback error
        });

        audio.addEventListener('contextmenu', e => e.preventDefault());
      }

      audio.src = audioBlobUrl;

      // Decode for waveform using Web Audio API
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // slice(0) creates a copy since decodeAudioData may detach the buffer
        const audioBuffer = await decodeAudioData(audioCtx, arrayBuffer.slice(0));
        generateWaveform(audioBuffer);
      } catch (decodeErr) {
        // Waveform decode failed, using fallback
        generatePseudoWaveform();
      }

    } catch (err) {
      // Failed to load audio
      showLoading(false);
    }
  }

  function generateWaveform(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const samples = 180;
    const blockSize = Math.floor(channelData.length / samples);
    const bars = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < blockSize; j++) {
        const idx = i * blockSize + j;
        if (idx < channelData.length) {
          sum += Math.abs(channelData[idx]);
          count++;
        }
      }
      bars.push(count > 0 ? sum / count : 0);
    }

    // Normalize
    let max = 0;
    for (let k = 0; k < bars.length; k++) {
      if (bars[k] > max) max = bars[k];
    }

    waveformBars = max > 0
      ? bars.map(v => v / max)
      : bars.map(() => 0.5);

    drawWaveform();
  }

  function generatePseudoWaveform() {
    const samples = 180;
    waveformBars = [];
    for (let i = 0; i < samples; i++) {
      const val = 0.3 + 0.3 * Math.sin(i * 0.1) + 0.2 * Math.sin(i * 0.3) + 0.1 * Math.random();
      waveformBars.push(Math.max(0.1, Math.min(1, val)));
    }
    drawWaveform();
  }

  function drawWaveform() {
    const dpr = window.devicePixelRatio || 1;
    const rect = voCanvas.getBoundingClientRect();

    if (rect.width === 0) return;

    voCanvas.width = rect.width * dpr;
    voCanvas.height = rect.height * dpr;
    voCtx.setTransform(1, 0, 0, 1, 0, 0);
    voCtx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barCount = waveformBars.length;

    if (barCount === 0) return;

    const barWidth = width / barCount;
    const progress = (audio && audio.duration && isFinite(audio.duration))
      ? audio.currentTime / audio.duration
      : 0;

    voCtx.clearRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.max(2, waveformBars[i] * height * 0.9);
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      if (i / barCount <= progress) {
        voCtx.fillStyle = '#2F6BFF';
      } else {
        voCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      }

      voCtx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }
  }

  // ============================================
  // Player Controls
  // ============================================
  function togglePlay() {
    if (!audio || !audio.src) return;

    if (audio.paused) {
      audio.play().then(() => {
        showPauseIcon();
        startProgressLoop();
      }).catch(err => {
        // Play failed
      });
    } else {
      audio.pause();
      showPlayIcon();
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  }

  function startProgressLoop() {
    if (rafId) cancelAnimationFrame(rafId);

    function loop() {
      if (audio && !audio.paused) {
        drawWaveform();
        voCurrentTime.textContent = formatTime(audio.currentTime);
        rafId = requestAnimationFrame(loop);
      }
    }
    rafId = requestAnimationFrame(loop);
  }

  function seekToPosition(clientX) {
    if (!audio || !audio.duration || !isFinite(audio.duration)) return;

    const rect = voCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = ratio * audio.duration;

    drawWaveform();
    voCurrentTime.textContent = formatTime(audio.currentTime);
    voCanvas.setAttribute('aria-valuenow', Math.round(ratio * 100));
  }

  function skip(seconds) {
    if (!audio) return;
    const newTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    audio.currentTime = newTime;
    drawWaveform();
    voCurrentTime.textContent = formatTime(newTime);
  }

  function setVolume(value) {
    if (audio) audio.volume = parseFloat(value);
  }

  function setSpeed(speed) {
    if (audio) audio.playbackRate = parseFloat(speed);
    voSpeedBtn.textContent = speed + 'x';
    voSpeedMenu.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === speed);
    });
  }

  // ============================================
  // Focus Trap
  // ============================================
  function getFocusableElements() {
    return Array.prototype.slice.call(voModal.querySelectorAll(
      'button:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ============================================
  // Event Listeners
  // ============================================
  voPlayPauseBtn.addEventListener('click', togglePlay);
  voSkipBackBtn.addEventListener('click', () => skip(-10));
  voSkipFwdBtn.addEventListener('click', () => skip(10));
  voVolumeSlider.addEventListener('input', e => setVolume(e.target.value));

  // Speed control
  voSpeedBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isExpanded = voSpeedBtn.getAttribute('aria-expanded') === 'true';
    voSpeedMenu.hidden = isExpanded;
    voSpeedBtn.setAttribute('aria-expanded', String(!isExpanded));
  });

  voSpeedMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      setSpeed(btn.dataset.speed);
      voSpeedMenu.hidden = true;
      voSpeedBtn.setAttribute('aria-expanded', 'false');
      voSpeedBtn.focus();
    });
  });

  // Close speed menu on outside click
  document.addEventListener('click', e => {
    if (!voSpeedMenu.hidden && !voSpeedBtn.contains(e.target) && !voSpeedMenu.contains(e.target)) {
      voSpeedMenu.hidden = true;
      voSpeedBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Modal close
  voCloseBtn.addEventListener('click', () => closeModal(true));
  voOverlay.addEventListener('click', () => closeModal(true));

  // Waveform interaction (mouse)
  voCanvas.addEventListener('mousedown', e => {
    isDragging = true;
    seekToPosition(e.clientX);
  });

  document.addEventListener('mousemove', e => {
    if (isDragging) seekToPosition(e.clientX);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Waveform interaction (touch)
  voCanvas.addEventListener('touchstart', e => {
    if (e.touches.length > 0) seekToPosition(e.touches[0].clientX);
  }, { passive: true });

  voCanvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      e.preventDefault();
      seekToPosition(e.touches[0].clientX);
    }
  }, { passive: false });

  // Keyboard support
  voModal.addEventListener('keydown', e => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeModal(true);
        break;
      case ' ':
        if (document.activeElement !== voVolumeSlider) {
          e.preventDefault();
          togglePlay();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        skip(-10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        skip(10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (audio) {
          audio.volume = Math.min(1, audio.volume + 0.1);
          voVolumeSlider.value = audio.volume;
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (audio) {
          audio.volume = Math.max(0, audio.volume - 0.1);
          voVolumeSlider.value = audio.volume;
        }
        break;
      case 'Tab':
        trapFocus(e);
        break;
    }
  });

  // Redraw waveform on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (voModal.classList.contains('active')) drawWaveform();
    }, 250);
  });

  // Stop audio when navigating away via [data-nav]
  document.addEventListener('click', e => {
    const navItem = e.target.closest('[data-nav]');
    if (navItem && navItem.dataset.nav !== 'voiceover') {
      if (voModal.classList.contains('active')) {
        closeModal(false);
      } else if (audio) {
        audio.pause();
        showPlayIcon();
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    }
  }, true); // capture phase — runs before existing nav handlers

  // Pause audio when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && audio && !audio.paused) {
      audio.pause();
      showPlayIcon();
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  });

  // Initialize
  document.addEventListener('DOMContentLoaded', loadVoiceOvers);
})();

// ============================================
// CINEMATIC FULLSCREEN VIEWER
// ============================================
(function() {
  'use strict';

  const viewer = document.getElementById('cinematic-viewer');
  if (!viewer) return;

  const backdrop = viewer.querySelector('.cv-backdrop');
  const closeBtn = viewer.querySelector('.cv-close');
  const prevBtn = viewer.querySelector('.cv-prev');
  const nextBtn = viewer.querySelector('.cv-next');
  const videoEl = viewer.querySelector('video');
  const tagEl = viewer.querySelector('.cv-tag');
  const titleEl = viewer.querySelector('.cv-title');
  const durationEl = viewer.querySelector('.cv-duration');

  let videoList = [];
  let currentIndex = 0;
  let lastFocused = null;
  let touchStartX = 0;

  function collectVideos() {
    videoList = [];
    document.querySelectorAll('.reel-card').forEach(card => {
      const source = card.querySelector('video source');
      const src = source && (source.src || source.dataset.src);
      if (src) {
        const grid = card.closest('.video-grid');
        const panel = grid ? grid.dataset.panel : '';
        videoList.push({
          src: src,
          category: categoryLabels[panel] || '',
          title: panel ? (panel.charAt(0).toUpperCase() + panel.slice(1)) : 'Project',
          card: card
        });
      }
    });
  }

  function openViewer(card) {
    collectVideos();
    if (videoList.length === 0) return;

    const found = videoList.findIndex(item => item.card === card);
    currentIndex = found >= 0 ? found : 0;

    lastFocused = card;
    loadVideo(currentIndex);
    viewer.classList.add('active');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => { videoEl.play().catch(() => {}); }, 300);
  }

  function loadVideo(index) {
    if (index < 0) index = videoList.length - 1;
    if (index >= videoList.length) index = 0;

    currentIndex = index;
    const item = videoList[index];

    videoEl.src = item.src;
    tagEl.textContent = item.category;
    titleEl.textContent = item.title;
    durationEl.textContent = '';

    videoEl.addEventListener('loadedmetadata', function setDur() {
      const m = Math.floor(videoEl.duration / 60);
      const s = Math.floor(videoEl.duration % 60);
      durationEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
      videoEl.removeEventListener('loadedmetadata', setDur);
    });
  }

  function closeViewer() {
    viewer.classList.remove('active');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();

    if (lastFocused) lastFocused.focus();
  }

  function next() {
    loadVideo(currentIndex + 1);
    setTimeout(() => { videoEl.play().catch(() => {}); }, 200);
  }

  function prev() {
    loadVideo(currentIndex - 1);
    setTimeout(() => { videoEl.play().catch(() => {}); }, 200);
  }

  // Close
  closeBtn.addEventListener('click', closeViewer);
  backdrop.addEventListener('click', closeViewer);

  // Navigation
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard
  viewer.addEventListener('keydown', e => {
    switch (e.key) {
      case 'Escape': e.preventDefault(); closeViewer(); break;
      case 'ArrowLeft': e.preventDefault(); prev(); break;
      case 'ArrowRight': e.preventDefault(); next(); break;
    }
  });

  // Touch swipe
  viewer.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  viewer.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) {
      if (dx > 0) prev(); else next();
    }
  }, { passive: true });

  // Wire up card clicks — but NOT when clicking the native video controls
  document.addEventListener('click', e => {
    const card = e.target.closest('.reel-card');
    if (!card) return;
    if (e.target.tagName === 'VIDEO') return;

    // Only open viewer for cards in the currently active panel
    const grid = card.closest('.video-grid');
    if (grid && grid.classList.contains('active')) {
      e.preventDefault();
      openViewer(card);
    }
  });

  // Stop viewer audio when navigating away
  document.addEventListener('click', e => {
    const navItem = e.target.closest('[data-nav]');
    if (navItem && viewer.classList.contains('active')) {
      closeViewer();
    }
  }, true);
})();

// ============================================
// PREMIUM IMAGE FADE-IN
// Fades in images smoothly after load (no layout shift)
// Handles existing + dynamically created images via MutationObserver
// ============================================
(function() {
  function fadeIn(img) {
    if (!img.src || img.src === '') return;
    if (img.hasAttribute('fetchpriority')) return;
    if (img.classList.contains('splash-logo')) return;
    if (img.classList.contains('pp-img-fade')) return;

    img.classList.add('pp-img-fade');

    if (img.complete && img.naturalWidth > 0) {
      requestAnimationFrame(() => img.classList.add('pp-img-loaded'));
    } else {
      img.addEventListener('load', () => img.classList.add('pp-img-loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('pp-img-loaded'), { once: true });
    }
  }

  function processImages(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('img').forEach(fadeIn);
  }

  // Process existing images
  processImages(document);

  // Watch for dynamically added images (model cards, buyer cards, VO cards)
  const imgObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IMG') {
          fadeIn(node);
        } else if (node.querySelectorAll) {
          processImages(node);
        }
      });
    });
  });

  imgObserver.observe(document.body, { childList: true, subtree: true });
})();

// ============================================
// REQUEST A PROJECT — Form Validation & Submission
// To connect a real backend, set FORM_ENDPOINT to your URL
// Works with: Formspree, Cloudflare Workers, Resend, or any POST endpoint
// Leave empty for simulation mode (shows success without sending)
// ============================================
const FORM_ENDPOINT = '';

(function() {
  'use strict';

  const form = document.getElementById('request-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const submitText = submitBtn.querySelector('.submit-text');
  const submitSpinner = submitBtn.querySelector('.submit-spinner');
  const successDiv = document.getElementById('form-success');
  const descTextarea = document.getElementById('req-description');
  const charCounter = document.getElementById('char-counter');
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('req-file');
  const fileListDiv = document.getElementById('upload-files');

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const MIN_DESC_LENGTH = 30;
  let uploadedFiles = [];

  // — Character Counter —
  function updateCharCounter() {
    var len = descTextarea.value.length;
    charCounter.textContent = len + ' / ' + MIN_DESC_LENGTH;
    charCounter.classList.toggle('char-warning', len > 0 && len < MIN_DESC_LENGTH);
    charCounter.classList.toggle('char-ok', len >= MIN_DESC_LENGTH);
  }

  descTextarea.addEventListener('input', updateCharCounter);

  // — Field Validation —
  function showError(field, errId, message) {
    var errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = message;
    field.classList.add('form-error-input');
  }

  function clearError(field, errId) {
    var errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
    field.classList.remove('form-error-input');
  }

  function validateField(field) {
    var id = field.id;
    var val = field.value.trim();

    switch (id) {
      case 'req-name':
        if (!val) { showError(field, 'err-name', 'Please enter your full name.'); return false; }
        if (val.length < 2) { showError(field, 'err-name', 'Name must be at least 2 characters.'); return false; }
        clearError(field, 'err-name'); return true;

      case 'req-phone':
        if (!val) { showError(field, 'err-phone', 'Please enter your phone number.'); return false; }
        if (!/^[+]?[\d\s\-()]{6,20}$/.test(val)) { showError(field, 'err-phone', 'Please enter a valid phone number.'); return false; }
        clearError(field, 'err-phone'); return true;

      case 'req-email':
        if (!val) { showError(field, 'err-email', 'Please enter your email address.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { showError(field, 'err-email', 'Please enter a valid email address.'); return false; }
        clearError(field, 'err-email'); return true;

      case 'req-service':
        if (!val) { showError(field, 'err-service', 'Please select a service.'); return false; }
        clearError(field, 'err-service'); return true;

      case 'req-budget':
        if (!val) { showError(field, 'err-budget', 'Please select a budget range.'); return false; }
        clearError(field, 'err-budget'); return true;

      case 'req-deadline':
        if (!val) { showError(field, 'err-deadline', 'Please select a preferred deadline.'); return false; }
        var selected = new Date(val);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) { showError(field, 'err-deadline', 'Deadline cannot be in the past.'); return false; }
        clearError(field, 'err-deadline'); return true;

      case 'req-description':
        if (!val) { showError(field, 'err-description', 'Please describe your project.'); return false; }
        if (val.length < MIN_DESC_LENGTH) { showError(field, 'err-description', 'Description must be at least ' + MIN_DESC_LENGTH + ' characters.'); return false; }
        clearError(field, 'err-description'); return true;
    }
    return true;
  }

  // Validate on blur
  form.querySelectorAll('.form-input[required]').forEach(function(field) {
    field.addEventListener('blur', function() { validateField(field); });
    field.addEventListener('input', function() {
      if (field.classList.contains('form-error-input')) validateField(field);
    });
  });

  // — Drag & Drop —
  function handleFiles(files) {
    Array.from(files).forEach(function(file) {
      if (file.size > MAX_FILE_SIZE) return;
      if (uploadedFiles.some(function(f) { return f.name === file.name && f.size === file.size; })) return;
      uploadedFiles.push(file);
      renderFileList();
    });
  }

  function renderFileList() {
    fileListDiv.innerHTML = '';
    uploadedFiles.forEach(function(file, index) {
      var item = document.createElement('div');
      item.className = 'upload-file-item';
      item.innerHTML =
        '<span class="file-name">' + file.name + '</span>' +
        '<span class="file-size">' + formatSize(file.size) + '</span>' +
        '<button type="button" class="file-remove" aria-label="Remove file">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>';
      item.querySelector('.file-remove').addEventListener('click', function() {
        uploadedFiles.splice(index, 1);
        renderFileList();
      });
      fileListDiv.appendChild(item);
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  uploadZone.addEventListener('click', function(e) {
    if (e.target === fileInput) return;
    fileInput.click();
  });

  uploadZone.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', function() {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  uploadZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', function() {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  // — Form Submission —
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var fields = form.querySelectorAll('.form-input[required]');
    var isValid = true;
    fields.forEach(function(field) {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      var firstError = form.querySelector('.form-error-input');
      if (firstError) firstError.focus();
      return;
    }

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    submitSpinner.hidden = false;

    try {
      if (FORM_ENDPOINT) {
        var formData = new FormData(form);
        uploadedFiles.forEach(function(file) {
          formData.append('files', file);
        });
        var response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Network response was not ok');
      } else {
        await new Promise(function(resolve) { setTimeout(resolve, 1200); });
      }

      // Success
      form.style.display = 'none';
      successDiv.hidden = false;
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitText.textContent = 'Send Request';
      submitSpinner.hidden = true;
      var errEl = document.getElementById('err-description');
      if (errEl) errEl.textContent = 'Something went wrong. Please try again.';
    }
  });

  updateCharCounter();
})();

// ============================================
// START YOUR PROJECT — WhatsApp Form
// Generates a formatted WhatsApp message and opens wa.me
// ============================================
const WHATSAPP_NUMBER = '212663493003';

(function() {
  'use strict';

  var form = document.getElementById('start-form');
  if (!form) return;

  var submitBtn = document.getElementById('start-submit-btn');
  var submitText = submitBtn.querySelector('.submit-text');
  var submitSpinner = submitBtn.querySelector('.submit-spinner');
  var successDiv = document.getElementById('start-form-success');
  var descTextarea = document.getElementById('start-description');
  var charCounter = document.getElementById('start-char-counter');
  var consentCheckbox = document.getElementById('start-consent');

  var MIN_DESC_LENGTH = 30;

  // — Character Counter —
  function updateCharCounter() {
    var len = descTextarea.value.length;
    charCounter.textContent = len + ' / ' + MIN_DESC_LENGTH;
    charCounter.classList.toggle('char-warning', len > 0 && len < MIN_DESC_LENGTH);
    charCounter.classList.toggle('char-ok', len >= MIN_DESC_LENGTH);
  }

  descTextarea.addEventListener('input', updateCharCounter);

  // — Validation helpers —
  function showError(errId, message) {
    var el = document.getElementById(errId);
    if (el) el.textContent = message;
  }

  function clearError(errId) {
    var el = document.getElementById(errId);
    if (el) el.textContent = '';
  }

  function validateField(field) {
    var id = field.id;
    var val = field.value.trim();

    switch (id) {
      case 'start-name':
        if (!val) { showError('start-err-name', 'Please enter your full name.'); return false; }
        if (val.length < 2) { showError('start-err-name', 'Name must be at least 2 characters.'); return false; }
        clearError('start-err-name'); return true;

      case 'start-phone':
        if (!val) { showError('start-err-phone', 'Please enter your phone number.'); return false; }
        if (!/^[+]?[\d\s\-()]{6,20}$/.test(val)) { showError('start-err-phone', 'Please enter a valid phone number.'); return false; }
        clearError('start-err-phone'); return true;

      case 'start-email':
        if (!val) { showError('start-err-email', 'Please enter your email address.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { showError('start-err-email', 'Please enter a valid email address.'); return false; }
        clearError('start-err-email'); return true;

      case 'start-service':
        if (!val) { showError('start-err-service', 'Please select a service.'); return false; }
        clearError('start-err-service'); return true;

      case 'start-budget':
        if (!val) { showError('start-err-budget', 'Please select a budget range.'); return false; }
        clearError('start-err-budget'); return true;

      case 'start-description':
        if (!val) { showError('start-err-description', 'Please describe your project.'); return false; }
        if (val.length < MIN_DESC_LENGTH) { showError('start-err-description', 'Description must be at least ' + MIN_DESC_LENGTH + ' characters.'); return false; }
        clearError('start-err-description'); return true;
    }
    return true;
  }

  // Validate on blur + clear on input
  form.querySelectorAll('.form-input[required]').forEach(function(field) {
    field.addEventListener('blur', function() { validateField(field); });
    field.addEventListener('input', function() {
      if (field.classList.contains('form-error-input')) validateField(field);
    });
  });

  // — Build WhatsApp Message —
  function buildWhatsAppMessage() {
    var name = document.getElementById('start-name').value.trim();
    var phone = document.getElementById('start-phone').value.trim();
    var email = document.getElementById('start-email').value.trim();
    var company = document.getElementById('start-company').value.trim();
    var service = document.getElementById('start-service').value;
    var budget = document.getElementById('start-budget').value;
    var deadline = document.getElementById('start-deadline').value;
    var reference = document.getElementById('start-reference').value.trim();
    var description = document.getElementById('start-description').value.trim();

    var msg = '';
    msg += '━━━━━━━━━━━━━━━━━━━━━━\n';
    msg += '📋 NEW PROJECT REQUEST\n';
    msg += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
    msg += '👤 Full Name\n' + name + '\n\n';
    msg += '📱 Phone\n' + phone + '\n\n';
    msg += '📧 Email\n' + email + '\n\n';
    msg += '🏢 Company\n' + (company || '—') + '\n\n';
    msg += '🎬 Service\n' + service + '\n\n';
    msg += '💰 Budget\n' + budget + '\n\n';
    msg += '📅 Preferred Deadline\n' + (deadline || '—') + '\n\n';
    msg += '🔗 Reference Link\n' + (reference || '—') + '\n\n';
    msg += '📝 Project Description\n' + description + '\n\n';
    msg += '━━━━━━━━━━━━━━━━━━━━━━';

    return msg;
  }

  // — Form Submission —
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate all required fields
    var fields = form.querySelectorAll('.form-input[required]');
    var isValid = true;
    fields.forEach(function(field) {
      if (!validateField(field)) {
        field.classList.add('form-error-input');
        isValid = false;
      } else {
        field.classList.remove('form-error-input');
      }
    });

    // Validate consent checkbox
    if (!consentCheckbox.checked) {
      showError('start-err-consent', 'Please agree to be contacted.');
      isValid = false;
    } else {
      clearError('start-err-consent');
    }

    if (!isValid) {
      var firstError = form.querySelector('.form-error-input') || form.querySelector('.form-error:not(:empty)');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitText.textContent = 'Preparing...';
    submitSpinner.hidden = false;

    // Build message and open WhatsApp
    setTimeout(function() {
      var message = buildWhatsAppMessage();
      var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

      // Show success
      form.style.display = 'none';
      successDiv.hidden = false;
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Open WhatsApp
      window.open(waUrl, '_blank');

      // Reset button after 1s
      setTimeout(function() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitText.textContent = '🚀 Send via WhatsApp';
        submitSpinner.hidden = true;
      }, 1000);
    }, 600);
  });

  updateCharCounter();
})();
