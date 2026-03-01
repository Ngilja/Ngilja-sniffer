# bot.py
# Bot Telegram: ÑĞĮĻJÃ_ÑĪJ Linux
# Version 1.0

import telebot
import os
import tempfile
import shutil
import json
import threading
import time
from datetime import datetime
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

from config import TOKEN, TEMP_DIR, FORMATS_SUPPORTES, TEXT_PROTOCOLS, CONVERSIONS
from decodeur import DecodeurLiens
from convertisseur import ConvertisseurFormats

# Initialisation du bot
bot = telebot.TeleBot(TOKEN)
user_data = {}

# === COMMANDES DE BASE ===

@bot.message_handler(commands=['start', 'aide', 'help'])
def command_start(message):
    """Message de bienvenue"""
    msg = """
╔══════════════════════════════╗
║  🤖 **ÑĞĮĻJÃ_ÑĪJ Linux**      ║
╚══════════════════════════════╝

**📌 Commandes disponibles :**
• /start - Afficher ce message
• /formats - Voir les formats supportés
• /decode [lien] - Décoder un lien VPN
• /stats - Statistiques du bot
• /aide - Afficher l'aide

**💡 Comment utiliser :**
1️⃣ Envoie-moi un fichier de configuration
2️⃣ Ou colle un lien (vmess://, vless://, etc.)
3️⃣ Je l'analyserai et le convertirai

**✨ Fonctionnalités :**
✅ {nb_formats}+ formats de fichiers
✅ {nb_protos}+ types de liens
✅ Conversion entre formats
✅ Décodage de liens
✅ Analyse de configuration

**👨‍💻 Prêt à t'aider !**
    """.format(
        nb_formats=len(FORMATS_SUPPORTES),
        nb_protos=sum(len(p) for p in TEXT_PROTOCOLS.values())
    )
    bot.reply_to(message, msg, parse_mode='Markdown')

@bot.message_handler(commands=['formats'])
def command_formats(message):
    """Liste tous les formats supportés"""
    msg = "📋 **FORMATS SUPPORTÉS PAR ÑĞĮĻJÃ_ÑĪJ**\n\n"
    
    categories = {
        "📱 INJECTEURS": ['.fdx', '.agn', '.jvc', '.aip'],
        "🔒 VPNS": ['.nxp', '.purple', '.cln', '.ziv', '.nm'],
        "🌐 TUNNELS": ['.sks', '.stk', '.tnl', '.ssh', '.hat'],
    }
    
    for cat, formats in categories.items():
        msg += f"**{cat}**\n"
        for fmt in formats:
            if fmt in FORMATS_SUPPORTES:
                msg += f"• `{fmt}` - {FORMATS_SUPPORTES[fmt]}\n"
        msg += "\n"
    
    msg += f"**Total : {len(FORMATS_SUPPORTES)} formats supportés**"
    bot.reply_to(message, msg, parse_mode='Markdown')

@bot.message_handler(commands=['stats'])
def command_stats(message):
    """Affiche les statistiques du bot"""
    msg = """
📊 **STATISTIQUES ÑĞĮĻJÃ_ÑĪJ**

**📂 Fichiers :**
• Formats supportés: {nb_formats}
• Conversions disponibles: {nb_conv}

**🔤 Liens :**
• Protocoles texte: {nb_protos}
• Types de liens: {nb_types}

**⚡ Performances :**
• Temps de réponse: < 1s
• Uptime: 24/7
• Stockage: Mémoire temporaire

**🚀 Bot opérationnel !**
    """.format(
        nb_formats=len(FORMATS_SUPPORTES),
        nb_conv=sum(len(v) for v in CONVERSIONS.values()),
        nb_protos=sum(len(p) for p in TEXT_PROTOCOLS.values()),
        nb_types=len(TEXT_PROTOCOLS)
    )
    bot.reply_to(message, msg, parse_mode='Markdown')

@bot.message_handler(commands=['decode'])
def command_decode(message):
    """Décode un lien VPN"""
    lien = message.text.replace('/decode', '').strip()
    
    if not lien:
        msg = """
❌ **Usage incorrect**

Format: `/decode [lien]`

**Exemples :**
• `/decode vmess://...`
• `/decode vless://...`
• `/decode trojan://...`

**Liens supportés :**
• vmess://, vless://, trojan://
• nm-vmess://, ar-vless://
        """
        bot.reply_to(message, msg, parse_mode='Markdown')
        return
    
    bot.send_chat_action(message.chat.id, 'typing')
    resultat = DecodeurLiens.detecter_et_decoder(lien)
    
    if resultat.get('succes', False):
        msg = f"✅ **LIEN DÉCODÉ AVEC SUCCÈS**\n\n"
        msg += f"**Type :** {resultat['type']}\n\n"
        msg += "**Configuration :**\n"
        
        config = resultat['config']
        if isinstance(config, dict):
            for key, value in config.items():
                if value:
                    msg += f"• **{key} :** `{value}`\n"
        
        # Bouton de sauvegarde
        markup = InlineKeyboardMarkup()
        markup.add(InlineKeyboardButton(
            "📥 Sauvegarder en JSON", 
            callback_data=f"save_{message.chat.id}"
        ))
        
        bot.reply_to(message, msg, reply_markup=markup, parse_mode='Markdown')
        
        # Sauvegarde temporaire
        user_data[message.chat.id] = {
            'type': 'decode',
            'data': resultat,
            'time': datetime.now()
        }
    else:
        bot.reply_to(message, f"❌ Erreur: {resultat.get('erreur', 'Inconnue')}")

# === GESTION DES FICHIERS ===

@bot.message_handler(content_types=['document'])
def handle_document(message):
    """Gère la réception de fichiers"""
    try:
        doc = message.document
        nom_fichier = doc.file_name
        extension = os.path.splitext(nom_fichier)[1].lower()
        
        # Vérifier le format
        if extension not in FORMATS_SUPPORTES:
            msg = f"""
❌ **Format non supporté**

**Format reçu :** `{extension}`
**Nom :** {nom_fichier}

📋 Utilise `/formats` pour voir la liste complète.
            """
            bot.reply_to(message, msg, parse_mode='Markdown')
            return
        
        # Télécharger le fichier
        file_info = bot.get_file(doc.file_id)
        downloaded = bot.download_file(file_info.file_path)
        
        # Sauvegarder temporairement
        temp_dir = tempfile.mkdtemp(dir=TEMP_DIR)
        temp_path = os.path.join(temp_dir, nom_fichier)
        
        with open(temp_path, 'wb') as f:
            f.write(downloaded)
        
        # Analyser le fichier
        convertisseur = ConvertisseurFormats()
        if convertisseur.lire_fichier(temp_path):
            infos = convertisseur.config_data['extracted']
            
            msg = f"""
✅ **FICHIER ANALYSÉ**

📁 **Nom :** `{nom_fichier}`
🔍 **Type :** {FORMATS_SUPPORTES[extension]}
📦 **Taille :** {doc.file_size // 1024} KB

**📊 Informations :**
• **Serveur :** {infos.get('serveur', 'Non détecté')}
• **Port :** {infos.get('port', 'Non détecté')}
• **Utilisateur :** {infos.get('username', 'Non détecté')}
            """
            
            # Créer les boutons de conversion
            markup = InlineKeyboardMarkup(row_width=2)
            boutons = []
            
            if extension in CONVERSIONS:
                for cible in CONVERSIONS[extension][:4]:  # Max 4 boutons
                    boutons.append(InlineKeyboardButton(
                        f"🔄 {cible}", 
                        callback_data=f"conv_{extension}_{cible}_{message.chat.id}"
                    ))
            
            # Ajouter boutons d'analyse
            boutons.extend([
                InlineKeyboardButton("📋 Détails", callback_data=f"det_{message.chat.id}"),
                InlineKeyboardButton("🔍 Analyser", callback_data=f"ana_{message.chat.id}")
            ])
            
            # Grouper les boutons
            for i in range(0, len(boutons), 2):
                if i+1 < len(boutons):
                    markup.add(boutons[i], boutons[i+1])
                else:
                    markup.add(boutons[i])
            
            bot.reply_to(message, msg, reply_markup=markup, parse_mode='Markdown')
            
            # Sauvegarder pour référence
            user_data[message.chat.id] = {
                'type': 'file',
                'path': temp_path,
                'temp_dir': temp_dir,
                'name': nom_fichier,
                'format': extension,
                'convertisseur': convertisseur,
                'time': datetime.now()
            }
        else:
            bot.reply_to(message, "❌ Impossible de lire le fichier")
            
    except Exception as e:
        bot.reply_to(message, f"❌ Erreur: {str(e)}")

# === GESTION DES BOUTONS ===

@bot.callback_query_handler(func=lambda call: True)
def handle_callback(call):
    """Gère les clics sur les boutons"""
    try:
        data = call.data.split('_')
        
        # Conversion de fichier
        if data[0] == 'conv' and len(data) >= 4:
            source = data[1]
            cible = data[2]
            user_id = int(data[3])
            
            if user_id in user_data and user_data[user_id]['type'] == 'file':
                bot.answer_callback_query(call.id, "⏳ Conversion en cours...")
                
                conv = user_data[user_id]['convertisseur']
                resultat, type_res = conv.convertir_vers(cible)
                
                if type_res == 'fichier':
                    # Envoyer comme fichier
                    nom_sortie = f"ÑĞĮĻJÃ_ÑĪJ_converti_{user_id}{cible}"
                    chemin = conv.sauvegarder(resultat, nom_sortie)
                    
                    with open(chemin, 'rb') as f:
                        bot.send_document(
                            call.message.chat.id, 
                            f, 
                            caption=f"✅ Conversion {source} → {cible} réussie !"
                        )
                    
                    os.remove(chemin)
                    bot.answer_callback_query(call.id, "✅ Conversion terminée !")
                    
                elif type_res == 'lien':
                    # Envoyer comme lien
                    msg = f"""
🔗 **LIEN GÉNÉRÉ PAR ÑĞĮĻJÃ_ÑĪJ**

`{resultat}`

✅ Conversion {source} → lien VMess réussie !
                    """
                    bot.send_message(call.message.chat.id, msg, parse_mode='Markdown')
                    bot.answer_callback_query(call.id, "✅ Lien généré !")
        
        # Détails du fichier
        elif data[0] == 'det':
            user_id = int(data[1])
            if user_id in user_data and user_data[user_id]['type'] == 'file':
                infos = user_data[user_id]['convertisseur'].config_data['extracted']
                
                msg = "📋 **DÉTAILS COMPLETS**\n\n"
                for key, value in infos.items():
                    if value:
                        msg += f"**{key.capitalize()} :** `{value}`\n"
                    else:
                        msg += f"**{key.capitalize()} :** Non détecté\n"
                
                bot.send_message(call.message.chat.id, msg, parse_mode='Markdown')
                bot.answer_callback_query(call.id, "✅ Détails envoyés")
        
        # Analyse approfondie
        elif data[0] == 'ana':
            user_id = int(data[1])
            if user_id in user_data and user_data[user_id]['type'] == 'file':
                raw = user_data[user_id]['convertisseur'].config_data['raw']
                
                # Statistiques
                lignes = len(raw.split('\n'))
                mots = len(raw.split())
                caracteres = len(raw)
                
                msg = f"""
🔍 **ANALYSE APPROFONDIE**

📊 **Statistiques :**
• Lignes : {lignes}
• Mots : {mots}
• Caractères : {caracteres}

🔐 **Protocoles détectés :**
                """
                
                # Détection des protocoles
                protocoles = []
                if 'ssh' in raw.lower():
                    protocoles.append("• SSH")
                if 'http' in raw.lower():
                    protocoles.append("• HTTP")
                if 'socks' in raw.lower():
                    protocoles.append("• SOCKS")
                if 'tls' in raw.lower():
                    protocoles.append("• TLS/SSL")
                if 'vmess' in raw.lower():
                    protocoles.append("• VMess")
                
                if protocoles:
                    msg += '\n' + '\n'.join(protocoles)
                else:
                    msg += "\n• Aucun protocole standard détecté"
                
                bot.send_message(call.message.chat.id, msg, parse_mode='Markdown')
                bot.answer_callback_query(call.id, "✅ Analyse terminée")
        
        # Sauvegarde du lien décodé
        elif data[0] == 'save':
            user_id = int(data[1])
            if user_id in user_data and user_data[user_id]['type'] == 'decode':
                resultat = user_data[user_id]['data']
                
                nom_fichier = f"ÑĞĮĻJÃ_ÑĪJ_config_{user_id}.json"
                with open(nom_fichier, 'w') as f:
                    json.dump(resultat, f, indent=2)
                
                with open(nom_fichier, 'rb') as f:
                    bot.send_document(
                        call.message.chat.id, 
                        f,
                        caption="✅ Configuration sauvegardée"
                    )
                
                os.remove(nom_fichier)
                bot.answer_callback_query(call.id, "✅ Sauvegarde effectuée")
                
    except Exception as e:
        bot.answer_callback_query(call.id, f"❌ Erreur: {str(e)[:50]}")

# === GESTION DES MESSAGES TEXTE ===

@bot.message_handler(func=lambda message: True)
def handle_text(message):
    """Gère les messages texte (liens)"""
    texte = message.text.strip()
    
    # Vérifier si c'est un lien supporté
    for protos in TEXT_PROTOCOLS.values():
        for proto in protos:
            if texte.startswith(proto):
                # Rediriger vers le décodeur
                message.text = f"/decode {texte}"
                command_decode(message)
                return
    
    # Message par défaut
    bot.reply_to(
        message, 
        "❓ Envoie un fichier ou un lien. Tape /aide pour plus d'infos."
    )

# === NETTOYAGE DES FICHIERS TEMPORAIRES ===

def nettoyer_fichiers():
    """Nettoie les fichiers temporaires toutes les heures"""
    while True:
        time.sleep(3600)  # 1 heure
        maintenant = datetime.now()
        a_supprimer = []
        
        for user_id, data in user_data.items():
            if 'time' in data:
                age = (maintenant - data['time']).total_seconds()
                if age > 7200:  # 2 heures
                    if 'path' in data and os.path.exists(data['path']):
                        os.remove(data['path'])
                    if 'temp_dir' in data and os.path.exists(data['temp_dir']):
                        shutil.rmtree(data['temp_dir'])
                    a_supprimer.append(user_id)
        
        for user_id in a_supprimer:
            del user_data[user_id]

# Démarrer le thread de nettoyage
threading.Thread(target=nettoyer_fichiers, daemon=True).start()

# === DÉMARRAGE DU BOT ===
if __name__ == "__main__":
    print("=" * 50)
    print("🤖 ÑĞĮĻJÃ_ÑĪJ Linux Bot")
    print("=" * 50)
    print(f"✅ Formats fichiers : {len(FORMATS_SUPPORTES)}")
    print(f"✅ Protocoles texte : {sum(len(p) for p in TEXT_PROTOCOLS.values())}")
    print(f"✅ Conversions : {sum(len(v) for v in CONVERSIONS.values())}")
    print("=" * 50)
    print("🚀 Bot démarré ! En attente de messages...")
    print("=" * 50)
    
    try:
        bot.infinity_polling()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print("🔄 Redémarrage dans 5 secondes...")
        time.sleep(5)
        os.system("python bot.py")