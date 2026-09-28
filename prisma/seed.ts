/**
 * Seed data for local development.
 *
 * Admin login: admin@gaurgram.in with the password in SEED_ADMIN_PASSWORD (.env).
 * If that variable is missing, a random password is generated and printed once.
 *
 * Demo customer: phone 9876500001 (OTP is shown on screen in dev mode).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const db = new PrismaClient();

const ist = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const addDays = (d: string, n: number) => {
  const x = new Date(d + "T00:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};

const categories = [
  { slug: "ghee", name: "Bilona Ghee", hindi: "घी", blurb: "Hand-churned from curd, slow-cooked on wood fire", pack: "jar", tint: "#fbf1dc" },
  { slug: "milk", name: "Fresh Milk", hindi: "दूध", blurb: "Milked at 4 AM, at your door by 7", pack: "bottle", tint: "#f4f5f0" },
  { slug: "dahi", name: "Dahi", hindi: "दही", blurb: "Set overnight in glass and clay", pack: "matka", tint: "#f6efe8" },
  { slug: "lassi", name: "Lassi & Chaach", hindi: "लस्सी", blurb: "Churned fresh every morning", pack: "bottle", tint: "#f3f1ea" },
  { slug: "kheer", name: "Kheer", hindi: "खीर", blurb: "Slow-reduced milk, served in kulhad", pack: "kulhad", tint: "#f7ece3" },
  { slug: "makhan-paneer", name: "Makhan & Paneer", hindi: "मक्खन", blurb: "White butter and soft malai paneer", pack: "jar", tint: "#fbf6e6" },
  { slug: "honey", name: "Raw Honey", hindi: "शहद", blurb: "Unheated, unfiltered, from farm hives", pack: "honey", tint: "#fcefd6" },
  { slug: "oils", name: "Cold-Pressed Oils", hindi: "कच्ची घानी", blurb: "Wooden-press, first extraction", pack: "oil", tint: "#f2f3e2" },
];

// GST included in prices, by category. Placeholder rates: confirm each with your CA (editable per product in admin).
const GST_BY_CATEGORY: Record<string, number> = { ghee: 5, milk: 0, dahi: 5, lassi: 5, kheer: 5, "makhan-paneer": 5, honey: 5, oils: 5 };

type V = { label: string; price: number; mrp: number; subPrice?: number };
type P = {
  slug: string; name: string; hindi: string; cat: string; tagline: string; description: string;
  delivery: "FRESH" | "SHIP"; subscribable?: boolean; pack: string; liquid: string; label?: string;
  gallery: string[]; highlights: string[]; ingredients: string; shelfLife: string; storage: string;
  badge?: string; rating: number; ratingCount: number; featured?: boolean; video?: string; variants: V[];
};

const products: P[] = [
  {
    slug: "desi-cow-bilona-ghee", name: "Desi Cow Bilona Ghee", hindi: "देसी गाय बिलोना घी", cat: "ghee",
    tagline: "Curd-churned, wood-fire slow cooked, danedar",
    description: "Whole milk from our desi cows is set into curd overnight, churned by hand in a wooden bilona at dawn, and the makhan is slowly simmered over a wood fire until it turns grainy and golden. About 28 litres of milk go into every litre of this ghee.",
    delivery: "SHIP", pack: "jar", liquid: "#e2a93b", badge: "Bestseller", rating: 4.9, ratingCount: 1284, featured: true,
    video: "/videos/ghee-bubbles.mp4",
    gallery: ["/images/makhan.jpg", "/videos/golden-drop.jpg", "/images/cow-desi.jpg"],
    highlights: ["Bilona method, hand-churned", "28 L milk per litre of ghee", "Glass jar, no plastic", "Lab report for every batch"],
    ingredients: "Desi cow milk curd (100%)", shelfLife: "12 months from manufacture", storage: "Keep lid closed, away from sunlight. No refrigeration needed.",
    variants: [{ label: "250 ml", price: 650, mrp: 720 }, { label: "500 ml", price: 1190, mrp: 1350 }, { label: "1 L", price: 2290, mrp: 2600 }],
  },
  {
    slug: "buffalo-bilona-ghee", name: "Buffalo Bilona Ghee", hindi: "भैंस का बिलोना घी", cat: "ghee",
    tagline: "Richer, whiter, made for mithai and tadka",
    description: "Made the same slow way from the milk of our buffaloes. Creamier and whiter than cow ghee, with a deeper aroma that sweet makers swear by.",
    delivery: "SHIP", pack: "jar", liquid: "#f1dca0", rating: 4.8, ratingCount: 412,
    gallery: ["/images/makhan.jpg", "/images/milk-bottles-line.jpg"],
    highlights: ["Bilona method", "Rich, grainy texture", "Glass jar", "Batch lab-tested"],
    ingredients: "Buffalo milk curd (100%)", shelfLife: "12 months", storage: "Cool, dry place. Use a dry spoon.",
    variants: [{ label: "500 ml", price: 890, mrp: 990 }, { label: "1 L", price: 1690, mrp: 1890 }],
  },
  {
    slug: "ghee-gift-box", name: "Ghee Gift Box", hindi: "घी उपहार", cat: "ghee",
    tagline: "Two 250 ml jars of cow and buffalo ghee in a wooden crate",
    description: "Our two ghees side by side in a reusable pine crate with a handwritten note. A thoughtful gift for Diwali, weddings and new mothers.",
    delivery: "SHIP", pack: "jar", liquid: "#e8b64c", badge: "Gift", rating: 4.9, ratingCount: 188,
    gallery: ["/images/makhan.jpg"],
    highlights: ["2 × 250 ml glass jars", "Reusable wooden crate", "Free gift note"],
    ingredients: "Desi cow ghee, buffalo ghee", shelfLife: "12 months", storage: "Cool, dry place",
    variants: [{ label: "2 × 250 ml", price: 1250, mrp: 1450 }],
  },
  {
    slug: "desi-cow-milk", name: "Desi Cow Milk", hindi: "देसी गाय का दूध", cat: "milk",
    tagline: "Raw, unprocessed, milked this morning",
    description: "Milked by hand at 4 AM, chilled within 30 minutes, bottled in glass and at your door by 7. No homogenisation, no additives, nothing taken out. Boil before use.",
    delivery: "FRESH", subscribable: true, pack: "bottle", liquid: "#fbfaf4", badge: "Daily", rating: 4.9, ratingCount: 2210, featured: true,
    video: "/videos/hand-milking.mp4",
    gallery: ["/images/milk-pour-jug.jpg", "/images/milk-bottles-line.jpg", "/images/milk-glass.jpg"],
    highlights: ["Milked 4 AM, delivered by 7", "Returnable glass bottle", "Never homogenised", "Chilled within 30 minutes"],
    ingredients: "Desi cow milk", shelfLife: "48 hours refrigerated", storage: "Refrigerate at below 4°C. Boil before use.",
    variants: [{ label: "500 ml", price: 55, mrp: 60, subPrice: 52 }, { label: "1 L", price: 98, mrp: 110, subPrice: 92 }],
  },
  {
    slug: "buffalo-milk", name: "Buffalo Milk", hindi: "भैंस का दूध", cat: "milk",
    tagline: "Thick, creamy, great for chai and paneer",
    description: "Full-cream buffalo milk from our own shed, bottled in glass the same morning.",
    delivery: "FRESH", subscribable: true, pack: "bottle", liquid: "#fffdf7", rating: 4.8, ratingCount: 960,
    gallery: ["/images/milk-pour-jar.jpg", "/images/milk-jar-cookies.jpg"],
    highlights: ["High fat, rich body", "Glass bottle", "Delivered by 7 AM"],
    ingredients: "Buffalo milk", shelfLife: "48 hours refrigerated", storage: "Refrigerate. Boil before use.",
    variants: [{ label: "500 ml", price: 45, mrp: 50, subPrice: 42 }, { label: "1 L", price: 85, mrp: 95, subPrice: 80 }],
  },
  {
    slug: "matka-dahi", name: "Matka Dahi", hindi: "मटका दही", cat: "dahi",
    tagline: "Set overnight in a clay pot, thick enough to cut",
    description: "Whole cow milk boiled, cooled and set overnight in an unglazed clay matka. The clay draws out extra water, which makes it thick and gently sour.",
    delivery: "FRESH", subscribable: true, pack: "matka", liquid: "#fbf8ef", badge: "Bestseller", rating: 4.9, ratingCount: 1540, featured: true,
    video: "/videos/yogurt-fruit.mp4",
    gallery: ["/images/dahi-bowl.jpg"],
    highlights: ["Set in clay overnight", "Thick, mildly sour", "No gelatin or thickeners"],
    ingredients: "Cow milk, live culture", shelfLife: "3 days refrigerated", storage: "Refrigerate",
    variants: [{ label: "400 g", price: 85, mrp: 95, subPrice: 80 }, { label: "1 kg", price: 190, mrp: 210, subPrice: 180 }],
  },
  {
    slug: "glass-set-dahi", name: "Glass-Set Dahi", hindi: "दही", cat: "dahi",
    tagline: "Everyday dahi, set in a returnable glass jar",
    description: "Our daily dahi, set straight into a glass jar so it arrives untouched. Creamy and mild, the way most homes like it for raita and lunch.",
    delivery: "FRESH", subscribable: true, pack: "jar", liquid: "#fbf8ef", label: "#3d6b3a", rating: 4.8, ratingCount: 720,
    gallery: ["/images/dahi-bowl.jpg"],
    highlights: ["Returnable glass jar", "Mild and creamy", "Made fresh daily"],
    ingredients: "Cow milk, live culture", shelfLife: "3 days refrigerated", storage: "Refrigerate",
    variants: [{ label: "500 g", price: 95, mrp: 105, subPrice: 88 }],
  },
  {
    slug: "meethi-lassi", name: "Meethi Lassi", hindi: "मीठी लस्सी", cat: "lassi",
    tagline: "Thick Punjabi lassi with a hint of jaggery",
    description: "Churned from our matka dahi and sweetened lightly with desi khand. Thick enough to need a spoon at the bottom.",
    delivery: "FRESH", subscribable: true, pack: "bottle", liquid: "#f8f1df", rating: 4.9, ratingCount: 830, featured: true,
    gallery: ["/images/milk-glass.jpg"],
    highlights: ["Churned every morning", "Sweetened with khand", "Glass bottle"],
    ingredients: "Dahi, desi khand, water", shelfLife: "2 days refrigerated", storage: "Refrigerate, shake well",
    variants: [{ label: "300 ml", price: 60, mrp: 65, subPrice: 55 }, { label: "1 L", price: 170, mrp: 190, subPrice: 160 }],
  },
  {
    slug: "kesar-lassi", name: "Kesar Badam Lassi", hindi: "केसर लस्सी", cat: "lassi",
    tagline: "Saffron, almond and cardamom",
    description: "Our meethi lassi with Kashmiri saffron, crushed almonds and green cardamom.",
    delivery: "FRESH", subscribable: true, pack: "bottle", liquid: "#f6dfa4", rating: 4.8, ratingCount: 410,
    gallery: ["/images/milk-glass.jpg"],
    highlights: ["Real saffron strands", "Crushed almonds", "Glass bottle"],
    ingredients: "Dahi, khand, almonds, saffron, cardamom", shelfLife: "2 days refrigerated", storage: "Refrigerate",
    variants: [{ label: "300 ml", price: 80, mrp: 90, subPrice: 75 }],
  },
  {
    slug: "namkeen-chaach", name: "Masala Chaach", hindi: "छाछ", cat: "lassi",
    tagline: "Buttermilk left after churning ghee, with jeera and pudina",
    description: "The real buttermilk from our bilona, spiced with roasted jeera, black salt and fresh mint. Light, cooling and good for digestion.",
    delivery: "FRESH", subscribable: true, pack: "bottle", liquid: "#eef1e4", label: "#3d6b3a", rating: 4.8, ratingCount: 650,
    gallery: ["/images/spices.jpg"],
    highlights: ["From the bilona churn", "Roasted jeera and mint", "Glass bottle"],
    ingredients: "Buttermilk, jeera, black salt, mint", shelfLife: "2 days refrigerated", storage: "Refrigerate",
    variants: [{ label: "300 ml", price: 40, mrp: 45, subPrice: 36 }, { label: "1 L", price: 110, mrp: 120, subPrice: 100 }],
  },
  {
    slug: "chawal-kheer", name: "Chawal Kheer", hindi: "चावल की खीर", cat: "kheer",
    tagline: "Milk reduced for three hours, served in kulhad",
    description: "Basmati rice slow-cooked in our full-cream milk until it thickens and turns pale gold, finished with cardamom and a few almonds. Packed in a clay kulhad.",
    delivery: "FRESH", pack: "kulhad", liquid: "#f5e7c4", badge: "Kulhad", rating: 4.9, ratingCount: 540, featured: true,
    gallery: ["/images/milk-pour-jar.jpg"],
    highlights: ["3-hour slow reduction", "Served in clay kulhad", "Cardamom and almond"],
    ingredients: "Milk, basmati rice, khand, cardamom, almonds", shelfLife: "2 days refrigerated", storage: "Refrigerate. Enjoy chilled.",
    variants: [{ label: "200 g", price: 90, mrp: 100 }, { label: "4 × 200 g", price: 340, mrp: 400 }],
  },
  {
    slug: "makhana-kheer", name: "Makhana Kheer", hindi: "मखाना खीर", cat: "kheer",
    tagline: "Roasted fox nuts in saffron milk",
    description: "Ghee-roasted makhana simmered in milk with saffron and jaggery. Light, festive and vrat-friendly.",
    delivery: "FRESH", pack: "kulhad", liquid: "#f3dca6", rating: 4.8, ratingCount: 260,
    gallery: ["/images/milk-pour-jar.jpg"],
    highlights: ["Vrat friendly", "Saffron and jaggery", "Clay kulhad"],
    ingredients: "Milk, makhana, jaggery, saffron, ghee", shelfLife: "2 days refrigerated", storage: "Refrigerate",
    variants: [{ label: "200 g", price: 110, mrp: 125 }],
  },
  {
    slug: "white-makhan", name: "White Makhan", hindi: "सफेद मक्खन", cat: "makhan-paneer",
    tagline: "Unsalted white butter straight off the bilona",
    description: "The soft white butter we lift from the churn each morning, before it becomes ghee. Unsalted and uncoloured.",
    delivery: "FRESH", subscribable: true, pack: "jar", liquid: "#fbf6e2", rating: 4.9, ratingCount: 380, featured: true,
    gallery: ["/images/makhan.jpg"],
    highlights: ["Hand-churned", "Unsalted", "Glass jar"],
    ingredients: "Cream from cow milk curd", shelfLife: "7 days refrigerated", storage: "Refrigerate",
    variants: [{ label: "200 g", price: 180, mrp: 200, subPrice: 170 }],
  },
  {
    slug: "malai-paneer", name: "Malai Paneer", hindi: "मलाई पनीर", cat: "makhan-paneer",
    tagline: "Soft, fresh paneer pressed at dawn",
    description: "Made from whole buffalo milk and pressed lightly so it stays soft. Crumbles in the hand, holds in the curry.",
    delivery: "FRESH", subscribable: true, pack: "jar", liquid: "#fffaf0", label: "#3d6b3a", rating: 4.8, ratingCount: 690,
    gallery: ["/images/paneer-dish.jpg"],
    highlights: ["Made the same morning", "No starch or fillers", "Glass container"],
    ingredients: "Buffalo milk, lemon", shelfLife: "3 days refrigerated", storage: "Refrigerate in water",
    variants: [{ label: "200 g", price: 120, mrp: 130, subPrice: 112 }, { label: "500 g", price: 285, mrp: 310, subPrice: 270 }],
  },
  {
    slug: "wild-forest-honey", name: "Wild Forest Honey", hindi: "जंगली शहद", cat: "honey",
    tagline: "Raw multi-flower honey from forest-edge hives",
    description: "Collected from hives kept along the forest edge. Never heated or micro-filtered, so it keeps its pollen, enzymes and full aroma. May crystallise in winter; that is a sign it is real.",
    delivery: "SHIP", pack: "honey", liquid: "#c9861b", badge: "Raw", rating: 4.9, ratingCount: 940, featured: true,
    video: "/videos/honey-jar.mp4",
    gallery: ["/images/honey-dipper.jpg", "/images/honey-jar.jpg"],
    highlights: ["Never heated", "Unfiltered, pollen intact", "Glass jar", "Batch lab-tested"],
    ingredients: "Raw honey (100%)", shelfLife: "24 months", storage: "Room temperature. Do not refrigerate.",
    variants: [{ label: "250 g", price: 299, mrp: 340 }, { label: "500 g", price: 549, mrp: 620 }],
  },
  {
    slug: "sarson-honey", name: "Mustard Blossom Honey", hindi: "सरसों शहद", cat: "honey",
    tagline: "Creamy winter honey from Punjab's mustard fields",
    description: "Bees feeding on flowering sarson make a pale honey that sets naturally into a smooth, spreadable cream.",
    delivery: "SHIP", pack: "honey", liquid: "#e9c46a", rating: 4.8, ratingCount: 310,
    gallery: ["/images/honey-jar.jpg", "/images/field-sunset.jpg"],
    highlights: ["Naturally creamy", "Single-flower", "Glass jar"],
    ingredients: "Raw mustard blossom honey", shelfLife: "24 months", storage: "Room temperature",
    variants: [{ label: "500 g", price: 449, mrp: 499 }],
  },
  {
    slug: "jamun-honey", name: "Jamun Honey", hindi: "जामुन शहद", cat: "honey",
    tagline: "Dark, slightly tart, from jamun orchards",
    description: "A darker honey with a gentle tartness, collected when jamun trees flower in spring.",
    delivery: "SHIP", pack: "honey", liquid: "#8a4b16", rating: 4.7, ratingCount: 140,
    gallery: ["/images/honey-dipper.jpg"],
    highlights: ["Seasonal harvest", "Deep, tart flavour", "Glass jar"],
    ingredients: "Raw jamun honey", shelfLife: "24 months", storage: "Room temperature",
    variants: [{ label: "250 g", price: 349, mrp: 390 }],
  },
  {
    slug: "kachi-ghani-mustard-oil", name: "Kachi Ghani Mustard Oil", hindi: "कच्ची घानी सरसों तेल", cat: "oils",
    tagline: "Wood-pressed from Punjab mustard, sharp and pungent",
    description: "Black mustard seed pressed slowly in a wooden kohlu at low temperature. We let it settle naturally for a week before bottling, with no filtering chemicals and no blending.",
    delivery: "SHIP", pack: "oil", liquid: "#d4a017", badge: "Wood-pressed", rating: 4.9, ratingCount: 870, featured: true,
    video: "/videos/oil-press.mp4",
    gallery: ["/images/oil-bottle.jpg", "/images/field-sunset.jpg"],
    highlights: ["Wooden kohlu press", "Naturally settled", "Glass bottle", "No blending"],
    ingredients: "Black mustard seed (100%)", shelfLife: "9 months", storage: "Cool, dark place",
    variants: [{ label: "1 L", price: 390, mrp: 440 }, { label: "2 × 1 L", price: 760, mrp: 880 }],
  },
  {
    slug: "cold-pressed-groundnut-oil", name: "Groundnut Oil", hindi: "मूंगफली तेल", cat: "oils",
    tagline: "Nutty, light, for everyday cooking",
    description: "Hand-picked groundnuts pressed cold in a wooden ghani. Light enough for daily sabzi, nutty enough for pakoras.",
    delivery: "SHIP", pack: "oil", liquid: "#e6c75a", rating: 4.8, ratingCount: 420,
    gallery: ["/images/oil-bottle.jpg"],
    highlights: ["Wooden ghani", "High smoke point", "Glass bottle"],
    ingredients: "Groundnut (100%)", shelfLife: "9 months", storage: "Cool, dark place",
    variants: [{ label: "1 L", price: 420, mrp: 470 }],
  },
  {
    slug: "cold-pressed-til-oil", name: "Til (Sesame) Oil", hindi: "तिल का तेल", cat: "oils",
    tagline: "For cooking, massage and abhyanga",
    description: "White sesame pressed cold. Traditionally used for cooking in winter and for oil massage.",
    delivery: "SHIP", pack: "oil", liquid: "#d9b45a", rating: 4.8, ratingCount: 205,
    gallery: ["/images/oil-bottle.jpg", "/images/spices-dark.jpg"],
    highlights: ["Cold-pressed", "Cooking and massage", "Glass bottle"],
    ingredients: "White sesame (100%)", shelfLife: "12 months", storage: "Cool, dark place",
    variants: [{ label: "500 ml", price: 380, mrp: 420 }],
  },
  {
    slug: "cold-pressed-coconut-oil", name: "Coconut Oil", hindi: "नारियल तेल", cat: "oils",
    tagline: "Cold-pressed from sun-dried copra",
    description: "Pressed from sun-dried copra without heat. Sets white in winter and melts clear in summer.",
    delivery: "SHIP", pack: "oil", liquid: "#f4f0e0", rating: 4.7, ratingCount: 160,
    gallery: ["/images/oil-bottle.jpg"],
    highlights: ["Cold-pressed", "Cooking, hair and skin", "Glass bottle"],
    ingredients: "Coconut (100%)", shelfLife: "12 months", storage: "Room temperature",
    variants: [{ label: "500 ml", price: 340, mrp: 380 }],
  },
];

const stories = [
  {
    key: "ghee", title: "Bilona Ghee", hindi: "बिलोना घी", sort: 1,
    intro: "Two days, 28 litres of milk and one wooden churn for every litre of ghee.",
    video: "/videos/ghee-bubbles.mp4", poster: "/videos/ghee-bubbles.jpg",
    steps: [
      { at: 0, title: "Milking at 4 AM", body: "Our desi cows are milked by hand after their morning feed." },
      { at: 3, title: "Set as curd overnight", body: "Whole milk is boiled, cooled and set with culture in clay pots." },
      { at: 6, title: "Churned in a bilona", body: "At dawn the curd is churned by hand until makhan rises." },
      { at: 9, title: "Slow-cooked on wood fire", body: "Makhan simmers for hours until it turns grainy and golden." },
      { at: 12, title: "Tested, jarred, sealed", body: "Each batch is lab-tested and poured into glass jars." },
    ],
  },
  {
    key: "milk", title: "Morning Milk", hindi: "सुबह का दूध", sort: 2,
    intro: "Three hours from udder to your doorstep, with nobody in between.",
    video: "/videos/hand-milking.mp4", poster: "/videos/hand-milking.jpg",
    steps: [
      { at: 0, title: "Hand milking, 4:00 AM", body: "Cows are milked by hand in the goshala, never by machine." },
      { at: 3, title: "Chilled in 30 minutes", body: "Milk is filtered through cloth and chilled to 4°C." },
      { at: 6, title: "Filled in glass", body: "Bottled in sterilised glass, sealed with a dated cap." },
      { at: 9, title: "At your door by 7", body: "Our own riders deliver across the Tricity in insulated crates." },
    ],
  },
  {
    key: "dahi", title: "Matka Dahi", hindi: "मटका दही", sort: 3,
    intro: "Set overnight in clay, the way it has been done for centuries.",
    video: "/videos/yogurt-fruit.mp4", poster: "/videos/yogurt-fruit.jpg",
    steps: [
      { at: 0, title: "Boil and cool", body: "Evening milk is boiled and cooled to lukewarm." },
      { at: 3, title: "Culture from yesterday", body: "A spoon of yesterday's dahi goes into each matka." },
      { at: 6, title: "Rest overnight", body: "The clay breathes, drawing out water and thickening the dahi." },
      { at: 9, title: "Delivered set", body: "Pots travel upright in cool crates and arrive untouched." },
    ],
  },
  {
    key: "honey", title: "Raw Honey", hindi: "कच्चा शहद", sort: 4,
    intro: "Our hives sit at the edge of the fields. We take only the surplus.",
    video: "/videos/bees-hive.mp4", poster: "/videos/bees-hive.jpg",
    steps: [
      { at: 0, title: "Hives on the farm edge", body: "Boxes are placed near mustard fields and forest flowers." },
      { at: 3, title: "Surplus frames only", body: "We leave enough honey for the colony through the season." },
      { at: 6, title: "Cold extraction", body: "Spun out without heat and strained through muslin." },
      { at: 9, title: "Straight into glass", body: "Jarred raw, so pollen and enzymes stay intact." },
    ],
  },
  {
    key: "oils", title: "Cold-Pressed Oils", hindi: "कच्ची घानी", sort: 5,
    intro: "A wooden kohlu turns slowly so the oil never heats up.",
    video: "/videos/oil-press.mp4", poster: "/videos/oil-press.jpg",
    steps: [
      { at: 0, title: "Seeds from our farmers", body: "Mustard, groundnut and sesame from farmers we know by name." },
      { at: 3, title: "Sun-dried and cleaned", body: "Seeds are dried in the open and cleaned by hand." },
      { at: 6, title: "Pressed in a wooden ghani", body: "Low speed, low heat, first extraction only." },
      { at: 9, title: "Settled for a week", body: "Oil clears naturally before it is bottled in glass." },
    ],
  },
];

const pincodes: [string, string, string][] = [
  ["160001", "Sector 1–10", "Chandigarh"], ["160002", "Industrial Area", "Chandigarh"], ["160003", "Sector 17", "Chandigarh"],
  ["160008", "Sector 7–8", "Chandigarh"], ["160009", "Sector 9", "Chandigarh"], ["160011", "Sector 11", "Chandigarh"],
  ["160014", "Sector 14 / PU", "Chandigarh"], ["160015", "Sector 15", "Chandigarh"], ["160017", "Sector 17–18", "Chandigarh"],
  ["160018", "Sector 18", "Chandigarh"], ["160019", "Sector 19", "Chandigarh"], ["160020", "Sector 20", "Chandigarh"],
  ["160022", "Sector 22", "Chandigarh"], ["160023", "Sector 23", "Chandigarh"], ["160030", "Sector 30", "Chandigarh"],
  ["160031", "Sector 31 / Ram Darbar", "Chandigarh"], ["160035", "Sector 35", "Chandigarh"], ["160036", "Sector 36–37", "Chandigarh"],
  ["160047", "Sector 47", "Chandigarh"],
  ["160055", "Phase 7–11", "Mohali"], ["160059", "Phase 1–3", "Mohali"], ["160061", "Phase 5–6", "Mohali"],
  ["160062", "Sector 70–71", "Mohali"], ["160071", "Sector 66–69", "Mohali"], ["140308", "Aerocity / Sector 82", "Mohali"],
  ["140306", "Sector 115 / Kharar Road", "Mohali"],
  ["134101", "Sector 1–4", "Panchkula"], ["134109", "Sector 20–21", "Panchkula"], ["134112", "Sector 12", "Panchkula"],
  ["134113", "Sector 5–8", "Panchkula"], ["134114", "Sector 15–17", "Panchkula"], ["134116", "Sector 25–28", "Panchkula"],
  ["134117", "Pinjore Road", "Panchkula"],
  ["140603", "Zirakpur", "Zirakpur"], ["140604", "VIP Road / Peer Muchalla", "Zirakpur"], ["160104", "Dhakoli / Baltana", "Zirakpur"],
];

async function main() {
  // On deploys this runs with SEED_ONLY_IF_EMPTY=1 so a live database is never wiped.
  if (process.env.SEED_ONLY_IF_EMPTY === "1" && (await db.category.count()) > 0) {
    console.log("Database already has a catalogue, skipping seed.");
    return;
  }
  // Demo customers, orders and subscriptions are for local development only.
  const withDemo = process.env.SEED_DEMO_DATA !== "0";

  // Clean slate (order matters for relations)
  await db.walletTxn.deleteMany();
  await db.delivery.deleteMany();
  await db.dayOverride.deleteMany();
  await db.subscription.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.address.deleteMany();
  await db.otpCode.deleteMany();
  await db.user.deleteMany();
  await db.review.deleteMany();
  await db.batch.deleteMany();
  await db.variant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.makingStory.deleteMany();
  await db.popup.deleteMany();
  await db.pincode.deleteMany();
  await db.coupon.deleteMany();
  await db.admin.deleteMany();
  await db.banner.deleteMany();
  await db.holiday.deleteMany();
  await db.auditLog.deleteMany();

  const catIds: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await db.category.create({ data: { ...c, sort: i } });
    catIds[c.slug] = row.id;
  }

  const variantBySku: Record<string, string> = {};
  const productIds: Record<string, string> = {};
  for (const [i, p] of products.entries()) {
    const row = await db.product.create({
      data: {
        slug: p.slug, name: p.name, hindi: p.hindi, tagline: p.tagline, description: p.description,
        categoryId: catIds[p.cat], delivery: p.delivery, subscribable: !!p.subscribable, pack: p.pack,
        liquid: p.liquid, label: p.label ?? "#1c1a15", video: p.video ?? null,
        gallery: JSON.stringify(p.gallery), highlights: JSON.stringify(p.highlights),
        ingredients: p.ingredients, shelfLife: p.shelfLife, storage: p.storage, badge: p.badge ?? null,
        gstRate: p.slug === "malai-paneer" ? 0 : GST_BY_CATEGORY[p.cat] ?? 5,
        rating: p.rating, ratingCount: p.ratingCount, featured: !!p.featured, sort: i,
        variants: {
          create: p.variants.map((v, j) => ({
            label: v.label, price: v.price, mrp: v.mrp, subPrice: v.subPrice ?? null,
            sku: `${p.slug}-${v.label.replace(/[^a-z0-9]+/gi, "").toLowerCase()}`, sort: j, stock: 120,
          })),
        },
      },
      include: { variants: true },
    });
    productIds[p.slug] = row.id;
    for (const v of row.variants) variantBySku[v.sku] = v.id;
  }

  for (const s of stories)
    await db.makingStory.create({ data: { ...s, steps: JSON.stringify(s.steps) } });

  for (const [code, area, city] of pincodes) await db.pincode.create({ data: { code, area, city } });

  const t = ist();
  const popups = [
    { kind: "PRODUCTION", badge: "4:10", title: "Morning milking done: 212 L from 46 cows", subtitle: "Leaving the goshala for Mohali, Chandigarh and Panchkula" },
    { kind: "PRODUCTION", badge: "5:40", title: "Today's ghee batch GG-" + t.slice(5).replace("-", "") + "-A is on the fire", subtitle: "38 L of curd churned in the bilona at dawn" },
    { kind: "REVIEW", badge: "★ 5", title: "“Tastes exactly like my nani's ghee”", subtitle: "Verified buyer · Sector 70, Mohali" },
    { kind: "INFO", badge: "Glass", title: "Every bottle comes back to us", subtitle: "Leave empties outside, our rider collects them next morning" },
    { kind: "REVIEW", badge: "★ 5", title: "“Dahi is so thick it holds the spoon upright”", subtitle: "Verified subscriber · Panchkula" },
  ];
  for (const [i, p] of popups.entries()) await db.popup.create({ data: { ...p, sort: i } });

  const reviews = [
    ["desi-cow-bilona-ghee", "Ritu S.", "Mohali", 5, "The smell when you open the jar takes me back to my grandmother's kitchen. Grainy, golden, and you can tell it is not factory ghee."],
    ["desi-cow-bilona-ghee", "Arjun M.", "Bengaluru", 5, "Ordered to Bangalore, arrived well-packed in glass. Worth every rupee."],
    ["desi-cow-milk", "Neha K.", "Sector 35, Chandigarh", 5, "We switched from packet milk six months ago. The malai on top after boiling says it all."],
    ["desi-cow-milk", "Gurpreet S.", "Zirakpur", 5, "Always on time, even in fog. Skipping days from the app is easy when we travel."],
    ["matka-dahi", "Pooja R.", "Panchkula", 5, "Thick enough to hold a spoon upright. My kids eat it plain."],
    ["wild-forest-honey", "Vikram J.", "Pune", 5, "It crystallised in December, which is how I knew it was real."],
    ["kachi-ghani-mustard-oil", "Manpreet K.", "Ludhiana", 5, "Proper pungent kachi ghani. The pickles came out like my mother's."],
    ["chawal-kheer", "Sana A.", "Sector 22, Chandigarh", 5, "Ordered for a small puja. The kulhad makes it feel special."],
    ["meethi-lassi", "Rohit B.", "Mohali", 4, "Thick and not too sweet. Would love a bigger bottle option."],
  ] as const;
  for (const [slug, name, city, rating, body] of reviews)
    await db.review.create({ data: { productId: productIds[slug], name, city, rating, body, approved: true, featured: true } });
  await db.review.create({ data: { productId: productIds["buffalo-milk"], name: "Anil T.", city: "Kharar", rating: 4, body: "Good milk, but the bottle cap leaked once.", approved: false } });

  const batches = [
    ["GG-GHEE-" + t.replaceAll("-", "").slice(2) + "A", "desi-cow-bilona-ghee", -2, "42 jars × 500 ml", "99.6%", "0.1%"],
    ["GG-GHEE-" + addDays(t, -9).replaceAll("-", "").slice(2) + "B", "buffalo-bilona-ghee", -9, "30 jars × 500 ml", "99.7%", "0.1%"],
    ["GG-HNY-" + addDays(t, -20).replaceAll("-", "").slice(2), "wild-forest-honey", -20, "120 jars × 500 g", null, "17.2%"],
    ["GG-OIL-" + addDays(t, -12).replaceAll("-", "").slice(2), "kachi-ghani-mustard-oil", -12, "200 bottles × 1 L", null, null],
  ] as const;
  for (const [code, slug, d, quantity, fat, moisture] of batches)
    await db.batch.create({
      data: {
        code, productId: productIds[slug], madeOn: new Date(addDays(t, d) + "T06:00:00+05:30"),
        milkedOn: slug.includes("ghee") ? new Date(addDays(t, d - 2) + "T04:00:00+05:30") : null,
        // Ghee 12 months, honey 24, oil 9; the oil batch is set close to expiry to show the alert
        expiresOn: new Date(addDays(t, slug.includes("oil") ? 20 : slug.includes("honey") ? d + 730 : d + 365) + "T23:59:00+05:30"),
        quantity, fat, moisture, lab: "NABL-accredited partner lab (to be named)", result: "PASS",
        notes: "No vegetable fat detected. No added colour. Free from starch.",
      },
    });

  await db.coupon.createMany({
    data: [
      { code: "PEHLA10", kind: "PERCENT", value: 10, minOrder: 300, note: "10% off your first order" },
      { code: "GHEE100", kind: "FLAT", value: 100, minOrder: 1000, note: "₹100 off ghee orders above ₹1,000" },
    ],
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  if (!process.env.SEED_ADMIN_PASSWORD) console.log(`Admin password (generated, set SEED_ADMIN_PASSWORD to choose your own): ${adminPassword}`);
  await db.admin.create({
    data: { email: "admin@gaurgram.in", name: "Gaurgram Admin", role: "OWNER", password: await bcrypt.hash(adminPassword, 10) },
  });

  let orderNumber = "none";
  if (withDemo) {
    // Demo customer with a live milk subscription
    const user = await db.user.create({
      data: { phone: "9876500001", name: "Demo Customer", email: "demo@example.com", wallet: 0, bottlesOut: 4 },
    });
    const addr = await db.address.create({
      data: { userId: user.id, label: "Home", name: "Demo Customer", line1: "House 1234, Sector 70", landmark: "Near community centre", city: "Mohali", state: "Punjab", pincode: "160062" },
    });
    let bal = 0;
    const txn = async (amount: number, kind: string, note: string, daysAgo: number) => {
      bal += amount;
      await db.walletTxn.create({ data: { userId: user.id, amount, kind, note, balance: bal, createdAt: new Date(Date.now() - daysAgo * 86400000) } });
    };
    await txn(3000, "TOPUP", "UPI top-up", 14);
    await txn(-200, "DEPOSIT", "Bottle deposit (4 bottles)", 14);

    const milk = await db.subscription.create({
      data: {
        userId: user.id, variantId: variantBySku["desi-cow-milk-1l"], addressId: addr.id, pattern: "CUSTOM",
        weekQty: JSON.stringify([2, 1, 1, 1, 1, 1, 2]), qty: 1, startDate: addDays(t, -13), slot: "6–8 AM",
      },
    });
    const dahi = await db.subscription.create({
      data: {
        userId: user.id, variantId: variantBySku["matka-dahi-400g"], addressId: addr.id, pattern: "ALTERNATE",
        weekQty: "[0,0,0,0,0,0,0]", qty: 1, startDate: addDays(t, -12), slot: "6–8 AM",
      },
    });

    // Past deliveries
    for (let d = -13; d <= -1; d++) {
      const date = addDays(t, d);
      const dow = new Date(date + "T00:00:00Z").getUTCDay();
      const mq = [2, 1, 1, 1, 1, 1, 2][dow];
      await db.delivery.create({ data: { date, userId: user.id, subscriptionId: milk.id, variantId: milk.variantId, qty: mq, amount: mq * 92, status: "DELIVERED", deliveredAt: new Date(date + "T06:40:00+05:30") } });
      await txn(-mq * 92, "DEBIT", `Desi Cow Milk 1 L × ${mq} · ${date}`, -d);
      if ((d + 12) % 2 === 0) {
        await db.delivery.create({ data: { date, userId: user.id, subscriptionId: dahi.id, variantId: dahi.variantId, qty: 1, amount: 80, status: "DELIVERED", deliveredAt: new Date(date + "T06:45:00+05:30") } });
        await txn(-80, "DEBIT", `Matka Dahi 400 g · ${date}`, -d);
      }
    }
    await db.user.update({ where: { id: user.id }, data: { wallet: bal } });
    await db.dayOverride.create({ data: { subscriptionId: milk.id, date: addDays(t, 3), qty: 0 } });

    const order = await db.order.create({
      data: {
        number: "GG" + t.replaceAll("-", "").slice(2) + "001", userId: user.id, status: "SHIPPED", payment: "RAZORPAY", paymentStatus: "PAID",
        subtotal: 1739, deliveryFee: 0, total: 1739, address: JSON.stringify(addr), slot: "Courier · 3–5 days",
        createdAt: new Date(Date.now() - 3 * 86400000),
        items: {
          create: [
            { variantId: variantBySku["desi-cow-bilona-ghee-500ml"], name: "Desi Cow Bilona Ghee", label: "500 ml", price: 1190, qty: 1 },
            { variantId: variantBySku["wild-forest-honey-500g"], name: "Wild Forest Honey", label: "500 g", price: 549, qty: 1 },
          ],
        },
      },
    });

    // A few more customers and orders so the admin dashboard has life
    const names = ["Simran Kaur", "Rahul Verma", "Ananya Gupta", "Harjeet Singh", "Meera Nair", "Karan Malhotra"];
    const pins = ["160035", "134112", "140603", "160059", "160022", "134109"];
    for (const [i, name] of names.entries()) {
      const u = await db.user.create({ data: { phone: `98765000${10 + i}`, name, wallet: 400 + i * 150 } });
      const a = await db.address.create({ data: { userId: u.id, name, line1: `House ${200 + i * 37}`, city: pincodes.find((p) => p[0] === pins[i])?.[2] ?? "Chandigarh", pincode: pins[i] } });
      await db.subscription.create({
        data: {
          userId: u.id, variantId: variantBySku[i % 2 ? "desi-cow-milk-500ml" : "buffalo-milk-1l"], addressId: a.id,
          pattern: i % 3 === 0 ? "DAILY" : i % 3 === 1 ? "ALTERNATE" : "CUSTOM", qty: 1 + (i % 2),
          weekQty: JSON.stringify([1, 1, 0, 1, 0, 1, 2]), startDate: addDays(t, -5 - i), slot: i % 2 ? "5–7 AM" : "6–8 AM",
          status: i === 4 ? "PAUSED" : "ACTIVE",
        },
      });
      if (i % 2 === 0)
        await db.subscription.create({ data: { userId: u.id, variantId: variantBySku["meethi-lassi-300ml"], addressId: a.id, pattern: "DAILY", qty: 1, weekQty: "[0,0,0,0,0,0,0]", startDate: addDays(t, -3) } });
      await db.order.create({
        data: {
          number: "GG" + t.replaceAll("-", "").slice(2) + String(2 + i).padStart(3, "0"), userId: u.id,
          status: ["PLACED", "CONFIRMED", "PACKED", "DELIVERED", "OUT_FOR_DELIVERY", "PLACED"][i],
          payment: i % 3 === 0 ? "COD" : "RAZORPAY", paymentStatus: i % 3 === 0 ? "PENDING" : "PAID",
          subtotal: 650 + i * 120, deliveryFee: 0, total: 650 + i * 120, address: JSON.stringify(a),
          slot: "Tomorrow · 6–8 AM", createdAt: new Date(Date.now() - i * 5 * 3600000),
          items: { create: [{ variantId: variantBySku["desi-cow-bilona-ghee-250ml"], name: "Desi Cow Bilona Ghee", label: "250 ml", price: 650, qty: 1 }] },
        },
      });
    }
    orderNumber = order.number;

    // A scheduled promotion, to show banners switching on by date
    await db.banner.create({
      data: { placement: "HOME", title: "Diwali ghee hampers are here", subtitle: "Two jars of bilona ghee in a wooden crate, with a handwritten note. Ships across India.", cta: "Shop hampers", href: "/product/ghee-gift-box", tone: "ghee", startsOn: t, endsOn: addDays(t, 30) },
    });
  }

  console.log("Seeded", products.length, "products,", pincodes.length, "pincodes", withDemo ? `and demo data (order ${orderNumber})` : "without demo customers");
}

main().finally(() => db.$disconnect());
