<template>
  <div class="text-white py-8 px-32 text-base">
    <nav class="flex justify-between items-center">
      <ul class="flex ">
        <li class="text-lg text-gray-400">Inbox</li>
        <li class="separator"></li>
        <li class="text-lg cursor-pointer">Tasks</li>
      </ul>
      <ul>
        <li class="p-2 rounded-md bg-tertiary cursor-pointer text-gray-400">
          <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              opacity="0.6"
              d="M16.7879 1.86434L19.8943 5.97933C20.3364 6.56486 21.0097 6.92744 21.734 6.99588L27.0346 7.49676C28.5789 7.64269 29.3817 9.13186 28.8115 10.3313L26.6173 14.9472C26.2998 15.6152 26.2998 16.3848 26.6173 17.0528L28.8115 21.6687C29.3817 22.8681 28.579 24.3573 27.0346 24.5032L21.734 25.0041C21.0097 25.0726 20.3364 25.4351 19.8943 26.0207L16.7879 30.1357C15.9179 31.2881 14.0821 31.2881 13.2121 30.1357L10.1057 26.0207C9.66364 25.4351 8.99027 25.0726 8.26602 25.0041L2.96536 24.5032C1.42105 24.3573 0.618289 22.8681 1.18846 21.6687L3.38265 17.0528C3.70019 16.3848 3.70019 15.6152 3.38265 14.9472L1.18846 10.3313C0.618289 9.13185 1.42105 7.64269 2.96537 7.49676L8.26602 6.99588C8.99027 6.92744 9.66364 6.56486 10.1057 5.97933L13.2121 1.86433C14.0821 0.711888 15.9179 0.711888 16.7879 1.86434Z"
              stroke="white"
              stroke-width="2"
            />
            <path
              opacity="0.6"
              d="M19.456 16.0003C19.456 18.3725 17.4829 20.3337 15.0014 20.3337C12.5199 20.3337 10.5469 18.3725 10.5469 16.0003C10.5469 13.6282 12.5199 11.667 15.0014 11.667C17.4829 11.667 19.456 13.6282 19.456 16.0003Z"
              stroke="white"
              stroke-width="2"
            />
          </svg>
        </li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script>
import CogOutlineIcon from 'vue-material-design-icons/CogOutline';
export default {
  components: {
    CogOutlineIcon
  }
};
</script>

<style scoped>
.separator {
  width: 1px;
  height: 25px;
  background: rgb(224, 224, 224);
  margin: 0 15px;
}
</style>
