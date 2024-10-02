import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'
import { VTreeview } from 'vuetify/labs/VTreeview'

export default createVuetify({
  components: {
    VTreeview,
  },
  theme: {
    defaultTheme: 'dark',
  },
})
