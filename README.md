A simple feed finder for node.js, inspired by the [python script originally written by Mark Pilgrim and currently maintained by Aaron Swartz](http://www.aaronsw.com/2002/feedfinder/)

# How it works

0. Checks if resource is a feed
0. Looks for link tags

# Usage

Much like the python inspirateion, offers two functions, `feed` and `feeds`.

    var feedfinder = require('./lib/feedfinder');
    var log = function (err,res) { if (err) console.error(err); else console.log(res); };
    feedfinder.feed('http://googleblog.blogspot.com/', log);
    // http://googleblog.blogspot.com/feeds/posts/default
    feedfinder.feeds('http://googleblog.blogspot.com/', log);
    // [ 'http://googleblog.blogspot.com/feeds/posts/default',
    //   'http://googleblog.blogspot.com/feeds/posts/default?alt=rss' ]