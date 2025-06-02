// Gestion du panneau d'édition client

document.addEventListener('DOMContentLoaded', function() {
    // Référence aux éléments du DOM
    const closeButton = document.querySelector('.pannel__edit-client-close-button');
    const saveButton = document.querySelector('.pannel__edit-client-save-button');
    const editForm = document.querySelector('.pannel__edit-client-form');
    
    // Gestion de la fermeture du panneau
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            // Redirection vers la page précédente ou la liste des clients
            window.history.back();
            // Alternative: window.location.href = 'clientsList.php';
        });
    }
    
    // Gestion de l'envoi du formulaire
    if (saveButton && editForm) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Valider le formulaire avant envoi
            if (validateForm()) {
                // Création d'un objet FormData pour envoyer les données
                const formData = new FormData(editForm);
                
                // Exemple d'envoi via fetch API
                fetch('votre_url_api/client/update', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de la sauvegarde');
                    }
                    return response.json();
                })
                .then(data => {
                    // Traitement après succès
                    showNotification('Client enregistré avec succès!', 'success');
                    
                    // Redirection après un court délai
                    setTimeout(() => {
                        window.location.href = 'liste-clients'; // Rediriger vers la liste des clients
                    }, 1500);
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    showNotification('Erreur lors de l\'enregistrement. Veuillez réessayer.', 'error');
                });
            }
        });
    }
    
    // Prévisualisation de l'image logo téléchargée
    const logoInput = document.getElementById('client-logo');
    
    if (logoInput) {
        logoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                // Créer ou trouver l'élément de prévisualisation
                let previewContainer = document.querySelector('.logo-preview');
                if (!previewContainer) {
                    previewContainer = document.createElement('div');
                    previewContainer.className = 'logo-preview';
                    previewContainer.style.marginTop = '10px';
                    previewContainer.style.textAlign = 'center';
                    this.parentElement.appendChild(previewContainer);
                }
                
                reader.onload = function(e) {
                    previewContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Logo Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
                        <br><small>Aperçu du logo</small>
                    `;
                }
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Fonction de validation du formulaire
    function validateForm() {
        let isValid = true;
        const requiredFields = document.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                
                // Afficher un message d'erreur si ce n'est pas déjà fait
                let errorMsg = field.nextElementSibling;
                if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                    errorMsg = document.createElement('small');
                    errorMsg.className = 'error-message';
                    errorMsg.style.color = 'red';
                    errorMsg.textContent = 'Ce champ est requis';
                    field.parentNode.insertBefore(errorMsg, field.nextSibling);
                }
            } else {
                field.classList.remove('error');
                
                // Supprimer le message d'erreur s'il existe
                const errorMsg = field.nextElementSibling;
                if (errorMsg && errorMsg.classList.contains('error-message')) {
                    errorMsg.remove();
                }
            }
        });
        
        return isValid;
    }
    
    // Fonction pour afficher des notifications
    function showNotification(message, type) {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Styles de la notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '5px';
        notification.style.color = '#fff';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#4CAF50';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#F44336';
        }
        
        // Ajouter au DOM
        document.body.appendChild(notification);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
});
