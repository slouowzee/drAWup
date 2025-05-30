		<main class="pannel__container">
			<aside class="pannel__navbar">
				<div class="navbar__logo-wrapper">
					<!-- Logo clair -->
					<a href="<?php echo BASE_URL . '/pannel'?>"><img class="navbar__logo logo-light" src="<?php echo BASE_URL . 'src/View/Public/IMG/drawup-wo-bg.png'?>" alt="Logo clair"></a>

					<!-- Logo foncé -->
					<a href="<?php echo BASE_URL . '/pannel'?>"><img class="navbar__logo logo-dark" src="<?php echo BASE_URL . 'src/View/Public/IMG/drawup-blanc-wo-bg.png'?>" alt="Logo sombre"></a>
				</div>

				<nav class="navbar__content">
					<div class="navbar__logo-mobile">
						<a href="<?php echo BASE_URL . '/pannel'?>"><img class="navbar__logo logo-light" src="<?php echo BASE_URL . 'src/View/Public/IMG/drawup-wo-bg.png'?>" alt="Logo clair"></a>
						<a href="<?php echo BASE_URL . '/pannel'?>"><img class="navbar__logo logo-dark" src="<?php echo BASE_URL . 'src/View/Public/IMG/drawup-blanc-wo-bg.png'?>" alt="Logo sombre"></a>
					</div>

					<ul class="navbar__menu">
						<li>
							<a href="<?php echo BASE_URL . '/pannel/lib'?>"><i class="fa-solid fa-book"></i><span>Bibliothèque</span></a>
						</li>
						<li>
							<a href="<?php echo BASE_URL . '/pannel/new'?>"><i class="fa-solid fa-pen"></i><span>Nouveau</span></a>
						</li>
						<li>
							<a href="<?php echo BASE_URL . '/pannel/client'?>"><i class="fa-solid fa-users"></i><span>Clients</span></a>
						</li>
						<li>
							<a href="<?php echo BASE_URL . '/logout'?>"><i class="fa-solid fa-right-from-bracket"></i><span>Déconnexion</span></a>
						</li>
					</ul>

					<button class="theme__toggle-mobile" type="button">
						<i class="fas fa-sun"></i>
						<span>Thème</span>
					</button>
				</nav>

				<div class="navbar__bottom">
					<button class="theme__toggle">
						<i class="fa-solid fa-circle-half-stroke"></i>
						<span>Thème</span>
					</button>

					<button class="sidebar__toggle">
						<i class="fa-solid fa-bars"></i>
						<span>Réduire</span>
					</button>
				</div>

				<button class="mobile__menu-toggle">
					<i class="fa-solid fa-bars"></i>
				</button>
			</aside>
			<script type="module" src="<?= BASE_URL . 'src/View/Public/JS/theme.js'?>"></script>
			<script type="module" src="<?= BASE_URL . 'src/View/Public/JS/sidebar.js'?>"></script>
