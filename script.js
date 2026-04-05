const weddingDateString = "2026-05-28T07:35:00+05:30";

function getCountdownElements() {
  return {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  };
}

function setCountdownValues(countdownEls, values) {
  if (!countdownEls.days || !countdownEls.hours || !countdownEls.minutes || !countdownEls.seconds) {
    return;
  }

  countdownEls.days.textContent = values.days;
  countdownEls.hours.textContent = values.hours;
  countdownEls.minutes.textContent = values.minutes;
  countdownEls.seconds.textContent = values.seconds;
}

function startCountdown() {
  const countdownEls = getCountdownElements();
  const weddingTime = new Date(weddingDateString).getTime();

  if (Number.isNaN(weddingTime)) {
    setCountdownValues(countdownEls, {
      days: "---",
      hours: "--",
      minutes: "--",
      seconds: "--",
    });
    return;
  }

  function updateCountdown() {
    const distance = weddingTime - Date.now();

    if (distance <= 0) {
      setCountdownValues(countdownEls, {
        days: "000",
        hours: "00",
        minutes: "00",
        seconds: "00",
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    setCountdownValues(countdownEls, {
      days: String(days).padStart(3, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    });
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function setupRevealAnimation() {
  const revealEls = document.querySelectorAll(".reveal");

  if (!revealEls.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function setupNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!navToggle || !navLinks) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupForm() {
  const form = document.getElementById("rsvpForm");
  const formStatus = document.getElementById("formStatus");

  if (!form || !formStatus) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = data.get("name");
    const attendance = data.get("attendance");

    formStatus.textContent = `Thank you, ${name}. Your RSVP has been noted as "${attendance}".`;
    form.reset();
  });
}

function initPage() {
  startCountdown();
  setupRevealAnimation();
  setupNav();
  setupForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
