export const story = {
  subtitle: 'Câu chuyện của Grilli',
  title: ['Bắt đầu từ một', 'chiếc lò than ở Linh Trung'],
  paragraphs: [
    'Năm 2012, anh Khôi mở quán nướng nhỏ chỉ vỏn vẹn sáu chiếc bàn ngay đầu hẻm, phục vụ sinh viên và anh chị em khu chế xuất. Thực đơn ngày ấy chỉ có sườn non, gà ta và vài xiên thịt ướp sả.',
    'Mười bốn năm sau, quán nhỏ đã thành nhà hàng hai tầng ấm cúng, nhưng căn bếp vẫn giữ bếp than nhãn và thói quen đi chợ lúc 5 giờ sáng. Từng phần ăn đều được nướng mới ngay khi khách gọi, tuyệt đối không nướng sẵn.',
  ],
  quote: 'Than đã đượm, nguyên liệu đã tươi thì gia vị chỉ cần vừa đủ để giữ lấy mùi thơm tự nhiên.',
  quoteBy: 'Bếp trưởng Trần Minh Khôi',
  stats: [
    { value: 14, suffix: '', label: 'Năm giữ lửa than' },
    { value: 46, suffix: '', label: 'Món trong thực đơn' },
    { value: 140, suffix: '', label: 'Nhãn vang trong tủ' },
    { value: 38000, suffix: '+', label: 'Lượt khách mỗi năm' },
  ],
}

export interface SignatureDish {
  id: string
  index: string
  name: string
  origin: string
  description: string
  notes: string[]
  price: number
  image: string
}

export const signatureDishes: SignatureDish[] = [
  {
    id: 'wagyu',
    index: '01',
    name: 'Thăn bò Wagyu nướng than',
    origin: 'Wagyu Úc MB6 · ủ khô 14 ngày',
    description:
      'Thăn ngoại Wagyu Úc MB6 ủ khô 14 ngày, nướng trên than nhãn ở 380°C rồi nghỉ 6 phút trước khi thái. Sốt tiêu xanh Phú Quốc dọn riêng để bạn cảm nhận trọn vị ngọt của miếng đầu tiên.',
    notes: ['200g', 'Chín vừa', 'Than nhãn'],
    price: 890000,
    image: 'images/sig-wagyu.webp',
  },
  {
    id: 'salmon',
    index: '02',
    name: 'Cá hồi áp chảo, sốt chanh dây',
    origin: 'Cá hồi Na Uy · chanh dây Lâm Đồng',
    description:
      'Phi lê cá hồi Na Uy áp chảo săn mặt đến khi dậy vân nướng thơm, phần thịt giữa giữ sắc cam hồng ẩm mượt. Đặt trên bí ngòi, cà rốt thái sợi xào bơ lạt và cải bó xôi non, kèm chanh xanh tươi và sốt chanh dây dọn riêng.',
    notes: ['180g', 'Vân nướng thơm', 'Không gluten'],
    price: 420000,
    image: 'images/sig-salmon.webp',
  },
  {
    id: 'seabass',
    index: '03',
    name: 'Cá chẽm nướng vỉ gang, sốt cà chua bi',
    origin: 'Cá chẽm Vũng Tàu · tiêu đen Phú Quốc',
    description:
      'Phi lê cá chẽm Vũng Tàu khứa caro mặt trên, ướp muối biển cùng tiêu đen giã dập rồi nướng trực tiếp trên vỉ gang than hồng cho dậy làn khói mỏng. Lên bàn dùng kèm sốt cà chua bi nấu thì là dọn nóng.',
    notes: ['200g', 'Khói than hồng', 'Hải sản trong ngày'],
    price: 345000,
    image: 'images/sig-seabass.webp',
  },
  {
    id: 'mousse',
    index: '04',
    name: 'Bánh kem phúc bồn tử & hạt dẻ cười',
    origin: 'Phúc bồn tử Đà Lạt · kem mascarpone vani',
    description:
      'Cốt bánh hạnh nhân mềm xen hai lớp kem mascarpone vani và mứt phúc bồn tử chua thanh, phủ sô-cô-la trắng rắc hạt dẻ cười cùng trái phúc bồn tử tươi nguyên cuống. Bếp làm mẻ nhỏ mỗi sáng, cuối tuần thường hết trước 21 giờ.',
    notes: ['1 phần', 'Mẻ nhỏ trong ngày', 'Hết sớm cuối tuần'],
    price: 135000,
    image: 'images/sig-mousse.webp',
  },
]

export const chef = {
  name: 'Trần Minh Khôi',
  role: 'Bếp trưởng & người sáng lập',
  image: 'images/chef.webp',
  quote:
    'Tôi học nướng từ ba tôi, một người bán thịt nướng ở chợ Thủ Đức. Sau này đi làm bếp ở Sài Gòn và Melbourne, thứ tôi mang về không phải công thức mà là sự kiên nhẫn với lửa.',
  bio: 'Hơn 18 năm đứng bếp, từng làm bếp phó tại hai nhà hàng steakhouse ở Melbourne trước khi về mở Grilli. Mỗi sáng anh vẫn tự đi chợ và chọn than.',
  principles: [
    { title: 'Nguyên liệu trong ngày', text: 'Hải sản và rau nhận trước 7 giờ sáng. Hết thì gạch món, không dùng hàng đông lạnh thay.' },
    { title: 'Lửa than thật', text: 'Than nhãn và than đước, không dùng than tổ ong hay bếp ga cho món nướng.' },
    { title: 'Nướng khi khách gọi', text: 'Không nướng sẵn, không hâm lại. Món lên bàn chậm hơn vài phút nhưng nóng và đúng độ chín.' },
  ],
}

export type GalleryCategory = 'space' | 'food' | 'bar' | 'kitchen'

export const galleryFilters: { id: 'all' | GalleryCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'space', label: 'Không gian' },
  { id: 'food', label: 'Món ăn' },
  { id: 'bar', label: 'Quầy bar' },
  { id: 'kitchen', label: 'Trong bếp' },
]

export interface GalleryItem {
  id: string
  src: string
  caption: string
  category: GalleryCategory
  shape: 'wide' | 'tall' | 'square'
}

export const gallery: GalleryItem[] = [
  { id: 'g1', src: 'images/gal-room-dark.webp', caption: 'Sảnh tầng trệt lúc 19 giờ', category: 'space', shape: 'wide' },
  { id: 'g2', src: 'images/gal-flames.webp', caption: 'Ca tối, khu bếp nóng', category: 'kitchen', shape: 'tall' },
  { id: 'g3', src: 'images/gal-steak-spread.webp', caption: 'Mâm nướng cho nhóm 4 người', category: 'food', shape: 'square' },
  { id: 'g4', src: 'images/gal-bar.webp', caption: 'Ba ly cocktail nhiệt đới tại quầy bar', category: 'bar', shape: 'wide' },
  { id: 'g5', src: 'images/gal-table.webp', caption: 'Bàn đôi bên ánh nến tầng 2', category: 'space', shape: 'tall' },
  { id: 'g6', src: 'images/gal-grill.webp', caption: 'Xiên bò nướng trên vỉ than nhãn', category: 'kitchen', shape: 'wide' },
  { id: 'g7', src: 'images/gal-shrimp.webp', caption: 'Tôm sú nướng muối ớt', category: 'food', shape: 'square' },
  { id: 'g8', src: 'images/gal-whisky.webp', caption: 'Old Fashioned với đá viên đục tay', category: 'bar', shape: 'tall' },
  { id: 'g9', src: 'images/gal-room-window.webp', caption: 'Phòng riêng ấm cúng cho 10 – 12 khách', category: 'space', shape: 'wide' },
  { id: 'g10', src: 'images/gal-chopping.webp', caption: 'Sơ chế nguyên liệu trước giờ mở cửa', category: 'kitchen', shape: 'tall' },
  { id: 'g11', src: 'images/gal-grill-platter.webp', caption: 'Mâm xiên thịt và rau củ nướng than', category: 'food', shape: 'tall' },
  { id: 'g12', src: 'images/gal-spritz.webp', caption: 'Bàn tiệc vang cho buổi họp mặt thân mật', category: 'bar', shape: 'tall' },
  { id: 'g13', src: 'images/gal-room-warm.webp', caption: 'Không gian tầng lửng khi lên đèn', category: 'space', shape: 'wide' },
  { id: 'g14', src: 'images/gal-pasta.webp', caption: 'Mì tươi cán tay cho bữa tối gia đình', category: 'food', shape: 'tall' },
  { id: 'g15', src: 'images/gal-toast.webp', caption: 'Góc bàn yên tĩnh tối cuối tuần', category: 'bar', shape: 'wide' },
  { id: 'g16', src: 'images/gal-room-top.webp', caption: 'Sảnh chính nhìn từ tầng lửng', category: 'space', shape: 'tall' },
]

export interface Experience {
  id: string
  title: string
  meta: string
  text: string
  image: string
  price: string
}

export const experiences: Experience[] = [
  {
    id: 'chef-table',
    title: 'Bàn bếp trưởng',
    meta: 'Tối thứ 5 – thứ 7 · 6 khách',
    text: 'Ngồi ngay quầy bếp, 7 món nhỏ do bếp trưởng chọn theo chợ hôm đó. Có thể hỏi bếp bất cứ điều gì.',
    image: 'images/exp-chef-table.webp',
    price: '1.650.000đ / khách',
  },
  {
    id: 'private',
    title: 'Phòng riêng',
    meta: 'Mỗi ngày · 8 – 12 khách',
    text: 'Phòng tầng 2 có cửa riêng, màn hình chiếu và loa. Hợp sinh nhật, họp mặt công ty, ra mắt gia đình.',
    image: 'images/exp-private.webp',
    price: 'Tối thiểu 6.000.000đ',
  },
  {
    id: 'wine',
    title: 'Tối vang thứ Sáu',
    meta: 'Thứ 6 hằng tuần · 19:00',
    text: 'Năm loại vang rót thử, mỗi loại đi với một món nhỏ. Sommelier của quán giới thiệu từng chai.',
    image: 'images/exp-wine.webp',
    price: '890.000đ / khách',
  },
  {
    id: 'acoustic',
    title: 'Acoustic cuối tuần',
    meta: 'Thứ 7, CN · 19:30 – 21:30',
    text: 'Guitar và hát mộc ở góc ban công. Không phụ thu, chỉ cần đặt bàn khu ban công trước.',
    image: 'images/exp-acoustic.webp',
    price: 'Không phụ thu',
  },
]

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  rating: number
  source: string
  date: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Nguyễn Thảo Vy',
    role: 'Đặt phòng riêng sinh nhật mẹ',
    quote:
      'Phòng riêng sạch, nhân viên nhớ trước là mẹ mình ăn kiêng muối nên bếp làm riêng phần sườn ít mặn. Bánh phúc bồn tử hết sớm nên nhớ dặn giữ trước.',
    rating: 5,
    source: 'Google Maps',
    date: 'Tháng 10/2025',
  },
  {
    id: 't2',
    name: 'Lê Hoàng Phúc',
    role: 'Khách quen khu Linh Trung',
    quote:
      'Thăn bò nướng đúng độ mình yêu cầu, miếng cắt ra còn hồng đều. Giá không rẻ nhưng so với mấy steakhouse quận 1 thì dễ chịu hơn và đỗ xe tiện.',
    rating: 5,
    source: 'Google Maps',
    date: 'Tháng 9/2025',
  },
  {
    id: 't3',
    name: 'Phạm Quốc Bảo',
    role: 'Tối vang thứ Sáu',
    quote:
      'Lần đầu đi tasting vang mà không thấy ngợp. Anh sommelier giải thích dễ hiểu, cặp cá hồi với Chardonnay là ngon nhất tối đó. Chỉ tiếc phòng hơi ồn lúc đông.',
    rating: 4,
    source: 'Facebook',
    date: 'Tháng 8/2025',
  },
  {
    id: 't4',
    name: 'Trịnh Mai Anh',
    role: 'Họp mặt nhóm 9 người',
    quote:
      'Đặt online lúc 10 giờ, 10 giờ 12 có lễ tân gọi lại xác nhận và hỏi thêm có ai dị ứng hải sản không. Mâm nướng cho nhóm vừa đủ, không phải gọi thêm.',
    rating: 5,
    source: 'Google Maps',
    date: 'Tháng 11/2025',
  },
]
