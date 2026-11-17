/**
 * Wedding Invitation Website - Interactive Script
 * Features:
 * - Live Countdown Timer
 * - Web Audio API Ambient Romantic Chords (No external file needed!)
 * - Floating Rose Petal Particle Effect
 * - Interactive RSVP Form with LocalStorage & Confetti
 * - Live Guestbook / Blessings Wall
 * - "Add to Calendar" (.ics download & Google Calendar link)
 * - Photo Gallery Lightbox Modal
 * - Mobile Navigation & Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  initInviteCurtain();
  initCountdown();
  initPetals();
  initAudioPlayer();
  initRsvpForm();
  initGuestbook();
  initLightbox();
  initCalendarButtons();
  initMobileNav();
  initFaqAccordion();
});

/* ==========================================================================
   0. ENVELOPE / OPEN INVITATION CURTAIN
   ========================================================================== */
function initInviteCurtain() {
  const curtain = document.getElementById('invite-curtain');
  const openBtn = document.getElementById('open-invite-btn');

  if (!curtain || !openBtn) return;

  openBtn.addEventListener('click', () => {
    curtain.classList.add('opened');
    triggerConfetti();

    // Start music on first interaction
    if (!isAudioPlaying) {
      toggleMusicPlayback();
    }
  });

  // Re-open invitation cover if requested from footer
  const reopenBtn = document.getElementById('reopen-invite-btn');
  if (reopenBtn) {
    reopenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      curtain.classList.remove('opened');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   1. WEDDING COUNTDOWN TIMER
   Customizable Target Date: Change date below
   ========================================================================== */
const WEDDING_CONFIG = {
  coupleNames: "Archit & Aakriti",
  // Target date: December 27, 2026, 01:00:00 AM IST (Year, Month 0-indexed: 11 = Dec, Day, Hour, Min)
  weddingDate: new Date(2026, 11, 27, 1, 0, 0),
  venue: "The Oberoi Udaivilas, Lake Pichola, Udaipur, Rajasthan, India",
  googleCalendarUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+of+Archit+%26+Aakriti&dates=20261226T193000Z/20261227T020000Z&details=Join+us+in+celebrating+the+auspicious+wedding+ceremony+of+Archit+and+Aakriti!&location=The+Oberoi+Udaivilas,+Udaipur"
};

function initCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-mins');
  const secondsEl = document.getElementById('count-secs');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const target = WEDDING_CONFIG.weddingDate.getTime();
    const distance = target - now;

    if (distance <= 0) {
      document.getElementById('countdown-wrapper').innerHTML = `
        <div class="text-2xl font-serif text-amber-700 font-semibold py-4">
          Today is the Big Day! Celebrating Our Forever! 🎉💍
        </div>
      `;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   2. FLOATING PETALS ANIMATION
   ========================================================================== */
let petalsActive = true;
let petalInterval;

function initPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  function createPetal() {
    if (!petalsActive) return;
    const petal = document.createElement('div');
    petal.classList.add('petal');

    const size = Math.random() * 12 + 10;
    const startLeft = Math.random() * window.innerWidth;
    const duration = Math.random() * 5 + 6; // 6 to 11s

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.3}px`;
    petal.style.left = `${startLeft}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.opacity = Math.random() * 0.5 + 0.3;

    container.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, duration * 1000);
  }

  // Create initial burst
  for (let i = 0; i < 6; i++) {
    setTimeout(createPetal, i * 400);
  }
  petalInterval = setInterval(createPetal, 1400);

  // Toggle button for petals if present
  const toggleBtn = document.getElementById('toggle-petals');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      petalsActive = !petalsActive;
      toggleBtn.classList.toggle('opacity-50', !petalsActive);
      toggleBtn.setAttribute('title', petalsActive ? 'Pause falling petals' : 'Play falling petals');
    });
  }
}

/* ==========================================================================
   3. AMBIENT ROMANTIC AUDIO (Web Audio API Synthesizer)
   Produces a serene, gentle harp/piano arpeggio progression without external mp3.
   Also supports loading a custom MP3 audio file if added.
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let audioTimer = null;

const ambientChords = [
  [293.66, 369.99, 440.00, 587.33], // D maj (D4, F#4, A4, D5)
  [246.94, 293.66, 369.99, 493.88], // B min (B3, D4, F#4, B4)
  [329.63, 392.00, 493.88, 659.25], // E min (E4, G4, B4, E5)
  [220.00, 277.18, 329.63, 440.00]  // A maj (A3, C#4, E4, A4)
];
let chordIndex = 0;
let noteIndex = 0;

function playAmbientNote(freq) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.9);
  } catch (e) {
    console.log('Audio playback error:', e);
  }
}

function startAmbientSequence() {
  if (audioTimer) clearInterval(audioTimer);
  audioTimer = setInterval(() => {
    const currentChord = ambientChords[chordIndex];
    const freq = currentChord[noteIndex];
    playAmbientNote(freq);

    noteIndex++;
    if (noteIndex >= currentChord.length) {
      noteIndex = 0;
      chordIndex = (chordIndex + 1) % ambientChords.length;
    }
  }, 850);
}

function toggleMusicPlayback() {
  const musicBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon');
  const musicStatus = document.getElementById('music-status-text');

  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (!isAudioPlaying) {
    isAudioPlaying = true;
    startAmbientSequence();
    if (musicBtn) {
      musicBtn.classList.add('playing');
      musicBtn.classList.remove('paused');
    }
    if (musicIcon) {
      musicIcon.classList.remove('fa-volume-mute');
      musicIcon.classList.add('fa-volume-up');
    }
    if (musicStatus) musicStatus.textContent = "Music: Playing";
  } else {
    isAudioPlaying = false;
    clearInterval(audioTimer);
    if (musicBtn) {
      musicBtn.classList.remove('playing');
      musicBtn.classList.add('paused');
    }
    if (musicIcon) {
      musicIcon.classList.remove('fa-volume-up');
      musicIcon.classList.add('fa-volume-mute');
    }
    if (musicStatus) musicStatus.textContent = "Music: Paused";
  }
}

function initAudioPlayer() {
  const musicBtn = document.getElementById('music-toggle-btn');
  if (!musicBtn) return;
  musicBtn.addEventListener('click', toggleMusicPlayback);
}

/* ==========================================================================
   4. RSVP FORM SUBMISSION & LOCALSTORAGE PERSISTENCE
   ========================================================================== */
function initRsvpForm() {
  const form = document.getElementById('wedding-rsvp-form');
  const modal = document.getElementById('rsvp-success-modal');
  const closeModal = document.getElementById('close-modal-btn');

  if (!form) return;

  // Check if user already RSVP'd in localStorage
  const savedRsvp = localStorage.getItem('wedding_rsvp_record');
  if (savedRsvp) {
    try {
      const data = JSON.parse(savedRsvp);
      const notice = document.getElementById('rsvp-existing-notice');
      if (notice) {
        notice.classList.remove('hidden');
        notice.innerHTML = `
          <div class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
            <span>✨ You previously RSVP'd as <strong>${escapeHtml(data.name)}</strong> (${data.attending === 'yes' ? 'Attending' : 'Not Attending'}). You can update your response below anytime!</span>
          </div>
        `;
      }
    } catch (e) {}
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Confirming...`;
    submitBtn.disabled = true;

    // Collect data
    const attendingVal = form.querySelector('input[name="attending"]:checked')?.value || 'yes';
    const checkedEvents = Array.from(form.querySelectorAll('input[name="events"]:checked')).map(el => el.value);

    const formData = {
      name: form.elements['name']?.value?.trim() || 'Guest',
      email: form.elements['email']?.value?.trim() || '',
      phone: form.elements['phone']?.value?.trim() || '',
      attending: attendingVal,
      guestsCount: form.elements['guests']?.value || '1',
      events: checkedEvents,
      diet: form.elements['diet']?.value || 'standard',
      message: form.elements['message']?.value?.trim() || '',
      submittedAt: new Date().toISOString()
    };

    // Save locally
    localStorage.setItem('wedding_rsvp_record', JSON.stringify(formData));

    /*
     * NOTE FOR GITHUB PAGES DEPLOYMENT:
     * To send submissions directly to your email or Google Sheet:
     * Replace this block with a fetch() call to Formspree, EmailJS, or Google Apps Script.
     * Example:
     * fetch("https://formspree.io/f/YOUR_FORM_ID", {
     *   method: "POST",
     *   headers: { "Content-Type": "application/json" },
     *   body: JSON.stringify(formData)
     * });
     */

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      // Show confirmation modal
      if (modal) {
        const guestNameSpan = document.getElementById('modal-guest-name');
        const statusSpan = document.getElementById('modal-rsvp-status');
        if (guestNameSpan) guestNameSpan.textContent = formData.name;
        if (statusSpan) {
          statusSpan.textContent = formData.attending === 'yes'
            ? `We cannot wait to celebrate with you (${formData.guestsCount} ${formData.guestsCount == 1 ? 'guest' : 'guests'})!`
            : `We will miss you deeply, but thank you for your warm thoughts!`;
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        triggerConfetti();
      }

      // Add to Guestbook if a message was written
      if (formData.message) {
        addGuestbookEntry(formData.name, formData.message);
      }
    }, 600);
  });

  if (closeModal && modal) {
    closeModal.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }
}

/* Confetti Burst Effect */
function triggerConfetti() {
  const count = 50;
  const colors = ['#c5a059', '#dfba73', '#f472b6', '#fb7185', '#fbbf24', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.zIndex = '9999';
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = `${Math.random() * 8 + 6}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confetti.style.top = '40%';
    confetti.style.left = '50%';
    confetti.style.pointerEvents = 'none';

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 350 + 150;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity;

    document.body.appendChild(confetti);

    confetti.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${destX}px, ${destY + 180}px) rotate(${Math.random() * 720}deg) scale(0.6)`, opacity: 0 }
    ], {
      duration: Math.random() * 1200 + 1000,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }).onfinish = () => confetti.remove();
  }
}

/* ==========================================================================
   5. GUESTBOOK / BLESSINGS WALL
   ========================================================================== */
const DEFAULT_WISHES = [
  { name: "Priya & Rohan", message: "Wishing you both a lifetime filled with laughter, adventures, and endless love! Cannot wait for the celebrations!", time: "2 days ago" },
  { name: "The Verma Family", message: "May God shower your beautiful union with peace, abundance, and eternal joy. Heartiest congratulations to both the Mathur and Nagpal families!", time: "1 week ago" },
  { name: "Ananya Sharma", message: "So thrilled for you Aakriti & Archit! You two are pure magic together. Let the celebrations begin! 🥂✨", time: "3 days ago" }
];

function initGuestbook() {
  const container = document.getElementById('guestbook-list');
  const form = document.getElementById('guestbook-form');
  if (!container) return;

  renderGuestbook();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-name');
      const messageInput = document.getElementById('wish-message');

      const name = nameInput.value.trim();
      const msg = messageInput.value.trim();

      if (!name || !msg) return;

      addGuestbookEntry(name, msg);
      nameInput.value = '';
      messageInput.value = '';
      triggerConfetti();
    });
  }
}

function getStoredWishes() {
  try {
    const raw = localStorage.getItem('wedding_wishes_board');
    return raw ? JSON.parse(raw) : DEFAULT_WISHES;
  } catch (e) {
    return DEFAULT_WISHES;
  }
}

function addGuestbookEntry(name, message) {
  const wishes = getStoredWishes();
  wishes.unshift({
    name: name,
    message: message,
    time: "Just now"
  });
  localStorage.setItem('wedding_wishes_board', JSON.stringify(wishes));
  renderGuestbook();
}

function renderGuestbook() {
  const container = document.getElementById('guestbook-list');
  if (!container) return;

  const wishes = getStoredWishes();
  container.innerHTML = wishes.map(w => `
    <div class="glass-card p-6 rounded-2xl border border-amber-100 flex flex-col justify-between">
      <p class="text-stone-700 italic text-sm md:text-base leading-relaxed mb-4">"${escapeHtml(w.message)}"</p>
      <div class="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
        <span class="font-serif font-semibold text-stone-800 text-sm flex items-center gap-1.5">
          <i class="fas fa-heart text-amber-500 text-xs"></i> ${escapeHtml(w.name)}
        </span>
        <span>${escapeHtml(w.time)}</span>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   6. PHOTO GALLERY LIGHTBOX
   ========================================================================== */
function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');

  if (!lightbox || !lightboxImg) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.getAttribute('data-caption') || img?.alt || 'Wedding Moment';
      if (img) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.textContent = caption;
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeGallery() {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeGallery);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeGallery();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      closeGallery();
    }
  });
}

/* ==========================================================================
   7. ADD TO CALENDAR BUTTONS (.ics & Google Calendar)
   ========================================================================== */
function initCalendarButtons() {
  const googleBtn = document.getElementById('add-google-calendar');
  const icsBtn = document.getElementById('download-ics-calendar');

  if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(WEDDING_CONFIG.googleCalendarUrl, '_blank');
    });
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIcsFile();
    });
  }
}

function downloadIcsFile() {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//Archit and Aakriti//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:wedding-archit-aakriti-20261227@weddinginvitation.site",
    "DTSTAMP:20261117T120000Z",
    "DTSTART:20261226T193000Z",
    "DTEND:20261227T020000Z",
    "SUMMARY:The Wedding Ceremony of Archit & Aakriti",
    "DESCRIPTION:We warmly invite you to celebrate the auspicious wedding ceremony of Archit & Aakriti!",
    "LOCATION:" + WEDDING_CONFIG.venue,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'Archit-and-Aakriti-Wedding.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   8. MOBILE NAVIGATION & FAQ
   ========================================================================== */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !menu) return;

  menuBtn.addEventListener('click', () => {
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-toggle');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const icon = btn.querySelector('.faq-icon');

      if (!content) return;

      const isOpen = !content.classList.contains('hidden');
      if (isOpen) {
        content.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
