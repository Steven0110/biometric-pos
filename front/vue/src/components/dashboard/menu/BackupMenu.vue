<template lang="pug">
	.backup-menu
		.logo
			img(src="/assets/img/350x150.png")
		.options
			.option(:class="{active: active == 'backup'}", @click="active = 'backup'")
				router-link(:to="{path: '/reposicion'}")
					fa.option-icon(icon="box")
					|Crear orden
		.logout(@click="logout")
			|Cerrar sesión
</template>

<script>
	export default {
		data() {
			return {
				"active": "backup"
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
	.backup-menu
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