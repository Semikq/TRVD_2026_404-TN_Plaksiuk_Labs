import { PrismaClient, Product, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductModel {
  static async findMany(params: {
    where?: Prisma.ProductWhereInput;
    include?: Prisma.ProductInclude;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    return await prisma.product.findMany(params);
  }

  static async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  static async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return await prisma.product.count({ where });
  }

  static async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return await prisma.product.create({
      data,
      include: {
        category: true
      }
    });
  }

  static async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });
  }

  static async delete(id: string): Promise<Product> {
    return await prisma.product.delete({
      where: { id }
    });
  }
}
