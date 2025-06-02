async function getTotalClient() {
	try {
		const res = await fetch('https://assured-concise-ladybird.ngrok-free.app/drawup_demo/api_drawup/api/client/total', {
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

		const totalClients = document.getElementById("totalClients");

		if (res.ok && data.success) {
			totalClients.textContent = data.totalClients;
			return data.totalClients;
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
	getTotalClient();
});