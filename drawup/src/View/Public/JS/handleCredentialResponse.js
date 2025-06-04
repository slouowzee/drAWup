async function handleCredentialResponse(response) {
	if (typeof BASE_URL === 'undefined') {
		console.error('La constante BASE_URL n\'est pas définie. La redirection des boutons peut ne pas fonctionner correctement.');
		window.BASE_URL = 'https://assured-concise-ladybird.ngrok-free.app/drawup_demo/drawup';
	}

	const credential = response.credential;

	try {
		const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
		const res = await fetch(`${baseUrl.replace('/drawup_demo/drawup', '')}/drawup_demo/api_drawup/api/user/login`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ credential })
		});
		console.log("ID Token Google reçu :", credential);


		const contentType = res.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error("Réponse invalide : pas du JSON.");
		}

		const data = await res.json();
		console.log("Réponse de l'API :", data);

		if (res.ok && data.success) {
			console.log("Connecté:", data.user.name);
			const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
			window.location.href = `${baseUrl}/pannel`;
		} else if (data.redirect === "/wait") {
			const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
			window.location.href = `${baseUrl}/wait`;
		} else {
			console.error("Erreur API :", data.error || "Réponse inattendue");
			alert("Erreur de connexion : " + (data.error || "inconnue"));
		}
	} catch (err) {
		console.error("Erreur côté client:", err);
		alert("Erreur de connexion au serveur.");
	}
}

window.handleCredentialResponse = handleCredentialResponse;