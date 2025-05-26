<?php
	namespace Controller;

	class PannelController {
		public function showWelcomePannel() {
			require_once __DIR__ . "/../Core/Session.php";

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/WelcomePannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showLibPannel() {
			require_once __DIR__ . "/../Core/Session.php";

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/LibPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showNewDocPannel() {
			require_once __DIR__ . "/../Core/Session.php";

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/NewDocPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showClientPannel() {
			require_once __DIR__ . "/../Core/Session.php";

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/ClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}
	}