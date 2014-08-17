(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['basil.js'], factory); // AMD
	} else if (typeof exports === 'object') {
		module.exports = factory(require( './basil.js')); // Node
	} else {
		factory(window.Basil); // Browser global
	}
}(function (Basil) {
	var BasilSet = function (options) {
		return new Basil.utils.extend(Basil.Storage().init(options), Basil.Set(options));
	};

	Basil.Set = function () {
                var _indexOf = function(array, item) {
                    
                    for (var i = 0, length = array.length; i < length; i++) {
                        if(array[i] === item) {
                            return i;
                        }
                    }
                    
                    return -1;
                };

		var _contains = function (array, item) {
			return _indexOf(array, item) >= 0;
		};
                
                var _isArray = function(arg) {
                        return Object.prototype.toString.call(arg) === '[object Array]';
                };
                
                //http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript               
                var _shuffle = function (o){
                    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                    return o;
                };
                
                var _union = function() {
                    var allElements = [], uniqElements = [];
                    
                    for (var i = 0, length = arguments.length; i < length; i++) {
                        allElements = allElements.concat(arguments[i]);
                    }
                    
                    for (var i = 0, length = allElements.length; i < length; i++) {
                        if (!_contains(uniqElements, allElements[i])) {
                            uniqElements.push(allElements[i]);
                        }
                    }
                    
                    return uniqElements;
                };

                var _difference = function() {
                    var firstArray = arguments[0], otherArrays = [], diffArray = [];
                    
                    for (var i = 1, length = arguments.length; i < length; i++) {
                        otherArrays = otherArrays.concat(arguments[i]);
                    }
                    
                    for (var i = 0, length = firstArray.length; i < length; i++) {
                        if (!_contains(otherArrays, firstArray[i])) {
                            diffArray.push(firstArray[i]);
                        }
                    }
                    
                    return diffArray;
                };

                var _intersection = function() {
                    var result = [], firstArray = arguments[0],
                            argsLength = arguments.length;
                    
                    for (var i = 0, length = firstArray.length; i < length; i++) {
                        var item = firstArray[i];
                        
                        if (_contains(result, item))
                            continue;
                        
                        for (var j = 1; j < argsLength; j++) {
                            if (!_contains(arguments[j], item))
                                break;
                        }
                        
                        if (j === argsLength)
                            result.push(item);
                    }
                    
                    return result;
                };

		return {
			_setPlugin: true,
			sadd: function (key, members) {
				var set = this.get(key) || [], addedItems = 0;
                                
                                if(!_isArray(members)) { members = [members]; } //Accept array or single.
                                
                                if(set.length > 0) {
                                    for (var i = 0, length = members.length; i < length; i++) {
                                        if(!_contains(set, members[i])) {
                                            set.push(members[i]);
                                            addedItems++;
                                        }
                                    }
                                } else {
                                    set = members;
                                    addedItems = members.length;
                                }
                                
				this.set(key, set);
                                return addedItems;
			},
			scard: function (key) {
				var list = this.get(key) || [];
                                return list.length;
			},
			sdiff: function () {
				return _difference(arguments);
			},
			sdiffstore: function (key) {
                                var difference = _difference(Array.prototype.slice.call(arguments, 1));
				this.set(key, difference);
			},
                        sinter: function () {
				return _intersection(arguments);
			},
                        sinterstore: function (key) {
				var intersection = _intersection(Array.prototype.slice.call(arguments, 1));
				this.set(key, intersection);
			},
                        sismember: function (key, member) {
				var set = this.get(key) || [];
                                
                                if(_contains(set, member)) {
                                    return 1;
                                }
                                
                                return 0;
			},
                        smembers: function (key) {
				return this.get(key) || [];
			},
                        smove: function (source, destination, member) {
				var sourceSet = this.get(source) || [],
                                        destinationSet = this.get(destination) || [];
                                
                                if(sourceSet.length === 0 || !_contains(sourceSet, member)) {
                                    return 0;
                                }                                
                                
                                if(!_contains(destinationSet, member)) {
                                    destinationSet.push(member);
                                    this.set(destination, destinationSet);
                                    sourceSet.splice(_indexOf(sourceSet, member), 1);
                                    if(sourceSet.length === 0) {
                                        this.remove(sourceSet);
                                    } else {
                                        this.set(source, sourceSet);
                                    }
                                    return 1;
                                }
                                
                                return 0;
			},
                        spop: function (key) {
				var set = this.get(key) || [], setLength = set.length,
                                        randomIndex, member;
                                        
                                if(setLength === 0) {
                                    return null;
                                }
                                
                                randomIndex = Math.floor(Math.random() * setLength);
                                
                                if(arguments[1]) {
                                    member = set[randomIndex];
                                } else {
                                    member = set.splice(randomIndex, 1);
                                    if(set.length === 0) {
                                        this.remove(key);
                                    } else {
                                        this.set(key, set);
                                    }
                                }
                                
                                return member;
			},
                        srandmember: function (key, count) {
				var set = this.get(key) || [];
                                
                                if(count === undefined) {
                                    return this.spop(key, true);
                                } else {
                                        if (count > 0){
                                            return _shuffle(set).splice(0, count);
                                        } else if(count < 0) {
                                            count = Math.abs(count);
                                            if(set.length >= count) {
                                                return _shuffle(set).splice(0, count);
                                            } else {
                                                var setLength = set.length, randomIndex,
                                                        randomItemsArray = [];
                                                while(count) {
                                                    randomIndex = Math.floor(Math.random() * setLength);
                                                    randomItemsArray.push(set[randomIndex]);
                                                    count--;
                                                }
                                                return randomItemsArray;
                                            }
                                        } else {
                                            return this.spop(key, true);
                                        }
                                }
                                return null;
			},
                        srem: function (key, members) {
				var set = this.get(key) || [], removedItems = 0;
                                
                                if(set.length === 0) {
                                    return 0;
                                }
                                
                                if(!_isArray(members)) { members = [members]; } //Accept array or single.
                                
                                for (var i = 0, length = members.length; i < length; i++) {
                                    var member = members[i];
                                    if(_contains(set, member)) {
                                        set.splice(_indexOf(set, member), 1);
                                        removedItems++;
                                    }
                                }
                                
                                this.set(key, set);
                                
                                return removedItems;
			},
                        sunion: function () {
				return _union(arguments);
			},
                        sunionstore: function (key) {
				var union = _union(Array.prototype.slice.call(arguments, 1));
                                this.set(key, union);
			},
                        sscan: function () {
				throw new Error('not implemented yet');
			}
		};
	};

	// browser export
	window.Basil = BasilSet;

	// AMD export
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return BasilSet;
		});
	// commonjs export
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = BasilSet;
	}

}));