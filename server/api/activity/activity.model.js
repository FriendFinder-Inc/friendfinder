'use strict';

var Tag = require('../tag/tag.model')
var config = require('../../config/environment');
var GoogleLocations = require('google-locations');
var googl = require('goo.gl');
googl.setKey(config.google.apiKey);
var locations = new GoogleLocations(config.google.apiKey);

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

// Schema for Activity model
var Activity = function(params) {
  params = params || {};
  this.props = {};
  this.props.title =       params.title;
  this.props.description = params.description;
  this.props.location =    params.location;
  this.props.tags =        params.tags;
  this.props.isEvent =     params.isEvent;
  this.props.created =     new Date();
  this.props.creator =     params.creator;
  this.props.creatorFbId = params.creatorFbId;
  this.props.views =       0;
  // optional props
  if(params.date) { this.props.date = new Date(params.date); }
  if(params.url) { this.props.url = params.url; }
  if(params.img) { this.props.img = params.img; }
};

Activity.autoComplete = function(input, cb){
  locations.autocomplete({input: input}, function(err, response) {
    if(err || !response.predictions.length){
      console.log('GOOGLE API ERROR: failed to autocomplete location', err, response);
    }
    cb(response.predictions);
  });
};

Activity.prototype.create = function(cb) {

  var saveActivity = function(){
    db.insert().into('Activity').set(self.props).one()
    .then(function (activity) {
      var params = {
        add: self.props.tags,
        remove: []
      };
      Tag.update(activity['@rid'], params, function(res){
        createEdge(self.props.creator, activity['@rid'], 'created', function(edge){
          cb(activity);
        });
      });
    });
  };

  var self = this;
  // first get the lat/long for the chosen location
  locations.details({placeid: this.props.location}, function(err, details){
    if(err || !details.result){
      console.log('GOOGLE API ERROR: failed to get lat/long for place: ', self.props.location, err);
      cb('failure');
    }
    self.props.location = {
      name: details.result.formatted_address,
      lat: details.result.geometry.location.lat,
      long: details.result.geometry.location.lng
    };
    // then shorten the urls if they exist TODO: refactor logic
    if(self.props.url){
      googl.shorten(self.props.url)
      .then(function (sUrl) {
        self.props.url = sUrl;
        if(self.props.img){
          googl.shorten(self.props.img)
          .then(function (sImg) {
            self.props.img = sImg;
            saveActivity();
          })
          .catch(function(err){
            console.log('GOOGLE API ERROR: failed to shorten imgUrl: ', img, err);
            cb('failure');
          });
        } else {
          saveActivity();
        }
      })
      .catch(function(err){
        console.log('GOOGLE API ERROR: failed to shorten url: ', url, err);
        cb('failure');
      });
    } else if (self.props.img){
      googl.shorten(self.props.img)
      .then(function (sImg) {
        self.props.img = sImg;
        saveActivity();
      })
      .catch(function(err){
        console.log('GOOGLE API ERROR: failed to shorten imgUrl: ', img, err);
        cb('failure');
      });
    } else {
      saveActivity();
    }
  });
};

Activity.findOne = function(params, cb) {
  db.select().from('RegisteredActivity').where(params).one()
  .then(function (Activity) {
    cb(Activity);
  });
};

Activity.bookmark = function(fromRid, toRid, cb) {
  createEdge(fromRid, toRid, 'bookmarked', cb);
};

Activity.getAll = function(rid, cb) {
  db.query("select expand( out ) from ( select out('created') from "+rid+" )")
  .then(function (activities) {
    cb(activities);
  });
};

Activity.update = function(rid, params, cb) {
  db.update(rid).set({
    details: params.details,
    profile: params.profile
  })
  .scalar()
  .then(function (total) {
    cb(total);
  });
};

Activity.delete = function(rid, cb) {
  db.query("delete vertex "+rid)
  .then(function (res) {
    console.log('d', res)
    cb(res);
  });
};

// Query db for Activitys that match the filters
// also sort results
Activity.findByFilters = function(params, cb) {
  var buildQuery = function(){
    var query = 'select * from RegisteredActivity where ';
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
  // console.log('query', query)
  query = 'select * from Activity'; //TODO
  db.query(query)
  .then(function (Activitys) {
    cb(Activitys);
  });
};

module.exports = Activity;
