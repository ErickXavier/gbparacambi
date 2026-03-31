document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu elements
  const menuButton = document.querySelector(".mobile-menu-button");
  const navLinksContainer = document.querySelector(".nav-links");

  // Toggle the mobile menu when the menu button is clicked
  menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("active");
    navLinksContainer.classList.toggle("active");
    document.body.style.overflow = navLinksContainer.classList.contains(
      "active"
    )
      ? "hidden"
      : "";
  });

  // Select all <a> elements inside the nav links container
  const navLinks = navLinksContainer.querySelectorAll("a");

  // For each nav link, add a click event to toggle its active class
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Remove the active class from all links
      navLinks.forEach((lnk) => lnk.classList.remove("active"));

      // Add the active class to the clicked link
      link.classList.add("active");

      // Close the mobile menu (if open) and reset body overflow
      menuButton.classList.remove("active");
      navLinksContainer.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  /* Saving the name on localstorage for late retrieval */
  // Select the name input field
  var nameInput = document.querySelector('input[name="name"]');

  // Retrieve the stored name from localStorage, if it exists
  var savedName = localStorage.getItem("savedName");
  if (savedName) {
    nameInput.value = savedName;
  }

  // Add the onblur event to save the name when the field loses focus
  nameInput.addEventListener("blur", function () {
    localStorage.setItem("savedName", nameInput.value);
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


