var types = {
  // http://en.wikipedia.org/wiki/Atom_(standard)#Example_of_an_Atom_1.0_feed
  'atom' : {
    body : '<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Example Feed</title><subtitle>A subtitle.</subtitle><link href="http://example.org/feed/" rel="self" /><link href="http://example.org/" /><id>urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6</id><updated>2003-12-13T18:30:02Z</updated><author><name>John Doe</name><email>johndoe@example.com</email></author><entry><title>Atom-Powered Robots Run Amok</title><link href="http://example.org/2003/12/13/atom03" /><link rel="alternate" type="text/html" href="http://example.org/2003/12/13/atom03.html"/><link rel="edit" href="http://example.org/2003/12/13/atom03/edit"/><id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id><updated>2003-12-13T18:30:02Z</updated><summary>Some text.</summary></entry></feed>',
    type : 'application/atom+xml'
  },
  // http://en.wikipedia.org/wiki/RSS#Example
  'rss2' : {
    body : '<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>RSS Title</title><description>This is an example of an RSS feed</description><link>http://www.someexamplerssdomain.com/main.html</link><lastBuildDate>Mon, 06 Sep 2010 00:01:00 +0000 </lastBuildDate><pubDate>Mon, 06 Sep 2009 16:45:00 +0000 </pubDate><ttl>1800</ttl><item><title>Example entry</title><description>Here is some text containing an interesting description.</description><link>http://www.wikipedia.org/</link><guid>unique string per item</guid><pubDate>Mon, 06 Sep 2009 16:45:00 +0000 </pubDate></item></channel></rss>',
    type : 'application/rss+xml'
  },
  // http://en.wikipedia.org/wiki/RSS#Example
  'rss' : {
    body : '<?xml version="1.0"?><rss version="0.92"><channel><title>Uats\'ap. Noticias RSS.</title><link>http://www.uatsap.com</link><description> XML (Extensible Markup Language) es el formato universal para datos en la web. XML permite fácilmente a los desarrolladores describir y proporcionar contenido, datos estructurados para cualquier aplicación de una forma estándard, XML no sustituye a HTML; es un formato que lo complementa. </description><cloud domain="datos.uatsap.com" port="80" path="/RPC2" registerProcedure="datos.rssNotificar" protocol="xml-rpc"/><item><title> RSS Ficheros </title><link> http://www.uatsap.com </link><description> Obtén respuesta a tus preguntas acerca de los ficheros RSS</description><source url="http://www.uatsap.com/music/uatsap.mp3" length="19917410" type="audio/mpeg" /></item><item><title> ¿Cómo sindicar noticias RSS? </title><link> http://www.uatsap.com </link><description> Manual para utilizar RSS y sindicar noticias en tu web </description><source url="http://www.uatsap.com/music/radio.mp3" length="34518490" type="audio/mpeg" /></item></channel></rss>',
    type : 'text/xml'
  }
}

var feedserver_url;

function serveInner(response, body, content_type) {
  response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': content_type });
  response.end(body)
}

function serveType(response, type, params) {
  var stuff = types[type];
  if (stuff) {
    return serveInner(response, stuff.body, (params.old_content ? 'text/xml' : stuff.type));
  }
  else {
    response.writeHead(404);
    return response.end();
  }
}

function makeFeedUrl(type,params) {
  return [feedserver_url, type, params ? require('querystring').stringify(params) : ''].join('');
}

function servePage(response, params) {
  var feeds = params.feeds.split(',') || [];
  var body = ['<!doctype><html><title>Home Page</title>'];

  feeds.forEach(function(feed){
    if(!feed) return;
    var split = feed.split(':');
    var url = split[0];
    var mime;
    if (split.length > 1) {
      mime = split[1];
    }
    if (!mime) {
      switch(url) {
        case 'atom':
          mime = 'application/atom+xml';
          break;
        case 'rss2':
        case '404':
          mime = 'application/rss+xml';
          break;
        case 'rss':
        default:
          mime = 'text/xml';
          break;
      }
    }

    var rel = (split.length > 2) && split[2] ? split[2] : 'alternate';

    Array.prototype.push.apply(body, ['<link rel="', rel,'" type="', mime,'" href="', makeFeedUrl(url),'" title="A Feed">']);
  });
  body.push('</head><body>yay!</body></html>');
  body = body.join('');
  response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': 'text/html' });
  response.end(body)
}

function server(request, response) {
  var requrl = require('url').parse(request.url, true);
  if (requrl.pathname === '/') {
    return servePage(response, requrl.query);
  }
  return serveType(response, requrl.pathname.slice(1), requrl.query);
}

module.exports.start = function(port_number) {
  feedserver_url = 'http://localhost:' + port_number + '/';
  return require('http').createServer(server).listen(port_number);
}

module.exports.makeUrl = function(feeds) {
  return [feedserver_url,'?feeds=', Array.isArray(feeds) ? feeds.join(',') : ''].join('');
}

module.exports.makeFeedUrl = makeFeedUrl;
