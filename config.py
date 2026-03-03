# config.py - VERSION ULTRA SIMPLE CORRIGÉE
import os
import sys

# Récupération directe du token - CORRECTION
try:
    TOKEN = os.environ['8348247595:AAFSlXFKb3ZKGm7u0zysH-inOCaftyuHtfQ']  # ← J'ai ajouté TELEGRAM_TOKEN
    print(f"✅ Token trouvé! Longueur: {len(TOKEN)}")
    print(f"📝 Début du token: {TOKEN[:10]}...")
except KeyError:
    print("❌ ERREUR: TELEGRAM_TOKEN n'existe pas dans os.environ")
    print("📋 Recherche de variables contenant 'TOKEN':")
    for key in os.environ.keys():
        if 'TOKEN' in key:
            print(f"   - {key}")
    sys.exit(1)

TEMP_DIR = "temp"

# Créer le dossier temp
os.makedirs(TEMP_DIR, exist_ok=True)

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