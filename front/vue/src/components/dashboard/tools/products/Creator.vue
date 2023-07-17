<template lang="pug">
	transition(name="fade")
		.product-creator-outter
			.product-creator-inner
				.creator-title
					|Agregar nuevo producto
				.creator-form
					.row
						.col-md-3
							.form-group
								label
									|Nombre
								input.form-control(v-model="product.name")
						.col-md-3
							.form-group
								label
									|SKU
								input.form-control(v-model="product.sku")
						.col-md-2
							.form-group
								label
									|Costo
								input.form-control(type="number", v-model="product.price")
						.col-md-2
							.form-group
								label
									|P. Venta
								input.form-control(type="number", v-model="product.unit_price")
						.col-md-2
							.form-group
								label
									|Categoría *
								select.form-control(v-model="product.category")
									option(v-for="category in categories", :key="category._id.$oid", :value="category._id.$oid")
										|{{ category.name }}
						.col-md-4
							image-uploader(v-model="product.image")
						.col-md-4
							.form-group.relative-block
								button.btn.delete-code.btn-danger(type="button", @click="product.id_scanner = ''")
									fa.option-icon(icon="times")
								label
									|Código de barras
								input.form-control.scanner-input#edit-barcode.pr-5(v-model="product.id_scanner", :readonly="!status.scanning", @keyup.enter="setBarcode", v-focus, ref="edit-barcode")
								button.btn.btn-block.btn-info.btn-scan(@click="handleScanner", :class="{scanning: _scanning}")
									|{{ instructions }}
								button.btn.btn-block.btn-danger(@click="exitScanning", v-show="_scanning")
									|Cancelar
						.col-md-2.offset-md-1
							.row
								.col-md-12
									.form-group
										label
											|Stock inicial
										input.form-control(type="number", v-model="product.stock")
							.row
								.col-md-12
									.custom-control.custom-checkbox.mt-4
										input.custom-control-input#multiprice(type="checkbox", v-model="product.multiprice")
										label.custom-control-label(for="multiprice")
											|¿Producto multiprecio?
							.row
								.col-md-12
									.custom-control.custom-checkbox.mt-4
										input.custom-control-input#pesable(type="checkbox", v-model="product.pesable")
										label.custom-control-label(for="pesable")
											|¿Producto pesable?
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
	import ImageUploader 	from "@/components/elements/ImageUploader.vue"
	import { navigationService } from "vue-spatialnavigation"

	export default {
		data() {
			return {
				instructions: "Escanear código",
				product: {},
				status: {
					scanning: false,
					loading: false
				},
				categories: []
			}
		},
		mounted() {

			this.status.loading = true
			/*	get inventory	*/
			let url = this.baseApi2 + "categoria"
			let config = {
		    	headers: {
		    		'Authorization': 'Bearer ' + localStorage.token
		    	}
		  	}
			this.axios.get( url, config )
			.then( result => this.categories = result.data)
			.catch( err => console.error( err ))
			.finally( () => this.status.loading = false)
		},
		methods: {
			handleScanner: function() {
				this.instructions = "Escanee el código de barras"
				this.status.scanning = true;
				this.loopFocus()

			},
			exitScanning: function() {
				this.status.scanning = false
				this.instructions = "Escanear código"
			},
			finishScanning: function() {
				this.status.scanning = false
				this.instructions = "Volver a escanear"
			},
			setBarcode: function() {
				this.finishScanning()
			},
			loopFocus: function(){
				if( this.status.scanning ){
					setTimeout(() => {
						if(document.getElementById("edit-barcode")){
							this.$refs["edit-barcode"].focus()
							this.loopFocus()
						}
					}, 300)
				}	
			},
			save: function() {
				this.status.loading = true

				let url = this.baseApi + this.envPath + "products/"
				
				if( !this.product.stock )
					this.product.stock = 1
				else
					this.product.stock = Number( this.product.stock )


				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
			  	
				this.axios.post( url, this.product, config )
				.then( ({data}) => {
					if( data.mensaje && data.mensaje.match(/registrado/g)){
	          			this.$swal("Listo", "El producto ya se encontraba previamente registrado, por lo que solamente fue aumentado el stock", "success")
	          			.then(() => this.$emit("update"),this.$emit("close"))
					}else{
	          			this.$swal("Listo", "El producto fue creado correctamente", "success")
	          			.then(() => this.$emit("update"),this.$emit("close"))
					}
				})
				.catch( err => {
					console.log( err )
					//alert(err.response.status)
          			this.$swal("Error", "Por favor verifica que los campos obligatorios estén llenos y vuelva a intentarlo. Si el problema persiste, contacte a soporte técnico.", "error")
				})
				.finally(() => {
					this.status.loading = false
				})
			}
		},
		computed: {
			_scanning: function() {
				return this.status.scanning
			}
		},
		components: {
			CustomLoader,
			ImageUploader,
		}
	}
</script>

<style lang="sass">
	
	.product-creator-outter
		z-index: 100
		position: fixed
		top: 0
		right: 0
		left: 0
		margin: auto
		padding: 25px
		background-color: white
		box-shadow: 0px 0px 15px -7px black
		border-radius: 10px
		margin: 50px
		margin-top: 50px
		max-height: 80vh
		overflow-y: scroll
		.product-creator-inner
			padding-bottom: 70px
			position: relative
			height: 100%
			.relative-block
				position: relative
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
				.scanner-input
					caret-color: red
				.btn-scan
					&.scanning
						animation-name: pulseScanner
						animation-iteration-count: infinite
						animation-duration: 1s
				.delete-code
					position: absolute
					right: -1px
					top: 30px
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
	@keyframes pulseScanner
		0%
		50%
			filter: brightness(60%)
		0%

</style>