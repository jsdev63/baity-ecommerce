import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { app, storageKey } from 'config/base';
import FirebaseServices from 'services/FirebaseServices';
import FirestoreServices from 'services/FirestoreServices';
import { routes } from './route';

const userStorageKey = `${storageKey}_USER`;
const groupStorageKey = `${storageKey}_GROUP`;
const userNameStorageKey = `${storageKey}_USERNAME`;
const userImgStorageKey = `${storageKey}_LOGO`;

const AppRoute = ({ component: Component, layout: Layout, parent: _Parent, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => (
        <Layout>
          <Component {...props}  {..._Parent} />
        </Layout>
      )} />
  )
}


const AuthRoute = ({ component: Component, layout: Layout, parent: _Parent, adminFlag, ...rest }) => {
  const {
    state: {
      authenticated: authFlag,
    },
  } = _Parent;

  const userRole = adminFlag ? 'admin' : 'user';
  console.log(authFlag, userRole, adminFlag)
  return (
    <Route
      {...rest}
      render={props => (
        <Layout>
          {authFlag === "admin" || authFlag === userRole ?
            <Component {...props} {..._Parent} />
            :
            <Redirect
              to={{ pathname: '/login', state: { from: props.location } }}
            />
          }
        </Layout>
      )
      }
    />
  )
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      currentUser: null,
      group: null,
      userName: '',
      cartCount: 0,
      userImg: '',
      owner: '',
    };
    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.getCart = this.getCart.bind(this);
  }


  componentWillMount() {
    console.log(`${this.constructor.name}.componentWillMount`);

    if (window.localStorage.getItem(userStorageKey)) {
      console.log('user from local storage after parse');
      console.log(JSON.parse(window.localStorage.getItem(userStorageKey)));
      this.setState(
        {
          currentUser: JSON.parse(window.localStorage.getItem(userStorageKey)),
          authenticated: true,
          group: window.localStorage.getItem(groupStorageKey),
          userImg: window.localStorage.getItem(userImgStorageKey),
        },
      );
    }
    // the current user is: firebase.auth().currentUser
    // For more info on firebase Auth object check the "user lifecycle" in:
    // (https://firebase.google.com/docs/auth/users)
    // Note that: app.auth() is short for firebase.auth(app)
    this.removeAuthListener = app.auth().onAuthStateChanged((user) => {
      console.log('user from firebase auth');
      console.log(user);
      this.setCurrentUser(user);
    });
  }

  componentWillReceiveProps(nextProps) {
    console.log(`${this.constructor.name}.componentWillReceiveProps`);
    console.log('nextProps');
    console.log(nextProps);
  }

  componentWillUnmount() {
    this.removeAuthListener();
  }

  // For more info on user management in firebase see:
  // (https://firebase.google.com/docs/auth/web/manage-users)
  setCurrentUser(user) {
    if (user) {
      let owner;
      // cache user object to avoid firebase auth latency bug
      window.localStorage.setItem(userStorageKey, JSON.stringify(user));

      FirestoreServices.readDBRecord('group', user.uid).then((value) => {
        console.log(value);
        console.log(value.group);

        if (value.group === 'prof') {
          owner = user.uid;
          FirestoreServices.businesses.where('owner', '==', owner)
            .onSnapshot((snapshot) => {
              snapshot.forEach((val) => {
                window.localStorage.setItem(userImgStorageKey, val.imgUrl);
                this.setState({
                  userImg: val.data().imgUrl,
                  owner,
                });
              });
            });
          console.log('value.group');
          FirestoreServices.readDBRecord('profUser', `${user.uid}`)
            .then((val) => {
              // cache username value and group value
              window.localStorage.setItem(groupStorageKey, value.group);
              window.localStorage.setItem(userNameStorageKey, val.name);

              this.setState({
                currentUser: user,
                authenticated: true,
                group: value.group,
                userName: val.name,
              });
              return this.getCart(user);
            });


        } else if (value.group === 'normal') {
          FirestoreServices.normalUsers.where('uid', '==', `${user.uid}`)
            .onSnapshot((snapshot) => {
              snapshot.forEach((val) => {
                window.localStorage.setItem(userImgStorageKey, val.imgUrl);
                this.setState({
                  userImg: val.data().imgUrl,
                });
              });
            });

          FirestoreServices.readDBRecord('normalUser', `${user.uid}`)
            .then((val) => {
              window.localStorage.setItem(groupStorageKey, val.group);
              window.localStorage.setItem(userNameStorageKey, val.name);

              this.setState({
                currentUser: user,
                authenticated: true,
                group: val.group,
                userName: val.name,
              });
              const b = this.getCart(user);
              return b;
            });
        }
      });
    } else {

      /*
        // We can get the folloiwng information. See: (https://firebase.google.com/docs/auth/web/manage-users)
        name = user.displayName;
        email = user.email;
        photoUrl = user.photoURL;
        emailVerified = user.emailVerified;
        uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                          // this value to authenticate with your backend server, if
                          // you have one. Use User.getToken() instead.
        // This is the information for providers (email&password, facebook, google, ...etc)
        user.providerData.forEach(function (profile) {
          console.log("Sign-in provider: " + profile.providerId);
          console.log("  Provider-specific UID: " + profile.uid);
          console.log("  Name: " + profile.displayName);
          console.log("  Email: " + profile.email);
          console.log("  Photo URL: " + profile.photoURL);
        });
      */

      // No user is logged in
      // 1- clean up auth cache
      window.localStorage.removeItem(userStorageKey);
      window.localStorage.removeItem(groupStorageKey);
      window.localStorage.removeItem(userNameStorageKey);
      window.localStorage.removeItem(userImgStorageKey);

      // 2- clean up state
      this.setState({
        currentUser: null,
        authenticated: false,
        userName: 'sssss',
        cartCount: 0,
        userCart: '',
        userImg: '',
        owner: '',
      });
    }
  }

  getCart(user) {
    // get items in basket
    // FirestoreServices.getBasket()
    FirebaseServices.basket.child(`${user.uid}/items`).once('value', (snapshot) => {
      // Listen for document metadata changes
      console.log(`val.childCount ${snapshot.numChildren()}`);
      this.setState({
        cartCount: snapshot.numChildren(),
      });
      return snapshot.numChildren();

      // if (doc.exist){
      //   const currentCount = doc.exists ? doc.data().count : 0
      //   var count = Object.keys(doc.data().items)
      //   console.log("val.childCount " + count.length);
      //
      //   this.setState({cartCount: count.length})
      //   return docs.size
      // }
    });
  }

  updateCart(add, remove) {
    let newCount = 0;
    if (remove) {
      this.setState({ cartCount: newCount });
    } else {
      if (add) {
        newCount = this.state.cartCount + 1;
        console.log('Item added');
      } else {
        newCount = this.state.cartCount - 1;
        console.log('Item removed');
      }
      this.setState({ cartCount: newCount });
    }
  }


  render() {
    console.log(routes)
    return (
      <BrowserRouter>
        <Switch>
          {
            routes ?
              Object.keys(routes).map((routeName) => {
                switch (routeName) {
                  case 'publicRoutes': {
                    return routes[routeName].map((routeProps) => (
                      <AppRoute exact path={routeProps.path} {...routeProps} parent={this} />
                    ))
                  }
                  case 'authRoutes': {
                    return routes[routeName].map((routeProps) => (
                      <AuthRoute exact path={routeProps.path} {...routeProps} parent={this} adminFlag={false} />
                    ))
                  }
                  case 'adminRoute': {
                    return routes[routeName].map((routeProps) => (
                      <AuthRoute exact path={routeProps.path} {...routeProps} parent={this} adminFlag={true} />
                    ))
                  }
                }
              })
              :
              null
          }
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
