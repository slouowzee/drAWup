<?php
	namespace Controller;

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
			require_once __DIR__ . "/../View/Sample/Wait.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}
	}