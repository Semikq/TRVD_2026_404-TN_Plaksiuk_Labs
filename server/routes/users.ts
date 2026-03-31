import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { addressSchema } from '../lib/validation';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: { message: 'Failed to get user profile' } });
  }
});

// Get user addresses
router.get('/addresses', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }]
    });

    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: { message: 'Failed to get addresses' } });
  }
});

// Add new address
router.post('/addresses', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const address = await prisma.address.create({
      data: {
        ...value,
        userId: req.user!.id
      }
    });

    res.status(201).json({ message: 'Address added successfully', address });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: { message: 'Failed to add address' } });
  }
});

export default router;
