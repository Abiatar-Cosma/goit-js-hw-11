import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const API_KEY =
  '47247064-19e7a8e15d0c6618c560e7aa5'; // Inlocuieste cu cheia ta de la Pixabay
const BASE_URL = 'https://pixabay.com/api/';
let page = 1;
let query = '';

// Initializeaza SimpleLightbox pentru galerie
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

loadMoreButton.style.display = 'none'; // Ascunde butonul "Load More" initial

// Event listener pentru formularul de cautare
form.addEventListener('submit', async event => {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();

  if (!query) {
    Notiflix.Notify.warning('Please enter a search term!');
    return;
  }

  page = 1; // Reseteaza pagina la 1 pentru o cautare noua
  loadMoreButton.style.display = 'none'; // Ascunde butonul inainte de a face cererea

  const data = await fetchImages(query, page);

  if (data && data.hits.length > 0) {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    renderImages(data.hits);
    if (data.totalHits > 40) {
      loadMoreButton.style.display = 'block'; // Afiseaza butonul "Load More" doar daca sunt mai multe imagini
    }
  } else {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    loadMoreButton.style.display = 'none'; // Ascunde butonul daca nu sunt imagini
  }
});

// Event listener pentru butonul "Load More"
loadMoreButton.addEventListener('click', async () => {
  page += 1; // Crește numărul de pagină
  const data = await fetchImages(query, page);

  if (data && data.hits.length > 0) {
    renderImages(data.hits);
    scrollSmooth(); // Derulare lină după adăugarea imaginilor

    // Dacă s-au afișat toate imaginile disponibile, ascunde butonul
    if (page * 40 >= data.totalHits) {
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  }
});

// Functie pentru a face cererea catre API-ul Pixabay
async function fetchImages(query, page) {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40, // Seteaza la 40 pentru a afisa mai multe imagini
      },
    });
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong, please try again later.');
    return null;
  }
}

// Functie pentru a renderiza imaginile in galerie
function renderImages(images) {
  if (page === 1) {
    gallery.innerHTML = ''; // Golește galeria pentru rezultate noi
  }
  images.forEach(image => {
    const imgCard = `
      <div class="photo-card">
        <a href="${image.largeImageURL}">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy"/>
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b>: ${image.likes}</p>
          <p class="info-item"><b>Views</b>: ${image.views}</p>
          <p class="info-item"><b>Comments</b>: ${image.comments}</p>
          <p class="info-item"><b>Downloads</b>: ${image.downloads}</p>
        </div>
      </div>`;
    gallery.insertAdjacentHTML('beforeend', imgCard);
  });

  lightbox.refresh(); // Reimprospateaza SimpleLightbox pentru a include noile imagini
}

// Functie pentru derulare lina a paginii dupa adaugarea imaginilor
function scrollSmooth() {
  const firstElement = document.querySelector('.gallery').firstElementChild;
  if (firstElement) {
    const { height: cardHeight } = firstElement.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}
