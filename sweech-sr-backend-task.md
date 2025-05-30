# Backend Senior Developer Interview Task

---

# Requirements

- You must use the following tech stack:
  - [Node.js](https://nodejs.org)
  - [TypeScript](https://www.typescriptlang.org)
  - [NestJS](http://nestjs.com) (express-based) Framework
  - [PostgreSQL](https://www.postgresql.org)
  - [Prisma](https://www.prisma.io)
- The coding convention should follow the Google JavaScript style guide. Please use eslint and prettier.
- Actively use Git to commit and record your work.
- You need to create a database table that meets the requirements. Use Prisma migration for creating and modifying tables.
- All requests and responses must have Content-Type `application/json`.
- You can implement error responses for failed API requests as you prefer, but the response format must be consistent.
- All APIs except for signup and login must implement Bearer Authentication (token-based authentication).

---

## 1. Development Environment Setup

You need to set up a local development environment using Docker Compose. Please configure the infrastructure environment according to the specs below.

1. The Node.js application and database should be configured in separate containers.
   - Node.js LTS, use port 3001
   - PostgreSQL 14.2, use port 5432
2. Changes made in the code editor should be applied to the container.

---

## 2. Implement the User Registration API

The API must accept the user ID, password, and username, and store the user information in the member table.

- The ID must be in email format and duplicates should not be allowed.
- The password should be between 12 to 20 characters, containing lowercase letters, special characters, and numbers, and should be encrypted using bcrypt before storing it in the database.
- The username should be in Korean and between 1 and 10 characters.
- The registration time should be saved in ISO8601 format.
- On successful registration, the API should return the ID, username, and registration time.

---

## 3. Implement the Login API

The API must validate the user ID and password. If valid, return a JWT.

- The JWT Secret should be a 256-bit hex value.
- The JWT token should expire in 20 minutes.
- The ID must be in email format.

---

## 4. Implement the API to Modify User Information

Use the `PATCH` method to allow users to change their name and password.

- Only non-null fields in the request should be processed.
- The password should be between 12 to 20 characters, containing lowercase letters, special characters, and numbers, and should be encrypted using bcrypt.
- The username should be in Korean and between 1 and 10 characters.

---

## 5. Implement the API for Post Registration/Viewing

### 5.1 Post Creation

The fields for post creation should be as follows:

- Title: 1-30 characters
- Content: 1-1000 characters

### 5.2 Post Listing - Pagination

The post list should support pagination. When the page number is provided as a query parameter, the API should return posts for that page.

- Limit the number of posts to a maximum of 20 per page.
- Include the total number of posts in the response.
- Sort the posts by the most recent creation time.
- The post list should include the following fields:
  - Post ID
  - Post Title
  - Username of the person who created the post
  - Creation time (in ISO8601 format)

### 5.3 Post Detail View

The post detail view should return the following fields:

- Post ID
- Post Title
- Post Content
- Username of the person who created the post
- Creation time (in ISO8601 format)

#### Response

| Http Status | Status  | Description            |
| ----------- | ------- | ---------------------- |
| 401         | Failure | Authentication Failure |
| 404         | Failure | Data Not Found         |
| 200         | Success | Successfully Retrieved |

---

## 6. Implement the API for Comment Registration/Viewing/Deleting

### 6.1 Comment Creation

The fields for comment creation should be as follows:

- Content: 1-500 characters

### 6.2 Comment Listing - Cursor-based Pagination

Use cursor-based pagination to fetch comments.

- Include the cursor value for the next page in the response.
- If no more comments are available, the cursor value should be null.
- Limit the number of comments to a maximum of 10 per page.
- The comment list should include the following fields:
  - Comment ID
  - Comment Content
  - Username of the person who created the comment
  - Creation time (in ISO8601 format)
- Sort the comments by the most recent creation time.

### 6.3 Comment Deletion

Use the comment ID to delete the comment.

- Only the user who created the post or the comment can delete the comment.

---

## 7. Implement the API to Track User Login Records

Record the login information of the user every time they log in.

- Record the user ID, login time, and IP address.
- The login records should be sorted by the most recent login and show a maximum of 30 records.
- The login time should be in the format `YYYY-MM-DD HH:mm:ss` (e.g., `2022-08-01 14:28:10`).
- If the user has been deleted, show their name as null.

---

## 8. Implement the API to Get Login Count Rankings

Calculate and show the login rankings for the current week.

- The rankings should be based on the login count from Monday to Sunday.
- The API should return the user's name and their rank.
- The ranking should also include the number of users sharing the same rank.
- If multiple users share the same rank, the next rank should not skip.
- If there are no login records for the current week, the rank and the number of users sharing the rank should be null.
- The total number of users should be 20.

#### Ranking Table Example

| Name       | Login Count | Rank |
| ---------- | ----------- | ---- |
| Kang In    | 58          | 1    |
| Gyeong Woo | 42          | 2    |
| Ji In      | 42          | 2    |
| Heung Min  | 40          | 3    |
| Sala       | 36          | 4    |
| Kane       | 36          | 4    |
| Nakun      | 36          | 4    |
| John Jo    | 35          | 5    |

---

## Tips

- Most of the tasks can be easily implemented by referring to the official documentation.
  - [NestJS Official Documentation](http://nestjs.com)
  - [Prisma Documentation](https://www.prisma.io/)
- Write test cases if possible.

---
