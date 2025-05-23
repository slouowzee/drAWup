		<main class="pannel__container">
			<aside class="pannel__navbar">
				<div class="navbar__logo-wrapper">
					<img class="navbar__logo" src="src/View/Public/IMG/drawup_wo_bg.png" alt="Logo">
				</div>

				<div class="navbar__content">
					<nav>
						<ul class="navbar__menu">
							<li>
								<a href="#"><i class="fa-solid fa-book"></i><span>Bibliothèque</span></a>
							</li>
							<li>
								<a href="#"><i class="fa-solid fa-pen"></i><span>Nouveau</span></a>
							</li>
							<li>
								<a href="#"><i class="fa-solid fa-users"></i><span>Clients</span></a>
							</li>
							<li>
								<a href="#"><i class="fa-solid fa-right-from-bracket"></i><span>Déconnexion</span></a>
							</li>
						</ul>
					</nav>
				</div>

				<!-- Boutons en bas de la sidebar -->
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

				<!-- Bouton mobile uniquement -->
				<button class="mobile__menu-toggle">
					<i class="fa-solid fa-bars"></i>
				</button>
			</aside>

			<section class="pannel__content">
				<h1>Bienvenue dans le panel</h1>
				<p>Contenu principal qui s'adapte selon la taille de l'écran.</p>
				<p>Testez le redimensionnement de la fenêtre pour voir les différents comportements :</p>
				<ul>
					<li><strong>Desktop (≥1024px)</strong> : Sidebar complète avec bouton de réduction</li>
					<li><strong>Tablet (768-1023px)</strong> : Sidebar automatiquement réduite</li>
					<li><strong>Mobile (≤767px)</strong> : Navbar horizontale avec menu overlay</li>
				</ul>
			</section>
