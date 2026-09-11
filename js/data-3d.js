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
   cover      — thumbnail/ video/ model ở trên cùng 
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

                Riêng type: 'model' còn có thể khai NHIỀU BIẾN THỂ (variants)
                cho cùng 1 model — VD bản có texture / bản wireframe / bản
                clay — để hiện nút bấm đổi qua lại ngay trên khung model:
                  {
                    type: 'model',
                    variants: [
                      { label: { vi: 'Có texture', en: 'Textured' }, src: '....glb' },
                      { label: { vi: 'Wireframe',  en: 'Wireframe' }, src: '....glb' },
                      { label: { vi: 'Không texture', en: 'Clay' },  src: '....glb' },
                    ],
                    poster: '...', // tuỳ chọn, dùng chung cho mọi biến thể
                  }
                LƯU Ý: đây PHẢI là các FILE .glb RIÊNG BIỆT tự export sẵn từ
                Maya/Blender/ZBrush (mỗi file gán material khác nhau) — 1
                file .glb duy nhất KHÔNG thể tự bật/tắt wireframe hay
                texture được. Không khai "variants" thì dùng "src" như cũ,
                2 kiểu khai báo dùng chung được, không xung đột.
                Dùng y hệt cú pháp trên cho project.cover khi cover cũng là
                model muốn có nhiều biến thể.
   relatedLoop/ 
   relatedCards
              — items : :[
              { title: ...},]
   ========================================================================== */

const PROJECTS_3D = {

  // TEST GLB FILE
    test: {
    title: 'Local Brands - Magazine Layout',
    year: '2021',
    cover: { type: 'model', src: '../../source-files/3d/glb/Kord_lo_01.glb' },
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
      // relatedBlocks:[
      //   {type: 'loop', 
      //     items: [  { title: 'image', img: '../../assets/2d/LB/02.webp' },
      //     ],
      //   },
      //   {type: 'cards', 
      //     items: [  { title: 'image', img: '../../assets/2d/LB/10.webp' },
      //     ],
      //   },
      // ],
      // slides: [      
      // { type: 'image', src: '../../assets/2d/LB/002.webp',},
      // ],
  },

  // CRUSADER chưa có page, chưa content..
  crusader: {
    title: 'CRUSADER',
    // Bắt buộc khai báo cover mới có thumbnail/video hiện ở trên cùng —
    // không còn tự lấy slides[0] như trước. src trùng với slide video bên
    // dưới nên slide đó tự bị bỏ khỏi gallery, không lặp lại.
    cover: { type: 'video', src: '../../../assets/videos/showreel.mp4', poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1400&auto=format&fit=crop' },
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
      { type: 'model', src: '../../assets/3d/box/1.glb' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?q=80&w=1400&auto=format&fit=crop' },
    ],
  },

  waterhydrant: {
    title: 'Water Hydrant — Modeling',
    // Bắt buộc khai báo cover mới có thumbnail/video hiện ở trên cùng —
    // không còn tự lấy slides[0] như trước. src trùng với slide video bên
    // dưới nên slide đó tự bị bỏ khỏi gallery, không lặp lại.
    cover: { type: 'model', src: '../../assets/3d/WH/00.glb'},
    category: { vi: 'Model', en: 'Model' },
    subtitle: {
      vi: '3D Game Design — Đồ án xuất sắc',
      en: '3D Game Design — Excellent Project',
    },
    desc: {
      vi: 'Đồ án 3D Game Design đạt loại xuất sắc. Modeling và texturing nhân vật/prop trong Maya và ZBrush, hoàn thiện chi tiết bề mặt và render preview trong Photoshop. Bộ ảnh dưới đây gồm góc quay turntable, chi tiết wireframe và bản render final.',
      en: 'A 3D Game Design project graded excellent. Character/prop modeling and texturing done in Maya and ZBrush, with surface detail and preview renders finished in Photoshop. The set below includes turntable angles, wireframe close-ups and the final render.',
    },
    tools: ['Maya'],
    styleTags: ['Character Design', 'Hard-Surface', 'Sci-Fi'],
    // team: { vi: 'Dự án nhóm — Đóng góp: modeling & texturing nhân vật chính.', en: 'Team project — Contribution: main character modeling & texturing.' },
    slides: [
      { type: 'model', src: '../../assets/3d/WH/00.glb' },
    ],
  },

  box: {
    title: 'Water Hydrant — Modeling',
    cover: { type: 'model', src: '../../assets/3d/box/00.glb'},
    category: { vi: 'Model', en: 'Model' },
    subtitle: {
      vi: '3D Game Design — Đồ án xuất sắc',
      en: '3D Game Design — Excellent Project',
    },
    desc: {
      vi: 'Đồ án 3D Game Design đạt loại xuất sắc. Modeling và texturing nhân vật/prop trong Maya và ZBrush, hoàn thiện chi tiết bề mặt và render preview trong Photoshop. Bộ ảnh dưới đây gồm góc quay turntable, chi tiết wireframe và bản render final.',
      en: 'A 3D Game Design project graded excellent. Character/prop modeling and texturing done in Maya and ZBrush, with surface detail and preview renders finished in Photoshop. The set below includes turntable angles, wireframe close-ups and the final render.',
    },
    tools: ['Maya'],
    styleTags: ['Character Design', 'Hard-Surface', 'Sci-Fi'],
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


  'pixivore': {
    title: 'Pixivore',
    cover: {type: 'img', src:'../../assets/3d/pixivore/001.webp'},
    year: '2022',
    category: { vi: 'Modeling', en: 'Modeling' },
    subtitle: {
      vi: 'Pixivore - Modeling',
      en: 'Pixivore - Modeling',
    },
    desc: {
      vi: 'Phim ngắn 3D phong cách Cel-look Anime, đạt loại xuất sắc. Đảm nhận Storyboard và Layout Artist, dàn dựng bố cục khung hình và nhịp kể chuyện cho toàn bộ short film. Bộ ảnh gồm storyboard, frame layout và still cuối phim.',
      en: 'A Cel-look Anime style 3D short film, graded excellent. Worked as Storyboard and Layout Artist, shaping the frame composition and pacing across the whole short film. The set includes storyboard frames, layout shots and final film stills.',
    },
    tools: ['Maya', 'Subtance Painter', 'Marmoset'],
    styleTags: ['Cel-look Anime', 'Short Film', 'Action'],
    relatedCards: {
      items: [
        { title: 'video', media: { type: 'video', src : '../../assets/3d/pixivore/00.mp4'}, large: true},
        { title: 'image', img: '../../assets/3d/pixivore/01.webp' },
        { title: 'image', img: '../../assets/3d/pixivore/02.webp' },
        { title: 'image', img: '../../assets/3d/pixivore/03.webp' },
        { title: 'image', img: '../../assets/3d/pixivore/04.webp' },
      ],
    },  
    slides: [
      { type: 'model', src: '../../assets/3d/pixivore/00.glb', large: 'true' },
    ],

  },
};