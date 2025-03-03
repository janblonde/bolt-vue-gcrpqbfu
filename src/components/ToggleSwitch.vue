<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const toggle = () => {
  emit('update:modelValue', !modelValue);
};
</script>

<template>
  <div class="flex items-center justify-between">
    <span class="text-gray-800">{{ label }}</span>
    <button 
      @click="toggle"
      class="relative inline-flex h-6 w-11 items-center rounded-full"
      :class="modelValue ? 'bg-green-500' : 'bg-gray-300'"
      type="button"
      role="switch"
      :aria-checked="modelValue"
    >
      <span 
        class="inline-block h-4 w-4 transform rounded-full bg-white transition"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
      ></span>
    </button>
  </div>
</template>