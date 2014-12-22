(function () {
    var arrayMethods = {
        /** Returns a shallow copy of this array */
        copy: function () { return this.slice(0); },

        /** Returns true if this array contains 'element', returns false otherwise */
        contains: function (element) { return this.indexOf(element) >= 0; },

        /**  Returns a copy of this array, removing the elements 'from' index 'to' index within it */
        remove: function (from, to) {
            var res = [];
            var i = 0, j = 0;
            for (i = 0; i < from; i++) {
                res[i] = this[i];
            }
            j = i;
            for (i = to; i < this.length; i++) {
                res[j++] = this[i];
            }
            return res;
        },

        /** Returns a copy of this array, rotated 'n' places, counterclockwise if 'n' is positive, clockwise otherwise*/
        rotate: function (n) {
            if (!n) return this.slice(0);
            var length = this.length;
            var res = new Array(length);
            var thisIndex = (n > 0) ? n : length + n, i = 0, j = 0;
            for (i = thisIndex; i < length; i++) {
                res[j++] = this[i];
            }
            for (i = 0; i < thisIndex; i++) {
                res[j++] = this[i];
            }
            return res;
        },

        /**
         * Returns a copy of this array, removing but
         *         the first 'n' elements from it
         *         assumes n=1 when called with no arguments.
         */
        skipFirst: function (n) {
            if (n === 'undefined') n = 1;
            return this.slice(n);
        },

        /**
         * Returns a copy of this array, removing
         *         but the last 'n' elements from it
         *         assumes n=1 when called with no arguments.
         */
        skipLast: function (n) {
            if (n === 'undefined') n = 1;
            if (n > this.length) return [];
            return this.slice(0, this.length - n);
        },

        /**
         * Returns a copy of this array,
         *         sorting its elements randomly
         */

        shuffle: function () {
            array = this.splice(0);
            var m = array.length, t, i;

            // While there remain elements to shuffle…
            while (m) {

                // Pick a remaining element…
                i = Math.floor(Math.random() * m--);

                // And swap it with the current element.
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }

            return array;
        },

        /**
         * Returns an unique array
         */
        makeUnique: function(){
            var u = {}, a = [];
            for(var i = 0, l = this.length; i < l; ++i){
                if(u.hasOwnProperty(this[i])) {
                    continue;
                }
                a.push(this[i]);
                u[this[i]] = 1;
            }
            return a;
        },

        /**
         * Returns this associative array length
         */
        getAssociativeArrayLength: function () {
            return this.length;
        },

        /**
         * Returns a copy of this array that contains the difference
         *         between source array and 'array'
         */
        difference: function (array) {
            var filterFunc = filterOnOtherArray_diff.bind(array);
            return this.filter(filterFunc);
        },

        /**
         * Returns a copy of this array that contains the
         *         intersection between source array and 'array'
         */
        intersection: function (array) {
            var filterFunc = filterOnOtherArray_inter.bind(array);
            return this.filter(filterFunc);
        },

        /**
         * Returns a copy of this array that contains the union
         *   between source array with 'array', removing duplicates
         *    ! fails with a sparse array !
         */
        union: function (array) {
            var obj = {}, res = [], i = 0, k = 0;
            for (i = 0; i < this.length; i++) {
                obj[this[i]] = this[i];
            }
            for (i = 0; i < array.length; i++) {
                obj[array[i]] = array[i];
            }
            for (k in obj) {
                res.push(obj[k]);
            }
            return res;
        }
    };

    // let's install those methods on the prototype
    for (var newMethodName in arrayMethods) {
        installFunction(newMethodName, arrayMethods[newMethodName]);
    }

    function installFunction(name, fn) {
        if (Array.prototype[name]) throw ('Array method ' + name + '() already defined.');
        Object.defineProperty(Array.prototype, name, {
            value: fn
        });
    }

    function filterOnOtherArray_diff(arr, i) {
        return (arr.indexOf(i) < 0);
    }

    function filterOnOtherArray_inter(arr, i) {
        return (arr.indexOf(i) >= 0);
    }
})();
function SimpleRant() {
    this.rantConstructor = function (inputStream) {
        var outputStream = inputStream, re;
        var regex = /\<(.*?)\>/g;
        var matches, token, indexPos;
        var replacement, i = 0, tags={};
        var repetitions=[];
        var separator=[];
        var stringCase=this.getCase(inputStream);

        outputStream = inputStream.toLowerCase(), regex = /(\[.*?\])/g;
        while (matches = regex.exec(inputStream)) {
            // [rep:4][sep:\s]{\8,x}
            re = new RegExp("\\w+", "g");
            token = matches[1].match(re);
            if(token[0] === "sep"){
                separator.push(token[1]);
                //separator=matches[0].match(/[^[\](sep:)]+(?=])/)[0];
            }
            if(token[0] === "rep"){
                repetitions.push(token[1]);
            }
        }
        repetitions.reverse();
        separator.reverse();

        // remove the brackets
        while (matches = regex.exec(inputStream)) {
            inputStream = inputStream.replace(/(\[.*?\])/g, '');
        }

        // instructions in the brackets will only be applied to tokens matched in curly braces
        regex = /(\{.*?\})/;
        var res="";
        var curlymatch;

        while (curlymatch = regex.exec(inputStream)) {
            replacement=this.braceParser(inputStream,curlymatch[1],repetitions,separator);
            inputStream = inputStream.replace(curlymatch[1],replacement);
        }

        // lexer matches (anything inside arrow notation)
        outputStream = this.lexer(inputStream);

        return this.capitalize(outputStream, stringCase);
    };
}


if ('undefined' != typeof module) {
    module.exports.SimpleRant = SimpleRant;
}

SimpleRant.prototype.replaceToken = function (matches, input, matchIndex) {
    var result, modifier = 0, re = new RegExp("\\w+", "g");
    var token = matches[matchIndex].match(re)[0];
    var indexPos = matches.index;
    var matched = matches[matchIndex].match(re);
    // matched[0] contains the token. It can be noun, verb, adj etc.
    // we already know it's valid, because this function doesn't get
    // called unless it is.
    // Let's check if there's any qualifiers or modifiers
    if (token.length > 1) {
        // There are two types. Filters and subs. Let's see what we got
        var mysubs = myfilters = [];
        var dictionary = [];
        if (matched.length > 1) {
            matched.forEach(function (entry, idx) {
                if (idx > 0) {
                    if ("undefined" != typeof dic[token].filters) {
                        if (dic[token].filters.indexOf(entry) > -1) {
                            // Filters are categories of the token, so <adj emotion> will
                            // set filters valid for emotion for the token adj
                            myfilters.push(entry);
                        }
                    }
                    if ("undefined" != typeof dic[token].subs) {
                        if (dic[token].subs.indexOf(entry) > -1) {
                            // Subs are grammatical instructions
                            modifier = dic[token].subs.indexOf(entry);
                        }
                    }
                }
                // So.. now we got the token, the filters and the subs. Let's do some magic
            });
        }
    }
    if (myfilters.length <= 0) {
        if ("undefined" != typeof dic[token].all) {
            dictionary = dictionary.concat(dic[token].all);
        }
    } else {
        myfilters.forEach(function (e) {
            dictionary = dictionary.concat(dic[token][e]);
        });
    }

    if (modifier === 0) {
        matched.forEach(function (e) {
            if (e.toLowerCase() === "modifier") {
                modifier = 1;
            }
        });
    }

    var rand, newToken, replacement = [];
    re = new RegExp(matches[0], 'g');

    rand = Math.floor(Math.random() * dictionary.length);
    if (dictionary[rand].match(/\//) <= 0) {
        newToken = dictionary[rand];
    } else {
        newToken = dictionary[rand].split("/")[modifier];
    }
    replacement.push(newToken);

    rand = Math.floor(Math.random() * dictionary.length);
    return replacement[0];
};


SimpleRant.prototype.lexer = function (input) {
    var tempRes="";
    var result = input, matches, token, replacement = [],regex = /\<(.*?)\>/g;
    while (matches = regex.exec(input)) {
        //console.log(matches);
        // We accept a number of keywords, and they all correlate to the entries in the DIC files
        // First, get the DIC token
        re = new RegExp("\\w+", "g");
        token = matches[1].match(re);
        // Match against valid keywords in valid_tokens
        if (dic.tokens.indexOf(token[0]) != -1) {
            // Now we're ready to pass the token to the parser. It should
            // include the token and any modifiers and subs
            // result = lexer(this, matches, result);

            tempRes = this.replaceToken( matches, result, 1);

            result = result.replace(matches[0], function () {
                return tempRes;
            });
        }
    }
    return result;
};

SimpleRant.prototype.braceParser = function (input, group, reps, sep) {
    var tempRes = "", matchIndex = 1;
    var result = input, matches = [], token, replacement = [], regex;
    matchIndex = 0;
    group = group.replace("}", "");
    group = group.replace("{", "");
    var repetitions=reps.pop();
    var separator=sep.pop();
    var newGroup = '';


    // Check for shorthand codes
    //[rep:10][sep:\N]{\C}
    regex = /\\\w+/g;
    i = 0;
    var replaceGroup='';
    while (matches = regex.exec(group)) {
        //console.log("test");
        var groupCopy = group;
        while (i < repetitions) {
        if(matches[0]==="\\C"){  replaceGroup+=this.randomString(1); }
            i++;
        }

        //groupCopy=groupCopy.replace("\\C", replaceGroup.map(function(e){
        //    return e;
        //}));
        groupCopy=groupCopy.replace("\\C", replaceGroup );
        if (separator.toLowerCase() === "n") groupCopy += separator.replace("n", "\n");
        else if (separator.toLowerCase()  === "s") groupCopy += separator.replace("s", " ");
        else groupCopy += separator;
        return groupCopy;

    }



    // Check for token patterns
    regex = /<(.*?)>/g;
    i = 0;
    while (i < repetitions) {
        while (matches = regex.exec(group)) {
            //console.log("length");
            //console.log(matches.length);

            groupCopy = group;
            re = new RegExp("\\w+", "g");
            token = matches[1].match(re);
            if (dic.tokens.indexOf(token[0]) != -1) {
                if (separator === "n") groupCopy += separator.replace("n", "\n");
                else if (separator === "s") groupCopy += separator.replace("s", " ");
                else groupCopy += separator;
            }
        }
        newGroup += "undefined" == typeof groupCopy ? "" : groupCopy;

        i++;
    }
    //console.log(group);
    return "undefined" != typeof newGroup ? newGroup : group;
};


String.prototype.toTitleCase = function() {
    var i, j, str, lowers, uppers;
    str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless  they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
        'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
            function(txt) {
                return txt.toLowerCase();
            });

    // Certain words should be left uppercase
    uppers = ['Id', 'Tv', 'Lsd'];
    for (i = 0, j = uppers.length; i < j; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
            uppers[i].toUpperCase());

    return str;
};

String.prototype.toWordCase = function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

String.prototype.toSentenceCase = function() {
    var re = /(^\s*\w{1}|\.\s*\w{1})/gi;
    return this.replace(re, function(str) {
        return str.toUpperCase();
    });
};


SimpleRant.prototype.getCase = function (tokenStream) {
    var _case = 0;
    var cases = ["default", "none", "lower", "upper", "title", "word", "first", "sentence"];
    var token, matches, re;
    while (matches = /(\[.*?\])/g.exec(tokenStream)) {
        re = new RegExp("\\w+", "g");
        token = matches[1].match(re);
        if (["case"].indexOf(token[0]) != -1) {
            if (token[0] === "case") {
                if (cases.indexOf(token[1] != -1)) {
                    _case = cases.indexOf(token[1]);
                }
            }
        }
        return cases[_case];
    }
};

SimpleRant.prototype.capitalize = function (s,_case) {
    if(_case==="upper")
        return s.toUpperCase();
    else if(_case==="lower")
        return s.toLowerCase();
    else if(_case==="word")
        return s.toWordCase();
    else if(_case==="title")
        return s.toTitleCase();
    else if(_case==="sentence")
        return s.toSentenceCase();
    else if(_case==="none")
        return s;
    else
        return s[0].toUpperCase() + s.slice(1); //default && first
};


SimpleRant.prototype.randomString = function (l, chars) {
    chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    //chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var rndString = '';
    for (var i = 0; i < l; i++) {
        var rndPos = Math.floor(Math.random() * chars.length);
        rndString += chars.substring(rndPos, rndPos + 1);
    }
    return rndString;
};

var dic={};

dic.tokens=["preposition","firstname","abstract", "activity", "adj", "adv", "color", "conj", "country", "emo", "em", "x", "face", "firstname", "greet", "surname", "noun", "sound", "title", "place", "prefix", "prepos", "pron", "quality", "rel", "sconj", "substance", "timeadv", "timenoun", "unit", "verbimg", "say", "verb", "vocal", "preposition", "yn"];

var abstract={};
dic.abstract=abstract;
dic.abstract.concept=["idea/ideas","lie/lies","philosophy/philosophies","hypothesis/hypotheses","theory/theories","concept/concepts","thought/thoughts","plan/plans","scheme/schemes","notion/notions","conception/conceptions","impression/impressions","proposal/proposals","law/laws","vision/visions","conclusion/conclusions"];
dic.abstract.subjective=["belief/beliefs","opinion/opinions"];
dic.abstract.social=["relationship/relationships","conflict/conflicts","fight/fights","disagreement/disagreements","consensus/consensuses","agreement/agreements","understanding/understandings","friendship/friendships","rivalry/rivalries","feud/feuds","romance/romances"];
dic.abstract.linguistic=["question/questions","answer/answers"];
dic.abstract.all=[].concat(dic.abstract.concept,dic.abstract.subjective,dic.abstract.social,dic.abstract.linguistic);
dic.abstract.subs=["singular","plural"];
dic.abstract.filters=["concept","subjective","social","linguistic"];
var activity={};
dic.activity=activity;
dic.activity.game=["Football","Soccer","Tennis","Basketball","Baseball","Golf","Chess","Checkers","Backgammon","Pong","Super Mario Bros.","The Legend of Zelda","Sonic the Hedgehog","Call of Duty","Battlefield","Hitman","Morrowind","Oblivion","Skyrim","World of Warcraft","Contra","Halo","Doom","Half-Life","Left 4 Dead","Counter-Strike"];
dic.activity.sport=["Football","Soccer","Tennis","Basketball","Baseball","Golf"];
dic.activity.board=["Chess","Checkers","Backgammon"];
dic.activity.video=["Pong","Super Mario Bros.","The Legend of Zelda","Sonic the Hedgehog","Call of Duty","Battlefield","Hitman","Morrowind","Oblivion","Skyrim","World of Warcraft","Contra","Halo","Doom","Half-Life","Left 4 Dead","Counter-Strike"];
dic.activity.all=[].concat(dic.activity.game,dic.activity.sport,dic.activity.board,dic.activity.video);
dic.activity.subs=["default"];
dic.activity.filters=["game","sport","board","video"];
var adj={};
dic.adj=adj;
dic.adj.appearance=["sweaty/sweatiness","soapy/soapiness","veiny/veininess","shady/shadiness","corrugated/corrugation","hulking/hulkingness","jagged/jaggedness","ratty/rattiness","stout/stoutness","whopping/whoppingness","humongous/humongousness","mammoth/mammothness","enormous/enormousness","colossal/colossality","monochromatic/monochromaticness","grimy/griminess","funny-looking/funny looks","gigantic/impressive size","limp/limpness","naked/nakedness","revealing/nakedness","pretty/prettiness","grey/greyness","microscopic/microscopicness","bearded/beardedness","floppy/floppiness","fluffy/fluffiness","dirty/dirt","petite/petiteness","sloppy/sloppiness","wide/wideness","slippery/slipperiness","sopping/wetness","slender/slenderness","dry/dryness","lickable/lickability","wooly/wooliness","colorful/color","mossy/mossiness","transparent/transparence","narrow/narrowness","glossy/glossiness","ancient/ancience","wrinkly/raisins","shriveled/raisins","plump/plumpness","green/greenness","brown/brownness","red/redness","white/whiteness","black/blackness","spiky/spikiness","thick/thickness","furry/furriness","fuzzy/fuzziness","wooden/woodness","bubbly/bubbliness","foamy/foaminess","smoky/smokiness","battered/batteredness","ugly/ugliness","glamourous/glamour","attractive/attractiveness","smoggy/smogginess","sparkling/sparkle","spotless/cleanliness","wide-eyed/wideness","cubic/cubic shape","symmetrical/symmetry","orbital/roundness","exposed/exposure","red-hot/glowing-red heat","bent/deformation","crooked/crookedness","uneven/unevenness","delicate/delicateness","moldy/moldiness","crusty/crustiness","filthy/filth","muscular/beefiness","glittery/glitter","purple/purpleness","ragged/raggedness","weedy/weediness","papery/paperiness","dazzling/sparkle","blinding/brightness","beautiful/beauty","windy/windiness","dusty/dustiness","short/shortness","towering/height","tall/height","menthol/menthol goodness","emaciated/emaciation","iridescent/iridescence","golden/golden luster","invisible/invisibility","powdery/powderiness","furrowed/furrowedness","flaccid/flaccidness"];
dic.adj.nationality=["Spanish/Spanish heritage","French/French heritage","German/German heritage","Italian/Italian heritage","Japanese/Japanese heritage","Chinese/Chinese heritage","Korean/Korean heritage","British/British heritage","African/African heritage","American/American heritage","Norwegian/Norwegian heritage","Russian/Russian heritage","Irish/Irish heritage","Mexican/Mexican heritage","Canadian/Canadian heritage","Australian/Australian heritage","African-American/African-Americanness"];
dic.adj.emotion=["severe/severity","sullen/sullenness","naughty/naughtiness","devilish/devilishness","arrogant/arrogance","indifferent/indifference","cranky/crankiness","bittersweet/bittersweetness","jealous/envy","gay/gayness","thankful/thankfulness","groggy/grogginess","flirty/flirtiness","frightened/fright","evil/evil","cheeky/cheekiness","emo/emo-ness","gleeful/glee","joyful/joy","happy/happiness","bored/boredom","sorrowful/sorrow","sad/sadness","angry/anger","rageing/rage","guilty/guilt","envious/envy","blissful/bliss","interested/interest","smug/smugness","proud/pride","hungry/hunger","ashamed/shame","loving/love","mad/madness","hateful/hate","humiliated/humility","impatient/impatience","surprised/surprise","optimistic/optimism","disappointed/disappointment","remorseful/remorse","contemptuous/contempt","awed/awe","lustful/lust","longing/longing","content/contentfulness","pleasured/pleasure","tormented/torment","horrified/horror","shocked/shock","furious/fury","sly/slyness","aggravated/aggression"];
dic.adj.weather=["sunny/sunniness","rainy/raininess","cloudy/cloudiness","snowy/snowiness","moonlit/moonlight","starry/starriness","foggy/fogginess"];
dic.adj.nsfw=["erect/erectness","sexy/sex appeal","ravishing/rock-solid arousal","horny/horniness","kinky/kinkiness","trashy/trashiness","sexual/sexuality"];
dic.adj.all=["sensible/sensibility","headless/headlessness","charitable/charitability","sociopathic/sociopathicness","ergonomic/ergonomicness","organic/organicness","regal/regalness","constitutional/constitutionalness","unconstitutional/unconstitutionalness","all-natural/all-naturalness","whole-grain/whole-graininess","Victorian/Victorianness","rustic/rusticness","luxurious/luxuriousness","invigorating/invigoratingness","tangy/tanginess","jazzy/jazziness","retro/retroness","ductile/ductileness","old-fashioned/old-fashionedness","flexible/flexibility","tender/tenderness","fabulous/fabulousness","fatherly/fatherliness","toasty/toastiness","mellow/mellowness","historical/historicalness","fragrant/fragrance","superfluous/superfluousness","squishy/squishiness","flappy/flappiness","slippy/slippiness","Confederate/Confederateness","slow/slowness","messy/messiness","holy/holiness","organized/order","nifty/niftiness","athletic/athleticness","juvenile/juvenileness","gallant/gallantness","corny/corniness","groovy/grooviness","weightless/weightlessness","rough/roughness","gourmet/gourmetness","deluxe/deluxeness","wholesome/wholesomeness","buttery/butteriness","religious/religiousness","righteous/righteousness","patriotic/patrioticness","spine-tingling/tingliness","waddly/waddliness","wobbly/wobbliness","traditional/tradition","appetizing/appetizingness","strict/strictness","dreadful/dreadfulness","mythical/mythicalness","philosophical/philosophy","enticing/enticingness","offensive/offensiveness","luscious/lusciousness","bouncy/bounciness","plentiful/plentifulness","major-league/major-leagueness","significant/significance","expressive/expression","cuddly/cuddliness","nude/nudity","rude/rudeness","political/politicalness","creative/creativity","sinful/sin","glorious/gloriousness","merciful/mercy","forgiving/forgiveness","smart/smartness","salty/saltiness","peppery/pepperiness","slurpee/slurpiness","criminal/criminality","domestic/domesticness","meaningful/meaning","manly/manliness","barbeque/barbequeness","casual/casualness","standard/standardness","nasty/nastiness","exquisite/exquisiteness","bold/boldness","proper/properness","fresh/freshness","informative/informativeness","jiggly/jiggliness","rebellious/rebelliousness","direful/direfulness","soothing/soothingness","disloyal/disloyalty","loyal/loyalty","victorious/victory","deep/depth","zen/zenness","royal/royalty","delightful/delightfulness","yummy/yumminess","refreshing/refreshingness","pleasurable/pleasurability","delectable/delectableness","intense/intensity","ghetto/ghettoness","strange/strangeness","odd/oddness","wasted/wastedness","eccentric/eccentricity","satisfactory/satisfaction","pharmaceutical/pharmaceuticalness","fishy/fishiness","jelly-belly/jelly-bellyness","exotic/exoticness","queer/queerness","outlandish/outlandishness","alien/alienness","seductive/seductiveness","superb/superbness","divine/divinity","celestial/celestial power","vibrating/vibration","wet/moisture","silly/silliness","spidery/spideriness","legitimate/legitimacy","flavorful/flavor","savory/flavor","silky/silkiness","slammin/worth","slimy/sliminess","impressive/impressiveness","appealing/appeal","revolting/revoltingness","captivating/captivation","amazing/amazingness","masculine/masculinity","gelatinous/gelatinous goodness","disjointed/disjointedness","tropical/tropicalness","rock-hard/rock-hardness","steamy/steaminess","lumpy/lumpiness","swift/lightning speed","long/longness","large/largeness","small/smallness","frosty/frostiness","glassy/glassiness","hard/hardness","formal/formality","blue/blueness","soft/softness","moist/moisture","smooth/smoothness","torturous/torturousness","well-used/thoroughness","well-loved/sweet love","shiny/shininess","sleek/sleekness","greasy/grasiness","hairy/hairiness","splintered/splinters","dreamy/dreaminess","spicy/spiciness","terrible/terror","throbbing/throbbing pleasure","fluttering/light-weightedness","mysterious/mystery","velvety/velvety goodness","dangerous/danger","metallic/luster","skinny/skininess","fat/fatness","painful/pain","oozing/excretory wetness","flaming/fire","exploding/explosiveness","wild/wildness","rambunctious/wildness","sizzling/fizzly shizzliness","perfect/perfection","raunchy/raunchiness","romantic/romance","young/youth","old/age","bloodthirsty/bloodthirstiness","fleshy/fleshiness","warm/warmth","cold/coldness","icy/iciness","electric/electricity","sharp/sharpness","deadly/deadliness","pulsating/pumpiness","bloody/bloodiness","pregnant/pregnancy","bulging/bulges","stretchy/stretchiness","creamy/creaminess","lovely/loveliness","grainy/graininess","rocky/rockiness","grassy/grassiness","musical/music","outstanding/amazement","identical/identity","famous/fame","cheerful/cheer","livid/anger","obstinate/stubbornness","exhausted/fatigue","graceful/grace","outrageous/outrage","radical/radishes","childish/immaturity","snobbish/snobbishness","miserly/misery","amiable/phallus","disgusting/disgust","awful/terror","humorous/humor","fanciful/fancy","pathetic/lameness","bashful/bashfulness","freaky/freakiness","chilly/chill","stormy/storminess","humid/humidity","bountiful/bountifulness","jubilant/happiness","irritated/anger","patient/patience","dizzy/dizziness","skeptical/skepticism","puzzled/confusion","light-hearted/light-heartedness","perplexed/confusion","over-whelmed/domination","jovial/cheer","hyper/energy","squirrely/furriness","jittery/jitteriness","sensational/sensationalism","elegant/elegance","flabbergasted/confusion","dreary/dreariness","impish/impishness","sneaky/sneakiness","horrid/horridness","monsterous/largeness","acidic/acidity","acoustic/loudness","active/activity","adaptable/adaptability","aggressive/agressiveness","additional/extra cheese","adequate/adequacy","administrative/domination","advantageous/advantage","advisable/wisdom","extreme/extremity","hardcore/hardcoreness","snappy/snappiness","scary/scariness","immense/immensity","woody/woodiness","dominant/dominance","submissive/submissiveness","pitiful/pity","sickening/sickness","questionable/questionability","intriguing/interest","fantastic/fantasticness","thrilling/thrill","tactical/tacticalness","drooling/sliminess","epic/epicness","succulant/deliciousness","slick/slickness","damp/dampness","explosive/explosiveness","flammable/flammability","water-tight/virginity","watery/wateriness","heavy/heaviness","disagreeable/disagreement","keen/keenness","fertile/fertility","sterile/sterility","distorted/distortion","itchy/itchiness","fruity/fruitiness","hazardous/hazardousness","troubling/trouble","critical/criticalness","treacherous/treachery","speculative/speculation","menacing/menace","threatening/intimidation","ticklish/ticklishness","vulnerable/vulnerability","wicked/wickedness","formidable/formidableness","brave/bravery","supple/softness","splendid/splendidness","nutritious/nutrition","melodic/melodicness","infectious/infectiousness","sticky/stickiness","magnificent/magnificence","fantastical/fantasticness","incredible/incredibility","unbelievable/falseness","shocking/shock","horrifying/horror","unstable/instability","funny/humorousness","delicious/deliciousness","tasty/tastiness","finger-licking/finger-lickingness","super/superness","juicy/juiciness","drippy/drippiness","dripping/drippingness","defiant/defiance","resonant/resonance","crackly/crackliness","high-flying/aerodynamics","wavy/waviness","nutty/nuttiness","insane/insanity","unpleasant/unpleasant nature","inadvisable/inadvisable nature","pleasant/pleasant nature","sandy/sandiness","stinky/stinkiness","dead/deadness","honest/honesty","trustworthy/trustworthiness","profitable/proifitability","essential/essentialness","courageous/courage","charming/charm","beloved/belovedness","marvelous/marvelousness","breathtaking/breathtakingness","surprising/surprise","awesome/awesomeness","zesty/zestiness","astounding/astoundingness","lubricated/lubrication","stimulating/stimulus","clever/cleverness","magical/magic","harmless/harmlessness","gentle/gentleness","raging/rage","noisy/noisiness","passionate/passion","interracial/interracialness","chrome-plated/chrome-platedness","ripped/wear","tattered/wear","heinous/heinousness","crapulous/crapulousness","feckless/fecklessness","peckish/peckishness","comely/comeliness","bilious/biliousness","serene/serenity","delinquent/delinquency","dashing/dashingness","considerate/consideration","busted/bustedness","spontaneous/spontaneity","daring/dare","radioactive/radioactivity","poisonous/toxicity","savage/savageness","terrifying/scariness","unlikely/unlikelihood","speedy/speediness","indestructible/involunurability","odorous/odor","penetrative/penetrative power","immaculate/immaculateness","rowdy/rowdiness","rational/rationality","irrational/irrationality","blasphemous/blasphemy","cooperative/cooperation","professional/professionalism","punctual/punctuality","festive/festiveness","polluted/pollution","potent/potency","powerful/power","piggy/pigginess","assertive/assetiveness","ethical/ethicalness","tight-lipped/tight lips","firm/firmness","unethical/unethicalness","highbrow/highbrowness","scholarly/scholarliness","academic/academicness","sophisticated/sophistication","intelligent/intelligence","intellectual/intellect","cultural/culture","popular/popularity","illiterate/illiteracy","educated/education","durable/durability","sublime/sublimeness","ambitious/ambition","family-friendly/family-friendliness","contaminated/contamination","unfortunate/misfortune","fortunate/fortune","absolute/absoluteness","logical/logical","frictional/friction","cream-filled/creaminess","malleable/malleability","fast/speed","squeamish/squeamishness","unlimited/unlimitedness","gassy/gassiness","edgy/edginess","artsy/artsiness","feasible/feasibility","infeasible/infeasibility","possible/possibility","potential/potential","intentional/intention","dumb/dumbness","disorganized/disorder","irregular/irregularity","certified/certification","sure/sureness","complimentary/complimentariness","supplementary/supplementariness","derogatory/derogatoriness","scornful/scorn","gross/grossness"].concat(dic.adj.appearance,dic.adj.nationality,dic.adj.emotion,dic.adj.weather);
dic.adj.subs=["normal","ness"];
dic.adj.filters=["appearance","nationality","emotion","weather","nsfw"];
var adv={};
dic.adv=adv;
dic.adv.sexy=["smoothly","slowly","lovingly","forcibly","up and down","side to side","romantically","hungrily","sweetly","roughly","delightedly"];
dic.adv.emotion=["happily","gladly","grudgingly","arrogantly","sadly","frantically","greedily","cautiously","hollowly","enviously","angrily","warily","shamefully","gleefully","grumpily","anxiously","regretfully","patiently","evilly","terrifyingly"];
dic.adv.all=["gloriously","majestically","sarcastically","obscenely","unbelievably","royally","buoyantly","comfortably","justly","continually","bitterly","accidentally","absentmindedly","generously","coaxingly","faithfully","explosively","spontaneously","magestically","kindly","fiercely","strongly","fervently","genuinely","wholeheartedly","honestly","truly","keenly","rashly","stubbornly","persistently","firmly","purposefully","strictly","weakly","sharply","intensively","solemnly","determinedly","lightly","gravely","deeply","earnestly","animatedly","ardently","carefully","diligently","hastily","laboriously","restlessly","speedily","spiritedly","strenuously","vigilantly","fearlessly","sluggishly","densely","closely","rebelliously","thirstily","meekly","mildly","modestly","calmly","discreetly","silently","greatly","intently","nimbly","vigorously","actively","readily","rapidly","promptly","efficiently","merrily","briskly","stealthily","forgivingly","mercifully","awkwardly","coldly","joyfully","urgently","adventurously","indubitably","beautifully","hatefully","wisely","blissfully","terribly","bravely","sympathetically","suspiciously","intensely","crossly","mysteriously","single-handedly","naturally","ferociously","heavily","dreamily","loudly","effortlessly","wetly","peacefully","daintily","snugly","crunchily","ticklishly","pointedly","noisily","wildly","enthusiastically","elegantly","energetically","busily","quickly","slickly","saggingly","quietly","defiantly","inappropriately","immediately","torturously","hurriedly","formally","courageously","with haste","excitedly","thickly","boldly","proudly","deliciously","fleetingly","secretly","violently","appreciatively","thoughtlessly","carelessly","smartly","delicately","sloppily","slimily","anally","eagerly","brightly","correctly","curiously","intentionally","deliberately","magically","necessarily","unnecessarily","fluidly","expertly","professionally","partially","intuitively","artfully","thoroughly","illegally","mortally","harmonically","objectively","cooly","casually","perfectly","imperfectly","victoriously","grandly","richly","heartily","musically","to kingdom come","methodically","nonchalantly","systematically","recklessly","neatly"].concat(dic.adv.sexy,dic.adv.emotion);
dic.adv.subs=["default"];
dic.adv.filters=["sexy","emotion"];
var color={};
dic.color=color;
dic.color.primary=["red/reddish","green/greenish","blue/bluish"];
dic.color.secondary=["cyan/cyan-ish","magenta/magenta-ish","yellow/yellowish"];
dic.color.all=["orange/orangish","purple/purplish","turquoise/turquoise-ish","pink/pinkish","grey/greyish","black/blackish","white/whitish","brown/brownish","lime green/lime-green-ish","lavender/lavenderish","maroon/maroonish","gold/goldish","silver/silverish","crimson/crimsonish"].concat(dic.color.primary,dic.color.secondary);
dic.color.subs=["default","ish"];
dic.color.filters=["primary","secondary"];
var conj={};
dic.conj=conj;
dic.conj.all=["and","or","but","nor","for","yet","so"].concat();
dic.conj.subs=["default"];
dic.conj.filters=[];
var country={};
dic.country=country;
dic.country.asia=["Afghanistan","Cambodia","China","Hong Kong","India","Indonesia","Japan","North Korea","South Korea","Kyrgyzstan","Malaysia","Mongolia","Nepal","Russia","Singapore","Taiwan","Thailand"];
dic.country.middleeast=["Afghanistan","Iran","Iraq","Israel","Pakistan","Saudi Arabia","Syria","United Arab Emirates"];
dic.country.mediterranean=["Akrotiri","Cyprus"];
dic.country.europe=["Albania","Austria","Belgium","Bulgaria","Denmark","Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia","Lithuania","Luxembourg","Netherlands","Norway","Poland","Portugal","Romania","Russia","Slovakia","Slovenia","Spain","Sweden","Switzerland","Turkey","United Kingdom"];
dic.country.southamerica=["Argentina","Brazil","Chile","Colombia","Peru"];
dic.country.oceania=["Australia","Guam","Indonesia","New Zealand","Papua New Guinea","Philippines","Samoa","Solomon Islands"];
dic.country.northamerica=["Canada","Mexico","United States"];
dic.country.africa=["Democratic Republic of the Congo","Republic of the Congo","Egypt","Ghana","Kenya","Libya","Madagascar","Morocco","Niger","Nigeria","Rwanda","Somalia","South Africa","Sudan"];
dic.country.centralamerica=["Costa Rica","Guatemala","Haiti","Honduras","Nicaragua","Panama"];
dic.country.caribbean=["Cuba","Dominica","Jamaica"];
dic.country.eurasia=["Russia"];
dic.country.all=["Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Armenia","Aruba","Ashmore and Cartier Islands","Azerbaijan","The Bahamas","Bahrain","Bangladesh","Barbados","Bassas da India","Belarus","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Bouvet Island","British Indian Ocean Territory","British Virgin Islands","Brunei","Burkina Faso","Burma","Burundi","Cameroon","Cape Verde","Cayman Islands","Central African Republic","Chad","Christmas Island","Clipperton Island","Cocos Islands","Comoros","Cook Islands","Coral Sea Islands","Cote d'Ivoire","Croatia","Czech Republic","Dhekelia","Djibouti","Dominican Republic","Ecuador","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Europa Island","Falkland Islands","Faroe Islands","Fiji","French Guiana","French Polynesia","French Southern and Antarctic Lands","Gabon","The Gambia","Gaza Strip","Georgia","Gibraltar","Glorioso Islands","Greenland","Grenada","Guadeloupe","Guernsey","Guinea","Guinea-Bissau","Guyana","Heard Island and McDonald Islands","Holy See","Iceland","Isle of Man","Jan Mayen","Jersey","Jordan","Juan de Nova Island","Kazakhstan","Kiribati","Kuwait","Laos","Lebanon","Lesotho","Liberia","Liechtenstein","Macau","Macedonia","Malawi","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Federated States of Micronesia","Moldova","Monaco","Montserrat","Mozambique","Namibia","Nauru","Navassa Island","Netherlands Antilles","New Caledonia","Niue","Norfolk Island","Northern Mariana Islands","Oman","Palau","Paracel Islands","Paraguay","Pitcairn Islands","Puerto Rico","Qatar","Reunion","Saint Helena","Saint Kitts and Nevis","Saint Lucia","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","San Marino","Sao Tome and Principe","Senegal","Serbia and Montenegro","Seychelles","Sierra Leone","South Georgia and the South Sandwich Islands","Spratly Islands","Sri Lanka","Suriname","Svalbard","Swaziland","Tajikistan","Tanzania","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tromelin Island","Tunisia","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Virgin Islands","Wake Island","Wallis and Futuna","West Bank","Western Sahara","Yemen","Zambia","Zimbabwe"].concat(dic.country.asia,dic.country.middleeast,dic.country.mediterranean,dic.country.europe,dic.country.southamerica,dic.country.oceania,dic.country.northamerica,dic.country.africa,dic.country.centralamerica,dic.country.caribbean,dic.country.eurasia);
dic.country.subs=["default"];
dic.country.filters=["asia","middleeast","mediterranean","europe","southamerica","oceania","northamerica","africa","centralamerica","caribbean","eurasia"];
var em={};
dic.em=em;
dic.em.all=["very","rather","quite","extremely","incredibly","really","thoroughly","most","absolutely","positively","unbelievably","super","majorly","oh so"].concat();
dic.em.subs=["default"];
dic.em.filters=[];
var emo={};
dic.emo=emo;
dic.emo.all=["joy","fright","happiness","boredom","sorrow","sadness","anger","rage","guilt","envy","passion","bliss","pain","interest","smugness","pride","hunger","despair","shame","love","madness","hatred","pity","humility","anticipation","surprise","optimism","disappointment","remorse","contempt","awe","lust","longing","contentment","pleasure","irritation","torment","horror","shock","terror","ecstasy","satisfaction","gratitude","melancholy","fury","excitement","confusion","bewilderment"].concat();
dic.emo.subs=["default"];
dic.emo.filters=[];
var face={};
dic.face=face;
dic.face.all=["smile","frown","grimace","evil grin","cheeky grin","sneer","pucker","smirk","grin","snarl","trollface","visage","snicker","pout","poker face","toothy grin","blank face","pout lip"].concat();
dic.face.subs=["default"];
dic.face.filters=[];
var firstname={};
dic.firstname=firstname;
dic.firstname.male=["Billybob/B","Moses/M","Barack/B","Vijay/V","Rex/R","Sasquatch/S","Elvis/E","Zachy/Z","John/J","Mickey/M","Jake/J","Stan/S","Jamier/J","Sean/S","Snuggles/S","Max/M","Mitchell/M","Collin/C","Nick/N","Danny/D","Ronald/R","Tim/T","Timmy/T","Scott/S","Cody/C","Louie/L","Keith/K","Luke/L","Nicholas","Todd","Barney","Brandon","Victor","William","Ken","Gordon","Grover","Steve","Kyle","George","Rick","Craig","Greg","Andy","Kevin","Dick","Tom","Harry","Bill","Brian","Francis","Corbin","Gilbert","Jeff","Bruce","Benny","Justin","Tony","Robin","Roger","Parker","Vanshay","Lee","Ian","Joshua","Michael","Shonuff","Tristan","Kermit","Wilbur","Malcolm","Akbar","Ambar","Athumani","Jela","Jengo","Kabili","Kanaifu","Kandoro","Keto","Khalfan","Kiango","Kijani","Kondo","Nuru","Penda","Penha","Safari","Thimba","Adish","Arash","Ariabod","Arwan","Arya","Asho","Atish","Baback","Baraz","Barbod","Bardia","Barid","Bast","Benham","Bian","Dareh","Darius","Darrius","Dastan","Gul","Jahan","Kamran","Kaveh","Kaysar","Menelin","Masih","Meghdad","Milad","Nasha","Naveed","Navid","Parham","Pouria","Radwan","Roshan","Saman","Sardar","Sarmad","Shadan","Shahan","Shahin","Shahryar","Shapur","Sher","Abeeku","Abu","Addae","Ade","Adeben","Adjatay","Adjo","Adwin","Agu","Ajamu","Ajani","Akello","Akia","Akins","Akintunde","Anane","Ande","Andwele","Armani","Asante","Ashanti","Ayele","Ayinde","Ayzize","Azibo","Badru","Bahari","Bandele","Banji","Barke","Belay","Bem","Berta","Birungi","Braima","Camara","Chiazam","Chincha","Chikezie","Chimelu","Chinelo","Chinua","Davu","Deka","Akuna","Binda","Euroa","Thor","Gidja","Kaawa","Kinta","Kumba","Mani","Omeo","Onyx","Paratyl","Ponto","Quoba","Taworri","Teangi","Thono","Tyipa","Yamparti","Yarran","Yoyko","Abbot","Abe","Acton","Adair","Aidric","Alan","Alastair","Albert","Albion","Aldan","Alden","Aldis","Alfred","Algernon","Alick","Allard","Alvar","Ansley","Anson","Aragorn","Arathorn","Arden","Argyle","Art","Ash","Ashford","Ashton","Atherton","Atticus","Aubrey","August","Austin","Axton","Bailey","Baker","Baldwin","Balthasar","Bardolf","Barnaby","Baron","Barrett","Barrington","Barton","Baxter","Beauchamp","Beauregard","Beck","Beckett","Beckham","Benjamin","Benson","Bently","Benton","Berke","Beverly","Bevis","Bringham","Birch","Bishop","Blake","Blaze","Boniface","Bono","Booker","Boston","Brad","Bradley","Bradshaw","Brantley","Brenton","Brett","Brewster","Breyson","Briar","Brice","Bridger","Brighton","Bristol","Brock","Bronson","Brook","Bryan","Buckley","Burgess","Burris","Burton","Byron","Caldwell","Caledon","Calico","Camden","Canon","Carlton","Carrington","Carter","Carver","Cash","Caspian","Cecil","Celtic","Chad","Chadwick","Chainey","Chandler","Charleston","Charlie","Charlton","Chauncey","Chay","Chester","Chet","Chip","Clarence","Clark","Clayton","Cleavon","Clement","Cleaveland","Clifford","Clifton","Clint","Clinton","Clive","Colby","Coleman","Colton","Conrad","Conroy","Cornell","Cosmo","Cotton","Crawford","Creighton","Crimson","Crosby","Dalton","Darrel","Darryl","Darwin","Dash","Daughtry","Dawson","Deacon","Dennis","Derek","Derring","Devon","Dexter","Dexton","Diamond","Dixon","Don","Donnie","Dorsey","Doug","Dracen","Drake","Dryden","Dudley","Duke","Dustin","Dwayne","Dwight","Dyson","Earl","Easton","Eastwood","Ed","Edd","Eddy","Edgar","Edgerton","Edison","Edmund","Edric","Edward","Edwin","Egbert","Elden","Elias","Elliot","Ellis","Elmer","Elmo","Elton","Elvin","Elwood","Emerson","Emmet","Ernie","Errol","Erv","Ervin","Erwin","Eugene","Fairfax","Falcon","Farley","Ferguson","Ferris","Filbert","Fisher","Fitzwilliam","Fletcher","Floyd","Forbes","Ford","Forrest","Foster","Fraley","Frank","Frederick","Frenchie","Fulbright","Gage","Galahad","Gale","Gardner","Garland","Garrison","Garth","Gary","Gavin","Gaylord","Godfrey","Graham","Graydon","Griff","Gulliver","Gus"];
dic.firstname.female=["Karen","Heidi","Gabrielle","Jessica","Laura","Sara","Linda","Britney","Kristin","Kate","Amanda","Renae","Ruth","Betty","Lindsey","Saralyn","Alice","Stacey","Sadie","Kat","Marge","Mary","Michelle","Kimberly","Debbie","Megan","Susan","Maria","Jennifer","Helen","Sandra","Rebecca","Martha","Stephanie","Gloria","Jane","Tina","Tiffany","Valerie","Lauren","Bertha","Vicki","Delores","Jacki","Varlerie","Scarlett","Christina","Maggie","Crystal","Ember","Papa"];
dic.firstname.neutral=["Sam","Adrian","Quinn","Sidney","Jessie","Jamie","Jordan","Tracy","Alex"];
dic.firstname.all=[].concat(dic.firstname.male,dic.firstname.female,dic.firstname.neutral);
dic.firstname.subs=["default","abbr"];
dic.firstname.filters=["male","female","neutral"];
var greet={};
dic.greet=greet;
dic.greet.all=["hello","greetings","hola","hey","what's up","whazzup","yo","good day","good morning","good afternoon","good evening","good night","hey buddy","ahoy","sup","salutations","aloha","konichi wa","what's happening","how's it hanging","how's it going","what's new","guten Tag"].concat();
dic.greet.subs=["default"];
dic.greet.filters=[];
var noun={};
dic.noun=noun;
dic.noun.body=["mouth/mouths","afro/afros","cornea/corneas","bone/bones","fanny/fannies","chin/chins","nostril/nostrils","unibrow/unibrows","mustache/mustaches","head/heads","armpit/armpits","rump/rumps","throat/throats","goatee/goatees","nose/noses","elbow/elbows","esophagus/esophaguses","toe/toes","pancreas/pancreases","stinger/stingers","scapula/scapulas","gallbladder/gallbladders","skin/skin","neck/necks","toenail/toenails","horn/horns","epidermis/epidermises","duodenum/duodenums","heart/hearts","fibula/fibulas","knuckle/knuckles","uvula/uvulas","lip/lips","snout/snouts","tooth/teeth","body/bodies","jowl/jowls","whisker/whiskers","beak/beaks","navel/navels","mandible/mandibles","kneecap/kneecaps","face/faces","loin/loins","femur/femurs","dimple/dimples","micropenis/micropenises","pussy/pussies","vagflap/vagflaps","cuntflap/cuntflaps","cunt/cunts","anus/anuses","sphincter/sphincters","tit/tits","taint/taints","foreskin/foreskins","boob/boobs","boner/boners","dick/dicks","cock/cocks","asshole/assholes","ballsack/ballsacks","testicle/testicles","scrotum/scrotums","pube/pubes","penis/penises","vagina/vaginas","pussy/pussies","chesticle/chesticles","willy/willies","prick/pricks","manhood/manhoods"];
dic.noun.hole=["mouth/mouths","tunnel/tunnels","anus/anuses","sphincter/sphincters","goatse/goatses","asshole/assholes","vagina/vaginas","pussy/pussies"];
dic.noun.person=["teen/teens","child/children","dude/dudes","elf/elves","man/men","woman/women","lady/ladies","baby/babies"];
dic.noun.sex=["handcuff/handcuffs","garden hose/garden hoses","cuntrocket/cuntrockets","micropenis/micropenises","cuntwaffle/cuntwaffles","blue waffle/blue waffles","dildo/dildos","double dildo/double dildos","dinocock/dinococks","pussy/pussies","vagflap/vagflaps","cuntflap/cuntflaps","cunt/cunts","anus/anuses","sphincter/sphincters","tit/tits","taint/taints","foreskin/foreskins","goatse/goatses","boob/boobs","boner/boners","dick/dicks","cock/cocks","ballsack/ballsacks","testicle/testicles","scrotum/scrotums","penis/penises","vagina/vaginas","pussy/pussies","willy/willies","prick/pricks","manhood/manhoods"];
dic.noun.weapon=["musket/muskets","wheelbarrow/wheelbarrows","needle/needles","pipe/pipes","lawn mower/lawn mowers","lampstand/lampstands","bottle/bottles","brick/bricks","cleat/cleats","dagger/daggers","horsewhip/horsewhips","nail/nails","bullet/bullets","razor/razors","arrow/arrows","dart/darts","pencil/pencils","telephone pole/telephone poles","torch/torches","broomstick/broomsticks","baton/batons","drill/drills","pickaxe/pickaxes","fork/forks","shovel/shovels","chainsaw/chainsaws","bomb/bombs","sword/swords","spear/spears","stapler/staplers","pitchfork/pitchforks","machete/machetes","flamethrower/flamethrowers","stun gun/stun guns","shotgun/shotguns","harpoon/harpoons","battering ram/battering rams"];
dic.noun.animal=["bass/basses","tuna/tuna","salmon/salmon","leech/leeches","squid/squids","octopus/octopi","velociraptor/velociraptors","tyrannosaurus rex/tyrannosaurus rexes","sphinx/sphinxes","viking/vikings","tadpole/tadpoles","skunk/skunks","seagull/seagulls","parrot/parrots","weasel/weasels","mammoth/mammoths","bat/bats","landlord/landlords","moose/moose","frog/frogs","toad/toads","ant/ants","chihuahua/chihuahuas","deer/deer","rat/rats","cat/cats","mayor/mayors","flamingo/flamingos","turtle/turtles","blowfish/blowfish","anaconda/anacondas","fish/fishes","owl/owls","otter/otters","lemur/lemurs","bull/bulls","chicken/chickens","peacock/peacocks","gorilla/gorillas","dove/doves","pony/ponies","squirrel/squirrels","horse/horses","donkey/donkeys","baboon/baboon","cockroach/cockroaches","butler/butlers","yeti/yetis","demon/demons","devil/devils","ogre/ogres","goat/goats","llama/llamas","porcupine/porcupines","tiger/tigers","lion/lions","wolf/wolves","hyena/hyenas","titan/titans","lizard/lizards","hedgehog/hedgehogs","zebra/zebras","quokka/quokkas","newt/newts","vulture/vultures","yak/yaks","jaguar/jaguars","xerus/xeruses","dog/dogs","bulldog/bulldogs","beagle/beagles","poodle/poodles","rottweiler/rottweilers","grasshopper/grasshoppers","locust/locusts","cricket/crickets","beetle/beetles","bitch/bitches"];
dic.noun.tool=["wheelbarrow/wheelbarrows","robot/robots","lawn mower/lawn mowers","horsewhip/horsewhips","razor/razors","arrow/arrows","pencil/pencils","drill/drills","iron maiden/iron maidens","leaf blower/leaf blowers","pickaxe/pickaxes","pistol/pistols","spoon/spoons","fork/forks","blender/blenders","squeegee/squeegees","shovel/shovels","loincloth/loincloths","nutcracker/nutcrackers","hammer/hammers","chainsaw/chainsaws","microscope/microscopes","pot/pots","pan/pans","screwdriver/screwdrivers","jackhammer/jackhammers","jockstrap/jockstraps","hacksaw/hacksaws","ladder/ladders","shopping cart/shopping carts","bomb/bombs","firecracker/firecrackers","drug/drugs","sword/swords","spear/spears","cattle prod/cattle prods","vacuum/vacuums","wrench/wrenches","phone/phones","can opener/can openers","stapler/staplers","pitchfork/pitchforks","blowtorch/blowtorches","machete/machetes","rumpus/rumpuses","flamethrower/flamethrowers","garden hose/garden hoses","wand/wands","stun gun/stun guns","bunsen burner/bunsen burners","battering ram/battering rams","nipple clamp/nipple clamps","butthair/butthairs"];
dic.noun.food=["bread/bread","prune/prunes","grape/grapes","kumquat/kumquats","tuna/tuna","hazelnut/hazelnuts","walnut/walnuts","almond/almonds","onion/onions","grapefruit/grapefruits","peanut/peanuts","potato/potatoes","apricot/apricots","meatloaf/meatloaves","spinach/spinach","pretzel/pretzels","cornflake/cornflakes","corn/corns","marshmallow/marshmallows","salmon/salmon","fudge/fudge","biscuit/biscuits"];
dic.noun.drug=["cocaine/cocaine","LSD/LSD","PCP/PCP","mescaline/mescaline","marijuana/marijuana","meth/meth","crack/crack","roofie/roofies","heroin/heroin","smack/smack","shroom/shrooms","bath salts/bath salts","extacy/extacy"];
dic.noun.article=["bra/bras","vest/vests","boot/boots","zipper/zippers","sock/socks","shoe/shoes","slipper/slippers","pants/pants","sweatshirt/sweatshirts","kilt/kilts","belt/belts","skirt/skirts","girdle/girdles","pantaloons/pantaloons","shirt/shirts","dress/dresses","jacket/jackets","hat/hats","top hat/top hats","underwear/underwear","tuxedo/tuxedoes","suit/suits","boxers/boxers","panties/panties","thong/thongs"];
dic.noun.fruit=["prune/prunes","grape/grapes","kumquat/kumquats","grapefruit/grapefruits","apricot/apricots","apple/apples","lime/limes","orange/oranges","lemon/lemons","watermelon/watermelons","pineapple/pineapples","coconut/coconuts","blueberry/blueberries","strawberry/strawberries","raspberry/raspberries","tangerine/tangerines","kiwi/kiwis","grape/grapes","tomato/tomatoes","nectarine/nectarines","baby/babies"];
dic.noun.container=["garbage can/garbage cans","bottle/bottles","barrel/barrels","coffin/coffins","pickle jar/pickle jars","package/packages","cup/cups","wallet/wallets","glass/glasses","shot glass/shot glasses","bowl/bowls","container/containers","flask/flasks","bottle/bottles","pitcher/pitchers","pipe/pipes","bong/bongs","pouch/pouches","purse/purses","pocket/pockets","jar/jars","suitcase/suitcases","box/boxes","trunk/trunks","package/packages","case/cases","packet/packets","cell/cells","test tube/test tubes","vial/vials","vat/vats","pot/pots","turkey baster/turkey basters","trashcan/trashcans","drawer/drawers","chest/chests","well/wells","kettle/kettles","bag/bags","balloon/balloons","sack/sacks","basket/baskets","carton/cartons","oven/ovens","tub/tubs","toilet/toilets","freezer/freezers","skillet/skillets"];
dic.noun.furniture=["chair/chairs","bed/beds","chair/chairs","desk/desks","coffee table/coffee tables","couch/couches","recliner/recliners","lawn chair/lawn chairs","rocking chair/rocking chairs","nightstand/nightstands"];
dic.noun.instrument=["piano/pianos","trombone/trombones","accordion/accordions","flute/flutes","clarinet/clarinets","trumpet/trumpets"];
dic.noun.plant=["pumpkin/pumpkins","fern/ferns","maple tree/maple trees","thistle/thistles","daisy/daisies","stinging nettle/stinging nettles","dandelion/dandelions","tulip/tulips","clover/clovers","marigold/marigolds","hedge/hedges"];
dic.noun.shape=["square/squares","triangle/triangles","oval/ovals","circle/circles"];
dic.noun.ball=["basketball/basketballs","baseball/baseballs","beach ball/beach balls","tennis ball/tennis balls","boulder/boulders","meatball/meatballs","golf ball/golf balls"];
dic.noun.surface=["floor/floors","wall/walls","ceiling/ceilings","patio/patios","bed/beds","bedsheet/bedsheets","window/windows","door/doors","chair/chairs","carpet/carpets","desk/desks","roof/roofs","tabletop/tabletops"];
dic.noun.liquid=["saliva/saliva","tar/tar","water/water","soup/soups","soap/soaps","slime/slime","bleach/bleach","pudding/puddings","lotion/lotions","sauce/sauces","earwax/earwax","snot/snots","sweat/sweats","acid/acids","wine/wines","oil/oils","olive oil/olive oil","urine/urine","diarrhea/diarrhea","beer/beers","rain/rains","toothpaste/toothpastes","yogurt/yogurts","cream/creams","grease/grease","vodka/vodka"];
dic.noun.long=["toothpick/toothpicks","turd/turds","rocket/rockets","flute/flutes","clarinet/clarinets","trumpet/trumpets","arrow/arrows","dart/darts","pencil/pencils","cigarette/cigarettes","pickle/pickles","ruler/rulers","cucumber/cucumbers","staple/staples","panhandle/panhandles","telephone pole/telephone poles","extension cord/extension cords","candle/candles","tree/trees","knife/knives","torch/torches","broom/brooms","broomstick/broomsticks","pole/poles","crack pipe/crack pipes","lightbulb/lightbulbs","umbrella/umbrellas","cannon/cannons","sausage/sausages","chain/chains","banana/bananas","plunger/plungers","spork/sporks","toothbrush/toothbrushes","banister/banisters","baton/batons","drill/drills","spoon/spoons","fork/forks","shovel/shovels","hammer/hammers","screwdriver/screwdrivers","jackhammer/jackhammers","sword/swords","spear/spears","wrench/wrenches","pitchfork/pitchforks","blowtorch/blowtorches","machete/machetes","flamethrower/flamethrowers","garden hose/garden hoses","snake/snakes","umbilical cord/umbilical cords","leg/legs","tentacle/tentacles","tongue/tongues","finger/fingers","wand/wands","bunsen burner/bunsen burners","jalapeno/jalapenos","shotgun/shotguns","harpoon/harpoons","silo/silos","battering ram/battering rams","double dildo/double dildos","boner/boners","dick/dicks","cock/cocks","penis/penises","willy/willies","prick/pricks","manhood/manhoods"];
dic.noun.dog=["dog/dogs","bulldog/bulldogs","beagle/beagles","poodle/poodles","rottweiler/rottweilers"];
dic.noun.job=["carpenter/carpenters","reporter/reporters","journalist/journalists","guitarist/guitarists","archaeologist/archaeologists","urologist/urologists","circus performer/circus performers","juggler/jugglers","explorer/explorers","artist/artists","mechanic/mechanics","hunter/hunters","spelunker/spelunkers","bartender/bartenders","accountant/accountants","movie star/movie stars","mailman/mailmen","construction worker/construction workers","principal/principals","prince/princes","princess/princesses","surgeon/surgeons","gambler/gamblers","dentist/dentists","chef/chefs","celebrity/celebrities","waitress/waitresses","burglar/burglars","waiter/waiters","doctor/doctors","nurse/nurses","lawyer/lawyers","butler/butlers","actor/actors","athlete/athletes","babysitter/babysitters","golfer/golfers","vampire/vampires","fireman/firemen","rapper/rappers","gangster/gangsters","hippie/hippies","clown/clowns","banker/bankers","pianist/pianists","politician/politicians","president/presidents","magician/magicians","stock broker/stock brokers","cop/cops","sky diver/sky divers","snake charmer/snake charmers","fortune teller/fortune tellers","serial killer/serial killers","plumber/plumbers","FBI agent/FBI agents","assassin/assassins","wizard/wizards","salesman/salesmen","singer/singers","policeman/policemen","physician/physicians","paramedic/paramedics","ninja/ninjas","teacher/teachers","senator/senators","scientist/scientists","constable/constables","taxidermist/taxidermists","biologist/biologists","pope/popes","bachelor/bachelors","haberdasher/haberdashers","armorer/armorers","tanner/tanners","hobbit/hobbits","pirate/pirates","stripper/strippers","hooker/hookers","pornstar/pornstars"];
dic.noun.round=["kidney/kidneys","golf ball/golf balls","tit/tits","boob/boobs"];
dic.noun.clothes=["boot/boots","zipper/zippers","sock/socks","shoe/shoes","slipper/slippers"];
dic.noun.vehicle=["train/trains","minivan/minivans","semi/semis","hot rod/hot rods","truck/trucks","boat/boats","submarine/submarines","aircraft carrier/aircraft carriers","airplane/airplanes","blimp/blimps","motorcycle/motorcycles"];
dic.noun.insect=["grasshopper/grasshoppers","locust/locusts","cricket/crickets","beetle/beetles"];
dic.noun.nsfw=["shit/shits","poo-poo/poo-poos","yeast/yeast infections","poop/poops","motherfucker/motherfuckers"];
dic.noun.all=["wedgie/wedgies","zygote/zygotes","fetus/fetuses","peninsula/peninsulas","truth/truths","pedestrian/pedestrians","disco ball/disco balls","rotisserie/rotisseries","pizza/pizzas","caboose/cabooses","frosting/frostings","giblet/giblets","avocado/avocados","banjo/banjos","bingo/bingos","nickel/nickels","dime/dimes","penny/pennies","cheeseburger/cheeseburgers","sponge/sponges","popsicle/popsicles","credit card/credit cards","truffle/truffles","gearshift/gearshifts","ghost/ghosts","ridge/ridges","meat/meats","dictionary/dictionaries","asymptote/asymptotes","peppermint/peppermints","candy cane/candy canes","bulge/bulges","lump/lumps","garden/gardens","treasure/treasures","scuba/scubas","football/footballs","dollar bill/dollar bills","log/logs","chicken wing/chicken wings","pylon/pylons","card/cards","rock/rocks","book/books","rabies/rabies","fan/fans","eraser/erasers","fart/farts","booger/boogers","monster/monsters","nerd/nerds","lemonade/lemonades","cramp/cramps","doodle/doodles","stone/stones","waffle/waffles","jelly bean/jelly beans","sofa/sofas","muffin/muffins","ragamuffin/ragamuffins","puppet/puppets","swag/swag","magnifying glass/magnifying glasses","diaper/diapers","dishrag/dishrags","money/money","car/cars","flowerpot/flowerpots","sharpie/sharpies","carcass/carcasses","raisin/raisins","grass/grasses","manure/manure","carpet/carpets","earwax/earwax","fog/fogs","hemorroid/hemorroids","cork/corks","mirror/mirrors","urinal/urinals","ventricle/ventricles","cement/cement","shrub/shrubs","laptop/laptops","wall/walls","globe/globes","kite/kites","radish/radishes","scab/scabs","leaf/leaves","bench/benches","rubber/rubbers","feces/feces","snorkel/snorkels","cocktail/cocktails","papaya/papayas","hole/holes","dynamite/dynamites","kettle/kettles","enigma/enigmas","keyboard/keyboards","lube/lubes","mask/masks","duct tape/duct tape","button/buttons","tuber/tubers","joint/joints","horseradish/horseradishes","cabbage/cabbages","wool/wool","tea bag/tea bags","teapot/teapots","canister/canisters","battery/batteries","clock/clocks","plug/plugs","towel/towels","towelette/towelettes","moist towelette/moist towelettes","cuckoo/cuckoos","doll/dolls","tampon/tampons","loaf/loaves","manhole/manholes","basket/baskets","pope/popes","flapjack/flapjacks","ointment/ointments","wrinkle/wrinkles","hubcap/hubcaps","wig/wigs","constitution/constitutions","mohawk/mohawks","dingleberry/dingleberries","teddy bear/teddy bears","tire/tires","shuttlecock/shuttlecocks","Communist/Communists","Democrat/Democrats","Republican/Republicans","president/presidents","anthill/anthills"].concat(dic.noun.body,dic.noun.hole,dic.noun.person,dic.noun.sex,dic.noun.weapon,dic.noun.animal,dic.noun.tool,dic.noun.food,dic.noun.drug,dic.noun.article,dic.noun.fruit,dic.noun.container,dic.noun.furniture,dic.noun.instrument,dic.noun.plant,dic.noun.shape,dic.noun.ball,dic.noun.surface,dic.noun.liquid,dic.noun.long,dic.noun.dog,dic.noun.job,dic.noun.round,dic.noun.clothes,dic.noun.vehicle,dic.noun.insect);
dic.noun.subs=["singular","plural"];
dic.noun.filters=["body","hole","person","sex","weapon","animal","tool","food","drug","article","fruit","container","furniture","instrument","plant","shape","ball","surface","liquid","long","dog","job","round","clothes","vehicle","insect","nsfw"];
var place={};
dic.place=place;
dic.place.building=["palace/palaces","jail/jails","tomb/tombs","coffeeshop/coffeeshops","tower/towers","stable/stables","barn/barns","mansion/mansions","castle/castles","stadium/stadiums","school/schools","mall/malls","store/stores","shanty/shanties","prison/prisons","shack/shacks","tent/tents","outhouse/outhouses","cottage/cottages","asylum/asylums","bar/bars","pub/pubs","nightclub/nightclubs","factory/factories","firehouse/firehouses","safehouse/safehouses","warehouse/warehouses","bomb shelter/bomb shelters","homeless shelter/homeless shelters","church/churches","distillery/distilleries","conservatory/conservatories","morgue/morgues","funeral home/funeral homes","courthouse/courthouses","theater/theaters","studio/studios","fort/forts","nursery/nurseries","library/libraries","hospital/hospitals","hostel/hostels","hotel/hostels","post office/post offices","laboratory/laboratories"];
dic.place.indoor=["palace/palaces","classroom/classrooms","nest/nests","office/offices","ditch/ditches","cave/caves","house/houses","bathroom/bathrooms","bedroom/bedrooms","town/towns","jail/jails","shop/shops","tomb/tombs","basement/basements","dungeon/dungeons","coffeeshop/coffeeshops","tower/towers","stable/stables","barn/barns","mansion/mansions","castle/castles","attic/attics","cage/cages","stadium/stadiums","school/schools","mall/malls","store/stores","stand/stands","company/companies","land/lands","garden/gardens","wonderland/wonderlands","abyss/abysses","shanty/shanties","prison/prisons","apartment/apartments","closet/closets","shack/shacks","tent/tents","car/cars","van/vans","alley/alleys","forest/forests","meadow/meadows","outhouse/outhouses","boat/boats","port-a-potty/port-a-potties","sauna/saunas","cottage/cottages","bank/banks","asylum/asylums","arcade/arcades","bar/bars","pub/pubs","nightclub/nightclubs","factory/factories","station/stations","firehouse/firehouses","safehouse/safehouses","warehouse/warehouses","bomb shelter/bomb shelters","homeless shelter/homeless shelters","firetruck/firetrucks","ambulance/ambulances","kitchen/kitchens","church/churches","distillery/distilleries","conservatory/conservatories","morgue/morgues","funeral home/funeral homes","courthouse/courthouses","trailer/trailers","theater/theaters","studio/studios","ring/rings","fort/forts","nursery/nurseries","library/libraries","hospital/hospitals","hostel/hostels","hotel/hostels","sanctuary/sanctuaries","bus/buses","post office/post offices","skyway/skyways","opera/operas","laboratory/laboratories","garage/garages","festival/festivals","carnival/carnivals","dispensary/dispensaries"];
dic.place.natural=["nest/nests","ditch/ditches","cave/caves","land/lands","forest/forests","meadow/meadows","beach/beaches","mountain/mountains","hill/hills","hilltop/hilltops","lakeside/lakesides","grassy plain/grassy plains","crater/craters","valley/valleys","volcano/volcanoes","island/islands","wasteland/wastelands"];
dic.place.outdoor=["beach/beaches","highway/highways","mountain/mountains","hill/hills","railroad/railroads","road/roads","hilltop/hilltops","park/parks","lakeside/lakesides","grassy plain/grassy plains","crater/craters","valley/valleys","volcano/volcanoes","island/islands","farm/farms","rooftop/rooftops","dance floor/dance floors","graveyard/graveyards","cemetary/cemetaries","field/fields","street/streets","battlefield/battlefields","wasteland/wastelands","playground/playgrounds","amusement park/amusement parks"];
dic.place.all=[].concat(dic.place.building,dic.place.indoor,dic.place.natural,dic.place.outdoor);
dic.place.subs=["singular","plural"];
dic.place.filters=["building","indoor","natural","outdoor"];
var prefix={};
dic.prefix=prefix;
dic.prefix.position=["pre","post","extra","intra","endo","mid","under","over"];
dic.prefix.quantity=["bi","tri","quad","octo","penta","mono"];
dic.prefix.scale=["micro","macro"];
dic.prefix.anatomy=["cardio","neuro"];
dic.prefix.all=["mega","exo","a","anti","un","in","pseudo","pyro","super","mini","psycho","trans","fore","semi","mis","non","auto","circum","contra","homo","hyper","sub","omni","uni"].concat(dic.prefix.position,dic.prefix.quantity,dic.prefix.scale,dic.prefix.anatomy);
dic.prefix.subs=["default"];
dic.prefix.filters=["position","quantity","scale","anatomy"];
var prepos={};
dic.prepos=prepos;
dic.prepos.space=["aboard","about","above","across","against","along","amid","among","around","as","at","behind","below","beneath","beside","besides","between","beyond","by","down","from","in","inside","into","near","of","off","on","onto","opposite","outside","over","past","round","through","to","toward","towards","under","underneath","up","upon","versus","via","with","within","without"];
dic.prepos.time=["after","before","during","despite","following","for","until","since","regarding"];
dic.prepos.all=[].concat(dic.prepos.space,dic.prepos.time);
dic.prepos.subs=["default"];
dic.prepos.filters=["space","time"];
var preposition={};
dic.preposition=preposition;
dic.preposition.all=["with","without","alongside","inside of","using","with the help of"].concat();
dic.preposition.subs=["default"];
dic.preposition.filters=[];
var pron={};
dic.pron=pron;
dic.pron.male=["him/he/himself/his/his"];
dic.pron.female=["her/she/herself/her/hers"];
dic.pron.neutral=["it/it/itself/its/its"];
dic.pron.all=[].concat(dic.pron.male,dic.pron.female,dic.pron.neutral);
dic.pron.subs=["acc","nom","self","poss","s"];
dic.pron.filters=["male","female","neutral"];
var quality={};
dic.quality=quality;
dic.quality.physical=["speed/faster/slower/fastest","size/bigger/smaller/biggest","wetness/wetter/drier/wettest","force/harder/softer/hardest","weight/heavier/lighter/heaviest","color/more colorful/duller/most colorful","luminosity/brighter/darker/brightest","power level/more powerful/weaker/most powerful","height/taller/shorter/tallest","length/longer/shorter/longest","width/wider/skinnier/widest","girth/girthier/less girthy/girthiest"];
dic.quality.human=["race/racier/less racier/raciest","age/older/younger/oldest","gender/sexier/more gender neutral/sexiest","ethnicity/more ethnic/less ethnic/most ethnic","honesty/more thuthful/less truthful/most truthful"];
dic.quality.all=[].concat(dic.quality.physical,dic.quality.human);
dic.quality.subs=["property","more","less","est"];
dic.quality.filters=["physical","human"];
var rel={};
dic.rel=rel;
dic.rel.male=["brother/brothers","father/fathers","grandpa/grandpas","uncle/uncles","boyfriend/boyfriends","husband/husbands","stepfather/stepfathers","godfather/godfathers","son/sons","grandson/grandsons","boy/boys","man/men","daddy/daddies"];
dic.rel.female=["mommy/mommies","sister/sisters","mother/mothers","grandma/grandmas","stepmother/stepmothers","aunt/aunts","girlfriend/girlfriends","wife/wives","daughter/daughters","granddaughter/granddaughters","girl/girls","woman/women"];
dic.rel.neutral=["friend/friends","cousin/cousins","colleague/colleagues","boss/bosses","master/masters","buddy/buddies","child/children","baby/babies","fella/fellas"];
dic.rel.all=[].concat(dic.rel.male,dic.rel.female,dic.rel.neutral);
dic.rel.subs=["singular","plural"];
dic.rel.filters=["male","female","neutral"];
var say={};
dic.say=say;
dic.say.all=["say/saying/said/says/sayer/said/saying","shoot/shooting/shot/shoots/shooter/shot/shooting","call/calling/called/calls/caller/called/calling","croak/croaking/croaked/croaks/croaker/croaked/croaking","cry/crying/cried/cries/cryer/cried/crying","whimper/whimpering/whimpered/whimpers/whimperer/whimpered/whimpering","mumble/mumbling/mumbled/mumbles/mumbler/mumbled/mumbling","scream/screaming/screamed/screams/screamer/screamed/screaming","shriek/shrieking/shrieked/shrieks/shrieker/shrieked/shrieking","moan/moaning/moaned/moans/moaner/moaned/moaning","shout/shouting/shouted/shouts/shouter/shouted/shouting","yell/yelling/yelled/yells/yeller/yelled/yelling","wail/wailing/wailed/wails/wailer/wailed/wailing","swear/swearing/swore/swears/swearer/sworn/swearing","bawl/bawling/bawled/bawls/bawler/bawled/bawling","snap/snapping/snapped/snaps/snapper/snapped/snapping","whisper/whispering/whispered/whispers/whisperer/whispered/whispering","cackle/cackling/cackled/cackles/cackler/cackled/cackling","grunt/grunting/grunted/grunts/grunter/grunted/grunting","roar/roaring/roared/roars/roarer/roared/roaring","snort/snorting/snorted/snorts/snorter/snorted/snorting","whine/whining/whined/whines/whiner/whined/whining","screech/screeching/screeched/screeches/screecher/screeched/screeching","squeal/squealing/squealed/squeals/squealer/squealed/squealing","hoot/hooting/hooted/hoots/hooter/hooted/hooting","ejaculate/ejaculating/ejaculated/ejaculates/ejaculator/ejaculated/ejaculation","squelch/squelching/squelched/squelches/squelcher/squelched/squelching","spit/spitting/spat/spits/spitter/spat/spitting","declare/declaring/declared/declares/declarer/declared/declaration","breathe/breathing/breathed/breathes/breather/breathed/breathing","announce/announcing/announced/announces/announcer/announced/announcing","snicker/snickering/snickered/snickers/snickerer/snickered/snickering","beep/beeping/beeped/beeps/beeper/beeped/beeping","exclaim/exclaiming/exclaimed/exclaims/exclaimer/exclaimed/exclamation","burp/burping/burped/burps/burper/burped/burping","laugh/laughing/laughed/laughs/laugher/laughed/laughter","mutter/muttering/muttered/mutters/mutterer/muttered/muttering","hiss/hissing/hissed/hisses/hisser/hissed/hissing"].concat();
dic.say.subs=["simple","ing","ed","s","er","pp","noun"];
dic.say.filters=[];
var sconj={};
dic.sconj=sconj;
dic.sconj.all=["after","although","as","as if","as long as","as much as","as soon as","as though","because","before","even","even if","even though","if","if only","if when","if then","inasmuch","in order that","just as","lest","now","now since","now that","now when","once","provided","provided that","rather than","since","so that","supposing","than","that","though","til","unless","until","when","whenever","where","whereas","where if","wherever","whether","which","while","who","whoever","why"].concat();
dic.sconj.subs=["default"];
dic.sconj.filters=[];
var sound={};
dic.sound=sound;
dic.sound.all=["bang/bangs","squelch/squelches","squeal/squeals","boom/booms","beep/beeps","crash/crashes","wail/wails","roar/roars","shatter/shatters","pop/pops","note/notes","thump/thumps","rumble/rumbles","scrape/scrapes","screech/screeches","flap/flaps","flutter/flutters","swoosh/swooshes","pound/pounds","slap/slaps","clang/clangs","toot/toots","tick/ticks","foom/fooms","rap/raps","tap/taps","shudder/shudders","crack/cracks"].concat();
dic.sound.subs=["singular","plural"];
dic.sound.filters=[];
var substance={};
dic.substance=substance;
dic.substance.liquid=["water","vomit","orange juice","sweat","blood","lava","gasoline","oil","molten iron","grease","tears","ketchup","mustard","mayonnaise","soy sauce","beer","wine","vodka","olive oil","extra-virgin olive oil","vinegar","paint","liquid nitrogen","tomato sauce","ink","lemonade","sap","plasma","acid","magma","cum","lube","crotch juice","pee","piss","pisswater","diarrhea","jizz","urine"];
dic.substance.nsfw=["happiness","dick cheese"];
dic.substance.all=["sand","earwax","oatmeal","spaghetti","flour","dark matter","antimatter","corn","snow"].concat(dic.substance.liquid);
dic.substance.subs=["default"];
dic.substance.filters=["liquid","nsfw"];
var surname={};
dic.surname=surname;
dic.surname.all=["Pollock","Washington","Hayne","Machler","Kaye","Murdock","Dick","Johnson","Jackson","Anderson","Smith","Bingley","Presley","Olson","Pederson","Clark","Stark","Lee","Meyer","Palin","Shaw","Andrews","Sampson","Mueller","Allan","Underwood","Cyrus","Harris","Lewis","Phillips","Thompson","Miller","Pratt","Griff","Wright","Jones","Brown","Davis","Wilson","Moore","Taylor","Thomas","White","Martin","Garcia","Martinez","Robinson","Rodriguez","Walker","Hall","Allen","Young","Hernandez","Underthun","Werdal","King","Lopez","Hill","Green","Adams","Baker","Gonzalez","Nelson","Carter","Mitchell","Roberts","Turner","Campbell","Parker","Evans","Edwards","Collins","Stewart","Sanchez","Morris","Rogers","Reed","Cook","Morgan","Bell","Murphy","Bailey","Rivera","Cooper","Richardson","Sterling","Cox","Howard","Ward","Torres","Gray","Watson","Brooks","Kelly","Sanders","Price","Bennett","Wood","Ross","Jenkins","Perry","Long","Butler","Simmons","Russell","Bryant","McDonald","Little","Jacobs","Wang","Schroeder","Hartman","Woodard","Kemp","Glenn","Baxter","Bond","Nixon","Strong","Hurst","Farrell","Roth","Prince","Serrano","Glass","Knox","Randolph","Maynard","Foley","Chang","Bauer","Rivers","Walls","Sexton","Gentry","Leon","Barron","Estes","Middleton","Best","Dudley","Herman","Pennington","Solomon","Kerr","Chen","Blackburn","Gay","Avery","Hendricks","Barry","Horne","Meadows","Velentine","Church","Russo","Benton","Howe","Hinton","Tillman","Key","Peck","Morin","Gamble","Bentley","Stout","Petty","Osborn","Joyner","Rosario","Stein","Huber","Vanyo","Guthrie","Noel","Vang","Cooke","Wooten","Forbes","Hewitt"].concat();
dic.surname.subs=["default"];
dic.surname.filters=[];
var timeadv={};
dic.timeadv=timeadv;
dic.timeadv.time=["at sunrise","a month ago","a week ago","a day ago","an hour ago","a year ago","millions of years ago","billions of years ago","trillions of years ago","today","tonight","presently","now","just 5 minutes ago","5 minutes later","1 hour later","1 day later","1 week later","1 month later","6 months later","a year later","5 years later","10 years later","at the full moon","at sunset","later","recently"];
dic.timeadv.past=["a month ago","a week ago","a day ago","an hour ago","a year ago","millions of years ago","billions of years ago","trillions of years ago","just 5 minutes ago"];
dic.timeadv.present=["today","tonight","presently","now"];
dic.timeadv.frequency=["once again","never again","instantly","usually","yesterday","sometimes","occasionally","often","once in a while","never","frequently","once a week","daily","once a month","again","repeatedly","all the time","hardly","barely","several times","every night","this time","biweekly","centenially","every now and then","from now on","until further notice","for 10 weeks","for 36 hours","on Mondays","every Tuesday","profusely","perpetually"];
dic.timeadv.all=[].concat(dic.timeadv.time,dic.timeadv.past,dic.timeadv.present,dic.timeadv.frequency);
dic.timeadv.subs=["default"];
dic.timeadv.filters=["time","past","present","frequency"];
var timenoun={};
dic.timenoun=timenoun;
dic.timenoun.timeofday=["dawn/dawns","morning/mornings","noon/noons","day/days","afternoon/afternoons","evening/evenings","dusk/dusks","night/nights","midnight/midnights"];
dic.timenoun.dayofweek=["Sunday/Sundays","Monday/Mondays","Tuesday/Tuesdays","Wednesday/Wednesdays","Thursday/Thursdays","Friday/Fridays","Saturday/Saturdays"];
dic.timenoun.month=["January/Januaries","February/Februaries","March/Marches","April/Aprils","May/Mays","June/Junes","July/Julies","August/Augusts","September/Septembers","October/Octobers","November/Novembers","December/Decembers"];
dic.timenoun.holiday=["New Year's Eve/New Year's Eves","New Year's Day/New Year's Days","Valentine's Day/Valentine's Days","Easter/Easters","Labor Day/Labor Days","Halloween/Halloweens","Thanksgiving/Thanksgivings","Christmas/Christmasses","Hanukkah/Hanukkahs","Black Friday/Black Fridays","Kwanzaa/Kwanzaas","Boxing Day/Boxing Days","Labor Day/Labor Days","Father's Day/Father's Days","Mother's Day/Mother's Days","Groundhog Day/Groundhog Days"];
dic.timenoun.unit=["millisecond/milliseconds","second/seconds","minute/minutes","hour/hours","day/days","month/months","year/years","century/centuries"];
dic.timenoun.all=[].concat(dic.timenoun.timeofday,dic.timenoun.dayofweek,dic.timenoun.month,dic.timenoun.holiday,dic.timenoun.unit);
dic.timenoun.subs=["singular","plural"];
dic.timenoun.filters=["timeofday","dayofweek","month","holiday","unit"];
var title={};
dic.title=title;
dic.title.all=["Dr.","Sir","Honorable","Madam","King","Queen","Prince","Granny","Master","Mayor","Governor","Colonel","Sergeant","Daddy","Mama","Papa","Sensei","Dojo","Ms","Mrs.","Mr.","Mistress","Moist","Old","Professor"].concat();
dic.title.subs=["default"];
dic.title.filters=[];
var unit={};
dic.unit=unit;
dic.unit.length=["centimeter/centimeters/cm","meter/meters/m","kilometer/kilometers/km","inch/inches/in","foot/feet/ft","yard/yards/y","mile/miles/mi","light-year/light-years/ly"];
dic.unit.small=["centimeter/centimeters/cm","milliliter/milliliters/mL","millivolt/millivolts/mV","microfarad/microfarads/μF","milliampere/milliamperes/mA","milliwatt/milliwatts/mW"];
dic.unit.factor=["centimeter/centimeters/cm","kilometer/kilometers/km","kilogram/kilograms/kg","megaton/megatons/Mt","milliliter/milliliters/mL","kilopascal/kilopascals/kPa","millivolt/millivolts/mV","kilovolt/kilovolts/kV","microfarad/microfarads/μF","kilojoule/kilojoules/kJ","milliampere/milliamperes/mA","kilowatt/kilowatts/kW","milliwatt/milliwatts/mW","megawatt/megawatts/MW"];
dic.unit.large=["kilometer/kilometers/km","kilogram/kilograms/kg","megaton/megatons/Mt","kilopascal/kilopascals/kPa","kilovolt/kilovolts/kV","kilojoule/kilojoules/kJ","kilowatt/kilowatts/kW","megawatt/megawatts/MW"];
dic.unit.weight=["pound/pounds/lb","gram/grams/g","kilogram/kilograms/kg","ton/tons/t","megaton/megatons/Mt","ounce/ounces/oz"];
dic.unit.volume=["gallon/gallons/gal","bucket/buckets/bucket","liter/liters/L","teaspoon/teaspoons/tsp","cup/cups/c","quart/quarts/qt","pint/pints/pt","milliliter/milliliters/mL","tablespoon/tablespoons/tbsp","cubic centimeter/cubic centimeters/cc"];
dic.unit.pressure=["decibel/decibels/dB","pascal/pascals/Pa","kilopascal/kilopascals/kPa"];
dic.unit.energy=["volt/volts/V","millivolt/millivolts/mV","kilovolt/kilovolts/kV","farad/farads/F","microfarad/microfarads/μF","joule/joules/J","kilojoule/kilojoules/kJ","ampere/amperes/A","milliampere/milliamperes/mA","watt/watts/W","kilowatt/kilowatts/kW","milliwatt/milliwatts/mW","megawatt/megawatts/MW","henry/henries/H"];
dic.unit.potential=["volt/volts/V","millivolt/millivolts/mV","kilovolt/kilovolts/kV"];
dic.unit.capacitance=["farad/farads/F","microfarad/microfarads/μF"];
dic.unit.current=["ampere/amperes/A","milliampere/milliamperes/mA"];
dic.unit.power=["watt/watts/W","kilowatt/kilowatts/kW","milliwatt/milliwatts/mW","megawatt/megawatts/MW"];
dic.unit.inductance=["henry/henries/H"];
dic.unit.all=[].concat(dic.unit.length,dic.unit.small,dic.unit.factor,dic.unit.large,dic.unit.weight,dic.unit.volume,dic.unit.pressure,dic.unit.energy,dic.unit.potential,dic.unit.capacitance,dic.unit.current,dic.unit.power,dic.unit.inductance);
dic.unit.subs=["singular","plural","abbr"];
dic.unit.filters=["length","small","factor","large","weight","volume","pressure","energy","potential","capacitance","current","power","inductance"];
var verb={};
dic.verb=verb;
dic.verb.emotion=["love/loving/loved/loves/lover/loved/loving","hate/hating/hated/hates/hater/hated/hating"];
dic.verb.transitive=["invigorate/invigorating/invigorated/invigorates/invigorator/invigorated/invigoration","extrapolate/extrapolating/extrapolated/extrapolates/extrapolator/extrapolated/extrapolation","extrude/extruding/extruded/extrudes/extruder/extruded/extruding","articulate/articulating/articulated/articulates/articulator/articulated/articulation","transcribe/transcribing/transcribed/transcribes/transcriber/transcribed/transcribing","draft/drafting/drafted/drafts/drafter/drafted/drafting","tune/tuning/tuned/tunes/tuner/tuned/tunings","withdraw/withdrawing/withdrew/withdraws/withdrawer/withdrawn/withdrawing","zip/zipping/zipped/zips/zipper/zipped/zipping","extend/extending/extended/extends/extender/extended/extending","streamline/streamlining/streamlined/streamlines/streamliner/streamlined/streamlining","organize/organizing/organized/organizes/organizer/organized/organization","quantify/quantifying/quantified/quantifies/quantifier/quantified/quantification","grate/grating/grated/grates/grater/grated/grating","tape/taping/taped/tapes/taper/taped/taping","oil/oiling/oiled/oils/oiler/oiled/oiling","strap/strapping/strapped/straps/strapper/strapped/strapping","cultivate/cultivating/cultivated/cultivates/cultivater/cultivated/cultivation","discipline/disciplining/disciplined/disciplines/discipliner/disciplined/discipline","examine/examining/examined/examines/examiner/examined/examination","stew/stewing/stewed/stews/stewer/stewed/stewing","stir/stirring/stirred/stirs/stirrer/stirred/stirring","hug/hugging/hugged/hugs/hugger/hugged/hugging","pop/popping/popped/pops/popper/popped/popping","sanitize/sanitizing/sanitized/sanitizes/sanitizer/sanitized/sanitization","clean/cleaning/cleaned/cleans/cleaner/cleaned/cleaning","touch/touching/touched/touches/toucher/touched/touching","strain/straining/strained/strains/strainer/strained/straining","kill/killing/killed/kills/killer/killed/killing","gargle/gargling/gargled/gargles/gargler/gargled/gargling","crumple/crumpling/crumpled/crumples/crumpler/crumpled/crumpling","salt/salting/salted/salts/salter/salted/salting","season/seasoning/seasoned/seasons/seasoner/seasoned/seasoning","marinate/marinating/marinated/marinates/marinater/marinated/marination","pickle/pickling/pickled/pickles/pickler/pickled/pickling","polish/polishing/polished/polishes/polisher/polished/polishing","caress/caressing/caressed/caresses/caresser/caressed/caressing","stimulate/stimulating/stimulated/stimulates/stimulator/stimulated/stimulation","hunt/hunting/hunted/hunts/hunter/hunted/hunting","dishonor/dishonoring/dishonored/dishonors/dishonorer/dishonored/dishonoring","suckle/suckling/suckled/suckles/suckler/suckled/suckling","squeeze/squeezing/squeezed/squeezes/squeezer/squeezed/squeezing","infest/infesting/infested/infests/infester/infested/infestation","tap/tapping/tapped/taps/tapper/tapped/tapping","probe/probing/probed/probes/proper/probed/probing","blast/blasting/blasted/blasts/blaster/blasted/blasting","shave/shaving/shaved/shaves/shaver/shaved/shaving","wrinkle/wrinkling/wrinkled/wrinkles/wrinkler/wrinkled/wrinkling","kiss/kissing/kissed/kisses/kisser/kissed/kissing","cuddle/cuddling/cuddled/cuddles/cuddler/cuddled/cuddling","soak/soaking/soaked/soaks/soaker/soaked/soaking","grip/gripping/gripped/grips/gripper/gripped/gripping","jerk/jerking/jerked/jerks/jerker/jerked/jerking","scrub/scrubbing/scrubbed/scrubs/scrubber/scrubbed/scrubbing","mist/misting/misted/mists/mister/misted/misting","burn/burning/burned/burns/burner/burnt/burning","freeze/freezing/froze/freezes/freezer/frozen/freezing","dry-freeze/dry-freezing/dry-froze/dry-freezes/dry-freezer/dry-frozen/dry-freezing","bake/baking/baked/bakes/baker/baked/baking","deep-fry/deep-frying/deep-fried/deep-fries/deep-frier/deep-fried/deep-frying","swallow/swallowing/swallowed/swallows/swallower/swallowed/swallowing","flatten/flattening/flattened/flattens/flattener/flattened/flattening","glue/gluing/glued/glues/gluer/glued/gluing","rub/rubbing/rubbed/rubs/rubber/rubbed/rubbing","swipe/swiping/swiped/swipes/swiper/swiped/swiping","sculpt/sculpting/sculpted/sculpts/sculptor/sculpted/sculpture","iron/ironing/ironed/irons/ironer/ironed/ironing","roll/rolling/rolled/rolls/roller/rolled/rolling","slit/slitting/slit/slits/slitter/slit/slitting","cut/cutting/cut/cuts/cutter/cut/cutting","loosen/loosening/loosened/loosens/loosener/loosened/loosening","tighten/tightening/tightened/tightens/tightener/tightened/tightening","penetrate/penetrating/penetrated/penetrates/penetrator/penetrated/penetration","strike/striking/struck/strikes/striker/stricken/striking","recycle/recycling/recycled/recycles/recycler/recycled/recycling","groom/grooming/groomed/grooms/groomer/groomed/grooming","hypnotize/hypnotizing/hypnotized/hypnotizes/hypnotist/hypnotized/hypnosis","dig/digging/dug/digs/digger/dug/digging","crush/crushing/crushed/crushes/crusher/crushed/crushing","cook/cooking/cooked/cooks/cooker/cooked/cooking","massage/massaging/massaged/massages/massager/massaged/massage","toke/toking/toked/tokes/toker/toked/toking","pull/pulling/pulled/pulls/puller/pulled/pulling","yank/yanking/yanked/yanks/yanker/yanked/yanking","dice/dicing/diced/dices/dicer/diced/dicing","chop/chopping/chopped/chops/chopper/chopped/chopping","boil/boiling/boiled/boils/boiler/boiled/boiling","uproot/uprooting/uprooted/uproots/uprooter/uprooted/uprooting","clip/clipping/clipped/clips/clipper/clipped/clipping","stroke/stroking/stroked/strokes/stroker/stroked/stroking","plaster/plastering/plastered/plasters/plasterer/plastered/plastering","scrunch/scrunching/scrunched/scrunches/scruncher/scrunched/scrunching","superglue/supergluing/superglued/superglues/supergluer/superglued/supergluing","embrace/embracing/embraced/embraces/embracer/embraced/embrace","smoke/smoking/smoked/smokes/smoker/smoked/smoking","moisten/moistening/moistened/moistens/moistener/moistened/moisturization","flick/flicking/flicked/flicks/flicker/flicked/flicking","scorch/scorching/scorched/scorches/scorcher/scorched/scorching","scold/scolding/scolded/scolds/scolder/scolded/scolding","punish/punishing/punished/punishes/punisher/punished/punishment","handle/handling/handled/handles/handler/handled/handling","manipulate/manipulating/manipulated/manipulates/manipulator/manipulated/manipulation","exploit/exploiting/exploited/exploits/exploiter/exploited/exploitation","misuse/misusing/misused/misuses/misuser/misused/misuse","breastfeed/breastfeeding/breastfed/breastfeeds/breastfeeder/breastfed/breastfeeding","pillage/pillaging/pillaged/pillages/pillager/pillaged/pillaging","eliminate/eliminating/eliminated/eliminates/eliminater/eliminated/elimination","waste/wasting/wasted/wastes/waster/wasted/wasting","grind/grinding/grinded/grinds/grinder/ground/grinding","fight/fighting/fought/fights/fighter/fighted/fighting","stuff/stuffing/stuffed/stuffs/stuffer/stuffed/stuffing","eat/eating/ate/eats/eater/eaten/eating","suck/sucking/sucked/sucks/sucker/sucked/sucking","guzzle/guzzling/guzzled/guzzles/guzzler/guzzled/guzzling","sniff/sniffing/sniffed/sniffs/sniffer/sniffed/sniffing","nibble/nibbling/nibbled/nibbles/nibbler/nibbled/nibbling","spurt/spurting/spurted/spurts/spurter/spurted/spurting","smear/smearing/smeared/smears/smearer/smeared/smearing","paint/painting/painted/paints/painter/painted/painting","shower/showering/showered/showers/showerer/showered/showering","sputter/sputtering/sputtered/sputters/sputterer/sputtered/sputtering","drain/draining/drained/drains/drainer/drained/draining","splatter/splattering/splattered/splatters/splatterer/splattered/splattering","spray/spraying/sprayed/sprays/sprayer/sprayed/spraying","jet-spray/jet-spraying/jet-sprayed/jet-sprays/jet-sprayer/jet-sprayed/jet-spraying","squirt/squirting/squirted/squirts/squirter/squirted/squirting","sprinkle/sprinkling/sprinkled/sprinkles/sprinkler/sprinkled/sprinkling","drip/dripping/dripped/drips/dripper/dripped/dripping","piss/pissing/pissed/pisses/pisser/pissed/pissing","pour/pouring/poured/pours/pourer/poured/pouring","splash/splashing/splashed/splashes/splasher/splashed/splashing","sue/suing/sued/sues/suer/sued/suing","prosecute/prosecuting/prosecuted/prosecutes/prosecuter/prosecuted/prosecution","convict/convicting/convicted/convicts/convicter/convicted/conviction","legalize/legalizing/legalized/legalizes/legalizer/legalized/legalization","bathe/bathing/bathed/bathes/bather/bathed/bathing","cripple/crippling/crippled/cripples/crippler/crippled/crippling","customize/customizing/customized/customizes/customizer/customized/customization","decorate/decorating/decorated/decorates/decorator/decorated/decoration","feed/feeding/fed/feeds/feeder/fed/feeding","harass/harassing/harassed/harasses/harasser/harassed/harassment","hoist/hostng/hoisted/hoists/hoister/hoisted/hoisting","nab/nabbing/nabbed/nabs/nabber/nabbed/nabbing","nail/nailing/nailed/nails/nailer/nailed/nailing","preen/preening/preened/preens/preener/preened/preening","ride/riding/rode/rides/rider/ridden/riding","rob/robbing/robbed/robs/robber/robbed/robbery","sharpen/sharpening/sharpened/sharpens/sharpener/sharpened/sharpening","snuggle/snuggling/snuggled/snuggles/snuggler/snuggled/snuggling","donate/donating/donated/donates/donater/donated/donation","purify/purifying/purified/purifies/purifier/purified/purification","toast/toasting/toasted/toasts/toaster/toasted/toasting","liquidate/liquidating/liquidated/liquidates/liquidator/liquidated/liquidation","masticate/masticating/masticated/masticates/masticater/masticated/mastication","chew/chewing/chewed/chews/chewer/chewed/chewing","rotate/rotating/rotated/rotates/rotator/rotated/rotation","push/pushing/pushed/pushes/pusher/pushed/pushing","chill/chilling/chilled/chills/chiller/chilled/chilling","report/reporting/reported/reports/reporter/reported/reporting","plunge/plunging/plunged/plunges/plunger/plunged/plunging","ram/ramming/rammed/rams/rammer/rammed/ramming","vaporize/vaporizing/vaporized/vaporizes/vaporizer/vaporized/vaporization","bless/blessing/blessed/blesses/blesser/blessed/blessing","liquefy/liquefying/liquefied/liquefies/liquefier/liquefied/liquefication","shred/shredding/shredded/shreds/shredder/shredded/shredding","erect/erecting/erected/erects/erector/erected/erection","cockblast/cockblasting/cockflasted/cockblasts/cockblaster/cockblasted/cockblasting","fertilize/fertilizing/fertilized/fertilizes/fertilizer/fertilized/fertilization","please/pleasing/pleased/pleases/pleaser/pleasted/pleasing","thrust/thrusting/thrust/thrusts/thruster/thrusted/thrusting","mount/mounting/mounted/mounts/mounter/mounted/mounting","fuck/fucking/fucked/fucks/fucker/fucked/fucking","fellate/fellating/fellated/fellates/fellater/fellated/fellatio","titfuck/titfucking/titfucked/titucks/titfucker/titfucked/titfucking","turbohump/turbohumping/turbohumped/turbohumps/turbohumper/turbohumped/turbohumpification","grope/groping/groped/gropes/groper/groped/groping","defecate/defecating/defecated/defecates/defecator/defecated/defecation","finger/fingering/fingered/fingers/fingerer/fingered/fingering"];
dic.verb.walk=["snoop/snooping/snooped/snoops/snooper/snooped/snooping","joust/jousting/jousted/jousts/jouster/jousted/jousting","slouch/slouching/slouched/slouches/sloucher/slouched/slouching","walk/walking/walked/walks/walker/walked/walking","skip/skipping/skipped/skips/skipper/skipped/skipping","march/marching/marched/marches/marcher/marched/marching","run/running/ran/runs/runner/run/running","stampede/stampeding/stampeded/stampedes/stampeder/stampeded/stampeding","strut/strutting/strutted/struts/strutter/strutted/strutting","tiptoe/tiptoeing/tiptoed/tiptoes/tiptoer/tiptoed/tiptoeing","sprint/sprinting/sprinted/sprints/sprinter/sprinted/sprinting","gallop/galloping/galloped/gallops/galloper/galloped/galloping","crawl/crawling/crawled/crawls/crawler/crawled/crawling","trot/trotting/trotted/trots/trotter/trotted/trotting","sleepwalk/sleepwalking/sleepwalked/sleepwalks/sleepwalker/sleepwalked/sleepwalking"];
dic.verb.intransitive=["moan/moaning/moaned/moans/moaner/moaned/moaning","rustle/rustling/rustled/rustles/rustler/rustled/rustling","fiddle/fiddling/fiddled/fiddles/fiddler/fiddled/fiddling","hiccup/hiccuping/hiccuped/hiccups/hiccuper/hiccuped/hiccuping","vibrate/vibrating/vibrated/vibrates/vibrator/vibrated/vibration","strain/straining/strained/strains/strainer/strained/straining","tinkle/tinkling/tinkled/tinkles/tinkler/tinkled/tinkling","shave/shaving/shaved/shaves/shaver/shaved/shaving","kiss/kissing/kissed/kisses/kisser/kissed/kissing","cuddle/cuddling/cuddled/cuddles/cuddler/cuddled/cuddling","soak/soaking/soaked/soaks/soaker/soaked/soaking","jerk/jerking/jerked/jerks/jerker/jerked/jerking","scrub/scrubbing/scrubbed/scrubs/scrubber/scrubbed/scrubbing","burn/burning/burned/burns/burner/burnt/burning","freeze/freezing/froze/freezes/freezer/frozen/freezing","bake/baking/baked/bakes/baker/baked/baking","swallow/swallowing/swallowed/swallows/swallower/swallowed/swallowing","flatten/flattening/flattened/flattens/flattener/flattened/flattening","rot/rotting/rotted/rots/rotter/rotten/rotting","sculpt/sculpting/sculpted/sculpts/sculptor/sculpted/sculpture","roll/rolling/rolled/rolls/roller/rolled/rolling","cut/cutting/cut/cuts/cutter/cut/cutting","dig/digging/dug/digs/digger/dug/digging","cook/cooking/cooked/cooks/cooker/cooked/cooking","rattle/rattling/rattled/rattles/rattler/rattled/rattling","pull/pulling/pulled/pulls/puller/pulled/pulling","yank/yanking/yanked/yanks/yanker/yanked/yanking","boil/boiling/boiled/boils/boiler/boiled/boiling","plaster/plastering/plastered/plasters/plasterer/plastered/plastering","smoke/smoking/smoked/smokes/smoker/smoked/smoking","flick/flicking/flicked/flicks/flicker/flicked/flicking","scorch/scorching/scorched/scorches/scorcher/scorched/scorching","breastfeed/breastfeeding/breastfed/breastfeeds/breastfeeder/breastfed/breastfeeding","waste/wasting/wasted/wastes/waster/wasted/wasting","fume/fuming/fumed/fumes/fumer/fumed/fuming","stand/standing/stood/stands/stander/stood/standing","sit/sitting/sat/sits/sitter/sat/sitting","lay/laying/laid/lays/layer/laid/laying","crouch/crouching/crouched/crouches/croucher/crouched/crouching","squat/squatting/squatted/squats/squatter/squatted/squatting","slurp/slurping/slurped/slurps/slurper/slurped/slurping","lick/licking/licked/licks/licker/licked/licking","snort/snorting/snorted/snorts/snorter/snorted/snorting","eat/eating/ate/eats/eater/eaten/eating","snuffle/snuffling/snuffled/snuffles/snuffler/snuffled/snuffling","sniff/sniffing/sniffed/sniffs/sniffer/sniffed/sniffing","spurt/spurting/spurted/spurts/spurter/spurted/spurting","paint/painting/painted/paints/painter/painted/painting","sputter/sputtering/sputtered/sputters/sputterer/sputtered/sputtering","drain/draining/drained/drains/drainer/drained/draining","smatter/smattering/smattered/smatters/smatterer/smattered/smattering","squirt/squirting/squirted/squirts/squirter/squirted/squirting","sprinkle/sprinkling/sprinkled/sprinkles/sprinkler/sprinkled/sprinkling","drip/dripping/dripped/drips/dripper/dripped/dripping","piss/pissing/pissed/pisses/pisser/pissed/pissing","splash/splashing/splashed/splashes/splasher/splashed/splashing","bathe/bathing/bathed/bathes/bather/bathed/bathing","snuggle/snuggling/snuggled/snuggles/snuggler/snuggled/snuggling","puke/puking/puked/pukes/puker/puked/puking","lather/lathering/lathered/lathers/latherer/lathered/lathering","masticate/masticating/masticated/masticates/masticater/masticated/mastication","chew/chewing/chewed/chews/chewer/chewed/chewing","rotate/rotating/rotated/rotates/rotator/rotated/rotation","pray/praying/prayed/prays/prayer/prayed/prayer","ejaculate/ejaculating/ejaculated/ejaculates/ejaculator/ejaculated/ejaculation","thrust/thrusting/thrust/thrusts/thruster/thrusted/thrusting","fuck/fucking/fucked/fucks/fucker/fucked/fucking","masturbate/masturbating/masturbated/masturbates/masturbator/masturbated/masturbation","gyrate/gyrating/gyrated/gyrates/gyrator/gyrated/gyration","twerk/twerking/twerked/twerks/twerker/twerked/twerking","defecate/defecating/defecated/defecates/defecator/defecated/defecation","urinate/urinating/urinated/urinates/urinator/urinated/urination"];
dic.verb.sex=["stroke/stroking/stroked/strokes/stroker/stroked/stroking","cockblast/cockblasting/cockflasted/cockblasts/cockblaster/cockblasted/cockblasting","ejaculate/ejaculating/ejaculated/ejaculates/ejaculator/ejaculated/ejaculation","please/pleasing/pleased/pleases/pleaser/pleasted/pleasing","thrust/thrusting/thrust/thrusts/thruster/thrusted/thrusting","mount/mounting/mounted/mounts/mounter/mounted/mounting","fuck/fucking/fucked/fucks/fucker/fucked/fucking","masturbate/masturbating/masturbated/masturbates/masturbator/masturbated/masturbation","fellate/fellating/fellated/fellates/fellater/fellated/fellatio","titfuck/titfucking/titfucked/titucks/titfucker/titfucked/titfucking","turbohump/turbohumping/turbohumped/turbohumps/turbohumper/turbohumped/turbohumpification"];
dic.verb.pose=["stand/standing/stood/stands/stander/stood/standing","sit/sitting/sat/sits/sitter/sat/sitting","lay/laying/laid/lays/layer/laid/laying","crouch/crouching/crouched/crouches/croucher/crouched/crouching","squat/squatting/squatted/squats/squatter/squatted/squatting"];
dic.verb.eat=["slurp/slurping/slurped/slurps/slurper/slurped/slurping","lick/licking/licked/licks/licker/licked/licking","snort/snorting/snorted/snorts/snorter/snorted/snorting","eat/eating/ate/eats/eater/eaten/eating","suck/sucking/sucked/sucks/sucker/sucked/sucking","snuffle/snuffling/snuffled/snuffles/snuffler/snuffled/snuffling","guzzle/guzzling/guzzled/guzzles/guzzler/guzzled/guzzling","sniff/sniffing/sniffed/sniffs/sniffer/sniffed/sniffing","nibble/nibbling/nibbled/nibbles/nibbler/nibbled/nibbling","gnaw/gnawing/gnawed/gnaws/gnawer/gnawed/gnawing","nip/nipping/nipped/nips/nipper/nipped/nipping","masticate/masticating/masticated/masticates/masticater/masticated/mastication","chew/chewing/chewed/chews/chewer/chewed/chewing"];
dic.verb.liquid=["spurt/spurting/spurted/spurts/spurter/spurted/spurting","smear/smearing/smeared/smears/smearer/smeared/smearing","paint/painting/painted/paints/painter/painted/painting","shower/showering/showered/showers/showerer/showered/showering","sputter/sputtering/sputtered/sputters/sputterer/sputtered/sputtering","drain/draining/drained/drains/drainer/drained/draining","smatter/smattering/smattered/smatters/smatterer/smattered/smattering","splatter/splattering/splattered/splatters/splatterer/splattered/splattering","spray/spraying/sprayed/sprays/sprayer/sprayed/spraying","jet-spray/jet-spraying/jet-sprayed/jet-sprays/jet-sprayer/jet-sprayed/jet-spraying","squirt/squirting/squirted/squirts/squirter/squirted/squirting","sprinkle/sprinkling/sprinkled/sprinkles/sprinkler/sprinkled/sprinkling","drip/dripping/dripped/drips/dripper/dripped/dripping","piss/pissing/pissed/pisses/pisser/pissed/pissing","pour/pouring/poured/pours/pourer/poured/pouring","splash/splashing/splashed/splashes/splasher/splashed/splashing","gush/gushing/gushed/gushes/gusher/gushed/gushing","puke/puking/puked/pukes/puker/puked/puking","cockblast/cockblasting/cockflasted/cockblasts/cockblaster/cockblasted/cockblasting","ejaculate/ejaculating/ejaculated/ejaculates/ejaculator/ejaculated/ejaculation","defecate/defecating/defecated/defecates/defecator/defecated/defecation","urinate/urinating/urinated/urinates/urinator/urinated/urination"];
dic.verb.motion=["tremble/trembling/trembled/trembles/trembler/trembled/trembling","waddle/waddling/waddled/woddles/woddler/waddled/waddling","wiggle/wiggling/wiggled/wiggles/wiggler/wiggled/wiggling","slam/slamming/slammed/slams/slammer/slammed/slamming","kick/kicking/kicked/kicks/kicker/kicked/kicking","smack/smacking/smacked/smacks/smacker/smacked/smacking","stomp/stomping/stomped/stomps/stomper/stomped/stomping","shoot/shooting/shot/shoots/shooter/shot/shooting","screw/screwing/screwed/screws/screwer/screwed/screwing","pump/pumping/pumped/pumps/pumper/pumped/pumping","hack/hacking/hacked/hacks/hacker/hacked/hacking","poke/poking/poked/pokes/poker/poked/poking","crank/cranking/cranked/cranks/cranker/cranked/cranking","serve/serving/served/serves/server/served/serving","force/forcing/forced/forces/forcer/forced/forcing","stick/sticking/stuck/sticks/sticker/stuck/sticking","move/moving/moved/moves/mover/moved/moving","bind/binding/bound/binds/binder/bound/binding","staple/stapling/stapled/staples/stapler/stapled/stapling","eject/ejecting/ejected/ejects/ejector/ejected/ejection","crunch/crunching/crunched/crunches/cruncher/crunched/crunching","squish/squishing/squished/squishes/squisher/squished/squishing","prod/prodding/prodded/prods/prodder/prodded/prodding","wedge/wedging/wedged/wedges/wedger/wedged/wedging","blow/blowing/blew/blows/blower/blown/blowing","knead/kneading/kneaded/kneads/kneader/kneaded/kneading","twist/twisting/twisted/twists/twister/twisted/twisting","throw/throwing/threw/throws/thrower/thrown/throwing","fly/flying/flew/flies/flier/flown/flying","shake/shaking/shook/shakes/shaker/shaken/shaking","bang/banging/banged/bangs/banger/banged/banging","press/pressing/pressed/presses/presser/pressed/pressing","inject/injecting/injected/injects/injector/injected/injection","slip/slipping/slipped/slips/slipper/slipped/slipping","rip/ripping/ripped/rips/ripper/ripped/ripping","twang/twanging/twanged/twangs/twanger/twanged/twanging","cram/cramming/crammed/crams/crammer/crammed/cramming","hurl/hurling/hurled/hurls/hurler/hurled/hurling","lunge/lunging/lunged/lunges/lunger/lunged/lunging","jump/jumping/jumped/jumps/jumper/jumped/jumping","rotate/rotating/rotated/rotates/rotator/rotated/rotation","thrust/thrusting/thrust/thrusts/thruster/thrusted/thrusting","gyrate/gyrating/gyrated/gyrates/gyrator/gyrated/gyration","twerk/twerking/twerked/twerks/twerker/twerked/twerking"];
dic.verb.insert=["screw/screwing/screwed/screws/screwer/screwed/screwing","poke/poking/poked/pokes/poker/poked/poking","stick/sticking/stuck/sticks/sticker/stuck/sticking","prod/prodding/prodded/prods/prodder/prodded/prodding","wedge/wedging/wedged/wedges/wedger/wedged/wedging","inject/injecting/injected/injects/injector/injected/injection","cram/cramming/crammed/crams/crammer/crammed/cramming","feed/feeding/fed/feeds/feeder/fed/feeding","nail/nailing/nailed/nails/nailer/nailed/nailing","push/pushing/pushed/pushes/pusher/pushed/pushing","plunge/plunging/plunged/plunges/plunger/plunged/plunging","ram/ramming/rammed/rams/rammer/rammed/ramming","thrust/thrusting/thrust/thrusts/thruster/thrusted/thrusting"];
dic.verb.violent=["pluck/plucking/plucked/plucks/plucker/plucked/plucking","bite/biting/bit/bites/biter/bitten/biting","fart/farting/farted/farts/farter/farted/farting","manhandle/manhandling/manhandled/manhandles/manhandler/manhandled/manhandling","maul/mauling/mauled/mauls/mauler/mauled/mauling","whip/whipping/whipped/whips/whipper/whipped/whipping","dominate/dominating/dominated/dominates/dominator/dominated/domination","punch/punching/punched/punches/puncher/punched/punching","headbutt/headbutting/headbutted/headbutts/headbutter/headbutted/headbutting","impale/impaling/impaled/impales/impaler/impaled/impalement","scratch/scratching/scratched/scratches/scratcher/scratched/scratching","grab/grabbing/grabbed/grabs/grabber/grabbed/grabbing","snip/snipping/snipped/snips/snipper/snipped/snipping","shatter/shattering/shattered/shatters/shatterer/shattered/shattering","slap/slapping/slapped/slaps/slapper/slapped/slapping","tickle/tickling/tickled/tickles/tickler/tickled/tickling","stab/stabbing/stabbed/stabs/stabber/stabbed/stabbing","strangle/strangling/strangled/strangles/strangler/strangled/strangulation","decapitate/decapitating/decapitated/decapitates/decapitater/decapitated/decapitation","behead/beheading/beheaded/beheads/beheader/beheaded/beheading","dangle/dangling/dangled/dangles/dangler/dangled/dangling","hang/hanging/hung/hangs/hanger/hanged/hanging","gouge/gouging/gouged/gouges/gouger/gouged/gouging","electrocute/electrocuting/electrocuted/electrocutes/electrocuter/electrocuted/electrocution","slash/slashing/slashed/slashes/slasher/slashed/slashing","hammer/hammering/hammered/hammers/hammerer/hammered/hammering","bludgeon/bludgeoning/bludgeoned/bludgeons/bludgeoner/bludgeoned/bludgeoning","pierce/piercing/pierced/pierces/piercer/pierced/piercing","skewer/skewering/skewered/skewers/skewerer/skewered/skewering","spank/spanking/spanked/spanks/spanker/spanked/spanking","vomit/vomiting/vomited/vomits/vomiter/vomited/vomiting","pinch/pinching/pinched/pinches/pincher/pinched/pinching","shove/shoving/shoved/shoves/shover/shoved/shoving","amputate/amputating/amputated/amputates/amputator/amputated/amputation","throttle/throttling/throttled/throttles/throttler/throttled/throttling","implode/imploding/imploded/implodes/imploder/imploded/implosion","explode/exploding/exploded/explodes/exploder/exploded/explosion","cremate/cremating/cremated/cremates/cremater/cremated/cremation","assault/assaulting/assaulted/assaults/assaulter/assaulted/assault","attack/attacking/attacked/attacks/attacker/attacked/attack","cripple/crippling/crippled/cripples/crippler/crippled/crippling","dissect/dissecting/dissected/dissects/dissector/dissected/dissection","harass/harassing/harassed/harasses/harasser/harassed/harassment","injure/injuring/injured/injures/injurer/injured/injury","kidnap/kidnapping/kidnapped/kidnaps/kidnapper/kidnapped/kidnapping","mangle/mangling/mangled/mangles/mangler/mangled/mangling","maim/maiming/maimed/maims/maimer/maimed/maiming","mutilate/mutilating/mutilated/mutilates/mutilater/mutilated/mutilation","nab/nabbing/nabbed/nabs/nabber/nabbed/nabbing","nail/nailing/nailed/nails/nailer/nailed/nailing","nip/nipping/nipped/nips/nipper/nipped/nipping","rob/robbing/robbed/robs/robber/robbed/robbery","vaporize/vaporizing/vaporized/vaporizes/vaporizer/vaporized/vaporization","liquefy/liquefying/liquefied/liquefies/liquefier/liquefied/liquefication","shred/shredding/shredded/shreds/shredder/shredded/shredding","grope/groping/groped/gropes/groper/groped/groping"];
dic.verb.political=["veto/vetoing/vetoed/vetoes/vetoer/vetoed/vetoing","elect/electing/elected/elects/electer/elected/election","ratify/ratifying/ratified/ratifies/ratifier/ratified/ratification","amend/amending/amended/amends/amender/amended/amendment","impeach/impeaching/impeached/impeaches/impeacher/impeached/impeachment","inaugurate/inaugurating/inaugurated/inaugurates/inaugurater/inaugurated/inauguration"];
dic.verb.legal=["sue/suing/sued/sues/suer/sued/suing","prosecute/prosecuting/prosecuted/prosecutes/prosecuter/prosecuted/prosecution","convict/convicting/convicted/convicts/convicter/convicted/conviction","legalize/legalizing/legalized/legalizes/legalizer/legalized/legalization"];
dic.verb.move=["lunge/lunging/lunged/lunges/lunger/lunged/lunging","jump/jumping/jumped/jumps/jumper/jumped/jumping","push/pushing/pushed/pushes/pusher/pushed/pushing","gyrate/gyrating/gyrated/gyrates/gyrator/gyrated/gyration"];
dic.verb.all=["whisper/whispering/whispered/whispers/whisperer/whispered/whispering","spelunk/spelunking/spelunked/spelunks/spelunker/spelunked/spelunking","squelch/squelching/squelched/squelches/squelcher/squelched/squelching","strategize/strategizing/strategized/strategizes/strategizer/strategized/strategizing","click/clicking/clicked/clicks/clicker/clicked/clicking","flap/flapping/flapped/flaps/flapper/flapped/flapping","barbeque/barbequing/barbequed/barbeques/barbequer/barbequed/barbequing","puff/puffing/puffed/puffs/puffer/puffed/puffing","petition/petitioning/petitioned/petitions/petitioner/petitioned/petitioning","abduct/abducting/abducted/abducts/abductor/abducted/abduction","abolish/abolishing/abolished/abolishes/abolisher/abolished/abolishment","apprehend/apprehending/apprehended/apprehends/apprehender/apprehended/apprehension","authenticate/authenticating/authenticated/authenticates/authenticator/authenticated/authentication","choke/choking/choked/chokes/choker/choked/choking","commandeer/commandeering/commandeered/commandeers/commandeerer/commandeered/commandeering","conserve/conserving/conserved/conserves/conserver/conserved/conservation","crash/crashing/crashed/crashes/crasher/crashed/crashing","dramatize/dramatizing/dramatized/dramatizes/dramatizer/dramatized/dramatization","forecast/forecasting/forecasted/forecasts/forecaster/forecasted/forecasting","jingle/jingling/jingled/jingles/jingler/jingled/jingling","jimmy/jimmying/jimmied/jimmies/jimmier/jimmied/jimmying","lecture/lecturing/lectured/lectures/lecturer/lectured/lecturing","rapture/rapturing/raptured/raptures/rapturer/raptured/rapture"].concat(dic.verb.emotion,dic.verb.transitive,dic.verb.walk,dic.verb.intransitive,dic.verb.sex,dic.verb.pose,dic.verb.eat,dic.verb.liquid,dic.verb.motion,dic.verb.insert,dic.verb.violent,dic.verb.political,dic.verb.legal,dic.verb.move);
dic.verb.subs=["simple","ing","ed","s","er","pp","noun"];
dic.verb.filters=["emotion","transitive","walk","intransitive","sex","pose","eat","liquid","motion","insert","violent","political","legal","move"];
var verbimg={};
dic.verbimg=verbimg;
dic.verbimg.all=["shine/shining/shone/shines/shiner","gleam/gleaming/gleamed/gleams/gleamer","crumple/crumpling/crumpled/crumples/crumpler","sparkle/sparkling/sparkled/sparkles/sparkler","bloom/blooming/bloomed/blooms/bloomer","grow/growing/grew/grows/grower","shrink/shrinking/shrunk/shrinks/shrinker","glow/glowing/glowed/glows/glower","lighten/lightening/lightened/lightens/lightener","darken/darkening/darkened/darkens/darkener","steam/steaming/steamed/steams/steamer","flash/flashing/flashed/flashes/flasher","bubble/bubbling/bubbled/bubbles/bubbler","burn/burning/burned/burns/burner","flutter/fluttering/fluttered/flutters/flutterer","flap/flapping/flapped/flaps/flapper","ripple/rippling/rippled/ripples/rippler","smolder/smoldering/smoldered/smolders/smolderer","fizz/fizzing/fizzed/fizzes/fizzer","fester/festering/festered/festers/festerer","froth/frothing/frothed/froths/frother","rise/rising/rose/rises/riser","churn/churning/churned/churns/churner","shimmer/shimmering/shimmered/shimmers/shimmerer","blossom/blossoming/blossomed/blossoms/blossomer","wilt/wilting/wilted/wilts/wilter","twinkle/twinkling/twinkled/twinkles/twinkler","radiate/radiating/radiated/radiates/radiator","bloat/bloating/bloated/bloats/bloater","twist/twisting/twisted/twists/twister","wave/waving/waved/waves/waver","shudder/shuddering/shuddered/shudders/shudderer","shiver/shivering/shivered/shivers/shiverer","shake/shaking/shook/shakes/shaker","soften/softening/softened/softens/softener","harden/hardening/hardened/hardens/hardener","bleed/bleeding/bled/bleeds/bleeder","crack/cracking/cracked/cracks/cracker","blacken/blackening/blackened/blackens/blackener","whiten/whitening/whitened/whitens/whitener","wiggle/wiggling/wiggled/wiggles/wiggler"].concat();
dic.verbimg.subs=["normal","ing","ed","s","er"];
dic.verbimg.filters=[];
var vocal={};
dic.vocal=vocal;
dic.vocal.all=["mmmmmm","oooh","uhhhm","eeeeeeee","oof","wow","ouch","yikes","ahhhh","ugh","eeek","ahem","aargh","boo hoo","ha ha ha","muahahaha"].concat();
dic.vocal.subs=["default"];
dic.vocal.filters=[];
var x={};
dic.x=x;
dic.x.all=["I'll be damned","bravo","geez","holy cow","good heavens","holy moley","ermahgerd","LOL","Bingo","ROFL","WTF","good lord","awesome","excellent","jolly good","this is the end","run for your lives","wicked","epic","damn","oh boy","boy oh boy oh boy","what in the world","what the hell","oh joy","woot","omgomgomg","no way","this can't be","mine eyes are deceiving me","gasp","oh my goodness","oh dear","oh my","dear me","dear dear","my my","my oh my","aw shucks","whoa","wow","oh wow","trololol","oho","oh glorious day","disgraceful","oh hell yes","hella good","hurrah","what","beautiful","ahhhhh mahh gahh","by golly","this is delicious","oh gog","K.O.","finish him","my leg","I'm gonna faint","alas","rats"].concat();
dic.x.subs=["default"];
dic.x.filters=[];
var yn={};
dic.yn=yn;
dic.yn.yes=["yes","yayaya","yep","yeppers","definitely","absolutely","without a doubt","indeed","affirmative","undoubtedly","undeniably","yes/yes","hell yes","ya","certainly","obviously","oh yes","I couldn't agree more"];
dic.yn.no=["no","definitely not","absolutely not","no way","impossible","negative","nope","hell no","nooooo","not at all","certainly not","obviously not","oh no","most certainly not","there's no way","that can't be"];
dic.yn.all=[].concat(dic.yn.yes,dic.yn.no);
dic.yn.subs=[];
dic.yn.filters=["yes","no"];

var amount ={
};
dic.amount = amount;
var amount_all  = ["a few", "a bunch of", "some", "many more"];
dic.amount.all = amount_all;
dic.tokens.push("amount");

var faced ={
};
dic.faced = faced;
var faced_all  = ["smiled", "frowned", "grimaced", "grinned evilly", "grinned cheekily", "sneered", "puckered", "smirked", "snarled", "snickered", "pouted"];
dic.faced.all = faced_all;
dic.tokens.push("faced");

var pron_female ={
};
dic.pron_female = pron_female;
var pron_female_all  =  ["her/she/herself/her/hers"];
dic.pron_female.all = pron_female_all;
dic.tokens.push("pron_female");

dic.firstname.filters=["male","female"];


dic.alien = {};
var alien_race  = ["Badoon/Badoons","Brood/The Broods","Celestials/The Celestials","Kree/The Kree"];
dic.alien.all = alien_race;
dic.alien.races = alien_race;
dic.alien.subs=["plural"];
dic.tokens.push("alien");