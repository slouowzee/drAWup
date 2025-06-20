document.addEventListener('DOMContentLoaded', function() {
	const ID = localStorage.getItem('user_id') ?? null;
	const NAME = localStorage.getItem('user_name') ?? null;
	const EMAIL = localStorage.getItem('user_email') ?? null;
	const VALID = localStorage.getItem('user_valid') ?? null;
	const PICTURE = localStorage.getItem('user_picture') ?? null;
	const AUTH_TOKEN = localStorage.getItem('user_authToken') ?? null;

	if ((localStorage.length < 6) || (!ID || !NAME || !EMAIL || !VALID || VALID == 0 || !PICTURE || !AUTH_TOKEN)) {
		localStorage.removeItem('user_id');
		localStorage.removeItem('user_name');
		localStorage.removeItem('user_email');
		localStorage.removeItem('user_valid');
		localStorage.removeItem('user_picture');
		localStorage.removeItem('user_authToken');
		window.location.href = BASE_URL + "/";
	}
});