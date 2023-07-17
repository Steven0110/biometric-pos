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
						div.btn.btn-primary.pay-order-btn( v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", type="button", @keyup.enter="_showPayment" @click="showPayment", id="showPayment", tabindex="300", ref="showPayment", v-if="stage == 'ordering'")
							|Registrar orden
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
			
			// Check if partner
			.payment-check(v-show="status.showPayment")
				.inner
					.title
						|¿Se pagó con efectivo o tarjeta?
					div.btn.btn-danger.cancel-btn(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", id="payment_cash", data-right="payment_card", @keyup.enter="confirmOrder('cash')", @click="confirmOrder('cash')", @keyup.esc="exit", tabindex="200", ref="payment_cash", v-if="stage == 'payment'")
						|Efectivo
					div.btn.btn-primary.confirm-btn(v-focus, data-down="AUTOFOCUS", data-up="AUTOFOCUS", id="payment_card", data-left="payment_cash", @click="confirmOrder('card')", @keyup.esc="exit", tabindex="201", ref="payment_card", @keyup.enter="confirmOrder('card')", v-if="stage == 'payment'")
						|Tarjeta


</template>

<script>
	import { navigationService } from "vue-spatialnavigation"
	export default {
		data() {
			return {
				status: {
					loading: false,
					inputCode: false,
					showPayment: false,
					showCash: false,
					showCardPending: false,
					scanningAvailable: true,
					quantity: false,
				},
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

					let products = JSON.parse( localStorage.products )
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
				this.productEdit.quantity = Number(this.productEdit.quantity)
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
				this.status.showPayment = false
				this.status.scanningAvailable = true
				this.status.quantity = false
				this.stage = "ordering"

				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("pay").focus()
				})
			},
			confirmOrder: function(paymentType) {
				this.status.placingOrder = true
				this.stage = "placing"
				this.status.showPayment = false

				let products = this.order.products.map(p => {
					return {
						"_id": p._id.$oid,
						"name": p.name,
						"sku": p.sku,
						"qty": p.quantity,
						"price": Number(parseFloat( Number( p.price )).toFixed(2)),
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
					//"paymentType": paymentType ///////////////////////
					// En precio mayoreo (validacoin) corregir focus al cerrar el mensaje
				}
				
				let url = this.baseApi + this.envPath + "orders"
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
			  	
				this.axios.post( url, body, config )
				.then( result => {
					return this.$swal("Orden registrada", "", "success")
				})
				.then( () => {
					location.reload()
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
			showPayment: function(){
				this.status.showPayment = true
				this.status.scanningAvailable = false
				this.stage = "payment"

				this.$nextTick(() => {
					navigationService.blurAllFocusElements()
					navigationService.getFocusElementById("payment_cash").focus()
				})

			},

			/********************************/
			/*		Click Triggers 			*/
			/********************************/
			_showPayment: function() {
				console.log("_showpm")
				this.$refs.showPayment.click()
			},
			_partnerCard: function() {
				console.log("_pn")
				this.$refs.paymentCard.click()
			},
			_partnerCash: function() {
				console.log("_py")
				this.$refs.paymentCash.click()
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

			.payment-check
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