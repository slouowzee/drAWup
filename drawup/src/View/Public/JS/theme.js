document.addEventListener("DOMContentLoaded", function () {
	const themeBtn = document.querySelector(".theme__toggle");

	if (themeBtn) {
		themeBtn.addEventListener("click", () => {
			document.body.classList.toggle("light-theme");
			const theme = document.body.classList.contains("light-theme") ? "light" : "dark";
			localStorage.setItem("theme", theme);
		});
	}

	// Appliquer le thème enregistré
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "light") {
		document.body.classList.add("light-theme");
	}
});
