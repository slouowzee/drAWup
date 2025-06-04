<?php

	namespace Core;

	class Session {

		/**
		 * Checks si la session est valide afin de s'assurer que l'utilisateur a le droit d'accéder aux pages critiques
		 * 
		 * @return boolean True si la session est valide, false sinon
		 */
		function session_check_if_valid($session) {
			if ($session == array() || !isset($session['user_name']) || !isset($session['user_email']) || !isset($session['user_picture']) || !isset($session['user_id']) || (!isset($session['user_valid'])) || $session['user_valid'] !== 1) {
				return false;
			}
			return true;
		}

		/**
		 * Détruis la session en cours et supprime les cookies associés piour éviter les problèmes de sécurité
		 * 
		 * @return boolean session_destroy() si la session a été détruite avec succès, false sinon
		 */
		public function logout() {
			if (session_status() === PHP_SESSION_ACTIVE) {
				$_SESSION = array();
				
				if (ini_get("session.use_cookies")) {
					$params = session_get_cookie_params();
					setcookie(
						session_name(),
						'',
						[
							'expires' => time() - 42000,
							'path' => $params["path"],
							'domain' => $params["domain"],
							'secure' => $params["secure"],
							'httponly' => $params["httponly"],
							'samesite' => 'Strict'
						]
					);
				}
				
				return session_destroy();
			}
			
			return false;
		}
	}