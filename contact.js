/*
   Ghetto Hustler Clothing - Contact page settings
   Add your real business details below before publishing the website.
   WhatsApp numbers must include the country code, without +, spaces or dashes.
*/
const contactDetails = {
    phone: "27835682049",
    email: "ghettohustlerclothingbrand@gmail.com",
    whatsapp: "27835682049",
};

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("contact-form-status");

function showContactDetails() {
    const phoneText = document.querySelector('[data-contact-value="phone"]');
    const emailText = document.querySelector('[data-contact-value="email"]');
    const phoneLink = document.querySelector('[data-contact-link="phone"]');
    const emailLink = document.querySelector('[data-contact-link="email"]');
    const whatsappLink = document.querySelector("[data-whatsapp-link]");

    if (contactDetails.phone) {
        phoneText.textContent = contactDetails.phone;
        phoneLink.href = `tel:${contactDetails.phone.replace(/[^+\d]/g, "")}`;
    } else {
        phoneLink.addEventListener("click", (event) => {
            event.preventDefault();
            alert("Add your business phone number near the top of contact.js first.");
        });
    }

    if (contactDetails.email) {
        emailText.textContent = contactDetails.email;
        emailLink.href = `mailto:${contactDetails.email}`;
    } else {
        emailLink.addEventListener("click", (event) => {
            event.preventDefault();
            alert("Add your business email address near the top of contact.js first.");
        });
    }

    whatsappLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (!contactDetails.whatsapp) {
            alert("Add your WhatsApp number near the top of contact.js first.");
            return;
        }
        window.open(`https://wa.me/${contactDetails.whatsapp}`, "_blank", "noopener,noreferrer");
    });

}

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
        return;
    }

    if (!contactDetails.whatsapp) {
        formStatus.textContent = "Your message is ready, but the business WhatsApp number must first be added in contact.js.";
        alert("Please add the business WhatsApp number near the top of contact.js so customers can send messages.");
        return;
    }

    const formData = new FormData(contactForm);
    const message = [
        "Hello Ghetto Hustler ClothingBrand,",
        "",
        `Name: ${formData.get("name")}`,
        `Email: ${formData.get("email")}`,
        `Phone: ${formData.get("phone") || "Not provided"}`,
        `Subject: ${formData.get("subject")}`,
        "",
        `Message: ${formData.get("message")}`
    ].join("\n");

    const whatsappUrl = `https://wa.me/${contactDetails.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    formStatus.textContent = "Your message has been prepared in WhatsApp. Please press Send there to deliver it.";
});

showContactDetails();
