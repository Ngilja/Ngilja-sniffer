# config.py
import os

# Le token sera fourni par Render (variable d'environnement)
TOKEN = os.environ.get('8677787290:AAFfS-tWtx2fjdapQ2zyzgjIUKJ6CZnkWJQ', '')

TEMP_DIR = "temp"

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