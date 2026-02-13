function showCard() {
  const name = document.getElementById('name').value;
  const feeling = document.getElementById('feeling').value;
  const photoInput = document.getElementById('photo');
  const gender = document.getElementById('genderChoice').value;

  if (!name || !feeling || !photoInput.files[0]) {
    alert("Remplis tous les champs et ajoute une photo !");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('cardPhoto').src = e.target.result;

    if (gender === 'fille') {
      document.getElementById('cardTitle').textContent = name + " t'envoie un message d'amour 💖";
    } else {
      document.getElementById('cardTitle').textContent = name + " t'envoie un message doux 💖";
    }

    document.getElementById('cardFeeling').textContent = feeling;
    document.getElementById('card').style.display = 'block';

    createHearts();
  }
  reader.readAsDataURL(photoInput.files[0]);
}

function createHearts() {
  const heartsContainer = document.querySelector('.hearts');
  heartsContainer.innerHTML = '';
  for(let i=0; i<20; i++) {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = Math.random()*100 + '%';
    heart.style.animationDelay = (Math.random()*2)+'s';
    heartsContainer.appendChild(heart);
    heart.textContent = '❤️';
  }
}