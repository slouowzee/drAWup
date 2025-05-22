<?php

	namespace Core;

	use PDO;

	class Database {
		public static function getConnection(): PDO {
			return new PDO(
				'mysql:host=' . $_ENV['DB_HOST'] . ';dbname=' . $_ENV['DB_NAME'] . ';charset=utf8mb4',
				$_ENV['DB_USER'],
				$_ENV['DB_PASS'],
				[PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
			);
		}
	}
