<?php

	namespace Controller;

	use Google\Auth\AccessToken;
	use Model\User;

	class AuthController {
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

				$email = $payload['email'] ?? 'unknown';
				$name = $payload['name'] ?? 'unknown';

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

				if (session_status() === PHP_SESSION_NONE) {
					session_set_cookie_params([
						'lifetime' => 0,
						'path' => '/',
						'domain' => 'localhost',
						'secure' => false,
						'httponly' => true,
						'samesite' => 'Lax'
					]);
					session_start();
				}
				$_SESSION['user_id'] = $user['id'];
				$_SESSION['user_name'] = $user['name'];
				$_SESSION['user_email'] = $user['email'];
				$_SESSION['user_picture'] = $payload['picture'] ?? null;
				$_SESSION['user_valid'] = $user['valid'];

				echo json_encode(["success" => true, "user" => $user, "debug" => $payload]);
			} catch (\Exception $e) {
				http_response_code(401);
				echo json_encode([
					"error" => "Authentification échouée",
					"exception" => $e->getMessage()
				]);
			}
		}
	}
