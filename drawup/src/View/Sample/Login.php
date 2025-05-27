		<main class="login__container">
			<div class="login">
				<script src="https://accounts.google.com/gsi/client" async defer></script>

				<div class="login__logo__wrapper">
					<img class="login__logo-light" src="<?php echo BASE_URL . 'src\View\Public\IMG\drawup-wo-bg.png'?>" alt="Logo drAW up">
					<img class="login__logo-dark" src="<?php echo BASE_URL . 'src\View\Public\IMG\drawup-blanc-wo-bg.png'?>" alt="Logo drAW up blanc">
				</div>

				<div id="g_id_onload"
					data-client_id="248016549737-muuo2uhaem854v3imejpuhrrmjj68qav.apps.googleusercontent.com"
					data-callback="handleCredentialResponse"
					data-auto_prompt="false">
				</div>

				<div class="g_id_signin"
					data-type="standard"
					data-shape="pill"
					data-theme="outline"
					data-text="continue_with"
					data-size="large"
					data-logo_alignment="left">
				</div>
			</div>

			<button class="second__theme__toggle">
				<i class="fa-solid fa-circle-half-stroke"></i>
			</button>
