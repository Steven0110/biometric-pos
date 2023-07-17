<template lang="pug">
	.pos
		.layer
			.pos-logout
				button.btn.btn-danger(@click="logout")
					|Salir
			.row
				.col-md-10.offset-md-1.order
					.products
						.row.headings
							.col-md-4
								|NOMBRE
							.col-md-3
								|CANTIDAD
							.col-md-2
								|P.U.
							.col-md-2
								|TOTAL
						.row.product-list(v-for="(p, index) in order.products", :id="'p_' + index", v-focus, :tabindex="index", @keyup.delete="deleteProduct( p, index )", data-down="AUTOFOCUS", data-up="AUTOFOCUS", @keyup.enter="editProduct( p )")
							.col-md-4.name
								|{{ p.name }}
							.col-md-3.quantity
								|{{ p.quantity }}
							.col-md-2.price
								|{{ p.price | currency  }}
							.col-md-2.total
								|{{ Number(p.price) * Number(p.quantity) | currency }}
						div.btn.btn-primary.pay-order-btn( v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", type="button", @keyup.enter="_pay" @click="showPartner", id="pay", tabindex="300", ref="pay", v-if="stage == 'ordering'")
							|Confirmar orden

						.row(v-show="orderTotal != 0")
							.col-md-2.offset-md-9
								.order-total-value
									|${{ orderTotal }}
					.placing-order(v-if="stage == 'placing'")
						img(src="/assets/img/loading.gif")

			.input-code(v-show="status.inputCode")
				.form-group
					
					input.form-control(placeholder="SKU o Código de barras", id="inputCode", v-model="search", @keyup.enter="searchBarcode",v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", @keyup.esc="exit")
					
					.product-search(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", v-for="(product, index) in results", @keyup.enter="addProduct(product)", :tabindex="index")
						|{{ product.name }}
			
			// Quantity Edit
			.quantity-edit(v-show="status.quantity")
				.inner
					.title
						|Editar cantidad de {{productEdit.name}}:
					input.form-control.mt-2#quantity(type="number", step="0", v-focus, v-model="productEdit.quantity", @keyup.esc="exit", @keyup.enter="confirmEdit")

			// Weighting
			.weight-edit(v-show="status.weight")
				.inner
					.title
						|Pesar {{productEdit.name}}:
					input.form-control.mt-2#inputWeight(type="number", step="0.001", v-focus, v-model="productEdit.quantity", @keyup.esc="exit", @keyup.enter="confirmEdit", v-show="weight.status == 'weighted'")
					p.weight-failed(v-show="status.weightFailed")
						|Hubo un error al conectarse con la báscula, pero puedes editar el peso manualmente.
					button.mt-4.mb-2.btn.btn-block.btn-primary#weight(v-focus, v-if="weight.status == 'paused'", @click="weightProduct", @keyup.esc="exit")
						|Coloque el producto sobre la báscula y presione Enter
					button.mt-4.mb-2.btn.btn-block.btn-primary#weight(v-focus, v-if="weight.status == 'weighting'", @click="weightProduct")
						|Pesando
						img(src="/assets/img/loading2.gif")
			
			// Check if partner
			.partner-check(v-show="status.showPartner")
				.inner
					.title
						|¿Es cliente registrado?
					div.btn.btn-danger.cancel-btn(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", id="partner_no", data-right="partner_yes", @keyup.enter="_partnerNo", @click="partnerNo", @keyup.esc="exit", tabindex="200", ref="partner_no", v-if="stage == 'partnering'")
						|No
					div.btn.btn-primary.confirm-btn(v-focus, data-down="es_mayorista", data-up="AUTOFOCUS", id="partner_yes", data-left="partner_no", @click="partnerYes", @keyup.esc="exit", tabindex="201", ref="partner_yes", @keyup.enter="_partnerYes", v-if="stage == 'partnering'")
						|Sí
					div.btn.btn-primary.socio-btn(v-focus, data-up="partner_no", id="es_socio", data-left="partner_yes",data-right="es_mayorista", @click="partnerConvert('Socio')", @keyup.esc="exit", tabindex="202", ref="es_socio", @keyup.enter="_partnerSocio", v-if="stage == 'partnering'")
						|Socio
					div.btn.btn-primary.mayorista-btn(v-focus, data-up="partner_yes", id="es_mayorista", data-left="es_socio", @click="partnerConvert('Mayoreo')", @keyup.esc="exit", tabindex="203", ref="es_mayorista", @keyup.enter="_partnerMayorista", v-if="stage == 'partnering'")
						|Mayorista

			// Payment Choose
			.payment-type(v-show="status.showPayment")
				.inner
					.title
						|¿Efectivo o tarjeta?
					div.btn.btn-success.cash-btn(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", id="cash_btn", data-right="card_btn", @keyup.enter="_cash", @keyup.esc="exit", tabindex="202", ref="cash_btn", @click="cash", v-if="stage == 'choosing'")
						|Efectivo
					div.btn.btn-primary.card-btn(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", id="card_btn", data-left="cash_btn", @keyup.enter="_card", @keyup.esc="exit", tabindex="203", ref="card_btn", @click="card", v-if="stage == 'choosing'")
						|Tarjeta

			// Cash Resume
			.cash-payment(v-show="status.showCash")
				.inner
					.title
						|Total
					.pending-total
						|{{ orderTotal | currency }}
					.row
						.col-md-6
							label
								|Efectivo recibido
							.input-group
								.input-group-prepend
									span.input-group-text
										|$
									input.form-control#cash_in(type="number", step="0", v-focus, data-right="confirm_order_btn_2", @keyup.enter="_preconfirmOrder", v-model="cashIn", @keyup.esc="exit")
						.col-md-6
							label
								|Cambio
							.input-group
								.input-group-prepend
									span.input-group-text(id="cash_in")
										|$
									input.form-control#change(type="number", readonly, :value="formatFloat(cashIn - orderTotal)")

					div.btn.btn-primary.confirm-btn(v-focus, data-up="cash_in", id="confirm_order_btn_2", data-left="cash_in", @keyup.enter="_confirmOrder", @keyup.esc="exit", tabindex="204", ref="confirm_order_btn_2", @click="confirmOrder", v-if="stage == 'cashing'")
						|Confirmar orden

			// Card Terminal Pending
			.card-pending(v-show="status.showCardPending")
				.inner
					.title
						|En espera del cobro
					.pending-total
						|{{ orderTotal | currency }}
					div.btn.btn-primary.confirm-order-btn(v-focus, data-down="AUTOFOCUS", id="confirm_order_btn_1", @click="confirmOrder", @keyup.enter="_confirmOrder", @keyup.esc="exit", tabindex="206", ref="confirm_order_btn_1", v-if="stage == 'carding'")
						|Confirmar orden
						
			// Read finger print
			.biometric-scan(v-show="status.showBiometric")
				.inner
					.title
						|Escanear biométrico
					.subtitle.text-center
						|Por favor ponga el dedo índice en el sensor
					div.btn.btn-primary.btn-block.mt-3(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", id="scan_fingerprint", @keyup.enter="_scanFingerprint", @click="scanFingerprint", @keyup.esc="exit", tabindex="202", ref="scan_fingerprint", v-if="stage == 'biometric_scanning'")
						|{{ scanButtonText }}

</template>

<script>
	import { navigationService } from "vue-spatialnavigation"
	export default {
		data() {
			return {
				status: {
					loading: false,
					inputCode: false,
					showPartner: false,
					showPayment: false,
					showCash: false,
					showCardPending: false,
					scanningAvailable: true,
					quantity: false,
				},
				weight: {
					status: "paused"
				},
				stage: "ordering",
				scanButtonText: "Escanear huella digital",
				order: {
					products: []
				},
				payment: "",
				productEdit: {},
				cashIn: undefined,
				search: "",
				results: []
			}
		},
		mounted() {
			/*	Defines Key Listener 	*/
			document.onkeydown = evt => {
				if( this.stage == "ordering"){
					evt = evt || window.event
					let isEscape = false
					if("key" in evt)
				        isEscape = (evt.key === "Escape" || evt.key === "Esc")
				    else
				        isEscape = (evt.keyCode === 27)

				    if( isEscape && this.status.inputCode === false ){
				    	this.logout()
				    }
				}

			}
			window.addEventListener("keypress", function(e) {
      			if( e.keyCode > 0 && e.keyCode <= 126 && e.keyCode != 13 && this.status.scanningAvailable && this.stage == "ordering" ){
      				this.status.inputCode = true

      				if( this.search.length == 0){	//Adds only first character
      					if( document.getElementById("inputCode") !== document.activeElement )
      						this.search += String.fromCharCode( e.keyCode )
      				}else{
      					navigationService.getFocusElementById("inputCode").focus()
      					this.searchSimpleCode()
	      			}
      			}
    		}.bind(this));

			/*	Stores products in local storage 	*/
			this.status.loading = true
			let url = this.baseApi + this.envPath + "products/full"
			let config = {
			   	headers: {
			   		'Authorization': 'Bearer ' + localStorage.token
			   	}
			}
			this.axios.get( url, config )
			.then( result => {
				localStorage.products = JSON.stringify( result.data )
			})
			.catch( err => {
				/*		Notify Error  		*/
				console.error( err )
			})
			.finally( () => {
				this.status.loading = false
			})

			/*	Gets products list 	*/
			url = this.baseApi + this.envPath + "products"
			this.axios.get( url, config )
			.then( result => {
				localStorage.normalProducts = JSON.stringify( result.data )
			})

		},
		filters: {
			currency: function( value ){
				return "$ " + parseFloat(value).toFixed(1).replace('.', '.').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
			}
		},
		computed: {
			orderTotal: function(){
				return this.order.products.reduce((total, current) => {
					return total + (Number(current.price) * Number(current.quantity) )
				}, 0);
			},
			productsQuantity: function(){
				return this.order.products.reduce((total, current) => {
					if(current.pesable)
						return total + 1
					else
						return total + Number(current.quantity)
				}, 0);
			}
		},
		methods: {
			logout: function() {
		    	this.$swal("¿Cerrar sesión?","", "error")
				.then( (result) => {
					if( result.value ){
						localStorage.removeItem("user")
						localStorage.removeItem("token")
						location.reload()
					}
				})
			},
			searchBarcode: function() {
				/*	Executes only on scanner input 	*/
				if( this.search.length > 0 && document.getElementById("inputCode").classList.contains("focus") ){

					let products = JSON.parse( localStorage.normalProducts )
					console.log( products )

					for(let product of products){
						if( product.id_scanner === this.search )
							return this.addProduct( product )
					}

					this.$swal("Error al leer código de barras", "Busque el producto por nombre o SKU", "warning")
				}
			},
			searchSimpleCode: function() {
				this.results = []
				if( this.search.length >= 3){
					let products = JSON.parse( localStorage.normalProducts )
					let search = this.search.toUpperCase()
					for(let product of products){
						
						let name = product.name.toUpperCase()
						let sku = product.sku.toUpperCase()

						let regex = new RegExp( search, "g")
						if( regex.test( name ) || regex.test( sku ) )
							this.results.push( product )
					}
				}
			},
			deleteProduct: function(product, index) {
				this.$swal("¿Eliminar " + product.name + "?","", "warning")
				.then( (result) => {
					if( result.value )
						this.order.products.splice( index, 1 )
				})
			},
			editProduct: function(product) {
				
				if( product.pesable == true ){
					this.stage = "weighting"
					this.productEdit = product
					this.status.weight = true

					this.$nextTick(() => {
						navigationService.getFocusElementById("weight").focus()
						//document.getElementById("weight").select()
					});
				}else{
					this.stage = "editing"
					this.productEdit = product
					this.status.quantity = true

					this.$nextTick(() => {
						navigationService.getFocusElementById("quantity").focus()
						document.getElementById("quantity").select()
					});
				}
			},
			confirmEdit: function() {
				this.productEdit.quantity = Number(this.productEdit.quantity)
				this.status.quantity = false
				this.status.weightFailed = false
				this.stage = "ordering"
				this.weight.status = "paused"
				this.status.weight = false
				this.productEdit = {}

				this.$nextTick(() => {
					navigationService.getFocusElementById("p_" + (this.order.products.length-1)  ).focus()
				});
			},
			weightProduct: function(product) {
				let weightURL = this.servlet + "BasculaServlet"
				this.weight.status = "weighting"
				this.status.weightFailed = false

				this.axios.get( weightURL )
				.then( response => {
					if( response.data.status == 1 ){
						let peso = Number( response.data.peso.replace(/[A-z]/g, "") )
						this.productEdit.quantity = peso
					}else{
						this.status.weightFailed = true
					}
				})
				.catch( err => {
					console.log( err )
					this.$swal("Error al obtener peso automáticamente", "Por favor verifique que la báscula se encuentre encendida y conectada al equipo. Puede modificar manualmente el peso al cerrar este mensaje", "warning")
					.then( result => {
						setTimeout(() => {

							this.$nextTick(() => {
								navigationService.getFocusElementById("inputWeight").focus()
								document.getElementById("inputWeight").select()
							});
						}, 200)
					})
				})
				.finally( () => {
					this.weight.status = "weighted"

					setTimeout(() => {

						this.$nextTick(() => {
							navigationService.getFocusElementById("inputWeight").focus()
							document.getElementById("inputWeight").select()
						});
					}, 200)
				})
			},
			addProduct: function( product ){
				/*	Check if already in order 	*/
				let index = this.isInOrder( product )
				if( index === false){
					let p = JSON.parse( JSON.stringify( product) )
					p.quantity = 1
					this.order.products.push( p )
					this.$nextTick()

					//	Sets Focus
					this.$nextTick(() => {
						navigationService.getFocusElementById("p_" + (this.order.products.length-1)  ).focus()
					});

				}else if(index === -1){
				}else{
					//	Sets Focus
					navigationService.getFocusElementById("p_" + index).focus()
					this.order.products[ index ].quantity++
				}
				this.search = ""
				this.status.inputCode = false
			},
			isInOrder: function( product ){
				for( let i = 0 ; i < this.order.products.length ; i++ )
					if( this.order.products[ i ]._id.$oid === product._id.$oid && this.order.products[ i ].price === product.price ){
						return i
					}else if( this.order.products[ i ]._id.$oid === product._id.$oid && this.order.products[ i ].price != product.price ){
						this.$swal("Producto multiprecio detectado", "No puedes agregar un producto con diferentes precios en la misma orden.", "warning")
						return -1
					}
				return false
			},
			exit: function(){
				this.search = ""
				this.status.inputCode = false
				this.status.showPartner = false
				this.status.showPayment = false
				this.status.showCardPending = false
				this.status.showCash = false
				this.status.showBiometric = false
				this.status.scanningAvailable = true
				this.status.scanning = false
				this.status.quantity = false
				this.status.weight = false
				this.weight.status = "paused"
				this.stage = "ordering"
				this.payment = ""

				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("pay").focus()
				})
			},
			confirmOrder: function() {
				this.status.placingOrder = true
				this.status.showCardPending = false
				this.status.showCash = false
				this.stage = "placing"
				this.status.showPartner = false

				let products = this.order.products.map(p => {
					return {
						"_id": p._id.$oid,
						"name": p.name,
						"sku": p.sku,
						"qty": p.quantity,
						"price": p.price,
						"unit_price": Number(parseFloat( Number( p.unit_price || 0 )).toFixed(2)),
						"product_total": Number( p.quantity ) * Number( p.price )
					}
				})
				let body = { 
					//"customer": {
					//	"_id": "5d86f1932c7dcc539c415ef0",
					//	"name": "Sergio Mireles"
					//},
					"products": products,
					"tax": 0,
					"discount": 0,
					"order_total": this.orderTotal,
					"moneda": "MXN",
					tipo: this.payment
				}

				if( this.partner )
					body.customer = {
						_id: this.partner._id.$oid,
						name: this.partner.nombre
					}
				
				let url = this.baseApi + this.envPath + "orders"
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
			  	
				this.axios.post( url, body, config )
				.then( result => {
					let createdOrder = result.data

					return this.$swal({
						title: "Orden " + (createdOrder.identifier) + " creada y pagada",
						text: "",
						confirmButtonText: "Imprimir comprobante",
						type: "success"
					})
					.then(() => {
						this.printTicket(createdOrder)
					})
				})
				.catch( err => {
					console.error( err )
				})
				.finally(() => {
					this.status.placingOrder = false
					this.stage = "ordering"
				})
			},

			/********************************/
			/*		Navigation Actions		*/
			/********************************/
			showPartner: function(){
				console.log("showPartner")
				if( this.hasCustomPrices() ){
					this.partnerYes()
				}else{
					this.status.showPartner = true
					this.status.scanningAvailable = false
					this.stage = "partnering"

					this.$nextTick(() => {
						navigationService.blurAllFocusElements()
						navigationService.getFocusElementById("partner_yes").focus()
					})
				}

			},
			partnerNo: function(){
				//this.confirmOrder()
				this.status.showPartner = false
				this.status.showPayment = true
				this.status.scanningAvailable = false
				this.stage = "choosing"
				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("cash_btn").focus()
				})
			},
			partnerYes: function(){
				//this.confirmOrder()
				console.log("biometric")
				this.status.showBiometric = true
				this.status.showPartner = false
				this.stage = "biometric_scanning"
				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("scan_fingerprint").focus()
				})
			},

			scanFingerprint: function(){
				/*		Show biometric panel 	*/
				//this.confirmOrder()

				this.scanButtonText = "Escaneando huella digital..."
				this.status.scanning = true
				let biometricUrl = this.servlet + "SensorIdentificarServlet"


				this.axios.get(biometricUrl)
				.then(result => {
					/*		Adjust Prices	*/
					console.log( result.data )
					switch( result.data.code ){
						case 0:
							this.status.scanning = false

							/*	Identifica qué tipo de socio es */
							if( result.data.partner ){
								
								this.partner = result.data.partner

								/*	Modifica precios en caso de ser necesario 	*/
								if( this.partner.tipo != "-1" ){
									let convertedOrder = this.convertOrderToPartner(this.order, this.partner.tipo)
									this.order = convertedOrder
								}
							}
							
							this.confirmOrder()
							break
						case 2:
							this.$swal("No se registró ninguna huella digital", "Por favor vuelva a intentarlo", "warning")
							.then( () => {
								this.showPartner()
							})
							this.scanButtonText = "Escanear huella digital"
							this.status.scanning = false
							break
						case 3:
							this.$swal("No se encontraron coincidencias", "La huella digital no se encuentra registrada en el sistema", "warning")
							.then( () => {
								this.showPartner()
							})
							this.scanButtonText = "Escanear huella digital"
							this.status.scanning = false
							this.showPartner()
							break
						case 4:
							this.$swal("No se pudo reconocer la huella digital", "Por favor vuelva a intentarlo", "warning")
							.then( () => {
								this.showPartner()
							})
							this.scanButtonText = "Escanear huella digital"
							this.status.scanning = false
							this.showPartner()
							break
						case -1001:
						case -1002:
						case -1003:
							this.status.scanning = false
							this.$swal("Error de conexión", "Verifique que el sensor se encuentre conectado correctamente", "warning")
							.then( () => {
								this.showPartner()
							})
							this.scanButtonText = "Escanear huella digital"
							this.$nextTick(() => {
								navigationService.blurAllFocusElements()
								navigationService.getFocusElementById("scan_fingerprint").focus()
							})
							break
					}
				}).catch( err => {
					this.$swal("Error desconocido", "No se pudo verificar la huella digital, por favor intente de nuevo", "warning")
					.then(() => {
						this.showPartner()
					})
					this.Sentry.withScope(scope => {
		              	scope.setExtra("error", JSON.stringify( err ) )
		              	this.Sentry.captureException( err )
		            })
				})
				.finally(() => {
					this.status.scanning = false
				})
			},
			cash: function(){
				console.log("cash")
				this.status.showPayment = false
				this.status.showCash = true
				this.stage = "cashing"
				this.payment = "efectivo"
				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("cash_in").focus()
				})
			},
			card: function(){
				console.log("card")
				this.stage = "carding"
				this.status.showPayment = false
				this.status.showCardPending = true
				this.status.scanningAvailable = false
				this.payment = "tarjeta"

				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("confirm_order_btn_1").focus()
				})
			},
			printTicket: function(order){
				let printURL = this.servlet + "imprimirComprobantePago"

				let trimmedOrder = this.trimOrderToPrinter( order )
				trimmedOrder.productsQuantity = this.productsQuantity || 0
				trimmedOrder = this.getPrintableOrder( trimmedOrder )


				this.axios.post(printURL, trimmedOrder)
				.then(printerResult => {
					switch(printerResult.data.code){
						case 0:
							location.reload()
							break
						case 4194432: //Impresora abierta
						case 4224: //Impresora abierta antes de prenderla
						case 4198400:
							this.$swal({
								title: "Impresora abierta",
								text: "Por favor asegurése que la impresora se encuentra cerrada",
								type: "warning",
								confirmButtonText: "Volver a imprimir ticket"
							})
							.then(() => {
								this.printTicket()
							})
							break
						case 144: //Problema con el papel
						case 1024: //Mal colocado el papel
							this.$swal({
								title: "Hay un problema con el papel",
								text: "Por favor asegurése que haya suficiente papel y que no se encuentre atorado",
								type: "warning",
								confirmButtonText: "Volver a imprimir ticket"
							})
							.then(() => {
								this.printTicket()
							})
							break
						case 4096: //Apagada la impresora
							this.$swal({
								title: "Impresora apagada",
								text: "Por favor encienda la impresora",
								type: "warning",
								confirmButtonText: "Volver a imprimir ticket"
							})
							.then(() => {
								this.printTicket()
							})
							break
						case -1001: //NPI
							this.Sentry.withScope(scope => {
				              	scope.setExtra("order", JSON.stringify( this.order ) )
				              	this.Sentry.captureException( err )
				            })
							this.$swal({
								title: "Error desconocido",
								text: "Por favor vuelva a intentarlo",
								type: "warning",
								confirmButtonText: "Volver a imprimir ticket"
							})
							.then(() => {
								this.printTicket()
							})
							break
					}
				})
				.catch( err => {
					console.log( err )
				})
			},
			trimOrderToPrinter: function(order){
				for( let i = 0 ; i < order.products.length ; i++ ){
					if( order.products[ i ].name.length >= 32)
						order.products[ i ].name = order.products[ i ].name.substr(0, 32)
				}
				return order
			},
			getPrintableOrder: function(order){
				for( let i = 0 ; i < order.products.length ; i++ ){
					order.products[ i ].pesable = this.order.products[ i ].pesable || false
					order.products[ i ].product_total = Number(parseFloat(Number(order.products[ i ].product_total)).toFixed(2))
				}
				return order
			},

			/********************************/
			/*		Custom Validations		*/
			/********************************/
			hasCustomPrices: function() {
				for( let i = 0 ; i < this.order.products.length ; i++ )
					if( this.order.products[ i ].name.match(/Socio/g) )
						return true
				return false
			},

			/********************************/
			/*		Click Triggers 			*/
			/********************************/
			_weight: function() {
				console.log("_weight")
				this.$refs.weight.click()
			},
			_pay: function() {
				console.log("_pay")
				this.$refs.pay.click()
			},
			_partnerNo: function() {
				console.log("_pn")
				this.$refs.partner_no.click()
			},
			_partnerYes: function() {
				console.log("_py")
				this.$refs.partner_yes.click()
			},
			_partnerSocio: function() {
				this.$refs.es_socio.click()
			},
			_partnerMayorista: function() {
				this.$refs.es_mayorista.click()
			},
			_scanFingerprint: function() {
				console.log("_sb")
				this.$refs.scan_fingerprint.click()
			},
			_cash: function() {
				console.log("_cash")
				this.$refs.cash_btn.click()
			},
			_card: function() {
				console.log("_card")
				this.$refs.card_btn.click()
			},
			_confirmOrder: function() {
				console.log("_co")
				if( this.stage == "carding")
					this.$refs.confirm_order_btn_1.click()
				else
					this.$refs.confirm_order_btn_2.click()
			},
			_preconfirmOrder: function() {
				console.log("_pco")
				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("confirm_order_btn_2").focus()
				})
			},
			partnerConvert: function(type) {
				
				let convertedOrder = this.convertOrderToPartner(this.order, type)
				this.order = convertedOrder

				this.confirmOrder()
			},

			getPartnerProduct: function(product, type){
				let products = JSON.parse( localStorage.products )
				let productName = product.name.toUpperCase()
				let regex = new RegExp(`/${type.toUpperCase()}/`, "g")
				let searchString = productName.match( regex ) ? productName : productName + " " + type
				for(let p of products){
					if(searchString.toUpperCase() == p.name.toUpperCase())
						return p
				}
				return product
			},
			convertOrderToPartner: function(order, type){
				let newOrder = {products: []}
				for(let product of order.products){
					let aux = this.getPartnerProduct( product, type )
					aux.quantity = product.quantity
					newOrder.products.push( aux )
				}

				return newOrder
			}
		}
	}
</script>

<style lang="sass">
	.pos
		position: fixed
		left: 0
		top: 0
		width: 100%
		height: 100%
		background-image: url("/assets/img/bg02.jpg")
		background-repeat: no-repeat
		background-size: cover
		padding: 0
		margin: 0

		.layer
			width: 100%
			height: 100%
			background-color: rgba(0, 0, 0, 0.5)
			position: relative
			padding: 25px

			.pos-logout
				position: fixed
				left: 10px
				bottom: 10px

			.input-code
				width: 33%
				height: 90px
				position: absolute
				background-color: #0666ab
				padding: 25px
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				border-radius: 7px
				box-shadow: 0 0 22px -2px black
				.form-group
					max-height: 335px
					overflow-y: auto

			.partner-check
				width: 33%
				height: 250px
				position: absolute
				padding: 25px
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				border-radius: 7px
				box-shadow: 0 0 22px -2px black
				background-color: #dbe8ff

				.inner
					position: relative
					width: 100%
					height: 100%

					.title
						font-family: Lato-Bold
						text-align: center
						font-size: 24px;
					.cancel-btn
						position: absolute
						left: 10px
						bottom: 50px !important
						padding-left: 30px
						padding-right: 30px
						text-align: center
					.confirm-btn
						position: absolute
						text-align: center
						right: 10px
						bottom: 50px !important
						padding-left: 30px
						padding-right: 30px
					.socio-btn
						position: absolute
						text-align: center
						left: 10px
						bottom: 0px
						width: calc(50% - 25px)
						padding-left: 50px
						padding-right: 50px
					.mayorista-btn
						position: absolute
						text-align: center
						right: 10px
						bottom: 0px
						width: calc(50% - 25px)
						padding-left: 50px
						padding-right: 50px

			.quantity-edit
				width: 33%
				height: 150px
				position: absolute
				padding: 25px
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				border-radius: 7px
				box-shadow: 0 0 22px -2px black
				background-color: #dbe8ff

				.inner
					position: relative
					width: 100%
					height: 100%

					.title
						font-family: Lato-Bold
						text-align: center
						font-size: 24px;
					.confirm-btn
						position: absolute
						text-align: center
						right: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px

			.weight-edit
				width: 33%
				height: 150px
				position: absolute
				padding: 25px
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				border-radius: 7px
				box-shadow: 0 0 22px -2px black
				background-color: #dbe8ff

				.inner
					position: relative
					width: 100%
					height: 100%

					.title
						font-family: Lato-Bold
						text-align: center
						font-size: 24px;
					.confirm-btn
						position: absolute
						text-align: center
						right: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px

					#weight
						img
							display: inline-block
							width: 20px
							margin-left: 15px

			.payment-type
				width: 33%
				height: 200px
				position: absolute
				padding: 25px
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				border-radius: 7px
				box-shadow: 0 0 22px -2px black
				background-color: #dbe8ff

				.inner
					position: relative
					width: 100%
					height: 100%

					.title
						font-family: Lato-Bold
						text-align: center
						font-size: 24px;
					.cash-btn
						position: absolute
						left: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px
						text-align: center
					.card-btn
						position: absolute
						text-align: center
						right: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px

			.cash-payment
				width: 33%
				height: 300px
				position: absolute
				padding: 25px
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				border-radius: 7px
				box-shadow: 0 0 22px -2px black
				background-color: #dbe8ff

				.inner
					position: relative
					width: 100%
					height: 100%

					.title
						font-family: Lato-Bold
						text-align: center
						font-size: 24px;
					.cash-btn
						position: absolute
						left: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px
						text-align: center
					.card-btn
						position: absolute
						text-align: center
						right: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px
					.pending-total
						font-size: 40px
						font-family: Lato-Black
						text-align: center
					.confirm-btn
						position: absolute
						text-align: center
						right: 0
						left: 0
						margin-left: auto
						margin-right: auto
						bottom: 10px
						padding-left: 30px
						padding-right: 30px

			.card-pending
				width: 33%
				height: 200px
				position: absolute
				padding: 25px
				left: 0
				right: 0
				top: 0
				bottom: 0
				margin: auto
				border-radius: 7px
				box-shadow: 0 0 22px -2px black
				background-color: #dbe8ff

				.inner
					position: relative
					width: 100%
					height: 100%

					.title
						font-family: Lato-Bold
						text-align: center
						font-size: 24px;
					.confirm-order-btn
						position: absolute
						text-align: center
						right: 0
						left: 0
						margin-left: auto
						margin-right: auto
						bottom: 10px
						padding-left: 30px
						padding-right: 30px
					.pending-total
						font-size: 40px
						font-family: Lato-Black
						text-align: center


			.product-search
				background-color: white
				padding-top: 4px
				padding-bottom: 4px
				padding-left: 10px
				padding-right: 10px
				border: none
				transition: 0.2s linear all
				font-family: Lato-Bold

				&.focus
					background-color: #dbe8ff
					transition: 0.2s linear all
			& > .row
				height: 100%
				.order
					background-color: white
					height: 100%
					position: relative
					padding-bottom: 50px
					.products
						overflow-y: auto
						overflow-x: hidden
						max-height: 100%
						.headings
							color: black
							font-family: Lato-Bold
							text-align: center
							background-color: rgba(0, 0, 0, 0.1)
							padding-top: 5px
							padding-bottom: 5px
						.product-list
							transition: 0.2s linear all
							&.focus
								background-color: #dbe8ff
								transition: 0.2s linear all
							.name
								text-align: center
								font-family: Lato-Regular
								text-transform: uppercase
							.quantity
								text-align: center
								font-family: Lato-Regular
							.price
								text-align: center
								font-family: Lato-Regular
							.total
								text-align: center
								font-family: Lato-Regular
						.pay-order-btn
							position: absolute
							bottom: 10px
							right: 10px
							padding-left: 30px
							padding-right: 30px
					.placing-order
						position: absolute
						left: 0
						right: 0
						top: 0
						bottom: 0
						margin: auto

						img
							max-width: 100%
							position: absolute
							left: 0
							right: 0
							top: 0
							bottom: 0
							margin: auto
</style>