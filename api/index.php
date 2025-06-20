<?php

	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;
	use Core\Env;

	$allowedOrigins = [
		"https://draw-up.anjouweb.com",
		"https://www.anjouweb.com",
		"https://anjouweb.com"
	];

	$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

	if (in_array($origin, $allowedOrigins)) {
		header("Access-Control-Allow-Origin: $origin");
		header("Access-Control-Allow-Credentials: true");
		header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
		header("Access-Control-Allow-Headers: Content-Type, Authorization, User-ID, X-Requested-With");
	} else {
		error_log("Origine non autorisée: $origin");
		header("HTTP/1.1 403 Forbidden");
		exit;
	}

	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(204);
		exit;
	}


	Env::load();

	header('Content-Type: application/json');

	$router = new Routeur();
	$router->routeRequest();
