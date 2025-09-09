<template>
  <div class="d-inline-flex align-items-center">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="btn p-0 border-0"
      :aria-label="`Rate ${n} star${n > 1 ? 's' : ''}`"
      @click="$emit('update:modelValue', n)"
    >
      <span :class="n <= modelValue ? 'text-warning' : 'text-secondary'" style="font-size: 1.4rem">
        ★
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 0 },
})
defineEmits(['update:modelValue'])
</script>
