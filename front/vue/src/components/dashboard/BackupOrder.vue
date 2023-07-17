<template lang="pug">
	.user
		.title
			fa.icon(icon="user")
			span
				|Crear orden
		.content
			.row.mb-2
				.col-md-2
					button.btn.btn-success(@click="status.create = true")
						|Agregar Usuario
			el-table(:data="tableData")
				el-table-column(label="Nombre",prop="name")
				el-table-column(label="Email",prop="email", width="300")
				el-table-column(label="Rol",prop="_rol", width="150")
				el-table-column(align="right")
					template(slot-scope="scope")
						el-button(type="primary",@click="handleEdit(scope.$index)")
							|Editar
						el-button(type="primary",@click="handlePassword(scope.$index)")
							|Contraseña
						el-button(type="danger",@click="handleDelete(scope.$index)")
							|Borrar
</template>

<script>
	import Loader 	from "@/components/elements/Loader.vue"

	export default {
		data() {
			return{
				tableData: [],
				status: {
					loading: false,
					edit:false,
					agregar:false,
					create: false,
					password: false
				},
				aux:{
					editIndex:"",
					index:0,
					data:{}
				},
				userEdit: {}
			}
		},
		mounted: function() {

			this.status.loading = true
			/*	get inventory*/
			let url = this.baseApi + this.envPath + "users/list"
			let config = {
		    	headers: {
		    		'Authorization': 'Bearer ' + localStorage.token
		    	}
		  	}
			this.axios.get( url, config )
			.then( result => {
				let users = result.data.map( u => {
					let aux = u
					let _rol = ""
					switch( u.rol ){
						case 1:
							_rol = "Administrador"
							break
						case 2:
							_rol = "Cajero"
							break
						case 3:
							_rol = "Punto de venta"
							break
						case 4:
							_rol = "Caja y Venta"
							break
						case 5:
							_rol = "Reposición"
							break
					}
					aux._rol = _rol
					return aux
				})
				this.tableData = users
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
				this.userEdit = this.tableData[index]
				this.index = index
				this.status.edit = true
			},
			handlePassword:function(index){
				this.userEdit = this.tableData[index]
				this.index = index
				this.status.password = true
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
						let user = this.tableData[ index ]
						let url = this.baseApi + this.envPath + "users/" + user._id.$oid
						let config = {
					    	headers: {
					    		'Authorization': 'Bearer ' + localStorage.token
					    	}
					  	}
						this.axios.delete( url, config )
						.then( result => {
							this.tableData.splice(index,1)
							this.$swal("Listo", "El usuario fue eliminado exitosamente", "success")
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
			Loader
		}		
	}
</script>

<style lang="sass" scoped>
	.user
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