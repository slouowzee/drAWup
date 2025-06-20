function logout() {
	localStorage.removeItem('user_id');
	localStorage.removeItem('user_name');
	localStorage.removeItem('user_email');
	localStorage.removeItem('user_valid');
	localStorage.removeItem('user_picture');
	localStorage.removeItem('user_authToken');
	window.location.href = BASE_URL;
	console.log('Vous avez été déconnecté avec succès.');
}

document.getElementById('logout').addEventListener('click', logout);