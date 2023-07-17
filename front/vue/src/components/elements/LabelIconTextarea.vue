<template lang="pug">
	.label-icon-textarea
		.form-group
			label
				.icon
					img(:src="icon")
				span
					|{{ label }}
			textarea.form-control(:placeholder="placeholder", :value="text", @change="update", ref="textarea", :maxlength="max || 99999", rows="10")
			transition(name="slide-fade")
				.input-tooltip(v-show="!validRegex")
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
			},
			text: function() {
				if( this.value )
					return this.value.join("\n")
			}
		},
		methods: {
			update: function() {
				this.$emit("input", this.$refs.textarea.value.split("\n"))
				this.$emit("update", this.pkey)
			}
		}
	}
</script>

<style lang="sass">
	.label-icon-textarea
		margin-top: 25px
		label
			.icon
				display: inline-block
				img
					width: 20px
					height: 20px
					margin-bottom: 5px

			span
				height: 20px
				margin-left: 10px
				font-family: Lato-Regular
				font-size: 16px
		textarea
			font-family: Lato-Regular
			&::placeholder
				color: rgba(0, 0, 0, 0.25)

</style>