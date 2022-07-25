export default {
    computed:{
        isTablet(){
            return screen.width >= 640 && screen.width <= 1024
        },
        isMobile(){
            return screen.width < 640
        },
    }
}