// Flatten content
var maxSymbols = 140

function flattenContent(markup) {
  var nLeft = maxSymbols,
      s = markup.replace(/(&nbsp;|\s|<br>)+/g, " ") // single spaced
  return limit(s);
}

function limit(s) {
    var nLeft = maxSymbols, tags = [], ans = "", tag;
    
    for (var i = 0; i < s.length; ++i) {
        if (nLeft == 0) {
            break;
        }
        
        if (s[i] == '&') {
            do {
                ans += s[i++];
            } while (s[i] != ';');
            ans += ';';
            --nLeft;
        } else if (s[i] == '<') {
            tag = "";
            do {
                tag += s[i++];
            } while (s[i] != '>');
            tag += '>';
            if (!(/<div.+/.test(tag))) {
              ans += tag;
            }
            if (tag[1] == '/') {
                tags.pop();
            } else {
                tags.push(tag);
            }   
        } else {
            ans += s[i];
            --nLeft;
        }
    }
    tag = tags.pop();
    while (tag != undefined) {
        ans += tag.replace(/<([^\s]+).+/, "</$1>");
        tag = tags.pop();
    }
    if (i < s.length)
      ans += "...";
    return ans;
}


function squishShare(share) {
  if (share && !share.classList.contains('tweetified')) {
    $(share).html(flattenContent($(share).html()))
    share.classList.add('tweetified')
  }
}

function squishReshare(reshare) {
  if (reshare && !reshare.classList.contains('tweetified')) {
    var linkToSharer = $(reshare).siblings('.a-f-i-u-go').find('a'),
        sharerId = linkToSharer.attr('oid')
    // reshare header
    $(reshare).html(flattenContent($(reshare).html() + " <img src=\"" + chrome.extension.getURL("reshare-icon.png") + "\" />"
        + "<span class=\"proflinkWrapper\"><span class=\"proflinkPrefix\">+</span><a href=\"https://plus.google.com/"
        + sharerId + "\" class=\"proflink\" oid=\"" + sharerId + "\">" + linkToSharer.text()
        + "</a></span>" + " " + $(reshare).siblings('.a-f-i-u-qb').find('.a-b-f-i-p-R').html()))
    reshare.classList.add('tweetified')
  }
}

function onStreamChange(e) {
  if (e.target.id && e.target.id.indexOf('update') == 0) {
    var reshare = e.target.querySelector('.a-b-f-i-u-ki')
    if (reshare) {
      squishReshare(reshare)
    } else {
      var share = e.target.querySelector('.a-b-f-i-p-R')
      squishShare(share)
    }
  }
}

function onPageChange(e) {
  if (e.target.id && e.target.id == 'contentPane' && e.target.classList.contains('a-p-M-T-gi-xc')) {
    var stream = document.querySelector('.a-b-f-i-oa')
    $('.a-b-f-i-p-R', stream).each(function() { squishShare(this) })
    $('.a-b-f-i-u-ki', stream).each(function() { squishReshare(this) })
    if (stream) {
       stream.addEventListener('DOMSubtreeModified', onStreamChange, false)
    }
  }
}

$('.a-p-M-T-gi-xc .a-b-f-i-p-R').each(function() { squishShare(this) })
$('.a-p-M-T-gi-xc .a-b-f-i-u-ki').each(function() { squishReshare(this) })

var stream = document.querySelector('.a-p-M-T-gi-xc .a-b-f-i-oa')
if (stream) {
   stream.addEventListener('DOMSubtreeModified', onStreamChange, false)
}

var page = document.querySelector('.a-p-A-T')
if (page) {
  page.addEventListener('DOMSubtreeModified', onPageChange, false)
}
