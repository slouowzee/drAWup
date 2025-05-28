async function getTotalArticle() {
	try {
		const res = await fetch('http://localhost/drawup_demo/api_drawup/api/article/total', {
			method: 'GET',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		});

		const contentType = res.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error("Réponse invalide : pas du JSON.");
		}

		const data = await res.json();
		console.log("Réponse de l'API :", data);

		const totalArticles = document.getElementById("totalArticles");

		if (res.ok && data.success) {
			totalArticles.textContent = data.totalArticles;
			return data.totalArticles;
		} else {
			console.error("Erreur API :", data.error || "Réponse inattendue");
			alert("Erreur lors de la récupération des données : " + (data.error || "inconnue"));
			return null;
		}
	} catch (err) {
		console.error("Erreur lors de la récupération:", err);
		return null;
	}
}
document.addEventListener('DOMContentLoaded', function() {
	getTotalArticle();
});