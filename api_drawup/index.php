<?php

	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;
	use Core\Env;


	// Configuration CORS simplifiée et plus permissive
	$allowedOrigins = [
		"https://assured-concise-ladybird.ngrok-free.app",
		"https://assured-concise-ladybird.ngrok-free.app/drawup_demo",
		"https://assured-concise-ladybird.ngrok-free.app/drawup_demo/drawup"
	];

	$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

	if (in_array($origin, $allowedOrigins) || strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
		header("Access-Control-Allow-Origin: $origin");
	} else {
		header("Access-Control-Allow-Origin: *"); // Permettre toutes les origines en développement
	}

	header("Access-Control-Allow-Credentials: true");
	header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
	header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

	// Répondre aux requêtes OPTIONS
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(204);
		exit;
	}


	// Charger les variables d'environnement
	Env::load();

	// Définir le type de contenu JSON par défaut, mais permettre aux contrôleurs de le surcharger
	header('Content-Type: application/json');

	// Traiter la requête
	$router = new Routeur();
	$router->routeRequest();
