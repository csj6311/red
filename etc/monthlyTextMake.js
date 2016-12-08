var fs = require( 'fs' );


require( "d:/work/csj_nodejs_common_modules/initialize__redCrawling.js" );
var cheerio  = global.csj.STATIC.NPM_MODULE.cheerio;
var fs       = global.csj.STATIC.NPM_MODULE.fs;
var winston  = global.csj.STATIC.NPM_MODULE.winston;
var mongoose = global.csj.STATIC.NPM_MODULE.mongoose;
var fse      = global.csj.STATIC.NPM_MODULE.fse;
//var text = fs.readFileSync( './test.txt', 'utf-8' )

/*
 console.log(text)
 var re = text.match('\<li.*class=.note.*[\n]+.*?</li>\g');
 var myArray = re.exec(text);
 
 if ( myArray != null) {
 for ( i = 0; i < myArray.length; i++ ) {
 var result = "myArray[" + i + "] = " + myArray[i];
 }
 }
 
 search  = '<item id="item1">firstItem</item><item id="item2">secondItem</item>';
 regex   = new RegExp( /<([^\s]+).*?id="([^"]*?)".*?>(.+?)<\/\1>/gi );
 matches = text.match( regex );
 console.log( matches )
 */

//var files = fs.readdirSync( 'D:/work/project/redCrwData/saveCompleteData/posts_detail/20161107' )
//console.log(files)

global._processStatus = {
    dataPath     : 'D:/work/project/redCrwData/saveCompleteData/posts_detail/20161109/'
    , DataResult : []
    , idx        : 1
};

var db = mongoose.connection;
db.on( 'error', console.error );

mongoose.connect( 'mongodb://49.175.149.94:9001/redData' );
//mongoose.connect( 'mongodb://localhost/redData' );
var Schema = mongoose.Schema;

var redPostDetailSchema = new Schema( {
    
    relate_goods               : [],
    relate_note                : [],
    contents_goods             : [],
    contents_goods_images_list : [],
    regDate                    : {
        year   : Number,
        month  : Number,
        day    : Number,
        hour   : Number,
        minute : Number,
        second : Number
    },
    id                         : String,
    j_goods_desc               : String,
    note_actions_like          : Number,
    published_date             : { type : Date, default : Date.now }
    
} );
var RedPostDetail = mongoose.model( 'redPostDetail', redPostDetailSchema );

var readDate = function () {
    RedPostDetail.find({'regDate.year' : 2016,'regDate.month' : 10},{_id :0,j_goods_desc :1}).exec( function(err, data) {
        console.log(data)
        write(data)
    });
};

var write = function(data){
    
    var file = fs.createWriteStream('./results.txt', {flags: 'a'} );
    for(var i =0; i < data.length; i++){
        file.write(data[i].j_goods_desc+'\n');
    console.log(i+"=> wrt_OK!")
    }
}

var folderName = new Date().toFormat( 'YYYYMMDD' );
var fileName   = new Date().toFormat( 'YYYYMMDDHH24MISS' );
var fileType   = '.log';
var path       = './logs/';
var logType    = { info : 'info', err : 'err' };

var a = fs.existsSync( path + folderName );
console.log( path + folderName );
if ( a === false ) fs.mkdir( path + folderName, 0777 );
//logData 생성시 폴더및 파일명 생성;

var logger = new ( winston.Logger )( {
    transports : [
        new ( winston.transports.Console )( {
            name        : 'consoleLog'
            , colorize  : false
            , timestamp : function () {
                return new Date().toFormat( 'YYYY-MM-DD HH24:MI:SS' );
            }
            , json      : false
        } )
        , new ( winston.transports.File )( {
            name        : 'infoLog'
            , level     : 'info'
            , filename  : path + folderName + "/" + fileName + '_' + logType.info + fileType
            , maxsize   : 1000000
            , maxFiles  : 100
            , timestamp : function () {
                return new Date().toFormat( 'YYYY-MM-DD HH24:MI:SS' );
            }
            , json      : false
        } )
        , new ( winston.transports.File )( {
            name        : 'errorLog'
            , level     : 'error'
            , filename  : path + folderName + "/" + fileName + '_' + logType.err + fileType
            , maxsize   : 1000000
            , maxFiles  : 100
            , timestamp : function () {
                return new Date().toFormat( 'YYYY-MM-DD HH24:MI:SS' );
            }
            , json      : false
        } )
    ]
} );
//var result = dataMakeJson(text)
//console.log(result)
db.once( 'open', function () {
    readDate();
} )