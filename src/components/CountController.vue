<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const count = ref(props.modelValue);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  count.value = newValue;
});

// Watch for internal changes to count
watch(count, (newValue) => {
  emit('update:modelValue', newValue);
});

const increment = () => {
  if (props.max !== undefined && count.value >= props.max) return;
  count.value++;
};

const decrement = () => {
  if (props.min !== undefined && count.value <= props.min) return;
  count.value--;
};
</script>

<template>
  <div class="flex items-center">
    <div class="flex items-center border border-gray-300 rounded-md overflow-hidden">
      <button 
        @click="decrement" 
        class="px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
        :disabled="props.min !== undefined && count <= props.min"
      >
        <span class="text-xl font-medium">−</span>
      </button>
      
      <span class="px-4 py-2 text-xl font-medium text-gray-800">{{ count }}</span>
      
      <button 
        @click="increment" 
        class="px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
        :disabled="props.max !== undefined && count >= props.max"
      >
        <span class="text-xl font-medium text-green-500">+</span>
      </button>
    </div>
    
    <span v-if="label" class="ml-3 text-lg text-gray-800">{{ label }}</span>
  </div>
</template>