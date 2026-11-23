(function () {
  const images = document.querySelectorAll('main img, .product-image img');
  if (!images.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Expanded product image');
  lightbox.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close enlarged image">&times;</button><img alt=""><p class="lightbox-caption"></p>';
  document.body.appendChild(lightbox);

  const largeImage = lightbox.querySelector('img');
  const caption = lightbox.querySelector('.lightbox-caption');
  const closeButton = lightbox.querySelector('.lightbox-close');
  let lastImage = null;

  function openImage(image) {
    lastImage = image;
    largeImage.src = image.currentSrc || image.src;
    largeImage.alt = image.alt || 'Enlarged clothing image';
    caption.textContent = image.alt || 'Ghetto Hustler Clothing';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }
  function closeImage() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    largeImage.removeAttribute('src');
    if (lastImage) lastImage.focus();
  }

  images.forEach(function (image) {
    image.classList.add('zoomable-image');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', 'View larger image: ' + (image.alt || 'clothing photo'));
    image.title = 'Click to view larger';
    image.addEventListener('click', function () { openImage(image); });
    image.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImage(image);
      }
    });
  });

  closeButton.addEventListener('click', closeImage);
  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeImage();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeImage();
  });
})();