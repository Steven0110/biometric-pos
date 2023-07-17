<template lang="pug">
	transition(name="fade")
		.category-creator-outter
			.category-creator-inner
				.creator-title
					|Agregar nueva categoría
				.creator-form
					.row
						.col-md-4
							.form-group.mb-0
								label
									|Nombre
								input.form-control(placeholder="v.g. Abarrotes", v-model="category.name")
						.col-md-8
							.row
								.form-group.col-md-4(v-for="price in prices", :key="price._id.$oid")
									label
										|Descuento de {{ price.name }} (%)
									input.form-control(placeholder="10", v-model="price.customDiscount", type="number")
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
		data() {
			return {
				category: {
					discounts: []
				},
				status: {
					scanning: false,
					loading: false,
					showPass: false
				},
				prices: []
			}
		},
		methods: {
			save: function() {

				let body = {
					name: this.category.name,
					lists: this.prices.map(p => {
						return {
							id: p._id.$oid,
							discount: Number( p.customDiscount || 0 )
						}
					})
				}
				
				if( !this.category.name )
					return this.$swal("Categoría sin nombre", "Por favor escriba un nombre para la categoría.", "warning")

				this.status.loading = true

				let url = this.baseApi2 + "categoria"

				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
			  	
				this.axios.post( url, body, config)
				.then( result => {
          			this.$swal("Listo", "Categoría agregada correctamente", "success")
          			.then(() => {
          				location.reload()
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
		mounted() {

			this.status.loading = true
			/*	get inventory*/
			let url = this.baseApi + this.envPath + "listing/list"
			let config = {
		    	headers: {
		    		'Authorization': 'Bearer ' + localStorage.token
		    	}
		  	}
			this.axios.get( url, config )
			.then( result => {
				console.log( result.data )
				this.prices = result.data
			}).catch( err => {
				console.error( err )
			}).finally( () => this.status.loading = false )
		},
		components: {
			CustomLoader,
		}
	}
</script>

<style lang="sass">
	
	.category-creator-outter
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
		margin-left: 300px
		margin-right: 300px
		.category-creator-inner
			padding-bottom: 70px
			position: relative
			height: 100%
			.creator-title
				font-family: Lato-Bold
				letter-spacing: 2px
				color: #003763
				text-align: center
				font-size: 22px
				text-transform: uppercase
				margin-bottom: 15px
			.creator-form
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