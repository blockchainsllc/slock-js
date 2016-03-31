module.exports = {
	
    /**
	 * make sure all adresses are formated the same way as 20byte in hex. 
	 */	
	normalizeAdr : function (a) {
		if (!a) return a;
		if (a.length>2 && a[1]=='x') a=a.substring(2);
		while (a.length>0 && a.substring(0,2)=="00") a=a.substring(2);
		while (a.length<40) a="0"+a;
		return "0x"+a.toLowerCase();
	}
 
}