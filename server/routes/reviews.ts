import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { reviewSchema } from '../lib/validation';

const router = Router();
const prisma = new PrismaClient();

// Create review
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const { productId, rating, comment } = value;

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user!.id,
        productId
      }
    });

    if (existingReview) {
      return res.status(409).json({ error: { message: 'You have already reviewed this product' } });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        productId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: { message: 'Failed to create review' } });
  }
});

export default router;
