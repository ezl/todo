<template>
  <div class="h-screen w-full flex flex-col justify-center items-center">
    <div v-if="error == null || loading" class="flex flex-col items-center">
      <Spinner class="w-10 h-10" />
      <p class="mt-4 text-secondary">Logging you in</p>
    </div>
    <div v-else class="flex flex-col items-center">
      <alert-circle-outline-icon :size="30" class="text-primary" />
      <p class="mt-4 text-secondary">{{ error }}</p>
      <router-link to="/" class="px-2 py-1 text-sm mt-10 hover:text-primary">Go to home</router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Spinner from '@/assets/images/icons/spinner.svg';
import AlertCircleOutlineIcon from 'vue-material-design-icons/AlertCircleOutline';
import { invalid } from 'moment';
import { mapActions, mapGetters } from 'vuex';

export default {
  components: {
    Spinner,
    AlertCircleOutlineIcon
  },
  data() {
    return {
      loading: true,
      error: null
    };
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      email: 'auth/email'
    })
  },
  methods: {
    ...mapActions({
      forceLogin: 'auth/forceLogin'
    })
  },
  async mounted() {
    this.loading = true;

    try {
      const res = await axios.post('/magic-link', { token: this.$route.params.token });

      const { email, access_token } = res.data;

      if (this.isLoggedIn && this.email!= email) {
        this.loading = false;
        this.error = 'Switch account'; // TODO
        return;
      }

      await this.forceLogin({
        email,
        token: access_token
      });

      this.$router.push({ name: 'home' });
    } catch (error) {
      console.error(error);

      const statusCode = error.response.status;

      if (statusCode == 404) {
        this.error = 'Ops! Looks like you have followed a broken link.';
        console.log('Invalid link');
      }

      if (statusCode == 401) {
        this.error = 'Looks like this link has expired.';
        console.log('Expired link');
      }

      if (statusCode != 404 && statusCode != 401) {
        this.error = 'Ops! Something went wrong, please try again.';
      }
    }

    this.loading = false;
  }
};
</script>
