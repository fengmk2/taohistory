
var express = require('express');

var app = express.createServer(
    express.static(__dirname)
);

var db = require('mongoskin').db('localhost:27017/taohistory');
db.bind('histories');
db.histories.ensureIndex({num_iid: 1, user: 1}, {unique: true}, function() {console.log(arguments);});

app.get('/history/save', function(req, res, next) {
    var item = req.query, cb = item.callback, user = item.user, num_iid = item.num_iid;
    delete item.callback;
    delete item._;
    db.histories.findOne({user: user, num_iid: num_iid}, function(err, doc) {
        if(!doc) {
            item.visit_count = 1;
            item.updated_at = new Date();
            item.visit_at = [item.updated_at];
            db.histories.insert(item, function(err) {
//                console.log('insert', arguments)
            });
        } else {
            doc.visit_count += 1;
            doc.updated_at = new Date();
            for(var k in item) {
                doc[k] = item[k];
            }
            if(!doc.visit_at) {
                doc.visit_at = [];
            }
            doc.visit_at.push(doc.updated_at);
            db.histories.save(doc, function() {
//                console.log('update', arguments)
            });
        }
    });
    res.send(cb + '(' + JSON.stringify(item) + ');');
});

app.get('/history', function(req, res, next) {
    var cb = req.query.callback, query = {user: req.query.user};
    var count = 49, page = parseInt(req.query.page || 1);
    if(page == NaN || page <= 0) {
        page = 1;
    }
    db.histories.find(query).sort({updated_at: -1}).skip(count * (page - 1)).limit(count).toArray(function(err, items) {
        db.histories.count(query, function(err, count) {
            res.send(cb + '(' + JSON.stringify({count: count, items: items || []}) + ');');
        });
    });
});

app.listen(80);