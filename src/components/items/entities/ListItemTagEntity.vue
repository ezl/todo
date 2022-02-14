<template>
  <span>{{ tagName }}</span>
</template>

<script>
export default {
  props: {
    tagName: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
span {
  color: #6e6d72;
}
</style>
