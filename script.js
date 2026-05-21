const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

document.querySelectorAll("[data-delay]").forEach((item) => {
  item.style.setProperty("--delay", `${item.dataset.delay}ms`);
});

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    threshold: [0.22, 0.36, 0.5],
    rootMargin: "-18% 0px -55% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

if (!reduceMotion) {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  const pointer = { x: 0.5, y: 0.35 };
  let particles = [];
  let width = 0;
  let height = 0;
  let frameId = null;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(90, Math.max(42, Math.floor(width / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 0.45,
    }));
  }

  function drawGrid() {
    const offsetX = (pointer.x - 0.5) * 20;
    const offsetY = (pointer.y - 0.5) * 20;
    ctx.strokeStyle = "rgba(80, 214, 255, 0.045)";
    ctx.lineWidth = 1;

    for (let x = -60 + offsetX; x < width + 60; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 70, height);
      ctx.stroke();
    }

    for (let y = -60 + offsetY; y < height + 60; y += 54) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + 20);
      ctx.stroke();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    particles.forEach((p, index) => {
      p.x += p.vx + (pointer.x - 0.5) * 0.08;
      p.y += p.vy + (pointer.y - 0.5) * 0.08;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      ctx.beginPath();
      ctx.fillStyle = "rgba(97, 211, 255, 0.58)";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let i = index + 1; i < particles.length; i += 1) {
        const other = particles[i];
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(80, 214, 255, ${0.11 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });

    frameId = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / window.innerWidth;
    pointer.y = event.clientY / window.innerHeight;
  });

  resize();
  animate();

  window.addEventListener("beforeunload", () => cancelAnimationFrame(frameId));
}

const projectModal = document.getElementById("project-modal");
const projectModalImage = projectModal?.querySelector("img");
const projectModalTitle = projectModal?.querySelector(".project-modal-title");
const projectModalClose = projectModal?.querySelector(".project-modal-close");
const projectPreviewButtons = document.querySelectorAll("[data-full]");

function openProjectModal(button) {
  if (!projectModal || !projectModalImage || !projectModalTitle) return;

  const src = button.dataset.full;
  const title = button.dataset.title || "项目图片预览";

  projectModalImage.src = src;
  projectModalImage.alt = title;
  projectModalTitle.textContent = title;
  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  projectModalClose?.focus();
}

function closeProjectModal() {
  if (!projectModal || !projectModalImage) return;

  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  projectModalImage.src = "";
}

projectPreviewButtons.forEach((button) => {
  button.addEventListener("click", () => openProjectModal(button));
});

projectModalClose?.addEventListener("click", closeProjectModal);
projectModal?.addEventListener("click", (event) => {
  if (event.target === projectModal) closeProjectModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectModal?.classList.contains("open")) {
    closeProjectModal();
  }
});
