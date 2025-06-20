<?php

	namespace Core;

	use Dotenv\Dotenv;

	class Env {

		/**
		 * Charge les variables d'environnement à partir du fichier .env.
		 * Cette méthode charge les variables d'environnement à partir du fichier .env situé dans le répertoire privé.
		 *
		 * @return void
		 */
		public static function load(): void {
			$dotenv = Dotenv::createImmutable(__DIR__ . '/../../private');
			$dotenv->load();
		}
	}
