import Login 			from "@/pages/Login.vue"
import POS 				from "@/pages/POS.vue"
import Backup 			from "@/pages/Backup.vue"
import Cashier 			from "@/pages/Cashier.vue"
import Mixed 			from "@/pages/Mixed.vue"
import GeneralDashboard from "@/pages/GeneralDashboard.vue"
import Inventory 		from "@/components/dashboard/Inventory.vue"
import BackupOrder		from "@/components/dashboard/BackupOrder.vue"
import Products 		from "@/components/dashboard/Products.vue"
import Overview 		from "@/components/dashboard/Overview.vue"
import Users 			from "@/components/dashboard/Users.vue"
import Partners			from "@/components/dashboard/Partners.vue"
import Prices 			from "@/components/dashboard/Prices.vue"
import Categories 		from "@/components/dashboard/Categories.vue"
import Analytics 		from "@/components/dashboard/Analytics.vue"
import Reports	 		from "@/components/dashboard/Reports.vue"

export default [
	{

		path: '/general',
		component: GeneralDashboard,
		children: [
			{
				path: '/analytics',
				name: "Analytics",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Analytics
				}
			},
			{
				path: 'inventory',
				name: "Inventory",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Inventory
				}
			},
			{
				path: 'products',
				name: "Products",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Products
				}
			},
			{
				path: 'prices',
				name: "Prices",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Prices
				}
			},
			{
				path: 'Categories',
				name: "Categories",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Categories
				}
			},
			{
				path: 'users',
				name: "Users",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Users
				}
			},
			{
				path: 'partners',
				name: "Partners",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Partners
				}
			},
			{
				path: 'reports',
				name: "Reports",
				meta: {
					requiresAdmin: true
				},
				components: {
					panel: Reports
				}
			}
		],
		meta: {
			requiresAdmin: true
		}
	},
	{

		path: '/pos',
		component: POS,
		name: "POS",
		meta: {
			requiresPos: true
		}
	},
	{

		path: '/caja',
		component: Cashier,
		name: "Cashier",
		meta: {
			requiresCashier: true
		}
	},
	{

		path: '/reposicion',
		component: Backup,
		children: [
			{
				path: '/',
				name: "backup",
				meta: {
					requiresBackup: true
				},
				components: {
					panel: BackupOrder
				}
			}
		],
		meta: {
			requiresBackup: true
		}
	},
	{

		path: '/caja-y-venta',
		component: Mixed,
		name: "Mixed",
		meta: {
			requiresMixed: true
		}
	},
	{
		path: '/',
		redirect: "login",
	},
	{
		path: '/login',
		component: Login,
		name: "Login"
	},
	{
		path: "*",
		component: GeneralDashboard
	}
];