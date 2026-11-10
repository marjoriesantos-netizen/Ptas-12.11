export const toProductDTO = (product) => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  active: product.active,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});
