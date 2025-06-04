document.addEventListener('DOMContentLoaded', function() {
	if (typeof BASE_URL === 'undefined') {
		console.error('La constante BASE_URL n\'est pas définie. La redirection des boutons peut ne pas fonctionner correctement.');
		window.BASE_URL = 'https://assured-concise-ladybird.ngrok-free.app/drawup_demo/drawup';
	}
	
	$("#clientTable").tablesorter({
		theme: 'default',
		widgets: ['zebra'],
		headers: {
			1: { sorter: false }, // Désactiver le tri sur la colonne des logos
			7: { sorter: false }, // Désactiver le tri sur la colonne des contacts
			8: { sorter: false }  // Désactiver le tri sur la colonne des actions
		}
	});
	
	let currentPage = 1;
	let itemsPerPage = 10; // Valeur par défaut
	let totalClients = 0;
	let allClients = [];
	
	async function loadClients() {
		try {
			const response = await fetch('https://assured-concise-ladybird.ngrok-free.app/drawup_demo/api_drawup/api/client/all', {
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
				
				displayClients(currentPage);
				
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
	
	function displayClients(page) {
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const clientsToDisplay = allClients.slice(start, end);
		
		const tbody = document.getElementById('clientTableBody');
		tbody.innerHTML = '';
		
		if (clientsToDisplay.length === 0) {
			tbody.innerHTML = '<tr><td colspan="9" class="pannel__content-table-empty">Aucun client trouvé</td></tr>';
			return;
		}
		
		const template = document.getElementById('client-row-template');
		
		clientsToDisplay.forEach(client => {
			const clone = document.importNode(template.content, true);
			
			const idCell = clone.querySelector('.client-id');
			idCell.textContent = client.IDCLI;
			idCell.title = `ID: ${client.IDCLI}`;
			
			const lastnameCell = clone.querySelector('.client-lastname');
			lastnameCell.textContent = client.NOMCLI;
			lastnameCell.title = `Nom: ${client.NOMCLI}`;
			
			const firstnameCell = clone.querySelector('.client-firstname');
			firstnameCell.textContent = client.PRENOMCLI;
			firstnameCell.title = `Prénom: ${client.PRENOMCLI}`;
			
			const addressCell = clone.querySelector('.client-address');
			addressCell.textContent = client.ADRCLI;
			addressCell.title = `Adresse: ${client.ADRCLI}`;
			
			const cityCell = clone.querySelector('.client-city');
			cityCell.textContent = client.VILLECLI;
			cityCell.title = `Ville: ${client.VILLECLI}`;
			
			const postalcodeCell = clone.querySelector('.client-postalcode');
			postalcodeCell.textContent = client.CPCLI;
			postalcodeCell.title = `Code postal: ${client.CPCLI}`;
			
			const contactCell = clone.querySelector('.client-contact');
			contactCell.textContent = client.LIGNECONTACTCLI;
			contactCell.title = `Contact: ${client.LIGNECONTACTCLI}`;

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
			
			const editBtn = clone.querySelector('.btn-edit');
			if (editBtn) {
				editBtn.addEventListener('click', () => {
					sessionStorage.setItem('editClientData', JSON.stringify({
						id: client.IDCLI,
						name: client.NOMCLI,
						logo: client.LOGOCLI
					}));
					console.log(`Navigating to edit client: ${client.NOMCLI}`);
					const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
					window.location.href = `${baseUrl}/pannel/client/${client.IDCLI}`;
				});
			}
			
			tbody.appendChild(clone);
		});
		
		$("#clientTable").trigger("update");
	}

	function updatePaginationButtons() {
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		document.getElementById('currentPage').textContent = currentPage;
		
		document.getElementById('firstPage').disabled = (currentPage <= 1);
		document.getElementById('prevPage').disabled = (currentPage <= 1);
		document.getElementById('nextPage').disabled = (currentPage >= totalPages);
		document.getElementById('lastPage').disabled = (currentPage >= totalPages);
	}
	
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
	
	document.getElementById('reset-search').addEventListener('click', function() {
		document.getElementById('client-search').value = '';
		loadClients();
	});

	document.getElementById('items-per-page').addEventListener('change', function() {
		itemsPerPage = parseInt(this.value);
		currentPage = 1;
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		document.getElementById('totalPages').textContent = totalPages;
		displayClients(currentPage);
		updatePaginationButtons();
	});

	document.getElementById('firstPage').addEventListener('click', function() {
		if (currentPage !== 1) {
			currentPage = 1;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});

	document.getElementById('lastPage').addEventListener('click', function() {
		const totalPages = Math.ceil(totalClients / itemsPerPage);
		if (currentPage !== totalPages) {
			currentPage = totalPages;
			displayClients(currentPage);
			updatePaginationButtons();
		}
	});

	loadClients();
});