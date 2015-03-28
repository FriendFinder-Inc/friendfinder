var passport = require('passport');
var MeetupStrategy = require('passport-meetup').Strategy;
var User = require('../../api/user/user.model');
var Tag = require('../../api/tag/tag.model');
var Meetup = require('../../api/meetup/meetup.model');
var https = require('https');

exports.setup = function (User, config) {
  passport.use(new MeetupStrategy({
    consumerKey: config.meetup.clientID,
    consumerSecret: config.meetup.clientSecret,
    callbackURL: config.meetup.callbackURL,
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {
    var rid = req.session.rid;
    // add topics to profile tags
    var newTags = [];
    for(var i = 0; i < profile._json.results[0].topics.length; i++){
      newTags.push(profile._json.results[0].topics[i].name);
    }

    var meetupId = profile._json.results[0].id;
    var options = {
      method: 'GET',
      hostname: 'api.meetup.com',
      path: "/2/groups?"+
            "&sign=true"+
            "&member_id="+meetupId+
            "&access_token="+token
    };

    var data = '';
    // get all groups the user belongs to
    var req = https.request(options, function(res) {
      res.on('data', function(buffer) {
        data += buffer;
      });
      res.on('end', function(){
        var json = JSON.parse(data.toString('utf-8'));
        var groups = [];
        var categories = {}; // no duplicates (optimization)
        for(var i = 0; i < json.results.length; i++){
          var group ={};
          group.name = json.results[i].name;
          group.id = json.results[i].id;
          // try to get image
          if(json.results[i].group_photo){
            if(json.results[i].group_photo.highres_link){
              group.img = json.results[i].group_photo.highres_link;
            } else if (json.results[i].group_photo.photo_link){
              group.img = json.results[i].group_photo.photo_link;

            } else if (json.results[i].group_photo.thumb_link){
              group.img = json.results[i].group_photo.thumb_link;
            }
          } else {
            group.img = null;
          }
          group.link = json.results[i].link;
          groups.push(group);
          categories[json.results[i].category.name] = true;
        }
        // help user's not only find people in their same meetup groups,
        // but people in meetup groups of similar categories :)
        newTags = newTags.concat(Object.keys(categories));
        exports.sendMeetupData(rid, meetupId, newTags, groups, done);
      })
    });
    req.end();
    req.on('error', function(e) {
      console.log('MEETUP API ERROR: failed to get groups for user:', meetupId, e);
    });

  }));
};

exports.sendMeetupData = function(rid, meetupId, newTags, groups, done){
  db
  .update(rid)
  .set({'meetupId': meetupId})
  .scalar()
  .then(function (total) {
    Meetup.addGroups(rid, groups, function(res){
      Tag.update(rid, {
          add: newTags,
          remove: []
        }, function(res){
          done(null, res);
      });
    });
  });
};
