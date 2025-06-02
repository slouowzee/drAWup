<?php

	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;
	use Core\Env;


	$allowedOrigins = [
		"https://assured-concise-ladybird.ngrok-free.app",
		"https://assured-concise-ladybird.ngrok-free.app/drawup_demo",
		"https://assured-concise-ladybird.ngrok-free.app/drawup_demo/drawup"
	];



	$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

	if (in_array($origin, $allowedOrigins)) {
		header("Access-Control-Allow-Origin: $origin");
		header("Access-Control-Allow-Credentials: true");
	}

	header("Access-Control-Allow-Methods: POST, OPTIONS");
	header("Access-Control-Allow-Headers: Content-Type, Authorization");

	header('Content-Type: application/json');

	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(204);
		exit;
	}


	Env::load();

	header('Content-Type: application/json');

	$router = new Routeur();
	$router->routeRequest();
