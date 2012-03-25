var should     = require('should'),
    feedserver = require('../test_help/feedserver'),
    feedfinder = require ('../lib/feedfinder');

describe('feedfinder', function(){

  before(function(){
    feedserver.start(process.env.PORT || 10101);
  });

  describe('feeds', function(){

    describe('handling bad input', function(){
      it('should return empty on 404', function(done){
        feedfinder.feeds(feedserver.makeFeedUrl('404'), function(err, results){
          results.should.have.length(0);
          done();
        });
      });
      it('should return empty with no feeds', function(done){
        feedfinder.feeds(feedserver.makeUrl(), function(err, results){
          results.should.have.length(0);
          done();
        });
      });
    });

    describe('handling direct feeds', function() {
      it('should detect atom feeds and return them', function(done){
        feedfinder.feeds(feedserver.makeFeedUrl('atom'), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('atom'));
          done();
        });
      });
      it('should detect rss2 feeds and return them', function(done){
        feedfinder.feeds(feedserver.makeFeedUrl('rss2'), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('rss2'));
          done();
        });
      });
      it('should detect rss0.92 feeds and return them', function(done){
        feedfinder.feeds(feedserver.makeFeedUrl('rss'), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('rss'));
          done();
        });
      });
    });

    describe('finding feed types', function(){
      it('should find the atom feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['atom']), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('atom'));
          done();
        });
      });
      it('should find the rss2 feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['rss2']), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('rss2'));
          done();
        });
      });
      it('should find the rss feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['rss']), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('rss'));
          done();
        });
      });
      it('should find the rel=feed feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['atom::feed']), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('atom'));
          done();
        });
      });
      it('should find the rel="feed alternate" feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['atom::feed alternate']), function(err, results){
          results.should.have.length(1);
          results[0].should.equal(feedserver.makeFeedUrl('atom'));
          done();
        });
      });
    });

    describe('feed order', function(){
      it('should find the atom feed before the rss2 feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['rss2','atom']), function(err, results){
          results.should.have.length(2);
          results[0].should.equal(feedserver.makeFeedUrl('atom'));
          results[1].should.equal(feedserver.makeFeedUrl('rss2'));
          done();
        });
      });
      it('should find the atom feed before the rss feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['rss','atom']), function(err, results){
          results.should.have.length(2);
          results[0].should.equal(feedserver.makeFeedUrl('atom'));
          results[1].should.equal(feedserver.makeFeedUrl('rss'));
          done();
        });
      });
      it('should find the rss2 feed before the rss feed', function(done){
        feedfinder.feeds(feedserver.makeUrl(['rss','rss2']), function(err, results){
          results.should.have.length(2);
          results[0].should.equal(feedserver.makeFeedUrl('rss2'));
          results[1].should.equal(feedserver.makeFeedUrl('rss'));
          done();
        });
      });
    });

  });

  describe('feed', function(){
    describe('handling bad input', function(){
      it('should return undefined on 404', function(done){
        feedfinder.feed(feedserver.makeFeedUrl('404'), function(err, result){
          should.not.exist(result);
          done();
        });
      });
      it('should return undefined with no feeds', function(done){
        feedfinder.feed(feedserver.makeUrl(), function(err, result){
          should.not.exist(result);
          done();
        });
      });
    });

    describe('regular usage',function(){
      it('should return single feed even if there are more than one', function(done){
        feedfinder.feed(feedserver.makeUrl(['rss2','atom']), function(err, result){
          result.should.equal(feedserver.makeFeedUrl('atom'));
          done();
        });
      });
    });
  });
});