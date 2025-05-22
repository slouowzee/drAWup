<?php

	namespace Model;

	use Core\Database;
	use PDO;

	class User {
		private $db;

		public function __construct() {
			$this->db = Database::getConnection();
		}

		public function findOrCreate($email, $name) {
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
		}
	}
