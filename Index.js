    // Script JavaScript pour le Compte à Rebours et les Confettis
    <script>
        // --- CONFIGURATION À MODIFIER ---
        const YOUR_NAME = "NGILJA NIJ"; 
        // L'anniversaire est réglé pour demain (17 novembre 2025) à minuit
        // Le temps actuel est le 16 novembre 2025 à 11:08:29 AM CAT, donc la distance est calculée pour minuit demain.
        const BIRTHDAY_DATE = "November 17, 2025 00:00:00"; 
        // ---------------------------------

        document.querySelector('h2').innerHTML = `ANNIVERSAIRE DE **${YOUR_NAME}** PRÉVU LE **${new Date(BIRTHDAY_DATE).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}**`;
        document.title = `Joyeux Anniversaire - ${YOUR_NAME}`;
        
        const countdownElement = document.getElementById('countdown');
        const countdownTitle = document.getElementById('countdown-title');
        const wishButton = document.getElementById('wish-button');

        function updateCountdown() {
            const now = new Date().getTime();
            const birthday = new Date(BIRTHDAY_DATE).getTime();
            let distance = birthday - now;

            if (distance < 0) {
                // Si l'anniversaire est passé, on calcule celui de l'année prochaine
                const nextYear = new Date(BIRTHDAY_DATE);
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                distance = nextYear.getTime() - now;
            }

            // Calcul du temps
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance > 0) {
                // Afficher le compte à rebours
                document.getElementById('days').textContent = String(days).padStart(2, '0');
                document.getElementById('hours').textContent = String(hours).padStart(2, '0');
                document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
                document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
            } else {
                // Anniversaire A ARRIVÉ (H-HOUR atteint) !
                countdownTitle.textContent = "MISSION ACCOMPLIE - FÉLICITATIONS, C'EST LE JOUR J !";
                document.querySelector('h1').textContent = `[ OPÉRATION JOYEUSES ANNIVERSAIRE ]`;
                countdownElement.innerHTML = `<h3 style="color:var(--primary-color); font-size:2em; letter-spacing: 3px;">CODE ROUGE : FÊTE IMMÉDIATE !</h3>`;
                wishButton.textContent = "ENVOI DU PAQUET VŒUX À NGILJA NIJ";

                // Lancer une pluie de confettis non-stop
                startConfettiRain();

                // Arrêter la mise à jour du compteur
                clearInterval(countdownInterval);
            }
        }

        // --- Logique des Confettis ---
        const colors = ['#ffcc00', '#ffffff', '#222222']; // Jaune, Blanc, Noir

        function createConfetti() {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`; 
            confetti.style.animationDelay = `-${Math.random() * 5}s`; 
            confetti.style.width = confetti.style.height = `${Math.random() * 8 + 5}px`;
            document.body.appendChild(confetti);

            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }

        let confettiInterval;
        function startConfettiRain() {
            if (!confettiInterval) {
                confettiInterval = setInterval(createConfetti, 100); 
                // Lancement initial de 50 confettis pour l'effet "BAM !"
                for (let i = 0; i < 50; i++) {
                    createConfetti();
                }
            }
        }

        // --- Logique du Bouton ---
        wishButton.addEventListener('click', () => {
            alert(`🎉 ${YOUR_NAME} : VŒUX TRANSMIS AVEC SUCCÈS ! Joyeux Anniversaire ! 🎉`);
        });


        // Initialiser et démarrer la mise à jour
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000); 

    </script>

