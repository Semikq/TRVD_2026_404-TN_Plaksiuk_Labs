import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { orderSchema } from '../lib/validation';

const router = Router();
const prisma = new PrismaClient();

// Get user orders
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                imageUrl: true
              }
            }
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: { message: 'Failed to get orders' } });
  }
});

// Create new order
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const { items, addressId, promoCode, notes } = value;

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.isAvailable) {
        return res.status(400).json({ 
          error: { message: `Product ${item.productId} is not available` } 
        });
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price)
      });
    }

    // Apply promo code if provided
    let discount = 0;
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode }
      });

      if (promo && promo.isActive && promo.validUntil > new Date()) {
        if (!promo.minOrderAmount || totalAmount >= Number(promo.minOrderAmount)) {
          if (promo.discountType === 'PERCENTAGE') {
            discount = (totalAmount * Number(promo.discountValue)) / 100;
          } else {
            discount = Number(promo.discountValue);
          }
        }
      }
    }

    const finalAmount = totalAmount - discount;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        addressId,
        orderNumber: `FF${Date.now()}${Math.floor(Math.random() * 1000)}`,
        totalAmount: finalAmount,
        status: 'PENDING',
        deliveryType: 'DELIVERY',
        notes,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true
      }
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: { message: 'Failed to create order' } });
  }
});

export default router;
