<section class="pannel__content">
	<div class="pannel__add-client-header">
		<button class="pannel__add-client-back-button" aria-label="Retour à la page précédente"><i class="fas fa-arrow-left"></i></button>
		<h2 class="pannel__add-client-title">Édition de l'article</h2>
	</div>

	<form id="editArticleForm" class="pannel__add-client-form" aria-label="Formulaire d'édition d'article">
		<input type="hidden" id="article-id" name="article-id" value="">
		
		<div class="pannel__add-client-form-grid">
			<div class="form-group">
				<label for="article-title"><i class="fas fa-heading"></i> Titre de l'article</label>
				<input type="text" id="article-title" name="article-title" placeholder="Titre de l'article" class="form-control" required>
			</div>

			<div class="form-group">
				<label for="article-periodicity"><i class="fas fa-calendar-alt"></i> Périodicité</label>
				<select id="article-periodicity" name="article-periodicity" class="form-control">
					<option value="">Sélectionner une périodicité</option>
				</select>
			</div>
			
			<div class="form-group">
				<label for="article-price"><i class="fas fa-euro-sign"></i> Prix HT</label>
				<input type="number" id="article-price" name="article-price" placeholder="Prix de l'article" class="form-control" required step="0.01" min="0">
			</div>

			<div class="form-group">
				<label for="article-tax"><i class="fas fa-percent"></i> Taxation</label>
				<select id="article-tax" name="article-tax" class="form-control">
					<option value="">Sélectionner une taxation</option>
				</select>
			</div>

			<div class="form-group full-width">
				<label for="article-description"><i class="fas fa-info-circle"></i> Description</label>
				<textarea id="article-description" name="article-description" rows="4" class="form-control" placeholder="Description de l'article"></textarea>
			</div>

			<div class="form-group full-width">
				<label for="article-content-hidden"><i class="fas fa-file-alt"></i> Contenu de l'article (optionnel)</label>
				<textarea name="article_content" id="article-content-hidden"></textarea>
			</div>
		</div>
	</form>

	<div class="pannel__add-client-footer">
		<button type="button" id="article-update" class="pannel__add-client-save-button">
			<i class="fas fa-save"></i> Mettre à jour l'article
		</button>
	</div>

	<link href="<?= BASE_URL . '/src/View/Public/CSS/Components/summernote-lite.css'?>" rel="stylesheet">
	<script src="<?= BASE_URL . '/src/View/Public/JS/summernote-lite.js'?>"></script>
	<script src="<?= BASE_URL . '/src/View/Public/JS/summernote-fr-FR.min.js'?>"></script>
	<script type="module" src="<?= BASE_URL . '/src/View/Public/JS/editArticle.js'?>"></script>
</section>
