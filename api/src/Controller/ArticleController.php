<?php

namespace Controller;
use Model\Article;
use Model\User;

/**
 * Contrôleur pour la gestion des articles
 * Gère les opérations CRUD sur les articles avec vérification d'autorisation
 */
class ArticleController {
	private $articleModel;

	public function __construct() {
		$this->articleModel = new Article();
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
	 * Récupère le nombre total d'articles
	 * 
	 * @return void
	 */
	public function getTotalArticle() {
		$this->stopIfConnectionIsNotAuthorized();
		try {
			$total = $this->articleModel->getTotalArticle();
			echo json_encode([
				"success" => true,
				"totalArticles" => $total
			]);
		} catch (\Exception $e) {
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur lors de la récupération du total des articles"
			]);
		}
	}

	/**
	 * Récupère tous les articles avec leurs détails (taxes et périodicités)
	 * 
	 * @return void
	 */
	public function getAllArticles() {
		$this->stopIfConnectionIsNotAuthorized();
		try {
			$articles = $this->articleModel->getAllArticlesWithDetails();
			
			$processedArticles = [];
			
			if (is_array($articles) && count($articles) > 0) {
				$processedArticles = array_map(function($article) {
					return [
						'id' => $article['id'] ?? null,
						'TITREARTICLE' => $article['TITREARTICLE'] ?? '',
						'DESCARTICLE' => $article['DESCARTICLE'] ?? '',
						'CONTENUARTICLE' => $article['CONTENUARTICLE'] ?? '',
						'PRIXHT' => $article['PRIXHT'] ?? '0.00',
						'IDTAXE' => $article['IDTAXE'] ?? null,
						'IDECHE' => $article['IDECHE'] ?? null,
						'POURCENTTAXE' => $article['POURCENTTAXE'] ?? null,
						'LABELPERIODICITE' => $article['LABELPERIODICITE'] ?? null
					];
				}, $articles);
			}

			echo json_encode([
				"success" => true,
				"articles" => $processedArticles,
				"total" => count($processedArticles)
			], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR);
			
		} catch (\Exception $e) {
			error_log("Error in getAllArticles: " . $e->getMessage());
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur serveur: " . $e->getMessage()
			]);
		}
	}

	/**
	 * Récupère un article par son ID avec ses détails
	 * 
	 * @param int $id L'ID de l'article
	 * @return void
	 */
	public function getArticleByID($id) {
		$this->stopIfConnectionIsNotAuthorized();
		try {
			if (!is_numeric($id) || $id <= 0) {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "ID d'article invalide"
				]);
				return;
			}

			$article = $this->articleModel->getArticleByIDWithDetails($id);
			if ($article) {
				$processedArticle = [
					'IDARTICLE' => $article['id'],
					'TITLEARTICLE' => $article['TITREARTICLE'] ?? '',
					'DESCARTICLE' => $article['DESCARTICLE'] ?? '',
					'CONTENTARTICLE' => $article['CONTENUARTICLE'] ?? '',
					'PRIXHTARTICLE' => $article['PRIXHT'] ?? '0.00',
					'IDTAXE' => $article['IDTAXE'] ?? null,
					'IDPERIOD' => $article['IDECHE'] ?? null,
					'POURCENTTAXE' => $article['POURCENTTAXE'] ?? null,
					'LABELPERIODICITE' => $article['LABELPERIODICITE'] ?? null
				];

				echo json_encode([
					"success" => true,
					"article" => $processedArticle
				]);
			} else {
				http_response_code(404);
				echo json_encode([
					"success" => false,
					"error" => "Article non trouvé"
				]);
			}
		} catch (\Exception $e) {
			error_log("Error in getArticleByID: " . $e->getMessage());
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur lors de la récupération de l'article"
			]);
		}
	}

	/**
	 * Met à jour un article depuis un formulaire POST
	 * 
	 * @return void
	 */
	public function updateArticleFromForm() {
		$this->stopIfConnectionIsNotAuthorized();

		try {
			if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
				http_response_code(405);
				echo json_encode(["success" => false, "error" => "Méthode HTTP non supportée"]);
				return;
			}

			$articleId = isset($_POST['article_id']) ? trim($_POST['article_id']) : '';
			if (empty($articleId) || !is_numeric($articleId)) {
				throw new \Exception("ID d'article manquant ou invalide");
			}

			$title = isset($_POST['article-title']) ? trim($_POST['article-title']) : '';
			$description = isset($_POST['article-description']) ? trim($_POST['article-description']) : '';
			$price = isset($_POST['article-price']) ? trim($_POST['article-price']) : '';
			$periodicity = isset($_POST['article-periodicity']) ? trim($_POST['article-periodicity']) : '';
			$tax = isset($_POST['article-tax']) ? trim($_POST['article-tax']) : '';
			$content = isset($_POST['article_content']) ? $_POST['article_content'] : '';
			
			if (empty($title)) {
				throw new \Exception("Le titre de l'article est obligatoire");
			}
			
			if ($price === '') {
				throw new \Exception("Le prix de l'article est obligatoire");
			}
			
			if (!is_numeric($price)) {
				throw new \Exception("Le prix doit être un nombre valide");
			}
			
			$priceFloat = floatval($price);
			if ($priceFloat < 0) {
				throw new \Exception("Le prix ne peut pas être négatif");
			}
			
			if (empty($content)) {
				throw new \Exception("Le contenu de l'article est obligatoire");
			}
			
			$taxeId = 1;
			if (!empty($tax) && is_numeric($tax)) {
				$taxeId = intval($tax);
			}
			
			$periodeId = 1;
			if (!empty($periodicity) && is_numeric($periodicity)) {
				$periodeId = intval($periodicity);
			}
			
			$articleData = [
				'title' => $title,
				'desc' => $description,
				'content' => $content,
				'prixHT' => $priceFloat,
				'idTaxe' => $taxeId,
				'idEche' => $periodeId
			];
			
			$updated = $this->articleModel->updateArticleByID($articleId, $articleData);
			
			if ($updated) {
				echo json_encode([
					"success" => true,
					"message" => "Article mis à jour avec succès"
				], JSON_UNESCAPED_UNICODE);
			} else {
				throw new \Exception("Échec de la mise à jour en base de données");
			}
			
		} catch (\Exception $e) {
			error_log("Erreur dans updateArticleFromForm: " . $e->getMessage());
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => $e->getMessage()
			], JSON_UNESCAPED_UNICODE);
		}
	}

	/**
	 * Met à jour un article par son ID avec des données JSON
	 * 
	 * @param int $id L'ID de l'article
	 * @return void
	 */
	public function updateArticleByID($id) {
		$this->stopIfConnectionIsNotAuthorized();
		try {
			if (!is_numeric($id) || $id <= 0) {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "ID d'article invalide"
				]);
				return;
			}

			$jsonData = json_decode(file_get_contents('php://input'), true);
			if (!$jsonData) {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "Données JSON invalides"
				]);
				return;
			}

			$updated = $this->articleModel->updateArticleByID($id, $jsonData);
			if ($updated) {
				echo json_encode([
					"success" => true,
					"message" => "Article mis à jour avec succès"
				]);
			} else {
				http_response_code(404);
				echo json_encode([
					"success" => false,
					"error" => "Article non trouvé ou mise à jour échouée"
				]);
			}
		} catch (\Exception $e) {
			error_log("Error in updateArticleByID: " . $e->getMessage());
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur lors de la mise à jour de l'article"
			]);
		}
	}

	/**
	 * Ajoute un nouvel article avec validation des données
	 * 
	 * @return void
	 */
	public function addNewArticle() {
		$this->stopIfConnectionIsNotAuthorized();

		try {
			if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
				http_response_code(405);
				echo json_encode(["success" => false, "error" => "Méthode HTTP non supportée"]);
				return;
			}

			$title = isset($_POST['article-title']) ? trim($_POST['article-title']) : '';
			$description = isset($_POST['article-description']) ? trim($_POST['article-description']) : '';
			$price = isset($_POST['article-price']) ? trim($_POST['article-price']) : '';
			$periodicity = isset($_POST['article-periodicity']) ? trim($_POST['article-periodicity']) : '';
			$tax = isset($_POST['article-tax']) ? trim($_POST['article-tax']) : '';
			$content = isset($_POST['article_content']) ? $_POST['article_content'] : '';
			
			if (empty($title)) {
				throw new \Exception("Le titre de l'article est obligatoire");
			}
			
			if ($price === '') {
				throw new \Exception("Le prix de l'article est obligatoire");
			}
			
			if (!is_numeric($price)) {
				throw new \Exception("Le prix doit être un nombre valide");
			}
			
			$priceFloat = floatval($price);
			if ($priceFloat < 0) {
				throw new \Exception("Le prix ne peut pas être négatif");
			}
			
			if (empty($content)) {
				throw new \Exception("Le contenu de l'article est obligatoire");
			}
			
			$taxeId = 1;
			if (!empty($tax) && is_numeric($tax)) {
				$taxeId = intval($tax);
			}
			
			$periodeId = 1;
			if (!empty($periodicity) && is_numeric($periodicity)) {
				$periodeId = intval($periodicity);
			}
			
			$articleData = [
				'title' => $title,
				'description' => $description,
				'content' => $content,
				'prixHT' => $priceFloat,
				'idTaxe' => $taxeId,
				'idEche' => $periodeId
			];
			
			$articleId = $this->articleModel->addNewArticle($articleData);
			
			if ($articleId && $articleId > 0) {
				echo json_encode([
					"success" => true,
					"message" => "Article ajouté avec succès",
					"articleId" => $articleId
				], JSON_UNESCAPED_UNICODE);
			} else {
				throw new \Exception("Échec de l'insertion en base de données");
			}
			
		} catch (\Exception $e) {
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => $e->getMessage()
			], JSON_UNESCAPED_UNICODE);
		}
	}

	/**
	 * Supprime un article par son ID
	 * 
	 * @param int $id L'ID de l'article à supprimer
	 * @return void
	 */
	public function deleteArticleByID($id) {
		$this->stopIfConnectionIsNotAuthorized();
		try {
			if (!is_numeric($id) || $id <= 0) {
				http_response_code(400);
				echo json_encode([
					"success" => false,
					"error" => "ID d'article invalide"
				]);
				return;
			}

			$existingArticle = $this->articleModel->getArticleByID($id);
			if (!$existingArticle) {
				http_response_code(404);
				echo json_encode([
					"success" => false,
					"error" => "Article non trouvé"
				]);
				return;
			}

			$deleted = $this->articleModel->deleteArticleByID($id);
			if ($deleted) {
				echo json_encode([
					"success" => true,
					"message" => "Article supprimé avec succès"
				]);
			} else {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la suppression de l'article"
				]);
			}
		} catch (\Exception $e) {
			error_log("Error in deleteArticleByID: " . $e->getMessage());
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur lors de la suppression de l'article"
			]);
		}
	}
}