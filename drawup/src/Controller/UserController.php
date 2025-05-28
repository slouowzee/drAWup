<?php
	namespace Controller;

	class UserController {
		public function login() {
			require_once __DIR__ . "/../View/Global/HeaderLogin.php";
			require_once __DIR__ ."/../View/Sample/Login.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function logout() {
			session_start();

			$_SESSION = [];

			if (ini_get("session.use_cookies")) {
				$params = session_get_cookie_params();
				setcookie(
					session_name(),
					'',
					time() - 42000,
					$params["path"],
					$params["domain"],
					$params["secure"],
					$params["httponly"]
				);
			}

			session_destroy();

			header("Location: ". BASE_URL . "/");
			exit;
		}
	}