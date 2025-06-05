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
		 * Ajoute un nouveau client avec gestion du formulaire et des fichiers.
		 */
		public function addNewClient() {
			if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
				http_response_code(400);
				echo json_encode(["success" => false, "error" => "Méthode HTTP non supportée"]);
				return;
			}

			try {
				// Debug des données reçues
				error_log("=== DÉBUT addNewClient ===");
				error_log("POST données: " . print_r($_POST, true));
				error_log("FILES: " . print_r($_FILES, true));
				
				// Récupérer directement les données du formulaire
				$nom = isset($_POST['client-nom']) ? trim($_POST['client-nom']) : null;
				$prenom = isset($_POST['client-prenom']) ? trim($_POST['client-prenom']) : null;
				$adresse = isset($_POST['client-adresse']) ? trim($_POST['client-adresse']) : null;
				$ville = isset($_POST['client-ville']) ? trim($_POST['client-ville']) : null;
				$codePostal = isset($_POST['client-codepostal']) ? trim($_POST['client-codepostal']) : null;
				$description = isset($_POST['client-description']) ? trim($_POST['client-description']) : '';
				
				// Valider les champs obligatoires comme dans FormValidator
				if (empty($nom)) throw new \Exception("Le nom du client est obligatoire");
				if (empty($prenom)) throw new \Exception("Le prénom du client est obligatoire");
				if (empty($adresse)) throw new \Exception("L'adresse du client est obligatoire");
				if (empty($ville)) throw new \Exception("La ville du client est obligatoire");
				if (empty($codePostal)) throw new \Exception("Le code postal est obligatoire");
				// Ne pas exiger la description comme obligatoire
				
				// Création du tableau de données
				$clientData = [
					'lastName' => $nom,
					'firstName' => $prenom,
					'address' => $adresse,
					'city' => $ville,
					'postalCode' => $codePostal,
					'contactLine' => $description
				];
				
				error_log("Données à insérer: " . json_encode($clientData));
				
				// Traitement du logo si présent
				if (isset($_FILES['client-logo']) && $_FILES['client-logo']['error'] === UPLOAD_ERR_OK) {
					$logoTmpName = $_FILES['client-logo']['tmp_name'];
					$logoContent = file_get_contents($logoTmpName);
					
					if ($logoContent !== false) {
						$clientData['logo'] = $logoContent;
						error_log("Logo traité, taille: " . strlen($logoContent) . " octets");
					}
				}
				
				// Appel du modèle pour ajouter le client
				$clientId = $this->clientModel->addNewClient($clientData);
				
				if ($clientId) {
					error_log("Client ajouté avec succès, ID: $clientId");
					echo json_encode([
						"success" => true,
						"message" => "Client ajouté avec succès",
						"clientId" => $clientId
					]);
				} else {
					throw new \Exception("Échec de l'insertion en base de données");
				}
				
				error_log("=== FIN addNewClient ===");
				
			} catch (\Exception $e) {
				error_log("ERREUR dans addNewClient: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
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

			if ($_SERVER['REQUEST_METHOD'] === 'POST') {
				try {
					$existingClient = $this->clientModel->getClientByID($clientId);
					if (!$existingClient) {
						throw new \Exception('Client introuvable');
					}

					$clientData = [
						'id' => (int)$clientId,
						'nom' => $_POST['client-nom'] ?? $existingClient['NOMCLI'],
						'prenom' => $_POST['client-prenom'] ?? $existingClient['PRENOMCLI'], 
						'adresse' => $_POST['client-adresse'] ?? $existingClient['ADRCLI'],
						'ville' => $_POST['client-ville'] ?? $existingClient['VILLECLI'],
						'codePostal' => $_POST['client-codepostal'] ?? $existingClient['CPCLI'],
						'description' => $_POST['client-description'] ?? $existingClient['LIGNECONTACTCLI']
					];

					$hasLogo = isset($_FILES['client-logo']) && 
							$_FILES['client-logo']['error'] === UPLOAD_ERR_OK && 
							$_FILES['client-logo']['size'] > 0;

					if ($hasLogo) {
						$logoTmpName = $_FILES['client-logo']['tmp_name'];
						$logoSize = $_FILES['client-logo']['size'];
						$logoName = $_FILES['client-logo']['name'];

						error_log("Logo détecté: $logoName, taille: $logoSize octets");

						// Vérifier le type de fichier
						$fileInfo = new \finfo(FILEINFO_MIME_TYPE);
						$mimeType = $fileInfo->file($logoTmpName);
						error_log("Type MIME du logo: $mimeType");

						$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
						if (!in_array($mimeType, $allowedTypes)) {
							throw new \Exception("Type de fichier non autorisé: $mimeType. Utilisez JPG, PNG, GIF ou SVG.");
						}

						$maxSize = 2 * 1024 * 1024; // 2Mo
						if ($logoSize > $maxSize) {
							throw new \Exception("Le fichier est trop volumineux ($logoSize octets). Taille maximale: 2Mo.");
						}

						// Lire directement le contenu binaire du fichier
						$logoContent = file_get_contents($logoTmpName);
						if ($logoContent === false) {
							throw new \Exception("Impossible de lire le contenu du fichier logo.");
						}

						error_log("Contenu du logo lu avec succès, taille: " . strlen($logoContent) . " octets");

						$clientData['logo'] = $logoContent;
					}

					$updated = $this->clientModel->updateClientByID($clientData);

					if ($updated) {
						echo json_encode([
							"success" => true,
							"message" => "Client mis à jour avec succès"
						]);
					} else {
						http_response_code(500);
						echo json_encode([
							"success" => false,
							"error" => "Erreur lors de la mise à jour du client"
						]);
					}
				} catch (\Exception $e) {
					error_log("Exception: " . $e->getMessage());
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