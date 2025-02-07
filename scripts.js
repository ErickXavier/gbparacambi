document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');

    menuButton.addEventListener('click', () => {
        menuButton.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuButton.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
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
document.getElementById('contact-form').addEventListener('submit', function(event) {
event.preventDefault();
const name = this.name.value;
const message = this.message.value;
const whatsappLink = `https://wa.me/5521987864399?text=Bom%20dia,%20sou%20${encodeURIComponent(name)}.%20${encodeURIComponent(message)}`;
window.open(whatsappLink, '_blank');
});
