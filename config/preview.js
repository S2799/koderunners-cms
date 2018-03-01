var cutStrings = function(s) {
    var ret = "";
	for(var i = 0;i < s.length; i++) {
		if(s[i] == '.')
			break;
		else
			ret += s[i];
	}
	return ret;
};

module.exports.cutStrings = cutStrings;