<template>
  <div class="mt-8">
    <div v-if="isAwaitingVerification || isLoggedIn">
      <div class="flex justify-between items-center mt-8">
        <span>{{ userEmail }} <span v-if="isAwaitingVerification">(pending)</span></span>
        <button @click="signOutOrAbortVerification" class="ml-2 hover:text-primary">
          <close-circle-outline-icon :size="20" />
        </button>
      </div>
      <span v-if="isAwaitingVerification" class="descriptor">Please click verification link in your email to confirm your identity</span>
    </div>
    <div v-else>
      <label>Email</label>
      <div class="mt-1">
        <div v-if="!isSendingEmail" class="relative">
          <input
            type="text"
            v-model="email"
            @keyup.enter="login"
            :class="{ shrink: isValidEmail }"
            class=" w-full text-dark-jungle-green dark:text-gray-200 focus:outline-none caret-primary py-1 px-2"
          />
          <button @click="login" :class="{ 'fade-in': isValidEmail }" class="submit-btn hover:text-primary">
            <content-save-outline-icon :size="23" />
          </button>
        </div>
        <div v-else class="flex justify-between items-center">
          <span>{{ email }}</span>
          <Spinner class="ml-2 w-5 h-5" />
        </div>

        <span class="descriptor">Optional: Sync your to do list on multiple devices</span>
      </div>
    </div>
  </div>
</template>

<script>
import CloseCircleOutlineIcon from 'vue-material-design-icons/CloseCircleOutline';
import ContentSaveOutlineIcon from 'vue-material-design-icons/ContentSaveOutline';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import Spinner from '@/assets/images/icons/spinner.svg';
import { mapActions, mapGetters } from 'vuex';
import axios from 'axios'

export default {
  components: {
    CloseCircleOutlineIcon,
    ContentSaveOutlineIcon,
    Spinner
  },
  data() {
    return {
      email: ''
    };
  },
  computed: {
    ...mapGetters({
      isSendingEmail: 'auth/isSendingEmail',
      isLoggedIn: 'auth/isLoggedIn',
      userEmail: 'auth/email',
      isAwaitingVerification: 'auth/isAwaitingVerification',
      clientTrackingToken: 'auth/clientTrackingToken',
    }),
    isValidEmail() {
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        this.email
      );
    }
  },
  methods: {
    ...mapActions({
      sendVerificationEmail: 'auth/sendVerificationEmail',
      logout: 'auth/logout'
    }),
    async login() {
      if(!this.isValidEmail){
        this.$notify({title: 'Please enter a valid email address.'})  
        return
      }

      try {
        await this.sendVerificationEmail(this.email);      
        this.$notify({title: 'Please click the verification link in your inbox.'})  
      } catch (error) {
        this.$notify({title: 'Could not send the verification email, please try again later.'})  
      }
    },
    async signOutOrAbortVerification() {
      if (this.isAwaitingVerification) {
        try {
          axios.get(`auth/cancel-verification/?client-tracking-token=${this.clientTrackingToken}`);
        } catch (error) {
          console.error(error);
        }
      }

      this.logout();
      this.email = '';
    }
  }
};
</script>

<style scoped>
input {
  width: 100%;
  transition: 0.4s width !important;
}

input.shrink {
  width: calc(100% - 30px);
}

.submit-btn {
  position: absolute;
  top: 2px;
  right: 0;
  opacity: 0;
  transition: 0.6s opacity;
}

.submit-btn.fade-in {
  opacity: 100%;
}

.descriptor {
  color: #bbbbbb;
  font-size: 12px;
  margin-top: 3px;
  display: block;
}

.dark .descriptor {
  color: 868686;
}
</style>
