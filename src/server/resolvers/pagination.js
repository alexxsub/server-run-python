// customizing output filelds
const myCustomLabels = {
  totalDocs: 'rowsNumber',
  limit: 'rowsPerPage',
  nextPage: false,
  prevPage: false,
  hasNextPage: false,
  hasPrevPage: false,
  totalPages: false,
  pagingCounter: false,
  meta: false
}
// pagination - object with info about pagination, sortinig,rowsperpage, currentpage etc
// filter- string for search
// fields- array of search fields
var setPagination = function (pagination, filter, fields) {
  let sort = { createdDate: 'desc' }
  if ((pagination.sortBy !== '') && (pagination.sortBy !== null) && (pagination.sortBy !== undefined)) {
    sort = {}
    sort[pagination.sortBy] = pagination.descending ? 'desc' : 'asc'
  }

  const options = {
    page: pagination.page,
    limit: pagination.rowsPerPage === 0 ? (pagination.rowsNumber > 100 ? 100 : pagination.rowsNumber) : pagination.rowsPerPage,
    sort,
    customLabels: myCustomLabels,
    collation: {
      locale: 'ru'
    }
  }
  let query = {}
  if ((filter !== '') && (filter !== null) && (filter !== undefined)) {
    const or = []
    fields.forEach(element => {
      const item = {}
      item[element] = { $regex: filter }
      or.push(item)
    })
    query = { $or: or }
  }
  return { query, options }
}

module.exports = setPagination
