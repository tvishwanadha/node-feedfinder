var should = require('should'), feedfinder = require ('../lib/feedfinder');

describe('feedfinder', function(){

  describe('feeds', function(){

    it('should detect feed urls and return them', function(done) {
      feedfinder.feeds('http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&topic=h&num=3&output=rss', function(err, results){
        results.should.have.length(1);
        results[0].should.equal('http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&topic=h&num=3&output=rss');
        done();
      });
    });

    it ('should find a rel="alternate" rss feed when one exists', function(done) {
      feedfinder.feeds('http://news.google.com', function(err, results){
        results.should.include('http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&topic=h&num=3&output=rss');
        done();
      });
    });

    it('should find all rel="alternate" feeds', function(done) {
      feedfinder.feeds('http://googleblog.blogspot.com/', function(err, results){
        results.should.have.length(2);
        results[0].should.equal('http://googleblog.blogspot.com/feeds/posts/default');
        results[1].should.equal('http://googleblog.blogspot.com/feeds/posts/default?alt=rss');
        done();
      });
    });

  });

  describe('feed', function(){

    it('should detect feed urls and return them', function(done) {
      feedfinder.feed('http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&topic=h&num=3&output=rss', function(err, result){
        result.should.equal('http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&topic=h&num=3&output=rss');
        done();
      });
    });

    it('should find rss feed', function(done) {
      feedfinder.feed('http://news.google.com', function(err, result){
        result.should.equal('http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&topic=h&num=3&output=rss');
        done();
      });
    });

    it('should find the atom feed when atom and rss two exist', function(done) {
      feedfinder.feed('http://googleblog.blogspot.com/', function(err, result){
        result.should.equal('http://googleblog.blogspot.com/feeds/posts/default');
        done();
      });
    });

  });

});