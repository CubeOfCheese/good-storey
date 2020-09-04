var hasSubscore;

var adJSON = '{ "link": "https://cleanbean.cafe/?product=pure-sugar?utm=stuffsrc=Ethicli",' +
'"image": "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2500&q=80",' +
'"companyScore": 9.4,' +
'"companyName": "Clean Bean Cafe",' +
'"price": 4.99,' +
'"productName": "tee",' +
'"productTags": [' +
'"tee",' +
'"shirt",' +
'"top",' +
'"Men\'s"' +
']}';

let ad = JSON.parse(adJSON)

chrome.runtime.sendMessage({ msgName: "isShoppingPage?" }, function(response) {
    if (response.shoppingPage) {
      chrome.runtime.sendMessage({ msgName: "whatsMainRating?" }, function(response) {
        loadExtension(response.ethicliStats);
      });
      chrome.runtime.sendMessage({ msgName: "productIdentified?" }, function(response) {
        console.log(response);
        if (response) {
          loadSponsor(response.productName);
        }
      });
    }
});

function loadExtension(ethicliStats) {
    var ethicliScore = (ethicliStats.overallScore).toFixed(1);
    if (ethicliScore > 0.0) {  // This will need to be updated once negative scores are used as default
      adjustSubscores();
    }
    function adjustSubscores() {
        var fullheight = 600;
        if (ethicliStats.environmentScore == 0.0) {
            fullheight = fullheight-50;
            document.getElementById("envSection").style = "display:none;";
        }
        if (ethicliStats.laborScore == 0.0) {
            fullheight = fullheight-50;
            document.getElementById("laborSection").style = "display:none;";
        }
        if (ethicliStats.animalsScore == 0.0) {
            fullheight = fullheight-50;
            document.getElementById("animalSection").style = "display:none;";
        }
        if (ethicliStats.socialScore == 0.0) {
            fullheight = fullheight-50;
            document.getElementById("socialSection").style = "display:none;";
        }
        if (ethicliStats.environmentScore == 0.0 &&
            ethicliStats.laborScore == 0.0 &&
            ethicliStats.animalsScore == 0.0 &&
            ethicliStats.socialScore == 0.0
        ){
            hasSubscore = false;
            document.getElementById("noSubscore").style = "display:block;";
            document.getElementById("detailsButton").style = "display:none;"
            fullheight = 160;
        } else {
            hasSubscore = true;
        }
        var newHeight = "height:"+fullheight+"px;";
        document.body.style = newHeight;
    }

    //Change sitename
    document.getElementById("siteurl").textContent = ethicliStats.name;
    if (ethicliStats.name == null) {
        document.getElementById("siteurl").textContent = "Unavailable";
    }

    //Change "View Details" button routing
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, function callback(tabs) {
      var currentTab = tabs[0];
      var companyName = urlToCompanyName(currentTab.url);

      var infoLink = document.createElement("a");
      infoLink.href = "https://ethicli.com/info/" + companyName;
      infoLink.target = "_blank";
      infoLink.textContent = "View Details";
      document.getElementById("detailsButton").append(infoLink);
    })

    //Changes subratings
    document.getElementById("envScore").textContent = ethicliStats.environmentScore.toFixed(1);
    document.getElementById("laborScore").textContent = ethicliStats.laborScore.toFixed(1);
    document.getElementById("animalScore").textContent = ethicliStats.animalsScore.toFixed(1);
    document.getElementById("socialScore").textContent = ethicliStats.socialScore.toFixed(1);

    //Changes subratings scorebar
    var envScore = ethicliStats.environmentScore*20;
    document.getElementById("envScoreBar").style.width = envScore + "px";
    var laborScore = ethicliStats.laborScore*20;
    document.getElementById("laborScoreBar").style.width = laborScore + "px";
    var animalScore = ethicliStats.animalsScore*20;
    document.getElementById("animalScoreBar").style.width = animalScore + "px";
    var socialScore = ethicliStats.socialScore*20;
    document.getElementById("socialScoreBar").style.width = socialScore + "px";

    if (document.getElementById("overallScore")!== null) { //checks to see if ID even appears on page
        document.getElementById("overallScore").textContent = ethicliScore;
    }

    // Badges ------------------------------------------------------------------------------------------------
    var badgeCounter = 0;
    if (ethicliStats.bcorpCertified) {
        document.getElementById("bcorp").classList.add("trueForPage");
        badgeCounter++;
    }
    if (ethicliStats.bluesignPartner) {
        document.getElementById("bluesign").classList.add("trueForPage");
        badgeCounter++;
    }
    if (ethicliStats.blackOwnedBusiness) {
        document.getElementById("blackowned").classList.add("trueForPage");
        badgeCounter++;
    }
    if (ethicliStats.supportsBLM) {
        document.getElementById("blmsupport").classList.add("trueForPage");
        badgeCounter++;
    }
    if (ethicliStats.veganDotOrgCertified) {
        document.getElementById("vegan").classList.add("trueForPage");
        badgeCounter++;
    }
    if (ethicliStats.leapingBunnyCertified) {
        document.getElementById("leapingbunny").classList.add("trueForPage");
        badgeCounter++;
    }
    if (badgeCounter>0) {
        // document.getElementById("noBadge").style.display = "none";
        // document.getElementById("hasBadge").style.display = "block";
        // document.body.style = "height:190px;"
    }
    // End Badges ------------------------------------------------------------------------------------

}

function loadSponsor(productName) {
  var display = false;
  var nameWords = productName.split(" ");

  for (var i = 0; i < nameWords.length; i++) {
    for (var j = 0; j < ad.productTags.length; j++) {
      if (nameWords[i].toLowerCase() == ad.productTags[j].toLowerCase()) {
        console.log(nameWords[i]);
        console.log(ad.productTags[j]);
        display = true;
      }
    }
  }
  if (display) {
    console.log("display ad");
    document.getElementById("sponsor").style = "display:block;";
    document.getElementById("sponsorLink").href = ad.link;
    document.getElementById("sponsorCompany").textContent = ad.companyName;
    document.getElementById("sponsorRating").textContent = ad.companyScore;
    document.getElementById("sponsorPrice").textContent = ad.price;
    document.getElementById("sponsorImg").src = ad.image;
  }
  else {
    console.log("hide ad");
    document.getElementById("sponsor").style = "display:none;";
    // Something to resize the popup might belong here
  }
}

window.onload = function() {
    document.getElementById("menu").addEventListener("click", function() {
        document.getElementById("menuPanel").classList.toggle("menuClicked");
    });

    document.getElementById("menuBacking").addEventListener("click", function() {
        document.getElementById("menuPanel").classList.remove("menuClicked");
    });

    document.getElementById("somethingWrong").addEventListener("click", function() {
        somethingWrong();
    });

    if(document.getElementById("scores") != null){ //if there is a scores ID present
        document.getElementById("scores").onmouseover = function() {
            if (hasSubscore) {
                document.getElementById("subscoreTip").style.left = (event.clientX-30)+"px";
                document.getElementById("subscoreTip").style.top = (event.clientY-30)+"px";
            } else {
                document.getElementById("subscoreTip").style = "display:none;";
            }
        };
    }

    if(document.getElementById("sitename") != null){
        fadeLongURL();
    }
}

function fadeLongURL(){
    document.getElementById("siteurl").addEventListener("mouseover", function( event ) {
        var siteurlLength = this.innerHTML.length+16;
        if(siteurlLength > 30){
            this.style = "margin-left: -"+(siteurlLength)+"px;";
            document.getElementById("siteurlcontainer").style =
                "-webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 100%, transparent 100%);\
                mask-image: linear-gradient(to right, transparent 0%, black 5%, black 100%, transparent 100%)";
        }
    })
    document.getElementById("siteurl").addEventListener("mouseout", function( event ) {
        this.style = "margin-left: 0px;";
        document.getElementById("siteurlcontainer").style =
            "-webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);\
            mask-image: linear-gradient(to right, black 90%, transparent 100%)";
    })
}

function urlToCompanyName(url) {
  if (url.substring(0, 8) == "https://") {
    url = url.substring(8);
  }
  else if (url.substring(0, 7) == "http://") {
    url = url.substring(7);
  }

  if (url.substring(0, 4) == "www.") {
    url = url.substring(4);
  }
  else if (url.substring(0, 4) == "us.") {
    url = url.substring(3);
  }
  else if (url.substring(0, 4) == "docs.") {
    url = url.substring(5);
  }

  var endOfBaseDomain = url.search(/\./);
  if (endOfBaseDomain > -1) {
    url = url.substring(0, endOfBaseDomain);
  }
  return url;
}

function somethingWrong() {
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, function callback(tabs) {
        var currentTab = tabs[0];
        var fetchUrlFeedback = "https://ethicli.com/feedback";
        let fetchData = {
            url: currentTab.url
        };
        let fetchParams = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fetchData)
        }
        fetch(fetchUrlFeedback, fetchParams)

        //Pulls and sets email
        document.getElementById("sendEmail").href = sendEmail();
        function sendEmail() {
            var emailUrl = "mailto:hello@ethicli.com?subject=Error%20With%20Current%20Website%20&body=Error%20with%20the%20following%20page:%20"+currentTab.url+"%0d%0aPlease%20let%20us%20know%20what%20is%20wrong%20below.";
            chrome.tabs.create({ url: emailUrl }, function(tab) {
                setTimeout(function() {
                    chrome.tabs.remove(tab.id);
                }, 500);
            });
        }
    });
}
