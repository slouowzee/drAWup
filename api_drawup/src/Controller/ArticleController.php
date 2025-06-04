<?php

	namespace Controller;
	use Model\Article;

	class ArticleController {
		private $articleModel;

		public function __construct() {
			$this->articleModel = new Article();
		}

		/**
		 * Récupère le nombre total d'articles.
		 * 
		 * @return void
		 */
		public function getTotalArticle() {
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
	}