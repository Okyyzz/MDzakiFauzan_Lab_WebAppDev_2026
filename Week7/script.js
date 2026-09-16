const products = [
  {id:'K', name:'Keyboard Mekanik', category:'Aksesoris', price:450000, stock:12},
  {id:'M', name:'Mouse Wireless',   category:'Aksesoris', price:185000, stock:30},
  {id:'H', name:'Headset Gaming',   category:'Audio',     price:320000, stock:8},
  {id:'E', name:'Earbuds TWS',      category:'Audio',     price:275000, stock:0},
  {id:'F', name:'Flashdisk 64GB',   category:'Penyimpanan', price:95000, stock:45},
  {id:'S', name:'SSD Eksternal 1TB',category:'Penyimpanan', price:1150000, stock:5},
  {id:'D', name:'Monitor 24 inci',  category:'Display', price:1750000, stock:9},
  {id:'W', name:'Webcam Full HD',   category:'Display', price:410000, stock:14},
  {id:'P', name:'Mousepad XL',      category:'Aksesoris', price:85000, stock:22},
];

const FREE_SHIP_THRESHOLD = 300000;
const VOUCHERS = { 'DISKON10': 0.10, 'HEMAT20': 0.20 };

let cart = {};      // id -> qty
let discountRate = 0;
let voucherApplied = null;

function rupiah(n){
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

function toggleGuide(){
  const el = document.getElementById('brief');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function populateCategories(){
  const sel = document.getElementById('category');
  const cats = ['Semua Kategori', ...new Set(products.map(p=>p.category))];
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function getFiltered(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  const cat = document.getElementById('category').value;
  const sort = document.getElementById('sort').value;

  let list = products.filter(p=>{
    const matchQ = p.name.toLowerCase().includes(q);
    const matchCat = (cat === 'Semua Kategori' || !cat) || p.category === cat;
    return matchQ && matchCat;
  });

  if(sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  if(sort === 'name-asc') list.sort((a,b)=>a.name.localeCompare(b.name));

  return list;
}

function renderGrid(){
  const list = getFiltered();
  const grid = document.getElementById('grid');
  document.getElementById('resultCount').textContent =
    `${list.length} produk ditampilkan dari total ${products.length}`;

  grid.innerHTML = list.map(p => {
    const outOfStock = p.stock <= 0;
    return `
      <div class="card">
        <div class="initial">${p.id}</div>
        <div class="badge">${p.category}</div>
        <div class="name">${p.name}</div>
        <div class="price">${rupiah(p.price)}</div>
        <div class="stock ${outOfStock ? 'out':''}">${outOfStock ? 'Stok habis' : 'Stok tersedia: '+p.stock}</div>
        <button class="add-btn" ${outOfStock ? 'disabled':''} onclick="addToCart('${p.id}')">
          ${outOfStock ? 'Habis' : 'Tambah'}
        </button>
      </div>`;
  }).join('');
}

function addToCart(id){
  const p = products.find(x=>x.id===id);
  if(!p || p.stock <= 0) return;
  const current = cart[id] || 0;
  if(current >= p.stock) return;
  cart[id] = current + 1;
  document.getElementById('successMsg').textContent = '';
  renderCart();
}

function changeQty(id, delta){
  const p = products.find(x=>x.id===id);
  const next = (cart[id]||0) + delta;
  if(next <= 0){ delete cart[id]; }
  else if(next <= p.stock){ cart[id] = next; }
  renderCart();
}

function removeItem(id){
  delete cart[id];
  renderCart();
}

function applyVoucher(){
  const code = document.getElementById('voucherInput').value.trim().toUpperCase();
  const msg = document.getElementById('voucherMsg');
  if(!code){
    msg.textContent = 'Masukkan kode voucher.';
    msg.className = 'voucher-msg err';
    return;
  }
  if(VOUCHERS[code]){
    discountRate = VOUCHERS[code];
    voucherApplied = code;
    msg.textContent = `Voucher ${code} berhasil dipakai (-${discountRate*100}%).`;
    msg.className = 'voucher-msg ok';
  } else {
    discountRate = 0;
    voucherApplied = null;
    msg.textContent = 'Kode voucher tidak valid.';
    msg.className = 'voucher-msg err';
  }
  renderCart();
}

function renderCart(){
  const itemsEl = document.getElementById('cartItems');
  const ids = Object.keys(cart);

  if(ids.length === 0){
    itemsEl.innerHTML = '<div class="cart-empty">Keranjang masih kosong.</div>';
  } else {
    itemsEl.innerHTML = ids.map(id=>{
      const p = products.find(x=>x.id===id);
      const qty = cart[id];
      return `
        <div class="cart-item">
          <div class="ci-info">
            <div class="ci-name">${p.name}</div>
            <div class="ci-price">${rupiah(p.price)} x ${qty}</div>
            <button class="ci-remove" onclick="removeItem('${id}')">Hapus</button>
          </div>
          <div class="ci-qty">
            <button class="qty-btn" onclick="changeQty('${id}',-1)">-</button>
            <span>${qty}</span>
            <button class="qty-btn" onclick="changeQty('${id}',1)">+</button>
          </div>
        </div>`;
    }).join('');
  }

  const subtotal = ids.reduce((sum,id)=> sum + products.find(x=>x.id===id).price * cart[id], 0);
  const discount = subtotal * discountRate;
  const shippingFree = (subtotal - discount) >= FREE_SHIP_THRESHOLD || subtotal === 0;
  const shippingCost = shippingFree ? 0 : 20000;
  const total = subtotal - discount + shippingCost;

  document.getElementById('subtotal').textContent = rupiah(subtotal);
  document.getElementById('discount').textContent = '-' + rupiah(discount);
  document.getElementById('shipping').textContent = shippingFree ? 'Gratis' : rupiah(shippingCost);
  document.getElementById('total').textContent = rupiah(total);

  const remaining = FREE_SHIP_THRESHOLD - (subtotal - discount);
  const shipNote = document.getElementById('shipNote');
  const shipFill = document.getElementById('shipFill');
  if(subtotal === 0){
    shipNote.textContent = `Belanja ${rupiah(FREE_SHIP_THRESHOLD)} lagi untuk gratis ongkir.`;
    shipFill.style.width = '0%';
  } else if(remaining > 0){
    shipNote.textContent = `Belanja ${rupiah(remaining)} lagi untuk gratis ongkir.`;
    shipFill.style.width = Math.min(100, ((subtotal-discount)/FREE_SHIP_THRESHOLD)*100) + '%';
  } else {
    shipNote.textContent = 'Selamat, kamu dapat gratis ongkir!';
    shipFill.style.width = '100%';
  }

  document.getElementById('checkoutBtn').disabled = ids.length === 0;
  window.__lastTotal = total;
  window.__lastCount = ids.reduce((s,id)=>s+cart[id],0);
}

function checkout(){
  const count = window.__lastCount || 0;
  const total = window.__lastTotal || 0;
  document.getElementById('successMsg').textContent =
    `Pesanan ${count} barang senilai ${rupiah(total)} berhasil dibuat.`;
  cart = {};
  discountRate = 0;
  voucherApplied = null;
  document.getElementById('voucherInput').value = '';
  document.getElementById('voucherMsg').textContent = '';
  renderCart();
}

document.getElementById('search').addEventListener('input', renderGrid);
document.getElementById('category').addEventListener('change', renderGrid);
document.getElementById('sort').addEventListener('change', renderGrid);

populateCategories();
renderGrid();
renderCart();