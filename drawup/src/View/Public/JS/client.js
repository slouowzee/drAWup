// Script de gestion des clients pour DrawUp
document.addEventListener('DOMContentLoaded', function() {
	// Initialiser tablesorter
	$("#clientTable").tablesorter({
		theme: 'default',
		widgets: ['zebra'],
		headers: {
			8: { sorter: false } // Désactiver le tri sur la colonne des actions
		}
	});
	
	// Variables pour la pagination
	let currentPage = 1;
	const itemsPerPage = 10;
	let totalClients = 0;
	let allClients = [];
	
	// Charger les clients depuis l'API
	async function loadClients() {
		try {
			const response = await fetch('http://localhost/drawup_demo/api_drawup/api/client/all', {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
			
			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
			}
			
			const data = await response.json();
			console.log("Réponse de l'API clients:", data);
			
			if (response.ok && data.success) {
				allClients = data.clients;
				totalClients = allClients.length;
				const totalPages = Math.ceil(totalClients / itemsPerPage);
				document.getElementById('totalPages').textContent = totalPages;
				
				// Afficher la première page
				displayClients(currentPage);
				
				// Mettre à jour les boutons de pagination
				updatePaginationButtons();
			} else {
				console.error("Erreur API :", data.error || "Réponse inattendue");
				document.getElementById('clientTableBody').innerHTML = 
					'<tr><td colspan="9" class="pannel__content-table-error">Erreur lors du chargement des clients: ' + (data.error || "inconnue") + '</td></tr>';
			}
		} catch (error) {
			console.error('Erreur:', error);
			document.getElementById('clientTableBody').innerHTML = 
				'<tr><td colspan="9" class="pannel__content-table-error">Erreur de connexion à l\'API: ' + error.message + '</td></tr>';
		}
	}
	
	// Afficher les clients pour une page donnée
	function displayClients(page) {
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const clientsToDisplay = allClients.slice(start, end);
		
		// Vider le corps du tableau
		const tbody = document.getElementById('clientTableBody');
		tbody.innerHTML = '';
		
		if (clientsToDisplay.length === 0) {
			tbody.innerHTML = '<tr><td colspan="9" class="pannel__content-table-empty">Aucun client trouvé</td></tr>';
			return;
		}
		
		// Template pour les lignes
		const template = document.getElementById('client-row-template');
		
		// Remplir le tableau avec les clients
		clientsToDisplay.forEach(client => {
			const clone = document.importNode(template.content, true);
			
			clone.querySelector('.client-id').textContent = client.IDCLI;
			clone.querySelector('.client-lastname').textContent = client.NOMCLI;
			clone.querySelector('.client-firstname').textContent = client.PRENOMCLI;
			clone.querySelector('.client-address').textContent = client.ADRCLI;
			clone.querySelector('.client-city').textContent = client.VILLECLI;
			clone.querySelector('.client-postalcode').textContent = client.CPCLI;
			clone.querySelector('.client-contact').textContent = client.LIGNECONTACTCLI;
			
			// Affichage du logo si disponible
			if (client.LOGOCLI && clone.querySelector('.client-logo')) {
				const logoImg = document.createElement('img');
				logoImg.src = client.LOGOCLI;
				logoImg.alt = `Logo de ${client.NOMCLI}`;
				logoImg.className = 'client-logo-img';
				clone.querySelector('.client-logo').appendChild(logoImg);
			} else if (clone.querySelector('.client-logo')) {
				clone.querySelector('.client-logo').textContent = 'Aucun logo';
			}
			
			// Bouton d'action - Edition seulement
			const editBtn = clone.querySelector('.btn-edit');
			if (editBtn) {
				editBtn.addEventListener('click', () => {
					window.location.href = `${BASE_URL}client/edit/${client.IDCLI}`;
				});
			}
			
			tbody.appendChild(clone);
		});
		
		// Mettre à jour tablesorter
		$("#clientTable").trigger("update");
	}
		// Mettre à jour les boutons de pagination
	function updatePaginationButtons() {
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		document.getElementById('currentPage').textContent = currentPage;
		document.getElementById('totalPages').textContent = totalPages || '0';
		
		// Activer/désactiver les boutons selon la page actuelle et le nombre total de pages
		const noPages = totalPages <= 0;
		const isFirstPage = currentPage <= 1;
		const isLastPage = currentPage >= totalPages;
		
		document.getElementById('firstPage').disabled = isFirstPage || noPages;
		document.getElementById('prevPage').disabled = isFirstPage || noPages;
		document.getElementById('nextPage').disabled = isLastPage || noPages;
		document.getElementById('lastPage').disabled = isLastPage || noPages;
	}
	
	// Événements de pagination
	document.getElementById('firstPage').addEventListener('click', () => {
		if (currentPage > 1) {
			currentPage = 1;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});
	
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
	
	document.getElementById('lastPage').addEventListener('click', () => {
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		if (currentPage < totalPages) {
			currentPage = totalPages;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});
	  // Fonction de recherche
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
			// Si la recherche est vide, recharger tous les clients
			loadClients();
			return;
		}
		
		// Mettre à jour l'affichage
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		document.getElementById('totalPages').textContent = totalPages;
		displayClients(currentPage);
		updatePaginationButtons();
	});
		// Bouton réinitialiser la recherche
	document.getElementById('reset-search').addEventListener('click', function() {
		// Ajouter la classe pour l'animation de rotation
		const resetButton = document.getElementById('reset-search');
		resetButton.classList.add('rotating');
		
		// Réinitialiser la recherche
		document.getElementById('client-search').value = '';
		loadClients();
		
		// Supprimer la classe après l'animation pour permettre de rejouer l'animation au prochain clic
		setTimeout(() => {
			resetButton.classList.remove('rotating');
		}, 800); // Durée correspondant à l'animation CSS
	});
	loadClients();
});