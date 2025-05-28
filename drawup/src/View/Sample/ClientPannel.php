<section class="pannel__content">
	<div class="pannel__content-header" style="display: flex; align-items: center; gap: 1rem;">
		<h1 class="pannel__content-title">Gestion des clients</h1>
	</div>
	
	<div class="pannel__content-all">
		<div class="pannel__content-table-container">
			<div class="pannel__content-table-actions">
				<div class="pannel__content-table-actions-left">
					<a href="<?= BASE_URL . 'client/add' ?>" class="pannel__content-quick-actions-item-create">
						<span class="bg-gradient"></span>
						Ajouter un client
					</a>
				</div>
				<div class="pannel__content-table-actions-right">
					<button id="reset-search" class="pannel__content-reset-button" title="Réinitialiser la recherche">
						<i class="fas fa-undo"></i>
					</button>
					<div class="pannel__content-search">
						<input type="text" id="client-search" class="pannel__content-search-input" placeholder="Rechercher un client...">
						<button class="pannel__content-search-button"><i class="fas fa-search"></i></button>
					</div>
				</div>
			</div>

			<div class="pannel__content-table-wrapper">
				<table id="clientTable" class="pannel__content-table tablesorter">					<thead>
						<tr>
							<th class="header">ID</th>
							<th class="header">Logo</th>
							<th class="header">Nom</th>
							<th class="header">Prénom</th>
							<th class="header">Adresse</th>
							<th class="header">Ville</th>
							<th class="header">Code Postal</th>
							<th class="header">Contact</th>
							<th class="header">Actions</th>
						</tr>
					</thead>
					<tbody id="clientTableBody">
						<!-- Le contenu sera chargé dynamiquement -->						<tr>
							<td colspan="9" class="pannel__content-table-loading">Chargement des clients...</td>
						</tr>
					</tbody>
				</table>
			</div>
					<div class="pannel__content-table-pagination">
				<button id="firstPage" class="pannel__content-pagination-btn" disabled title="Première page"><i class="fas fa-angle-double-left"></i></button>
				<button id="prevPage" class="pannel__content-pagination-btn" disabled title="Page précédente"><i class="fas fa-chevron-left"></i></button>
				<span id="pagination-info" class="pannel__content-pagination-info">Page <span id="currentPage">1</span> sur <span id="totalPages">?</span></span>
				<button id="nextPage" class="pannel__content-pagination-btn" disabled title="Page suivante"><i class="fas fa-chevron-right"></i></button>
				<button id="lastPage" class="pannel__content-pagination-btn" disabled title="Dernière page"><i class="fas fa-angle-double-right"></i></button>
			</div>
		</div>
	</div>

	<!-- Template pour les lignes du tableau -->	<template id="client-row-template">
		<tr>
			<td class="client-id"></td>
			<td class="client-logo"></td>
			<td class="client-lastname"></td>
			<td class="client-firstname"></td>
			<td class="client-address"></td>
			<td class="client-city"></td>
			<td class="client-postalcode"></td>
			<td class="client-contact"></td>
			<td class="client-actions">
				<button class="btn-edit" title="Modifier"><i class="fas fa-edit"></i></button>
			</td>
		</tr>
	</template>
</section>