<template lang="pug">
	.button-pill(:style="pillCss", @click="click", :class="{disabled: active === false}")
		router-link(v-if="href", :to="{path: href}", :style="anchorCss")
			|{{text}}
		.text(v-else, :style="anchorCss")
			|{{text}}
		img.login-loader(src="https://thumbs.gfycat.com/BogusEmptyBrontosaurus.webp", v-if="loading")
</template>

<script>
	export default {
		props: ["href", "text", "color", "background", "with-border", "active", "loading"],
		computed: {
			pillCss: function(){
				let css = {}
				if( this.color && this["with-border"])
					css.border = "1px solid " + this.color

				if( this.background )
					css.background = this.background
				
				return css
			},
			anchorCss: function(){
				let css = {}

				if( this.color )
					css.color = this.color
				else
					css.color = "black"

				return css
			},
		},
		mounted: function() {
		},
		methods: {
			click: function() {
				if( this.active === undefined )
					this.$emit("press")
				else
					if( this.active )
						this.$emit("press")
			}
		}
	};
</script>

<style lang="sass">
	.button-pill
		display: inline-block
		padding-top: 5px
		padding-bottom: 5px
		padding-left: 30px
		padding-right: 30px
		border-radius: 30px
		font-family: "Lato-Bold"
		text-transform: uppercase
		transition: .3s linear all
		text-align: center
		a
			font-size: 14px
			font-family: "Lato-Bold"
			transition: .3s linear all

			&:hover
				text-decoration: none

		&:hover
			background: gray
			border: 1px solid gray
			transition: .3s linear all
			cursor: pointer
			filter: brightness(90%)

			a
				color: white !important
				transition: .3s linear all

		.text
			display: inline-block
			font-size: 16px
			font-family: "Lato-Bold"
			transition: .3s linear all

		.login-loader
			width: 20px
			height: 20px
			margin-left: 10px
		&.large
			width: 50% !important
		&.disabled
			filter: brightness(70%)
			&:hover
				cursor: not-allowed

</style>