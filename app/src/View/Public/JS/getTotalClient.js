/**
 * Module de récupération du nombre total de clients
 * Affiche le total dans l'élément DOM correspondant du tableau de bord
 */

/**
 * Nettoie le localStorage des données utilisateur lors de la déconnexion forcée
 */
function clearUserStorage() {
	localStorage.removeItem('user_id');
	localStorage.removeItem('user_name');
	localStorage.removeItem('user_email');
	localStorage.removeItem('user_valid');
	localStorage.removeItem('user_picture');
	localStorage.removeItem('user_authToken');
	sessionStorage.clear();
}

/**
 * Récupère et affiche le nombre total de clients depuis l'API
 * Gère l'authentification et la redirection automatique si nécessaire
 * 
 * @return {Promise<number|null>} Le nombre total de clients ou null en cas d'erreur
 */
async function getTotalClient() {
	try {
		const res = await fetch(API_URL + '/client/total', {
			method: 'GET',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				'User-ID': localStorage.getItem('user_id'),
				'Authorization': localStorage.getItem('user_authToken')
			}
		});

		const contentType = res.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error("Réponse invalide : pas du JSON.");
		}

		const data = await res.json();
		console.log("Réponse de l'API :", data);

		if (res.status === 403 && data.error === "Compte non validé") {
			clearUserStorage();
			window.location.href = BASE_URL + '/wait';
			return null;
		}

		if (res.status === 401 && (data.error === "Token invalide ou expiré" || data.error === "Unauthorized")) {
			clearUserStorage();
			window.location.href = BASE_URL + '/';
			return null;
		}

		const totalClients = document.getElementById("totalClients");

		if (res.ok && data.success) {
			totalClients.textContent = data.totalClients;
			return data.totalClients;
		} else {
			console.error("Erreur API :", data.error || "Réponse inattendue");
			return null;
		}
	} catch (err) {
		console.error("Erreur lors de la récupération:", err);
		return null;
	}
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
	getTotalClient();
});