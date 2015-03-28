'use strict';

// Schema for user model
var User = function(params) {
  params = params || {};
  this.props = {};
  this.props.details =       params.details;
  this.props.email =         params.email;
  this.props.location =      params.location;
  this.props.birthday =      params.birthday;
  this.props.hometown =      params.hometown;
  this.props.school =        params.school;
  this.props.employer =      params.employer;
  this.props.facebookId =    params.facebookId;
  this.props.fbAccessToken = params.fbAccessToken;
  this.props.name =          params.name;
  this.props.preferences =   params.preferences;
  this.props.profile =       params.profile;
  this.props.role =          params.role;
  this.props.views =         params.views;
  this.props.created =       params.created;
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

User.bookmark = function(fromRid, toRid, cb) {
  createEdge(fromRid, toRid, 'bookmarked', cb);
};

User.getAllBookmarks = function(rid, cb) {
  db.query("select expand( out ) from ( select out('bookmarked') from "+rid+" )")
  .then(function (bookmarks) {
    cb(bookmarks);
  });
};

User.update = function(rid, params, cb) {
  db.update(rid).set({
    details: params.details,
    profile: params.profile
  })
  .scalar()
  .then(function (total) {
    cb(total);
  });
};

User.prototype.delete = function(cb) {

};

// TODO: gremlin refactor
User.mutualInterests = function(userA, userB, cb) {

  // var query = "select expand( intersect( $likesA, $likesB ) )"+
  //             " let $likesA = ( select out('likes') from RegisteredUser where facebookId = "+userA+" ),"+
  //             " let $likesB = ( select out('likes') from RegisteredUser where facebookId = "+userB+" )";
  //
  // db.query(query).then(function (mutual) {
  //   console.log('mutual', mutual)
  // });

  var mutual = [];
  var userALikes = "select out('likes') from RegisteredUser where facebookId = "+userA;
  var userBLikes = "select out('likes') from RegisteredUser where facebookId = "+userB;
  db.query(userALikes).then(function (interestsA) {
    db.query(userBLikes).then(function (interestsB) {
      var cluster = interestsA[0].out[0].cluster;
      var apos = [];
      var bpos = [];
      for(var j = 0; j < interestsA[0].out.length; j++){
        apos.push(interestsA[0].out[j].position);
      }
      for(var k = 0; k < interestsB[0].out.length; k++){
        bpos.push(interestsB[0].out[k].position);
      }
      apos = apos.filter(function(n) {
        return bpos.indexOf(n) != -1
      });

      var rids = [];
      for(var m = 0; m < apos.length; m++){
        var temp = '#'+cluster+':'+apos[m];
        rids.push(temp);
      }
      var ridStr = '[';
      for(var n = 0; n < rids.length; n++){
        var tmp = n+1 < rids.length ? rids[n]+', ' : rids[n] + ']';
        ridStr += tmp;
      }

      var query = "select from Page where @rid in "+ridStr;

      db.query(query)
      .then(function(mutual){
        cb(mutual);
      })
    });
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
