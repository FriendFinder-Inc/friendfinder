'use strict';

var Tag = require('../tag/tag.model');
var Message = require('../message/message.model');
var config = require('../../config/environment');
var request = require('request');
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
  this.props.lat =         null;
  this.props.long =        null;
  this.props.tags =        params.tags;
  this.props.isEvent =     params.isEvent;
  this.props.created =     new Date();
  this.props.creator =     params.creator;
  this.props.creatorName = params.creatorName;
  this.props.creatorFbId = params.creatorFbId;
  this.props.views =       0;
  // optional props
  if(params.date) {
    this.props.date = new Date(params.date);
    //TODO: workaround for prod bug
    if(config.env === 'production'){
      this.props.date.setDate(this.props.date.getDate()+1);
    }
  }
  if(params.url) { this.props.url = params.url; }
  if(params.img) { this.props.img = params.img; }
};

Activity.autoComplete = function(input, latlong, cb){

  if(config.quotaguard.url){
    var options = {
        proxy: config.quotaguard.url, // make request from static IP
        url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+
              input+
              '&key='+
              config.google.apiKey+
              '&location='+latlong+
              '&radius='+150000, //150km = ~93mi
        headers: {
            'User-Agent': 'node.js'
        }
    };
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        cb(JSON.parse(body).predictions);
      } else {
        console.log('GOOGLE API ERROR: failed to autocomplete location', error, response);
      }
    });
  } else { // we are on localhost
    locations.autocomplete({input: input}, function(err, response) {
      if(err || !response.predictions.length){
        console.log('GOOGLE API ERROR: failed to autocomplete location', err, response);
      }
      cb(response.predictions);
    });
  }
};

Activity.prototype.create = function(cb) {

  var saveActivity = function(){
    db.insert().into('Activity').set(self.props).one()
    .then(function (activity) {
      var params = {
        add: self.props.tags,
        remove: []
      };
      Tag.update(activity['@rid'], params, 'tagged', function(res){
        createEdge(self.props.creator, activity['@rid'], 'created', function(edge){
          cb(activity);
        });
      });
    });
  };

  var self = this;
  // first get the lat/long for the chosen location
  if(config.quotaguard.url){
    var options = {
        proxy: config.quotaguard.url, //make request from static IP
        url: 'https://maps.googleapis.com/maps/api/place/details/json?placeid='+
              self.props.location+
              '&key='+
              config.google.apiKey,
        headers: {
            'User-Agent': 'node.js'
        }
    };
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body).result;
        self.props.location = result.formatted_address;
        self.props.lat = result.geometry.location.lat;
        self.props.long = result.geometry.location.lng;
        // then shorten the urls if they exist
        var count = (self.props.url ? 1 : 0) + (self.props.img ? 1 : 0);
        var i = 0;
        if(self.props.url){
          var options = {
            method: 'post',
            proxy: config.quotaguard.url, // make request from static IP
            body: {longUrl: self.props.url},
            json: true,
            url: 'https://www.googleapis.com/urlshortener/v1/url?key='+config.google.apiKey
          };
          request.post(options, function(err,response,body){
            if (!body.error) {
              self.props.url = body.id;
              if(++i === count){
                saveActivity();
              }
            } else {
              console.log('GOOGLE API ERROR: failed to shorten URL: ', self.props.url, body.error.message);
            }
          });
        }
        if(self.props.img){
          var options = {
            method: 'post',
            proxy: config.quotaguard.url, // make request from static IP
            body: {longUrl: self.props.img},
            json: true,
            url: 'https://www.googleapis.com/urlshortener/v1/url?key='+config.google.apiKey
          };
          request.post(options, function(err,response,body){
              if (!body.error) {
                self.props.img = body.id;
                if(++i === count){
                  saveActivity();
                }
              } else {
                console.log('GOOGLE API ERROR: failed to shorten URL: ', self.props.img, body.error.message);
              }
          });
        }
        if(!count){
          saveActivity();
        }
      } else {
        console.log('GOOGLE API ERROR: failed to get lat/long for place: ', self.props.location, err);
      }
    });
  } else { // we are on localhost
    locations.details({placeid: this.props.location}, function(err, details){
      if(err || !details.result){
        console.log('GOOGLE API ERROR: failed to get lat/long for place: ', self.props.location, err);
        cb('failure');
      }
      self.props.location = details.result.formatted_address;
      self.props.lat = details.result.geometry.location.lat;
      self.props.long = details.result.geometry.location.lng;
      // then shorten the urls if they exist
      var count = (self.props.url ? 1 : 0) + (self.props.img ? 1 : 0);
      var i = 0;
      if(self.props.url){
        googl.shorten(self.props.url)
        .then(function (sUrl) {
          self.props.url = sUrl;
          if(++i === count){
            saveActivity();
          }
        });
      }
      if(self.props.img){
        googl.shorten(self.props.img)
        .then(function (sImg) {
          self.props.img = sImg;
          if(++i === count){
            saveActivity();
          }
        });
      }
      if(!count){
        saveActivity();
      }
    });
  }
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
  db.update(rid).set(params)
  .scalar()
  .then(function (total) {
    cb(total);
  });
};

Activity.request = function(fromRid, params, cb) {
  createEdge(fromRid, params.rid, 'requested', function(){
    db.query('select name, facebookId, email, preferences from '+params.creator)
    .then(function(user){
      var data = {
        to:               params.creator,
        toEmail:          user[0].email,
        toFacebookId:     user[0].facebookId,
        toName:           user[0].name.split(' ')[0],
        from:             params.from,
        fromEmail:        params.fromEmail,
        fromFacebookId:   params.fromFacebookId,
        fromName:         params.fromName,
        timeSent:         new Date(),
        timeRead:         null,
        content:          'Hi '+user[0].name.split(' ')[0]+"! I would love to join you in '"+params.title+"'."
      };
      var message = new Message(data);
      message.send(function (message) {
        if(!message) { return res.send(404); }
        if(user[0].preferences.email.activityRequest){
          sendgrid.send({
            to:       data.toEmail,
            from:     'noreply@friendfinder.io',
            fromname: 'friendfinder',
            subject:  'new message from '+params.fromName,
            text:     data.content
          }, function(err, json) {
            if (err) {
              console.log('SENDGRID API ERROR: failed to send message ', message['@rid'], err);
              cb('failed');
            }
            cb('success');
          });
        } else{
          cb('success');
        }
      });
    });
  });
};

Activity.delete = function(rid, cb) {
  db.query("delete vertex "+rid)
  .then(function (res) {
    cb(res);
  });
};

// Query db for Activities that match the filters
Activity.findByFilters = function(user, params, cb) {
  var PAGE_SIZE = 30;
  var milesToKm = { // why are we still not on the metric system?...
    '5mi': 8,
    '25mi': 40,
    '50mi': 80,
    '100mi': 120,
    'anywhere': 41000
  };
  // console.log('PARAMS', params);
  var buildQuery = function(){
    if(params.details){
      params.details = JSON.parse(params.details);
    }
    if(!params.details.distance){
      params.details.distance = ['anywhere'];
    }
    var query = "select from ( select *, $distance from Activity where "
      +"[lat, long, $spatial] near ["
      +user.lat+', '+user.long+", {'maxDistance': "+milesToKm[params.details.distance[0]]
      +'}] ) where creator <> '+user['@rid'];
    // handle all the profile detail filters
    if(Object.keys(params.details).length-1){ //TODO make more robust
      query += ' and isEvent = true';
    }
    // handle all the keyword filters
    if(params.tags){
      params.tags = params.tags.split(',');
      for(var i = 0; i < params.tags.length; i++){
        query += " and '"+params.tags[i]+"' in out('tagged').name"
      }
    }
    if(params.sort === 'distance'){
      query += ' order by distance';
    } else {
      query += ' order by created desc'; //newest on top
    }
    query += ' skip '+PAGE_SIZE*params.page;
    query += ' limit '+PAGE_SIZE;
    return query;
  };

  var query = buildQuery();
  // console.log('FINAL QUERY', query);
  db.query(query)
  .then(function (activities) {
    cb(activities);
  });
};

module.exports = Activity;
