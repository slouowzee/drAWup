<?php

	namespace Core;

	use Controller\AuthController;
	use Controller\ClientController;
	use Controller\ArticleController;

	class Routeur {
		public function routeRequest() {
			$uri = $_SERVER['REQUEST_URI'];
			$method = $_SERVER['REQUEST_METHOD'];

			$base = '/drawup_demo/api_drawup';
        		$uri = preg_replace("#^" . preg_quote($base) . "#", '', $uri);
			
			if ($uri === '/api/user/login' && $method === 'POST') {
				(new AuthController())->googleLogin();
			} elseif ($uri === '/api/client/total' && $method === 'GET') {
				(new ClientController())->getTotalClient();
			} elseif ($uri === '/api/client/all' && $method === 'GET') {
				(new ClientController())->getAllClient();
			} elseif (preg_match("#^/api/client/(\d+)$#", $uri, $matches) && $method === 'GET') {
				$clientId = $matches[1];
				(new ClientController())->getClientByID($clientId);
			} elseif ($uri === '/api/article/total' && $method === 'GET') {
				(new ArticleController())->getTotalArticle();
			} else {
				http_response_code(404);
				echo json_encode(["error" => "Route non trouvée"]);
			}
		}
	}
