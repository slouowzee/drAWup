<?php

	namespace Core;

	use PDO;
	use PDOException;

	class Database {
		
		private static $connection = null;
		
		/**
		 * Connexion à la base de données.
		 *
		 * @return PDO
		 */
		public static function getConnection(): PDO {
			if (self::$connection === null) {
				try {
					$host = getenv('DB_HOST') ?: 'localhost';
					$dbname = getenv('DB_NAME') ?: 'drawup';
					$user = getenv('DB_USER') ?: 'root';
					$pass = getenv('DB_PASSWORD') ?: '';
					
					// Configuration spécifique pour MySQL avec gestion des BLOBs
					$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
					$options = [
						PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
						PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
						PDO::ATTR_EMULATE_PREPARES => false,
						PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4'
					];
					
					self::$connection = new PDO($dsn, $user, $pass, $options);
					
					// Configuration supplémentaire pour les BLOB
					self::$connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
					
					return self::$connection;
				} catch (PDOException $e) {
					error_log("Erreur de connexion à la base de données: " . $e->getMessage());
					throw new PDOException("Erreur de connexion à la base de données: " . $e->getMessage());
				}
			}
			
			return self::$connection;
		}
	}
