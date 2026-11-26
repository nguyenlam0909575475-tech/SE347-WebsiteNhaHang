export type MenuCategory = 'starter' | 'main' | 'dessert' | 'drink'
export type MenuTag = 'signature' | 'vegetarian' | 'spicy' | 'gluten-free' | 'new'

export interface MenuItem {
  id: string
  name: string
  category: MenuCategory
  price: number
  image: string
  short: string
  description: string
  ingredients: string[]
  allergens: string[]
  pairing?: { name: string; note: string }
  tags: MenuTag[]
  portion?: string
}

export const categories: { id: 'all' | MenuCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'starter', label: 'Khai vị' },
  { id: 'main', label: 'Món chính' },
  { id: 'dessert', label: 'Tráng miệng' },
  { id: 'drink', label: 'Đồ uống' },
]

export const tagLabels: Record<MenuTag, string> = {
  signature: 'Món đặc trưng',
  vegetarian: 'Món chay',
  spicy: 'Cay',
  'gluten-free': 'Không gluten',
  new: 'Món mới',
}

export const menu: MenuItem[] = [
  {
    id: 'tomato-soup',
    name: 'Súp cà chua nướng',
    category: 'starter',
    price: 95000,
    image: 'images/menu-tomato-soup.webp',
    short: 'Cà chua Đà Lạt nướng than, kem chua, bánh mì bơ tỏi.',
    description:
      'Cà chua được nướng nguyên trái trên than đến khi vỏ hơi cháy rồi xay cùng ớt chuông đỏ. Ăn kèm một muỗng kem chua và lát bánh mì nướng bơ tỏi.',
    ingredients: ['Cà chua Đà Lạt', 'Ớt chuông đỏ', 'Kem chua', 'Bánh mì bơ tỏi', 'Húng quế'],
    allergens: ['Sữa', 'Gluten'],
    pairing: { name: 'Spritz bưởi hồng', note: 'Vị đắng nhẹ của bưởi cân lại độ chua của cà chua.' },
    tags: ['vegetarian'],
    portion: '1 người',
  },
  {
    id: 'sprout-salad',
    name: 'Salad rau mầm, sốt mè rang',
    category: 'starter',
    price: 115000,
    image: 'images/menu-sprout-salad.webp',
    short: 'Rau mầm, hành tím ngâm, hạt điều rang, sốt mè.',
    description:
      'Rau mầm và xà lách non từ nông trại thủy canh ở Củ Chi, trộn hành tím ngâm giấm táo, hạt điều rang muối và sốt mè rang làm tại bếp mỗi sáng.',
    ingredients: ['Rau mầm', 'Xà lách non', 'Hành tím ngâm', 'Hạt điều', 'Sốt mè rang'],
    allergens: ['Mè', 'Hạt điều'],
    pairing: { name: 'Mocktail dưa hấu bạc hà', note: 'Tươi, ít ngọt, hợp món mở đầu.' },
    tags: ['vegetarian', 'gluten-free'],
    portion: '1–2 người',
  },
  {
    id: 'dumplings',
    name: 'Há cảo tôm hấp, dầu ớt nhà làm',
    category: 'starter',
    price: 135000,
    image: 'images/menu-dumplings.webp',
    short: '6 viên, nhân tôm sú và củ năng, chấm dầu ớt tỏi phi.',
    description:
      'Vỏ bột gói tay mỗi chiều, nhân tôm sú băm thô với củ năng để giữ độ giòn. Dầu ớt được phi cùng tỏi, hành tím và một chút tiêu Phú Quốc.',
    ingredients: ['Tôm sú', 'Củ năng', 'Bột năng', 'Dầu ớt tỏi', 'Tiêu Phú Quốc'],
    allergens: ['Giáp xác', 'Gluten'],
    pairing: { name: 'Vang trắng Sauvignon Blanc', note: 'Độ chua sáng làm dịu vị cay của dầu ớt.' },
    tags: ['spicy'],
    portion: '6 viên',
  },
  {
    id: 'avocado-salad',
    name: 'Salad bơ sáp & đậu gà',
    category: 'starter',
    price: 125000,
    image: 'images/menu-avocado-salad.webp',
    short: 'Bơ sáp Đắk Lắk, đậu gà rang, cà chua bi, củ cải.',
    description:
      'Bơ sáp Đắk Lắk cắt miếng lớn, đậu gà rang thì là, cà chua bi, củ cải đỏ bào mỏng và sốt chanh dây. Món này có thể làm thuần chay theo yêu cầu.',
    ingredients: ['Bơ sáp', 'Đậu gà', 'Cà chua bi', 'Củ cải đỏ', 'Sốt chanh dây'],
    allergens: [],
    pairing: { name: 'Spritz bưởi hồng', note: 'Ít cồn, hợp bữa trưa.' },
    tags: ['vegetarian', 'gluten-free', 'new'],
    portion: '1–2 người',
  },
  {
    id: 'wagyu',
    name: 'Thăn bò Wagyu nướng than',
    category: 'main',
    price: 890000,
    image: 'images/sig-wagyu.webp',
    short: '200g thăn ngoại Wagyu MB6, sốt tiêu xanh Phú Quốc.',
    description:
      'Thăn ngoại Wagyu Úc MB6 ủ khô 14 ngày trong tủ của bếp, nướng trên than nhãn ở 380°C rồi nghỉ 6 phút trước khi cắt. Mặc định chín vừa (medium rare), bếp sẽ hỏi lại khi lễ tân xác nhận.',
    ingredients: ['Thăn ngoại Wagyu MB6', 'Tiêu xanh Phú Quốc', 'Hành tây nướng', 'Muối hồng', 'Bơ thảo mộc'],
    allergens: ['Sữa'],
    pairing: { name: 'Château L’Orme · Bordeaux Cabernet', note: 'Tannin chắc, cân bằng trọn vẹn độ béo của thăn bò MB6.' },
    tags: ['signature', 'gluten-free'],
    portion: '200g',
  },
  {
    id: 'salmon',
    name: 'Cá hồi áp chảo, sốt bơ chanh dây',
    category: 'main',
    price: 420000,
    image: 'images/sig-salmon.webp',
    short: 'Phi lê cá hồi Na Uy, bí ngòi cà rốt sợi, cải bó xôi & sốt chanh dây.',
    description:
      'Phi lê cá hồi Na Uy áp chảo săn mặt đến khi dậy vân nướng thơm, phần thịt giữa giữ hồng ẩm mượt. Đặt trên bí ngòi, cà rốt thái sợi xào bơ lạt và cải bó xôi non, dùng kèm chanh xanh tươi và sốt bơ chanh dây Lâm Đồng.',
    ingredients: ['Cá hồi Na Uy', 'Bí ngòi & cà rốt sợi', 'Cải bó xôi non', 'Chanh dây Lâm Đồng', 'Bơ lạt'],
    allergens: ['Cá', 'Sữa'],
    pairing: { name: 'Clos Sainte-Odile · Alsace Chardonnay', note: 'Hương trái cây trắng và vị khoáng thanh nâng tầm sốt chanh dây.' },
    tags: ['signature', 'gluten-free'],
    portion: '180g',
  },
  {
    id: 'ribs',
    name: 'Sườn heo nướng mật ong rừng',
    category: 'main',
    price: 365000,
    image: 'images/menu-ribs.webp',
    short: 'Sườn non rim 4 giờ, phết mật ong U Minh, nướng lại trên than.',
    description:
      'Sườn non được rim chậm 4 giờ với sả, gừng và nước dừa, sau đó phết mật ong rừng U Minh và nướng lại trên than cho cạnh hơi cháy. Ăn kèm dưa leo muối nhanh.',
    ingredients: ['Sườn non', 'Mật ong rừng U Minh', 'Sả', 'Gừng', 'Nước dừa'],
    allergens: [],
    pairing: { name: 'Old Fashioned khói gỗ', note: 'Vị khói của rượu gặp vị caramel của mật ong.' },
    tags: ['gluten-free'],
    portion: '2 người',
  },
  {
    id: 'skewers',
    name: 'Xiên bò & rau củ nướng sa tế',
    category: 'main',
    price: 245000,
    image: 'images/menu-skewers.webp',
    short: '4 xiên nạc vai bò, ớt chuông, hành tây, sa tế tôm.',
    description:
      'Nạc vai bò ướp sa tế tôm và sả băm, xiên xen ớt chuông và hành tây, nướng trên vỉ than. Món dễ chia, gọi thêm khi đi nhóm.',
    ingredients: ['Nạc vai bò', 'Sa tế tôm', 'Ớt chuông', 'Hành tây', 'Sả'],
    allergens: ['Giáp xác'],
    pairing: { name: 'Bia thủ công Pale Ale', note: 'Mát, hơi đắng, hợp đồ nướng cay.' },
    tags: ['spicy'],
    portion: '4 xiên',
  },
  {
    id: 'chicken',
    name: 'Gà ta nướng lá chanh',
    category: 'main',
    price: 320000,
    image: 'images/menu-chicken.webp',
    short: 'Nửa con gà ta Tiền Giang, da giòn, muối ớt xanh.',
    description:
      'Gà ta thả vườn từ Tiền Giang, ướp lá chanh, tỏi và nước mắm Phú Quốc qua đêm, nướng trong lò than đến khi da giòn. Chấm muối ớt xanh.',
    ingredients: ['Gà ta', 'Lá chanh', 'Tỏi', 'Nước mắm Phú Quốc', 'Muối ớt xanh'],
    allergens: ['Cá (nước mắm)'],
    pairing: { name: 'Vang trắng Sauvignon Blanc', note: 'Hương thảo mộc của vang hợp lá chanh.' },
    tags: ['gluten-free'],
    portion: 'Nửa con',
  },
  {
    id: 'tagliatelle',
    name: 'Tagliatelle bò hầm vang đỏ',
    category: 'main',
    price: 285000,
    image: 'images/menu-tagliatelle.webp',
    short: 'Mì trứng cán tay, má bò hầm vang 6 giờ, phô mai Parmesan.',
    description:
      'Mì tagliatelle cán tay mỗi buổi chiều. Má bò hầm với vang đỏ, cà rốt và cần tây trong 6 giờ, xé nhỏ và trộn cùng mì, rắc Parmesan bào.',
    ingredients: ['Mì trứng cán tay', 'Má bò', 'Vang đỏ', 'Cà rốt', 'Parmesan'],
    allergens: ['Gluten', 'Trứng', 'Sữa'],
    pairing: { name: 'Vang đỏ Merlot', note: 'Mềm, nhiều trái cây chín.' },
    tags: [],
    portion: '1 người',
  },
  {
    id: 'risotto',
    name: 'Risotto nấm & dầu truffle',
    category: 'main',
    price: 265000,
    image: 'images/menu-risotto.webp',
    short: 'Gạo Arborio, nấm đùi gà và nấm hương Đà Lạt.',
    description:
      'Gạo Arborio khuấy liên tục với nước dùng rau củ, nấm đùi gà và nấm hương Đà Lạt áp chảo, hoàn thiện với bơ, Parmesan và vài giọt dầu truffle đen.',
    ingredients: ['Gạo Arborio', 'Nấm đùi gà', 'Nấm hương Đà Lạt', 'Parmesan', 'Dầu truffle'],
    allergens: ['Sữa'],
    pairing: { name: 'Vang trắng Chardonnay', note: 'Hợp vị kem của risotto.' },
    tags: ['vegetarian', 'gluten-free'],
    portion: '1 người',
  },
  {
    id: 'seabass',
    name: 'Cá chẽm nướng vỉ gang, sốt cà chua bi',
    category: 'main',
    price: 345000,
    image: 'images/sig-seabass.webp',
    short: 'Cá chẽm Vũng Tàu khứa caro nướng than hồng, sốt cà chua bi thì là.',
    description:
      'Phi lê cá chẽm Vũng Tàu khứa caro mặt trên, ướp muối biển và tiêu đen Phú Quốc giã dập, nướng trực tiếp trên vỉ gang than hồng cho dậy khói thơm. Lên đĩa dùng kèm bí ngòi áp chảo và sốt cà chua bi nấu thì là.',
    ingredients: ['Cá chẽm Vũng Tàu', 'Tiêu đen Phú Quốc', 'Cà chua bi', 'Thì là', 'Bí ngòi'],
    allergens: ['Cá'],
    pairing: { name: 'Domaine d’Étoile · Provence Rosé', note: 'Vị khoáng thanh và hậu vị khô rất hợp cá chẽm nướng than.' },
    tags: ['signature', 'gluten-free'],
    portion: '200g',
  },
  {
    id: 'mousse',
    name: 'Bánh kem phúc bồn tử & hạt dẻ cười',
    category: 'dessert',
    price: 135000,
    image: 'images/sig-mousse.webp',
    short: 'Cốt hạnh nhân, kem mascarpone vani, phúc bồn tử tươi & hạt dẻ cười.',
    description:
      'Cốt bánh hạnh nhân mềm xen hai lớp kem mascarpone vani Madagascar và mứt phúc bồn tử chua dịu, phủ sô-cô-la trắng rắc hạt dẻ cười nghiền cùng trái phúc bồn tử Đà Lạt tươi nguyên cuống. Làm mẻ nhỏ mỗi sáng nên thường hết sớm dịp cuối tuần.',
    ingredients: ['Phúc bồn tử tươi Đà Lạt', 'Kem mascarpone vani', 'Bột hạnh nhân', 'Hạt dẻ cười', 'Sô-cô-la trắng'],
    allergens: ['Sữa', 'Trứng', 'Hạnh nhân', 'Hạt dẻ cười'],
    pairing: { name: 'Vang ngọt Moscato', note: 'Ngọt nhẹ, thơm hoa trắng, tôn vị chua thanh của phúc bồn tử.' },
    tags: ['signature'],
    portion: '1 phần',
  },
  {
    id: 'pannacotta',
    name: 'Panna cotta dâu tây',
    category: 'dessert',
    price: 95000,
    image: 'images/menu-pannacotta.webp',
    short: 'Kem sữa vani, sốt dâu tây Đà Lạt nấu chậm.',
    description: 'Panna cotta sữa tươi và vani, phủ sốt dâu tây Đà Lạt nấu chậm với một chút chanh vàng.',
    ingredients: ['Sữa tươi', 'Kem tươi', 'Vani', 'Dâu tây Đà Lạt', 'Chanh vàng'],
    allergens: ['Sữa'],
    tags: ['gluten-free'],
    portion: '1 phần',
  },
  {
    id: 'brownie',
    name: 'Brownie cacao Bến Tre',
    category: 'dessert',
    price: 105000,
    image: 'images/menu-brownie.webp',
    short: 'Cacao 70% Bến Tre, sốt sô-cô-la nóng.',
    description:
      'Brownie làm từ cacao 70% của nông trại ở Bến Tre, nướng hơi non ở giữa. Rưới sốt sô-cô-la nóng ngay tại bàn.',
    ingredients: ['Cacao Bến Tre 70%', 'Bơ', 'Trứng', 'Đường thốt nốt', 'Bột mì'],
    allergens: ['Sữa', 'Trứng', 'Gluten'],
    pairing: { name: 'Old Fashioned khói gỗ', note: 'Cho người thích kết thúc bằng một ly mạnh.' },
    tags: [],
    portion: '1 phần',
  },
  {
    id: 'old-fashioned',
    name: 'Old Fashioned khói gỗ',
    category: 'drink',
    price: 185000,
    image: 'images/menu-old-fashioned.webp',
    short: 'Bourbon, siro đường thốt nốt, vỏ cam, xông khói gỗ.',
    description: 'Bourbon khuấy cùng siro đường thốt nốt và bitters, xông khói gỗ sồi ngay trước khi mang ra bàn.',
    ingredients: ['Bourbon', 'Đường thốt nốt', 'Angostura bitters', 'Vỏ cam'],
    allergens: [],
    tags: ['signature'],
  },
  {
    id: 'orange-cocktail',
    name: 'Cam quế',
    category: 'drink',
    price: 165000,
    image: 'images/menu-orange-cocktail.webp',
    short: 'Rum, cam sành, quế Trà My, hương thảo.',
    description: 'Rum trắng, nước cam sành vắt tươi, siro quế Trà My nấu tại quầy và một nhánh hương thảo.',
    ingredients: ['Rum trắng', 'Cam sành', 'Quế Trà My', 'Hương thảo'],
    allergens: [],
    tags: ['new'],
  },
  {
    id: 'spritz',
    name: 'Spritz bưởi hồng',
    category: 'drink',
    price: 155000,
    image: 'images/menu-spritz.webp',
    short: 'Aperol, vang sủi, nước bưởi hồng Phúc Trạch.',
    description: 'Aperol, vang sủi và nước bưởi hồng, nhiều đá, ít ngọt. Hợp ngồi ban công buổi chiều.',
    ingredients: ['Aperol', 'Vang sủi', 'Bưởi hồng', 'Soda'],
    allergens: [],
    tags: [],
  },
  {
    id: 'watermelon',
    name: 'Mocktail dưa hấu bạc hà',
    category: 'drink',
    price: 85000,
    image: 'images/menu-watermelon.webp',
    short: 'Không cồn. Dưa hấu Long An, chanh xanh, bạc hà.',
    description: 'Dưa hấu ép lạnh, chanh xanh, bạc hà và soda. Không cồn, phù hợp cho trẻ em.',
    ingredients: ['Dưa hấu', 'Chanh xanh', 'Bạc hà', 'Soda'],
    allergens: [],
    tags: ['vegetarian'],
  },
  {
    id: 'red-wine',
    name: 'Vang đỏ theo ly',
    category: 'drink',
    price: 175000,
    image: 'images/menu-red-wine.webp',
    short: 'Ba nhãn đổi theo tuần, sommelier giới thiệu tại bàn.',
    description:
      'Mỗi tuần quầy mở ba chai vang đỏ để bán theo ly (150ml). Hỏi nhân viên để biết nhãn đang mở và món nên đi kèm.',
    ingredients: ['Merlot', 'Cabernet Sauvignon', 'Pinot Noir'],
    allergens: ['Sulfite'],
    tags: [],
  },
]

export const formatPrice = (vnd: number) => `${(vnd / 1000).toLocaleString('vi-VN')}k`
export const formatPriceFull = (vnd: number) => `${vnd.toLocaleString('vi-VN')}đ`
