<template lang="pug">
	.partners
		.title
			fa.icon(icon="users")
			span
				|Socios
		.content
			.row.mb-2
				.col-md-2
					button.btn.btn-success(@click="status.create = true")
						|Agregar Socio
				.col-md-3.offset-md-7
					el-input(placeholder="Buscar por nombre", v-model="filters[0].value")
			data-tables(:data="tableData", :action-col="actions", :filters="filters")
				el-table-column(label="Nombre",prop="nombre")
				el-table-column(label="Apellido",prop="apellidos")
				el-table-column(label="Email",prop="email")
				el-table-column(label="Teléfono Casa",prop="telefonoCasa")
				el-table-column(label="Teléfono Cel",prop="telefonoCel")
				el-table-column(align="center", :width="130")
					template(slot-scope="scope")
						img.product-image(:src="scope.row.image", @click="viewImage = scope.row.image")
		creator(v-show="status.create", @close="status.create = false", @update="updateView", :prices="pricesList")
		editor(v-if="status.edit", @close="status.edit = false", @update="updatePartner", :partner="partnerEdit", :prices="pricesList")
		image-viewer(v-if="viewImage", @exit="viewImage = false", :img="viewImage")
</template>

<script>
	import Loader 	from "@/components/elements/Loader.vue"
	import Creator 	from "@/components/dashboard/tools/partners/Creator.vue"
	import Editor 	from "@/components/dashboard/tools/partners/Editor.vue"
	import ImageViewer 	from "@/components/elements/ImageViewer.vue"

	export default {
		data() {
			return{
				tableData: [],
				filters: [{
					prop: 'nombre',
					value: ''
				}],
				status: {
					loading: false,
					edit:false,
					agregar:false,
					create: false,
					password: false
				},
				pricesList: [],
				aux:{
					editIndex:"",
					index:0,
					data:{}
				},

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
			            	this.partnerEdit = row
			          	},
			          	label: 'Editar'
			        },{
			          	props: {
			            	type: 'danger'
			          	},
			          	handler: row => {
							this.$swal.fire({
								title: `¿Estás seguro que deseas borrar al socio ${row.nombre}?`,
								text: "No podrás deshacer este cambio.",
								type: 'warning',
								showCancelButton: true,
								confirmButtonColor: '#3085d6',
								cancelButtonColor: '#d33',
								confirmButtonText: 'Borrar',
								cancelButtonText: 'Regresar',
								reverseButtons: true
							}).then((result) => {
								if (result.value) {
									let partner = row
									let url = this.baseApi + this.envPath + "socio/" + partner._id.$oid
									let config = {
								    	headers: {
								    		'Authorization': 'Bearer ' + localStorage.token
								    	}
								  	}
									this.axios.delete( url, config )
									.then( result => {
										this.tableData.splice(this.tableData.indexOf( row ) ,1 )
										this.$swal("Listo", "El socio fue eliminado exitosamente", "success")
									})
									.catch( err => {
										console.error( err )
									})
								}
							})
			          	},
			          	label: 'Borrar'
			        }]
			     },
				partnerEdit: {},
				viewImage: ""
			}
		},
		mounted: function() {

			this.status.loading = true
			/*	get inventory  */
			let config = {
		    	headers: {
		    		'Authorization': 'Bearer ' + localStorage.token
		    	}
		  	}

			let url = this.baseApi + this.envPath + "socio"
			this.axios.get( url, config )
			.then( result => this.tableData = result.data )
			.catch( err => console.error( err ) )

			/*	Get Prices Lists 	*/
			url = this.baseApi + this.envPath + "listing/list"
			this.axios.get( url, config )
			.then( result => this.pricesList = result.data )
			.catch( err => console.error( err ) )
		},
		methods: {
			onCreate:function(){
				this.status.agregar=true
			},
			agregar:function(){
				this.tableData.push(this.aux.data)
				this.aux.data={date:'',name:'',address:''}
				this.status.agregar=false
			},
			updateView: function() {

			},
			updatePartner: function( data ) {
				this.partnerEdit = {}
				this.status.edit = false

				let updatedPartner = data.partner
				this.tableData[ data.index ].nombre = updatedPartner.nombre
				this.tableData[ data.index ].apellidos = updatedPartner.apellidos
				this.tableData[ data.index ].email = updatedPartner.email
				this.tableData[ data.index ].telefonoCasa = updatedPartner.telefonoCasa
				this.tableData[ data.index ].telefonoCel = updatedPartner.telefonoCel
				this.tableData[ data.index ].direccion = updatedPartner.direccion
				//this.tableData[ data.index ].state = updatedPartner.state
				this.tableData[ data.index ].location = updatedPartner.location
				this.tableData[ data.index ].municipio = updatedPartner.municipio
				this.tableData[ data.index ].seccion = updatedPartner.seccion
				this.tableData[ data.index ].emision = updatedPartner.emision
				this.tableData[ data.index ].vigencia = updatedPartner.vigencia
				this.tableData[ data.index ].clave = updatedPartner.clave
				this.tableData[ data.index ].tipo = updatedPartner.tipo
			},
		},
		components: {
			Loader,
			Creator,
			ImageViewer,
			Editor
		}		
	}
</script>

<style lang="sass" scoped>
	.partners
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
			.product-image
				max-width: 100px
				max-height: 80px
</style>