// Single source of truth for contact details. The Grilli template showed three
// different phone numbers / opening hours in the topbar, drawer and reservation
// card — every component here reads from this file instead.

export const site = {
  name: 'Grilli',
  tagline: 'Nhà hàng nướng than & ẩm thực Âu–Việt',
  address: '102 Đường số 9, P. Linh Trung, TP. Thủ Đức',
  addressFull: '102 Đường số 9, phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh',
  hoursShort: 'Hằng ngày: 8:00 – 22:00',
  phone: '028 3812 4567',
  phoneHref: 'tel:+842838124567',
  hotline: '0909 486 120',
  hotlineHref: 'tel:+84909486120',
  email: 'datban@grilli.vn',
  emailHref: 'mailto:datban@grilli.vn',
  mapEmbed:
    'https://www.google.com/maps?q=Linh+Trung,+Th%E1%BB%A7+%C4%90%E1%BB%A9c,+H%E1%BB%93+Ch%C3%AD+Minh&z=15&output=embed',
  mapLink: 'https://www.google.com/maps/search/?api=1&query=Linh+Trung+Thu+Duc+Ho+Chi+Minh',
  hours: [
    { label: 'Bữa sáng & cà phê', value: '8:00 – 10:30' },
    { label: 'Bữa trưa', value: '11:00 – 14:00' },
    { label: 'Bữa tối', value: '17:30 – 22:00' },
  ],
  socials: [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'TikTok', href: 'https://tiktok.com' },
    { label: 'Google Maps', href: 'https://www.google.com/maps/search/?api=1&query=Linh+Trung+Thu+Duc' },
  ],
}

export const navLinks = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'story', label: 'Câu chuyện' },
  { id: 'menu', label: 'Thực đơn' },
  { id: 'experience', label: 'Trải nghiệm' },
  { id: 'gallery', label: 'Thư viện' },
  { id: 'contact', label: 'Liên hệ' },
] as const

export const heroSlides = [
  {
    image: 'images/hero-1.webp',
    subtitle: 'Bếp than hoa · Từ 2012',
    title: ['Giữ lửa than hồng,', 'giữ trọn vị ngon'],
    text: 'Than nhãn nhóm mới mỗi sáng, nguyên liệu về bếp từ chợ sớm Thủ Đức.',
  },
  {
    image: 'images/hero-2.webp',
    subtitle: 'Hải sản theo chuyến',
    title: ['Tôm sú, cá chẽm', 'về bếp lúc sáu giờ'],
    text: 'Thực đơn hải sản đổi theo mùa biển và các chuyến xe sớm từ Phan Thiết, Vũng Tàu.',
  },
  {
    image: 'images/hero-3.webp',
    subtitle: 'Bữa tối sum vầy',
    title: ['Ngồi lại thật lâu,', 'chuyện thêm thân tình'],
    text: 'Phòng riêng ấm cúng cho gia đình, góc ban công thoáng gió và tủ vang 140 nhãn.',
  },
]
