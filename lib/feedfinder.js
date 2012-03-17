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
      return cb(new Error('request for ' + url + 'threw did not return with 200'));
    }
  });
}

function isFeed($) {
  return !!($('rss').length > 0 || $('feed[xmlns="http://www.w3.org/2005/Atom"]').length > 0)
}

function findLinkTags($) {
  var urls = [],
      links = $('link[rel*=feed]'),
      atom  = $('link[type="application/atom+xml"]'),
      rss   = $('link[type="application/rss+xml"]'),
      xml   = $('link[type="text/xml"]');

  // favor rel=feed over rel=alternative, and atom over rss

  var lookup = {
    "application/atom+xml" : 3,
    "application/rss+xml"  : 2,
    "text/xml"             : 1
  };

  links.toArray().sort(function(a,b) {
    var a = $(a).attr('type'), b = $(b).attr('type');
    a = lookup[a.toLowerCase()] || 0;
    b = lookup[b.toLowerCase()] || 0;
    return b - a;
  }).forEach(function(e){
    var href = $(e).attr('href');
    if (href) {
      urls.push(href);
    }
  });

  // favor atom over rss over xml
  [atom,rss,xml].forEach(function(results) {
    results.each(function(i, link){
      var el = $(this), rel = el.attr('rel'), href = el.attr('href');
      // want only rel=alternative. we already matched rel=feed
      if (rel && rel.indexOf('alternate') !== -1 && rel.indexOf('feed') === -1 && href) {
        urls.push(href);
      }
    });
  });

  return urls;
}

function findFeeds(url, cb, force_one) {
  var feeds = [];

  if (typeof cb !== 'function') {
    throw new Error('find feed callback is not a function');
  }

  makeRequest(url, function(err, $) {
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
