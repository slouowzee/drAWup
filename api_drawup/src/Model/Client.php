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
		 * Si le logo est fourni, il sera également enregistré.
		 *
		 * @param array $client Les données du client à ajouter
		 * @return int|false L'ID du client ajouté ou false en cas d'erreur.
		 */
		public function addNewClient($client) {
			try {
				$hasLogo = isset($client['logo']) && !empty($client['logo']);
				
				if ($hasLogo) {
					$this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
				}
				
				$sql = "INSERT INTO client (NOMCLI, PRENOMCLI, ADRCLI, VILLECLI, CPCLI, LIGNECONTACTCLI";
				$sql .= $hasLogo ? ", LOGOCLI) " : ") ";
				$sql .= "VALUES (:lastName, :firstName, :address, :city, :postalCode, :contactLine";
				$sql .= $hasLogo ? ", :logo)" : ")";
				
				$stmt = $this->db->prepare($sql);
				
				$stmt->bindParam(':lastName', $client['lastName'], PDO::PARAM_STR);
				$stmt->bindParam(':firstName', $client['firstName'], PDO::PARAM_STR);
				$stmt->bindParam(':address', $client['address'], PDO::PARAM_STR);
				$stmt->bindParam(':city', $client['city'], PDO::PARAM_STR);
				$stmt->bindParam(':postalCode', $client['postalCode'], PDO::PARAM_STR);
				$stmt->bindParam(':contactLine', $client['contactLine'], PDO::PARAM_STR);
				
				if ($hasLogo) {
					$logo = $client['logo']; // Variable locale importante pour le binding
					$stmt->bindParam(':logo', $logo, PDO::PARAM_LOB);
					error_log("Logo fourni pour le nouveau client, taille: " . (is_string($client['logo']) ? strlen($client['logo']) . " octets" : "format invalide"));
				}
				
				$stmt->execute();
				return $this->db->lastInsertId();
			} catch (PDOException $e) {
				error_log("Database error dans addNewClient: " . $e->getMessage());
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

				foreach ($clients as &$client) {
					if (!empty($client['LOGOCLI'])) {
						// S'assurer que les données binaires sont correctement traitées
						$binaryData = $client['LOGOCLI'];

						try {
							$finfo = new \finfo(FILEINFO_MIME_TYPE);
							$mime = $finfo->buffer($binaryData) ?: 'image/jpeg'; // Par défaut JPEG
						} catch (\Exception $e) {
							error_log("Erreur lors de la détection du type MIME: " . $e->getMessage());
							$mime = 'image/jpeg';
						}

						// Convertir en base64 et formater comme data URL
						$base64 = base64_encode($binaryData);
						$client['LOGOCLI'] = "data:{$mime};base64,{$base64}";

						error_log("Client " . $client['IDCLI'] . " - Logo converti en data URL, taille: " . strlen($base64) . " caractères");
					} else {
						error_log("Client " . $client['IDCLI'] . " - Pas de logo");
					}
				}

				return $clients;
			} catch (PDOException $e) {
				error_log("Database error dans getAllClients: " . $e->getMessage());
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

				if ($client) {
					if (!empty($client['LOGOCLI'])) {
						$binaryData = $client['LOGOCLI'];

						try {
							$finfo = new \finfo(FILEINFO_MIME_TYPE);
							$mime = $finfo->buffer($binaryData) ?: 'image/jpeg';
						} catch (\Exception $e) {
							error_log("Erreur lors de la détection du type MIME: " . $e->getMessage());
							$mime = 'image/jpeg'; // Fallback
						}

						// Encoder en base64 pour la transmission
						$base64 = base64_encode($binaryData);
						$client['LOGOCLI'] = "data:{$mime};base64,{$base64}";

						error_log("Client ID " . $clientId . " - Logo chargé, taille: " . strlen($base64) . " caractères");
					} else {
						error_log("Client ID " . $clientId . " - Pas de logo trouvé");
					}
				}

				return $client;
			} catch (PDOException $e) {
				error_log("Database error dans getClientByID: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Met à jour un client existant dans la base de données.
		 * Gère automatiquement les cas avec ou sans logo.
		 *
		 * @param array $clientData Les données du client à mettre à jour
		 * @return bool True si la mise à jour a réussi, false sinon
		 */
		public function updateClientByID($clientData) {
			try {
				$checkStmt = $this->db->prepare("SELECT IDCLI FROM client WHERE IDCLI = :id");
				$checkStmt->bindValue(':id', $clientData['id'], PDO::PARAM_INT);
				$checkStmt->execute();

				if (!$checkStmt->fetch()) {
					error_log("Client non trouvé avec ID: " . $clientData['id']);
					return false;
				}

				$hasLogo = isset($clientData['logo']) && !empty($clientData['logo']);
				
				if ($hasLogo) {
					$this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
					$this->db->beginTransaction();
				}

				$sql = "UPDATE client SET 
					NOMCLI = :nom, 
					PRENOMCLI = :prenom, 
					ADRCLI = :adresse, 
					VILLECLI = :ville, 
					CPCLI = :codePostal, 
					LIGNECONTACTCLI = :description";

				if ($hasLogo) {
					$sql .= ", LOGOCLI = :logo";
				}

				$sql .= " WHERE IDCLI = :id";

				$stmt = $this->db->prepare($sql);

				$stmt->bindValue(':nom', $clientData['nom'], PDO::PARAM_STR);
				$stmt->bindValue(':prenom', $clientData['prenom'], PDO::PARAM_STR);
				$stmt->bindValue(':adresse', $clientData['adresse'], PDO::PARAM_STR);
				$stmt->bindValue(':ville', $clientData['ville'], PDO::PARAM_STR);
				$stmt->bindValue(':codePostal', $clientData['codePostal'], PDO::PARAM_STR);
				$stmt->bindValue(':description', $clientData['description'], PDO::PARAM_STR);
				$stmt->bindValue(':id', $clientData['id'], PDO::PARAM_INT);
				
				// Binder le logo si présent
				if ($hasLogo) {
					$logo = $clientData['logo']; // Important: créer une variable locale
					$stmt->bindParam(':logo', $logo, PDO::PARAM_LOB);
					error_log("Logo attaché: " . (is_string($logo) ? strlen($logo) . " octets" : "format invalide"));
				}

				$result = $stmt->execute();

				if ($hasLogo) {
					if ($result) {
						$this->db->commit();
						error_log("Mise à jour avec logo réussie pour le client ID: " . $clientData['id']);
					} else {
						$this->db->rollBack();
						error_log("Échec de la mise à jour avec logo pour le client ID: " . $clientData['id']);
					}
				} else {
					error_log("Mise à jour sans logo pour le client ID: " . $clientData['id'] . " - Résultat: " . ($result ? "OK" : "ÉCHEC"));
				}

				return $result;
			} catch (PDOException $e) {
				if ($hasLogo ?? false) {
					$this->db->rollBack();
				}
				error_log("Exception PDO dans updateClient: " . $e->getMessage());
				error_log("Code: " . $e->getCode() . ", Trace: " . $e->getTraceAsString());
				return false;
			} catch (\Exception $e) {
				error_log("Exception générale dans updateClient: " . $e->getMessage());
				return false;
			}
		}
	}