<template lang="pug">
	transition(name="fade")
		.image-viewer
			.exit(@click="$emit('exit')")
				img(src="/assets/icons/exit.png")
			.image-shown(:class="{active: started, inactive: !started}")
				img.img-thumbnail(:src="img")
</template>

<script>
	export default {
		props: ["img"],
		data() {
			return {
				current: "",
				started: false
			}
		},
		mounted() {
			console.log("Mounted")
			setTimeout(() => {
				this.started = true
			}, 100)
		}
	}
</script>

<style lang="sass">
	.image-viewer
		position: fixed
		left: 0
		top: 0
		width: 100%
		height: 100%
		background-color: rgba(0, 0, 0, 0.7)
		z-index: 100

		.exit
			position: absolute
			right: 20px
			top: 20px
			height: 60px
			width: 60px
			z-index: 9999
			&:hover
				cursor: pointer
				img
					transform: scale(1.2)
					transition: 0.2s linear all
			img
				max-width: 100%
				max-height: 100%
		.image-shown
			height: 80%
			&.active
				transform: translateY(0%)
				transition: 0.3s linear all
			&.inactive
				transform: translateY(150%)
				transition: 0.3s linear all
			img
				position: absolute
				margin: auto
				left: 0
				top: 0
				right: 0
				bottom: 0
				max-height: 100%
</style>