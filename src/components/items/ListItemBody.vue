<script>
import ListItemTagEntity from '@/components/items/entities/ListItemTagEntity';
import ListItemMentionEntity from '@/components/items/entities/ListItemMentionEntity';

export default {
  components: {
    ListItemTagEntity,
    ListItemMentionEntity
  },
  props: {
    item: {
      required: true,
      type: Object
    }
  },
  render: function(h) {
    const bodyParts = this.replaceEntitiesWithComponents(this.item.body);

    return <span> {...bodyParts} </span>;
  },
  methods: {
    replaceEntitiesWithComponents(body) {
      const allEntities = this.item.extractAllEntitiesFromBody()

      if (allEntities.length === 0) return [body];

      const bodyParts = [];

      // We will loop throught extracted entities in reverse order, because we want to go from the end to the start
      // If we were to start from the beginning, start/end indexes (positions) of the rest of entities would be messed up
      for (let i = allEntities.length - 1; i >= 0; i--) {
        const entity = allEntities[i];
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
        case 'mention':
          return <ListItemMentionEntity content={content} />;
          break;
        default:
          break;
      }
    }
  }
};
</script>
