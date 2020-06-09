chrome.browserAction.setIcon({ path: { "16": "icons/grey-16.png" } })

var isShoppingPage;
var ethicliStats;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        reloadExt(request, sender, sendResponse)
    }
);

function reloadExt(request, sender, sendResponse) {
    if (request.msgName == "PageEvaluated") {
        var query = { active: true, currentWindow: true };
        chrome.tabs.query(query, function callback(tabs) {
            var currentTab = tabs[0];
            if (request.shoppingPage == true) {
                chrome.browserAction.setIcon({ path: { "16": "icons/ethicli-16.png" }, tabId: currentTab.id })
                isShoppingPage = true;
                var companyNamePromise = getCompanyName(sender.tab.url)
                companyNamePromise.then(companyName => {
                    if (companyName == null) {
                        var companyName = sender.tab.title.split(' ')[0];
                    }
                    companyName = companyName.split(' ')[0];

                    var blueSignRequest = new XMLHttpRequest()
                    var url = 'http://ethicli.com/score/' + companyName;
                    blueSignRequest.open('GET', url, true)
                    blueSignRequest.onload = function() {
                        var jsonResponse = JSON.parse(this.response);
                        ethicliStats = jsonResponse;

                        ethicliBadgeScore = Math.round(jsonResponse.overallScore / 20);
                        if (jsonResponse.bcorpCertified && jsonResponse.bluesignPartner) {
                            ethicliBadgeScore += 1;
                        } else if (jsonResponse.bluesignPartner) {
                            ethicliBadgeScore = 7.5;
                        }

                        if ((isNaN(jsonResponse.overallScore)) || (ethicliBadgeScore == 0)) {
                            ethicliBadgeScore = "";
                            chrome.browserAction.setPopup({ popup: "popupNoData.html", tabId: currentTab.id })
                        } else {
                            chrome.browserAction.setPopup({ popup: "popup.html", tabId: currentTab.id })
                        }
                        chrome.browserAction.setBadgeText({ text: ethicliBadgeScore.toString(), tabId: currentTab.id });
                    }
                    blueSignRequest.send()
                });
            } else {
                isShoppingPage = false;
                chrome.browserAction.setPopup({ popup: "popupNotShop.html", tabId: currentTab.id })
                chrome.browserAction.setIcon({ path: { "16": "icons/grey-16.png" }, tabId: currentTab.id })
                chrome.browserAction.setBadgeText({ text: "", tabId: currentTab.id });
            }
        })
    }
    return true;
}

chrome.tabs.onActivated.addListener(
    function() {
        var query = { active: true, currentWindow: true };
        chrome.tabs.query(query, function callback(tabs) {
            var currentTab = tabs[0];
            console.log(currentTab.url);
            console.log(currentTab.url != "chrome://newtab/");
            if (isShoppingPage && currentTab.url && (currentTab.url != "chrome://newtab/")) { // currentTab.url is null for new tab pages when first opened and equal to "chrome://newtab/" when navigated to from another tab.
            // data should only be retrieved for actual pages that are shopping pages
                var request = { msgName: "PageEvaluated", shoppingPage: true };
                var sender = { tab: { url: "" } };
                sender.tab.url = currentTab.url;
                reloadExt(request, sender);
            }
        })
    }
);

chrome.tabs.onCreated.addListener(
    function() {
        var query = { active: true, currentWindow: true };
        chrome.tabs.query(query, function callback(tabs) {
            var currentTab = tabs[0];
            console.log(currentTab.id);
            chrome.browserAction.setPopup({ popup: "popupNotShop.html", tabId: currentTab.id })
            chrome.browserAction.setIcon({ path: { "16": "icons/grey-16.png" }, tabId: currentTab.id })
            chrome.browserAction.setBadgeText({ text: "", tabId: currentTab.id });
        })
    }
)

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msgName == "isShoppingPage?") {
            sendResponse({ shoppingPage: isShoppingPage });
        }
        if (request.msgName == "whatsMainRating?") {
            sendResponse({ ethicliStats: ethicliStats });
        }
    }
);

function getCompanyName(companyUrl) {
    if (companyUrl.substring(0, 8) == "https://") companyUrl = companyUrl.substring(8);
    else if (companyUrl.substring(0, 7) == "http://") companyUrl = companyUrl.substring(7);
    var endOfBaseDomain = companyUrl.search("/");
    if (endOfBaseDomain > -1) companyUrl = companyUrl.substring(0, endOfBaseDomain);
    var fetchUrl = "https://company.bigpicture.io/v1/companies/find?domain=" + companyUrl;
    var fetchParams = {
        headers: {
            'Authorization': env.COMPANY_NAME_API_KEY // hidden from github bots
        }
    }
    return fetch(fetchUrl, fetchParams)
        .then(data => { return data.json() })
        .then(res => { return res.name.toLowerCase(); })
}
