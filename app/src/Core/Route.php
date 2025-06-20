<?php
	namespace Core;

	class Route {
		public string $path, $httpMethod, $controller, $method;
		public array $params = [];

		/**
		 * Constructeur de la classe Route.
		 *
		 * @param string $path Le chemin de la route, sans slash au début ni à la fin.
		 * @param string $httpMethod La méthode HTTP (GET, POST, PUT, DELETE, etc.).
		 * @param string $controller Le nom du contrôleur qui gérera cette route.
		 * @param string $method Le nom de la méthode dans le contrôleur qui sera appelée pour cette route.
		 */
		public function __construct(string $path, string $httpMethod, string $controller, string $method) {
			$this->path = trim($path, '/');
			$this->httpMethod = strtoupper($httpMethod);
			$this->controller = $controller;
			$this->method = $method;
		}

		/**
		 * Vérifie si l'URI de la requête correspond à cette route.
		 *
		 * @param string $requestUri L'URI de la requête.
		 * @param string $requestMethod La méthode HTTP de la requête.
		 * @return bool True si la route correspond, sinon false.
		 */
		public function match(string $requestUri, string $requestMethod): bool {
			if ($this->httpMethod !== $requestMethod) {
				return false;
			}

			$pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '([^/]+)', $this->path);
			$pattern = "#^" . $pattern . "$#";

			if (preg_match($pattern, $requestUri, $matches)) {
				array_shift($matches);
				preg_match_all('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', $this->path, $paramNames);
				$this->params = array_combine($paramNames[1], $matches);
				return true;
			}

			return false;
		}
	}
