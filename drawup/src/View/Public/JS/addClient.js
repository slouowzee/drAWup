import NotificationManager from './utils/notifications.js';
import FormValidator from './utils/formValidator.js';

document.addEventListener('DOMContentLoaded', function() {
    // Définir BASE_URL s'il n'est pas déjà défini
    if (typeof BASE_URL === 'undefined') {
        console.error('La constante BASE_URL n\'est pas définie. La redirection peut ne pas fonctionner correctement.');
        window.BASE_URL = '/drawup_demo/drawup';
    }
    
    // Gestion du bouton retour
    const backButton = document.querySelector('.pannel__add-client-back-button');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Animation de disparition
            const contentSection = document.querySelector('.pannel__content');
            if (contentSection) {
                contentSection.classList.add('fade-out');
                
                // Redirection après la fin de l'animation
                setTimeout(() => {
                    window.location.href = BASE_URL + '/pannel/client';
                }, 300);
            } else {
                // Redirection immédiate si pas d'animation possible
                window.location.href = BASE_URL + '/pannel/client';
            }
        });
    }
    
    // Gestion du bouton de sauvegarde
    const saveButton = document.getElementById('client-save');
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveNewClient();
        });
    }
    
    // Prévisualisation du logo
    const logoInput = document.getElementById('client-logo');
    const logoPreview = document.getElementById('logo-preview');
    
    if (logoInput && logoPreview) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (!file) {
                logoPreview.innerHTML = '';
                return;
            }
            
            // Vérifier le type de fichier
            const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
            if (!FormValidator.isFileTypeAllowed(file, acceptedTypes)) {
                NotificationManager.error('Format de fichier non supporté. Veuillez utiliser JPG, PNG, GIF ou SVG.');
                e.target.value = '';
                logoInput.classList.add('form-control--error');
                return;
            }
            
            // Vérifier la taille du fichier (max 2Mo)
            const maxSize = 2 * 1024 * 1024; // 2Mo en octets
            if (!FormValidator.isFileSizeAllowed(file, maxSize)) {
                NotificationManager.error('Le fichier est trop volumineux. La taille maximale est de 2Mo.');
                e.target.value = '';
                logoInput.classList.add('form-control--error');
                return;
            }
            
            // Retirer l'indication d'erreur si tout est correct
            logoInput.classList.remove('form-control--error');
            
            // Afficher l'aperçu
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                logoPreview.innerHTML = '';
                logoPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Ajouter la validation en temps réel sur les champs obligatoires
    const form = document.getElementById('addClientForm');
    if (form) {
        // Liste des champs obligatoires et leurs messages d'erreur
        const requiredFields = [
            { id: 'client-nom', message: 'Le nom du client est obligatoire.' },
            { id: 'client-prenom', message: 'Le prénom du client est obligatoire.' },
            { id: 'client-adresse', message: 'L\'adresse du client est obligatoire.' },
            { id: 'client-ville', message: 'La ville du client est obligatoire.' },
            { id: 'client-codepostal', message: 'Le code postal est obligatoire.' }
        ];
        
        // Appliquer la validation à tous les champs obligatoires
        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                input.addEventListener('blur', function() {
                    if (!FormValidator.isNotEmpty(this.value)) {
                        this.classList.add('form-control--error');
                        
                        // Ajouter un message d'erreur si nécessaire
                        let errorMsg = this.nextElementSibling;
                        if (!errorMsg || !errorMsg.classList.contains('form-error-message')) {
                            errorMsg = document.createElement('span');
                            errorMsg.className = 'form-error-message';
                            errorMsg.textContent = field.message;
                            this.parentNode.insertBefore(errorMsg, this.nextSibling);
                        }
                    } else {
                        this.classList.remove('form-control--error');
                        
                        // Supprimer le message d'erreur s'il existe
                        const errorMsg = this.nextElementSibling;
                        if (errorMsg && errorMsg.classList.contains('form-error-message')) {
                            errorMsg.parentNode.removeChild(errorMsg);
                        }
                        
                        // Validation supplémentaire pour le code postal
                        if (field.id === 'client-codepostal' && !FormValidator.isPostalCode(this.value)) {
                            this.classList.add('form-control--error');
                            
                            // Ajouter un message d'erreur pour le format du code postal
                            let formatErrorMsg = document.createElement('span');
                            formatErrorMsg.className = 'form-error-message';
                            formatErrorMsg.textContent = 'Le code postal doit comporter exactement 5 chiffres.';
                            this.parentNode.insertBefore(formatErrorMsg, this.nextSibling);
                        }
                    }
                });
            }
        });
    }
    
    // Fonction pour sauvegarder un nouveau client
    function saveNewClient() {
        const form = document.getElementById('addClientForm');
        
        // Valider le formulaire avant l'envoi (mode ajout, avec champs obligatoires)
        const validationResult = FormValidator.validateAddClientForm(form);
        if (!validationResult.isValid) {
            // Afficher les erreurs
            NotificationManager.error(validationResult.errors.join('<br>'));
            return;
        }
        
        const formData = new FormData(form);
        
        // Afficher une notification de chargement
        const loadingNotif = NotificationManager.show('Ajout en cours...', 'info', 0);
        
        // Préparation de l'URL de l'API
        const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
        const apiUrl = `${baseUrl.replace('/drawup_demo/drawup', '')}/drawup_demo/api_drawup/api/client`;
        
        // Appel à l'API
        fetch(apiUrl, {
            method: 'POST',
            credentials: 'include', // Inclure les cookies dans la requête
            body: formData
        })
        .then(response => {
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Réponse invalide : pas du JSON.");
            }
            return response.json();
        })
        .then(data => {
            // Retirer la notification de chargement
            NotificationManager.dismiss(loadingNotif);
            
            console.log("Réponse de l'API :", data);
            
            if (data && data.success) {
                // Afficher la notification de succès
                NotificationManager.success('Client ajouté avec succès!');
                
                // Redirection avec animation après un court délai
                setTimeout(() => {
                    redirectToClientList();
                }, 1000);
            } else {
                NotificationManager.error('Erreur lors de l\'ajout du client: ' + (data.message || 'Erreur inconnue'));
            }
        })
        .catch(error => {
            // Retirer la notification de chargement
            NotificationManager.dismiss(loadingNotif);
            
            console.error('Erreur lors de l\'ajout du client:', error);
            NotificationManager.error('Une erreur est survenue lors de l\'ajout du client.');
        });
    }
    
    // Fonction pour rediriger vers la liste des clients
    function redirectToClientList() {
        const contentSection = document.querySelector('.pannel__content');
        if (contentSection) {
            contentSection.classList.add('fade-out');
            
            setTimeout(() => {
                window.location.href = BASE_URL + '/pannel/client';
            }, 300);
        } else {
            window.location.href = BASE_URL + '/pannel/client';
        }
    }
});
