import { Router, Request, Response } from "express";
import { prisma } from "../database.js";
import { z } from "zod";

const router = Router();

// Validation schemas
const productQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.string().optional().transform((val) => val === "true"),
  category: z.string().optional(),
  collection: z.string().optional(),
  sortBy: z.enum(["newest", "oldest", "price-asc", "price-desc", "name-asc", "name-desc"]).optional(),
});

/**
 * GET /api/products
 * List products with pagination, filtering, and sorting
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const query = productQuerySchema.parse(req.query);
    const { page = 1, limit = 20, status, featured, category, collection, sortBy } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (featured !== undefined) {
      where.isFeatured = featured;
    }
    if (category) {
      where.categories = {
        some: {
          category: { slug: category },
        },
      };
    }
    if (collection) {
      where.collections = {
        some: {
          collection: { slug: collection },
        },
      };
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };
    if (sortBy) {
      switch (sortBy) {
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        case "price-asc":
          orderBy = { basePrice: "asc" };
          break;
        case "price-desc":
          orderBy = { basePrice: "desc" };
          break;
        case "name-asc":
          orderBy = { name: "asc" };
          break;
        case "name-desc":
          orderBy = { name: "desc" };
          break;
      }
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          variants: {
            take: 1,
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform Decimal to number for JSON
    const productsJSON = products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      variants: p.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        weight: v.weight ? Number(v.weight) : null,
      })),
    }));

    res.json({
      data: productsJSON,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET /api/products/:slug
 * Get single product by slug
 */
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { sortOrder: "asc" },
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Transform Decimal to number
    const productJSON = {
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        weight: v.weight ? Number(v.weight) : null,
      })),
    };

    res.json({ data: productJSON });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/**
 * GET /api/products/search/index
 * Get search index for all published products (for Orama)
 */
router.get("/search/index", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        basePrice: true,
        brand: true,
        status: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    });

    const searchIndex = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description || "",
      brand: product.brand || "",
      basePrice: Number(product.basePrice),
      imageUrl: product.images[0]?.url || "",
      status: product.status,
    }));

    res.json({ data: searchIndex });
  } catch (error) {
    console.error("Error fetching search index:", error);
    res.status(500).json({ error: "Failed to fetch search index" });
  }
});

export default router;
