'use strict';

// Schema for Tag model
var Tag = function(params) {
  params = params || {};
  this.props = {};
  this.props.name =       params.name;
  this.props.created =    params.created;
};

// utility function
var createEdge = function(fromRid, toRid, type, cb){
  // don't create duplicate edges ever (even with index constraint)
  db.query("select from tagged where in ="+toRid+" and out = "+fromRid).then(function(edge){
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
    console.log(msg)
    cb(msg)
  });
};

Tag.prototype.getOrCreate = function(cb) {
  var self = this;
  // just make all tags lowercase for simplicity
  self.props.name = self.props.name.toLowerCase();
  Tag.findOne({name: this.props.name}, function(tag){
    if(!tag){
      db.insert().into('Tag').set(self.props).one()
      .then(function (Tag) {
        cb(Tag);
      });
    } else { // tag already existed
      cb(tag)
    }
  })
};

Tag.update = function(userRid, params, cb) {
  var count = 0; // closure variable so we know when to return
  var tags = params.add.concat(params.remove);


  // add tags to user (create the tag if it doesn't exist)
  for(var i = 0; i < params.add.length; i++){
    var newTag = new Tag({
      name: params.add[i],
      created: new Date()
    });
    newTag.getOrCreate(function(tag){
      createEdge(userRid, tag['@rid'], 'tagged', cb);
      count++;
      if(count === tags.length){
        cb('success');
      }
    });
  }

  // remove tags from user (and delete tag if no other user has it)
  var removeEdge = function(tagRid){
    deleteEdge(userRid, tagRid, 'tagged', function(res){
      var query = "select expand( in ) ( select in('tagged') from "+tagRid+" )";
      db.query(query).then(function(users){
        if(!users.length){
          // tag has no edges, delete it (save storage space)
          db.query("delete vertex "+tagRid).then(function () {
            count++;
            if(count === tags.length){
              cb('success');
            }
          });
        } else {
          count++;
          if(count === tags.length){
            cb('success');
          }
        }
      });
    });
  };
  for(var j = 0; j < params.remove.length; j++){
    removeEdge(params.remove[j].rid);
  }

};

Tag.getUserTags = function(rid, cb) {
  var query = "select expand( out ) from ( select out('tagged') from "+rid+" )";
  db.query(query).then(function (tags) {
    cb(tags);
  });
};


Tag.findOne = function(params, cb) {
  db.select().from('Tag').where(params).one()
  .then(function (Tag) {
    cb(Tag);
  });
};

Tag.findByFilters = function(params, cb) {
  console.log('in fbf', params)
  // db.select().from('Tag').where(params).all()
  // .then(function (Tags) {
  //   cb(Tags);
  // });
};

Tag.getAll = function(rid, cb) {
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

module.exports = Tag;
