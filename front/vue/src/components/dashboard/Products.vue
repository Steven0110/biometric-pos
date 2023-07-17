<template lang="pug">
	.inventory
		.title
			fa.icon(icon="box")
			span
				|Productos
		.products
			el-row
				el-col(:span="12")
					span
						|&nbsp;
				el-col(:span="3")
					el-input(placeholder="Buscar por nombre", v-model="filters[0].value")
				el-col(:span="3")
					el-input(placeholder="Por código de barras", v-model="filters[1].value")
				el-col(:span="5")
					button.btn.btn-block.btn-primary(@click="status.create = true")
						|Agregar producto
			data-tables(:data="data", :action-col="actions", :filters="filters" @selection-change="handleSelectionChange")
				el-table-column(type="selection", width="30")
				el-table-column(v-for="title in titles", :prop="title.prop", :label="title.label", :key="title.prop", :width="title.width", align="center", :sortable="title.sortable")
				el-table-column(align="center", :width="130")
					template(slot-scope="scope")
						img.product-image(:src="scope.row.image", @click="viewImage = scope.row.image")
		
		
		editor(v-if="status.edit", v-model="activeProduct", @close="status.edit = false", @update="updateView")
		creator(v-show="status.create", @close="status.create = false", @update="updateView")

		loader(v-if="status.loading")
		image-viewer(v-if="viewImage", @exit="viewImage = false", :img="viewImage")
</template>

<script>
	import Loader 	from "@/components/elements/Loader.vue"
	import ImageViewer 	from "@/components/elements/ImageViewer.vue"
	import Editor 	from "@/components/dashboard/tools/products/Editor.vue"
	import Creator 	from "@/components/dashboard/tools/products/Creator.vue"

	export default {
		data() {
			return {
				filters: [{
					prop: 'name',
					value: ''
				},{
					prop: 'barCode',
					value: ''
				}],
				data: [],
				titles: [
					{
				    	prop: "name",
				    	label: "Nombre",
				    	width: 170,
				    	sortable: true
				    },
					{
				    	prop: "sku",
				    	label: "SKU",
				    	width: 100,
				    	sortable: true
				    },
					{
				    	prop: "barCode",
				    	label: "Código de barras",
				    	width: 160,
				    	sortable: true
				    },
					{
				    	prop: "quantity",
				    	label: "Cantidad",
				    	width: 120,
				    	sortable: true
				    },
					{
				    	prop: "uPrice",
				    	label: "Costo",
				    	width: 90,
				    	sortable: true
				    },
					{
				    	prop: "sPrice",
				    	label: "Precio Venta",
				    	width: 80,
				    	sortable: true
				    }
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
			            	//this.$message('Edit clicked')
			            	console.log(row)
			            	this.status.edit = true
			            	this.activeProduct = row
			          	},
			          	label: 'Editar'
			        },{
			          	props: {
			            	type: 'danger'
			          	},
			          	handler: row => {
			            	//this.data.splice(this.data.indexOf(row), 1)
			            	this.$swal({
								title: '¿Deseas borrar el producto "'+row.name+'"?',
								text: "Esta acción no se puede deshacer",
								type: 'warning',
								showCancelButton: true,
								confirmButtonColor: '#3085d6',
								cancelButtonColor: '#d33',
								confirmButtonText: 'Sí, borrar',
								cancelButtonText: 'Cancelar'
							}).then((result) => {
							  	if(result.value) {
							  		this.status.loading = true
									let url = this.baseApi + this.envPath + "products/" + row._id
									let config = {
								    	headers: {
								    		'Authorization': 'Bearer ' + localStorage.token
								    	}
								  	}
							  		this.axios.delete( url, config )
							  		.then( result => {
							  			this.$swal("Listo", row.name + " fue borrado exitosamente", "success")
							  			.then(() => {
							  				//location.reload()
							  			})
							  		})
							  		.catch( err => {
							  			console.log( err )
							  		})
							  		.finally(() => {
							  			this.status.loading = false
							  		})
							  	}
							})
			          	},
			          	label: 'Borrar'
			        }]
			     },
			    selectedRow: [],
			    viewImage: "",
			    status: {
			    	loading: true,
			    	edit: false,
			    	create: false
			    },
			    activeProduct: false
			}
		},
		mounted: function() {
			this.status.loading = false
			/*	get inventory*/
			let url = this.baseApi + this.envPath + "products"
			let config = {
		    	headers: {
		    		'Authorization': 'Bearer ' + localStorage.token
		    	}
		  	}
			this.axios.get( url, config )
			.then( result => {

				let data = result.data.map(p => {
					return {
					    "name": p.name,
					    "category": p.category,
					    "sku": p.sku || "N/A",
					    "barCode": p.id_scanner || "N/A",
					    "quantity": p.stock || 0,
					    "uPrice": p.price || 0,
					    "sPrice": p.unit_price || 0,
					    "image": p.image || "https://www.softwarearge.com/wp-content/uploads/2018/09/no-image-icon-6.png",
					    "_id": p._id.$oid,
					    "multiprice": p.multiprice,
					    "pesable": p.pesable
					}
				})
				this.data = data
			})
			.catch( err => {
				console.log( err )
          		this.$swal("Error", "Por favor llene todos los campos. Si el problema persiste, contacte a soporte técnico", "error")
			})
			.finally( () => {
				this.status.loading = false
			})
		},
		methods: {
			onCreate: function() {
		      this.data.push({
		        	content: "new created",
		        	flow_no: "FW201601010003" + Math.floor(Math.random() * 100),
		        	flow_type: "Help",
		        	flow_type_code: "help"
		      })

			},
			bulkDelete: function() {
				this.selectedRow.map(row => {
			    	this.data.splice(this.data.indexOf(row), 1)
			    })
			    this.$message('bulk delete success')
			},
			handleSelectionChange: function(val) {
      			this.selectedRow = val
    		},
    		updateView: function( product ){
    			//location.reload()
    			this.$forceUpdate();
    		}
		},
		components: {
			Loader,
			ImageViewer,
			Editor,
			Creator,
		}
	}
</script>

<style lang="sass">
	.inventory
		.title
			margin-bottom: 20px
			.icon
				font-size: 30px
				color: #2f506e
			span
				font-size: 25px
				font-family: Lato-Bold
				margin-left: 15px
				letter-spacing: 2px
				text-transform: uppercase
		.products
			.product-image
				max-width: 70px
				margin-left: 30px
				transition: 0.2s linear all
				&:hover
					cursor: pointer
					transform: scale(1.2)
					box-shadow: 0px 0px 10px -5px black
					transition: 0.2s linear all
			.el-table
				.cell
					overflow: unset
					word-break: break-word
</style>