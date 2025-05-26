const sidebar = document.querySelector('.pannel__navbar');
const toggleSidebarBtn = document.querySelector('.sidebar__toggle');
const toggleMobileBtn = document.querySelector('.mobile__menu-toggle');

// Fonction pour vérifier si on est en mode tablette
function isTabletView() {
	return window.innerWidth >= 768 && window.innerWidth <= 1023;
}

// Appliquer ou retirer la classe 'collapsed' selon la taille de l'écran
function handleResponsiveSidebar() {
	if (isTabletView()) {
		sidebar.classList.add('collapsed');
	} else {
		sidebar.classList.remove('collapsed');
	}
}

// Toggle sidebar (desktop + tablette)
if (toggleSidebarBtn) {
	toggleSidebarBtn.addEventListener('click', () => {
		sidebar.classList.toggle('collapsed');
	});
}

// Toggle menu mobile
if (toggleMobileBtn) {
	toggleMobileBtn.addEventListener('click', () => {
		sidebar.classList.toggle('mobile-open');
	});
}

// Fermer le menu mobile en cliquant à l'extérieur
document.addEventListener('click', (e) => {
	if (
		sidebar.classList.contains('mobile-open') &&
		!sidebar.contains(e.target) &&
		!toggleMobileBtn.contains(e.target)
	) {
		sidebar.classList.remove('mobile-open');
	}
});

// Exécuter au chargement de la page
window.addEventListener('DOMContentLoaded', handleResponsiveSidebar);

// Re-vérifier lors d'un redimensionnement
window.addEventListener('resize', handleResponsiveSidebar);
