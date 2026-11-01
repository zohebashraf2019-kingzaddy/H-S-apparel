// H&S Apparel — US catalog.
// Single source of truth for the storefront AND the /api/checkout price check,
// so keep this file plain JavaScript (no JSX, no browser APIs).
//
// `fit3d` drives the 3D Fit Studio: which garment model to dress the mannequin in,
// its color, sleeve length, rise, leg shape and fabric texture.

const CDN = 'https://hnsapparel.com.pk/cdn/shop/files/';
const cdn = (file, v) => `${CDN}${file}?v=${v}&width=900`;

export const TOP_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
export const WAIST_SIZES = ['28', '30', '32', '34', '36', '38'];
export const SHOE_SIZES = ['7', '8', '9', '10', '11', '12'];

export const CATEGORIES = [
  { slug: 'tees-polos', name: 'T-Shirts & Polos', short: 'Tees & Polos', blurb: 'Piqué polos, heavyweight tees and oversized graphics.', image: '/img/look-beige-crest-polo.webp' },
  { slug: 'shirts', name: 'Shirts', short: 'Shirts', blurb: 'Oxfords, flannels and button-downs with a sharp collar.', image: '/img/look-oxford-navy-chino.webp' },
  { slug: 'pants', name: 'Pants, Denim & Chinos', short: 'Pants & Denim', blurb: 'Straight denim, slim chinos and easy drawstring trousers.', image: '/img/jeans-indigo-straight.webp' },
  { slug: 'shoes', name: 'Shoes', short: 'Shoes', blurb: 'Terrace classics and statement runners.', image: '/img/look-black-polo-chino.webp' },
  { slug: 'sets', name: 'Co-ord Sets', short: 'Sets', blurb: 'Matched tops and bottoms, priced together.', image: '/img/set-peach-black.webp' },
  { slug: 'women', name: 'Women', short: 'Women', blurb: 'A new chapter — the first womenswear drop.', image: '/img/women-dress.webp', soon: true },
];

export const PRODUCTS = [
  // ───────────── T-SHIRTS & POLOS ─────────────
  {
    id: 'hs-101', slug: 'script-collar-polo-black', name: 'Script Collar Polo', color: 'Black', brand: 'H&S Select',
    category: 'tees-polos', sub: 'Polos', price: 39, compareAt: 59, badge: 'Bestseller',
    sizes: TOP_SIZES, images: ['/img/polo-script-black.webp'],
    swatch: '#16161a',
    desc: 'Soft stretch-cotton jersey polo with a hand-signature embroidery running up the collar and a tonal rubberised chest emblem. Smart enough for dinner, easy enough for the weekend.',
    details: ['95% cotton, 5% elastane jersey', 'Three-button placket with engraved buttons', 'Embroidered signature on collar', 'Regular fit — true to size'],
    fit3d: { type: 'polo', color: '#17171b', sleeve: 'short', texture: 'jersey' },
  },
  {
    id: 'hs-102', slug: 'tipped-pique-polo-forest', name: 'Tipped Piqué Polo', color: 'Forest Green', brand: 'H&S Select',
    category: 'tees-polos', sub: 'Polos', price: 34, compareAt: 49,
    sizes: TOP_SIZES, images: ['/img/polo-tipped-green.webp'],
    swatch: '#1f4d43',
    desc: 'Classic cotton piqué in deep forest green, finished with navy-and-ivory tipping on the collar and cuffs and a minimal chest logo.',
    details: ['100% cotton piqué', 'Contrast-tipped collar and cuffs', 'Two-button placket', 'Regular fit'],
    fit3d: { type: 'polo', color: '#1f4d43', sleeve: 'short', texture: 'pique', trim: '#f2efe6' },
  },
  {
    id: 'hs-103', slug: 'crest-pique-polo-sand', name: 'Crest Piqué Polo', color: 'Sand', brand: 'H&S Select',
    category: 'tees-polos', sub: 'Polos', price: 36, compareAt: 55, badge: 'New',
    sizes: TOP_SIZES, images: ['/img/look-beige-crest-polo.webp'],
    swatch: '#d8c6a5',
    desc: 'Heritage piqué polo in a warm sand tone with an embroidered crest at the chest. Pairs perfectly with black denim and white sneakers.',
    details: ['100% cotton piqué', 'Embroidered heraldic crest', 'Ribbed collar and cuffs', 'Regular fit'],
    fit3d: { type: 'polo', color: '#d6c4a2', sleeve: 'short', texture: 'pique' },
  },
  {
    id: 'hs-104', slug: 'resort-knit-polo-navy', name: 'Resort Knit Polo', color: 'Navy', brand: 'H&S Select',
    category: 'tees-polos', sub: 'Polos', price: 44, compareAt: 65,
    sizes: TOP_SIZES, images: ['/img/look-navy-knit-polo.webp'],
    swatch: '#1c2540',
    desc: 'Open Johnny-collar polo in a dense navy knit with striped ivory tipping and a red script monogram. The summer-evening polo.',
    details: ['Cotton-blend knit', 'Open buttonless Johnny collar', 'Striped tipping at collar and sleeves', 'Slim-regular fit'],
    fit3d: { type: 'polo', color: '#1c2540', sleeve: 'short', texture: 'knit', trim: '#f2efe6' },
  },
  {
    id: 'hs-105', slug: 'wordmark-polo-black', name: 'Wordmark Tipped Polo', color: 'Black', brand: 'H&S Select',
    category: 'tees-polos', sub: 'Polos', price: 36,
    sizes: TOP_SIZES, images: ['/img/look-black-polo-chino.webp'],
    swatch: '#121214',
    desc: 'Black jersey polo with spaced chest lettering and crisp white tipping. Clean lines, bold contrast.',
    details: ['Cotton jersey', 'Printed chest wordmark', 'White tipping on collar and cuffs', 'Regular fit'],
    fit3d: { type: 'polo', color: '#131315', sleeve: 'short', texture: 'jersey', trim: '#f4f1ea' },
  },
  {
    id: 'hs-106', slug: 'abstraction-oversized-tee-ivory', name: 'Abstraction Oversized Tee', color: 'Ivory', brand: 'H&S Studio',
    category: 'tees-polos', sub: 'T-Shirts', price: 29, badge: 'New',
    sizes: TOP_SIZES, images: ['/img/tee-abstraction-look.webp', '/img/tee-abstraction-front.webp'],
    swatch: '#f1ece1',
    desc: 'Heavyweight drop-shoulder tee with an olive city-list print — Paris, Milano, London, Seoul, New York. Boxy, structured, made to be worn loose.',
    details: ['240 GSM combed cotton', 'Drop shoulder, boxy oversized cut', 'Puff-print city graphic', 'Size down for a regular fit'],
    fit3d: { type: 'tee', color: '#efe9dc', sleeve: 'elbow', fit: 'oversized', texture: 'jersey', print: '#7d7a45' },
  },
  {
    id: 'hs-107', slug: 'hustle-grind-tee-peach', name: 'Hustle Grind Oversized Tee', color: 'Peach', brand: 'H&S Studio',
    category: 'tees-polos', sub: 'T-Shirts', price: 29,
    sizes: TOP_SIZES, images: ['/img/tee-hustle-back.webp', '/img/tee-peach-front.webp'],
    swatch: '#f2d9bf',
    desc: 'Soft peach oversized tee with a small chest script up front and a statement “Hustle — Grind All Day” back print.',
    details: ['220 GSM cotton', 'Oversized fit', 'Large back print, small chest print', 'Pre-shrunk'],
    fit3d: { type: 'tee', color: '#f1d6ba', sleeve: 'elbow', fit: 'oversized', texture: 'jersey' },
  },
  {
    id: 'hs-108', slug: 'script-embroidered-tee-peach', name: 'Script Embroidered Tee', color: 'Peach', brand: 'H&S Studio',
    category: 'tees-polos', sub: 'T-Shirts', price: 26,
    sizes: TOP_SIZES, images: ['/img/tee-peach-front.webp', '/img/tee-peach-detail.webp'],
    swatch: '#f0d4b6',
    desc: 'A quiet everyday tee — garment-soft peach cotton with a fine embroidered script at the chest.',
    details: ['100% cotton', 'Embroidered chest script', 'Relaxed fit', 'Ribbed crew neck'],
    fit3d: { type: 'tee', color: '#efd2b4', sleeve: 'short', fit: 'relaxed', texture: 'jersey' },
  },
  {
    id: 'hs-109', slug: 'patch-heavyweight-tee-camel', name: 'Patch Heavyweight Tee', color: 'Camel', brand: 'H&S Studio',
    category: 'tees-polos', sub: 'T-Shirts', price: 32, compareAt: 45,
    sizes: TOP_SIZES, images: ['/img/look-camel-tee.webp'],
    swatch: '#a57e55',
    desc: 'Mercerised heavyweight tee in camel with a textured rib neck and a rubber diamond patch at the chest. Holds its shape all day.',
    details: ['Mercerised cotton, 250 GSM', 'Textured mock-rib collar', 'Rubber chest patch', 'Relaxed fit'],
    fit3d: { type: 'tee', color: '#a57d53', sleeve: 'short', fit: 'relaxed', texture: 'jersey' },
  },
  {
    id: 'hs-110', slug: 'graphic-box-tee-white', name: 'Monogram Box Tee', color: 'White', brand: 'H&S Studio',
    category: 'tees-polos', sub: 'T-Shirts', price: 29,
    sizes: TOP_SIZES, images: ['/img/look-white-graphic-tee.webp'],
    swatch: '#f6f5f1',
    desc: 'Crisp white boxy tee with a woven-texture monogram graphic. Built for wide-leg denim.',
    details: ['100% cotton', 'Textured monogram graphic', 'Boxy fit', 'Ribbed crew neck'],
    fit3d: { type: 'tee', color: '#f4f3ee', sleeve: 'short', fit: 'oversized', texture: 'jersey', print: '#2a2a2a' },
  },
  {
    id: 'hs-111', slug: 'big-pony-sash-polo', name: 'Big Pony Sash Polo', color: 'Navy & Burgundy', brand: 'Polo Ralph Lauren',
    category: 'tees-polos', sub: 'Polos', price: 54, badge: 'One of one',
    sizes: ['M'], images: [cdn('IMG-6611.jpg', 1786293253)],
    swatch: '#1b2442',
    desc: 'Navy piqué polo with a burgundy diagonal sash, gold Big Pony embroidery and a shoulder crest. Authentic, quality-checked — only one available.',
    details: ['Cotton piqué', 'Tagged size M', 'Quality checked & cleaned in Karachi', 'Only one available'],
    fit3d: { type: 'polo', color: '#1b2442', sleeve: 'short', texture: 'pique' },
  },

  // ───────────── SHIRTS ─────────────
  {
    id: 'hs-201', slug: 'oxford-button-down-sky', name: 'Oxford Button-Down', color: 'Sky Blue', brand: 'H&S Select',
    category: 'shirts', sub: 'Oxford', price: 42, compareAt: 60, badge: 'Bestseller',
    sizes: TOP_SIZES, images: ['/img/look-oxford-navy-chino.webp', '/img/shirts-stack.webp'],
    swatch: '#c9d8ea',
    desc: 'The forever shirt. Soft-washed oxford cloth in sky blue with a button-down collar — roll the sleeves, wear it open or tucked.',
    details: ['100% cotton oxford', 'Button-down collar', 'Single chest pocket', 'Slim-regular fit'],
    fit3d: { type: 'shirt', color: '#c8d7ea', sleeve: 'long', texture: 'oxford' },
  },
  {
    id: 'hs-202', slug: 'western-check-shirt-red', name: 'Western Check Overshirt', color: 'Red Check', brand: 'H&S Select',
    category: 'shirts', sub: 'Flannel', price: 39,
    sizes: TOP_SIZES, images: ['/img/shirt-red-check.webp'],
    swatch: '#8e2b2e',
    desc: 'Brushed-cotton check overshirt in red and ivory with western flap pockets. Layer it open over a white tee.',
    details: ['Brushed cotton flannel', 'Twin western flap pockets', 'Snap-look buttons', 'Relaxed fit'],
    fit3d: { type: 'shirt', color: '#9a2f31', sleeve: 'long', texture: 'check', check: '#efe6da' },
  },
  {
    id: 'hs-203', slug: 'flannel-check-shirt-navy', name: 'Flannel Check Shirt', color: 'Navy Check', brand: 'H&S Select',
    category: 'shirts', sub: 'Flannel', price: 39,
    sizes: TOP_SIZES, images: ['/img/shirt-navy-check.webp'],
    swatch: '#2c3558',
    desc: 'Navy, slate and white check flannel with a soft hand. Rolls up nicely, wears in beautifully.',
    details: ['Cotton flannel', 'Button-down collar', 'Chest pocket', 'Regular fit'],
    fit3d: { type: 'shirt', color: '#2d3659', sleeve: 'long', texture: 'check', check: '#d8dbe6' },
  },
  {
    id: 'hs-204', slug: 'gingham-button-down-blue-green', name: 'Gingham Button-Down', color: 'Blue & Green', brand: 'H&S Select',
    category: 'shirts', sub: 'Casual', price: 37,
    sizes: TOP_SIZES, images: ['/img/check-detail.webp'],
    swatch: '#3d6a8a',
    desc: 'Crisp cotton poplin in mixed blue and green gingham with a button-down collar. Summer-weight and sharp.',
    details: ['Cotton poplin', 'Button-down collar', 'Curved hem', 'Regular fit'],
    fit3d: { type: 'shirt', color: '#2f5c86', sleeve: 'long', texture: 'check', check: '#f3f3f0' },
  },
  {
    id: 'hs-205', slug: 'prl-poplin-shirt-navy', name: 'Poplin Shirt', color: 'Navy', brand: 'Polo Ralph Lauren',
    category: 'shirts', sub: 'Casual', price: 54, badge: 'One of one',
    sizes: ['M'], images: [cdn('A5264C2B-5B2F-4A57-AA7E-E8E3212B88C0.jpg', 1786293690)],
    swatch: '#1d2a4a',
    desc: 'Navy poplin with a button-down collar and contrast blue pony at the chest. Authentic and quality-checked — only one available.',
    details: ['Cotton poplin', 'Button-down collar', 'Quality checked & cleaned', 'Only one available'],
    fit3d: { type: 'shirt', color: '#1d2a4a', sleeve: 'long', texture: 'oxford' },
  },
  {
    id: 'hs-206', slug: 'prl-oxford-shirt-yellow', name: 'Oxford Shirt', color: 'Soft Yellow', brand: 'Polo Ralph Lauren',
    category: 'shirts', sub: 'Oxford', price: 54, badge: 'One of one',
    sizes: ['L'], images: [cdn('121B1910-AB08-4DE4-8B3F-42A305526AD3.jpg', 1786293690)],
    swatch: '#f1e3a6',
    desc: 'Soft yellow oxford with a button-down collar and single chest pony. Authentic — only one available.',
    details: ['Cotton oxford', 'Button-down collar', 'Quality checked & cleaned', 'Only one available'],
    fit3d: { type: 'shirt', color: '#efe0a2', sleeve: 'long', texture: 'oxford' },
  },
  {
    id: 'hs-207', slug: 'prl-tartan-check-shirt', name: 'Tartan Check Shirt', color: 'Burgundy & Navy', brand: 'Polo Ralph Lauren',
    category: 'shirts', sub: 'Flannel', price: 54, badge: 'One of one',
    sizes: ['L'], images: [cdn('71FEC3F4-A85F-4ACF-B8EF-27AA37999E78.jpg', 1786293689)],
    swatch: '#5b1f2a',
    desc: 'Long-sleeve tartan in burgundy and navy with a fine yellow windowpane line. Authentic — only one available.',
    details: ['Cotton twill', 'Button-down collar', 'Quality checked & cleaned', 'Only one available'],
    fit3d: { type: 'shirt', color: '#5b1f2a', sleeve: 'long', texture: 'check', check: '#1d2a4a' },
  },

  // ───────────── PANTS, DENIM & CHINOS ─────────────
  {
    id: 'hs-301', slug: 'indigo-straight-jeans', name: 'Straight Leg Jeans', color: 'Mid Indigo', brand: 'H&S Denim',
    category: 'pants', sub: 'Jeans', price: 48, compareAt: 69, badge: 'Bestseller',
    sizes: WAIST_SIZES, images: ['/img/jeans-indigo-straight.webp'],
    swatch: '#34507a',
    desc: 'Rigid-feel stonewashed indigo with a classic straight leg and gold contrast stitching. The jean that goes with everything.',
    details: ['100% cotton denim, 12 oz', 'Mid rise, straight leg', 'Five-pocket styling', '32" inseam — hem to taste'],
    fit3d: { type: 'pants', color: '#35517b', rise: 'mid', leg: 'straight', texture: 'denim' },
  },
  {
    id: 'hs-302', slug: 'black-straight-jeans', name: 'Black Straight Jeans', color: 'Jet Black', brand: 'H&S Denim',
    category: 'pants', sub: 'Jeans', price: 48,
    sizes: WAIST_SIZES, images: ['/img/jeans-black-straight.webp', '/img/look-beige-crest-polo.webp'],
    swatch: '#151517',
    desc: 'Deep jet-black denim in a straight cut that holds its color wash after wash. Dress it up or down.',
    details: ['Cotton denim with a touch of stretch', 'Mid rise, straight leg', 'Five-pocket styling', '32" inseam'],
    fit3d: { type: 'pants', color: '#161618', rise: 'mid', leg: 'straight', texture: 'denim' },
  },
  {
    id: 'hs-303', slug: 'light-wash-slim-jeans', name: 'Light Wash Slim Jeans', color: 'Light Blue', brand: 'H&S Denim',
    category: 'pants', sub: 'Jeans', price: 44,
    sizes: WAIST_SIZES, images: ['/img/jeans-light-skinny.webp'],
    swatch: '#6f93b8',
    desc: 'Faded light-wash stretch denim with subtle abrasions and a slim tapered leg.',
    details: ['Stretch cotton denim', 'Mid rise, slim taper', 'Light distressing', '32" inseam'],
    fit3d: { type: 'pants', color: '#6d92b8', rise: 'mid', leg: 'skinny', texture: 'denim' },
  },
  {
    id: 'hs-304', slug: 'wide-leg-jeans-bleach', name: 'Wide Leg Jeans', color: 'Bleach Blue', brand: 'H&S Denim',
    category: 'pants', sub: 'Jeans', price: 49, badge: 'Trending',
    sizes: WAIST_SIZES, images: ['/img/look-white-graphic-tee.webp'],
    swatch: '#bcd0de',
    desc: 'Super-light bleach-wash denim cut wide and relaxed with a long, pooling hem. The silhouette of the season.',
    details: ['100% cotton denim', 'High-mid rise, wide leg', 'Relaxed through thigh', '33" inseam'],
    fit3d: { type: 'pants', color: '#bdd0de', rise: 'high', leg: 'wide', texture: 'denim' },
  },
  {
    id: 'hs-305', slug: 'slim-chino-sky', name: 'Slim Chino', color: 'Sky Blue', brand: 'H&S Select',
    category: 'pants', sub: 'Chinos', price: 38, compareAt: 52,
    sizes: WAIST_SIZES, images: ['/img/chino-sky.webp'],
    swatch: '#a9c1cc',
    desc: 'Brushed cotton-twill chino in a cool sky blue with a slim leg and button-tab waist.',
    details: ['Cotton twill with stretch', 'Mid rise, slim leg', 'Slant front pockets', '32" inseam'],
    fit3d: { type: 'pants', color: '#a8c0cb', rise: 'mid', leg: 'slim', texture: 'twill' },
  },
  {
    id: 'hs-306', slug: 'slim-chino-sage', name: 'Slim Chino', color: 'Sage', brand: 'H&S Select',
    category: 'pants', sub: 'Chinos', price: 38, compareAt: 52,
    sizes: WAIST_SIZES, images: ['/img/chino-sage.webp'],
    swatch: '#6f9681',
    desc: 'Our slim chino in an earthy sage green. Soft, structured, endlessly wearable.',
    details: ['Cotton twill with stretch', 'Mid rise, slim leg', 'Slant front pockets', '32" inseam'],
    fit3d: { type: 'pants', color: '#6f9681', rise: 'mid', leg: 'slim', texture: 'twill' },
  },
  {
    id: 'hs-307', slug: 'slim-chino-navy', name: 'Slim Chino', color: 'Midnight Navy', brand: 'H&S Select',
    category: 'pants', sub: 'Chinos', price: 38,
    sizes: WAIST_SIZES, images: ['/img/look-oxford-navy-chino.webp'],
    swatch: '#1e2639',
    desc: 'Midnight navy chino — the smartest pair in your rotation. Wear it with an oxford and clean sneakers.',
    details: ['Cotton twill with stretch', 'Mid rise, slim leg', 'Welt back pockets', '32" inseam'],
    fit3d: { type: 'pants', color: '#1f283b', rise: 'mid', leg: 'slim', texture: 'twill' },
  },
  {
    id: 'hs-308', slug: 'pleated-drawstring-trouser-stone', name: 'Pleated Drawstring Trouser', color: 'Stone', brand: 'H&S Studio',
    category: 'pants', sub: 'Trousers', price: 42, badge: 'New',
    sizes: WAIST_SIZES, images: ['/img/trouser-stone.webp', '/img/tee-abstraction-look.webp'],
    swatch: '#c5b48f',
    desc: 'Relaxed stone trouser with front pleats and a cord drawstring. Tailored look, sweatpant comfort.',
    details: ['Cotton-blend twill', 'Elastic back, cord drawstring', 'Single front pleat', 'Relaxed straight leg'],
    fit3d: { type: 'pants', color: '#c6b48e', rise: 'mid', leg: 'straight', texture: 'twill' },
  },
  {
    id: 'hs-309', slug: 'relaxed-drawstring-trouser-black', name: 'Relaxed Drawstring Trouser', color: 'Black', brand: 'H&S Studio',
    category: 'pants', sub: 'Trousers', price: 39,
    sizes: WAIST_SIZES, images: ['/img/trouser-black.webp'],
    swatch: '#16171b',
    desc: 'Black wide straight trouser with a drawstring waist — the easy partner to every oversized tee.',
    details: ['Cotton-poly terry', 'Drawstring waist', 'Side seam pockets', 'Wide straight leg'],
    fit3d: { type: 'pants', color: '#17181c', rise: 'mid', leg: 'wide', texture: 'twill' },
  },
  {
    id: 'hs-310', slug: 'hollister-cargo-trouser-khaki', name: 'Cargo Pull-On Trousers', color: 'Khaki', brand: 'Hollister',
    category: 'pants', sub: 'Trousers', price: 48, badge: 'One of one',
    sizes: ['32'], images: [cdn('IMG-6610.jpg', 1786293210)],
    swatch: '#b59d72',
    desc: 'Khaki cargo trousers with a drawstring waist and flap pockets at both thighs. Tagged M (fits 31–33" waist) — only one available.',
    details: ['Cotton twill', 'Drawstring waist', 'Flap cargo pockets', 'Only one available'],
    fit3d: { type: 'pants', color: '#b59d72', rise: 'mid', leg: 'straight', texture: 'twill' },
  },

  // ───────────── SHOES ─────────────
  {
    id: 'hs-401', slug: 'adidas-samba-og-white-black', name: 'Samba OG', color: 'White & Black', brand: 'adidas',
    category: 'shoes', sub: 'Sneakers', price: 89, badge: 'One of one',
    sizes: ['9'], images: [cdn('78E2BDAF-A92C-4819-B971-4243C8028722.jpg', 1786293690)],
    swatch: '#f4f3ef',
    desc: 'The terrace icon in white leather with black three stripes, a suede T-toe and gum sole. Quality checked; condition shown in photos.',
    details: ['Leather upper, suede overlay', 'Gum rubber cupsole', 'Preloved — condition checked', 'Only one available'],
    fit3d: { type: 'shoe', color: '#f4f3ef', sole: '#b98a4f' },
  },
  {
    id: 'hs-402', slug: 'nike-air-max-plus-black-red', name: 'Air Max Plus', color: 'Black & Red', brand: 'Nike',
    category: 'shoes', sub: 'Sneakers', price: 129, badge: 'One of one',
    sizes: ['10'], images: [cdn('h-s-apparel-nike-air-max-plus-black-red.jpg', 1785535075)],
    swatch: '#1a1a1a',
    desc: 'Black mesh with glossy red overlays and visible Air units. Loud, comfortable, unmistakable.',
    details: ['Mesh and synthetic upper', 'Visible Air cushioning', 'Preloved — condition checked', 'Only one available'],
    fit3d: { type: 'shoe', color: '#1a1a1a', sole: '#c62828' },
  },

  // ───────────── SETS ─────────────
  {
    id: 'hs-501', slug: 'peach-tee-black-trouser-set', name: 'Weekend Co-ord Set', color: 'Peach / Black', brand: 'H&S Studio',
    category: 'sets', sub: 'Sets', price: 62, compareAt: 68, badge: 'Save $6',
    sizes: TOP_SIZES, images: ['/img/set-peach-black.webp', '/img/tee-hustle-back.webp', '/img/trouser-black.webp'],
    swatch: '#f0d4b6',
    desc: 'The Hustle Grind oversized tee paired with our relaxed black drawstring trouser — one size, one click, one complete fit.',
    details: ['Includes oversized tee + drawstring trouser', 'Trouser size matched to top size', 'Cotton jersey & terry', 'Save $6 vs. buying separately'],
    fit3d: { type: 'set', top: { type: 'tee', color: '#f1d6ba', sleeve: 'elbow', fit: 'oversized', texture: 'jersey' }, bottom: { type: 'pants', color: '#17181c', rise: 'mid', leg: 'wide', texture: 'twill' } },
  },
  {
    id: 'hs-502', slug: 'city-tee-stone-trouser-set', name: 'City Co-ord Set', color: 'Ivory / Stone', brand: 'H&S Studio',
    category: 'sets', sub: 'Sets', price: 64, compareAt: 71, badge: 'Save $7',
    sizes: TOP_SIZES, images: ['/img/tee-abstraction-look.webp', '/img/trouser-stone.webp', '/img/tee-abstraction-front.webp'],
    swatch: '#efe9dc',
    desc: 'The Abstraction oversized tee with the pleated stone drawstring trouser — exactly as styled in our lookbook.',
    details: ['Includes oversized tee + pleated trouser', 'Trouser size matched to top size', 'Heavyweight cotton & twill', 'Save $7 vs. buying separately'],
    fit3d: { type: 'set', top: { type: 'tee', color: '#efe9dc', sleeve: 'elbow', fit: 'oversized', texture: 'jersey', print: '#7d7a45' }, bottom: { type: 'pants', color: '#c6b48e', rise: 'mid', leg: 'straight', texture: 'twill' } },
  },

  // ───────────── WOMEN — first drop preview ─────────────
  {
    id: 'hs-601', slug: 'pintuck-floral-blouse', name: 'Pintuck Floral Blouse', color: 'Ochre & Cream', brand: 'H&S Woman',
    category: 'women', sub: 'Tops', price: 42, badge: 'First drop',
    sizes: ['S', 'M'], images: [cdn('IMG-6565.jpg', 1786293981)],
    swatch: '#c99a3b',
    desc: 'Ochre and cream block-print floral blouse with pintuck pleating at the yoke and a crochet lace strip down the placket.',
    details: ['Cotton voile', 'Pintuck yoke', 'Crochet lace placket', 'Only one available'],
    fit3d: null,
  },
  {
    id: 'hs-602', slug: 'floral-tapestry-jacket', name: 'Floral Tapestry Jacket', color: 'Cream & Burgundy', brand: 'H&S Woman',
    category: 'women', sub: 'Jackets', price: 59, badge: 'First drop',
    sizes: ['M'], images: [cdn('2F21389C-3F58-4FCA-A6CC-D44CBAF7E6EA.jpg', 1786293690)],
    swatch: '#ead9c0',
    desc: 'Collarless open-front tapestry jacket woven with roses and irises in burgundy and sage over a cream ground, with burgundy piping.',
    details: ['Woven tapestry', 'Open front, collarless', 'Burgundy piping', 'Only one available'],
    fit3d: null,
  },
];

export const SHIPPING = {
  freeOver: 99,
  methods: [
    { id: 'standard', name: 'Standard International', price: 9.95, days: [10, 15], note: 'Tracked door-to-door' },
    { id: 'express', name: 'Express Priority', price: 24.95, days: [6, 9], note: 'DHL / FedEx priority, tracked' },
  ],
};

export const productById = (id) => PRODUCTS.find((p) => p.id === id);
export const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);

/** Recalculate an order from item ids — used by both cart UI and the server. */
export function priceOrder(items, shippingMethodId = 'standard') {
  const lines = [];
  for (const it of items || []) {
    const p = productById(it.id);
    if (!p) continue;
    const qty = Math.max(1, Math.min(10, parseInt(it.qty, 10) || 1));
    if (!p.sizes.includes(String(it.size))) continue;
    lines.push({ id: p.id, name: `${p.brand === 'H&S Select' || p.brand?.startsWith('H&S') ? '' : p.brand + ' '}${p.name} — ${p.color}`.trim(), size: String(it.size), qty, unit: p.price, total: +(p.price * qty).toFixed(2) });
  }
  const subtotal = +lines.reduce((s, l) => s + l.total, 0).toFixed(2);
  const method = SHIPPING.methods.find((m) => m.id === shippingMethodId) || SHIPPING.methods[0];
  let shipping = method.price;
  if (method.id === 'standard' && subtotal >= SHIPPING.freeOver) shipping = 0;
  if (!lines.length) shipping = 0;
  const total = +(subtotal + shipping).toFixed(2);
  return { lines, subtotal, shipping, method, total };
}
