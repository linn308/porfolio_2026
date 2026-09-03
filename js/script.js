/* ==========================================================================
   script.js — JavaScript thuần (Vanilla JS), dùng chung cho cả các trang.
   Mỗi module tự kiểm tra phần tử DOM có tồn tại hay không (if (!el) return;)
   nên file này an toàn khi nhúng vào index.html, 2d.html, 3d.html hay trang
   chi tiết dự án, dù mỗi trang không có đủ tất cả các phần tử.
   ========================================================================== */

/* Dữ liệu dự án giờ được TÁCH thành 2 file riêng: data-2d.js (PROJECTS_2D)
   và data-3d.js (PROJECTS_3D) — mỗi file phụ trách đúng 1 mảng, dễ quản lý
   khi số dự án tăng lên. Dòng dưới đây gộp cả 2 lại thành 1 object PROJECTS
   duy nhất, để phần còn lại của script.js (và toàn bộ logic bên dưới) vẫn
   dùng PROJECTS[id] như cũ, không cần quan tâm dữ liệu đến từ mấy file.
   Nếu 1 trang nào đó không nhúng data-2d.js/data-3d.js (ví dụ index.html),
   PROJECTS đơn giản là {} — không lỗi gì cả. */
const PROJECTS = Object.assign(
  {},
  typeof PROJECTS_2D !== 'undefined' ? PROJECTS_2D : {},
  typeof PROJECTS_3D !== 'undefined' ? PROJECTS_3D : {}
);

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initHeaderScroll();
  initMobileNav();
  initPageTransitions();
  initHeroSound();
  initGalleryFilter();
  initGalleryBadges();
  initLightbox();
  initProjectDetail();
  initBackButton();
  setFooterYear();
});

/* --------------------------------------------------------------------------
   1. HEADER: đổi nền khi cuộn trang
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const SCROLL_THRESHOLD = 40;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   2. MENU MOBILE
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('no-scroll', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
}

/* --------------------------------------------------------------------------
   2b. ÂM THANH CHO VIDEO HERO (index.html)
   Trình duyệt luôn chặn autoplay có tiếng, nên video showreel bắt buộc phải
   autoplay ở trạng thái muted trước. Nút này để người xem tự bật tiếng lên
   — đúng chuẩn UX cho video nền toàn màn hình.
   -------------------------------------------------------------------------- */
function initHeroSound() {
  const video = document.getElementById('heroVideo');
  const toggle = document.getElementById('heroSoundToggle');
  if (!video || !toggle) return;

  const icon = toggle.querySelector('.hero__sound-icon');
  const label = toggle.querySelector('[data-vi][data-en]');

  const setLabel = (isMuted) => {
    if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
    if (label) {
      label.dataset.vi = isMuted ? 'Bật âm thanh' : 'Tắt âm thanh';
      label.dataset.en = isMuted ? 'Unmute' : 'Mute';
      label.textContent = document.documentElement.lang === 'en'
        ? label.dataset.en
        : label.dataset.vi;
    }
    toggle.setAttribute('aria-pressed', String(!isMuted));
  };

  toggle.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted) video.play().catch(() => {}); // 1 số trình duyệt cần gọi lại play() sau khi unmute
    setLabel(video.muted);
  });
}

/* --------------------------------------------------------------------------
   3. BỘ CHUYỂN NGÔN NGỮ (VI / EN)
   Cơ chế: mọi phần tử mang cả 2 thuộc tính data-vi + data-en sẽ được JS
   đổi textContent theo ngôn ngữ đang chọn. Với phần tử cần chèn markup
   (ví dụ chữ "3D" tô màu riêng trong tiêu đề Hero), dùng data-vi-html /
   data-en-html để JS đổi innerHTML thay vì textContent.
   Lựa chọn ngôn ngữ được lưu vào localStorage nên giữ nguyên khi chuyển
   qua lại giữa các trang (index/2d/3d/project).
   -------------------------------------------------------------------------- */
const LANG_STORAGE_KEY = 'linh-portfolio-lang';

function getStoredLang() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) || 'vi';
  } catch (error) {
    return 'vi'; // localStorage có thể bị chặn (chế độ ẩn danh...) — mặc định tiếng Việt
  }
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-vi][data-en]').forEach((el) => {
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.vi;
  });

  document.querySelectorAll('[data-vi-html][data-en-html]').forEach((el) => {
    el.innerHTML = lang === 'en' ? el.dataset.enHtml : el.dataset.viHtml;
  });

  document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.langBtn === lang);
  });

  // Trang project.html render nội dung dự án bằng JS (từ data.js) nên
  // không nằm trong 2 vòng querySelectorAll ở trên — nếu đang ở trang đó,
  // gọi lại hàm cập nhật riêng của nó (được initProjectDetail() gán vào).
  if (typeof window.__refreshProjectDetail === 'function') {
    window.__refreshProjectDetail(lang);
  }

  // Tương tự, nếu modal xem nhanh (lightbox) đang mở, render lại mô tả
  // song ngữ ngay lập tức (được initLightbox() gán vào).
  if (typeof window.__refreshLightbox === 'function') {
    window.__refreshLightbox();
  }

  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (error) {
    /* bỏ qua nếu trình duyệt chặn localStorage */
  }
}

function initLanguage() {
  applyLanguage(getStoredLang());

  document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.langBtn));
  });
}

/* --------------------------------------------------------------------------
   Tiện ích dùng chung: điều hướng sang trang khác kèm hiệu ứng mờ dần
   (dùng cả cho link tĩnh trong initPageTransitions lẫn link tạo động
   trong modal, ví dụ nút "Xem đầy đủ dự án")
   -------------------------------------------------------------------------- */
function navigateWithFade(href) {
  document.body.classList.add('page-fade-out');
  window.setTimeout(() => {
    window.location.href = href;
  }, 280); // khớp với thời gian transition của .page-fade-out trong CSS
}

/* --------------------------------------------------------------------------
   4. CHUYỂN TRANG MƯỢT (page-fade transition)
   Vì mỗi trang (index/2d/3d) là 1 file .html riêng, trình duyệt vốn dĩ sẽ
   "nhảy" thẳng khi đổi trang, không mượt như cuộn trong cùng 1 trang.
   Khối này bắt sự kiện click trên các link nội bộ (không phải "#anchor",
   không phải link ngoài/mailto/tel, không mở tab mới), thêm class mờ dần
   rồi mới điều hướng — tạo cảm giác chuyển tiếp mượt xuyên suốt cả site,
   nhất quán với hiệu ứng "trôi mượt" của scroll-behavior: smooth.
   -------------------------------------------------------------------------- */
function initPageTransitions() {
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const isInternalPage =
      href &&
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:') &&
      !href.startsWith('javascript:') &&
      link.target !== '_blank';

    if (!isInternalPage) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigateWithFade(href);
    });
  });
}

/* --------------------------------------------------------------------------
   5. BỘ LỌC GALLERY (dùng ở 2d.html và 3d.html)
   Cơ chế: nút [.filter-btn] mang data-filter, card [.card] mang data-category.
   Khi lọc, card bị loại thêm class .is-filtering-out để chạy hiệu ứng
   fade + scale trong CSS trước khi thật sự display:none — nhờ vậy việc
   chuyển bộ lọc trông mượt mà thay vì "giật" mất ngay lập tức.
   Sau khi lọc xong, tự cuộn mượt tới đầu khu vực gallery — đúng yêu cầu
   "khi select đầu mục thì scroll mượt như từ hero xuống".
   -------------------------------------------------------------------------- */
function initGalleryFilter() {
  const filterBar = document.getElementById('filterBar');
  const cards = document.querySelectorAll('.card');
  const emptyState = document.getElementById('galleryEmpty');
  const gallerySection = document.getElementById('gallery');
  if (!filterBar || !cards.length) return;

  const TRANSITION_MS = 260; // khớp với --transition-base trong CSS

  filterBar.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    const selected = btn.dataset.filter;

    filterBar.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.toggle('is-active', b === btn);
    });

    // Bước 1: những card sẽ bị ẩn thì fade-out trước
    let visibleCount = 0;
    cards.forEach((card) => {
      const match = selected === 'all' || card.dataset.category === selected;
      if (match) {
        visibleCount += 1;
        card.classList.remove('is-filtering-out');
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-filtering-out');
      }
    });

    // Bước 2: sau khi hiệu ứng fade chạy xong mới thật sự display:none
    window.setTimeout(() => {
      cards.forEach((card) => {
        if (card.classList.contains('is-filtering-out')) {
          card.classList.add('is-hidden');
        }
      });
    }, TRANSITION_MS);

    if (emptyState) emptyState.hidden = visibleCount !== 0;

    // Cuộn mượt tới đầu gallery, giống hiệu ứng cuộn từ hero xuống
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* --------------------------------------------------------------------------
   6. BADGE SỐ LƯỢNG ẢNH TRÊN CARD (2d.html, 3d.html)
   Với card nào có data-id trùng khớp 1 project trong data.js (đọc từ
   data.js) và project đó có nhiều hơn 1 slide, tự thêm 1 badge nhỏ báo
   "còn nhiều ảnh hơn" để người xem biết có thể bấm vào xem đầy đủ.
   -------------------------------------------------------------------------- */
function initGalleryBadges() {
  if (!Object.keys(PROJECTS).length) return; // trang không nhúng data-2d.js/data-3d.js thì bỏ qua

  document.querySelectorAll('.card__media[data-id]').forEach((trigger) => {
    const project = PROJECTS[trigger.dataset.id];
    if (!project || !project.slides || project.slides.length <= 1) return;

    const badge = document.createElement('span');
    badge.className = 'card__count-badge';
    badge.textContent = `🖼 ${project.slides.length}`;
    trigger.appendChild(badge);
  });
}

/* --------------------------------------------------------------------------
   7. LIGHTBOX (modal xem chi tiết + điều hướng Prev / Next)
   Dùng event delegation trên document để bắt click mọi .card__media,
   kể cả những card được thêm sau này. Danh sách "ảnh kế tiếp/trước đó"
   được tính lại mỗi lần mở modal, chỉ trong phạm vi các card đang HIỂN THỊ
   (đã qua bộ lọc) — điều hướng luôn khớp với những gì người dùng đang xem.

   LƯU Ý về nút Đóng và Prev/Next: 2 nhóm nút này được xử lý tách biệt
   trong CSS (Đóng cố định góc trên-phải, Prev/Next canh giữa 2 cạnh)
   để tránh tình trạng bấm nhầm — xem thêm phần "Nút điều hướng Prev / Next"
   trong style.css.
   -------------------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const modalImg = document.getElementById('modalImg');
  const modalModel = document.getElementById('modalModel');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTools = document.getElementById('modalTools');
  const modalCounter = document.getElementById('modalCounter');
  const modalFullLink = document.getElementById('modalFullLink');
  const closeBtn = document.getElementById('modalClose');

  let currentTriggers = []; // danh sách .card__media đang hiển thị, theo thứ tự DOM
  let currentIndex = -1;

  const getVisibleTriggers = () =>
    Array.from(document.querySelectorAll('.card:not(.is-hidden) .card__media'));

  const renderTrigger = (trigger) => {
    const { title, subtitle, descVi, descEn, desc, img, model, tools } = trigger.dataset;

    // Dự án 3D có sẵn file .glb (data-model) thì hiển thị model-viewer
    // ngay trong modal để xem 360°; còn lại hiển thị ảnh tĩnh.
    const hasModel = Boolean(model);
    modalModel.hidden = !hasModel;
    modalImg.hidden = hasModel;

    if (hasModel) {
      modalModel.setAttribute('src', model);
      modalModel.setAttribute('alt', title || '');
    } else {
      modalImg.src = img || '';
      modalImg.alt = title || '';
    }

    modalSubtitle.textContent = subtitle || '';
    modalTitle.textContent = title || '';

    // data-desc-vi / data-desc-en là cặp song ngữ mới cho phần mô tả dài.
    // Card nào chưa kịp cập nhật (chỉ còn data-desc cũ, 1 ngôn ngữ) vẫn
    // chạy được bình thường nhờ fallback này.
    const lang = document.documentElement.lang === 'en' ? 'en' : 'vi';
    const bilingualDesc = lang === 'en' ? descEn : descVi;
    modalDesc.textContent = bilingualDesc || desc || '';

    modalTools.innerHTML = '';
    (tools || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((toolName) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = toolName;
        modalTools.appendChild(span);
      });

    if (modalCounter) {
      modalCounter.textContent = `${currentIndex + 1} / ${currentTriggers.length}`;
    }

    // Nút "Xem đầy đủ dự án" chỉ hiện khi card có data-detail — đường dẫn
    // tới trang chi tiết RIÊNG của dự án đó (project/<slug>/index.html).
    // Không phải project nào cũng có trang riêng ngay; card nào chưa có
    // data-detail thì modal chỉ dừng ở bản xem nhanh này, không có nút này.
    if (modalFullLink) {
      const detailHref = trigger.dataset.detail;
      if (detailHref) {
        modalFullLink.href = detailHref;
        modalFullLink.hidden = false;
      } else {
        modalFullLink.hidden = true;
      }
    }
  };

  // Nếu người dùng đổi ngôn ngữ trong lúc modal đang mở, render lại mô tả
  // ngay lập tức thay vì phải đóng/mở lại mới thấy ngôn ngữ mới.
  window.__refreshLightbox = () => {
    if (modal.classList.contains('is-open') && currentTriggers[currentIndex]) {
      renderTrigger(currentTriggers[currentIndex]);
    }
  };

  const openModal = (trigger) => {
    currentTriggers = getVisibleTriggers();
    currentIndex = currentTriggers.indexOf(trigger);
    renderTrigger(trigger);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  const goTo = (offset) => {
    if (!currentTriggers.length) return;
    currentIndex = (currentIndex + offset + currentTriggers.length) % currentTriggers.length;
    renderTrigger(currentTriggers[currentIndex]);
  };

  document.addEventListener('click', (event) => {
    // "Xem đầy đủ dự án" đi sang project.html — chặn lại để chạy hiệu ứng
    // mờ dần đồng bộ với initPageTransitions() (link này được tạo/gán href
    // động nên không nằm trong danh sách link tĩnh mà initPageTransitions
    // quét lúc trang vừa load).
    if (event.target.closest('#modalFullLink')) {
      event.preventDefault();
      navigateWithFade(modalFullLink.href);
      return;
    }
    const trigger = event.target.closest('.card__media');
    if (trigger) {
      // Card nào ĐÃ CÓ trang chi tiết riêng (data-detail) thì đi thẳng tới
      // đó luôn — không cần qua modal xem nhanh nữa. Đây chính là cách để
      // "nâng cấp" 1 card từ chế độ xem nhanh lên trang riêng: chỉ cần
      // thêm data-detail="đường-dẫn/tới/trang.html" vào card, không cần
      // sửa gì trong file JS này. Card nào CHƯA có data-detail vẫn mở
      // modal xem nhanh như bình thường.
      if (trigger.dataset.detail) {
        navigateWithFade(trigger.dataset.detail);
      } else {
        openModal(trigger);
      }
      return;
    }
    if (event.target.closest('[data-close-modal]') || event.target === closeBtn) {
      closeModal();
      return;
    }
    if (event.target.closest('#modalPrev')) {
      goTo(-1);
      return;
    }
    if (event.target.closest('#modalNext')) {
      goTo(1);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') goTo(-1);
    if (event.key === 'ArrowRight') goTo(1);
  });
}

/* --------------------------------------------------------------------------
   8. TRANG CHI TIẾT DỰ ÁN (project/<slug>/index.html)
   Mỗi dự án giờ có 1 trang RIÊNG (thư mục project/<slug>/), không dùng
   chung 1 project.html?id=... nữa. Mỗi trang chỉ cần khai báo:
     <script>window.PROJECT_ID = 'crusader';</script>
   ngay TRƯỚC khi nhúng js/data.js và js/script.js. Script vẫn đọc thêm
   ?id=... trên URL làm phương án dự phòng (ví dụ khi mở project-template
   trực tiếp mà chưa set PROJECT_ID).
   -------------------------------------------------------------------------- */
function initProjectDetail() {
  const root = document.getElementById('projectDetail');
  if (!root || !Object.keys(PROJECTS).length) return;

  const params = new URLSearchParams(window.location.search);
  const projectId = (typeof window.PROJECT_ID === 'string' && window.PROJECT_ID) || params.get('id');
  const project = PROJECTS[projectId];

  const notFoundEl = document.getElementById('projectNotFound');

  if (!project) {
    if (notFoundEl) notFoundEl.hidden = false;
    root.hidden = true;
    return;
  }

  document.title = `${project.title} — linn.`;

  const titleEl = document.getElementById('projectTitle');
  const categoryEl = document.getElementById('projectCategory');
  const subtitleEl = document.getElementById('projectSubtitle');
  const descEl = document.getElementById('projectDesc');
  const toolsEl = document.getElementById('projectTools');
  const mainEl = document.getElementById('projectMain');
  const thumbsEl = document.getElementById('projectThumbs');

  if (titleEl) titleEl.textContent = project.title;

  // Các trường có bản dịch (category/subtitle/desc) được cập nhật qua
  // hàm riêng, và hàm này cũng được gán vào window.__refreshProjectDetail
  // để applyLanguage() gọi lại mỗi khi người dùng đổi ngôn ngữ.
  const updateTranslatedText = (lang) => {
    if (categoryEl) categoryEl.textContent = project.category[lang];
    if (subtitleEl) subtitleEl.textContent = project.subtitle[lang];
    if (descEl) descEl.textContent = project.desc[lang];
  };
  window.__refreshProjectDetail = updateTranslatedText;
  updateTranslatedText(getStoredLang());

  if (toolsEl) {
    toolsEl.innerHTML = '';
    project.tools.forEach((toolName) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = toolName;
      toolsEl.appendChild(span);
    });
  }

  // --- Gallery: 1 khung lớn + dải thumbnail bên dưới để chọn nhanh ---
  let currentSlide = 0;

  const renderSlide = (index) => {
    if (!mainEl || !project.slides.length) return;
    currentSlide = (index + project.slides.length) % project.slides.length;
    const slide = project.slides[currentSlide];

    mainEl.innerHTML = '';
    if (slide.type === 'model') {
      const mv = document.createElement('model-viewer');
      mv.className = 'project-gallery__media';
      mv.setAttribute('src', slide.src);
      if (slide.poster) mv.setAttribute('poster', slide.poster);
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('shadow-intensity', '1');
      mv.setAttribute('alt', project.title);
      mainEl.appendChild(mv);
    } else if (slide.type === 'video') {
      const video = document.createElement('video');
      video.className = 'project-gallery__media';
      video.src = slide.src;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      if (slide.poster) video.poster = slide.poster;
      mainEl.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.className = 'project-gallery__media';
      img.src = slide.src;
      img.alt = project.title;
      mainEl.appendChild(img);
    }

    if (thumbsEl) {
      thumbsEl.querySelectorAll('.project-gallery__thumb').forEach((thumb, i) => {
        thumb.classList.toggle('is-active', i === currentSlide);
      });
    }
  };

  if (thumbsEl) {
    thumbsEl.innerHTML = '';
    project.slides.forEach((slide, index) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'project-gallery__thumb';
      thumb.setAttribute('aria-label', `${project.title} — ${index + 1}`);

      const thumbImg = document.createElement('img');
      thumbImg.src = slide.poster || slide.src;
      thumbImg.alt = '';
      thumb.appendChild(thumbImg);

      if (slide.type === 'video') {
        const playIcon = document.createElement('span');
        playIcon.className = 'project-gallery__thumb-play';
        playIcon.textContent = '▶';
        thumb.appendChild(playIcon);
      }

      thumb.addEventListener('click', () => renderSlide(index));
      thumbsEl.appendChild(thumb);
    });
  }

  const prevBtn = document.getElementById('projectPrev');
  const nextBtn = document.getElementById('projectNext');
  if (prevBtn) prevBtn.addEventListener('click', () => renderSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => renderSlide(currentSlide + 1));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') renderSlide(currentSlide - 1);
    if (event.key === 'ArrowRight') renderSlide(currentSlide + 1);
  });

  renderSlide(0);
}

/* --------------------------------------------------------------------------
   9. NÚT "QUAY LẠI" (project.html)
   Dùng history.back() thật của trình duyệt thay vì href="javascript:..."
   (tránh xung đột với initPageTransitions() và là cách làm sạch hơn).
   Nếu không có lịch sử để quay lại (ví dụ người dùng mở thẳng link này),
   dự phòng bằng cách điều hướng về trang chủ.
   -------------------------------------------------------------------------- */
function initBackButton() {
  const backBtn = document.getElementById('projectBackBtn');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateWithFade('index.html');
    }
  });
}

/* --------------------------------------------------------------------------
   10. TIỆN ÍCH NHỎ: tự động in năm hiện tại ở footer
   -------------------------------------------------------------------------- */
function setFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}