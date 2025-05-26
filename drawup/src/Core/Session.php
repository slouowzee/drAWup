<?php
	if (session_status() === PHP_SESSION_NONE) {
		session_set_cookie_params([
			'lifetime' => 0,
			'path' => '/',
			'domain' => 'localhost',
			'secure' => false,
			'httponly' => true,
			'samesite' => 'Lax'
		]);
		session_start();
	}
