<script>
import ListItemTagEntity from '@/components/items/entities/ListItemTagEntity';

export default {
  components: {
    ListItemTagEntity
  },
  props: {
    item: {
      required: true,
      type: Object
    }
  },
  render: function(h) {
    const bodyParts = this.replaceEntitiesWithComponents(this.item.body);

    return <span class={this.item.completed ? 'line-through' : ''}> {...bodyParts} </span>;
  },
  computed: {
    hashTagEntities() {
      if (this.item.tags_meta === null) return [];

      const entities = [];

      this.item.tags_meta.forEach(tagMeta => {
        const attached = this.item.tags.some(tag => tag.name.toLowerCase().trim() === tagMeta.tag.toLowerCase().trim());
        if (!attached) {
          return;
        }

        entities.push({
          body: tagMeta.tag,
          startIndex: tagMeta.startIndex,
          endIndex: tagMeta.endIndex,
          type: 'tag'
        });
      });

      return entities.sort((a, b) => a.startIndex - b.startIndex)
    },
    allEntities() {
      return this.hashTagEntities;
      // In future
      // return [...this.hashTagEntities, ...this.urlEntities]
    }
  },
  methods: {
    replaceEntitiesWithComponents(body) {
      if (this.allEntities.length === 0) return [body];

      const bodyParts = [];

      // We will loop throught extracted entities in reverse order, because we want to go from the end to the start
      // If we were to start from the beginning, start/end indexes (positions) of the rest of entities would be messed up
      for (let i = this.allEntities.length - 1; i >= 0; i--) {
        const entity = this.allEntities[i];
        const precedingCharacters = body.slice(0, entity.startIndex);
        const followingCharacters = body.slice(entity.endIndex);

        // Create a new corresponding component for this entity
        const component = this.entityComponent(entity.type, entity.body);

        if (followingCharacters.trim() != '') {
          bodyParts.unshift(followingCharacters);
        }

        bodyParts.unshift(component);

        if (i == 0) {
          // At the end of the loop, append any remaining preceding characters
          if (precedingCharacters.trim() != '') bodyParts.unshift(precedingCharacters);
        } else {
          body = precedingCharacters;
        }
      }

      return bodyParts;
    },
    entityComponent(entityType, content) {
      switch (entityType) {
        case 'tag':
          return <ListItemTagEntity tag-name={content} />;
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style scoped>
span {
  padding-right: 4px;
}
</style>
