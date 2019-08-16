  var sax = require("sax"),strict = true; //Streaming XML parser
  var fs = require('fs'); //filesystem
  var natural = require('natural'); //NLP module
  var sw = require('stopword') //A list of Stop Words like "is", "the" that have little to no significance in search
  var lineByLine = require('n-readlines');
  var saxStream = sax.createStream(strict, strict)
  var tokenizer = new natural.WordTokenizer();
  var steno = require('steno')

  var docLimit = 100;
  var sharname = 1;
  var pagecount = 0;
  var pageindex = null;
  var onpage = false;
  var curTag = '';
  var finallist = [];
  var shar = new Map();
  var totalarticles = 0;

  var s = new Date();
  saxStream.on("opentag", function (node) {
    curTag = node.name;
    if(node.name == 'page'){
      pagecount++;
      onpage = true;
    }
    })
  saxStream.on("error", function (e) {
    // unhandled errors will throw, since this is a proper node event emitter. clear the error
    this._parser.error = null
    this._parser.resume()
  })
  saxStream.on("text", function (text) {
    if(onpage && curTag == 'id' && pageindex == null){
      pageindex = text;
    }
    if(onpage && curTag == 'title'){
      text = text.replace(/([A-Z])/g, ' $1').trim();
      finallist = txtToList(text, finallist);
    }
    else if(onpage && curTag === 'text'){
      finallist = txtToList(text, finallist);
      //console.log(pageindex);
      //console.log(finallist);
      var freq = new Map();
      finallist.forEach(function(element) {
        if(freq[element])
        freq[element]++; 
        else 
        freq[element] = 1;
      });
      for(word in freq){
        
        if(!hasNumber(word)){
        //console.log(word);
        //console.log(freq[word]);
        if(shar[word] != undefined && Array.isArray(shar[word])){
          var arr = shar[word];
          //console.log(word);
          //console.log(shar[word]);
          arr.push({id: pageindex,freq: freq[word]});
          shar[word] = arr;
        }
        else {
        //  console.log(shar[word]);
          var cars = new Array({id: pageindex,freq: freq[word]});
          shar[word] = cars;
        }
      }
      }
      if(pagecount >= docLimit){
        writeshar(shar);
      }
      //clear variables
      curTag = '';
      finallist = [];
    }
  })
  saxStream.on("closetag", function (node) {
    if(node == 'page'){onpage = false;pageindex = null;totalarticles++;}
    else if(node == 'mediawiki' && pagecount < docLimit){
      fs.writeFileSync("./metadata.txt", `TotalArticles:${totalarticles}`);
      if(shar)writeshar(shar);
      console.log(Math.round((new Date() - s)/1000) + " seconds");
    }
  })
  function writeshar(shard) {
    arr = [];
    for(word in shard)
      arr.push(word);
    arr.sort();
    var text = '';
    for(word of arr){
      text += word;
      text += ':';
      for(freq of shard[word]){
        text += `${freq.id}-${freq.freq};`;
      }
      text += '\n';
    }
    steno.writeFile("./batches/" + sharname.toString() + ".txt", text, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log(sharname + "was saved!");
      sharname++;
  }); 
    //reset pagecount
    shar = new Map();
    pagecount = 0;
  }
  function hasNumber(myString) {
    return /\d/.test(myString);
  }
  function txtToList(text, list){
    tokenized = tokenizer.tokenize(text);
    stopworded = sw.removeStopwords(tokenized);
    stopworded.forEach(function(element) {
      element = element.toLowerCase();
      list.push(natural.PorterStemmer.stem(element));
    });
    return list;
  }
  // same chunks coming in also go out.
  fs.createReadStream("mini_1000.xml")
    .pipe(saxStream)
  //Merging
  fs.readdir('./batches', (err, files) => {
    console.log(files.length);
    if(files.length > 0)
    var liner = new lineByLine('./batches/1.txt');
  });