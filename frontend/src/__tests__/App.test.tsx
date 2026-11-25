import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
  }),
}));

describe('ProductCard', () => {
  const sampleProduct: Product = {
    id: 'prod-1',
    name: 'Studio ANC Wireless Headphones',
    slug: 'studio-anc-wireless-headphones',
    description: 'Active noise-canceling headphones with 40-hour battery.',
    price: 249.99,
    stock: 15,
    imageUrl: 'https://example.com/headphones.jpg',
    categoryId: 'cat-1',
    isFeatured: true,
    category: {
      id: 'cat-1',
      name: 'Electronics',
      slug: 'electronics',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders product name, category, and formatted price', () => {
    render(
      <MemoryRouter>
        <ProductCard product={sampleProduct} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Studio ANC Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('$249.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeEnabled();
  });

  it('disables Add button and shows Sold Out when stock is 0', () => {
    render(
      <MemoryRouter>
        <ProductCard product={{ ...sampleProduct, stock: 0 }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
  });
});
