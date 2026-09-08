(function () {
  const FORMULAS = {
    intime: {
      id: "intime",
      name: "Formule intime",
      price: 1200,
      capacity: 2,
      guests: 1,
      details: "Chambre individuelle, salle de bain privée"
    },
    partagee: {
      id: "partagee",
      name: "Formule partagée",
      price: 1100,
      capacity: 2,
      guests: 1,
      details: "Chambre individuelle, salle de bain partagée"
    },
    duo: {
      id: "duo",
      name: "Formule Duo",
      price: 850,
      capacity: 2,
      guests: 2,
      details: "Chambre et salle de bain partagées. Réservation exclusivement à deux, 850 € par personne"
    }
  };

  const HOUSES = {
    ouest: {
      id: "ouest",
      name: "Étel, Bretagne",
      label: "Maison dans l’Ouest",
      photo: "img/ouest/ext-01.jpeg"
    },
    est: {
      id: "est",
      name: "La Moncelle, Grand Est",
      label: "Maison dans l’Est",
      photo: "img/est/ext/01.avif"
    }
  };

  const SESSIONS = [
    { id: "ouest-2026-10-15", house: "ouest", start: "2026-10-15", end: "2026-10-18", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "ouest-2026-11-12", house: "ouest", start: "2026-11-12", end: "2026-11-15", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "ouest-2026-12-10", house: "ouest", start: "2026-12-10", end: "2026-12-13", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "ouest-2027-01-14", house: "ouest", start: "2027-01-14", end: "2027-01-17", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "ouest-2027-02-11", house: "ouest", start: "2027-02-11", end: "2027-02-14", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "est-2026-10-22", house: "est", start: "2026-10-22", end: "2026-10-25", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "est-2026-11-19", house: "est", start: "2026-11-19", end: "2026-11-22", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "est-2026-12-17", house: "est", start: "2026-12-17", end: "2026-12-20", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "est-2027-01-21", house: "est", start: "2027-01-21", end: "2027-01-24", stock: { intime: 0, partagee: 0, duo: 0 } },
    { id: "est-2027-02-18", house: "est", start: "2027-02-18", end: "2027-02-21", stock: { intime: 0, partagee: 0, duo: 0 } }
  ];

  const STORAGE_KEY = "mpg-bookings";
  const state = { step: 1, house: null, session: null, formula: null };

  function loadBookings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function remaining(session, formulaId) {
    const booked = loadBookings()
      .filter(function (b) { return b.sessionId === session.id && b.formula === formulaId; })
      .reduce(function (sum, b) { return sum + b.places; }, 0);
    return Math.max(0, session.stock[formulaId] - booked);
  }

  function sessionHasPlace(session) {
    return remaining(session, "intime") > 0 || remaining(session, "partagee") > 0 || remaining(session, "duo") > 0;
  }

  function euros(n) {
    return n.toLocaleString("fr-FR") + " €";
  }

  function formatRange(start, end) {
    const a = new Date(start + "T12:00:00");
    const b = new Date(end + "T12:00:00");
    const optsDay = { weekday: "long", day: "numeric", month: "long" };
    const year = b.getFullYear();
    return cap(a.toLocaleDateString("fr-FR", optsDay)) + " — " + cap(b.toLocaleDateString("fr-FR", optsDay)) + " " + year;
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function dueDate(start) {
    const d = new Date(start + "T12:00:00");
    d.setMonth(d.getMonth() - 1);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  function formulaTotal(formula) {
    return formula.price * formula.guests;
  }

  function depositOf(formula) {
    return Math.round(formulaTotal(formula) * 0.3);
  }

  function balanceOf(formula) {
    return formulaTotal(formula) - depositOf(formula);
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function showStep(n) {
    state.step = n;
    document.querySelectorAll("[data-book-step]").forEach(function (el) {
      el.hidden = Number(el.getAttribute("data-book-step")) !== n;
    });
    document.querySelectorAll(".book-progress li").forEach(function (el) {
      const i = Number(el.getAttribute("data-progress"));
      el.classList.toggle("is-on", i === n);
      el.classList.toggle("is-done", i < n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderDates() {
    const wrap = $("#book-dates");
    const sessions = SESSIONS.filter(function (s) { return s.house === state.house; });
    const openOnes = sessions.filter(sessionHasPlace);
    if (!openOnes.length) {
      wrap.innerHTML = '<p class="book-empty">Aucune date n’est disponible pour le moment. Vous pouvez <a href="contact.html">nous écrire</a> pour être prévenue dès l’ouverture des prochaines sessions.</p>';
      return;
    }
    wrap.innerHTML = openOnes.map(function (s) {
      return (
        '<button type="button" class="book-card" data-session="' + s.id + '">' +
          "<strong>" + formatRange(s.start, s.end) + "</strong>" +
          "<span>4 jours · 3 nuits</span>" +
          "<em>Places disponibles</em>" +
        "</button>"
      );
    }).join("");
  }

  function renderFormulas() {
    const session = SESSIONS.find(function (s) { return s.id === state.session; });
    const wrap = $("#book-formulas");
    wrap.innerHTML = Object.keys(FORMULAS).map(function (id) {
      const f = FORMULAS[id];
      const left = remaining(session, id);
      const off = left < f.guests;
      const placesLabel = id === "duo"
        ? (left >= 2 ? "1 duo disponible (2 places)" : "Indisponible")
        : (left === 1 ? "1 place restante" : left + " places restantes");
      return (
        '<button type="button" class="book-card book-formula' + (off ? " is-off" : "") + '" data-formula="' + id + '"' + (off ? " disabled" : "") + ">" +
          "<strong>" + f.name + "</strong>" +
          '<span class="book-price">' + euros(f.price) + (id === "duo" ? " / pers." : "") + "</span>" +
          "<p>" + f.details + "</p>" +
          '<em class="' + (off ? "sold" : "") + '">' + (off ? "Indisponible — complet" : placesLabel) + "</em>" +
        "</button>"
      );
    }).join("");
  }

  function fillRecap() {
    const house = HOUSES[state.house];
    const session = SESSIONS.find(function (s) { return s.id === state.session; });
    const formula = FORMULAS[state.formula];
    const total = formulaTotal(formula);
    const deposit = depositOf(formula);
    const balance = balanceOf(formula);
    $("#recap-house").textContent = house.label + " — " + house.name;
    $("#recap-date").textContent = formatRange(session.start, session.end);
    $("#recap-formula").textContent = formula.name + (formula.guests === 2 ? " (2 personnes)" : "");
    $("#recap-total").textContent = euros(total);
    $("#recap-deposit").textContent = euros(deposit);
    $("#recap-balance").textContent = euros(balance);
    $("#recap-due").textContent = dueDate(session.start);
    $("#duo-fields").hidden = formula.guests !== 2;
    const duoInput = document.getElementById("duo");
    if (duoInput) duoInput.required = formula.guests === 2;
  }

  function bind() {
    document.querySelectorAll("[data-house]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.house = btn.getAttribute("data-house");
        state.session = null;
        state.formula = null;
        renderDates();
        showStep(2);
      });
    });

    $("#book-dates").addEventListener("click", function (e) {
      const btn = e.target.closest("[data-session]");
      if (!btn || btn.disabled) return;
      state.session = btn.getAttribute("data-session");
      state.formula = null;
      renderFormulas();
      showStep(3);
    });

    $("#book-formulas").addEventListener("click", function (e) {
      const btn = e.target.closest("[data-formula]");
      if (!btn || btn.disabled) return;
      state.formula = btn.getAttribute("data-formula");
      fillRecap();
      showStep(4);
    });

    document.querySelectorAll("[data-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showStep(Number(btn.getAttribute("data-back")));
      });
    });

    $("#book-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const formula = FORMULAS[state.formula];
      const session = SESSIONS.find(function (s) { return s.id === state.session; });
      const left = remaining(session, formula.id);
      if (left < formula.guests) {
        alert("Cette formule n’est plus disponible.");
        renderFormulas();
        showStep(3);
        return;
      }
      const booking = {
        sessionId: session.id,
        formula: formula.id,
        places: formula.guests,
        at: Date.now()
      };
      const all = loadBookings();
      all.push(booking);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

      const house = HOUSES[state.house];
      const total = formulaTotal(formula);
      const deposit = depositOf(formula);
      const form = e.target;
      const nom = form.nom.value.trim();
      const prenom = form.prenom.value.trim();
      const email = form.email.value.trim();
      const tel = form.tel.value.trim();
      const duo = formula.guests === 2 ? form.duo.value.trim() : "";

      $("#ok-summary").innerHTML =
        "<p><strong>" + prenom + " " + nom + "</strong></p>" +
        "<p>" + house.label + "<br>" + formatRange(session.start, session.end) + "<br>" + formula.name + "</p>" +
        "<p>Acompte à régler maintenant : <strong>" + euros(deposit) + "</strong><br>" +
        "Solde (" + euros(total - deposit) + ") à régler avant le <strong>" + dueDate(session.start) + "</strong>.</p>";

      const subject = "Réservation Ma Pause Grossesse — acompte 30 %";
      const body = [
        "Nouvelle réservation",
        "",
        "Nom : " + nom,
        "Prénom : " + prenom,
        "Email : " + email,
        "Téléphone : " + tel,
        duo ? "Binôme : " + duo : "",
        "",
        "Maison : " + house.label + " — " + house.name,
        "Dates : " + formatRange(session.start, session.end),
        "Formule : " + formula.name,
        "Total : " + euros(total),
        "Acompte 30 % : " + euros(deposit),
        "Solde à régler avant le : " + dueDate(session.start)
      ].filter(Boolean).join("\n");
      window.location.href =
        "mailto:mapausegrossesse@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      showStep(5);
    });
  }

  bind();
  showStep(1);
})();
