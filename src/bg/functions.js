function isLocalhost(url){
    // Should just remove the port instead of using contains
    return (getTLDomain(url).toLowerCase().indexOf("localhost") !== -1);
}

function getIPs(callback) {
    var ips = [];

    var RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var pc = new RTCPeerConnection({
        // Don't specify any stun/turn servers, otherwise you will
        // also find your public IP addresses.
        iceServers: []
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel('');
    
    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function(e) {
        if (!e.candidate) { // Candidate gathering completed.
            pc.close();
            callback(ips);
            return;
        }
        var candidate = e.candidate.candidate;
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        try{
            var ip_addr = ip_regex.exec(candidate)[1];

            //remove duplicates
            if (ips.indexOf(ip_addr) === -1) {
                ips.push(ip_addr);
            }
        }
        catch(err){}
    };
    pc.createOffer(function(sdp) {
        pc.setLocalDescription(sdp);
    }, function onerror() {});
}

function getLocalhostLink(url){
    var localLink = "";
    var protocol = url.substring(0,getFirstPosition(url,"://",false));
    // production link starts with protocol
    localLink = protocol;
    var port = getPort(url);
    // add the TLDomain
    localLink += "localhost" + port + "/";
    // add the rest of the url after the tld
    localLink += url.substring(getPosition(url, "/", 3)+1,url.length);
    return localLink;
}
function getIPLink(url,ip){
    var ipLink = "";
    var protocol = url.substring(0,getFirstPosition(url,"://",false));
    // link starts with protocol
    ipLink = protocol;
    var port = getPort(url);
    // add the TLDomain
    ipLink += ip + port + "/";
    // add the rest of the url after the tld
    ipLink += url.substring(getPosition(url, "/", 3)+1,url.length);
    return ipLink;
}

function getTLDomain(url){
    var protocolEndPos = getFirstPosition(url,"://",false);
    var endOfTLDpos = getPosition(url,"/",3);
    var tld = url.substring(0,endOfTLDpos);

    var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
    if(url.substring(protocolEndPos,endOfTLDpos).match(ip_regex)){
        return url.substring(protocolEndPos,endOfTLDpos);
    }
    var numOfPeriods = (tld.match(/\./g) || []).length;
    if(numOfPeriods>=2){
        // + 1 for the length of the '.'
        var startOftld = getPosition(tld,".", numOfPeriods-1)+1;
        return tld.substring(startOftld,endOfTLDpos);
    }
    return url.substring(protocolEndPos,endOfTLDpos);
}
function getPort(url){
    var tld = getTLDomain(url);
    if(tld.indexOf(":") === -1){
        return "";
    }
    return tld.substring(tld.indexOf(":"),tld.length);
}

function getPosition(haystack, needle, position) {
   return haystack.split(needle, position).join(needle).length;
}

// beginning:true or end:false boolean
function getFirstPosition(haystack,needle,beginning){
    var position;
    position = haystack.indexOf(needle);
    if (beginning==false){
        position = position + needle.length;
    }
    return position;
}