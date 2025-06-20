<?php
	namespace Core;

	use Core\Route;

	class Routeur {
		private array $routes = [];

		/**
		 * Ajoute une route GET.
		 *
		 * @param string $path Le chemin de la route, sans slash au début ni à la fin.
		 * @param string $controller Le nom du contrôleur qui gérera cette route.
		 * @param string $method Le nom de la méthode dans le contrôleur qui sera appelée pour cette route.
		 */
		public function get(string $path, string $controller, string $method): void {
			$this->routes[] = new Route($path, 'GET', $controller, $method);
		}

		/**
		 * Ajoute une route POST.
		 *
		 * @param string $path Le chemin de la route, sans slash au début ni à la fin.
		 * @param string $controller Le nom du contrôleur qui gérera cette route.
		 * @param string $method Le nom de la méthode dans le contrôleur qui sera appelée pour cette route.
		 */
		public function post(string $path, string $controller, string $method): void {
			$this->routes[] = new Route($path, 'POST', $controller, $method);
		}

		/**
		 * Démarre le routeur.
		 * Cette méthode analyse l'URI de la requête et la méthode HTTP,
		 * puis cherche une route correspondante.
		 * Si une route correspond, elle instancie le contrôleur approprié
		 * et appelle la méthode correspondante avec les paramètres extraits de l'URI.
		 *
		 * @throws \Exception Si aucune route ne correspond à l'URI de la requête.
		 * @return void
		 */
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
