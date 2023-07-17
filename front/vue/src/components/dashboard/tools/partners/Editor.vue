<template lang="pug">
	transition(name="fade")
		.partner-editor-outter
			.partner-editor-inner
				.editor-title
					|Editar socio
				.editor-form
					.row
						.col-md-9
							.row
								.col-md-4
									.form-group
										label
											|Nombre *
										input.form-control(:value="partner.nombre", placeholder="Nombre del socio", ref="nombre")
								.col-md-4
									.form-group
										label
											|Apellido *
										input.form-control(:value="partner.apellidos", placeholder="Apellido", ref="apellidos")
								.col-md-4
									.form-group
										label
											|Email
										input.form-control(:value="partner.email", placeholder="", ref="email")
								.col-md-4
									.form-group
										label
											|Teléfono de casa
										input.form-control(:value="partner.telefonoCasa", placeholder="", ref="homePhone")
								.col-md-4
									.form-group
										label
											|Teléfono celular *
										input.form-control(:value="partner.telefonoCel", placeholder="", ref="cellPhone")
								.col-md-4
									.form-group
										label
											|Dirección *
										input.form-control(:value="partner.direccion", placeholder="Dirección", ref="direccion")
								.col-md-2
									.form-group
										label
											|Municipio (#) *
										input.form-control(:value="partner.municipio", placeholder="001", ref="municipio")
								.col-md-2
									.form-group
										label
											|Sección (#) *
										input.form-control(:value="partner.seccion", placeholder="001", ref="seccion")
								.col-md-2
									.form-group
										label
											|Año de emisión
										input.form-control(:value="partner.emision", placeholder="2020", ref="emision")
								.col-md-2
									.form-group
										label
											|Año de vigencia
										input.form-control(:value="partner.vigencia", placeholder="2025", ref="vigencia")
								.col-md-4
									.form-group
										label
											|Tipo de socio/Lista de precio
										select.form-control(:value="partner.tipo", ref="tipo")
											option(value="-1")
												|Ninguno
											option(v-for="price in prices", :value="price.name")
												|{{ price.name }}
								.col-md-4
									.form-group
										label
											|Clave de elector
										input.form-control(:value="partner.clave", placeholder="", ref="clave")
						.col-md-3
							.row
								.col-md-12
									label
										|Fotografía
									image-uploader(v-model="partner.image", ref="uploader")
					.row.mt-4
						.col-md-4.offset-md-4.text-center
							button.btn.btn-success.btn-block.scanner-button(@click="scanFingerprint", :disabled="status.scanningComplete")
								span
									|{{ scanText }}
								img(v-if="status.scanning", src="/assets/img/loading2.gif")
							small.muted
								|Coloque el dedo índice derecho cuando encienda la luz blanca del sensor
				.exit-icon
					img(src="/assets/icons/exit.png", @click="$emit('close')")
				button.btn.btn-success.save-button(@click="save")
					|Actualizar información
				button.btn.btn-danger.back-button(@click="$emit('close')")
					|Regresar
				custom-loader(v-if="status.loading", image="/assets/img/loading.gif", background="white", position="absolute")
</template>

<script>
	import ImageUploader 	from "@/components/elements/ImageUploader.vue"
	import CustomLoader 	from "@/components/elements/CustomLoader.vue"

	export default {
		props: ["partner", "prices"],
		data() {
			return {
				status: {
					scanning: false,
					loading: false,
					scanningComplete: false
				},
				scanText: "Volver a escanear huella y guardar"
			}
		},
		methods: {
			save: function() {
				this.status.loading = true
				let url = this.baseApi + this.envPath + "socio/" + this.partner._id.$oid
				let partner = {
					"nombre": 	this.$refs.nombre.value || "N/A",
					"apellidos":this.$refs.apellidos.value || "N/A",
					"email": 	this.$refs.email.value || "N/A",
					"telefonoCasa": this.$refs.homePhone.value || "N/A",
					"telefonoCel":this.$refs.cellPhone.value || "N/A",
					"municipio":this.$refs.municipio.value || "N/A",
					"direccion":this.$refs.direccion.value || "N/A",
					"seccion": 	this.$refs.seccion.value || "N/A",
					"emision": 	this.$refs.emision.value || "N/A",
					"vigencia": this.$refs.vigencia.value || "N/A",
					"clave": this.$refs.clave.value || "N/A",
					"tipo": this.$refs.tipo.value || "-1",
					"image": this.$refs.uploader.value,
				}

				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}

				this.axios.put( url, partner, config )
				.then( result => {
          			this.$swal("Listo", "El socio fue actualizado correctamente", "success")
          			.then(() => {
          				this.$emit("update", {partner: partner, index: this.partner.index})
          			})
				})
				.catch( err => {
					console.log( err )
          			this.$swal("Error", "Por favor vuelva a intentarlo. Si el problema persiste, contacte a soporte técnico.", "error")
				})
				.finally(() => {
					this.status.loading = false
				})
			},

			scanFingerprint: function() {
				this.scanText = "Guardando la información ..."
				
				/*	Primero almacena al socio y obtiene el id 	*/
				let partner = {
					"nombre": 	this.$refs.nombre.value || "N/A",
					"apellidos":this.$refs.apellidos.value || "N/A",
					"email": 	this.$refs.email.value || "N/A",
					"telefonoCasa": this.$refs.homePhone.value || "N/A",
					"telefonoCel":this.$refs.cellPhone.value || "N/A",
					"municipio":this.$refs.municipio.value || "N/A",
					"direccion":this.$refs.direccion.value || "N/A",
					"seccion": 	this.$refs.seccion.value || "N/A",
					"emision": 	this.$refs.emision.value || "N/A",
					"vigencia": this.$refs.vigencia.value || "N/A",
					"clave": this.$refs.clave.value || "N/A",
					"tipo": this.$refs.tipo.value || "-1",
					"image": this.$refs.uploader.value,
				}
				
				let url = this.baseApi + this.envPath + "socio/" + this.partner._id.$oid
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
				this.axios.put( url, partner, config)
				.then( result => {
					console.log(result.data)
					/*	Escanea la huella y la almacena en el socio 	*/

					this.scanText = "Escaneando y procesando huella ..."

					url = this.servlet + "SensorRegistarServlet"
					let body = {
						name: result.data._id.$oid
					}
					return this.axios.post( url, body )
				})
				.then( result => {
					this.status.scanningComplete = false
					if( result.data.code == 0 ){
						this.scanText = "Huella registrada"
	          			this.$swal("Listo", "El socio fue agregado correctamente", "success")
	          			.then(() => {
	          				location.reload()
	          			})
					}else{
						this.scanText = "Volver a escanear huella y guardar"
	          			this.$swal("Error al registrar huella", "El socio fue agregado correctamente, pero la huella ya se encuentra registrada o el sensor biométrico tuvo un error.", "warning")

					}
				})
				.catch(err => {
					this.$swal("No se pudo guardar", "Por favor verifique que se encuentren todos los campos requeridos y vuelva a intentarlo. Si la información se encuentra correcta, el sensor biométrico puede que no esté funcionando correctamente.", "warning")
				})
				.finally(() => {
					this.status.scanning = false
					this.status.loading = false
				})
			}

		},
		components: {
			CustomLoader,
			ImageUploader,
		}
	}
</script>

<style lang="sass">
	
	.partner-editor-outter
		z-index: 100
		position: fixed
		top: 50%
		right: 0
		left: 0
		padding: 25px
		background-color: white
		box-shadow: 0px 0px 15px -7px black
		border-radius: 10px
		margin-left: 200px
		margin-right: 200px
		transform: translateY(-50%)
		.partner-editor-inner
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

				.password-group
					position: relative
					.pass-shower
						position: absolute
						right: 3px
						bottom: 3px
						width: 30px
						height: 30px
						z-index: 15
						&:hover
							cursor: pointer
						img
							max-width: 100%
							max-height: 100%

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
</style>