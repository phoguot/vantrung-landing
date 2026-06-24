/* =========================================
   AGIAY – main.js

   EMAIL SETUP (Google Apps Script):
   1. Vào https://script.google.com → New project
   2. Paste nội dung Code.gs vào editor
   3. Deploy → New deployment → Web app
      - Execute as: Me
      - Who has access: Anyone
   4. Copy URL web app → paste vào APPS_SCRIPT_URL bên dưới
   ========================================= */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPS2xtBxzX1UQ39bZfxUFdzOoC33Usf9T4s7JDugDesMk5ZEtPmC3LICL8KOANc2D6pg/exec';   // ← thay bằng URL sau khi deploy
const TO_EMAIL        = 'trungthanhnguyen382000@gmail.com';  // dùng cho fallback mailto
const UNIT_PRICE      = 699000;

/* =========================================
   HEADER – sticky
   ========================================= */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* =========================================
   BURGER MENU
   ========================================= */
const burger = document.getElementById('burger');
const navEl  = document.querySelector('nav');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navEl.classList.toggle('open');
});
document.querySelectorAll('.nav-list a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navEl.classList.remove('open');
  });
});

/* =========================================
   SCROLL ANIMATION
   ========================================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 100);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

/* =========================================
   SIZE / COLOR SELECTOR
   ========================================= */
let selectedSize  = '41';
let selectedColor = 'Đen';

document.getElementById('sizeOptions').addEventListener('click', (e) => {
  const btn = e.target.closest('.opt-btn');
  if (!btn || btn.classList.contains('out-of-stock')) return;
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSize = btn.dataset.size;
});

document.getElementById('colorOptions').addEventListener('click', (e) => {
  const btn = e.target.closest('.color-btn');
  if (!btn) return;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedColor = btn.dataset.color;
});

/* =========================================
   ORDER MODAL
   ========================================= */
const modal   = document.getElementById('modal');
const formWrap = document.getElementById('form-wrap');
const formSucc = document.getElementById('form-success');

function openOrderModal() {
  document.getElementById('f-size').value  = selectedSize  || 'Chưa chọn';
  document.getElementById('f-color').value = selectedColor || 'Chưa chọn';
  updateTotal(parseInt(document.getElementById('f-qty').value) || 1);
  openModal();
}

function openModal() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(resetModal, 320);
}

function overlayClick(e) {
  if (e.target === modal) closeModal();
}

function resetModal() {
  document.getElementById('order-form').reset();
  document.getElementById('f-qty').value = 1;
  updateTotal(1);
  formWrap.style.display = '';
  formSucc.hidden        = true;
  const btn = document.getElementById('submit-btn');
  btn.disabled = false;
  btn.classList.remove('loading');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

function changeQty(delta) {
  const input = document.getElementById('f-qty');
  const val   = parseInt(input.value) + delta;
  if (val < 1 || val > 10) return;
  input.value = val;
  updateTotal(val);
}

function updateTotal(qty) {
  const el = document.getElementById('total-price');
  if (el) el.textContent = (UNIT_PRICE * qty).toLocaleString('vi-VN') + 'đ';
}

/* =========================================
   FORM SUBMIT – Google Apps Script
   ========================================= */
function handleSubmit(e) {
  e.preventDefault();
  const btn  = document.getElementById('submit-btn');
  const data = new FormData(e.target);
  const qty  = parseInt(data.get('quantity')) || 1;

  const params = {
    from_name: data.get('from_name') || '',
    phone:     data.get('phone')     || '',
    size:      data.get('size')      || selectedSize  || 'Chưa chọn',
    color:     data.get('color')     || selectedColor || 'Chưa chọn',
    quantity:  qty,
    address:   data.get('address')   || 'Chưa cung cấp',
    message:   data.get('message')   || '',
    total:     (UNIT_PRICE * qty).toLocaleString('vi-VN') + 'đ',
  };

  btn.disabled = true;
  btn.classList.add('loading');

  if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'https://script.google.com/macros/s/AKfycbwPS2xtBxzX1UQ39bZfxUFdzOoC33Usf9T4s7JDugDesMk5ZEtPmC3LICL8KOANc2D6pg/exec') {
    // Gửi qua Google Apps Script (no-cors vì Apps Script không trả CORS header)
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode:   'no-cors',          // Apps Script không hỗ trợ CORS → dùng no-cors
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(() => showSuccess())   // no-cors luôn resolve (opaque response), coi như thành công
      .catch(() => {
        // Nếu fetch thất bại hoàn toàn → fallback mailto
        openMailto(params);
        showSuccess();
      });
  } else {
    // Chưa cấu hình URL → fallback mailto
    openMailto(params);
    showSuccess();
  }
}

/* =========================================
   FALLBACK – mở mailto khi chưa cấu hình
   ========================================= */
function openMailto(p) {
  const subject = encodeURIComponent(`[AGIAY] Đơn hàng BN0003 – ${p.from_name}`);
  const body    = encodeURIComponent(
    `Sản phẩm: Giày Lưới Da Nam BN0003\n` +
    `Họ tên:   ${p.from_name}\n` +
    `SĐT:      ${p.phone}\n` +
    `Size:     ${p.size}\n` +
    `Màu:      ${p.color}\n` +
    `Số lượng: ${p.quantity}\n` +
    `Tổng:     ${p.total}\n` +
    `Địa chỉ:  ${p.address}\n\n` +
    `Ghi chú:  ${p.message}`
  );
  window.open(`mailto:${TO_EMAIL}?subject=${subject}&body=${body}`);
}

function showSuccess() {
  formWrap.style.display = 'none';
  formSucc.hidden        = false;
}

/* =========================================
   PRODUCT IMAGE SLIDER
   ========================================= */
var psIdx = 0;

function slideTo(n) {
  const slides = document.querySelectorAll('.ps-slide');
  const thumbs = document.querySelectorAll('.ps-thumb');
  const dots   = document.querySelectorAll('.ps-dot');
  const total  = slides.length;
  psIdx = ((n % total) + total) % total;
  slides.forEach((s, i) => s.classList.toggle('active', i === psIdx));
  thumbs.forEach((t, i) => t.classList.toggle('active', i === psIdx));
  dots.forEach((d, i)   => d.classList.toggle('active', i === psIdx));
}

// Touch / swipe support
(function () {
  const track = document.getElementById('psTrack');
  if (!track) return;
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) slideTo(psIdx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();