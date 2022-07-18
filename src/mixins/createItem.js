import Item from '@/models/Item';

export default {
  data() {
    return {
      completed: false,
      body: '',
      selectedTags: [],
      assignedUsers: []
    };
  },
  methods: {
    async submit() {
      if (this.body.trim().length == 0) {
        return;
      }

      const item = await Item.add(this.body, this.completed);
      await item.assignSelectedTags(this.selectedTags);
      await item.assignSelectedUsers(this.assignedUsers);
      item.updateTagPositionsInBody();

      this.body = '';
      this.completed = false;
      this.selectedTags = [];
      this.assignedUsers = [];

      return true
    },
    onTagSelected(tagInfo) {
      this.selectedTags.push(tagInfo);
    },
    onAssignUser(user) {
      this.assignedUsers.push(user);
    },
  }
};
