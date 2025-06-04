<?php

	namespace Controller;
	use Model\Client;

	class ClientController {
		private $clientModel;

		public function __construct() {
			$this->clientModel = new Client();
		}

		/**
		 * Récupère le nombre total de clients.
		 * 
		 * @throws \Exception Si une erreur se produit lors de la récupération du total des clients.
		 * @return void
		 */
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

		/**
		 * Ajoute un nouveau client.
		 * 
		 * @throws \Exception Si une erreur se produit lors de l'ajout du client.
		 * @return void
		 */
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

		public function deleteClientByID($clientId) {
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
		
		/**
		 * Récupère tous les clients.
		 * 
		 * @throws \Exception Si une erreur se produit lors de la récupération des clients.
		 * @return void
		 */
		public function getAllClient() {
			try {
				$clients = $this->clientModel->getAllClients();
				
				if ($clients) {
					ini_set('memory_limit', '256M');
					
					echo json_encode([
						"success" => true,
						"clients" => $clients
					], flags: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR);
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

		/**
		 * Récupère un client par son ID.
		 * 
		 * @param int $clientId L'ID du client à récupérer.
		 * @throws \Exception Si une erreur se produit lors de la récupération du client.
		 * @return void
		 */
		public function getClientByID($clientId) {
			if (empty($clientId) || !is_numeric($clientId)) {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "ID du client invalide"
				]);
				return;
			}

			try {
				$client = $this->clientModel->getClientByID($clientId);
				if ($client) {
					echo json_encode([
						"success" => true,
						"client" => $client
					]);
				} else {
					http_response_code(404);
					echo json_encode([
						"success" => false,
						"error" => "Client non trouvé"
					]);
				}
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la récupération du client: " . $e->getMessage()
				]);
			}
		}

		/**
		 * Met à jour un client par son ID avec des données provenant d'un formulaire.
		 * 
		 * @param int $clientId L'ID du client à mettre à jour.
		 * @param array $data Données du client (non utilisé car on utilise $_POST et $_FILES directement)
		 * @return void
		 */
		public function updateClientByID($clientId) {
			if (empty($clientId) || !is_numeric($clientId)) {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "ID du client invalide"
				]);
				return;
			}

			// Debug détaillé des données reçues
			error_log("MISE À JOUR CLIENT ID: " . $clientId);
			error_log("Méthode HTTP: " . $_SERVER['REQUEST_METHOD']);
			error_log("POST data: " . print_r($_POST, true));
			error_log("FILES data: " . print_r($_FILES, true));
			
			// Vérifier si c'est une requête PUT simulée ou une simple requête POST
			$isPut = isset($_POST['_method']) && $_POST['_method'] === 'PUT';

			if ($_SERVER['REQUEST_METHOD'] === 'POST') {
				try {
					// Récupérer les données actuelles du client
					$existingClient = $this->clientModel->getClientByID($clientId);
					if (!$existingClient) {
						throw new \Exception('Client introuvable');
					}
					
					error_log("Données client existantes: " . print_r($existingClient, true));

					// Préparation des données avec contrôle strict
					$clientData = [
						'id' => (int)$clientId,
						'nom' => $_POST['client-nom'] ?? $existingClient['NOMCLI'],
						'prenom' => $_POST['client-prenom'] ?? $existingClient['PRENOMCLI'], 
						'adresse' => $_POST['client-adresse'] ?? $existingClient['ADRCLI'],
						'ville' => $_POST['client-ville'] ?? $existingClient['VILLECLI'],
						'codePostal' => $_POST['client-codepostal'] ?? $existingClient['CPCLI'],
						'description' => $_POST['client-description'] ?? $existingClient['LIGNECONTACTCLI']
					];
					
					error_log("Données préparées pour update: " . print_r($clientData, true));
					
					// Essai d'update simple
					$updated = $this->clientModel->updateClientBasicInfo($clientData);
					
					if ($updated) {
						error_log("Mise à jour réussie");
						echo json_encode([
							"success" => true,
							"message" => "Client mis à jour avec succès"
						]);
					} else {
						error_log("Échec de la mise à jour");
						http_response_code(500);
						echo json_encode([
							"success" => false,
							"error" => "Erreur lors de la mise à jour du client"
						]);
					}
				} catch (\Exception $e) {
					error_log("Exception: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
					http_response_code(500);
					echo json_encode([
						"success" => false,
						"error" => "Erreur lors de la mise à jour du client: " . $e->getMessage()
					]);
				}
			} else {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "Méthode HTTP non supportée. Utilisez POST."
				]);
			}
		}
	}