// Prevent browser from restoring scroll position on page reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".video-grid");
const year = document.querySelector("#year");
const mediaOpeners = document.querySelectorAll("[data-lightbox-src]");
const imageModal = document.querySelector("#image-modal");
const modalImage = imageModal ? imageModal.querySelector("img") : null;
const modalClose = imageModal ? imageModal.querySelector(".modal-close") : null;
const navToggle = document.querySelector("#nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

if (year) {
  year.textContent = new Date().getFullYear();
}

function pauseAllVideos() {
  document.querySelectorAll("video").forEach((video) => video.pause());
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === filter);
    });

    pauseAllVideos();
  });
});

function openImagePreview(opener) {
  if (!imageModal || !modalImage) return;

  modalImage.src = opener.dataset.lightboxSrc;
  modalImage.alt = opener.dataset.lightboxAlt || "";
  imageModal.classList.add("active");
  imageModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeImagePreview() {
  if (!imageModal || !modalImage) return;

  imageModal.classList.remove("active");
  imageModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  modalImage.removeAttribute("src");
  modalImage.alt = "";
}

mediaOpeners.forEach((opener) => {
  opener.addEventListener("click", () => openImagePreview(opener));
});

if (modalClose) {
  modalClose.addEventListener("click", closeImagePreview);
}

if (imageModal) {
  imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) {
      closeImagePreview();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeImagePreview();
  }
});



// Initialize existing videos with premium styling
document.querySelectorAll("video").forEach(video => {
  video.setAttribute("controlsList", "nodownload noplaybackrate");
  video.disablePictureInPicture = true;
  
  const card = video.closest(".reel-card");
  if (card) {
    // Add loading handlers
    video.addEventListener("loadstart", () => {
      card.classList.add("loading");
    });
    
    video.addEventListener("loadedmetadata", () => {
      card.classList.remove("loading");
    });
    
    video.addEventListener("loadeddata", () => {
      card.classList.remove("loading");
    });

    video.addEventListener("canplay", () => {
      card.classList.remove("loading");
    });
    
    video.addEventListener("waiting", () => {
      card.classList.add("loading");
    });
    
    video.addEventListener("playing", () => {
      card.classList.remove("loading");
    });

    // Fallback: remove loading state after 5s (iOS)
    setTimeout(() => card.classList.remove("loading"), 5000);
  }
});

// Mobile Navigation Toggle
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isActive = navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    navToggle.setAttribute("aria-expanded", String(isActive));
    navToggle.setAttribute("aria-label", isActive ? "إغلاق القائمة" : "فتح القائمة");
  });

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "فتح القائمة");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "فتح القائمة");
    }
  });
}

// Active nav link on scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id], main[id], footer[id]");
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

window.addEventListener("scroll", updateActiveNavLink);
updateActiveNavLink();

// Premium Floating Bottom Navigation
const bottomNav = document.querySelector("#bottom-nav");
const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
const menuBtn = document.querySelector("#menu-btn");
const menuPanel = document.querySelector("#menu-panel");
const menuClose = document.querySelector("#menu-close");
const menuItems = document.querySelectorAll(".menu-item");

// Bottom nav click handler
bottomNavItems.forEach(item => {
  item.addEventListener("click", function(e) {
    // Remove active from all items
    bottomNavItems.forEach(i => i.classList.remove("active"));
    // Add active to clicked item
    this.classList.add("active");
  });
});

// Menu panel functionality
if (menuBtn && menuPanel) {
  menuBtn.addEventListener("click", () => {
    menuPanel.classList.add("active");
    menuPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  });

  menuClose.addEventListener("click", closeMenu);

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      closeMenu();
    });
  });

  menuPanel.addEventListener("click", (e) => {
    if (e.target === menuPanel) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuPanel.classList.contains("active")) {
      closeMenu();
    }
  });

  function closeMenu() {
    menuPanel.classList.remove("active");
    menuPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }
}

// Add ripple effect to bottom nav items
bottomNavItems.forEach(item => {
  item.addEventListener("click", function(e) {
    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.width = "20px";
    ripple.style.height = "20px";
    ripple.style.background = "rgba(59, 130, 246, 0.3)";
    ripple.style.borderRadius = "50%";
    ripple.style.transform = "translate(-50%, -50%)";
    ripple.style.pointerEvents = "none";
    ripple.style.animation = "ripple 0.6s ease-out";
    
    const rect = this.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + "px";
    ripple.style.top = (e.clientY - rect.top) + "px";
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation
const style = document.createElement("style");
style.textContent = `
  @keyframes ripple {
    to {
      width: 100px;
      height: 100px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// SPA PAGE NAVIGATION SYSTEM
// ============================================

const pageViews = document.querySelectorAll('.page-view');
const navItems = document.querySelectorAll('[data-nav]');

function showPage(pageName, scrollTarget) {
  // Pause all videos when leaving a page
  pauseAllVideos();

  // Hide all page views
  pageViews.forEach(pv => pv.classList.remove('active'));

  // Show the target page
  const targetPage = document.getElementById('page-' + pageName);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update bottom nav active states
  bottomNavItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.nav === pageName || 
        (pageName === 'home' && item.dataset.nav === 'home')) {
      item.classList.add('active');
    }
  });

  // Handle scroll targets for home page
  if (pageName === 'home' || pageName.indexOf('home') === 0) {
    // Show home page
    const homePage = document.getElementById('page-home');
    if (homePage && !homePage.classList.contains('active')) {
      pageViews.forEach(pv => pv.classList.remove('active'));
      homePage.classList.add('active');
    }

    // Determine scroll target
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
      // Default: scroll to top
      window.scrollTo(0, 0);
    }
  } else {
    // Non-home pages: scroll to top
    window.scrollTo(0, 0);
  }

  // Trigger reveal observer for newly visible elements.
  // When navigating to home-portfolio / home-contact, targetPage is null
  // (no page-home-portfolio element exists), so use the home page as the
  // reveal container to ensure its children get re-observed.
  var revealContainer = targetPage;
  if (!revealContainer && pageName.indexOf('home') === 0) {
    revealContainer = document.getElementById('page-home');
  }
  if (revealContainer) {
    revealContainer.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach(el => {
      if (!el.classList.contains('active')) {
        revealObserver.observe(el);
      }
    });

    // Force-activate reveal elements already in viewport — the
    // IntersectionObserver callback is async and may not fire promptly
    // when a page-view was just switched from display:none to block
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        revealContainer.querySelectorAll('.reveal:not(.active), .reveal-fade:not(.active), .reveal-scale:not(.active)').forEach(el => {
          var rect = el.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            el.classList.add('active');
          }
        });
      });
    });
  }
}

// Attach click handlers to all [data-nav] elements
navItems.forEach(item => {
  if (item.id === 'menu-btn') return; // Skip the menu button

  item.addEventListener('click', function(e) {
    const nav = this.dataset.nav;
    if (!nav) return;

    // For home-related navs that use hash links, let default behavior handle scroll
    if (nav === 'home' || nav === 'home-portfolio' || nav === 'home-contact') {
      // Only prevent default if we need to switch pages
      const homePage = document.getElementById('page-home');
      if (!homePage || !homePage.classList.contains('active')) {
        e.preventDefault();
        showPage(nav);
      }
      // Otherwise let the hash link work normally
    } else {
      // For models, media-buyer, equipment: prevent default and switch page
      e.preventDefault();
      showPage(nav);
    }

    // Close menu panel if open
    if (menuPanel && menuPanel.classList.contains('active')) {
      closeMenu();
    }
  });
});

// ============================================
// MODEL BOOKING - WHATSAPP MESSAGE (event delegation for dynamic cards)
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
      <a href="#" class="button primary model-book-btn">احجز هذا المودل</a>
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

    models.forEach((model) => {
      const card = createModelCard(model);
      grid.appendChild(card);
      revealObserver.observe(card);
    });
  } catch (error) {
    console.error('Failed to load models:', error);
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

    campaigns.forEach((campaign) => {
      const card = createBuyerCard(campaign);
      grid.appendChild(card);
      revealObserver.observe(card);
    });
  } catch (error) {
    console.error('Failed to load media buyer campaigns:', error);
  }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

// Intersection Observer for scroll reveal
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -100px 0px',
  threshold: 0.1
};

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      // Optional: unobserve after animation to improve performance
      // observer.unobserve(entry.target);
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

// Observe all reveal elements
document.addEventListener('DOMContentLoaded', () => {
  // Ensure page always opens at the top
  window.scrollTo(0, 0);

  // Load models dynamically from JSON
  loadModels();

  // Load media buyer campaigns dynamically from JSON
  loadMediaBuyer();

  // Ensure UGC is the default active category
  const ugcTab = document.querySelector('.tab[data-filter="ugc"]');
  const ugcPanel = document.querySelector('.video-grid[data-panel="ugc"]');
  if (ugcTab && ugcPanel) {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    ugcTab.classList.add('active');
    ugcPanel.classList.add('active');
  }

  // Reveal on scroll
  const revealElements = document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale');
  revealElements.forEach(el => revealObserver.observe(el));

  // Add reveal classes to key elements
  const profileCard = document.querySelector('.profile-card');
  const portfolioShell = document.querySelector('.portfolio-shell');
  const footer = document.querySelector('.footer');
  const reelCards = document.querySelectorAll('.reel-card');

  if (profileCard) {
    profileCard.classList.add('reveal');
    revealObserver.observe(profileCard);
  }

  if (portfolioShell) {
    portfolioShell.classList.add('reveal');
    portfolioShell.classList.add('reveal-delay-2');
    revealObserver.observe(portfolioShell);
  }

  if (footer) {
    footer.classList.add('reveal');
    footer.classList.add('reveal-delay-3');
    revealObserver.observe(footer);
  }

  // Stagger reel cards with reveal-scale
  reelCards.forEach((card, index) => {
    card.classList.add('reveal-scale');
    // Add staggered delay based on index
    const delay = Math.min(Math.floor(index / 3) + 1, 5);
    card.classList.add(`reveal-delay-${delay}`);
    revealObserver.observe(card);
  });

  // Add reveal to profile elements
  const avatar = document.querySelector('.avatar-ring');
  const profileInfo = document.querySelector('.profile-info');
  const profileLine = document.querySelector('.profile-line');
  const bio = document.querySelector('.bio');

  if (avatar) {
    avatar.classList.add('reveal-scale');
    revealObserver.observe(avatar);
  }

  if (profileInfo) {
    profileInfo.classList.add('reveal');
    profileInfo.classList.add('reveal-delay-1');
    revealObserver.observe(profileInfo);
  }

  if (profileLine) {
    profileLine.classList.add('reveal');
    profileLine.classList.add('reveal-delay-2');
    revealObserver.observe(profileLine);
  }

  if (bio) {
    bio.classList.add('reveal-fade');
    bio.classList.add('reveal-delay-2');
    revealObserver.observe(bio);
  }

  // Observe profile location
  const profileLocation = document.querySelector('.profile-location');
  if (profileLocation) {
    revealObserver.observe(profileLocation);
  }

  // Observe profile actions
  const profileActions = document.querySelector('.profile-actions');
  if (profileActions) {
    revealObserver.observe(profileActions);
  }

  // Add page transition class
  document.body.classList.add('page-transition');

  // Remove page-transition after animation completes.
  // Do NOT wait for the load event — on iOS Safari with many <video preload="metadata">,
  // load is delayed significantly, keeping a transform on body that breaks
  // IntersectionObserver root calculations and blocks the initial render.
  setTimeout(() => {
    document.body.classList.remove('page-transition');
  }, 600);

  // Force-activate reveal elements that are already in the viewport on initial load.
  // On iOS Safari the IntersectionObserver callback may not fire synchronously after
  // observe() — it is scheduled for a future frame. If the layout isn't stable yet
  // (due to the overflow or transform issues above), the callback can be delayed
  // indefinitely, leaving the gallery invisible until the user interacts.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll('.reveal:not(.active), .reveal-fade:not(.active), .reveal-scale:not(.active)').forEach(el => {
        var rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          el.classList.add('active');
        }
      });
    });
  });

  // Enhance video cards with overlays
  enhanceReelCards();
});

// ============================================
// VIDEO CARD OVERLAYS
// ============================================
var categoryLabels = {
  ugc: 'UGC',
  shoting: 'Shooting',
  stores: 'Stores',
  events: 'Events',
  services: 'Services'
};

function enhanceReelCards() {
  document.querySelectorAll('.reel-card').forEach(function(card) {
    if (card.querySelector('.reel-overlay')) return;

    var grid = card.closest('.video-grid');
    var panel = grid ? grid.dataset.panel : '';
    var label = categoryLabels[panel] || '';

    var overlay = document.createElement('div');
    overlay.className = 'reel-overlay';
    overlay.innerHTML =
      '<span class="reel-tag">' + label + '</span>' +
      '<div class="reel-play-btn">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' +
      '</div>' +
      '<div class="reel-gradient"></div>';

    card.appendChild(overlay);

    var video = card.querySelector('video');
    if (video) {
      video.addEventListener('play', function() {
        card.classList.add('playing');
      });
      video.addEventListener('pause', function() {
        card.classList.remove('playing');
      });
      video.addEventListener('ended', function() {
        card.classList.remove('playing');
      });
    }
  });
}

// ============================================
// ANCHOR LINK NAVIGATION
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      target.style.scrollMarginTop = '100px';
    }
  });
});

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Throttle function for scroll events
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

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized scroll handler
const optimizedScrollHandler = throttle(() => {
  updateActiveNavLink();
}, 100);

// Replace scroll event listeners with optimized version
window.removeEventListener('scroll', updateActiveNavLink);

window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// Lazy load videos for better performance
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      if (video.dataset.src) {
        video.src = video.dataset.src;
        video.removeAttribute('data-src');
      }
      videoObserver.unobserve(video);
    }
  });
}, {
  rootMargin: '200px 0px',
  threshold: 0.01
});

// Observe all videos for lazy loading
document.querySelectorAll('video[data-src]').forEach(video => {
  videoObserver.observe(video);
});

// Preload critical resources
window.addEventListener('load', () => {
  // Ensure we're at the top after everything loads
  window.scrollTo(0, 0);
});

// Handle visibility change to pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause non-essential animations
    document.querySelectorAll('.reel-card').forEach(card => {
      card.style.animationPlayState = 'paused';
    });
  } else {
    // Resume animations
    document.querySelectorAll('.reel-card').forEach(card => {
      card.style.animationPlayState = 'running';
    });
  }
});

// Optimize for mobile devices
const isMobile = window.innerWidth <= 768;

if (isMobile) {
  // Reduce animation complexity on mobile
  document.documentElement.style.setProperty('--transition', 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)');
  
  // Disable some hover effects on touch devices
  const touchMediaQuery = window.matchMedia('(hover: none)');
  if (touchMediaQuery.matches) {
    document.querySelectorAll('.reel-card').forEach(card => {
      card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
  }
}

// Handle resize events
window.addEventListener('resize', debounce(() => {
  // Recalculate any size-dependent animations
  const isNowMobile = window.innerWidth <= 768;
  if (isNowMobile !== isMobile) {
    // Instead of reloading, we'll handle responsive changes properly
    // We'll trigger a refresh of the scroll reveal elements
    const revealElements = document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale');
    revealElements.forEach(el => {
      el.classList.remove('active');
      // Force reflow to reset animations
      void el.offsetWidth;
      el.classList.add('active');
    });
  }
}, 250));

// Performance monitoring (optional - can be removed in production)
if (window.performance && window.performance.mark) {
  window.performance.mark('animations-initialized');
}

// ============================================
// VOICE OVER SECTION
// ============================================

(function() {
  'use strict';

  // DOM elements
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
    card.addEventListener('keydown', (e) => {
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
      console.error('Failed to load voice overs:', err);
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

    // Set content
    voCoverImg.src = card.dataset.cover || '';
    voCoverImg.alt = card.dataset.title || '';
    voTitle.textContent = card.dataset.title || '';
    voCategory.textContent = card.dataset.category || '';
    voDuration.textContent = card.dataset.duration || '';
    voDesc.textContent = card.dataset.description || '';

    // Reset player
    showPlayIcon();
    voCurrentTime.textContent = '0:00';
    voTotalTime.textContent = card.dataset.duration || '0:00';
    voVolumeSlider.value = 1;

    // Clear waveform
    waveformBars = [];
    voCtx.clearRect(0, 0, voCanvas.width, voCanvas.height);

    // Show modal
    voModal.classList.add('active');
    voModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    // Load audio
    loadAudio(card.dataset.audio);

    // Focus play button
    setTimeout(() => voPlayPauseBtn.focus(), 100);
  }

  function closeModal(restoreFocus) {
    if (restoreFocus === undefined) restoreFocus = true;

    voModal.classList.remove('active');
    voModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    // Stop audio
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // Cancel RAF
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Revoke blob URL
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      audioBlobUrl = null;
    }

    // Hide speed menu
    voSpeedMenu.hidden = true;
    voSpeedBtn.setAttribute('aria-expanded', 'false');

    // Reset play icon
    showPlayIcon();

    // Restore focus
    if (restoreFocus && lastFocused) {
      lastFocused.focus();
    }
  }

  // ============================================
  // Audio Loading & Waveform
  // ============================================

  async function loadAudio(url) {
    if (!url) {
      console.error('No audio URL provided');
      showLoading(false);
      return;
    }

    showLoading(true);

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Create blob URL for audio element (Blob constructor copies data, does not detach)
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
      audioBlobUrl = URL.createObjectURL(new Blob([arrayBuffer]));

      // Create audio element if needed
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

        audio.addEventListener('canplay', () => {
          showLoading(false);
        });

        audio.addEventListener('waiting', () => {
          showLoading(true);
        });

        audio.addEventListener('playing', () => {
          showLoading(false);
        });

        audio.addEventListener('error', () => {
          showLoading(false);
          console.error('Audio playback error');
        });

        // Prevent context menu (download)
        audio.addEventListener('contextmenu', (e) => e.preventDefault());
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
        console.warn('Waveform decode failed, using fallback:', decodeErr);
        generatePseudoWaveform();
      }

    } catch (err) {
      console.error('Failed to load audio:', err);
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
        console.error('Play failed:', err);
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

  // Play/Pause
  voPlayPauseBtn.addEventListener('click', togglePlay);

  // Skip buttons
  voSkipBackBtn.addEventListener('click', () => skip(-10));
  voSkipFwdBtn.addEventListener('click', () => skip(10));

  // Volume
  voVolumeSlider.addEventListener('input', (e) => setVolume(e.target.value));

  // Speed control
  voSpeedBtn.addEventListener('click', (e) => {
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
  document.addEventListener('click', (e) => {
    if (!voSpeedMenu.hidden && !voSpeedBtn.contains(e.target) && !voSpeedMenu.contains(e.target)) {
      voSpeedMenu.hidden = true;
      voSpeedBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Modal close
  voCloseBtn.addEventListener('click', () => closeModal(true));
  voOverlay.addEventListener('click', () => closeModal(true));

  // Waveform interaction (mouse)
  voCanvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    seekToPosition(e.clientX);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) seekToPosition(e.clientX);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Waveform interaction (touch)
  voCanvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      seekToPosition(e.touches[0].clientX);
    }
  }, { passive: true });

  voCanvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      seekToPosition(e.touches[0].clientX);
    }
  }, { passive: false });

  // Keyboard support
  voModal.addEventListener('keydown', (e) => {
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
      if (voModal.classList.contains('active')) {
        drawWaveform();
      }
    }, 250);
  });

  // Stop audio when navigating away via [data-nav]
  document.addEventListener('click', (e) => {
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

  // Pause audio when tab is hidden (battery / performance)
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

  var viewer = document.getElementById('cinematic-viewer');
  if (!viewer) return;

  var backdrop = viewer.querySelector('.cv-backdrop');
  var closeBtn = viewer.querySelector('.cv-close');
  var prevBtn = viewer.querySelector('.cv-prev');
  var nextBtn = viewer.querySelector('.cv-next');
  var videoEl = viewer.querySelector('video');
  var tagEl = viewer.querySelector('.cv-tag');
  var titleEl = viewer.querySelector('.cv-title');
  var durationEl = viewer.querySelector('.cv-duration');

  var videoList = [];
  var currentIndex = 0;
  var lastFocused = null;
  var touchStartX = 0;

  function collectVideos() {
    videoList = [];
    document.querySelectorAll('.reel-card').forEach(function(card) {
      var video = card.querySelector('video source');
      if (video && video.src) {
        var grid = card.closest('.video-grid');
        var panel = grid ? grid.dataset.panel : '';
        videoList.push({
          src: video.src,
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

    // Find the index of the clicked card
    var found = videoList.findIndex(function(item) { return item.card === card; });
    currentIndex = found >= 0 ? found : 0;

    lastFocused = card;
    loadVideo(currentIndex);
    viewer.classList.add('active');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    setTimeout(function() { videoEl.play().catch(function(){}); }, 300);
  }

  function loadVideo(index) {
    if (index < 0) index = videoList.length - 1;
    if (index >= videoList.length) index = 0;

    currentIndex = index;
    var item = videoList[index];

    videoEl.src = item.src;
    tagEl.textContent = item.category;
    titleEl.textContent = item.title;
    durationEl.textContent = '';

    videoEl.addEventListener('loadedmetadata', function setDur() {
      var m = Math.floor(videoEl.duration / 60);
      var s = Math.floor(videoEl.duration % 60);
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
    setTimeout(function() { videoEl.play().catch(function(){}); }, 200);
  }

  function prev() {
    loadVideo(currentIndex - 1);
    setTimeout(function() { videoEl.play().catch(function(){}); }, 200);
  }

  // Close
  closeBtn.addEventListener('click', closeViewer);
  backdrop.addEventListener('click', closeViewer);

  // Navigation
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard
  viewer.addEventListener('keydown', function(e) {
    switch (e.key) {
      case 'Escape': e.preventDefault(); closeViewer(); break;
      case 'ArrowLeft': e.preventDefault(); prev(); break;
      case 'ArrowRight': e.preventDefault(); next(); break;
    }
  });

  // Touch swipe
  viewer.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  viewer.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) {
      if (dx > 0) prev(); else next();
    }
  }, { passive: true });

  // Wire up card clicks — but NOT when clicking the native video controls
  document.addEventListener('click', function(e) {
    var card = e.target.closest('.reel-card');
    if (!card) return;
    // If the click is on the video element itself (controls), don't open viewer
    if (e.target.tagName === 'VIDEO') return;

    // Only open viewer for cards in the currently active panel
    var grid = card.closest('.video-grid');
    if (grid && grid.classList.contains('active')) {
      e.preventDefault();
      openViewer(card);
    }
  });

  // Stop viewer audio when navigating away
  document.addEventListener('click', function(e) {
    var navItem = e.target.closest('[data-nav]');
    if (navItem && viewer.classList.contains('active')) {
      closeViewer();
    }
  }, true);

})();

// ============================================
// CATEGORY PAGE VIDEO CLONER
// ============================================

(function() {
  'use strict';

  var categories = [
    { panel: 'ugc', grid: 'grid-cat-ugc' },
    { panel: 'shoting', grid: 'grid-cat-shoting' },
    { panel: 'stores', grid: 'grid-cat-stores' },
    { panel: 'events', grid: 'grid-cat-events' },
    { panel: 'services', grid: 'grid-cat-services' }
  ];

  function cloneVideos() {
    categories.forEach(function(cat) {
      var source = document.querySelector('.video-grid[data-panel="' + cat.panel + '"]');
      var target = document.getElementById(cat.grid);
      if (!source || !target) return;

      target.innerHTML = '';
      var cards = source.querySelectorAll('.reel-card');
      cards.forEach(function(card) {
        var clone = card.cloneNode(true);
        // Remove reveal animation classes from clones — they cause opacity:0
        // that the IntersectionObserver may not clear on hidden pages
        clone.classList.remove('reveal-scale', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5');
        target.appendChild(clone);

        // Re-init loading handlers for cloned videos
        var video = clone.querySelector('video');
        if (video) {
          video.addEventListener('loadstart', function() {
            clone.classList.add('loading');
            // Fresh fallback from actual load start, not from clone time
            setTimeout(function() { clone.classList.remove('loading'); }, 5000);
          });
          video.addEventListener('loadedmetadata', function() { clone.classList.remove('loading'); });
          video.addEventListener('loadeddata', function() { clone.classList.remove('loading'); });
          video.addEventListener('canplay', function() { clone.classList.remove('loading'); });
          video.addEventListener('waiting', function() { clone.classList.add('loading'); });
          video.addEventListener('playing', function() { clone.classList.remove('loading'); });
          // Explicitly trigger loading — cloned videos in display:none
          // containers don't auto-load their <source> elements
          video.load();
          setTimeout(function() { clone.classList.remove('loading'); }, 5000);
        }
      });

      // Enhance cloned cards with overlays
      if (typeof enhanceReelCards === 'function') {
        enhanceReelCards();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cloneVideos);
  } else {
    cloneVideos();
  }
})();
