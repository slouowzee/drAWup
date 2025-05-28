<?php

	namespace Controller;
	use Model\Client;

	class ClientController {
		private $clientModel;

		public function __construct() {
			$this->clientModel = new Client();
		}

		public function getTotalClient() {
			try {
				$total = $this->clientModel->getTotalClient();
				echo json_encode([
					"success" => true,
					"totalClients" => $total
				]);
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la récupération du total des clients"
				]);
			}
		}

		public function addNewClient() {
			$clientData = json_decode(file_get_contents('php://input'), true);

			if (empty($clientData['lastName']) || empty($clientData['firstName']) || empty($clientData['address']) || empty($clientData['city']) || empty($clientData['postalCode']) || empty($clientData['logo']) || empty($clientData['contactLine'])) {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "Données client manquantes"
				]);
				return;
			}

			try {
				$clientId = $this->clientModel->addNewClient($clientData);
				if ($clientId) {
					echo json_encode([
						"success" => true,
						"message" => "Client ajouté avec succès",
						"clientId" => $clientId
					]);
				} else {
					http_response_code(500);
					echo json_encode([
						"success" => false,
						"error" => "Erreur lors de l'ajout du client"
					]);
				}
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de l'ajout du client: " . $e->getMessage()
				]);
			}
		}

		public function deleteClient() {
			// $clientId = isset($_GET['id']) ? intval($_GET['id']) : 0;

			// if ($clientId <= 0) {
			// 	http_response_code(400);
			// 	echo json_encode([
			// 		"success" => false,
			// 		"error" => "ID du client invalide"
			// 	]);
			// 	return;
			// }

			// try {
			// 	$deleted = $this->clientModel->deleteClient($clientId);
			// 	if ($deleted) {
			// 		echo json_encode([
			// 			"success" => true,
			// 			"message" => "Client supprimé avec succès"
			// 		]);
			// 	} else {
			// 		http_response_code(404);
			// 		echo json_encode([
			// 			"success" => false,
			// 			"error" => "Client non trouvé"
			// 		]);
			// 	}
			// } catch (\Exception $e) {
			// 	http_response_code(500);
			// 	echo json_encode([
			// 		"success" => false,
			// 		"error" => "Erreur lors de la suppression du client: " . $e->getMessage()
			// 	]);
			// }
		}

		public function getAllClient() {
			try {
				$clients = $this->clientModel->getAllClients();
				if ($clients) {
					echo json_encode([
						"success" => true,
						"clients" => $clients
					]);
				} else {
					http_response_code(404);
					echo json_encode([
						"success" => false,
						"error" => "Aucun client trouvé"
					]);
				}
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la récupération des clients: " . $e->getMessage()
				]);
			}
		}
	}