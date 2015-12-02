# Turbo images server

This is a simple implementation of an imageserver. It assumes Amazon S3 for imagehosting and resizes images via
sharp (https://github.com/lovell/sharp) and optimizes them with jpegtran (http://jpegclub.org/jpegtran/).

## Installation

    git clone https://github.com/michelalbers/turbo-images
    npm i
    export S3_BUCKET=your-bucket-name
    export AWS_ACCESS_KEY_ID=your-access-key-id
    export AWS_SECRET_ACCESS_KEY=your-aws-secret
    PORT=8080 node server.js

## Usage

Just call the server with the following format:

    http://images.yourapp.com:8080/<width>/<effect>/key/for/your/image.jpg

**NOTE: Effects are currently not implemented. So just pass 'none' for <effect>.**

(c) 2015 - Interwebs UG haftungsbeschränkt