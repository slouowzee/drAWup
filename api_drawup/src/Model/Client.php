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

		public function deleteClient($clientId) {
			// try {
			// 	$stmt = $this->db->prepare("DELETE FROM client WHERE IDCLI = :clientId");
			// 	$stmt->bindParam(':clientId', $clientId, PDO::PARAM_INT);
			// 	$stmt->execute();
			// 	return $stmt->rowCount() > 0;
			// } catch (PDOException $e) {
			// 	error_log("Database error: " . $e->getMessage());
			// 	return false;
			// }
		}

		public function getAllClients() {
			try {
				$stmt = $this->db->prepare("SELECT * FROM client");
				$stmt->execute();
				return $stmt->fetchAll(PDO::FETCH_ASSOC);
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return false;
			}
		}
	}