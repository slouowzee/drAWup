import NotificationManager from './utils/notifications.js';
import FormValidator from './utils/formValidator.js';

document.addEventListener('DOMContentLoaded', function() {
    // Définir BASE_URL s'il n'est pas déjà défini
    if (typeof BASE_URL === 'undefined') {
        console.error('La constante BASE_URL n\'est pas définie. La redirection peut ne pas fonctionner correctement.');
        window.BASE_URL = '/drawup_demo/drawup';
    }

    // Récupérer les données du client depuis sessionStorage
    const clientData = sessionStorage.getItem('editClientData') 
        ? JSON.parse(sessionStorage.getItem('editClientData')) 
        : null;
    
    // Charger les données du client depuis l'API si un ID est disponible
    if (clientData && clientData.id) {
        loadClientData(clientData.id);
    }
    
    // Gestion du bouton retour
    const backButton = document.querySelector('.pannel__edit-client-back-button');
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
            saveClientData();
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

    // Ajouter la validation en temps réel sur les champs
    const form = document.getElementById('editClientForm');
    if (form) {
        // En mode édition, seul le code postal a besoin d'une validation spécifique
        // (s'il est rempli, il doit respecter le format)
        const codePostalInput = document.getElementById('client-codepostal');
        codePostalInput.addEventListener('blur', function() {
            if (this.value.trim() !== '' && !FormValidator.isPostalCode(this.value)) {
                this.classList.add('form-control--error');
                
                // Ajouter un message d'erreur si nécessaire
                let errorMsg = this.nextElementSibling;
                if (!errorMsg || !errorMsg.classList.contains('form-error-message')) {
                    errorMsg = document.createElement('span');
                    errorMsg.className = 'form-error-message';
                    errorMsg.textContent = 'Le code postal doit comporter exactement 5 chiffres.';
                    this.parentNode.insertBefore(errorMsg, this.nextSibling);
                }
            } else {
                this.classList.remove('form-control--error');
                
                // Supprimer le message d'erreur s'il existe
                const errorMsg = this.nextElementSibling;
                if (errorMsg && errorMsg.classList.contains('form-error-message')) {
                    errorMsg.parentNode.removeChild(errorMsg);
                }
            }
        });
    }
    
    // Fonction pour charger les données du client
    function loadClientData(clientId) {
        console.log('Chargement des données pour le client ID: ' + clientId);
        
        // Préparation de l'URL de l'API
        const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
        const apiUrl = `${baseUrl.replace('/drawup_demo/drawup', '')}/drawup_demo/api_drawup/api/client/${clientId}`;
        
        // Afficher une notification de chargement
        const loadingNotif = NotificationManager.show('Chargement des données...', 'info', 0);
        
        // Appel à l'API
        fetch(apiUrl, {
            method: 'GET',
            credentials: 'include' // Inclure les cookies dans la requête
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
                
                if (data && data.success && data.client) {
                    populateForm(data.client);
                } else {
                    console.error('Erreur lors du chargement des données client:', data.error || 'Données invalides');
                    NotificationManager.error('Erreur lors du chargement des données client: ' + (data.error || 'Données invalides'));
                }
            })
            .catch(error => {
                // Retirer la notification de chargement
                NotificationManager.dismiss(loadingNotif);
                
                console.error('Erreur lors de la récupération des données client:', error);
                NotificationManager.error('Une erreur est survenue lors du chargement des données client.');
            });
    }
    
    // Fonction pour remplir le formulaire avec les données du client
    function populateForm(clientData) {
        document.getElementById('client-nom').value = clientData.NOMCLI || '';
        document.getElementById('client-prenom').value = clientData.PRENOMCLI || '';
        document.getElementById('client-adresse').value = clientData.ADRCLI || '';
        document.getElementById('client-ville').value = clientData.VILLECLI || '';
        document.getElementById('client-codepostal').value = clientData.CPCLI || '';
        document.getElementById('client-description').value = clientData.LIGNECONTACTCLI || '';
        
        // Mettre à jour le titre avec le nom du client
        const titleElement = document.querySelector('.pannel__edit-client-title');
        if (titleElement && clientData.NOMCLI) {
            titleElement.textContent = 'Édition du client: ' + clientData.NOMCLI;
        }
    }
    
    // Fonction pour sauvegarder les données du client
    function saveClientData() {
        const form = document.getElementById('editClientForm');
        
        // Valider le formulaire avant l'envoi (en mode édition)
        const validationResult = FormValidator.validateEditClientForm(form);
        if (!validationResult.isValid) {
            // Afficher les erreurs
            NotificationManager.error(validationResult.errors.join('<br>'));
            return;
        }
        
        const formData = new FormData(form);
        const clientId = clientData ? clientData.id : null;
        
        if (clientId) {
            formData.append('id', clientId);
        }
        
        // Afficher une notification de chargement
        const loadingNotif = NotificationManager.show('Sauvegarde en cours...', 'info', 0);
        
        // Préparation de l'URL de l'API
        const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
        const apiUrl = `${baseUrl.replace('/drawup_demo/drawup', '')}/drawup_demo/api_drawup/api/client/${clientId}`;
        
        // Appel à l'API
        fetch(apiUrl, {
            method: 'PUT',
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
                NotificationManager.success('Client sauvegardé avec succès!');
                
                // Redirection avec animation après un court délai
                setTimeout(() => {
                    const contentSection = document.querySelector('.pannel__content');
                    if (contentSection) {
                        contentSection.classList.add('fade-out');
                        setTimeout(() => {
                            window.location.href = BASE_URL + '/pannel/client';
                        }, 300);
                    } else {
                        window.location.href = BASE_URL + '/pannel/client';
                    }
                }, 1000);
            } else {
                NotificationManager.error('Erreur lors de la sauvegarde du client: ' + (data.message || 'Erreur inconnue'));
            }
        })
        .catch(error => {
            // Retirer la notification de chargement
            NotificationManager.dismiss(loadingNotif);
            
            console.error('Erreur lors de la sauvegarde des données client:', error);
            NotificationManager.error('Une erreur est survenue lors de la sauvegarde du client.');
        });
    }
});
