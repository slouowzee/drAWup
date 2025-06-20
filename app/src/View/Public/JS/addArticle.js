/**
 * Module d'ajout d'articles
 * Gère l'interface de création de nouveaux articles avec éditeur Summernote
 * Inclut la validation, la sauvegarde automatique et la restauration de session
 */
import NotificationManager from './utils/notifications.js';

document.addEventListener('DOMContentLoaded', function() {
	if (window.addArticleInitialized) {
		return;
	}
	window.addArticleInitialized = true;

	let summernoteEditor = null;
	let saveButton = null;

	initializeApplication();

	/**
	 * Initialise tous les composants de l'application d'ajout
	 */
	function initializeApplication() {
		setupEventListeners();
		initSummernote();
		restoreFormDataFromSessionStorage();
		setupRequiredFieldsValidation();
		loadSelectOptions();
	}

	/**
	 * Configure tous les écouteurs d'événements de l'interface
	 */
	function setupEventListeners() {
		const backButton = document.querySelector('.pannel__add-client-back-button');
		if (backButton) {
			backButton.addEventListener('click', handleBackButton);
		}

		saveButton = document.getElementById('article-save');
		if (saveButton) {
			saveButton.addEventListener('click', function(e) {
				e.preventDefault();
				saveNewArticle();
			});
		}
	}

	/**
	 * Gère la navigation de retour avec sauvegarde automatique
	 * 
	 * @param {Event} e - Événement de clic
	 */
	function handleBackButton(e) {
		e.preventDefault();
		saveFormDataToSessionStorage();

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
	 * Configure la validation temps réel des champs obligatoires
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
	 * Valide l'ensemble du formulaire d'ajout d'article
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
		
		$('.note-editor').removeClass('note-editor-error');
		
		return {
			valid: valid,
			errors: errors
		};
	}

	/**
	 * Initialise l'éditeur Summernote avec configuration responsive
	 */
	function initSummernote() {
		const isMobile = window.innerWidth <= 768;
		
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
						tooltip: false,
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
					
					setTimeout(() => {
						const savedData = sessionStorage.getItem('addArticleFormData');
						if (savedData) {
							try {
								const formData = JSON.parse(savedData);
								if (formData['article-content'] && formData['article-content'].trim()) {
									$(this).summernote('code', formData['article-content']);
								}
							} catch (error) {
								console.error('Erreur restauration:', error);
							}
						}
					}, 500);
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
	 * Restaure les données sauvegardées depuis sessionStorage
	 */
	function restoreFormDataFromSessionStorage() {
		try {
			const savedData = sessionStorage.getItem('addArticleFormData');
			if (savedData) {
				const formData = JSON.parse(savedData);
				
				for (const key in formData) {
					if (key !== 'article-content') {
						const input = document.getElementById(key);
						if (input && formData[key]) {
							input.value = formData[key];
						}
					}
				}
				
				if (formData['article-content'] && formData['article-content'].trim()) {
					const waitForSummernote = () => {
						if (summernoteEditor) {
							$('#article-content-hidden').summernote('code', formData['article-content']);
							NotificationManager.info('Contenu précédemment sauvegardé restauré');
						} else {
							setTimeout(waitForSummernote, 200);
						}
					};
					
					waitForSummernote();
				}
				
				setTimeout(() => {
					restoreSelectValues(formData);
				}, 1000);
			}
		} catch (error) {
			console.error('Erreur restauration:', error);
		}
	}

	/**
	 * Restaure les valeurs des selects après chargement des options
	 * 
	 * @param {Object} formData - Données sauvegardées
	 */
	function restoreSelectValues(formData) {
		if (formData['article-tax']) {
			const taxSelect = document.getElementById('article-tax');
			if (taxSelect) {
				taxSelect.value = formData['article-tax'];
			}
		}

		if (formData['article-periodicity']) {
			const periodeSelect = document.getElementById('article-periodicity');
			if (periodeSelect) {
				periodeSelect.value = formData['article-periodicity'];
			}
		}
	}

	/**
	 * Supprime les données sauvegardées du sessionStorage
	 */
	function clearSessionStorageFormData() {
		try {
			sessionStorage.removeItem('addArticleFormData');
		} catch (error) {
			console.error('Erreur suppression:', error);
		}
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

	/**
	 * Valide et sauvegarde le nouvel article via l'API
	 */
	function saveNewArticle() {
		if (!summernoteEditor) {
			NotificationManager.error('L\'éditeur n\'est pas prêt. Veuillez réessayer.');
			return;
		}
		
		const form = document.getElementById('addArticleForm');
		
		const validationResult = validateArticleForm();
		if (!validationResult.valid) {
			NotificationManager.error(validationResult.errors.join('<br>'));
			return;
		}
		
		const formData = new FormData(form);
		formData.append('article_content', $('#article-content-hidden').summernote('code'));
		
		const loadingNotif = NotificationManager.show('Ajout de l\'article en cours...', 'info', 0);
		
		saveButton.disabled = true;
		saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
		
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 15000);
		
		fetch(API_URL + '/article/add', {
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
				NotificationManager.success('Article ajouté avec succès!');
				clearSessionStorageFormData();
				
				setTimeout(() => {
					redirectToArticleList();
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
			
			saveButton.disabled = false;
			saveButton.innerHTML = '<i class="fas fa-save"></i> Enregistrer l\'article';
		});
	}

	/**
	 * Redirige vers la liste des articles avec animation
	 */
	function redirectToArticleList() {
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
			console.log("Réponse de l'API :", data);
			
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

					// Ajouter listener pour sauvegarde automatique
					taxSelect.addEventListener('change', autoSaveFormData);

					// Restaurer la valeur sauvegardée
					setTimeout(() => {
						const savedData = sessionStorage.getItem('addArticleFormData');
						if (savedData) {
							try {
								const formData = JSON.parse(savedData);
								if (formData['article-tax']) {
									taxSelect.value = formData['article-tax'];
								}
							} catch (error) {
								console.error('Erreur restauration taxe:', error);
							}
						}
					}, 100);
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
			console.log("Réponse de l'API :", data);
			
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

					// Ajouter listener pour sauvegarde automatique
					periodeSelect.addEventListener('change', autoSaveFormData);

					// Restaurer la valeur sauvegardée
					setTimeout(() => {
						const savedData = sessionStorage.getItem('addArticleFormData');
						if (savedData) {
							try {
								const formData = JSON.parse(savedData);
								if (formData['article-periodicity']) {
									periodeSelect.value = formData['article-periodicity'];
								}
							} catch (error) {
								console.error('Erreur restauration périodicité:', error);
							}
						}
					}, 100);
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
	 * Sauvegarde les données actuelles dans sessionStorage
	 */
	function saveFormDataToSessionStorage() {
		try {
			const formData = {};
			const form = document.getElementById('addArticleForm');
			if (form) {
				const inputs = form.querySelectorAll('input, select, textarea');
				inputs.forEach(input => {
					if (input.id && input.id !== 'article-content-hidden') {
						formData[input.id] = input.value;
					}
				});
				
				if (summernoteEditor) {
					formData['article-content'] = $('#article-content-hidden').summernote('code');
				}
				
				sessionStorage.setItem('addArticleFormData', JSON.stringify(formData));
			}
		} catch (error) {
			console.error('Erreur sauvegarde:', error);
		}
	}

	/**
	 * Déclenche la sauvegarde automatique avec délai (debounce)
	 */
	function autoSaveFormData() {
		clearTimeout(window.autoSaveTimeout);
		window.autoSaveTimeout = setTimeout(() => {
			saveFormDataToSessionStorage();
		}, 1000);
	}
});