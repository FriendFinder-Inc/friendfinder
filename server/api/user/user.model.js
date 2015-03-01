'use strict';

// Schema for user model
var User = function(params) {
  params = params || {};
  this.props = {};
  this.props.details =     params.details;
  this.props.email =       params.email;
  this.props.facebook =    params.facebook;
  this.props.name =        params.name;
  this.props.preferences = params.preferences;
  this.props.profile =     params.profile;
  this.props.role =        params.role;
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

// Query db for users that match the filters
// also sort results
User.findByFilters = function(params, cb) {
  var buildQuery = function(){
    var query = 'select * from RegisteredUser where ';
    var num = 0;
    for(var key in params){
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
  //console.log('query', query)
  db.query(query)
  .then(function (users) {
    cb(users);
  });
};

module.exports = User;
