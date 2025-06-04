<?php
	namespace Controller;
	use Core\Session;
	use GuzzleHttp\Client;
	use GuzzleHttp\Exception\RequestException;

	class PannelController {

		/**
		 * Check si la session est valide auprès de {@see Session::session_check_if_valid()}
		 * 
		 *  @return void
		 *  @throws \Exception Si la session n'est pas valide, redirige vers la page de connexion
		 */
		private function check() {
			$Session = new Session();
			session_start();
			try {
				if ($Session->session_check_if_valid($_SESSION) === false) {
					throw new \Exception("Vous souhaitez entrer dans une zone restreinte, cependant votre session n'est pas valide. Vous allez être redirigé vers la page de connexion.");
				}

			} catch (\Exception $e) {
				header("Location: " . BASE_URL . "");
				exit;
			}
		}

		/**
		 * Récupère les données d'un client par son ID via une requête HTTP GET.
		 * 
		 * @param int $id L'ID du client à récupérer.
		 * @return array Un tableau contenant les données du client ou un message d'erreur.
		 */
		private function fetch($id) {
			try {
				$client = new Client([
					'base_uri' => 'https://assured-concise-ladybird.ngrok-free.app/drawup_demo/api_drawup/',
					'timeout'  => 5.0
				]);

				$response = $client->request("GET", "api/client/" . $id, [
					'headers' => [
						'Content-type'=> 'application/json',
						'Accept' => 'application/json'
					]
				]);

				$statusCode = $response->getStatusCode();
				$data = json_decode($response->getBody()->getContents(), true);

				if ($statusCode === 200 && isset($data)) {
					return [
						'valid' => true,
						'data' => $data
					];
				}
				
				return ['valid' => false];
        
			} catch (RequestException $e) {
				return [
					'valid' => false,
					'error' => $e->getMessage()
				];
			}
		}

		/**
		 * Affiche le panneau principale.
		 * 
		 * @return void
		 */
		public function showWelcomePannel() {
			$this->check();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/WelcomePannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche la bibliothèque d'article.
		 * 
		 * @return void
		 */
		public function showLibPannel() {
			$this->check();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/LibPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/LibPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche le panneau de création de document.
		 * 
		 * @return void
		 */
		public function showNewDocPannel() {
			$this->check();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/NewDocPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche le tableau des clients.
		 * 
		 * @return void
		 */
		public function showClientPannel() {
			$this->check();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/ClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche le panneau d'édition d'un client.
		 * 
		 * @param int|null $id L'ID du client à éditer. Si null, retour sur le tableau des clients.
		 * @return void
		 */
		public function showEditClientPannel($id = null) {
			$this->check();
			
			if ($id === null) {
				header("Location: " . BASE_URL . "/pannel/client");
				exit;
			}

			$clientData = $this->fetch($id);
			if ($clientData['valid'] === false) {
				header("Location: " . BASE_URL . "/pannel/client");
				exit;
			}

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/EditClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}


		/**
		 * Affiche le panneau d'ajout d'un client.
		 * 
		 * @return void
		 */
		public function showAddClientPannel() {
			$this->check();

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/AddClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}
	}