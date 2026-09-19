import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import { firebaseAuth } from '@/shared/lib/firebase/firebase'

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(firebaseAuth, provider)

  return result.user
}

/** El backend verifica un ID token de Firebase (no un ID token de Google puro) — ver
 * `FirebaseTokenVerifier` en el backend y `POST /v1/intranet/auth/google`. */
export async function signInWithGoogleAndGetIdToken(): Promise<string> {
  const user = await signInWithGoogle()
  return user.getIdToken()
}