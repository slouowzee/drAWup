<?php
	namespace Controller;
	use Core\Session;

	class PannelController {
		private function set_session() {
			$Session = new Session();
			$Session->session_start_if_not_started();
		}

		public function showWelcomePannel() {
			$this->set_session();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/WelcomePannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showLibPannel() {
			$this->set_session();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/LibPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/LibPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showNewDocPannel() {
			$this->set_session();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/NewDocPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showClientPannel() {
			$this->set_session();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/ClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showEditClientPannel($id = null) {
			//rajouter vérif si client existe toujours
			$this->set_session();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/EditClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showAddClientPannel() {
			$this->set_session();

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
		
		if (curl_errno($ch)) {
			curl_close($ch);
			return null;
		}
		
		curl_close($ch);
		
		$client = json_decode($response, true);
		
		if (!$client || isset($client['error'])) {
			return null;
		}
		
		return $client;
		}
	}