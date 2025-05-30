const sidebar = document.querySelector('.pannel__navbar');
const toggleSidebarBtn = document.querySelector('.sidebar__toggle');
const toggleMobileBtn = document.querySelector('.mobile__menu-toggle');

function isTabletView() {
	return window.innerWidth >= 768 && window.innerWidth <= 1023;
}

function handleResponsiveSidebar() {
	if (isTabletView()) {
		sidebar.classList.add('collapsed');
	} else {
		sidebar.classList.remove('collapsed');
	}
}

if (toggleSidebarBtn) {
	toggleSidebarBtn.addEventListener('click', () => {
		sidebar.classList.toggle('collapsed');
	});
}

if (toggleMobileBtn) {
	toggleMobileBtn.addEventListener('click', () => {
		sidebar.classList.toggle('mobile-open');
	});
}

document.addEventListener('click', (e) => {
	if (
		sidebar.classList.contains('mobile-open') &&
		!sidebar.contains(e.target) &&
		!toggleMobileBtn.contains(e.target)
	) {
		sidebar.classList.remove('mobile-open');
	}
});

window.addEventListener('DOMContentLoaded', handleResponsiveSidebar);

window.addEventListener('resize', handleResponsiveSidebar);
