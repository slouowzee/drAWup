document.addEventListener("DOMContentLoaded", () => {
	const desktopBtn = document.querySelector(".theme__toggle");
	const mobileBtn = document.querySelector(".theme__toggle-mobile");
	const otherBtn = document.querySelector(".second__theme__toggle");

	const updateIcons = () => {
		const isDark = document.body.classList.contains("dark-theme");
		const iconClass = isDark ? "fa-moon" : "fa-sun";

		// Debug pour vérifier si otherBtn est trouvé
		console.log("otherBtn:", otherBtn);

		[desktopBtn, mobileBtn, otherBtn].forEach((btn) => {
			if (btn) {
				const icon = btn.querySelector("i");
				if (icon) {
					icon.classList.remove("fa-sun", "fa-moon");
					icon.classList.add(iconClass);
				}
			}
		});
	};

	const toggleTheme = () => {
		document.body.classList.toggle("dark-theme");
		localStorage.setItem(
			"theme",
			document.body.classList.contains("dark-theme") ? "dark" : "light"
		);
		updateIcons();
	};

	// Vérifier si les boutons existent avant d'ajouter les event listeners
	if (desktopBtn) desktopBtn.addEventListener("click", toggleTheme);
	if (mobileBtn) mobileBtn.addEventListener("click", toggleTheme);
	if (otherBtn) otherBtn.addEventListener("click", toggleTheme);

	// Appliquer le thème sauvegardé
	if (localStorage.getItem("theme") === "dark") {
		document.body.classList.add("dark-theme");
	}
	updateIcons();
});
