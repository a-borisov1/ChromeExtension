const authorize = async (interactive) => {
  const token = localStorage.getItem('token');
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || token === undefined) {
        console.log(
          '=========== || Google login failed',
          chrome.runtime.lastError
        );
        reject(chrome.runtime.lastError);
      } else {
        console.log('=========== || Successfully logged in', token);
        localStorage.setItem('token', token);
        resolve(token);
      }
    });
  });
};

let pageLoadingCompleted = false;

const fetchData = async () => {
  const token = localStorage.getItem('token');
  const spreadsheetID = '1ilKRBtucJqQva6iJIXDZJTLlo9C-u1qW-xMYqJ_5_SE';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}/values/A:B?majorDimension=COLUMNS`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.ok) {
    return res.json();
  } else {
    alert('Ошибка HTTP: ' + res.status);
  }
};

chrome.tabs.onUpdated.addListener(async function (tabId, info, tab) {
  var title = tab.title;
  var url = tab.url;
  const match = {
    type: 'basic',
    title: 'Match found',
    message: title + ' was found in your spreadsheet',
    iconUrl: './images/get_started128.png',
  };

  const notMatch = {
    type: 'basic',
    title: 'No users with similar data',
    message: 'Better luck next time',
    iconUrl: './images/get_started128.png',
  };

  const condition =
    !tab.url.includes('/feed?') &&
    tab.url !== 'https://vk.com/feed' &&
    tab.url !== 'https://vk.com/im' &&
    tab.url !== 'https://vk.com/friends' &&
    !tab.url.includes('vk.com/friends?') &&
    tab.url !== 'https://vk.com/groups' &&
    !tab.url.includes('vk.com/albums') &&
    !tab.url.includes('vk.com/audios') &&
    !tab.url.includes('vk.com/video') &&
    !tab.url.includes('vk.com/bookmarks') &&
    !tab.url.includes('vk.com/docs') &&
    !tab.url.includes('vk.com/market') &&
    !tab.url.includes('vk.com/worki') &&
    !tab.url.includes('vk.com/apps');

  if (tab.url.includes('/vk.com/') && info.title) {
    await authorize();
    const data = await fetchData();
    const idArray = data?.values[1];

    const namesArray = data?.values[0].map((elem) => elem.trim().toLowerCase());
    let idMatches = idArray.includes(url);
    let nameMatches =
      namesArray.includes(title.toLowerCase()) ||
      namesArray.includes(
        title.toLowerCase().split(' ').reverse().join(' ').trim()
      );

    if (idMatches || nameMatches) {
      return chrome.notifications.create('Notification', match);
    }
    if (condition && !idMatches && !nameMatches) {
      return chrome.notifications.create('Notification', notMatch);
    }
  }
});
