(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brand = document.querySelector('header h1, h1');
  if (brand) {
    const phrase = 'Ghetto Hustler Clothing';
    brand.setAttribute('aria-label', phrase);
    brand.innerHTML = '<span class="typing-brand" aria-hidden="true"></span><span class="typing-cursor" aria-hidden="true">|</span>';
    const output = brand.querySelector('.typing-brand');
    const cursor = brand.querySelector('.typing-cursor');
    const colors = ['#19d66b', '#ffffff', '#f13b4b'];
    if (reduceMotion) {
      [...phrase].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.color = colors[i % colors.length];
        output.appendChild(span);
      });
      cursor.hidden = true;
    } else {
      let index = 0;
      function typeNext() {
        if (index >= phrase.length) return;
        const char = phrase[index];
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'typed-letter';
        span.style.color = colors[index % colors.length];
        output.appendChild(span);
        index++;
        window.setTimeout(typeNext, char === ' ' ? 170 : 105);
      }
      window.setTimeout(typeNext, 300);
    }
  }
  let ticking = false;
  function updateScrollColor() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = window.scrollY / maxScroll;
    const color = progress < 0.34 ? '#19d66b' : progress < 0.67 ? '#ffffff' : '#f13b4b';
    document.documentElement.style.setProperty('--scroll-accent', color);
    document.body.classList.toggle('has-scrolled', window.scrollY > 30);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollColor);
      ticking = true;
    }
  }, { passive: true });
  updateScrollColor();
})();
