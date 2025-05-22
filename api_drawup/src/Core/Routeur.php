<?php

	namespace Core;

	use Controller\AuthController;

	class Routeur {
		public function routeRequest() {
			$uri = $_SERVER['REQUEST_URI'];
			$method = $_SERVER['REQUEST_METHOD'];

			$base = '/drawup_demo/API_drAWup';
        		$uri = preg_replace("#^" . preg_quote($base) . "#", '', $uri);

			if ($uri === '/api/login' && $method === 'POST') {
				(new AuthController())->googleLogin();
			} else {
				http_response_code(404);
				echo json_encode(["error" => "Route non trouvée"]);
			}
		}
	}
