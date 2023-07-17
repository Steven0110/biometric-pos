<template lang="pug">
	transition(name="fade")
		.register-box
			.layer
				.outter
					._modal
						.row
							.col-md-12
								h4.text-center(v-show="stage=='scanning' || stage=='updating'")
									|Registro de producto por caja
								.scanner-instructions(v-if="stage=='scanning' || stage=='updating'")
									span
										|Escanee el código de barras de un producto
									input.scanner-input(type="text" v-model="barCode" id="barCode", @keyup.enter="handleProduct")
									loader(v-if="stage == 'updating'")
								.new-product(v-if="stage=='editingNew'")
									.title
										|Nuevo producto detectado
									.subtitle
										|Por favor llena los siguientes campos para registrar el nuevo producto
									.row
										.col-md-6
											label
												|Nombre *
											input.form-control(v-model="newProduct.name", placeholder="Nombre del producto")
										.col-md-6
											label
												|Identificador interno *
											input.form-control(placeholder="SKU", v-model="newProduct.sku")
										.col-md-3
											label
												|Costo de compra *
											input.form-control(type="number", placeholder="10.00", v-model="newProduct.price")
										.col-md-3
											label
												|Precio de venta *
											input.form-control(type="number", placeholder="10.00", v-model="newProduct.unit_price")
										.col-md-6
											label
												|Código de barras *
											input.form-control(type="text", readonly="readonly", v-model="newProduct.id_scanner")
										.col-md-3.offset-md-3
											label
												|Cantidad de cajas
											input.form-control.text-center(v-model="box.quantity", placeholder="Número de cajas", type="number")
										.col-md-3
											label
												|Productos por caja
											input.form-control.text-center(v-model="box.products", placeholder="Cantidd de productos", type="number")
									.row
										.col-md-4.offset-md-4.mt-3.mb-3
											button.btn.btn-info.btn-block(@click="uploadProduct")
												|Agregar producto
								.box-size(v-if="stage=='editBox'")
									.row.mb-3
										.col-md-6
											label
												|Cantidad de cajas
											input.form-control.text-center(v-model="box.quantity", placeholder="Número de cajas", type="number")
										.col-md-6
											label
												|Número de productos por caja
											input.form-control.text-center(v-model="box.products", placeholder="Cantidd de productos", type="number")
									.row
										.col-md-4.offset-md-4.mt-3.mb-3
											button.btn.btn-info.btn-block(@click="uploadBox")
												|Agregar caja
						.row
							.col-md-3
								button.btn.btn-danger.btn-block(@click="$emit('close')")
									|Cerrar
</template>

<script>
	import Loader 	from "@/components/elements/Loader.vue"
	export default {
		props: ["products"],
		data() {
			return {
				stage: "scanning", //scanned, editingNew, updating,
				barCode: "",
				newProduct: {
					name: "",
					sku: "",
					price: "",
					unit_price: "",
					id_scanner: "",
					image: "",
					stock: 1
				},
				box: {
					products: 1,
					quantity: 1
				},
				product: {},
				//barCodes: []
			}
		},
		mounted: function(){
			this.holdBarCodeFocus()
		},
		methods: {
			isRegistered: function( code ) {

				for( let i = 0 ; i < this.products.length ; i++ )
					if( this.products[ i ].id_scanner == code )
						return this.products[ i ]
				
				return false
			},
			handleProduct: function() {
				let product = this.isRegistered( this.barCode )
				this.product = product
				if( product ){ //Increase stock by 1
					//product.stock++
					this.stage = "editBox"

					let url = this.baseApi + this.envPath + "products/" + product._id.$oid
					let config = {
				    	headers: {
				    		'Authorization': 'Bearer ' + localStorage.token
				    	}
				  	}
				  	//7501011101456
				}else{ 	//Register new product
					this.stage = "editingNew"
					this.newProduct.id_scanner = this.barCode
				}
			},
			uploadBox: function(){
				let product = this.product
				let url = this.baseApi + this.envPath + "products/" + product._id.$oid
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
			  	//7501011101456
			  	let stock = Number(this.box.products) * Number(this.box.quantity)
			  	product.stock += stock

			  	this.stage = "updating"
				this.axios.put( url, product, config )
				.then( result => {
					console.log(result.data)
					this.$message("Producto actualizado exitosamente")
					this.$emit("update", product)
				})
				.catch( err => {
					console.log( err )
          			this.$swal("Error", "Por favor vuelva a intentarlo. Si el problema persiste, contacte a soporte técnico", "error")
				})
				.finally( () => {
					this.stage = "scanning"
					this.barCode = ""
				})
			},
			uploadProduct: function() {
				if( this.newProduct.name == "" || this.newProduct.unit_price == "" || this.newProduct.sku == "" || !this.box.quantity || !this.box.products)
					this.$swal("Campos vacíos", "Por favor llena los campos obligatorios", "warning")
				else{
					this.stage = "updating"
					
					let stock = Number(this.box.products) * Number(this.box.quantity)
					let product = { 
						"name": this.newProduct.name,
						"sku": this.newProduct.sku,
						"stock": stock,
						"price": this.newProduct.price,
						"unit_price": this.newProduct.unit_price,
						"id_scanner": this.newProduct.id_scanner
					}

					this.newProduct.name = ""
					this.newProduct.sku = ""
					this.newProduct.unit_price = ""
					this.newProduct.id_scanner = ""
					this.newProduct.image = ""
					this.newProduct.stock = 1

					let url = this.baseApi + this.envPath + "products/"
					let config = {
				    	headers: {
				    		'Authorization': 'Bearer ' + localStorage.token
				    	}
				  	}
					this.axios.post( url, product, config )
					.then( result => {
						//Adds product to this.products // Remove this.barCodes
						this.products.push(result.data)
	          			this.$emit("update")
					})
					.catch( err => {
						console.log( err )
	          			this.$swal("Error", "Por favor vuelva a intentarlo. Si el problema persiste, contacte a soporte técnico", "error")
					})
					.finally(() => {
						this.$message("Producto registrado exitosamente")
						this.$emit("upload", this.newProduct)
						this.stage = "scanning"

						this.barCode = ""
						//this.$emit("add", this.newProduct)
						//this.barCodes.push()
						this.holdBarCodeFocus()
					})
				}
			},
			validateSKU: function() {
				console.log("V-SKU")
			},
			holdBarCodeFocus: function() {
				if(this.stage == "scanning" )
					setTimeout(() => {
						if(document.getElementById("barCode")){
							document.getElementById("barCode").focus()
							this.holdBarCodeFocus()
						}
					}, 300)
			}
		},		
		components: {
			Loader
		}
	}
</script>

<style lang="sass">
	.register-box
		.layer
			position: fixed
			left: 0
			right: 0
			top: 0
			bottom: 0
			margin: auto
			z-index: 19
			width: 100%
			height: 100%
			background-color: rgba(0, 0, 0, 0.3)
			display: table
			.outter
				display: table-cell
				vertical-align: middle
				z-index: 20
				text-align: center
				._modal
					position: relative
					z-index: 21
					margin: 200px
					padding: 20px
					background-color: white
					box-shadow: 0px 1px 13px -1px black
					border-radius: 10px
					.scanner-instructions
						position: relative
						font-size: 30px
						color: rgba(0, 0, 0, 0.5)
						font-family: Lato-Bold
						letter-spacing: 2px
						padding: 30px
						padding-top: 50px
						padding-bottom: 50px
						border-radius: 10px
						border: 2px dashed rgba(0, 0, 0, 0.5)
						margin-bottom: 20px
						animation-name: pulseScanner
						animation-iteration-count: infinite
						animation-duration: 1s

						.scanner-input
							font-size: 30px
							font-family: Lato-Regular
							text-align: center
							margin-top: 15px
							width: 60%
							caret-color: white
					
					.new-product
						.title
							font-size: 24px
							font-family: Lato-Bold
							color: #666
							letter-spacing: 1px
							text-align: center
							margin-bottom: 5px
						.subtitle
							font-size: 20px
							font-family: Lato-Regular
							color: #444
							text-align: center
							margin-bottom: 15px
						label
							margin-top: 10px
	@keyframes pulseScanner
		0%
		50%
			filter: brightness(120%)
			background-color: rgba(0, 0, 255, 0.1)
		0%

</style>