import { Router, Request, Response } from "express";
import { prisma } from "../database.js";

const router = Router();

/**
 * GET /api/categories
 * List all visible categories with hierarchy
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      include: {
        image: true,
        children: {
          where: { isVisible: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * GET /api/categories/:slug
 * Get single category by slug with products
 */
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        image: true,
        children: {
          where: { isVisible: true },
          orderBy: { sortOrder: "asc" },
        },
        parent: true,
        products: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  include: { image: true },
                },
                variants: {
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Transform products with decimal conversion
    const categoryJSON = {
      ...category,
      products: category.products.map((pc) => ({
        ...pc.product,
        basePrice: Number(pc.product.basePrice),
        compareAtPrice: pc.product.compareAtPrice ? Number(pc.product.compareAtPrice) : null,
      })),
    };

    res.json({ data: categoryJSON });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

export default router;
