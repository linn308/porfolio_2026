/* ==========================================================================
   data-2d.js — Dữ liệu chi tiết các dự án 2D (dùng cho trang chi tiết dự án).
   Đây là 1 trong 2 nửa của "data.js" cũ, tách riêng theo yêu cầu để dễ quản
   lý hơn khi số lượng dự án tăng lên — nửa kia là data-3d.js (dự án 3D).

   script.js sẽ tự GỘP PROJECTS_2D + PROJECTS_3D thành 1 object PROJECTS
   duy nhất (xem đầu file script.js), nên phần còn lại của code KHÔNG cần
   biết dữ liệu đến từ 1 hay 2 file — cứ dùng PROJECTS[id] như bình thường.

   Thêm dự án 2D mới: thêm 1 object vào PROJECTS_2D, key trùng với
   data-id trên thẻ .card__media tương ứng trong project/2d/index-2d.html.
   Xem phần "GIẢI THÍCH CÁC TRƯỜNG DỮ LIỆU" ở cuối file này.
   ========================================================================== */

const PROJECTS_2D = {

  ghibli: {
    title: 'Ghibli - Custom Cards',
    category: { vi: 'Illustration', en: 'Illustration' },
    subtitle: {
      vi: 'Flat Illustration',
      en: 'Flat Illustration',
    },
    desc: {
      vi: 'Bộ bài tây lấy cảm hứng từ thế giới hoạt hình Studio Ghibli — minh họa dựng trong Illustrator, mỗi lá bài là 1 khung cảnh riêng.',
      en: 'A tarot/playing card deck inspired by the animated worlds of Studio Ghibli — illustrated in Illustrator, each card its own scene.',
    },
    tools: ['Illustrator'],
    slides: [
      { type: 'image', src: '../../assets/2d/ghibli/poster.webp' },
      { type: 'image', src: '../../assets/2d/ghibli/1.webp' },
      { type: 'image', src: '../../assets/2d/ghibli/2.webp' },
      { type: 'image', src: '../../assets/2d/ghibli/3.webp' },
      { type: 'image', src: '../../assets/2d/ghibli/4.webp' },
      { type: 'image', src: '../../assets/2d/ghibli/5.webp' },
      { type: 'image', src: '../../assets/2d/ghibli/6.webp' },

    ],
  },

  collageart: {
    title: 'Collage Art - Poster',
    category: { vi: 'Poster', en: 'Poster' },
    subtitle: { vi: 'Poster Design', en: 'Poster Design' },
    desc: {
      vi: 'Bức tranh cắt dán nghệ thuật - sử dụng các kỹ thuật cắt và ghép đa chất liệu để tạo thành một bản thể phức tạp. Mang lại một góc nhìn đa diện và ẩn dụ về sự hình thành danh tính trong thời đại hình ảnh số.',
      en: 'An artistic collage—utilizing multi-material cutting and assembly techniques to create a complex entity—offering a multifaceted, metaphorical perspective on identity formation in the age of digital imagery.',
    },
    tools: ['Photoshop'],
    slides: [
      { type: 'image', src: '../../assets/2d/Collage Art/01.webp' },
    ],
  },

  TYYM: {
    title: 'The Yin-Yang Master — Movie Poster',
    category: { vi: 'Poster', en: 'Poster' },
    subtitle: { vi: 'Poster Điện ảnh', en: 'Movie Poster' },
    desc: {
      vi: 'Poster phim điện ảnh "Âm Dương Sư: Tình Nhã Tập" - nổi bật với bố cục nhân vật xếp lớp mang đậm phong cách thẩm mỹ kỳ ảo phương Đông; tác phẩm sử dụng bảng màu trầm tối làm chủ đạo, điểm xuyết sắc vàng nhằm khơi gợi bầu không khí vừa huyền bí vừa kịch tính của thế giới Âm Dương Sư.',
      en: 'The movie poster for "The Yin-Yang Master: Dream of Eternity" - features a layered character composition steeped in Eastern fantasy aesthetics, utilizing a palette of deep, dark tones accented with gold to evoke the mysterious and dramatic atmosphere of the Yin-Yang Master world.',
    },
    tools: ['Photoshop'],
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

};

/* ==========================================================================
   GIẢI THÍCH CÁC TRƯỜNG DỮ LIỆU (áp dụng cho cả data-2d.js và data-3d.js)
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