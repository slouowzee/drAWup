		<section class="pannel__content">
			<div class="pannel__edit-client-header">
				<h2 class="pannel__edit-client-title">Édition du client</h2>
				<button class="pannel__edit-client-close-button" type="button" aria-label="Close Edit Client Panel">
					<span class="icon icon--close"></span>
				</button>
			</div>
			<form class="pannel__edit-client-form">
				<div class="form-group">
					<input type="text" id="client-nom" name="client_nom" placeholder="Nom du client" class="form-control" required>
				</div>
				<div class="form-group">
					<input type="text" id="client-prenom" name="client_prenom" placeholder="Prénom du client" class="form-control">
				</div>
				<div class="form-group">
					<input type="text" id="client-adresse" name="client_adresse" placeholder="Adresse du client" class="form-control">
				</div>
				<div class="form-group">
					<input type="text" id="client-ville" name="client_ville" placeholder="Ville du client" class="form-control">
				</div>
				<div class="form-group">
					<input type="number" id="client-codepostal" name="client_codepostal" placeholder="Code postal du client" class="form-control">
				</div>
				<div class="form-group">
					<label for="client-logo">Logo du client</label>
					<input type="file" id="client-logo" name="client_logo" accept="image/*" class="form-control">
					<small class="form-text">Sélectionnez une image pour le logo du client (format JPG, PNG)</small>
				</div>
				<div class="form-group">
					<label for="client-description">Description / Contact</label>
					<textarea id="client-description" name="client_description" rows="4" class="form-control" placeholder="Ligne de contact du client"></textarea>
				</div>
			</form>	
			<div class="pannel__edit-client-footer">
				<button class="pannel__edit-client-save-button" type="submit">Enregistrer</button>
			</div>
		</section>
		<script src="<?= BASE_URL . 'src/View/Public/JS/editClient.js'?>"></script>