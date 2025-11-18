import { Router, Request, Response } from "express";
import { prisma } from "../database.js";

const router = Router();

/**
 * GET /api/collections
 * List all visible collections
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    res.json({ data: collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

/**
 * GET /api/collections/:slug
 * Get single collection by slug with products
 */
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
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

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Transform products
    const collectionJSON = {
      ...collection,
      products: collection.products.map((pc) => ({
        ...pc.product,
        basePrice: Number(pc.product.basePrice),
        compareAtPrice: pc.product.compareAtPrice ? Number(pc.product.compareAtPrice) : null,
      })),
    };

    res.json({ data: collectionJSON });
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

export default router;
