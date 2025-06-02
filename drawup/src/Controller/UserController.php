<?php
	namespace Controller;
	use Core\Session;

	class UserController {
		public function login() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ ."/../View/Sample/Login.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function wait() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ ."/../View/Sample/Wait.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function logout() {
			$Session = new Session();
			$Session->session_start_if_not_started();
			header("Location: ". BASE_URL . "/");
			exit;
		}
	}