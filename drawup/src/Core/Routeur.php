<?php
	namespace Core;

	use Core\Route;

	class Routeur {
		private array $routes = [];

		public function get(string $path, string $controller, string $method): void {
			$this->routes[] = new Route($path, 'GET', $controller, $method);
		}

		public function post(string $path, string $controller, string $method): void {
			$this->routes[] = new Route($path, 'POST', $controller, $method);
		}

		public function start(): void {
			$requestUri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

			$scriptDir = trim(dirname($_SERVER['SCRIPT_NAME']), '/');

			if (!empty($scriptDir) && str_starts_with($requestUri, $scriptDir)) {
				$requestUri = substr($requestUri, strlen($scriptDir));
				$requestUri = trim($requestUri, '/');
			}

			$requestMethod = $_SERVER['REQUEST_METHOD'];

			try {
				foreach ($this->routes as $route) {
					if ($route->match($requestUri, $requestMethod)) {
						$controllerClass = '\\Controller\\' . ucfirst($route->controller) . 'Controller';

						if (!class_exists($controllerClass)) {
							throw new \Exception("Contrôleur $controllerClass introuvable.");
						}

						$instance = new $controllerClass();

						if (!method_exists($instance, $route->method)) {
							throw new \Exception("Méthode {$route->method} inexistante dans $controllerClass.");
						}

						call_user_func_array([$instance, $route->method], $route->params);
						return;
					}
				}
				throw new \Exception("Route non trouvée pour l'URI : $requestUri");
			} catch (\Throwable $e) {
				http_response_code(500);
				echo "<h3>Erreur : " . $e->getMessage() . "</h3>";
			}
		}
	}
