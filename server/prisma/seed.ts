import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Створення категорій
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Заморожена піца',
        description: 'Різноманітна заморожена піца',
        imageUrl: '/images/pizza-category.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Заморожені напівфабрикати',
        description: 'Пельмені, вареники та інші напівфабрикати',
        imageUrl: '/images/semi-finished.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Морозиво',
        description: 'Різні сорти морозива',
        imageUrl: '/images/ice-cream.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Заморожені овочі та фрукти',
        description: 'Свіжезаморожені овочі та фрукти',
        imageUrl: '/images/vegetables.jpg'
      }
    })
  ]);

  // Створення продуктів
  const products = await Promise.all([
    // Піца
    prisma.product.create({
      data: {
        name: 'Піца Маргарита',
        description: 'Класична піца з томатним соусом, моцарелою та базиліком',
        price: 89.99,
        weight: 450,
        categoryId: categories[0].id,
        imageUrl: '/images/pizza-margarita.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Піца Пепероні',
        description: 'Піца з пепероні та моцарелою',
        price: 99.99,
        weight: 450,
        categoryId: categories[0].id,
        imageUrl: '/images/pizza-pepperoni.jpg'
      }
    }),
    // Напівфабрикати
    prisma.product.create({
      data: {
        name: 'Пельмені домашні',
        description: 'Традиційні домашні пельмені з яловичиною та свининою',
        price: 45.99,
        weight: 500,
        categoryId: categories[1].id,
        imageUrl: '/images/pelmeni.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Вареники з картоплею',
        description: 'Домашні вареники з картоплею та цибулею',
        price: 35.99,
        weight: 500,
        categoryId: categories[1].id,
        imageUrl: '/images/varenyky.jpg'
      }
    }),
    // Морозиво
    prisma.product.create({
      data: {
        name: 'Морозиво пломбір',
        description: 'Класичне ванільне морозиво',
        price: 25.99,
        weight: 500,
        categoryId: categories[2].id,
        imageUrl: '/images/vanilla-ice-cream.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Морозиво шоколадне',
        description: 'Насичене шоколадне морозиво',
        price: 25.99,
        weight: 500,
        categoryId: categories[2].id,
        imageUrl: '/images/chocolate-ice-cream.jpg'
      }
    }),
    // Овочі
    prisma.product.create({
      data: {
        name: 'Кукурудза заморожена',
        description: 'Солодка заморожена кукурудза',
        price: 28.99,
        weight: 400,
        categoryId: categories[3].id,
        imageUrl: '/images/corn.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Суміш овочева',
        description: 'Суміш заморожених овочів',
        price: 32.99,
        weight: 500,
        categoryId: categories[3].id,
        imageUrl: '/images/vegetable-mix.jpg'
      }
    })
  ]);

  // Створення адміністратора
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@frostifood.com',
      password: hashedPassword,
      firstName: 'Адмін',
      lastName: 'Адмінов',
      phone: '+380123456789',
      role: 'ADMIN'
    }
  });

  // Створення тестового клієнта
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.create({
    data: {
      email: 'client@example.com',
      password: clientPassword,
      firstName: 'Іван',
      lastName: 'Петренко',
      phone: '+380987654321',
      role: 'CLIENT'
    }
  });

  // Створення адреси для клієнта
  const address = await prisma.address.create({
    data: {
      street: 'вул. Хрещатик, 1',
      city: 'Київ',
      zipCode: '01001',
      isDefault: true,
      userId: client.id
    }
  });

  // Створення промокодів
  await Promise.all([
    prisma.promoCode.create({
      data: {
        code: 'FIRST10',
        description: 'Знижка 10% на перше замовлення',
        discountType: 'PERCENTAGE',
        discountValue: 10.00,
        minOrderAmount: 100.00,
        maxUses: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 днів
      }
    }),
    prisma.promoCode.create({
      data: {
        code: 'FROSTY50',
        description: 'Знижка 50 грн на замовлення від 300 грн',
        discountType: 'FIXED_AMOUNT',
        discountValue: 50.00,
        minOrderAmount: 300.00,
        maxUses: 50,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // +60 днів
      }
    })
  ]);

  console.log('✅ Тестові дані успішно додано!');
  console.log(`👤 Адміністратор: admin@frostifood.com / admin123`);
  console.log(`👤 Клієнт: client@example.com / client123`);
  console.log(`📦 Додано ${categories.length} категорій`);
  console.log(`🍕 Додано ${products.length} продуктів`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
