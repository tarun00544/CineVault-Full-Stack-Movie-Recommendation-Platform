package com.Tarun.config;

import com.Tarun.model.Movie;
import com.Tarun.repository.MovieRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final MovieRepository movieRepository;

    public DataLoader(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }
     @Override
public void run(String... args) {

    

    movieRepository.save(Movie.builder()
            .title("Avengers: Endgame")
            .genre("Action")
            .language("English")
            .releaseYear(2019)
            .duration(181)
            .rating(4.8)
            .director("Anthony Russo")
            .description("The Avengers assemble one final time to restore the universe.")
            .posterUrl("https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=TcMBFSGVi1c")
            .build());

    movieRepository.save(Movie.builder()
            .title("Interstellar")
            .genre("Sci-Fi")
            .language("English")
            .releaseYear(2014)
            .duration(169)
            .rating(4.9)
            .director("Christopher Nolan")
            .description("A team of explorers travels through a wormhole in space.")
            .posterUrl("https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=zSWdZVtXT7E")
            .build());

    movieRepository.save(Movie.builder()
            .title("Inception")
            .genre("Sci-Fi")
            .language("English")
            .releaseYear(2010)
            .duration(148)
            .rating(4.8)
            .director("Christopher Nolan")
            .description("A thief enters people's dreams to steal valuable secrets.")
            .posterUrl("https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=YoHD9XEInc0")
            .build());

    movieRepository.save(Movie.builder()
            .title("The Dark Knight")
            .genre("Action")
            .language("English")
            .releaseYear(2008)
            .duration(152)
            .rating(4.9)
            .director("Christopher Nolan")
            .description("Batman faces his greatest enemy, the Joker.")
            .posterUrl("https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=EXeTwQWrcwY")
            .build());

    movieRepository.save(Movie.builder()
            .title("John Wick")
            .genre("Action")
            .language("English")
            .releaseYear(2014)
            .duration(101)
            .rating(4.7)
            .director("Chad Stahelski")
            .description("A retired assassin seeks revenge.")
            .posterUrl("https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=2AUmvWm5ZDQ")
            .build());

    movieRepository.save(Movie.builder()
            .title("3 Idiots")
            .genre("Comedy")
            .language("Hindi")
            .releaseYear(2009)
            .duration(170)
            .rating(4.9)
            .director("Rajkumar Hirani")
            .description("Three engineering students discover the true meaning of success.")
            .posterUrl("https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=K0eDlFX9GMc")
            .build());

    movieRepository.save(Movie.builder()
            .title("Dangal")
            .genre("Drama")
            .language("Hindi")
            .releaseYear(2016)
            .duration(161)
            .rating(4.8)
            .director("Nitesh Tiwari")
            .description("A former wrestler trains his daughters to become champions.")
            .posterUrl("https://upload.wikimedia.org/wikipedia/en/9/99/Dangal_Poster.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=x_7YlGv9u1g")
            .build());

    movieRepository.save(Movie.builder()
            .title("Shershaah")
            .genre("War")
            .language("Hindi")
            .releaseYear(2021)
            .duration(135)
            .rating(4.8)
            .director("Vishnuvardhan")
            .description("The inspiring story of Captain Vikram Batra.")
            .posterUrl("https://upload.wikimedia.org/wikipedia/en/0/05/Shershaah_film_poster.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=Q0FTXnefVBA")
            .build());

    movieRepository.save(Movie.builder()
            .title("Pathaan")
            .genre("Action")
            .language("Hindi")
            .releaseYear(2023)
            .duration(146)
            .rating(4.5)
            .director("Siddharth Anand")
            .description("An elite RAW agent fights against a dangerous terrorist.")
            .posterUrl("https://upload.wikimedia.org/wikipedia/en/c/c3/Pathaan_film_poster.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=vqu4z34wENw")
            .build());

    movieRepository.save(Movie.builder()
            .title("Animal")
            .genre("Action")
            .language("Hindi")
            .releaseYear(2023)
            .duration(201)
            .rating(4.6)
            .director("Sandeep Reddy Vanga")
            .description("A son shares a complicated bond with his father.")
            .posterUrl("https://upload.wikimedia.org/wikipedia/en/6/61/Animal_film_poster.jpg")
            .trailerUrl("https://www.youtube.com/watch?v=Dydmpfo68DA")
            .build());

    System.out.println("✅ First 10 demo movies inserted successfully!");
}


}
