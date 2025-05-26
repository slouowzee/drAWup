<?php
	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;

	$routeur = new Routeur();

	define('BASE_URL', 'http://localhost/drawup_demo/drawup/');

	// Connexion
	$routeur->get('', 'user', 'login');
	$routeur->get('/logout','user','logout');
	$routeur->get('/pannel','pannel','showWelcomePannel');
	$routeur->get('/pannel/lib','pannel','showLibPannel');
	$routeur->get('/pannel/new','pannel','showNewDocPannel');
	$routeur->get('/pannel/client','pannel','showClientPannel');
	$routeur->get('/wait','wait','showWait');


	$routeur->start();