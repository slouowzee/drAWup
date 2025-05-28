<?php

	namespace Model;
	use Core\Database;
	use PDO;
	use PDOException;

	class Article {
		private $db;

		public function __construct() {
			$this->db = Database::getConnection();
		}

		public function getTotalArticle() {
			try {
				$stmt = $this->db->prepare("SELECT COUNT(*) as total FROM article");
				$stmt->execute();
				$result = $stmt->fetch(PDO::FETCH_ASSOC);
				return $result['total'] ?? 0;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return 0;
			}
		}
	}