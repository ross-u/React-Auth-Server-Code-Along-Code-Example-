# React  authentication code along - Server



<br>



#### Clone the repository with starter code

<br>



```bash
git clone https://github.com/ross-u/React-Auth-Server-Code-Along---Starter-Code-.git

cd React-Auth-Server-Code-Along---Starter-Code-/

npm i
```



<br>



#### Rename `.env.sample` file to `.env`



<br>



#### - HTTP request and response flow and session 	`appWComments.js`

#### - `helpers/middlewares.js` - we use it to  abstract some functionality to helper functions



<br>



#### Create the `/signup` route in `routes/auth.js`



```js
//		routes/auth.js

//  POST    '/signup'
router.post('/signup', isNotLoggedIn(), validationLoggin(), async (req, res, next) => {
    const { username, password } = req.body;

    try {																									 // projection
      const usernameExists = await User.findOne({ username }, 'username');
      
      if (usernameExists) return next(createError(400));
      else {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashPass = bcrypt.hashSync(password, salt);
        const newUser = await User.create({ username, password: hashPass });
        req.session.currentUser = newUser;
        res
          .status(200)  //  OK
          .json(newUser);
      }
    } 
    catch (error) {
      next(error);
    }
  },
);
```



<br>



#### Create the `/login` route in `routes/auth.js`

```js
//		routes/auth.js

//  POST    '/login'
router.post('/login', isNotLoggedIn(), validationLoggin(), async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username }) ;
      if (!user) {
        next(createError(404));
      } 
      else if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res
          .status(200)
          .json(user);
        return 
      } 
      else {
        next(createError(401));
      }
    } 
    catch (error) {
      next(error);
    }
  },
);
```



<br>



#### Create the `/logout` route in `routes/auth.js`

```js
//		routes/auth.js

//  POST    '/logout'
router.post('/logout', isLoggedIn(), (req, res, next) => {
  req.session.destroy();
  res
    .status(204)  //  No Content
    .send();
  return; 
});
```



<br>



#### Create the `/private` route in `routes/auth.js`

```js
//		routes/auth.js

//  GET    '/private'   --> Only for testing - Same as `/me` but it returns a message instead
router.get('/private', isLoggedIn(), (req, res, next) => {
  res
    .status(200)  // OK
    .json({ message: 'Test - User is logged in'});
});


module.exports = router;
```



<br>





#### Export the `router` in `routes/auth.js`

```js
//		routes/auth.js
...
		...

module.exports = router;
```



<br>



#### Import the Postman collection from ``



<br>



#### In Postman, test the routes in the following order:

####   `/signup`,  `/private` ,`/logout` ,`/login` and again `/private`.



<br>



Postman will automatically save cookies on the Headers for the next requests. 

Example: after `/signup` cookie is returned in the response and Postman will set that cookie on all the requests in the collection, so that next time we send request, that cookie with session.id is sent automatically to the server.



<br>







#### Create the `/me` route in `routes/auth.js`

```js
//		routes/auth.js

//  GET    '/me'
router.get('/me', isLoggedIn(), (req, res, next) => {
  res.json(req.session.currentUser);
});
```

<br>



#### We can also edit the `/me` route to ensure password is not sent to the client side

```js
//		routes/auth.js

//  GET    '/me'
router.get('/me', isLoggedIn(), (req, res, next) => {
  req.session.currentUser.password = '*';
  res.json(req.session.currentUser);
});
```

<br>



