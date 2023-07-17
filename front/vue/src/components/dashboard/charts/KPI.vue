<template lang="pug">
	.kpi(:style="generalCss()")
		.kpi-name(:style="colorCss()")
			|{{ name }}
		.kpi-value
			|{{ value }}
		fa.kpi-icon(:icon="icon", :style="colorCss()")
</template>

<script>
	export default {
		props: ["name", "value", "color", "icon"],
		methods: {
			generalCss: function() {
				return {
					"background-color": this.color || "inherit"
				}
			},
			colorCss: function() {
				return {
					"color": this.color || "inherit"
				}
			},
		}
	}
</script>

<style lang="sass">
	.kpi
		margin-left: 0px
		margin-right: 0px
		margin-top: 10px
		margin-bottom: 10px
		padding: 20px
		position: relative
		overflow: hidden
		border-radius: 7px
		.kpi-icon
			position: absolute
			bottom: 20px
			right: 40px
			transform: scale( 4 )
			filter: brightness(90%)
		.kpi-name
			filter: brightness(50%)
			font-size: 16px
			font-family: Lato-Regular
			letter-spacing: 1px
			text-transform: uppercase
		.kpi-value
			filter: brightness(50%)
			font-size: 30px
			font-family: Lato-Black
			letter-spacing: 2px
			text-transform: uppercase
			padding-left: 20px
</style>