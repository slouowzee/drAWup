<?php

	namespace Core;

	use Controller\UserController;
	use Controller\ClientController;
	use Controller\ArticleController;
	use Controller\TaxeController;
	use Controller\PeriodeController;

	class Routeur {

		/**
		 * Route les requêtes HTTP vers les contrôleurs appropriés en fonction de l'URI et de la méthode HTTP.
		 * Cette méthode analyse l'URI de la requête et appelle le contrôleur et la méthode appropriés.
		 *
		 * @return void
		 */
		public function routeRequest() {
			$uri = $_SERVER['REQUEST_URI'];
			$method = $_SERVER['REQUEST_METHOD'];

			// Debug: Log de l'URI appelée
			error_log("Route demandée: " . $uri . " - Méthode: " . $method);

			// Nettoyer l'URI (enlever les paramètres GET et les slashes en trop)
			$uri = parse_url($uri, PHP_URL_PATH);
			$uri = rtrim($uri, '/');
			
			error_log("URI nettoyée: " . $uri);

			// Vérifier si c'est une requête PUT simulée via POST
			if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
				$method = 'PUT';
				error_log("Méthode PUT simulée détectée via _method");
			}

			if ($uri === '/user/login' && $method === 'POST') {
				(new UserController())->googleLogin();

			} elseif ($uri === '/user/all' && $method === 'GET') {
				(new UserController())->getAllUsers();

			} elseif ($uri === '/user/verify' && $method === 'GET') {
				(new UserController())->verifyUser();

			} elseif ($uri === '/client/total' && $method === 'GET') {
				(new ClientController())->getTotalClient();

			} elseif ($uri === '/client/all' && $method === 'GET') {
				(new ClientController())->getAllClient();

			} elseif ($uri === '/client' && $method === 'POST') {
				(new ClientController())->addNewClient();
				
			} elseif ($uri === '/client/add' && $method === 'POST') {
				(new ClientController())->addNewClient();

			} elseif (preg_match("#^/client/(\d+)$#", $uri, $matches)) {
				$clientId = $matches[1];

				if ($method === 'GET') {
					(new ClientController())->getClientByID($clientId);
				} else if ($method === 'POST' || $method === 'PUT') {
					(new ClientController())->updateClientByID($clientId);
				} elseif ($method === 'DELETE') {
					(new ClientController())->deleteClientByID($clientId);
				} else {
					http_response_code(405);
					echo json_encode(["error" => "Méthode non autorisée"]);
				}

		// Routes des articles - ordre important !
		} elseif ($uri === '/article/total' && $method === 'GET') {
			error_log("Route /article/total appelée");
			(new ArticleController())->getTotalArticle();
		} elseif ($uri === '/article/all' && $method === 'GET') {
			error_log("Route /article/all appelée");
			(new ArticleController())->getAllArticles();
		} elseif ($uri === '/article/add' && $method === 'POST') {
			error_log("Route /article/add appelée avec POST");
			try {
				(new ArticleController())->addNewArticle();
			} catch (\Exception $e) {
				error_log("ERREUR dans le routeur pour /article/add: " . $e->getMessage());
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur dans le routeur: " . $e->getMessage()
				]);
			}
		} elseif ($uri === '/article/update' && $method === 'POST') {
			error_log("Route /article/update appelée avec POST");
			try {
				(new ArticleController())->updateArticleFromForm();
			} catch (\Exception $e) {
				error_log("ERREUR dans le routeur pour /article/update: " . $e->getMessage());
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur dans le routeur: " . $e->getMessage()
				]);
			}
		} elseif (preg_match("#^/article/delete/(\d+)$#", $uri, $matches)) {
			$articleId = $matches[1];
			if ($method === 'DELETE') {
				error_log("Route /article/delete/$articleId appelée");
				(new ArticleController())->deleteArticleByID($articleId);
			} else {
				http_response_code(405);
				echo json_encode(["error" => "Méthode non autorisée pour suppression"]);
			}
		} elseif (preg_match("#^/article/(\d+)$#", $uri, $matches)) {
			$articleId = $matches[1];

			if ($method === 'GET') {
				error_log("Route GET /article/$articleId appelée");
				(new ArticleController())->getArticleByID($articleId);
			} elseif ($method === 'POST' || $method === 'PUT') {
				error_log("Route PUT/POST /article/$articleId appelée");
				(new ArticleController())->updateArticleByID($articleId);
			} elseif ($method === 'DELETE') {
				(new ArticleController())->deleteArticleByID($articleId);
			} else {
				http_response_code(405);
				echo json_encode(["error" => "Méthode non autorisée"]);
			}

			} elseif ($uri === '/taxe/all' && $method === 'GET') {
				(new TaxeController())->getAllTaxes();
			} elseif ($uri === '/periode/all' && $method === 'GET') {
				(new PeriodeController())->getAllPeriodes();
			} elseif (preg_match("#^/taxe/(\d+)$#", $uri, $matches)) {
				$taxeId = $matches[1];
				if ($method === 'GET') {
					(new TaxeController())->getTaxeByID($taxeId);
				} else {
					http_response_code(405);
					echo json_encode(["error" => "Méthode non autorisée"]);
				}

			} elseif (preg_match("#^/periode/(\d+)$#", $uri, $matches)) {
				$periodeId = $matches[1];
				if ($method === 'GET') {
					(new PeriodeController())->getPeriodeByID($periodeId);
				} else {
					http_response_code(405);
					echo json_encode(["error" => "Méthode non autorisée"]);
				}

			} else {
				error_log("ROUTE NON TROUVÉE: " . $uri . " - Méthode: " . $method);
				http_response_code(404);
				echo json_encode(["error" => "Route non trouvée: " . $uri]);
			}
		}
	}