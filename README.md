# Blog API Backend

This is a simple blog API Backend

## Description

This is the backend implementation of a blog application where user can login, authenticate by JWT and perform CRUD operations on posts(Create, Read, Update, Delete).

## Technologies Used

- Node.js: Runtime environment
- Express.js: Backend framework
- MongoDB: Database
- Mongoose: MongoDB ODM
- JWT: Authentication and Authorization
- Bcrypt.js: Password hashing

## Features

1. **User Authentication:**

- Register new user
- login with email and password
- Password hashing using Bcrypt
- JWT-based token generation for secure routes

2. **Post Management:**

- Create, Read, Update and Delete posts
- Secure routes (only logged-in users can perform action)

3. **Error Handling:**

- Error handling for invalid requests or unauthorized access.
