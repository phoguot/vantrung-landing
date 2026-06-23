/* =========================================
   POWERMAX Generators – main.js
   =========================================

   EMAIL SETUP (EmailJS):
   ──────────────────────
   1. Go to https://www.emailjs.com/ → create a free account
   2. Email Services → Add New Service → choose Gmail → connect your Gmail
   3. Email Templates → Create New Template
      Suggested template body:
        Họ tên:   {{from_name}}
        SĐT:      {{phone}}
        Email:    {{from_email}}
        Sản phẩm: {{product}}
        Nội dung: {{message}}
   4. Account → General → copy your Public Key
   5. Replace the three constants below with your real values.

   If you leave them as-is the form will still open the user's mail
   client as a fallback (mailto:) so nothing breaks.
   ========================================= */

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc1234'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz5678'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'abcDEFghiJKLmnop'
const TO_EMAIL            = 'eros.yun711@gmail.com';

// Init EmailJS when keys are configured
if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/* =========================================
   SLIDER
   ========================================= */
let current = 0;
let timer;
const slides = document.querySelectorAll('.slide');
const dots   = document.querySelectorAll('.dot');

function goToSlide(n) {
  slides[current].classList.remove('active');
  dots[current]?.classList.remove('active');
  current = ((n % slides.length) + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current]?.classList.add('active');
}

function nextSlide() { goToSlide(current + 1); }
function prevSlide() { goToSlide(current - 1); }

function startAuto() { timer = setInterval(nextSlide, 5500); }
function stopAuto()  { clearInterval(timer); }

startAuto();

// Pause on hover
document.getElementById('hero').addEventListener('mouseenter', stopAuto);
document.getElementById('hero').addEventListener('mouseleave', startAuto);

// Touch swipe
let touchStartX = 0;
document.getElementById('hero').addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.getElementById('hero').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide(); }
});

/* =========================================
   STICKY HEADER + BACK TO TOP
   ========================================= */
const header  = document.getElementById('header');
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  backTop.classList.toggle('show', y > 320);
}, { passive: true });

/* =========================================
   HAMBURGER MENU
   ========================================= */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* =========================================
   ACTIVE NAV LINK ON SCROLL
   ========================================= */
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const sections   = [...document.querySelectorAll('section[id]')];

window.addEventListener('scroll', () => {
  let active = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) active = s.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${active}`);
  });
}, { passive: true });

/* =========================================
   SCROLL FADE-UP ANIMATION
   ========================================= */
const fadeEls = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), i * 90);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => io.observe(el));

/* =========================================
   MODAL
   ========================================= */
const modal    = document.getElementById('modal');
const formWrap = document.getElementById('modal-form-wrap');
const success  = document.getElementById('modal-success');

function openModal() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(resetForm, 320);
}

function overlayClick(e) {
  if (e.target === modal) closeModal();
}

function resetForm() {
  document.getElementById('contact-form').reset();
  formWrap.style.display = '';
  success.classList.remove('show');
  success.style.display = 'none';
  const btn = document.getElementById('submit-btn');
  btn.disabled = false;
  btn.classList.remove('loading');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

/* =========================================
   FORM SUBMISSION
   ========================================= */
function handleSubmit(e) {
  e.preventDefault();

  const form   = e.target;
  const btn    = document.getElementById('submit-btn');
  const data   = new FormData(form);

  const params = {
    from_name:  data.get('from_name')  || '',
    phone:      data.get('phone')      || '',
    from_email: data.get('from_email') || 'Không cung cấp',
    product:    data.get('product')    || 'Chưa chọn',
    message:    data.get('message')    || 'Không có nội dung',
    to_email:   TO_EMAIL,
  };

  btn.disabled = true;
  btn.classList.add('loading');

  const useEmailJS =
    typeof emailjs !== 'undefined' &&
    EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
    EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

  if (useEmailJS) {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
      .then(() => showSuccess())
      .catch(err => {
        console.warn('EmailJS error, falling back to mailto:', err);
        openMailto(params);
        showSuccess();
      });
  } else {
    // Fallback: open native mail client
    openMailto(params);
    showSuccess();
  }
}

function openMailto(p) {
  const subject = encodeURIComponent(`[POWERMAX] Yêu cầu tư vấn từ ${p.from_name}`);
  const body    = encodeURIComponent(
    `Họ và tên: ${p.from_name}\n` +
    `Số điện thoại: ${p.phone}\n` +
    `Email: ${p.from_email}\n` +
    `Sản phẩm quan tâm: ${p.product}\n\n` +
    `Nội dung:\n${p.message}`
  );
  window.open(`mailto:${TO_EMAIL}?subject=${subject}&body=${body}`);
}

function showSuccess() {
  formWrap.style.display  = 'none';
  success.style.display   = 'block';
  success.classList.add('show');
}
