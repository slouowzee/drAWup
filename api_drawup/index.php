<?php

	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;
	use Core\Env;

	
	$allowedOrigins = [
	"http://localhost"
	];

	$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

	if (in_array($origin, $allowedOrigins)) {
	header("Access-Control-Allow-Origin: $origin");
	header("Access-Control-Allow-Credentials: true");
	}

	header("Access-Control-Allow-Methods: POST, OPTIONS");
	header("Access-Control-Allow-Headers: Content-Type, Authorization");


	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(204);
		exit;
	}


	Env::load();

	header('Content-Type: application/json');

	$router = new Routeur();
	$router->routeRequest();
