<template lang="pug">
	.inventory
		.title
			fa.icon(icon="shopping-cart")
			span
				|Inventario
		.content
			.row.mb-2
				.col-md-3
					button.btn.btn-success.btn-block(@click="status.modalBox = true")
						|Registrar cajas
				.col-md-3
					button.btn.btn-success.btn-block(@click="status.modal = true")
						|Registrar entradas
				.col-md-3
					el-input(placeholder="Buscar por nombre de producto", v-model="filters[0].value")
				.col-md-3
					el-input(placeholder="Buscar por código de barras", v-model="filters[1].value")
			data-tables(:data="data", :action-col="actions", :filters="filters" @selection-change="handleSelectionChange")
				el-table-column(v-for="title in titles", :prop="title.prop", :label="title.label", :key="title.prop", :width="title.width", align="center", :sortable="title.sortable")
			.row
				//.col-md-3.offset-md-9
					button.btn.btn-success(@click="")
						|Descargar Reporte
		loader(v-if="status.loading")
		register-entry(@close="status.modal = false", v-if="status.modal", :products="data", @upload="addProduct", @update="increaseStock")
		register-box(@close="status.modalBox = false", v-if="status.modalBox", :products="data", @upload="addProduct", @update="increaseStock")
</template>

<script>
	import Loader 			from "@/components/elements/Loader.vue"
	import RegisterEntry 	from "@/components/modals/RegisterEntry.vue"
	import RegisterBox 		from "@/components/modals/RegisterBox.vue"
	export default {
		data() {
			return {
				filters: [{
					prop: 'name',
					value: ''
				},{
					prop: 'id_scanner',
					value: ''
				}],
				data: [],
				titles: [
					{
				    	prop: "name",
				    	label: "Nombre",
				    	width: 300,
				    	sortable: true
				    },
					{
				    	prop: "sku",
				    	label: "SKU",
				    	width: "auto",
				    	sortable: true
				    },
					{
				    	prop: "id_scanner",
				    	label: "Código de barras",
				    	width: 200,
				    	sortable: true
				    },
					{
				    	prop: "stock",
				    	label: "Cantidad",
				    	width: 120,
				    	sortable: true
				    },
				],
				actions: {
			        props: {
			          	label: 'Opciones',
			          	align: "center",
			        },
			        buttons: [{
			          	props: {
			            	type: 'primary'
			          	},
			          	handler: row => {
			          		this.$swal({
  								title: 'Ingresa el nuevo Stock',
  								input: 'number',
  								inputAttributes: {
  									step: 0.01
  								}
			          		}).then((result) => {
								if( result.value ){
									let product = {
										"name": row.name,
										"sku": row.sku,
										"price": row.price,
										"id_scanner": row.id_scanner,
										"stock": Number(result.value),
										"unit_price": row.unit_price,
										"image": row.image,
										"status": row.status,
										"multiprice": row.multiprice
									}
									let url = this.baseApi + this.envPath + "products/" + row._id.$oid
									let config = {
								    	headers: {
								    		'Authorization': 'Bearer ' + localStorage.token
								    	}
								  	}
									this.axios.put( url, product, config )
									.then( result => {
          								this.$swal("Listo", "El producto fue actualizado correctamente", "success")
          								.then(() => {
          									//location.reload()
          								})
									})
								}
							})
			          	},
			          	label: 'Cambiar Stock'
			        }]
			     },
			    selectedRow: [],
			    status: {
			    	loading: true,
			    	modal: false,
			    	modalBox: false
			    }
			}
		},
		mounted: function() {
			/*	get inventory*/
			//let url = this.baseApi + this.envPath + "products"
			let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/products"
			let config = {
		    	headers: {
		    		'Authorization': 'Bearer ' + localStorage.token
		    	}
		  	}
			this.axios.get( url, config)
			.then( result => {
				this.data = result.data
			})
			.catch( err => {
				console.log( err )
			})
			.finally( () => {
				this.status.loading = false
			})
		},
		methods: {
			handleSelectionChange: function(val) {
      			this.selectedRow = val
    		},
    		addProduct: function( product ){
    			this.data.push( product )
    		},
    		increaseStock: function( sku ) {
    			for( let i = 0 ; i < this.data.length ; i++ ) //Search product
    				if( this.data[ i ].sku === sku )
    					this.data[ i ].stock++
    		}
		},
		computed: {
			barCodes: function() {
				if( this.data ){
					let array = []
					for(let item of this.data)
						if( item.id_scanner)
							array.push( item.id_scanner )
					return array
				}else return []
			}
		},
		components: {
			Loader,
			RegisterEntry,
			RegisterBox
		}
	}
</script>

<style lang="sass" scoped>
	.inventory
		.title
			margin-bottom: 40px
			.icon
				font-size: 30px
				color: #2f506e
			span
				font-size: 25px
				font-family: Lato-Bold
				margin-left: 15px
				letter-spacing: 2px
				text-transform: uppercase
		.content

</style>