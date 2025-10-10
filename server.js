import express from 'express'
import cors from 'cors'
import multer from 'multer'
import sendgrid from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config()
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const app = express()
const upload = multer()

app.use(cors())
app.use(express.json())

app.post('/send-email', upload.single('attachment'), async (req, res) => {
  try {
    const { to, subject, message } = req.body
    const file = req.file

    const msg = {
      to,
      from: 'tutuhu181@gmail.com',
      subject,
      text: message,
      attachments: file
        ? [
            {
              content: file.buffer.toString('base64'),
              filename: file.originalname,
              type: file.mimetype,
              disposition: 'attachment',
            },
          ]
        : [],
    }

    await sendgrid.send(msg)
    res.status(200).send('Email sent successfully')
  } catch (error) {
    console.error('SendGrid Error:')
    console.error(error.response ? error.response.body : error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
