			<section class="pannel__content">
				<div class="pannel__content-header" style="display: flex; align-items: center; gap: 1rem;">
					<img id="header-picture" alt="Photo de profil" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
					<h1 id="welcome" class="pannel__content-title"></h1>
				</div>

				<div class="pannel__content-all">
					<div class="pannel__content-quick-actions">
						<h2 class="pannel__content-quick-actions-title">Quelques petites actions rapide ?</h2>

						<div class="pannel__content-quick-actions-list">
							<h3 class="pannel__content-quick-actions-separator-title">Client</h3>
							<hr class="pannel__content-quick-actions-separator"/>
							
							<a href="<?= BASE_URL . '/pannel/client/add' ?>" class="pannel__content-quick-actions-item-create">
								<span class="bg-gradient"></span>
								Ajouter un client
							</a>
							<a href="<?= BASE_URL . '/pannel/client' ?>" class="pannel__content-quick-actions-item-modify">
								<span class="bg-gradient"></span>
								Modifier un client
							</a>

							<h3 class="pannel__content-quick-actions-separator-title">Article</h3>
							<hr class="pannel__content-quick-actions-separator"/>

							<a href="<?= BASE_URL . '/pannel/lib/add' ?>" class="pannel__content-quick-actions-item-create">
								<span class="bg-gradient"></span>
								Créer un article
							</a>
							<a href="<?= BASE_URL . '/pannel/lib' ?>" class="pannel__content-quick-actions-item-modify">
								<span class="bg-gradient"></span>
								Modifier un article
							</a> 
						</div>
					</div>

					<div class="pannel__content-stats">
						<h3 class="pannel__content-stats-title">Statistiques</h3>
						<div class="pannel__content-stats-item">
							<span class="pannel__content-stats-item-label">Nombre de clients :</span>
							<span class="pannel__content-stats-item-value" id="totalClients">...</span>
						</div>
						<div class="pannel__content-stats-item">
							<span class="pannel__content-stats-item-label">Articles existant :</span>
							<span class="pannel__content-stats-item-value" id="totalArticles">...</span>
						</div>
					</div>

					<div class="pannel__content-more-info">
						<div class="pannel__content-more-info-user">
							<div class="pannel__content-more-info-user-info">
								Vous êtes connecté en tant que 
								<img id="footer-picture" alt="Photo de profil" class="pannel__content-more-info-user-image">
								<span id="name" class="pannel__content-more-info-user-name"></span>
								<span id="email" class="pannel__content-more-info-user-email"></span>
							</div>
						</div>
					</div>
				</div>
			</section>

			<script>
				document.addEventListener('DOMContentLoaded', function() {
					const welcomeElement = document.getElementById('welcome');
					const headerPictureElement = document.getElementById('header-picture');
					const footerPictureElement = document.getElementById('footer-picture');
					const nameElement = document.getElementById('name');
					const emailElement = document.getElementById('email');

					welcomeElement.textContent = `Bienvenue ${localStorage.getItem('user_name')} !`;
					headerPictureElement.src = localStorage.getItem('user_picture');
					footerPictureElement.src = localStorage.getItem('user_picture');
					nameElement.textContent = localStorage.getItem('user_name');
					emailElement.textContent = `(${localStorage.getItem('user_email')})`;
				});
			</script>
			<script src="<?= BASE_URL . '/src/View/Public/JS/getTotalClient.js'?>"></script>
			<script src="<?= BASE_URL . '/src/View/Public/JS/getTotalArticle.js'?>"></script>
