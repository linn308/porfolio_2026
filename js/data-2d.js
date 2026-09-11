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
   year       — (tùy chọn) năm thực hiện dự án, string thường (VD: '2026'),
                KHÔNG cần { vi, en } vì số năm giống nhau ở 2 ngôn ngữ.
                Hiện cạnh category ở panel thông tin trang chi tiết. Chưa
                khai báo thì tự hiện tạm "[YYYY]" làm placeholder — xem
                initProjectDetail() trong js/script.js.
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
   relatedBlocks — (tùy chọn) mảng các khối "dự án liên quan" hiện bên
                dưới phần "About", THỨ TỰ và SỐ LƯỢNG trong mảng chính là
                thứ tự/số lượng hiện ra trên trang — không cần sửa gì ở
                HTML dù muốn đảo vị trí hay lặp nhiều khối. Mỗi phần tử:
                  { type: 'cards' | 'loop', title: {vi,en} (tùy chọn), items: [...] }
                - type: 'loop'  → dải card cuộn ngang liên tục, giống
                  .showcase ở trang chủ. Card CÓ hiện chú thích nếu
                  item.title có khai báo.
                - type: 'cards' → lưới card dùng chung layout .gallery
                  (masonry) với index-2d.html/index-3d.html. Card KHÔNG
                  hiện chữ, chỉ đúng phần ảnh/video/model. Item hỗ trợ
                  thêm field `large: true` để card đó tràn hết chiều rộng
                  khối (column-span: all), to hẳn các card còn lại — xem
                  .gallery .card--large trong style.css.
                Mỗi item trong `items` của cả 2 loại: { title: '...',
                img: '...' } (ảnh tĩnh) hoặc { title: '...', media: {
                type, src, poster } } nếu là video/model — xem
                getItemMedia() trong js/script.js.
                VÍ DỤ kiểu "Cards → Loop → Cards":
                  relatedBlocks: [
                    { type: 'cards', items: [ ... ] },
                    { type: 'loop',  title: {vi:'...', en:'...'}, items: [ ... ] },
                    { type: 'cards', items: [ ... ] },
                  ]
                Không khai báo relatedBlocks thì tự dựng lại từ 2 field cũ
                bên dưới (thứ tự Cards → Loop), giữ tương thích ngược:
   relatedLoop — (tùy chọn, CÁCH KHAI BÁO CŨ) { title: {vi,en}, items: [...] }.
   relatedCards — (tùy chọn, CÁCH KHAI BÁO CŨ) { title: {vi,en}, items: [...] }.
   ========================================================================== */

const PROJECTS_2D = {

  ghibli: {
      title: 'Ghibli - Custom Cards',
      // cover: { type: 'image', src: '../../assets/2d/ghibli/poster.webp' },
      year:'2020',
      category: { vi: 'Illustration', en: 'Illustration' },
      subtitle: {
        vi: 'Flat Illustration',
        en: 'Flat Illustration',
      },
      desc: {
        vi: 'Bộ bài Tây minh họa lấy cảm hứng từ thế giới hoạt hình huyền diệu của Studio Ghibli. Thiết kế kết hợp giữa phong cách minh họa phẳng hiện đại, nét vẽ tối giản và bảng màu cổ điển mộc mạc, tái hiện sinh động các nhân vật kinh điển như Chihiro, Haku, Howl, Sophie trên từng lá bài.',
        en: 'A custom playing card deck inspired by the magical world of Studio Ghibli. The design blends modern flat vector illustrations with a warm vintage color palette, bringing iconic characters like Chihiro, Haku, Howl, and Sophie to life across classic card suits',
      },
      tools: ['Illustrator'],
      styleTags: ['Flat Illustration', 'Character Design', 'Vector Art', 'Creative Project', 'Retro Aesthetic'],
      // team: { vi: 'Dự án nhóm — Đóng góp: toàn bộ minh họa & layout bộ bài.', en: 'Team project — Contribution: all illustrations & deck layout.' }, // bỏ comment nếu là dự án nhóm
      relatedLoop: {
      // title: { vi: 'Có thể bạn sẽ thích', en: 'You might also like' },
      items: [
        { title: 'image', img: '../../assets/2d/ghibli/1.webp' },
        { title: 'image', img: '../../assets/2d/ghibli/2.webp' },
        { title: 'image', img: '../../assets/2d/ghibli/3.webp' },
        { title: 'image', img: '../../assets/2d/ghibli/4.webp' },
        { title: 'image', img: '../../assets/2d/ghibli/5.webp' },
        { title: 'image', img: '../../assets/2d/ghibli/6.webp' },
      ],
    },
      slides: [
        { type: 'image', src: '../../assets/2d/ghibli/poster.webp' },
        

      ],
    },
  CA: {
    title: 'Collage Art - Poster',
    year:'2021',
    category: { vi: 'Poster', en: 'Poster' },
    subtitle: { vi: 'Poster Design', en: 'Poster Design' },
    desc: {
      vi: 'Bức tranh cắt dán nghệ thuật - sử dụng các kỹ thuật cắt và ghép đa chất liệu để tạo thành một bản thể phức tạp. Mang lại một góc nhìn đa diện và ẩn dụ về sự hình thành danh tính trong thời đại hình ảnh số.',
      en: 'An artistic collage—utilizing multi-material cutting and assembly techniques to create a complex entity—offering a multifaceted, metaphorical perspective on identity formation in the age of digital imagery.',
    },
    tools: ['Photoshop'],
    styleTags: ['Collage Art','Poster Design','VisualArt' ,'Mixed Media', 'Digital Art'],
    slides: [
      { type: 'image', src: '../../assets/2d/CA/00.webp' },
    ],
  },

  TYYM: {
    title: 'The Yin-Yang Master — Movie Poster',
    year: '2021',
    cover: { type: 'image', src: '../../assets/2d/TYYM/00.webp' },
    category: { vi: 'Poster', en: 'Poster' },
    subtitle: { vi: 'Poster Điện ảnh', en: 'Movie Poster Design' },
    desc: {
      vi: 'Poster phim điện ảnh "Âm Dương Sư: Tình Nhã Tập" - nổi bật với bố cục nhân vật xếp lớp mang đậm phong cách thẩm mỹ kỳ ảo phương Đông; tác phẩm sử dụng bảng màu trầm tối làm chủ đạo, điểm xuyết sắc vàng nhằm khơi gợi bầu không khí vừa huyền bí vừa kịch tính của thế giới Âm Dương Sư.',
      en: 'The movie poster for "The Yin-Yang Master: Dream of Eternity" - features a layered character composition steeped in Eastern fantasy aesthetics, utilizing a palette of deep, dark tones accented with gold to evoke the mysterious and dramatic atmosphere of the Yin-Yang Master world.',
    },
    tools: ['Photoshop'],
    styleTags: ['Movie Poster', 'Poster Design', 'Key Visual', 'Fantasy Art', 'Character Poster'],
    slides: [
      { type: 'image', src: '../../assets/2d/TYYM/01.webp' },
    ],
  },

  LB: {
    title: 'Local Brands - Magazine Layout',
    year: '2021',
    cover: { type: 'image', src: '../../assets/2d/LB/001.webp' },
    category: { vi: 'Editorial', en: 'Editorial' },
    subtitle: { vi: 'Editorial Design', en: 'Editorial Design' },
    desc: {
      vi: 'Thiết kế chú trọng vào hệ thống lưới (grid layout) hiện đại, typography phá cách cùng nhịp điệu hình ảnh phóng khoáng để bắt trọn tinh thần thời trang đường phố của giới trẻ.',
      en: 'The design emphasizes a modern grid layout, unconventional typography, and a dynamic visual rhythm to capture the spirit of youth street fashion.',
    },
    tools: ['Indesign', 'Photoshop'],
        styleTags: ['Typography', 'Fashion Magazine','Minimalist' , 'Modern', 'Grid System'],
    team: {
      vi: { label: 'Đóng góp', text: 'Lên ý tưởng concept & Dàn trang chính.' },
      en: { label: 'Contribution', text: 'Concept Idealisation & Main Editorial Layout Designer.' },
    },
      relatedBlocks:[
        {type: 'loop', 
          items: [  { title: 'image', img: '../../assets/2d/LB/02.webp' },
                    { title: 'image', img: '../../assets/2d/LB/03.webp' },
                    { title: 'image', img: '../../assets/2d/LB/04.webp' },
                    { title: 'image', img: '../../assets/2d/LB/05.webp' },
                    { title: 'image', img: '../../assets/2d/LB/06.webp' },
                    { title: 'image', img: '../../assets/2d/LB/07.webp' },
                    { title: 'image', img: '../../assets/2d/LB/08.webp' },
                    { title: 'image', img: '../../assets/2d/LB/09.webp' },
          ],
        },
        {type: 'cards', 
          items: [  { title: 'image', img: '../../assets/2d/LB/10.webp' },
                    { title: 'image', img: '../../assets/2d/LB/11.webp' },
                    { title: 'image', img: '../../assets/2d/LB/12.webp' },
                    { title: 'image', img: '../../assets/2d/LB/13.webp' },
                    { title: 'image', img: '../../assets/2d/LB/14.webp' },
                    { title: 'image', img: '../../assets/2d/LB/15.webp' },
                    { title: 'image', img: '../../assets/2d/LB/16.webp' },
                    { title: 'image', img: '../../assets/2d/LB/17.webp' },
                    { title: 'image', img: '../../assets/2d/LB/18.webp' },
          ],
        },
      ],
      slides: [      
      { type: 'image', src: '../../assets/2d/LB/002.webp',},
      ],
  },

  elle: {
    title: 'Elle - Magazine Layout',
    cover: { type: 'img', src: '../../assets/2d/elle/000.webp'},
    year: '2022',
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
      { type: 'image', src: '../../assets/2d/elle/01.webp' },
      { type: 'image', src: '../../assets/2d/elle/02.webp' },
      { type: 'image', src: '../../assets/2d/elle/03.webp' },
      { type: 'image', src: '../../assets/2d/elle/001.webp', large:'true' },
    ],
  },

  TC: {
    title: 'Tech Crunch - Specialized Magazine',
    year: '2022',
    category: { vi: 'Editorial', en: 'Editorial' },
    subtitle: { vi: 'Editorial Design', en: 'Editorial Design' },
    desc: {
      vi: 'Thiết kế tập trung vào việc xử lý bố cục mạng lưới linh hoạt, kết hợp bảng màu "Earth Tones" để truyền tải trọn vẹn câu chuyện từ canh tác, chế biến đến công nghệ pha chế hiện đại.',
      en: 'The design focuses on a flexible grid system, incorporating an "Earth Tones" palette (natural brown, beige, and black) to convey a narrative that bridges traditional cultivation with modern technological transformation.',
    },
    tools: ['Indesign', 'Photoshop'],
        styleTags: ['Technical Minimalist', 'Earthy','Special Subject Magazine Design' , 'Print Design', 'Editorial Concept Design'],
    slides: [
      { type: 'image', src: '../../assets/2d/TC/00.webp' },
      { type: 'image', src: '../../assets/2d/TC/01.webp' },
      { type: 'image', src: '../../assets/2d/TC/02.webp' },
      { type: 'image', src: '../../assets/2d/TC/03.webp' },
    ],
  },

  wired: {
    title: 'Wired - Tech Magazine Cover',
    year: '2022',
    cover: { type: 'image', src: '../../assets/2d/wired/00.webp'},
    category: { vi: 'Editorial', en: 'Editorial' },
    subtitle: { vi: 'Editorial Design', en: 'Editorial Design' },
    desc: {
      vi: 'Concept thiết kế bìa và dàn trang cho tạp chí WIRED với chủ đề "Việt Nam trong cuộc đua Metaverse". Ấn phẩm ứng dụng phong cách thiết kế tương lai kết hợp dải màu Neon, hiệu ứng wireframe 3D và bố cục mạng lưới hiện đại để phản ánh trọn vẹn tinh thần công nghệ số vượt giới hạn.',
      en: 'Cover design and layout concept for WIRED magazine, themed "Vietnam in the Metaverse Race." The publication employs a futuristic design style—combining neon color palettes, 3D wireframe effects, and a modern grid layout—to fully capture the spirit of boundary-pushing digital technology.',
    },
    tools: ['Indesign', 'Photoshop'],
        styleTags: ['Cyberpunk Aesthetic', 'Futuristic','Virtual Reality' , 'Tech Magazine', 'Metaverse'],
    slides: [
      
      { type: 'image', src: '../../assets/2d/wired/01.webp' },
      { type: 'image', src: '../../assets/2d/wired/02.webp', large: true  },
      { type: 'image', src: '../../assets/2d/wired/03.webp' },
    ],
  },

  TT: {
    title: 'TirTir - E-commerce Graphic Design',
    year: '2026',
    category: { vi: 'E-commerce', en: 'E-commerce' },
    subtitle: { vi: 'Editorial Design', en: 'Editorial Design' },
    desc: {
      vi: 'Dự án tập trung vào kỹ thuật tách ghép sản phẩm , phối hợp linh hoạt giữa hai phong cách: nổi bật, năng động thu hút khuyến mãi và tinh tế, mộc mạc nhấn mạnh công dụng thành phần.',
      en: 'The project highlights advanced product composition and photo manipulation, balancing two distinct visual approaches: an eye-catching, high-contrast promotional style for sales events and a clean, luxury aesthetic showcasing key ingredients and benefits.',
    },
    tools: ['Photoshop'],
        styleTags: ['Commercial E-Commerce Banners', 'Social Media Ads','Cosmetics Marketing' , 'Advertising Design', 'Product Manipulation'],
    slides: [
      // { type: 'image', src: '../../assets/2d/TT/00.webp' },
      { type: 'image', src: '../../assets/2d/TT/01.webp' },
      { type: 'image', src: '../../assets/2d/TT/02.webp' },
    ],
  },


  SSS: {
    title: 'ShaiShaiShai - E-commerce Graphic Design',
    cover: { type: 'image', src: '../../assets/2d/SSS/000.webp' },
    year: '2026',
    category: { vi: 'E-commerce', en: 'E-commerce' },
    subtitle: { vi: 'Editorial Design', en: 'Editorial Design' },
    desc: {
      vi: 'Dự án tập trung vào kỹ thuật tách ghép sản phẩm , phối hợp linh hoạt giữa hai phong cách: nổi bật, năng động thu hút khuyến mãi và tinh tế, mộc mạc nhấn mạnh công dụng thành phần.',
      en: 'The project highlights advanced product composition and photo manipulation, balancing two distinct visual approaches: an eye-catching, high-contrast promotional style for sales events and a clean, luxury aesthetic showcasing key ingredients and benefits.',
    },
    tools: ['Illustrator', 'Photoshop', 'After Effects', 'Capcut'],
        styleTags: ['Commercial E-Commerce Banners', 'Social Media Ads','Cosmetics Marketing' , 'Advertising Design', 'Product Manipulation'],
    relatedCards: {
      title: { vi: 'Dự án liên quan', en: 'Related Projects' },
      items: [
        { title: 'video', mov: '../../assets/2d/SSS/01.mp4', poster: '../../assets/2d/SSS/001.webp' },
        { title: 'image', img: '../../assets/2d/SSS/01.webp' },
        { title: 'image', img: '../../assets/2d/SSS/02.webp' },
        { title: 'image', img: '../../assets/2d/SSS/02.mp4', poster: '../../assets/2d/SSS/002.webp' },
      ],
    },    
    slides: [
      { type: 'video', src: '../../assets/2d/SSS/01.mp4', poster: '../../assets/2d/SSS/001.webp' },
      { type: 'image', src: '../../assets/2d/SSS/01.webp' },
      { type: 'image', src: '../../assets/2d/SSS/02.webp' },
      { type: 'video', src: '../../assets/2d/SSS/02.mp4', poster: '../../assets/2d/SSS/002.webp' },
    ],
  },


};