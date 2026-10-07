const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navLinks.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  navLinks.classList.toggle("is-open", !isOpen);
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.querySelectorAll("a[href='#top']").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.querySelectorAll("[data-project]").forEach((link) => {
  link.addEventListener("click", () => {
    const projectSelect = document.querySelector("#contact-form [name='project']");
    const projectType = link.dataset.project;
    if (projectSelect && [...projectSelect.options].some((option) => option.value === projectType)) {
      projectSelect.value = projectType;
    }
  });
});

const projectSelect = document.querySelector("#contact-form [name='project']");
const requestedProject = new URLSearchParams(window.location.search).get("project");
if (projectSelect && requestedProject && [...projectSelect.options].some((option) => option.value === requestedProject)) {
  projectSelect.value = requestedProject;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelector("#year").textContent = new Date().getFullYear();

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    if (contactForm.action.startsWith("https://formspree.io/f/")) {
      if (contactForm.dataset.submitting === "true") return;

      const submitButton = contactForm.querySelector("button[type='submit']");
      const originalButtonContent = submitButton.innerHTML;
      contactForm.dataset.submitting = "true";
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      formStatus.textContent = "Sending your enquiry...";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`Formspree returned ${response.status}`);

        contactForm.reset();
        formStatus.textContent = "Thank you. Your enquiry has been sent successfully. We will get back to you soon.";
      } catch (error) {
        console.error("Contact form submission failed:", error);
        formStatus.textContent = "Something went wrong. Please try again.";
      } finally {
        delete contactForm.dataset.submitting;
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }

      return;
    }

    const formData = new FormData(contactForm);
    const subject = encodeURIComponent(`Architecture enquiry — ${formData.get("project")}`);
    const body = encodeURIComponent(
      `Name: ${formData.get("name")}\nEmail: ${formData.get("email")}\nPhone: ${formData.get("phone") || "Not provided"}\nProject type: ${formData.get("project")}\nEstimated budget: ${formData.get("budget") || "Not provided"}\nPreferred start: ${formData.get("timeframe") || "Not provided"}\n\n${formData.get("message")}`
    );
    formStatus.textContent = "Your email app will open with your enquiry ready to send.";
    window.location.href = `mailto:rygriggsarctec@gmail.com?subject=${subject}&body=${body}`;
  });
}
