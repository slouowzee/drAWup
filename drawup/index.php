<?php
	require_once __DIR__ . '/vendor/autoload.php';

	use Core\Routeur;

	$routeur = new Routeur();

	

	// Connexion
	$routeur->get('', 'user', 'login');
	$routeur->get('/pannel','pannel','showWelcomePannel');
	$routeur->get('/wait','wait','showWait');


	$routeur->start();