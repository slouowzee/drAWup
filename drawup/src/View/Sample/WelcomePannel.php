			<section class="pannel__content">
				<div class="pannel__content-header" style="display: flex; align-items: center; gap: 1rem;">
					<?php if (!empty($_SESSION['user_picture'])): ?>
						<img src="<?= htmlspecialchars($_SESSION['user_picture']) ?>" alt="Photo de profil" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
					<?php endif; ?>
					<h1 class="pannel__content-title">Bienvenue <?= htmlspecialchars($_SESSION['user_name']) ?> !</h1>
				</div>

				<div class="pannel__content-quick-actions">
					<h2 class="pannel__content-quick-actions-title">Quelques petites actions rapide ?</h2>

					<div class="pannel__content-quick-actions-list">
						<h3 class="pannel__content-quick-actions-separator-title">Client</h3>
						<hr class="pannel__content-quick-actions-separator"/>
						
						<a href="<?= BASE_URL . '' ?>" class="pannel__content-quick-actions-item-create">
							<span class="bg-gradient"></span>
							Ajouter un client
						</a>
						<a href="<?= BASE_URL . '' ?>" class="pannel__content-quick-actions-item-modify">
							<span class="bg-gradient"></span>
							Modifier un client
						</a>

						<h3 class="pannel__content-quick-actions-separator-title">Article</h3>
						<hr class="pannel__content-quick-actions-separator"/>

						<a href="<?= BASE_URL . '' ?>" class="pannel__content-quick-actions-item-create">
							<span class="bg-gradient"></span>
							Créer un article
						</a>
						<a href="<?= BASE_URL . '' ?>" class="pannel__content-quick-actions-item-modify">
							<span class="bg-gradient"></span>
							Modifier un article
						</a> 
					</div>
				</div>
			</section>
