<?php

	namespace Core;

	use Controller\AuthController;
	use Controller\ClientController;
	use Controller\ArticleController;

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

			// Vérifier si c'est une requête PUT simulée via POST
			if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
				$method = 'PUT';
				error_log("Méthode PUT simulée détectée via _method");
			}

			$base = '/drawup_demo/api_drawup';
			$uri = preg_replace("#^" . preg_quote($base) . "#", '', $uri);

			error_log("URI traitée: $uri avec méthode $method");

			if ($uri === '/api/user/login' && $method === 'POST') {
				(new AuthController())->googleLogin();

			} elseif ($uri === '/api/client/total' && $method === 'GET') {
				(new ClientController())->getTotalClient();

			} elseif ($uri === '/api/client/all' && $method === 'GET') {
				(new ClientController())->getAllClient();

			} elseif ($uri === '/api/client' && $method === 'POST') {
				(new ClientController())->addNewClient();
				
			} elseif ($uri === '/api/client/add' && $method === 'POST') {
				(new ClientController())->addNewClient();

			} elseif (preg_match("#^/api/client/(\d+)$#", $uri, $matches)) {
				$clientId = $matches[1];
				error_log("ClientID extrait: $clientId");

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

			} elseif ($uri === '/api/article/total' && $method === 'GET') {
				(new ArticleController())->getTotalArticle();

			} else {
				http_response_code(404);
				echo json_encode(["error" => "Route non trouvée: " . $uri]);
			}
		}
	}
