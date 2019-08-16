var fs = require('fs'); //filesystem
var lineByLine = require('n-readlines');
//read 1 & 2 write merged to 2, read 2 and 3 write merged to 4
fs.writeFileSync("./index.txt", "");
fs.readdir('./batches', (err, files) => {
  var index = fs.createWriteStream('./index.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
  console.log(files.length);
  for(var i=2;i<=files.length;i++){
    var batch1 = new lineByLine(`./batches/${i}.txt`);
    var batch2 = new lineByLine(`./batches/${i-1}.txt`);
    let l1 = batch1.next(),l2 = batch2.next();
    while (l1 || l2) {
        if(!l1){
            index.write("\n" + l2);
            l2 = batch2.next()
        }
        else if(!l2){
            index.write("\n" + l1);
            l1 = batch1.next()
        }
        else {
            var s1="",s2="",temp1="",temp2="";
            for(var a of l1){
                if(a == ':'){
                    s1 = temp1;
                    break;
                }
                temp1 += a;
            }
            for(var a of l2){
                if(a == ':'){
                    s2 = temp2;
                    break;
                }
                temp2 += a;
            }
            if(s1 < s2){
                index.write("\n" + l1);
                l1 = batch1.next();
            }
            else if(s1 == s2) {
                var temp1="",temp2="";
                for(var a of l1){
                    if(a == ":"){
                        temp1 = "";
                    }
                    temp1 += a;
                }
                for(var a of l2){
                    if(a == ':'){
                        temp2 = "";
                    }
                    temp1 += a;
                }
                var sec = temp1+temp2;
                index.write("\n" + s1 + ":" + sec);
                l2 = batch1.next();
                l1 = batch1.next();
            }
            else {
                index.write("\n" + l2);
                l2 = batch1.next();
            }
        }
    }
    copyData(`./batches/${i}.txt`, './index.txt')
  }
  copyData( './index.txt', `./batches/${files.length}.txt`)
  console.log('merging Complete');
});

function copyData(savPath, srcPath) {
    fs.readFile(srcPath, 'utf8', function (err, data) {
            if (err) throw err;
            fs.writeFile (savPath, data, function(err) {
                if (err) throw err;
                console.log('complete');
            });
        });
}