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
    cover: { type: 'model', src: '../../source-files/3d/pixivore/02.glb' },
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

  crusader: {
    title: 'CRUSADER',
    year: '2023',
    // Bắt buộc khai báo cover mới có thumbnail/video hiện ở trên cùng —
    // không còn tự lấy slides[0] như trước. src trùng với slide video bên
    // dưới nên slide đó tự bị bỏ khỏi gallery, không lặp lại.
    cover: { type: 'video', src: '../../assets/3d/crusader/000.mp4', poster: '../../assets/3d/crusader/001.webp' },
    category: { vi: 'Model', en: 'Model' },
    subtitle: {
      vi: '3D Game Design — Đồ án xuất sắc',
      en: '3D Game Design — Excellent Project',
    },
    desc: {
      vi: 'Đồ án 3D Game Design đạt loại xuất sắc. Modeling và texturing nhân vật/prop trong Maya và ZBrush, hoàn thiện chi tiết bề mặt và render preview trong Photoshop. Bộ ảnh dưới đây gồm góc quay turntable, chi tiết wireframe và bản render final.',
      en: 'A 3D Game Design project graded excellent. Character/prop modeling and texturing done in Maya and ZBrush, with surface detail and preview renders finished in Photoshop. The set below includes turntable angles, wireframe close-ups and the final render.',
    },
    tools: ['Maya', 'ZBrush', 'Substance Painter', 'Unreal', 'Marmoset'],
    styleTags: ['3D Game Design', 'Fantasy', 'Character Design', 'Stylized 3D', 'Game Art'],
    // Link đến đúng project này trên Behance (hoặc Sketchfab/ArtStation/demo
    // online...) — có khai báo (chuỗi URL) thì nút "Xem project khác" ở cuối
    // bài tự hiện, xoá dòng này (hoặc để '') thì nút tự ẩn. Thay URL bên
    // dưới bằng link Behance thật của project CRUSADER.
    externalLink: 'https://www.behance.net/gallery/181567735/3D-Game-Design-CRUSADER',
    team: {
      vi: { label: 'Đóng góp', 
            text: ['Tham gia phát triển ý tưởng và visual direction, đồng thời phụ trách chính việc thiết kế và hoàn thiện nhân vật Kord từ sketch, modeling đến hoàn thiện màu sắc. ',
                  'Hỗ trợ một số công đoạn modeling và coloring cho các asset khác của project.'] },
      en: { label: 'Contribution', 
            text: ['Participated in concept development and visual direction, while taking the lead on designing and finalizing the character "Kord"—handling everything from initial sketches and modeling to final coloring.',
                  'Assisted with modeling and coloring tasks for other project assets.']},
    },
    //   slides: [
    //   { type: 'image', src: '../../assets/3d/crusader/0100.png' },
    // ],
    relatedBlocks:[
      { title: { vi: 'Kord — Character Design & 3D Modeling', en: 'Kord — Character Design & 3D Modeling' },
        type: 'cards', 
        items: [{ media: {type: 'model', src: '../../assets/3d/crusader/010.glb', poster:'../../assets/3d/crusader/0111.png'}, large: true },
                { media: {type: 'image', src: '../../assets/3d/crusader/0111.png' }},
                { media: {type: 'image', src: '../../assets/3d/crusader/0112.png' }},
                { media: {type: 'image', src: '../../assets/3d/crusader/0113.png' }},
                { media: {type: 'image', src: '../../assets/3d/crusader/0121.png' }},
                { media: {type: 'image', src: '../../assets/3d/crusader/0122.png' }},
                { media: {type: 'image', src: '../../assets/3d/crusader/0123.png' }},
        ],
      },
      {title: { vi: 'Dây xích và hai cột trụ tạo thành hệ thống giam giữ Kord, cố định nhân vật tại vị trí trong scene.', 
                en: 'The chains and two pillars form Kord’s restraint system, keeping the character bound in place within the scene.' },
        type: 'loop', 
        items: [{ title: 'image', img: '../../assets/3d/crusader/021.png' },
                { title: 'image', img: '../../assets/3d/crusader/022.png' },
                { title: 'image', img: '../../assets/3d/crusader/023.png' },
                { title: 'image', img: '../../assets/3d/crusader/031.png' },
                { title: 'image', img: '../../assets/3d/crusader/032.png' },
                { title: 'image', img: '../../assets/3d/crusader/033.png' },
        ],
      },
    ],

  },

  waterhydrant: {
    title: 'Water Hydrant',
    year: '2022',
    category: { vi: 'Model', en: 'Model' },
    subtitle: {
      vi: '3D Prop — Hard Surface Modeling Study',
      en: '3D Prop — Hard Surface Modeling Study',
    },
    desc: {
      vi: 'Mô phỏng 3D hai biến thể trụ nước cứu hỏa dựa trên hình ảnh tham chiếu. Thực hiện quy trình dựng hình từ Lowpoly đến Highpoly, kiểm soát lưới chặt chẽ và tối ưu hóa file OBJ sạch.',
      en: '3D model two variants of a fire hydrant based on a reference image. The process covers Lowpoly to Highpoly modeling, strict mesh control, and optimizing a clean OBJ file.',
    },
    tools: ['Maya'],
    styleTags: ['Hard Surface', 'Prop Design', 'Game Asset'],
    slides: [
      {type: 'model',
        variants: [
          { label: { vi: 'Model', en: 'Model' }, src: '../../assets/3d/WH/00.glb' },
          { label: { vi: 'Lưới',  en: 'Wireframe' }, src: '../../assets/3d/WH/01.glb' },
        ],
      }
    ],
  },

  box: {
    title: 'Sci-Fi Biohazard Storage',
    year: '2022',
    cover: { type: 'Model', 
      variants: [
          { label: { vi: 'Model', en: 'Model' }, src: '../../assets/3d/box/00.glb' },
          { label: { vi: 'Lưới',  en: 'Wireframe' }, src: '../../assets/3d/box/01.glb' },
        ],},
    category: { vi: 'Model', en: 'Model' },
    subtitle: {
      vi: '3D Prop — Hard Surface Modeling Study',
      en: '3D Prop — Hard Surface Modeling Study',
    },
    desc: {
      vi: 'Mô phỏng 3D một thùng chứa vật liệu sinh học phong cách Sci-Fi dựa trên hình ảnh tham chiếu. Tập trung vào dựng hình, kiểm soát lưới chặt chẽ và tối ưu hóa, sẵn sàng cho các pipeline game hoặc render.',
      en: 'A 3D simulation of a sci-fi-style bio-container based on reference imagery. The project focuses on modeling, precise mesh control, and optimization, making it ready for game pipelines or rendering.',
    },
    tools: ['Maya'],
    styleTags: ['Industrial', 'Hard-Surface', 'Sci-Fi', '3D Modeling'],
  },

  FFL: {
    title: 'FIGHT FOR LIFE',
    year: '2023',
    cover: { type: 'video', src: '../../assets/3d/FFL/000.mp4', poster: '../../assets/3d/FFL/001.webp' },
    category: { vi: 'Animation', en: 'Animation' },
    subtitle: {
      vi: '3D Short Film — Đồ án xuất sắc',
      en: '3D Short Film — Excellent Project',
    },
    desc: {
      vi: 'Là một phim ngắn 3D kể về hành trình sinh tồn của một chú cua cố gắng thoát khỏi bồn rửa để trở về biển. Câu chuyện khai thác chủ đề sinh tồn, hy vọng và sự bất định của số phận. Project lấy cảm hứng từ Oktapodi.',
      en: 'A 3D short film following a crab’s desperate attempt to escape a kitchen sink and return to the sea. The story explores survival, hope, and the unpredictability of fate, inspired by Oktapodi.',
    },
    tools: ['Maya', 'Substance Painter', 'Unreal', 'After Effects', 'Premiere Pro', 'Photoshop'],
    styleTags: ['3D Short Film', 'Animation', 'Storyboard', 'Stylized 3D', 'Comedic'],
    externalLink: 'https://www.behance.net/gallery/182115825/Fight-For-Life-3D-Short-Film',
    team: {
      vi: { label: 'Đóng góp', 
            text: ['Tôi giữ vai trò lead về Story & Animation, chịu trách nhiệm phát triển concept và định hướng chính cho project, xây dựng script, storyboard, layout và triển khai animation cho phim.',
                  ' Bên cạnh đó, tôi tham gia hỗ trợ 3D modeling trong quá trình sản xuất.'] },
      en: { label: 'Contribution', 
            text: ['I took the lead in Story & Animation, driving the project’s main concept and direction while developing the script, storyboard, layout, and animation for the film.',
                  'I also supported the team with 3D modeling throughout production.']},
    },
    slides: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?q=80&w=1400&auto=format&fit=crop' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=1400&auto=format&fit=crop' },
    ],
  },


  pixivore: {
    title: 'Pixivore',
    cover: {type: 'image', src:'../../assets/3d/pixivore/001.webp'},
    year: '2022',
    category: { vi: 'Modeling', en: 'Modeling' },
    subtitle: {
      vi: '3D Character - Modeling Study',
      en: '3D Character - Modeling Study',
    },
    desc: {
      vi: 'Bài tập dựng nhân vật 3D cho game, thực hiện dựa trên hình ảnh reference có sẵn trên mạng. Tôi tự phát triển model từ đầu và hoàn thiện nhân vật qua các bước 3D Modeling và Texturing, tập trung tái hiện hình dáng, chi tiết và chất liệu của nhân vật từ reference.',
      en: 'A 3D game character study recreated from an online 2D reference, with no existing 3D model provided. I built the character from scratch and completed the 3D Modeling and Texturing process, focusing on translating the character’s form, details, and materials from the reference into 3D.',
    },
    tools: ['Maya', 'Subtance Painter', 'Marmoset'],
    styleTags: ['Hard-surface', 'Semi-realistic', '3D Game Art', 'Texturing', 'Mechanical'],
    relatedCards: {
      items: [
        { title: 'video', media: { type: 'video', src : '../../assets/3d/pixivore/00.mp4'}, large: true},
       
      ],
    },  
    slides: [
      {type: 'model',
        variants: [
          { label: { vi: 'Model', en: 'Model' }, src: '../../assets/3d/pixivore/00.glb' },
          { label: { vi: 'Lưới',  en: 'Wireframe' }, src: '../../assets/3d/pixivore/01.glb' },
        ],
      }
    ],
    relatedBlocks:[
      {type: 'cards', 
        items: [  { title: 'video', media: { type: 'video', src: '../../assets/3d/pixivore/00.mp4' }, large: true },
        ],
      },
    ],
  },

  spider: {
    title: 'Spider',
    year: '2023',
    cover: { type: 'image', src: '../../assets/3d/spider/000.png'},
    category: { vi: 'Scuplt', en: 'Scuplt' },
    subtitle: {
      vi: '3D Scuplting — Dự án cá nhân',
      en: '3D Scuplting — Personal Project',
    },
    desc: {
      vi: 'Dự án cá nhân thực hiện sculpting 3D một sinh vật giáp xác mang phong cách khoa học viễn tưởng bằng ZBrush, dựa trên hình ảnh tham chiếu tổng hợp từ internet. Tác phẩm tập trung vào việc tạo hình các khối cơ bắp, vỏ giáp phân đoạn, các chi tiết sinh học phức tạp và thần thái của một sinh vật biển sâu.',
      en: 'A personal 3D sculpting project of a sci-fi crustacean creature created in ZBrush, based on online references. The piece focuses on exploring organic forms, segmented armor shells, intricate biological details, and the overall presence of a deep-sea creature.',
    },
    tools: ['ZBrush'],
    styleTags: ['ZBrush', 'Sculpting', 'Character Design', 'Sci-Fi', 'Biomechanical'],
    relatedBlocks:[
      {type: 'cards', 
        items: [{ media: {type: 'image', src: '../../assets/3d/spider/01.webp' }},
                { media: {type: 'image', src: '../../assets/3d/spider/02.webp' }},
                { media: {type: 'image', src: '../../assets/3d/spider/03.webp' }},
                { media: {type: 'image', src: '../../assets/3d/spider/04.webp' }},
                { media: {type: 'image', src: '../../assets/3d/spider/001.webp', large: true }},]
      },
    ],
  },

  mosquito: {
    title: 'Mosquito',
    year: '2023',
    cover: { type: 'image', src: '../../assets/3d/mosquito/000.png'},
    category: { vi: 'Scuplt', en: 'Scuplt' },
    subtitle: {
      vi: '3D Scuplting — Dự án cá nhân',
      en: '3D Scuplting — Personal Project',
    },
    desc: {
      vi: 'Dự án cá nhân thực hiện sculpting highpoly một sinh vật côn trùng khổng lồ (tựa muỗi) bằng ZBrush, dựa trên hình ảnh tham chiếu từ internet. Tác phẩm tập trung vào việc nghiên cứu cấu trúc giải phẫu côn trùng, các khớp chân phân đoạn và tạo hình vòi hút đặc trưng theo phong cách stylized.',
      en: 'A personal highpoly sculpting project of a giant insectoid creature (mosquito-like) created in ZBrush, based on online references. The piece focuses on studying insect anatomy, segmented leg joints, and creating a stylized proboscis.',
    },
    tools: ['ZBrush'],
    styleTags: ['ZBrush', 'Sculpting', 'Creature Design', 'Insectoid', 'Stylized'],
    relatedBlocks:[
      {type: 'cards', 
        items: [{ media: {type: 'image', src: '../../assets/3d/mosquito/01.webp' }},
                { media: {type: 'image', src: '../../assets/3d/mosquito/02.webp' }},
                { media: {type: 'image', src: '../../assets/3d/mosquito/03.webp' }},
                { media: {type: 'image', src: '../../assets/3d/mosquito/04.webp' }},
                { media: {type: 'image', src: '../../assets/3d/mosquito/001.webp', large: true }},]
      },
    ],
  },

  egypt: {
    title: 'Egypt',
    year: '2023',
    cover: { type: 'image', src: '../../assets/3d/egypt/000.png'},
    category: { vi: 'Scuplt', en: 'Scuplt' },
    subtitle: {
      vi: '3D Scuplting — Scuplting Study',
      en: '3D Scuplting — Scuplting Study',
    },
    desc: {
      vi: 'Dựa trên hình ảnh reference từ ArtStation. Tôi thực hiện toàn bộ quá trình digital sculpting trong ZBrush, tập trung xây dựng anatomy, silhouette, trang phục và các chi tiết bề mặt của nhân vật.',
      en: 'Based on a visual reference from ArtStation. The character was fully sculpted in ZBrush, focusing on anatomy, silhouette, costume design, and surface details.',
    },
    tools: ['ZBrush'],
    styleTags: ['Semi-Realistic', 'Sculpting', 'Character Sculpt', 'Dark Fantasy', 'Creature Design'],
    relatedBlocks:[
      {type: 'cards', 
        items: [{ media: {type: 'image', src: '../../assets/3d/egypt/01.webp' }},
                { media: {type: 'image', src: '../../assets/3d/egypt/02.webp' }},
                { media: {type: 'image', src: '../../assets/3d/egypt/03.webp' }},
                { media: {type: 'image', src: '../../assets/3d/egypt/04.webp' }},
                { media: {type: 'image', src: '../../assets/3d/egypt/001.webp', large: true }},]
      },
    ],
  },

  tools: {
    title: 'Hand Tools',
    year: '2023',
    cover: { type: 'Model', 
      variants: [
          { label: { vi: 'Model', en: 'Model' }, src: '../../assets/3d/tools/00.glb' },
          { label: { vi: 'Lưới',  en: 'Wireframe' }, src: '../../assets/3d/tools/01.glb' },
        ],},
    category: { vi: 'Model', en: 'Model' },
    subtitle: {
      vi: '3D Modeling — Dự án cá nhân',
      en: '3D Modeling — Personal Project',
    },
    desc: {
      vi: 'Dựa trên hình ảnh reference từ ArtStation. Tôi thực hiện toàn bộ quá trình digital sculpting trong ZBrush, tập trung xây dựng anatomy, silhouette, trang phục và các chi tiết bề mặt của nhân vật.',
      en: 'Based on a visual reference from ArtStation. The character was fully sculpted in ZBrush, focusing on anatomy, silhouette, costume design, and surface details.',
    },
    tools: ['Maya'],
    styleTags: ['Semi-Realistic', 'Sculpting', 'Character Sculpt', 'Dark Fantasy', 'Creature Design'],
  },

  aniFP: {
    title: 'Facial Phonemes',
    year: '2023',
    cover: { type: 'video', src: '../../assets/3d/ani-FP/001.mp4', poster: '../../assets/3d/ani-FP/001.webp' },
    category: { vi: 'Animation', en: 'Animation' },
    subtitle: {
      vi: '3D Animation — Animation Study',
      en: '3D Animation — Animation Study',
    },
    desc: {
      vi: 'Mô phỏng lại phân cảnh thoại của nhân vật Boss Baby. Tác phẩm tập trung vào kỹ thuật lip-sync theo khẩu hình kết hợp với chuyển động cơ thể và biểu cảm gương mặt',
      en: 'Recreating a dialogue scene from Boss Baby. The piece focuses on phoneme-based lip-sync, combined with body mechanics and facial expressions.',
    },
    tools: ['Maya'],
    styleTags: ['Animation'],
    relatedBlocks:[
      {type: 'cards', 
        items: [  { title: 'video', media: { type: 'video', src: '../../assets/3d/ani-FP/000.mp4' }, large: true },
        ],
      },
    ],
  },


};