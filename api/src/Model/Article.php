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

		/**
		 * Récupère tous les articles.
		 *
		 * @throws PDOException
		 * @return array
		 */
		public function getTotalArticle() {
			try {
				$stmt = $this->db->prepare("SELECT COUNT(*) as total FROM article");
				$stmt->execute();
				$result = $stmt->fetch(PDO::FETCH_ASSOC);
				return $result['total'] ?? 0;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return [];
			}
		}

		/**
		 * Récupère un article par son ID.
		 *
		 * @param int $id
		 * @throws PDOException
		 * @return array|null
		 */
		public function getArticleByID($id) {
			try {
				$stmt = $this->db->prepare("SELECT * FROM article WHERE IDARTICLE = :id");
				$stmt->bindParam(':id', $id, PDO::PARAM_INT);
				$stmt->execute();
				$result = $stmt->fetch(PDO::FETCH_ASSOC);
				return $result ?: null;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return null;
			}
		}

		/**
		 * Met à jour un article.
		 * 
		 * @throws PDOException
		 * @return bool
		 */
		public function updateArticleByID($id, $article): bool {
			try {
				$stmt = $this->db->prepare("UPDATE article SET IDTAXE = :idTaxe, IDECHE = :idPeriode, TITREARTICLE = :title, DESCARTICLE = :desc, CONTENUARTICLE = :content, PRIXHT = :prixHT WHERE IDARTICLE = :id");
				$stmt->bindParam(':id', $id, PDO::PARAM_INT);
				$stmt->bindParam(':idTaxe', $article['idTaxe'], PDO::PARAM_INT);
				$stmt->bindParam(':idPeriode', $article['idEche'], PDO::PARAM_INT);
				$stmt->bindParam(':title', $article['title'], PDO::PARAM_STR);
				$stmt->bindParam(':content', $article['content'], PDO::PARAM_STR);
				$stmt->bindParam(':desc', $article['desc'], PDO::PARAM_STR);
				$stmt->bindParam(':prixHT', $article['prixHT'], PDO::PARAM_STR);
				$stmt->execute();
				return $stmt->rowCount() > 0;
			} catch (PDOException $e) {
				error_log("Database error in updateArticleByID: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Ajoute un nouvel article.
		 * 
		 * @throws PDOException
		 * @return int|false
		 */
		public function addNewArticle($article) {
			try {
				// Vérifier la connexion
				if (!$this->db) {
					return false;
				}
				
				// Préparer la requête
				$sql = "INSERT INTO article (IDTAXE, IDECHE, TITREARTICLE, DESCARTICLE, CONTENUARTICLE, PRIXHT) VALUES (:idTaxe, :idPeriode, :title, :description, :content, :prixHT)";
				
				$stmt = $this->db->prepare($sql);
				if (!$stmt) {
					return false;
				}
				
				// Binder les paramètres
				$stmt->bindParam(':idTaxe', $article['idTaxe'], PDO::PARAM_INT);
				$stmt->bindParam(':idPeriode', $article['idEche'], PDO::PARAM_INT);
				$stmt->bindParam(':title', $article['title'], PDO::PARAM_STR);
				$stmt->bindParam(':description', $article['description'], PDO::PARAM_STR);
				$stmt->bindParam(':content', $article['content'], PDO::PARAM_STR);
				$stmt->bindParam(':prixHT', $article['prixHT'], PDO::PARAM_STR);
				
				// Exécuter la requête
				$executeResult = $stmt->execute();
				
				if (!$executeResult) {
					return false;
				}
				
				// Récupérer l'ID
				$lastId = $this->db->lastInsertId();
				
				if ($lastId && $lastId > 0) {
					return intval($lastId);
				} else {
					return false;
				}
				
			} catch (PDOException $e) {
				error_log("PDOException dans addNewArticle: " . $e->getMessage());
				return false;
			} catch (\Exception $e) {
				error_log("Exception dans addNewArticle: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Supprime un article par son ID.
		 * 
		 * @throws PDOException
		 * @return bool
		 */
		public function deleteArticleByID($id) {
			try {
				$stmt = $this->db->prepare("DELETE FROM article WHERE IDARTICLE = :id");
				$stmt->bindParam(':id', $id, PDO::PARAM_INT);
				$stmt->execute();
				return $stmt->rowCount() > 0;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return false;
			}
		}

		/**
		 * Récupère tous les articles avec les informations de taxe et période.
		 *
		 * @throws PDOException
		 * @return array
		 */
		public function getAllArticlesWithDetails() {
			try {
				// Compter les articles
				$countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM article");
				$countStmt->execute();
				$count = $countStmt->fetch(PDO::FETCH_ASSOC);
				
				// Si pas d'articles, retourner tableau vide
				if ($count['total'] == 0) {
					return [];
				}
				
				// Requête avec les bons noms de colonnes
				$stmt = $this->db->prepare("
					SELECT 
						a.IDARTICLE as id,
						a.TITREARTICLE,
						a.DESCARTICLE,
						a.CONTENUARTICLE,
						a.PRIXHT,
						a.IDTAXE,
						a.IDECHE,
						t.POURCENTTAXE,
						p.LABELPERIODICITE
					FROM article a
					LEFT JOIN taxe t ON a.IDTAXE = t.IDTAXE
					LEFT JOIN periodicite p ON a.IDECHE = p.IDPERIOD
					ORDER BY a.IDARTICLE DESC
				");
				$stmt->execute();
				$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
				
				return $result;
				
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return [];
			}
		}

		/**
		 * Récupère un article par son ID avec les détails.
		 *
		 * @param int $id
		 * @throws PDOException
		 * @return array|null
		 */
		public function getArticleByIDWithDetails($id) {
			try {
				$stmt = $this->db->prepare("
					SELECT 
						a.IDARTICLE as id,
						a.TITREARTICLE,
						a.DESCARTICLE,
						a.CONTENUARTICLE,
						a.PRIXHT,
						a.IDTAXE,
						a.IDECHE,
						t.POURCENTTAXE,
						p.LABELPERIODICITE
					FROM article a
					LEFT JOIN taxe t ON a.IDTAXE = t.IDTAXE
					LEFT JOIN periodicite p ON a.IDECHE = p.IDPERIOD
					WHERE a.IDARTICLE = :id
				");
				$stmt->bindParam(':id', $id, PDO::PARAM_INT);
				$stmt->execute();
				$result = $stmt->fetch(PDO::FETCH_ASSOC);
				return $result ?: null;
			} catch (PDOException $e) {
				error_log("Database error: " . $e->getMessage());
				return null;
			}
		}
	}