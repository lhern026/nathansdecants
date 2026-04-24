/*
  Nathan's Decants — Motion Choreography & Interactions
  GPU-safe: Only animates transform and opacity
*/

document.addEventListener('DOMContentLoaded', () => {

  /* ==============================
     1. HAMBURGER MENU
     ============================== */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav__close');
  const navLinks = document.querySelectorAll('.mobile-nav__link');

  function openMenu() {
    if (!mobileNav) return;
    hamburger.classList.add('is-active');
    mobileNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    navLinks.forEach((link, i) => {
      link.style.transitionDelay = `${150 + i * 60}ms`;
    });
  }

  function closeMenu() {
    if (!mobileNav) return;
    hamburger.classList.remove('is-active');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
    navLinks.forEach(link => {
      link.style.transitionDelay = '0ms';
    });
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  /* ==============================
     2. SCROLL REVEAL (IntersectionObserver)
     ============================== */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -80px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el, i) => {
    if (el.closest('.product-grid')) {
      el.style.transitionDelay = `${(i % 3) * 120}ms`;
    }
    revealObserver.observe(el);
  });

  /* ==============================
     3. HEADER HIDE/SHOW ON SCROLL
     ============================== */
  const header = document.querySelector('.site-header');
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    if (!header) return;
    const currentY = window.pageYOffset;
    if (currentY > lastScrollY && currentY > 100) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  /* ==============================
     4. CART DRAWER
     ============================== */
  const cartTriggers = document.querySelectorAll('.js-cart-drawer-trigger');
  const cartClosers = document.querySelectorAll('.js-cart-drawer-close');
  const cartDrawer = document.getElementById('CartDrawer');
  const cartOverlay = document.querySelector('.cart-drawer-overlay');

  function openCart(e) {
    if (e) e.preventDefault();
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-active');
    if (cartOverlay) cartOverlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-active');
    if (cartOverlay) cartOverlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  cartTriggers.forEach(btn => btn.addEventListener('click', openCart));
  cartClosers.forEach(btn => btn.addEventListener('click', closeCart));

  /* ==============================
     5. AJAX CART LIVE UPDATES
     ============================== */
  async function updateCartQuantity(line, qty, itemRow) {
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: qty })
    });
    
    const cart = await response.json();
    
    if (qty === 0) {
      itemRow.style.opacity = '0';
      itemRow.style.transform = 'translateX(20px)';
      setTimeout(() => {
        itemRow.remove();
        if (cart.item_count === 0) window.location.reload(); 
      }, 500);
    }

    // Refresh Subtotals (All contexts)
    const subtotals = document.querySelectorAll('.js-cart-subtotal, .js-drawer-subtotal');
    subtotals.forEach(math => math.innerHTML = formatMoney(cart.total_price));

    // Refresh Header Count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.innerHTML = cart.item_count;
      cartCount.style.display = cart.item_count > 0 ? 'flex' : 'none';
    }

    // Refresh item specific data
    const updatedItem = cart.items[line - 1];
    if (updatedItem) {
      const p = itemRow.querySelector('.cart-item__price, .js-drawer-item-price');
      if (p) p.innerHTML = formatMoney(updatedItem.final_line_price);
      
      const q = itemRow.querySelector('.js-drawer-qty-num');
      if (q) q.innerHTML = updatedItem.quantity;
    }
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  // Page Cart Handlers
  document.querySelectorAll('.js-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.cart-item');
      const input = row.querySelector('.cart-qty-input');
      const line = Array.from(document.querySelectorAll('.cart-item')).indexOf(row) + 1;
      let val = parseInt(input.value, 10);
      if (val > 0) { val--; input.value = val; updateCartQuantity(line, val, row); }
    });
  });

  document.querySelectorAll('.js-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.cart-item');
      const input = row.querySelector('.cart-qty-input');
      const line = Array.from(document.querySelectorAll('.cart-item')).indexOf(row) + 1;
      let val = parseInt(input.value, 10) + 1;
      input.value = val;
      updateCartQuantity(line, val, row);
    });
  });

  // Drawer Cart Handlers
  document.querySelectorAll('.js-drawer-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.cart-drawer__item');
      const info = btn.closest('.cart-drawer__item-info');
      const line = parseInt(info.getAttribute('data-line'), 10);
      const span = info.querySelector('.js-drawer-qty-num');
      let val = parseInt(span.innerHTML, 10);
      if (val > 0) { val--; span.innerHTML = val; updateCartQuantity(line, val, row); }
    });
  });

  document.querySelectorAll('.js-drawer-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.cart-drawer__item');
      const info = btn.closest('.cart-drawer__item-info');
      const line = parseInt(info.getAttribute('data-line'), 10);
      const span = info.querySelector('.js-drawer-qty-num');
      let val = parseInt(span.innerHTML, 10) + 1;
      span.innerHTML = val;
      updateCartQuantity(line, val, row);
    });
  });

});
