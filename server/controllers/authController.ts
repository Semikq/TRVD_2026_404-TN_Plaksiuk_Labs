import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { registerSchema, loginSchema, updateProfileSchema } from '../lib/validation';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: { message: error.details[0].message } });
      }

      const { email, password, firstName, lastName, phone } = value;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: { message: 'User already exists with this email' } });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'CLIENT'
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: { message: 'Failed to register user' } });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: { message: error.details[0].message } });
      }

      const { email, password } = value;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: { message: 'Failed to login' } });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { message: 'Invalid token' } });
      }

      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: { message: error.details[0].message } });
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: { message: 'Користувача не знайдено' } });
      }

      const updatedUser = await UserModel.update(req.user.id, value);

      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        message: 'Профіль успішно оновлено',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: { message: 'Не вдалося оновити профіль' } });
    }
  }

  static async verifyToken(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { message: 'Invalid token' } });
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ error: { message: 'User not found' } });
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Token is valid',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ error: { message: 'Failed to verify token' } });
    }
  }
}
