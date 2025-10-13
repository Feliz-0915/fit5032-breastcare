const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })
const sgMail = require('@sendgrid/mail')

admin.initializeApp()

sgMail.setApiKey(functions.config().sendgrid.apikey)

exports.getClinicCount = functions.region('australia-southeast1').https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore()
      const clinicsRef = db.collection('clinics')
      const snapshot = await clinicsRef.get()
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

exports.sendWelcomeEmail = functions
  .region('australia-southeast1')
  .auth.user()
  .onCreate(async (user) => {
    const msg = {
      to: user.email,
      from: 'tutuhu181@gmail.com',
      name: 'BreastCare Support',
      subject: 'Welcome to BreastCare!',
      text: `Hi ${user.displayName || 'there'}, welcome to BreastCare!`,
      html: `
        <h2 style="color:#E91E63;">Welcome to <b>BreastCare</b>!</h2>
        <p>Hi ${user.displayName || 'there'},</p>
        <p>Thank you for joining us. We're excited to have you onboard!</p>
        <p style="color:#555;">— The BreastCare Team</p>
      `,
    }

    try {
      await sgMail.send(msg)
      console.log('Welcome email sent to:', user.email)
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }
  })
