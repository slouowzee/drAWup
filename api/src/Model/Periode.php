<?php

	namespace Model;
	use Core\Database;
	use PDO;
	use PDOException;

	class Periode {
		private $db;

		public function __construct() {
			$this->db = Database::getConnection();
		}

		/**
		 * Récupère toutes les périodicités.
		 *
		 * @return array|false Un tableau de périodicités ou false en cas d'erreur.
		 */
		public function getAllPeriodes() {
			try {
				$stmt = $this->db->prepare("SELECT * FROM periodicite ORDER BY LABELPERIODICITE");
				$stmt->execute();
				return $stmt->fetchAll(PDO::FETCH_ASSOC);
			} catch (PDOException $e) {
				error_log("Database error dans getAllPeriodes: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Récupère une périodicité par son ID.
		 *
		 * @param int $periodeId L'ID de la périodicité à récupérer.
		 * @return array|false Les informations de la périodicité ou false en cas d'erreur.
		 */
		public function getPeriodeByID($periodeId) {
			try {
				$stmt = $this->db->prepare("SELECT * FROM periodicite WHERE IDPERIOD = :periodeId");
				$stmt->bindParam(':periodeId', $periodeId, PDO::PARAM_INT);
				$stmt->execute();
				return $stmt->fetch(PDO::FETCH_ASSOC);
			} catch (PDOException $e) {
				error_log("Database error dans getPeriodeByID: " . $e->getMessage());
				return false;
			}
		}
	}
