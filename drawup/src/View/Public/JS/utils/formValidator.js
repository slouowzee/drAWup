/**
 * Utilitaire de validation de formulaires
 * Fournit des méthodes pour valider différents types de champs
 */

const FormValidator = {
    /**
     * Vérifie si un champ est vide
     * @param {string} value - Valeur à vérifier
     * @return {boolean} - true si la valeur n'est pas vide
     */
    isNotEmpty: function(value) {
        return value !== null && value.trim() !== '';
    },
    
    /**
     * Vérifie si une valeur respecte une longueur minimale
     * @param {string} value - Valeur à vérifier
     * @param {number} minLength - Longueur minimale requise
     * @return {boolean} - true si la valeur a au moins la longueur minimale
     */
    minLength: function(value, minLength) {
        return value.length >= minLength;
    },
    
    /**
     * Vérifie si une valeur ne dépasse pas une longueur maximale
     * @param {string} value - Valeur à vérifier
     * @param {number} maxLength - Longueur maximale autorisée
     * @return {boolean} - true si la valeur ne dépasse pas la longueur maximale
     */
    maxLength: function(value, maxLength) {
        return value.length <= maxLength;
    },
    
    /**
     * Vérifie si un fichier a un type MIME autorisé
     * @param {File} file - Fichier à vérifier
     * @param {Array} allowedTypes - Types MIME autorisés
     * @return {boolean} - true si le type de fichier est autorisé
     */
    isFileTypeAllowed: function(file, allowedTypes) {
        return allowedTypes.includes(file.type);
    },
    
    /**
     * Vérifie si un fichier ne dépasse pas une taille maximale
     * @param {File} file - Fichier à vérifier
     * @param {number} maxSizeBytes - Taille maximale en octets
     * @return {boolean} - true si le fichier ne dépasse pas la taille maximale
     */
    isFileSizeAllowed: function(file, maxSizeBytes) {
        return file.size <= maxSizeBytes;
    },
    
    /**
     * Applique une validation personnalisée à une valeur
     * @param {any} value - Valeur à valider
     * @param {Function} validationFn - Fonction de validation
     * @return {boolean} - Résultat de la validation
     */
    custom: function(value, validationFn) {
        return validationFn(value);
    },
    
    /**
     * Valide un formulaire client en mode édition (aucun champ obligatoire)
     * @param {HTMLFormElement} form - Formulaire à valider
     * @return {Object} - Résultat de la validation {isValid: boolean, errors: Array}
     */
    validateEditClientForm: function(form) {
        const result = {
            isValid: true,
            errors: []
        };
        
        const logoInput = form.querySelector('#client-logo');
        if (logoInput.files && logoInput.files.length > 0) {
            const file = logoInput.files[0];
            const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
            const maxSize = 2 * 1024 * 1024; // 2Mo en octets
            
            if (!this.isFileTypeAllowed(file, acceptedTypes)) {
                result.isValid = false;
                result.errors.push('Format de fichier non supporté. Veuillez utiliser JPG, PNG, GIF ou SVG.');
                logoInput.classList.add('form-control--error');
            } else if (!this.isFileSizeAllowed(file, maxSize)) {
                result.isValid = false;
                result.errors.push('Le fichier est trop volumineux. La taille maximale est de 2Mo.');
                logoInput.classList.add('form-control--error');
            } else {
                logoInput.classList.remove('form-control--error');
            }
        }
        
        return result;
    },
    
    /**
     * Valide un formulaire client en mode ajout (tous les champs obligatoires sauf logo et ligne de contact)
     * @param {HTMLFormElement} form - Formulaire à valider
     * @return {Object} - Résultat de la validation {isValid: boolean, errors: Array}
     */
    validateAddClientForm: function(form) {
        const result = {
            isValid: true,
            errors: []
        };
        
        // Validation du nom (obligatoire)
        const nomInput = form.querySelector('#client-nom');
        if (!this.isNotEmpty(nomInput.value)) {
            result.isValid = false;
            result.errors.push('Le nom du client est obligatoire.');
            nomInput.classList.add('form-control--error');
        } else {
            nomInput.classList.remove('form-control--error');
        }
        
        // Validation du prénom (obligatoire)
        const prenomInput = form.querySelector('#client-prenom');
        if (!this.isNotEmpty(prenomInput.value)) {
            result.isValid = false;
            result.errors.push('Le prénom du client est obligatoire.');
            prenomInput.classList.add('form-control--error');
        } else {
            prenomInput.classList.remove('form-control--error');
        }
        
        // Validation de l'adresse (obligatoire)
        const adresseInput = form.querySelector('#client-adresse');
        if (!this.isNotEmpty(adresseInput.value)) {
            result.isValid = false;
            result.errors.push('L\'adresse du client est obligatoire.');
            adresseInput.classList.add('form-control--error');
        } else {
            adresseInput.classList.remove('form-control--error');
        }
        
        // Validation de la ville (obligatoire)
        const villeInput = form.querySelector('#client-ville');
        if (!this.isNotEmpty(villeInput.value)) {
            result.isValid = false;
            result.errors.push('La ville du client est obligatoire.');
            villeInput.classList.add('form-control--error');
        } else {
            villeInput.classList.remove('form-control--error');
        }
        
        // Validation du code postal (uniquement vérifier s'il est renseigné)
        const codePostalInput = form.querySelector('#client-codepostal');
        if (!this.isNotEmpty(codePostalInput.value)) {
            result.isValid = false;
            result.errors.push('Le code postal est obligatoire.');
            codePostalInput.classList.add('form-control--error');
        } else {
            codePostalInput.classList.remove('form-control--error');
        }
        
        // Validation du logo (pas obligatoire, mais format spécifique si présent)
        const logoInput = form.querySelector('#client-logo');
        if (logoInput.files && logoInput.files.length > 0) {
            const file = logoInput.files[0];
            const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
            const maxSize = 2 * 1024 * 1024; // 2Mo en octets
            
            if (!this.isFileTypeAllowed(file, acceptedTypes)) {
                result.isValid = false;
                result.errors.push('Format de fichier non supporté. Veuillez utiliser JPG, PNG, GIF ou SVG.');
                logoInput.classList.add('form-control--error');
            } else if (!this.isFileSizeAllowed(file, maxSize)) {
                result.isValid = false;
                result.errors.push('Le fichier est trop volumineux. La taille maximale est de 2Mo.');
                logoInput.classList.add('form-control--error');
            } else {
                logoInput.classList.remove('form-control--error');
            }
        }
        
        return result;
    },
    
    /**
     * Valide un formulaire client (méthode générale pour compatibilité)
     * @param {HTMLFormElement} form - Formulaire à valider
     * @param {boolean} isEditMode - Si true, on est en mode édition, sinon en mode ajout
     * @return {Object} - Résultat de la validation {isValid: boolean, errors: Array}
     */
    validateClientForm: function(form, isEditMode = false) {
        // Rediriger vers la bonne méthode de validation selon le mode
        if (isEditMode) {
            return this.validateEditClientForm(form);
        } else {
            return this.validateAddClientForm(form);
        }
    }
};

// Exporter le validateur de formulaires
export default FormValidator;
