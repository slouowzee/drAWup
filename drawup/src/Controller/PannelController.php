<?php
	namespace Controller;

	class PannelController {
		public function showPannel() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ ."/../View/Sample/Pannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}
	}