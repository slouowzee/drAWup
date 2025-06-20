<?php

namespace Controller;
use Model\Client;
use Model\User;

/**
 * Contrôleur pour la gestion des clients
 * Gère les opérations CRUD sur les clients avec vérification d'autorisation
 */
class ClientController {
	private $clientModel;

	public function __construct() {
		$this->clientModel = new Client();
	}

	/**
	 * Vérifie l'autorisation de connexion et arrête l'exécution si non autorisée
	 * 
	 * @return void
	 */
	public function stopIfConnectionIsNotAuthorized() {
		$userModel = new User();
		if (!$userModel->checkIfConnectionIsAuthorized()) {
			exit;
		}
	}

	/**
	 * Récupère le nombre total de clients
	 * 
	 * @return void
	 */
	public function getTotalClient() {
		$this->stopIfConnectionIsNotAuthorized();
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
	 * Ajoute un nouveau client avec validation des données
	 * 
	 * @return void
	 */
	public function addNewClient() {
		$this->stopIfConnectionIsNotAuthorized();
		if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
			http_response_code(400);
			echo json_encode(["success" => false, "error" => "Méthode HTTP non supportée"]);
			return;
		}

		try {
			$nom = isset($_POST['client-nom']) ? trim($_POST['client-nom']) : null;
			$prenom = isset($_POST['client-prenom']) ? trim($_POST['client-prenom']) : null;
			$adresse = isset($_POST['client-adresse']) ? trim($_POST['client-adresse']) : null;
			$adresse2 = isset($_POST['client-adresse2']) ? trim($_POST['client-adresse2']) : '';
			$adresse3 = isset($_POST['client-adresse3']) ? trim($_POST['client-adresse3']) : '';
			$ville = isset($_POST['client-ville']) ? trim($_POST['client-ville']) : null;
			$codePostal = isset($_POST['client-codepostal']) ? trim($_POST['client-codepostal']) : null;
			$description = isset($_POST['client-description']) ? trim($_POST['client-description']) : '';
			
			if (empty($nom)) throw new \Exception("Le nom du client est obligatoire");
			if (empty($prenom)) throw new \Exception("Le prénom du client est obligatoire");
			if (empty($adresse)) throw new \Exception("L'adresse du client est obligatoire");
			if (empty($ville)) throw new \Exception("La ville du client est obligatoire");
			if (empty($codePostal)) throw new \Exception("Le code postal est obligatoire");
			
			$clientData = [
				'lastName' => $nom,
				'firstName' => $prenom,
				'address' => $adresse,
				'address2' => $adresse2,
				'address3' => $adresse3,
				'city' => $ville,
				'postalCode' => $codePostal,
				'contactLine' => $description
			];
			
			if (isset($_FILES['client-logo']) && $_FILES['client-logo']['error'] === UPLOAD_ERR_OK) {
				$logoTmpName = $_FILES['client-logo']['tmp_name'];
				$logoContent = file_get_contents($logoTmpName);
				
				if ($logoContent !== false) {
					$clientData['logo'] = $logoContent;
				}
			}
			
			$clientId = $this->clientModel->addNewClient($clientData);
			
			if ($clientId) {
				echo json_encode([
					"success" => true,
					"message" => "Client ajouté avec succès",
					"clientId" => $clientId
				]);
			} else {
				throw new \Exception("Échec de l'insertion en base de données");
			}
			
		} catch (\Exception $e) {
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur lors de l'ajout du client: " . $e->getMessage()
			]);
		}
	}

	/**
	 * Supprime un client par son ID
	 * 
	 * @param int $clientId L'ID du client à supprimer
	 * @return void
	 */
	public function deleteClientByID($clientId) {
		$this->stopIfConnectionIsNotAuthorized();
		$clientId = isset($_GET['id']) ? intval($_GET['id']) : 0;

		if ($clientId <= 0) {
			http_response_code(400);
			echo json_encode([
				"success" => false,
				"error" => "ID du client invalide"
			]);
			return;
		}

		try {
			$deleted = $this->clientModel->deleteClientByID($clientId);
			if ($deleted) {
				echo json_encode([
					"success" => true,
					"message" => "Client supprimé avec succès"
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
				"error" => "Erreur lors de la suppression du client: " . $e->getMessage()
			]);
		}
	}
	
	/**
	 * Récupère tous les clients
	 * 
	 * @return void
	 */
	public function getAllClient() {
		$this->stopIfConnectionIsNotAuthorized();
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
	 * Récupère un client par son ID
	 * 
	 * @param int $clientId L'ID du client à récupérer
	 * @return void
	 */
	public function getClientByID($clientId) {
		$this->stopIfConnectionIsNotAuthorized();
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
	 * Met à jour un client par son ID avec des données provenant d'un formulaire
	 * 
	 * @param int $clientId L'ID du client à mettre à jour
	 * @return void
	 */
	public function updateClientByID($clientId) {
		$this->stopIfConnectionIsNotAuthorized();
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
					'adresse' => $_POST['client-adresse'] ?? $existingClient['ADRCLI1'],
					'adresse2' => $_POST['client-adresse2'] ?? $existingClient['ADRCLI2'],
					'adresse3' => $_POST['client-adresse3'] ?? $existingClient['ADRCLI3'],
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

					$fileInfo = new \finfo(FILEINFO_MIME_TYPE);
					$mimeType = $fileInfo->file($logoTmpName);

					$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
					if (!in_array($mimeType, $allowedTypes)) {
						throw new \Exception("Type de fichier non autorisé: $mimeType. Utilisez JPG, PNG, GIF ou SVG.");
					}

					$maxSize = 2 * 1024 * 1024;
					if ($logoSize > $maxSize) {
						throw new \Exception("Le fichier est trop volumineux ($logoSize octets). Taille maximale: 2Mo.");
					}

					$logoContent = file_get_contents($logoTmpName);
					if ($logoContent === false) {
						throw new \Exception("Impossible de lire le contenu du fichier logo.");
					}

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