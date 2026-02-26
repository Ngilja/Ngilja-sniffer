// ============================================
// FICHIER: config.js
// BOT: NGILJA BOT
// PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
// VERSION: 1.0.0
// ============================================

const fs = require('fs');

module.exports = {
    bot: {
        name: "Bandaheali-Mini",
        owner: "Bandaheali",
        version: "1.0.0",
        prefix: ".",
        emoji: "🥷🏻✨️",
    },
    settings: {
        autoread: true,
        autoreact: true,
        autorecord: true,
        language: "fr",
        antiSpam: true
    },
    colors: {
        primary: "#ff0055",
        secondary: "#00ff99"
    },
    paths: {
        profilePic: "public/profile.jpg",
        media: "media/",
        audios: "audios/"
    },
    commands: {
        // ================= AI
        ai: { description: "Intelligence artificielle", category: "AI" },
        dalle: { description: "Créer image DALL-E", category: "AI" },
        dalle3: { description: "Créer image DALL-E 3", category: "AI" },
        fastflux: { description: "AI FastFlux", category: "AI" },
        flux: { description: "AI Flux", category: "AI" },
        gemini: { description: "AI Gemini", category: "AI" },
        gpt: { description: "Chat GPT", category: "AI" },
        magicstudio: { description: "Magic Studio", category: "AI" },

        // ================= ANIME
        demonslayer: { description: "Demon Slayer", category: "Anime" },
        loli: { description: "Loli anime", category: "Anime" },
        naruto: { description: "Naruto anime", category: "Anime" },
        onepiece: { description: "One Piece anime", category: "Anime" },

        // ================= BUG
        bomb: { description: "Bug bomb", category: "Bug" },
        bug: { description: "Test bug", category: "Bug" },

        // ================= CONVERTER
        attp: { description: "ATTp Converter", category: "Converter" },
        remini: { description: "Amélioration photo", category: "Converter" },
        rmbg: { description: "Supprimer fond", category: "Converter" },
        url: { description: "Récupérer URL", category: "Converter" },
        url2: { description: "Récupérer URL alternative", category: "Converter" },

        // ================= DOWNLOAD
        apk: { description: "Télécharger APK", category: "Download" },
        audiodoc: { description: "Télécharger audio", category: "Download" },
        capcut: { description: "Télécharger Capcut", category: "Download" },
        drama: { description: "Télécharger drama", category: "Download" },
        fb: { description: "Télécharger Facebook", category: "Download" },
        gdrive: { description: "Télécharger Google Drive", category: "Download" },
        instagram: { description: "Télécharger Instagram", category: "Download" },
        mediafire: { description: "Télécharger Mediafire", category: "Download" },
        play: { description: "Rechercher sur YouTube", category: "Download" },
        playaudio: { description: "Télécharger audio YouTube", category: "Download" },
        playvideo: { description: "Télécharger vidéo YouTube", category: "Download" },
        snackvideo: { description: "Télécharger SnackVideo", category: "Download" },
        spotify: { description: "Télécharger Spotify", category: "Download" },
        tiktok: { description: "Télécharger TikTok", category: "Download" },
        twitter: { description: "Télécharger Twitter", category: "Download" },
        vid: { description: "Télécharger vidéo", category: "Download" },
        videodoc: { description: "Télécharger vidéo doc", category: "Download" },

        // ================= DOWNLOADER
        git: { description: "Télécharger GitHub", category: "Downloader" },
        movie2: { description: "Télécharger films", category: "Downloader" },
        pint: { description: "Télécharger Pinterest", category: "Downloader" },

        // ================= FUN
        animevideo: { description: "Vidéo anime", category: "Fun" },
        asupan: { description: "Asupan vidéo", category: "Fun" },
        bday: { description: "Anniversaire", category: "Fun" },
        dare: { description: "Défi", category: "Fun" },
        fbday: { description: "Anniversaire Facebook", category: "Fun" },
        future: { description: "Prédiction futur", category: "Fun" },
        hack: { description: "Simulation hack", category: "Fun" },
        iq: { description: "Calcul IQ", category: "Fun" },
        joke: { description: "Blague", category: "Fun" },
        love: { description: "Love test", category: "Fun" },
        luck: { description: "Test chance", category: "Fun" },
        mood: { description: "Mood test", category: "Fun" },
        morning: { description: "Message matin", category: "Fun" },
        night: { description: "Message nuit", category: "Fun" },
        password: { description: "Générer mot de passe", category: "Fun" },
        random: { description: "Random", category: "Fun" },
        roast: { description: "Insulte fun", category: "Fun" },
        sts: { description: "STS fun", category: "Fun" },
        truth: { description: "Truth test", category: "Fun" },
        warnall: { description: "Avertir tous", category: "Fun" },

        // ================= GENERAL
        ping: { description: "Ping du bot", category: "General" },
        alive: { description: "Vérifier si bot est actif", category: "General" },
        system: { description: "Infos système", category: "General" },
        help: { description: "Afficher l'aide", category: "General" },
        sessions: { description: "Afficher sessions actives", category: "General" },
        pair: { description: "Générer code de parrainage", category: "General" },
        st: { description: "Afficher paramètres", category: "General" },

        // ================= GROUP
        add: { description: "Ajouter membre", category: "Group" },
        admin: { description: "Lister admins", category: "Group" },
        antibot: { description: "Anti bot", category: "Group" },
        antilink: { description: "Anti lien", category: "Group" },
        antistatus: { description: "Anti status", category: "Group" },
        antiword: { description: "Anti mot", category: "Group" },
        close: { description: "Fermer groupe", category: "Group" },
        demote: { description: "Rétrograder", category: "Group" },
        desc: { description: "Modifier description", category: "Group" },
        disappear: { description: "Messages éphémères", category: "Group" },
        everyone: { description: "Mentionner tout le monde", category: "Group" },
        groupdp: { description: "Changer photo groupe", category: "Group" },
        groupinfo: { description: "Infos groupe", category: "Group" },
        groupstats: { description: "Stats groupe", category: "Group" },
        hidetag: { description: "Hidetag", category: "Group" },
        invite: { description: "Créer invitation", category: "Group" },
        kick: { description: "Expulser membre", category: "Group" },
        kickall: { description: "Expulser tous", category: "Group" },
        leave: { description: "Quitter groupe", category: "Group" },
        lock: { description: "Verrouiller groupe", category: "Group" },
        open: { description: "Déverrouiller groupe", category: "Group" },
        promote: { description: "Promouvoir", category: "Group" },
        revoke: { description: "Révoquer lien", category: "Group" },
        setgpp: { description: "Changer photo de groupe", category: "Group" },
        subject: { description: "Changer sujet", category: "Group" },
        tagadmins: { description: "Tag admins", category: "Group" },
        tagall: { description: "Tag all", category: "Group" },
        unlock: { description: "Déverrouiller groupe", category: "Group" },

        // ================= INFO
        lyrics: { description: "Paroles de chanson", category: "Info" },
        weather: { description: "Météo", category: "Info" },

        // ================= ISLAMIC
        ayatulkursi: { description: "Ayat ul Kursi", category: "Islamic" },
        azan: { description: "Azan", category: "Islamic" },
        duaekunoot: { description: "Dua Ekunooot", category: "Islamic" },
        durood: { description: "Durood", category: "Islamic" },
        kalma1: { description: "Kalma 1", category: "Islamic" },
        kalma2: { description: "Kalma 2", category: "Islamic" },
        kalma3: { description: "Kalma 3", category: "Islamic" },
        kalma4: { description: "Kalma 4", category: "Islamic" },
        kalma5: { description: "Kalma 5", category: "Islamic" },
        kalma6: { description: "Kalma 6", category: "Islamic" },
        prayertime: { description: "Prayer time", category: "Islamic" },
        surah: { description: "Lire surah", category: "Islamic" },
        surahar: { description: "Lire surah arabe", category: "Islamic" },

        // ================= LOGO
        "3dsilver": { description: "Logo 3D Silver", category: "Logo" },
        angelwing: { description: "Logo Angel Wing", category: "Logo" },
        ballon: { description: "Logo Ballon", category: "Logo" },
        circle: { description: "Logo Circle", category: "Logo" },
        colorful: { description: "Logo Colorful", category: "Logo" },
        cubic: { description: "Logo Cubic", category: "Logo" },
        foggy: { description: "Logo Foggy", category: "Logo" },
        galaxy: { description: "Logo Galaxy", category: "Logo" },
        galaxy2: { description: "Logo Galaxy 2", category: "Logo" },
        gaming: { description: "Logo Gaming", category: "Logo" },
        golden: { description: "Logo Golden", category: "Logo" },
        gradient: { description: "Logo Gradient", category: "Logo" },
        hacker: { description: "Logo Hacker", category: "Logo" },
        jewel: { description: "Logo Jewel", category: "Logo" },
        mascot: { description: "Logo Mascot", category: "Logo" },
        matrix: { description: "Logo Matrix", category: "Logo" },
        metal: { description: "Logo Metal", category: "Logo" },
        nigeria: { description: "Logo Nigeria", category: "Logo" },
        papercut: { description: "Logo Papercut", category: "Logo" },
        sand: { description: "Logo Sand", category: "Logo" },
        snake: { description: "Logo Snake", category: "Logo" },
        splat: { description: "Logo Splat", category: "Logo" },
        star: { description: "Logo Star", category: "Logo" },
        typography: { description: "Logo Typography", category: "Logo" },
        wgalaxy: { description: "Logo W Galaxy", category: "Logo" },

        // ================= MEDIA
        emojimix: { description: "Emoji mix", category: "Media" },
        findsound: { description: "Trouver son", category: "Media" },
        imagehelp: { description: "Aide image", category: "Media" },
        imageinfo: { description: "Infos image", category: "Media" },
        randomsound: { description: "Son aléatoire", category: "Media" },
        s: { description: "Sound s", category: "Media" },
        sticker: { description: "Sticker", category: "Media" },
        sticker2img: { description: "Sticker to image", category: "Media" },
        take: { description: "Prendre média", category: "Media" },
        toimage: { description: "Convertir en image", category: "Media" },
        video2img: { description: "Vidéo vers image", category: "Media" },
        vs: { description: "VS media", category: "Media" },

        // ================= MICS
        trt: { description: "Text to speech", category: "Mics" },

        // ================= MISC
        about: { description: "À propos", category: "Misc" },

        // ================= OWNER
        block: { description: "Bloquer membre", category: "Owner" },
        blocklist: { description: "Liste bloqués", category: "Owner" },
        broadcast: { description: "Envoyer broadcast", category: "Owner" },
        delete: { description: "Supprimer message", category: "Owner" },
        forward: { description: "Forward message", category: "Owner" },
        fullpp: { description: "Photo profil complet", category: "Owner" },
        getbio: { description: "Récupérer bio", category: "Owner" },
        getname: { description: "Récupérer nom", category: "Owner" },
        goodbye: { description: "Goodbye message", category: "Owner" },
        jid: { description: "Récupérer JID", category: "Owner" },
        join: { description: "Rejoindre groupe", category: "Owner" },
        leaveall: { description: "Quitter tous les groupes", category: "Owner" },
        listgc: { description: "Lister groupes", category: "Owner" },
        myname: { description: "Nom du bot", category: "Owner" },
        myprivacy: { description: "Privacy", category: "Owner" },
        mystatus: { description: "Status bot", category: "Owner" },
        pp: { description: "Changer photo profil", category: "Owner" },
        quoted: { description: "Reprendre message cité", category: "Owner" },
        removepp: { description: "Supprimer photo profil", category: "Owner" },
        save: { description: "Sauvegarder", category: "Owner" },
        setbio: { description: "Définir bio", category: "Owner" },
        setname: { description: "Définir nom", category: "Owner" },
        setpp: { description: "Définir photo profil", category: "Owner" },
        simdata: { description: "Simuler data", category: "Owner" },
        unblock: { description: "Débloquer membre", category: "Owner" },
        unblockall: { description: "Débloquer tous", category: "Owner" },
        welcome: { description: "Message bienvenue", category: "Owner" },

        // ================= RANDOM
        abdullahzareem: { description: "Random user", category: "Random" },
        ahmedfaraz: { description: "Random user", category: "Random" },
        amjad: { description: "Random user", category: "Random" },
        attitude: { description: "Random attitude", category: "Random" },
        cat: { description: "Random cat", category: "Random" },
        china: { description: "Random china", category: "Random" },
        dog: { description: "Random dog", category: "Random" },
        faiz: { description: "Random faiz", category: "Random" },
        happyshayari: { description: "Random happy", category: "Random" },
        indo: { description: "Random indo", category: "Random" },
        iqbal: { description: "Random iqbal", category: "Random" },
        japan: { description: "Random japan", category: "Random" },
        jaunelia: { description: "Random user", category: "Random" },
        javedakhtar: { description: "Random user", category: "Random" },
        jokerimg: { description: "Random joker", category: "Random" },
        korea: { description: "Random korea", category: "Random" },
        lovevideo: { description: "Random love video", category: "Random" },
        naqvi: { description: "Random naqvi", category: "Random" },
        pakistani: { description: "Random pakistani", category: "Random" },
        parveenshakir: { description: "Random user", category: "Random" },
        qateel: { description: "Random qateel", category: "Random" },
        romantic: { description: "Random romantic", category: "Random" },
        sadshayari: { description: "Random sad", category: "Random" },
        tehzeebhafi: { description: "Random user", category: "Random" },
        thailand: { description: "Random thailand", category: "Random" },
        vietnam: { description: "Random vietnam", category: "Random" },
        wasif: { description: "Random wasif", category: "Random" },

        // ================= SEARCH
        img: { description: "Recherche image", category: "Search" },
        wiki: { description: "Recherche Wiki", category: "Search" },
        yts: { description: "Recherche YouTube", category: "Search" },

        // ================= SETTINGS
        anticall: { description: "Anti call", category: "Settings" },
        antidelete: { description: "Anti delete", category: "Settings" },
        antidelpath: { description: "Anti delete path", category: "Settings" },
        autoreact: { description: "Auto react messages", category: "