"use client";

import { unitPrice, useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/currency";

function buildWhatsAppMessage(items: ReturnType<typeof useCart>["items"]): string {
  const lines = ["Olá! Vim pelo site da Ceará Auto Elétrica e Bateria e gostaria de cotar:", ""];
  let total = 0;
  items.forEach((item, i) => {
    const unit = unitPrice(item);
    const subtotal = unit * item.quantity;
    total += subtotal;
    lines.push(`${i + 1}) ${item.name} — Qtd: ${item.quantity} — ${formatCurrency(subtotal)}`);
  });
  lines.push("", `*Total estimado:* ${formatCurrency(total)}`, "", "Nome:", "Cidade:", "Observações:");
  return lines.join("\n");
}

export function CartDrawer(): JSX.Element {
  const { items, total, isOpen, close, setQty, remove } = useCart();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";

  function handleCheckout(): void {
    if (!items.length) return;
    const message = buildWhatsAppMessage(items);
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? "is-open" : ""}`} onClick={close} aria-hidden />
      <aside className={`drawer ${isOpen ? "is-open" : ""}`} aria-label="Carrinho de compras">
        <div className="drawer-head">
          <h3>Seu carrinho</h3>
          <button className="drawer-close" onClick={close} aria-label="Fechar carrinho" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M6 6l-1-3H2" />
              </svg>
              <p>Seu carrinho está vazio.</p>
              <p style={{ fontSize: "0.85rem" }}>Adicione produtos e finalize no WhatsApp.</p>
            </div>
          ) : (
            items.map((it) => {
              const unit = unitPrice(it);
              const hasImage = it.imageMain && it.imageMain !== "/placeholder-product.svg";
              return (
                <div key={it.id} className="cart-item">
                  <div className="cart-item-thumb">
                    {hasImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageMain} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 7l9-4 9 4-9 4-9-4z" />
                        <path d="M3 7v10l9 4 9-4V7" />
                      </svg>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <strong>{it.name}</strong>
                    <span className="price">{formatCurrency(unit)}</span>
                    <div className="qty">
                      <button onClick={() => setQty(it.id, it.quantity - 1)} type="button" aria-label="Diminuir">−</button>
                      <span>{it.quantity}</span>
                      <button onClick={() => setQty(it.id, it.quantity + 1)} type="button" aria-label="Aumentar">+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => remove(it.id)} type="button" title="Remover" aria-label="Remover item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6l-12 12" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="drawer-foot">
          <div className="drawer-total">
            <span>Total estimado</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <button className="btn btn--wpp btn--block" disabled={items.length === 0} onClick={handleCheckout} type="button" data-magnetic>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
            </svg>
            Finalizar no WhatsApp
          </button>
        </div>
      </aside>
    </>
  );
}
