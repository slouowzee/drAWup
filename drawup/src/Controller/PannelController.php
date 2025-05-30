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

		public function showEditClientPannel($id = null) {
			//rajouter vérif si client existe toujours
			require_once __DIR__ . "/../Core/Session.php";

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/AddClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		private function fetchClientFromAPI($id) {
		$apiUrl = "http://localhost/drawup_demo/drawup/api/client/" . $id;
		
		$ch = curl_init();
		
		// Configuration de la requête cURL
		curl_setopt($ch, CURLOPT_URL, $apiUrl);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // À désactiver en production
		
		$response = curl_exec($ch);
		
		// Vérifier s'il y a des erreurs
		if (curl_errno($ch)) {
			curl_close($ch);
			return null;
		}
		
		// Fermer la session cURL
		curl_close($ch);
		
		// Décoder la réponse JSON
		$client = json_decode($response, true);
		
		// Vérifier si la réponse est valide
		if (!$client || isset($client['error'])) {
			return null;
		}
		
		return $client;
		}
	}