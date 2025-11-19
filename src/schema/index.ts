import { builder } from "./builder.js";
import { hashPassword, comparePassword } from "../auth/password.js";
import { generateToken, generateRefreshToken } from "../auth/jwt.js";
import { prisma } from "../database.js";

// ============================================================================
// ENUMS
// ============================================================================

const UserRoleEnum = builder.enumType("UserRole", {
  values: ["CUSTOMER", "ADMIN"] as const,
});

const ProductStatusEnum = builder.enumType("ProductStatus", {
  values: ["DRAFT", "PUBLISHED", "ARCHIVED"] as const,
});

const OrderStatusEnum = builder.enumType("OrderStatus", {
  values: ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"] as const,
});

const PaymentStatusEnum = builder.enumType("PaymentStatus", {
  values: ["PENDING", "PAID", "FAILED", "REFUNDED"] as const,
});

const FulfillmentStatusEnum = builder.enumType("FulfillmentStatus", {
  values: ["UNFULFILLED", "PARTIALLY_FULFILLED", "FULFILLED", "RETURNED"] as const,
});

// ============================================================================
// USER TYPE
// ============================================================================

const User = builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name", { nullable: true }),
    role: t.expose("role", { type: UserRoleEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// ============================================================================
// AUTH RESPONSE TYPE
// ============================================================================

interface AuthResponseType {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    password: string;
    name: string | null;
    role: "ADMIN" | "CUSTOMER";
    createdAt: Date;
    updatedAt: Date;
  };
}

const AuthResponse = builder.objectRef<AuthResponseType>("AuthResponse");

AuthResponse.implement({
  fields: (t) => ({
    token: t.exposeString("token"),
    refreshToken: t.exposeString("refreshToken"),
    user: t.field({
      type: User,
      resolve: (parent) => parent.user,
    }),
  }),
});

// ============================================================================
// MEDIA (IMAGE) TYPE
// ============================================================================

const Media = builder.prismaObject("Media", {
  fields: (t) => ({
    id: t.exposeID("id"),
    url: t.exposeString("url"),
    thumbnailUrl: t.exposeString("thumbnailUrl", { nullable: true }),
    alt: t.exposeString("alt"),
    filename: t.exposeString("filename", { nullable: true }),
    mimeType: t.exposeString("mimeType", { nullable: true }),
    filesize: t.exposeInt("filesize", { nullable: true }),
    width: t.exposeInt("width", { nullable: true }),
    height: t.exposeInt("height", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// ============================================================================
// CATEGORY TYPE
// ============================================================================

const Category = builder.prismaObject("Category", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    slug: t.exposeString("slug"),
    description: t.exposeString("description", { nullable: true }),
    imageId: t.exposeInt("imageId", { nullable: true }),
    parentId: t.exposeString("parentId", { nullable: true }),
    sortOrder: t.exposeInt("sortOrder"),
    isVisible: t.exposeBoolean("isVisible"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    // Relations
    image: t.relation("image", { nullable: true }),
    parent: t.relation("parent", { nullable: true }),
    children: t.relation("children"),
  }),
});

// ============================================================================
// COLLECTION TYPE
// ============================================================================

const Collection = builder.prismaObject("Collection", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    slug: t.exposeString("slug"),
    description: t.exposeString("description", { nullable: true }),
    imageId: t.exposeInt("imageId", { nullable: true }),
    isVisible: t.exposeBoolean("isVisible"),
    sortOrder: t.exposeInt("sortOrder"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    // Relations
    image: t.relation("image", { nullable: true }),
  }),
});

// ============================================================================
// VARIANT TYPE & OPTION TYPE
// ============================================================================

const VariantType = builder.prismaObject("VariantType", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    label: t.exposeString("label"),
    sortOrder: t.exposeInt("sortOrder"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    options: t.relation("options"),
  }),
});

const VariantOption = builder.prismaObject("VariantOption", {
  fields: (t) => ({
    id: t.exposeID("id"),
    variantTypeId: t.exposeInt("variantTypeId"),
    value: t.exposeString("value"),
    label: t.exposeString("label"),
    swatchImageId: t.exposeInt("swatchImageId", { nullable: true }),
    sortOrder: t.exposeInt("sortOrder"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    // Relations
    variantType: t.relation("variantType"),
    swatchImage: t.relation("swatchImage", { nullable: true }),
  }),
});

const VariantOptionSelection = builder.prismaObject("VariantOptionSelection", {
  fields: (t) => ({
    id: t.exposeID("id"),
    variantId: t.exposeInt("variantId"),
    optionId: t.exposeInt("optionId"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    // Relations
    variant: t.relation("variant"),
    option: t.relation("option"),
  }),
});

// ============================================================================
// PRODUCT IMAGE TYPE
// ============================================================================

const ProductImage = builder.prismaObject("ProductImage", {
  fields: (t) => ({
    id: t.exposeID("id"),
    productId: t.exposeInt("productId"),
    imageId: t.exposeInt("imageId"),
    sortOrder: t.exposeInt("sortOrder"),
    isPrimary: t.exposeBoolean("isPrimary"),
    // Relations
    product: t.relation("product"),
    image: t.relation("image"),
  }),
});

// ============================================================================
// VARIANT IMAGE TYPE
// ============================================================================

const VariantImage = builder.prismaObject("VariantImage", {
  fields: (t) => ({
    id: t.exposeID("id"),
    variantId: t.exposeInt("variantId"),
    imageId: t.exposeInt("imageId"),
    sortOrder: t.exposeInt("sortOrder"),
    isPrimary: t.exposeBoolean("isPrimary"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    // Relations
    variant: t.relation("variant"),
    image: t.relation("image"),
  }),
});

// ============================================================================
// PRODUCT VARIANT TYPE
// ============================================================================

const ProductVariant = builder.prismaObject("ProductVariant", {
  fields: (t) => ({
    id: t.exposeID("id"),
    productId: t.exposeInt("productId"),
    sku: t.exposeString("sku", { nullable: true }),
    title: t.exposeString("title", { nullable: true }),
    price: t.float({
      nullable: true,
      resolve: (variant) => (variant.price ? Number(variant.price) : null),
    }),
    compareAtPrice: t.float({
      nullable: true,
      resolve: (variant) => (variant.compareAtPrice ? Number(variant.compareAtPrice) : null),
    }),
    inventoryQty: t.exposeInt("inventoryQty"),
    weight: t.float({
      nullable: true,
      resolve: (variant) => (variant.weight ? Number(variant.weight) : null),
    }),
    status: t.expose("status", { type: ProductStatusEnum }),
    sortOrder: t.exposeInt("sortOrder"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    // Computed fields
    isAvailable: t.boolean({
      resolve: (variant) => variant.status === "PUBLISHED" && variant.inventoryQty > 0,
    }),
    size: t.string({
      nullable: true,
      resolve: async (variant, _args, ctx) => {
        const selections = await ctx.prisma.variantOptionSelection.findMany({
          where: { variantId: variant.id },
          include: {
            option: {
              include: {
                variantType: true,
              },
            },
          },
        });
        const sizeOption = selections.find(
          (sel) => sel.option.variantType.name.toLowerCase() === "size"
        );
        return sizeOption?.option.label || null;
      },
    }),
    color: t.string({
      nullable: true,
      resolve: async (variant, _args, ctx) => {
        const selections = await ctx.prisma.variantOptionSelection.findMany({
          where: { variantId: variant.id },
          include: {
            option: {
              include: {
                variantType: true,
              },
            },
          },
        });
        const colorOption = selections.find(
          (sel) => sel.option.variantType.name.toLowerCase() === "color"
        );
        return colorOption?.option.label || null;
      },
    }),
    colorHex: t.string({
      nullable: true,
      resolve: async (variant, _args, ctx) => {
        const selections = await ctx.prisma.variantOptionSelection.findMany({
          where: { variantId: variant.id },
          include: {
            option: {
              include: {
                variantType: true,
                swatchImage: true,
              },
            },
          },
        });
        const colorOption = selections.find(
          (sel) => sel.option.variantType.name.toLowerCase() === "color"
        );
        return colorOption?.option.swatchImage?.url || null;
      },
    }),
    // Relations
    product: t.relation("product"),
    images: t.relation("images"),
    options: t.relation("options"),
  }),
});

// ============================================================================
// PRODUCT TYPE
// ============================================================================

const Product = builder.prismaObject("Product", {
  fields: (t) => ({
    id: t.exposeID("id"),
    slug: t.exposeString("slug"),
    title: t.exposeString("title"),
    description: t.exposeString("description", { nullable: true }),
    status: t.expose("status", { type: ProductStatusEnum }),
    isFeatured: t.exposeBoolean("isFeatured"),
    // Pricing
    basePrice: t.float({
      resolve: (product) => Number(product.basePrice),
    }),
    compareAtPrice: t.float({
      nullable: true,
      resolve: (product) => (product.compareAtPrice ? Number(product.compareAtPrice) : null),
    }),
    priceEnabled: t.exposeBoolean("priceEnabled"),
    // Inventory
    trackInventory: t.exposeBoolean("trackInventory"),
    inventoryQty: t.exposeInt("inventoryQty"),
    lowStockThreshold: t.exposeInt("lowStockThreshold"),
    // Details
    brand: t.exposeString("brand", { nullable: true }),
    vendor: t.exposeString("vendor", { nullable: true }),
    productType: t.exposeString("productType", { nullable: true }),
    material: t.exposeString("material", { nullable: true }),
    careInstructions: t.exposeString("careInstructions", { nullable: true }),
    madeIn: t.exposeString("madeIn", { nullable: true }),
    // Variants
    hasVariants: t.exposeBoolean("hasVariants"),
    // SEO
    metaTitle: t.exposeString("metaTitle", { nullable: true }),
    metaDescription: t.exposeString("metaDescription", { nullable: true }),
    metaImageId: t.exposeInt("metaImageId", { nullable: true }),
    // Timestamps
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    publishedAt: t.expose("publishedAt", { type: "DateTime", nullable: true }),
    // Relations
    metaImage: t.relation("metaImage", { nullable: true }),
    images: t.relation("images"),
    variants: t.relation("variants"),
  }),
});

// ============================================================================
// REVIEW TYPE
// ============================================================================

const Review = builder.prismaObject("Review", {
  fields: (t) => ({
    id: t.exposeID("id"),
    productId: t.exposeInt("productId"),
    userId: t.exposeInt("userId"),
    rating: t.exposeInt("rating"),
    title: t.exposeString("title", { nullable: true }),
    content: t.exposeString("content", { nullable: true }),
    isVerified: t.exposeBoolean("isVerified"),
    isPublished: t.exposeBoolean("isPublished"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    // Relations
    product: t.relation("product"),
    user: t.relation("user"),
  }),
});

// ============================================================================
// QUERIES
// ============================================================================

// ----------------------------------------------------------------------------
// USER QUERIES
// ----------------------------------------------------------------------------

builder.queryField("me", (t) =>
  t.field({
    type: User,
    nullable: true,
    resolve: async (_parent, _args, ctx) => {
      if (!ctx.user) return null;
      return prisma.user.findUnique({
        where: { id: ctx.user.userId },
      });
    },
  })
);

// ----------------------------------------------------------------------------
// PRODUCT QUERIES
// ----------------------------------------------------------------------------

builder.queryField("products", (t) =>
  t.prismaField({
    type: [Product],
    args: {
      limit: t.arg.int({ defaultValue: 20 }),
      skip: t.arg.int({ defaultValue: 0 }),
      status: t.arg({ type: ProductStatusEnum }),
      categorySlug: t.arg.string(),
      collectionSlug: t.arg.string(),
      featured: t.arg.boolean(),
      search: t.arg.string(),
    },
    resolve: async (query, _parent, args) => {
      const where: any = {};

      // Filter by status
      if (args.status) {
        where.status = args.status;
      } else {
        // Default to published products only
        where.status = "PUBLISHED";
      }

      // Filter by featured
      if (args.featured !== undefined) {
        where.isFeatured = args.featured;
      }

      // Filter by category
      if (args.categorySlug) {
        where.categories = {
          some: {
            category: {
              slug: args.categorySlug,
            },
          },
        };
      }

      // Filter by collection
      if (args.collectionSlug) {
        where.collections = {
          some: {
            collection: {
              slug: args.collectionSlug,
            },
          },
        };
      }

      // Simple text search in title
      if (args.search) {
        where.title = {
          contains: args.search,
          mode: "insensitive",
        };
      }

      return prisma.product.findMany({
        ...query,
        where,
        take: args.limit,
        skip: args.skip,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

builder.queryField("product", (t) =>
  t.prismaField({
    type: Product,
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.product.findUnique({
        ...query,
        where: { slug: args.slug },
      });
    },
  })
);

builder.queryField("productById", (t) =>
  t.prismaField({
    type: Product,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.product.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// ----------------------------------------------------------------------------
// CATEGORY QUERIES
// ----------------------------------------------------------------------------

builder.queryField("categories", (t) =>
  t.prismaField({
    type: [Category],
    args: {
      limit: t.arg.int({ defaultValue: 50 }),
      skip: t.arg.int({ defaultValue: 0 }),
      parentId: t.arg.string(), // null for root categories
      isVisible: t.arg.boolean(),
    },
    resolve: async (query, _parent, args) => {
      const where: any = {};

      if (args.parentId !== undefined) {
        where.parentId = args.parentId;
      }

      if (args.isVisible !== undefined) {
        where.isVisible = args.isVisible;
      }

      return prisma.category.findMany({
        ...query,
        where,
        take: args.limit,
        skip: args.skip,
        orderBy: { sortOrder: "asc" },
      });
    },
  })
);

builder.queryField("category", (t) =>
  t.prismaField({
    type: Category,
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.category.findUnique({
        ...query,
        where: { slug: args.slug },
      });
    },
  })
);

// ----------------------------------------------------------------------------
// COLLECTION QUERIES
// ----------------------------------------------------------------------------

builder.queryField("collections", (t) =>
  t.prismaField({
    type: [Collection],
    args: {
      limit: t.arg.int({ defaultValue: 50 }),
      skip: t.arg.int({ defaultValue: 0 }),
      isVisible: t.arg.boolean(),
    },
    resolve: async (query, _parent, args) => {
      const where: any = {};

      if (args.isVisible !== undefined) {
        where.isVisible = args.isVisible;
      }

      return prisma.collection.findMany({
        ...query,
        where,
        take: args.limit,
        skip: args.skip,
        orderBy: { sortOrder: "asc" },
      });
    },
  })
);

builder.queryField("collection", (t) =>
  t.prismaField({
    type: Collection,
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.collection.findUnique({
        ...query,
        where: { slug: args.slug },
      });
    },
  })
);

// ----------------------------------------------------------------------------
// VARIANT QUERIES
// ----------------------------------------------------------------------------

builder.queryField("variantTypes", (t) =>
  t.prismaField({
    type: [VariantType],
    resolve: async (query) => {
      return prisma.variantType.findMany({
        ...query,
        orderBy: { sortOrder: "asc" },
      });
    },
  })
);

builder.queryField("variants", (t) =>
  t.prismaField({
    type: [ProductVariant],
    args: {
      productId: t.arg.int({ required: true }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.productVariant.findMany({
        ...query,
        where: { productId: args.productId },
        orderBy: { sortOrder: "asc" },
      });
    },
  })
);

// ----------------------------------------------------------------------------
// REVIEW QUERIES
// ----------------------------------------------------------------------------

builder.queryField("reviews", (t) =>
  t.prismaField({
    type: [Review],
    args: {
      productId: t.arg.int({ required: true }),
      published: t.arg.boolean({ defaultValue: true }),
      limit: t.arg.int({ defaultValue: 20 }),
      skip: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (query, _parent, args) => {
      const where: any = {
        productId: args.productId,
      };

      if (args.published !== undefined) {
        where.isPublished = args.published;
      }

      return prisma.review.findMany({
        ...query,
        where,
        take: args.limit,
        skip: args.skip,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// ============================================================================
// MUTATIONS
// ============================================================================

// ----------------------------------------------------------------------------
// AUTH MUTATIONS
// ----------------------------------------------------------------------------

builder.mutationField("register", (t) =>
  t.field({
    type: AuthResponse,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string(),
    },
    resolve: async (_parent, args) => {
      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { email: args.email },
      });

      if (existing) {
        throw new Error("User already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(args.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name,
          role: "CUSTOMER",
        },
      });

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      return { token, refreshToken, user };
    },
  })
);

builder.mutationField("login", (t) =>
  t.field({
    type: AuthResponse,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args) => {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const valid = await comparePassword(args.password, user.password);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      return { token, refreshToken, user };
    },
  })
);

// ----------------------------------------------------------------------------
// PRODUCT MUTATIONS
// ----------------------------------------------------------------------------

builder.mutationField("createProduct", (t) =>
  t.prismaField({
    type: Product,
    args: {
      title: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
      description: t.arg.string(),
      basePrice: t.arg.float({ required: true }),
      status: t.arg({ type: ProductStatusEnum, defaultValue: "DRAFT" }),
      brand: t.arg.string(),
      vendor: t.arg.string(),
      productType: t.arg.string(),
      material: t.arg.string(),
      madeIn: t.arg.string(),
      trackInventory: t.arg.boolean({ defaultValue: false }),
      inventoryQty: t.arg.int({ defaultValue: 0 }),
      hasVariants: t.arg.boolean({ defaultValue: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      // Require authentication
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      return prisma.product.create({
        ...query,
        data: {
          title: args.title,
          slug: args.slug,
          description: args.description,
          basePrice: args.basePrice,
          status: args.status as any,
          brand: args.brand,
          vendor: args.vendor,
          productType: args.productType,
          material: args.material,
          madeIn: args.madeIn,
          trackInventory: args.trackInventory,
          inventoryQty: args.inventoryQty,
          hasVariants: args.hasVariants,
        },
      });
    },
  })
);

builder.mutationField("updateProduct", (t) =>
  t.prismaField({
    type: Product,
    args: {
      id: t.arg.int({ required: true }),
      title: t.arg.string(),
      slug: t.arg.string(),
      description: t.arg.string(),
      basePrice: t.arg.float(),
      status: t.arg({ type: ProductStatusEnum }),
      brand: t.arg.string(),
      vendor: t.arg.string(),
      productType: t.arg.string(),
      material: t.arg.string(),
      madeIn: t.arg.string(),
      trackInventory: t.arg.boolean(),
      inventoryQty: t.arg.int(),
      hasVariants: t.arg.boolean(),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      const data: any = {};
      if (args.title !== undefined) data.title = args.title;
      if (args.slug !== undefined) data.slug = args.slug;
      if (args.description !== undefined) data.description = args.description;
      if (args.basePrice !== undefined) data.basePrice = args.basePrice;
      if (args.status !== undefined) data.status = args.status;
      if (args.brand !== undefined) data.brand = args.brand;
      if (args.vendor !== undefined) data.vendor = args.vendor;
      if (args.productType !== undefined) data.productType = args.productType;
      if (args.material !== undefined) data.material = args.material;
      if (args.madeIn !== undefined) data.madeIn = args.madeIn;
      if (args.trackInventory !== undefined) data.trackInventory = args.trackInventory;
      if (args.inventoryQty !== undefined) data.inventoryQty = args.inventoryQty;
      if (args.hasVariants !== undefined) data.hasVariants = args.hasVariants;

      return prisma.product.update({
        ...query,
        where: { id: args.id },
        data,
      });
    },
  })
);

builder.mutationField("deleteProduct", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      await prisma.product.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ----------------------------------------------------------------------------
// CATEGORY MUTATIONS
// ----------------------------------------------------------------------------

builder.mutationField("createCategory", (t) =>
  t.prismaField({
    type: Category,
    args: {
      name: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
      description: t.arg.string(),
      parentId: t.arg.string(),
      sortOrder: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      return prisma.category.create({
        ...query,
        data: {
          name: args.name,
          slug: args.slug,
          description: args.description,
          parentId: args.parentId,
          sortOrder: args.sortOrder,
        },
      });
    },
  })
);

builder.mutationField("updateCategory", (t) =>
  t.prismaField({
    type: Category,
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string(),
      slug: t.arg.string(),
      description: t.arg.string(),
      parentId: t.arg.string(),
      sortOrder: t.arg.int(),
      isVisible: t.arg.boolean(),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      const data: any = {};
      if (args.name !== undefined) data.name = args.name;
      if (args.slug !== undefined) data.slug = args.slug;
      if (args.description !== undefined) data.description = args.description;
      if (args.parentId !== undefined) data.parentId = args.parentId;
      if (args.sortOrder !== undefined) data.sortOrder = args.sortOrder;
      if (args.isVisible !== undefined) data.isVisible = args.isVisible;

      return prisma.category.update({
        ...query,
        where: { id: args.id },
        data,
      });
    },
  })
);

builder.mutationField("deleteCategory", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      await prisma.category.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ----------------------------------------------------------------------------
// COLLECTION MUTATIONS
// ----------------------------------------------------------------------------

builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: Collection,
    args: {
      name: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
      description: t.arg.string(),
      sortOrder: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      return prisma.collection.create({
        ...query,
        data: {
          name: args.name,
          slug: args.slug,
          description: args.description,
          sortOrder: args.sortOrder,
        },
      });
    },
  })
);

builder.mutationField("updateCollection", (t) =>
  t.prismaField({
    type: Collection,
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string(),
      slug: t.arg.string(),
      description: t.arg.string(),
      sortOrder: t.arg.int(),
      isVisible: t.arg.boolean(),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      const data: any = {};
      if (args.name !== undefined) data.name = args.name;
      if (args.slug !== undefined) data.slug = args.slug;
      if (args.description !== undefined) data.description = args.description;
      if (args.sortOrder !== undefined) data.sortOrder = args.sortOrder;
      if (args.isVisible !== undefined) data.isVisible = args.isVisible;

      return prisma.collection.update({
        ...query,
        where: { id: args.id },
        data,
      });
    },
  })
);

builder.mutationField("deleteCollection", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      await prisma.collection.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ----------------------------------------------------------------------------
// VARIANT MUTATIONS
// ----------------------------------------------------------------------------

builder.mutationField("createVariant", (t) =>
  t.prismaField({
    type: ProductVariant,
    args: {
      productId: t.arg.int({ required: true }),
      sku: t.arg.string(),
      title: t.arg.string(),
      price: t.arg.float(),
      compareAtPrice: t.arg.float(),
      inventoryQty: t.arg.int({ defaultValue: 0 }),
      weight: t.arg.float(),
      sortOrder: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      return prisma.productVariant.create({
        ...query,
        data: {
          productId: args.productId,
          sku: args.sku,
          title: args.title,
          price: args.price,
          compareAtPrice: args.compareAtPrice,
          inventoryQty: args.inventoryQty,
          weight: args.weight,
          sortOrder: args.sortOrder,
        },
      });
    },
  })
);

builder.mutationField("updateVariant", (t) =>
  t.prismaField({
    type: ProductVariant,
    args: {
      id: t.arg.int({ required: true }),
      sku: t.arg.string(),
      title: t.arg.string(),
      price: t.arg.float(),
      compareAtPrice: t.arg.float(),
      inventoryQty: t.arg.int(),
      weight: t.arg.float(),
      sortOrder: t.arg.int(),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      const data: any = {};
      if (args.sku !== undefined) data.sku = args.sku;
      if (args.title !== undefined) data.title = args.title;
      if (args.price !== undefined) data.price = args.price;
      if (args.compareAtPrice !== undefined) data.compareAtPrice = args.compareAtPrice;
      if (args.inventoryQty !== undefined) data.inventoryQty = args.inventoryQty;
      if (args.weight !== undefined) data.weight = args.weight;
      if (args.sortOrder !== undefined) data.sortOrder = args.sortOrder;

      return prisma.productVariant.update({
        ...query,
        where: { id: args.id },
        data,
      });
    },
  })
);

builder.mutationField("deleteVariant", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      await prisma.productVariant.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ----------------------------------------------------------------------------
// REVIEW MUTATIONS
// ----------------------------------------------------------------------------

builder.mutationField("createReview", (t) =>
  t.prismaField({
    type: Review,
    args: {
      productId: t.arg.int({ required: true }),
      rating: t.arg.int({ required: true }),
      title: t.arg.string(),
      content: t.arg.string(),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized - must be logged in to review");
      }

      // Validate rating (1-5)
      if (args.rating < 1 || args.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Check if user has already reviewed this product
      const existing = await prisma.review.findFirst({
        where: {
          productId: args.productId,
          userId: ctx.user.userId,
        },
      });

      if (existing) {
        throw new Error("You have already reviewed this product");
      }

      return prisma.review.create({
        ...query,
        data: {
          productId: args.productId,
          userId: ctx.user.userId,
          rating: args.rating,
          title: args.title,
          content: args.content,
          isVerified: false, // TODO: Check if user purchased this product
          isPublished: false, // Requires admin approval
        },
      });
    },
  })
);

// ============================================================================
// CART TYPES
// ============================================================================

const Cart = builder.prismaObject("Cart", {
  fields: (t) => ({
    id: t.exposeID("id"),
    userId: t.exposeInt("userId", { nullable: true }),
    sessionId: t.exposeString("sessionId", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    expiresAt: t.expose("expiresAt", { type: "DateTime", nullable: true }),
    // Relations
    user: t.relation("user", { nullable: true }),
    items: t.relation("items"),
  }),
});

const CartItem = builder.prismaObject("CartItem", {
  fields: (t) => ({
    id: t.exposeID("id"),
    cartId: t.exposeString("cartId"),
    productId: t.exposeInt("productId"),
    variantId: t.exposeInt("variantId", { nullable: true }),
    quantity: t.exposeInt("quantity"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    // Relations
    cart: t.relation("cart"),
    product: t.relation("product"),
    variant: t.relation("variant", { nullable: true }),
  }),
});

// ============================================================================
// CART QUERIES
// ============================================================================

builder.queryField("cart", (t) =>
  t.prismaField({
    type: Cart,
    nullable: true,
    args: {
      sessionId: t.arg.string(),
    },
    resolve: async (query, _parent, args, ctx) => {
      // If user is logged in, get their cart
      if (ctx.user) {
        const cart = await prisma.cart.findUnique({
          ...query,
          where: { userId: ctx.user.userId },
        });

        return cart ?? null;
      }

      // Otherwise, get cart by session ID
      if (args.sessionId) {
        const cart = await prisma.cart.findFirst({
          ...query,
          where: { sessionId: args.sessionId },
        });

        return cart ?? null;
      }

      return null;
    },
  })
);

// ============================================================================
// CART MUTATIONS
// ============================================================================

builder.mutationField("addToCart", (t) =>
  t.prismaField({
    type: CartItem,
    args: {
      productId: t.arg.int({ required: true }),
      variantId: t.arg.int(),
      quantity: t.arg.int({ defaultValue: 1 }),
      sessionId: t.arg.string(),
    },
    resolve: async (query, _parent, args, ctx) => {
      let cartId: string;

      // Find or create cart
      if (ctx.user) {
        // Logged-in user cart
        let cart = await prisma.cart.findUnique({
          where: { userId: ctx.user.userId },
        });

        if (!cart) {
          cart = await prisma.cart.create({
            data: {
              userId: ctx.user.userId,
            },
          });
        }

        cartId = cart.id;
      } else {
        // Guest cart
        if (!args.sessionId) {
          throw new Error("Session ID is required for guest carts");
        }

        let cart = await prisma.cart.findFirst({
          where: { sessionId: args.sessionId },
        });

        if (!cart) {
          cart = await prisma.cart.create({
            data: {
              sessionId: args.sessionId,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });
        }

        cartId = cart.id;
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId_variantId: {
            cartId,
            productId: args.productId,
            variantId: args.variantId ?? null,
          },
        },
      });

      if (existingItem) {
        // Update quantity
        return prisma.cartItem.update({
          ...query,
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + args.quantity,
          },
        });
      }

      // Create new cart item
      return prisma.cartItem.create({
        ...query,
        data: {
          cartId,
          productId: args.productId,
          variantId: args.variantId,
          quantity: args.quantity,
        },
      });
    },
  })
);

builder.mutationField("updateCartItem", (t) =>
  t.prismaField({
    type: CartItem,
    args: {
      id: t.arg.int({ required: true }),
      quantity: t.arg.int({ required: true }),
    },
    resolve: async (query, _parent, args, ctx) => {
      // Verify ownership
      const item = await prisma.cartItem.findUnique({
        where: { id: args.id },
        include: { cart: true },
      });

      if (!item) {
        throw new Error("Cart item not found");
      }

      // Check authorization
      if (ctx.user) {
        if (item.cart.userId !== ctx.user.userId) {
          throw new Error("Unauthorized");
        }
      }

      // Validate quantity
      if (args.quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      return prisma.cartItem.update({
        ...query,
        where: { id: args.id },
        data: { quantity: args.quantity },
      });
    },
  })
);

builder.mutationField("removeFromCart", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      // Verify ownership
      const item = await prisma.cartItem.findUnique({
        where: { id: args.id },
        include: { cart: true },
      });

      if (!item) {
        throw new Error("Cart item not found");
      }

      // Check authorization
      if (ctx.user) {
        if (item.cart.userId !== ctx.user.userId) {
          throw new Error("Unauthorized");
        }
      }

      await prisma.cartItem.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

builder.mutationField("clearCart", (t) =>
  t.field({
    type: "Boolean",
    args: {
      sessionId: t.arg.string(),
    },
    resolve: async (_parent, args, ctx) => {
      let cartId: string | null = null;

      if (ctx.user) {
        const cart = await prisma.cart.findUnique({
          where: { userId: ctx.user.userId },
        });
        cartId = cart?.id ?? null;
      } else if (args.sessionId) {
        const cart = await prisma.cart.findFirst({
          where: { sessionId: args.sessionId },
        });
        cartId = cart?.id ?? null;
      }

      if (!cartId) {
        return false;
      }

      await prisma.cartItem.deleteMany({
        where: { cartId },
      });

      return true;
    },
  })
);

// ============================================================================
// THEME SYSTEM
// ============================================================================

const Theme = builder.prismaObject("Theme", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    // Colors
    colorPrimary: t.exposeString("colorPrimary"),
    colorSecondary: t.exposeString("colorSecondary"),
    colorAccent: t.exposeString("colorAccent"),
    colorSuccess: t.exposeString("colorSuccess"),
    colorWarning: t.exposeString("colorWarning"),
    colorError: t.exposeString("colorError"),
    colorInfo: t.exposeString("colorInfo"),
    colorBackground: t.exposeString("colorBackground"),
    colorSurface: t.exposeString("colorSurface"),
    colorTextPrimary: t.exposeString("colorTextPrimary"),
    colorTextSecondary: t.exposeString("colorTextSecondary"),
    colorBorder: t.exposeString("colorBorder"),
    // Glassmorphism
    glassOpacity: t.exposeFloat("glassOpacity"),
    glassBlur: t.exposeInt("glassBlur"),
    glassBorder: t.exposeFloat("glassBorder"),
    glassBorderOpacity: t.exposeFloat("glassBorderOpacity"),
    glassShadow: t.exposeString("glassShadow"),
    // Typography
    fontHeading: t.exposeString("fontHeading"),
    fontBody: t.exposeString("fontBody"),
    fontMono: t.exposeString("fontMono"),
    fontSize: t.exposeString("fontSize"),
    fontWeightNormal: t.exposeInt("fontWeightNormal"),
    fontWeightMedium: t.exposeInt("fontWeightMedium"),
    fontWeightBold: t.exposeInt("fontWeightBold"),
    lineHeight: t.exposeFloat("lineHeight"),
    letterSpacing: t.exposeFloat("letterSpacing"),
    // Spacing
    spacingXs: t.exposeString("spacingXs"),
    spacingSm: t.exposeString("spacingSm"),
    spacingMd: t.exposeString("spacingMd"),
    spacingLg: t.exposeString("spacingLg"),
    spacingXl: t.exposeString("spacingXl"),
    spacing2xl: t.exposeString("spacing2xl"),
    spacing3xl: t.exposeString("spacing3xl"),
    // Border Radius
    borderRadiusSm: t.exposeString("borderRadiusSm"),
    borderRadiusMd: t.exposeString("borderRadiusMd"),
    borderRadiusLg: t.exposeString("borderRadiusLg"),
    borderRadiusXl: t.exposeString("borderRadiusXl"),
    borderRadiusFull: t.exposeString("borderRadiusFull"),
    // Animations
    transitionSpeed: t.exposeString("transitionSpeed"),
    transitionEasing: t.exposeString("transitionEasing"),
    // Layout
    maxWidthContainer: t.exposeString("maxWidthContainer"),
    maxWidthContent: t.exposeString("maxWidthContent"),
    headerHeight: t.exposeString("headerHeight"),
    footerHeight: t.exposeString("footerHeight"),
    // Custom CSS
    customCss: t.exposeString("customCss", { nullable: true }),
  }),
});

// ----------------------------------------------------------------------------
// THEME QUERIES
// ----------------------------------------------------------------------------

builder.queryField("themes", (t) =>
  t.prismaField({
    type: [Theme],
    resolve: async (query) => {
      return prisma.theme.findMany({
        ...query,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

builder.queryField("theme", (t) =>
  t.prismaField({
    type: Theme,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.theme.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

builder.queryField("activeTheme", (t) =>
  t.prismaField({
    type: Theme,
    nullable: true,
    resolve: async (query) => {
      return prisma.theme.findFirst({
        ...query,
        where: { isActive: true },
      });
    },
  })
);

// ----------------------------------------------------------------------------
// THEME MUTATIONS
// ----------------------------------------------------------------------------

builder.mutationField("createTheme", (t) =>
  t.prismaField({
    type: Theme,
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      return prisma.theme.create({
        ...query,
        data: {
          name: args.name,
        },
      });
    },
  })
);

builder.mutationField("updateTheme", (t) =>
  t.prismaField({
    type: Theme,
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      // Colors
      colorPrimary: t.arg.string(),
      colorSecondary: t.arg.string(),
      colorAccent: t.arg.string(),
      colorSuccess: t.arg.string(),
      colorWarning: t.arg.string(),
      colorError: t.arg.string(),
      colorInfo: t.arg.string(),
      colorBackground: t.arg.string(),
      colorSurface: t.arg.string(),
      colorTextPrimary: t.arg.string(),
      colorTextSecondary: t.arg.string(),
      colorBorder: t.arg.string(),
      // Glassmorphism
      glassOpacity: t.arg.float(),
      glassBlur: t.arg.int(),
      glassBorder: t.arg.float(),
      glassBorderOpacity: t.arg.float(),
      glassShadow: t.arg.string(),
      // Typography
      fontHeading: t.arg.string(),
      fontBody: t.arg.string(),
      fontMono: t.arg.string(),
      fontSize: t.arg.string(),
      fontWeightNormal: t.arg.int(),
      fontWeightMedium: t.arg.int(),
      fontWeightBold: t.arg.int(),
      lineHeight: t.arg.float(),
      letterSpacing: t.arg.float(),
      // Spacing
      spacingXs: t.arg.string(),
      spacingSm: t.arg.string(),
      spacingMd: t.arg.string(),
      spacingLg: t.arg.string(),
      spacingXl: t.arg.string(),
      spacing2xl: t.arg.string(),
      spacing3xl: t.arg.string(),
      // Border Radius
      borderRadiusSm: t.arg.string(),
      borderRadiusMd: t.arg.string(),
      borderRadiusLg: t.arg.string(),
      borderRadiusXl: t.arg.string(),
      borderRadiusFull: t.arg.string(),
      // Animations
      transitionSpeed: t.arg.string(),
      transitionEasing: t.arg.string(),
      // Layout
      maxWidthContainer: t.arg.string(),
      maxWidthContent: t.arg.string(),
      headerHeight: t.arg.string(),
      footerHeight: t.arg.string(),
      // Custom CSS
      customCss: t.arg.string(),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      const data: any = {};
      if (args.name !== undefined) data.name = args.name;
      // Colors
      if (args.colorPrimary !== undefined) data.colorPrimary = args.colorPrimary;
      if (args.colorSecondary !== undefined) data.colorSecondary = args.colorSecondary;
      if (args.colorAccent !== undefined) data.colorAccent = args.colorAccent;
      if (args.colorSuccess !== undefined) data.colorSuccess = args.colorSuccess;
      if (args.colorWarning !== undefined) data.colorWarning = args.colorWarning;
      if (args.colorError !== undefined) data.colorError = args.colorError;
      if (args.colorInfo !== undefined) data.colorInfo = args.colorInfo;
      if (args.colorBackground !== undefined) data.colorBackground = args.colorBackground;
      if (args.colorSurface !== undefined) data.colorSurface = args.colorSurface;
      if (args.colorTextPrimary !== undefined) data.colorTextPrimary = args.colorTextPrimary;
      if (args.colorTextSecondary !== undefined) data.colorTextSecondary = args.colorTextSecondary;
      if (args.colorBorder !== undefined) data.colorBorder = args.colorBorder;
      // Glassmorphism
      if (args.glassOpacity !== undefined) data.glassOpacity = args.glassOpacity;
      if (args.glassBlur !== undefined) data.glassBlur = args.glassBlur;
      if (args.glassBorder !== undefined) data.glassBorder = args.glassBorder;
      if (args.glassBorderOpacity !== undefined) data.glassBorderOpacity = args.glassBorderOpacity;
      if (args.glassShadow !== undefined) data.glassShadow = args.glassShadow;
      // Typography
      if (args.fontHeading !== undefined) data.fontHeading = args.fontHeading;
      if (args.fontBody !== undefined) data.fontBody = args.fontBody;
      if (args.fontMono !== undefined) data.fontMono = args.fontMono;
      if (args.fontSize !== undefined) data.fontSize = args.fontSize;
      if (args.fontWeightNormal !== undefined) data.fontWeightNormal = args.fontWeightNormal;
      if (args.fontWeightMedium !== undefined) data.fontWeightMedium = args.fontWeightMedium;
      if (args.fontWeightBold !== undefined) data.fontWeightBold = args.fontWeightBold;
      if (args.lineHeight !== undefined) data.lineHeight = args.lineHeight;
      if (args.letterSpacing !== undefined) data.letterSpacing = args.letterSpacing;
      // Spacing
      if (args.spacingXs !== undefined) data.spacingXs = args.spacingXs;
      if (args.spacingSm !== undefined) data.spacingSm = args.spacingSm;
      if (args.spacingMd !== undefined) data.spacingMd = args.spacingMd;
      if (args.spacingLg !== undefined) data.spacingLg = args.spacingLg;
      if (args.spacingXl !== undefined) data.spacingXl = args.spacingXl;
      if (args.spacing2xl !== undefined) data.spacing2xl = args.spacing2xl;
      if (args.spacing3xl !== undefined) data.spacing3xl = args.spacing3xl;
      // Border Radius
      if (args.borderRadiusSm !== undefined) data.borderRadiusSm = args.borderRadiusSm;
      if (args.borderRadiusMd !== undefined) data.borderRadiusMd = args.borderRadiusMd;
      if (args.borderRadiusLg !== undefined) data.borderRadiusLg = args.borderRadiusLg;
      if (args.borderRadiusXl !== undefined) data.borderRadiusXl = args.borderRadiusXl;
      if (args.borderRadiusFull !== undefined) data.borderRadiusFull = args.borderRadiusFull;
      // Animations
      if (args.transitionSpeed !== undefined) data.transitionSpeed = args.transitionSpeed;
      if (args.transitionEasing !== undefined) data.transitionEasing = args.transitionEasing;
      // Layout
      if (args.maxWidthContainer !== undefined) data.maxWidthContainer = args.maxWidthContainer;
      if (args.maxWidthContent !== undefined) data.maxWidthContent = args.maxWidthContent;
      if (args.headerHeight !== undefined) data.headerHeight = args.headerHeight;
      if (args.footerHeight !== undefined) data.footerHeight = args.footerHeight;
      // Custom CSS
      if (args.customCss !== undefined) data.customCss = args.customCss;

      return prisma.theme.update({
        ...query,
        where: { id: args.id },
        data,
      });
    },
  })
);

builder.mutationField("setActiveTheme", (t) =>
  t.prismaField({
    type: Theme,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Deactivate all themes
      await prisma.theme.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Activate the selected theme
      return prisma.theme.update({
        ...query,
        where: { id: args.id },
        data: { isActive: true },
      });
    },
  })
);

builder.mutationField("deleteTheme", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Prevent deleting active theme
      const theme = await prisma.theme.findUnique({
        where: { id: args.id },
      });

      if (theme?.isActive) {
        throw new Error("Cannot delete the active theme. Please set another theme as active first.");
      }

      await prisma.theme.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ============================================================================
// BUILD SCHEMA
// ============================================================================

export const schema = builder.toSchema();
