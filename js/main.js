document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = form.querySelector('input[type="email"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Sauvegarder le texte initial du bouton
  const initialBtnText = submitBtn.textContent.trim();

  // Création du loader SVG
  const loader = document.createElement('span');
  loader.setAttribute('aria-hidden', 'true');
  loader.style.display = 'none';
  loader.style.marginLeft = '0.5rem';
  loader.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" >
      <circle cx="12" cy="12" r="10" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="60" stroke-dashoffset="60">
        <animate attributeName="stroke-dashoffset" values="60;0" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>`;

  // Insérer le loader après le texte du bouton
  submitBtn.appendChild(loader);

  // Container pour feedback dynamique
  const feedbackContainer = document.createElement('div');
  feedbackContainer.setAttribute('aria-live', 'polite');
  feedbackContainer.className = 'mt-4 px-4 py-3 rounded text-center text-sm transition-opacity duration-300 opacity-0';
  form.appendChild(feedbackContainer);

  // Afficher message avec animation fade-in
  function showMessage(message, type = 'success') {
    feedbackContainer.textContent = message;
    feedbackContainer.className = `mt-4 px-4 py-3 rounded text-center text-sm transition-opacity duration-300 opacity-100 ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`;

    // Animation automatique disparition après 5s
    clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = setTimeout(() => {
      feedbackContainer.classList.remove('opacity-100');
      feedbackContainer.classList.add('opacity-0');
    }, 5000);
  }

  // Effacer message immédiatement
  function clearMessage() {
    clearTimeout(showMessage.timeoutId);
    feedbackContainer.textContent = '';
    feedbackContainer.className = 'mt-4 px-4 py-3 rounded text-center text-sm transition-opacity duration-300 opacity-0';
  }

  // Validation email simple
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Activer/désactiver bouton et loader
  function disableSubmit(disabled = true) {
    submitBtn.disabled = disabled;
    loader.style.display = disabled ? 'inline-block' : 'none';
    submitBtn.style.opacity = disabled ? 0.6 : 1;
    submitBtn.setAttribute('aria-busy', disabled ? 'true' : 'false');
  }

  // Gestion soumission form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const email = emailInput.value.trim();

    if (!email) {
      showMessage('Veuillez entrer votre adresse email.', 'error');
      emailInput.focus();
      emailInput.classList.add('border-red-500', 'ring-1', 'ring-red-500');
      return;
    }
    if (!isValidEmail(email)) {
      showMessage('Adresse email invalide.', 'error');
      emailInput.focus();
      emailInput.classList.add('border-red-500', 'ring-1', 'ring-red-500');
      return;
    }

    // Préparer la soumission
    disableSubmit(true);
    emailInput.classList.remove('border-red-500', 'ring-1', 'ring-red-500');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        let errorMsg = 'Erreur lors de l’envoi. Veuillez réessayer.';
        try {
          const errorData = await response.json();
          if (errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }

      showMessage('✅ Merci ! Vérifiez votre boîte mail pour confirmer.', 'success');
      form.reset();
    } catch (err) {
      showMessage(err.message || 'Une erreur est survenue.', 'error');
    } finally {
      disableSubmit(false);
    }
  });

  // Validation dynamique à la saisie
  emailInput.addEventListener('input', () => {
    clearMessage();
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      emailInput.classList.add('border-red-500', 'ring-1', 'ring-red-500');
    } else {
      emailInput.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
    }
  });

  // Accessibilité : désactiver animations si souhaité
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loader.remove();
  }

  // Debug mobile detection
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    console.log('✅ Mobile détecté');
  }
});
