/**
 * Utilitaire de gestion des notifications
 * Pour afficher des messages de succès, d'erreur, d'information ou d'avertissement
 */

const NotificationManager = {
    /**
     * Affiche une notification
     * @param {string} message - Le message à afficher
     * @param {string} type - Le type de notification ('success', 'error', 'warning', 'info')
     * @param {number} duration - Durée d'affichage en ms (par défaut 5000ms)
     * @return {HTMLElement} - L'élément notification créé
     */
    show: function(message, type = 'info', duration = 5000) {
        // Icônes selon le type
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        
        // Créer l'élément notification
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.setAttribute('role', 'alert');
        
        // Ajouter le contenu
        notification.innerHTML = `
            ${icons[type] || icons.info}
            <span>${message}</span>
            <button class="notification__close" aria-label="Fermer">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Ajouter au corps du document
        document.body.appendChild(notification);
        
        // Gérer la fermeture
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => {
            this.dismiss(notification);
        });
        
        // Auto-fermeture après la durée spécifiée
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(notification);
            }, duration);
        }
        
        return notification;
    },
    
    /**
     * Retire une notification avec animation
     * @param {HTMLElement} notification - L'élément notification à retirer
     */
    dismiss: function(notification) {
        notification.classList.add('hiding');
        
        // Supprimer après l'animation
        notification.addEventListener('animationend', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    },
    
    /**
     * Raccourcis pour les différents types de notifications
     */
    success: function(message, duration = 5000) {
        return this.show(message, 'success', duration);
    },
    
    error: function(message, duration = 7000) {
        return this.show(message, 'error', duration);
    },
    
    warning: function(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    },
    
    info: function(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
};

// Exporter le gestionnaire de notifications
export default NotificationManager;
