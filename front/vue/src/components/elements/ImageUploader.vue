<template lang="pug">
	.single-image-uploader
		transition(name="fade")
			.image-preview(v-if="value")
				img.imagep(:src="value")
				.delete
					img(src="https://img.icons8.com/cotton/2x/delete-sign--v2.png", @click="deleteAsset")
		div
			button.btn(:class="{disabled: value}", @click="trigger")
				span
					|Subir imagen
				img.upload-loader(src="https://thumbs.gfycat.com/BogusEmptyBrontosaurus.webp", v-if="uploading")
				input(type="file", ref="image", accept="image/*", @change="upload", v-show="false")
			.text-center
				small
					|Tamaño máximo: 4 MB
</template>

<script>
	export default {
		props: ["value"],
		data: function() {
			return {
				"uploading": false,
				"file": {
					"data": "",
					"name": ""
				}
			}
		},
		methods: {
			upload: async function() {
				if( !this.value ){
					let file = this.$refs.image.files[ 0 ]
					console.log( file )

					if( file.type.match(/image\//) ){
						if( file.size < 4000000 ){

							this.uploading = true

							this.file.data 	= await this.toBase64( file )
							this.file.name 	= Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "." + this.getFileType( file )

							let url = this.baseApi + this.envPath + "products/image"

							let config = {
						    	headers: {
						    		'Authorization': 'Bearer ' + localStorage.token
						    	}
						  	}
							this.axios.post( url, this.file, config )
							.then( result => {
								console.log( result.data )
								this.$emit( "input", result.data.public_url )
							})
							.catch( err => {
								console.log( err.response )
							})
							.finally( () => {
								this.uploading = false
							})

						}else{
							this.$swal("Tamaño máximo excedido", "La imagen que deseas subir pesa más de 4 MB", "warning")
						}
					}else{
						this.$swal("Archivo inválido", "El archivo debe ser una imagen (png, gif, jpg)", "danger")
						this.uploading = false
					}
				}
			},
			deleteAsset: function() {
				this.$emit("input", "")
			},
			toBase64: function( file ) {
				let reader = new FileReader()
				return new Promise((resolve, reject) => {
	                reader.onloadend = e => e.target.result ? resolve( e.target.result.split(",")[1] ) : e.target.error
	                reader.readAsDataURL( file )
				})

			},
			getFileType: function( file ){
				let aux = file.name.split(".")
				return aux[ aux.length - 1]
			},
			trigger: function() {
				this.$refs.image.click()
			}
		}
	}	
</script>

<style lang="sass">
	.single-image-uploader
		margin-top: 25px
		text-align: center
		position: relative

		.label
			font-family: Lato-Bold
			margin-bottom: 15px
		.image-preview
			position: relative
			display: inline-block
			clear: both
			max-width: 100%
			.imagep
				max-width: 100%
				max-height: 400px
			.delete
				display: inline-block
				position: absolute
				right: -20px
				top: -20px

				&:hover
					img
						cursor: pointer
						transition: 0.2s linear all
						transform: scale(1.3)

				img
					transition: 0.2s linear all
					width: 40px
					height: 40px

		.btn
			clear: both
			background-color: #007bff
			color: white
			text-transform: uppercase
			padding-left: 20px
			padding-right: 20px
			border-radius: 30px
			margin-top: 15px
			transition: 0.2s linear all

			&.disabled
				filter: brightness( 85% )
				&:hover
					cursor: not-allowed

			&:hover
				transition: 0.2s linear all
				filter: brightness( 85% )
				color: white

			.upload-loader
				width: 25px
				height: 25px
				margin-left: 10px

</style>