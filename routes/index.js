var YahooFantasy = require('yahoo-fantasy');
var _ = require('lodash');
// var refresh = require('passport-oauth2-refresh');
var https = require('https');
var querystring = require('querystring');

// WHERE DO I ADD THIS?!?
// refresh.requestNewAccessToken('facebook', 'some_refresh_token', function(err, accessToken, refreshToken) {
  // You have a new access token, store it in the user object,
  // or use it to make a new request.
  // `refreshToken` may or may not exist, depending on the strategy you are using.
  // You probably don't need it anyway, as according to the OAuth 2.0 spec,
  // it should be the same as the initial refresh token.
// });

exports.index = function(req, res) {
  req.session.redirect = '/';

  res.render('index', {
    activeClass: 'home',
    data: {
      resource: ''
    },
    user: req.userObj
  });
};

exports.console = function(req, res) {
  var userObj = {},
    resource = req.params.resource,
    subresource = req.params.subresource,
    view = resource + '/' + subresource;

  req.session.redirect = req.url;

  res.render(view, {
    user: req.userObj,
    data: {
      resource: resource,
      subresource: subresource
    }
  });
};

exports.getData = function(req, res) {
  var func;
  var yf = req.app.yf,
    resource = req.params.resource,
    subresource = req.params.subresource,
    query = req.query;

  // if ( req.isAuthenticated() ) {
  //   yf.setUserToken(req.user.accessToken, req.user.tokenSecret, req.user.sessionHandle);
  // } else {
  //   yf.setUserToken(null, null, null);
  // }

  func = yf[resource][subresource];

  Object.map = function(obj) {
    var key, arr = [];
    for (key in obj) {
        arr.push(obj[key]);
    }
    return arr;
  };

  var args = Object.map(query);

  var callback = function callback(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  };

  if ( _.has(query, 'filters') ) {
    query.filters = JSON.parse(query.filters);
  }

  if ( _.has(query, 'subresources') ) {
    query.subresources = query.subresources.split(',');
  }

  args = _.values(query);
  args.push(callback);

  console.log(resource, subresource);

  switch ( args.length ) {
    case 4:
      // would be key, filters, subs, callback
      // args[2] = args[2].split(',');

      func(args[0], args[1], args[2], args[3]);
      break;

    case 3:
      // would be key, filters or subs, callback for collection
      // could be key, another key, callback too...

      func(args[0], args[1], args[2]);
      break;

    case 2:
      // would be key or filters or subs, callback
      // if ( _.has(query, 'subresources') ) {
      //   args[0] = args[0].split(',');
      // }

      func(args[0], args[1]);
      break;

    default:
      func(args[0]);
      break;
  }
};
