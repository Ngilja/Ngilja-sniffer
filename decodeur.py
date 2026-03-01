# decodeur.py
# Bot: ÑĞĮĻJÃ_ÑĪJ Linux
import base64
import json
import urllib.parse

class DecodeurLiens:
    @staticmethod
    def decoder_vmess(lien):
        try:
            contenu = lien.replace('vmess://', '')
            contenu += '=' * (4 - len(contenu) % 4) if len(contenu) % 4 != 0 else ''
            decode = base64.b64decode(contenu).decode('utf-8')
            
            if decode.startswith('{'):
                config = json.loads(decode)
                return {
                    'succes': True,
                    'type': 'VMess',
                    'config': config,
                    'message': '✅ Décodage réussi'
                }
            return {
                'succes': True, 
                'type': 'VMess (format brut)', 
                'config': {'raw': decode}
            }
        except Exception as e:
            return {'succes': False, 'erreur': str(e)}
    
    @staticmethod
    def decoder_vless(lien):
        try:
            parsed = urllib.parse.urlparse(lien)
            return {
                'succes': True,
                'type': 'VLESS',
                'config': {
                    'uuid': parsed.username or '',
                    'host': parsed.hostname or '',
                    'port': parsed.port or 443
                }
            }
        except Exception as e:
            return {'succes': False, 'erreur': str(e)}
    
    @staticmethod
    def decoder_trojan(lien):
        try:
            parsed = urllib.parse.urlparse(lien)
            return {
                'succes': True,
                'type': 'Trojan',
                'config': {
                    'password': parsed.username or '',
                    'host': parsed.hostname or '',
                    'port': parsed.port or 443
                }
            }
        except Exception as e:
            return {'succes': False, 'erreur': str(e)}
    
    @staticmethod
    def detecter_et_decoder(lien):
        if lien.startswith('vmess://'):
            return DecodeurLiens.decoder_vmess(lien)
        elif lien.startswith('vless://'):
            return DecodeurLiens.decoder_vless(lien)
        elif lien.startswith('trojan://'):
            return DecodeurLiens.decoder_trojan(lien)
        elif lien.startswith(('nm-', 'ar-', 'pb-')):
            for prefix in ['nm-', 'ar-', 'pb-']:
                if lien.startswith(prefix):
                    vrai_lien = lien.replace(prefix, '')
                    return DecodeurLiens.detecter_et_decoder(vrai_lien)
        else:
            return {'succes': False, 'erreur': 'Type de lien non supporté'}