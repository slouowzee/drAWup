<?php

	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;
	use Core\Env;


	header("Access-Control-Allow-Origin: http://localhost/drawup_demo/drAWup/");
	header("Access-Control-Allow-Methods: POST, OPTIONS");
	header("Access-Control-Allow-Headers: Content-Type, Authorization");
	header("Access-Control-Allow-Credentials: true");

	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(204);
		exit;
	}


	Env::load();

	header('Content-Type: application/json');

	$router = new Routeur();
	$router->routeRequest();
