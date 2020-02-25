  var sax = require("sax"),strict = true; //Streaming XML parser
  var fs = require('fs'); //filesystem
  var natural = require('natural'); //NLP module
  var sw = require('stopword') //A list of Stop Words like "is", "the" that have little to no significance in search
  var lineByLine = require('n-readlines');
  var saxStream = sax.createStream(strict, strict)
  var tokenizer = new natural.WordTokenizer();
  var steno = require('steno')
  //Variable Declaration + initializations
  var docLimit = 100, sharname = 1, pagecount = 0, pageindex = null, onpage = false
  curTag = '', finallist = [], shar = new Map(), totalarticles = 0, s = new Date();
  //Streaming XML parser begin
  saxStream.on("opentag", function (node) {
    //Current Tag name into curTag
    curTag = node.name;
    //if curTag = page then increment pagecout and set onpage true
    if(node.name == 'page'){
      pagecount++;
      onpage = true;
    }
    })
  //event emmited when content of some tag is read
  saxStream.on("text", function (text) {
    //Read & Write first id tag into padeindex
    if(onpage && curTag == 'id' && pageindex == null){
      pageindex = text;
    }
    //Read title and write into pagetitle
    if(onpage && curTag == 'title'){
      text = text.replace(/([A-Z])/g, ' $1').trim();
      finallist = txtToList(text, finallist);
    }

    else if(onpage && curTag === 'text'){
      finallist = txtToList(text, finallist);
      var freq = new Map();
      finallist.forEach(function(element) {
        if(freq[element])
        freq[element]++; 
        else 
        freq[element] = 1;
      });
      for(word in freq){
        if(!hasNumber(word)){
        if(shar[word] != undefined && Array.isArray(shar[word])){
          var arr = shar[word];
          arr.push({id: pageindex,freq: freq[word]});
          shar[word] = arr;
        }
        else {
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
  saxStream.on("error", function (e) {
    // unhandled errors will throw, since this is a proper node event emitter. clear the error
    this._parser.error = null
    this._parser.resume()
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
  // fs.readdir('./batches', (err, files) => {
  //   console.log(files.length);
  //   if(files.length > 0)
  //   var liner = new lineByLine('./batches/1.txt');
  // });