// Animations pour le panneau client
document.addEventListener('DOMContentLoaded', () => {
    // Animation d'apparition au chargement
    const panelContent = document.querySelector('.pannel__content');
    if (panelContent) {
        // S'assurer que l'animation d'apparition se lance après un délai
        setTimeout(() => {
            panelContent.style.opacity = 1;
        }, 100);
    }

    // Gestion des animations pour les liens de navigation
    document.querySelectorAll('a:not(.pannel__content-add-button):not([target="_blank"])').forEach(link => {
        link.addEventListener('click', function(e) {
            // Ne pas déclencher pour les liens externes ou avec des attributs spécifiques
            if (this.getAttribute('href').startsWith('http') || 
                this.getAttribute('target') === '_blank' ||
                this.classList.contains('no-animation')) {
                return;
            }
            
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Animation de disparition
            panelContent.classList.add('fade-out');
            
            // Rediriger après la fin de l'animation
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });

    // Gérer le bouton retour pour l'animation
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Animation de disparition
            panelContent.classList.add('fade-out');
            
            // Retour en arrière après la fin de l'animation
            setTimeout(() => {
                window.history.back();
            }, 300);
        });
    }
});
