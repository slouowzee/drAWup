<?php
	namespace Controller;
	use Core\Session;

	class UserController {

		/**
		 * Affiche la page de connexion.
		 *
		 * @return void
		 */
		public function login() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ ."/../View/Sample/Login.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche la page d'attente en cas de compte invalide.
		 *
		 * @return void
		 */
		public function wait() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ ."/../View/Sample/Wait.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Fait la déconnexion de l'utilisateur.
		 *
		 * @return void
		 */
		public function logout() {
			$Session = new Session();
			session_start();
			$Session->logout();
			header("Location: ". BASE_URL . "");
			exit;
		}
	}