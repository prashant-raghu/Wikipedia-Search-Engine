var natural = require('natural'); //NLP module
var sw = require('stopword') //A list of Stop Words like "is", "the" that have little to no significance in search
var tokenizer = new natural.WordTokenizer();
var fs = require('fs'); //filesystem
var lineByLine = require('n-readlines');

//search query as 3rd argument
var query = process.argv[2];
var qarr = txtToList(query);
console.log('tokenized query is ', qarr);
var nooflines = 1;

//for each document compute tfidf and return the document with max tfidf score
//create a map of idf score as they aren't per document
var qmap = new Map();
for(word of qarr){
    qmap[word] = 0;
}
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./index.txt')
  });
lineReader.on('line', function (line) {
    var s1="", temp1="";
    for(var a of line){
        if(a == ':'){
            s1 = temp1;
            break;
        }
        temp1 += a;
    }
    if(qmap[s1] != undefined){
        var temp1="";
        for(var a of line){
            if(a == ":"){
                temp1 = "";
            }
            temp1 += a;
        }
        var docs = 0;
        for(c of temp1)if(c == ';')docs++;
        qmap[s1] += docs;
    }
    nooflines++;
});
lineReader.on('close', function(line){
    fs.readFile('./metadata.txt', 'utf8', function(err, data) {
        if (err) throw err;
        var temp1="";
        for(var a of data){
            temp1 += a;
            if(a == ":"){
                temp1 = "";
            }
        }
        var articles = parseInt(temp1);
        console.log('Number of Articles in index is ', articles);
        for(word of qarr){
            console.log(word, qmap[word]);
        }

      });
})

function txtToList(text){
    var list = [];
    if(!text)return list;
    tokenized = tokenizer.tokenize(text);
    stopworded = sw.removeStopwords(tokenized);
    stopworded.forEach(function(element) {
      element = element.toLowerCase();
      list.push(natural.PorterStemmer.stem(element));
    });
    return list;
  }