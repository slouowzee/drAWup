		<main class="login__container">
			<div class="login">
				<script src="https://accounts.google.com/gsi/client" async defer></script>

				<img class="login__logo" src="src/View/Public/IMG/drawup_wo_bg.png" alt="Logo drAW up">
				
				<div id="g_id_onload"
					data-client_id="248016549737-muuo2uhaem854v3imejpuhrrmjj68qav.apps.googleusercontent.com"
					data-callback="handleCredentialResponse"
					data-auto_prompt="false">
				</div>

				<div class="g_id_signin"
					data-type="standard"
					data-shape="pill"
					data-theme="outline"
					data-text="continue_with"
					data-size="large"
					data-logo_alignment="left">
				</div>

				<script>
					async function handleCredentialResponse(response) {
						const credential = response.credential;

						try {
							const res = await fetch('http://localhost/drawup_demo/API_drAWup/api/login', {
								method: 'POST',
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
								window.location.href = "http://localhost/drAWup_demo/drAWup/pannel";
							} else if (data.redirect === "/wait") {
								window.location.href = "http://localhost/drAWup_demo/drAWup/wait";
							} else {
								console.error("Erreur API :", data.error || "Réponse inattendue");
								alert("Erreur de connexion : " + (data.error || "inconnue"));
							}
						} catch (err) {
							console.error("Erreur côté client:", err);
							alert("Erreur de connexion au serveur.");
						}
					}
				</script>
			</div>
