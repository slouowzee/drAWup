<?php

	namespace Model;
	use Core\Database;
	use PDO;
	use PDOException;

	class Taxe {
		private $db;

		public function __construct() {
			$this->db = Database::getConnection();
		}

		/**
		 * Récupère toutes les taxes.
		 *
		 * @return array|false Un tableau de taxes ou false en cas d'erreur.
		 */
		public function getAllTaxes() {
			try {
				$stmt = $this->db->prepare("SELECT * FROM taxe;");
				$stmt->execute();
				return $stmt->fetchAll(PDO::FETCH_ASSOC);
			} catch (PDOException $e) {
				error_log("Database error dans getAllTaxes: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Récupère une taxe par son ID.
		 *
		 * @param int $taxeId L'ID de la taxe à récupérer.
		 * @return array|false Les informations de la taxe ou false en cas d'erreur.
		 */
		public function getTaxeByID($taxeId) {
			try {
				$stmt = $this->db->prepare("SELECT * FROM taxe WHERE IDTAXE = :taxeId");
				$stmt->bindParam(':taxeId', $taxeId, PDO::PARAM_INT);
				$stmt->execute();
				return $stmt->fetch(PDO::FETCH_ASSOC);
			} catch (PDOException $e) {
				error_log("Database error dans getTaxeByID: " . $e->getMessage());
				return false;
			}
		}
	}
