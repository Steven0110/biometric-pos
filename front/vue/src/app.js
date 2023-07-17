import Vue from "vue"

import App from "./App.vue"
import router from "./router"

/*	Vue Bootstrap 	*/
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

/*	Font Awesome 	*/
import { library } 					from '@fortawesome/fontawesome-svg-core'
import { faShoppingCart, faBox, faUser, faFile, faDollarSign, faTimes, faChartLine, faUsers, faDownload, faSpinner, faCircleNotch, faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } 			from '@fortawesome/vue-fontawesome'
library.add( faShoppingCart, faBox, faUser, faFile, faDollarSign, faTimes, faChartLine, faUsers, faDownload, faSpinner, faCircleNotch, faList )
Vue.component("fa", FontAwesomeIcon)

/*	Axios 	*/
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use( VueAxios, axios )

/*	Sweet Alert 2 	*/
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
const options = {confirmButtonColor: '#2f506e',cancelButtonColor: '#db5756'}
Vue.use( VueSweetalert2, options )

/*	Spatial Navigation 	*/
import VueSpatialNavigation from "vue-spatialnavigation"
Vue.use(VueSpatialNavigation)

/*	Vue Sentry 	*/
//import * as Sentry from '@sentry/browser'
//import * as Integrations from '@sentry/integrations'
//Sentry.init({
//  dsn: 'https://df1208613d1e4287bc266b5d6b1961f2@sentry.io/1866921',
//  integrations: [new Integrations.Vue({Vue, attachProps: true})],
//});


/*	Global Imports 	*/
//Vue.prototype.Sentry = Sentry
Vue.prototype.baseApi = "https://6iunrk1f11.execute-api.us-west-1.amazonaws.com/"
Vue.prototype.baseApi2 = "https://g5jbnslxhi.execute-api.us-west-1.amazonaws.com/qa/"
Vue.prototype.envPath = "dev/"
Vue.prototype.servlet = "http://localhost:8080/ServerImpresora/"
Vue.prototype.formatCurrency = value => "$" + parseFloat(value).toFixed(2).replace('.', '.').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
Vue.prototype.formatFloat = n => Number( parseFloat( Number( n ) ).toFixed( 2 ) )

/*	Vue Data Tables 	*/
import ElementUI from 'element-ui'
import { DataTables  } from 'vue-data-tables'
import lang from 'element-ui/lib/locale/lang/es'
import locale from 'element-ui/lib/locale'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
Vue.use(DataTables)
locale.use(lang)

Vue.prototype.currencify = value => parseFloat(value).toFixed(1).replace('.', '.').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")


new Vue({
	el: "#app",
	router,
	render: h => h( App ),
})