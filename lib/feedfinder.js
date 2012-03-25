var request = require('request'),
    cheerio = require('cheerio');

function makeRequest(url, cb) {
  request(url, function(error, response, body) {
    var $;
    if (error) {
      return cb(error);
    }
    if (response && response.statusCode === 200) {
      $ = cheerio.load(body, {xmlMode: true});
      return cb(null, $);
    }
    else {
      return cb(new Error('request for ' + url + ' did not return with 200'));
    }
  });
}

function isFeed($) {
  return !!($('rss').length > 0 || $('feed[xmlns="http://www.w3.org/2005/Atom"]').length > 0);
}

function findLinkTags($) {
  var urls = [],
      atom  = $('link[type="application/atom+xml"]'),
      rss   = $('link[type="application/rss+xml"]'),
      xml   = $('link[type="text/xml"]');

  // rel=feed was removed from the html5 spec (http://www.w3.org/TR/html5-diff/#changes-2009-08-25)
  // rel=feed and rel=feed alternative are obvious feeds
  // but the correct one is rel=alternate

  // favor atom over rss over xml
  [atom,rss,xml].forEach(function(results) {
    results.each(function(i, link){
      var el = $(this), rel = el.attr('rel'), href = el.attr('href');
      if (rel && (rel.indexOf('alternate') !== -1 || rel.indexOf('feed') !== -1) && href) {
        urls.push(href);
      }
    });
  });

  /*
  urls = urls.filter(function(x, i, a){
    return i === a.indexOf(x);
  });
  */

  return urls;
}

function findFeeds(url, cb, force_one) {
  var feeds = [];

  if (typeof cb !== 'function') {
    throw new Error('find feed callback is not a function');
  }

  makeRequest(url, function(err, $) {

    if(err || !$) {
      return cb(err, force_one ? undefined : []);
    }

    // its a feed
    if (isFeed($)) {
      return cb(err, force_one ? url : [url]);
    }

    // look for link tags
    $.merge(feeds, findLinkTags($));

    return cb(err, force_one ? feeds[0] : feeds);
  });
}

function feed(url,cb) { findFeeds(url,cb,true); }
function feeds(url,cb) { findFeeds(url,cb,false); }

module.exports.feed = feed;
module.exports.feeds = feeds;
