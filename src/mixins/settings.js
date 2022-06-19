import Setting from '@/models/Setting';
import { setTheme } from '@/helpers/dom';
import { setNewSettingValues, onSettingsUpdated } from '@/helpers/settings';

export default {
  data() {
    return {
      settingValues: {}
    };
  },
  computed: {
    settings() {
      return  Setting.retrieve()
    },
  },
  methods: {
    updateSettings() {
      setNewSettingValues(this.settingValues)
      setTheme(this.settingValues.theme);
    }
  },
  created() {
    this.settingValues = this.settings.$toJson();
    onSettingsUpdated((newValues) => this.settingValues = newValues)
  }
};