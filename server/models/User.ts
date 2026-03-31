import { PrismaClient, User, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  static async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  static async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }): Promise<User> {
    return await prisma.user.create({
      data
    });
  }

  static async update(id: string, data: Partial<User>): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id }
    });
  }

  static async getUserWithAddresses(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { id: 'asc' }]
        }
      }
    });
  }
}
