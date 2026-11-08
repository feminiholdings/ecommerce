import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import { Product, ProductVariant } from '../../types';
import { CustomerLayout } from '../../components/CustomerLayout';
import { normalizeImageUrl } from '../ProductsView';
import { getCustomerCart, saveCustomerCart } from '../../utils/customerSessionManager';
import { ShoppingCart, CheckCircle2, ArrowRight } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);

export const ProductDetailView: React.FC<{ productId: string }> = ({ productId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    let alive = true;
    api.getPortalProducts().then((res) => {
      if (alive) setProducts(Array.isArray(res) ? res : []);
    }).catch(() => {
      if (alive) setProducts([]);
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const product = products.find((item) => item.id === productId);
  const requestedVariant = new URLSearchParams(window.location.search).get('variant') || '';
  const selectedVariant = product?.variants.find((variant) => variant.id === (selectedVariantId || requestedVariant)) || product?.variants[0];
  const totalStock = selectedVariant ? Object.values(selectedVariant.branchStock || {}).reduce((sum, qty) => sum + Number(qty || 0), 0) : 0;

  useEffect(() => {
    if (product && requestedVariant && product.variants.some((variant) => variant.id === requestedVariant)) {
      setSelectedVariantId(requestedVariant);
    }
  }, [product, requestedVariant]);

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} | Uhuru Market Uniforms – Naisiae Textiles`;
    let description = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = `Buy ${product.name} at Uhuru Market Uniforms (Naisiae Textiles). Premium quality school & institutional uniforms in Nairobi, Kenya.`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/product/${encodeURIComponent(product.id)}`;
  }, [product]);

  const structuredData = useMemo(() => {
    if (!product || !selectedVariant) return null;
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: `${product.name} available from Naisiae Textiles in Kenya.`,
      image: normalizeImageUrl(selectedVariant.imageUrl || product.imageUrl || ''),
      sku: selectedVariant.sku,
      brand: { '@type': 'Brand', name: 'Naisiae Textiles' },
      offers: {
        '@type': 'Offer',
        url: `${window.location.origin}/product/${encodeURIComponent(product.id)}?variant=${encodeURIComponent(selectedVariant.id)}`,
        priceCurrency: 'KES',
        price: selectedVariant.sellingPrice,
        availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    };
  }, [product, selectedVariant, totalStock]);

  if (loading) return <CustomerLayout><div className="mx-auto max-w-5xl p-8 text-center">Loading product…</div></CustomerLayout>;
  if (!product || !product.active) return <CustomerLayout><div className="mx-auto max-w-5xl space-y-4 p-8"><h1 className="text-2xl font-black text-[#030A91]">Product not found</h1><p>This item may no longer be available.</p><a className="font-bold text-blue-800 underline" href="/school-uniforms">Browse uniforms</a></div></CustomerLayout>;

  return <CustomerLayout>
    {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />}
    <main className="mx-auto grid max-w-6xl gap-8 p-4 py-8 sm:p-8 md:grid-cols-2">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <img src={normalizeImageUrl(selectedVariant?.imageUrl || product.imageUrl || '')} alt={product.name} className="max-h-[620px] min-h-72 w-full object-contain p-4" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }} />
      </div>
      <section className="space-y-5">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-800">{product.school || product.category}</p>
        <h1 className="text-3xl font-black text-slate-950">{product.name}</h1>
        <p className="leading-7 text-slate-700">{product.description || `Shop ${product.name} from Naisiae Textiles.`}</p>
        {selectedVariant && <p className="text-3xl font-black text-[#030A91]">{money(selectedVariant.sellingPrice)}</p>}
        <div className="space-y-2">
          <label htmlFor="product-size" className="block text-sm font-bold text-slate-800">Select size</label>
          <select id="product-size" value={selectedVariant?.id || ''} onChange={(e) => setSelectedVariantId(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900">
            {product.variants.map((variant: ProductVariant) => <option key={variant.id} value={variant.id}>{variant.size}{variant.color && !['standard official', 'standard', 'default'].includes(variant.color.toLowerCase()) ? ` — ${variant.color}` : ''}</option>)}
          </select>
        </div>
        <div className="pt-1">
          {totalStock > 5 ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>In stock ({totalStock} units available)</span>
            </div>
          ) : totalStock > 0 ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Low stock (Only {totalStock} units left)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Currently out of stock</span>
            </div>
          )}
        </div>

        {addedToast && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span><strong>{product.name} ({selectedVariant?.size})</strong> added to your persistent bag!</span>
            </div>
            <a href="/portal?openCart=true" className="font-bold underline text-emerald-800 hover:text-emerald-950">
              Checkout &rarr;
            </a>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            disabled={totalStock <= 0}
            onClick={() => {
              if (!product || !selectedVariant) return;
              const existing = getCustomerCart();
              const foundIdx = existing.findIndex((i) => i.variantId === selectedVariant.id);
              let updated;
              if (foundIdx >= 0) {
                updated = existing.map((item, idx) =>
                  idx === foundIdx ? { ...item, quantity: item.quantity + 1 } : item
                );
              } else {
                updated = [
                  ...existing,
                  {
                    productId: product.id,
                    variantId: selectedVariant.id,
                    productName: product.name,
                    sku: selectedVariant.sku,
                    school: product.school || '',
                    size: selectedVariant.size,
                    color: selectedVariant.color || 'Standard',
                    unitPrice: selectedVariant.sellingPrice,
                    quantity: 1,
                    imageUrl: selectedVariant.imageUrl || product.imageUrl,
                  },
                ];
              }
              saveCustomerCart(updated);
              window.dispatchEvent(new Event('storage'));
              setAddedToast(true);
              setTimeout(() => setAddedToast(false), 3000);
            }}
            className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-black flex items-center justify-center space-x-2 transition-all ${
              totalStock > 0 
                ? "bg-white hover:bg-slate-50 border-2 border-[#030A91] text-[#030A91] active:scale-98 cursor-pointer shadow-xs" 
                : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{totalStock > 0 ? "Add to Cart" : "Out of Stock"}</span>
          </button>

          <a
            href={`/portal?product=${encodeURIComponent(product.id)}`}
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#030A91] hover:bg-blue-900 px-6 py-3.5 font-black text-sm text-white transition-all shadow-md active:scale-98 space-x-1.5"
          >
            <span>Proceed to Order</span>
            <ArrowRight className="w-4 h-4 text-[#FACB00]" />
          </a>
        </div>

        <p className="text-xs leading-5 text-slate-500">Prices and availability may vary by size and branch. Confirm your selected size when placing your order.</p>
        <a href={product.school?.toLowerCase().includes('kmtc') ? '/kmtc-uniforms' : product.garmentType === 'Corporate' || product.professionalDomain === 'Corporate' ? '/customized-uniforms' : '/school-uniforms'} className="inline-block text-sm font-bold text-blue-800 underline">Back to catalogue</a>
      </section>
    </main>
  </CustomerLayout>;
};
