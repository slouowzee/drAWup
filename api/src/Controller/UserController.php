<?php

	namespace Controller;

	use Google\Auth\AccessToken;
	use Model\User;

	/**
	 * Contrôleur pour l'authentification via Google OAuth2
	 * Gère la connexion et la validation des utilisateurs
	 */
	class UserController {

		/**
		 * Authentifie un utilisateur via Google OAuth2
		 * Vérifie le token ID, trouve ou crée l'utilisateur et gère la redirection
		 * 
		 * @return void
		 */
		public function googleLogin() {
			$input = json_decode(file_get_contents("php://input"), true);
			$idToken = $input['credential'] ?? null;

			if (!$idToken) {
				http_response_code(400);
				echo json_encode(["error" => "Token manquant", "debug" => $input]);
				return;
			}

			try {
				$accessToken = new AccessToken();
				$payload = $accessToken->verify($idToken, [
					'audience' => $_ENV['GOOGLE_CLIENT_ID']
				]);

				if (!$payload) {
					throw new \Exception("Token invalide");
				}

				$email = $payload['email'];
				$name = $payload['name'];

				$userModel = new User();
				$user = $userModel->findOrCreate($email, $name);

				if (!$user['valid']) {
					echo json_encode([
						"success" => false,
						"redirect" => "/wait",
						"error" => "Compte non validé"
					]);
					return;
				}

				$user['authToken'] = $userModel->generateNewToken($user['id']);
				$user['picture'] = $payload['picture'] ?? null; // Photo temporaire pour la session

				echo json_encode(["success" => true, "redirect" => "/pannel", "user" => $user, "debug" => $payload]);
			} catch (\Exception $e) {
				http_response_code(401);
				echo json_encode([
					"error" => "Authentification échouée",
					"exception" => $e->getMessage(),
					"trace" => $e->getTraceAsString(),
					"token" => $idToken
				]);
			}
		}

		public function getAllUsers() {
			error_log("getAllUsers method called");
			
			// Créer une instance utilisateur pour vérifier l'auth
			$userModel = new User();
			
			// Vérifier l'authentification avec la méthode existante
			if (!$userModel->checkIfConnectionIsAuthorized()) {
				error_log("Authorization failed in getAllUsers");
				return; // La méthode checkIfConnectionIsAuthorized gère déjà la réponse
			}
			
			error_log("Authorization successful, getting users");
			
			// Récupérer les utilisateurs
			$users = $userModel->getAllUsers();
			
			error_log("getAllUsers result: " . ($users === false ? 'FALSE' : 'SUCCESS with ' . count($users) . ' users'));

			if ($users !== false) {
				error_log("Users retrieved successfully: " . count($users) . " users");
				echo json_encode(["success" => true, "users" => $users, "total" => count($users)]);
			} else {
				error_log("Failed to retrieve users - database error");
				http_response_code(500);
				echo json_encode([
					"success" => false, 
					"error" => "Erreur lors de la récupération des utilisateurs"
				]);
			}
		}

		public function verifyUser() {			
			$userModel = new User();
			
			if (!$userModel->checkIfConnectionIsAuthorized()) {
				error_log("Authorization failed in verifyUser");
				return; // La méthode checkIfConnectionIsAuthorized gère déjà la réponse d'erreur
			}
			
			// Si on arrive ici, l'utilisateur est autorisé
			echo json_encode([
				"success" => true,
				"message" => "Utilisateur vérifié avec succès"
			]);
		}
	}