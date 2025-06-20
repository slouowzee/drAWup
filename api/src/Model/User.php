<?php

namespace Model;

use Core\Database;
use PDO;
use PDOException;

/**
 * Modèle User pour la gestion des utilisateurs
 * Gère l'authentification, la création et la validation des utilisateurs
 */
class User {
	private $db;

	public function __construct() {
		$this->db = Database::getConnection();
	}

	/**
	 * Trouve un utilisateur par email ou le crée s'il n'existe pas
	 *
	 * @param string $email L'email de l'utilisateur
	 * @param string $name Le nom de l'utilisateur
	 * @return array|null Les informations de l'utilisateur ou null en cas d'erreur
	 */
	public function findOrCreate($email, $name) {
		try {
			$stmt = $this->db->prepare("SELECT IDUTIL as id, NOMUTIL as name, EMAILUTIL as email, ACTIFUTIL as valid FROM utilisateur WHERE EMAILUTIL = :email");
			$stmt->bindParam(':email', $email);
			$stmt->execute();
			$user = $stmt->fetch(PDO::FETCH_ASSOC);

			if ($user) return $user;

			$stmt = $this->db->prepare("INSERT INTO utilisateur (NOMUTIL, EMAILUTIL) VALUES (:name, :email)");
			$stmt->bindParam(':name', $name);
			$stmt->bindParam(':email', $email);
			$stmt->execute();

			return [
				'id' => $this->db->lastInsertId(),
				'name' => $name,
				'email' => $email,
				'valid' => 0
			];
		} catch (PDOException $e) {
			error_log("Database error: " . $e->getMessage());
			$this->db = null;
			return null;
		}
	}

	public function getAllUsers() {
		try {
			$stmt = $this->db->prepare("SELECT IDUTIL as id, NOMUTIL as name, EMAILUTIL as email, ACTIFUTIL as valid FROM utilisateur");
			$stmt->execute();
			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		} catch (PDOException $e) {
			error_log("Database error: " . $e->getMessage());
			$this->db = null;
			return [];
		}
	}

	/**
	 * Génère un nouveau token d'authentification pour l'utilisateur
	 * 
	 * @param int $userId L'ID de l'utilisateur
	 * @return string|null Le nouveau token ou null en cas d'erreur
	 */
	public function generateNewToken($userId) {
		try {
			$token = bin2hex(random_bytes(16));

			$stmt = $this->db->prepare("UPDATE utilisateur SET TOKEN = :token WHERE IDUTIL = :id");
			$stmt->bindParam(':token', $token);
			$stmt->bindParam(':id', $userId, PDO::PARAM_INT);
			$stmt->execute();

			return $token;
		} catch (PDOException $e) {
			error_log("Database error: " . $e->getMessage());
			$this->db = null;
			return null;
		}
	}

	/**
	 * Vérifie si la connexion est autorisée (token valide et utilisateur actif)
	 * 
	 * @return bool True si la connexion est autorisée, false sinon
	 */
	public function checkIfConnectionIsAuthorized() {
		try {
			$headers = array_change_key_case($_SERVER, CASE_LOWER);
			$user_id = $headers['http_user_id'] ?? null;
			$token = $headers['http_authorization'] ?? null;
			
			if (!$token || !$user_id) {
				http_response_code(401);
				echo json_encode([
					"success" => false,
					"error" => "Token d'authentification ou ID utilisateur manquant",
				]);
				return false;
			}

			$stmt = $this->db->prepare("SELECT IDUTIL as id, ACTIFUTIL as valid FROM utilisateur WHERE IDUTIL = :id AND TOKEN = :token");
			$stmt->bindParam(':id', $user_id, PDO::PARAM_INT);
			$stmt->bindParam(':token', $token);
			$stmt->execute();
			$user = $stmt->fetch(PDO::FETCH_ASSOC);
			
			if (!$user) {
				http_response_code(401);
				echo json_encode([
					"success" => false,
					"error" => "Token invalide ou expiré",
					"data" => [
						"user_id" => $user_id,
						"token" => $token
					]
				]);
				return false;
			}

			if (!$user['valid']) {
				http_response_code(403);
				echo json_encode([
					"success" => false,
					"error" => "Compte non validé"
				]);
				return false;
			}
			
			return true;
		} catch (PDOException $e) {
			error_log("Database error: " . $e->getMessage());
			$this->db = null;
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur lors de la vérification du token"
			]);
			return false;
		} catch (\Exception $e) {
			http_response_code(500);
			echo json_encode([
				"success" => false,
				"error" => "Erreur lors de la vérification du token"
			]);
			return false;
		}
	}
}
