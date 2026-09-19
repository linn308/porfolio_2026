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

/* --------------------------------------------------------------------------
   0b. TÍN HIỆU "LOADER ĐÃ ẨN" — dùng chung cho các hiệu ứng xuất hiện lần
   đầu (hero__decor/hero__portfolio-letter/hero__welcome-text qua CSS, và card/
   .reveal qua initScrollReveal()/initSectionReveal() bên dưới). Nơi nào
   cần chạy animate "chỉ khi người dùng đã thấy được trang" (không bị
   loading screen che) thì gọi onContentRevealed(fn) thay vì chạy thẳng —
   nếu loader đã ẩn từ trước thì fn() chạy ngay, chưa thì tự đợi tới lúc
   hideLoader() gọi markContentRevealed(). An toàn dù gọi onContentRevealed
   nhiều lần/nhiều nơi (initScrollReveal() ví dụ được gọi lại mỗi khi có
   card mới dựng bằng JS, ở cả lúc trang vừa load lẫn rất lâu sau đó). */
let isContentRevealed = false;
const contentRevealedCallbacks = [];

function markContentRevealed() {
  if (isContentRevealed) return;
  isContentRevealed = true;
  const callbacks = contentRevealedCallbacks.splice(0, contentRevealedCallbacks.length);
  callbacks.forEach((cb) => cb());
}

function onContentRevealed(callback) {
  if (isContentRevealed) {
    callback();
  } else {
    contentRevealedCallbacks.push(callback);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLanguage();
  initHeaderScroll();
  initMobileNav();
  initPageTransitions();
  initHeroSound();
  initHeroTypewriter();
  initHeroPortfolioText();
  initHeroPipParallax();
  initGalleryFilter();
  initGalleryBadges();
  initLightbox();
  initMediaLightbox();
  initShowcaseCards();
  initProjectDetail();
  initScrollReveal();
  initSectionReveal();
  initBackButton();
  setFooterYear();
  initCustomCursor();
  // ĐẶT CUỐI CÙNG: chạy sau initProjectDetail() để lúc quét <img>/<video>
  // trong trang, gallery/cover/related do JS đổ vào đã có sẵn trong DOM.
  initLoadingScreen();
});

/* --------------------------------------------------------------------------
   0. LOADING SCREEN (PRELOADER) — chạy trước mọi trang.
   HTML #pageLoader đã tự hiện full-screen ngay bằng CSS thuần (xem
   style.css) ngay khi trình duyệt parse xong đầu <body>, không cần chờ
   hàm này. Hàm này lo 2 việc:
   1. Ép tải trước mọi <img>/<video>/model-viewer[poster] đang có trong
      trang (kể cả ảnh loading="lazy" chưa tới lượt tải) bằng new Image()/
      fetch(), để khi người dùng cuộn tới, ảnh đã nằm sẵn trong cache —
      không còn tình trạng cuộn tới nhưng ảnh chưa kịp hiện.
   2. Animate vòng xoắn #pageLoaderSpiralPath "chạy" liên tục từ tâm ra
      ngoài bằng requestAnimationFrame (không dùng CSS transition) — mỗi
      frame nhích dần % hiển thị tới sát % tải thật (kiểu lerp/easing), nên
      LUÔN thấy rõ đường xoắn đang chuyển động mượt, dù ảnh tải nhanh hay
      chậm, không bị nhảy khựng 1 bước như khi cache đã có sẵn tất cả. Ẩn
      #pageLoader khi vòng xoắn đã "chạy" hết TOÀN BỘ ra tới mép ngoài
      (hiển thị = 1) và tải xong (hoặc quá MAX_WAIT_MS, phòng ảnh lỗi/mạng
      chậm giữ màn hình loading vô thời hạn) — luôn hiện tối thiểu
      MIN_VISIBLE_MS để có đủ thời gian nhìn thấy nó chạy.
   -------------------------------------------------------------------------- */
function initLoadingScreen() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;

  const spiralPath = document.getElementById('pageLoaderSpiralPath');
  // Chiều dài thật của đường xoắn (SVG có sẵn trong HTML, không cần vẽ bằng
  // JS) — dùng để tính % lộ ra qua stroke-dashoffset. CSS đã đặt sẵn 1 số
  // rất lớn (6000) làm mặc định để ẩn hẳn đường xoắn trước khi dòng này
  // chạy, tránh chớp hiện nguyên vòng xoắn 1 nhịp.
  const spiralLength = spiralPath ? spiralPath.getTotalLength() : 0;
  if (spiralPath) {
    spiralPath.style.strokeDasharray = String(spiralLength);
    spiralPath.style.strokeDashoffset = String(spiralLength);
  }

  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('no-scroll');

  const hideLoader = () => {
    loader.classList.add('is-hidden');
    document.body.classList.remove('no-scroll');

    // Mốc "0 giây" thật của mọi animate xuất hiện lần đầu (hero__decor,
    // hero__welcome-text, chữ rơi hero__portfolio-letter — xem body.content-revealed
    // trong style.css, và markContentRevealed() ở mục "0b" ngay dưới đây
    // cho phần card/.reveal). Add class NGAY lúc này để các animation CSS
    // (đang bị animation-play-state: paused từ đầu) mới thật sự bắt đầu
    // tính giờ delay/chạy đúng lúc loader biến mất, thay vì tính từ lúc
    // DOMContentLoaded (còn nằm dưới màn hình loading, chạy xong lúc nào
    // không ai biết).
    document.body.classList.add('content-revealed');
    markContentRevealed();

    window.setTimeout(() => {
      loader.setAttribute('hidden', '');
    }, reduceMotion ? 0 : 450); // khớp thời gian transition opacity trong style.css
  };

  // Helper: tải trước 1 URL ảnh bằng Image "ma" (không gắn vào DOM) — lỗi
  // (404, ảnh hỏng) cũng resolve() bình thường, không chặn cả trang chờ vì
  // đúng 1 ảnh hỏng link.
  const preloadImageUrl = (url) => new Promise((resolve) => {
    if (!url) { resolve(); return; }
    const probe = new Image();
    probe.onload = resolve;
    probe.onerror = resolve;
    probe.src = url;
  });

  const tasks = [];

  // Toàn bộ <img> đang có trong DOM lúc này — kể cả loading="lazy" chưa
  // tới lượt tải. Ảnh nào trình duyệt đã tải xong rồi (complete +
  // naturalWidth > 0) thì bỏ qua, không tải lại tốn băng thông.
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) return;
    tasks.push(preloadImageUrl(img.src));
  });

  // <video>: tải trước poster (ảnh đại diện) bằng Image, và "làm nóng"
  // cache cho chính file video bằng fetch() nhẹ (không cần decode/phát).
  document.querySelectorAll('video').forEach((video) => {
    const poster = video.getAttribute('poster');
    if (poster) tasks.push(preloadImageUrl(poster));

    const sourceEl = video.querySelector('source');
    const videoSrc = video.currentSrc || video.getAttribute('src')
      || (sourceEl && sourceEl.getAttribute('src'));
    if (videoSrc) {
      tasks.push(fetch(videoSrc).then(() => {}).catch(() => {}));
    }
  });

  // model-viewer (khung 3D preview): tải trước ảnh poster của nó, tương tự
  // ảnh/video thường — không tải trước file .glb vì khá nặng, để trình
  // duyệt tự tải khi người dùng thực sự tương tác với khung 3D.
  document.querySelectorAll('model-viewer[poster]').forEach((mv) => {
    tasks.push(preloadImageUrl(mv.getAttribute('poster')));
  });

  const total = tasks.length;
  let loaded = 0;
  tasks.forEach((task) => task.then(() => { loaded += 1; }));

  // Bỏ qua toàn bộ animate cho người dùng bật "giảm hiệu ứng chuyển động":
  // lộ thẳng vòng xoắn, chỉ chờ tải xong (hoặc quá MAX_WAIT_MS) rồi ẩn luôn.
  if (reduceMotion) {
    if (spiralPath) spiralPath.style.strokeDashoffset = '0';
    Promise.race([
      Promise.all(tasks),
      new Promise((resolve) => window.setTimeout(resolve, 6000)),
    ]).then(hideLoader);
    return;
  }

  const MIN_VISIBLE_MS = 1500; // hiện tối thiểu ngần này để vòng xoắn có đủ thời gian "chạy" rõ ràng, không bị chớp nhoáng
  const MAX_WAIT_MS = 6000; // chặn trên — mạng chậm/ảnh lỗi cũng không giữ màn hình loading vô hạn
  const EASE = 0.07; // hệ số nhích mỗi frame tới % tải thật — số nhỏ hơn = chạy "từ từ" hơn

  const startTime = performance.now
    ? performance.now()
    : Date.now();
  let displayed = 0; // % đã VẼ RA trên vòng xoắn (luôn <= % tải thật, tự nhích dần mỗi frame)

  const tick = (now) => {
    const elapsed = now - startTime;
    const realProgress = total === 0 ? 1 : Math.min(loaded / total, 1);
    const overtime = elapsed >= MAX_WAIT_MS;
    const target = overtime ? 1 : realProgress; // quá giờ chờ tối đa thì ép lộ hết, không kẹt lại

    displayed += (target - displayed) * EASE;
    if (target - displayed < 0.0015) displayed = target;

    if (spiralPath && spiralLength > 0) {
      spiralPath.style.strokeDashoffset = String(spiralLength * (1 - displayed));
    }

    const readyToFinish = (realProgress >= 1 || overtime)
      && elapsed >= MIN_VISIBLE_MS
      && displayed >= 0.999;

    if (readyToFinish) {
      if (spiralPath) spiralPath.style.strokeDashoffset = '0';
      hideLoader();
      return;
    }

    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}

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
   2b. CHỮ "PORTFOLIO" 2 DÒNG "Port" / "folio" + PHÓNG TO TỪNG CHỮ (.hero__portfolio-text)
   Trước đây đoạn này đọc 1 path ẩn (#heroPortfolioArcPath) rồi dùng
   getPointAtLength() để rải từng ký tự theo 1 đường cong, sau đó cho chữ
   "rơi" từ trên xuống đúng vị trí cong đó.
   Giờ đổi bố cục: 2 dòng tĩnh "Port" / "folio" (chồng nhẹ lên nhau, xem
   style.css .hero__portfolio-line) — không cần path/toạ độ nữa. Hàm này
   chỉ còn nhiệm vụ tách text trong data-word của mỗi dòng thành từng ký
   tự <span class="hero__portfolio-letter">, gán biến --i (đếm nối tiếp
   qua cả 2 dòng) để so le animation-delay, và 1 chút xoay nghiêng ngẫu
   nhiên nhẹ (--r) cho giống nét chữ viết tay không đều trong ảnh mẫu.
   Hiệu ứng "rơi" cũ đổi thành "phóng to dần" (scale 0 → 1, có nảy nhẹ) —
   xem keyframes hero-portfolio-letter-grow trong style.css.
   -------------------------------------------------------------------------- */
function initHeroPortfolioText() {
  const lines = document.querySelectorAll('.hero__portfolio-line');
  if (!lines.length) return;

  // Độ nghiêng dao động nhẹ theo từng chữ — lặp lại nếu chữ dài hơn mảng.
  const tiltWave = [-4, 3, -3, 5, -5, 4, -2, 3, -4];
  let letterIndex = 0;

  lines.forEach((line) => {
    const word = line.dataset.word || '';
    line.textContent = ''; // xoá nội dung placeholder (nếu có) trước khi build lại

    word.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'hero__portfolio-letter';
      span.textContent = char;
      // Biến CSS --i (so le thời gian) và --r (góc nghiêng) do JS set.
      span.style.setProperty('--i', letterIndex);
      span.style.setProperty('--r', `${tiltWave[letterIndex % tiltWave.length]}deg`);
      line.appendChild(span);
      letterIndex += 1;
    });
  });
}

/* --------------------------------------------------------------------------
   2b. DÒNG CHỮ "GÕ MÁY" Ở HERO (.hero__typewriter)
   Gõ từng chữ 1 của câu A, giữ 1 chút, xoá dần, rồi gõ tiếp câu B, C...
   lặp vô hạn. Danh sách câu lấy từ data-vi-phrases/data-en-phrases (JSON
   string) ngay trên chính #heroTypewriter — muốn đổi nội dung, chỉ cần
   sửa 2 attribute đó trong index.html, không cần sửa file này.
   Chỉ BẮT ĐẦU gõ khi phần tử cuộn vào khung nhìn (đúng ý "lúc scroll
   tới"); đổi ngôn ngữ giữa lúc đang gõ sẽ dừng hẳn và gõ lại từ đầu theo
   đúng bộ câu của ngôn ngữ mới, tránh lẫn 2 ngôn ngữ trong 1 câu.
   -------------------------------------------------------------------------- */
function initHeroTypewriter() {
  const el = document.getElementById('heroTypewriter');
  if (!el) return;

  const TYPE_SPEED = 55; // ms mỗi ký tự lúc gõ
  const DELETE_SPEED = 28; // ms mỗi ký tự lúc xoá
  const HOLD_TIME = 1800; // ms giữ nguyên câu đã gõ xong trước khi xoá
  const NEXT_DELAY = 350; // ms nghỉ trước khi gõ câu tiếp theo

  let phrases = [];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId = null;
  let started = false;

  const readPhrases = () => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'vi';
    const raw = lang === 'en' ? el.dataset.enPhrases : el.dataset.viPhrases;
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) && parsed.length ? parsed : [el.textContent];
    } catch (error) {
      return [el.textContent];
    }
  };

  const tick = () => {
    const current = phrases[phraseIndex];
    if (!isDeleting) {
      charIndex += 1;
      el.textContent = current.slice(0, charIndex);
      if (charIndex >= current.length) {
        isDeleting = true;
        timeoutId = setTimeout(tick, HOLD_TIME);
        return;
      }
      timeoutId = setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex -= 1;
      el.textContent = current.slice(0, charIndex);
      if (charIndex <= 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeoutId = setTimeout(tick, NEXT_DELAY);
        return;
      }
      timeoutId = setTimeout(tick, DELETE_SPEED);
    }
  };

  const start = () => {
    if (started) return;
    started = true;
    charIndex = 0;
    isDeleting = false;
    tick();
  };

  // Đổi ngôn ngữ: dừng vòng gõ hiện tại, đọc lại đúng bộ câu, gõ lại từ đầu.
  window.__refreshHeroTypewriter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    phrases = readPhrases();
    phraseIndex = 0;
    charIndex = 0;
    isDeleting = false;
    el.textContent = '';
    started = false;
    start();
  };

  phrases = readPhrases();

  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    el.textContent = phrases[0];
    return;
  }

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        start();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(el);
}

/* --------------------------------------------------------------------------
   2c. AVATAR TRƯỢT XUỐNG + LẬT NGANG THEO SCROLL (.hero__pip)
   Lúc mới vào trang (scroll = 0): kéo avatar lên đè lên phía trên khối
   .hero__media (video) — trông như đang "nằm trên" media. Cuộn xuống dần
   thì avatar trượt xuống theo, về ĐÚNG vị trí cố định vốn có của nó trong
   layout (translateY: 0) khi đã cuộn qua hết khối .hero. Cuộn tiếp sau đó
   thì avatar đứng yên (đã "thả" vào vị trí thật, không còn bị kéo nữa).
   ĐỒNG THỜI avatar cũng lật ngang (rotateY) theo cùng progress cuộn —
   0deg lúc scroll = 0, tăng dần tới FLIP_DEG khi đã cuộn hết khối .hero,
   rồi giữ nguyên (đã lật xong, không lật thêm khi cuộn tiếp). Cần
   perspective trên .hero__pip-wrap (xem style.css) để rotateY có chiều
   sâu 3D thật, không bị bóp dẹt phẳng.
   Dùng transform (không phải top/left) + requestAnimationFrame để mượt,
   không dùng CSS transition (xem ghi chú trong style.css .hero__pip).

   SỬA LỖI ĐÈ LÊN NHÓM CHỮ TRÊN MOBILE: công thức cũ luôn kéo avatar lên
   đúng bằng "heroHeight", ngầm giả định vị trí GỐC (chưa transform) của
   avatar nằm sát đỉnh .hero-content — nên kéo lên 1 heroHeight sẽ vừa
   khít đỉnh .hero. Thực tế .hero-content có padding + canh giữa theo
   chiều dọc (align-items: center), nên vị trí gốc của avatar không nằm
   sát đỉnh — kéo lên đúng heroHeight làm nó "rớt" vào khoảng GIỮA .hero,
   đè lên đúng chỗ nhóm chữ .hero__intro (rõ nhất ở mobile, vì .hero__intro
   đã bị thu hẹp về riêng phần trên — xem style.css). Trên mobile, giờ đo
   trực tiếp: (1) vị trí THẬT (getBoundingClientRect, tạm bỏ transform) của
   avatar lúc chưa kéo, (2) mép dưới của .hero__intro — rồi tính đúng
   khoảng cách cần kéo lên để avatar luôn đáp NGAY DƯỚI nhóm chữ, dù
   .hero-content canh giữa dọc thế nào. Desktop giữ nguyên công thức cũ
   (không đổi, vì layout desktop không bị ảnh hưởng bởi lỗi này).
   -------------------------------------------------------------------------- */
function initHeroPipParallax() {
  const pip = document.querySelector('.hero__pip');
  const heroSection = document.querySelector('.hero');
  const heroIntro = document.querySelector('.hero__intro');
  if (!pip || !heroSection) return;

  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // giữ nguyên vị trí cố định, không kéo/trượt gì cả

  // Kéo lên bằng bao nhiêu % chiều cao khối .hero (dùng cho desktop) —
  // chỉnh số này để đè nhiều/ít hơn lên media lúc ban đầu.
  const PULL_RATIO = 1;
  const PULL_RATIO_X_DESKTOP = -6; // Hệ số dịch chuyển ngang trên desktop (tùy chỉnh)
  const FLIP_DEG = 180; // Tổng góc lật ngang (deg) khi progress đi từ 0 -> 1. Đổi số này để lật nhiều/ít hơn.
  const MOBILE_GAP = 28; // Khoảng đệm (px) giữa mép dưới nhóm chữ và avatar trên mobile

  // Trên mobile/tablet hẹp (khớp breakpoint .hero-content__inner gập về 1
  // cột — xem style.css mục 13. MEDIA QUERIES), avatar đã được CSS canh
  // giữa theo chiều ngang (.hero__pip-wrap { justify-content: center }) —
  // nên KHÔNG dịch ngang nữa (PULL_RATIO_X = 0), chỉ còn trượt dọc, để
  // avatar luôn nằm giữa màn hình đúng như trên desktop-content nó cũng
  // canh giữa vậy.
  const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;

  let heroHeight = heroSection.offsetHeight;
  // Khoảng cách (px) cần kéo avatar lên trên mobile lúc progress = 0, đo
  // lại mỗi khi layout đổi (measure() bên dưới) — số âm nghĩa là kéo lên.
  let mobilePullOffset = 0;
  let ticking = false;

  // Đo lại kích thước/khoảng cách thật mỗi khi trang tải xong hoặc resize —
  // KHÔNG đo lúc đang cuộn dở (offsetHeight/getBoundingClientRect ổn định
  // hơn khi progress = 0 hoặc 1, tránh đo nhầm lúc avatar đang bị transform).
  const measure = () => {
    heroHeight = heroSection.offsetHeight;
    if (!heroIntro) return;

    // Tạm bỏ transform hiện tại để đo đúng vị trí GỐC (chưa kéo) của avatar.
    const prevTransform = pip.style.transform;
    pip.style.transform = 'none';
    const pipTop = pip.getBoundingClientRect().top + window.scrollY;
    pip.style.transform = prevTransform;

    const introBottom = heroIntro.getBoundingClientRect().bottom + window.scrollY;
    const targetTop = introBottom + MOBILE_GAP;
    mobilePullOffset = targetTop - pipTop; // thường âm (kéo lên) nếu avatar gốc nằm thấp hơn đích
  };

  const update = () => {
    const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    const mobile = isMobile();
    const pullRatioX = mobile ? 0 : PULL_RATIO_X_DESKTOP;
    const offsetX = -(1 - progress) * 100 * pullRatioX;
    const rotateY = progress * FLIP_DEG; // 0deg lúc đầu -> FLIP_DEG lúc trượt xong

    // Mobile: kéo lên đúng khoảng đã đo (để đáp ngay dưới .hero__intro).
    // Desktop: giữ nguyên công thức cũ (kéo lên đúng 1 heroHeight).
    const offsetY = mobile
      ? (1 - progress) * mobilePullOffset
      : -(1 - progress) * heroHeight * PULL_RATIO;

    pip.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotateY(${rotateY}deg)`;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    update();
  });
  // Ảnh avatar có thể đổi kích thước khối sau khi tải xong, đo lại cho chắc.
  window.addEventListener('load', () => {
    measure();
    update();
  });

  measure();
  update();
}

/* --------------------------------------------------------------------------
   2b. BỘ CHUYỂN CHẾ ĐỘ SÁNG / TỐI (LIGHT / DARK)
   Cơ chế: gán data-theme="light" hoặc data-theme="dark" lên thẻ <html> —
   toàn bộ màu sắc trong style.css tham chiếu qua CSS variables nên tự đổi
   theo (xem mục "1b. CHẾ ĐỘ SÁNG" trong style.css), không cần style() tay
   ở đây. Nếu người dùng CHƯA từng tự bấm nút sáng/tối (chưa lưu gì ở
   localStorage), trang theo THEME CỦA MÁY (OS: sáng -> sáng, tối -> tối,
   không xác định được -> sáng) — xem getOSPreferredTheme() ngay dưới. Một
   khi đã bấm nút 1 lần, lựa chọn thủ công đó luôn được ưu tiên.
 
   Nút bấm KHÔNG được viết sẵn trong HTML của từng trang — hàm này tự tạo
   1 nút <button class="theme-toggle"> và chèn ngay sau MỖI khối
   .lang-switch có trên trang (nằm cạnh nút VI/EN trong nav). Nhờ vậy, mọi
   trang hiện có lẫn trang chi tiết dự án tạo mới sau này đều tự động có
   nút chuyển sáng/tối, miễn có nhúng js/script.js — không cần sửa gì
   trong các file .html.
 
   Lựa chọn được lưu vào localStorage (khoá riêng, khác với ngôn ngữ) nên
   giữ nguyên khi chuyển qua lại giữa các trang.
   -------------------------------------------------------------------------- */
const THEME_STORAGE_KEY = 'linh-portfolio-theme';

/* Theme máy (OS) qua prefers-color-scheme — chỉ dùng khi người dùng CHƯA
   từng tự bấm nút sáng/tối trên site (chưa có gì lưu ở localStorage).
   OS tối -> tối (khớp mặc định gốc), OS sáng hoặc trình duyệt không xác
   định được -> sáng. */
function getOSPreferredTheme() {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (error) {}
  return 'light';
}

function getStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (error) {
    // localStorage có thể bị chặn (chế độ ẩn danh...) — rơi xuống theme máy
  }
  return getOSPreferredTheme();
}

/* Gán data-theme + đổi nhãn nút, KHÔNG lưu vào localStorage — dùng cho lần
   áp theme đầu tiên khi tải trang (theo theme máy), để lần sau nếu người
   dùng đổi theme máy mà vẫn chưa từng bấm nút thủ công, site vẫn tự theo
   kịp OS thay vì bị "khoá cứng" vào giá trị đoán lần đầu. */
function applyThemeVisualOnly(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    const isLight = theme === 'light';
    btn.setAttribute(
      'aria-label',
      isLight ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'
    );
  });
}

/* Gán theme + LƯU vào localStorage — chỉ dùng khi người dùng chủ động bấm
   nút chuyển sáng/tối (lựa chọn thủ công này sẽ ưu tiên hơn theme máy ở
   mọi lần tải trang sau). */
function applyTheme(theme) {
  applyThemeVisualOnly(theme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    /* bỏ qua nếu trình duyệt chặn localStorage */
  }
}
 
function createThemeToggleButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Chuyển chế độ sáng / tối');
  // 2 icon SVG (mặt trời + mặt trăng) cùng nằm trong nút — CSS ẩn/hiện
  // đúng 1 icon tuỳ theme đang chọn (xem .theme-toggle__icon trong
  // style.css), không cần đổi innerHTML mỗi lần bấm.
  btn.innerHTML = `
    <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2"></circle>
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"></path>
    </svg>
    <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.5 14.5a8.5 8.5 0 1 1-9-11 6.7 6.7 0 0 0 9 11z"></path>
    </svg>
  `;
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
  return btn;
}
 
function initThemeToggle() {
  // Chèn nút vào ngay sau mỗi .lang-switch có trên trang (thường chỉ có 1,
  // trong nav) — bỏ qua nếu trang này không có .lang-switch, hoặc nếu vì
  // lý do gì đó đã có sẵn 1 nút theme-toggle rồi (tránh chèn trùng).
  document.querySelectorAll('.lang-switch').forEach((langSwitch) => {
    const next = langSwitch.nextElementSibling;
    if (next && next.classList.contains('theme-toggle')) return;
    langSwitch.insertAdjacentElement('afterend', createThemeToggleButton());
  });
 
  applyThemeVisualOnly(getStoredTheme());
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
    return localStorage.getItem(LANG_STORAGE_KEY) || 'en';
  } catch (error) {
    return 'en'; // localStorage có thể bị chặn (chế độ ẩn danh...) — mặc định tiếng Anh
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

  // Dòng chữ "gõ máy" ở Hero (.hero__typewriter) tự quản lý nội dung của
  // nó, không nằm trong 2 vòng querySelectorAll ở trên — đổi ngôn ngữ thì
  // dừng hẳn, đọc lại đúng bộ câu theo ngôn ngữ mới, gõ lại từ đầu (tránh
  // gõ lẫn nửa câu VI nửa câu EN).
  if (typeof window.__refreshHeroTypewriter === 'function') {
    window.__refreshHeroTypewriter();
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
   4b. CARD ẢNH Ở TRANG CHỦ (.showcase)
   Card trong dải showcase (index.html) giờ dùng cấu trúc tối giản
   article > a.card__media > img > span (giống mẫu Collage Art) — bấm vào
   là điều hướng NGAY qua thẻ <a href> thật, được initPageTransitions() bắt
   lại để chạy hiệu ứng fade. Card nào chưa có trang chi tiết (ví dụ
   FIGHT FOR LIFE) thì <a> không có href, nên không phải link, bấm không
   làm gì — không cần JS riêng để chặn.
   Hàm dưới đây được GIỮ LẠI làm lớp tương thích cho những trang khác (nếu
   còn dùng pattern <button class="card__media" data-detail="...">) — với
   card kiểu <a href> mới thì trigger.dataset.detail sẽ rỗng nên hàm này
   tự động không làm gì thêm, không xung đột.
   -------------------------------------------------------------------------- */
function initShowcaseCards() {
  const showcases = document.querySelectorAll('.showcase');
  if (!showcases.length) return;

  showcases.forEach((showcase) => {
    showcase.addEventListener('click', (event) => {
      const trigger = event.target.closest('.card__media');
      if (!trigger) return;
      const href = trigger.dataset.detail;
      if (href) navigateWithFade(href);
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
   6. BADGE SỐ LƯỢNG FILE TRÊN CARD (2d.html, 3d.html)
   TRƯỚC ĐÂY badge chỉ đếm project.slides.length, nên hầu như chỉ hiện ở
   2d.html — phần lớn project 3D không khai slides (chúng để hình/video/
   model trong relatedBlocks/relatedCards/relatedLoop thay vì slides), nên
   luôn bị coi là "chỉ có 1 ảnh" và badge bị ẩn.

   GIỜ badge đếm TOÀN BỘ file thật sự thuộc 1 project — cover, slides (kể cả
   từng biến thể model trong 1 slide kiểu variants) VÀ mọi ảnh/video/model
   trong relatedBlocks (hoặc relatedCards/relatedLoop kiểu cũ) — dùng lại
   đúng 2 hàm getSlideSrc()/getItemMedia() mà initProjectDetail() đã dùng để
   dựng trang chi tiết, đảm bảo số đếm ở card LUÔN khớp với số file thật sự
   xem được khi bấm vào trang chi tiết dự án.

   Dùng Set để không đếm trùng khi 1 file xuất hiện ở nhiều chỗ (VD: cover
   trùng src với 1 slide/video bên dưới — xem chú thích ở initProjectDetail()
   về cơ chế "cover trùng slide thì tự bỏ slide đó khỏi gallery").
   -------------------------------------------------------------------------- */
function countProjectFiles(project) {
  const files = new Set();
  const addSrc = (src) => { if (src) files.add(src); };

  // cover — kể cả cover khai theo kiểu model nhiều biến thể (variants)
  if (project.cover) {
    if (Array.isArray(project.cover.variants) && project.cover.variants.length) {
      project.cover.variants.forEach((variant) => addSrc(variant.src));
    } else {
      addSrc(project.cover.src);
    }
  }

  // slides — kể cả slide model nhiều biến thể
  (project.slides || []).forEach((slide) => {
    if (Array.isArray(slide.variants) && slide.variants.length) {
      slide.variants.forEach((variant) => addSrc(variant.src));
    } else {
      addSrc(getSlideSrc(slide));
    }
  });

  // relatedBlocks, hoặc fallback relatedCards/relatedLoop kiểu cũ — đúng
  // logic gộp mà initProjectDetail() đang dùng để dựng các khối liên quan.
  const blocks = project.relatedBlocks || [
    project.relatedCards ? { type: 'cards', ...project.relatedCards } : null,
    project.relatedLoop ? { type: 'loop', ...project.relatedLoop } : null,
  ].filter(Boolean);

  blocks.forEach((block) => {
    (block.items || []).forEach((item) => {
      const media = getItemMedia(item);
      if (media) addSrc(media.src);
    });
  });

  return files.size;
}

// Icon hoa 5 cánh dạng LINE (chỉ 1 đường viền duy nhất, KHÔNG có chấm/vòng
// tròn ở tâm) cho badge đếm file — vẽ bằng 1 path duy nhất nối 5 cung tròn
// (mỗi cung là 1 cánh hoa), nên hoa hoàn toàn rỗng ở giữa, không có đường
// nào cắt qua tâm như bản dùng 5 vòng tròn chồng nhau trước đó. Dùng
// stroke="currentColor" nên tự ăn theo màu chữ của badge (--text-primary:
// đen ở theme sáng, trắng ở theme tối, xem html[data-theme="light"] trong
// style.css) — không cần code riêng theo theme, đổi theme là icon tự đổi
// màu theo.
const FLOWER_ICON_SVG = `<svg class="card__count-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M 7.510 5.820 A 4.5 4.5 0 0 1 16.490 5.820 A 4.5 4.5 0 0 1 19.265 14.361 A 4.5 4.5 0 0 1 12.000 19.639 A 4.5 4.5 0 0 1 4.735 14.361 A 4.5 4.5 0 0 1 7.510 5.820 Z"/>
</svg>`;

function initGalleryBadges() {
  if (!Object.keys(PROJECTS).length) return; // trang không nhúng data-2d.js/data-3d.js thì bỏ qua

  document.querySelectorAll('.card__media[data-id]').forEach((trigger) => {
    const project = PROJECTS[trigger.dataset.id];
    if (!project) return;

    const total = countProjectFiles(project);
    if (total <= 1) return; // chỉ có 1 (hoặc 0) file thì không cần báo "xem thêm"

    const badge = document.createElement('span');
    badge.className = 'card__count-badge';
    badge.innerHTML = `${FLOWER_ICON_SVG}<span>${total}</span>`;
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
  const modalPrevBtn = document.getElementById('modalPrev');
  const modalNextBtn = document.getElementById('modalNext');

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

    // Chỉ 1 card đang hiển thị (hoặc do bộ lọc chỉ còn lại đúng 1) thì
    // Prev/Next chẳng đi đâu được — ẩn hẳn 2 nút này thay vì để chúng
    // đứng đó vô dụng (bấm không xảy ra gì).
    const hasMultiple = currentTriggers.length > 1;
    if (modalPrevBtn) modalPrevBtn.hidden = !hasMultiple;
    if (modalNextBtn) modalNextBtn.hidden = !hasMultiple;

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
      // Có data-detail (đã có trang chi tiết riêng) → đi thẳng sang đó.
      // Chưa có (project chưa làm trang riêng) → tạm mở modal xem nhanh
      // như cũ, để vẫn xem được ảnh/mô tả thay vì bấm vào không có gì.
      const href = trigger.dataset.detail;
      if (href) {
        navigateWithFade(href);
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
// --------------------------------------------------------------------------
// MODEL-VIEWER VỚI NHIỀU BIẾN THỂ (variants) — cho phép 1 project khai báo
// NHIỀU file .glb khác nhau cho CÙNG 1 model (bản có texture, bản wireframe,
// bản chỉ có màu/clay...) và cho người xem bấm nút đổi qua lại ngay tại chỗ.
//
// LƯU Ý QUAN TRỌNG: model-viewer KHÔNG thể tự "tắt texture" hay "hiện
// wireframe" từ 1 file .glb duy nhất — không có thuộc tính nào làm được
// việc này. Đây PHẢI là 3 FILE .glb RIÊNG BIỆT, tự export từ Maya/Blender/
// ZBrush, mỗi file gắn material khác nhau (1 bản giữ nguyên texture, 1 bản
// gán shader wireframe, 1 bản gán shader trơn/clay/normal...). Code ở đây
// chỉ đổi thuộc tính "src" của model-viewer qua lại giữa các file đó —
// không tự "tạo ra" wireframe hay bỏ texture được.
//
// Khai báo trong data-2d.js/data-3d.js, ở project.cover HOẶC 1 slide loại
// 'model' — thay 'src' bằng 'variants':
//   {
//     type: 'model',
//     variants: [
//       { label: { vi: 'Có texture', en: 'Textured' }, src: '....glb' },
//       { label: { vi: 'Wireframe',  en: 'Wireframe' }, src: '....glb' },
//       { label: { vi: 'Không texture', en: 'Clay' },  src: '....glb' },
//     ],
//     poster: '...', // (tuỳ chọn) vẫn dùng chung 1 poster cho mọi biến thể
//   }
// label cũng có thể là 1 string thường (VD: 'Wireframe') nếu không cần
// dịch riêng theo ngôn ngữ. Không khai "variants" thì dùng "src"/"poster"
// như cũ, không đổi gì so với trước — 2 kiểu khai báo dùng chung được.
// --------------------------------------------------------------------------

// Lấy đúng src "đại diện" của 1 slide model để so sánh trùng với cover —
// ưu tiên biến thể đầu tiên nếu slide khai theo kiểu variants. Dùng cho so
// khớp trùng lặp (cover/slide) lúc dựng trang — KHÔNG đổi theo biến thể
// đang được chọn, xem getActiveSlideSrc() ngay bên dưới nếu cần src đang
// hiển thị thật sự.
function getSlideSrc(slide) {
  if (!slide) return null;
  if (Array.isArray(slide.variants) && slide.variants.length) {
    return slide.variants[0].src;
  }
  return slide.src;
}

// Trả về src của ĐÚNG biến thể đang được chọn (modelData.activeVariantIndex)
// — khác getSlideSrc() ở trên (luôn lấy biến thể đầu tiên). Dùng mỗi khi
// cần hiện model lên (cả preview tĩnh ngoài cover/tile lẫn model-viewer
// thật trong lightbox), để nếu người dùng đã gạt sang biến thể khác (VD
// Lowpoly) TRƯỚC KHI bấm phóng to, lightbox mở ra vẫn đúng biến thể đó
// thay vì luôn quay về biến thể đầu tiên.
function getActiveSlideSrc(modelData) {
  if (!modelData) return null;
  if (Array.isArray(modelData.variants) && modelData.variants.length) {
    const idx = Number.isInteger(modelData.activeVariantIndex) ? modelData.activeVariantIndex : 0;
    const clamped = Math.max(0, Math.min(idx, modelData.variants.length - 1));
    return modelData.variants[clamped].src;
  }
  return modelData.src;
}

// interactive = true  → gắn camera-controls, model xoay/zoom kéo được ngay
//                        (dùng cho model-viewer THẬT trong lightbox, tức
//                        là sau khi người dùng đã bấm zoom-in).
// interactive = false → KHÔNG gắn camera-controls, model chỉ hiện xem
//                        trước, hoàn toàn tĩnh, không bắt sự kiện kéo/chạm
//                        nào (dùng cho model-viewer nằm sẵn trong card/cover
//                        — trước khi zoom-in). Tách biệt hẳn 2 hành vi
//                        "phóng to" (bấm mở lightbox) và "tương tác" (chỉ có
//                        sau khi đã ở trong lightbox) theo đúng yêu cầu,
//                        tránh việc kéo để xoay model bị đè lên thao tác
//                        bấm-để-zoom hoặc cuộn ngang (dải loop liên quan).
function buildModelViewer(modelData, altText, interactive = true) {
  const mv = document.createElement('model-viewer');
  const initialSrc = getActiveSlideSrc(modelData);
  mv.setAttribute('src', initialSrc);
  if (modelData.poster) mv.setAttribute('poster', modelData.poster);
  if (interactive) {
    mv.setAttribute('camera-controls', '');
  } else {
    // .model-viewer--static (style.css): pointer-events: none — để mọi
    // click/chạm xuyên thẳng xuống tile/cover bên dưới, mở lightbox thay vì
    // bị model-viewer "nuốt" mất thao tác.
    mv.classList.add('model-viewer--static');
  }
  // --- Chỉnh sáng cho model 3D đỡ bị "trắng bệt" trên nền tối ---
  // shadow-intensity/softness: đổ bóng rõ hơn, model có chiều sâu, không
  // bị "phẳng" 1 màu trắng. exposure giảm nhẹ (mặc định 1) vì model
  // trắng/sáng dễ bị cháy sáng (overexpose) dưới ánh sáng mặc định của
  // model-viewer. tone-mapping="neutral" giữ đúng màu thật của model,
  // không đẩy thêm độ sáng/độ bão hoà kiểu ACES filmic (mặc định) khiến
  // vùng trắng dễ bị "bệt". environment-image "neutral" thay ánh sáng
  // studio mặc định (khá dẹt) bằng ánh sáng môi trường có phản chiếu nhẹ,
  // giúp thấy rõ khối/chi tiết bề mặt hơn — xem thêm ở style.css (nền
  // sáng riêng cho khung chứa model, để model KHÔNG bị chìm vào nền tối
  // chung của trang).
  mv.setAttribute('shadow-intensity', '1.2');
  mv.setAttribute('shadow-softness', '0.75');
  mv.setAttribute('exposure', '0.85');
  mv.setAttribute('tone-mapping', 'neutral');
  mv.setAttribute('environment-image', 'neutral');
  mv.setAttribute('alt', altText || '');
  return mv;
}

// Đổi biến thể đang chọn — dùng CHUNG bởi MỌI nơi hiện model của cùng 1
// modelData (preview tĩnh ở cover/tile NGOÀI, VÀ model-viewer thật trong
// lightbox sau khi bấm phóng to). modelData.activeVariantIndex là "nguồn
// sự thật" duy nhất; mỗi nơi hiện model tự đăng ký 1 "view" (xem
// buildModelVariantToggle/buildModelVariantSwitch bên dưới) vào
// modelData._variantViews lúc dựng — applyVariantIndex() sau đó cập nhật
// LẠI TẤT CẢ các view đang còn nằm trong DOM (view.mv.isConnected) mỗi khi
// có 1 nút gạt bất kỳ (ngoài cover/tile HOẶC trong lightbox) được bấm.
// Nhờ vậy: gạt ở ngoài rồi bấm phóng to → lightbox mở đúng biến thể vừa
// chọn; gạt tiếp trong lightbox → đóng lightbox lại, cover/tile ngoài cũng
// đã tự cập nhật theo, không bị lệch giữa 2 nơi.
function applyVariantIndex(modelData, index) {
  if (!Array.isArray(modelData.variants) || !modelData.variants.length) return;
  const clamped = Math.max(0, Math.min(index, modelData.variants.length - 1));
  modelData.activeVariantIndex = clamped;

  // Dọn các view đã rời DOM (tile/lightbox cũ bị dựng lại từ lần trước) để
  // mảng không phình to mãi qua nhiều lần mở lightbox/chuyển slide.
  const views = (modelData._variantViews || []).filter((view) => view.mv && view.mv.isConnected);
  modelData._variantViews = views;

  views.forEach((view) => {
    view.mv.setAttribute('src', modelData.variants[clamped].src);
    if (view.updateUI) view.updateUI(clamped);
  });
}

// Trả về null nếu modelData không khai "variants" (hoặc chỉ có 1 biến thể)
// — khi đó nơi gọi hàm này tự hiện lại badge "Model 3D" như cũ.
// ĐÚNG 2 biến thể (trường hợp hiện tại, VD Highpoly/Lowpoly) → dựng thành
// 1 công tắc gạt (switch) tròn, KHÔNG hiện chữ, bấm để gạt qua-lại — xem
// buildModelVariantSwitch() bên dưới. Từ 3 biến thể trở lên (nếu sau này
// có thêm) → giữ nguyên kiểu cũ: nhiều nút pill có chữ, vì gạt qua-lại chỉ
// hợp lý cho đúng 2 lựa chọn.
// Gọi được nhiều lần cho CÙNG 1 modelData (VD 1 lần lúc dựng cover/tile
// ngoài, 1 lần nữa mỗi khi lightbox mở lại model đó) — mỗi lần dựng 1 bộ
// nút MỚI gắn với đúng model-viewer `mv` truyền vào, nhưng tất cả đều đọc/
// ghi chung modelData.activeVariantIndex nên luôn đồng bộ với nhau.
function buildModelVariantToggle(modelData, mv) {
  if (!Array.isArray(modelData.variants) || modelData.variants.length < 2) return null;
  if (!Number.isInteger(modelData.activeVariantIndex)) modelData.activeVariantIndex = 0;

  if (modelData.variants.length === 2) {
    return buildModelVariantSwitch(modelData, mv);
  }

  const wrap = document.createElement('div');
  wrap.className = 'model-variant-toggle';
  const buttons = [];

  modelData.variants.forEach((variant, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'model-variant-toggle__btn';
    btn.classList.toggle('is-active', index === modelData.activeVariantIndex);

    const label = variant.label;
    if (label && typeof label === 'object') {
      // Gắn data-vi/data-en để applyLanguage() (đã tự quét toàn trang mỗi
      // lần đổi ngôn ngữ) tự cập nhật chữ trên nút, không cần code riêng.
      btn.dataset.vi = label.vi || '';
      btn.dataset.en = label.en || '';
      btn.textContent = getStoredLang() === 'en' ? (label.en || label.vi) : (label.vi || label.en);
    } else {
      btn.textContent = label || `#${index + 1}`;
    }

    btn.addEventListener('click', () => {
      if (index === modelData.activeVariantIndex) return;
      applyVariantIndex(modelData, index);
    });

    buttons.push(btn);
    wrap.appendChild(btn);
  });

  const updateUI = (activeIndex) => {
    buttons.forEach((b, i) => b.classList.toggle('is-active', i === activeIndex));
  };

  if (!modelData._variantViews) modelData._variantViews = [];
  modelData._variantViews.push({ mv, updateUI });

  return wrap;
}

// Công tắc gạt 2 biến thể — thay hẳn chữ trên nút bằng 1 chấm tròn trượt
// qua-lại (xem .model-variant-toggle__switch/.__knob trong style.css).
// KHÔNG có chữ hiển thị nên gắn title (tooltip hover) + aria-pressed để
// vẫn có cách biết đang xem biến thể nào — title lấy nhãn theo ngôn ngữ
// đang chọn tại thời điểm dựng, không tự đổi lại nếu người dùng bấm nút
// đổi ngôn ngữ sau đó (hạn chế nhỏ, chấp nhận được vì chỉ là tooltip phụ).
function buildModelVariantSwitch(modelData, mv) {
  const [first, second] = modelData.variants;
  const labelText = (variant) => {
    const label = variant.label;
    if (label && typeof label === 'object') {
      return getStoredLang() === 'en' ? (label.en || label.vi) : (label.vi || label.en);
    }
    return label || '';
  };

  const wrap = document.createElement('div');
  wrap.className = 'model-variant-toggle model-variant-toggle--switch';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'model-variant-toggle__switch';
  btn.setAttribute('role', 'switch');
  // Khởi tạo ĐÚNG theo modelData.activeVariantIndex hiện tại (không luôn
  // luôn 'false') — quan trọng khi hàm này được gọi lại để dựng nút trong
  // lightbox SAU KHI người dùng đã gạt sang biến thể thứ 2 ở ngoài cover.
  btn.setAttribute('aria-pressed', String(modelData.activeVariantIndex === 1));
  btn.title = `${labelText(first)} / ${labelText(second)}`;

  const knob = document.createElement('span');
  knob.className = 'model-variant-toggle__knob';
  btn.appendChild(knob);

  btn.addEventListener('click', () => {
    const isSecond = btn.getAttribute('aria-pressed') === 'true';
    applyVariantIndex(modelData, isSecond ? 0 : 1);
  });

  wrap.appendChild(btn);

  const updateUI = (activeIndex) => {
    btn.setAttribute('aria-pressed', String(activeIndex === 1));
  };

  if (!modelData._variantViews) modelData._variantViews = [];
  modelData._variantViews.push({ mv, updateUI });

  return wrap;
}

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
  const yearEl = document.getElementById('projectYear');
  const subtitleEl = document.getElementById('projectSubtitle');
  const descEl = document.getElementById('projectDesc');
  const toolsEl = document.getElementById('projectTools');
  const styleTagsEl = document.getElementById('projectStyleTags');
  const styleGroupEl = document.getElementById('projectStyleGroup');
  const teamEl = document.getElementById('projectTeam');
  const teamLabelEl = document.getElementById('projectTeamLabel');
  const teamDescEl = document.getElementById('projectTeamDesc');
  const galleryEl = document.getElementById('projectGallery');
  const coverEl = document.getElementById('projectCover');
  const relatedBlocksRoot = document.getElementById('projectRelatedBlocks');
  const externalLinkEl = document.getElementById('projectExternalLink');

  if (titleEl) titleEl.textContent = project.title;

  // Năm thực hiện dự án — khai báo project.year trong data-2d.js/data-3d.js
  // (chuỗi thường, không cần { vi, en } vì số năm giống nhau ở cả 2 ngôn
  // ngữ). Chưa khai báo thì hiện tạm "[YYYY]" làm placeholder, giống hệt
  // card ngoài trang listing.
  if (yearEl) yearEl.textContent = project.year || '[YYYY]';

  // --- Cover / thumbnail đại diện — hiện to, trên cùng, TRƯỚC cả tên dự án.
  // PHẢI khai báo project.cover trong data-2d.js/data-3d.js mới có, KHÔNG
  // còn tự lấy slides[0] làm đại diện như trước nữa:
  //   - project.cover = { type, src, poster } → hiện media đó ở khu cover.
  //   - KHÔNG khai báo project.cover (hoặc = false) → ẩn hẳn khu cover này,
  //     không có gì hiện ra ở đây.
  // Nếu cover.src trùng với src của 1 slide nào đó trong project.slides,
  // gallery bên dưới sẽ tự bỏ đúng slide đó ra để không lặp lại ảnh — nếu
  // bạn muốn ảnh đó xuất hiện ở CẢ 2 nơi, chỉ cần đặt src khác nhau (ví dụ
  // 1 bản crop riêng cho cover).
  const cover = project.cover || null;

  // zoomableSlides GIỜ LÀ DANH SÁCH DÙNG CHUNG CHO TOÀN TRANG CHI TIẾT —
  // cover, gallery chính, VÀ mọi khối "dự án liên quan" (loop cuộn ngang /
  // lưới card) bên dưới đều nối tiếp media của mình vào CHUNG 1 mảng này,
  // đúng theo thứ tự xuất hiện trên trang (cover → gallery → khối liên
  // quan 1 → khối liên quan 2 → ...). Ảnh, model 3D VÀ video đều được tính
  // vào đây như nhau (video giờ cũng chỉ preview tĩnh, bấm vào mới phát
  // được — xem đoạn xử lý slide.type === 'video' trong gallery bên dưới).
  // Nhờ dùng CHUNG 1 mảng (truyền thẳng reference, không copy), bấm vào
  // BẤT KỲ đâu trên trang — cover, 1 ảnh gallery, hay 1 card trong khối
  // liên quan — đều mở ra CÙNG 1 lightbox với Prev/Next đi xuyên suốt hết
  // toàn bộ media của trang, không còn phân biệt "mở từ đâu" nữa.
  const zoomableSlides = [];
  let coverZoomIndex = null;

  if (coverEl) {
    coverEl.innerHTML = '';
    coverEl.hidden = !cover;
    coverEl.classList.remove('project-cover--model', 'project-cover--zoomable');
    // So khớp type không phân biệt hoa/thường ('model'/'Model'...) — dữ
    // liệu khai trong data-2d.js/data-3d.js đôi khi lỡ viết hoa chữ đầu,
    // trước đây khiến cả nhánh model bị bỏ qua hoàn toàn (cover trống trơn).
    const coverType = String((cover && cover.type) || '').toLowerCase();
    if (cover) {
      if (coverType === 'model' || coverType === 'image') {
        // Cả cover kiểu model lẫn kiểu ảnh đều phóng to được — gộp chung 1
        // nhánh để cùng đăng ký vào zoomableSlides/click handler bên dưới.
        coverZoomIndex = zoomableSlides.length;
        if (coverType === 'model') {
          // QUAN TRỌNG: đẩy THẲNG object `cover` (không tạo bản sao) vào
          // zoomableSlides — nhờ vậy lightbox mở ra từ cover đọc CHUNG
          // đúng field variants/activeVariantIndex với preview tĩnh ngoài
          // cover, và applyVariantIndex()/buildModelVariantToggle() ở trên
          // tự đồng bộ 2 chiều giữa nút gạt ngoài cover và nút gạt trong
          // lightbox (xem giải thích đầy đủ ở đầu 2 hàm đó).
          cover.type = 'model'; // chuẩn hoá lại chữ thường, dùng tiếp bên dưới/trong lightbox
          if (!cover.alt) cover.alt = project.title;
          zoomableSlides.push(cover);
        } else {
          zoomableSlides.push({ src: cover.src, alt: project.title });
        }

        if (coverType === 'model') {
          coverEl.classList.add('project-cover--model');
          // interactive=false: cover model cũng chỉ xem trước tĩnh, giống
          // hệt model trong gallery/related — bấm vào mới mở lightbox và
          // mới xoay/zoom được.
          const mv = buildModelViewer(cover, project.title, false);
          coverEl.appendChild(mv);
          const toggle = buildModelVariantToggle(cover, mv);
          if (toggle) coverEl.appendChild(toggle);
        } else {
          const img = document.createElement('img');
          img.src = cover.src;
          img.alt = project.title;
          coverEl.appendChild(img);
        }

        // Cover chỉ có ĐÚNG 1 ô (không phải lưới nhiều ô như gallery/
        // related) nên gắn thẳng click/keydown lên coverEl luôn, không cần
        // qua bindZoomableTiles. Guard bằng dataset flag phòng khi hàm này
        // lỡ được gọi lại nhiều lần (hiện tại initProjectDetail() chỉ chạy
        // 1 lần lúc tải trang, nhưng gắn guard cho chắc).
        if (!coverEl.dataset.zoomBound) {
          coverEl.dataset.zoomBound = 'true';
          coverEl.classList.add('project-cover--zoomable');
          coverEl.setAttribute('role', 'button');
          coverEl.tabIndex = 0;
          // Dùng closure đọc zoomableSlides tại THỜI ĐIỂM BẤM (không phải
          // lúc khai báo) — nên dù gallery bên dưới nối thêm slide vào
          // mảng này SAU đoạn code này, lightbox mở ra từ cover vẫn thấy
          // đầy đủ toàn bộ danh sách.
          const openCoverLightbox = () => {
            openMediaLightbox(zoomableSlides, coverZoomIndex);
          };
          coverEl.addEventListener('click', (event) => {
            if (event.target.closest('.model-variant-toggle')) return;
            openCoverLightbox();
          });
          coverEl.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            if (event.target.closest('.model-variant-toggle')) return;
            event.preventDefault();
            openCoverLightbox();
          });
        }
      } else if (coverType === 'video') {
        const video = document.createElement('video');
        video.src = cover.src;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (cover.poster) video.poster = cover.poster;
        coverEl.appendChild(video);
      }
    }
  }

  // Danh sách khối "dự án liên quan" (loop cuộn ngang / lưới card), THỨ TỰ
  // và SỐ LƯỢNG hoàn toàn theo project.relatedBlocks (mảng) trong
  // data-2d.js/data-3d.js — mỗi phần tử: { type: 'cards'|'loop', title?,
  // items }. Không khai báo relatedBlocks thì tự dựng lại từ 2 field cũ
  // project.relatedCards/project.relatedLoop (thứ tự Cards → Loop).
  const relatedBlocksList = (
    project.relatedBlocks
    || [
      project.relatedCards ? { type: 'cards', ...project.relatedCards } : null,
      project.relatedLoop ? { type: 'loop', ...project.relatedLoop } : null,
    ].filter(Boolean)
  ).filter((block) => (block.items || []).length > 0);

  // Các trường có bản dịch (category/subtitle/desc/team) được cập nhật qua
  // hàm riêng, và hàm này cũng được gán vào window.__refreshProjectDetail
  // để applyLanguage() gọi lại mỗi khi người dùng đổi ngôn ngữ.
  const updateTranslatedText = (lang) => {
    if (categoryEl) categoryEl.textContent = project.category[lang];
    if (subtitleEl) subtitleEl.textContent = project.subtitle[lang];
    if (descEl) descEl.textContent = project.desc[lang];
    if (project.team) {
      // team[lang] giờ là { label, text } để hiện thành nhiều dòng riêng
      // biệt (VD: dòng 1 "Đóng góp", các dòng sau là nội dung). Vẫn hỗ trợ
      // project cũ chỉ khai báo team[lang] là string phẳng — khi đó dòng
      // nhãn để trống, chỉ hiện 1 dòng như trước.
      // "text" giờ nhận CẢ 2 KIỂU:
      //   text: 'Một dòng duy nhất'
      //   text: ['Dòng 1', 'Dòng 2', 'Dòng 3', ...]  <- nhiều dòng, mỗi
      //         phần tử mảng tự xuống dòng riêng, không cần <br>.
      const teamContent = project.team[lang];
      if (typeof teamContent === 'string') {
        if (teamLabelEl) teamLabelEl.textContent = '';
        if (teamDescEl) teamDescEl.textContent = teamContent;
      } else if (teamContent) {
        if (teamLabelEl) teamLabelEl.textContent = teamContent.label || '';
        if (teamDescEl) {
          teamDescEl.innerHTML = '';
          const lines = Array.isArray(teamContent.text)
            ? teamContent.text
            : [teamContent.text || ''];
          lines.forEach((line) => {
            const p = document.createElement('div');
            p.textContent = line;
            teamDescEl.appendChild(p);
          });
        }
      }
    }

    if (relatedBlocksRoot) {
      // Mỗi <section> khối liên quan luôn có đúng 1 tiêu đề .related-block-title
      // (kể cả khi rỗng/hidden khi block không khai báo title) nên đối chiếu
      // theo thứ tự index với relatedBlocksList là khớp 1-1, không lệch.
      const titleEls = relatedBlocksRoot.querySelectorAll('.related-block-title');
      titleEls.forEach((el, i) => {
        const block = relatedBlocksList[i];
        if (block && block.title) el.textContent = block.title[lang] || '';
      });
    }
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

  // Tag phong cách/chủ đề — mảng riêng biệt với tools (công cụ). Cả nhóm
  // tự ẩn nếu project không khai báo styleTags trong data-2d.js/data-3d.js.
  if (styleGroupEl) {
    const hasStyleTags = Array.isArray(project.styleTags) && project.styleTags.length > 0;
    styleGroupEl.hidden = !hasStyleTags;
    if (hasStyleTags && styleTagsEl) {
      styleTagsEl.innerHTML = '';
      project.styleTags.forEach((tagName) => {
        const span = document.createElement('span');
        span.className = 'tag tag--style';
        span.textContent = tagName;
        styleTagsEl.appendChild(span);
      });
    }
  }

  // Khối "Dự án nhóm" — chỉ hiện khi project.team tồn tại trong data.js
  // (object { vi, en } mô tả phần bạn đóng góp).
  if (teamEl) {
    teamEl.hidden = !project.team;
  }

  // Nút "Xem project khác" (link ngoài, ví dụ Behance) — tự bật/tắt theo
  // project.externalLink trong data-2d.js/data-3d.js:
  //   - Có khai báo (chuỗi URL, VD: 'https://www.behance.net/gallery/xxx')
  //     → gán href rồi hiện nút.
  //   - Không khai báo (bỏ hẳn field, hoặc = '' / false) → nút tự ẩn
  //     (hidden), không cần đụng gì tới HTML/CSS.
  // Text nút (data-vi/data-en) đã được applyLanguage() xử lý chung, không
  // cần set lại textContent ở đây.
  if (externalLinkEl) {
    if (project.externalLink) {
      externalLinkEl.href = project.externalLink;
      externalLinkEl.hidden = false;
    } else {
      externalLinkEl.hidden = true;
      externalLinkEl.removeAttribute('href');
    }
  }

  // --- Gallery kiểu "zodiac"/Pinterest: hiện ảnh/video/model trong
  // project.slides. Nếu project.cover trùng src với 1 slide nào đó, slide
  // đó tự bị bỏ khỏi đây để không lặp lại ảnh (xem so khớp cover ở trên).
  // Số cột được TỰ CHỌN theo số lượng ảnh hiển thị — càng nhiều ảnh, chia
  // càng nhiều cột; chỉ 1-2 ảnh thì hiện full khung cho dễ nhìn. Muốn đổi
  // ngưỡng/số cột, sửa trong pickGalleryColumnClass() ở mục 8c bên dưới.
  // Slide ẢNH, MODEL và VIDEO đều bấm để phóng to được (xem bindZoomableTiles/
  // initMediaLightbox bên dưới) — model/video trong ô chỉ là xem trước tĩnh
  // (không controls/không xoay được), tương tác thật (play, xoay 360°) CHỈ
  // có SAU KHI đã mở lightbox. ---
  // Bố cục 5:2 (gallery trái / info phải) CHỈ áp dụng khi gallery thực sự có
  // ảnh/video/model để hiện. Nếu renderedSlides rỗng (VD: project chỉ khai
  // báo 1 slide và slide đó trùng src với cover nên bị lọc bỏ, hoặc project
  // không khai báo slides nào khác ngoài cover) thì .project-body__gallery
  // được ẩn hẳn và .project-body chuyển sang layout 1 cột full-width, giống
  // hệt layout gập 1 cột ở breakpoint <1024px — xem class
  // "project-body--full" trong style.css.
  const projectBodyEl = root.querySelector('.project-body');
  const galleryWrapperEl = root.querySelector('.project-body__gallery');

  if (galleryEl) {
    galleryEl.innerHTML = '';
    // zoomableSlides đã khai báo dùng chung với cover ở trên — nếu cover
    // zoomable thì nó đã chiếm index 0, các slide dưới đây tự nối tiếp
    // đúng theo giá trị zoomableSlides.length hiện tại (không cần đổi gì
    // thêm ở vòng lặp bên dưới).
    // (project.slides || []): project có cover nhưng chưa kịp khai slides (ví
    // dụ đang làm dở) sẽ không còn làm crash initProjectDetail() nữa — gallery
    // chỉ đơn giản coi như rỗng, trang vẫn hiện đầy đủ phần cover + info.
    // getSlideSrc(): so sánh trùng cover cần lấy đúng src đang hiển thị của
    // slide, dù slide đó khai kiểu cũ (slide.src) hay kiểu nhiều biến thể
    // (slide.variants — xem buildModelViewer() để hiểu rõ 2 kiểu khai báo).
    const renderedSlides = cover
      ? (project.slides || []).filter((slide) => getSlideSrc(slide) !== cover.src)
      : (project.slides || []);

    const galleryIsEmpty = renderedSlides.length === 0;
    if (galleryWrapperEl) galleryWrapperEl.hidden = galleryIsEmpty;
    if (projectBodyEl) projectBodyEl.classList.toggle('project-body--full', galleryIsEmpty);

    renderedSlides.forEach((slide) => {
      const tile = document.createElement('div');
      tile.className = 'project-gallery__tile';

      // Ảnh nào "gọi tên" là to (slide.large = true trong data-2d.js/
      // data-3d.js) sẽ được đánh dấu class riêng — CSS (mục 8b) cho nó
      // tràn hết chiều rộng gallery (column-span: all), to hẳn hơn hẳn so
      // với các ảnh còn lại trong lưới masonry. Xem chi tiết ở style.css.
      if (slide.large) {
        tile.classList.add('project-gallery__tile--large');
      }

      if (slide.type === 'model') {
        tile.classList.add('project-gallery__tile--model');
        // buildModelViewer()/buildModelVariantToggle(): xem giải thích đầy
        // đủ về chỉnh sáng + cơ chế nhiều biến thể (variants) ngay phía
        // trên initProjectDetail(). interactive=false: model trong ô chỉ
        // là xem trước tĩnh — bấm vào tile mới mở lightbox và MỚI có
        // model-viewer thật sự xoay/zoom được, y hệt cách ảnh zoomable
        // hoạt động (xem bindZoomableTiles/initMediaLightbox bên dưới).
        const mv = buildModelViewer(slide, project.title, false);
        tile.appendChild(mv);
        const toggle = buildModelVariantToggle(slide, mv);
        if (toggle) {
          tile.appendChild(toggle);
        } else {
          const badge = document.createElement('span');
          badge.className = 'project-gallery__tile-badge';
          badge.textContent = 'Model 3D';
          tile.appendChild(badge);
        }

        tile.classList.add('project-gallery__tile--zoomable');
        tile.dataset.zoomIndex = String(zoomableSlides.length);
        // Đẩy THẲNG `slide` (không tạo bản sao) — cùng lý do đã giải thích
        // ở nhánh cover model phía trên: giữ chung field variants/
        // activeVariantIndex giữa tile ngoài gallery và lightbox.
        if (!slide.alt) slide.alt = project.title;
        zoomableSlides.push(slide);
      } else if (slide.type === 'video') {
        // Video có control gốc ngay trong ô, phát trực tiếp tại chỗ —
        // KHÔNG cần bấm mở lightbox nữa (khác với model: model chỉ là
        // preview tĩnh, phải bấm vào mới thật sự xoay/zoom được trong
        // lightbox). Vì vậy video KHÔNG gắn class --zoomable và KHÔNG nối
        // vào zoomableSlides — chuỗi Prev/Next trong lightbox chỉ còn đi
        // qua ảnh/model, đúng với việc video đã tự đủ tương tác tại chỗ.
        const video = document.createElement('video');
        video.src = slide.src;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (slide.poster) video.poster = slide.poster;
        tile.appendChild(video);

        const videoIdx = zoomableSlides.length;
        tile.dataset.zoomIndex = String(videoIdx);
        zoomableSlides.push({ type: 'video', src: slide.src, poster: slide.poster, alt: project.title });
      } else {
        const img = document.createElement('img');
        img.src = slide.src;
        img.alt = project.title;
        img.loading = 'lazy';
        tile.appendChild(img);

        // Đánh dấu ô này là "bấm để phóng to" + nhớ vị trí của nó trong
        // danh sách zoomableSlides để lightbox biết mở đúng ảnh nào.
        tile.classList.add('project-gallery__tile--zoomable');
        tile.dataset.zoomIndex = String(zoomableSlides.length);
        zoomableSlides.push({ src: slide.src, alt: project.title });
      }

      galleryEl.appendChild(tile);
    });

    // Xóa hết class số-cột cũ (đổi ngôn ngữ/re-render không bị dính class
    // của lần trước) rồi gán đúng 1 class theo số ảnh đang hiển thị.
    galleryEl.classList.remove(
      'project-gallery--full',
      'project-gallery--cols-2',
      'project-gallery--cols-3',
      'project-gallery--cols-5'
    );
    galleryEl.classList.add(pickGalleryColumnClass(renderedSlides.length));

    bindZoomableTiles(galleryEl, '.project-gallery__tile--zoomable', zoomableSlides);
  }

  // --- KHỐI TÙY CHỌN: dải loop (.showcase) + lưới card dự án liên quan ---
  // Dựng lần lượt TỪNG khối trong relatedBlocksList (đã tính ở trên) vào
  // #projectRelatedBlocks, ĐÚNG THỨ TỰ khai báo trong data — khối 'loop'
  // dùng buildRelatedLoopBlock(), khối 'cards' dùng buildRelatedCardsBlock()
  // (2 hàm này định nghĩa ở mục 8c, cạnh getItemMedia/appendMediaThumb).
  // Card trong cả 2 loại khối đều KHÔNG điều hướng sang trang khác nữa,
  // bấm vào chỉ mở lightbox phóng to media tại chỗ (ảnh/video/model đều
  // được, xem getItemMedia) — y hệt cách gallery chính (#projectGallery)
  // hoạt động, xem initMediaLightbox()/bindZoomableTiles() ở mục 8c.
  //
  // zoomableSlides (khai báo ở đầu hàm, dùng chung với cover + gallery)
  // được truyền thẳng vào 2 hàm dựng khối bên dưới — item của TỪNG khối
  // liên quan được nối tiếp vào CUỐI danh sách này theo đúng thứ tự xuất
  // hiện trên trang. Kết quả: dù bấm vào cover, 1 ảnh trong gallery, hay
  // 1 card trong bất kỳ khối liên quan nào, Prev/Next trong lightbox đều
  // đi xuyên suốt TOÀN BỘ media của trang, theo đúng thứ tự từ trên xuống.
  if (relatedBlocksRoot) {
    relatedBlocksRoot.innerHTML = '';
    const lang0 = document.documentElement.lang === 'en' ? 'en' : 'vi';
    relatedBlocksList.forEach((block) => {
      const section = block.type === 'loop'
        ? buildRelatedLoopBlock(block, lang0, zoomableSlides)
        : buildRelatedCardsBlock(block, lang0, zoomableSlides);
      relatedBlocksRoot.appendChild(section);
    });
  }

  // Card mới build ở trên (nếu có) cần initScrollReveal() quét lại — gọi
  // sau khi DOM đã có card thật, không thì observer sẽ không thấy gì.
  initScrollReveal();
}

/* --------------------------------------------------------------------------
   8b. SỐ CỘT GALLERY THEO SỐ LƯỢNG ẢNH
   1-2 ảnh: hiện full khung (1 cột, ảnh to, dễ nhìn — chia cột với quá ít
   ảnh sẽ bị trống trải, không đẹp). Nhiều ảnh hơn thì chia nhỏ dần để vẫn
   giữ được kiểu "zodiac" gọn gàng. Muốn đổi ngưỡng hoặc số cột, chỉ cần
   sửa trong hàm này — không cần sửa gì khác.
   -------------------------------------------------------------------------- */
function pickGalleryColumnClass(count) {
  if (count <= 2) return 'project-gallery--full';
  if (count <= 4) return 'project-gallery--cols-2';
  if (count <= 8) return 'project-gallery--cols-3';
  return 'project-gallery--cols-5';
}

/* --------------------------------------------------------------------------
   8c. LIGHTBOX PHÓNG TO MEDIA (trang chi tiết dự án)
   1 lightbox DUY NHẤT (#galleryLightbox) dùng chung cho MỌI nơi cần "bấm để
   phóng to" trong trang chi tiết dự án:
     - #projectGallery: slide ẢNH và MODEL đều zoomable (model trong ô chỉ
       là xem trước tĩnh, xoay/zoom thật CHỈ CÓ trong lightbox — xem
       buildModelViewer()); riêng VIDEO vẫn giữ control gốc ngay trong ô,
       không cần phóng to thêm.
     - #projectRelatedLoopTrack / #projectRelatedCardsGrid: card liên quan
       KHÔNG còn điều hướng sang trang dự án khác nữa — bấm vào chỉ phóng
       to ảnh/video/model ngay tại chỗ, y hệt cách gallery hoạt động (xem
       phần build card trong initProjectDetail()).
   Hỗ trợ cả 3 loại slide { type: 'image'|'video'|'model', src, poster, alt }
   — panel chỉ giữ đúng 1 phần tử media tại 1 thời điểm, dựng lại mới hoàn
   toàn mỗi lần chuyển slide (để video/model luôn sạch, không giữ lại
   frame/âm thanh của slide trước).

   initMediaLightbox() setup DUY NHẤT 1 LẦN (đóng/mở/prev-next/phím tắt) và
   trả về hàm openMediaLightbox(slides, index) qua biến module-scope bên
   dưới. bindZoomableTiles(containerEl, tileSelector, slides) gắn click (+
   Enter/Space) cho 1 khu vực bất kỳ, gọi lại openMediaLightbox với đúng
   danh sách của riêng khu vực đó — Prev/Next vì vậy chỉ lướt trong đúng
   nhóm vừa bấm vào (gallery/loop/related cards không bị trộn lẫn).
   -------------------------------------------------------------------------- */
let openMediaLightbox = () => {};

function initMediaLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  const panel = lightbox ? lightbox.querySelector('.lightbox__panel') : null;
  if (!lightbox || !panel) return;

  const counterEl = document.getElementById('lightboxCounter');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let slides = [];
  let currentIndex = 0;

  const renderMedia = () => {
    panel.innerHTML = '';
    const slide = slides[currentIndex];
    if (!slide) return;

    if (slide.type === 'video') {
      const video = document.createElement('video');
      video.className = 'lightbox__video';
      video.src = slide.src;
      if (slide.poster) video.poster = slide.poster;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      panel.appendChild(video);
    } else if (slide.type === 'model') {
      const mv = document.createElement('model-viewer');
      mv.className = 'lightbox__model';
      // getActiveSlideSrc(): nếu slide có nhiều biến thể (Highpoly/Lowpoly...)
      // VÀ người dùng đã gạt biến thể ở cover/tile NGOÀI trước khi bấm
      // phóng to, lightbox mở ra vẫn hiện ĐÚNG biến thể vừa chọn — không tự
      // quay lại biến thể đầu tiên.
      mv.setAttribute('src', getActiveSlideSrc(slide));
      if (slide.poster) mv.setAttribute('poster', slide.poster);
      mv.setAttribute('camera-controls', '');
      // Cùng bộ chỉnh sáng với model trong gallery chính — xem giải thích
      // đầy đủ ở khối render slide type 'model' trong initProjectDetail().
      mv.setAttribute('shadow-intensity', '1.2');
      mv.setAttribute('shadow-softness', '0.75');
      mv.setAttribute('exposure', '0.85');
      mv.setAttribute('tone-mapping', 'neutral');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('alt', slide.alt || '');
      panel.appendChild(mv);

      // Model có nhiều biến thể → hiện lại ĐÚNG nút gạt đó ngay trong
      // lightbox (dùng lại buildModelVariantToggle() — xem giải thích đồng
      // bộ 2 chiều ở đầu hàm đó/applyVariantIndex()), để xem full-screen
      // vẫn đổi qua lại Highpoly/Lowpoly được, không chỉ ở ngoài cover/tile.
      const toggle = buildModelVariantToggle(slide, mv);
      if (toggle) {
        toggle.classList.add('model-variant-toggle--lightbox');
        panel.appendChild(toggle);
      }
    } else {
      const img = document.createElement('img');
      img.className = 'lightbox__img';
      img.src = slide.src;
      img.alt = slide.alt || '';
      panel.appendChild(img);
    }

    if (counterEl) {
      counterEl.textContent = slides.length > 1 ? `${currentIndex + 1} / ${slides.length}` : '';
    }
  };

  const open = (newSlides, index) => {
    if (!newSlides || !newSlides.length) return;
    slides = newSlides;
    currentIndex = index || 0;
    renderMedia();

    // Chỉ 1 slide thì Prev/Next vô nghĩa (bấm cũng chỉ quay lại đúng ảnh
    // đó) — ẩn hẳn 2 nút này đi, y hệt cách xử lý ở modal quickview trang
    // danh sách (#projectModal) phía trên.
    const hasMultiple = slides.length > 1;
    if (prevBtn) prevBtn.hidden = !hasMultiple;
    if (nextBtn) nextBtn.hidden = !hasMultiple;

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    panel.innerHTML = ''; // dừng hẳn video/model đang chạy, không phát ngầm
  };

  const goTo = (offset) => {
    if (!slides.length) return;
    currentIndex = (currentIndex + offset + slides.length) % slides.length;
    renderMedia();
  };

  lightbox.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-lightbox]') || event.target === closeBtn) {
      close();
      return;
    }
    if (event.target.closest('#lightboxPrev')) {
      goTo(-1);
      return;
    }
    if (event.target.closest('#lightboxNext')) {
      goTo(1);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') goTo(-1);
    if (event.key === 'ArrowRight') goTo(1);
  });

  openMediaLightbox = open;
}

// Gắn "bấm vào tile để phóng to" cho 1 khu vực bất kỳ (event delegation,
// an toàn với card build lại nhiều lần). tileSelector là selector của ô/
// card chứa media, đã được gán sẵn data-zoom-index đúng vị trí của nó
// trong slides truyền vào. Có guard dataset.zoomBound để không gắn listener
// trùng nếu lỡ gọi lại nhiều lần trên cùng 1 container.
function bindZoomableTiles(containerEl, tileSelector, slides) {
  if (!containerEl || !slides.length) return;
  if (containerEl.dataset.zoomBound === 'true') return;
  containerEl.dataset.zoomBound = 'true';

  containerEl.addEventListener('click', (event) => {
    // Nút đổi biến thể model (texture/wireframe/clay...) nằm lồng bên
    // trong tile — bấm nút đó chỉ để đổi variant xem trước, KHÔNG mở
    // lightbox (nếu không chặn ở đây, mọi click trong tile — kể cả trúng
    // nút — đều bị closest(tileSelector) bắt và mở lightbox luôn).
    if (event.target.closest('.model-variant-toggle')) return;
    // VIDEO có control gốc ngay tại tile (xem appendMediaThumb) — bấm vào
    // đây là để play/pause/tua bằng control có sẵn, KHÔNG mở lightbox
    // (khác với model: model chỉ là preview tĩnh nên bấm vào mới mở
    // lightbox để thật sự xoay/zoom được).
    if (event.target.closest('video')) return;
    const tile = event.target.closest(tileSelector);
    if (!tile || !containerEl.contains(tile)) return;
    const idx = Number(tile.dataset.zoomIndex);
    if (Number.isNaN(idx)) return;
    openMediaLightbox(slides, idx);
  });

  // Hỗ trợ bàn phím cho card dạng div/article[role="button"] (Enter/Space)
  // — <a>/<button> vốn đã tự bắt Enter/Space nên không ảnh hưởng gì thêm.
  containerEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest('.model-variant-toggle')) return;
    if (event.target.closest('video')) return;
    const tile = event.target.closest(tileSelector);
    if (!tile || !containerEl.contains(tile)) return;
    event.preventDefault();
    const idx = Number(tile.dataset.zoomIndex);
    if (Number.isNaN(idx)) return;
    openMediaLightbox(slides, idx);
  });
}

// Chuẩn hoá field media của 1 item trong relatedLoop/relatedCards: ưu tiên
// item.media { type, src, poster } nếu có khai báo (hỗ trợ video/model
// như gallery chính); không có thì fallback về item.img cũ (ảnh tĩnh) để
// tương thích ngược với data đã khai báo trước đây — không cần sửa lại
// data-2d.js/data-3d.js nếu chưa cần video/model ở khối liên quan.
function getItemMedia(item) {
  if (item.media && item.media.src) return item.media;
  if (item.img) return { type: 'image', src: item.img };
  return null;
}

// Dựng đúng loại thẻ media (ảnh / video / model-viewer) cho 1 ô thumbnail
// nhỏ trong card (relatedLoop/relatedCards) — không cần badge "Model 3D"
// như gallery chính vì đây chỉ là ảnh đại diện, bấm vào mở lightbox xem
// bản đầy đủ. Riêng VIDEO là ngoại lệ (giống cover/gallery chính): có
// control gốc ngay tại đây, phát trực tiếp không cần bấm mở lightbox —
// xem exclusion cho <video> trong bindZoomableTiles() bên dưới.
function appendMediaThumb(container, media, altText) {
  if (!media) return;
  if (media.type === 'model') {
    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', media.src);
    if (media.poster) mv.setAttribute('poster', media.poster);
    // KHÔNG gắn camera-controls ở đây — đây chỉ là ảnh đại diện tĩnh cho
    // card liên quan (loop/cards), bấm vào card mới mở lightbox và MỚI có
    // model-viewer thật sự xoay/zoom được (xem initMediaLightbox renderMedia
    // ở dưới). Trước đây gắn camera-controls ngay tại đây khiến việc kéo để
    // xoay model bị đè lên thao tác bấm-để-zoom và cuộn ngang của dải loop.
    mv.classList.add('model-viewer--static');
    mv.setAttribute('shadow-intensity', '1.2');
    mv.setAttribute('shadow-softness', '0.75');
    mv.setAttribute('exposure', '0.85');
    mv.setAttribute('tone-mapping', 'neutral');
    mv.setAttribute('environment-image', 'neutral');
    mv.setAttribute('alt', altText || '');
    container.appendChild(mv);
  } else if (media.type === 'video') {
    const video = document.createElement('video');
    video.src = media.src;
    if (media.poster) video.poster = media.poster;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    container.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = media.src;
    img.alt = altText || '';
    img.loading = 'lazy';
    container.appendChild(img);
  }
}

// Tạo <h2 class="section-bar related-block-title"> dùng chung cho cả 2
// loại khối bên dưới — LUÔN tạo (kể cả khi block.title không khai báo),
// chỉ ẩn bằng `hidden`, để updateTranslatedText() trong initProjectDetail()
// đối chiếu theo index với relatedBlocksList không bị lệch vị trí.
function buildRelatedBlockTitle(block, lang) {
  const h2 = document.createElement('h2');
  h2.className = 'section-bar related-block-title';
  h2.hidden = !block.title;
  h2.textContent = block.title ? (block.title[lang] || '') : '';
  return h2;
}

// Dựng 1 khối "dải card loop cuộn ngang", y hệt .showcase ở trang chủ —
// dùng cho item type: 'loop' trong project.relatedBlocks (hoặc field cũ
// project.relatedLoop). Card ở đây CÓ hiện chú thích (item.title) nếu có
// khai báo, khác với khối 'cards' bên dưới (luôn bỏ hết chữ).
// sharedSlides: mảng zoomableSlides DÙNG CHUNG với cover/gallery/các khối
// liên quan khác trên trang (xem initProjectDetail()) — item của khối này
// được nối tiếp vào CUỐI mảng đó theo đúng thứ tự hiển thị, để Prev/Next
// trong lightbox đi xuyên suốt toàn trang thay vì chỉ quanh quẩn trong
// đúng khối vừa bấm.
function buildRelatedLoopBlock(block, lang, sharedSlides) {
  const items = block.items || [];
  const section = document.createElement('section');
  section.className = 'section-block';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';
  containerDiv.appendChild(buildRelatedBlockTitle(block, lang));
  section.appendChild(containerDiv);

  const viewport = document.createElement('div');
  viewport.className = 'showcase-viewport';
  const track = document.createElement('div');
  track.className = 'showcase';
  viewport.appendChild(track);
  section.appendChild(viewport);

  // Đẩy media của TỪNG item vào sharedSlides NGAY TỪ ĐẦU (trước khi build
  // tile), ghi nhớ lại đúng index của nó trong danh sách dùng chung — tile
  // gốc lẫn tile lặp (loop liền mạch) bên dưới đều tra lại đúng index này.
  const itemZoomIndexes = items.map((item) => {
    const media = getItemMedia(item) || {};
    const idx = sharedSlides.length;
    sharedSlides.push({ type: media.type || 'image', src: media.src, poster: media.poster, alt: item.title || '' });
    return idx;
  });

  const buildLoopTile = (item, i, isDuplicate) => {
    const tile = document.createElement('div');
    tile.className = 'card';
    // Cả tile gốc lẫn tile lặp (isDuplicate) đều cần zoomIndex vì
    // người dùng hoàn toàn có thể bấm vào tile lặp khi nó đang cuộn
    // vào khung nhìn (kỹ thuật loop liền mạch) — chỉ khác nhau ở khả
    // năng focus bằng bàn phím/đọc màn hình bên dưới.
    tile.dataset.zoomIndex = String(itemZoomIndexes[i]);
    if (isDuplicate) {
      tile.setAttribute('aria-hidden', 'true');
      tile.tabIndex = -1;
    } else {
      tile.setAttribute('role', 'button');
      tile.tabIndex = 0;
      if (item.title) tile.setAttribute('aria-label', item.title);
    }
    const media = document.createElement('span');
    media.className = 'card__media';
    appendMediaThumb(media, getItemMedia(item), item.title);
    tile.appendChild(media);

    // Chú thích (title) CHỈ hiện khi item.title có khai báo và khác
    // rỗng — không khai báo thì KHÔNG tạo phần tử này luôn (không phải
    // ẩn bằng CSS), tile chỉ còn đúng khối ảnh, không chừa khoảng
    // trống nào bên dưới cả.
    const title = (item.title || '').trim();
    if (title) {
      const caption = document.createElement('p');
      caption.className = 'card__caption';
      caption.textContent = title;
      tile.appendChild(caption);
    }

    return tile;
  };
  // Lặp lại đúng 2 lần (nửa sau aria-hidden) để loop liền mạch — giống
  // hệt kỹ thuật .showcase ở trang chủ, xem style.css mục .showcase.
  items.forEach((item, i) => track.appendChild(buildLoopTile(item, i, false)));
  items.forEach((item, i) => track.appendChild(buildLoopTile(item, i, true)));

  bindZoomableTiles(track, '.card', sharedSlides);

  return section;
}

// Dựng 1 khối "lưới card", dùng chung layout .gallery (masonry
// multi-column) với index-2d.html/index-3d.html — cho item type: 'cards'
// trong project.relatedBlocks (hoặc field cũ project.relatedCards). Card
// ở đây KHÔNG hiện category/năm/title, chỉ đúng phần ảnh — item.large =
// true thì card tràn hết chiều rộng khối (xem .gallery .card--large
// trong style.css).
// sharedSlides: xem chú thích ở buildRelatedLoopBlock() phía trên — cùng
// cơ chế nối tiếp vào 1 danh sách dùng chung cho toàn trang.
function buildRelatedCardsBlock(block, lang, sharedSlides) {
  const items = block.items || [];
  const section = document.createElement('section');
  section.className = 'section-block';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';
  containerDiv.appendChild(buildRelatedBlockTitle(block, lang));

  const grid = document.createElement('div');
  grid.className = 'gallery';
  containerDiv.appendChild(grid);
  section.appendChild(containerDiv);

  items.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'card';
    if (item.large) {
      article.classList.add('card--large');
    }
    article.setAttribute('role', 'button');
    article.tabIndex = 0;
    if (item.title) article.setAttribute('aria-label', item.title);

    const media = getItemMedia(item) || {};
    const idx = sharedSlides.length;
    sharedSlides.push({ type: media.type || 'image', src: media.src, poster: media.poster, alt: item.title || '' });
    article.dataset.zoomIndex = String(idx);

    const mediaEl = document.createElement('span');
    mediaEl.className = 'card__media';
    appendMediaThumb(mediaEl, media, item.title);
    article.appendChild(mediaEl);

    grid.appendChild(article);
  });

  bindZoomableTiles(grid, '.card', sharedSlides);

  return section;
}
/* --------------------------------------------------------------------------
   8e. HIỆU ỨNG "TRƯỢT LÊN KHI CUỘN TỚI" (dùng chung: .gallery .card ở
   index-2d.html/index-3d.html VÀ #projectRelatedCardsGrid ở trang chi tiết
   — cả 2 đều có class .gallery nên chung 1 selector, chung luôn hiệu ứng).
   An toàn gọi lại nhiều lần (initProjectDetail() gọi lại sau khi build
   card mới) — mỗi card chỉ được observe 1 lần duy nhất nhờ dataset flag,
   không bị đăng ký chồng observer. Card đã hiện 1 lần thì unobserve luôn,
   không lặp lại hiệu ứng khi cuộn qua cuộn lại.
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = Array.from(document.querySelectorAll('.gallery .card')).filter(
    (el) => !el.dataset.revealBound
  );
  if (!targets.length) return;

  targets.forEach((el) => { el.dataset.revealBound = 'true'; });

  if (!('IntersectionObserver' in window)) {
    onContentRevealed(() => targets.forEach((el) => el.classList.add('is-visible')));
    return;
  }

  // Đợi tới lúc loading screen đã ẩn hẳn mới thật sự gắn observer. Nếu
  // gắn ngay lúc gọi (thường là trong DOMContentLoaded, khi loader còn
  // che toàn màn hình), card nào đang nằm sẵn trong khung nhìn (hàng đầu
  // gallery) sẽ bị observer báo "visible" NGAY trong khung hình kế tiếp —
  // animate trượt lên 0.6s chạy và xong luôn trong lúc còn bị loader che,
  // nên người dùng không kịp thấy hiệu ứng, chỉ thấy card hiện sẵn.
  onContentRevealed(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -50% 0px' });
    // rootMargin âm -50% ở đáy = co vùng "trong khung nhìn" lại chỉ còn NỬA
    // TRÊN của màn hình, nên card chỉ được đánh dấu .is-visible (và animate
    // trượt lên) khi đã cuộn tới khoảng GIỮA màn hình, không còn từ mép dưới
    // như trước.

    targets.forEach((el) => observer.observe(el));
  });
}

/* --------------------------------------------------------------------------
   8f. HIỆU ỨNG CUỘN-TỚI-THÌ-HIỆN CHO CÁC KHỐI LỚN Ở TRANG CHỦ (.reveal)
   Dùng chung 1 observer cho mọi phần tử có class .reveal — hướng trượt
   (lên/trái/phải) do CSS quyết định qua modifier class (.reveal--up/left/
   right), hàm này chỉ lo phần thêm .is-visible đúng lúc. An toàn gọi lại
   nhiều lần nhờ dataset flag, giống initScrollReveal().
   -------------------------------------------------------------------------- */
function initSectionReveal() {
  const targets = Array.from(document.querySelectorAll('.reveal')).filter(
    (el) => !el.dataset.revealBound
  );
  if (!targets.length) return;

  targets.forEach((el) => { el.dataset.revealBound = 'true'; });

  if (!('IntersectionObserver' in window)) {
    onContentRevealed(() => targets.forEach((el) => el.classList.add('is-visible')));
    return;
  }

  // Cùng lý do như initScrollReveal(): đợi loader ẩn hẳn rồi mới gắn
  // observer, tránh trường hợp hiếm khi 1 khối .reveal lọt sẵn trong khung
  // nhìn lúc trang vừa load (màn hình thấp/zoom cao) bị đánh dấu hiện và
  // chạy animate xong trong lúc loading screen còn che.
  onContentRevealed(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -50% 0px' });
    // rootMargin âm -50% ở đáy = co vùng "trong khung nhìn" lại chỉ còn NỬA
    // TRÊN của màn hình, nên khối .reveal chỉ được đánh dấu .is-visible (bắt
    // đầu trượt lên/trái/phải) khi đã cuộn tới khoảng GIỮA màn hình.

    targets.forEach((el) => observer.observe(el));
  });
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
/* --------------------------------------------------------------------------
   11. CUSTOM CURSOR — chấm + vòng hoa 5 cánh đuổi theo chuột
   Chỉ bật trên thiết bị có chuột thật (hover:hover + pointer:fine) — thiết
   bị cảm ứng không phát mousemove liên tục nên bật ở đó chỉ tạo ra 1 chấm
   "chết" dính ở lần chạm cuối, không có ý nghĩa gì.
   Cơ chế 2 lớp:
   - .custom-cursor__dot: gán translate = toạ độ chuột THẬT mỗi lần
     mousemove, không lerp — luôn khớp đúng điểm click.
   - .custom-cursor__flower: cập nhật mỗi frame bằng requestAnimationFrame,
     lerp dần về phía toạ độ chuột thật (hệ số CURSOR_FLOWER_EASE) — tạo độ
     trễ mượt giống cursor tham khảo, thay vì dính cứng vào chuột.
   Icon hoa dùng lại đúng path SVG của FLOWER_ICON_SVG (badge số lượng ảnh,
   xem mục initGalleryBadges() phía trên) để đồng bộ hình khối trên toàn
   site, chỉ khác là tô stroke bằng gradient thay vì currentColor, và kích
   thước to hơn hẳn (dùng làm cursor chứ không phải icon nhỏ trong badge).
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const supportsCustomCursor =
    window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsCustomCursor) return;

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  // Gradient khai trong <defs> của chính SVG này (không phải CSS) vì
  // stop-color cần set qua style="" mới chắc chắn nhận được CSS custom
  // property var(--accent)/var(--accent-warm) ở mọi trình duyệt — 2 biến
  // này đã tự có bản riêng cho theme sáng/tối (xem :root / html[data-theme
  // ="light"] trong style.css) nên gradient tự đổi tông theo theme luôn,
  // không cần code riêng ở đây.
  cursor.innerHTML = `
    <svg class="custom-cursor__flower" viewBox="0 0 24 24" width="46" height="46" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="customCursorFlowerGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" style="stop-color: var(--accent);" />
          <stop offset="1" style="stop-color: var(--accent-warm);" />
        </linearGradient>
      </defs>
      <path stroke="url(#customCursorFlowerGradient)" d="M 7.510 5.820 A 4.5 4.5 0 0 1 16.490 5.820 A 4.5 4.5 0 0 1 19.265 14.361 A 4.5 4.5 0 0 1 12.000 19.639 A 4.5 4.5 0 0 1 4.735 14.361 A 4.5 4.5 0 0 1 7.510 5.820 Z"/>
    </svg>
    <span class="custom-cursor__dot"></span>
  `;
  document.body.appendChild(cursor);
  document.body.classList.add('custom-cursor-active');

  const dotEl = cursor.querySelector('.custom-cursor__dot');
  const flowerEl = cursor.querySelector('.custom-cursor__flower');

  // Toạ độ chuột thật, cập nhật ngay mỗi mousemove — flowerX/flowerY là
  // toạ độ đang hiển thị của hoa, đuổi dần theo mouseX/mouseY mỗi frame
  // (xem animateFlower() bên dưới) chứ không nhảy thẳng tới.
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let flowerX = mouseX;
  let flowerY = mouseY;
  let hasMouseMoved = false;

  // scale HIỆN TẠI (đang hiển thị, được lerp dần) và scale MỤC TIÊU (1 khi
  // bình thường, to hơn khi hover vùng bấm được, nhỏ hơn khi đang giữ
  // chuột) — lerp luôn cả scale trong animateFlower() thay vì transition
  // CSS, vì transform của flower đã bị set thẳng qua style.transform mỗi
  // frame (để lerp vị trí), nên 1 rule scale khai riêng bên CSS (qua class)
  // sẽ bị đè mất, không bao giờ chạy được — phải gộp hết translate + rotate
  // + scale vào chung 1 chuỗi transform tính trong JS.
  let currentScale = 1;
  let targetScale = 1;
  let isPressed = false;

  // Selector các vùng "bấm được" — hover vào thì phóng to vòng hoa, gợi ý
  // giống cursor pointer mặc định nhưng theo phong cách riêng của site.
  const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, label, [role="button"], [onclick]';

  function updateHoverState(clientX, clientY) {
    // Dò phần tử đang nằm dưới toạ độ chuột bằng elementFromPoint thay vì
    // gắn listener cho từng phần tử lúc khởi tạo — nhiều card/nút trong
    // site được JS dựng ĐỘNG sau đó (gallery badge, lightbox, related
    // blocks...), gắn listener 1 lần lúc initCustomCursor() chạy sẽ bỏ
    // sót hết các phần tử này.
    const target = document.elementFromPoint(clientX, clientY);
    const isInteractive = !!(target && target.closest(INTERACTIVE_SELECTOR));
    targetScale = isPressed ? 0.85 : isInteractive ? 1.35 : 1;
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMouseMoved = true;
    dotEl.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    updateHoverState(mouseX, mouseY);

    // Reduced motion: đặt hoa trùng luôn vị trí + scale mục tiêu ngay
    // trong sự kiện mousemove, không chờ vòng lặp animateFlower() lerp
    // dần — với người dùng bật "giảm hiệu ứng chuyển động", độ trễ dù
    // mượt cũng là 1 dạng chuyển động không mong muốn.
    if (prefersReducedMotion) {
      flowerX = mouseX;
      flowerY = mouseY;
      flowerEl.style.transform = `translate(${flowerX}px, ${flowerY}px) translate(-50%, -50%) scale(${targetScale})`;
    }
  });

  document.addEventListener('mouseleave', () => cursor.classList.add('custom-cursor--hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('custom-cursor--hidden'));
  window.addEventListener('mousedown', () => {
    isPressed = true;
    updateHoverState(mouseX, mouseY);
  });
  window.addEventListener('mouseup', () => {
    isPressed = false;
    updateHoverState(mouseX, mouseY);
  });

  if (prefersReducedMotion) return; // không cần vòng lặp lerp ở trên nữa

  // Hệ số lerp: số càng nhỏ, hoa càng "nặng"/trễ khi đuổi theo chuột. 0.15
  // cho cảm giác trôi nhẹ, mượt, giống cursor tham khảo người dùng gửi —
  // chỉnh số này là cách nhanh nhất để "trễ nhiều/ít hơn" nếu cần sau này.
  // Scale lerp nhanh hơn hẳn (0.25) vì đây là phản hồi hover/click, cần
  // "ăn theo" ngay chứ không nên trễ như phần di chuyển.
  const CURSOR_FLOWER_EASE = 0.15;
  const CURSOR_SCALE_EASE = 0.25;

  function animateFlower() {
    if (hasMouseMoved) {
      flowerX += (mouseX - flowerX) * CURSOR_FLOWER_EASE;
      flowerY += (mouseY - flowerY) * CURSOR_FLOWER_EASE;
      currentScale += (targetScale - currentScale) * CURSOR_SCALE_EASE;
      // Xoay nhẹ theo độ lệch giữa hoa và chuột thật (khoảng cách còn lại
      // của lerp) — hoa "nghiêng" theo hướng đang đuổi tới, chỉ là hiệu
      // ứng trang trí thêm, không ảnh hưởng logic định vị.
      const tiltDeg = (mouseX - flowerX) * 0.5;
      flowerEl.style.transform =
        `translate(${flowerX}px, ${flowerY}px) translate(-50%, -50%) rotate(${tiltDeg}deg) scale(${currentScale})`;
    }
    requestAnimationFrame(animateFlower);
  }
  requestAnimationFrame(animateFlower);
}