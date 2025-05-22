<?php
	namespace Controller;

	class WaitController {
		public function showWait() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ ."/../View/Sample/Wait.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}
	}