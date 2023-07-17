<template lang="pug">
	transition(name="fade")
		.product-editor-outter
			.product-editor-inner
				.editor-title
					|Editar {{ value.name }}
				.editor-form
					.row
						.col-md-3
							.form-group
								label
									|Nombre
								input.form-control(:value="value.name", ref="name")
						.col-md-3
							.form-group
								label
									|SKU
								input.form-control(:value="value.sku", ref="sku")
						.col-md-2
							.form-group
								label
									|Costo
								input.form-control(type="number", :value="value.uPrice", ref="uPrice")
						.col-md-2
							.form-group
								label
									|P. Venta
								input.form-control(type="number", :value="value.sPrice", ref="sPrice")
						.col-md-2
							.form-group
								label
									|Categoría *
								select.form-control(:value="value.category", ref="category")
									option(v-for="category in categories", :key="category._id.$oid", :value="category._id.$oid")
										|{{ category.name }}
						.col-md-4
							image-uploader(v-model="image")
						.col-md-4
							.form-group
								label
									|Código de barras
								input.form-control.scanner-input(:value="value.barCode", id="edit-barcode", :readonly="!status.scanning", @keyup.enter="setBarcode", ref="barcodeInput")
								button.btn.btn-block.btn-info.btn-scan(@click="handleScanner", :class="{scanning: _scanning}")
									|{{ instructions }}
								button.btn.btn-block.btn-danger(@click="exitScanning", v-show="_scanning")
									|Cancelar
						.col-md-2.offset-md-1
							.row
								.col-md-12
									.form-group
										label
											|Stock
										input.form-control(type="number", v-model="value.quantity")
							.row
								.col-md-12
									.custom-control.custom-checkbox.mt-4
										input.custom-control-input#multiprice(type="checkbox", :value="value.multiprice", ref="multiprice", :checked="value.multiprice")
										label.custom-control-label(for="multiprice")
											|¿Producto multiprecio?
							.row
								.col-md-12
									.custom-control.custom-checkbox.mt-4
										input.custom-control-input#pesable(type="checkbox", v-model="value.pesable", ref="pesable", :checked="value.pesable")
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

	export default {
		props: ["value"],
		data() {
			return {
				instructions: "Volvear a escanear",
				status: {
					scanning: false,
					loading: false
				},
				prevCode: false,
				image: "",
				categories: []
			}
		},
		mounted() {
			if( this.value.image )
				this.image = this.value.image


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
				this.prevCode = this.value.barCode

				let value = JSON.parse( JSON.stringify( this.value ))
				value.barCode = ""

				this.$emit("input", value)
				this.status.scanning = true;
				this.loopFocus()

			},
			exitScanning: function() {
				this.status.scanning = false
				this.instructions = "Volver a escanear"

				let value = JSON.parse( JSON.stringify( this.value ))
				value.barCode = this.prevCode
				this.$emit("input", value)
			},
			finishScanning: function() {
				this.status.scanning = false
				this.instructions = "Volver a escanear"

			},
			setBarcode: function() {
				let barCode = this.$refs.barcodeInput.value

				let value = JSON.parse( JSON.stringify( this.value ))
				value.barCode = barCode

				this.$emit("input", value)
				this.finishScanning()
			},
			loopFocus: function(){
				if( this.status.scanning ){
					setTimeout(() => {
						if(document.getElementById("edit-barcode")){
							document.getElementById("edit-barcode").focus()
							this.loopFocus()
						}
					}, 300)
				}	
			},
			save: function() {
				this.status.loading = true

				let _id = this.value._id
				let url = this.baseApi + this.envPath + "products/" + _id
				let product = {
					"name": this.$refs.name.value,
					"sku": this.$refs.sku.value,
					"category": this.$refs.category.value,
					"price": this.$refs.uPrice.value,
					"unit_price": this.$refs.sPrice.value,
					"multiprice": this.$refs.multiprice.checked,
					"pesable": this.$refs.pesable.checked,
					"id_scanner": this.$refs.barcodeInput.value,
					"stock": Number(this.value.quantity),
				}

				if( this.image )
					product.image = this.image

				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
				this.axios.put( url, product, config )
				.then( result => {
					console.log(result.data)
          			this.$swal("Listo", "El producto fue actualizado correctamente", "success")
          			.then(() => {
          				this.$emit("update")
          				this.$emit("close")
          			})
				})
				.catch( err => {
					console.log( err )
          		this.$swal("Error", "Por favor llene todos los campos. Si el problema persiste, contacte a soporte técnico", "error")
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
	
	.product-editor-outter
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
		.product-editor-inner
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
				.scanner-input
					caret-color: red
				.btn-scan
					&.scanning
						animation-name: pulseScanner
						animation-iteration-count: infinite
						animation-duration: 1s
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