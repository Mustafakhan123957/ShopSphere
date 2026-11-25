import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-secondary-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary-900/80 px-2.5 py-0.5 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}
        {product.isFeatured && product.stock > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-medium text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-primary-600">
            {product.category.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-secondary-900 group-hover:text-primary-600">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-secondary-500">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-secondary-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-secondary-300"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.stock === 0 ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
};
