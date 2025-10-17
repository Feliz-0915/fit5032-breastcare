import express from 'express'
import cors from 'cors'
import multer from 'multer'
import sendgrid from '@sendgrid/mail'
import dotenv from 'dotenv'
import admin from 'firebase-admin'
import fs from 'fs'

dotenv.config()
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()
const app = express()
const upload = multer()

app.use(cors())
app.use(express.json())

app.post('/send-email', upload.single('attachment'), async (req, res) => {
  try {
    const { subject, message } = req.body
    const file = req.file

    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Missing subject or message' })
    }

    const snapshot = await db.collection('users').get()
    if (snapshot.empty) return res.status(404).send('No users found')

    const recipients = snapshot.docs.map((doc) => doc.data().email).filter((e) => !!e)

    const attachments = file
      ? [
          {
            content: file.buffer.toString('base64'),
            filename: file.originalname,
            type: file.mimetype,
            disposition: 'attachment',
          },
        ]
      : []

    for (const email of recipients) {
      await sendgrid.send({
        to: email,
        from: 'tutuhu181@gmail.com',
        subject,
        text: message,
        attachments,
      })
    }

    res.status(200).send(`Emails sent to ${recipients.length} users`)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(5001, () => console.log('Server running on http://localhost:5001'))
