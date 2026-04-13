// =========================================
// PRIME CUT BARBERSHOP — PURE FRONTEND APP
// No backend required. Bookings are handled
// client-side. WhatsApp click-to-chat fires
// on confirmation to notify the business.
// =========================================

const OWNER_WHATSAPP = '2348071607769';

// ── Page Loader ──────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 900);
});

// ── Consolidated Scroll Handler ──────────────────────────────────────────────
// Combines navbar, back-to-top, active nav, and parallax into ONE listener
// to avoid registering multiple scroll handlers (performance bug fix).
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 50);

    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) backToTop.classList.toggle('show', scrollY > 300);

    // Active nav link
    let current = '';
    document.querySelectorAll('section[id]').forEach(section => {
        const top = section.offsetTop - 100;
        if (scrollY >= top && scrollY < top + section.offsetHeight) {
            current = section.getAttribute('id');
        }
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    // Parallax on hero slides
    const yPos = -(scrollY * 0.5);
    document.querySelectorAll('.slide').forEach(slide => {
        slide.style.transform = `translateY(${yPos}px)`;
    });
}, { passive: true });

// ── Smooth Anchor Scroll ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                closeMobile();
            }
        });
    });
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Mobile Menu ──────────────────────────────────────────────────────────────
function toggleMobile() {
    document.getElementById('mobileMenu')?.classList.toggle('open');
}

function closeMobile() {
    document.getElementById('mobileMenu')?.classList.remove('open');
}

// ── Hero Carousel ────────────────────────────────────────────────────────────
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('carouselDots');
let currentSlide = 0;

function createDots() {
    if (!dotsContainer || !slides.length) return;
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    slides[index]?.classList.add('active');
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
    currentSlide = index;
}

function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
}

if (slides.length) {
    createDots();
    setInterval(nextSlide, 5000);
}

// ── Booking Date Min (no past dates) ────────────────────────────────────────
const bDate = document.getElementById('bDate');
if (bDate) {
    bDate.min = new Date().toISOString().split('T')[0];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateBookingRef() {
    // Short unique ref: PCxxxxxx
    return 'PC' + Date.now().toString().slice(-6);
}

function formatDateNice(dateStr) {
    if (!dateStr) return dateStr;
    // Append T00:00:00 to avoid UTC offset shifting the date
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-NG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

function normalisePhone(phone) {
    // Strip spaces, dashes, parentheses
    return phone.replace(/[\s\-().]/g, '');
}

function isValidNigerianPhone(phone) {
    // Accepts: 08011234567 | +2348011234567 | 2348011234567
    return /^(\+?234|0)[789][01]\d{8}$/.test(phone);
}

// ── WhatsApp Notification ────────────────────────────────────────────────────
/**
 * Opens WhatsApp on the user's device with the booking pre-filled.
 * The user taps SEND — the business owner receives the notification instantly.
 * This is the client-side fallback described in your spec.
 */
function triggerWhatsAppNotification(booking) {
    const message =
        `🏆 *NEW BOOKING — Prime Cut Barbershop*\n\n` +
        `👤 *Name:* ${booking.name}\n` +
        `📞 *Client Phone:* ${booking.phone}\n` +
        `✂️ *Service:* ${booking.service}\n` +
        `📅 *Date:* ${formatDateNice(booking.date)}\n` +
        `⏰ *Time:* ${booking.time}\n` +
        `🆔 *Ref:* #${booking.ref}\n\n` +
        `_Tap Send to confirm this appointment._`;

    const url = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;

    // Try opening in a new tab/window
    const win = window.open(url, '_blank', 'noopener,noreferrer');

    // If popup was blocked (some mobile browsers block window.open),
    // make the fallback button visible and link directly
    if (!win || win.closed || typeof win.closed === 'undefined') {
        const fallbackBtn = document.getElementById('whatsappFallbackBtn');
        if (fallbackBtn) {
            fallbackBtn.href = url;
            fallbackBtn.style.display = 'inline-flex';
        }
        showToast('📲 Tap the WhatsApp button to notify us!');
    }
}

// ── Booking Submission ────────────────────────────────────────────────────────
function submitBooking() {
    const name    = document.getElementById('bName')?.value.trim();
    const phone   = normalisePhone(document.getElementById('bPhone')?.value || '');
    const service = document.getElementById('bService')?.value;
    const date    = document.getElementById('bDate')?.value;
    const time    = document.getElementById('bTime')?.value;

    // ── Validation ──
    if (!name) {
        showToast('⚠️ Please enter your full name.', true);
        document.getElementById('bName')?.focus();
        return;
    }
    if (!phone) {
        showToast('⚠️ Please enter your phone number.', true);
        document.getElementById('bPhone')?.focus();
        return;
    }
    if (!isValidNigerianPhone(phone)) {
        showToast('⚠️ Enter a valid Nigerian phone number (e.g. 08011234567).', true);
        document.getElementById('bPhone')?.focus();
        return;
    }
    if (!date) {
        showToast('⚠️ Please select your preferred date.', true);
        document.getElementById('bDate')?.focus();
        return;
    }
    if (!time) {
        showToast('⚠️ Please select a time slot.', true);
        return;
    }

    // ── Disable button while processing ──
    const btn = document.querySelector('#bookForm .btn-book');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
    }

    // ── Build booking record ──
    const booking = {
        ref:       generateBookingRef(),
        name,
        phone,
        service,
        date,
        time,
        createdAt: new Date().toISOString()
    };

    // ── Persist to localStorage ──
    try {
        const existing = JSON.parse(localStorage.getItem('primecut_bookings') || '[]');
        existing.push(booking);
        localStorage.setItem('primecut_bookings', JSON.stringify(existing));
    } catch (e) {
        // localStorage may be blocked in private/incognito — silently continue
        console.warn('localStorage unavailable:', e);
    }

    // ── Render the success panel with full booking details ──
    const successEl = document.getElementById('formSuccess');
    if (successEl) {
        successEl.innerHTML = `
            <i class="fas fa-check-circle" style="font-size:58px; color:var(--green); display:block; margin-bottom:14px;"></i>
            <h4 style="font-family:'Playfair Display',serif; font-size:22px; margin-bottom:6px;">Booking Confirmed! ✂️</h4>
            <p style="color:var(--gray); font-size:13px; margin-bottom:16px;">Here's a summary of your appointment:</p>

            <div style="background:var(--dark4); border:1px solid rgba(201,168,76,0.15); border-radius:14px; padding:18px; margin:0 0 18px; text-align:left; font-size:13px; line-height:2.2;">
                <div><strong style="color:var(--gold);">📛 Name:</strong> ${escapeHtml(booking.name)}</div>
                <div><strong style="color:var(--gold);">✂️ Service:</strong> ${escapeHtml(booking.service)}</div>
                <div><strong style="color:var(--gold);">📅 Date:</strong> ${formatDateNice(booking.date)}</div>
                <div><strong style="color:var(--gold);">⏰ Time:</strong> ${escapeHtml(booking.time)}</div>
                <div><strong style="color:var(--gold);">📞 Phone:</strong> ${escapeHtml(booking.phone)}</div>
                <div><strong style="color:var(--gold);">🆔 Ref:</strong> #${booking.ref}</div>
            </div>

            <p style="color:var(--gray); font-size:13px; margin-bottom:14px;">
                WhatsApp will open automatically — just tap <strong style="color:white;">Send</strong> to notify us.
                If it didn't open, use the button below.
            </p>

            <a id="whatsappFallbackBtn"
               href="#"
               target="_blank"
               rel="noopener noreferrer"
               style="display:inline-flex; align-items:center; gap:10px; background:#25D366; color:#fff; padding:13px 26px; border-radius:30px; font-weight:700; text-decoration:none; margin-bottom:14px; font-size:14px; box-shadow:0 4px 15px rgba(37,211,102,0.3);">
               <i class="fab fa-whatsapp" style="font-size:20px;"></i> Send WhatsApp Notification
            </a>
            <br>
            <button class="btn-book" onclick="resetForm()"
                    style="margin-top:8px; width:auto; padding:12px 28px; font-size:13px;">
                ✂️ Make Another Booking
            </button>
        `;
    }

    // ── Show the success panel ──
    document.getElementById('bookForm').style.display = 'none';
    if (successEl) successEl.style.display = 'block';
    showToast('✅ Booking confirmed! Opening WhatsApp...');

    // ── Fire WhatsApp after a short UX delay ──
    setTimeout(() => triggerWhatsAppNotification(booking), 700);
}

// ── Reset booking form ───────────────────────────────────────────────────────
function resetForm() {
    const bookForm    = document.getElementById('bookForm');
    const formSuccess = document.getElementById('formSuccess');
    if (bookForm)    bookForm.style.display    = 'block';
    if (formSuccess) formSuccess.style.display = 'none';

    ['bName', 'bPhone', 'bDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Use innerHTML to restore the icon (textContent would strip it)
    const btn = document.querySelector('#bookForm .btn-book');
    if (btn) {
        btn.innerHTML = 'Confirm Booking <i class="fas fa-arrow-right"></i>';
        btn.disabled = false;
    }
}

// ── Contact / Send Message via WhatsApp ──────────────────────────────────────
function sendMessage() {
    const name    = document.getElementById('cName')?.value.trim();
    const email   = document.getElementById('cEmail')?.value.trim();
    const message = document.getElementById('cMsg')?.value.trim();

    if (!name)    { showToast('⚠️ Please enter your name.', true);    return; }
    if (!email)   { showToast('⚠️ Please enter your email.', true);   return; }
    if (!message) { showToast('⚠️ Please enter your message.', true); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('⚠️ Please enter a valid email address.', true);
        return;
    }

    const waMsg =
        `💬 *Website Message — Prime Cut*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📧 *Email:* ${email}\n\n` +
        `📝 *Message:*\n${message}`;

    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(waMsg)}`, '_blank', 'noopener,noreferrer');
    showToast('✅ Opening WhatsApp to send your message!');

    ['cName', 'cEmail', 'cMsg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// ── Newsletter ───────────────────────────────────────────────────────────────
function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail')?.value.trim();
    if (!email) { showToast('⚠️ Please enter your email address.', true); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('⚠️ Please enter a valid email address.', true);
        return;
    }
    showToast('✅ Subscribed! Welcome to the Prime Cut family.');
    document.getElementById('newsletterEmail').value = '';
}

// ── Toast Notification ───────────────────────────────────────────────────────
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background   = isError ? '#2A1A1A' : '#1A2A1A';
    toast.style.borderColor  = isError ? '#E63946' : '#2DC653';
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── XSS-safe HTML escaping ───────────────────────────────────────────────────
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// ── Stats Counter Animation ──────────────────────────────────────────────────
function animateCounter(element, start, end, duration) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(document.getElementById('stat1'), 0, 5000, 2000);
            animateCounter(document.getElementById('stat2'), 0, 15,   1500);
            animateCounter(document.getElementById('stat3'), 0, 10,   1500);
            animateCounter(document.getElementById('stat4'), 0, 25,   2000);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) statsObserver.observe(statsSection);

// ── Testimonials Slider ──────────────────────────────────────────────────────
let currentTestimonial = 0;
const testimonialsTrack = document.getElementById('testimonialsTrack');
const testimonialCards  = document.querySelectorAll('.testimonial-card');
const cardsToShow = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;

function updateTestimonials() {
    if (testimonialsTrack) {
        testimonialsTrack.style.transform =
            `translateX(${-currentTestimonial * (100 / cardsToShow)}%)`;
    }
}

function nextTestimonial() {
    if (currentTestimonial < testimonialCards.length - cardsToShow) {
        currentTestimonial++;
        updateTestimonials();
    }
}

function prevTestimonial() {
    if (currentTestimonial > 0) {
        currentTestimonial--;
        updateTestimonials();
    }
}

// Reload on resize only if card count changes (avoids infinite loop)
let _cardsToShow = cardsToShow;
window.addEventListener('resize', () => {
    const updated = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
    if (updated !== _cardsToShow) {
        _cardsToShow = updated;
        location.reload();
    }
}, { passive: true });

// ── Entrance Animations ──────────────────────────────────────────────────────
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(
    '.gallery-item, .service-card, .about-grid, .booking-form, .testimonial-card'
).forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = '0.5s ease';
    animationObserver.observe(el);
});
