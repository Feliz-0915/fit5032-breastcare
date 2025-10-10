<template>
  <div>
    <h4 class="text-primary mb-3">Self Check Records</h4>
    <InteractiveTable :data="selfcheckData" :columns="columns" />
  </div>
</template>

<script>
import InteractiveTable from './InteractiveTable.vue'
import selfcheckData from '../data/selfcheck.json'

export default {
  components: { InteractiveTable },
  data() {
    return {
      selfcheckData,
      columns: [
        { label: 'ID', key: 'id' },
        { label: 'Date', key: 'date' },
        { label: 'Result', key: 'result' },
        { label: 'Notes', key: 'notes' },
        { label: 'Status', key: 'status' },
      ],
    }
  },
}
</script>
