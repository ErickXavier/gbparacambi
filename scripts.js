document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".mobile-menu-button");
  const navLinks = document.querySelector(".nav-links");

  menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("active");
    navLinks.classList.toggle("active");
    document.body.style.overflow = navLinks.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close menu when clicking on a link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.classList.remove("active");
      navLinks.classList.remove("active");
      document.body.style.overflow = "";
    });
  });
});

// Efeito de sombra no header
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 0) {
    header.classList.add("shadow");
  } else {
    header.classList.remove("shadow");
  }
});

// Tratamento do formulário de contato
document
  .getElementById("contact-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const name = this.name.value;
    const message = this.message.value;
    const whatsappLink = `https://wa.me/5521987864399?text=Bom%20dia,%20sou%20${encodeURIComponent(
      name
    )}.%20${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  });

// slideshow animation
// Timing settings (in milliseconds)
const fadeInDuration = 4000; // duration for fade-in (4s)
const fadeOutDuration = 2400; // duration for fade-out (2.4s)
const totalCycle = 16000; // full cycle time per image (16s)
// The "hold" period after a transition is the remaining time:
const holdDuration = totalCycle - Math.max(fadeInDuration, fadeOutDuration);

// Select all images in the slideshow container
const container = document.querySelector(".kids-mission");
const images = container.querySelectorAll("img");
let currentIndex = 0;

// Set initial inline styles on images
images.forEach((img, idx) => {
  img.style.position = "absolute";
  img.style.top = "0";
  img.style.left = "0";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  img.style.opacity = "0";
  // Disable any CSS transitions so that JS controls the animation timing
  img.style.transition = "none";
});

// Show the first image immediately
images[currentIndex].style.opacity = "1";

/**
 * Fades out the current image while fading in the next image.
 */
function transitionImages() {
  const currentImage = images[currentIndex];
  // Calculate next image index (cycle back to start if at the end)
  const nextIndex = (currentIndex + 1) % images.length;
  const nextImage = images[nextIndex];

  // Ensure the next image is hidden before we start
  nextImage.style.opacity = "0";

  // Use requestAnimationFrame to animate both fade-out and fade-in concurrently.
  const duration = Math.max(fadeInDuration, fadeOutDuration);
  const startTime = performance.now();

  function animate() {
    const now = performance.now();
    const elapsed = now - startTime;
    // Calculate progress (clamped between 0 and 1)
    const progress = Math.min(elapsed / duration, 1);

    // Fade out current image over fadeOutDuration
    let fadeOutProgress = Math.min(elapsed / fadeOutDuration, 1);
    currentImage.style.opacity = 1 - fadeOutProgress;

    // Fade in next image over fadeInDuration
    let fadeInProgress = Math.min(elapsed / fadeInDuration, 1);
    nextImage.style.opacity = fadeInProgress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Transition finished. Update the current index.
      currentIndex = nextIndex;
      // Hold the current (now fully visible) image for the remaining time before transitioning again.
      setTimeout(transitionImages, holdDuration);
    }
  }

  requestAnimationFrame(animate);
}

// Start the slideshow after an initial hold period.
// This mimics the first image being fully visible for a bit before the first transition.
setTimeout(transitionImages, 4000);
