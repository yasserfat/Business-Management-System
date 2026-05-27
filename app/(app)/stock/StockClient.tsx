'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProducts, adjustQuantity } from '@/store/slices/productsSlice';
import { openProductModal, openDeleteConfirm } from '@/store/slices/uiSlice';
import { Product } from '@/types';
import ProductModal from '@/components/modals/ProductModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import clsx from 'clsx';

interface Props { initialData: Product[]; }

export default function StockClient({ initialData }: Props) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(s => s.products.items);
  const supabase = createClient();

  useEffect(() => { dispatch(setProducts(initialData)); }, []);

  const handleQuantityChange = async (id: string, delta: number, currentQty: number) => {
    const newQty = Math.max(0, currentQty + delta);
    dispatch(adjustQuantity({ id, delta }));
    await supabase.from('products').update({ quantity: newQty }).eq('id', id);
  };

  const lowStockCount = products.filter(p => p.quantity < 5).length;

  const QuantityControl = ({ p }: { p: Product }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleQuantityChange(p.id, -1, p.quantity)}
        disabled={p.quantity === 0}
        className="w-8 h-8 bg-surface-100 hover:bg-surface-200 rounded-lg text-ink-muted flex items-center justify-center disabled:opacity-30 transition-colors font-bold"
      >−</button>
      <span className={clsx('w-10 text-center text-sm font-bold', p.quantity < 5 ? 'text-red-600' : 'text-ink')}>
        {p.quantity}
      </span>
      <button
        onClick={() => handleQuantityChange(p.id, 1, p.quantity)}
        className="w-8 h-8 bg-surface-100 hover:bg-surface-200 rounded-lg text-ink-muted flex items-center justify-center transition-colors font-bold"
      >+</button>
    </div>
  );

  const EditBtn = ({ id }: { id: string }) => (
    <button onClick={() => dispatch(openProductModal(id))} className="btn-ghost py-1.5 px-2.5 text-xs">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Modifier
    </button>
  );
  const DeleteBtn = ({ id }: { id: string }) => (
    <button onClick={() => dispatch(openDeleteConfirm({ type: 'product', id }))} className="btn-ghost py-1.5 px-2.5 text-xs !text-red-500 hover:!bg-red-50">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Supprimer
    </button>
  );

  return (
    <div className="p-4 md:p-8 animate-fade-in mt-[60px] lg:mt-0">
      <ProductModal />
      <DeleteConfirmModal />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Stock</h1>
          <p className="text-ink-muted text-sm mt-1">
            {products.length} produits
            {lowStockCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                ⚠ {lowStockCount} stock faible
              </span>
            )}
          </p>
        </div>
        <button onClick={() => dispatch(openProductModal(null))} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nouveau produit</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* ── MOBILE: cards ── */}
      <div className="md:hidden space-y-3">
        {products.length === 0 ? (
          <div className="card text-center py-10 text-ink-subtle text-sm">
            Aucun produit dans le stock
          </div>
        ) : products.map(p => {
          const lowStock = p.quantity < 5;
          const margin = p.selling_price - p.buying_price;
          const marginPct = p.buying_price > 0 ? ((margin / p.buying_price) * 100).toFixed(0) : 0;
          return (
            <div key={p.id} className={clsx('card space-y-3', lowStock && 'border-l-4 border-l-red-400')}>
              {/* Top: icon + name + low stock badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                    lowStock ? 'bg-red-100' : 'bg-violet-100'
                  )}>📦</div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{p.name}</p>
                    {lowStock && <p className="text-xs text-red-500 font-medium">⚠ Stock faible</p>}
                  </div>
                </div>
                {/* Quantity control on the right */}
                <QuantityControl p={p} />
              </div>

              {/* Prices + margin */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-surface-50 rounded-xl px-3 py-2">
                  <p className="text-ink-subtle mb-0.5">Achat</p>
                  <p className="font-semibold text-ink">{p.buying_price.toLocaleString('fr-DZ')} DA</p>
                </div>
                <div className="bg-surface-50 rounded-xl px-3 py-2">
                  <p className="text-ink-subtle mb-0.5">Vente</p>
                  <p className="font-semibold text-ink">{p.selling_price.toLocaleString('fr-DZ')} DA</p>
                </div>
                <div className="bg-surface-50 rounded-xl px-3 py-2">
                  <p className="text-ink-subtle mb-0.5">Marge</p>
                  <p className={clsx('font-semibold', margin >= 0 ? 'text-emerald-700' : 'text-red-600')}>
                    {marginPct}%
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <EditBtn id={p.id} />
                <DeleteBtn id={p.id} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: table ── */}
      <div className="hidden md:block card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="table-head text-left px-5 py-3.5">Produit</th>
                <th className="table-head text-left px-5 py-3.5">Prix achat</th>
                <th className="table-head text-left px-5 py-3.5">Prix vente</th>
                <th className="table-head text-left px-5 py-3.5">Marge</th>
                <th className="table-head text-left px-5 py-3.5">Quantité</th>
                <th className="table-head text-left px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-subtle text-sm">
                    Aucun produit dans le stock
                  </td>
                </tr>
              ) : products.map(p => {
                const lowStock = p.quantity < 5;
                const margin = p.selling_price - p.buying_price;
                const marginPct = p.buying_price > 0 ? ((margin / p.buying_price) * 100).toFixed(0) : 0;
                return (
                  <tr key={p.id} className={clsx('transition-colors', lowStock ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-surface-50')}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm', lowStock ? 'bg-red-100' : 'bg-violet-100')}>📦</div>
                        <div>
                          <p className="text-sm font-medium text-ink">{p.name}</p>
                          {lowStock && <p className="text-xs text-red-500 font-medium">Stock faible</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-muted">{p.buying_price.toLocaleString('fr-DZ')} DA</td>
                    <td className="px-5 py-4 text-sm font-medium text-ink">{p.selling_price.toLocaleString('fr-DZ')} DA</td>
                    <td className="px-5 py-4">
                      <span className={clsx('text-xs font-semibold px-2 py-1 rounded-full', margin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                        +{margin.toLocaleString('fr-DZ')} DA ({marginPct}%)
                      </span>
                    </td>
                    <td className="px-5 py-4"><QuantityControl p={p} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <EditBtn id={p.id} />
                        <DeleteBtn id={p.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
