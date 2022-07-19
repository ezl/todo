<template>
    <span class="text-secondary inline-block">{{ content }}</span>
</template>

<script>
import listItemEntity from '@/mixins/listItemEntity'

export default {
    props: {
        content: {
            required: true,
            type: String
        }
    },
    mixins: [listItemEntity]
}
</script>