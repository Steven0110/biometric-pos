<template lang="pug">
	.general-menu
		.logo
			img(src="/assets/img/350x150.png")
		.options
			.option(:class="{active: active == 'analytics'}", @click="active = 'analytics'")
				router-link(:to="{path: '/analytics'}")
					fa.option-icon(icon="chart-line")
					|Estadísticas
			.option(:class="{active: active == 'products'}", @click="active = 'products'")
				router-link(:to="{path: '/general/products'}")
					fa.option-icon(icon="box")
					|Productos
			.option(:class="{active: active == 'categories'}", @click="active = 'categories'")
				router-link(:to="{path: '/general/categories'}")
					fa.option-icon(icon="list")
					|Categorías
			.option(:class="{active: active == 'prices'}", @click="active = 'prices'")
				router-link(:to="{path: '/general/prices'}")
					fa.option-icon(:icon="['fas', 'dollar-sign']")
					|Precios
			.option(:class="{active: active == 'inventory'}", @click="active = 'inventory'")
				router-link(:to="{path: '/general/inventory'}")
					fa.option-icon(icon="shopping-cart")
					|Inventario
			.option(:class="{active: active == 'users'}", @click="active = 'users'")
				router-link(:to="{path: '/general/users'}")
					fa.option-icon(icon="user")
					|Usuarios
			.option(:class="{active: active == 'partners'}", @click="active = 'partners'")
				router-link(:to="{path: '/general/partners'}")
					fa.option-icon(icon="users")
					|Socios
			.option(:class="{active: active == 'reports'}", @click="active = 'reports'")
				router-link(:to="{path: '/general/reports'}")
					fa.option-icon(icon="download")
					|Reportes
		.logout(@click="logout")
			|Cerrar sesión
</template>

<script>
	export default {
		data() {
			return {
				"active": "overview"
			}
		},
		mounted() {
			this.active = this.$route.name.toLowerCase()
		},
		methods: {
			logout: function() {
				localStorage.removeItem("token")
				localStorage.removeItem("user")
				location.reload()
			}
		}
	}
</script>

<style lang="sass">
	.general-menu
		min-height: 100vh
		background-color: #2f506e
		padding-top: 30px
		padding-bottom: 30px
		position: fixed
		width: 12.6%

		.logo
			img
				max-width: 100%
				max-height: 100%

		.options
			margin-top: 20px
			.option
				transition: 0.2s linear all
				&.active
					background-color: #5383bd
					transition: 0.2s linear all
				a
					padding: 5px
					padding-left: 15px
					padding-right: 15px
					display: block
					width: 100%
					font-size: 18px
					font-family: Lato-Bold
					color: #DDD
					transition: 0.2s linear all
					&:hover
						text-decoration: none
						transition: 0.2s linear all
				&:hover
					cursor: pointer
					background-color: #5383bd
					transition: 0.2s linear all
					a
						color: #DDD
						transition: 0.2s linear all
				.option-icon
					margin-right: 15px
					width: 20px
		.logout
			position: absolute
			bottom: 0px
			padding-top: 10px
			padding-bottom: 10px
			text-align: center
			font-family: lato-Bold
			margin-left: auto
			margin-right: auto
			left: 0
			right: 0
			color: white
			transition: 0.2s linear all
			&:hover
				cursor: pointer
				background-color: #5383bd
				transition: 0.2s linear all
</style>