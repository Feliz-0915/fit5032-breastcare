<template>
  <div class="table-responsive mt-3">
    <input type="text" class="form-control mb-2" v-model="searchQuery" placeholder="Search..." />

    <table class="table table-striped table-hover align-middle">
      <thead class="table-primary">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            @click="sortBy(col.key)"
            style="cursor: pointer"
          >
            {{ col.label }}
            <span v-if="sortColumn === col.key">
              {{ sortOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in paginatedData" :key="item.id">
          <td v-for="col in columns" :key="col.key">
            {{ item[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>

    <nav class="d-flex justify-content-between align-items-center">
      <p class="m-0">
        Showing {{ startRow + 1 }}–{{ endRow }} of {{ filteredData.length }} entries
      </p>

      <ul class="pagination m-0">
        <li
          class="page-item"
          :class="{ disabled: currentPage === 1 }"
          @click="goToPage(currentPage - 1)"
        >
          <a class="page-link">Previous</a>
        </li>
        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          <a class="page-link">{{ page }}</a>
        </li>
        <li
          class="page-item"
          :class="{ disabled: currentPage === totalPages }"
          @click="goToPage(currentPage + 1)"
        >
          <a class="page-link">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    data: Array,
    columns: Array,
  },
  data() {
    return {
      searchQuery: '',
      sortColumn: null,
      sortOrder: 'asc',
      currentPage: 1,
      rowsPerPage: 10,
    }
  },
  computed: {
    filteredData() {
      if (!this.searchQuery) return this.data
      const q = this.searchQuery.toLowerCase()
      return this.data.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(q)),
      )
    },
    sortedData() {
      if (!this.sortColumn) return this.filteredData
      return [...this.filteredData].sort((a, b) => {
        const valA = a[this.sortColumn]
        const valB = b[this.sortColumn]
        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.rowsPerPage)
    },
    startRow() {
      return (this.currentPage - 1) * this.rowsPerPage
    },
    endRow() {
      return Math.min(this.startRow + this.rowsPerPage, this.filteredData.length)
    },
    paginatedData() {
      return this.sortedData.slice(this.startRow, this.endRow)
    },
  },
  methods: {
    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortColumn = column
        this.sortOrder = 'asc'
      }
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
    },
  },
}
</script>
