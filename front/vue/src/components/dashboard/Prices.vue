<template lang="pug">
	.pricelist
		.title
			fa.icon(:icon="['fas', 'dollar-sign']")
			span
				|Lista de precios
		.content
			.row.mb-2
				.col-md-2
					button.btn.btn-success(@click="status.create = true")
						|Agregar precio
			el-table(:data="tableData")
				el-table-column(label="Nombre",prop="name")
				el-table-column(label="Tasa de incremento (%)",prop="discount", width="300", align="center")
				el-table-column(label="Descripcion",prop="description", width="300")
				el-table-column(align="right")
					template(slot-scope="scope")
						el-button(type="primary",@click="handleEdit(scope.$index)")
							|Editar
						el-button(type="danger",@click="handleDelete(scope.$index)")
							|Borrar
		creator(v-if="status.create", @close="status.create = false", @update="updateView")
		editor(v-if="status.edit", @close="status.edit = false", @update="updateView", :price="priceEdit")
</template>

<script>
	import Loader 	from "@/components/elements/Loader.vue"
	import Creator 	from "@/components/dashboard/tools/prices/Creator.vue"
	import Editor 	from "@/components/dashboard/tools/prices/Editor.vue"

	export default {
		data() {
			return{
				tableData: [],
				status: {
					loading: false,
					edit:false,
					agregar:false,
					create: false,
				},
				aux:{
					editIndex:"",
					index:0,
					data:{}
				},
				priceEdit: {}
			}
		},
		mounted: function() {

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
				this.tableData = result.data
			}).catch( err => {
				console.error( err )
			})
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
			editar:function(){
				this.tableData[this.index]=this.aux.data
				this.aux.data={date:'',name:'',address:''}
				this.index=0
				this.status.edit=false
			},
			handleEdit:function(index){
				this.priceEdit = this.tableData[index]
				this.index = index
				this.status.edit = true
			},
			handleDelete:function(index){				 
				this.$swal.fire({
					title: '¿Estás seguro?',
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
						let price = this.tableData[ index ]
						let url = this.baseApi + this.envPath + "listing/" + price._id.$oid
						let config = {
					    	headers: {
					    		'Authorization': 'Bearer ' + localStorage.token
					    	}
					  	}
						this.axios.delete( url, config )
						.then( result => {
							this.tableData.splice(index,1)
							this.$swal("Listo", "El precio fue eliminado exitosamente", "success")
						})
						.catch( err => {
							console.error( err )
						})
					}
				})
			},
			updateView: function() {

			}	
		},
		components: {
			Loader,
			Creator,
			Editor,
		}		
	}
</script>

<style lang="sass" scoped>
	.pricelist
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