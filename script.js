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

async function loadVideos(txtFile, containerId) {
  try {
    const response = await fetch(txtFile);
    const text = await response.text();

    const links = text
      .split("\n")
      .map(link => link.trim())
      .filter(link => link);

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    links.forEach((link) => {
      const card = document.createElement("article");
      card.className = "reel-card loading";
      
      card.innerHTML = `
        <video
          controls
          preload="metadata"
          playsinline
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
        >
          <source src="${link}" type="video/mp4">
        </video>
      `;
      
      container.appendChild(card);

      const video = card.querySelector("video");

      // Add loading state
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

      // Fallback: remove loading state after 5s in case events don't fire (iOS)
      setTimeout(() => card.classList.remove("loading"), 5000);
    });

  } catch (error) {
    console.error(error);
  }
}



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
  const highlightTabs = document.querySelectorAll('.highlight-tab');
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

  // Stagger category tabs
  highlightTabs.forEach((tab, index) => {
    tab.classList.add('reveal-fade');
    tab.classList.add(`reveal-delay-${index + 1}`);
    revealObserver.observe(tab);
  });

  // Stagger reel cards with reveal-scale
  reelCards.forEach((card, index) => {
    card.classList.add('reveal-scale');
    // Add staggered delay based on index
    const delay = Math.min(Math.floor(index / 3) + 1, 5);
    card.classList.add(`reveal-delay-${delay}`);
    revealObserver.observe(card);
  });

  // Add reveal to profile elements
  const avatar = document.querySelector('.avatar');
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
});

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
