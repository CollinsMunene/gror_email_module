const graylog2 = require('graylog2');

exports.logger =new graylog2.graylog({
    hostname:"sales",
    servers: [{ host: 'ec2-13-40-159-87.eu-west-2.compute.amazonaws.com', port: 5555 }]
  });