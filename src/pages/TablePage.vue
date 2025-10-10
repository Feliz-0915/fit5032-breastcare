<template>
  <div class="container my-4">
    <h2 class="fw-bold text-center text-primary mb-4">Interactive Data Tables</h2>
    <SelfCheckTable />
    <ClinicsTable />
  </div>
</template>

<script>
import SelfCheckTable from '@/components/SelfCheckTable.vue'
import ClinicsTable from '@/components/ClinicsTable.vue'

export default {
  components: { SelfCheckTable, ClinicsTable },
}
</script>
