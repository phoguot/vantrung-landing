/* =========================================
   AGIAY – main.js

   EMAIL SETUP (EmailJS):
   1. Tạo tài khoản tại https://www.emailjs.com/
   2. Add Email Service → Gmail
   3. Tạo Email Template với các biến:
      {{from_name}}, {{phone}}, {{size}}, {{color}},
      {{quantity}}, {{address}}, {{message}}, {{total}}
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
   SIZE SELECTOR
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
const UNIT_PRICE = 699000;
const modal      = document.getElementById('modal');
const formWrap   = document.getElementById('form-wrap');
const formSucc   = document.getElementById('form-success');

function openOrderModal() {
  // Pre-fill size / color from page selection
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
   FORM SUBMIT
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
    address:   data.get('address')  || 'Chưa cung cấp',
    message:   data.get('message')  || '',
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
      .catch(err => { console.warn('EmailJS fallback:', err); openMailto(params); showSuccess(); });
  } else {
    openMailto(params);
    showSuccess();
  }
}

function openMailto(p) {
  const subject = encodeURIComponent(`[AGIAY] Đơn hàng BN0003 – ${p.from_name}`);
  const body    = encodeURIComponent(
    `Sản phẩm: ${p.product}\n` +
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
   IMAGE MANAGER
   ========================================= */
const IMG_KEYS = {
  hero:  'agiay_img_hero',
  feat1: 'agiay_img_feat1',
  feat2: 'agiay_img_feat2',
  feat3: 'agiay_img_feat3',
  feat4: 'agiay_img_feat4',
};

// Config per slot: { targetId, maxWidth, ratio }
const SLOT_CONFIG = {
  hero:  { targetId: 'hero-img-wrap', maxWidth: 1200, isHero: true },
  feat1: { targetId: 'feat-img-1',    maxWidth: 700,  isHero: false },
  feat2: { targetId: 'feat-img-2',    maxWidth: 700,  isHero: false },
  feat3: { targetId: 'feat-img-3',    maxWidth: 700,  isHero: false },
  feat4: { targetId: 'feat-img-4',    maxWidth: 700,  isHero: false },
};

/* --- Panel open/close --- */
let imgMgrOpen = false;

function toggleImgMgr() {
  imgMgrOpen = !imgMgrOpen;
  document.getElementById('imgMgr').classList.toggle('open', imgMgrOpen);
  document.getElementById('imgMgrBackdrop').classList.toggle('open', imgMgrOpen);
  document.body.style.overflow = imgMgrOpen ? 'hidden' : '';
}

/* --- Load saved images on page load --- */
function loadSavedImages() {
  Object.keys(IMG_KEYS).forEach(key => {
    const dataUrl = localStorage.getItem(IMG_KEYS[key]);
    if (dataUrl) {
      applyToPage(key, dataUrl);
      setSlotPreview(key, dataUrl);
    }
  });
}

/* --- Apply image to the visible page --- */
function applyToPage(key, dataUrl) {
  const cfg = SLOT_CONFIG[key];
  if (!cfg) return;

  if (cfg.isHero) {
    // Hero: replace SVG with <img>
    const wrap = document.getElementById(cfg.targetId);
    // Preserve the SVG for reset purposes but hide it
    const svg = wrap.querySelector('svg');
    if (svg) svg.style.display = 'none';

    let img = wrap.querySelector('img.uploaded-product-img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'uploaded-product-img';
      img.alt = 'Giày BN0003';
      wrap.appendChild(img);
    }
    img.src = dataUrl;
    img.style.display = 'block';
  } else {
    // Feature card: set background image
    const el = document.getElementById(cfg.targetId);
    if (!el) return;
    el.style.backgroundImage = `url(${dataUrl})`;
    el.classList.add('has-image');
  }
}

/* --- Reset image from page (back to SVG / gradient) --- */
function resetFromPage(key) {
  const cfg = SLOT_CONFIG[key];
  if (!cfg) return;

  if (cfg.isHero) {
    const wrap = document.getElementById(cfg.targetId);
    const svg  = wrap.querySelector('svg');
    const img  = wrap.querySelector('img.uploaded-product-img');
    if (svg) svg.style.display = '';
    if (img) img.remove();
  } else {
    const el = document.getElementById(cfg.targetId);
    if (!el) return;
    el.style.backgroundImage = '';
    el.classList.remove('has-image');
  }
}

/* --- Update panel slot preview --- */
function setSlotPreview(key, dataUrl) {
  const preview  = document.getElementById(`pv-${key}`);
  const ph       = document.getElementById(`ph-${key}`);
  const delBtn   = document.getElementById(`del-${key}`);
  if (!preview) return;

  if (dataUrl) {
    preview.src = dataUrl;
    preview.classList.add('visible');
    if (ph)  ph.style.display    = 'none';
    if (delBtn) delBtn.classList.add('visible');
  } else {
    preview.src = '';
    preview.classList.remove('visible');
    if (ph)  ph.style.display    = '';
    if (delBtn) delBtn.classList.remove('visible');
  }
}

/* --- File selected via <input> --- */
function onFileSelect(event, key) {
  const file = event.target.files[0];
  if (file) processFile(file, key);
  event.target.value = ''; // reset so same file can be re-selected
}

/* --- Drag-and-drop handlers --- */
function onDragOver(event, dzId) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  document.getElementById(dzId)?.classList.add('drag-over');
}

function onDragLeave(dzId) {
  document.getElementById(dzId)?.classList.remove('drag-over');
}

function onDrop(event, key) {
  event.preventDefault();
  const dzId = `dz-${key}`;
  document.getElementById(dzId)?.classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if (file) processFile(file, key);
}

/* --- Process & compress the image file --- */
function processFile(file, key) {
  if (!file.type.startsWith('image/')) {
    showToast('Vui lòng chọn file ảnh (JPG, PNG, WebP...)', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File ảnh không được vượt quá 5MB', 'error');
    return;
  }

  const maxWidth = SLOT_CONFIG[key]?.maxWidth || 800;

  compressImage(file, maxWidth, 0.82).then(dataUrl => {
    try {
      localStorage.setItem(IMG_KEYS[key], dataUrl);
    } catch (e) {
      showToast('Bộ nhớ trình duyệt đầy. Hãy xóa bớt ảnh cũ.', 'error');
      return;
    }
    applyToPage(key, dataUrl);
    setSlotPreview(key, dataUrl);
    showToast('Tải ảnh lên thành công!', 'success');
  });
}

/* --- Compress image with Canvas --- */
function compressImage(file, maxWidth, quality) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }

        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        // Use JPEG for photos, PNG for images with transparency
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* --- Delete one image --- */
function deleteImg(key) {
  localStorage.removeItem(IMG_KEYS[key]);
  resetFromPage(key);
  setSlotPreview(key, null);
  showToast('Đã xóa ảnh', 'success');
}

/* --- Reset all images --- */
function resetAllImages() {
  if (!confirm('Xóa tất cả ảnh đã tải lên?')) return;
  Object.keys(IMG_KEYS).forEach(key => {
    localStorage.removeItem(IMG_KEYS[key]);
    resetFromPage(key);
    setSlotPreview(key, null);
  });
  showToast('Đã xóa tất cả ảnh', 'success');
}

/* --- Toast notification --- */
let toastTimer;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

/* =========================================
   INIT
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  loadSavedImages();
});
