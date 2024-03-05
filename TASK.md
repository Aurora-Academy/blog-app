# Modules

CRUD

- Blog
  Feature

1. add blog (create)
2. get one blog (getById)
3. get all blogs (admin) (list)
4. update blog (updateById)
5. delete a blog (removeById)
6. get blogs specific to author (getAuthorBlogs)
7. show all published blogs only (getPublishedBlogOnly)

- Users
  Feature

1. login
2. register + bcryptjs (password hash)
3. get profile (logged in user)
4. update profile
5. forget password
6. change password
7. reset password (admin change)

User Story
Raktim wants to register into the system. Raktim should be able to add his details and sign up into the system. Once Signed up, Raktim should be able to add his own blog and check all his blogs (both published and Draft)

- Register
  -> user model (name, email, password)
  -> create register controller
  -> create post route as /api/v1/users/register
  -> update req.body in controller as password => bcrypt(hash pw)
  -> Send email to user about successful signup (optional)

- login (Authentication)
  -> create login controller
  -> create post route as /api/v1/users/login
  -> in controller, get req.body (email and password)
  -> check if user exists in the system or not
  -> if user exist, get hashedPw from Database
  -> compare user provided password with hashedPw
  -> if result false, throw new Error("Email or Password mismatch")

  -> Additional work

  - system needs to send something back to user (access_token)
  - token creation (Authorization)
  - cookie, session, json web token (3 methods to authorize)
    -- Start the Authorization Process --
  - npm i jsonwebtoken
  - jsonwebtoken , 2 utility function (token generate / token validate)
  - Create a token.js utility file
  - Add Secret and Duration in env file

  - If user successfully logs in,
  - Create the user payload for the jsonsign utility for signing
  - add the roles to the user model
  - Get the token and check the token in jwt.io, check for expiration and data in the JSON Object
  - send the token to the user through login api

  - send the token for every request in req.headers
  - checkRole middleware update using token validate utility function
  - if false, permission denied error throw
  - if true, next()

======
Authorization => JSON WEB TOKEN => verify => RBAC

- add blog
- view all blogs (user)

///////// Password Actions //////////

1. Forget Password
   2 parts
   API: /api/v1/users/generate-fp-token
   a. User enters the email (req.body)
   b. check if user exists on not based on email
   c. generate OTP
   d. store the OTP in the user Model
   e. send the OTP to email

API: /api/v1/users/verify-fp-token
f. compare the user sent OTP to store OTP
g. if true, use new password
h. hash the password
i. replace the existing password to the new one
j. "Password changed successfully"

2. Change Password

3. Reset Password (Admin)

// Aggregation usecases
=> Multiple collection join

=> Pagination & Searching & sorting
=> reports generation (pie chart, doughnut chart)

// Pagination & searching & sorting

// using token, automatically assign author for user role
// else for admin as for userId

Pages

1. Login
2. register
3. Forget passsword
4.

File Upload Feature

1. Check if the form data is supported or not
2. file upload (HTML Data type => multipart/form-data)
3. multer (package) => req form data => req file/ files and req body
4. storage / file naming, single/multiple file??
5. preferred storage: diskStorage, file rename store, req.file, req.files
6. multer middleware
7. route
8. Store in the Database
