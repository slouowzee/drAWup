<?php

	namespace Core;

	class Session {
		function session_start_if_not_started() {
			if (session_status() === PHP_SESSION_NONE) {
				session_set_cookie_params([
					'lifetime' => 0,
					'path' => '/',
					'domain' => 'assured-concise-ladybird.ngrok-free.app',
					'secure' => true,
					'httponly' => true,
					'samesite' => 'Lax'
				]);
				session_start();
			}
		}

		function session_destroy_if_started() {
			if (session_status() === PHP_SESSION_ACTIVE) {
				$_SESSION = array();

				if (ini_get("session.use_cookies")) {
					$params = session_get_cookie_params();
					setcookie(session_name(), '', time() - 42000,
						$params["path"], $params["domain"],
						$params["secure"], $params["httponly"]
					);
				}

				session_destroy();
			}
		}
	}