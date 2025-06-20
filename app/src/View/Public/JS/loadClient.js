/**
 * Module de gestion de l'affichage des clients
 * Gère le chargement, l'affichage paginé, la recherche et les interactions avec les clients
 */

document.addEventListener('DOMContentLoaded', function() {
	// Configuration du tri des colonnes avec tablesorter
	$("#clientTable").tablesorter({
		theme: 'default',
		widgets: ['zebra'],
		headers: {
			1: { sorter: false }, // Logo
			9: { sorter: false }, // Contacts
			10: { sorter: false } // Actions
		}
	});
	
	// Variables de pagination et de données
	let currentPage = 1;
	let itemsPerPage = 10;
	let totalClients = 0;
	let allClients = [];
	
	/**
	 * Nettoie le localStorage des données utilisateur
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
	 * Charge tous les clients depuis l'API
	 * Gère la redirection en cas de compte non validé
	 */
	async function loadClients() {
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
			
			if (response.ok && data.success) {
				allClients = data.clients;
				totalClients = allClients.length;
				const totalPages = Math.ceil(totalClients / itemsPerPage);
				document.getElementById('totalPages').textContent = totalPages;
				
				displayClients(currentPage);
				updatePaginationButtons();
			} else {
				document.getElementById('clientTableBody').innerHTML = 
					'<tr><td colspan="11" class="pannel__content-table-error">Erreur lors du chargement des clients: ' + (data.error || "inconnue") + '</td></tr>';
			}
		} catch (error) {
			console.error('Erreur:', error);
			document.getElementById('clientTableBody').innerHTML = 
				'<tr><td colspan="11" class="pannel__content-table-error">Erreur de connexion à l\'API: ' + error.message + '</td></tr>';
		}
	}
	
	/**
	 * Affiche les clients pour une page donnée
	 * 
	 * @param {number} page - Le numéro de page à afficher
	 */
	function displayClients(page) {
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const clientsToDisplay = allClients.slice(start, end);
		
		const tbody = document.getElementById('clientTableBody');
		tbody.innerHTML = '';
		
		if (clientsToDisplay.length === 0) {
			tbody.innerHTML = '<tr><td colspan="11" class="pannel__content-table-empty">Aucun client trouvé</td></tr>';
			return;
		}
		
		const template = document.getElementById('client-row-template');
		
		clientsToDisplay.forEach(client => {
			const clone = document.importNode(template.content, true);
			
			// Remplissage des données du client
			clone.querySelector('.client-id').textContent = client.IDCLI;
			clone.querySelector('.client-id').title = `ID: ${client.IDCLI}`;
			
			clone.querySelector('.client-lastname').textContent = client.NOMCLI;
			clone.querySelector('.client-lastname').title = `Nom: ${client.NOMCLI}`;
			
			clone.querySelector('.client-firstname').textContent = client.PRENOMCLI;
			clone.querySelector('.client-firstname').title = `Prénom: ${client.PRENOMCLI}`;
			
			clone.querySelector('.client-address').textContent = client.ADRCLI1;
			clone.querySelector('.client-address').title = `Adresse: ${client.ADRCLI1}`;
			
			const address2Cell = clone.querySelector('.client-address2');
			if (address2Cell) {
				address2Cell.textContent = client.ADRCLI2 || '';
				address2Cell.title = `Adresse 2: ${client.ADRCLI2 || ''}`;
			}
			
			const address3Cell = clone.querySelector('.client-address3');
			if (address3Cell) {
				address3Cell.textContent = client.ADRCLI3 || '';
				address3Cell.title = `Adresse 3: ${client.ADRCLI3 || ''}`;
			}
			
			clone.querySelector('.client-city').textContent = client.VILLECLI;
			clone.querySelector('.client-city').title = `Ville: ${client.VILLECLI}`;
			
			clone.querySelector('.client-postalcode').textContent = client.CPCLI;
			clone.querySelector('.client-postalcode').title = `Code postal: ${client.CPCLI}`;
			
			clone.querySelector('.client-contact').textContent = client.LIGNECONTACTCLI;
			clone.querySelector('.client-contact').title = `Contact: ${client.LIGNECONTACTCLI}`;

			// Gestion du logo
			const logoContainer = clone.querySelector('.client-logo-container');
			if (client.LOGOCLI && logoContainer) {
				const logoImg = document.createElement('img');
				logoImg.src = client.LOGOCLI;
				logoImg.alt = `Logo de ${client.NOMCLI}`;
				logoImg.className = 'client-logo-image';
				logoContainer.appendChild(logoImg);
			} else if (logoContainer) {
				const placeholder = document.createElement('div');
				placeholder.className = 'client-logo-placeholder';
				placeholder.innerHTML = '<p>logo non disponible</p>';
				logoContainer.appendChild(placeholder);
			}
			
			// Bouton d'édition
			const editBtn = clone.querySelector('.btn-edit');
			if (editBtn) {
				editBtn.addEventListener('click', () => {
					sessionStorage.setItem('editClientData', JSON.stringify({
						id: client.IDCLI,
						name: client.NOMCLI,
						logo: client.LOGOCLI
					}));
					window.location.href = `${BASE_URL}/pannel/client/${client.IDCLI}`;
				});
			}
			
			tbody.appendChild(clone);
		});
		
		$("#clientTable").trigger("update");
	}

	/**
	 * Met à jour l'état des boutons de pagination
	 */
	function updatePaginationButtons() {
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		document.getElementById('currentPage').textContent = currentPage;
		
		document.getElementById('firstPage').disabled = (currentPage <= 1);
		document.getElementById('prevPage').disabled = (currentPage <= 1);
		document.getElementById('nextPage').disabled = (currentPage >= totalPages);
		document.getElementById('lastPage').disabled = (currentPage >= totalPages);
	}
	
	// Événements de pagination
	document.getElementById('prevPage').addEventListener('click', () => {
		if (currentPage > 1) {
			currentPage--;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});
	
	document.getElementById('nextPage').addEventListener('click', () => {
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		if (currentPage < totalPages) {
			currentPage++;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});

	// Recherche de clients
	document.getElementById('client-search').addEventListener('input', function() {
		const searchTerm = this.value.toLowerCase();
		
		if (searchTerm.length > 0) {
			const filteredClients = allClients.filter(client => 
				client.NOMCLI.toLowerCase().includes(searchTerm) || 
				client.PRENOMCLI.toLowerCase().includes(searchTerm) ||
				client.VILLECLI.toLowerCase().includes(searchTerm)
			);
			
			currentPage = 1;
			totalClients = filteredClients.length;
			allClients = filteredClients;
		} else {
			loadClients();
			return;
		}
		
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		document.getElementById('totalPages').textContent = totalPages;
		displayClients(currentPage);
		updatePaginationButtons();
	});
	
	// Réinitialisation de la recherche
	document.getElementById('reset-search').addEventListener('click', function() {
		document.getElementById('client-search').value = '';
		loadClients();
	});

	// Changement du nombre d'éléments par page
	document.getElementById('items-per-page').addEventListener('change', function() {
		itemsPerPage = parseInt(this.value);
		currentPage = 1;
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		document.getElementById('totalPages').textContent = totalPages;
		displayClients(currentPage);
		updatePaginationButtons();
	});

	// Navigation vers la première page
	document.getElementById('firstPage').addEventListener('click', function() {
		if (currentPage !== 1) {
			currentPage = 1;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});

	// Navigation vers la dernière page
	document.getElementById('lastPage').addEventListener('click', function() {
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		if (currentPage !== totalPages) {
			currentPage = totalPages;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});

	// Initialisation
	loadClients();
});