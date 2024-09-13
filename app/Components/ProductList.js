import React from 'react';
import ProductCard from "./ProductCard";
import { X } from 'lucide-react';

export default function ProductList({
  products,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onExport,
  onClearSelected,
}) {
  return (
    <div>
      {products.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.url}
                product={product}
                isSelected={selectedProducts.some((p) => p.url === product.url)}
                onAddProduct={onAddProduct}
              />
            ))}
          </div>
          {selectedProducts.length > 0 && (
            <div className="flex flex-col gap-2 fixed right-0 top-1/2 -translate-y-1/2 bg-black w-[200px] m-2 mr-4 max-h-[calc(90vh)]" style={{margin:"40px", borderRadius:"12px", borderColor:"white"}}>
              <h2 className="text-xl font-semibold mt-4 mb-2">
                Selected Products
              </h2>
              <ul className="overflow-y-auto flex-grow">
                {selectedProducts.map((product) => (
                  <li key={product.url} className="mb-2 mr-4 flex items-center justify-between">
                    <span className="truncate">{product.name}</span>
                    <button  style={{color:"white"}}
                      onClick={() => onRemoveProduct(product)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={onClearSelected}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Selected Products
              </button>
              <button
                onClick={onExport}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Export Selected Products to CSV
              </button>
            </div>
          )}
          <br/><br/>
        </div>
      ) : <h1>No results found</h1>}
    </div>
  );
}