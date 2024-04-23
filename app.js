import { data } from "./data.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBIsfL2X9grYpB_JwmstsMRxJX-x1Llf6w",
    authDomain: "book-review-130d7.firebaseapp.com",
    projectId: "book-review-130d7",
    storageBucket: "book-review-130d7.appspot.com",
    messagingSenderId: "135040260798",
    appId: "1:135040260798:web:0f7d5aeb970ca863565cef",
    measurementId: "G-B4V4GKTNYZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore()


// fetch the data from firestore

async function fetchMovies() {
    const movieRef = collection(db, "movie-review")
    const moviesQuery = query(movieRef)
    const snapshot = await getDocs(moviesQuery)

    const moviesData = []
    snapshot.forEach(doc => {
        moviesData.push(doc.data())
    })

    return moviesData
}

// load the movies review data to the html

const moviesCard = document.getElementById("all-movies");

async function loadMovies() {

    const moviesData = await fetchMovies()
    console.log(moviesData);

    if (moviesData.length > 0) {
        moviesCard.innerHTML = moviesData.map((movie, index) => {
            return `
                <div class="movie" key=${index}>
                    <img src=${movie.movieImage} alt="">
                    <div class="text">
                        <h2>${movie.movieTitle}</h2>
                        <p>${movie.movieDescription}</p>
                        <h3> Director: ${movie.movieDirector}</h3>
                        <h3>Rating: ${movie.movieRating}/5</h3>
                    </div>
                </div>
            `;
        }).join('');
    }
}

loadMovies();

// add the movie review to the 

async function addMovieReview(event) {
    event.preventDefault();

    let movieTitle = document.getElementById("movieTitle").value;
    let movieDescription = document.getElementById("movieDescription").value;
    let movieDirector = document.getElementById("movieDirector").value;
    let movieImage = document.getElementById("movieImage").value;
    let movieRating = document.getElementById("movieRating").value;

    const movieRef = collection(db, "movie-review")
    const moviesQuery = query(movieRef)
    const snapshot = await getDocs(moviesQuery)
    const count = snapshot.size

    await addDoc(movieRef, {
        movieId: count + 1,
        movieTitle: movieTitle,
        movieDescription: movieDescription,
        movieImage: movieImage,
        movieDirector: movieDirector,
        movieRating: movieRating
    });

    console.log(data);

    document.getElementById("movieTitle").value = "";
    document.getElementById("movieDescription").value = "";
    document.getElementById("movieDirector").value = "";
    document.getElementById("movieImage").value = "";
    document.getElementById("movieRating").value = "";

    loadMovies();
    activateForm()
}

function activateForm() {
    const form = document.querySelector(".add-movie-review");

    if (document.getElementById("add-review-header").innerHTML === "Cancel") {
        form.classList.add("form-inactive");
        document.getElementById("add-review-header").innerHTML = "Add Review";
    }
    else {
        form.classList.remove("form-inactive");
        document.getElementById("add-review-header").innerHTML = "Cancel";
    }
}

document.getElementById("add-review-btn").addEventListener('click', function () { addMovieReview(event) });

document.getElementById("add-review-header").addEventListener('click', activateForm);
