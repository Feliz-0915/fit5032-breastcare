const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })

admin.initializeApp()

exports.getClinicCount = functions.region('australia-southeast1').https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore()
      const clinicsRef = db.collection('clinics')
      const snapshot = await clinicsRef.get()

      if (snapshot.empty) {
        await clinicsRef.add({
          clinicName: 'Default Clinic',
          suburb: 'Melbourne',
          rating: 5.0,
          createdAt: new Date().toISOString(),
        })
        return res.json({ count: 1, message: 'New clinic added' })
      }

      res.json({ count: snapshot.size })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
})

exports.getAverageRating = functions.region('australia-southeast1').https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore()
      const clinicsRef = db.collection('clinics')
      const snapshot = await clinicsRef.get()

      if (snapshot.empty) {
        return res.json({ average: 0, message: 'No clinic data found' })
      }

      let total = 0
      let count = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.rating !== undefined && typeof data.rating === 'number') {
          total += data.rating
          count++
        }
      })

      const avg = count > 0 ? total / count : 0
      res.json({ average: avg.toFixed(2), count })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
})
