<!--© 2021 Alexx Sub, https://github.com/alexxsub/-->
<template>
  <q-page padding>
    <div class="q-pa-md">
    <q-table
      :title="$t('datatable')"
      :data="getData"
      :columns="i18ncolumns"
      row-key="name"
      :loading="loading"
    >
     <template v-slot:top>
        <q-btn color="primary" :disable="loading" :label="$t('add')" @click="addRow"></q-btn>
        <q-btn color="red" class="q-ml-sm"  :disable="loading" :label="$t('clear')" @click="Clear"></q-btn>
        <q-space></q-space>
        <q-input  dense debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search"></q-icon>
          </template>
        </q-input>
      </template>
  </q-table>
  </div>
  </q-page>
</template>

<script>
import { DATA } from 'src/queries'
export default {
  name: 'Table',
  data () {
    return {
      filter: '',
      loading: false,
      columns: [
        { name: 'name' },
        { name: 'admin' },
        { name: 'director' },
        { name: 'manager' }
      ]
    }
  },
  apollo: {
    getData: {
      query: DATA
    }
  },
  computed: {
    i18ncolumns () {
      return this.columns.map(el => {
        el.label = this.$t(el.name)
        el.field = el.name

        return el
      })
    }
  }

}
</script>
