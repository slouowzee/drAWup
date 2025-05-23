const sidebar = document.querySelector('.pannel__navbar');
const toggleSidebarBtn = document.querySelector('.sidebar__toggle');
const toggleMobileBtn = document.querySelector('.mobile__menu-toggle');

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

// Optional: close mobile menu on outside click
document.addEventListener('click', (e) => {
	if (
		sidebar.classList.contains('mobile-open') &&
		!sidebar.contains(e.target) &&
		!toggleMobileBtn.contains(e.target)
	) {
		sidebar.classList.remove('mobile-open');
	}
});
