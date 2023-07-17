<template lang="pug">
	transition(name="fade")
		.loader
			img(src="/assets/img/loading.gif")
</template>

<style lang="sass">
	.loader
		position: absolute
		background-color: white
		text-align: center
		top: 0
		left: 0
		height: 100%
		width: 100%
		z-index: 1000
		img
			max-width: 100%
			max-height: 100%
</style>