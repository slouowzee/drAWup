<section class="pannel__content">
			<div class="pannel__content-newdoc-header">
				<div class="pannel__content-header-main">
					<h1 class="pannel__content-title">
						<i class="fab fa-google-drive"></i>
						Nouveau document
					</h1>
				</div>
			</div>

			<div class="newdoc__container">
				<!-- Form Section -->
				<div class="newdoc__form-section">
					<div class="newdoc__form-card">
						<h2 class="newdoc__form-title">
							<i class="fas fa-file-alt"></i>
							Informations du document
						</h2>
						
						<div class="newdoc__form-grid">
							<div class="newdoc__form-group">
								<label for="doc-title" class="newdoc__label required">
									<i class="fas fa-heading"></i>
									Titre du document
								</label>
								<input type="text" id="doc-title" class="newdoc__input" placeholder="Entrez le titre du document..." required>
							</div>

							<div class="newdoc__form-group">
								<label for="doc-subtitle" class="newdoc__label">
									<i class="fas fa-text-width"></i>
									Sous-titre
								</label>
								<input type="text" id="doc-subtitle" class="newdoc__input" placeholder="Entrez le sous-titre...">
							</div>

							<div class="newdoc__form-group">
								<label for="doc-site" class="newdoc__label">
									<i class="fas fa-map-marker-alt"></i>
									Site
								</label>
								<input type="text" id="doc-site" class="newdoc__input" placeholder="Entrez le site...">
							</div>

							<div class="newdoc__form-group">
								<label for="client-select" class="newdoc__label required">
									<i class="fas fa-user-tie"></i>
									Client
								</label>
								<select id="client-select" class="newdoc__select" required>
									<option value="">Sélectionnez un client...</option>
								</select>
								<div class="newdoc__loading" id="clients-loading" style="display: none; margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
									<i class="fas fa-spinner fa-spin"></i>
									Chargement des clients...
								</div>
							</div>

							<div class="newdoc__form-group">
								<label for="doc-date" class="newdoc__label">
									<i class="fas fa-calendar-alt"></i>
									Date du document
								</label>
								<input type="date" id="doc-date" class="newdoc__input">
							</div>

							<div class="newdoc__form-group newdoc__form-group--full">
								<label for="doc-footer" class="newdoc__label">
									<i class="fas fa-text-height"></i>
									Accroche de pied de page
								</label>
								<textarea id="doc-footer" class="newdoc__textarea" placeholder="Entrez une accroche pour le pied de page..." rows="3"></textarea>
							</div>
						</div>
					</div>

					<div class="newdoc__articles-section">
						<div class="newdoc__articles-header">
							<h3 class="newdoc__articles-title">
								<i class="fas fa-books"></i>
								Articles disponibles
							</h3>
							<div class="newdoc__articles-search">
								<i class="fas fa-search"></i>
								<input type="text" id="articles-search" placeholder="Rechercher un article..." class="newdoc__search-input">
							</div>
						</div>

						<div class="newdoc__articles-grid" id="available-articles">
							<div class="newdoc__loading" id="articles-loading">
								<i class="fas fa-spinner fa-spin"></i>
								Chargement des articles...
							</div>
						</div>
					</div>
				</div>

				<div class="newdoc__selected-section">
					<div class="newdoc__selected-card">
						<h2 class="newdoc__selected-title">
							<i class="fas fa-layer-group"></i>
							Articles sélectionnés
							<span class="newdoc__count" id="selected-count">0</span>
						</h2>

						<div class="newdoc__selected-container" id="selected-articles">
							<div class="newdoc__empty-state">
								<i class="fas fa-mouse-pointer"></i>
								<p>Glissez-déposez des articles ici</p>
								<small>Vous pouvez réorganiser l'ordre en faisant glisser les éléments</small>
							</div>
						</div>

						<h2 class="newdoc__selected-title" style="margin-top: 2rem;">
							<i class="fas fa-share-alt"></i>
							Partage
						</h2>

						<div class="newdoc__users-list-container">
							<div class="newdoc__loading" id="users-loading">
								<i class="fas fa-spinner fa-spin"></i>
								Chargement des utilisateurs...
							</div>
							<div class="newdoc__users-list" id="available-users"></div>
						</div>

						<div class="newdoc__actions">
							<div class="newdoc__actions-row">
								<button type="button" id="clear-selection" class="newdoc__btn newdoc__btn--secondary" disabled>
									<i class="fas fa-trash"></i>
									Vider la sélection
								</button>
								<button type="button" id="preview-doc" class="newdoc__btn newdoc__btn--primary" disabled>
									<i class="fas fa-eye"></i>
									Aperçu du document
								</button>
							</div>
							
							<button type="button" id="generate-document" class="newdoc__btn newdoc__btn--generate" disabled>
								<i class="fab fa-google-drive"></i>
								Générer
							</button>
						</div>
					</div>
				</div>
			</div>

			<template id="article-item-template">
				<div class="newdoc__article-item" draggable="true">
					<div class="newdoc__article-header">
						<h4 class="newdoc__article-title"></h4>
						<div class="newdoc__article-price">
							<span class="newdoc__price-value"></span>
							<span class="newdoc__price-currency">€ HT</span>
						</div>
					</div>
					<p class="newdoc__article-description"></p>
					<div class="newdoc__article-meta">
						<div class="newdoc__article-tags">
							<span class="newdoc__article-tax"></span>
							<span class="newdoc__article-period"></span>
						</div>
						<button class="newdoc__article-add-btn" title="Ajouter cet article">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
			</template>

			<template id="selected-article-template">
				<div class="newdoc__selected-item">
					<div class="newdoc__order-indicator">
						<span class="newdoc__order-number"></span>
					</div>
					<div class="newdoc__selected-content">
						<div class="newdoc__selected-header">
							<h4 class="newdoc__selected-title"></h4>
							<div class="newdoc__selected-controls">
								<button class="newdoc__option-toggle" title="Marquer comme option" data-option="false">
									<i class="fas fa-star-o"></i>
								</button>
								<button class="newdoc__move-btn newdoc__move-up" title="Monter">
									<i class="fas fa-chevron-up"></i>
								</button>
								<button class="newdoc__move-btn newdoc__move-down" title="Descendre">
									<i class="fas fa-chevron-down"></i>
								</button>
								<button class="newdoc__remove-item" title="Retirer cet article">
									<i class="fas fa-times"></i>
								</button>
							</div>
						</div>
						<p class="newdoc__selected-description"></p>
						<div class="newdoc__selected-meta">
							<span class="newdoc__selected-price"></span>
							<span class="newdoc__selected-tax"></span>
							<span class="newdoc__option-badge" style="display: none;">OPTION</span>
						</div>
					</div>
				</div>
			</template>

			<template id="user-item-template">
				<div class="newdoc__user-list-item">
					<div class="newdoc__user-avatar">
						<img class="newdoc__user-picture" src="" alt="" style="display: none;">
						<div class="newdoc__user-initials" style="display: none;"></div>
					</div>
					<div class="newdoc__user-info">
						<h4 class="newdoc__user-name"></h4>
						<p class="newdoc__user-email"></p>
					</div>
					<input type="checkbox" class="newdoc__user-checkbox" title="Partager avec cet utilisateur">
				</div>
			</template>

			<template id="selected-user-template">
				<div class="newdoc__selected-item">
					<div class="newdoc__selected-content">
						<div class="newdoc__selected-header">
							<div class="newdoc__user-avatar" style="margin-right: 1rem;">
								<img class="newdoc__selected-user-picture" src="" alt="" style="display: none;">
								<div class="newdoc__selected-user-initials" style="display: none;"></div>
							</div>
							<div class="newdoc__user-info" style="flex: 1;">
								<h4 class="newdoc__selected-user-name"></h4>
								<p class="newdoc__selected-user-email"></p>
							</div>
							<button class="newdoc__remove-user newdoc__remove-item" title="Retirer cet utilisateur">
								<i class="fas fa-times"></i>
							</button>
						</div>
					</div>
				</div>
			</template>

			<script type="module" src="<?= BASE_URL . '/src/View/Public/JS/newDoc.js'?>"></script>
		</section>