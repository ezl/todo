<template>
  <div>
    <BackButton @click="$emit('close')">Back to main settings</BackButton>
    <div class="h-full flex justify-center items-center">
      <h1>WIP</h1>
    </div>
  </div>
</template>

<script>
import BackButton from '@/components/settings/BackButton';

export default {
  components: {
    BackButton,
  },
};
</script>
