const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".video-grid");
const year = document.querySelector("#year");
const mediaOpeners = document.querySelectorAll("[data-lightbox-src]");
const imageModal = document.querySelector("#image-modal");
const modalImage = imageModal ? imageModal.querySelector("img") : null;
const modalClose = imageModal ? imageModal.querySelector(".modal-close") : null;

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
      container.innerHTML += `
        <article class="reel-card">
          <video
            controls
            preload="metadata"
            playsinline
            controlsList="nodownload"
            disablePictureInPicture
          >
            <source src="${link}" type="video/mp4">
          </video>
        </article>
      `;
    });

  } catch (error) {
    console.error(error);
  }
}



document.querySelectorAll("video").forEach(video => {
  video.setAttribute("controlsList", "nodownload");
  video.disablePictureInPicture = true;
});