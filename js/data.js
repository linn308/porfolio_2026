/* ==========================================================================
   data.js — Dữ liệu chi tiết từng dự án (dùng cho project.html).
   Mỗi project có 1 mảng "slides": có thể là ảnh (type: 'image') hoặc
   model 3D (type: 'model', cần src .glb + poster). Trang project.html
   đọc ?id=... trên URL, tra trong PROJECTS, rồi render toàn bộ gallery.

   Các trường subtitle/desc/category có 2 phiên bản { vi, en } để phối hợp
   với bộ chuyển ngôn ngữ trong script.js — title và tools giữ nguyên
   (thuật ngữ ngành / tên riêng, không cần dịch).

   Thêm dự án mới: chỉ cần thêm 1 object vào đây với key trùng data-id
   trên thẻ .card__media tương ứng trong 2d.html / 3d.html.
   ========================================================================== */

const PROJECTS = {

  crusader: {
    title: 'CRUSADER',
    category: { vi: 'Model', en: 'Model' },
    subtitle: {
      vi: '3D Game Design — Đồ án xuất sắc',
      en: '3D Game Design — Excellent Project',
    },
    desc: {
      vi: 'Đồ án 3D Game Design đạt loại xuất sắc. Modeling và texturing nhân vật/prop trong Maya và ZBrush, hoàn thiện chi tiết bề mặt và render preview trong Photoshop. Bộ ảnh dưới đây gồm góc quay turntable, chi tiết wireframe và bản render final.',
      en: 'A 3D Game Design project graded excellent. Character/prop modeling and texturing done in Maya and ZBrush, with surface detail and preview renders finished in Photoshop. The set below includes turntable angles, wireframe close-ups and the final render.',
    },
    tools: ['Maya', 'ZBrush', 'Photoshop'],
    slides: [
      { type: 'model', src: 'assets/models/crusader.glb', poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1633966887768-64f9a867bdba?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  'fight-for-life': {
    title: 'FIGHT FOR LIFE',
    category: { vi: 'Animation', en: 'Animation' },
    subtitle: {
      vi: '3D Short Film — Đồ án xuất sắc',
      en: '3D Short Film — Excellent Project',
    },
    desc: {
      vi: 'Phim ngắn 3D phong cách Cel-look Anime, đạt loại xuất sắc. Đảm nhận Storyboard và Layout Artist, dàn dựng bố cục khung hình và nhịp kể chuyện cho toàn bộ short film. Bộ ảnh gồm storyboard, frame layout và still cuối phim.',
      en: 'A Cel-look Anime style 3D short film, graded excellent. Worked as Storyboard and Layout Artist, shaping the frame composition and pacing across the whole short film. The set includes storyboard frames, layout shots and final film stills.',
    },
    tools: ['Cel-look', 'Storyboard', 'Layout'],
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  'magazine-layout': {
    title: 'Magazine Layout',
    category: { vi: 'Editorial', en: 'Editorial' },
    subtitle: {
      vi: 'Editorial Composition',
      en: 'Editorial Composition',
    },
    desc: {
      vi: 'Dàn trang tạp chí và bố cục editorial: xây dựng lưới (grid system), phân cấp typography và phối hợp hình ảnh — minh họa được dựng trong Illustrator, chỉnh sửa ảnh trong Photoshop. Bộ ảnh gồm bìa, spread đôi trang và chi tiết typography.',
      en: 'Magazine layout and editorial composition: building the grid system, typographic hierarchy and image pairing — illustrations built in Illustrator, photo editing in Photoshop. The set includes the cover, double-page spreads and typography close-ups.',
    },
    tools: ['InDesign', 'Illustrator', 'Photoshop'],
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  /* ---- Các project bên dưới là PLACEHOLDER — thay slides/desc/tools
     bằng dự án thật khi bạn có, giữ nguyên cấu trúc object. ---- */

  'poster-series': {
    title: '[Tên dự án] — Poster Series',
    category: { vi: 'Poster', en: 'Poster' },
    subtitle: { vi: 'Poster Design', en: 'Poster Design' },
    desc: {
      vi: 'Placeholder — thay bằng mô tả dự án poster thật của bạn: concept, bảng màu, thông điệp thị giác chính.',
      en: 'Placeholder — replace with your real poster project: concept, color palette, key visual message.',
    },
    tools: ['Illustrator', 'Photoshop'],
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  'layout-study-2d': {
    title: '[Tên dự án] — Editorial Layout Study',
    category: { vi: 'Layout', en: 'Layout' },
    subtitle: { vi: 'Layout Design', en: 'Layout Design' },
    desc: {
      vi: 'Placeholder — thay bằng dự án layout thật: hệ thống lưới, khoảng trắng, phân cấp nội dung.',
      en: 'Placeholder — replace with your real layout project: grid system, white space, content hierarchy.',
    },
    tools: ['InDesign', 'Photoshop'],
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  'design-concept': {
    title: '[Tên dự án] — Visual Design Concept',
    category: { vi: 'Design', en: 'Design' },
    subtitle: { vi: 'Graphic Design', en: 'Graphic Design' },
    desc: {
      vi: 'Placeholder — thay bằng dự án graphic design / branding thật: mood board, hệ thống nhận diện, ứng dụng thực tế.',
      en: 'Placeholder — replace with your real graphic design / branding project: mood board, identity system, real-world application.',
    },
    tools: ['Illustrator', 'Photoshop'],
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  'layout-study-3d': {
    title: '[Tên dự án] — Layout / Storyboard Study',
    category: { vi: 'Layout', en: 'Layout' },
    subtitle: { vi: 'Layout Artist', en: 'Layout Artist' },
    desc: {
      vi: 'Placeholder — thay bằng dự án layout/storyboard 3D thật: bố cục khung hình, camera blocking, nhịp kể chuyện.',
      en: 'Placeholder — replace with your real 3D layout/storyboard project: frame composition, camera blocking, story pacing.',
    },
    tools: ['Maya', 'Storyboard'],
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  'web3d-placeholder': {
    title: '[Tên dự án] — Web3D Interactive Prototype',
    category: { vi: 'Web3D', en: 'Web3D' },
    subtitle: { vi: 'Web3D · Three.js', en: 'Web3D · Three.js' },
    desc: {
      vi: 'Placeholder — thay bằng dự án Web3D thật khi hoàn thiện: model nhúng trực tiếp trên web, tương tác xoay/zoom bằng Three.js.',
      en: 'Placeholder — replace with your real Web3D project once finished: model embedded directly on the web, rotate/zoom interaction powered by Three.js.',
    },
    tools: ['Three.js', 'glTF', 'JavaScript'],
    slides: [
      { type: 'model', src: 'assets/models/web3d-placeholder.glb', poster: 'https://images.unsplash.com/photo-1633966887768-64f9a867bdba?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

};
