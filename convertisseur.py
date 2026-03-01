# convertisseur.py
# Bot: ÑĞĮĻJÃ_ÑĪJ Linux
import os
import json
import base64
import re

class ConvertisseurFormats:
    def __init__(self):
        self.config_data = {}
        self.format_source = None
    
    def lire_fichier(self, chemin):
        try:
            with open(chemin, 'r', encoding='utf-8', errors='ignore') as f:
                contenu = f.read()
            
            self.format_source = os.path.splitext(chemin)[1].lower()
            self.config_data = {
                'raw': contenu,
                'extracted': self._extraire_infos(contenu)
            }
            return True
        except Exception as e:
            print(f"Erreur lecture: {e}")
            return False
    
    def _extraire_infos(self, contenu):
        infos = {
            'serveur': None,
            'port': None,
            'username': None,
            'password': None,
            'payload': None,
            'protocole': None
        }
        
        # Recherche d'adresse IP
        ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        ips = re.findall(ip_pattern, contenu)
        if ips:
            infos['serveur'] = ips[0]
        
        # Recherche de nom d'hôte
        if not infos['serveur']:
            host_pattern = r'(?:server|host|addr?)[=: ]+([^\s]+)'
            hosts = re.findall(host_pattern, contenu, re.IGNORECASE)
            if hosts:
                infos['serveur'] = hosts[0]
        
        # Recherche de port
        port_patterns = [
            r'port[=: ]+(\d+)',
            r':(\d{2,5})(?:\s|$)',
            r'#(\d{2,5})'
        ]
        for pattern in port_patterns:
            ports = re.findall(pattern, contenu, re.IGNORECASE)
            if ports:
                infos['port'] = ports[0]
                break
        
        # Recherche d'utilisateur
        user_patterns = [
            r'user(?:name)?[=: ]+([^\s]+)',
            r'([^\s]+)@'
        ]
        for pattern in user_patterns:
            users = re.findall(pattern, contenu, re.IGNORECASE)
            if users:
                infos['username'] = users[0]
                break
        
        # Recherche de mot de passe
        pass_patterns = [
            r'pass(?:word)?[=: ]+([^\s]+)',
            r':([^@]+)@'
        ]
        for pattern in pass_patterns:
            passes = re.findall(pattern, contenu, re.IGNORECASE)
            if passes:
                infos['password'] = passes[0]
                break
        
        return infos
    
    def convertir_vers(self, format_cible):
        if not self.config_data:
            return None, "Aucune configuration chargée"
        
        infos = self.config_data['extracted']
        
        conversions = {
            '.fdx': self._vers_fdx,
            '.nxp': self._vers_nxp,
            '.agn': self._vers_agn,
            '.sks': self._vers_sks,
            '.ssh': self._vers_ssh,
            '.nm': self._vers_nm,
            'vmess://': self._vers_lien_vmess
        }
        
        if format_cible in conversions:
            resultat = conversions[format_cible](infos)
            if format_cible == 'vmess://':
                return resultat, "lien"
            return resultat, "fichier"
        else:
            return self.config_data['raw'], "fichier"
    
    def _vers_fdx(self, infos):
        return f"""; FDX Injector Configuration
; Généré par ÑĞĮĻJÃ_ÑĪJ Linux Bot
[server]
host = {infos['serveur'] or '127.0.0.1'}
port = {infos['port'] or '443'}

[proxy]
type = ssh
username = {infos['username'] or 'vpn'}
password = {infos['password'] or 'vpn'}

[payload]
data = GET / HTTP/1.1\r\nHost: [host]\r\n\r\n
"""
    
    def _vers_nxp(self, infos):
        return f"""[config]
name = VPN Configuration
server = {infos['serveur'] or '127.0.0.1'}
port = {infos['port'] or '443'}
protocol = SSH

[auth]
username = {infos['username'] or 'vpn'}
password = {infos['password'] or 'vpn'}
"""
    
    def _vers_agn(self, infos):
        return f"""[ssh]
host={infos['serveur'] or '127.0.0.1'}
port={infos['port'] or '22'}
user={infos['username'] or 'vpn'}
pass={infos['password'] or 'vpn'}

[payload]
data=GET / HTTP/1.1\\nHost: [host]\\n\\n
"""
    
    def _vers_sks(self, infos):
        return f"""[socks]
server = {infos['serveur'] or '127.0.0.1'}
port = {infos['port'] or '8080'}
type = http

[auth]
username = {infos['username'] or ''}
password = {infos['password'] or ''}
"""
    
    def _vers_ssh(self, infos):
        return f"""{infos['serveur'] or '127.0.0.1'}
{infos['port'] or '22'}
{infos['username'] or 'vpn'}
{infos['password'] or 'vpn'}
SSH
"""
    
    def _vers_nm(self, infos):
        config = {
            "name": "ÑĞĮĻJÃ_ÑĪJ Config",
            "server": infos['serveur'] or "127.0.0.1",
            "port": int(infos['port'] or 443),
            "protocol": "vmess",
            "username": infos['username'] or "",
            "password": infos['password'] or ""
        }
        return json.dumps(config, indent=2)
    
    def _vers_lien_vmess(self, infos):
        config = {
            "v": "2",
            "ps": "ÑĞĮĻJÃ_ÑĪJ VPN",
            "add": infos['serveur'] or "127.0.0.1",
            "port": infos['port'] or "443",
            "id": infos['username'] or "00000000-0000-0000-0000-000000000000",
            "aid": "0",
            "net": "tcp",
            "type": "none"
        }
        config_json = json.dumps(config)
        config_b64 = base64.b64encode(config_json.encode()).decode()
        return f"vmess://{config_b64}"
    
    def sauvegarder(self, contenu, nom_fichier):
        with open(nom_fichier, 'w', encoding='utf-8') as f:
            f.write(contenu)
        return nom_fichier