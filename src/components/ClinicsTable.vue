<template>
  <div class="mt-5">
    <h4 class="text-primary mb-3">Clinic Finder</h4>
    <InteractiveTable :data="clinicData" :columns="columns" />
  </div>
</template>

<script>
import InteractiveTable from './InteractiveTable.vue'
import clinicData from '../data/clinics.json'

export default {
  components: { InteractiveTable },
  data() {
    return {
      clinicData,
      columns: [
        { label: 'ID', key: 'id' },
        { label: 'Clinic Name', key: 'clinicName' },
        { label: 'Suburb', key: 'suburb' },
        { label: 'Rating', key: 'rating' },
        { label: 'Contact', key: 'contact' },
      ],
    }
  },
}
</script>
