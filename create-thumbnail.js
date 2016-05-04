// dependencies
 var async     = require('async')
    , AWS     = require('aws-sdk')
    , gm      = require('gm').subClass({ imageMagick: true }) // Enable ImageMagick integration.
    , util    = require('util')
    , request = require('request')
    , config  = require('config')
    , exec = require('child_process').exec;

 AWS.config.update({"region": "eu-west-1"})

// get reference to S3 client 
 var s3 = new AWS.S3();
 
exports.handler = function(event, context) {


  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = event.Records[0].s3.object.key;
  var dstBucket = srcBucket;
  var file    = event.Records[0].s3.object.key.split('.');
  var file_name = file[0].replace("_base", "");
  var file_ext = file[1];
  var dstKey = file_name;

  // Infer the image type.
  var typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.error('unable to infer image type for key ' + srcKey);
    return;
  }

  var validImageTypes = ['png', 'jpg', 'jpeg', 'gif'];
  var imageType = typeMatch[1];
  if (validImageTypes.indexOf(imageType.toLowerCase()) < 0) {
    console.log('skipping non-image ' + srcKey);
    return;
  }

  // Download the image from S3, transform, and upload to a different S3 bucket.
  async.waterfall([
    function download(next) {
      // Download the image from S3 into a buffer.
      s3.getObject({
        Bucket : srcBucket,
        Key    : srcKey
      }, next);
    },
    function tranform(response, next) {
      gm(response.Body).size(function(err, size) {
        

         var canvasWidth = 310;
         var canvasHeight = 310;

         var scalingFactor = Math.min(
            canvasWidth / size.width,
            canvasHeight / size.height
          );
        var newWidth  = scalingFactor * size.width;
        var newHeight = scalingFactor * size.height;

        // Transform the image buffer in memory.
         this.background('#ffffff')
        .resize(newWidth, newHeight)
        .gravity('Center')
        .extent(canvasWidth, canvasHeight)
        .toBuffer(imageType, function(err, buffer) {

              if (err) {
                 console.log("Couldn't upload "+ canvasWidth + "X" + canvasHeight + " Image. Becase of : " + err)     
                 next(err);
              } else {

                      s3.putObject({
                          Bucket      : dstBucket,
                          Key         : dstKey+"_310x310.jpg",
                          Body        : buffer,
                          ContentType : response.ContentType
                        }, function(err, data) {

                          if (err)  {
                              console.log(err)     
                          } else {
                                console.log(canvasWidth + "X" + canvasHeight + " uploaded to S3 Bucket");
                               }
                       });
              }

        });

    });
}],
function (err) {
      if (err) {
        console.error(
          'Unable to resize ' + srcBucket + '/' + srcKey +
          ' and upload to ' + dstBucket + '/' + dstKey +
          ' due to an error: ' + err
        );
        context.done();
      } else {
        console.log(
          'Successfully resized ' + srcBucket + '/' + srcKey +
          ' and uploaded to ' + dstBucket + '/' + dstKey
        );
      }
    }
  );
};
