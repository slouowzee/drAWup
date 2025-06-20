/**
 * Module de gestion de l'affichage des articles
 * Gère le chargement, l'affichage paginé, la recherche et les interactions avec les articles
 * Inclut la gestion des modals de visualisation et la suppression d'articles
 */
import NotificationManager from './utils/notifications.js';

document.addEventListener('DOMContentLoaded', function() {
	let currentPage = 1;
	let itemsPerPage = 12;
	let totalArticles = 0;
	let allArticles = [];
	let filteredArticles = [];
	let isSearching = false;

	loadArticles();
	setupEventListeners();

	/**
	 * Configure tous les écouteurs d'événements pour la pagination et la recherche
	 */
	function setupEventListeners() {
		const searchInput = document.getElementById('article-search');
		const resetButton = document.getElementById('reset-search');
		
		if (searchInput) {
			let searchTimeout;
			searchInput.addEventListener('input', function() {
				clearTimeout(searchTimeout);
				searchTimeout = setTimeout(() => {
					performSearch(this.value.trim());
				}, 300);
			});
		}

		if (resetButton) {
			resetButton.addEventListener('click', function() {
				searchInput.value = '';
				resetSearch();
			});
		}

		const itemsSelect = document.getElementById('items-per-page');
		if (itemsSelect) {
			itemsSelect.addEventListener('change', function() {
				itemsPerPage = parseInt(this.value);
				currentPage = 1;
				displayArticles(getCurrentArticles());
				updatePagination();
			});
		}

		document.getElementById('prev-page')?.addEventListener('click', () => {
			if (currentPage > 1) {
				currentPage--;
				displayArticles(getCurrentArticles());
				updatePagination();
			}
		});

		document.getElementById('next-page')?.addEventListener('click', () => {
			const totalPages = getTotalPages();
			if (currentPage < totalPages) {
				currentPage++;
				displayArticles(getCurrentArticles());
				updatePagination();
			}
		});

		document.getElementById('first-page')?.addEventListener('click', () => {
			if (currentPage !== 1) {
				currentPage = 1;
				displayArticles(getCurrentArticles());
				updatePagination();
			}
		});

		document.getElementById('last-page')?.addEventListener('click', () => {
			const totalPages = getTotalPages();
			if (currentPage !== totalPages) {
				currentPage = totalPages;
				displayArticles(getCurrentArticles());
				updatePagination();
			}
		});
	}

	/**
	 * Nettoie le localStorage des données utilisateur lors de la déconnexion forcée
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
	 * Charge tous les articles depuis l'API avec gestion d'erreur
	 * Gère la redirection automatique si le compte n'est pas validé
	 */
	async function loadArticles() {
		showLoading(true);
		
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

			const responseText = await response.text();
			let data;
			try {
				data = JSON.parse(responseText);
				console.log("📥 Réponse de l'API articles :", data);
			} catch (parseError) {
				throw new Error("Réponse invalide - pas du JSON valide");
			}

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
				allArticles = data.articles || [];
				filteredArticles = [...allArticles];
				totalArticles = allArticles.length;
				
				displayArticles(getCurrentArticles());
				updateStats();
				updatePagination();
				
				if (allArticles.length === 0) {
					showEmptyState('Aucun article trouvé', 'Commencez par créer votre premier article.');
				}
			} else {
				if (response.status === 404) {
					allArticles = [];
					filteredArticles = [];
					totalArticles = 0;
					showEmptyState('Aucun article trouvé', 'Commencez par créer votre premier article.');
					updateStats();
					updatePagination();
				} else {
					throw new Error(data.error || 'Erreur lors du chargement des articles');
				}
			}
		} catch (error) {
			NotificationManager.error('Erreur lors du chargement des articles: ' + error.message);
			showEmptyState('Erreur de chargement', 'Impossible de charger les articles.');
		} finally {
			showLoading(false);
		}
	}

	/**
	 * Retourne les articles à afficher pour la page courante
	 * 
	 * @return {Array} Articles filtrés et paginés
	 */
	function getCurrentArticles() {
		const articles = isSearching ? filteredArticles : allArticles;
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return articles.slice(start, end);
	}

	/**
	 * Calcule le nombre total de pages selon le filtre actuel
	 * 
	 * @return {number} Nombre total de pages
	 */
	function getTotalPages() {
		const articles = isSearching ? filteredArticles : allArticles;
		return Math.ceil(articles.length / itemsPerPage);
	}

	/**
	 * Effectue une recherche dans les articles par titre et description
	 * 
	 * @param {string} searchTerm - Terme de recherche
	 */
	function performSearch(searchTerm) {
		if (searchTerm.length === 0) {
			resetSearch();
			return;
		}

		isSearching = true;
		filteredArticles = allArticles.filter(article => {
			const title = (article.TITREARTICLE || '').toLowerCase();
			const description = (article.DESCARTICLE || '').toLowerCase();
			const term = searchTerm.toLowerCase();
			
			return title.includes(term) || description.includes(term);
		});

		currentPage = 1;
		displayArticles(getCurrentArticles());
		updateStats();
		updatePagination();

		if (filteredArticles.length === 0) {
			showEmptyState('Aucun résultat', `Aucun article trouvé pour "${searchTerm}".`);
		}
	}

	/**
	 * Remet à zéro la recherche et affiche tous les articles
	 */
	function resetSearch() {
		isSearching = false;
		filteredArticles = [...allArticles];
		currentPage = 1;
		displayArticles(getCurrentArticles());
		updateStats();
		updatePagination();
	}

	/**
	 * Affiche la liste des articles avec animation
	 * 
	 * @param {Array} articles - Articles à afficher
	 */
	function displayArticles(articles) {
		const container = document.getElementById('articles-container');
		const template = document.getElementById('article-widget-template');
		
		if (!container || !template) return;
		
		container.style.opacity = '0.7';
		container.style.transform = 'translateY(10px)';
		
		setTimeout(() => {
			container.innerHTML = '';

			if (!articles || articles.length === 0) {
				container.style.opacity = '1';
				container.style.transform = 'translateY(0)';
				return;
			}

			const fragment = document.createDocumentFragment();

			articles.forEach((article, index) => {
				const clone = document.importNode(template.content, true);
				
				const titleEl = clone.querySelector('.article-widget__title');
				if (titleEl) {
					titleEl.textContent = article.TITREARTICLE || 'Titre non disponible';
					titleEl.title = article.TITREARTICLE || 'Titre non disponible';
				}

				const priceHT = parseFloat(article.PRIXHT || 0);
				const taxRate = parseFloat(article.POURCENTTAXE || 0);
				const priceTTC = priceHT * (1 + taxRate / 100);

				const priceHTEl = clone.querySelector('.price-value--ht');
				const priceTTCEl = clone.querySelector('.price-value--ttc');
				
				if (priceHTEl) priceHTEl.textContent = priceHT.toFixed(2);
				if (priceTTCEl) priceTTCEl.textContent = priceTTC.toFixed(2);

				const descEl = clone.querySelector('.article-widget__description');
				if (descEl) {
					const description = article.DESCARTICLE || 'Aucune description disponible';
					descEl.textContent = description.length > 120 ? description.substring(0, 120) + '...' : description;
				}

				const taxEl = clone.querySelector('.tax-value');
				if (taxEl) {
					taxEl.textContent = article.POURCENTTAXE ? `${article.POURCENTTAXE}%` : 'Non définie';
				}

				const periodEl = clone.querySelector('.period-value');
				if (periodEl) {
					periodEl.textContent = article.LABELPERIODICITE || 'Non définie';
				}

				const widget = clone.querySelector('.article-widget');
				if (widget) {
					widget.style.opacity = '0';
					widget.style.transform = 'translateY(20px)';
					widget.style.transition = 'all 0.3s ease';
					
					widget.addEventListener('click', (e) => {
						const btn = e.target.closest('.btn');
						if (!btn) return;

						e.preventDefault();
						e.stopPropagation();

						if (btn.classList.contains('btn--view')) {
							viewArticle(article);
						} else if (btn.classList.contains('btn--edit')) {
							editArticle(article);
						} else if (btn.classList.contains('btn--delete')) {
							deleteArticle(article);
						}
					});
				}

				fragment.appendChild(clone);
			});

			container.appendChild(fragment);

			setTimeout(() => {
				const widgets = container.querySelectorAll('.article-widget');
				widgets.forEach((widget, index) => {
					setTimeout(() => {
						widget.style.opacity = '1';
						widget.style.transform = 'translateY(0)';
					}, index * 50);
				});

				container.style.opacity = '1';
				container.style.transform = 'translateY(0)';
			}, 50);
		}, 150);
	}

	/**
	 * Met à jour les statistiques d'affichage (nombre total d'articles)
	 */
	function updateStats() {
		const articles = isSearching ? filteredArticles : allArticles;
		document.getElementById('total-articles').textContent = articles.length;
	}

	/**
	 * Met à jour l'état des boutons de pagination
	 */
	function updatePagination() {
		const totalPages = getTotalPages();
		
		document.getElementById('current-page').textContent = currentPage;
		document.getElementById('total-pages').textContent = totalPages;
		document.getElementById('current-page-display').textContent = currentPage;
		document.getElementById('total-pages-display').textContent = totalPages;

		const firstBtn = document.getElementById('first-page');
		const prevBtn = document.getElementById('prev-page');
		const nextBtn = document.getElementById('next-page');
		const lastBtn = document.getElementById('last-page');

		if (firstBtn) firstBtn.disabled = (currentPage <= 1);
		if (prevBtn) prevBtn.disabled = (currentPage <= 1);
		if (nextBtn) nextBtn.disabled = (currentPage >= totalPages);
		if (lastBtn) lastBtn.disabled = (currentPage >= totalPages);
	}

	/**
	 * Affiche ou masque l'indicateur de chargement
	 * 
	 * @param {boolean} show - True pour afficher, false pour masquer
	 */
	function showLoading(show) {
		const loadingEl = document.getElementById('loading-indicator');
		const containerEl = document.getElementById('articles-container');
		
		if (loadingEl) {
			loadingEl.classList.toggle('show', show);
		}
		
		if (containerEl) {
			containerEl.style.display = show ? 'none' : 'grid';
		}
	}

	/**
	 * Affiche un état vide avec un message personnalisé
	 * 
	 * @param {string} title - Titre du message
	 * @param {string} message - Message descriptif
	 */
	function showEmptyState(title, message) {
		const container = document.getElementById('articles-container');
		if (!container) return;

		container.innerHTML = `
			<div class="empty-state" style="grid-column: 1 / -1;">
				<i class="fas fa-book-open"></i>
				<h3>${title}</h3>
				<p>${message}</p>
			</div>
		`;
	}

	/**
	 * Lance la visualisation d'un article dans une modal
	 * 
	 * @param {Object} article - Article à visualiser
	 */
	function viewArticle(article) {
		showArticleModal(article);
	}

	/**
	 * Crée et affiche la modal de visualisation d'un article
	 * 
	 * @param {Object} article - Article à afficher dans la modal
	 */
	function showArticleModal(article) {
		const priceHT = parseFloat(article.PRIXHT || 0);
		const taxRate = parseFloat(article.POURCENTTAXE || 0);
		const priceTTC = priceHT * (1 + taxRate / 100);

		const modal = document.createElement('div');
		modal.className = 'article-modal';
		modal.innerHTML = `
			<div class="article-modal__backdrop"></div>
			<div class="article-modal__container">
				<div class="article-modal__header">
					<h2 class="article-modal__title">${article.TITREARTICLE || 'Article'}</h2>
					<button class="article-modal__close" title="Fermer">
						<i class="fas fa-times"></i>
					</button>
				</div>
				<div class="article-modal__content">
					<div class="article-modal__meta">
						<div class="article-modal__meta-item">
							<strong>Prix HT:</strong> 
							<span class="article-modal__price">${priceHT.toFixed(2)} € HT</span>
						</div>
						<div class="article-modal__meta-item">
							<strong>Prix TTC:</strong> 
							<span class="article-modal__price-ttc">${priceTTC.toFixed(2)} € TTC</span>
						</div>
						<div class="article-modal__meta-item">
							<strong>TVA:</strong> 
							<span>${article.POURCENTTAXE ? `${article.POURCENTTAXE}%` : 'Non définie'}</span>
						</div>
						<div class="article-modal__meta-item">
							<strong>Périodicité:</strong> 
							<span>${article.LABELPERIODICITE || 'Non définie'}</span>
						</div>
					</div>
					${article.DESCARTICLE ? `<div class="article-modal__description">
						<h3>Description</h3>
						<p>${article.DESCARTICLE}</p>
					</div>` : ''}
					<div class="article-modal__body">
						<h3>Contenu</h3>
						<div class="article-modal__html-content">
							${article.CONTENUARTICLE && article.CONTENUARTICLE.trim() ? article.CONTENUARTICLE : '<p><em>Aucun contenu disponible</em></p>'}
						</div>
					</div>
				</div>
				<div class="article-modal__footer">
					<button class="btn btn--secondary article-modal__btn-close">
						<i class="fas fa-times"></i>
						Fermer
					</button>
					<button class="btn btn--primary article-modal__btn-edit">
						<i class="fas fa-edit"></i>
						Modifier
					</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		setTimeout(() => {
			modal.classList.add('article-modal--show');
		}, 10);

		const closeModal = () => {
			modal.classList.remove('article-modal--show');
			setTimeout(() => {
				if (modal.parentNode) {
					modal.parentNode.removeChild(modal);
				}
			}, 300);
		};

		modal.querySelector('.article-modal__close').addEventListener('click', closeModal);
		modal.querySelector('.article-modal__btn-close').addEventListener('click', closeModal);
		modal.querySelector('.article-modal__backdrop').addEventListener('click', closeModal);
		
		modal.querySelector('.article-modal__btn-edit').addEventListener('click', () => {
			closeModal();
			setTimeout(() => {
				editArticle(article);
			}, 300);
		});

		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				closeModal();
				document.removeEventListener('keydown', handleEscape);
			}
		};
		document.addEventListener('keydown', handleEscape);

		document.body.style.overflow = 'hidden';
		
		const originalCloseModal = closeModal;
		const newCloseModal = () => {
			document.body.style.overflow = '';
			document.removeEventListener('keydown', handleEscape);
			originalCloseModal();
		};
		
		modal.querySelector('.article-modal__close').removeEventListener('click', closeModal);
		modal.querySelector('.article-modal__btn-close').removeEventListener('click', closeModal);
		modal.querySelector('.article-modal__backdrop').removeEventListener('click', closeModal);
		
		modal.querySelector('.article-modal__close').addEventListener('click', newCloseModal);
		modal.querySelector('.article-modal__btn-close').addEventListener('click', newCloseModal);
		modal.querySelector('.article-modal__backdrop').addEventListener('click', newCloseModal);
	}

	/**
	 * Redirige vers la page d'édition d'un article
	 * 
	 * @param {Object} article - Article à éditer
	 */
	function editArticle(article) {
		sessionStorage.setItem('editArticleData', JSON.stringify({
			id: article.id,
			title: article.TITREARTICLE
		}));
		window.location.href = `${BASE_URL}/pannel/lib/${article.id}`;
	}

	/**
	 * Supprime un article après confirmation utilisateur
	 * 
	 * @param {Object} article - Article à supprimer
	 */
	function deleteArticle(article) {
		if (!confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.TITREARTICLE}" ?`)) {
			return;
		}

		const loadingNotif = NotificationManager.show('Suppression en cours...', 'info', 0);

		fetch(API_URL + `/article/delete/${article.id}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				'User-ID': localStorage.getItem('user_id'),
				'Authorization': localStorage.getItem('user_authToken')
			}
		})
		.then(response => response.json())
		.then(data => {
			NotificationManager.dismiss(loadingNotif);
			
			if (data.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}

			if (data.error === "Token invalide ou expiré" || data.error === "Unauthorized") {
				clearUserStorage();
				window.location.href = BASE_URL + '/';
				return;
			}
			
			console.log("📥 Réponse de suppression article :", data);
			
			if (data.success) {
				NotificationManager.success('Article supprimé avec succès');
				loadArticles();
			} else {
				throw new Error(data.error || 'Erreur lors de la suppression');
			}
		})
		.catch(error => {
			NotificationManager.dismiss(loadingNotif);
			NotificationManager.error('Erreur: ' + error.message);
		});
	}
});
