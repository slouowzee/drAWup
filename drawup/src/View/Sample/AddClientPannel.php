<section class="pannel__content">
			<div class="pannel__add-client-header">
				<button class="pannel__add-client-back-button" aria-label="Retour à la page précédente"><i class="fas fa-arrow-left"></i></button>
				<h2 class="pannel__add-client-title">Ajouter un nouveau client</h2>
			</div>

			<form id="addClientForm" class="pannel__add-client-form" aria-label="Formulaire d'ajout client">
				<div class="pannel__add-client-form-grid">
					<div class="form-group">
						<label for="client-nom"><i class="fas fa-user"></i> Nom</label>
						<input type="text" id="client-nom" name="client_nom" placeholder="Nom du client" class="form-control" required autocomplete="family-name">
					</div>
					<div class="form-group">
						<label for="client-prenom"><i class="fas fa-user"></i> Prénom</label>
						<input type="text" id="client-prenom" name="client_prenom" placeholder="Prénom du client" class="form-control" autocomplete="given-name">
					</div>
					<div class="form-group">
						<label for="client-adresse"><i class="fas fa-map-marker-alt"></i> Adresse</label>
						<input type="text" id="client-adresse" name="client_adresse" placeholder="Adresse du client" class="form-control" autocomplete="address-line1">
					</div>
					<div class="form-group">
						<label for="client-ville"><i class="fas fa-city"></i> Ville</label>
						<input type="text" id="client-ville" name="client_ville" placeholder="Ville du client" class="form-control" autocomplete="address-level2">
					</div>
					<div class="form-group">
						<label for="client-codepostal"><i class="fas fa-map-pin"></i> Code postal</label>
						<input type="text" id="client-codepostal" name="client_codepostal" placeholder="Code postal du client" class="form-control" autocomplete="postal-code">
					</div>
					<div class="form-group full-width">
						<label for="client-logo"><i class="fas fa-image"></i> Logo du client</label>
						<input type="file" id="client-logo" name="client_logo" accept="image/jpeg,image/png,image/gif,image/svg+xml" class="form-control">
						<small class="form-text">Formats acceptés: JPG, PNG, GIF, SVG (max. 2 Mo)</small>
						<div id="logo-preview" class="logo-preview"></div>
					</div>
					<div class="form-group full-width">
						<label for="client-description"><i class="fas fa-comment-alt"></i> Description / Contact</label>
						<textarea id="client-description" name="client_description" rows="4" class="form-control" placeholder="Ligne de contact du client"></textarea>
					</div>
				</div>
			</form>	

			<div class="pannel__add-client-footer">
				<button id="client-save" class="pannel__add-client-save-button" aria-label="Enregistrer le nouveau client">
					<i class="fas fa-plus-circle"></i> Ajouter
				</button>
			</div>
		</section>
		<script type="module" src="<?= BASE_URL . 'src/View/Public/JS/addClient.js'?>"></script>