<?php
	namespace Controller;

	class UserController {
		public function login() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ ."/../View/Sample/Login.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function logout() {
			
		}
	}