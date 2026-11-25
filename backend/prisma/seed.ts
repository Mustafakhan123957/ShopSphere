import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Precision-engineered audio, computing accessories, and smart everyday tech.',
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Minimalist lighting, ceramicware, and ergonomic essentials for modern spaces.',
  },
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    description: 'Timeless everyday wardrobe staples crafted from breathable, durable fabrics.',
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Performance gear, hydration bottles, and travel-ready outdoor equipment.',
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Curated design monographs, fountain pens, and archival-grade notebooks.',
  },
];

const productsData = [
  // Electronics (5)
  {
    name: 'Studio ANC Wireless Headphones',
    slug: 'studio-anc-wireless-headphones',
    description:
      'Active noise-canceling over-ear headphones with 40-hour battery life, multipoint Bluetooth 5.3, and memory-foam ear cushions.',
    price: 249.99,
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'electronics',
    isFeatured: true,
  },
  {
    name: 'Tactile Mechanical Keyboard 75%',
    slug: 'tactile-mechanical-keyboard-75',
    description:
      'Compact aluminum-frame 75% mechanical keyboard with hot-swappable tactile switches, PBT keycaps, and USB-C / wireless connectivity.',
    price: 159.0,
    stock: 19,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'electronics',
    isFeatured: true,
  },
  {
    name: '4K USB-C Aluminum Hub',
    slug: '4k-usb-c-aluminum-hub',
    description:
      '7-in-1 anodized aluminum USB-C hub featuring 4K@60Hz HDMI, 100W PD pass-through charging, Gigabit Ethernet, and SD card reader.',
    price: 64.5,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'electronics',
    isFeatured: false,
  },
  {
    name: 'Minimalist Smart Desk Clock',
    slug: 'minimalist-smart-desk-clock',
    description:
      'Matte-finish LED desk clock with ambient light sensor, Pomodoro focus timer, and dual silent alarms.',
    price: 49.0,
    stock: 34,
    imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'electronics',
    isFeatured: false,
  },
  {
    name: 'Portable MagSafe Power Bank 10K',
    slug: 'portable-magsafe-power-bank-10k',
    description:
      'Slim 10,000mAh magnetic wireless battery pack with 20W USB-C fast charging and integrated aluminum kickstand.',
    price: 54.99,
    stock: 52,
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'electronics',
    isFeatured: false,
  },

  // Home & Living (5)
  {
    name: 'Nordic Ceramic Pour-Over Set',
    slug: 'nordic-ceramic-pour-over-set',
    description:
      'Hand-glazed stoneware coffee dripper and matching 600ml carafe designed for clean, balanced morning brews.',
    price: 68.0,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'home-living',
    isFeatured: true,
  },
  {
    name: 'Architect LED Task Lamp',
    slug: 'architect-led-task-lamp',
    description:
      'Articulated matte-black aluminum desk lamp with stepless dimming, warm-to-daylight color temperature control, and weighted base.',
    price: 118.0,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'home-living',
    isFeatured: true,
  },
  {
    name: 'Woven Merino Throw Blanket',
    slug: 'woven-merino-throw-blanket',
    description:
      'Soft, breathable 100% merino wool throw blanket in oatmeal herringbone weave. Generously sized at 140 x 200 cm.',
    price: 129.0,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'home-living',
    isFeatured: false,
  },
  {
    name: 'Fluted Glass Tumbler Set (4-Pack)',
    slug: 'fluted-glass-tumbler-set',
    description:
      'Set of four borosilicate fluted drinking glasses, stackable and dishwasher safe for everyday hydration or cocktails.',
    price: 38.0,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'home-living',
    isFeatured: false,
  },
  {
    name: 'Cedar & Bergamot Soy Candle',
    slug: 'cedar-bergamot-soy-candle',
    description:
      'Small-batch natural soy wax candle in a reusable amber apothecary jar with 55-hour clean burn time.',
    price: 32.0,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'home-living',
    isFeatured: false,
  },

  // Fashion & Apparel (5)
  {
    name: 'Heavyweight Organic Cotton Hoodie',
    slug: 'heavyweight-organic-cotton-hoodie',
    description:
      '450gsm brushed organic cotton fleece hoodie with relaxed drop-shoulder fit and double-lined hood.',
    price: 89.0,
    stock: 36,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'fashion-apparel',
    isFeatured: true,
  },
  {
    name: 'Classic Leather Minimalist Sneakers',
    slug: 'classic-leather-minimalist-sneakers',
    description:
      'Full-grain Italian calfskin low-top sneakers with stitched rubber cupsole and cushioned Ortholite insole.',
    price: 165.0,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'fashion-apparel',
    isFeatured: true,
  },
  {
    name: 'Water-Resistant Commuter Backpack',
    slug: 'water-resistant-commuter-backpack',
    description:
      '22L ballistic nylon everyday backpack with suspended 16-inch laptop sleeve, hidden passport pocket, and luggage pass-through.',
    price: 135.0,
    stock: 29,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'fashion-apparel',
    isFeatured: false,
  },
  {
    name: 'Polarized Acetate Sunglasses',
    slug: 'polarized-acetate-sunglasses',
    description:
      'Hand-finished plant-based acetate frames with UV400 polarized CR-39 lenses and five-barrel stainless hinges.',
    price: 95.0,
    stock: 31,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'fashion-apparel',
    isFeatured: false,
  },
  {
    name: 'Merino Ribbed Beanie',
    slug: 'merino-ribbed-beanie',
    description:
      'Fine-gauge extra-fine merino wool cuff beanie that regulates warmth without itchiness.',
    price: 36.0,
    stock: 48,
    imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'fashion-apparel',
    isFeatured: false,
  },

  // Sports & Outdoors (5)
  {
    name: 'Insulated Stainless Steel Flask 1L',
    slug: 'insulated-stainless-steel-flask-1l',
    description:
      'Double-wall vacuum-insulated 18/8 stainless steel bottle that keeps drinks icy for 24 hours or hot for 12 hours.',
    price: 39.99,
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'sports-outdoors',
    isFeatured: true,
  },
  {
    name: 'Natural Cork Alignment Yoga Mat',
    slug: 'natural-cork-alignment-yoga-mat',
    description:
      '5mm natural tree-rubber base topped with antimicrobial Portuguese cork for superior wet-grip stability.',
    price: 84.0,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'sports-outdoors',
    isFeatured: false,
  },
  {
    name: 'Ultralight Trail Running Vest',
    slug: 'ultralight-trail-running-vest',
    description:
      'Breathable 8L stretch-mesh hydration vest with dual 500ml soft flasks and zippered phone pocket.',
    price: 112.0,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'sports-outdoors',
    isFeatured: false,
  },
  {
    name: 'Carbon-Fiber Trekking Poles (Pair)',
    slug: 'carbon-fiber-trekking-poles',
    description:
      '3-section folding carbon-fiber trekking poles with ergonomic cork grips and tungsten-carbide tips.',
    price: 98.0,
    stock: 17,
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'sports-outdoors',
    isFeatured: false,
  },
  {
    name: 'Compact Hammock & Tree Straps',
    slug: 'compact-hammock-tree-straps',
    description:
      'Ripstop parachute nylon camping hammock rated to 200kg, packed into an integrated stuff sack.',
    price: 58.0,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'sports-outdoors',
    isFeatured: false,
  },

  // Books & Stationery (4)
  {
    name: 'Hardcover Dot-Grid Studio Notebook',
    slug: 'hardcover-dot-grid-studio-notebook',
    description:
      'Lay-flat 120gsm fountain-pen-friendly ivory paper notebook with numbered pages, two ribbon markers, and linen cover.',
    price: 24.0,
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'books-stationery',
    isFeatured: true,
  },
  {
    name: 'Machined Brass Rollerball Pen',
    slug: 'machined-brass-rollerball-pen',
    description:
      'Precision CNC-machined solid brass pen that develops a unique natural patina over time. Takes standard ceramic refills.',
    price: 52.0,
    stock: 38,
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'books-stationery',
    isFeatured: false,
  },
  {
    name: 'Principles of Modern Product Design',
    slug: 'principles-of-modern-product-design',
    description:
      '288-page hardcover monograph exploring industrial design, typography, and human-centered ergonomics.',
    price: 44.0,
    stock: 26,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'books-stationery',
    isFeatured: false,
  },
  {
    name: 'Desk Organizer Walnut Tray',
    slug: 'desk-organizer-walnut-tray',
    description:
      'Hand-oiled American black walnut valet tray with milled compartments for pens, keys, earbuds, and cards.',
    price: 46.0,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80',
    categorySlug: 'books-stationery',
    isFeatured: false,
  },
];

async function main() {
  console.log('Seeding ShopSphere database...');

  // 1. Upsert categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryMap[cat.slug] = upserted.id;
  }
  console.log(`Seeded ${categoriesData.length} categories.`);

  // 2. Upsert products
  const seededProducts: Array<{ id: string; price: number }> = [];
  for (const prod of productsData) {
    const categoryId = categoryMap[prod.categorySlug];
    const upserted = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        imageUrl: prod.imageUrl,
        categoryId,
        isFeatured: prod.isFeatured,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        imageUrl: prod.imageUrl,
        categoryId,
        isFeatured: prod.isFeatured,
      },
    });
    seededProducts.push({ id: upserted.id, price: Number(upserted.price) });
  }
  console.log(`Seeded ${productsData.length} products.`);

  // 3. Upsert Admin and Customer users (development-only credentials)
  const adminPasswordHash = await bcrypt.hash('Admin123!Dev', 10);
  const customerPasswordHash = await bcrypt.hash('Customer123!Dev', 10);

  await prisma.user.upsert({
    where: { email: 'admin@shopsphere.local' },
    update: {
      firstName: 'Alex',
      lastName: 'Morgan',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@shopsphere.local',
      password: adminPasswordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@shopsphere.local' },
    update: {
      firstName: 'Jordan',
      lastName: 'Taylor',
      role: Role.CUSTOMER,
    },
    create: {
      email: 'customer@shopsphere.local',
      password: customerPasswordHash,
      firstName: 'Jordan',
      lastName: 'Taylor',
      role: Role.CUSTOMER,
    },
  });
  console.log('Seeded admin and customer accounts.');

  // 4. Seed default address for customer if none exists
  const existingAddress = await prisma.address.findFirst({
    where: { userId: customer.id },
  });

  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        street: '742 Evergreen Terrace, Apt 4B',
        city: 'Portland',
        state: 'OR',
        postalCode: '97205',
        country: 'United States',
        isDefault: true,
      },
    });
  }

  // 5. Seed a sample order for customer if none exists
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber: 'ORD-2026-1001' },
  });

  if (!existingOrder && seededProducts.length >= 2) {
    const p1 = seededProducts[0];
    const p2 = seededProducts[5];
    const totalAmount = Number((p1.price + p2.price * 2).toFixed(2));

    await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-1001',
        userId: customer.id,
        totalAmount,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        shippingAddress: {
          fullName: 'Jordan Taylor',
          street: '742 Evergreen Terrace, Apt 4B',
          city: 'Portland',
          state: 'OR',
          postalCode: '97205',
          country: 'United States',
        },
        items: {
          create: [
            {
              productId: p1.id,
              quantity: 1,
              price: p1.price,
            },
            {
              productId: p2.id,
              quantity: 2,
              price: p2.price,
            },
          ],
        },
      },
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
