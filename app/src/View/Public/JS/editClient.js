/**
 * Module d'édition de clients
 * Gère l'interface de modification des informations client
 * Inclut la gestion des logos, la validation et la sauvegarde
 */
import NotificationManager from './utils/notifications.js';
import FormValidator from './utils/formValidator.js';

document.addEventListener('DOMContentLoaded', function() {
	// Récupération des données client depuis sessionStorage
	const clientData = JSON.parse(sessionStorage.getItem('editClientData')) || null;
	
	if (clientData?.id) {
		loadClientData(clientData.id);
	}

	// Configuration des écouteurs d'événements
	setupEventListeners();
	setupLogoPreview();

	/**
	 * Configure tous les écouteurs d'événements de l'interface
	 */
	function setupEventListeners() {
		const backButton = document.querySelector('.pannel__edit-client-back-button');
		if (backButton) {
			backButton.addEventListener('click', function(e) {
				e.preventDefault();

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
				saveClientData();
			});
		}
	}

	/**
	 * Configure la prévisualisation et validation du logo
	 */
	function setupLogoPreview() {
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
				};
				reader.readAsDataURL(file);
			});
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

	/**
	 * Charge les données du client depuis l'API
	 * 
	 * @param {number} clientId - ID du client à charger
	 */
	function loadClientData(clientId) {
		console.log('Chargement des données pour le client ID: ' + clientId);

		const loadingNotif = NotificationManager.show('Chargement des données...', 'info', 0);

		fetch(API_URL + '/client/' + clientId, {
			method: 'GET',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				'Authorization': localStorage.getItem('user_authToken'),
				'User-ID': localStorage.getItem('user_id')
			}
		})
		.then(response => {
			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
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

			if (data && data.success && data.client) {
				populateForm(data.client);
			} else {
				console.error('Erreur lors du chargement des données client:', data.error || 'Données invalides');
				NotificationManager.error('Erreur lors du chargement des données client: ' + (data.error || 'Données invalides'));
			}
		})
		.catch(error => {
			NotificationManager.dismiss(loadingNotif);
			console.error('Erreur lors de la récupération des données client:', error);
			NotificationManager.error('Une erreur est survenue lors du chargement des données client.');
		});
	}

	/**
	 * Remplit le formulaire avec les données client récupérées
	 * 
	 * @param {Object} clientData - Données du client
	 */
	function populateForm(clientData) {
		document.getElementById('client-nom').value = clientData.NOMCLI || '';
		document.getElementById('client-prenom').value = clientData.PRENOMCLI || '';
		document.getElementById('client-adresse').value = clientData.ADRCLI1 || '';
		document.getElementById('client-adresse2').value = clientData.ADRCLI2 || '';
		document.getElementById('client-adresse3').value = clientData.ADRCLI3 || '';
		document.getElementById('client-ville').value = clientData.VILLECLI || '';
		document.getElementById('client-codepostal').value = clientData.CPCLI || '';
		document.getElementById('client-description').value = clientData.LIGNECONTACTCLI || '';

		const logoPreview = document.getElementById('logo-preview');
		if (logoPreview && clientData.LOGOCLI) {
			const img = document.createElement('img');

			if (clientData.LOGOCLI.startsWith('data:')) {
				img.src = clientData.LOGOCLI;
			} else {
				try {
					img.src = 'data:image/jpeg;base64,' + clientData.LOGOCLI;
				} catch (e) {
					console.error("Impossible d'afficher le logo:", e);
				}
			}

			img.style.height = 'auto';
			img.style.width = 'auto';
			img.style.maxHeight = '100%';
			img.style.maxWidth = '100%';
			img.style.objectFit = 'contain';
			img.style.display = 'block';
			img.alt = 'Logo du client';

			img.onerror = function() {
				logoPreview.innerHTML = '<div style="color:red">Erreur de chargement du logo</div>';
			};

			logoPreview.innerHTML = '';
			logoPreview.appendChild(img);
		}

		const titleElement = document.querySelector('.pannel__edit-client-title');
		if (titleElement && clientData.NOMCLI) {
			titleElement.textContent = 'Édition du client : ';

			const clientInfoContainer = document.createElement('div');
			clientInfoContainer.style.display = 'flex';
			clientInfoContainer.style.alignItems = 'center';
			clientInfoContainer.style.marginLeft = '5px';

			if (clientData.LOGOCLI) {
				const logoImg = document.createElement('img');

				if (clientData.LOGOCLI.startsWith('data:')) {
					logoImg.src = clientData.LOGOCLI;
				} else {
					logoImg.src = 'data:image/jpeg;base64,' + clientData.LOGOCLI;
				}

				logoImg.style.height = '40px';
				logoImg.style.borderRadius = '50%';
				logoImg.style.marginRight = '10px';
				logoImg.style.objectFit = 'contain';
				logoImg.style.border = '2px solid var(--color-element)';
				logoImg.alt = 'Logo du client';

				clientInfoContainer.appendChild(logoImg);
			}

			const nameSpan = document.createElement('span');
			nameSpan.textContent = clientData.NOMCLI + ' ' + clientData.PRENOMCLI;
			nameSpan.style.fontSize = '1.8rem';

			clientInfoContainer.appendChild(nameSpan);
			titleElement.appendChild(clientInfoContainer);

			titleElement.style.display = 'flex';
			titleElement.style.alignItems = 'center';

			function adaptTitleToScreenSize() {
				if (window.innerWidth <= 768) {
					clientInfoContainer.style.flexDirection = 'row';
					titleElement.style.flexDirection = 'column';
					titleElement.style.alignItems = 'flex-start';

					const logoImg = clientInfoContainer.querySelector('img');
					if (logoImg) {
						logoImg.style.height = '35px';
					}

					const nameSpan = clientInfoContainer.querySelector('span');
					if (nameSpan) {
						nameSpan.style.fontSize = '1.2rem';
					}
				} else {
					clientInfoContainer.style.flexDirection = 'row';
					titleElement.style.flexDirection = 'row';
					titleElement.style.alignItems = 'center';

					const logoImg = clientInfoContainer.querySelector('img');
					if (logoImg) {
						logoImg.style.height = '40px';
					}

					const nameSpan = clientInfoContainer.querySelector('span');
					if (nameSpan) {
						nameSpan.style.fontSize = '1.8rem';
						nameSpan.style.lineHeight = '32px';
					}
				}
			}
			
			adaptTitleToScreenSize();
			window.addEventListener('resize', adaptTitleToScreenSize);
		}
	}

	/**
	 * Valide et sauvegarde les données client modifiées
	 */
	function saveClientData() {
		const form = document.getElementById('editClientForm');

		const requiredFields = [
			{ id: 'client-nom', label: 'Nom' },
			{ id: 'client-prenom', label: 'Prénom' },
			{ id: 'client-adresse', label: 'Adresse' },
			{ id: 'client-ville', label: 'Ville' },
			{ id: 'client-codepostal', label: 'Code postal' }
		];

		const emptyFields = requiredFields.filter(field => {
			const element = document.getElementById(field.id);
			return !element || !element.value.trim();
		});

		if (emptyFields.length > 0) {
			const errorMessage = 'Veuillez remplir les champs obligatoires suivants : ' + 
				emptyFields.map(field => field.label).join(', ');
			NotificationManager.error(errorMessage);

			emptyFields.forEach(field => {
				const element = document.getElementById(field.id);
				if (element) {
					element.classList.add('form-control--error');
					element.addEventListener('input', function() {
						if (this.value.trim()) {
							this.classList.remove('form-control--error');
						}
					}, { once: true });
				}
			});

			return;
		}

		const validationResult = FormValidator.validateEditClientForm(form);
		if (!validationResult.isValid) {
			NotificationManager.error(validationResult.errors.join('<br>'));
			return;
		}

		const formData = new FormData(form);
		const clientId = clientData ? clientData.id : null;

		if (clientId) {
			formData.append('id', clientId);
			formData.append('_method', 'PUT');
		}

		const logoInput = document.getElementById('client-logo');
		const hasNewLogo = logoInput && logoInput.files.length > 0;

		if (hasNewLogo) {
			if (!formData.has('client-logo')) {
				formData.set('client-logo', logoInput.files[0]);
			}
		}

		if (!formData.has('client-nom')) formData.append('client-nom', document.getElementById('client-nom').value);
		if (!formData.has('client-prenom')) formData.append('client-prenom', document.getElementById('client-prenom').value);
		if (!formData.has('client-adresse')) formData.append('client-adresse', document.getElementById('client-adresse').value);
		if (!formData.has('client-adresse2')) formData.append('client-adresse2', document.getElementById('client-adresse2').value);
		if (!formData.has('client-adresse3')) formData.append('client-adresse3', document.getElementById('client-adresse3').value);
		if (!formData.has('client-ville')) formData.append('client-ville', document.getElementById('client-ville').value);
		if (!formData.has('client-codepostal')) formData.append('client-codepostal', document.getElementById('client-codepostal').value);
		if (!formData.has('client-description')) formData.append('client-description', document.getElementById('client-description').value);

		const loadingNotif = NotificationManager.show('Sauvegarde en cours...', 'info', 0);

		const fetchTimeout = hasNewLogo ? 30000 : 10000;
		
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);

		fetch(API_URL + '/client/' + clientId, {
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
			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
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

			if (data && data.success) {
				NotificationManager.success('Client sauvegardé avec succès!');

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
				NotificationManager.error('Erreur lors de la sauvegarde du client: ' + (data.error || 'Erreur inconnue'));
			}
		})
		.catch(error => {
			clearTimeout(timeoutId);
			NotificationManager.dismiss(loadingNotif);
			
			if (error.name === 'AbortError') {
				NotificationManager.error('Le temps de réponse du serveur est trop long. Vérifiez la taille du logo.');
			} else {
				console.error('Erreur lors de la sauvegarde des données client:', error);
				NotificationManager.error('Une erreur est survenue lors de la sauvegarde du client.');
			}
		});
	}
});
