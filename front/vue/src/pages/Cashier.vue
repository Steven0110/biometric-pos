<template lang="pug">
	.cashier
		.layer
			.cashier-logout
				button.btn.btn-danger(@click="logout")
					|Salir
			.row
				.col-md-10.offset-md-1.order
					.loader(v-if="status.loading")
						img(src="/assets/img/loading.gif")
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
						.row.product-list(v-for="(p, index) in order.products", :id="'p_' + index")
							.col-md-4.name
								|{{ p.name }}
							.col-md-3.quantity
								|{{ p.quantity }}
							.col-md-2.price
								|{{ p.price | currency  }}
							.col-md-2.total
								|{{ Number(p.price) * Number(p.quantity) | currency }}
						div.btn.btn-primary.pay-order-btn( v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", type="button", @keyup.enter="_pay" @click="showPaymentChoose", id="pay", tabindex="300", ref="pay", v-if="stage == 'ordering'")
							|Pagar orden
					.placing-order(v-if="stage == 'placing'")
						img(src="/assets/img/loading.gif")

			.input-code(v-show="status.inputCode")
				.form-group
					
					input.form-control(placeholder="Número de orden", id="inputCode", v-model="search", @keyup.enter="searchBarcode",v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", @keyup.esc="exit")
					
					.product-search(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", v-for="(product, index) in results", @keyup.enter="addProduct(product)", :tabindex="index")
						|{{ product.name }}

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
								|Ingresa el efectivo recibido
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
				payment: "",
				stage: "ordering",
				order: {
					products: []
				},
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
      					//this.searchSimpleCode()
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
				/*	Serach Order by Id 	*/
				this.status.loading = true
				let url = this.baseApi + this.envPath + "orders/identifier/" + this.search
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
				this.axios.get( url, config )
				.then( result => {
					let order = result.data
					let products = result.data.products.map(p => {
						return {
							"_id": p._id.$oid,
							"name": p.name,
							"sku": p.sku,
							"quantity": p.qty,
							"price": p.price,
							"product_total": Number( p.quantity ) * Number( p.price )
						}
					})
					order.products = products
					this.order = order
					this.exit()
				})
				.catch( err => {
					console.error( err )
					this.$swal("Orden no encontrada", "Si la escribiste de forma manual por favor verifica el número de orden", "warning")
					.then( () => {
						this.search = ""
					})
				})
				.finally(() => {
					this.status.loading = false
				})
			},
			searchSimpleCode: function() {
				this.results = []
				if( this.search.length >= 3){
					let products = JSON.parse( localStorage.products )
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
				this.stage = "editing"
				this.productEdit = product
				this.status.quantity = true

				this.$nextTick(() => {
					navigationService.getFocusElementById("quantity").focus()
					document.getElementById("quantity").select()
				});
			},
			confirmEdit: function() {
				this.status.quantity = false
				this.stage = "ordering"
				this.productEdit = {}

				this.$nextTick(() => {
					navigationService.getFocusElementById("p_" + (this.order.products.length-1)  ).focus()
				});
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
					if( this.order.products[ i ]._id.$oid === product._id.$oid )
						return i
				return false
			},
			exit: function(){
				setTimeout(() => {
					console.log("Exiting")
					this.search = ""
					this.status.inputCode = false
					this.status.showPartner = false
					this.status.showPayment = false
					this.status.showCardPending = false
					this.status.showCash = false
					this.status.scanningAvailable = true
					this.status.quantity = false
					this.payment = ""
					this.stage = "ordering"

					this.$nextTick(() => {
						navigationService.blurAllFocusElements()
						navigationService.getFocusElementById("pay").focus()
					})
				}, 300)
			},
			confirmOrder: function() {
				this.status.placingOrder = true
				this.stage = "placing"
				
				let body = {
					"order_id": this.order._id.$oid,
					"order": this.order.identifier,
					"total": this.orderTotal,
					tipo: this.payment
				}

				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
			  	let order = {}
				
				let url = this.baseApi + this.envPath + "payments"
				this.axios.post( url, body, config )
				.then( result => {
					
					order = result.data
					this.order = {
						products: []
					}
					
					this.cashIn = undefined
					
					return this.$swal({
						title: "¡Listo!",
						text: "La orden " + order.identifier + " fue pagada exitosamente",
						type: "success",
						confirmButtonText: "Imprimir comprobante de pago"
					})
					.then(() => {
						this.printTicket( order )
					})
				})
				.then(() => {
					this.exit()
				})
				.catch( err => {
					this.exit()
					console.error( err )
				})
			},
			getProductsQuantity: function(order) {
				return order.products.reduce((total, current) => {
					if(current.pesable)
						return total + 1
					else
						return total + Number(current.qty)
				}, 0);
			},
			isPesable: function(id) {
				let products = JSON.parse(localStorage.products)
				for( let i = 0 ; i < products.length ; i++ )
					if( products[ i ]._id.$oid === id )
						if(products[ i ].pesable)
							return true
						else
							return false
				return false

			},
			printTicket: function(order, processed){
				let printURL = this.servlet + "imprimirComprobantePago"
				let trimmedOrder

				if( !processed ){
					trimmedOrder = this.trimOrderToPrinter( order )
					trimmedOrder = this.getPrintableOrder( trimmedOrder )
				}else
					trimmedOrder = order

				trimmedOrder.productsQuantity = this.getProductsQuantity( trimmedOrder )


				return this.axios.post(printURL, trimmedOrder)
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
								this.printTicket(trimmedOrder, true)
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
								this.printTicket(trimmedOrder, true)
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
								this.printTicket(trimmedOrder, true)
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
								this.printTicket(trimmedOrder, true)
							})
							break
					}
				})
				.catch( err => {
					console.log( err )
				})
			},
			getPrintableOrder: function(order){
				console.log("Receveid order", order)
				for( let i = 0 ; i < order.products.length ; i++ ){
					order.products[ i ].pesable = this.isPesable( order.products[ i ]._id )
					order.products[ i ].product_total = Number(parseFloat(Number(order.products[ i ].product_total)).toFixed(2))
				}
				return order
			},
			trimOrderToPrinter: function(order){
				console.log( order )
				for( let i = 0 ; i < order.products.length ; i++ ){
					if( order.products[ i ].name.length >= 32)
						order.products[ i ].name = order.products[ i ].name.substr(0, 32)
				}
				return order
			},

			/********************************/
			/*		Navigation Actions		*/
			/********************************/
			showPartner: function(){
				console.log("showPartner")
				this.status.showPartner = true
				this.status.scanningAvailable = false
				this.stage = "partnering"

				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("partner_yes").focus()
				})

			},
			showPaymentChoose: function(){
				console.log("showPC")
				this.status.showPayment = true
				this.status.scanningAvailable = false
				this.stage = "choosing"

				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("cash_btn").focus()
				})

			},
			partnerNo: function(){
				this.confirmOrder()
				//this.status.showPartner = false
				//this.status.showPayment = true
				//this.status.scanningAvailable = false
				//this.stage = "ordering"
				//this.$nextTick(() => {
				//	navigationService.blurAllFocusElements()
				//	navigationService.getFocusElementById("cash_btn").focus()
				//})
			},
			partnerYes: function(){
				this.confirmOrder()
				//this.status.showPartner = false
				//this.status.showPayment = true
				//this.status.scanningAvailable = false
				//this.stage = "ordering"
				//this.$nextTick(() => {
				//	navigationService.blurAllFocusElements()
				//	navigationService.getFocusElementById("cash_btn").focus()
				//})
			},
			cash: function(){
				console.log("cash")
				this.status.showPayment = false
				this.status.showCash = true
				this.payment = "efectivo"
				this.stage = "cashing"
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

			/********************************/
			/*		Click Triggers 			*/
			/********************************/
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
				if( this.cashIn === undefined || this.cashIn < this.orderTotal )
					this.$swal("Valor inválido", "Debes ingresar un valor mayor al total de la orden", "warning")
				else
					this.$nextTick(() => {
						navigationService.blurAllFocusElements()
						navigationService.getFocusElementById("confirm_order_btn_2").focus()
					})
			},
		}
	}
</script>

<style lang="sass">
	.cashier
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

			.cashier-logout
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

			.partner-check
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
					.cancel-btn
						position: absolute
						left: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px
						text-align: center
					.confirm-btn
						position: absolute
						text-align: center
						right: 10px
						bottom: 10px
						padding-left: 30px
						padding-right: 30px

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
					.loader
						position: absolute
						left: 0
						top: 0
						bottom: 0
						right: 0
						margin: auto
						width: 100%
						height: 100%
						img
							max-width: 100%
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