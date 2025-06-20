<?php

	namespace Controller;
	use Model\Taxe;
	use Model\User;

	/**
	 * Contrôleur pour la gestion des taxes
	 * Gère les opérations CRUD sur les taxes avec vérification d'autorisation
	 */
	class TaxeController {
		private $taxeModel;

		public function __construct() {
			$this->taxeModel = new Taxe();
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
		 * Récupère toutes les taxes pour les options de select
		 * 
		 * @return void
		 */
		public function getAllTaxes() {
			$this->stopIfConnectionIsNotAuthorized();
			try {
				$taxes = $this->taxeModel->getAllTaxes();
				
				if ($taxes !== false) {
					echo json_encode([
						"success" => true,
						"taxes" => $taxes
					]);
				} else {
					http_response_code(500);
					echo json_encode([
						"success" => false,
						"error" => "Erreur lors de la récupération des taxes"
					]);
				}
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la récupération des taxes"
				]);
			}
		}

		/**
		 * Récupère une taxe par son ID
		 * 
		 * @param int $taxeId L'ID de la taxe à récupérer
		 * @return void
		 */
		public function getTaxeByID($taxeId) {
			$this->stopIfConnectionIsNotAuthorized();
			try {
				$taxe = $this->taxeModel->getTaxeByID($taxeId);
				
				if ($taxe) {
					echo json_encode([
						"success" => true,
						"taxe" => $taxe
					]);
				} else {
					http_response_code(404);
					echo json_encode([
						"success" => false,
						"error" => "Taxe non trouvée"
					]);
				}
			} catch (\Exception $e) {
				http_response_code(500);
				echo json_encode([
					"success" => false,
					"error" => "Erreur lors de la récupération de la taxe"
				]);
			}
		}
	}
