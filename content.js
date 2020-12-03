chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'clicked_browser_action') {
    const name = $('h1').html();
    const firstHref = window.location.href;
  }
});
