const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Admin middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: { message: 'Admin access required' } });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'OK', message: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed', error: error.message });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({ error: { message: 'User already exists' } });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'CLIENT' // Використовуємо роль з запиту або CLIENT за замовчуванням
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return res.status(401).json({ error: { message: 'User not found' } });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
});

// Update profile endpoint
app.put('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { firstName, lastName, phone } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined
      },
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
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: { message: 'Failed to update profile' } });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            weight: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: { message: 'Failed to get categories' } });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    
    let where = { isAvailable: true };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: { message: 'Failed to get products' } });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: { message: 'Failed to get product' } });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    
    const token = authHeader.substring(7);
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    
    const {
      deliveryType,
      address,
      phone,
      items,
      totalAmount
    } = req.body;

    // Валідація items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: { message: 'Items are required' } });
    }

    const validItems = items.filter(item => {
      const isValid = item && item.productId && item.quantity && item.price;
      return isValid;
    });

    if (validItems.length === 0) {
      return res.status(400).json({ error: { message: 'No valid items provided' } });
    }

    if (validItems.length !== items.length) {
      // Some items were filtered out as invalid
    }

    // Перевірка існування продуктів
    const productIds = validItems.map(item => item.productId);

    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    });

    if (existingProducts.length !== productIds.length) {
      const existingIds = existingProducts.map(p => p.id);
      const missingIds = productIds.filter(id => !existingIds.includes(id));
      return res.status(400).json({ 
        error: { 
          message: 'Some products not found', 
          missingIds 
        }
      });
    }

    // Генерація номера замовлення
    const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

    // Конвертуємо українські назви типів доставки в англійські для бази даних
    const normalizedDeliveryType = deliveryType === 'Доставка Додому' ? 'DELIVERY' : 
                                  deliveryType === 'Самовивіз' ? 'PICKUP' : 
                                  deliveryType;

    const orderData = {
      orderNumber,
      status: 'PENDING',
      totalAmount: parseFloat(totalAmount),
      deliveryType: normalizedDeliveryType,
      deliveryFee: 0,
      userId: decoded.userId
    };

    const order = await prisma.order.create({
      data: orderData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Створення адреси якщо це доставка
    let createdAddress = null;
    if ((deliveryType === 'Доставка Додому' || deliveryType === 'DELIVERY') && address) {
      // Якщо address це рядок, створюємо об'єкт
      const addressData = typeof address === 'string' 
        ? { street: address, city: 'Не вказано', zipCode: '00000' }
        : address;
        
      createdAddress = await prisma.address.create({
        data: {
          street: addressData.street,
          city: addressData.city || 'Не вказано',
          zipCode: addressData.zipCode || '00000',
          isDefault: false,
          userId: decoded.userId
        }
      });

      // Оновлюємо замовлення з адресою
      await prisma.order.update({
        where: { id: order.id },
        data: { addressId: createdAddress.id }
      });
    }

    // Створення елементів замовлення
    const orderItemsData = validItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));

    const orderItems = await prisma.orderItem.createMany({
      data: orderItemsData
    });

    // Створення запису про оплату
    await prisma.payment.create({
      data: {
        amount: parseFloat(totalAmount),
        status: 'PENDING',
        paymentMethod: 'CASH',
        orderId: order.id
      }
    });

    res.status(201).json({
      message: 'Замовлення успішно створено',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryType: order.deliveryType,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: { message: 'Failed to create order', details: error.message } });
  }
});

// Get user orders
app.get('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        },
        address: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: { message: 'Failed to get orders' } });
  }
});

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { 
        id: id,
        userId: decoded.userId 
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: { message: 'Failed to get order' } });
  }
});

// Admin: Get all orders
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        },
        address: true,
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: { message: 'Failed to get orders' } });
  }
});

// Admin: Update order status
app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status' } });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        },
        address: true,
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json({ 
      message: 'Order status updated successfully',
      order 
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }
    res.status(500).json({ error: { message: 'Failed to update order status' } });
  }
});

// Admin: Create product
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, weight, categoryId, imageUrl } = req.body;

    // Validate required fields
    if (!name || !price || !weight || !categoryId) {
      return res.status(400).json({ error: { message: 'Name, price, weight, and categoryId are required' } });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        weight: parseInt(weight),
        categoryId,
        imageUrl: imageUrl || null,
        isAvailable: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({ 
      message: 'Product created successfully',
      product 
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: { message: 'Failed to create product' } });
  }
});

// Admin: Update product
app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, weight, categoryId, imageUrl, isAvailable } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(weight && { weight: parseInt(weight) }),
        ...(categoryId && { categoryId }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({ 
      message: 'Product updated successfully',
      product 
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }
    res.status(500).json({ error: { message: 'Failed to update product' } });
  }
});

// Admin: Delete product
app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }
    res.status(500).json({ error: { message: 'Failed to delete product' } });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("test");
});

// Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('🔄 Shutting down gracefully...');
//   await prisma.$disconnect();
//   process.exit(0);
// });
