# config.py
import os
import sys

# Récupération du token avec message d'erreur clair
TOKEN = os.environ.get('8348247595:AAFSlXFKb3ZKGm7u0zysH-inOCaftyuHtfQ')

if not TOKEN:
    print("❌ ERREUR CRITIQUE: TELEGRAM_TOKEN n'est pas défini!")
    print("📝 Variables d'environnement disponibles:", list(os.environ.keys()))
    sys.exit(1)  # Arrête le bot si pas de token

print(f"✅ Token chargé: {TOKEN[:5]}...{TOKEN[-5:]}")  # Affiche seulement début et fin

TEMP_DIR = "temp"

# Créer le dossier temp s'il n'existe pas
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

FORMATS_SUPPORTES = {
    '.fdx': 'FDX Injector',
    '.agn': 'AGN Injector',
    '.jvc': 'JV Custom',
    '.aip': 'ACE INYECTOR',
    '.sks': 'SocksHTTP',
    '.stk': 'Stark VPN Reloaded',
    '.tnl': 'OpenTunnel',
    '.ssh': 'SSH Injector',
    '.nxp': 'NexPrime VPN',
    '.purple': 'Purple VPN',
    '.cln': '24Clan VPN Plus',
    '.ziv': 'ZIVPN',
    '.nm': 'NetMod VPN',
    '.hat': 'HA Tunnel Plus',
}

TEXT_PROTOCOLS = {
    'NETMOD': ['nm-vmess://', 'nm-vless://', 'nm-trojan://'],
    'ARMOD': ['ar-vless://', 'ar-vmess://', 'ar-trojan://'],
    'VMess': ['vmess://'],
    'VLESS': ['vless://'],
    'Trojan': ['trojan://'],
}

CONVERSIONS = {
    '.fdx': ['.nxp', '.agn', '.sks', '.ssh', 'vmess://'],
    '.nxp': ['.fdx', '.agn', '.sks', '.nm'],
    '.agn': ['.fdx', '.nxp', '.sks', '.ssh'],
}

print("✅ Configuration chargée avec succès!")