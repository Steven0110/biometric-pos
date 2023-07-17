<template lang="pug">
	transition(name="fade")
		.user-editor-outter
			.user-editor-inner
				.editor-title
					|Editar usuario
				.editor-form
					.row
						.col-md-4
							.form-group
								label
									|Nombre
								input.form-control(:value="user.name", placeholder="Juan Pérez", ref="name")
						.col-md-4
							.form-group
								label
									|Email
								input.form-control(:value="user.email", placeholder="ejemplo@posbiometrico.com.mx", ref="email", type="email")
						.col-md-4
							.form-group
								label
									|Rol
								select.form-control(v-model="user.rol", ref="rol")
									option(value="1")
										|Administrador
									option(value="2")
										|Cajero
									option(value="3")
										|Punto de venta
									option(value="4")
										|Caja y Venta
									option(value="5")
										|Reposición
				.exit-icon
					img(src="/assets/icons/exit.png", @click="$emit('close')")
				button.btn.btn-success.save-button(@click="save")
					|Guardar
				button.btn.btn-danger.back-button(@click="$emit('close')")
					|Regresar
				custom-loader(v-if="status.loading", image="/assets/img/loading.gif", background="white", position="absolute")
</template>

<script>
	import CustomLoader 	from "@/components/elements/CustomLoader.vue"

	export default {
		props: ["user"],
		data() {
			return {
				status: {
					scanning: false,
					loading: false,
				}
			}
		},
		methods: {
			save: function() {
				this.status.loading = true
				let url = this.baseApi + this.envPath + "users/" + this.user._id.$oid
				let user = {
					"name": this.$refs.name.value || "N/A",
					"username": this.$refs.email.value,
					"email": this.$refs.email.value,
					"rol": Number(this.$refs.rol.value || 3)
				}
				console.log( JSON.stringify( user ) )
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
				this.axios.put( url, user, config)
				.then( result => {
					console.log(result.data)
          			this.$swal("Listo", "El usuario fue actualizado correctamente", "success")
          			.then(() => {
          				//location.reload()
          				this.$emit("update")
          			})
				})
				.catch( err => {
					console.log( err )
          			this.$swal("Error", "Por favor vuelva a intentarlo. Si el problema persiste, contacte a soporte técnico", "error")
				})
				.finally(() => {
					this.status.loading = false
				})
			}
		},
		components: {
			CustomLoader,
		}
	}
</script>

<style lang="sass">
	
	.user-editor-outter
		z-index: 100
		position: fixed
		top: 0
		right: 0
		left: 0
		margin: auto
		margin-top: 150px
		padding: 25px
		background-color: white
		box-shadow: 0px 0px 15px -7px black
		border-radius: 10px
		margin: 200px
		.user-editor-inner
			padding-bottom: 70px
			position: relative
			height: 100%
			.editor-title
				font-family: Lato-Bold
				letter-spacing: 2px
				color: #003763
				text-align: center
				font-size: 22px
				text-transform: uppercase
				margin-bottom: 15px
			.editor-form
				label
					font-family: Lato-Bold
					letter-spacing: 1px

				.password-group
					position: relative
					.pass-shower
						position: absolute
						right: 3px
						bottom: 3px
						width: 30px
						height: 30px
						z-index: 15
						&:hover
							cursor: pointer
						img
							max-width: 100%
							max-height: 100%

			.exit-icon
				position: absolute
				right: 0
				top: 0
				width: 30px
				height: 30px
				img
					max-height: 100%
					max-width: 100%
					transition: 0.2s linear all
					&:hover
						cursor: pointer
						transform: scale(1.2)
						transition: 0.2s linear all
			.save-button
				position: absolute
				right: 10px
				bottom: 10px
				z-index: 101
				padding-left: 25px
				padding-right: 25px
			.back-button
				position: absolute
				left: 10px
				bottom: 10px
				z-index: 101
				padding-left: 25px
				padding-right: 25px
</style>