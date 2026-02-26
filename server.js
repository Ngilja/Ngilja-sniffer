// ============================================
// FICHIER: server.js (VERSION STABLE TERMUX)
// ============================================

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys')
const qrcode = require('qrcode')
const path = require('path')
const fs = require('fs')
const pino = require('pino')
require('dotenv').config()

const config = require('./config')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

let sock = null
let connected = false

app.use(express.static('public'))
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/api/status', (req, res) => {
    res.json({
        connected,
        botName: config.bot.name,
        number: sock?.user?.id?.split(':')[0] || null
    })
})

/* ============================================
   FONCTION PRINCIPALE BOT
============================================ */

async function startBot() {
    console.log('🚀 DÉMARRAGE DU BOT...')

    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['ELEXTERCORES FLEX', 'Chrome', '1.0.0'],
        markOnlineOnConnect: true,
        syncFullHistory: false
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        // QR CODE
        if (qr) {
            console.log('📲 Scan ce QR avec WhatsApp')

            const qrImage = await qrcode.toDataURL(qr)
            io.emit('qr', qrImage)

            qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
                if (!err) console.log(url)
            })
        }

        // CONNECTÉ
        if (connection === 'open') {
            connected = true
            console.log('✅ BOT CONNECTÉ !')
            console.log('📱 Numéro:', sock.user?.id?.split(':')[0])
        }

        // DÉCONNECTÉ
        if (connection === 'close') {
            connected = false

            const statusCode = lastDisconnect?.error?.output?.statusCode

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('🚪 Session supprimée. Supprime auth_info puis relance.')
                return
            }

            console.log('🔄 Reconnexion dans 5 secondes...')
            setTimeout(() => startBot(), 5000)
        }
    })

    sock.ev.on('creds.update', saveCreds)

    // ============================================
    // GESTION MESSAGES
    // ============================================

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        if (msg.key.fromMe) return

        let text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || ''

        const chatId = msg.key.remoteJid

        if (!text.startsWith(config.bot.prefix)) return

        const command = text.slice(config.bot.prefix.length).toLowerCase()

        if (command === 'ping') {
            await sock.sendMessage(chatId, { text: '🏓 Pong!' })
        }

        if (command === 'alive') {
            await sock.sendMessage(chatId, { 
                text: `🤖 ${config.bot.name} est actif !`
            })
        }
    })
}

/* ============================================
   SERVEUR WEB
============================================ */

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log('🌐 Serveur lancé sur http://localhost:' + PORT)
})

startBot()

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

module.exports = { app, server, io }