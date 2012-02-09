
/**
 * Module dependencies.
 */

var express = require('express')
    uid = require('connect').utils.uid,
    path = require('path'),
    mime = require('mime'),
    fs = require('fs'),
    im = require('imagemagick');
    // Canvas = require('Canvas'),
    // Image = Canvas.Image;

try { fs.mkdirSync(__dirname + '/public/uploads'); } catch (e) {}

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.get('/:id', function (req, res) {
  var dir = __dirname + '/public/uploads/' + req.params.id;
  path.exists(dir, function (exists) {
    if (exists) {
      fs.readdir(dir, function (err, files) {
        if (err) return res.send({ error: err + '' });
        var file = '';
        for (var i = 0; i < files.length; i++) {
          if (mime.lookup(files[i]).indexOf('image/') == 0) {
            file = files[i];
            break;
          }
        }
        res.render('index', { img: req.params.id + '/' + file });
      });      
    } else {
      res.render('index');
    }
  });
});

app.post('/:id/resize', function (req, res) {
  var dir = __dirname + '/public/uploads/' + req.params.id;
  fs.readFile(dir + '/' + req.body.file, function (err, data) {
    console.log(dir + '/' + req.body.file)
    if (err) return res.send({ error: err + '' });

    im.resize({
      srcData: data,
      width: req.body.width
    }, function(err, stdout, stderr){
      if (err) throw err
      fs.writeFile(dir + '/resized/' + req.body.width, stdout, 'binary');
      console.log('resized to ' + req.body.width);
      res.send({ done: true });
    });


    // var img = new Image;
    // img.onload = function () {
    //   console.log('image loaded...%d x %d');
    //   var canvas = new Canvas(req.body.width, req.body.height),
    //       ctx = canvas.getContext('2d');

    //   ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, req.body.width, req.body.height);

    //   var out = fs.createWriteStream(dir + '/resized/' + req.body.width + '.jpg'),
    //       stream = canvas.createJPEGStream();

    //   stream.on('data', function(chunk){
    //     out.write(chunk);
    //   });

    //   stream.on('end', function(){
    //     res.send({ done: true });
    //   });
        
    // };
    // img.onerror = function (e) {
    //   console.log('err', e);
    // };
    // img.src = data;
  });
});

app.post('/new', function(req, res, next) {
  if (req.files && !Array.isArray(req.files.image)) {
    var id = uid(8),
        dir = __dirname + '/public/uploads/' + id;

    fs.mkdir(dir, function (err) {
      if (err) return res.send({ error: err + '' });
      fs.mkdir(dir + '/resized');
      fs.rename(req.files.image.path, dir + '/' + req.files.image.name, function (err) {
        if (err) {
          res.send({ error: err + '' });
        } else {
          res.send({ id: id });
        }
      });      
    });
  } else {
    console.log('no form');
    res.send({ error: 'no file sent' });
  }
});

app.listen(process.env.PORT || 8000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
