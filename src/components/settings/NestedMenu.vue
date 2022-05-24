<template>
  <div :class="{ 'show-sub-menu': showingSubMenu }" class="menu-container">
    <div class="sub-menu-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['activeMenuId'],
  data() {
    return {
      showingSubMenu: false
    };
  },
  methods: {
    init() {
      const menus = this.$el.querySelectorAll('.sub-menu-container > [data-menu-id]');
      const menusContainer = this.$el;
      const subMenusContainer = this.$el.lastChild;

      if (!menus.length) {
        console.error('No menus found. Did you forgot to set data-menu-id attribute?');
        return;
      }

      this.defineMainMenu();

      for (let index = 0; index < menus.length; index++) {
        const menu = menus[index];

        menu.classList.add('menu');

        if (menu.classList.contains('main-menu')) {
          menusContainer.insertBefore(menu, subMenusContainer);
          menu.setAttribute('data-active-menu', true);
        } else {
          menu.classList.add('hidden');
          menu.setAttribute('data-active-menu', false);
        }
      }
    },
    defineMainMenu() {
      let menu = this.$el.querySelector(`[data-main-menu]`);

      // Pick the first menu as the default main menu if for some reason one was not explicitly set (by adding data-main-menu attribute)
      if (!menu) {
        menu = this.$el.querySelector('[data-menu-id]');
      }

      menu.classList.add('main-menu');
      menu.setAttribute('data-active-menu', true);
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    activeMenuId: {
      handler: function(newVal) {
        const targetMenu = this.$el.querySelector(`[data-menu-id="${newVal}"]`);
        const currentActiveMenu = this.$el.querySelector(`[data-active-menu="true"]`);

        if (!targetMenu) return;

        const switchingToMainMenu = targetMenu.classList.contains('main-menu');

        currentActiveMenu.setAttribute('data-active-menu', false);
        targetMenu.setAttribute('data-active-menu', true);

        // Hide previous active menu after sliding animation is finished, unless it’s the main menu
        if (!currentActiveMenu.classList.contains('main-menu')) setTimeout(() => currentActiveMenu.classList.add('hidden'), 400);

        if (!switchingToMainMenu) {
          targetMenu.classList.remove('hidden');
          this.showingSubMenu = true;
        } else {
          this.showingSubMenu = false;
        }
      }
    }
  }
};
</script>

<style>
.menu-container {
  display: flex;
  position: relative;
  transition: 0.4s transform ease-in-out !important;
}

.menu-container.show-sub-menu {
  transform: translateX(calc(-100%));
}

.menu:not(.menu-container) {
  height: 100%;
  padding: 15px;
}

.menu:not(.menu-container) .menu {
  padding: 0;
  background: rgb(97, 97, 97);
}

.main-menu {
  width: 100%;
}

.sub-menu-container {
  position: absolute;
  left: calc(100%);
  width: 100%;
  height: 100%;
}

@media only screen and (max-width: 480px) {
  .menu:not(.menu-container), .menu {
    padding: 15px 7px;
  }
}
</style>
