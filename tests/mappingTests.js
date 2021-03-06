var assert = require('assert'),
    explicitMapper = require('../src/index')

describe('for a single object', function(){

    it('shouldn\'t break when given a null object', function(){
        var mapObj = [ "MyField" ];
        var srcObj = null;

        var mapper = explicitMapper(mapObj);
        var dstObj = mapper.map(srcObj);

        assert(dstObj === null);
    });

    describe('and a mapping consisting of simple copies', function(){
        var mapObj =
        [
            'simpleA',
            'simpleC',
            'falsy'
        ];

        var srcObj = {
            simpleA: 'alpha',
            simpleB: 'bravo',
            simpleC: 'charlie',
            simpleD: 'delta',
            falsy: false
        };

        var dstObj = {};

        beforeEach(function(){
            var mapper = explicitMapper(mapObj);
            dstObj = mapper.map(srcObj);
        });

        it('should copy mapped fields that exist to the destination', function(){
            assert(dstObj.simpleA === 'alpha');
            assert(dstObj.simpleC === 'charlie');
        });

        it('shouldnt copy mapped fields that exist to the destination', function(){
            assert(!dstObj.simpleB);
        });

        it('shouldnt copy fields that do not exist in the map', function(){
            assert(!dstObj.simpleD);
        });

        it('should copy falsy fields', function() {
            assert(dstObj.falsy !== undefined);
        });
    });

    describe('and a mapping consisting of field aliases', function(){
        var mapObj =
        [
            {'oldName' : 'newName'},
            {'sub.deep' : 'shallow'}
        ];

        var srcObj = {
            oldName: 'alpha',
            sub: {
                deep: 'beta'
            }
        };

        var dstObj = {};

        beforeEach(function(){
            var mapper = explicitMapper(mapObj);
            dstObj = mapper.map(srcObj);
        });

        it('should map the old field to the new field', function(){
            assert(dstObj.newName === 'alpha');
        });

        it('should handle dot notation in the source field', function(){
            assert(dstObj.shallow === 'beta');
        });
    });

    describe('and a mapping with custom value transforms', function(){
        var mapObj =
        [
            {
                srcName:'complexoldname',
                dstName:'complexnewname',
                customTransform: function (srcObj, val){
                    return val.toUpperCase();
                }
            }
        ];

        var srcObj = {
            complexoldname: 'alpha'
        };

        var dstObj = {};

        beforeEach(function(){
            var mapper = explicitMapper(mapObj);
            dstObj = mapper.map(srcObj);
        });

        it('should map the old field to the new field', function(){
            assert(dstObj.complexnewname);
        });

        it('should run the custom transform', function(){
            assert(dstObj.complexnewname === 'ALPHA');
        });
    });

    describe('and a mapping with post mapping transforms', function(){
        var mapObj =
            [
                "fieldA",
                function(srcObj,dstObj){
                    dstObj.Custom = 'fish';
                }
            ];

        var srcObj = {
            fieldA: 'alpha'
        };

        var dstObj = {};

        beforeEach(function(){
            var mapper = explicitMapper(mapObj);
            dstObj = mapper.map(srcObj);
        });

        it('should run the custom transform', function(){
            assert(dstObj.Custom === 'fish');
        });
    });
});

describe('for an array of objects', function(){
    var mapObj =
        [
            {'simpleA': 'SimpleB'}
        ];

        var srcObj = {
            simpleA: 'alpha'
        };

        var dstObj = {};

        beforeEach(function(){
            var mapper = explicitMapper(mapObj);
            dstObj = mapper.map([srcObj, srcObj]);
        });

        it('should map all elements of the array', function(){
            assert(dstObj.length === 2);
            assert(dstObj[1].SimpleB === 'alpha')
        });
});

describe('for a single object and given custom mapping args', function(){
    var mapObj =
        [
            {
                srcName:'complexoldname',
                dstName:'complexnewname',
                customTransform: function (srcObj, val, options){
                    return val + options.breadVal.toUpperCase();
                }
            },
            function(srcObj,dstObj, options){
                dstObj.Custom = options.fishVal;
            }
        ];

    var srcObj = {
        simpleA: 'alpha',
        complexoldname: 'oldVal'
    };

    var dstObj = {};

    beforeEach(function(){
        var mapper = explicitMapper(mapObj);
        dstObj = mapper.map(srcObj, { fishVal:'haddock', breadVal:'loaf' });
    });

    it('it should pass the mapping options to a custom element mapping function', function(){
        assert(dstObj.complexnewname === 'oldValLOAF');
    });

    it('it should pass the mapping options to a post mapping function', function(){
        assert(dstObj.Custom === 'haddock');
    });
});


describe('for a single object and given a mapper to map composite objects', function(){
    var internalMap = [ {"simpleB":"newSimpleB"} ];
    var mapObj =
        [
            "simpleA",
            {
                srcName:'internalObject',
                dstName:'newInternalObject',
                mapper: explicitMapper(internalMap)
            }
        ];

    var srcObj = {
        simpleA: "alpha",
        internalObject:{
            simpleB: "beta"
        }
    };

    var dstObj = {};

    beforeEach(function(){
        var mapper = explicitMapper(mapObj);
        dstObj = mapper.map(srcObj);
    });

    it('it should map other fields as normal', function(){
        assert(dstObj.simpleA === "alpha");
    });

    it('it should map the composite field using the supplied mapper', function(){
        assert(dstObj.newInternalObject.newSimpleB === "beta");
    });
});