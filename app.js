import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getDocs,
    getFirestore,
    onSnapshot,
    query,
    collection,
    orderBy,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwkyZyBWgk49t2dskPvgQQAar1UhPOBnI",
    authDomain: "movie-review-aad64.firebaseapp.com",
    projectId: "movie-review-aad64",
    storageBucket: "movie-review-aad64.appspot.com",
    messagingSenderId: "725251961867",
    appId: "1:725251961867:web:06448fd848ac96ab73830e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Reference to the movie collection
const movieCollectionRef = collection(db, "movie-review");

// Function to toggle the form visibility
function toggleAddReviewForm() {
    const form = document.querySelector(".add-movie-review");
    const header = document.getElementById("add-review-header");

    if (header.innerHTML === "Cancel") {
        document.getElementById("add-review-btn").textContent = "Add Review";
        form.reset();
        form.classList.add("form-inactive");
        header.innerHTML = "Add Review";
    } else {
        form.classList.remove("form-inactive");
        header.innerHTML = "Cancel";
        form.scrollIntoView(true);
    }
}

// Event listeners for toggling the form
document.getElementById("add-review-header").addEventListener('click', toggleAddReviewForm);
document.getElementById("cancel-btn").addEventListener('click', toggleAddReviewForm);

// Function to render movies based on sorting method
function renderMovies(sortValue) {
    const sortBy = sortValue || "movieTitle";
    const q = query(movieCollectionRef, orderBy(sortBy));
    onSnapshot(q, (snapshot) => {
        const movies = document.querySelector('#all-movies');
        movies.innerHTML = "";

        snapshot.forEach(doc => {
            const movie = doc.data();
            movies.innerHTML += `
                <div class="movie">
                    <img src=${movie.movieImage} alt="">
                    <div class="text">
                        <h2>${movie.movieTitle}</h2>
                        <p>${movie.movieDescription}</p>
                        <h3> Director: ${movie.movieDirector}</h3>
                        <h3>Rating: ${movie.movieRating}/5</h3>
                        <h3>Release Date: ${new Date(movie.movieReleaseDate).toLocaleDateString()}</h3>
                        <button class="edit" data-id="${doc.id}">Edit</button>
                        <button class="delete" data-id="${doc.id}">Delete</button>
                    </div>
                </div>`;
        });

        // Event listeners for delete and edit buttons
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                await deleteDoc(doc(db, 'movie-review', e.target.dataset.id));
            });
        });

        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', (e) => {
                editMovieReview(e.target.dataset.id);
            });
        });
    });
}

// Function to edit a movie review
async function editMovieReview(docId) {
    const docRef = doc(db, 'movie-review', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const movie = docSnap.data();
        document.getElementById("movieTitle").value = movie.movieTitle;
        document.getElementById("movieDescription").value = movie.movieDescription;
        document.getElementById("movieDirector").value = movie.movieDirector;
        document.getElementById("movieImage").value = movie.movieImage;
        document.getElementById("movieRating").value = movie.movieRating;
        document.getElementById("movieReleaseDate").value = movie.movieReleaseDate;
        toggleAddReviewForm();

        currentMode = "update";
        selectedDocId = docId;
        document.getElementById("add-review-btn").textContent = "Update Review";
    } else {
        console.log("No such document!");
    }
}

// Function to add or update a movie review
async function addOrUpdateMovieReview(event) {
    event.preventDefault();

    const movieData = {
        movieTitle: document.getElementById("movieTitle").value,
        movieDescription: document.getElementById("movieDescription").value,
        movieDirector: document.getElementById("movieDirector").value,
        movieImage: document.getElementById("movieImage").value,
        movieReleaseDate: document.getElementById("movieReleaseDate").value,
        movieRating: +document.getElementById("movieRating").value % 6,
    };

    if (currentMode === "add") {
        await addDoc(movieCollectionRef, movieData);
    } else if (currentMode === "update" && selectedDocId) {
        await updateDoc(doc(db, 'movie-review', selectedDocId), movieData);
        currentMode = "add";
        document.getElementById("add-review-btn").textContent = "Add Review";
    }

    document.querySelector(".add-movie-review").reset();
    toggleAddReviewForm();
}

// Global variables to handle add and edit mode
let currentMode = "add";
let selectedDocId = null;

// Event listener for adding or updating movie reviews
document.querySelector(".add-movie-review").addEventListener("submit", addOrUpdateMovieReview);

// Event listener for sorting
document.querySelector('#sort').addEventListener('change', (e) => renderMovies(e.target.value));

// Initial render of movies
renderMovies();
