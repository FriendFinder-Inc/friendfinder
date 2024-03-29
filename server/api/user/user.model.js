'use strict';

var moment = require('moment');

// Schema for user model
var User = function(params) {
  params = params || {};
  this.props = {};
  this.props.details =       params.details;
  this.props.email =         params.email;
  this.props.location =      params.location;
  this.props.lat =           params.lat;
  this.props.long =          params.long;
  this.props.birthday =      params.birthday;
  this.props.facebookId =    params.facebookId;
  this.props.fbAccessToken = params.fbAccessToken;
  this.props.name =          params.name;
  this.props.preferences =   params.preferences;
  this.props.profile =       params.profile;
  this.props.role =          params.role;
  this.props.views =         params.views;
  this.props.created =       params.created;
  this.props.lastOnline =    params.lastOnline;
};

// utility function
var createEdge = function(fromRid, toRid, type, cb){
  db.create('EDGE', type)
  .from(fromRid)
  .to(toRid)
  .one()
  .then(function (edge) {
    cb(edge);
  })
  .catch(function(err){
    var msg = 'ORIENTDB ERROR: failed to create edge, '+err.message;
    console.log(msg)
    cb(msg)
  });
};

// utility function
var deleteEdge = function(fromRid, toRid, type, cb){
  db.delete('EDGE', type)
  .from(fromRid)
  .to(toRid)
  .one()
  .then(function (edge) {
    cb(edge);
  })
  .catch(function(err){
    var msg = 'ORIENTDB ERROR: failed to delete edge, '+err.message;
    console.log(msg)
    cb(msg)
  });
};

User.prototype.create = function(cb) {
  db.insert().into('RegisteredUser').set(this.props).one()
  .then(function (user) {
    cb(user);
  });
};

User.findOne = function(params, cb) {
  db.select().from('RegisteredUser').where(params).one()
  .then(function (user) {
    cb(user);
  });
};

User.getById = function(rid, cb) {
  db.query('select from '+rid)
  .then(function (user) {
    cb(user[0]);
  });
};

User.update = function(rid, params, cb) {
  db.update(rid).set(params)
  .scalar()
  .then(function(total) {
    cb(total);
  });
};

User.delete = function(rid, cb) {
  db.query('delete vertex '+rid)
  .then(function (user) {
    cb(user);
  });
};

User.bookmark = function(fromRid, toRid, cb) {
  createEdge(fromRid, toRid, 'bookmarked', cb);
};

User.removeBookmark = function(fromRid, toRid, cb) {
  deleteEdge(fromRid, toRid, 'bookmarked', cb);
};

User.removeMeetups = function(fromRid, toRids, cb) {
  if(!Array.isArray(toRids)){
    toRids = [toRids];
  }
  for(var i = 0; i < toRids.length; i++){
    deleteEdge(fromRid, toRids[i], 'member', cb);
  }
};

User.getEdge = function(edge, rid, cb) {
  db.query("select expand( out ) from ( select out('"+edge+"') from "+rid+" )")
  .then(function (data) {
    cb(data);
  });
};

User.getConnectionPath = function(ridFrom, ridTo, cb) {
  db.query("select expand(path) from (select shortestFriendsPath( "+ridFrom+" , "+ridTo+", 'BOTH') as path)")
  .then(function (path) {
    var users = [];
    var len = 0;
    for(var i = 0; i < path.length; i++){
      var rid = '#'+path[i]['@rid'].cluster+':'+path[i]['@rid'].position;
      db.query('select from '+rid)
      .then(function(user){
        users.push(user[0]);
        if(++len === path.length){
          cb(users);
        }
      });
    }
  });
};

User.getMutual = function(edge, ridA, ridB, cb) {
  //TODO: after 30th how do we handle this???
  if(edge === 'friends'){
    var query = "select expand(mutual) from (select intersect( $userA, $userB ) as mutual "+
                "let $userA = (select from ( select expand(out('"+edge+"')) from "+ridA+" ) where @class = 'RegisteredUser'), "+
                    "$userB = (select from ( select expand(out('"+edge+"')) from "+ridB+" ) where @class = 'RegisteredUser'))";
  } else {
    var query = "select expand(mutual) from (select intersect( $userA, $userB ) as mutual "+
                "let $userA = ( select expand(out('"+edge+"')) from "+ridA+" ), "+
                    "$userB = ( select expand(out('"+edge+"')) from "+ridB+" ))";
  }
  db.query(query)
  .then(function(mutual){
    cb(mutual);
  });
};


// Query db for users that match the filters
// This function is the whole point of the website!
User.findByFilters = function(user, params, cb) {
  var PAGE_SIZE = 30;
  var milesToKm = { // why are we still not on the metric system?...
    '5mi': 8,
    '25mi': 40,
    '50mi': 80,
    '100mi': 120,
    'anywhere': 41000
  };
  var makeString = function(list){
    var str = '';
    for(var i = 0; i < list.length; i++){
      str += "'"+list[i]+"'";
      if(i+1 != list.length){
        str += ', ';
      }
    }
    return str;
  }
  // console.log('FILTERS:   ', params);
  var buildQuery = function(){
    if(params.details){
      params.details = JSON.parse(params.details);
    }
    if(params.ageRange){
      params.ageRange = JSON.parse(params.ageRange);
      var minAge = moment().subtract(parseInt(params.ageRange.min), 'years');
      var maxAge = moment().subtract(parseInt(params.ageRange.max), 'years');
      var bdStart = maxAge.format('YYYY-MM-DD 00:00:00');
      var bdEnd = minAge.format('YYYY-MM-DD 00:00:00');
    }
    if(params.sort === 'distance'){
      if(!params.details.distance){
        params.details.distance = ['anywhere'];
      }
      var query = "select from ( select @rid, name, location, profile, birthday, facebookId, $distance from RegisteredUser where "
        +"[lat, long, $spatial] near ["
        +user.lat+', '+user.long+", {'maxDistance': "+milesToKm[params.details.distance[0]]+'}] ) ';
        query += ' where rid <> '+user['@rid'];

      // handle all the profile detail filters
      if(Object.keys(params.details).length-1){
        var count = 1;
        query += ' and';
        for(var key in params.details){
          if(key != 'distance'){
            query += " details."+key+".value in [ "+makeString(params.details[key])+" ] ";
            if(count++ < Object.keys(params.details).length-1){
              query += ' and';
            }
          }
        }
      }
      // handle all the keyword filters
      if(params.tags){
        if(Object.keys(params.details).length-1){
          query += 'and';
        } else {
          query += ' and';
        }
        params.tags = params.tags.split(',');
        for(var i = 0; i < params.tags.length; i++){
          query += " '"+params.tags[i]+"' in out('likes').name"
          if(i+1 != params.tags.length){
            query += ' and';
          }
        }
      }
      if(params.ageRange){
        query += " and birthday between '"+bdStart+"' and '"+bdEnd+"'";
      }
      query += ' ) order by distance';
      query += " skip "+params.page*PAGE_SIZE;
      query += ' limit '+PAGE_SIZE;
      return query;
    }
    // mutual friends or interests
    else {
      var edge = (params.sort === 'mutual friends') ? 'friends' : 'likes';
      if(params.sort === 'mutual meetups'){
        edge = 'member';
      }
      var dir = (params.sort === 'mutual friends') ? 'out' : 'both';
      if(edge === 'friends' && params.excludeFriends){
        //TODO
      } else {
        var query = "select @rid, name, location, profile, birthday, facebookId, count(*) from ("+
                      "select expand( "+dir+"('"+edge+"')."+dir+"('"+edge+"').removeAll(@this)) from "+user['@rid']+
                        ") where @class = 'RegisteredUser'";

        // handle all the profile detail filters
        if(Object.keys(params.details).length){
          for(var key in params.details){
            if(key != 'distance'){
              query += " and details."+key+".value in [ "+makeString(params.details[key])+" ] ";
            }
          }
        }
        // handle all the keyword filters
        if(params.tags){
          params.tags = params.tags.split(',');
          for(var i = 0; i < params.tags.length; i++){
            query += " and '"+params.tags[i]+"' in out('likes').name"
          }
        }
        if(params.ageRange){
          query += " and birthday between '"+bdStart+"' and '"+bdEnd+"'";
        }
        if(params.details.distance && params.details.distance[0] != 'anywhere'){
          query += " and distance(lat, long, "+user.lat+', '+user.long+") < "+milesToKm[params.details.distance[0]];
        }
        query += " group by name order by count desc";
        query += " skip "+params.page*PAGE_SIZE;
        query += " limit 30";
        return query;
      }
    }
  };

  var query = buildQuery();
  // console.log('FINAL QUERY', query);
  db.query(query)
  .then(function (users) {
    cb(users);
  });
};

module.exports = User;
