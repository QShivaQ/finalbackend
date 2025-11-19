import DataLoader from "dataloader";
import { prisma } from "../database.js";
import type {
  Product,
  Category,
  ProductVariant,
  User,
  Address,
  Review,
  Collection,
} from "@prisma/client";

// ============================================================================
// SINGLE ENTITY LOADERS
// ============================================================================

export const createProductLoader = () => {
  return new DataLoader<number, Product | null>(async (ids) => {
    const products = await prisma.product.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const productMap = new Map<number, Product>();
    products.forEach((product) => {
      productMap.set(product.id, product);
    });

    return ids.map((id) => productMap.get(id) || null);
  });
};

export const createCategoryLoader = () => {
  return new DataLoader<string, Category | null>(async (ids) => {
    const categories = await prisma.category.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const categoryMap = new Map<string, Category>();
    categories.forEach((category) => {
      categoryMap.set(category.id, category);
    });

    return ids.map((id) => categoryMap.get(id) || null);
  });
};

export const createVariantLoader = () => {
  return new DataLoader<number, ProductVariant | null>(async (ids) => {
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const variantMap = new Map<number, ProductVariant>();
    variants.forEach((variant) => {
      variantMap.set(variant.id, variant);
    });

    return ids.map((id) => variantMap.get(id) || null);
  });
};

export const createUserLoader = () => {
  return new DataLoader<number, User | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const userMap = new Map<number, User>();
    users.forEach((user) => {
      userMap.set(user.id, user);
    });

    return ids.map((id) => userMap.get(id) || null);
  });
};

export const createAddressLoader = () => {
  return new DataLoader<number, Address | null>(async (ids) => {
    const addresses = await prisma.address.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const addressMap = new Map<number, Address>();
    addresses.forEach((address) => {
      addressMap.set(address.id, address);
    });

    return ids.map((id) => addressMap.get(id) || null);
  });
};

export const createCollectionLoader = () => {
  return new DataLoader<string, Collection | null>(async (ids) => {
    const collections = await prisma.collection.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const collectionMap = new Map<string, Collection>();
    collections.forEach((collection) => {
      collectionMap.set(collection.id, collection);
    });

    return ids.map((id) => collectionMap.get(id) || null);
  });
};

// ============================================================================
// BATCH LOADERS (for one-to-many relations)
// ============================================================================

// Load all variants for a product
export const createProductVariantsLoader = () => {
  return new DataLoader<number, ProductVariant[]>(async (productIds) => {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: { in: [...productIds] },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Group variants by productId
    const variantsByProduct = new Map<number, ProductVariant[]>();
    variants.forEach((variant) => {
      const existing = variantsByProduct.get(variant.productId) || [];
      existing.push(variant);
      variantsByProduct.set(variant.productId, existing);
    });

    return productIds.map((id) => variantsByProduct.get(id) || []);
  });
};

// Load all reviews for a product
export const createProductReviewsLoader = () => {
  return new DataLoader<number, Review[]>(async (productIds) => {
    const reviews = await prisma.review.findMany({
      where: {
        productId: { in: [...productIds] },
        isPublished: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const reviewsByProduct = new Map<number, Review[]>();
    reviews.forEach((review) => {
      const existing = reviewsByProduct.get(review.productId) || [];
      existing.push(review);
      reviewsByProduct.set(review.productId, existing);
    });

    return productIds.map((id) => reviewsByProduct.get(id) || []);
  });
};

// Load all categories for a product (through ProductCategory join table)
export const createProductCategoriesLoader = () => {
  return new DataLoader<number, Category[]>(async (productIds) => {
    const productCategories = await prisma.productCategory.findMany({
      where: {
        productId: { in: [...productIds] },
      },
      include: {
        category: true,
      },
    });

    const categoriesByProduct = new Map<number, Category[]>();
    productCategories.forEach((pc) => {
      const existing = categoriesByProduct.get(pc.productId) || [];
      existing.push(pc.category);
      categoriesByProduct.set(pc.productId, existing);
    });

    return productIds.map((id) => categoriesByProduct.get(id) || []);
  });
};

// Load all collections for a product (through ProductCollection join table)
export const createProductCollectionsLoader = () => {
  return new DataLoader<number, Collection[]>(async (productIds) => {
    const productCollections = await prisma.productCollection.findMany({
      where: {
        productId: { in: [...productIds] },
      },
      include: {
        collection: true,
      },
    });

    const collectionsByProduct = new Map<number, Collection[]>();
    productCollections.forEach((pc) => {
      const existing = collectionsByProduct.get(pc.productId) || [];
      existing.push(pc.collection);
      collectionsByProduct.set(pc.productId, existing);
    });

    return productIds.map((id) => collectionsByProduct.get(id) || []);
  });
};

// Load all addresses for a user
export const createUserAddressesLoader = () => {
  return new DataLoader<number, Address[]>(async (userIds) => {
    const addresses = await prisma.address.findMany({
      where: {
        userId: { in: [...userIds] },
      },
      orderBy: {
        isDefault: "desc",
      },
    });

    const addressesByUser = new Map<number, Address[]>();
    addresses.forEach((address) => {
      const existing = addressesByUser.get(address.userId) || [];
      existing.push(address);
      addressesByUser.set(address.userId, existing);
    });

    return userIds.map((id) => addressesByUser.get(id) || []);
  });
};

// ============================================================================
// CONTEXT LOADERS (create all loaders for a request)
// ============================================================================

export interface Loaders {
  productLoader: ReturnType<typeof createProductLoader>;
  categoryLoader: ReturnType<typeof createCategoryLoader>;
  variantLoader: ReturnType<typeof createVariantLoader>;
  userLoader: ReturnType<typeof createUserLoader>;
  addressLoader: ReturnType<typeof createAddressLoader>;
  collectionLoader: ReturnType<typeof createCollectionLoader>;
  productVariantsLoader: ReturnType<typeof createProductVariantsLoader>;
  productReviewsLoader: ReturnType<typeof createProductReviewsLoader>;
  productCategoriesLoader: ReturnType<typeof createProductCategoriesLoader>;
  productCollectionsLoader: ReturnType<typeof createProductCollectionsLoader>;
  userAddressesLoader: ReturnType<typeof createUserAddressesLoader>;
}

export const createLoaders = (): Loaders => {
  return {
    productLoader: createProductLoader(),
    categoryLoader: createCategoryLoader(),
    variantLoader: createVariantLoader(),
    userLoader: createUserLoader(),
    addressLoader: createAddressLoader(),
    collectionLoader: createCollectionLoader(),
    productVariantsLoader: createProductVariantsLoader(),
    productReviewsLoader: createProductReviewsLoader(),
    productCategoriesLoader: createProductCategoriesLoader(),
    productCollectionsLoader: createProductCollectionsLoader(),
    userAddressesLoader: createUserAddressesLoader(),
  };
};
