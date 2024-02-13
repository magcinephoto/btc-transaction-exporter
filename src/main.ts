import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons'
import { faUser, faCircleDollarToSlot, faBook } from '@fortawesome/free-solid-svg-icons'
library.add(faCircleQuestion, faUser, faCircleDollarToSlot, faBook)
const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
