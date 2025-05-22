<?php

	namespace Core;

	use Dotenv\Dotenv;

	class Env {
		public static function load(): void {
			$dotenv = Dotenv::createImmutable(__DIR__ . '/../../private');
			$dotenv->load();
		}
	}
