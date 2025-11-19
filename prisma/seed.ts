import { config } from "dotenv";
import { PrismaClient, ProductStatus, UserRole, OrderStatus } from "@prisma/client";

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clean existing data (in reverse order of dependencies)
  console.log("🧹 Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.variantOptionSelection.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.variantImage.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productCollection.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.variantOption.deleteMany();
  await prisma.variantType.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.media.deleteMany();
  console.log("✓ Cleaned existing data\n");

  // 1. Create users
  console.log("👤 Creating users...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: "hashed_password_admin",
      role: UserRole.ADMIN,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      name: "John Doe",
      password: "hashed_password_john",
      role: UserRole.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      name: "Jane Smith",
      password: "hashed_password_jane",
      role: UserRole.CUSTOMER,
    },
  });
  console.log(`✓ Created ${3} users\n`);

  // 2. Create addresses
  console.log("📍 Creating addresses...");
  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "New York",
        province: "NY",
        zip: "10001",
        country: "US",
        phone: "+1234567890",
        isDefault: true,
      },
      {
        userId: customer2.id,
        firstName: "Jane",
        lastName: "Smith",
        address1: "456 Oak Avenue",
        city: "Los Angeles",
        province: "CA",
        zip: "90001",
        country: "US",
        phone: "+1987654321",
        isDefault: true,
      },
    ],
  });
  console.log(`✓ Created ${2} addresses\n`);

  // 3. Create categories
  console.log("📁 Creating categories...");
  const mensCategory = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: "mens-clothing",
      description: "Stylish clothing for men",
      isVisible: true,
      sortOrder: 1,
    },
  });

  const womensCategory = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: "womens-clothing",
      description: "Elegant clothing for women",
      isVisible: true,
      sortOrder: 2,
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Fashion accessories",
      isVisible: true,
      sortOrder: 3,
    },
  });

  // Create subcategories
  const shirtsCategory = await prisma.category.create({
    data: {
      name: "Shirts",
      slug: "shirts",
      description: "Casual and formal shirts",
      parentId: mensCategory.id,
      isVisible: true,
      sortOrder: 1,
    },
  });

  const dressesCategory = await prisma.category.create({
    data: {
      name: "Dresses",
      slug: "dresses",
      description: "Beautiful dresses for every occasion",
      parentId: womensCategory.id,
      isVisible: true,
      sortOrder: 1,
    },
  });
  console.log(`✓ Created ${5} categories\n`);

  // 4. Create collections
  console.log("🎨 Creating collections...");
  const summerCollection = await prisma.collection.create({
    data: {
      name: "Summer 2024",
      slug: "summer-2024",
      description: "Fresh and vibrant summer styles",
      isVisible: true,
      sortOrder: 1,
    },
  });

  const newArrivalsCollection = await prisma.collection.create({
    data: {
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Latest fashion trends",
      isVisible: true,
      sortOrder: 2,
    },
  });
  console.log(`✓ Created ${2} collections\n`);

  // 5. Create variant types and options
  console.log("🎨 Creating variant types...");
  const sizeType = await prisma.variantType.create({
    data: {
      name: "size",
      label: "Size",
      sortOrder: 1,
    },
  });

  const colorType = await prisma.variantType.create({
    data: {
      name: "color",
      label: "Color",
      sortOrder: 2,
    },
  });

  // Create size options
  const sizes = await prisma.variantOption.createMany({
    data: [
      { variantTypeId: sizeType.id, value: "xs", label: "Extra Small", sortOrder: 1 },
      { variantTypeId: sizeType.id, value: "s", label: "Small", sortOrder: 2 },
      { variantTypeId: sizeType.id, value: "m", label: "Medium", sortOrder: 3 },
      { variantTypeId: sizeType.id, value: "l", label: "Large", sortOrder: 4 },
      { variantTypeId: sizeType.id, value: "xl", label: "Extra Large", sortOrder: 5 },
    ],
  });

  // Create color options
  const colors = await prisma.variantOption.createMany({
    data: [
      { variantTypeId: colorType.id, value: "black", label: "Black", sortOrder: 1 },
      { variantTypeId: colorType.id, value: "white", label: "White", sortOrder: 2 },
      { variantTypeId: colorType.id, value: "red", label: "Red", sortOrder: 3 },
      { variantTypeId: colorType.id, value: "blue", label: "Blue", sortOrder: 4 },
      { variantTypeId: colorType.id, value: "green", label: "Green", sortOrder: 5 },
    ],
  });
  console.log(`✓ Created ${2} variant types with ${10} options\n`);

  // 6. Create products
  console.log("👕 Creating products...");

  // Product 1: Classic White T-Shirt
  const whiteTShirt = await prisma.product.create({
    data: {
      slug: "classic-white-tshirt",
      title: "Classic White T-Shirt",
      description: "A timeless classic white t-shirt made from premium cotton. Perfect for any casual occasion.",
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      basePrice: "29.99",
      compareAtPrice: "39.99",
      priceEnabled: true,
      trackInventory: true,
      inventoryQty: 150,
      lowStockThreshold: 20,
      brand: "BasicWear",
      vendor: "Cotton Co.",
      productType: "T-Shirt",
      material: "100% Cotton",
      careInstructions: "Machine wash cold, tumble dry low",
      madeIn: "USA",
      hasVariants: true,
      metaTitle: "Classic White T-Shirt - BasicWear",
      metaDescription: "Premium cotton white t-shirt. Comfortable, durable, and stylish.",
      publishedAt: new Date(),
    },
  });

  // Product 2: Blue Denim Jeans
  const denimJeans = await prisma.product.create({
    data: {
      slug: "blue-denim-jeans",
      title: "Blue Denim Jeans",
      description: "Classic blue denim jeans with a modern fit. Durable and comfortable for everyday wear.",
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      basePrice: "79.99",
      compareAtPrice: "99.99",
      priceEnabled: true,
      trackInventory: true,
      inventoryQty: 100,
      lowStockThreshold: 15,
      brand: "DenimPro",
      vendor: "Jeans Factory",
      productType: "Jeans",
      material: "98% Cotton, 2% Elastane",
      careInstructions: "Machine wash cold, hang dry",
      madeIn: "Italy",
      hasVariants: true,
      metaTitle: "Blue Denim Jeans - DenimPro",
      metaDescription: "Premium denim jeans with perfect fit and lasting quality.",
      publishedAt: new Date(),
    },
  });

  // Product 3: Summer Floral Dress
  const floralDress = await prisma.product.create({
    data: {
      slug: "summer-floral-dress",
      title: "Summer Floral Dress",
      description: "Beautiful floral dress perfect for summer days. Lightweight and breathable fabric.",
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      basePrice: "59.99",
      compareAtPrice: "79.99",
      priceEnabled: true,
      trackInventory: true,
      inventoryQty: 75,
      lowStockThreshold: 10,
      brand: "SummerVibes",
      vendor: "Fashion House",
      productType: "Dress",
      material: "100% Rayon",
      careInstructions: "Hand wash cold, lay flat to dry",
      madeIn: "France",
      hasVariants: true,
      metaTitle: "Summer Floral Dress - SummerVibes",
      metaDescription: "Elegant floral dress for warm weather. Comfortable and stylish.",
      publishedAt: new Date(),
    },
  });

  // Product 4: Leather Jacket
  const leatherJacket = await prisma.product.create({
    data: {
      slug: "leather-jacket-black",
      title: "Black Leather Jacket",
      description: "Premium leather jacket with classic design. Perfect for adding edge to any outfit.",
      status: ProductStatus.PUBLISHED,
      isFeatured: false,
      basePrice: "199.99",
      compareAtPrice: "249.99",
      priceEnabled: true,
      trackInventory: true,
      inventoryQty: 50,
      lowStockThreshold: 5,
      brand: "LeatherCraft",
      vendor: "Premium Leather Co.",
      productType: "Jacket",
      material: "100% Genuine Leather",
      careInstructions: "Professional leather cleaning only",
      madeIn: "Spain",
      hasVariants: true,
      metaTitle: "Black Leather Jacket - LeatherCraft",
      metaDescription: "Authentic leather jacket with timeless style and superior quality.",
      publishedAt: new Date(),
    },
  });

  // Product 5: Casual Sneakers
  const sneakers = await prisma.product.create({
    data: {
      slug: "casual-white-sneakers",
      title: "Casual White Sneakers",
      description: "Comfortable white sneakers for everyday wear. Minimalist design with maximum comfort.",
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      basePrice: "89.99",
      priceEnabled: true,
      trackInventory: true,
      inventoryQty: 120,
      lowStockThreshold: 20,
      brand: "ComfortWalk",
      vendor: "Footwear Inc.",
      productType: "Sneakers",
      material: "Leather upper, rubber sole",
      careInstructions: "Wipe clean with damp cloth",
      madeIn: "Portugal",
      hasVariants: false,
      metaTitle: "Casual White Sneakers - ComfortWalk",
      metaDescription: "Premium white sneakers combining style and comfort.",
      publishedAt: new Date(),
    },
  });

  console.log(`✓ Created ${5} products\n`);

  // 7. Link products to categories
  console.log("🔗 Linking products to categories...");
  await prisma.productCategory.createMany({
    data: [
      { productId: whiteTShirt.id, categoryId: shirtsCategory.id },
      { productId: whiteTShirt.id, categoryId: mensCategory.id },
      { productId: denimJeans.id, categoryId: mensCategory.id },
      { productId: floralDress.id, categoryId: dressesCategory.id },
      { productId: floralDress.id, categoryId: womensCategory.id },
      { productId: leatherJacket.id, categoryId: mensCategory.id },
      { productId: sneakers.id, categoryId: accessoriesCategory.id },
    ],
  });
  console.log(`✓ Linked products to categories\n`);

  // 8. Link products to collections
  console.log("🔗 Linking products to collections...");
  await prisma.productCollection.createMany({
    data: [
      { productId: whiteTShirt.id, collectionId: summerCollection.id, sortOrder: 1 },
      { productId: floralDress.id, collectionId: summerCollection.id, sortOrder: 2 },
      { productId: denimJeans.id, collectionId: newArrivalsCollection.id, sortOrder: 1 },
      { productId: leatherJacket.id, collectionId: newArrivalsCollection.id, sortOrder: 2 },
      { productId: sneakers.id, collectionId: newArrivalsCollection.id, sortOrder: 3 },
    ],
  });
  console.log(`✓ Linked products to collections\n`);

  // 9. Create product variants
  console.log("🎨 Creating product variants...");

  // Get variant options for easier reference
  const sizeOptions = await prisma.variantOption.findMany({
    where: { variantTypeId: sizeType.id },
  });
  const colorOptions = await prisma.variantOption.findMany({
    where: { variantTypeId: colorType.id },
  });

  const sizeSmall = sizeOptions.find((s) => s.value === "s");
  const sizeMedium = sizeOptions.find((s) => s.value === "m");
  const sizeLarge = sizeOptions.find((s) => s.value === "l");

  const colorBlack = colorOptions.find((c) => c.value === "black");
  const colorWhite = colorOptions.find((c) => c.value === "white");
  const colorBlue = colorOptions.find((c) => c.value === "blue");

  // White T-Shirt variants (sizes only)
  const tshirtSmall = await prisma.productVariant.create({
    data: {
      productId: whiteTShirt.id,
      sku: "WT-S-WHT",
      title: "Small - White",
      price: "29.99",
      inventoryQty: 50,
      sortOrder: 1,
    },
  });

  const tshirtMedium = await prisma.productVariant.create({
    data: {
      productId: whiteTShirt.id,
      sku: "WT-M-WHT",
      title: "Medium - White",
      price: "29.99",
      inventoryQty: 60,
      sortOrder: 2,
    },
  });

  const tshirtLarge = await prisma.productVariant.create({
    data: {
      productId: whiteTShirt.id,
      sku: "WT-L-WHT",
      title: "Large - White",
      price: "29.99",
      inventoryQty: 40,
      sortOrder: 3,
    },
  });

  // Link variant options to variants
  if (sizeSmall && colorWhite) {
    await prisma.variantOptionSelection.createMany({
      data: [
        { variantId: tshirtSmall.id, optionId: sizeSmall.id },
        { variantId: tshirtSmall.id, optionId: colorWhite.id },
        { variantId: tshirtMedium.id, optionId: sizeMedium!.id },
        { variantId: tshirtMedium.id, optionId: colorWhite.id },
        { variantId: tshirtLarge.id, optionId: sizeLarge!.id },
        { variantId: tshirtLarge.id, optionId: colorWhite.id },
      ],
    });
  }

  // Denim Jeans variants
  const jeansSmall = await prisma.productVariant.create({
    data: {
      productId: denimJeans.id,
      sku: "DJ-S-BLU",
      title: "Small - Blue",
      price: "79.99",
      inventoryQty: 30,
      sortOrder: 1,
    },
  });

  const jeansMedium = await prisma.productVariant.create({
    data: {
      productId: denimJeans.id,
      sku: "DJ-M-BLU",
      title: "Medium - Blue",
      price: "79.99",
      inventoryQty: 40,
      sortOrder: 2,
    },
  });

  if (sizeSmall && colorBlue) {
    await prisma.variantOptionSelection.createMany({
      data: [
        { variantId: jeansSmall.id, optionId: sizeSmall.id },
        { variantId: jeansSmall.id, optionId: colorBlue.id },
        { variantId: jeansMedium.id, optionId: sizeMedium!.id },
        { variantId: jeansMedium.id, optionId: colorBlue.id },
      ],
    });
  }

  // Floral Dress variants
  const dressSmall = await prisma.productVariant.create({
    data: {
      productId: floralDress.id,
      sku: "FD-S-FLO",
      title: "Small - Floral",
      price: "59.99",
      inventoryQty: 25,
      sortOrder: 1,
    },
  });

  const dressMedium = await prisma.productVariant.create({
    data: {
      productId: floralDress.id,
      sku: "FD-M-FLO",
      title: "Medium - Floral",
      price: "59.99",
      inventoryQty: 30,
      sortOrder: 2,
    },
  });

  if (sizeSmall) {
    await prisma.variantOptionSelection.createMany({
      data: [
        { variantId: dressSmall.id, optionId: sizeSmall.id },
        { variantId: dressMedium.id, optionId: sizeMedium!.id },
      ],
    });
  }

  // Leather Jacket variants
  const jacketMedium = await prisma.productVariant.create({
    data: {
      productId: leatherJacket.id,
      sku: "LJ-M-BLK",
      title: "Medium - Black",
      price: "199.99",
      inventoryQty: 25,
      sortOrder: 1,
    },
  });

  const jacketLarge = await prisma.productVariant.create({
    data: {
      productId: leatherJacket.id,
      sku: "LJ-L-BLK",
      title: "Large - Black",
      price: "199.99",
      inventoryQty: 25,
      sortOrder: 2,
    },
  });

  if (sizeMedium && colorBlack) {
    await prisma.variantOptionSelection.createMany({
      data: [
        { variantId: jacketMedium.id, optionId: sizeMedium.id },
        { variantId: jacketMedium.id, optionId: colorBlack.id },
        { variantId: jacketLarge.id, optionId: sizeLarge!.id },
        { variantId: jacketLarge.id, optionId: colorBlack.id },
      ],
    });
  }

  console.log(`✓ Created product variants\n`);

  // 10. Create reviews
  console.log("⭐ Creating reviews...");
  await prisma.review.createMany({
    data: [
      {
        productId: whiteTShirt.id,
        userId: customer1.id,
        rating: 5,
        title: "Perfect t-shirt!",
        content: "Great quality and fit. Exactly what I was looking for.",
        isVerified: true,
        isPublished: true,
      },
      {
        productId: whiteTShirt.id,
        userId: customer2.id,
        rating: 4,
        title: "Good value",
        content: "Nice t-shirt, slightly thin fabric but still good for the price.",
        isVerified: true,
        isPublished: true,
      },
      {
        productId: floralDress.id,
        userId: customer2.id,
        rating: 5,
        title: "Beautiful dress",
        content: "Absolutely love this dress! Perfect for summer events.",
        isVerified: true,
        isPublished: true,
      },
      {
        productId: denimJeans.id,
        userId: customer1.id,
        rating: 5,
        title: "Best jeans ever",
        content: "Comfortable fit, great quality denim. Highly recommend!",
        isVerified: true,
        isPublished: true,
      },
    ],
  });
  console.log(`✓ Created ${4} reviews\n`);

  // 11. Create shopping carts
  console.log("🛒 Creating shopping carts...");
  const cart1 = await prisma.cart.create({
    data: {
      userId: customer1.id,
      items: {
        create: [
          {
            productId: whiteTShirt.id,
            variantId: tshirtMedium.id,
            quantity: 2,
          },
        ],
      },
    },
  });

  const cart2 = await prisma.cart.create({
    data: {
      userId: customer2.id,
      items: {
        create: [
          {
            productId: floralDress.id,
            variantId: dressMedium.id,
            quantity: 1,
          },
        ],
      },
    },
  });
  console.log(`✓ Created ${2} shopping carts with items\n`);

  // 12. Create orders
  console.log("📦 Creating orders...");
  const customer1Address = await prisma.address.findFirst({
    where: { userId: customer1.id },
  });

  if (customer1Address) {
    await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-001`,
        userId: customer1.id,
        shippingAddressId: customer1Address.id,
        billingAddressId: customer1Address.id,
        orderStatus: OrderStatus.DELIVERED,
        subtotal: "59.98",
        taxAmount: "5.40",
        shippingCost: "10.00",
        total: "75.38",
        items: {
          create: [
            {
              productId: whiteTShirt.id,
              variantId: tshirtMedium.id,
              quantity: 2,
              price: "29.99",
              productTitle: "Classic White T-Shirt",
              variantTitle: "Medium",
              subtotal: "59.98",
            },
          ],
        },
      },
    });
  }

  const customer2Address = await prisma.address.findFirst({
    where: { userId: customer2.id },
  });

  if (customer2Address) {
    await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-002`,
        userId: customer2.id,
        shippingAddressId: customer2Address.id,
        billingAddressId: customer2Address.id,
        orderStatus: OrderStatus.PROCESSING,
        subtotal: "59.99",
        taxAmount: "5.40",
        shippingCost: "10.00",
        total: "75.39",
        items: {
          create: [
            {
              productId: floralDress.id,
              variantId: dressMedium.id,
              quantity: 1,
              price: "59.99",
              productTitle: "Summer Floral Dress",
              variantTitle: "Medium",
              subtotal: "59.99",
            },
          ],
        },
      },
    });
  }
  console.log(`✓ Created ${2} orders\n`);

  console.log("✅ Database seeding completed successfully!\n");
  console.log("📊 Summary:");
  console.log(`   - Users: 3`);
  console.log(`   - Addresses: 2`);
  console.log(`   - Categories: 5`);
  console.log(`   - Collections: 2`);
  console.log(`   - Products: 5`);
  console.log(`   - Variants: 9`);
  console.log(`   - Reviews: 4`);
  console.log(`   - Carts: 2`);
  console.log(`   - Orders: 2`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
