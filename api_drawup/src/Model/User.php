<?php

	namespace Model;

	use Core\Database;
	use PDO;
	use PDOException;

	class User {
		private $db;

		public function __construct() {
			$this->db = Database::getConnection();
		}

		/**
		 * Récupère un utilisateur par son email et son nom.
		 *
		 * @param string $email L'email de l'utilisateur.
		 * @param string $name Le nom de l'utilisateur.
		 * @return array|null Les informations de l'utilisateur ou null en cas d'erreur.
		 */
		public function findOrCreate($email, $name) {
			try {
				$stmt = $this->db->prepare("SELECT IDUTIL as id, NOMUTIL as name, EMAILUTIL as email, ACTIFUTIL as valid FROM utilisateur WHERE EMAILUTIL = ?");
				$stmt->execute([$email]);
				$user = $stmt->fetch(PDO::FETCH_ASSOC);

				if ($user) return $user;

				$stmt = $this->db->prepare("INSERT INTO utilisateur (NOMUTIL, EMAILUTIL) VALUES (?, ?)");
				$stmt->execute([$name, $email]);

				return [
					'id' => $this->db->lastInsertId(),
					'name' => $name,
					'email' => $email,
					'valid' => 0
				];
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				$this->db = null;
				return null;
			}
		}
	}
