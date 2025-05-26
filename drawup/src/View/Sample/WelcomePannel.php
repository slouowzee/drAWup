			<section class="pannel__content">
				<div class="pannel__content-header" style="display: flex; align-items: center; gap: 1rem;">
					<?php if (!empty($_SESSION['user_picture'])): ?>
						<img src="<?= htmlspecialchars($_SESSION['user_picture']) ?>" alt="Photo de profil" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
					<?php endif; ?>
					<h1 class="pannel__content-title">Bienvenue <?= htmlspecialchars($_SESSION['user_name']) ?> !</h1>
				</div>
			</section>
