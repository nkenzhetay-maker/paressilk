import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, totalPrice } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'cart-overlay--open' : ''}`} onClick={() => setIsOpen(false)} />
      <div className={`cart-sidebar ${isOpen ? 'cart-sidebar--open' : ''}`}>
        <div className="cart-sidebar__header">
          <h3 className="cart-sidebar__title">Sepetiniz ({items.length})</h3>
          <button className="cart-sidebar__close" onClick={() => setIsOpen(false)} aria-label="Kapat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="cart-sidebar__items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p style={{ marginTop: 16 }}>Sepetiniz boş</p>
              <button className="btn btn--primary" onClick={() => setIsOpen(false)} style={{ marginTop: 16 }}>
                Alışverişe Başla
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.images?.[0] || '/images/products/kelaghayi-1.jpg'} alt={item.name} className="cart-item__image" />
                <div className="cart-item__info">
                  <h4 className="cart-item__name">{item.name}</h4>
                  <p className="cart-item__price">{formatPrice(item.price)}</p>
                  <div className="cart-item__qty">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button className="cart-item__remove" onClick={() => removeItem(item.id)}>Kaldır</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total">
              <span>Toplam</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Link to="/checkout" onClick={() => setIsOpen(false)}>
              <button className="cart-sidebar__checkout">Siparişi Tamamla</button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
