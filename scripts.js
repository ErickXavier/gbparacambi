document.addEventListener("DOMContentLoaded", () => {
  const navLinksContainer = document.querySelector("#nav-menu");
  const navLinks = navLinksContainer.querySelectorAll("a");

  // For each nav link, add a click event to toggle its active class
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Remove the active class from all links
      navLinks.forEach((lnk) => lnk.classList.remove("active"));

      // Add the active class to the clicked link
      link.classList.add("active");

      // Close the mobile menu (popover)
      if (navLinksContainer.matches(":popover-open")) {
        navLinksContainer.hidePopover();
      }
    });
  });

  // Automatically close the mobile popover if the user resizes to desktop width
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navLinksContainer.matches(":popover-open")) {
      navLinksContainer.hidePopover();
    }
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


