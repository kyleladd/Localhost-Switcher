// Show page action icon in omnibar.
function showPageAction( tabId, changeInfo, tab ) {
        chrome.pageAction.show(tabId);
};
// Call the above function when the url of a tab changes.
chrome.tabs.onUpdated.addListener(showPageAction);

var alreadyClicked = false;
var clickType = "single";
//Add Default Listener provided by chrome.api.*
chrome.pageAction.onClicked.addListener(function (tab) 
{    //Check for previous click
    if (alreadyClicked) {
        //Yes, Previous Click Detected
        //Clear timer already set in earlier Click
        clearTimeout(timer);
        clickType = "double";
        init();
        //Clear all Clicks
        alreadyClicked = false;
        return;
    }
    //Set Click to  true
    alreadyClicked = true;
    //Add a timer to detect next click to a sample of 250
    timer = setTimeout(function () {
        //No more clicks so, this is a single click
        clickType = "single";
        //Clear all timers
        clearTimeout(timer);
        init();
        //Clear all Clicks
        alreadyClicked = false;
    }, 250);
});

function init() { 
    var chromeurl = window.location.href;     // Returns full URL
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var tab = tabs[0];
      var url = tabs[0].url;
        var redirectLink = "";
        if(isLocalhost(url)){
            getIPs(function(ips){
                var localIPs = [];
                var ipV6s = [];
                var publicIPs = [];

                for(var i in ips){
                    var ip = ips[i];
                    if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)){
                        //local IPs
                        localIPs.push(ip);
                    }
                    else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/)){
                        //IPv6 addresses
                        ipV6s.push(ip);
                    }
                    else{
                        //assume the rest are public IPs
                        publicIPs.push(ip);
                    }
                }
                if(publicIPs.length<0){
                    redirectLink = publicIPs[0];
                }
                else if(localIPs.length>0){
                    redirectLink = localIPs[0];
                }
                navigateRedirect(tab,clickType,getIPLink(url,redirectLink));
            });
        }
        else{
            redirectLink = getLocalhostLink(url);
            navigateRedirect(tab,clickType,redirectLink);
        }
    });
} 
function navigateRedirect(tab,clickType,redirectTo){
    if(clickType=="single"){
        chrome.tabs.getSelected(null, function(tab){
            chrome.tabs.update(tab.id, {url: redirectTo});
        });
    }
    else{
        chrome.tabs.create({ url: redirectTo });
    }
}