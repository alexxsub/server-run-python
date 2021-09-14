<template>
  <q-page padding>
    <div class="q-pa-md">
    <q-table
      v-if="render"
      virtual-scroll
      :loading="loading"
      :title="$t('userstable')"
      :data="records"
      :columns="i18ncolumns"
      row-key="_id"
      :pagination.sync="pagination"
      :filter="filter"
      @request="onRequest"
    >

    <template v-slot:top-left>
      <q-input
        borderless
        clearable
        dense
        debounce="300"
        v-model="filter"
        :placeholder="$t('search')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
    </template>
    <template v-slot:top-right>
        <q-btn color="secondary" icon="add" @click="newRecord" :label="$t('add')" />
    </template>
    <template v-slot:body="props">
        <q-tr   @click="expand(props)" :props="props">
          <q-td >
          <q-avatar>
          <q-img v-if="!props.row.avatar" src="~assets/no-avatar.jpg" />
          <q-img v-else-if="props.row.avatar" :src="computedUrl(props.row.avatar)" />
          <q-badge v-if="props.row.roles.includes('admin')" dense round color="orange" floating transparent>
          <q-icon
            name="mdi-crown"
          />
        </q-badge>
      </q-avatar>
          </q-td>
          <q-td>
            <a href='#' @click="editRecord(props.row)">{{props.row.username}}</a>
          </q-td>
          <q-td>
            {{props.row.fullname}}
          </q-td>
          <q-td>
            {{props.row.email}}
          </q-td>
          <q-td>
            <role-chips
            :roles="props.row.roles"
            />
          </q-td>
          <q-td>
            <q-icon v-if="props.row.enabled" name="mdi-account-check" style="color: green;font-size: 2em;" />
            <q-icon v-else-if="!props.row.enabled" name="mdi-account-cancel" style="color: red;font-size: 2em;" />
            </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="full-width row">
              <q-btn
                class="offset-1"
                key="xl-1"
                size="xs"
                flat
                rounded
                color="positive"
                icon="edit"
                @click="editRecord(props.row)"
                :label="$t('edit')" />
              <q-btn
                class="offset-1"
                key="xl-2"
                size="xs"
                rounded
                flat
                color="negative"
                icon="delete"
                :label="$t('delete')"
                @click="deleteRecord(props.row._id)" />
              <q-toggle
                size="xs"
                class="offset-1"
                v-model="enabled"
                checked-icon="mdi-account-check"
                unchecked-icon="mdi-account-cancel"
                color="red"
                @input="enabledUser"
                :label="enabled?$t('enabled'):$t('disabled')"
             />
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  </q-page>
</template>

<script>
import RoleChips from 'components/RoleChips.vue'
import bus from '../event-bus'
import { USERS2, DELETE_USER, ENABLED_USER, GET_COLUMNS } from 'src/queries'
import { showError, showMsg } from '../front-lib'
export default {
  name: 'Users',
  components: { RoleChips },
  data () {
    return {
      loading: false,
      globalprops: {}, // previos expanded tr of table
      enabled: false, // value of enabled field expanded record
      row_id: '', // id of current expanded record
      render: false, // flag of render page
      filter: '',
      Columns: [], // list of columns
      records: [],
      hiddenTitle: ['avatar', 'enabled'], // hidden  title of columns
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 3,
        rowsNumber: 0
      }
    }
  },
  apollo: {
    getUsers2: {
      query: USERS2,
      variables () { // for use reactive variables
        return {
          pagination: this.pagination,
          filter: this.filter
        }
      },
      update: function (data) {
        this.records.splice(0, this.records.length, ...data.getUsers2.docs)
        this.pagination.rowsNumber = data.getUsers2.rowsNumber
        this.pagination.page = data.getUsers2.page
        this.loading = false
      }

    },
    getColumns: {
      query: GET_COLUMNS,
      variables: {
        model: 'User'
      },
      update: function (data) {
        const cols = data.getColumns
        if (cols !== undefined) {
          this.Columns = cols.map(el => {
            el.field = el.name
            el.align = 'left'
            return el
          })
        }
        this.render = true
      }
    }
  },
  methods: {
    onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      this.loading = true
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.$apollo.queries.getUsers2.refetch()
    },
    computedUrl (url) {
      return `${process.env.BASE_URL}${url}`
    },
    expand (p) {
      this.row_id = p.row._id
      this.enabled = p.row.enabled
      this.globalprops.expand = (p.expand && this.globalprops.expand)
      p.expand = !p.expand
      this.globalprops = p
    },
    userSaved () {
      this.$apollo.queries.getUsers2.refetch()
    },
    newRecord () {
      bus.$emit('newRecord')
    },
    editRecord (row) {
      bus.$emit('editRecord', row)
      self.event.stopPropagation()
    },
    deleteRecord (id) {
      this.$q.dialog({
        title: this.$t('warning'),
        message: this.$t('deleterecord'),
        focus: 'cancel',
        ok: this.$t('yes'),
        cancel: this.$t('no')
      }).onOk(() => {
        this.$apollo.mutate({
          mutation: DELETE_USER,
          variables: { id },
          refetchQueries: [{ query: USERS2 }]
        })
          .then(data => showMsg(this.$t('recorddeleted')))
          .catch(error => showError(error.message))
      })
    },
    enabledUser (enabled) {
      this.$apollo.mutate({
        mutation: ENABLED_USER,
        variables: { id: this.row_id, enabled },
        refetchQueries: [{ query: USERS2 }]
      })
        .then(data => showMsg(enabled ? this.$t('userenabled') : this.$t('userdisabled')))
        .catch(error => {
          showError(error.message)
          this.enabled = !enabled
        })
    }
  },
  mounted () {
    bus.$on('UserSaved', this.userSaved) // subsribe for event to update main table
  },
  computed: {

    rowsNumber () {
    //  return this.getUsers2.rowsNumber
      return 8
    },
    i18ncolumns () {
      return this.Columns.map(el => {
        if (!this.hiddenTitle.includes(el.name)) { el.label = this.$t(el.name) }
        return el
      })
    }
  }
}
</script>
<style>

</style>
