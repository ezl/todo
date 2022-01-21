<template>
    <div @click="toggle">
        <checkbox-blank-outline-icon :size="21" class="text-gray-200" v-if="!checked" />
        <checkbox-outline-icon :size="21" class="text-gray-200" v-else />
    </div>
</template>

<script>
import CheckboxBlankOutlineIcon from 'vue-material-design-icons/CheckboxBlankOutline'
import CheckboxOutlineIcon from 'vue-material-design-icons/CheckboxOutline'

export default {
    components: {
        CheckboxBlankOutlineIcon,
        CheckboxOutlineIcon
    },
    props: {
        value: {
            type: Boolean,
            required: true
        }
    },
    data(){
        return {
            checked: this.value
        }
    },
    methods: {
        toggle(){
            this.checked = !this.checked
            this.$emit('input', this.checked)
        }
    }
}
</script>