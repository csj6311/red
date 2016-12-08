//----------------------------------------------------------------------------------------------------;

//	REQUIRE;

//----------------------------------------------------------------------------------------------------;

require( "d:/work/csj_nodejs_common_modules/initialize__redCrawling.js" );

//----------------------------------------------------------------------------------------------------;

//	PACKAGE;

//----------------------------------------------------------------------------------------------------;

global.csj.scrappingGoods = global.csj.scrappingGoods || {};

//----------------------------------------------------------------------------------------------------;

//	CLASS - global.csj.scrapping.RedCrw;

//----------------------------------------------------------------------------------------------------;

/**
 * RED 데이터를 Scrapping 하는 객체
 * @class
 * @param {Object} data
 * @author 최석준
 */
global.csj.scrappingGoods.RedCrw = function ( data ) {
    
    
    //--------------------------------------------------;
    
    var _this = this;
    
    //--------------------------------------------------REQUIRE;
    
    var request   = global.csj.STATIC.NPM_MODULE.request;
    var fs        = global.csj.STATIC.NPM_MODULE.fs;
    var winston   = global.csj.STATIC.NPM_MODULE.winston;
    var dateUtils = global.csj.STATIC.NPM_MODULE.dateUtils;
    var path      = global.csj.STATIC.NPM_MODULE.path;
    
    //--------------------------------------------------;
    
    //----------------------------------------------------------------------------------------------------;
    
    //	STATIC;
    
    //----------------------------------------------------------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    /**
     * 게시글 호출 API URL
     * http://m.xiaohongshu.com/api/snsweb/v1/get_related_discovery_by_keyword?keyword=%E9%9F%A9%E5%9B%BD&mode=tag_search&page=1&sort=general
     *
     * 상품리스트 호출 API URL
     * http://m.xiaohongshu.com/api/store/v1/goods/tag?tagName=%E9%9F%A9%E5%9B%BD&tagId=area.52cfdcbeb4c4d64f495e4753&page=1&sort=general
     *
     * 검색시 상품,게시글 호풀 API URL
     * http://m.xiaohongshu.com/api/snsweb/v1/search?keyword=mamonde&mode=word_search
     
     * @property {Object}
     * <code>
     * {
	 *  //...
	 * }
     * </code>
     */
    var _processStatus = {
        url                : {
            post   : 'http://m.xiaohongshu.com/api/snsweb/v1/get_related_discovery_by_keyword?keyword=%E9%9F%A9%E5%9B%BD&mode=tag_search&sort=general&page='
            ,
            goods  : 'http://m.xiaohongshu.com/api/store/v1/goods/tag?tagName=%E9%9F%A9%E5%9B%BD&tagId=area.52cfdcbeb4c4d64f495e4753&sort=general&page='
            ,
            search : 'http://m.xiaohongshu.com/api/snsweb/v1/search?keyword=mamonde&mode=word_search'
        }
        , len              : 30
        , idx              : 1
        , nItemStart       : 0
        , DataResult       : []
        , reRequestCount   : 0
        , fail_request_idx : []
    };
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //----------------------------------------------------------------------------------------------------;
    
    //	EVENT;
    
    //----------------------------------------------------------------------------------------------------;
    
    /**
     * @function
     * @param {Object} err
     * @param {*} result
     */
    _this.evt_Complete__reqData = function ( err, result ) {
        logger.log( 'info', "-[S]-- evt_Complete__reqData" );
        var t = _processStatus;
        if ( err ) console.log( err );
        if ( result.statusCode === 200 ) {
            try {
                _this.reqData_processor( result );
            }
            catch ( exception ) {
                logger.log( 'error', "evt_Complete__logger.log", t.idx, exception );
                t.fail_request_idx.push( t.idx );
                _this.reqData_next();
            }
        }
        logger.log( 'info', "-[E]-- evt_Complete__logger.log" );
    };
    
    //----------------------------------------------------------------------------------------------------;
    
    //	FUNCTION;
    
    //----------------------------------------------------------------------------------------------------;
    
    /**
     * 해당 API에 데이터 요청
     * @function
     */
    _this.reqData = function () {
        logger.log( 'info', "-[S]-- reqData" );
        var t = _processStatus;
        try {
            if ( t.idx < t.len ) {
                try {
                    logger.log( 'info', "--[I]--reqData____request__URL : " + t.url.goods + t.idx );
                    setTimeout( function () {
                        request( t.url.goods + t.idx, _this.evt_Complete__reqData )
                    }, 500 );
                }
                catch ( exception ) {
                    console.log( exception );
                }
            }
        }
        catch ( exception ) {
            logger.log( 'error', "--[I]--reqData____request__URL : " + t.url.goods + t.idx, exception );
        }
        logger.log( 'info', "-[E]-- reqData" );
    };
    
    /**
     * @function
     */
    _this.reqData_next = function () {
        logger.log( 'info', "-[S]-- reqData_next" );
        var t = _processStatus;
        ++t.idx;
        logger.log( 'info', "-[E]-- reqData_next" );
        _this.reqData();
        
    };
    
    /**
     * @function
     * @param {Object} result
     */
    _this.reqData_processor = function ( result ) {
        logger.log( 'info', "-[S]-- reqData_processor" );
        
        var j           = JSON.parse( result.body );
        var t           = _processStatus;
        var crwlingDate = new Date().toISOString();
        j.crwlingDate   = crwlingDate;
        
        var dataCount = j.data.length;
        if ( dataCount > 0 ) {
            logger.log( 'info', "--[I]-- reqData_processor____reqData_write_json Run" );
            t.reRequestCount = 0;
            _this.reqData_write_json( j );
        }
        
        else {
            _processStatus.len = _processStatus.idx;
        }
        logger.log( 'info', "-[E]-- reqData_processor" );
        logger.log( 'info', "-[E]-- start : ", new Date().toFormat( 'YYYYMMDDHH24MISS' ).substring( 0, 12 ) );
        logger.log( 'info', "==========================================================================================" );
    };
    
    /**
     * @function
     * @param {Object} data
     */
    _this.reqData_write_json = function ( data ) {
        logger.log( 'info', "-[S]-- reqData_write_json" );
        var t            = _processStatus;
        var fileFullpath = '../redCrwData/saveCompleteData/goods/';
        
        var dirName = new Date().toFormat( 'YYYYMMDDHH24MISS' ).substring( 0, 10 );
        var fileType = '.json';
        var filename = new Date().toFormat( 'YYYYMMDDHH24MISS' ).substring( 0, 12 ) + '_' + t.idx + fileType;
        
        var c          = JSON.stringify( data );
        var fileResult = fileFullpath + dirName + "/" + filename;
        var a          = fs.existsSync( fileFullpath + dirName );
        if ( a === false ) {
            fs.mkdir( fileFullpath + dirName, 0777 )
            sleep(1000);
        }
        fs.writeFileSync( fileResult, c, 'utf8' );
        
        logger.log( 'info', "--[I]-- reqData_write_json_result :  " + filename );
        logger.log( 'info', "-[E]-- reqData_write_json" );
        _this.reqData_next();
    };
    
    /**
     * 실행 함수
     * @function
     */
    _this.process_run = function () {
            logger.log( 'info', "==========================================================================================" );
            logger.log( 'info', "-[S]-- process_run : ", new Date().toFormat( 'YYYYMMDDHH24MISS' ).substring( 0, 12 ) );
        _this.reqData()
        
    };
    //----------------------------------------------------------------------------------------------------;
    
    //	GETTER / SETTER;
    
    //----------------------------------------------------------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //--------------------------------------------------;
    
    //----------------------------------------------------------------------------------------------------;
    
    //	LOGIC;
    
    //----------------------------------------------------------------------------------------------------;
    
    //logData 생성시 폴더및 파일명 생성
    var sleep = function(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    }
    
    
    var folderName = new Date().toFormat( 'YYYYMMDD' );
    var fileName   = new Date().toFormat( 'YYYYMMDDHH24MISS' );
    var fileType   = '.log';
    var log_path_2 = '/red_goods_data__downlogd_to_json/'
    var log_path_1 = '/goods'
    var log_path_0 = '/logs';
    
    var full_path = path.join( __dirname + log_path_0 + log_path_1 + log_path_2 )
    var logType = { info : 'info', err : 'err' };
    
    var a = fs.existsSync( path + folderName );
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
                , filename  : full_path + fileName + '_' + logType.info + fileType
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
                , filename  : full_path + fileName + '_' + logType.err + fileType
                , maxsize   : 1000000
                , maxFiles  : 100
                , timestamp : function () {
                    return new Date().toFormat( 'YYYY-MM-DD HH24: MI : SS' );
                }
                , json      : false
            } )
        ]
    } );
    
    /*-----------------------------------------------------------------------------------------------------------*/
    /*-----------------------------------------------------------------------------------------------------------*/
    /*날짜관련 function*/
    /*-----------------------------------------------------------------------------------------------------------*/
    
    return this;
};

var redCrw = new global.csj.scrappingGoods.RedCrw();
redCrw.process_run();