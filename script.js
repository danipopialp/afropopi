
/* =====================================
   AFROPOPI — INTERACTIVE JAVASCRIPT
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  // 1. FOOTER YEAR
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // 2. MOBILE NAVIGATION
  const header = document.querySelector("header");
  const nav = document.querySelector("nav");

  if (header && nav) {
    let menuButton = document.getElementById("menuToggle");

    if (!menuButton) {
      menuButton = document.createElement("button");
      menuButton.id = "menuToggle";
      menuButton.type = "button";
      menuButton.textContent = "☰";
      menuButton.setAttribute("aria-label", "Toggle navigation");
      menuButton.setAttribute("aria-expanded", "false");
      header.appendChild(menuButton);
    }

    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.textContent = "☰";
      });
    });
  }

  // 3. NOTIFICATION MESSAGE
  let toastTimer;

  function notify(message) {
    let toast = document.getElementById("afropopiToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "afropopiToast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // 4. SEARCH MUSIC NEWS AND ARTISTS
  const searchInput =
    document.querySelector("#searchInput") ||
    document.querySelector(".search input") ||
    document.querySelector('input[type="search"]');

  const searchableItems = () =>
    document.querySelectorAll(
      ".card, .news-card, .trend, .reel"
    );

  function searchContent(query) {
    let matches = 0;

    searchableItems().forEach(item => {
      const text = item.textContent.toLowerCase();
      const keywords = (item.dataset.search || "").toLowerCase();
      const found = !query || text.includes(query) ||
        keywords.includes(query);

      item.hidden = !found;

      if (found) matches++;
    });

    notify(
      query
        ? `${matches} matching items found`
        : "Showing all music content"
    );
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchContent(searchInput.value.trim().toLowerCase());
    });

    const searchForm = searchInput.closest("form");

    if (searchForm) {
      searchForm.addEventListener("submit", event => {
        event.preventDefault();
        searchContent(searchInput.value.trim().toLowerCase());
      });
    }
  }

  // 5. MUSIC DISCOVERY FILTERS
  const categoryButtons = document.querySelectorAll(
    "[data-filter], .category-btn, .chip"
  );

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const category = (
        button.dataset.filter ||
        button.dataset.category ||
        button.textContent
      ).trim().toLowerCase();

      categoryButtons.forEach(btn =>
        btn.classList.remove("selected", "active")
      );

      button.classList.add("selected");

      let matches = 0;

      searchableItems().forEach(item => {
        const text = (
          item.textContent + " " +
          (item.dataset.search || "") + " " +
          (item.dataset.category || "")
        ).toLowerCase();

        const allCategories =
          category === "all" ||
          category.includes("all sounds") ||
          category.includes("all music");

        const found = allCategories ||
          text.includes(category);

        item.hidden = !found;

        if (found) matches++;
      });

      notify(
        category.includes("all")
          ? "Showing all content"
          : `${matches} matching items`
      );
    });
  });

  // 6. DEMO CHAT
  const chatForm = document.querySelector("#chatForm");
  const chatInput = document.querySelector("#chatInput");
  const messages = document.querySelector("#messages");

  if (chatForm && chatInput && messages) {
    chatForm.addEventListener("submit", event => {
      event.preventDefault();

      const text = chatInput.value.trim();

      if (!text) {
        notify("Write a message first.");
        return;
      }

      const message = document.createElement("div");
      message.className = "message";
      message.textContent = text;

      messages.appendChild(message);
      chatInput.value = "";

      message.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

      notify("Message added to this demo chat.");
    });
  }

  // 7. DANI WAVE MUSIC PLAYER
  const listenButton =
    document.querySelector("#listenBtn") ||
    document.querySelector("[data-action='listen']");

  let audio = null;

  if (listenButton) {
    listenButton.addEventListener("click", async () => {
      // Replace this with the path to your actual audio file.
      const musicURL = "music/dani-wave.mp3";

      if (!audio) {
        audio = new Audio(musicURL);
        audio.preload = "none";

        audio.addEventListener("error", () => {
          notify("Add your track at music/dani-wave.mp3 first.");
        });
      }

      if (audio.paused) {
        try {
          await audio.play();
          listenButton.textContent = "❚❚ Pause DANI WAVE";
          notify("Now playing DANI WAVE Music");
        } catch (error) {
          notify("Upload your music file to enable playback.");
        }
      } else {
        audio.pause();
        listenButton.textContent = "♫ Listen Now →";
        notify("Music paused.");
      }
    });
  }

  // 8. REELS DEMO BUTTONS
  document.querySelectorAll("[data-demo]").forEach(button => {
    button.addEventListener("click", () => {
      notify(button.dataset.demo);
    });
  });

  // 9. ANIMATED MUSIC VISUALIZER
  document.querySelectorAll(".equalizer i").forEach((bar, index) => {
    bar.style.animationDelay = `${(index % 7) * -0.12}s`;
  });

  // 10. SCROLL REVEAL ANIMATIONS
  const revealItems = document.querySelectorAll(
    ".card, .reel, .section-title, .panel, .dani"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(item => {
      item.classList.add("reveal");
      observer.observe(item);
    });
  }

  // 11. NAVIGATION ACTIVE LINK
  const sections = document.querySelectorAll(
    "main section[id]"
  );

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        document.querySelectorAll("nav a").forEach(link => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", active);
        });
      });
    }, { rootMargin: "-20% 0px -65% 0px" });

    sections.forEach(section => sectionObserver.observe(section));
  }

  console.log("Afropopi is ready! Africa's Sound. Your Daily Update.");
});
