<template>
  <span class="bg-tertiary px-3 py-1 mr-2 block">
    {{ tag }}
  </span>
</template>

<script>
export default {
  props: {
    tag: {
      required: true,
      type: String
    }
  }
};
</script>
