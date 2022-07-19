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
  computed: {
    hashTagEntities() {
      if (this.item.tag_positions === null) return [];

      const entities = [];

      this.item.tag_positions.forEach(tagMeta => {
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
    mentionEntities(){
      const pattern = /@(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
      const entities = [];

      let match;
      while ((match = pattern.exec(this.item.body)) != null) {
        const entity = {};
        entity.body = match[0];
        entity.startIndex = match[0].startsWith(' ') ? match.index + 1 : match.index;
        entity.endIndex = entity.startIndex + entity.body.length;
        entity.type = 'mention';
        entities.push(entity);
      }
      return entities;
    },
    allEntities() {
      return [...this.hashTagEntities, ...this.mentionEntities].sort((a,b) => a.startIndex - b.startIndex)
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
