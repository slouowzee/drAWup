import NotificationManager from './utils/notifications.js';
import FormValidator from './utils/formValidator.js';

document.addEventListener('DOMContentLoaded', function() {
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
			const maxSize = 2 * 1024 * 1024; // 2Mo
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

	function loadClientData(clientId) {
		console.log('Chargement des données pour le client ID: ' + clientId);

		const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
		const apiUrl = `${baseUrl.replace('/drawup_demo/drawup', '')}/drawup_demo/api_drawup/api/client/${clientId}`;

		// Afficher une notification de chargement
		const loadingNotif = NotificationManager.show('Chargement des données...', 'info', 0);

		fetch(apiUrl, {
			method: 'GET',
			credentials: 'include'
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

			console.log("Réponse de l'API :", data);

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

	// Fonction pour remplir le formulaire avec les données du client
	function populateForm(clientData) {
		document.getElementById('client-nom').value = clientData.NOMCLI || '';
		document.getElementById('client-prenom').value = clientData.PRENOMCLI || '';
		document.getElementById('client-adresse').value = clientData.ADRCLI || '';
		document.getElementById('client-ville').value = clientData.VILLECLI || '';
		document.getElementById('client-codepostal').value = clientData.CPCLI || '';
		document.getElementById('client-description').value = clientData.LIGNECONTACTCLI || '';

		// Afficher le logo actuel dans la prévisualisation
		const logoPreview = document.getElementById('logo-preview');
		if (logoPreview && clientData.LOGOCLI) {
			const img = document.createElement('img');
			img.src = clientData.LOGOCLI.startsWith('data:') ? 
				clientData.LOGOCLI : 
				'data:image/jpeg;base64,' + clientData.LOGOCLI;

			img.style.height = 'auto';
			img.style.width = 'auto';
			img.style.maxHeight = '100%';
			img.style.maxWidth = '100%';
			img.style.objectFit = 'contain';
			img.style.display = 'block';
			img.alt = 'Logo du client';

			logoPreview.innerHTML = '';
			logoPreview.appendChild(img);
		}

		// Mettre à jour le titre avec le nom du client
		const titleElement = document.querySelector('.pannel__edit-client-title');
		if (titleElement && clientData.NOMCLI) {
			titleElement.textContent = 'Édition du client : ';
			
			// Créer un conteneur flex pour le logo et le nom
			const clientInfoContainer = document.createElement('div');
			clientInfoContainer.style.display = 'flex';
			clientInfoContainer.style.alignItems = 'center';
			clientInfoContainer.style.marginLeft = '5px';
			
			// Créer un élément image pour le logo
			if (clientData.LOGOCLI) {
				const logoImg = document.createElement('img');
				logoImg.src = clientData.LOGOCLI.startsWith('data:') ? 
				clientData.LOGOCLI : 
				'data:image/jpeg;base64,' + clientData.LOGOCLI;

				logoImg.style.height = '40px';
				logoImg.style.borderRadius = '50%';
				logoImg.style.marginRight = '10px';
				logoImg.style.objectFit = 'contain';
				logoImg.style.border = '2px solid var(--color-element)';
				logoImg.alt = 'Logo du client';
				
				clientInfoContainer.appendChild(logoImg);
			}
			
			// Ajouter le nom du client
			const nameSpan = document.createElement('span');
			nameSpan.textContent = clientData.NOMCLI + ' ' + clientData.PRENOMCLI;
			nameSpan.style.fontSize = '1.8rem';
			
			clientInfoContainer.appendChild(nameSpan);
			titleElement.appendChild(clientInfoContainer);
			
			// Améliorer l'alignement du titre entier
			titleElement.style.display = 'flex';
			titleElement.style.alignItems = 'center';
			
			// Adapter l'affichage en fonction de la taille d'écran
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

	// Fonction pour sauvegarder les données du client
	function saveClientData() {
		const form = document.getElementById('editClientForm');

		// Valider le formulaire avant l'envoi
		const validationResult = FormValidator.validateEditClientForm(form);
		if (!validationResult.isValid) {
			NotificationManager.error(validationResult.errors.join('<br>'));
			return;
		}

		// Récupérer toutes les valeurs du formulaire
		const formData = new FormData(form);
		const clientId = clientData ? clientData.id : null;

		if (clientId) {
			formData.append('id', clientId);
			formData.append('_method', 'PUT');
		}

		// Supprimer temporairement le logo pour simplifier
		formData.delete('client-logo');
		
		// Lister toutes les données qui seront envoyées (debugging)
		console.log("=== DONNÉES ENVOYÉES ===");
		for (let pair of formData.entries()) {
			console.log(pair[0] + ': ' + pair[1]);
		}
		
		// Assurons-nous que les valeurs sont bien là
		if (!formData.has('client-nom')) formData.append('client-nom', document.getElementById('client-nom').value);
		if (!formData.has('client-prenom')) formData.append('client-prenom', document.getElementById('client-prenom').value);
		if (!formData.has('client-adresse')) formData.append('client-adresse', document.getElementById('client-adresse').value);
		if (!formData.has('client-ville')) formData.append('client-ville', document.getElementById('client-ville').value);
		if (!formData.has('client-codepostal')) formData.append('client-codepostal', document.getElementById('client-codepostal').value);
		if (!formData.has('client-description')) formData.append('client-description', document.getElementById('client-description').value);

		const loadingNotif = NotificationManager.show('Sauvegarde en cours...', 'info', 0);

		const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
		const apiUrl = `${baseUrl.replace('/drawup_demo/drawup', '')}/drawup_demo/api_drawup/api/client/${clientId}`;

		// Afficher l'URL pour le débogage
		console.log("Envoi vers: " + apiUrl);

		fetch(apiUrl, {
			method: 'POST', // Toujours utiliser POST, même pour les requêtes PUT simulées
			credentials: 'include',
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
			NotificationManager.dismiss(loadingNotif);

			console.log("Réponse de l'API :", data);

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
			NotificationManager.dismiss(loadingNotif);

			console.error('Erreur lors de la sauvegarde des données client:', error);
			NotificationManager.error('Une erreur est survenue lors de la sauvegarde du client.');
		});
	}
});
