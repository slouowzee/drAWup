<?php

	namespace Controller;
	use Model\Periode;
	use Model\User;

	/**
	 * Contrôleur pour la gestion des périodicités
	 * Gère les opérations CRUD sur les périodes avec vérification d'autorisation
	 */
	class PeriodeController {
		private $periodeModel;

		public function __construct() {
			$this->periodeModel = new Periode();
		}

		/**
		 * Vérifie l'autorisation de connexion et arrête l'exécution si non autorisée
		 * 
		 * @return void
		 */
		public function stopIfConnectionIsNotAuthorized() {
			$userModel = new User();
			if (!$userModel->checkIfConnectionIsAuthorized()) {
				exit;
			}
		}

		/**
		 * Récupère toutes les périodicités pour les options de select
		 * 
		 * @return void
		 */
		public function getAllPeriodes() {
			$this->stopIfConnectionIsNotAuthorized();
			try {
				$periodes = $this->periodeModel->getAllPeriodes();
				
				if ($periodes !== false) {
					echo json_encode([
						"success" => true,
						"periodes" => $periodes
					]);
				} else {
					http_response_code(500);
					echo json_encode([
						"success" => false,
						"error" => "Erreur lors de la récupération des périodicités"
					]);
				}
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la récupération des périodicités"
				]);
			}
		}

		/**
		 * Récupère une périodicité par son ID
		 * 
		 * @param int $periodeId L'ID de la période à récupérer
		 * @return void
		 */
		public function getPeriodeByID($periodeId) {
			$this->stopIfConnectionIsNotAuthorized();
			try {
				$periode = $this->periodeModel->getPeriodeByID($periodeId);
				
				if ($periode) {
					echo json_encode([
						"success" => true,
						"periode" => $periode
					]);
				} else {
					http_response_code(404);
					echo json_encode([
						"success" => false,
						"error" => "Périodicité non trouvée"
					]);
				}
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la récupération de la périodicité"
				]);
			}
		}
	}
