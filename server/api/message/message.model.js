'use strict';

// Schema for message model
var Message = function(params) {
  params = params || {};
  this.props = {};
  this.props.to =               params.to;
  this.props.toEmail =          params.toEmail;
  this.props.toFacebookId =     params.toFacebookId;
  this.props.toName =           params.toName;
  this.props.from =             params.from;
  this.props.fromEmail =        params.fromEmail;
  this.props.fromFacebookId =   params.fromFacebookId;
  this.props.fromName =         params.fromName;
  this.props.timeSent =         new Date();
  this.props.timeRead =         params.timeRead;
  this.props.content =          params.content;
};

// utility function
var createEdge = function(fromRid, toRid, type){
  db.create('EDGE', type)
  .from(fromRid)
  .to(toRid)
  .one()
  .then(function (edge) {
  });
};

Message.prototype.create = function(cb) {
  db.insert().into('Message').set(this.props).one()
  .then(function (message) {
    cb(message);
  });
};


//TODO refactor optimize?
Message.prototype.send = function(cb) {
  var self = this;
  var query = "select from Message where ( to = "+self.props.to+" and from = "+self.props.from+" ) or "+
                                        "( from = "+self.props.to+" and to = "+self.props.from+" )";
  db.query(query)
  .then(function (chatHead) {
    db.insert().into('Message').set(self.props).one()
    .then(function(message){
      if(!chatHead.length){ // first contact
        createEdge(self.props.from, message['@rid'], 'sent');
        createEdge(message['@rid'], self.props.to, 'received');
      } else {
        db.query("traverse out('next') from "+chatHead[0]['@rid']).then(function(last){
          //TODO how to return just one record?
          last = last[last.length-1]
          createEdge(last['@rid'], message['@rid'], 'next');
          createEdge(message['@rid'], last['@rid'], 'previous');
        });
      }
      cb(message);
    }); // end message insert
  }); // end chatHead query
};

Message.findOne = function(params, cb) {
  db.select().from('Message').where(params).one()
  .then(function (message) {
    cb(message);
  });
};

Message.update = function(rid, params, cb) {
  db.update(rid).set(params)
  .scalar()
  .then(function(total) {
    cb(total);
  });
};

Message.findByFilters = function(params, cb) {
  db.select().from('Message').where(params).all()
  .then(function (messages) {
    cb(messages);
  });
};

//TODO: refactor queries
Message.getAll = function(rid, cb) {
  rid = '#'+rid.cluster +':'+rid.position;
  var query = "select expand( out ) from ("+
                  "select out('sent') from "+rid+" )";
  db.query(query).then(function (chatHeadsOut) {
    var query = "select expand( in ) from ("+
                    "select in('received') from "+rid+" )";
    db.query(query).then(function(chatHeadsIn){
      var chatHeads = chatHeadsOut.concat(chatHeadsIn);
      var threads = [];
      var getThread = function(i, query){
        db.query(query).then(function(thread){
          threads.push(thread);
          if(i === chatHeads.length-1){
            cb(threads);
          }
        });
      };
      for(var i = 0; i < chatHeads.length; i++){
        var query = "traverse out('next') from "+chatHeads[i]['@rid'];
        getThread(i, query);
      }
    });
  });
};

module.exports = Message;
