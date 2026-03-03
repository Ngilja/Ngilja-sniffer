# cloud_decrypt.py
# Décodeur pour CryEep2f et Cloud HTTP Injector
# Bot: ÑĞĮĻJÃ_ÑĪJ Linux

import base64
import json
import re
import zlib

class DecodeurCloud:
    @staticmethod
    def decoder_cryeep2f(contenu):
        try:
            resultat = {
                'type': 'CryEep2f Cloud',
                'decoded': False,
                'config': {},
                'serveurs': []
            }
            
            contenu = contenu.strip()
            
            # Enlever les préfixes
            for prefix in ['cryeep2f://', 'cloud://']:
                if contenu.startswith(prefix):
                    contenu = contenu.replace(prefix, '', 1)
            
            # Base64
            try:
                decoded = base64.b64decode(contenu).decode('utf-8')
                resultat['config']['base64'] = decoded[:200]
                resultat['decoded'] = True
            except:
                pass
            
            # Extraire les IPs
            ips = re.findall(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', contenu)
            if ips:
                resultat['serveurs'] = list(set(ips))
            
            return resultat
        except:
            return {'decoded': False}