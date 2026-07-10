🎬 Movie Recommendation Platform

A full-stack Movie Recommendation Platform built using Java, Spring Boot, MongoDB, HTML, CSS, and JavaScript. The application allows users to browse, manage, and explore movie information through a modern web interface with RESTful APIs.

🚀 Features

🎥 Movie Management
Add new movies
View all movies
Get movie by ID
Update movie details
Delete movies

👤 User Management
User Registration
User Login
Profile Management

🔍 Movie Information
Movie Title
Genre
Language
Release Year
Duration
Rating
Director
Cast
Description
Poster URL
Trailer URL

🌐 Frontend Pages
Home Page
Movies Page
Movie Details
Login
Signup
User Profile
Admin Dashboard
Wishlist

🛠️ Tech Stack
Backend
Java 17
Spring Boot 3
Spring Web
Spring Data MongoDB
Maven
Database
MongoDB
Frontend
HTML5
CSS3
JavaScript
Tools
VS Code
Thunder Client
MongoDB Compass
Git & GitHub

📂 Project Structure
Movie Project
│
├── Backend
│   ├── controller
│   ├── model
│   ├── repository
│   ├── service
│   ├── config
│   ├── security
│   ├── util
│   └── resources
│
└── Frontend
    ├── css
    ├── js
    ├── images
    ├── index.html
    ├── movies.html
    ├── login.html
    ├── signup.html
    ├── profile.html
    └── admin.html

📡 REST API Endpoints
Movie APIs
Method	Endpoint	Description
GET	/api/movies	Get all movies
GET	/api/movies/{id}	Get movie by ID
POST	/api/movies	Add movie
PUT	/api/movies/{id}	Update movie
DELETE	/api/movies/{id}	Delete movie

▶️ Installation
Clone Repository
git clone https://github.com/yourusername/movie-recommendation-platform.git
Backend
cd Backend
mvn clean install
mvn spring-boot:run

Server will start on:

http://localhost:8080
MongoDB Configuration

Edit

src/main/resources/application.properties

Example

spring.data.mongodb.uri=mongodb://localhost:27017/movie_db
Testing APIs

Use

Thunder Client
Postman

Example

GET http://localhost:8080/api/movies
Future Enhancements
JWT Authentication
Spring Security
Wishlist
Recommendation Engine
Search & Filter
Pagination
Role-Based Access Control (Admin/User)
Image Upload
Reviews & Ratings
Favorites
Email Verification
Password Reset
Author

Tarun Kumar

Full Stack Developer

Java | Spring Boot | MongoDB | HTML | CSS | JavaScript

GitHub: https://github.com/tarun005444

LinkedIn: https://www.linkedin.com/in/tarun-kumar-ba7941296

⭐ If you like this project, don't forget to give it a Star on GitHub.
