<template lang="pug">
	.login
		.row
			.col-lg-4.offset-lg-4
				.outter-block
					.login-block
						.title
							|ADMINISTRACIÓN
						.subtitle
							|Lázaro Cárdenas 1
						.form
							icon-input(icon="/assets/icons/email-blue.png", placeholder="Usuario", v-model="user.username", type="text", :regex="regex.email", name="Usuario", @valid="checkValidity", tabindex="10")
							icon-input(icon="/assets/icons/password-blue.png", placeholder="Contraseña", v-model="user.password", type="password", name="Contraseña" @valid="checkValidity", tabindex="11", @enter="login")
							transition(name="slide-fade")
								.new-login(v-if="status.verification")
									.text
										|Parece que estás ingresando desde una nueva ubicación. Por favor ingresa el código que te acabamos de enviar a tu correo.
									icon-input(icon="/assets/icons/user-pink.png", placeholder="Código de verificación", v-model="user.code", type="text", name="Código", :regex="regex.code", @valid="checkValidity")
							transition(name="slide-fade")
								.error(v-if="error")
									|{{ error }}
							button-pill.login-button(text="Iniciar sesión", color="white", background="#0084d6", @press="login", :active="status.active", :loading="status.loading", tabindex="12")

</template>

<script>
	import ButtonPill 	from "@/components/elements/ButtonPill.vue"
	import IconInput 	from "@/components/elements/IconInput.vue"

	export default {
		data: function(){
			return {
				"user": {
					"username": "",
					"password": ""
				},
				"regex": {
					"email": /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
					"code": /^[0-9]*$/
				},
				"status": {
					"loading": false,
					"active": true,
					"verification": false,
					"newLocation": false
				},
				"error": ""
			}
		},
		methods: {
			login: function() {

				if( this.user.username != "" && this.user.password != ""){
					this.error = ""
					this.status.loading = true

					let url = this.baseApi + this.envPath + "users/get"

					this.axios.post( url, this.user )
					.then( result => {
						localStorage.token = result.data._token
						localStorage.user = JSON.stringify({
							name: result.data.user.name,
							email: result.data.user.email,
							rol: result.data.user.rol,
						})
						switch( result.data.user.rol ){
							case 1: //Admin
								this.$router.push({path: "/general/products"})
								break;
							case 2: //Cajero
								this.$router.push({path: "/caja"})
								break;
							case 3: //POS
								this.$router.push({path: "/pos"})
								break;
							case 4: //Mixto
								this.$router.push({path: "/caja-y-venta"})
								break;
							case 5: //Reposición
								this.$router.push({path: "/reposicion"})
								break;
						}
					})
					.catch( err => {
						
						if( !err.response ){
							this.Sentry.withScope(scope => {
				              	scope.setExtra("username", this.user.username )
				              	this.Sentry.captureException( err )
				            })
							//this.Sentry.captureException(err)
							this.$swal("Problema de red", "Hubo un error en tu inicio de sesión. Hemos sido notificados y trabajaremos para solucionarlo lo más pronto posible.", "warning")
						}else
							this.$swal("Datos incorrectos", "Por favor revisa tus datos y vuelve a intentarlo", "warning")

					})
					.finally( () => {
						this.status.loading = false
					})
				}else
					this.$swal("Campos vacíos", "Por favor llena los dos campos", "warning")

			},
			checkValidity: function(value) {
				this.status.active = value
			}
		},
		mounted(){
		},
		components: {
			ButtonPill,
			IconInput
		}
	}
</script>

<style lang="sass" scoped>
	.login
		position: fixed
		left: 0
		top: 0
		width: 100%
		height: 100vh
		background-image: url("/assets/img/bg02.jpg")
		background-size: cover
		background-repeat: no-repeat

		.outter-block
			display: table
			height: 100%
			width: 100%
			top: 0
			bottom: 0
			margin-top: auto
			margin-bottom: auto
			margin-top: 14vh
			margin-bottom: 20vh
			padding: 25px
			.login-block
				text-align: center
				display: table-cell
				vertical-align: middle
				background-color: rgba(0, 0, 0, 0.5)
				width: 100%


				.title
					position: relative
					text-align: center
					color: white
					font-family: Lato-Regular
					font-size: 30px
					letter-spacing: 3px
				.subtitle
					position: relative
					text-align: center
					color: white
					font-family: Lato-Regular
					font-size: 22px
					letter-spacing: 3px
					margin-bottom: 40px

					&:before
						content: ""
						position: absolute
						bottom: -10px
						left: 0
						right: 0
						margin-left: auto
						height: 1px
						width: 40px
						background-color: white
						margin-right: auto
				.form
					display: inline-block
					width: 70%
					padding-top: 20px
					padding-bottom: 20px

					.icon-input
						margin-top: 15px
						margin-bottom: 30px

					.login-button
						margin-top: 10px
						font-family: Lato-Bold
						padding-left: 50px
						padding-right: 50px

					.new-login
						.text
							font-family: Lato-Bold
							font-size: 14px
							color: white
					.error
						background-color: pink
						color: #b52828
						border-radius: 20px

</style>