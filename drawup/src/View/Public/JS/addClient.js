import NotificationManager from './utils/notifications.js';
import FormValidator from './utils/formValidator.js';

document.addEventListener('DOMContentLoaded', function() {
	if (typeof BASE_URL === 'undefined') {
		console.error('La constante BASE_URL n\'est pas définie. La redirection peut ne pas fonctionner correctement.');
		window.BASE_URL = '/drawup_demo/drawup';
	}

	const backButton = document.querySelector('.pannel__add-client-back-button');
	if (backButton) {
		backButton.addEventListener('click', function(e) {
			e.preventDefault();

			// Sauvegarder les données avant de quitter
			saveFormDataToLocalStorage();
			
			// Suppression de la notification lors de la sortie
			
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
				saveFormDataToLocalStorage();
			};
			reader.readAsDataURL(file);
		});
	}


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
					saveFormDataToLocalStorage();
					
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

		// Ajouter un écouteur pour le champ de description
		const descriptionField = document.getElementById('client-description');
		if (descriptionField) {
			descriptionField.addEventListener('blur', saveFormDataToLocalStorage);
		}

		// Restaurer les données sauvegardées au chargement de la page
		restoreFormDataFromLocalStorage();
	}


	// Récupération des données du formulaire + validation avant envoi, données envoyé sous FormData
	function saveNewClient() {
		const form = document.getElementById('addClientForm');

		const validationResult = FormValidator.validateAddClientForm(form);
		if (!validationResult.isValid) {
			NotificationManager.error(validationResult.errors.join('<br>'));
			return;
		}

		const formData = new FormData(form);

		// Récupérer les valeurs depuis les éléments du DOM pour s'assurer qu'elles sont correctes
		// et s'assurer que les noms des champs correspondent à ce que le serveur attend
		const nomInput = document.getElementById('client-nom');
		const prenomInput = document.getElementById('client-prenom');
		const adresseInput = document.getElementById('client-adresse');
		const villeInput = document.getElementById('client-ville');
		const codePostalInput = document.getElementById('client-codepostal');
		const descriptionInput = document.getElementById('client-description');
		const logoInput = document.getElementById('client-logo');

		// Remplacer les valeurs dans le FormData avec les valeurs trimées
		formData.set('client-nom', nomInput.value.trim());
		formData.set('client-prenom', prenomInput.value.trim());
		formData.set('client-adresse', adresseInput.value.trim());
		formData.set('client-ville', villeInput.value.trim());
		formData.set('client-codepostal', codePostalInput.value.trim());
		formData.set('client-description', descriptionInput.value.trim());

		// Gestion du logo - vérifier s'il y a un logo dans l'input file ou dans la prévisualisation
		if (logoInput && logoInput.files.length > 0) {
			formData.set('client-logo', logoInput.files[0]);
		} else {
			// Si pas de fichier sélectionné mais une prévisualisation existe (logo restauré)
			const logoPreview = document.getElementById('logo-preview');
			if (logoPreview && logoPreview.querySelector('img')) {
				// Convertir l'image restaurée en Blob pour l'envoyer à l'API
				fetch(logoPreview.querySelector('img').src)
					.then(res => res.blob())
					.then(blob => {
						// Créer un fichier à partir du blob
						const file = new File([blob], 'restored_logo.png', { type: 'image/png' });
						formData.set('client-logo', file);
						
						// Continuer avec l'envoi à l'API
						sendFormDataToAPI(formData);
					})
					.catch(error => {
						console.error('Erreur lors de la conversion du logo restauré:', error);
						// Si erreur lors de la conversion du logo, continuer sans logo
						sendFormDataToAPI(formData);
					});
				return; // Sortir de la fonction, l'appel API sera fait dans la promesse
			}
		}
		
		// Si pas de logo restauré ou fichier sélectionné, envoyer directement
		sendFormDataToAPI(formData);
	}
	
	// Fonction séparée pour l'envoi à l'API
	function sendFormDataToAPI(formData) {
		// Envoie des infos à l'API
		const loadingNotif = NotificationManager.show('Ajout du client en cours...', 'info', 0);

		const baseUrl = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : (BASE_URL || '');
		const apiUrl = `${baseUrl.replace('/drawup_demo/drawup', '')}/drawup_demo/api_drawup/api/client/add`;

		const hasLogo = formData.has('client-logo') && formData.get('client-logo').size > 0;
		const fetchTimeout = hasLogo ? 30000 : 10000;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);

		console.log("Envoi des données au serveur:", apiUrl);
		
		fetch(apiUrl, {
			method: 'POST',
			credentials: 'include',
			body: formData,
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

			if (data?.success) {
				NotificationManager.success('Client ajouté avec succès!');
				
				// Effacer les données du localStorage après un succès
				clearLocalStorageFormData();

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
	
	// Fonctions pour la sauvegarde et restauration des données du formulaire
	function saveFormDataToLocalStorage() {
		const formData = {
			'client-nom': document.getElementById('client-nom')?.value || '',
			'client-prenom': document.getElementById('client-prenom')?.value || '',
			'client-adresse': document.getElementById('client-adresse')?.value || '',
			'client-ville': document.getElementById('client-ville')?.value || '',
			'client-codepostal': document.getElementById('client-codepostal')?.value || '',
			'client-description': document.getElementById('client-description')?.value || '',
			'client-logo': '' // Sera rempli si une image est présente
		};
		
		// Récupérer le logo s'il est présent dans la prévisualisation
		const logoPreview = document.getElementById('logo-preview');
		if (logoPreview && logoPreview.querySelector('img')) {
			formData['client-logo'] = logoPreview.querySelector('img').src;
		}
		
		try {
			localStorage.setItem('addClientFormData', JSON.stringify(formData));
		} catch (error) {
			// En cas d'erreur (généralement dû à la taille du logo), essayer sans le logo
			console.error('Erreur lors de la sauvegarde complète des données du formulaire:', error);
			delete formData['client-logo'];
			try {
				localStorage.setItem('addClientFormData', JSON.stringify(formData));
				console.log('Données sauvegardées sans le logo (trop volumineux)');
			} catch (innerError) {
				console.error('Échec de sauvegarde des données même sans logo:', innerError);
			}
		}
	}
	
	function restoreFormDataFromLocalStorage() {
		try {
			const savedData = localStorage.getItem('addClientFormData');
			if (savedData) {
				const formData = JSON.parse(savedData);
				
				// Remplir le formulaire avec les données sauvegardées
				for (const key in formData) {
					// Traiter le logo séparément
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
					
					// Pour les autres champs
					const input = document.getElementById(key);
					if (input && formData[key]) {
						input.value = formData[key];
					}
				}
				
				// Afficher une notification informant que les données ont été restaurées (simplifiée)
				const hasData = Object.values(formData).some(val => val !== '');
				
				if (hasData) {
					NotificationManager.info('Vos données saisies précédemment ont été restaurées.');
				}
			}
		} catch (error) {
			console.error('Erreur lors de la restauration des données du formulaire:', error);
		}
	}
	
	function clearLocalStorageFormData() {
		try {
			localStorage.removeItem('addClientFormData');
		} catch (error) {
			console.error('Erreur lors de la suppression des données du formulaire:', error);
		}
	}
});