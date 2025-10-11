import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'))
const clinics = JSON.parse(readFileSync('./src/data/clinics.json', 'utf8'))

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

async function uploadClinics() {
  try {
    const batch = db.batch()
    const clinicsRef = db.collection('clinics')

    clinics.forEach((clinic) => {
      const docRef = clinicsRef.doc()
      batch.set(docRef, clinic)
    })

    await batch.commit()
    console.log(`Uploaded ${clinics.length} clinic records to Firestore`)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

uploadClinics()
