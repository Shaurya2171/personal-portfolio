document.addEventListener("DOMContentLoaded", function () {
  /* ---------- 1. Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the mobile menu after choosing a link (native anchor handles the scroll)
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---------- 2. Header scrolled state + scroll progress bar ---------- */
  var header = document.getElementById("siteHeader");
  var progressBar = document.getElementById("scrollProgressBar");

  function onScroll() {
    // Toggle a subtle border/shadow once the page has scrolled a little
    header.classList.toggle("is-scrolled", window.scrollY > 12);

    // Calculate how far down the page the user has scrolled, as a percentage
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = percent + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Active section highlighting ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-link");

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-nav") === id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- 4. Theme switcher ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;

  function applyThemeLabel(theme) {
    var next = theme === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", "Switch to " + next + " theme");
  }

  // Reflect whatever theme the inline head-script already set
  applyThemeLabel(root.getAttribute("data-theme") || "light");

  themeToggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    applyThemeLabel(next);
  });

  /* ---------- 5. Background particles ---------- */
  // Generates a small, fixed set of floating dots once on load — purely decorative.
  var particleHost = document.getElementById("bgParticles");
  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (particleHost && !reducedMotion) {
    var particleCount = window.innerWidth < 720 ? 10 : 22;
    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement("span");
      particle.className = "bg-particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.bottom = "-10px";
      particle.style.animationDuration = 14 + Math.random() * 16 + "s";
      particle.style.animationDelay = Math.random() * 18 + "s";
      particleHost.appendChild(particle);
    }
  }

  /* ---------- 6. Scroll-reveal animations ---------- */
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: no IntersectionObserver support — just show everything
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- 7. Skill card cursor-glow effect ---------- */
  // Purely a visual touch: tracks the pointer so the card's glow follows the cursor.
  document.querySelectorAll(".skill-card").forEach(function (card) {
    card.addEventListener("mousemove", function (event) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty(
        "--mx",
        ((event.clientX - rect.left) / rect.width) * 100 + "%"
      );
      card.style.setProperty(
        "--my",
        ((event.clientY - rect.top) / rect.height) * 100 + "%"
      );
    });
  });

  /* ---------- 7b. Hobby card tap support (touch devices) ---------- */
  // :hover doesn't fire reliably on touch, so a tap toggles the same visual
  // state that hover/focus-within already provides via the .is-tapped class.
  var hobbyCards = document.querySelectorAll(".hobby-card");
  hobbyCards.forEach(function (card) {
    card.addEventListener("click", function (event) {
      // Let the "View Chess.com Profile" link behave normally — don't intercept it.
      if (event.target.closest("a")) return;

      var wasTapped = card.classList.contains("is-tapped");
      hobbyCards.forEach(function (c) {
        c.classList.remove("is-tapped");
      });
      if (!wasTapped) card.classList.add("is-tapped");
    });
  });

  /* ---------- 8. Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  var fields = {
    name: {
      input: document.getElementById("name"),
      error: document.getElementById("nameError"),
      validate: function (value) {
        return value.trim().length === 0 ? "Please enter your name." : "";
      },
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("emailError"),
      validate: function (value) {
        if (value.trim().length === 0) return "Please enter your email.";
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value.trim())
          ? ""
          : "Please enter a valid email address.";
      },
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("messageError"),
      validate: function (value) {
        return value.trim().length === 0 ? "Please enter a message." : "";
      },
    },
  };

  function validateField(key) {
    var field = fields[key];
    var errorMessage = field.validate(field.input.value);
    field.error.textContent = errorMessage;
    field.input.classList.toggle("is-invalid", Boolean(errorMessage));
    return errorMessage === "";
  }

  // Validate as the user types/leaves a field, so feedback feels immediate
  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener("blur", function () {
      validateField(key);
    });
    fields[key].input.addEventListener("input", function () {
      if (fields[key].input.classList.contains("is-invalid"))
        validateField(key);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var isNameValid = validateField("name");
    var isEmailValid = validateField("email");
    var isMessageValid = validateField("message");

    if (isNameValid && isEmailValid && isMessageValid) {
      status.textContent =
        "Thanks! Your message has been sent (demo only — no backend is connected).";
      status.className = "form-status success";
      form.reset();
    } else {
      status.textContent = "Please fix the highlighted fields and try again.";
      status.className = "form-status error";
    }
  });
});
