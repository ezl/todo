import User from '@/models/User'
import store from '@/store'

const auth = () => {
    return {
        user: () => {
            const email = store.getters['auth/email']
            return User.query().where('email', email).first()
        },
        isLoggedIn: () => {
            return store.getters['auth/isLoggedIn']
        },
    }
}

export default auth