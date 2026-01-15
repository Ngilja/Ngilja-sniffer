# 🤖 ÑĞĮĻJÃ_ÑĪJ - Bot WhatsApp Multi-Device

![Banner](https://img.shields.io/badge/ÑĞĮĻJÃ_ÑĪJ-WhatsApp_Bot-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![Node](https://img.shields.io/badge/Node.js-≥18.0.0-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

Bot WhatsApp professionnel avec connexion par pairing code (8 caractères), fonctionnant sur Termux, Vercel, Railway, etc.

## ✨ Fonctionnalités

### 📱 WhatsApp
- ✅ Connexion par QR code **OU** pairing code (8 caractères)
- ✅ Session persistante (pas besoin de re-scanner)
- ✅ Menu interactif en français
- ✅ Anti-delete messages
- ✅ Anti view-once
- ✅ Anti-appels automatique
- ✅ Mode public/privé
- ✅ Commandes owner
- ✅ Téléchargements (YouTube, TikTok, Instagram)
- ✅ Intelligence Artificielle (optionnel)

### 🤖 Telegram (optionnel)
- ✅ Bot Telegram intégré
- ✅ Commande `/pair` pour générer code WhatsApp
- ✅ Interface de gestion

## 🚀 Déploiement Rapide

### Sur Termux (Android)
```bash
pkg update && pkg upgrade
pkg install nodejs git

git clone https://github.com/TON_USERNAME/ngilja-nij.git
cd ngilja-nij

npm install

# Modifie la config
nano config/settings.json
# Change ownerNumber par ton numéro

node index.js