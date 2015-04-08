'use strict';

// Schema for Meetup model
var Meetup = function(params) {
  params = params || {};
  this.props = {};
  this.props.name =     params.name;
  this.props.id =       params.id;
  this.props.img =      params.img;
  this.props.link =     params.link;
};

// utility function
var createEdge = function(fromRid, toRid, type, cb){
  // don't create duplicate edges ever (even with index constraint)
  db.query("select from member where in ="+toRid+" and out = "+fromRid).then(function(edge){
    if(!edge.length){
      db.create('EDGE', type)
      .from(fromRid)
      .to(toRid)
      .one()
      .then(function (edge) {
      })
      .catch(function(err){
        var msg = 'ORIENTDB ERROR: failed to create edge, '+err.message;
        console.log(msg)
        cb(msg)
      });
    }
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
    console.log(msg);
    cb(msg);
  });
};

Meetup.prototype.getOrCreate = function(cb) {
  var self = this;
  Meetup.findOne({id: this.props.id}, function(Meetup){
    if(!Meetup){
      db.insert().into('Meetup').set(self.props).one()
      .then(function (Meetup) {
        cb(Meetup);
      });
    } else { // Meetup already existed
      cb(Meetup);
    }
  });
};

Meetup.addGroups = function(userRid, groups, cb) {
  var count = 0; // closure variable so we know when to return

  // add Meetups to user (create the Meetup if it doesn't exist)
  for(var i = 0; i < groups.length; i++){
    var newMeetup = new Meetup({
      name: groups[i].name,
      id: groups[i].id,
      img: groups[i].img,
      link: groups[i].link
    });
    newMeetup.getOrCreate(function(meetup){
      createEdge(userRid, meetup['@rid'], 'member', cb);
      count++;
      if(count === groups.length){
        cb('success');
      }
    });
  }

};

Meetup.getUserMeetups = function(rid, cb) {
  var query = "select expand( out ) from ( select out('member') from "+rid+" )";
  db.query(query).then(function (Meetups) {
    cb(Meetups);
  });
};


Meetup.findOne = function(params, cb) {
  db.select().from('Meetup').where(params).one()
  .then(function (Meetup) {
    cb(Meetup);
  });
};

Meetup.findByFilters = function(params, cb) {
  // db.select().from('Meetup').where(params).all()
  // .then(function (Meetups) {
  //   cb(Meetups);
  // });
};

module.exports = Meetup;
