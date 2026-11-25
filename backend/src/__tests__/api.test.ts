import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Set test env vars before importing app
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_vitest';

// Mock Prisma client for isolated API tests
vi.mock('../lib/prisma', () => {
  return {
    default: {
      product: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Studio ANC Wireless Headphones',
            slug: 'studio-anc-wireless-headphones',
            description: 'Active noise-canceling headphones.',
            price: 249.99,
            stock: 20,
            imageUrl: 'https://example.com/headphones.jpg',
            categoryId: '22222222-2222-2222-2222-222222222222',
            isFeatured: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            category: {
              id: '22222222-2222-2222-2222-222222222222',
              name: 'Electronics',
              slug: 'electronics',
            },
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
      },
      category: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Electronics',
            slug: 'electronics',
            description: 'Tech essentials',
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { products: 5 },
          },
        ]),
      },
      order: {
        count: vi.fn().mockResolvedValue(3),
        aggregate: vi.fn().mockResolvedValue({ _sum: { totalAmount: 450.5 } }),
        findMany: vi.fn().mockResolvedValue([]),
        groupBy: vi.fn().mockResolvedValue([]),
      },
      user: {
        count: vi.fn().mockResolvedValue(10),
      },
    },
  };
});

import app from '../server';

describe('ShopSphere Backend API', () => {
  let customerToken: string;
  let adminToken: string;

  beforeAll(() => {
    customerToken = jwt.sign(
      { id: 'cust-1', email: 'customer@shopsphere.local', role: 'CUSTOMER' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
    adminToken = jwt.sign(
      { id: 'admin-1', email: 'admin@shopsphere.local', role: 'ADMIN' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
  });

  it('GET /api/v1/health returns 200 and status payload', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('ShopSphere API is running');
  });

  it('GET /api/v1/products returns paginated products', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].name).toBe('Studio ANC Wireless Headphones');
    expect(res.body.pagination.total).toBe(1);
  });

  it('GET /api/v1/categories returns categories with productCount', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].productCount).toBe(5);
  });

  it('POST /api/v1/auth/register rejects invalid payload with 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed.');
  });

  it('GET /api/v1/admin/stats rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin/stats');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/admin/stats rejects CUSTOMER role with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/v1/admin/stats allows ADMIN role with 200', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRevenue).toBe(450.5);
  });
});
