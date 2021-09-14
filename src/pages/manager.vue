<template>
  <q-page padding>
     {{$t('managerctx')}}
  </q-page>
</template>

<script>
import { CHECK_ACCESS } from 'src/queries'
export default {
  name: 'Manager',
  data () {
    return {

    }
  },
  apollo: {
    checkAccess: {
      query: CHECK_ACCESS,
      variables: { res: 'manager' }
    }
  }
}
</script>
