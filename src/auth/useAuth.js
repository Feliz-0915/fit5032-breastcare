import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBwd5C2hz-peH_GPqeT3AbdZOlmMyElmoo',
  authDomain: 'fit5032-breastcare.firebaseapp.com',
  projectId: 'fit5032-breastcare',
  storageBucket: 'fit5032-breastcare.firebasestorage.app',
  messagingSenderId: '353713546875',
  appId: '1:353713546875:web:68276e5d55b4700c6464de',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

const user = ref(null)
const loading = ref(true)

export function useAuth() {
  const router = useRouter()

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error(err)
    }
  }

  const registerWithEmail = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.error(err)
    }
  }

  const loginWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const logout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const ensureSeedAdmin = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      console.log('Admin user created:', email)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log('Admin already exists:', email)
      } else {
        throw err
      }
    }
  }

  onAuthStateChanged(auth, (u) => {
    user.value = u
    loading.value = false
  })

  return {
    user,
    loading,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout,
    ensureSeedAdmin,
  }
}
