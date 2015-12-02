/**
 * Interwebs Imageserver (turboimages)
 *
 * This is an imageserver written in nodejs for working with amazon s3 hosted images. The images will not be
 * cached on s3 after resize - we encourage you to just use cloudfront for that.
 *
 * This product is licensed under the WTFPL (http://www.wtfpl.net/). So do what you want with it.
 **/
(function() {

  // Require dependencies
  var sharp = require('sharp'),
      router = require('router'),
      stream = require('stream'),
      http = require('http'),
      aws = require('aws-sdk'),
      jpegtran = require('jpegtran'),
      finalhandler = require('finalhandler');

  // Setup the aws connection
  if(!process.env.S3_BUCKET) throw new Error('S3 Bucketname is not specified. Define it via env S3_BUCKET.');
  if(!process.env.AWS_ACCESS_KEY_ID) throw new Error('AWS key is not specified. Define it via env AWS_ACCESS_KEY_ID.');
  if(!process.env.AWS_SECRET_ACCESS_KEY) throw new Error('AWS secret is not specified. Define it via env AWS_SECRET_ACCESS_KEY.');

  var s3 = new aws.S3({
    params: {
      Bucket: process.env.S3_BUCKET,
    },
    logger: console
  });

  // The main image processing function
  function _renderImage(req, res) {

    var width = Number(req.params.width),
        effect = req.params.width,
        key = req.params[0];

    if(!isFinite(width)) {
      res.writeHead(400);
      res.end('Image width not numeric.');
    }

    // Log the request
    console.log(new Date() + ' - request image ' + key + ' width width ' + width);

    // Configure the s3 object
    var s3handle = s3.getObject({
      Key: key
    });

    s3handle.on('error', function(e) {
      res.writeHead(e.statusCode);
      res.end(e.message);
      return;
    });

    // Create a read stream from the s3 object
    var imageStream = s3handle.createReadStream();

    // Create the sharp image processor
    // TODO: Currently effects such as crop and blur are not implemented.
    var imageProcessor = sharp()
                           .resize(width)
                           .sharpen()
                           .jpeg(100);

    // Create the imageOptimizer with jpegtran
    var imageOptimizer = new jpegtran(['-optimize', '-progressive', '-copy', 'none']);

    // Run the stream through the processor and return it to the HTTP response
    try {
      imageStream
        .pipe(imageProcessor)
        .pipe(imageOptimizer)
        .pipe(res);
    } catch(e) {
      console.error(new Date(), ' - an error occured:');
      console.error(e);
    }

    return;
  }

  // Configure routing
  var r = router();

  r.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('This is the interwebs image server. Hello :)');
  });

  r.get('/:width/:effect/*', function(req, res) {
    return _renderImage(req, res);
  });

  // Start the server
  var server = http.createServer(function(req, res) {
    r(req, res, finalhandler(req, res));
  });

  server.listen(process.env.PORT || 3000);

  // Handle uncaught exceptions
  process.on('uncaughtException', function(e) {
    console.error(e);
  });

})();