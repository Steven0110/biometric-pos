<template lang="pug">
	transition(name="fade")
		.price-editor-outter
			.price-editor-inner
				.editor-title
					|Editar usuario
				.editor-form
					.row
						.col-md-4
							.form-group
								label
									|Nombre
								input.form-control(:value="price.name", placeholder="v.g. MAYOREO", ref="name")
						.col-md-3
							.form-group
								label
									|Tasa de incremento
								.input-group 
									input.form-control(type="number", placeholder="v.g. -10", :value="price.discount", ref="discount")
									.input-group-append
										.input-group-text
											|%
						.col-md-5
							.form-group
								label
									|Descripción
								input.form-control(placeholder="Descripción del precio", :value="price.description", ref="description")
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
		props: ["price"],
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
				let url = this.baseApi + this.envPath + "listing/" + this.price._id.$oid
				let price = {
					"name": this.$refs.name.value || "N/A",
					"discount": parseFloat(Number(this.$refs.discount.value || "0")).toFixed(2),
					"description": this.$refs.description.value || "N/A",
				}
				
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
			  	console.log( JSON.stringify(price) )
				this.axios.put( url, price, config)
				.then( result => {
					console.log(result.data)
          			this.$swal("Listo", "El precio fue actualizado correctamente", "success")
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
	
	.price-editor-outter
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
		.price-editor-inner
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