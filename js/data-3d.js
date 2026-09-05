/* ==========================================================================
   data-3d.js — Dữ liệu chi tiết các dự án 3D (dùng cho trang chi tiết dự án).
   Nửa còn lại của "data.js" cũ — xem đầu file data-2d.js để biết cách 2 file
   này được script.js gộp lại thành 1 object PROJECTS duy nhất.

   Thêm dự án 3D mới: thêm 1 object vào PROJECTS_3D, key trùng với
   data-id trên thẻ .card__media tương ứng trong project/3d/index-3d.html.
   Xem phần "GIẢI THÍCH CÁC TRƯỜNG DỮ LIỆU" ở cuối file data-2d.js.
   ========================================================================== */

   /* ==========================================================================
   GIẢI THÍCH CÁC TRƯỜNG DỮ LIỆU CHUNG CHO PROJECT
   ==========================================================================
   key (vd: 'magazine-layout')
     — "Tên định danh" của dự án. PHẢI khớp 100% với data-id trên thẻ
       .card__media của card tương ứng trong index-2d.html/3d.html. Đây là sợi
       dây duy nhất nối 1 card ngoài gallery với dữ liệu chi tiết của nó.

   title      — Tên dự án, hiển thị y nguyên ở cả 2 ngôn ngữ (không dịch).
   category   — { vi, en }: nhãn nhỏ phía trên tiêu đề trang chi tiết.
   subtitle   — { vi, en }: dòng phụ đề ngắn dưới tiêu đề.
   desc       — { vi, en }: đoạn mô tả dài, hiển thị ở phần "About".
   tools      — mảng string: các phần mềm/công nghệ dùng cho dự án,
                hiển thị dạng tag, KHÔNG cần dịch (Photoshop vẫn là
                Photoshop dù ở ngôn ngữ nào).
   slides     — mảng các "trang" trong gallery lớn của trang chi tiết,
                render theo đúng thứ tự khai báo. Mỗi phần tử có dạng:
                  { type: 'image', src: '...' }
                  { type: 'video', src: '...', poster: '...' }
                  { type: 'model', src: '....glb', poster: '...' }
                'src' của video/model nên dùng đường dẫn tương đối kiểu
                '../../assets/...' (tính từ project/<slug>/index.html).
   ========================================================================== */

const PROJECTS_3D = {

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
    styleTags: ['Character Design', 'Hard-Surface', 'Sci-Fi'],
    // team: { vi: 'Dự án nhóm — Đóng góp: modeling & texturing nhân vật chính.', en: 'Team project — Contribution: main character modeling & texturing.' },
    slides: [
      { type: 'video', src: '../../../assets/videos/showreel.mp4', poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1400&auto=format&fit=crop' },
      { type: 'model', src: '../../../assets/models/crusader.glb', poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1633966887768-64f9a867bdba?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?q=80&w=1400&auto=format&fit=crop' },
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
    styleTags: ['Cel-look Anime', 'Short Film', 'Action'],
    // team: { vi: 'Dự án nhóm — Đóng góp: Storyboard & Layout Artist.', en: 'Team project — Contribution: Storyboard & Layout Artist.' }, // bỏ comment nếu đây là đồ án nhóm
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=1400&auto=format&fit=crop' },
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
      { type: 'model', src: '../../assets/models/web3d-placeholder.glb', poster: 'https://images.unsplash.com/photo-1633966887768-64f9a867bdba?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

};