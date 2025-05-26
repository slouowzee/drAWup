document.addEventListener("DOMContentLoaded", () => {
	const desktopBtn = document.querySelector(".theme__toggle");
	const mobileBtn = document.querySelector(".theme__toggle-mobile");

	const updateIcons = () => {
		const isDark = document.body.classList.contains("dark-theme");

		const iconClass = isDark ? "fa-moon" : "fa-sun";

		[desktopBtn, mobileBtn].forEach((btn) => {
			const icon = btn?.querySelector("i");
			if (icon) {
				icon.classList.remove("fa-sun", "fa-moon");
				icon.classList.add(iconClass);
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

	desktopBtn?.addEventListener("click", toggleTheme);
	mobileBtn?.addEventListener("click", toggleTheme);

	// Appliquer le thème sauvegardé
	if (localStorage.getItem("theme") === "dark") {
		document.body.classList.add("dark-theme");
	}
	updateIcons();
});
