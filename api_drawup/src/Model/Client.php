<?php

	namespace Model;
	use Core\Database;
	use PDO;
	use PDOException;

	class Client {
		private $db;

		public function __construct() {
			$this->db = Database::getConnection();
		}

		/**
		 * Récupère le nombre total de clients.
		 *
		 * @return int|false Le nombre total de clients ou false en cas d'erreur.
		 */
		public function getTotalClient() {
			try {
				$stmt = $this->db->prepare("SELECT COUNT(*) as total FROM client");
				$stmt->execute();
				$result = $stmt->fetch(PDO::FETCH_ASSOC);
				return $result['total'] ?? 0;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Ajoute un nouveau client à la base de données.
		 *
		 * @return int|false L'ID du client ajouté ou false en cas d'erreur.
		 */
		public function addNewClient($client) {
			try {
				$stmt = $this->db->prepare("INSERT INTO client (NOMCLI, PRENOMCLI, ADRCLI, VILLECLI, CPCLI, LOGOCLI, LIGNECONTACTCLI) VALUES (:lastName, :firstName, :address, :city, :postalCode, :logo, :contactLine)");
				$stmt->bindParam(':lastName', $client['lastName']);
				$stmt->bindParam(':firstName', $client['firstName']);
				$stmt->bindParam(':address', $client['address']);
				$stmt->bindParam(':city', $client['city']);
				$stmt->bindParam(':postalCode', $client['postalCode']);
				$stmt->bindParam(':logo', $client['logo']);
				$stmt->bindParam(':contactLine', $client['contactLine']);
				$stmt->execute();
				return $this->db->lastInsertId();
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Supprime un client par son ID.
		 *
		 * @return bool|int Le nombre de lignes affectées ou false en cas d'erreur.
		 */
		public function deleteClientByID($clientId) {
			try {
				$stmt = $this->db->prepare("DELETE FROM client WHERE IDCLI = :clientId");
				$stmt->bindParam(':clientId', $clientId, PDO::PARAM_INT);
				$stmt->execute();
				return $stmt->rowCount() > 0;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Récupère tous les clients.
		 *
		 * @return array|false Un tableau de clients ou false en cas d'erreur.
		 */
		public function getAllClients() {
			try {
				$stmt = $this->db->prepare("SELECT * FROM client");
				$stmt->execute();
				
				$clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
				$count = count($clients);
				
				foreach ($clients as &$client) {
					if (!empty($client['LOGOCLI'])) {
						// Déterminer le type MIME
						$finfo = new \finfo(FILEINFO_MIME_TYPE);
						$mime = $finfo->buffer($client['LOGOCLI']) ?: 'application/octet-stream';
						
						// Convertir en base64 et formater comme data URL
						$base64 = base64_encode($client['LOGOCLI']);
						$client['LOGOCLI'] = "data:{$mime};base64,{$base64}";
					}
				}

				return $clients;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Récupère un client par son ID.
		 *
		 * @param int $clientId L'ID du client à récupérer.
		 * @return array|false Les informations du client ou false en cas d'erreur.
		 */
		public function getClientByID($clientId) {
			try {
				$stmt = $this->db->prepare("SELECT * FROM client WHERE IDCLI = :clientId");
				$stmt->bindParam(':clientId', $clientId, PDO::PARAM_INT);
				$stmt->execute();

				$client = $stmt->fetch(PDO::FETCH_ASSOC);

				if ($client && !empty($client['LOGOCLI'])) {
					// Déterminer le type MIME
					$finfo = new \finfo(FILEINFO_MIME_TYPE);
					$mime = $finfo->buffer($client['LOGOCLI']) ?: 'application/octet-stream';

					// Convertir en base64 et formater comme data URL
					$base64 = base64_encode($client['LOGOCLI']);
					$client['LOGOCLI'] = "data:{$mime};base64,{$base64}";
				}

				return $client;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Met à jour un client existant dans la base de données.
		 *
		 * @param array $clientData Les données du client à mettre à jour.
		 * @return bool True si la mise à jour a réussi, false sinon.
		 */
		public function updateClient($clientData) {
			try {
				error_log("Début de la mise à jour du client ID: " . $clientData['id']);
				
				// Vérifier si le client existe
				$checkStmt = $this->db->prepare("SELECT IDCLI FROM client WHERE IDCLI = :id");
				$checkStmt->bindValue(':id', $clientData['id'], PDO::PARAM_INT);
				$checkStmt->execute();
				
				if (!$checkStmt->fetch()) {
					error_log("Client non trouvé avec ID: " . $clientData['id']);
					return false;
				}
				
				// Configurer PDO pour afficher les erreurs détaillées
				$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				
				// Construire la requête de base (sans logo)
				$sql = "UPDATE client SET 
					NOMCLI = :nom, 
					PRENOMCLI = :prenom, 
					ADRCLI = :adresse, 
					VILLECLI = :ville, 
					CPCLI = :codePostal, 
					LIGNECONTACTCLI = :description";
					
				// Si un logo est fourni, l'ajouter à la requête
				$hasLogo = isset($clientData['logo']) && !empty($clientData['logo']);
				if ($hasLogo) {
					$sql .= ", LOGOCLI = :logo";
				}
				
				$sql .= " WHERE IDCLI = :id";
				
				error_log("Requête SQL préparée: " . $sql);
				
				// Exécuter la mise à jour en deux étapes si nécessaire
				$stmt = $this->db->prepare($sql);
				
				// 1. Binder les valeurs standard
				$stmt->bindValue(':nom', $clientData['nom']);
				$stmt->bindValue(':prenom', $clientData['prenom']);
				$stmt->bindValue(':adresse', $clientData['adresse']);
				$stmt->bindValue(':ville', $clientData['ville']);
				$stmt->bindValue(':codePostal', $clientData['codePostal']);
				$stmt->bindValue(':description', $clientData['description']);
				$stmt->bindValue(':id', $clientData['id'], PDO::PARAM_INT);
				
				// 2. Binder le BLOB séparément si présent 
				if ($hasLogo) {
					// On doit utiliser bindParam pour les BLOBs
					$stmt->bindParam(':logo', $clientData['logo'], PDO::PARAM_LOB);
					error_log("Logo attaché: " . (is_string($clientData['logo']) ? strlen($clientData['logo']) . " octets" : "format invalide"));
				}
				
				// Exécuter la requête et vérifier le résultat
				try {
					$stmt->execute();
					error_log("Requête exécutée avec succès");
					return true;
				} catch (PDOException $e) {
					error_log("Erreur lors de l'exécution SQL: " . $e->getMessage());
					error_log("Code erreur: " . $e->getCode());
					return false;
				}
				
			} catch (PDOException $e) {
				error_log("Exception PDO: " . $e->getMessage());
				error_log("Code erreur: " . $e->getCode());
				error_log("Trace: " . $e->getTraceAsString());
				return false;
			} catch (Exception $e) {
				error_log("Exception générale: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Met à jour les informations de base d'un client sans toucher au logo.
		 *
		 * @param array $clientData Les données du client à mettre à jour.
		 * @return bool True si la mise à jour a réussi, false sinon.
		 */
		public function updateClientBasicInfo($clientData) {
			try {
				// SQL direct et simple pour la mise à jour
				$sql = "UPDATE client 
					SET NOMCLI = :nom,
						PRENOMCLI = :prenom,
						ADRCLI = :adresse,
						VILLECLI = :ville,
						CPCLI = :codePostal,
						LIGNECONTACTCLI = :description
					WHERE IDCLI = :id";
				
				error_log("SQL direct: " . $sql);
				error_log("ID client: " . $clientData['id']);
				
				$stmt = $this->db->prepare($sql);
				
				// Valeurs avec des types stricts
				$stmt->bindValue(':nom', $clientData['nom'], PDO::PARAM_STR);
				$stmt->bindValue(':prenom', $clientData['prenom'], PDO::PARAM_STR);
				$stmt->bindValue(':adresse', $clientData['adresse'], PDO::PARAM_STR);
				$stmt->bindValue(':ville', $clientData['ville'], PDO::PARAM_STR);
				$stmt->bindValue(':codePostal', $clientData['codePostal'], PDO::PARAM_STR);
				$stmt->bindValue(':description', $clientData['description'], PDO::PARAM_STR);
				$stmt->bindValue(':id', $clientData['id'], PDO::PARAM_INT);
				
				// Exécution
				$result = $stmt->execute();
				$affectedRows = $stmt->rowCount();
				
				error_log("Résultat de l'exécution: " . ($result ? "OK" : "ÉCHEC"));
				error_log("Lignes affectées: " . $affectedRows);
				
				// Même si aucune ligne n'est affectée (car aucun changement), considérons que c'est un succès
				return $result;
			} catch (PDOException $e) {
				error_log("Erreur PDO dans updateClientBasicInfo: " . $e->getMessage());
				error_log("Code erreur: " . $e->getCode());
				return false;
			} catch (\Exception $e) {
				error_log("Exception dans updateClientBasicInfo: " . $e->getMessage());
				return false;
			}
		}
	}