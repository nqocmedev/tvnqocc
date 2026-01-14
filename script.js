/* =========================================================
   Shop & Donate — Professional Vanilla JS
   Features:
   - Products CRUD (Admin) w/ localStorage
   - Cart drawer (add/remove/qty/total) w/ localStorage
   - Dark mode w/ localStorage
   - Product modal
   - Copy donate + toast
   - Reveal animations (IntersectionObserver)
   - Custom cursor (desktop)
   - Mobile menu
========================================================= */

(() => {
  "use strict";

  // ---------- Storage Keys ----------
  const K_PRODUCTS = "tvn_products_v1";
  const K_CART = "tvn_cart_v1";
  const K_THEME = "tvn_theme_v1";
  const K_TOPBAR = "tvn_topbar_closed_v1";
  const K_ADMIN = "tvn_admin_logged_v1";

  // ---------- Utils ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const formatVND = (n) => {
    try {
      return Number(n).toLocaleString("vi-VN") + " ₫";
    } catch {
      return `${n} ₫`;
    }
  };

  const uid = () => "p_" + Math.random().toString(16).slice(2) + Date.now().toString(16);

  const toast = (() => {
    const el = $("#toast");
    let t = null;
    return (msg, ms = 1600) => {
      if (!el) return;
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove("show"), ms);
    };
  })();

  const safeJSON = (str, fallback) => {
    try { return JSON.parse(str); } catch { return fallback; }
  };

  // ---------- Demo Data ----------
  const DEMO_PRODUCTS = [
    {
      id: uid(),
      name: "UI Kit Premium",
      price: 199000,
      desc: "Bộ UI kit tối giản, typography đẹp, chuẩn spacing.",
      image: "https://picsum.photos/seed/uikit/900/600",
      isNew: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 2
    },
    {
      id: uid(),
      name: "Landing Page Template",
      price: 299000,
      desc: "Template landing page tối ưu chuyển đổi, responsive.",
      image: "https://picsum.photos/seed/landing/900/600",
      isNew: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24
    },
    {
      id: uid(),
      name: "Admin Dashboard UI",
      price: 349000,
      desc: "Dashboard UI sạch, layout rõ ràng, dễ mở rộng.",
      image: "https://picsum.photos/seed/admin/900/600",
      isNew: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 48
    },
    {
      id: uid(),
      name: "Icon Pack (SVG)",
      price: 149000,
      desc: "Bộ icon SVG nhẹ, chuẩn theme, dễ thay màu.",
      image: "https://picsum.photos/seed/icons/900/600",
      isNew: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 72
    },
    {
      id: uid(),
      name: "Animation Snippets",
      price: 179000,
      desc: "Snippet animation mượt (fade/slide/modal/drawer).",
      image: "https://picsum.photos/seed/anim/900/600",
      isNew: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 6
    },
    {
      id: uid(),
      name: "Portfolio Starter",
      price: 259000,
      desc: "Bộ khởi tạo portfolio cá nhân: đẹp, tối ưu SEO.",
      image: "https://picsum.photos/seed/port/900/600",
      isNew: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 120
    }
  ];

  // ---------- App State ----------
  let products = loadProducts();
  let cart = loadCart();

  const state = {
    search: "",
    sort: "default",
    selectedProductId: null,
    adminEditingId: null
  };

  // ---------- Elements ----------
  const yearEl = $("#year");
  const productGrid = $("#productGrid");
  const emptyState = $("#emptyState");
  const statProducts = $("#statProducts");

  const searchInput = $("#searchInput");
  const sortSelect = $("#sortSelect");
  const clearFilters = $("#clearFilters");
  const emptyAdmin = $("#emptyAdmin");

  // Product Modal
  const productModal = $("#productModal");
  const productClose = $("#productClose");
  const pmImage = $("#pmImage");
  const pmTitle = $("#pmTitle");
  const pmTag = $("#pmTag");
  const pmPrice = $("#pmPrice");
  const pmDesc = $("#pmDesc");
  const pmAddCart = $("#pmAddCart");
  const pmBuyNow = $("#pmBuyNow");

  // Cart Drawer
  const cartDrawer = $("#cartDrawer");
  const cartToggle = $("#cartToggle");
  const cartClose = $("#cartClose");
  const cartOverlay = $("#cartOverlay");
  const cartList = $("#cartList");
  const cartTotal = $("#cartTotal");
  const cartCount = $("#cartCount");
  const cartClear = $("#cartClear");
  const cartCheckout = $("#cartCheckout");

  // Theme
  const themeToggle = $("#themeToggle");
  const mobileTheme = $("#mobileTheme");

  // Admin
  const adminOpen = $("#adminOpen");
  const adminOpen2 = $("#adminOpen2");
  const mobileAdmin = $("#mobileAdmin");
  const loginModal = $("#loginModal");
  const loginClose = $("#loginClose");
  const loginForm = $("#loginForm");
  const adminPass = $("#adminPass");

  const adminModal = $("#adminModal");
  const adminClose = $("#adminClose");
  const adminLogout = $("#adminLogout");
  const adminReset = $("#adminReset");
  const adminList = $("#adminList");

  const productForm = $("#productForm");
  const formTitle = $("#formTitle");
  const editId = $("#editId");
  const pName = $("#pName");
  const pPrice = $("#pPrice");
  const pImage = $("#pImage");
  const pDesc = $("#pDesc");
  const pNew = $("#pNew");
  const cancelEdit = $("#cancelEdit");

  // Mobile menu
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");
  const mobileCart = $("#mobileCart");

  // Topbar
  const topbarClose = $("#topbarClose");
  const topbar = $(".topbar");

  // Quick demo
  const quickAddDemo = $("#quickAddDemo");

  // Donate copy
  const copyBtns = $$(".copyBtn");

  // ---------- Init ----------
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Topbar
  if (topbar && localStorage.getItem(K_TOPBAR) === "1") {
    topbar.style.display = "none";
  }
  topbarClose?.addEventListener("click", () => {
    if (topbar) topbar.style.display = "none";
    localStorage.setItem(K_TOPBAR, "1");
  });

  // Theme init
  initTheme();

  // Render
  renderAll();

  // Reveal animation
  initReveal();

  // Cursor
  initCursor();

  // Events
  bindEvents();

  // ---------- Functions ----------
  function loadProducts() {
    const saved = safeJSON(localStorage.getItem(K_PRODUCTS), null);
    if (Array.isArray(saved) && saved.length) return saved;
    localStorage.setItem(K_PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
    return DEMO_PRODUCTS;
  }

  function saveProducts() {
    localStorage.setItem(K_PRODUCTS, JSON.stringify(products));
  }

  function loadCart() {
    const saved = safeJSON(localStorage.getItem(K_CART), null);
    if (Array.isArray(saved)) return saved;
    localStorage.setItem(K_CART, JSON.stringify([]));
    return [];
  }

  function saveCart() {
    localStorage.setItem(K_CART, JSON.stringify(cart));
  }

  function getProductById(id) {
    return products.find(p => p.id === id) || null;
  }

  function filteredProducts() {
    const q = state.search.trim().toLowerCase();
    let list = products.slice();

    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      );
    }

    switch (state.sort) {
      case "newest":
        list.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case "price-asc":
        list.sort((a,b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a,b) => Number(b.price) - Number(a.price));
        break;
      case "name-asc":
        list.sort((a,b) => a.name.localeCompare(b.name, "vi"));
        break;
      default:
        // default = keep current order
        break;
    }

    return list;
  }

  function renderAll() {
    renderProducts();
    renderCart();
    renderAdminList();
    if (statProducts) statProducts.textContent = String(products.length);
  }

  // ---------- Products UI ----------
  function renderProducts() {
    if (!productGrid) return;

    const list = filteredProducts();
    productGrid.innerHTML = "";

    if (!list.length) {
      emptyState?.removeAttribute("hidden");
      return;
    }
    emptyState?.setAttribute("hidden", "hidden");

    const frag = document.createDocumentFragment();

    list.forEach(p => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.id = p.id;

      card.innerHTML = `
        <div class="card__media">
          ${p.isNew ? `<div class="card__badge">NEW</div>` : ``}
          <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" />
        </div>
        <div class="card__body">
          <div class="card__title">${escapeHTML(p.name)}</div>
          <div class="card__desc">${escapeHTML(p.desc)}</div>
          <div class="card__row">
            <div class="price">${formatVND(p.price)}</div>
            <span class="badge">${p.isNew ? "Hot" : "Sale"}</span>
          </div>
          <div class="card__btns">
            <button class="btn btn--soft btn--mini" data-act="detail">
              <span class="icon" data-icon="info"></span>
              Chi tiết
            </button>
            <button class="btn btn--primary btn--mini" data-act="add">
              <span class="icon" data-icon="cart"></span>
              Thêm giỏ
            </button>
          </div>
        </div>
      `;

      frag.appendChild(card);
    });

    productGrid.appendChild(frag);
  }

  function openProductModal(id) {
    const p = getProductById(id);
    if (!p || !productModal) return;

    state.selectedProductId = id;

    pmTitle.textContent = p.name;
    pmTag.textContent = p.isNew ? "Sản phẩm mới" : "Sản phẩm";
    pmPrice.textContent = formatVND(p.price);
    pmDesc.textContent = p.desc;

    pmImage.innerHTML = `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" />`;

    openModal(productModal);
  }

  // ---------- Cart ----------
  function addToCart(productId, qty = 1) {
    const p = getProductById(productId);
    if (!p) return;

    const existing = cart.find(i => i.productId === productId);
    if (existing) {
      existing.qty = clamp(existing.qty + qty, 1, 999);
    } else {
      cart.push({ productId, qty: clamp(qty, 1, 999) });
    }
    saveCart();
    renderCart();
    toast("Đã thêm vào giỏ hàng");
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.productId !== productId);
    saveCart();
    renderCart();
    toast("Đã xoá khỏi giỏ");
  }

  function setQty(productId, qty) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    item.qty = clamp(qty, 1, 999);
    saveCart();
    renderCart();
  }

  function calcCart() {
    let total = 0;
    let count = 0;
    for (const item of cart) {
      const p = getProductById(item.productId);
      if (!p) continue;
      total += Number(p.price) * Number(item.qty);
      count += Number(item.qty);
    }
    return { total, count };
  }

  function renderCart() {
    const { total, count } = calcCart();
    if (cartCount) cartCount.textContent = String(count);
    if (cartTotal) cartTotal.textContent = formatVND(total);

    if (!cartList) return;

    cartList.innerHTML = "";

    if (!cart.length) {
      cartList.innerHTML = `
        <div class="empty" style="margin-top:0;">
          <div class="empty__icon"><span class="icon" data-icon="cart"></span></div>
          <div class="empty__title">Giỏ hàng trống</div>
          <div class="empty__desc">Hãy thêm vài sản phẩm để xem tổng tiền.</div>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();

    cart.forEach(item => {
      const p = getProductById(item.productId);
      if (!p) return;

      const row = document.createElement("div");
      row.className = "cart-item";
      row.dataset.id = item.productId;

      row.innerHTML = `
        <div class="cart-item__img">
          <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" />
        </div>
        <div>
          <div class="cart-item__name">${escapeHTML(p.name)}</div>
          <div class="cart-item__desc">${escapeHTML(p.desc)}</div>
          <div class="cart-item__row">
            <div class="price">${formatVND(p.price)}</div>
            <div class="qty">
              <button type="button" data-act="dec" aria-label="Giảm">−</button>
              <span>${item.qty}</span>
              <button type="button" data-act="inc" aria-label="Tăng">+</button>
            </div>
          </div>
          <div class="cart-item__row">
            <div class="cart-item__desc">Tạm tính: <b>${formatVND(Number(p.price) * Number(item.qty))}</b></div>
            <button class="btn btn--ghost btn--mini cart-item__remove" type="button" data-act="remove">
              <span class="icon" data-icon="trash"></span>
              Xoá
            </button>
          </div>
        </div>
      `;

      frag.appendChild(row);
    });

    cartList.appendChild(frag);
  }

  function openCart() {
    cartDrawer?.classList.add("is-open");
    cartDrawer?.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    cartDrawer?.classList.remove("is-open");
    cartDrawer?.setAttribute("aria-hidden", "true");
  }

  // ---------- Admin ----------
  function isAdminLogged() {
    return localStorage.getItem(K_ADMIN) === "1";
  }

  function openAdminFlow() {
    if (isAdminLogged()) {
      openModal(adminModal);
    } else {
      openModal(loginModal);
      adminPass?.focus();
    }
  }

  function adminLogoutNow() {
    localStorage.setItem(K_ADMIN, "0");
    closeModal(adminModal);
    toast("Đã đăng xuất Admin");
  }

  function renderAdminList() {
    if (!adminList) return;
    adminList.innerHTML = "";

    if (!products.length) {
      adminList.innerHTML = `
        <div class="empty" style="margin-top:0;">
          <div class="empty__icon"><span class="icon" data-icon="box"></span></div>
          <div class="empty__title">Chưa có sản phẩm</div>
          <div class="empty__desc">Hãy thêm sản phẩm ở form bên trái.</div>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();

    products
      .slice()
      .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
      .forEach(p => {
        const item = document.createElement("div");
        item.className = "admin-item";
        item.dataset.id = p.id;

        item.innerHTML = `
          <div class="admin-item__left">
            <div class="admin-item__thumb"><img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" /></div>
            <div class="admin-item__meta">
              <div class="admin-item__name">${escapeHTML(p.name)}</div>
              <div class="admin-item__sub">${formatVND(p.price)} • ${p.isNew ? "NEW" : "—"}</div>
            </div>
          </div>
          <div class="admin-item__right">
            <button class="btn btn--ghost btn--mini btn--warn" type="button" data-act="edit">
              <span class="icon" data-icon="save"></span>
              Sửa
            </button>
            <button class="btn btn--ghost btn--mini btn--danger" type="button" data-act="del">
              <span class="icon" data-icon="trash"></span>
              Xoá
            </button>
          </div>
        `;

        frag.appendChild(item);
      });

    adminList.appendChild(frag);
  }

  function startEditProduct(id) {
    const p = getProductById(id);
    if (!p) return;

    state.adminEditingId = id;
    editId.value = id;
    pName.value = p.name;
    pPrice.value = String(p.price);
    pImage.value = p.image;
    pDesc.value = p.desc;
    pNew.checked = !!p.isNew;

    formTitle.textContent = "Sửa sản phẩm";
    cancelEdit.disabled = false;

    toast("Đang sửa sản phẩm");
  }

  function stopEditProduct() {
    state.adminEditingId = null;
    editId.value = "";
    productForm.reset();
    formTitle.textContent = "Thêm sản phẩm mới";
    cancelEdit.disabled = true;
  }

  function upsertProduct(payload) {
    // validation
    const name = payload.name.trim();
    const desc = payload.desc.trim();
    const image = payload.image.trim();
    const price = Number(payload.price);

    if (!name) return toast("Tên sản phẩm không được rỗng");
    if (!desc) return toast("Mô tả không được rỗng");
    if (!image) return toast("URL ảnh không được rỗng");
    if (!Number.isFinite(price) || price < 0) return toast("Giá không hợp lệ");

    if (payload.id) {
      const idx = products.findIndex(p => p.id === payload.id);
      if (idx === -1) return;

      products[idx] = {
        ...products[idx],
        name, desc, image,
        price,
        isNew: !!payload.isNew
      };

      toast("Đã cập nhật sản phẩm");
    } else {
      products.unshift({
        id: uid(),
        name, desc, image,
        price,
        isNew: !!payload.isNew,
        createdAt: Date.now()
      });

      toast("Đã thêm sản phẩm");
    }

    saveProducts();
    renderAll();
    stopEditProduct();
  }

  function deleteProduct(id) {
    const p = getProductById(id);
    if (!p) return;

    const ok = confirm(`Xoá sản phẩm: "${p.name}" ?`);
    if (!ok) return;

    products = products.filter(x => x.id !== id);

    // Also remove from cart
    cart = cart.filter(i => i.productId !== id);

    saveProducts();
    saveCart();
    renderAll();

    toast("Đã xoá sản phẩm");
  }

  // ---------- Modals ----------
  function openModal(el) {
    if (!el) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    lockScroll(true);
  }

  function closeModal(el) {
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    // Only unlock scroll if no other modal is open
    const anyOpen = $$(".modal").some(m => m.classList.contains("is-open"));
    if (!anyOpen) lockScroll(false);
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
  }

  // ---------- Theme ----------
  function initTheme() {
    const saved = localStorage.getItem(K_THEME);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    setTheme(theme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(K_THEME, theme);

    // switch icon color semantics
    const icon = theme === "dark" ? "moon" : "moon";
    $("#themeToggle .icon")?.setAttribute("data-icon", icon);
    $("#mobileTheme .icon")?.setAttribute("data-icon", icon);
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(cur === "dark" ? "light" : "dark");
    toast("Đã đổi giao diện");
  }

  // ---------- Reveal ----------
  function initReveal() {
    const els = $$(".reveal");
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
  }

  // ---------- Cursor ----------
  function initCursor() {
    const isTouch = matchMedia("(hover:none), (pointer:coarse)").matches;
    if (isTouch) return;

    const c = $(".cursor");
    const d = $(".cursor-dot");
    if (!c || !d) return;

    let x = 0, y = 0, dx = 0, dy = 0;
    const speed = 0.18;

    const raf = () => {
      dx += (x - dx) * speed;
      dy += (y - dy) * speed;
      c.style.left = dx + "px";
      c.style.top = dy + "px";
      d.style.left = x + "px";
      d.style.top = y + "px";
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      c.classList.remove("is-hidden");
      d.classList.remove("is-hidden");
    });

    window.addEventListener("mouseleave", () => {
      c.classList.add("is-hidden");
      d.classList.add("is-hidden");
    });

    window.addEventListener("mousedown", () => c.classList.add("is-down"));
    window.addEventListener("mouseup", () => c.classList.remove("is-down"));

    const hoverables = ["a", "button", ".card", ".nav__link", ".mobile__link", "input", "select", "textarea"];
    document.addEventListener("mouseover", (ev) => {
      const t = ev.target;
      if (t && t.closest(hoverables.join(","))) c.classList.add("is-hover");
    });
    document.addEventListener("mouseout", () => c.classList.remove("is-hover"));
  }

  // ---------- Events ----------
  function bindEvents() {
    // Mobile menu toggle
    burger?.addEventListener("click", () => {
      const hidden = mobileMenu.getAttribute("aria-hidden") === "true";
      mobileMenu.setAttribute("aria-hidden", hidden ? "false" : "true");
    });

    // Close mobile menu when clicking a link
    $$(".mobile__link").forEach(a => a.addEventListener("click", () => {
      mobileMenu?.setAttribute("aria-hidden", "true");
    }));

    mobileTheme?.addEventListener("click", toggleTheme);
    mobileCart?.addEventListener("click", () => { openCart(); mobileMenu?.setAttribute("aria-hidden", "true"); });

    // Theme toggle
    themeToggle?.addEventListener("click", toggleTheme);

    // Search/sort
    searchInput?.addEventListener("input", () => {
      state.search = searchInput.value || "";
      renderProducts();
    });

    sortSelect?.addEventListener("change", () => {
      state.sort = sortSelect.value;
      renderProducts();
    });

    clearFilters?.addEventListener("click", () => {
      state.search = "";
      state.sort = "default";
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "default";
      renderProducts();
      toast("Đã xoá bộ lọc");
    });

    emptyAdmin?.addEventListener("click", openAdminFlow);

    // Product grid clicks (delegation)
    productGrid?.addEventListener("click", (ev) => {
      const card = ev.target.closest(".card");
      if (!card) return;
      const id = card.dataset.id;

      const actBtn = ev.target.closest("button[data-act]");
      if (actBtn) {
        const act = actBtn.dataset.act;
        if (act === "detail") openProductModal(id);
        if (act === "add") addToCart(id, 1);
        return;
      }

      // clicking on card opens detail
      openProductModal(id);
    });

    // Product modal close
    productClose?.addEventListener("click", () => closeModal(productModal));
    productModal?.addEventListener("click", (ev) => {
      if (ev.target === productModal) closeModal(productModal);
    });

    pmAddCart?.addEventListener("click", () => {
      if (state.selectedProductId) addToCart(state.selectedProductId, 1);
    });

    pmBuyNow?.addEventListener("click", () => {
      toast("Demo: Hãy liên hệ qua email/điện thoại để mua hàng");
    });

    // Cart drawer
    cartToggle?.addEventListener("click", openCart);
    cartClose?.addEventListener("click", closeCart);
    cartOverlay?.addEventListener("click", closeCart);

    cartList?.addEventListener("click", (ev) => {
      const item = ev.target.closest(".cart-item");
      if (!item) return;
      const pid = item.dataset.id;
      const act = ev.target.closest("button")?.dataset?.act;

      if (act === "remove") return removeFromCart(pid);
      if (act === "inc") {
        const found = cart.find(i => i.productId === pid);
        return setQty(pid, (found?.qty || 1) + 1);
      }
      if (act === "dec") {
        const found = cart.find(i => i.productId === pid);
        return setQty(pid, (found?.qty || 1) - 1);
      }
    });

    cartClear?.addEventListener("click", () => {
      if (!cart.length) return toast("Giỏ hàng đang trống");
      const ok = confirm("Xoá toàn bộ giỏ hàng?");
      if (!ok) return;
      cart = [];
      saveCart();
      renderCart();
      toast("Đã xoá giỏ hàng");
    });

    cartCheckout?.addEventListener("click", () => {
      if (!cart.length) return toast("Giỏ hàng đang trống");
      toast("Demo: Vui lòng liên hệ để chốt đơn và thanh toán");
    });

    // Donate copy
    copyBtns.forEach(btn => {
      btn.addEventListener("click", async () => {
        const val = btn.dataset.copy || "";
        try {
          await navigator.clipboard.writeText(val);
          toast("Đã copy: " + val);
        } catch {
          toast("Không copy được (trình duyệt chặn). Hãy copy thủ công.");
        }
      });
    });

    // Admin open
    adminOpen?.addEventListener("click", openAdminFlow);
    adminOpen2?.addEventListener("click", openAdminFlow);
    mobileAdmin?.addEventListener("click", () => { openAdminFlow(); mobileMenu?.setAttribute("aria-hidden", "true"); });

    // Login modal close
    loginClose?.addEventListener("click", () => closeModal(loginModal));
    loginModal?.addEventListener("click", (ev) => {
      if (ev.target === loginModal) closeModal(loginModal);
    });

    // Login submit
    loginForm?.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const pass = (adminPass.value || "").trim();
      if (pass !== "tvngoc@07") {
        toast("Sai mật khẩu");
        adminPass.focus();
        return;
      }
      localStorage.setItem(K_ADMIN, "1");
      closeModal(loginModal);
      openModal(adminModal);
      toast("Đăng nhập Admin thành công");
      adminPass.value = "";
    });

    // Admin modal close
    adminClose?.addEventListener("click", () => closeModal(adminModal));
    adminModal?.addEventListener("click", (ev) => {
      if (ev.target === adminModal) closeModal(adminModal);
    });

    // Admin logout / reset
    adminLogout?.addEventListener("click", adminLogoutNow);

    adminReset?.addEventListener("click", () => {
      const ok = confirm("Reset toàn bộ dữ liệu (sản phẩm + giỏ + theme + admin)?");
      if (!ok) return;

      localStorage.removeItem(K_PRODUCTS);
      localStorage.removeItem(K_CART);
      localStorage.removeItem(K_THEME);
      localStorage.removeItem(K_ADMIN);

      products = loadProducts();
      cart = loadCart();
      initTheme();

      renderAll();
      stopEditProduct();
      toast("Đã reset dữ liệu");
    });

    // Admin list actions
    adminList?.addEventListener("click", (ev) => {
      const row = ev.target.closest(".admin-item");
      if (!row) return;
      const id = row.dataset.id;
      const act = ev.target.closest("button[data-act]")?.dataset?.act;

      if (act === "edit") return startEditProduct(id);
      if (act === "del") return deleteProduct(id);
    });

    // Admin form submit
    productForm?.addEventListener("submit", (ev) => {
      ev.preventDefault();

      upsertProduct({
        id: (editId.value || "").trim() || null,
        name: pName.value || "",
        price: pPrice.value,
        image: pImage.value || "",
        desc: pDesc.value || "",
        isNew: pNew.checked
      });
    });

    cancelEdit?.addEventListener("click", () => stopEditProduct());

    // Quick demo add
    quickAddDemo?.addEventListener("click", () => {
      const demo = {
        id: uid(),
        name: "Sản phẩm demo (Quick Add)",
        price: 159000,
        desc: "Thêm nhanh để test render, cart, admin, sort.",
        image: "https://picsum.photos/seed/quickadd/900/600",
        isNew: true,
        createdAt: Date.now()
      };
      products.unshift(demo);
      saveProducts();
      renderAll();
      toast("Đã thêm 1 sản phẩm demo");
      location.hash = "#products";
    });

    // Empty -> Admin
    $("#emptyAdmin")?.addEventListener("click", openAdminFlow);

    // Admin from empty state
    $("#emptyAdmin")?.addEventListener("click", openAdminFlow);

    // Admin open from empty state button
    $("#emptyAdmin")?.addEventListener("click", openAdminFlow);

    // Keyboard shortcuts: ESC closes modals/drawer
    window.addEventListener("keydown", (ev) => {
      if (ev.key !== "Escape") return;

      // Close top-most modal
      const openModalEl = $$(".modal").find(m => m.classList.contains("is-open"));
      if (openModalEl) return closeModal(openModalEl);

      // Else close cart
      if (cartDrawer?.classList.contains("is-open")) closeCart();
    });
  }

  // ---------- Helpers ----------
  function escapeHTML(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(s) {
    // For attribute values (src, alt)
    return escapeHTML(s).replaceAll("`", "");
  }

})();
