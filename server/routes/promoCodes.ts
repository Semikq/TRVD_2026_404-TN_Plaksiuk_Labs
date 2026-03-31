import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { promoCodeSchema } from '../lib/validation';

const router = Router();
const prisma = new PrismaClient();

// Validate promo code
router.post('/validate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: { message: 'Promo code is required' } });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code }
    });

    if (!promoCode) {
      return res.status(404).json({ error: { message: 'Invalid promo code' } });
    }

    if (!promoCode.isActive) {
      return res.status(400).json({ error: { message: 'Promo code is inactive' } });
    }

    if (promoCode.expiresAt < new Date()) {
      return res.status(400).json({ error: { message: 'Promo code has expired' } });
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return res.status(400).json({ error: { message: 'Promo code usage limit reached' } });
    }

    if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
      return res.status(400).json({ 
        error: { message: `Minimum order amount of $${promoCode.minOrderAmount} required` } 
      });
    }

    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * promoCode.discountValue) / 100;
    } else {
      discountAmount = promoCode.discountValue;
    }

    res.json({
      valid: true,
      promoCode: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount
      }
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({ error: { message: 'Failed to validate promo code' } });
  }
});

// Create promo code (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { error, value } = promoCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const promoCode = await prisma.promoCode.create({
      data: value
    });

    res.status(201).json({ message: 'Promo code created successfully', promoCode });
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(500).json({ error: { message: 'Failed to create promo code' } });
  }
});

export default router;
