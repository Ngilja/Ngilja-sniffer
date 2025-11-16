from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText

# ----------------- ⚠️ 1. CONFIGURATION REQUISE ⚠️ -----------------
# 1. Votre adresse Gmail (l'expéditeur)
GMAIL_USER = "VOTRE_ADRESSE_GMAIL@gmail.com" 
# 2. Le Mot de passe d'application Google (PAS votre mot de passe habituel)
GMAIL_PASSWORD = "VOTRE_MOT_DE_PASSE_D_APPLICATION" 
# 3. L'adresse email où vous voulez recevoir le message (le destinataire)
RECIPIENT_EMAIL = "VOTRE_ADRESSE_PERSONNELLE@example.com"
# -----------------------------------------------------------------

app = Flask(__name__)

# Route pour afficher la page HTML (index.html)
@app.route('/')
def index():
    # Lit le contenu du fichier index.html
    return open("index.html", "r", encoding="utf-8").read()

# Route qui reçoit le POST du JavaScript et envoie l'email
@app.route('/send_message', methods=['POST'])
def send_message_to_me():
    try:
        data = request.get_json()
        message_content = data.get('message', '').strip()
        
        if not message_content:
            return jsonify({"status": "error", "message": "Le message est vide."}), 400

        # Préparer l'email
        subject = "🎉 Nouveau Message Extraordinaire de Votre Site !"
        body = f"Quelqu'un vous a envoyé un message :\n\n---\n{message_content}\n---"
        
        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = GMAIL_USER
        msg['To'] = RECIPIENT_EMAIL

        # Envoyer l'email via Gmail (SMTP)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(GMAIL_USER, [RECIPIENT_EMAIL], msg.as_string())

        return jsonify({"status": "success", "message": "Message envoyé avec succès."})

    except Exception as e:
        print(f"Erreur d'envoi d'email: {e}")
        return jsonify({"status": "error", "message": f"Échec de l'envoi de l'email. Vérifiez votre configuration Gmail : {e}"}), 500

if __name__ == '__main__':
    # Lance le serveur sur http://127.0.0.1:5000/
    app.run(debug=True, port=5000) 