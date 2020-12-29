# Cyber Security Base 2020 MOOC Project 

This project is an intentionally vulnerable web application for the Cyber Security Base 2020 MOOC course (https://cybersecuritybase.mooc.fi/).

The application is made with Node.js, it has an EJS view engine and it uses a SQLite database.

## Features

* User Registration & Login
* Users can post videos
* Users can delete videos
* Search

The application has default credentials ` admin:admin ` and ` user123:PaSSworDD!! `

## Usage

The project has a Dockerfile and docker-compose configuration for easy setup. Just run ` docker-compose up ` in the project's folder to build and start the server. The server will then be listening at localhost:8080
