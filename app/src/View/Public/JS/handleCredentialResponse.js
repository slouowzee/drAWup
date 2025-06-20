/**
 * Gestionnaire de réponse d'authentification Google OAuth2
 * Traite la réponse de connexion Google et gère la redirection utilisateur
 * 
 * @param {Object} response - Réponse de Google contenant le credential JWT
 */
async function handleCredentialResponse(response) {
	const credential = response.credential;

	try {
		const res = await fetch(API_URL + '/user/login', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ credential })
		});

		const contentType = res.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error("Réponse invalide : pas du JSON.");
		}

		const data = await res.json();

		if (res.ok && data.success && data.redirect === "/pannel") {
			// Sauvegarder les données utilisateur dans localStorage
			localStorage.setItem("user_id", data.user['id']);
			localStorage.setItem("user_name", data.user['name']);
			localStorage.setItem("user_email", data.user['email']);
			localStorage.setItem("user_valid", data.user['valid']);
			localStorage.setItem("user_picture", data.user['picture']);
			localStorage.setItem("user_authToken", data.user['authToken']);

			window.location.href = BASE_URL + "/pannel";
		} else if (data.redirect === "/wait") {
			window.location.href = BASE_URL + "/wait";
		} else {
			console.error("Erreur API :", data.error || "Réponse inattendue");
			alert("Erreur de connexion : " + (data.error || "inconnue"));
		}
	} catch (err) {
		console.error("Erreur côté client:", err);
		alert("Erreur de connexion au serveur.");
	}
}

/**
 * Vérifie si l'utilisateur est déjà authentifié via localStorage
 * et redirige vers /pannel si c'est le cas
 */
function checkAuthAndRedirect() {
	const requiredItems = ['user_id', 'user_name', 'user_email', 'user_valid', 'user_picture', 'user_authToken'];
	
	const hasAllItems = requiredItems.every(item => localStorage.getItem(item) !== null);
	
	if (hasAllItems) {
		window.location.href = BASE_URL + "/pannel";
		return true;
	}
	return false;
}

window.handleCredentialResponse = handleCredentialResponse;
window.addEventListener('load', checkAuthAndRedirect);