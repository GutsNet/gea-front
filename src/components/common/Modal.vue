<template>
  <v-dialog v-model="visible" :persistent="props.persistent" :max-width="props.maxWidth">
    <template #activator>
      <slot name="activator" />
    </template>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="modal-title"><slot name="title" /></div>
        <v-btn icon small @click="visible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions class="justify-end">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  persistent: { type: Boolean, default: false },
  maxWidth: { type: [Number, String], default: 800 },
});

const emit = defineEmits(['update:modelValue']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
</script>

<style scoped>
.modal-title { font-weight: 600; font-size: 1.05rem; }
</style>
