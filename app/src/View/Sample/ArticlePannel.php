		<section class="pannel__content">
			<div class="pannel__content-article-header">
				<div class="pannel__content-header-main">
					<h1 class="pannel__content-title">
						<i class="fas fa-book"></i>
						Bibliothèque d'articles
					</h1>
				</div>
				<div class="pannel__content-header-actions">
					<a href="<?= BASE_URL ?>/pannel/lib/add" class="btn btn--primary btn--create-article">
						<i class="fas fa-plus"></i>
						Créer un article
					</a>
				</div>
			</div>

			<div class="pannel__content-filters">
				<div class="search-container">
					<div class="search-input-wrapper">
						<i class="fas fa-search search-icon"></i>
						<input type="text" id="article-search" class="search-input" placeholder="Rechercher un article par titre...">
						<button type="button" id="reset-search" class="search-reset" title="Effacer la recherche">
							<i class="fas fa-times"></i>
						</button>
					</div>
				</div>
				
				<div class="filter-controls">
					<select id="items-per-page" class="filter-select">
						<option value="6">6 par page</option>
						<option value="12" selected>12 par page</option>
						<option value="18">18 par page</option>
						<option value="24">24 par page</option>
					</select>
				</div>
			</div>

			<div class="pannel__content-stats-bar">
				<div class="stats-item">
					<span class="stats-label">Total articles:</span>
					<span id="total-articles" class="stats-value">-</span>
				</div>
				<div class="stats-item">
					<span class="stats-label">Page courante:</span>
					<span id="current-page" class="stats-value">1</span>
					<span class="stats-separator">/</span>
					<span id="total-pages" class="stats-value">1</span>
				</div>
			</div>

			<div id="articles-container" class="articles-grid">
			</div>

			<div class="loading-indicator" id="loading-indicator">
				<i class="fas fa-spinner fa-spin"></i>
				<span>Chargement des articles...</span>
			</div>

			<div class="pagination-container">
				<button id="first-page" class="pagination-btn pagination-btn--nav" title="Première page">
					<i class="fas fa-angle-double-left"></i>
				</button>
				<button id="prev-page" class="pagination-btn pagination-btn--nav" title="Page précédente">
					<i class="fas fa-angle-left"></i>
				</button>
				
				<div class="pagination-info">
					<span>Page</span>
					<span id="current-page-display" class="current-page">1</span>
					<span>sur</span>
					<span id="total-pages-display" class="total-pages">1</span>
				</div>
				
				<button id="next-page" class="pagination-btn pagination-btn--nav" title="Page suivante">
					<i class="fas fa-angle-right"></i>
				</button>
				<button id="last-page" class="pagination-btn pagination-btn--nav" title="Dernière page">
					<i class="fas fa-angle-double-right"></i>
				</button>
			</div>

			<template id="article-widget-template">
				<div class="article-widget">
					<div class="article-widget__header">
						<h3 class="article-widget__title"></h3>
						<div class="article-widget__prices">
							<div class="article-widget__price article-widget__price--ht">
								<span class="price-value price-value--ht"></span>
								<span class="price-currency">€ HT</span>
							</div>
							<div class="article-widget__price article-widget__price--ttc">
								<span class="price-value price-value--ttc"></span>
								<span class="price-currency">€ TTC</span>
							</div>
						</div>
					</div>
					
					<div class="article-widget__content">
						<p class="article-widget__description"></p>
					</div>
					
					<div class="article-widget__meta">
						<div class="article-widget__info">
							<span class="meta-item">
								<i class="fas fa-percentage"></i>
								<span class="tax-value"></span>
							</span>
							<span class="meta-item">
								<i class="fas fa-clock"></i>
								<span class="period-value"></span>
							</span>
						</div>
					</div>
					
					<div class="article-widget__actions">
						<button class="btn btn--view" title="Voir l'article">
							<i class="fas fa-eye"></i>
							<span>Voir</span>
						</button>
						<button class="btn btn--edit" title="Modifier l'article">
							<i class="fas fa-edit"></i>
							<span>Modifier</span>
						</button>
						<button class="btn btn--delete" title="Supprimer l'article">
							<i class="fas fa-trash"></i>
							<span>Supprimer</span>
						</button>
					</div>
				</div>
			</template>
			<script type="module" src="<?= BASE_URL . '/src/View/Public/JS/loadArticle.js'?>"></script>
		</section>
