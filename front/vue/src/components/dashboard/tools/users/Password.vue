<template lang="pug">
	transition(name="fade")
		.user-editorp-outter
			.user-editorp-inner
				.editorp-title
					|Editar contraseña
				.editorp-form
					.row
						.col-md-4.offset-md-4
							.form-group.password-group
								label
									|Nueva Contraseña
								input.form-control(:type="status.showPass ? 'text' : 'password'", ref="password")
								.pass-shower(@click="status.showPass =! status.showPass")
									img(:src="status.showPass ? '/assets/icons/show-password.png': '/assets/icons/hide-password.png'")
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
					showPass: false
				}
			}
		},
		methods: {
			save: function() {
				this.status.loading = true
				let url = this.baseApi + this.envPath + "users/password/" + this.user._id.$oid
				let body = {
					"password": this.$refs.password.value,
				}
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
				this.axios.put( url, body, config )
				.then( result => {
					console.log(result.data)
          			this.$swal("Listo", "La contraseña del usuario fue actualizada correctamente", "success")
          			.then(() => {
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
	
	.user-editorp-outter
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
		.user-editorp-inner
			padding-bottom: 70px
			position: relative
			height: 100%
			.editorp-title
				font-family: Lato-Bold
				letter-spacing: 2px
				color: #003763
				text-align: center
				font-size: 22px
				text-transform: uppercase
				margin-bottom: 15px
			.editorp-form
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