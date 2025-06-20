<?php
	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;

	$routeur = new Routeur();

	define('BASE_URL', 'https://draw-up.anjouweb.com');
	define ('API_URL', 'https://api-draw-up.anjouweb.com');

	// Connexion
	$routeur->get('', 'user', 'login');
	
	// Attente
	$routeur->get('/wait','user','wait');

	// Pannel
	$routeur->get('/pannel','pannel','showWelcomePannel');
	$routeur->get('/pannel/lib','pannel','showArticlePannel');
	$routeur->get('/pannel/lib/add','pannel','showAddArticlePannel');
	$routeur->get('/pannel/lib/{id}','pannel','showEditArticlePannel');
	$routeur->get('/pannel/new','pannel','showNewDocPannel');
	$routeur->get('/pannel/client','pannel','showClientPannel');
	$routeur->get('/pannel/client/add','pannel','showAddClientPannel');
	$routeur->get('/pannel/client/{id}','pannel','showEditClientPannel');

	$routeur->start();