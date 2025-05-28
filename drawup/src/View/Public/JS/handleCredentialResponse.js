async function handleCredentialResponse(response) {
	const credential = response.credential;

	try {
		const res = await fetch('http://localhost/drawup_demo/api_drawup/api/user/login', {
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
		console.log("Réponse de l'API :", data);

		if (res.ok && data.success) {
			console.log("Connecté:", data.user.name);
			window.location.href = "http://localhost/drawup_demo/drawup/pannel";
		} else if (data.redirect === "/wait") {
			window.location.href = "http://localhost/drawup_demo/drawup/wait";
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
