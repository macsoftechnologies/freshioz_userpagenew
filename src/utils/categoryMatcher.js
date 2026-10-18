/**
 * Product category matcher utility.
 * Matches product against selected category ID, slug, or label across taxonomy.
 */
export function matchesProductCategory(product, selectedCatId, categories = []) {
  if (!selectedCatId || selectedCatId === 'ALL') return true;
  if (!product) return false;

  const target = String(selectedCatId).trim().toLowerCase();

  // 1. Direct match on product.categoryId
  if (product.categoryId && String(product.categoryId).trim().toLowerCase() === target) {
    return true;
  }

  // 2. Direct match on product.category (string or object)
  const prodCatStr = typeof product.category === 'object'
    ? (product.category?.name || product.category?.id || product.category?.slug || '')
    : String(product.category || '');

  if (prodCatStr && prodCatStr.trim().toLowerCase() === target) {
    return true;
  }

  if (typeof product.category === 'object' && product.category?.id) {
    if (String(product.category.id).trim().toLowerCase() === target) return true;
  }

  // 3. Match via categories list taxonomy (slug, id, name)
  const catObj = (categories || []).find(c => 
    String(c.id || '').trim().toLowerCase() === target ||
    String(c.name || c.label || '').trim().toLowerCase() === target ||
    String(c.slug || '').trim().toLowerCase() === target
  );

  if (catObj) {
    const catId = String(catObj.id || '').trim().toLowerCase();
    const catName = String(catObj.name || catObj.label || '').trim().toLowerCase();
    const catSlug = String(catObj.slug || '').trim().toLowerCase();

    const pCatId = String(product.categoryId || '').trim().toLowerCase();
    const pCatName = prodCatStr.trim().toLowerCase();

    if (catId && (pCatId === catId || pCatName === catId)) return true;
    if (catName && (pCatId === catName || pCatName === catName)) return true;
    if (catSlug && (pCatId === catSlug || pCatName === catSlug)) return true;
  }

  return false;
}
