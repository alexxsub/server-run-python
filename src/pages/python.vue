<template>
  <q-page padding>
    python
  </q-page>
</template>

<script>
import { CHECK_ACCESS } from 'src/queries'
export default {
  name: 'Python',
  data () {
    return {

    }
  },
  apollo: {
    checkAccess: {
      query: CHECK_ACCESS,
      variables: { res: 'python' }
    }
  }
}
</script>
