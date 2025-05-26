document.addEventListener("DOMContentLoaded", () => {
	const desktopBtn = document.querySelector(".theme__toggle");
	const mobileBtn = document.querySelector(".theme__toggle-mobile");

	const toggleTheme = () => {
		document.body.classList.toggle("dark-theme");
		localStorage.setItem(
			"theme",
			document.body.classList.contains("dark-theme") ? "dark" : "light"
		);
	};

	desktopBtn?.addEventListener("click", toggleTheme);
	mobileBtn?.addEventListener("click", toggleTheme);

	// Appliquer le thème sauvegardé
	if (localStorage.getItem("theme") === "dark") {
		document.body.classList.add("dark-theme");
	}
});
