<template lang="pug">
	transition(name="fade")
		.partner-creator-outter
			.partner-creator-inner
				.creator-title
					|Agregar nuevo Socio
				.creator-form
					.row
						.col-md-9
							.row
								.col-md-4
									.form-group
										label
											|Nombre *
										input.form-control(v-model="partner.name")
								.col-md-4
									.form-group
										label
											|Apellido *
										input.form-control(v-model="partner.surname")
								.col-md-4
									.form-group
										label
											|Email
										input.form-control(v-model="partner.email", type="email")
								.col-md-4
									.form-group
										label
											|Teléfono de casa
										input.form-control(v-model="partner.homePhone")
								.col-md-4
									.form-group
										label
											|Teléfono celular *
										input.form-control(v-model="partner.cellPhone")
								.col-md-4
									.form-group
										label
											|Dirección *
										input.form-control(v-model="partner.address")
								.col-md-2
									.form-group
										label
											|Municipio (#) *
										input.form-control(v-model="partner.municipio", type="number")
								.col-md-2
									.form-group
										label
											|Sección (#) *
										input.form-control(v-model="partner.seccion")
								.col-md-2
									.form-group
										label
											|Año de emisión
										input.form-control(v-model="partner.emision", type="number")
								.col-md-2
									.form-group
										label
											|Año de vigencia
										input.form-control(v-model="partner.vigencia", type="number")
								.col-md-4
									.form-group
										label
											|Tipo de socio/Lista de precio
										select.form-control(v-model="partner.tipo")
											option(value="-1", selected)
												|Ninguno
											option(v-for="price in prices", :value="price.name")
												|{{ price.name }}
								.col-md-4
									.form-group
										label
											|Clave de elector
										input.form-control(v-model="partner.clave")
						.col-md-3
							.row
								.col-md-12
									label
										|Fotografía
									image-uploader(v-model="partner.image")
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
				//button.btn.btn-success.save-button(@click="save", :disabled="!status.scanningComplete")
					|Guardar
				//button.btn.btn-danger.back-button(@click="$emit('close')")
					|Regresar
				custom-loader(v-if="status.loading", image="/assets/img/loading.gif", background="white", position="absolute")
</template>

<script>
	import CustomLoader 	from "@/components/elements/CustomLoader.vue"
	import ImageUploader 	from "@/components/elements/ImageUploader.vue"

	export default {
		props: ["prices"],
		data() {
			return {
				status: {
					scanning: false,
					loading: false,
					showPass: false,
					scanningComplete: false
				},
				partner: {},
				scanText: "Escanear huella y guardar"
			}
		},
		methods: {
			scanFingerprint: function() {
				this.status.scanning = true
				this.scanText = "Guardando la información ..."
				
				/*	Primero almacena al socio y obtiene el id 	*/
				let partner = {
					"nombre": this.partner.name,
					"apellidos": this.partner.surname,
					"email": this.partner.email,
					"telefonoCasa": this.partner.homePhone,
					"telefonoCel": this.partner.cellPhone,
					"direccion": this.partner.address,
					"municipio": this.partner.municipio,
					"tipo": this.partner.tipo || "-1",
					"seccion": this.partner.seccion,
					"emision": this.partner.emision,
					"vigencia": this.partner.vigencia,
					"clave": this.partner.clave,
					"image": this.partner.image
				}
				
				this.status.loading = true

				let url = this.baseApi + this.envPath + "socio/"
				let config = {
			    	headers: {
			    		'Authorization': 'Bearer ' + localStorage.token
			    	}
			  	}
				this.axios.post( url, partner, config)
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
					console.log("Debug:", JSON.stringify( result ))
					console.log( "Código de respuesta del sensor", result.data.code )
					if( result.data.code == 0 ){
						this.scanText = "Huella registrada"
						this.status.scanningComplete = true
	          			this.$swal("Listo", "El socio fue agregado correctamente", "success")
	          			.then(() => {
	          				location.reload()
	          			})
					}else{
						this.scanText = "Escanear huella y guardar"
						this.status.scanningComplete = true
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
	
	.partner-creator-outter
		z-index: 100
		position: fixed
		top: 50%
		right: 0
		left: 0
		padding: 25px
		background-color: white
		box-shadow: 0px 0px 15px -7px black
		border-radius: 10px
		max-height: 70%
		margin-left: 200px
		margin-right: 200px
		transform: translateY(-50%)
		overflow-y: auto
		.partner-creator-inner
			padding-bottom: 70px
			position: relative
			height: 100%
			.creator-title
				font-family: Lato-Bold
				letter-spacing: 2px
				color: #003763
				text-align: center
				font-size: 22px
				text-transform: uppercase
				margin-bottom: 15px
			.creator-form
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
			.scanner-button
				img
					display: inline-block
					margin-left: 15px
					width: 25px
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