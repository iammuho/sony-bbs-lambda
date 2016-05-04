# Dillinger

This demo LAMBDA app was coded in BBS Meting@Sony

### Tech
- NodeJs 4.0.3
- ImageMagick Lib
- Aws Lib

> ImageMagick and Aws Lib was automaticaly deployed by AWS Lambda.

### Version
0.0.1

### Installation

1. Clone this repo and zip all folder (like lambda.zip)
2. Create an S3 Bucket and rename it whatever you want
1. Create a folder like "images" in S3 Bucket
2. Create a lambda function
3. Skip template, upload the code.For Handler setting, give the  "zipname.handler" ( i.e lambda.handler)
4. Set memory 128 MB (In fact My code uses aroundly 80mb for CPU but minimum is 128)
5. Set Timeout to 5 sec.
6. And save it.
7. Set eventsource to Object Created (ALL) from your s3 butcket. Source is "images/" and give suffix any unique image name with the extension: 'png', 'jpg', 'jpeg', 'gif'. (i.e : source : images/ suffix:_base.jpg)
8. Go to s3/images and upload a file to trig your aws lambda.
9. Thats All! Working..

## Blogs

[MuhammetArslan](http://muhammetarslan.com.tr)

[WidiWiki](http://widiwiki.com)

License
----

MIT


