import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use( VueRouter )
const router = new VueRouter({
	mode: 'history',
	routes,
})

router.beforeEach((to, from ,next) => {
	try{


		if(to.matched.some(record => record.meta.requiresAdmin)){
			if( localStorage.getItem("token") == null ){
				next({
					path: "/login",
					params: {
						nextUrl: to.fullPath
					}
				})
			}else{
				let user = JSON.parse( localStorage.user )
				switch( user.rol ){
					case 1:
						next()
						break
					case 2:
						next({
							path: "/caja",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 3:
						next({
							path: "/pos",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 4:
						next({
							path: "/caja-y-venta",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 5:
						next({
							path: "/reposicion",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
				}
			}
		}else if( to.matched.some(record => record.meta.requiresPos )) {
			if( localStorage.getItem("token") == null ){
				next({
					path: "/login",
					params: {
						nextUrl: to.fullPath
					}
				})
			}else{
				let user = JSON.parse( localStorage.user )
				switch( user.rol ){
					case 1:
						next({
							path: "/general/products",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 2:
						next({
							path: "/caja",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 3:
						next()
						break
					case 4:
						next({
							path: "/caja-y-venta",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 5:
						next({
							path: "/reposicion",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
				}
			}
		}else if( to.matched.some(record => record.meta.requiresCashier )) {
			if( localStorage.getItem("token") == null ){
				next({
					path: "/login",
					params: {
						nextUrl: to.fullPath
					}
				})
			}else{
				let user = JSON.parse( localStorage.user )
				switch( user.rol ){
					case 1:
						next({
							path: "/general/products",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 2:
						next()
						break
					case 3:
						next({
							path: "/pos",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 4:
						next({
							path: "/caja-y-venta",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 5:
						next({
							path: "/reposicion",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
				}
			}
		}else if( to.matched.some(record => record.meta.requiresMixed )) {
			if( localStorage.getItem("token") == null ){
				next({
					path: "/login",
					params: {
						nextUrl: to.fullPath
					}
				})
			}else{
				let user = JSON.parse( localStorage.user )
				switch( user.rol ){
					case 1:
						next({
							path: "/general/products",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 2:
						next({
							path: "/caja",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 3:
						next({
							path: "/pos",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 4:
						next()
						break
					case 5:
						next({
							path: "/reposicion",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
				}
			}
		}else if( to.matched.some(record => record.meta.requiresBackup )) {
			if( localStorage.getItem("token") == null ){
				next({
					path: "/login",
					params: {
						nextUrl: to.fullPath
					}
				})
			}else{
				let user = JSON.parse( localStorage.user )
				switch( user.rol ){
					case 1:
						next({
							path: "/general/products",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 2:
						next({
							path: "/caja",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 3:
						next({
							path: "/pos",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 4:
						next({
							path: "/caja-y-venta",
							params: {
								nextUrl: to.fullPath
							}
						})
						break
					case 5:
						next()
						break
				}
			}
		}else{
			if( localStorage.getItem("token") != null ) 	//Check role
				next({
					path: "/general/products",
					params: {
						nextUrl: to.fullPath
					}
				})
			else
				next()
		}
	}catch(err){
		localStorage.removeItem("user")
		localStorage.removeItem("token")
		location.reload()
	}
})

export default router;