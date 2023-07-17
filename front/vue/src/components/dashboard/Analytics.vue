<template lang="pug">
	.analytics
		.title
			fa.icon(:icon="['fa', 'chart-line']")
			span
				|Estadísticas de ventas (EN DESARROLLO)
		.content
			.charts.row
				.col-md-3.p-4(v-if="analytics")
					h5.chart-title
						|Afluencia por día
					.chart
						line-chart(:chart-data="analytics.salesPerWeek.graph", :options="graphOptions")
					.chart-description
						|Cantidad de órdenes realizadas en los últimos 7 días
					loader(v-if="status.orders")

				.col-md-3.p-4(v-if="analytics")
					h5.chart-title
						|Productos más vendidos
					.chart
						bar-chart(:chart-data="analytics.topProducts.graph", :options="graphOptions")
					.chart-description
						|Los 10 productos más vendidos
					loader(v-if="status.topTen")

				//.col-md-3.p-4(v-if="analytics")
					h5.chart-title
						|Métodos de pago
					.chart
						doughnut-chart(:chart-data="analytics.paymentMethods")
					.chart-description
						|Comparativo de métodos de pago usados
			.row
				.col-md-12
					h5.chart-title
						|Indicadores de rendimiento
				.col-md-3.pt-1.pb-1
					kpi(name="Órdenes (última semana)", :value="analytics.salesPerWeek.length", color="#ffedbf", icon="box")
				.col-md-3.pt-1.pb-1
					kpi(name="Ventas (última semana)", :value="formatCurrency(analytics.kpi.weekSales)", color="#ffbfc2", icon="dollar-sign")
				.col-md-3.pt-1.pb-1
					kpi(name="Utilidad (última semana)", :value="formatCurrency(analytics.kpi.weekUtility)", color="#bfdaff", icon="dollar-sign")
				.col-md-3.pt-1.pb-1
					kpi(name="Ventas (último mes)", :value="formatCurrency(analytics.kpi.monthSales)", color="#c8ffbf", icon="dollar-sign")
				.col-md-3.pt-1.pb-1
					kpi(name="Utilidad (último mes)", :value="formatCurrency(analytics.kpi.monthUtility)", color="#ffd3bf", icon="dollar-sign")
				.col-md-3.pt-1.pb-1
					kpi(name="Ventas totales", :value="formatCurrency(analytics.kpi.totalSales)", color="#dabfff", icon="dollar-sign")
				.col-md-3.pt-1.pb-1
					kpi(name="Utilidad total", :value="formatCurrency(analytics.kpi.totalUtility)", color="#febfff", icon="dollar-sign")
</template>

<script>
	import Loader 			from "@/components/elements/Loader.vue"
	import LineChart 		from "@/components/dashboard/charts/LineChart.js"
	import DoughnutChart	from "@/components/dashboard/charts/Doughnut.js"
	import BarChart			from "@/components/dashboard/charts/BarChart.js"
	import KPI 				from "@/components/dashboard/charts/KPI.vue"

	export default {
		data() {
			return{
				analytics: {
					"salesPerWeek": {
						"graph": {
							"labels": ["15/01", "16/01", "17/01", "18/01", "19/01", "20/01", "21/01"],
							"datasets": [{
								"label": "Órdenes por día",
								"backgroundColor": "#79bff8",
								"data": [10, 15, 20, 30, 32, 25, 5]
							}]
						},
						"length": 137
					},
					"topProducts": {
						"graph": {
							"labels": [],
							"datasets": [{
								"label": "# de ventas",
								"backgroundColor": "#79bff8",
								"data": []
							}]
						},
					},
					"paymentMethods": {
						"labels": ["Efectivo (%)", "Tarjeta (%)"],
						"datasets": [{
							"backgroundColor": ["#6387E0", "#79bff8"],
							"data": [88.1, 12]
						}]
					},
					"kpi": {
						"weekSales": 0, //en pesos,
						"weekUtility": 0, //en pesos
						"monthSales": 0, //en pesos,
						"monthUtility": 0, //en pesos
						"totalSales": 0, //en pesos,
						"totalUtility": 0, //en pesos
					}
				},
				status: {
					topTen: true,
					orders: true,
					paymentMethod: true
				},
				graphOptions: {scales: {yAxes: [{ticks: {beginAtZero: true, min: 0}}]}}
			}
		},
		mounted: function() {
			let config = {
		    	headers: {
		    		'Authorization': 'Bearer ' + localStorage.token
		    	}
		  	}

		  	/***********	 	ANALYTICS 		***********/
		  	/*		AFLEUNCIA POR DÍA 	*/
		  	let url = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/analiticas/analiticas/1"
		  	let sum = 0
			this.axios.get(url, config)
			.then( response => {
				let daily = response.data
				let graphBody = {graph: {labels: [], datasets: [{data: [], label: "# de ventas", backgroundColor: "#79bff8"}]}}

				for( let i = 0 ; i < daily.length ; i++ ){
					graphBody.graph.labels.push(daily[ i ].date)
					graphBody.graph.datasets[ 0 ].data.push(daily[ i ].count)

					sum += Number( daily[ i ].count )

				}

				graphBody.length = sum
				this.analytics.salesPerWeek = graphBody

			})
			.catch( err => {
				console.log( err )
			})
			.finally( () => {
				this.status.orders = false
			})

		  	/*		TOP TEN 	*/
		  	let urlTT = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/analiticas/analiticas/2"
			this.axios.get(urlTT, config)
			.then( response => {
				let products = response.data
				let graphBody = {graph: {labels: [], datasets: [{data: [], label: "# de ventas", backgroundColor: "#79bff8"}]}}
				for( let i = 0 ; i < products.length ; i++ ){
					graphBody.graph.labels.push(products[ i ].sku)
					graphBody.graph.datasets[ 0 ].data.push(products[ i ].count)
				}
				//graphBody.options = 
				this.analytics.topProducts = graphBody
			})
			.catch( err => {
				console.log( err )
			})
			.finally( () => {
				this.status.topTen = false
			})

		  	/*		KPI 	 	*/
		  	let urlS = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/analiticas/analiticas/4"
			this.axios.get(urlS, config)
			.then( response => {
				let kpi = response.data

				this.analytics.kpi.monthUtility 	= kpi.utilidad_mensuales
				this.analytics.kpi.weekUtility 	= kpi.utilidad_semana
				this.analytics.kpi.totalUtility 	= kpi.utilidad_totales
				this.analytics.kpi.weekSales 		= kpi.ventas_semana
				this.analytics.kpi.totalSales 	= kpi.ventas_totales
				this.analytics.kpi.monthSales 	= kpi.ventas_mensuales
				//let products = response.data
				//let graphBody = {graph: {labels: [], datasets: [{data: [], label: "# de ventas", backgroundColor: "#79bff8"}]}}
				//for( let i = 0 ; i < products.length ; i++ ){
				//	graphBody.graph.labels.push(products[ i ].sku)
				//	graphBody.graph.datasets[ 0 ].data.push(products[ i ].count)
				//}
				//graphBody.options = 
				//this.analytics.topProducts = graphBody
			})
			.catch( err => {
				console.log( err )
			})
			.finally( () => {
				//this.status.topTen = false
			})
			return ;

		  	/*		SIETE 	 	*/
		  	let urlV = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/dev/analiticas/ventas"
			this.axios.get(urlV, config)
			.then( response => {
				console.log( response.data )
				//let products = response.data
				//let graphBody = {graph: {labels: [], datasets: [{data: [], label: "# de ventas", backgroundColor: "#79bff8"}]}}
				//for( let i = 0 ; i < products.length ; i++ ){
				//	graphBody.graph.labels.push(products[ i ].sku)
				//	graphBody.graph.datasets[ 0 ].data.push(products[ i ].count)
				//}
				//graphBody.options = 
				//this.analytics.topProducts = graphBody
			})
			.catch( err => {
				console.log( err )
			})
			.finally( () => {
				//this.status.topTen = false
			})
		},
		methods: {},
		components: {
			Loader,
			LineChart,
			BarChart,
			"kpi": KPI,
			DoughnutChart
		}		
	}
</script>

<style lang="sass" scoped>
	.analytics
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
		.chart-title
			text-align: center
			font-family: Lato-Bold
			letter-spacing: 2px
			color: #4489c2
		.chart-description
			font-size: 12px
			text-align: center
			color: #787878
			font-family: Lato-Regular
		.chart
			position: relative
			.doughnut-kpi
				position: absolute
				font-family: Lato-Bold
				margin: auto
				left: 0
				right: 0
				top: 0
				bottom: 0
				width: 70px
				height: 20px
				text-align: center
				font-size: 18px
				padding-top: 20px
</style>