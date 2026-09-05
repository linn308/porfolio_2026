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
    styleTags: ['Flat Illustration', 'Character Design', 'Card'],
    // team: { vi: 'Dự án nhóm — Đóng góp: toàn bộ minh họa & layout bộ bài.', en: 'Team project — Contribution: all illustrations & deck layout.' }, // bỏ comment nếu là dự án nhóm
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

  CA: {
    title: 'Collage Art - Poster',
    category: { vi: 'Poster', en: 'Poster' },
    subtitle: { vi: 'Poster Design', en: 'Poster Design' },
    desc: {
      vi: 'Bức tranh cắt dán nghệ thuật - sử dụng các kỹ thuật cắt và ghép đa chất liệu để tạo thành một bản thể phức tạp. Mang lại một góc nhìn đa diện và ẩn dụ về sự hình thành danh tính trong thời đại hình ảnh số.',
      en: 'An artistic collage—utilizing multi-material cutting and assembly techniques to create a complex entity—offering a multifaceted, metaphorical perspective on identity formation in the age of digital imagery.',
    },
    tools: ['Photoshop'],
    styleTags: ['Collage Art','Poster Design','VisualArt' ,'Mixed Media', 'Digital Art'],
    slides: [
      { type: 'image', src: '../../assets/2d/CA/01.webp' },
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
    styleTags: ['Movie Poster', 'Poster Design', 'Key Visual', 'Fantasy Art', 'Character Poster'],
    slides: [
      { type: 'image', src: '../../assets/2d/TYYM/00.webp' },
      { type: 'image', src: '../../assets/2d/TYYM/01.webp' },
    ],
  },

  LB: {
    title: 'Local Brands - Magazine Layout',
    category: { vi: 'Editorial', en: 'Editorial' },
    subtitle: { vi: 'Editorial Design', en: 'Editorial Design' },
    desc: {
      vi: 'Thiết kế chú trọng vào hệ thống lưới (grid layout) hiện đại, typography phá cách cùng nhịp điệu hình ảnh phóng khoáng để bắt trọn tinh thần thời trang đường phố của giới trẻ.',
      en: 'The design emphasizes a modern grid layout, unconventional typography, and a dynamic visual rhythm to capture the spirit of youth street fashion.',
    },
    tools: ['Indesign', 'Photoshop'],
        styleTags: ['Typography', 'Fashion Magazine','Minimalist' , 'Modern', 'Grid System'],
    team: { 
      vi: 'Đóng góp: Lên ý tưởng concept & Dàn trang chính.', 
      en: 'Contribution: Concept Idealisation & Main Editorial Layout Designer.' },
    slides: [
      { type: 'image', src: '../../assets/2d/LB/000.webp' },
      { type: 'image', src: '../../assets/2d/LB/001.webp' },
      { type: 'image', src: '../../assets/2d/LB/002.webp' },
      { type: 'image', src: '../../assets/2d/LB/02.webp' },
      { type: 'image', src: '../../assets/2d/LB/03.webp' },
      { type: 'image', src: '../../assets/2d/LB/04.webp' },
      { type: 'image', src: '../../assets/2d/LB/05.webp' },
      { type: 'image', src: '../../assets/2d/LB/06.webp' },
      { type: 'image', src: '../../assets/2d/LB/07.webp' },
      { type: 'image', src: '../../assets/2d/LB/08.webp' },
      { type: 'image', src: '../../assets/2d/LB/09.webp' },
      { type: 'image', src: '../../assets/2d/LB/10.webp' },
      { type: 'image', src: '../../assets/2d/LB/11.webp' },
      { type: 'image', src: '../../assets/2d/LB/12.webp' },
      { type: 'image', src: '../../assets/2d/LB/13.webp' },
      { type: 'image', src: '../../assets/2d/LB/14.webp' },
      { type: 'image', src: '../../assets/2d/LB/15.webp' },
      { type: 'image', src: '../../assets/2d/LB/16.webp' },
      { type: 'image', src: '../../assets/2d/LB/17.webp' },
      { type: 'image', src: '../../assets/2d/LB/18.webp' },
    ],
  },

  elle: {
    title: 'Elle - Magazine Layout',
    category: { vi: 'Editorial', en: 'Editorial' },
    subtitle: { vi: 'Magazine Cover', en: 'Magazine Cover' },
    desc: {
      vi: 'lấy cảm hứng từ Nghệ sĩ Suboi và album "No Nê". Ý tưởng tập trung vào việc kết hợp ngôn ngữ thời trang cao cấp với tư duy typography hiện đại, tạo nên một ấn phẩm đậm tính nghệ thuật và cá tính thương hiệu.',
      en: 'Inspired by the artist Suboi and her album "No Nê", the concept focuses on blending the language of high fashion with modern typographic sensibilities to create a publication rich in artistic flair and brand personality.',
    },
    tools: ['Indesign', 'Photoshop'],
        styleTags: ['Modern Editorial', 'Pop Culture','Fashion Magazine' , 'Magazine Cover', 'Editorial Concept Design'],
    slides: [
      { type: 'image', src: '../../assets/2d/elle/000.webp' },
      { type: 'image', src: '../../assets/2d/elle/001.webp' },
      { type: 'image', src: '../../assets/2d/elle/002.webp' },
    ],
  },

  coffee: {
    title: 'Coffee - Specialized Magazine',
    category: { vi: 'Editorial', en: 'Editorial' },
    subtitle: { vi: 'Editorial Design', en: 'Editorial Design' },
    desc: {
      vi: 'Thiết kế tập trung vào việc xử lý bố cục mạng lưới linh hoạt, kết hợp bảng màu "Earth Tones" để truyền tải trọn vẹn câu chuyện từ canh tác, chế biến đến công nghệ pha chế hiện đại.',
      en: 'The design focuses on a flexible grid system, incorporating an "Earth Tones" palette (natural brown, beige, and black) to convey a narrative that bridges traditional cultivation with modern technological transformation.',
    },
    tools: ['Indesign', 'Photoshop'],
        styleTags: ['Technical Minimalist', 'Earthy','Special Subject Magazine Design' , 'Print Design', 'Editorial Concept Design'],
    slides: [
      { type: 'image', src: '../../assets/2d/coffee/00.webp' },
      { type: 'image', src: '../../assets/2d/coffee/01.webp' },
      { type: 'image', src: '../../assets/2d/coffee/02.webp' },
    ],
  },


  
};

