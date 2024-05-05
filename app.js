import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    Firestore,
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

const firebaseConfig = {
    apiKey: "AIzaSyAwkyZyBWgk49t2dskPvgQQAar1UhPOBnI",
    authDomain: "movie-review-aad64.firebaseapp.com",
    projectId: "movie-review-aad64",
    storageBucket: "movie-review-aad64.appspot.com",
    messagingSenderId: "725251961867",
    appId: "1:725251961867:web:06448fd848ac96ab73830e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

const movieCollectionRef = collection(db, "movie-review");

function toggleAddReviewForm() {
    const form = document.querySelector(".add-movie-review");
    const header = document.getElementById("add-review-header");

    if (header.innerHTML === "Cancel") {
        form.classList.add("form-inactive");
        header.innerHTML = "Add Review";
    } else {
        form.classList.remove("form-inactive");
        header.innerHTML = "Cancel";
        form.scrollIntoView(true);
    }
}

document.getElementById("add-review-header").addEventListener('click', toggleAddReviewForm);
document.getElementById("cancel-btn").addEventListener('click', toggleAddReviewForm);

function renderMovies(sortValue) {

    const sortBy = sortValue || "movieTitle"

    const q = query(movieCollectionRef, orderBy(sortBy));
    onSnapshot(q, (snapshot) => {

        let movies = document.querySelector('#all-movies');
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
                        <button class="edit" data-id="${doc.id}">Edit</button>
                        <button class="delete" data-id="${doc.id}">Delete</button>
                    </div>
                </div>`;
        });

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
        toggleAddReviewForm();

        currentMode = "update";
        selectedDocId = docId;

        document.getElementById("add-review-btn").textContent = "Update Review";

    } else {
        console.log("No such document!");
    }
}

async function addOrUpdateMovieReview(event) {
    event.preventDefault();
    let docRef;

    const movieData = {
        movieTitle: document.getElementById("movieTitle").value,
        movieDescription: document.getElementById("movieDescription").value,
        movieDirector: document.getElementById("movieDirector").value,
        movieImage: document.getElementById("movieImage").value,
        movieRating: +document.getElementById("movieRating").value
    };


    if (currentMode === "add") {
        docRef = await addDoc(movieCollectionRef, movieData);

    } else if (currentMode === "update" && selectedDocId) {
        docRef = await updateDoc(doc(db, 'movie-review', selectedDocId), movieData);
        currentMode = "add";
        document.getElementById("add-review-btn").textContent = "Add Review";
    }

    document.querySelectorAll("input").forEach(input => input.value = "");
    toggleAddReviewForm();
}


// sort by fucntionality
function sort() {
    let sortValue = document.getElementById("sort").value;
    renderMovies(sortValue)
}

let currentMode = "add";
let selectedDocId = null;

document.getElementById("add-review-btn").addEventListener('click', addOrUpdateMovieReview);
document.getElementById("sort").addEventListener('change', sort);
renderMovies("movieTitle");
