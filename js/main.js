/* =========================================
   AGIAY – main.js

   EMAIL SETUP (EmailJS):
   1. Tạo tài khoản tại https://www.emailjs.com/
   2. Add Email Service → Gmail
   3. Tạo Email Template với các biến:
      {{from_name}}, {{phone}}, {{size}}, {{quantity}},
      {{address}}, {{message}}, {{total}}
   4. Lấy Public Key từ Account → General
   5. Thay 3 hằng số bên dưới.
   ========================================= */

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const TO_EMAIL            = 'eros.yun711@gmail.com';

if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/* =========================================
   STICKY HEADER
   ========================================= */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* =========================================
   MOBILE BURGER MENU
   ========================================= */
const burger  = document.getElementById('burger');
const navEl   = document.querySelector('nav');

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
   SCROLL FADE-UP ANIMATION
   ========================================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), i * 100);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

/* =========================================
   QUANTITY CONTROL
   ========================================= */
const UNIT_PRICE = 699000;

function changeQty(delta) {
  const input = document.getElementById('f-qty');
  const val   = parseInt(input.value) + delta;
  if (val < 1 || val > 10) return;
  input.value = val;
  updateTotal(val);
}

function updateTotal(qty) {
  const total = UNIT_PRICE * qty;
  const el    = document.getElementById('total-price');
  if (el) el.textContent = total.toLocaleString('vi-VN') + 'đ';
}

/* =========================================
   MODAL
   ========================================= */
const modal   = document.getElementById('modal');
const formWrap = document.getElementById('form-wrap');
const success  = document.getElementById('form-success');

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
  formWrap.style.display   = '';
  success.hidden           = true;
  const btn = document.getElementById('submit-btn');
  btn.disabled = false;
  btn.classList.remove('loading');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

/* =========================================
   FORM SUBMIT
   ========================================= */
function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn  = document.getElementById('submit-btn');
  const data = new FormData(form);
  const qty  = parseInt(data.get('quantity')) || 1;

  const params = {
    from_name: data.get('from_name') || '',
    phone:     data.get('phone')     || '',
    size:      data.get('size')      || 'Chưa chọn',
    quantity:  qty,
    address:   data.get('address')   || 'Chưa cung cấp',
    message:   data.get('message')   || '',
    total:     (UNIT_PRICE * qty).toLocaleString('vi-VN') + 'đ',
    product:   'Giày Lưới Da Nam BN0003',
    to_email:  TO_EMAIL,
  };

  btn.disabled = true;
  btn.classList.add('loading');

  const useEmailJS =
    typeof emailjs !== 'undefined' &&
    EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
    EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

  if (useEmailJS) {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
      .then(showSuccess)
      .catch(err => {
        console.warn('EmailJS fallback:', err);
        openMailto(params);
        showSuccess();
      });
  } else {
    openMailto(params);
    showSuccess();
  }
}

function openMailto(p) {
  const subject = encodeURIComponent(`[AGIAY] Đơn hàng BN0003 – ${p.from_name}`);
  const body = encodeURIComponent(
    `Sản phẩm: ${p.product}\n` +
    `Họ tên: ${p.from_name}\n` +
    `SĐT: ${p.phone}\n` +
    `Size: ${p.size}\n` +
    `Số lượng: ${p.quantity}\n` +
    `Tổng tiền: ${p.total}\n` +
    `Địa chỉ: ${p.address}\n\n` +
    `Ghi chú: ${p.message}`
  );
  window.open(`mailto:${TO_EMAIL}?subject=${subject}&body=${body}`);
}

function showSuccess() {
  formWrap.style.display = 'none';
  success.hidden         = false;
}
