<template lang="pug">
	.icon-input
		.wrapper
			.icon
				img(:src="icon")
			.input
				input(:value="value", ref="input", @change="update()", :placeholder="placeholder", :type="type", @input="$emit('input', $refs.input.value)", @keyup.enter="$emit('enter')")
			transition(name="slide-fade")
				.input-tooltip(v-show="!validRegex")
					|{{ name }} inválido.
			transition(name="slide-fade")
				.input-tooltip(v-if="error")
					|{{ error }}.
</template>

<script>
	export default {
		props: ["icon", "placeholder", "value", "type", "regex", "name", "error"],
		data() {
			return {

			}
		},
		computed: {
			validRegex: function() {
				if( !this.regex )
					return true
				else{
					if( this.value ){
						let valid = this.regex.test( this.value )
						this.$emit("valid", valid)
						return valid
					}else
						return true
				}
			}
		},
		methods: {
			update: function(){
				if( this.$refs.input && this.$refs.input.value )
					this.$emit('input', this.$refs.input.value)
			}
		}
	};
</script>

<style lang="sass">
	.icon-input
		.wrapper
			background-color: white
			text-align: left
			height: 35px
			border-radius: 5px
			position: relative
			.icon
				display: inline-block
				position: absolute
				width: 30px
				height: 100%
				margin: 0
				z-index: 9
				border: 5px 0 0 15px
				background-color: none
				height: 35px

				img
					padding-top: 7px
					padding-left: 7px
					padding-right: 7px
					padding-bottom: 7px
					max-height: 100%
					width: 100%
			.input
				height: 100%
				position: relative
				input
					display: inline-block
					width: 100%
					margin: 0
					padding-left: 35px
					height: 100%
					padding-right: 10px
					font-family: Lato-Regular
					font-size: 16px
					background: none
					border: none
					transition: 0.2s linear all
					border-radius: 5px

					&:focus
						box-shadow: 0px 1px 14px -6px green
						transition: 0.2s linear all

					&::placeholder
						color: rgba(0, 0, 0, 0.3)

				&:before
					content: ""
					position: absolute
					left: 30px
					top: 0
					bottom: 0
					margin-top: auto
					margin-bottom: auto

					background-color: rgba(0, 0, 0, 0.2)
					width: 1px
					height: 20px
			.input-tooltip
				background-color: white
				padding-right: 30px
				color: #b52828
				text-align: center
				padding-left: 50px
				border-radius: 0 0 10px 10px
				margin-top: -2px
</style>