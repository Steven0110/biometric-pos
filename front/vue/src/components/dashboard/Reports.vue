<template lang="pug">
	.reports
		.title
			fa.icon(icon="download")
			span
				|Reportes de ventas
		.content
			.grid-option
				.grid-option-container(@click="downloadToday")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.todayLoader", spin)
					fa.icon(icon="download")
					p
						|Ventas de hoy
			.grid-option
				.grid-option-container(@click="downloadWeek")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.weekLoader", spin)
					fa.icon(icon="download")
					p
						|Ventas de la semana
			.grid-option
				.grid-option-container(@click="downloadMonth")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.monthLoader", spin)
					fa.icon(icon="download")
					p
						|Ventas del mes
			.grid-option
				.grid-option-container(@click="downloadProducts")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.productsLoader", spin)
					fa.icon(icon="download")
					p
						|Inventario de productos
			.grid-option
				.grid-option-container(@click="downloadPartners")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.partnersLoader", spin)
					fa.icon(icon="download")
					p
						|Socios
			.grid-option
				.grid-option-container(@click="downloadCatMonth")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.catMonthLoader", spin)
					fa.icon(icon="download")
					p
						|Categorías mensual
			.grid-option
				.grid-option-container(@click="downloadCatWeek")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.catWeekLoader", spin)
					fa.icon(icon="download")
					p
						|Categorías semanal
			.grid-option
				.grid-option-container(@click="downloadCatToday")
					transition(name="fade")
						fa.icon-loading(icon="circle-notch", v-if="status.catTodayLoader", spin)
					fa.icon(icon="download")
					p
						|Categorías hoy
</template>

<script>
	import Loader 			from "@/components/elements/Loader.vue"

	export default {
		data() {
			return{
				status: {
					weekLoader: false,
					todayLoader: false,
					monthLoader: false,
					productsLoader: false,
					partnersLoader: false,
					catMonthLoader: false,
					catWeekLoader: false,
					catTodayLoader: false,
				}
			}
		},
		methods: {
			downloadToday: function() {
				if( !this.status.todayLoader ){
					
					this.status.todayLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes/5"
					this.axios.get( url, config )
					.then(response => {
						
    					var a = document.createElement("a")
    					document.body.appendChild(a)
    					a.style = "display: none"

						const blob = new Blob([response.data], {type: "octet/stream"})
            			const url = window.URL.createObjectURL(blob)
            			const filename = "VentasHoy-" + (new Date().toISOString().substr(0, 10)) + ".csv"

            			a.href = url
            			a.download = filename
            			a.click()
            			window.URL.revokeObjectURL(url)
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.todayLoader = false
					})
				}
			},
			downloadWeek: function() {
				if( !this.status.weekLoader ){
					
					this.status.weekLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes/4"
					this.axios.get( url, config )
					.then(response => {
						
    					var a = document.createElement("a")
    					document.body.appendChild(a)
    					a.style = "display: none"

						const blob = new Blob([response.data], {type: "octet/stream"})
            			const url = window.URL.createObjectURL(blob)
            			const filename = "VentasSemana-" + (new Date().toISOString().substr(0, 10)) + ".csv"

            			a.href = url
            			a.download = filename
            			a.click()
            			window.URL.revokeObjectURL(url)
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.weekLoader = false
					})
				}
			},
			downloadMonth: function() {
				
				if( !this.status.monthLoader ){
					
					this.status.monthLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes/3"
					this.axios.get( url, config )
					.then(response => {
						
    					var a = document.createElement("a")
    					document.body.appendChild(a)
    					a.style = "display: none"

						const blob = new Blob([response.data], {type: "octet/stream"})
            			const url = window.URL.createObjectURL(blob)
            			const filename = "VentasMes-" + (new Date().toISOString().substr(0, 10)) + ".csv"

            			a.href = url
            			a.download = filename
            			a.click()
            			window.URL.revokeObjectURL(url)
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.monthLoader = false
					})
				}
				
			},
			downloadProducts: function() {
				
				if( !this.status.productsLoader ){
					
					this.status.productsLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes/1"
					this.axios.get( url, config )
					.then(response => {
						
    					var a = document.createElement("a")
    					document.body.appendChild(a)
    					a.style = "display: none"

						const blob = new Blob([response.data], {type: "octet/stream"})
            			const url = window.URL.createObjectURL(blob)
            			const filename = "Productos-" + (new Date().toISOString().substr(0, 10)) + ".csv"

            			a.href = url
            			a.download = filename
            			a.click()
            			window.URL.revokeObjectURL(url)
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.productsLoader = false
					})
				}
			},
			downloadPartners: function() {

				if( !this.status.partnersLoader ){

					this.status.partnersLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes/2"
					this.axios.get( url, config )
					.then(response => {
						
    					var a = document.createElement("a")
    					document.body.appendChild(a)
    					a.style = "display: none"

						const blob = new Blob([response.data], {type: "octet/stream"})
            			const url = window.URL.createObjectURL(blob)
            			const filename = "Socios-" + (new Date().toISOString().substr(0, 10)) + ".csv"

            			a.href = url
            			a.download = filename
            			a.click()
            			window.URL.revokeObjectURL(url)
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.partnersLoader = false
					})
				}
			},
			downloadCatMonth: function() {

				if( !this.status.catMonthLoader ){

					this.status.catMonthLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes-ventas/1"
					this.axios.get( url, config )
					.then(response => {
						window.open( response.data, "_blank")
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.catMonthLoader = false
					})
				}
			},
			downloadCatWeek: function() {

				if( !this.status.catWeekLoader ){

					this.status.catWeekLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes-ventas/2"
					this.axios.get( url, config )
					.then(response => {
						window.open( response.data, "_blank")
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.catWeekLoader = false
					})
				}
			},
			downloadCatToday: function() {

				if( !this.status.catTodayLoader ){

					this.status.catTodayLoader = true

					let config = {headers: {'Authorization': 'Bearer ' + localStorage.token}}

					let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/reportes-ventas/3"
					this.axios.get( url, config )
					.then(response => {
						window.open( response.data, "_blank")
					})
					.catch(err => {
						console.log( err )
					})
					.finally(() => {
						this.status.catTodayLoader = false
					})
				}
			},
		},
		components: {
			Loader
		}		
	}
</script>

<style lang="sass" scoped>
	.reports
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
			.grid-option
				display:_inline-block
				width: 24%
				float: left
				height: 300px
				padding: 20px
				.grid-option-container
					position: relative
					background-color: #002736
					border-radius: 25px
					transition: 0.2s linear all
					padding: 25px
					width: 100%
					height: 100%
					.icon
						position: absolute
						color: rgba(255, 255, 255, 0.1)
						font-size: 200px
						bottom: 0
						right: 0
						transition: 0.2s linear all
					.icon-loading
						position: absolute
						color: rgba(255, 255, 255, 0.7)
						font-size: 100px
						top: 25px
						right: 0
						left: 0
						margin-left: auto
						margin-right: auto
						transition: 0.3s linear all
					p
						position: absolute
						font-family: Lato-Black
						font-size: 26px
						color: white
						text-align: center
						left: 0
						right: 0
						bottom: 30px
						text-transform: uppercase
						letter-spacing: 1px
					&:hover
						cursor: pointer
						//box-shadow: 4px 10px 10px -5px black
						transform: scale(1.03)
						transition: 0.2s linear all
						background-color: #003447

						.icon
							bottom: 25px
							right: 25px
							transform: scale(1.2)
							transition: 0.3s linear all

</style>