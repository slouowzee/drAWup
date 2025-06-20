/**
 * Module d'édition d'articles
 * Gère l'interface de modification des articles avec éditeur Summernote
 * Inclut la validation, la sauvegarde automatique et la gestion des médias
 */
import NotificationManager from './utils/notifications.js';

document.addEventListener('DOMContentLoaded', function() {
	if (window.editArticleInitialized) {
		return;
	}
	window.editArticleInitialized = true;

	let summernoteEditor = null;
	let articleId = null;

	initializeApplication();

	/**
	 * Initialise tous les composants de l'application d'édition
	 */
	function initializeApplication() {
		setupEventListeners();
		extractArticleId();
		initSummernote();
		setupRequiredFieldsValidation();
		loadSelectOptions();
		loadArticleData(articleId);
	}

	/**
	 * Configure tous les écouteurs d'événements de l'interface
	 */
	function setupEventListeners() {
		const backButton = document.querySelector('.pannel__add-client-back-button');
		if (backButton) {
			backButton.addEventListener('click', handleBackButton);
		}

		const updateButton = document.getElementById('article-update');
		if (updateButton) {
			updateButton.addEventListener('click', function(e) {
				e.preventDefault();
				updateArticle();
			});
		} else {
			const saveButton = document.getElementById('article-save');
			if (saveButton) {
				saveButton.addEventListener('click', function(e) {
					e.preventDefault();
					updateArticle();
				});
			}
		}
	}

	/**
	 * Gère la navigation de retour avec sauvegarde automatique
	 * 
	 * @param {Event} e - Événement de clic
	 */
	function handleBackButton(e) {
		e.preventDefault();
		autoSaveFormData();

		const contentSection = document.querySelector('.pannel__content');
		if (contentSection) {
			contentSection.classList.add('fade-out');
			setTimeout(() => {
				window.location.href = BASE_URL + '/pannel/lib';
			}, 300);
		} else {
			window.location.href = BASE_URL + '/pannel/lib';
		}
	}

	/**
	 * Extrait l'ID de l'article depuis l'URL ou les paramètres
	 * Redirige vers la liste si aucun ID valide n'est trouvé
	 */
	function extractArticleId() {
		const urlParams = new URLSearchParams(window.location.search);
		articleId = urlParams.get('id');

		if (!articleId) {
			const pathParts = window.location.pathname.split('/');
			for (let i = pathParts.length - 1; i >= 0; i--) {
				if (pathParts[i] && !isNaN(pathParts[i]) && pathParts[i].trim() !== '') {
					articleId = pathParts[i];
					break;
				}
			}
		}

		if (!articleId) {
			const hiddenIdField = document.getElementById('article-id');
			if (hiddenIdField && hiddenIdField.value) {
				articleId = hiddenIdField.value;
			}
		}

		if (!articleId) {
			NotificationManager.error('ID d\'article manquant.');
			setTimeout(() => {
				window.location.href = BASE_URL + '/pannel/lib';
			}, 3000);
			return;
		}
	}

	// ========== VALIDATION ==========

	/**
	 * Configure la validation des champs requis
	 * Ajoute les événements de validation sur blur et input
	 */
	function setupRequiredFieldsValidation() {
		const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
		
		requiredFields.forEach(field => {
			field.addEventListener('blur', function() {
				validateField(this);
			});
			
			field.addEventListener('input', function() {
				if (this.classList.contains('form-control--error')) {
					this.classList.remove('form-control--error');
				}
			});
		});
	}

	/**
	 * Valide un champ individuel et applique les styles d'erreur
	 * 
	 * @param {HTMLElement} field - Champ à valider
	 * @return {boolean} True si valide, false sinon
	 */
	function validateField(field) {
		if (field.hasAttribute('required') && !field.value.trim()) {
			field.classList.add('form-control--error');
			return false;
		} else {
			field.classList.remove('form-control--error');
			return true;
		}
	}

	/**
	 * Valide l'ensemble du formulaire d'article
	 * 
	 * @return {Object} Résultat de validation avec erreurs
	 */
	function validateArticleForm() {
		const errors = [];
		let valid = true;
		
		const titleInput = document.getElementById('article-title');
		if (!titleInput.value.trim()) {
			errors.push('Le titre de l\'article est obligatoire');
			titleInput.classList.add('form-control--error');
			valid = false;
		} else {
			titleInput.classList.remove('form-control--error');
		}
		
		const priceInput = document.getElementById('article-price');
		if (!priceInput.value.trim()) {
			errors.push('Le prix de l\'article est obligatoire');
			priceInput.classList.add('form-control--error');
			valid = false;
		} else if (isNaN(parseFloat(priceInput.value)) || parseFloat(priceInput.value) < 0) {
			errors.push('Le prix ne peut pas être négatif');
			priceInput.classList.add('form-control--error');
			valid = false;
		} else {
			priceInput.classList.remove('form-control--error');
		}
		
		const taxSelect = document.getElementById('article-tax');
		if (!taxSelect.value) {
			errors.push('La taxation est obligatoire');
			taxSelect.classList.add('form-control--error');
			valid = false;
		} else {
			taxSelect.classList.remove('form-control--error');
		}
		
		const periodicitySelect = document.getElementById('article-periodicity');
		if (!periodicitySelect.value) {
			errors.push('La périodicité est obligatoire');
			periodicitySelect.classList.add('form-control--error');
			valid = false;
		} else {
			periodicitySelect.classList.remove('form-control--error');
		}
		
		// Le contenu n'est plus obligatoire - on enlève la validation
		$('.note-editor').removeClass('note-editor-error');
		
		return {
			valid: valid,
			errors: errors
		};
	}

	// ========== SUMMERNOTE ==========

	/**
	 * Initialise l'éditeur Summernote avec la configuration appropriée
	 * Configure les toolbars différentes pour mobile et desktop
	 */
	function initSummernote() {
		const isMobile = window.innerWidth <= 768;
		
		// Créer d'abord la modal personnalisée
		createCustomImageModal();
		
		$('#article-content-hidden').summernote({
			height: isMobile ? 400 : 350,
			lang: 'fr-FR',
			placeholder: 'Commencez à rédiger votre article ici...',
			
			toolbar: isMobile ? [
				['style', ['style']],
				['font', ['bold', 'italic', 'underline', 'clear']],
				['fontsize', ['fontsize']],
				['color', ['color']],
				['para', ['ul', 'ol', 'paragraph']],
				['table', ['table']],
				['insert', ['link', 'customPicture']],
				['view', ['fullscreen', 'codeview']]
			] : [
				['style', ['style']],
				['font', ['bold', 'italic', 'underline', 'clear']],
				['fontname', ['fontname']],
				['fontsize', ['fontsize']],
				['color', ['color']],
				['para', ['ul', 'ol', 'paragraph']],
				['table', ['table']],
				['insert', ['link', 'customPicture']],
				['view', ['fullscreen', 'codeview']]
			],
			
			defaultTextColor: '#000000',
			inheritPlaceholderFont: true,
			fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48'],
			
			buttons: {
				customPicture: function(context) {
					const ui = $.summernote.ui;
					return ui.button({
						contents: '<i class="fa fa-image"/>',
						tooltip: false, // Désactiver le tooltip pour éviter les erreurs
						click: function(e) {
							e.preventDefault();
							e.stopPropagation();
							showCustomImageModal();
						}
					}).render();
				}
			},
			
			callbacks: {
				onInit: function() {
					summernoteEditor = this;
					
					const editableArea = $('.note-editable');
					editableArea.css({
						'font-weight': 'normal',
						'font-family': 'Arial, sans-serif'
					});
					
					const style = document.createElement('style');
					style.textContent = `
						.note-editable {
							font-weight: normal !important;
						}
						.note-editable p {
							font-weight: normal !important;
						}
						.note-editable * {
							font-weight: inherit !important;
						}
						.note-editable strong,
						.note-editable b {
							font-weight: bold !important;
						}
					`;
					document.head.appendChild(style);
					
					if (isMobile) {
						enhanceMobileInterface();
					}
					
					window.summernoteReady = true;
				},
				
				onFocus: function() {
					const range = document.createRange();
					const sel = window.getSelection();
					this.focus();
				},
				
				onChange: function(contents) {
					autoSaveFormData();
				},
				
				onPaste: function() {
					setTimeout(() => {
						const content = $(this).summernote('code');
						const cleanContent = content.replace(/style="[^"]*font-weight:\s*bold[^"]*"/gi, '');
						if (cleanContent !== content) {
							$(this).summernote('code', cleanContent);
						}
						autoSaveFormData();
					}, 100);
				},
				
				onBlur: function() {
					autoSaveFormData();
				}
			}
		});
	}

	/**
	 * Crée la modal personnalisée pour l'insertion d'images
	 */
	function createCustomImageModal() {
		const modalHtml = `
			<div id="customImageModal" class="custom-image-modal">
				<div class="custom-image-modal-content">
					<div class="custom-image-modal-header">
						<h3 class="custom-image-modal-title">Insérer une image</h3>
						<button type="button" class="custom-image-modal-close">×</button>
					</div>
					<div class="custom-image-modal-body">
						<div class="custom-image-tabs">
							<button type="button" class="custom-image-tab active" data-tab="url">
								<i class="fas fa-link"></i> URL
							</button>
							<button type="button" class="custom-image-tab" data-tab="upload">
								<i class="fas fa-upload"></i> Upload
							</button>
						</div>
						
						<div id="urlTab" class="custom-image-tab-content active">
							<div class="custom-image-form-group">
								<label for="customImageUrl">URL de l'image</label>
								<input type="url" id="customImageUrl" class="custom-image-form-control custom-image-url-input" placeholder="https://exemple.com/image.jpg">
								<div class="custom-image-error" id="customImageUrlError">Veuillez entrer une URL valide</div>
							</div>
						</div>
						
						<div id="uploadTab" class="custom-image-tab-content">
							<div class="custom-image-form-group">
								<div class="custom-image-upload-zone" id="customImageUploadZone">
									<i class="fas fa-cloud-upload-alt custom-image-upload-icon"></i>
									<div class="custom-image-upload-text">Cliquez ou glissez une image ici</div>
									<div class="custom-image-upload-subtext">PNG, JPG, GIF jusqu'à 10MB</div>
								</div>
								<input type="file" id="customImageFile" class="custom-image-file-input" accept="image/*">
								<div class="custom-image-error" id="customImageFileError">Erreur de fichier</div>
							</div>
						</div>
						
						<div class="custom-image-form-group">
							<label for="customImageAlt">Texte alternatif (optionnel)</label>
							<input type="text" id="customImageAlt" class="custom-image-form-control" placeholder="Description de l'image">
						</div>
						
						<div class="custom-image-preview" id="customImagePreview">
							<img id="customImagePreviewImg" src="" alt="Aperçu">
						</div>
					</div>
					<div class="custom-image-modal-footer">
						<button type="button" class="custom-image-btn custom-image-btn-cancel">Annuler</button>
						<button type="button" class="custom-image-btn custom-image-btn-insert" disabled>Insérer l'image</button>
					</div>
				</div>
			</div>
		`;
		
		document.body.insertAdjacentHTML('beforeend', modalHtml);
		setupCustomImageModalEvents();
	}

	/**
	 * Configure les événements de la modal personnalisée
	 */
	function setupCustomImageModalEvents() {
		const modal = document.getElementById('customImageModal');
		const urlInput = document.getElementById('customImageUrl');
		const fileInput = document.getElementById('customImageFile');
		const uploadZone = document.getElementById('customImageUploadZone');
		const altInput = document.getElementById('customImageAlt');
		const preview = document.getElementById('customImagePreview');
		const previewImg = document.getElementById('customImagePreviewImg');
		const urlError = document.getElementById('customImageUrlError');
		const fileError = document.getElementById('customImageFileError');
		const insertBtn = document.querySelector('.custom-image-btn-insert');
		const cancelBtn = document.querySelector('.custom-image-btn-cancel');
		const closeBtn = document.querySelector('.custom-image-modal-close');
		const tabs = document.querySelectorAll('.custom-image-tab');
		const tabContents = document.querySelectorAll('.custom-image-tab-content');

		// Variable pour stocker l'image sélectionnée
		let selectedImageData = null;

		// Gestion des onglets
		tabs.forEach(tab => {
			tab.addEventListener('click', function() {
				const targetTab = this.dataset.tab;
				
				// Mettre à jour les onglets actifs
				tabs.forEach(t => t.classList.remove('active'));
				tabContents.forEach(content => content.classList.remove('active'));
				
				this.classList.add('active');
				document.getElementById(targetTab + 'Tab').classList.add('active');
				
				// Réinitialiser les données
				resetModal();
			});
		});

		// Événements de fermeture
		[cancelBtn, closeBtn].forEach(btn => {
			btn.addEventListener('click', hideCustomImageModal);
		});

		// Fermeture en cliquant sur le backdrop
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				hideCustomImageModal();
			}
		});

		// Fermeture avec Échap
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && modal.classList.contains('show')) {
				hideCustomImageModal();
			}
		});

		// === Validation de l'URL ===
		urlInput.addEventListener('input', function() {
			const url = this.value.trim();
			urlError.style.display = 'none';
			preview.style.display = 'none';
			insertBtn.disabled = true;
			selectedImageData = null;

			if (!url) {
				return;
			}

			try {
				new URL(url);
				
				const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
				const hasImageExtension = imageExtensions.some(ext => 
					url.toLowerCase().includes(ext)
				);

				if (hasImageExtension || url.includes('data:image/')) {
					const testImg = new Image();
					testImg.onload = function() {
						previewImg.src = url;
						preview.style.display = 'block';
						insertBtn.disabled = false;
						selectedImageData = { type: 'url', data: url };
					};
					testImg.onerror = function() {
						urlError.textContent = 'Impossible de charger cette image';
						urlError.style.display = 'block';
					};
					testImg.src = url;
				} else {
					urlError.textContent = 'L\'URL ne semble pas pointer vers une image valide';
					urlError.style.display = 'block';
				}
			} catch (e) {
				urlError.textContent = 'URL invalide';
				urlError.style.display = 'block';
			}
		});

		// === Upload de fichier ===
		
		// Clic sur la zone d'upload
		uploadZone.addEventListener('click', () => {
			fileInput.click();
		});

		// Drag & Drop
		uploadZone.addEventListener('dragover', (e) => {
			e.preventDefault();
			uploadZone.classList.add('dragover');
		});

		uploadZone.addEventListener('dragleave', (e) => {
			e.preventDefault();
			uploadZone.classList.remove('dragover');
		});

		uploadZone.addEventListener('drop', (e) => {
			e.preventDefault();
			uploadZone.classList.remove('dragover');
			
			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFileUpload(files[0]);
			}
		});

		// Sélection de fichier
		fileInput.addEventListener('change', (e) => {
			if (e.target.files.length > 0) {
				handleFileUpload(e.target.files[0]);
			}
		});

		// Fonction pour gérer l'upload de fichier
		function handleFileUpload(file) {
			fileError.style.display = 'none';
			preview.style.display = 'none';
			insertBtn.disabled = true;
			selectedImageData = null;

			// Vérifications
			if (!file.type.startsWith('image/')) {
				fileError.textContent = 'Veuillez sélectionner un fichier image';
				fileError.style.display = 'block';
				return;
			}

			if (file.size > 10 * 1024 * 1024) { // 10MB
				fileError.textContent = 'Le fichier ne doit pas dépasser 10MB';
				fileError.style.display = 'block';
				return;
			}

			// Lire le fichier
			const reader = new FileReader();
			reader.onload = function(e) {
				previewImg.src = e.target.result;
				preview.style.display = 'block';
				insertBtn.disabled = false;
				selectedImageData = { 
					type: 'file', 
					data: e.target.result,
					file: file 
				};
			};
			reader.onerror = function() {
				fileError.textContent = 'Erreur lors de la lecture du fichier';
				fileError.style.display = 'block';
			};
			reader.readAsDataURL(file);
		}

		// Fonction pour réinitialiser la modal
		function resetModal() {
			urlInput.value = '';
			fileInput.value = '';
			preview.style.display = 'none';
			urlError.style.display = 'none';
			fileError.style.display = 'none';
			insertBtn.disabled = true;
			selectedImageData = null;
			uploadZone.classList.remove('dragover');
		}

		// Insertion de l'image
		insertBtn.addEventListener('click', function() {
			const alt = altInput.value.trim();

			if (selectedImageData && summernoteEditor) {
				let imgHtml;
				
				if (selectedImageData.type === 'url') {
					imgHtml = `<img src="${selectedImageData.data}" alt="${alt}" style="max-width: 100%; height: auto;">`;
				} else if (selectedImageData.type === 'file') {
					// Pour les fichiers uploadés, on utilise directement la data URL (base64)
					imgHtml = `<img src="${selectedImageData.data}" alt="${alt}" style="max-width: 100%; height: auto;">`;
				}
				
				$('#article-content-hidden').summernote('pasteHTML', imgHtml);
				hideCustomImageModal();
			}
		});

		// Insertion avec Entrée
		[urlInput, altInput].forEach(input => {
			input.addEventListener('keypress', function(e) {
				if (e.key === 'Enter' && !insertBtn.disabled) {
					insertBtn.click();
				}
			});
		});
	}

	/**
	 * Affiche la modal personnalisée d'insertion d'images
	 */
	function showCustomImageModal() {
		const modal = document.getElementById('customImageModal');
		const urlInput = document.getElementById('customImageUrl');
		const fileInput = document.getElementById('customImageFile');
		const altInput = document.getElementById('customImageAlt');
		const preview = document.getElementById('customImagePreview');
		const urlError = document.getElementById('customImageUrlError');
		const fileError = document.getElementById('customImageFileError');
		const insertBtn = document.querySelector('.custom-image-btn-insert');
		const uploadZone = document.getElementById('customImageUploadZone');

		// Réinitialiser le formulaire
		urlInput.value = '';
		fileInput.value = '';
		altInput.value = '';
		preview.style.display = 'none';
		urlError.style.display = 'none';
		fileError.style.display = 'none';
		insertBtn.disabled = true;
		uploadZone.classList.remove('dragover');

		// Réinitialiser les onglets
		document.querySelectorAll('.custom-image-tab').forEach(tab => {
			tab.classList.remove('active');
		});
		document.querySelectorAll('.custom-image-tab-content').forEach(content => {
			content.classList.remove('active');
		});
		document.querySelector('.custom-image-tab[data-tab="url"]').classList.add('active');
		document.getElementById('urlTab').classList.add('active');

		// Afficher la modal
		modal.classList.add('show');
		document.body.style.overflow = 'hidden';
		
		// Focus sur le champ URL
		setTimeout(() => {
			urlInput.focus();
		}, 100);
	}

	/**
	 * Masque la modal personnalisée d'insertion d'images
	 */
	function hideCustomImageModal() {
		const modal = document.getElementById('customImageModal');
		modal.classList.remove('show');
		document.body.style.overflow = '';
	}

	/**
	 * Sauvegarde automatique des données dans sessionStorage
	 */
	function autoSaveFormData() {
		const formData = {
			'article-id': articleId,
			'article-title': document.getElementById('article-title')?.value || '',
			'article-description': document.getElementById('article-description')?.value || '',
			'article-price': document.getElementById('article-price')?.value || '',
			'article-periodicity': document.getElementById('article-periodicity')?.value || '',
			'article-tax': document.getElementById('article-tax')?.value || '',
			'article-content': summernoteEditor ? $('#article-content-hidden').summernote('code') : ''
		};
		
		try {
			sessionStorage.setItem(`editArticleFormData_${articleId}`, JSON.stringify(formData));
		} catch (error) {
			console.error('Erreur sauvegarde automatique:', error);
		}
	}

	/**
	 * Charge les données de l'article depuis l'API
	 * 
	 * @param {string|number} id - ID de l'article à charger
	 */
	function loadArticleData(id) {
		const loadingNotif = NotificationManager.show('Chargement de l\'article...', 'info', 0);
		
		const url = API_URL + `/article/${id}`;
		
		fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				'User-ID': localStorage.getItem('user_id'),
				'Authorization': localStorage.getItem('user_authToken')
			}
		})
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			NotificationManager.dismiss(loadingNotif);
			
			if (data.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}
			
			if (data.success && data.article) {
				populateForm(data.article);
			} else {
				throw new Error(data.error || 'Article introuvable');
			}
		})
		.catch(error => {
			NotificationManager.dismiss(loadingNotif);
			NotificationManager.error('Erreur lors du chargement: ' + error.message);
			
			setTimeout(() => {
				window.location.href = BASE_URL + '/pannel/lib';
			}, 2000);
		});
	}

	/**
	 * Remplit le formulaire avec les données récupérées
	 * 
	 * @param {Object} article - Données de l'article
	 */
	function populateForm(article) {
		document.getElementById('article-title').value = article.TITLEARTICLE || '';
		document.getElementById('article-description').value = article.DESCARTICLE || '';
		document.getElementById('article-price').value = article.PRIXHTARTICLE || '';
		
		setTimeout(() => {
			if (article.IDPERIOD) {
				document.getElementById('article-periodicity').value = article.IDPERIOD;
			}
			if (article.IDTAXE) {
				document.getElementById('article-tax').value = article.IDTAXE;
			}
		}, 1000);
		
		const content = article.CONTENTARTICLE || '';
		setTimeout(() => {
			if ($('#article-content-hidden').summernote) {
				$('#article-content-hidden').summernote('code', content);
			}
		}, 500);
		
		setTimeout(() => {
			autoSaveFormData();
		}, 2000);
	}

	/**
	 * Met à jour l'article via l'API après validation
	 */
	function updateArticle() {
		if (!summernoteEditor) {
			NotificationManager.error('L\'éditeur n\'est pas prêt. Veuillez réessayer.');
			return;
		}
		
		const form = document.getElementById('editArticleForm');
		let updateButton = document.getElementById('article-update');
		
		if (!updateButton) {
			updateButton = document.getElementById('article-save');
		}
		
		if (!updateButton) {
			NotificationManager.error('Bouton de mise à jour non trouvé');
			return;
		}
		
		const validationResult = validateArticleForm();
		if (!validationResult.valid) {
			NotificationManager.error(validationResult.errors.join('<br>'));
			return;
		}
		
		const formData = new FormData(form);
		formData.append('article_content', $('#article-content-hidden').summernote('code'));
		formData.append('article_id', articleId);
		
		const loadingNotif = NotificationManager.show('Mise à jour de l\'article en cours...', 'info', 0);
		
		updateButton.disabled = true;
		updateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mise à jour...';
		
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 15000);
		
		fetch(API_URL + '/article/update', {
			method: 'POST',
			credentials: 'include',
			body: formData,
			headers: { 
				'User-ID': localStorage.getItem('user_id'),
				'Authorization': localStorage.getItem('user_authToken')
			},
			signal: controller.signal
		})
		.then(response => {
			clearTimeout(timeoutId);
			
			return response.text().then(text => {
				try {
					const data = JSON.parse(text);
					return { data, status: response.status, ok: response.ok };
				} catch (parseError) {
					throw new Error(`Réponse invalide du serveur (Status: ${response.status}): ${text.substring(0, 200)}`);
				}
			});
		})
		.then(({ data, status, ok }) => {
			NotificationManager.dismiss(loadingNotif);
			
			if (data?.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}
			
			if (ok && data?.success) {
				NotificationManager.success('Article mis à jour avec succès!');
				
				sessionStorage.removeItem(`editArticleFormData_${articleId}`);
				
				setTimeout(() => {
					window.location.href = BASE_URL + '/pannel/lib';
				}, 1000);
			} else {
				throw new Error(data?.error || `Erreur HTTP ${status}`);
			}
		})
		.catch(error => {
			clearTimeout(timeoutId);
			NotificationManager.dismiss(loadingNotif);
			
			if (error.name === 'AbortError') {
				NotificationManager.error('Le temps de réponse du serveur est trop long. Réessayez plus tard.');
			} else {
				NotificationManager.error('Erreur: ' + error.message);
			}
			
			updateButton.disabled = false;
			updateButton.innerHTML = '<i class="fas fa-save"></i> Mettre à jour l\'article';
		});
	}

	/**
	 * Charge les options pour les selects (taxes et périodes)
	 */
	function loadSelectOptions() {
		loadTaxes();
		loadPeriodes();
	}

	/**
	 * Charge et peuple le select des taxes
	 */
	function loadTaxes() {
		fetch(API_URL + '/taxe/all', {
			method: 'GET',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				'User-ID': localStorage.getItem('user_id'),
				'Authorization': localStorage.getItem('user_authToken')
			}
		})
		.then(res => {
			const contentType = res.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
			}
			return res.json();
		})
		.then(data => {
			if (data.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}
			
			if (data.success && data.taxes) {
				const taxSelect = document.getElementById('article-tax');
				if (taxSelect) {
					taxSelect.innerHTML = '<option value="">Sélectionner une taxation</option>';
					
					data.taxes.forEach(taxe => {
						const option = document.createElement('option');
						option.value = taxe.IDTAXE;
						option.textContent = `${taxe.POURCENTTAXE}%`;
						taxSelect.appendChild(option);
					});

					taxSelect.addEventListener('change', autoSaveFormData);
				}
			} else {
				console.error("Erreur API taxes :", data.error || "Réponse inattendue");
			}
		})
		.catch(error => {
			console.error('Erreur lors du chargement des taxes:', error);
		});
	}

	/**
	 * Charge et peuple le select des périodicités
	 */
	function loadPeriodes() {
		fetch(API_URL + '/periode/all', {
			method: 'GET',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				'User-ID': localStorage.getItem('user_id'),
				'Authorization': localStorage.getItem('user_authToken')
			}
		})
		.then(res => {
			const contentType = res.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				throw new Error("Réponse invalide : pas du JSON.");
			}
			return res.json();
		})
		.then(data => {
			if (data.error === "Compte non validé") {
				clearUserStorage();
				window.location.href = BASE_URL + '/wait';
				return;
			}
			
			if (data.success && data.periodes) {
				const periodeSelect = document.getElementById('article-periodicity');
				if (periodeSelect) {
					periodeSelect.innerHTML = '<option value="">Sélectionner une périodicité</option>';
					
					data.periodes.forEach(periode => {
						const option = document.createElement('option');
						option.value = periode.IDPERIOD;
						option.textContent = periode.LABELPERIODICITE;
						periodeSelect.appendChild(option);
					});

					periodeSelect.addEventListener('change', autoSaveFormData);
				}
			} else {
				console.error("Erreur API périodes :", data.error || "Réponse inattendue");
			}
		})
		.catch(error => {
			console.error('Erreur lors du chargement des périodicités:', error);
		});
	}

	/**
	 * Nettoie le localStorage lors de la déconnexion forcée
	 */
	function clearUserStorage() {
		localStorage.removeItem('user_id');
		localStorage.removeItem('user_name');
		localStorage.removeItem('user_email');
		localStorage.removeItem('user_valid');
		localStorage.removeItem('user_picture');
		localStorage.removeItem('user_authToken');
		sessionStorage.clear();
	}
});