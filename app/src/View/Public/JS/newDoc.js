/**
 * @fileoverview Module de création de nouveaux documents Google Docs
 */

import NotificationManager from './utils/notifications.js';

document.addEventListener('DOMContentLoaded', function() {
	let clients = [];
	let articles = [];
	let users = [];
	let filteredArticles = [];
	let selectedArticles = [];
	let selectedUsers = [];
	let draggedElement = null;
	let draggedIndex = null;
	let validationErrors = {};
	
	let clientsLoaded = false;
	let articlesLoaded = false;
	let usersLoaded = false;

	initializeApp();

	function saveToSessionStorage() {
		const formData = {
			title: document.getElementById('doc-title')?.value || '',
			subtitle: document.getElementById('doc-subtitle')?.value || '',
			site: document.getElementById('doc-site')?.value || '',
			date: document.getElementById('doc-date')?.value || '',
			footer: document.getElementById('doc-footer')?.value || '',
			clientId: document.getElementById('client-select')?.value || '',
			selectedArticles: selectedArticles,
			selectedUsers: selectedUsers,
			sharing: {
				client: document.getElementById('share-client')?.checked || false,
				team: document.getElementById('share-team')?.checked || false,
				drive: document.getElementById('share-drive')?.checked || true,
				autoCreator: true
			},
			timestamp: Date.now()
		};

		sessionStorage.setItem('newDocFormData', JSON.stringify(formData));
	}

	async function initializeApp() {
		try {
			await loadClients();
			await loadArticles();
			await loadUsers();
			setupEventListeners();
			loadFromSessionStorage();
		} catch (error) {
			console.error('Erreur lors de l\'initialisation:', error);
		}
	}

	/**
	 * Configure tous les écouteurs d'événements de l'interface
	 * @returns {void}
	 */
	function setupEventListeners() {
		const inputs = ['doc-title', 'doc-subtitle', 'doc-site', 'doc-date', 'doc-footer'];
		inputs.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				element.addEventListener('input', () => {
					element.classList.remove('error');
					saveToSessionStorage();
					updateUI();
				});
			}
		});

		const selects = ['client-select'];
		selects.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				element.addEventListener('change', () => {
					element.classList.remove('error');
					saveToSessionStorage();
					updateUI();
				});
			}
		});

		const sharingInputs = ['share-client', 'share-team', 'share-drive'];
		sharingInputs.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				element.addEventListener('change', () => {
					saveToSessionStorage();
				});
			}
		});

		const clientSelect = document.getElementById('client-select');
		if (clientSelect) {
			clientSelect.addEventListener('change', () => {
				clientSelect.classList.remove('error');
				saveToSessionStorage();
				updateUI();
			});
		}

		const searchInput = document.getElementById('articles-search');
		if (searchInput) {
			let searchTimeout;
			searchInput.addEventListener('input', function() {
				clearTimeout(searchTimeout);
				searchTimeout = setTimeout(() => {
					filterArticles(this.value.trim());
				}, 300);
			});
		}

		document.getElementById('clear-selection')?.addEventListener('click', clearSelection);
		document.getElementById('preview-doc')?.addEventListener('click', (e) => {
			e.preventDefault();
		});
		document.getElementById('generate-document')?.addEventListener('click', (e) => {
			e.preventDefault();
			generateDocumentData();
			generateDocument();
		});
	}

	/**
	 * Charge la liste des utilisateurs depuis l'API
	 * @returns {Promise<void>}
	 */
	async function loadUsers() {
		if (usersLoaded) return;
		
		const loadingEl = document.getElementById('users-loading');
		
		if (loadingEl) loadingEl.classList.add('show');

		try {
			const response = await fetch(API_URL + '/user/all', {
				method: 'GET',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'User-ID': localStorage.getItem('user_id'),
					'Authorization': localStorage.getItem('user_authToken')
				}
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
			}

			const data = await response.json();
			console.log("📥 Réponse de l'API :", data);

			if (response.status === 403 && data.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}

			if (response.status === 401 && (data.error === "Token invalide ou expiré" || data.error === "Unauthorized")) {
				clearUserStorage();
				window.location.href = BASE_URL + '/';
				return;
			}

			if (!response.ok) {
				throw new Error(`Erreur HTTP: ${response.status} - ${data.error || 'Erreur inconnue'}`);
			}

			if (data.success && data.users) {
				users = data.users || [];
				const currentUserId = localStorage.getItem('user_id');
				users = users.filter(user => user.id != currentUserId && user.valid == 1);
				
				const currentUser = {
					id: currentUserId,
					name: localStorage.getItem('user_name'),
					email: localStorage.getItem('user_email'),
					picture: localStorage.getItem('user_picture'),
					valid: true
				};
				selectedUsers.push(currentUser);
				
				displayUsers(users);
				updateSelectedUsersDisplay();
				usersLoaded = true;
			} else {
				throw new Error(data.error || 'Erreur lors du chargement des utilisateurs');
			}

		} catch (error) {
			console.error('❌ Erreur lors du chargement des utilisateurs:', error);
			NotificationManager.error('Erreur lors du chargement des utilisateurs: ' + error.message);
			showEmptyUsers();
		} finally {
			if (loadingEl) loadingEl.classList.remove('show');
		}
	}

	/**
	 * Affiche la liste des utilisateurs dans l'interface
	 * @param {Array} usersList - Liste des utilisateurs à afficher
	 * @returns {void}
	 */
	function displayUsers(usersList) {
		const container = document.getElementById('available-users');
		const template = document.getElementById('user-item-template');
		
		if (!container || !template) return;

		container.innerHTML = '';

		const currentUser = {
			id: localStorage.getItem('user_id'),
			name: localStorage.getItem('user_name'),
			email: localStorage.getItem('user_email'),
			picture: localStorage.getItem('user_picture'),
			valid: true,
			isCurrentUser: true
		};

		const allUsers = [currentUser, ...usersList];

		if (allUsers.length === 0) {
			showEmptyUsers();
			return;
		}

		const fragment = document.createDocumentFragment();

		allUsers.forEach(user => {
			const clone = document.importNode(template.content, true);
			
			const listItem = clone.querySelector('.newdoc__user-list-item');
			if (listItem && user.isCurrentUser) {
				listItem.style.opacity = '0.7';
				listItem.style.backgroundColor = 'var(--color-element-blur)';
			}
			
			const nameEl = clone.querySelector('.newdoc__user-name');
			if (nameEl) {
				nameEl.textContent = user.isCurrentUser 
					? `${user.name || 'Nom non disponible'} (Vous)` 
					: user.name || 'Nom non disponible';
			}

			const emailEl = clone.querySelector('.newdoc__user-email');
			if (emailEl) {
				emailEl.textContent = user.email || 'Email non disponible';
			}

			const pictureEl = clone.querySelector('.newdoc__user-picture');
			if (pictureEl) {
				if (user.picture) {
					pictureEl.src = user.picture;
					pictureEl.style.display = 'block';
				} else {
					pictureEl.style.display = 'none';
				}
			}

			const initialsEl = clone.querySelector('.newdoc__user-initials');
			if (initialsEl) {
				if (!user.picture) {
					const initials = (user.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
					initialsEl.textContent = initials;
					initialsEl.style.display = 'flex';
				} else {
					initialsEl.style.display = 'none';
				}
			}

			const checkboxEl = clone.querySelector('.newdoc__user-checkbox');
			if (checkboxEl) {
				checkboxEl.setAttribute('data-user-id', user.id);
				
				if (user.isCurrentUser) {
					checkboxEl.checked = true;
					checkboxEl.disabled = true;
					checkboxEl.title = 'Partage automatique avec vous-même';
				} else {
					const isSelected = selectedUsers.some(selectedUser => selectedUser.id == user.id);
					checkboxEl.checked = isSelected;
					
					const toggleUserSelection = () => {
						if (checkboxEl.checked) {
							addUserToSelection(user);
						} else {
							removeUserFromSelectionById(user.id);
						}
					};
					
					checkboxEl.addEventListener('change', (e) => {
						e.stopPropagation();
						toggleUserSelection();
					});
					
					if (listItem) {
						listItem.style.cursor = 'pointer';
						listItem.addEventListener('click', (e) => {
							if (e.target === checkboxEl) return;
							
							checkboxEl.checked = !checkboxEl.checked;
							toggleUserSelection();
						});
					}
				}
			}

			fragment.appendChild(clone);
		});

		container.appendChild(fragment);
		
		const savedData = sessionStorage.getItem('newDocFormData');
		if (savedData) {
			try {
				const formData = JSON.parse(savedData);
				if (formData.selectedUsers) {
					formData.selectedUsers.forEach(selectedUser => {
						const checkbox = container.querySelector(`input[data-user-id="${selectedUser.id}"]`);
						if (checkbox && !selectedUser.isCurrentUser) {
							checkbox.checked = true;
						}
					});
				}
			} catch (error) {
				console.error('Erreur lors de la restauration des états des checkboxes:', error);
			}
		}
	}

	/**
	 * Ajoute un utilisateur à la sélection de partage
	 * @param {Object} user - Utilisateur à ajouter
	 * @returns {void}
	 */
	function addUserToSelection(user) {
		const isAlreadySelected = selectedUsers.some(selectedUser => selectedUser.id == user.id);
		if (isAlreadySelected) {
			return;
		}

		selectedUsers.push(user);
		updateSelectedUsersDisplay();
		saveToSessionStorage();
		NotificationManager.success(`Utilisateur "${user.name}" ajouté au partage`);
	}

	/**
	 * Retire un utilisateur de la sélection de partage
	 * @param {string} userId - ID de l'utilisateur à retirer
	 * @returns {void}
	 */
	function removeUserFromSelectionById(userId) {
		const userIndex = selectedUsers.findIndex(user => user.id == userId);
		if (userIndex !== -1) {
			const user = selectedUsers[userIndex];
			selectedUsers.splice(userIndex, 1);
			updateSelectedUsersDisplay();
			saveToSessionStorage();
			NotificationManager.info(`Utilisateur "${user.name}" retiré du partage`);
		}
		
		const checkbox = document.querySelector(`input[data-user-id="${userId}"]`);
		if (checkbox) {
			checkbox.checked = false;
		}
	}

	/**
	 * Met à jour l'affichage des utilisateurs sélectionnés
	 * @returns {void}
	 */
	function updateSelectedUsersDisplay() {
		// Fonction de base pour maintenir la cohérence des états
	}

	/**
	 * Charge les données sauvegardées depuis sessionStorage
	 * @returns {void}
	 */
	function loadFromSessionStorage() {
		try {
			const savedData = sessionStorage.getItem('newDocFormData');
			if (savedData) {
				const formData = JSON.parse(savedData);
				
				const oneHour = 60 * 60 * 1000;
				if (Date.now() - formData.timestamp < oneHour) {
					const fieldMappings = [
						{ id: 'doc-title', value: formData.title },
						{ id: 'doc-subtitle', value: formData.subtitle },
						{ id: 'doc-site', value: formData.site },
						{ id: 'doc-date', value: formData.date },
						{ id: 'doc-footer', value: formData.footer }
					];

					fieldMappings.forEach(field => {
						if (field.value) {
							const element = document.getElementById(field.id);
							if (element) element.value = field.value;
						}
					});

					if (formData.sharing) {
						const shareClient = document.getElementById('share-client');
						const shareTeam = document.getElementById('share-team');
						const shareDrive = document.getElementById('share-drive');
						
						if (shareClient) shareClient.checked = formData.sharing.client;
						if (shareTeam) shareTeam.checked = formData.sharing.team;
						if (shareDrive) shareDrive.checked = formData.sharing.drive;
					}
					
					if (formData.clientId && clientsLoaded) {
						const clientSelect = document.getElementById('client-select');
						if (clientSelect) {
							clientSelect.value = formData.clientId;
						}
					}
					
					if (formData.selectedArticles && formData.selectedArticles.length > 0 && articlesLoaded) {
						selectedArticles = formData.selectedArticles;
						updateSelectedArticlesDisplay();
					}
					
					if (formData.selectedUsers && formData.selectedUsers.length > 0) {
						const currentUserId = localStorage.getItem('user_id');
						selectedUsers = formData.selectedUsers.filter(user => {
							return true;
						});
						
						const hasCurrentUser = selectedUsers.some(user => user.id == currentUserId);
						if (!hasCurrentUser) {
							const currentUser = {
								id: currentUserId,
								name: localStorage.getItem('user_name'),
								email: localStorage.getItem('user_email'),
								picture: localStorage.getItem('user_picture'),
								valid: true,
								isCurrentUser: true
							};
							selectedUsers.unshift(currentUser);
						}
						
						updateSelectedUsersDisplay();
						
						if (usersLoaded) {
							setTimeout(() => {
								selectedUsers.forEach(selectedUser => {
									const checkbox = document.querySelector(`input[type="checkbox"][data-user-id="${selectedUser.id}"]`);
									if (checkbox && !selectedUser.isCurrentUser) {
										checkbox.checked = true;
									}
								});
							}, 100);
						}
					}
					
					updateUI();
					NotificationManager.info('Données du formulaire restaurées');
				} else {
					sessionStorage.removeItem('newDocFormData');
				}
			}
		} catch (error) {
			console.error('Erreur lors de la restauration des données:', error);
			sessionStorage.removeItem('newDocFormData');
		}
	}

	/**
	 * Charge la liste des clients depuis l'API
	 * @returns {Promise<void>}
	 */
	async function loadClients() {
		if (clientsLoaded) return;
		
		const loadingEl = document.getElementById('clients-loading');
		
		if (loadingEl) {
			loadingEl.style.display = 'flex';
			loadingEl.classList.add('show');
		}

		try {
			const response = await fetch(API_URL + '/client/all', {
				method: 'GET',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'User-ID': localStorage.getItem('user_id'),
					'Authorization': localStorage.getItem('user_authToken')
				}
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
			}

			const data = await response.json();
			console.log("📥 Réponse de l'API :", data);

			if (response.status === 403 && data.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}

			if (response.status === 401 && (data.error === "Token invalide ou expiré" || data.error === "Unauthorized")) {
				clearUserStorage();
				window.location.href = BASE_URL + '/';
				return;
			}

			if (!response.ok) {
				throw new Error(`Erreur HTTP: ${response.status} - ${data.error || 'Erreur inconnue'}`);
			}

			if (data.success) {
				clients = data.clients || [];
				populateClientSelect(clients);
				clientsLoaded = true;
			} else {
				throw new Error(data.error || 'Erreur lors du chargement des clients');
			}
		} catch (error) {
			console.error('❌ Erreur lors du chargement des clients:', error);
			NotificationManager.error('Erreur lors du chargement des clients: ' + error.message);
		} finally {
			if (loadingEl) {
				loadingEl.style.display = 'none';
				loadingEl.classList.remove('show');
			}
		}
	}

	/**
	 * Peuple le select des clients avec les données reçues
	 * @param {Array} clientsList - Liste des clients
	 * @returns {void}
	 */
	function populateClientSelect(clientsList) {
		const selectEl = document.getElementById('client-select');
		if (!selectEl) return;

		selectEl.innerHTML = '<option value="">Sélectionnez un client...</option>';

		if (!clientsList || clientsList.length === 0) {
			return;
		}

		clientsList.forEach(client => {
			const option = document.createElement('option');
			option.value = client.IDCLI;
			
			const nom = client.NOMCLI || '';
			const prenom = client.PRENOMCLI || '';
			
			let nomComplet = '';
			if (nom && prenom) {
				nomComplet = `${nom} ${prenom}`;
			} else if (nom) {
				nomComplet = nom;
			} else if (prenom) {
				nomComplet = prenom;
			} else {
				nomComplet = `Client #${client.IDCLI}`;
			}
			
			option.textContent = nomComplet;
			
			const clientData = {
				id: client.IDCLI,
				nom: nom,
				prenom: prenom,
				nomComplet: nomComplet,
				email: extractEmailFromContact(client.LIGNECONTACTCLI),
				contact: client.LIGNECONTACTCLI || '',
				adresse: `${client.ADRCLI1 || ''} ${client.ADRCLI2 || ''}`.trim(),
				ville: client.VILLECLI || '',
				cp: client.CPCLI || '',
				logo: client.LOGOCLI || ''
			};
			
			option.dataset.clientData = JSON.stringify(clientData);
			selectEl.appendChild(option);
		});
	}

	/**
	 * Extrait l'email depuis la ligne de contact du client
	 * @param {string} contactLine - Ligne de contact contenant potentiellement un email
	 * @returns {string} Email extrait ou chaîne vide
	 */
	function extractEmailFromContact(contactLine) {
		if (!contactLine) return '';
		
		const emailMatch = contactLine.match(/[\w.-]+@[\w.-]+\.\w+/);
		return emailMatch ? emailMatch[0] : '';
	}

	/**
	 * Charge la liste des articles depuis l'API
	 * @returns {Promise<void>}
	 */
	async function loadArticles() {
		if (articlesLoaded) return;
		
		const loadingEl = document.getElementById('articles-loading');
		
		if (loadingEl) loadingEl.classList.add('show');

		try {
			const response = await fetch(API_URL + '/article/all', {
				method: 'GET',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'User-ID': localStorage.getItem('user_id'),
					'Authorization': localStorage.getItem('user_authToken')
				}
			});

			if (!response.ok) {
				if (response.status === 404) {
					articles = [];
					filteredArticles = [];
					showEmptyArticles();
					articlesLoaded = true;
					return;
				}
			}

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
			}

			const data = await response.json();
			console.log("📥 Réponse de l'API :", data);

			if (response.status === 403 && data.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}

			if (response.status === 401 && (data.error === "Token invalide ou expiré" || data.error === "Unauthorized")) {
				clearUserStorage();
				window.location.href = BASE_URL + '/';
				return;
			}

			if (!response.ok) {
				throw new Error(`Erreur HTTP: ${response.status} - ${data.error || 'Erreur inconnue'}`);
			}

			if (data.success) {
				articles = data.articles || [];
				filteredArticles = [...articles];
				displayArticles(filteredArticles);
				articlesLoaded = true;
			} else {
				throw new Error(data.error || 'Erreur lors du chargement des articles');
			}
		} catch (error) {
			console.error('❌ Erreur lors du chargement des articles:', error);
			showEmptyArticles();
		} finally {
			if (loadingEl) loadingEl.classList.remove('show');
		}
	}

	/**
	 * Filtre les articles selon le terme de recherche
	 * @param {string} searchTerm - Terme de recherche
	 * @returns {void}
	 */
	function filterArticles(searchTerm) {
		if (searchTerm.length === 0) {
			filteredArticles = [...articles];
		} else {
			filteredArticles = articles.filter(article => {
				const title = (article.TITREARTICLE || '').toLowerCase();
				const description = (article.DESCARTICLE || '').toLowerCase();
				const term = searchTerm.toLowerCase();
				
				return title.includes(term) || description.includes(term);
			});
		}

		displayArticles(filteredArticles);
	}

	/**
	 * Affiche la liste des articles disponibles
	 * @param {Array} articlesList - Liste des articles à afficher
	 * @returns {void}
	 */
	function displayArticles(articlesList) {
		const container = document.getElementById('available-articles');
		const template = document.getElementById('article-item-template');
		
		if (!container || !template) return;

		container.innerHTML = '';

		if (!articlesList || articlesList.length === 0) {
			showEmptyArticles();
			return;
		}

		const fragment = document.createDocumentFragment();

		articlesList.forEach(article => {
			const clone = document.importNode(template.content, true);
			
			const titleEl = clone.querySelector('.newdoc__article-title');
			if (titleEl) {
				titleEl.textContent = article.TITREARTICLE || 'Titre non disponible';
			}

			const priceEl = clone.querySelector('.newdoc__price-value');
			if (priceEl) {
				const price = parseFloat(article.PRIXHT || 0);
				priceEl.textContent = price.toFixed(2);
			}

			const descEl = clone.querySelector('.newdoc__article-description');
			if (descEl) {
				const description = article.DESCARTICLE || 'Aucune description disponible';
				descEl.textContent = description.length > 80 ? description.substring(0, 80) + '...' : description;
			}

			const taxEl = clone.querySelector('.newdoc__article-tax');
			if (taxEl) {
				taxEl.textContent = article.POURCENTTAXE ? `TVA ${article.POURCENTTAXE}%` : 'TVA non définie';
			}

			const periodEl = clone.querySelector('.newdoc__article-period');
			if (periodEl) {
				periodEl.textContent = article.LABELPERIODICITE || 'Période non définie';
			}

			const addBtn = clone.querySelector('.newdoc__article-add-btn');
			if (addBtn) {
				addBtn.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					addArticleToSelection(article);
				});
			}

			const itemEl = clone.querySelector('.newdoc__article-item');
			if (itemEl) {
				itemEl.dataset.articleId = article.id;
				setupArticleDragAndDrop(itemEl, article);
			}

			fragment.appendChild(clone);
		});

		container.appendChild(fragment);
	}

	/**
	 * Affiche un message quand aucun article n'est disponible
	 * @returns {void}
	 */
	function showEmptyArticles() {
		const container = document.getElementById('available-articles');
		if (!container) return;

		container.innerHTML = `
			<div class="newdoc__empty-state">
				<i class="fas fa-inbox"></i>
				<p>Aucun article disponible</p>
				<small>Créez des articles pour les utiliser dans vos documents</small>
			</div>
		`;
	}

	/**
	 * Configure le drag & drop pour un élément article
	 * @param {HTMLElement} element - Élément HTML de l'article
	 * @param {Object} article - Données de l'article
	 * @returns {void}
	 */
	function setupArticleDragAndDrop(element, article) {
		element.addEventListener('dragstart', function(e) {
			draggedElement = { type: 'article', data: article };
			element.classList.add('dragging');
			e.dataTransfer.effectAllowed = 'copy';
		});

		element.addEventListener('dragend', function() {
			element.classList.remove('dragging');
			draggedElement = null;
		});
	}

	/**
	 * Configure la zone de drop pour les articles sélectionnés
	 * @returns {void}
	 */
	function setupSelectedAreaDropZone() {
		const container = document.getElementById('selected-articles');
		if (!container) return;

		container.addEventListener('dragover', function(e) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			container.classList.add('drag-over');
		});

		container.addEventListener('dragleave', function(e) {
			if (!container.contains(e.relatedTarget)) {
				container.classList.remove('drag-over');
			}
		});

		container.addEventListener('drop', function(e) {
			e.preventDefault();
			container.classList.remove('drag-over');

			if (draggedElement && draggedElement.type === 'article') {
				addArticleToSelection(draggedElement.data);
			}
		});
	}

	/**
	 * Ajoute un article à la sélection
	 * @param {Object} article - Article à ajouter
	 * @returns {void}
	 */
	function addArticleToSelection(article) {
		const articleWithOption = {
			...article,
			isOption: false
		};
		selectedArticles.push(articleWithOption);
		updateSelectedArticlesDisplay();
		updateUI();
		saveToSessionStorage();
		NotificationManager.success(`Article "${article.TITREARTICLE}" ajouté`);
	}

	/**
	 * Supprime un article de la sélection
	 * @param {number} index - Index de l'article dans la sélection
	 * @returns {void}
	 */
	function removeArticleFromSelection(index) {
		const article = selectedArticles[index];
		selectedArticles.splice(index, 1);
		updateSelectedArticlesDisplay();
		updateUI();
		saveToSessionStorage();
		NotificationManager.info(`Article "${article.TITREARTICLE}" retiré`);
	}

	/**
	 * Met à jour l'affichage des articles sélectionnés
	 * @returns {void}
	 */
	function updateSelectedArticlesDisplay() {
		const container = document.getElementById('selected-articles');
		const template = document.getElementById('selected-article-template');
		
		if (!container || !template) return;

		container.innerHTML = '';

		if (selectedArticles.length === 0) {
			container.innerHTML = `
				<div class="newdoc__empty-state">
					<i class="fas fa-mouse-pointer"></i>
					<p>Glissez-déposez des articles ici</p>
					<small>Utilisez les flèches pour réorganiser l'ordre</small>
				</div>
			`;
			return;
		}

		const fragment = document.createDocumentFragment();

		selectedArticles.forEach((article, index) => {
			const clone = document.importNode(template.content, true);
			
			const orderEl = clone.querySelector('.newdoc__order-number');
			if (orderEl) {
				orderEl.textContent = index + 1;
			}

			const titleEl = clone.querySelector('.newdoc__selected-title');
			if (titleEl) {
				titleEl.textContent = article.TITREARTICLE || 'Titre non disponible';
			}

			const descEl = clone.querySelector('.newdoc__selected-description');
			if (descEl) {
				const description = article.DESCARTICLE || 'Aucune description disponible';
				descEl.textContent = description.length > 60 ? description.substring(0, 60) + '...' : description;
			}

			const priceEl = clone.querySelector('.newdoc__selected-price');
			if (priceEl) {
				const price = parseFloat(article.PRIXHT || 0);
				priceEl.textContent = `${price.toFixed(2)} € HT`;
			}

			const taxEl = clone.querySelector('.newdoc__selected-tax');
			if (taxEl) {
				taxEl.textContent = article.POURCENTTAXE ? `TVA ${article.POURCENTTAXE}%` : 'TVA non définie';
			}

			const moveUpBtn = clone.querySelector('.newdoc__move-up');
			const moveDownBtn = clone.querySelector('.newdoc__move-down');
			
			if (moveUpBtn) {
				moveUpBtn.disabled = index === 0;
				moveUpBtn.addEventListener('click', () => moveArticle(index, index - 1));
			}
			
			if (moveDownBtn) {
				moveDownBtn.disabled = index === selectedArticles.length - 1;
				moveDownBtn.addEventListener('click', () => moveArticle(index, index + 1));
			}

			const removeBtn = clone.querySelector('.newdoc__remove-item');
			if (removeBtn) {
				removeBtn.addEventListener('click', () => removeArticleFromSelection(index));
			}

			const optionToggle = clone.querySelector('.newdoc__option-toggle');
			const optionBadge = clone.querySelector('.newdoc__option-badge');
			
			if (optionToggle) {
				optionToggle.dataset.option = article.isOption ? 'true' : 'false';
				if (article.isOption) {
					optionToggle.classList.add('active');
					optionToggle.title = 'Retirer des options';
				} else {
					optionToggle.classList.remove('active');
					optionToggle.title = 'Marquer comme option';
				}
				
				optionToggle.addEventListener('click', () => toggleArticleOption(index));
			}
			
			if (optionBadge) {
				optionBadge.style.display = article.isOption ? 'inline-block' : 'none';
			}

			fragment.appendChild(clone);
		});

		container.appendChild(fragment);
	}

	/**
	 * Bascule le statut option/article standard d'un article
	 * @param {number} index - Index de l'article
	 * @returns {void}
	 */
	function toggleArticleOption(index) {
		if (index < 0 || index >= selectedArticles.length) return;
		
		selectedArticles[index].isOption = !selectedArticles[index].isOption;
		updateSelectedArticlesDisplay();
		updateUI();
		saveToSessionStorage();
		
		const status = selectedArticles[index].isOption ? 'marqué comme option' : 'retiré des options';
		NotificationManager.info(`Article "${selectedArticles[index].TITREARTICLE}" ${status}`);
	}

	/**
	 * Déplace un article dans la liste
	 * @param {number} fromIndex - Index source
	 * @param {number} toIndex - Index destination
	 * @returns {void}
	 */
	function moveArticle(fromIndex, toIndex) {
		if (toIndex < 0 || toIndex >= selectedArticles.length) return;
		
		const element = selectedArticles[fromIndex];
		selectedArticles.splice(fromIndex, 1);
		selectedArticles.splice(toIndex, 0, element);
		
		updateSelectedArticlesDisplay();
		updateUI();
		saveToSessionStorage();
		NotificationManager.success('Ordre mis à jour');
	}

	/**
	 * Vide la sélection d'articles
	 * @returns {void}
	 */
	function clearSelection() {
		selectedArticles = [];
		updateSelectedArticlesDisplay();
		updateUI();
		saveToSessionStorage();
		NotificationManager.info('Sélection vidée');
	}

	/**
	 * Met à jour l'état de l'interface utilisateur
	 * @returns {void}
	 */
	function updateUI() {
		const countEl = document.getElementById('selected-count');
		if (countEl) {
			countEl.textContent = selectedArticles.length;
		}

		const clearBtn = document.getElementById('clear-selection');
		const previewBtn = document.getElementById('preview-doc');
		const generateBtn = document.getElementById('generate-document');
		
		const hasSelection = selectedArticles.length > 0;
		const title = document.getElementById('doc-title')?.value.trim();
		const client = document.getElementById('client-select')?.value;
		const isFormValid = title && client && hasSelection;
		
		if (clearBtn) clearBtn.disabled = !hasSelection;
		if (previewBtn) previewBtn.disabled = !isFormValid;
		if (generateBtn) generateBtn.disabled = !isFormValid;
	}

	/**
	 * Affiche un message quand aucun utilisateur n'est disponible
	 * @returns {void}
	 */
	function showEmptyUsers() {
		const container = document.getElementById('available-users');
		if (!container) return;

		container.innerHTML = `
			<div class="newdoc__empty-state">
				<i class="fas fa-users"></i>
				<p>Aucun utilisateur disponible</p>
				<small>Les utilisateurs actifs apparaîtront ici</small>
			</div>
		`;
	}

	/**
	 * Génère et retourne les données du document
	 * @returns {Object} Données complètes du document prêtes pour l'API
	 */
	function generateDocumentData() {
		const clientSelect = document.getElementById('client-select');
		const selectedClientData = clientSelect?.value ? 
			JSON.parse(clientSelect.options[clientSelect.selectedIndex].dataset.clientData || '{}') : null;

		const now = new Date();
		const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
			'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
		
		const documentData = {
			clientData: selectedClientData,
			
			shareData: selectedUsers
				.filter(user => user.email && user.email.trim() !== '')
				.map(user => user.email.trim()),
			
			dateData: {
				ddmmyyyy: now.toLocaleDateString('fr-FR'),
				mmyyyy: `${monthNames[now.getMonth()]} ${now.getFullYear()}`
			},
			
			documentData: {
				title: document.getElementById('doc-title')?.value || '',
				subtitle: document.getElementById('doc-subtitle')?.value || '',
				site: document.getElementById('doc-site')?.value || '',
				footer: document.getElementById('doc-footer')?.value || '',
				selectedArticles: selectedArticles.map((article, index) => {
					return {
						id: article.id,
						order: index + 1,
						title: article.TITREARTICLE,
						description: article.DESCARTICLE,
						content: article.CONTENUARTICLE || article.contenuarticle || '',
						priceHT: parseFloat(article.PRIXHT || 0),
						taxPercent: article.POURCENTTAXE,
						period: article.LABELPERIODICITE,
						isOption: article.isOption || false
					};
				})
			}
		};

		console.log('Data envoyée:', documentData);
		
		return documentData;
	}

	/**
	 * Génère le document via Google Apps Script
	 * @returns {Promise<void>}
	 */
	async function generateDocument() {
		const generateBtn = document.getElementById('generate-document');
		
		if (generateBtn) {
			generateBtn.disabled = true;
			generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération en cours...';
		}

		try {
			const userCheckResponse = await fetch(API_URL + '/user/verify', {
				method: 'GET',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'User-ID': localStorage.getItem('user_id'),
					'Authorization': localStorage.getItem('user_authToken')
				}
			});

			if (!userCheckResponse.ok) {
				if (userCheckResponse.status === 403) {
					clearUserStorage();
					window.location.href = BASE_URL + '/wait';
					return;
				}
				if (userCheckResponse.status === 401) {
					clearUserStorage();
					window.location.href = BASE_URL + '/';
					return;
				}
				throw new Error(`Erreur d'authentification: ${userCheckResponse.status}`);
			}

			const userCheckData = await userCheckResponse.json();
			if (!userCheckData.success) {
				throw new Error('Utilisateur non autorisé à générer des documents');
			}

			const documentData = generateDocumentData();
			const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBTxH8B9vIu0Tm2w5NloGQ4s6N95_w_bObiisGKqw35SMJVnoagGDyEBqT9BTemtq6/exec';
			
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = APP_SCRIPT_URL;
			form.target = '_blank';
			form.style.display = 'none';
			
			const dataInput = document.createElement('input');
			dataInput.type = 'hidden';
			dataInput.name = 'data';
			dataInput.value = JSON.stringify(documentData);
			form.appendChild(dataInput);
			
			const sourceInput = document.createElement('input');
			sourceInput.type = 'hidden';
			sourceInput.name = 'source';
			sourceInput.value = 'draw-up-form';
			form.appendChild(sourceInput);
			
			document.body.appendChild(form);
			form.submit();
			
			setTimeout(() => {
				document.body.removeChild(form);
			}, 1000);
			
			NotificationManager.success('Document en cours de génération...');
			
			// Nettoyer le formulaire après succès
			setTimeout(() => {
				selectedArticles = [];
				updateSelectedArticlesDisplay();
				
				const currentUserId = localStorage.getItem('user_id');
				selectedUsers = selectedUsers.filter(user => user.id == currentUserId);
				
				const userCheckboxes = document.querySelectorAll('.newdoc__user-checkbox');
				userCheckboxes.forEach(checkbox => {
					if (!checkbox.disabled) {
						checkbox.checked = false;
					}
				});
				
				const formFields = ['doc-title', 'doc-subtitle', 'doc-site', 'doc-date', 'doc-footer'];
				formFields.forEach(fieldId => {
					const field = document.getElementById(fieldId);
					if (field) field.value = '';
				});
				
				const clientSelect = document.getElementById('client-select');
				if (clientSelect) clientSelect.value = '';
				
				sessionStorage.removeItem('newDocFormData');
				updateUI();
				
				NotificationManager.info('Formulaire nettoyé - Vérifiez l\'onglet qui s\'est ouvert pour le document généré');
			}, 2000);

		} catch (error) {
			console.error('❌ Erreur:', error);
			
			let errorMessage;
			if (error.message.includes('Failed to fetch')) {
				errorMessage = 'Problème de connexion avec le serveur.';
			} else {
				errorMessage = error.message;
			}
			
			NotificationManager.error(errorMessage);
			
		} finally {
			if (generateBtn) {
				generateBtn.disabled = false;
				generateBtn.innerHTML = '<i class="fas fa-file-alt"></i> Générer le document';
			}
		}
	}

	setupSelectedAreaDropZone();
});

function clearUserStorage() {
	localStorage.removeItem('user_id');
	localStorage.removeItem('user_name');
	localStorage.removeItem('user_email');
	localStorage.removeItem('user_valid');
	localStorage.removeItem('user_picture');
	localStorage.removeItem('user_authToken');
	sessionStorage.clear();
}