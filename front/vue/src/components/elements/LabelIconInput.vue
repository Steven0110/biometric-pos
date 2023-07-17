<template lang="pug">
	.label-icon-input
		.form-group
			label(v-if="label")
				.icon
					img(:src="icon")
				span
					|{{ label }}
			input.form-control(:placeholder="placeholder", :value="value", @change="update", ref="input", :maxlength="max || 99999")
			transition(name="slide-fade")
				.input-tooltip(v-if="!validRegex")
					|{{ label }} inválido.
			transition(name="slide-fade")
				.input-tooltip(v-if="error")
					|{{ error }}.
</template>

<script>
	export default {
		props: ["placeholder", "icon", "label", "regex", "error", "value", "max", "pkey"],
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
			update: function() {
				this.$emit("input", this.$refs.input.value)
				if( this.regex && this.validateRegex( this.$refs.input.value ) )
					this.$emit("update", this.pkey)
				else if( !this.regex )
					this.$emit("update", this.pkey)
			},
			validateRegex: function( text ) {
				if( this.regex )
					return this.regex.test( text )
				else return true
			}
		}
	}
</script>

<style lang="sass">
	.label-icon-input
		margin-top: 25px
		label
			.icon
				display: inline-block
				width: 20px
				height: 20px
				img
					max-width: 100%
					max-height: 100%
					margin-bottom: 5px

			span
				height: 20px
				margin-left: 10px
				font-family: Lato-Regular
				font-size: 16px
		input
			font-family: Lato-Regular
			&::placeholder
				color: rgba(0, 0, 0, 0.25)

		.input-tooltip
			background-color: white
			font-family: Lato-Bold
			color: #b52828
			padding-left: 20px
			border-radius: 0 0 10px 10px
			margin-top: -2px

</style>