<?php
	namespace Controller;

	class PannelController {

		/**
		 * Affiche le panneau principale.
		 * 
		 * @return void
		 */
		public function showWelcomePannel() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/WelcomePannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche la bibliothèque d'article.
		 * 
		 * @return void
		 */
		public function showArticlePannel() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/ArticlePannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche le panneau d'ajout d'un article.
		 * 
		 * @return void
		 */
		public function showAddArticlePannel() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/AddArticlePannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		public function showEditArticlePannel($id = null) {
			if ($id === null) {
				header("Location: " . BASE_URL . "/pannel/lib");
				exit;
			}

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/EditArticlePannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche le panneau de création de document.
		 * 
		 * @return void
		 */
		public function showNewDocPannel() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/NewDocPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche le tableau des clients.
		 * 
		 * @return void
		 */
		public function showClientPannel() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/ClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}

		/**
		 * Affiche le panneau d'édition d'un client.
		 * 
		 * @param int|null $id L'ID du client à éditer. Si null, retour sur le tableau des clients.
		 * @return void
		 */
		public function showEditClientPannel($id = null) {
			if ($id === null) {
				header("Location: " . BASE_URL . "/pannel/client");
				exit;
			}

			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/EditClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}


		/**
		 * Affiche le panneau d'ajout d'un client.
		 * 
		 * @return void
		 */
		public function showAddClientPannel() {
			require_once __DIR__ . "/../View/Global/Header.php";
			require_once __DIR__ . "/../View/Global/Navbar.php";
			require_once __DIR__ . "/../View/Sample/AddClientPannel.php";
			require_once __DIR__ . "/../View/Global/Footer.php";
		}
	}