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
   ở đây. Trang mặc định là tối (không cần khai báo gì thêm).
 
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
 
function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  } catch (error) {
    return 'dark'; // localStorage có thể bị chặn (chế độ ẩn danh...) — mặc định tối
  }
}
 
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
 
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    const isLight = theme === 'light';
    btn.setAttribute(
      'aria-label',
      isLight ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'
    );
  });
 
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
 
  applyTheme(getStoredTheme());
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

  if (coverEl) {
    coverEl.innerHTML = '';
    coverEl.hidden = !cover;
    coverEl.classList.remove('project-cover--model');
    if (cover) {
      if (cover.type === 'model') {
        coverEl.classList.add('project-cover--model');
        const mv = document.createElement('model-viewer');
        mv.setAttribute('src', cover.src);
        if (cover.poster) mv.setAttribute('poster', cover.poster);
        mv.setAttribute('camera-controls', '');
        // Chỉnh sáng/tương phản cho model đỡ bị "trắng bệt" trên nền tối —
        // xem giải thích đầy đủ ở khối model-viewer trong gallery bên dưới.
        mv.setAttribute('shadow-intensity', '1.2');
        mv.setAttribute('shadow-softness', '0.75');
        mv.setAttribute('exposure', '0.85');
        mv.setAttribute('tone-mapping', 'neutral');
        mv.setAttribute('environment-image', 'neutral');
        mv.setAttribute('alt', project.title);
        coverEl.appendChild(mv);
      } else if (cover.type === 'video') {
        const video = document.createElement('video');
        video.src = cover.src;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (cover.poster) video.poster = cover.poster;
        coverEl.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = cover.src;
        img.alt = project.title;
        coverEl.appendChild(img);
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
      // team[lang] giờ là { label, text } để hiện thành 2 dòng riêng biệt
      // (VD: dòng 1 "Đóng góp", dòng 2 "Lên ý tưởng concept & Dàn trang
      // chính."). Vẫn hỗ trợ project cũ chỉ khai báo team[lang] là string
      // phẳng — khi đó dòng nhãn để trống, chỉ hiện 1 dòng như trước.
      const teamContent = project.team[lang];
      if (typeof teamContent === 'string') {
        if (teamLabelEl) teamLabelEl.textContent = '';
        if (teamDescEl) teamDescEl.textContent = teamContent;
      } else if (teamContent) {
        if (teamLabelEl) teamLabelEl.textContent = teamContent.label || '';
        if (teamDescEl) teamDescEl.textContent = teamContent.text || '';
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

  // --- Gallery kiểu "zodiac"/Pinterest: hiện ảnh/video/model trong
  // project.slides. Nếu project.cover trùng src với 1 slide nào đó, slide
  // đó tự bị bỏ khỏi đây để không lặp lại ảnh (xem so khớp cover ở trên).
  // Số cột được TỰ CHỌN theo số lượng ảnh hiển thị — càng nhiều ảnh, chia
  // càng nhiều cột; chỉ 1-2 ảnh thì hiện full khung cho dễ nhìn. Muốn đổi
  // ngưỡng/số cột, sửa trong pickGalleryColumnClass() ở mục 8c bên dưới.
  // Riêng slide ẢNH có thêm khả năng bấm để phóng to (xem bindZoomableTiles/
  // initMediaLightbox bên dưới) — video/model đã có tương tác riêng (play,
  // xoay 360°) ngay trong ô nên không cần phóng to thêm, bấm vào đó vẫn
  // dùng đúng công cụ gốc của nó. ---
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
    const zoomableSlides = []; // chỉ chứa slide ảnh, theo đúng thứ tự hiển thị
    const renderedSlides = cover
      ? project.slides.filter((slide) => slide.src !== cover.src)
      : project.slides;

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
        const mv = document.createElement('model-viewer');
        mv.setAttribute('src', slide.src);
        if (slide.poster) mv.setAttribute('poster', slide.poster);
        mv.setAttribute('camera-controls', '');
        // --- Chỉnh sáng cho model 3D đỡ bị "trắng bệt" trên nền tối ---
        // shadow-intensity/softness: đổ bóng rõ hơn, model có chiều sâu,
        // không bị "phẳng" 1 màu trắng. exposure giảm nhẹ (mặc định 1) vì
        // model trắng/sáng dễ bị cháy sáng (overexpose) dưới ánh sáng mặc
        // định của model-viewer. tone-mapping="neutral" giữ đúng màu thật
        // của model, không đẩy thêm độ sáng/độ bão hoà kiểu ACES filmic
        // (mặc định) khiến vùng trắng dễ bị "bệt". environment-image
        // "neutral" thay ánh sáng studio mặc định (khá dẹt) bằng ánh sáng
        // môi trường có phản chiếu nhẹ, giúp thấy rõ khối/chi tiết bề mặt
        // hơn — xem thêm ở style.css (nền sáng riêng cho khung chứa model,
        // để model KHÔNG bị chìm vào nền tối chung của trang).
        mv.setAttribute('shadow-intensity', '1.2');
        mv.setAttribute('shadow-softness', '0.75');
        mv.setAttribute('exposure', '0.85');
        mv.setAttribute('tone-mapping', 'neutral');
        mv.setAttribute('environment-image', 'neutral');
        mv.setAttribute('alt', project.title);
        tile.appendChild(mv);
        const badge = document.createElement('span');
        badge.className = 'project-gallery__tile-badge';
        badge.textContent = 'Model 3D';
        tile.appendChild(badge);
      } else if (slide.type === 'video') {
        const video = document.createElement('video');
        video.src = slide.src;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (slide.poster) video.poster = slide.poster;
        tile.appendChild(video);
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
  if (relatedBlocksRoot) {
    relatedBlocksRoot.innerHTML = '';
    const lang0 = document.documentElement.lang === 'en' ? 'en' : 'vi';
    relatedBlocksList.forEach((block) => {
      const section = block.type === 'loop'
        ? buildRelatedLoopBlock(block, lang0)
        : buildRelatedCardsBlock(block, lang0);
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
     - #projectGallery: chỉ slide ẢNH mới zoomable (video/model đã có tương
       tác riêng ngay trong ô — play, xoay 360° — nên không cần phóng to
       thêm).
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
      mv.setAttribute('src', slide.src);
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
// hay control video đầy đủ như gallery chính vì đây chỉ là ảnh đại diện,
// bấm vào là mở lightbox xem bản đầy đủ.
function appendMediaThumb(container, media, altText) {
  if (!media) return;
  if (media.type === 'model') {
    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', media.src);
    if (media.poster) mv.setAttribute('poster', media.poster);
    mv.setAttribute('camera-controls', '');
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
    video.muted = true;
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
function buildRelatedLoopBlock(block, lang) {
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

  const buildLoopTile = (item, index, isDuplicate) => {
    const tile = document.createElement('div');
    tile.className = 'card';
    // Cả tile gốc lẫn tile lặp (isDuplicate) đều cần zoomIndex vì
    // người dùng hoàn toàn có thể bấm vào tile lặp khi nó đang cuộn
    // vào khung nhìn (kỹ thuật loop liền mạch) — chỉ khác nhau ở khả
    // năng focus bằng bàn phím/đọc màn hình bên dưới.
    tile.dataset.zoomIndex = String(index);
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

  const loopMediaSlides = items.map((item) => {
    const media = getItemMedia(item) || {};
    return { type: media.type || 'image', src: media.src, poster: media.poster, alt: item.title || '' };
  });
  bindZoomableTiles(track, '.card', loopMediaSlides);

  return section;
}

// Dựng 1 khối "lưới card", dùng chung layout .gallery (masonry
// multi-column) với index-2d.html/index-3d.html — cho item type: 'cards'
// trong project.relatedBlocks (hoặc field cũ project.relatedCards). Card
// ở đây KHÔNG hiện category/năm/title, chỉ đúng phần ảnh — item.large =
// true thì card tràn hết chiều rộng khối (xem .gallery .card--large
// trong style.css).
function buildRelatedCardsBlock(block, lang) {
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

  items.forEach((item, i) => {
    const article = document.createElement('article');
    article.className = 'card';
    if (item.large) {
      article.classList.add('card--large');
    }
    article.setAttribute('role', 'button');
    article.tabIndex = 0;
    if (item.title) article.setAttribute('aria-label', item.title);
    article.dataset.zoomIndex = String(i);

    const media = document.createElement('span');
    media.className = 'card__media';
    appendMediaThumb(media, getItemMedia(item), item.title);
    article.appendChild(media);

    grid.appendChild(article);
  });

  const relatedMediaSlides = items.map((item) => {
    const media = getItemMedia(item) || {};
    return { type: media.type || 'image', src: media.src, poster: media.poster, alt: item.title || '' };
  });
  bindZoomableTiles(grid, '.card', relatedMediaSlides);

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
    }, { threshold: 0.1, rootMargin: '0px 0px 20px 0px' });
    // Trước đây rootMargin +180px (mở rất rộng vùng tính "đang trong khung
    // nhìn") khiến card bị đánh dấu .is-visible QUÁ SỚM — trong lúc gallery
    // dạng masonry (columns) còn đang tính lại layout theo ảnh (nhất là ảnh
    // loading="lazy" load xong mới có kích thước thật), card đổi sang trạng
    // thái "đã hiện" ở 1 vị trí tạm rồi bị masonry đẩy qua vị trí khác —
    // nhìn như "biến mất, kéo tới mới bật ra" vì transition đã chạy xong từ
    // trước tại vị trí cũ. Giảm margin xuống rất nhẹ (20px) để card chỉ được
    // đánh dấu hiện khi ĐÃ GẦN NHƯ ở đúng vị trí cuối, animate vẫn chạy nhưng
    // không còn bị lệch pha với layout nữa.

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
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    // Trước dùng rootMargin +100px (mở rộng vùng nhận diện xuống dưới) nên
    // các khối này bị đánh dấu "đã hiện" từ SỚM, trước khi thật sự cuộn tới
    // — nhìn như "không animate gì cả" vì lúc người dùng thấy được thì hiệu
    // ứng đã chạy xong từ trước rồi. Đổi sang rootMargin ÂM (-40px): giờ chỉ
    // đánh dấu hiện khi phần tử đã cuộn vào TRONG khung nhìn thật một đoạn,
    // đúng lúc mắt nhìn thấy nó bắt đầu trượt.

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