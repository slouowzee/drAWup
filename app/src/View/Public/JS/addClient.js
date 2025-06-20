/**
 * Module d'ajout de clients
 * Gère l'interface de création de nouveaux clients
 * Inclut la validation, la gestion des logos et la sauvegarde automatique
 */
import NotificationManager from './utils/notifications.js';
import FormValidator from './utils/formValidator.js';

document.addEventListener('DOMContentLoaded', function() {
	// Configuration des écouteurs d'événements principaux
	setupEventListeners();
	setupLogoPreview();
	setupFormValidation();

	/**
	 * Configure tous les écouteurs d'événements de l'interface
	 */
	function setupEventListeners() {
		const backButton = document.querySelector('.pannel__add-client-back-button');
		if (backButton) {
			backButton.addEventListener('click', function(e) {
				e.preventDefault();

				// Sauvegarder les données avant de quitter
				saveFormDataToSessionStorage();

				const contentSection = document.querySelector('.pannel__content');
				if (contentSection) {
					contentSection.classList.add('fade-out');

					setTimeout(() => {
						window.location.href = BASE_URL + '/pannel/client';
					}, 300);
				} else {
					window.location.href = BASE_URL + '/pannel/client';
				}
			});
		}

		const saveButton = document.getElementById('client-save');
		if (saveButton) {
			saveButton.addEventListener('click', function(e) {
				e.preventDefault();
				saveNewClient();
			});
		}
	}

	/**
	 * Configure la prévisualisation et validation du logo
	 */
	function setupLogoPreview() {
		const logoInput = document.getElementById('client-logo');
		const logoPreview = document.getElementById('logo-preview');

		// Prévisualisation du logo
		if (logoInput && logoPreview) {
			logoInput.addEventListener('change', function(e) {
				const file = e.target.files[0];

				if (!file) {
					logoPreview.innerHTML = '';
					return;
				}

				const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
				if (!FormValidator.isFileTypeAllowed(file, acceptedTypes)) {
					NotificationManager.error('Format de fichier non supporté. Veuillez utiliser JPG, PNG, GIF ou SVG.');
					e.target.value = '';
					logoInput.classList.add('form-control--error');
					return;
				}

				const maxSize = 2 * 1024 * 1024; // 2Mo
				if (!FormValidator.isFileSizeAllowed(file, maxSize)) {
					NotificationManager.error('Le fichier est trop volumineux. La taille maximale est de 2Mo.');
					e.target.value = '';
					logoInput.classList.add('form-control--error');
					return;
				}

				logoInput.classList.remove('form-control--error');
				
				const reader = new FileReader();
				reader.onload = function(event) {
					const img = document.createElement('img');
					img.src = event.target.result;
					logoPreview.innerHTML = '';
					logoPreview.appendChild(img);
					
					// Sauvegarder l'image après prévisualisation
					saveFormDataToSessionStorage();
				};
				reader.readAsDataURL(file);
			});
		}
	}

	/**
	 * Configure la validation temps réel des champs obligatoires
	 */
	function setupFormValidation() {
		// Check des champs obligatoires du formulaire
		const form = document.getElementById('addClientForm');
		if (form) {
			const requiredFields = [
				{ id: 'client-nom', message: 'Le nom du client est obligatoire.' },
				{ id: 'client-prenom', message: 'Le prénom du client est obligatoire.' },
				{ id: 'client-adresse', message: 'L\'adresse du client est obligatoire.' },
				{ id: 'client-ville', message: 'La ville du client est obligatoire.' },
				{ id: 'client-codepostal', message: 'Le code postal est obligatoire.' }
			];

			requiredFields.forEach(field => {
				const input = document.getElementById(field.id);
				if (input) {
					input.addEventListener('blur', function() {
						// Sauvegarde automatique après modification d'un champ
						saveFormDataToSessionStorage();

						if (!FormValidator.isNotEmpty(this.value)) {
							this.classList.add('form-control--error');

							let errorMsg = this.nextElementSibling;
							if (!errorMsg || !errorMsg.classList.contains('form-error-message')) {
								errorMsg = document.createElement('span');
								errorMsg.className = 'form-error-message';
								errorMsg.textContent = field.message;
								this.parentNode.insertBefore(errorMsg, this.nextSibling);
							}
						} else {
							this.classList.remove('form-control--error');

							const errorMsg = this.nextElementSibling;
							if (errorMsg && errorMsg.classList.contains('form-error-message')) {
								errorMsg.parentNode.removeChild(errorMsg);
							}
						}
					});
				}
			});

			const descriptionField = document.getElementById('client-description');
			if (descriptionField) {
				descriptionField.addEventListener('blur', saveFormDataToSessionStorage);
			}

			// Restaurer les données sauvegardées au chargement de la page
			restoreFormDataFromSessionStorage();
		}
	}

	/**
	 * Valide et prépare les données pour l'envoi à l'API
	 */
	function saveNewClient() {
		const form = document.getElementById('addClientForm');

		const validationResult = FormValidator.validateAddClientForm(form);
		if (!validationResult.isValid) {
			NotificationManager.error(validationResult.errors.join('<br>'));
			return;
		}

		const formData = new FormData(form);

		const nomInput = document.getElementById('client-nom');
		const prenomInput = document.getElementById('client-prenom');
		const adresseInput = document.getElementById('client-adresse');
		const adresse2Input = document.getElementById('client-adresse2');
		const adresse3Input = document.getElementById('client-adresse3');
		const villeInput = document.getElementById('client-ville');
		const codePostalInput = document.getElementById('client-codepostal');
		const descriptionInput = document.getElementById('client-description');
		const logoInput = document.getElementById('client-logo');

		// Debug des valeurs avant trimming
		console.log('Debug avant trimming:');
		console.log('adresse:', adresseInput?.value);
		console.log('adresse2:', adresse2Input?.value);
		console.log('adresse3:', adresse3Input?.value);

		// Remplacer les valeurs dans le FormData avec les valeurs trimées
		formData.set('client-nom', nomInput.value.trim());
		formData.set('client-prenom', prenomInput.value.trim());
		formData.set('client-adresse', adresseInput.value.trim());
		formData.set('client-adresse2', adresse2Input ? adresse2Input.value.trim() : '');
		formData.set('client-adresse3', adresse3Input ? adresse3Input.value.trim() : '');
		formData.set('client-ville', villeInput.value.trim());
		formData.set('client-codepostal', codePostalInput.value.trim());
		formData.set('client-description', descriptionInput.value.trim());

		// Debug des valeurs dans FormData
		console.log('Debug FormData:');
		for (let [key, value] of formData.entries()) {
			console.log(key + ':', value);
		}

		if (logoInput && logoInput.files.length > 0) {
			formData.set('client-logo', logoInput.files[0]);
		} else {
			const logoPreview = document.getElementById('logo-preview');
			if (logoPreview && logoPreview.querySelector('img')) {
				fetch(logoPreview.querySelector('img').src)
					.then(res => res.blob())
					.then(blob => {
						const file = new File([blob], 'restored_logo.png', { type: 'image/png' });
						formData.set('client-logo', file);
						
						sendFormDataToAPI(formData);
					})
					.catch(error => {
						console.error('Erreur lors de la conversion du logo restauré:', error);
						sendFormDataToAPI(formData);
					});
				return;
			}
		}
		
		sendFormDataToAPI(formData);
	}

	/**
	 * Envoie les données client à l'API avec gestion d'erreur
	 * 
	 * @param {FormData} formData - Données du formulaire à envoyer
	 */
	function sendFormDataToAPI(formData) {
		const loadingNotif = NotificationManager.show('Ajout du client en cours...', 'info', 0);

		const hasLogo = formData.has('client-logo') && formData.get('client-logo').size > 0;
		const fetchTimeout = hasLogo ? 30000 : 10000;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);

		fetch(API_URL + '/client/add', {
			method: 'POST',
			credentials: 'include',
			body: formData,
			headers: { 
				'User-ID': localStorage.getItem('user_id'),
				'Authorization': localStorage.getItem('user_authToken')
			},
			signal: controller.signal
		})
		.then(response => {
			clearTimeout(timeoutId);
			if (!response.ok) {
				throw new Error(`Erreur HTTP: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			NotificationManager.dismiss(loadingNotif);

			if (data?.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}

			if (data?.success) {
				NotificationManager.success('Client ajouté avec succès!');

				// Effacer les données du sessionStorage après un succès
				clearSessionStorageFormData();

				setTimeout(() => {
					redirectToClientList();
				}, 1000);
			} else {
				throw new Error(data?.error || 'Erreur inconnue');
			}
		})
		.catch(error => {
			clearTimeout(timeoutId);
			NotificationManager.dismiss(loadingNotif);

			console.error("Erreur lors de l'ajout:", error);

			if (error.name === 'AbortError') {
				NotificationManager.error('Le temps de réponse du serveur est trop long. Vérifiez le logo ou réessayez plus tard.');
			} else {
				NotificationManager.error('Erreur: ' + error.message);
			}
		});
	}

	/**
	 * Redirige vers la liste des clients avec animation
	 */
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

	/**
	 * Sauvegarde les données actuelles dans sessionStorage
	 */
	function saveFormDataToSessionStorage() {
		const formData = {
			'client-nom': document.getElementById('client-nom')?.value || '',
			'client-prenom': document.getElementById('client-prenom')?.value || '',
			'client-adresse': document.getElementById('client-adresse')?.value || '',
			'client-adresse2': document.getElementById('client-adresse2')?.value || '',
			'client-adresse3': document.getElementById('client-adresse3')?.value || '',
			'client-ville': document.getElementById('client-ville')?.value || '',
			'client-codepostal': document.getElementById('client-codepostal')?.value || '',
			'client-description': document.getElementById('client-description')?.value || '',
			'client-logo': ''
		};
		
		// Récupérer le logo s'il est présent dans la prévisualisation
		const logoPreview = document.getElementById('logo-preview');
		if (logoPreview && logoPreview.querySelector('img')) {
			formData['client-logo'] = logoPreview.querySelector('img').src;
		}
		
		try {
			sessionStorage.setItem('addClientFormData', JSON.stringify(formData));
		} catch (error) {
			console.error('Erreur lors de la sauvegarde complète des données du formulaire:', error);
			delete formData['client-logo'];
			try {
				sessionStorage.setItem('addClientFormData', JSON.stringify(formData));
				console.log('Données sauvegardées sans le logo (trop volumineux)');
			} catch (innerError) {
				console.error('Échec de sauvegarde des données même sans logo:', innerError);
			}
		}
	}

	/**
	 * Restaure les données sauvegardées depuis sessionStorage
	 */
	function restoreFormDataFromSessionStorage() {
		try {
			const savedData = sessionStorage.getItem('addClientFormData');
			if (savedData) {
				const formData = JSON.parse(savedData);
				
				// Remplir le formulaire avec les données sauvegardées
				for (const key in formData) {
					if (key === 'client-logo' && formData[key]) {
						const logoPreview = document.getElementById('logo-preview');
						if (logoPreview) {
							const img = document.createElement('img');
							img.src = formData[key];
							logoPreview.innerHTML = '';
							logoPreview.appendChild(img);
							continue;
						}
					}
					
					const input = document.getElementById(key);
					if (input && formData[key]) {
						input.value = formData[key];
					}
				}
			}
		} catch (error) {
			console.error('Erreur lors de la restauration des données du formulaire:', error);
		}
	}

	/**
	 * Supprime les données sauvegardées du sessionStorage
	 */
	function clearSessionStorageFormData() {
		try {
			sessionStorage.removeItem('addClientFormData');
		} catch (error) {
			console.error('Erreur lors de la suppression des données du formulaire:', error);
		}
	}

	/**
	 * Nettoie le localStorage lors de la déconnexion forcée
	 */
	function clearUserStorage() {
		localStorage.removeItem('user_id');
		localStorage.removeItem('user_name');
		localStorage.removeItem('user_email');
		localStorage.removeItem('user_valid');
		localStorage.removeItem('user_picture');
		localStorage.removeItem('user_authToken');
		sessionStorage.clear();
	}
});