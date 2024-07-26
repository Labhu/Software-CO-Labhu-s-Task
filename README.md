1. Use Node version: `nvm use 20`

2. Install app dependency : run `npm install`

3. Check .env file and add your Email credentials (email for when new user added by Super Admin)

4. Start Server : `npm start`

5. When server start some system default data are added.

   - Like Default Role(Super Admin ,User), one super admin and System Modules..
   - Use super admin credentials for login,
     `email` : `superadmin@gmail.com`,
     `password` : `Test@123`

6. You can add more modules in `Role-Management-system/helpers/constant.js` file object `MASTER_DATA.MODULES` as per application requirement

7. For api run in postman : set below things in postman environment
   `url` : `http://localhost:9999/v1`
   `auth_token` : `set login user token`
   `x-api-key` : `use process.env.API_ACCESS_KEY`

   NOTE : As of now .env is not adding in .gitignore
