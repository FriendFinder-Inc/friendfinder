'use strict';

// Schema for user model
var User = function(params) {
  params = params || {};
  this.props = {};
  this.props.details =       params.details;
  this.props.email =         params.email;
  this.props.location =      params.location;
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
  db.query("select expand(path) from (select shortestPath( "+ridFrom+" , "+ridTo+", 'BOTH') as path)")
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

  var query = "select expand(mutual) from (select intersect( $userA, $userB ) as mutual "+
              "let $userA = ( select expand(both('"+edge+"')) from "+ridA+" ), "+
                   "$userB = ( select expand(both('"+edge+"')) from "+ridB+" ))";
  db.query(query)
  .then(function(mutual){
    cb(mutual);
  });
};


// Query db for users that match the filters
// also sort results
User.findByFilters = function(params, cb) {
  var buildQuery = function(){
    var query = 'select * from RegisteredUser  ';
    var num = 0;
    for(var key in params){
      if(key === 'tags'){
        continue;
      }
      var values = params[key];
      var filter = key.split('.')[1];
      var subquery = '';
      switch(filter){
        case '-ORDER BY':
          subquery = '';
          break;
        case 'last online':
          subquery = '';
          break;
        case 'distance':
          subquery = '';
          break;
        default:
          if(typeof values === 'string'){ // single filter value
            var valuesString = '"'+values+'"';
          } else { // array
            var valuesString = '';
            for(var i = 0; i < values.length; i++){
              if(values.length === 1 || i === values.length-1){
                valuesString += '"'+values[i]+'"';
              } else {
                valuesString += '"'+values[i]+'",';
              }
            }
          }
          subquery = 'details.'+filter+'.value'+' in ['+valuesString+']';
          break;
      }
      if(num === 0 || num === Object.keys(params).length-1){
        query += subquery;
      } else {
        query += subquery+' AND ';
      }
      num++;
    }
    return query;
  };

  var query = buildQuery();
  console.log('query', query)
  db.query(query)
  .then(function (users) {
    cb(users);
  });
};

module.exports = User;
