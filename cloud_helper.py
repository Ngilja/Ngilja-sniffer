# cloud_helper.py
# Helper pour Cloud HTTP Injector

class CloudHelper:
    @staticmethod
    def formater_resultat(resultat):
        if not resultat.get('decoded'):
            return "❌ Échec du décodage"
        
        msg = "☁️ **RÉSULTAT CLOUD**\n\n"
        
        if resultat.get('serveurs'):
            msg += "**Serveurs :**\n"
            for s in resultat['serveurs'][:5]:
                msg += f"• `{s}`\n"
        
        return msg