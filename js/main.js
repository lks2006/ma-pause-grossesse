(function () {
  const drawer = document.getElementById("drawer");
  const openBtn = document.querySelector(".menu-toggle");
  const closeBtn = document.querySelector(".drawer-close");
  if (openBtn && drawer) {
    openBtn.addEventListener("click", function () {
      drawer.classList.add("open");
      openBtn.setAttribute("aria-expanded", "true");
    });
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
  }
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.querySelector(".drawer-overlay").addEventListener("click", closeDrawer);
  }

  document.querySelectorAll(".has-sub > a").forEach(function (trigger) {
    const item = trigger.parentElement;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      const open = item.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      document.querySelectorAll(".has-sub").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          const otherTrigger = other.querySelector(":scope > a");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });
    });
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".has-sub")) return;
    document.querySelectorAll(".has-sub.is-open").forEach(function (item) {
      item.classList.remove("is-open");
      const trigger = item.querySelector(":scope > a");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  });

  const subMobile = document.querySelector(".drawer-panel .sub-mobile");
  const lieuxMobile = document.querySelector('.drawer-panel a[href="nos-lieux.html"]');
  if (lieuxMobile && subMobile) {
    lieuxMobile.setAttribute("aria-expanded", "false");
    lieuxMobile.setAttribute("aria-haspopup", "true");
    lieuxMobile.addEventListener("click", function (e) {
      e.preventDefault();
      const open = subMobile.classList.toggle("is-open");
      lieuxMobile.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    const slides = Array.from(root.querySelectorAll("img"));
    const dotsWrap = root.querySelector(".dots");
    if (!slides.length) return;
    let i = 0;
    slides.forEach(function (img, idx) {
      if (dotsWrap) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Image " + (idx + 1));
        if (idx === 0) b.classList.add("is-on");
        b.addEventListener("click", function () { go(idx); });
        dotsWrap.appendChild(b);
      }
    });
    function go(n) {
      slides[i].classList.remove("is-on");
      if (dotsWrap) dotsWrap.children[i].classList.remove("is-on");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-on");
      if (dotsWrap) dotsWrap.children[i].classList.add("is-on");
    }
    const prev = root.querySelector("[data-prev]");
    const next = root.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });
    setInterval(function () { go(i + 1); }, 5000);
  });

  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    const buttons = Array.from(root.querySelectorAll("[data-tab]"));
    const panels = Array.from(root.querySelectorAll("[data-panel]"));
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-tab");
        buttons.forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        panels.forEach(function (p) {
          p.classList.toggle("is-on", p.getAttribute("data-panel") === id);
        });
      });
    });
  });

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.querySelector('[name="nom"]').value.trim();
      const prenom = form.querySelector('[name="prenom"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const sujet = form.querySelector('[name="sujet"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();
      const body = encodeURIComponent(
        "Nom : " + name + "\nPrénom : " + prenom + "\nEmail : " + email + "\nSujet : " + sujet + "\n\n" + message
      );
      window.location.href =
        "mailto:mapausegrossesse@gmail.com?subject=" + encodeURIComponent(sujet || "Contact Ma Pause Grossesse") + "&body=" + body;
      const ok = document.getElementById("form-ok");
      if (ok) ok.style.display = "block";
    });
  }

  function alignHeroLogo() {
    const art = document.querySelector(".home-hero-art");
    const kicker = document.querySelector(".home-hero .kicker");
    const places = document.querySelector(".home-hero .home-places");
    const hero = document.querySelector(".home-hero");
    if (!art || !kicker || !places || !hero) return;
    if (window.matchMedia("(max-width: 1024px)").matches) {
      art.style.top = "";
      art.style.height = "";
      return;
    }
    const heroBox = hero.getBoundingClientRect();
    const top = kicker.getBoundingClientRect().top - heroBox.top;
    const bottom = places.getBoundingClientRect().bottom - heroBox.top;
    const h = Math.max(0, bottom - top);
    const extra = h * 0.08;
    art.style.top = (top - extra / 2) + "px";
    art.style.height = (h + extra) + "px";
  }
  alignHeroLogo();
  window.addEventListener("resize", alignHeroLogo);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(alignHeroLogo);
  }
})();
