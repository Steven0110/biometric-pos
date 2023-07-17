<template lang="pug">
	.general-dashboard
		.row
			.col-md-2
				general-menu
			.col-md-10.panel
				transition(name="fade", mode="out-in")
					router-view(name="panel")
</template>

<script>
	import GeneralMenu 		from "@/components/dashboard/menu/GeneralMenu.vue"
	export default {
		components: {
			GeneralMenu
		}
	}
</script>

<style lang="sass">
	.general-dashboard
		.panel
			padding: 30px
</style>