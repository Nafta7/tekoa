(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPlaylistsByChannel = exports.getContent = exports.getPlaylist = undefined;

var _ContentType = require('../constants/ContentType');

var _ContentType2 = _interopRequireDefault(_ContentType);

var _AppConstants = require('../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var key = require('../../credentials').key;


var baseUrl = 'https://www.googleapis.com/youtube/v3';

function getContent(query, type) {
  var pageToken = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var resource = 'search';
  var params = 'part=snippet&key=' + key + '&type=' + type;
  params += '&maxResults=' + _AppConstants2.default.CONTENT_MAX_RESULTS;
  var url = baseUrl + '/' + resource + '?' + params + '&q=' + query;

  if (pageToken !== '') {
    url += '&pageToken=' + pageToken;
  }

  return fetch(url).then(function (res) {
    return res.json();
  }).then(function (data) {
    var items = data.items.map(function (item) {
      return {
        id: item.id[type + 'Id'],
        title: item.snippet.title,
        thumbnails: item.snippet.thumbnails,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle
      };
    });

    var newData = Object.assign({}, data, { items: items });
    return newData;
  });
}

function getPlaylistsByChannel(channelId) {
  var pageToken = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var resource = 'playlists';
  var params = 'part=snippet&key=' + key;
  params += '&maxResults=' + _AppConstants2.default.CONTENT_MAX_RESULTS;
  var url = baseUrl + '/' + resource + '?' + params + '&channelId=' + channelId;

  if (pageToken !== '') {
    url += '&pageToken=' + pageToken;
  }

  return fetch(url).then(function (res) {
    return res.json();
  }).then(function (data) {
    var items = data.items.map(function (item) {
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId
      };
    });
    var newData = Object.assign({}, data, { items: items });
    return newData;
  });
}

function playlistItemsAPI() {
  var resource = 'playlistItems';
  var paramKey = 'key=' + key;
  var part = 'part=snippet';
  var params = part + '&maxResults=' + _AppConstants2.default.PLAYLIST_ITEMS_MAX_RESULTS;
  params += '&order=date&' + paramKey;

  return baseUrl + '/' + resource + '?' + params;
}

function getPlaylist(id, type, pageToken) {
  if (type === _ContentType2.default.CHANNEL) {
    return getChannelPlaylist(id).then(function (uploadsId) {
      return getPlaylistItems(uploadsId, pageToken);
    });
  } else {
    return getPlaylistItems(id, pageToken);
  }
}

function getPlaylistItems(id, pageToken) {
  return fetchPlaylistItems(id, pageToken);
}

function fetchPlaylistItems(id, pageToken) {
  var url = playlistItemsAPI() + '&playlistId=' + id;
  var newUrl = pageToken ? url + '&pageToken=' + pageToken : url;

  return fetch(newUrl).then(function (res) {
    return res.json();
  }).then(function (data) {
    var items = data.items.map(function (item) {
      return {
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnails: item.snippet.thumbnails
      };
    });

    var newData = Object.assign({}, data, { items: items, playlistId: id });
    return newData;
  });
}

/*
  Recursive function that fetches all the PlaylistItems.
*/
function fetchPlaylistItemsAtOnce(id) {
  var results = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var nextPageToken = arguments[2];

  var url = playlistItemsAPI() + '&playlistId=' + id;
  var newUrl = nextPageToken ? url + '&pageToken=' + nextPageToken : url;

  return fetch(newUrl).then(function (res) {
    return res.json();
  }).then(function (data) {

    var items = data.items.map(function (item) {
      return {
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnails: item.snippet.thumbnails
      };
    });

    results = results.concat(items);

    if (data.nextPageToken) {
      return fetchPlaylistItemsAtOnce(url, results, data.nextPageToken);
    } else {
      var newData = Object.assign({}, data, { items: results });
      return newData;
    }
  });
}

/* The list of videos/uploads from a channel is treated as
   a Playlist, so we have to get this id to hand it
   to the playlistItems resource.
*/
function getChannelPlaylist(id) {
  var params = 'part=contentDetails&id=' + id + '&key=' + key;
  var url = baseUrl + '/channels?' + params;
  return fetch(url).then(function (res) {
    return res.json();
  }).then(function (data) {
    return data.items[0].contentDetails.relatedPlaylists.uploads;
  });
}

exports.getPlaylist = getPlaylist;
exports.getContent = getContent;
exports.getPlaylistsByChannel = getPlaylistsByChannel;

},{"../../credentials":20,"../constants/AppConstants":12,"../constants/ContentType":13}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _ChannelItem = require('./ChannelItem');

var _ChannelItem2 = _interopRequireDefault(_ChannelItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ChannelGrid = function ChannelGrid(_ref) {
  var items = _ref.items,
      hasMoreResults = _ref.hasMoreResults,
      onContentItemClick = _ref.onContentItemClick,
      onPlaylistsClick = _ref.onPlaylistsClick,
      onLoadMore = _ref.onLoadMore;

  var gridVisibility = 'show';
  return (0, _inferno.createVNode)(2, 'div', {
    'class': 'main flat-scroll'
  }, [(0, _inferno.createVNode)(2, 'div', {
    'class': 'content'
  }, items.map(function (item) {
    return (0, _inferno.createVNode)(16, _ChannelItem2.default, {
      'id': item.id,
      'title': item.title,
      'thumbnails': item.thumbnails,
      'onClick': onContentItemClick,
      'onPlaylistsClick': onPlaylistsClick
    });
  })), (0, _inferno.createVNode)(2, 'div', {
    'class': 'align-center'
  }, (0, _inferno.createVNode)(2, 'button', {
    'class': 'button minor',
    'disabled': !hasMoreResults()
  }, 'Load more', {
    'onClick': onLoadMore
  }))]);
};

exports.default = ChannelGrid;

},{"./ChannelItem":3,"inferno":91}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _ContentType = require('../constants/ContentType');

var _ContentType2 = _interopRequireDefault(_ContentType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ChannelItem = function ChannelItem(_ref) {
  var id = _ref.id,
      title = _ref.title,
      thumbnails = _ref.thumbnails,
      _onClick = _ref.onClick,
      onPlaylistsClick = _ref.onPlaylistsClick;

  var maxLength = 20;
  title = title.length > maxLength ? title.substring(0, 20).concat('...') : title;
  return (0, _inferno.createVNode)(2, 'div', {
    'class': 'content-item'
  }, [(0, _inferno.createVNode)(2, 'a', {
    'href': '#'
  }, (0, _inferno.createVNode)(2, 'img', {
    'src': thumbnails.high.url
  }), {
    'onClick': function onClick(e) {
      return _onClick(e, id);
    }
  }), (0, _inferno.createVNode)(2, 'div', {
    'class': 'content-item-details'
  }, [(0, _inferno.createVNode)(2, 'h2', {
    'class': 'content-item-title'
  }, [' ', title, ' ']), (0, _inferno.createVNode)(2, 'button', {
    'class': 'button major small'
  }, 'Playlists', {
    'onClick': onPlaylistsClick.bind(null, id, _ContentType2.default.CHANNEL)
  })])]);
};

exports.default = ChannelItem;

},{"../constants/ContentType":13,"inferno":91}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _ContentType = require('../constants/ContentType');

var _ContentType2 = _interopRequireDefault(_ContentType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContentTypeSelection = function ContentTypeSelection(_ref) {
  var onContentTypeClick = _ref.onContentTypeClick,
      selectedType = _ref.selectedType;

  var btnPlaylistClasses = void 0,
      btnChannelClasses = void 0;
  btnPlaylistClasses = ['button', 'selection'];
  btnChannelClasses = ['button', 'selection'];
  if (selectedType === _ContentType2.default.PLAYLIST) btnPlaylistClasses.push('active');else if (selectedType === _ContentType2.default.CHANNEL) btnChannelClasses.push('active');

  return (0, _inferno.createVNode)(2, 'div', {
    'class': 'content-type-selection'
  }, [(0, _inferno.createVNode)(2, 'button', {
    'type': 'button',
    'class': btnPlaylistClasses.join(' ')
  }, 'Playlist', {
    'onClick': onContentTypeClick.bind(null, _ContentType2.default.PLAYLIST)
  }), (0, _inferno.createVNode)(2, 'button', {
    'type': 'button',
    'class': btnChannelClasses.join(' ')
  }, 'Channel', {
    'onClick': onContentTypeClick.bind(null, _ContentType2.default.CHANNEL)
  })]);
};

exports.default = ContentTypeSelection;

},{"../constants/ContentType":13,"inferno":91}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Nav = function Nav(_ref) {
  var children = _ref.children;

  return (0, _inferno.createVNode)(2, 'nav', {
    'class': 'nav'
  }, [(0, _inferno.createVNode)(2, 'a', {
    'class': 'logo',
    'href': '#'
  }, (0, _inferno.createVNode)(2, 'h1', null, [(0, _inferno.createVNode)(2, 'span', {
    'class': 'mini'
  }, 't'), (0, _inferno.createVNode)(2, 'span', {
    'class': 'full'
  }, 'tekoa')])), children, (0, _inferno.createVNode)(2, 'div', {
    'class': 'settings'
  }, (0, _inferno.createVNode)(2, 'p'))]);
};

exports.default = Nav;

},{"inferno":91}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var Player = function Player(_ref) {
  var isMinimized = _ref.isMinimized;

  var playerClasses = isMinimized ? 'minimize' : '';

  return (0, _inferno.createVNode)(2, 'div', {
    'class': 'player ' + playerClasses
  }, (0, _inferno.createVNode)(2, 'div', {
    'className': 'player-container'
  }, (0, _inferno.createVNode)(2, 'div', {
    'id': 'video-player'
  })));
};

exports.default = Player;

},{"inferno":91}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var PlayerControls = function PlayerControls(_ref) {
  var onNext = _ref.onNext,
      onPrevious = _ref.onPrevious,
      onToggle = _ref.onToggle,
      isPlaying = _ref.isPlaying,
      isPlayerMinimized = _ref.isPlayerMinimized,
      onTogglePlayer = _ref.onTogglePlayer;

  var play = isPlaying ? '⏸' : '⏵';
  var togglePlayer = '⏶';
  var toggleVisibility = isPlayerMinimized ? '' : 'flip';
  return (0, _inferno.createVNode)(2, 'div', {
    'class': 'player-controls-container'
  }, (0, _inferno.createVNode)(2, 'ul', {
    'class': 'player-controls-list'
  }, [(0, _inferno.createVNode)(2, 'ul', {
    'class': 'player-controls'
  }, [(0, _inferno.createVNode)(2, 'li', null, (0, _inferno.createVNode)(2, 'button', {
    'class': 'control'
  }, '\u23EA', {
    'onClick': onPrevious
  })), (0, _inferno.createVNode)(2, 'li', null, (0, _inferno.createVNode)(2, 'button', {
    'class': 'control'
  }, play, {
    'onClick': onToggle
  })), (0, _inferno.createVNode)(2, 'li', null, (0, _inferno.createVNode)(2, 'button', {
    'class': 'control'
  }, '\u23E9', {
    'onClick': onNext
  }))]), (0, _inferno.createVNode)(2, 'div', {
    'class': 'player-toggle'
  }, (0, _inferno.createVNode)(2, 'button', {
    'class': 'control'
  }, (0, _inferno.createVNode)(2, 'label', {
    'class': 'control-toggle ' + toggleVisibility
  }, togglePlayer), {
    'onClick': onTogglePlayer
  }))]));
};

exports.default = PlayerControls;

},{"inferno":91}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _AppConstants = require('../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Playlist = function Playlist(_ref) {
  var vids = _ref.vids,
      currentItem = _ref.currentItem,
      isVisible = _ref.isVisible,
      onVideoClick = _ref.onVideoClick,
      onScroll = _ref.onScroll;

  var playlistVisibility = isVisible ? 'show' : '';
  return (0, _inferno.createVNode)(2, 'ul', {
    'class': 'playlist flat-scroll ' + playlistVisibility
  }, vids.map(function (vid, index) {
    var isActive = currentItem === index;
    return (0, _inferno.createVNode)(16, Item, {
      'videoId': vid.videoId,
      'title': vid.title,
      'index': index,
      'isActive': isActive,
      'onClick': onVideoClick
    });
  }), {
    'onScroll': (0, _lodash2.default)(onScroll, _AppConstants2.default.THROTTLE_TIME_MS)
  });
};

var Item = function Item(_ref2) {
  var title = _ref2.title,
      videoId = _ref2.videoId,
      index = _ref2.index,
      isActive = _ref2.isActive,
      _onClick = _ref2.onClick;

  var itemClasses = isActive ? 'active' : '';
  return (0, _inferno.createVNode)(2, 'li', {
    'className': itemClasses
  }, title, {
    'onClick': function onClick() {
      return _onClick(videoId, index);
    }
  });
};

exports.default = Playlist;

},{"../constants/AppConstants":12,"inferno":91,"lodash.throttle":93}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _PlaylistItem = require('./PlaylistItem');

var _PlaylistItem2 = _interopRequireDefault(_PlaylistItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlaylistGrid = function PlaylistGrid(_ref) {
  var items = _ref.items,
      isVisible = _ref.isVisible,
      viewType = _ref.viewType,
      hasMoreResults = _ref.hasMoreResults,
      onContentItemClick = _ref.onContentItemClick,
      onPlaylistsClick = _ref.onPlaylistsClick,
      onLoadMore = _ref.onLoadMore;

  var gridVisibility = 'show';
  return (0, _inferno.createVNode)(2, 'div', {
    'class': 'main flat-scroll'
  }, [(0, _inferno.createVNode)(2, 'div', {
    'class': 'content'
  }, items.map(function (item) {
    return (0, _inferno.createVNode)(16, _PlaylistItem2.default, {
      'id': item.id,
      'channelId': item.channelId,
      'title': item.title,
      'thumbnails': item.thumbnails,
      'onClick': onContentItemClick,
      'viewType': viewType,
      'onPlaylistsClick': onPlaylistsClick
    });
  })), (0, _inferno.createVNode)(2, 'div', {
    'class': 'align-center'
  }, (0, _inferno.createVNode)(2, 'button', {
    'class': 'button minor',
    'disabled': !hasMoreResults()
  }, 'Load more', {
    'onClick': onLoadMore
  }))]);
};

exports.default = PlaylistGrid;

},{"./PlaylistItem":10,"inferno":91}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _ContentType = require('../constants/ContentType');

var _ContentType2 = _interopRequireDefault(_ContentType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlaylistItem = function PlaylistItem(_ref) {
  var id = _ref.id,
      channelId = _ref.channelId,
      title = _ref.title,
      thumbnails = _ref.thumbnails,
      _onClick = _ref.onClick,
      onPlaylistsClick = _ref.onPlaylistsClick,
      viewType = _ref.viewType;

  var maxLength = 20;
  title = title.length > maxLength ? title.substring(0, 20).concat('...') : title;
  return (0, _inferno.createVNode)(2, 'div', {
    'class': 'content-item'
  }, [(0, _inferno.createVNode)(2, 'a', {
    'href': '#'
  }, (0, _inferno.createVNode)(2, 'img', {
    'src': thumbnails.high.url
  }), {
    'onClick': function onClick(e) {
      return _onClick(e, id);
    }
  }), (0, _inferno.createVNode)(2, 'div', {
    'class': 'content-item-details'
  }, [(0, _inferno.createVNode)(2, 'h2', {
    'class': 'content-item-title'
  }, [' ', title, ' ']), viewType === _ContentType2.default.PLAYLIST ? (0, _inferno.createVNode)(2, 'button', {
    'class': 'button major small'
  }, 'Channel playlists', {
    'onClick': onPlaylistsClick.bind(null, channelId, _ContentType2.default.CHANNEL)
  }) : (0, _inferno.createVNode)(2, 'span')])]);
};

exports.default = PlaylistItem;

},{"../constants/ContentType":13,"inferno":91}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchBar = function SearchBar(_ref) {
  var onInput = _ref.onInput,
      onSubmit = _ref.onSubmit,
      selectedType = _ref.selectedType;

  return (0, _inferno.createVNode)(2, 'form', {
    'className': 'search-bar'
  }, [(0, _inferno.createVNode)(512, 'input', {
    'className': 'input search-bar-query',
    'type': 'text',
    'placeholder': 'Type a ' + selectedType + ' name'
  }, null, {
    'onInput': onInput
  }), (0, _inferno.createVNode)(2, 'button', {
    'class': 'button minor search-bar-action',
    'type': 'submit'
  }, 'Search')], {
    'onSubmit': onSubmit
  });
};

exports.default = SearchBar;

},{"inferno":91}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var AppConstants = {
  DEV_MODE: "dev",
  PROD_MODE: "prod",
  THROTTLE_TIME_MS: 1000,
  CONTENT_MAX_RESULTS: 25,
  PLAYLIST_ITEMS_MAX_RESULTS: 50
};

exports.default = AppConstants;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ContentType = {
  PLAYLIST: 'playlist',
  CHANNEL: 'channel'
};

exports.default = ContentType;

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  VIDEO_CUED: 5
};

exports.default = PlayerState;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var SearchType = {
  'BY_CONTENT': Symbol('by_content'),
  'BY_CHANNEL': Symbol('by_channel')
};

exports.default = SearchType;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _infernoComponent = require('inferno-component');

var _infernoComponent2 = _interopRequireDefault(_infernoComponent);

var _youtubePlayer = require('youtube-player');

var _youtubePlayer2 = _interopRequireDefault(_youtubePlayer);

var _SearchBar = require('../components/SearchBar');

var _SearchBar2 = _interopRequireDefault(_SearchBar);

var _Player = require('../components/Player');

var _Player2 = _interopRequireDefault(_Player);

var _ChannelGrid = require('../components/ChannelGrid');

var _ChannelGrid2 = _interopRequireDefault(_ChannelGrid);

var _PlaylistGrid = require('../components/PlaylistGrid');

var _PlaylistGrid2 = _interopRequireDefault(_PlaylistGrid);

var _Playlist = require('../components/Playlist');

var _Playlist2 = _interopRequireDefault(_Playlist);

var _PlayerControls = require('../components/PlayerControls');

var _PlayerControls2 = _interopRequireDefault(_PlayerControls);

var _Nav = require('../components/Nav');

var _Nav2 = _interopRequireDefault(_Nav);

var _ContentTypeSelection = require('../components/ContentTypeSelection');

var _ContentTypeSelection2 = _interopRequireDefault(_ContentTypeSelection);

var _PlayerState = require('../constants/PlayerState');

var _PlayerState2 = _interopRequireDefault(_PlayerState);

var _ContentType = require('../constants/ContentType');

var _ContentType2 = _interopRequireDefault(_ContentType);

var _SearchType = require('../constants/SearchType');

var _SearchType2 = _interopRequireDefault(_SearchType);

var _apiBridge = require('../helpers/apiBridge');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AppContainer = function (_Component) {
  _inherits(AppContainer, _Component);

  function AppContainer(props) {
    _classCallCheck(this, AppContainer);

    var _this = _possibleConstructorReturn(this, (AppContainer.__proto__ || Object.getPrototypeOf(AppContainer)).call(this, props));

    _this.state = {
      player: null,
      query: "",
      vids: [],
      results: [],
      resultsPageToken: '',
      playlistPageToken: null,
      currentItem: null,
      currentPlaylistId: null,
      selectedChannelId: null,
      selectedType: _ContentType2.default.PLAYLIST,
      viewType: _ContentType2.default.PLAYLIST,
      searchType: _SearchType2.default.BY_CONTENT,
      isPlaying: false,
      isPlaylistVisible: false,
      isPlayerMinimized: true
    };

    _this.handleQueryChange = _this.handleQueryChange.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    _this.handleContentItemClick = _this.handleContentItemClick.bind(_this);
    _this.handleVideoClick = _this.handleVideoClick.bind(_this);
    _this.handleNextVideo = _this.handleNextVideo.bind(_this);
    _this.handlePreviousVideo = _this.handlePreviousVideo.bind(_this);
    // TODO
    // rename handleTogle
    _this.handleToggle = _this.handleToggle.bind(_this);

    _this.handleTogglePlayer = _this.handleTogglePlayer.bind(_this);
    _this.handleContentTypeChange = _this.handleContentTypeChange.bind(_this);
    _this.handlePlaylistsClick = _this.handlePlaylistsClick.bind(_this);
    _this.handleLoadMore = _this.handleLoadMore.bind(_this);
    _this.handlePlaylistScroll = _this.handlePlaylistScroll.bind(_this);
    _this.hasMoreResults = _this.hasMoreResults.bind(_this);
    _this.hasMorePlaylistItems = _this.hasMorePlaylistItems.bind(_this);
    return _this;
  }

  _createClass(AppContainer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.setState({
        player: (0, _youtubePlayer2.default)('video-player')
      }, function () {
        _this2.state.player.on('stateChange', function (e) {
          var state = e.target.getPlayerState();

          switch (state) {
            case _PlayerState2.default.ENDED:
              _this2.handleNextVideo();
              break;
            case _PlayerState2.default.PLAYING:
              _this2.setState({ isPlaying: true });
              break;
            case _PlayerState2.default.PAUSED:
              _this2.setState({ isPlaying: false });
          }
        });
      });
    }
  }, {
    key: 'hasMoreResults',
    value: function hasMoreResults() {
      return Boolean(this.state.resultsPageToken);
    }
  }, {
    key: 'hasMorePlaylistItems',
    value: function hasMorePlaylistItems() {
      return Boolean(this.state.playlistPageToken);
    }
  }, {
    key: 'handleQueryChange',
    value: function handleQueryChange(e) {
      this.setState({
        query: e.target.value
      });
    }
  }, {
    key: 'handleContentTypeChange',
    value: function handleContentTypeChange(type) {
      this.setState({
        results: [],
        resultsPageToken: '',
        selectedType: type,
        selectedChannelId: null
      });
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      var _this3 = this;

      e.preventDefault();

      if (this.state.query === '') return;

      this.setState({
        results: [],
        resultsPageToken: '',
        searchType: _SearchType2.default.BY_CONTENT,
        isPlaylistVisible: false,
        isPlayerMinimized: true,
        selectedChannelId: null
      }, function () {
        _this3.fetchQuery(_this3.state.query, _this3.state.selectedType, _this3.state.resultsPageToken);
      });
    }
  }, {
    key: 'handlePlaylistsClick',
    value: function handlePlaylistsClick(id, viewType) {
      var _this4 = this;

      this.setState({
        searchType: _SearchType2.default.BY_CHANNEL,
        results: [],
        resultsPageToken: ''
      }, function () {
        return _this4.fetchPlaylists(id, viewType);
      });
    }
  }, {
    key: 'fetchPlaylists',
    value: function fetchPlaylists(id, viewType) {
      var _this5 = this;

      (0, _apiBridge.getPlaylistsByChannel)(id, this.state.resultsPageToken).then(function (data) {
        var newState = {
          results: _this5.state.results.concat(data.items),
          resultsPageToken: data.nextPageToken,
          selectedType: _ContentType2.default.PLAYLIST,
          selectedChannelId: id
        };
        if (viewType) newState = Object.assign({}, newState, { viewType: viewType });
        _this5.setState(newState);
      }).catch(function (err) {
        return console.log('Error: ', err);
      });
    }
  }, {
    key: 'handleLoadMore',
    value: function handleLoadMore(e) {
      switch (this.state.searchType) {
        case _SearchType2.default.BY_CONTENT:
          this.fetchQuery(this.state.query, this.state.selectedType, this.state.resultsPageToken);
          break;
        case _SearchType2.default.BY_CHANNEL:
          this.fetchPlaylists(this.state.selectedChannelId, _ContentType2.default.CHANNEL);
        default:
          break;
      }
    }
  }, {
    key: 'fetchQuery',
    value: function fetchQuery(query, type, nextPageToken) {
      var _this6 = this;

      (0, _apiBridge.getContent)(query, type, nextPageToken).then(function (data) {
        _this6.setState({
          results: _this6.state.results.concat(data.items),
          viewType: type,
          resultsPageToken: data.nextPageToken
        });
      }).catch(function (err) {
        return console.log('Error: ', err);
      });
    }
  }, {
    key: 'handleContentItemClick',
    value: function handleContentItemClick(e, id) {
      var _this7 = this;

      e.preventDefault();

      this.fetchPlaylist(id, this.state.selectedType).then(function () {
        if (!_this7.state.vids.length > 0) return;

        _this7.setState({
          currentItem: 0,
          isPlaying: true,
          isPlaylistVisible: true
        }, _this7.loadVideo(_this7.state.vids[0].videoId));
      }).catch(function (err) {
        return console.log('Error: ', err);
      });
    }
  }, {
    key: 'fetchPlaylist',
    value: function fetchPlaylist(id, type) {
      var _this8 = this;

      return (0, _apiBridge.getPlaylist)(id, type).then(function (data) {
        _this8.setState({
          vids: data.items,
          currentPlaylistId: data.playlistId,
          playlistPageToken: data.nextPageToken
        });
      });
    }
  }, {
    key: 'handlePlaylistScroll',
    value: function handlePlaylistScroll(e) {
      var _this9 = this;

      var el = e.target;
      var offset = el.offsetHeight + el.scrollTop;
      var height = el.scrollHeight - 100;
      var isCloseToEnd = offset >= height;

      if (isCloseToEnd && this.hasMorePlaylistItems()) {
        (0, _apiBridge.getPlaylist)(this.state.currentPlaylistId, _ContentType2.default.PLAYLIST, this.state.playlistPageToken).then(function (data) {
          _this9.setState({
            vids: _this9.state.vids.concat(data.items),
            playlistPageToken: data.nextPageToken
          });
        });
      }
    }
  }, {
    key: 'handleVideoClick',
    value: function handleVideoClick(id, index) {
      var _this10 = this;

      this.setState({
        currentItem: index,
        isPlaying: true
      }, function () {
        return _this10.loadVideo(id);
      });
    }
  }, {
    key: 'handleToggle',
    value: function handleToggle() {
      if (this.state.isPlaying) this.state.player.pauseVideo();else this.state.player.playVideo();

      this.setState({
        isPlaying: !this.state.isPlaying
      });
    }
  }, {
    key: 'handlePreviousVideo',
    value: function handlePreviousVideo() {
      var _this11 = this;

      var previousItem = this.state.currentItem - 1;
      if (!(previousItem >= 0)) return;

      this.setState({
        currentItem: previousItem
      }, function () {
        return _this11.loadVideo(_this11.state.vids[previousItem].videoId);
      });
    }
  }, {
    key: 'handleNextVideo',
    value: function handleNextVideo() {
      var _this12 = this;

      var nextItem = this.state.currentItem + 1;
      if (!(nextItem < this.state.vids.length)) return;

      this.setState({
        currentItem: nextItem
      }, function () {
        return _this12.loadVideo(_this12.state.vids[nextItem].videoId);
      });
    }
  }, {
    key: 'handleTogglePlayer',
    value: function handleTogglePlayer() {
      this.setState({
        isPlayerMinimized: !this.state.isPlayerMinimized
      });
    }
  }, {
    key: 'loadVideo',
    value: function loadVideo(id) {
      this.state.player.loadVideoById(id);
    }
  }, {
    key: 'render',
    value: function render() {
      return (0, _inferno.createVNode)(2, 'div', null, [(0, _inferno.createVNode)(2, 'header', {
        'class': 'header'
      }, [(0, _inferno.createVNode)(16, _Nav2.default, {
        children: (0, _inferno.createVNode)(16, _SearchBar2.default, {
          'selectedType': this.state.selectedType,
          'onInput': this.handleQueryChange,
          'onSubmit': this.handleSubmit
        })
      }), (0, _inferno.createVNode)(16, _ContentTypeSelection2.default, {
        'onContentTypeClick': this.handleContentTypeChange,
        'selectedType': this.state.selectedType
      })]), (0, _inferno.createVNode)(2, 'div', {
        'class': 'central'
      }, [this.state.selectedType === _ContentType2.default.CHANNEL ? (0, _inferno.createVNode)(16, _ChannelGrid2.default, {
        'items': this.state.results,
        'hasMoreResults': this.hasMoreResults,
        'onContentItemClick': this.handleContentItemClick,
        'onPlaylistsClick': this.handlePlaylistsClick,
        'onLoadMore': this.handleLoadMore
      }) : (0, _inferno.createVNode)(16, _PlaylistGrid2.default, {
        'items': this.state.results,
        'viewType': this.state.viewType,
        'hasMoreResults': this.hasMoreResults,
        'onContentItemClick': this.handleContentItemClick,
        'onPlaylistsClick': this.handlePlaylistsClick,
        'onLoadMore': this.handleLoadMore
      }), (0, _inferno.createVNode)(16, _Playlist2.default, {
        'vids': this.state.vids,
        'currentItem': this.state.currentItem,
        'isVisible': this.state.isPlaylistVisible,
        'onVideoClick': this.handleVideoClick,
        'onScroll': this.handlePlaylistScroll
      })]), (0, _inferno.createVNode)(16, _Player2.default, {
        'isMinimized': this.state.isPlayerMinimized
      }), (0, _inferno.createVNode)(16, _PlayerControls2.default, {
        'onNext': this.handleNextVideo,
        'onPrevious': this.handlePreviousVideo,
        'onToggle': this.handleToggle,
        'isPlayerMinimized': this.state.isPlayerMinimized,
        'isPlaying': this.state.isPlaying,
        'onTogglePlayer': this.handleTogglePlayer
      })]);
    }
  }]);

  return AppContainer;
}(_infernoComponent2.default);

exports.default = AppContainer;

},{"../components/ChannelGrid":2,"../components/ContentTypeSelection":4,"../components/Nav":5,"../components/Player":6,"../components/PlayerControls":7,"../components/Playlist":8,"../components/PlaylistGrid":9,"../components/SearchBar":11,"../constants/ContentType":13,"../constants/PlayerState":14,"../constants/SearchType":15,"../helpers/apiBridge":17,"inferno":91,"inferno-component":88,"youtube-player":151}],17:[function(require,module,exports){
'use strict';

var _AppConstants = require('../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AppMode = require('../../appconfig').mode;


var apiBridge = function () {
  return AppMode === _AppConstants2.default.DEV_MODE ? require('../../test/helpers/apiFixture') : require('../api');
}();

module.exports = apiBridge;

},{"../../appconfig":19,"../../test/helpers/apiFixture":155,"../api":1,"../constants/AppConstants":12}],18:[function(require,module,exports){
'use strict';

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _AppContainer = require('./containers/AppContainer');

var _AppContainer2 = _interopRequireDefault(_AppContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_inferno2.default.render((0, _inferno.createVNode)(16, _AppContainer2.default), document.getElementById('app'));

},{"./containers/AppContainer":16,"inferno":91}],19:[function(require,module,exports){
module.exports={
  "mode": "dev"
}

},{}],20:[function(require,module,exports){
module.exports={
  "key": "AIzaSyCtgOhiF9kSqvHdyGoa1pRMJiDcJQzWHmk"
}

},{}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":24}],22:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _promise = require("../core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new _promise2.default(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return _promise2.default.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};
},{"../core-js/promise":21}],23:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":145}],24:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":32,"../modules/es6.object.to-string":84,"../modules/es6.promise":85,"../modules/es6.string.iterator":86,"../modules/web.dom.iterable":87}],25:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],26:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],27:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],28:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":49}],29:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":74,"./_to-iobject":76,"./_to-length":77}],30:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":31,"./_wks":81}],31:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],32:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],33:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":25}],34:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],35:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":39}],36:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":41,"./_is-object":49}],37:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],38:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":32,"./_ctx":33,"./_global":41,"./_hide":43}],39:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],40:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":28,"./_ctx":33,"./_is-array-iter":48,"./_iter-call":50,"./_to-length":77,"./core.get-iterator-method":82}],41:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],42:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],43:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":35,"./_object-dp":59,"./_property-desc":64}],44:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":41}],45:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":35,"./_dom-create":36,"./_fails":39}],46:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],47:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":31}],48:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":55,"./_wks":81}],49:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],50:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":28}],51:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":43,"./_object-create":58,"./_property-desc":64,"./_set-to-string-tag":68,"./_wks":81}],52:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":38,"./_has":42,"./_hide":43,"./_iter-create":51,"./_iterators":55,"./_library":56,"./_object-gpo":61,"./_redefine":66,"./_set-to-string-tag":68,"./_wks":81}],53:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":81}],54:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],55:[function(require,module,exports){
module.exports = {};
},{}],56:[function(require,module,exports){
module.exports = true;
},{}],57:[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":31,"./_global":41,"./_task":73}],58:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":28,"./_dom-create":36,"./_enum-bug-keys":37,"./_html":44,"./_object-dps":60,"./_shared-key":69}],59:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":28,"./_descriptors":35,"./_ie8-dom-define":45,"./_to-primitive":79}],60:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":28,"./_descriptors":35,"./_object-dp":59,"./_object-keys":63}],61:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":42,"./_shared-key":69,"./_to-object":78}],62:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":29,"./_has":42,"./_shared-key":69,"./_to-iobject":76}],63:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":37,"./_object-keys-internal":62}],64:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],65:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":43}],66:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":43}],67:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":32,"./_descriptors":35,"./_global":41,"./_object-dp":59,"./_wks":81}],68:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":42,"./_object-dp":59,"./_wks":81}],69:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":70,"./_uid":80}],70:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":41}],71:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":25,"./_an-object":28,"./_wks":81}],72:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":34,"./_to-integer":75}],73:[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":31,"./_ctx":33,"./_dom-create":36,"./_global":41,"./_html":44,"./_invoke":46}],74:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":75}],75:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],76:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":34,"./_iobject":47}],77:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":75}],78:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":34}],79:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":49}],80:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],81:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":41,"./_shared":70,"./_uid":80}],82:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":30,"./_core":32,"./_iterators":55,"./_wks":81}],83:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":26,"./_iter-define":52,"./_iter-step":54,"./_iterators":55,"./_to-iobject":76}],84:[function(require,module,exports){

},{}],85:[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":25,"./_an-instance":27,"./_classof":30,"./_core":32,"./_ctx":33,"./_export":38,"./_for-of":40,"./_global":41,"./_is-object":49,"./_iter-detect":53,"./_library":56,"./_microtask":57,"./_redefine-all":65,"./_set-species":67,"./_set-to-string-tag":68,"./_species-constructor":71,"./_task":73,"./_wks":81}],86:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":52,"./_string-at":72}],87:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":41,"./_hide":43,"./_iterators":55,"./_wks":81,"./es6.array.iterator":83}],88:[function(require,module,exports){
module.exports = require('inferno/dist/inferno-component.node');
module.exports.default = module.exports;
},{"inferno/dist/inferno-component.node":89}],89:[function(require,module,exports){
(function (process){
/*!
 * inferno-component v1.2.1
 * (c) 2017 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('inferno')) :
	typeof define === 'function' && define.amd ? define(['inferno'], factory) :
	(global.Inferno = global.Inferno || {}, global.Inferno.Component = factory(global.Inferno));
}(this, (function (inferno) { 'use strict';

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = typeof window !== 'undefined' && window.document;

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
var isArray = Array.isArray;

function isStringOrNumber(obj) {
    var type = typeof obj;
    return type === 'string' || type === 'number';
}
function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
}
function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}
function isFunction(obj) {
    return typeof obj === 'function';
}



function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isUndefined(obj) {
    return obj === undefined;
}

function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(("Inferno Error: " + message));
}

var Lifecycle = function Lifecycle() {
    this.listeners = [];
    this.fastUnmount = true;
};
Lifecycle.prototype.addListener = function addListener (callback) {
    this.listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger () {
        var this$1 = this;

    for (var i = 0; i < this.listeners.length; i++) {
        this$1.listeners[i]();
    }
};

var noOp = ERROR_MSG;
if (process.env.NODE_ENV !== 'production') {
    noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
}
var componentCallbackQueue = new Map();
// when a components root VNode is also a component, we can run into issues
// this will recursively look for vNode.parentNode if the VNode is a component
function updateParentComponentVNodes(vNode, dom) {
    if (vNode.flags & 28 /* Component */) {
        var parentVNode = vNode.parentVNode;
        if (parentVNode) {
            parentVNode.dom = dom;
            updateParentComponentVNodes(parentVNode, dom);
        }
    }
}
// this is in shapes too, but we don't want to import from shapes as it will pull in a duplicate of createVNode
function createVoidVNode() {
    return inferno.createVNode(4096 /* Void */);
}
function createTextVNode(text) {
    return inferno.createVNode(1 /* Text */, null, null, text);
}
function addToQueue(component, force, callback) {
    // TODO this function needs to be revised and improved on
    var queue = componentCallbackQueue.get(component);
    if (!queue) {
        queue = [];
        componentCallbackQueue.set(component, queue);
        Promise.resolve().then(function () {
            componentCallbackQueue.delete(component);
            applyState(component, force, function () {
                for (var i = 0; i < queue.length; i++) {
                    queue[i]();
                }
            });
        });
    }
    if (callback) {
        queue.push(callback);
    }
}
function queueStateChanges(component, newState, callback, sync) {
    if (isFunction(newState)) {
        newState = newState(component.state);
    }
    for (var stateKey in newState) {
        component._pendingState[stateKey] = newState[stateKey];
    }
    if (!component._pendingSetState && isBrowser) {
        if (sync || component._blockRender) {
            component._pendingSetState = true;
            applyState(component, false, callback);
        }
        else {
            addToQueue(component, false, callback);
        }
    }
    else {
        component.state = Object.assign({}, component.state, component._pendingState);
        component._pendingState = {};
    }
}
function applyState(component, force, callback) {
    if ((!component._deferSetState || force) && !component._blockRender && !component._unmounted) {
        component._pendingSetState = false;
        var pendingState = component._pendingState;
        var prevState = component.state;
        var nextState = Object.assign({}, prevState, pendingState);
        var props = component.props;
        var context = component.context;
        component._pendingState = {};
        var nextInput = component._updateComponent(prevState, nextState, props, props, context, force, true);
        var didUpdate = true;
        if (isInvalid(nextInput)) {
            nextInput = createVoidVNode();
        }
        else if (nextInput === inferno.NO_OP) {
            nextInput = component._lastInput;
            didUpdate = false;
        }
        else if (isStringOrNumber(nextInput)) {
            nextInput = createTextVNode(nextInput);
        }
        else if (isArray(nextInput)) {
            if (process.env.NODE_ENV !== 'production') {
                throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
            }
            throwError();
        }
        var lastInput = component._lastInput;
        var vNode = component._vNode;
        var parentDom = (lastInput.dom && lastInput.dom.parentNode) || (lastInput.dom = vNode.dom);
        component._lastInput = nextInput;
        if (didUpdate) {
            var subLifecycle = component._lifecycle;
            if (!subLifecycle) {
                subLifecycle = new Lifecycle();
            }
            else {
                subLifecycle.listeners = [];
            }
            component._lifecycle = subLifecycle;
            var childContext = component.getChildContext();
            if (!isNullOrUndef(childContext)) {
                childContext = Object.assign({}, context, component._childContext, childContext);
            }
            else {
                childContext = Object.assign({}, context, component._childContext);
            }
            component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
            subLifecycle.trigger();
            component.componentDidUpdate(props, prevState);
            inferno.options.afterUpdate && inferno.options.afterUpdate(vNode);
        }
        var dom = vNode.dom = nextInput.dom;
        var componentToDOMNodeMap = component._componentToDOMNodeMap;
        componentToDOMNodeMap && componentToDOMNodeMap.set(component, nextInput.dom);
        updateParentComponentVNodes(vNode, dom);
        if (!isNullOrUndef(callback)) {
            callback();
        }
    }
    else if (!isNullOrUndef(callback)) {
        callback();
    }
}
var Component$1 = function Component(props, context) {
    this.state = {};
    this.refs = {};
    this._blockRender = false;
    this._ignoreSetState = false;
    this._blockSetState = false;
    this._deferSetState = false;
    this._pendingSetState = false;
    this._pendingState = {};
    this._lastInput = null;
    this._vNode = null;
    this._unmounted = true;
    this._lifecycle = null;
    this._childContext = null;
    this._patch = null;
    this._isSVG = false;
    this._componentToDOMNodeMap = null;
    /** @type {object} */
    this.props = props || inferno.EMPTY_OBJ;
    /** @type {object} */
    this.context = context || {};
};
Component$1.prototype.render = function render (nextProps, nextState, nextContext) {
};
Component$1.prototype.forceUpdate = function forceUpdate (callback) {
    if (this._unmounted) {
        return;
    }
    isBrowser && applyState(this, true, callback);
};
Component$1.prototype.setState = function setState (newState, callback) {
    if (this._unmounted) {
        return;
    }
    if (!this._blockSetState) {
        if (!this._ignoreSetState) {
            queueStateChanges(this, newState, callback, false);
        }
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError('cannot update state via setState() in componentWillUpdate().');
        }
        throwError();
    }
};
Component$1.prototype.setStateSync = function setStateSync (newState) {
    if (this._unmounted) {
        return;
    }
    if (!this._blockSetState) {
        if (!this._ignoreSetState) {
            queueStateChanges(this, newState, null, true);
        }
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError('cannot update state via setState() in componentWillUpdate().');
        }
        throwError();
    }
};
Component$1.prototype.componentWillMount = function componentWillMount () {
};
Component$1.prototype.componentDidUpdate = function componentDidUpdate (prevProps, prevState, prevContext) {
};
Component$1.prototype.shouldComponentUpdate = function shouldComponentUpdate (nextProps, nextState, context) {
    return true;
};
Component$1.prototype.componentWillReceiveProps = function componentWillReceiveProps (nextProps, context) {
};
Component$1.prototype.componentWillUpdate = function componentWillUpdate (nextProps, nextState, nextContext) {
};
Component$1.prototype.getChildContext = function getChildContext () {
};
Component$1.prototype._updateComponent = function _updateComponent (prevState, nextState, prevProps, nextProps, context, force, fromSetState) {
    if (this._unmounted === true) {
        if (process.env.NODE_ENV !== 'production') {
            throwError(noOp);
        }
        throwError();
    }
    if ((prevProps !== nextProps || nextProps === inferno.EMPTY_OBJ) || prevState !== nextState || force) {
        if (prevProps !== nextProps || nextProps === inferno.EMPTY_OBJ) {
            if (!fromSetState) {
                this._blockRender = true;
                this.componentWillReceiveProps(nextProps, context);
                this._blockRender = false;
            }
            if (this._pendingSetState) {
                nextState = Object.assign({}, nextState, this._pendingState);
                this._pendingSetState = false;
                this._pendingState = {};
            }
        }
        var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState, context);
        if (shouldUpdate !== false || force) {
            this._blockSetState = true;
            this.componentWillUpdate(nextProps, nextState, context);
            this._blockSetState = false;
            this.props = nextProps;
            var state = this.state = nextState;
            this.context = context;
            inferno.options.beforeRender && inferno.options.beforeRender(this);
            var render = this.render(nextProps, state, context);
            inferno.options.afterRender && inferno.options.afterRender(this);
            return render;
        }
    }
    return inferno.NO_OP;
};

return Component$1;

})));

}).call(this,require('_process'))

},{"_process":144,"inferno":91}],90:[function(require,module,exports){
(function (process){
/*!
 * inferno v1.2.1
 * (c) 2017 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Inferno = global.Inferno || {})));
}(this, (function (exports) { 'use strict';

var NO_OP = '$NO_OP';
var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = typeof window !== 'undefined' && window.document;

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
var isArray = Array.isArray;
function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}
function isStringOrNumber(obj) {
    var type = typeof obj;
    return type === 'string' || type === 'number';
}
function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
}
function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}
function isFunction(obj) {
    return typeof obj === 'function';
}
function isAttrAnEvent(attr) {
    return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}
function isString(obj) {
    return typeof obj === 'string';
}
function isNumber(obj) {
    return typeof obj === 'number';
}
function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isUndefined(obj) {
    return obj === undefined;
}
function isObject(o) {
    return typeof o === 'object';
}
function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(("Inferno Error: " + message));
}
function warning(condition, message) {
    if (!condition) {
        console.error(message);
    }
}
var EMPTY_OBJ = {};

function applyKey(key, vNode) {
    vNode.key = key;
    return vNode;
}
function applyKeyIfMissing(key, vNode) {
    if (isNumber(key)) {
        key = "." + key;
    }
    if (isNull(vNode.key) || vNode.key[0] === '.') {
        return applyKey(key, vNode);
    }
    return vNode;
}
function applyKeyPrefix(key, vNode) {
    vNode.key = key + vNode.key;
    return vNode;
}
function _normalizeVNodes(nodes, result, index, currentKey) {
    for (; index < nodes.length; index++) {
        var n = nodes[index];
        var key = currentKey + "." + index;
        if (!isInvalid(n)) {
            if (isArray(n)) {
                _normalizeVNodes(n, result, 0, key);
            }
            else {
                if (isStringOrNumber(n)) {
                    n = createTextVNode(n);
                }
                else if (isVNode(n) && n.dom || (n.key && n.key[0] === '.')) {
                    n = cloneVNode(n);
                }
                if (isNull(n.key) || n.key[0] === '.') {
                    n = applyKey(key, n);
                }
                else {
                    n = applyKeyPrefix(currentKey, n);
                }
                result.push(n);
            }
        }
    }
}
function normalizeVNodes(nodes) {
    var newNodes;
    // we assign $ which basically means we've flagged this array for future note
    // if it comes back again, we need to clone it, as people are using it
    // in an immutable way
    // tslint:disable
    if (nodes['$']) {
        nodes = nodes.slice();
    }
    else {
        nodes['$'] = true;
    }
    // tslint:enable
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (isInvalid(n) || isArray(n)) {
            var result = (newNodes || nodes).slice(0, i);
            _normalizeVNodes(nodes, result, i, "");
            return result;
        }
        else if (isStringOrNumber(n)) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(applyKeyIfMissing(i, createTextVNode(n)));
        }
        else if ((isVNode(n) && n.dom) || (isNull(n.key) && !(n.flags & 64 /* HasNonKeyedChildren */))) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
        }
        else if (newNodes) {
            newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
        }
    }
    return newNodes || nodes;
}
function normalizeChildren(children) {
    if (isArray(children)) {
        return normalizeVNodes(children);
    }
    else if (isVNode(children) && children.dom) {
        return cloneVNode(children);
    }
    return children;
}
function normalizeProps(vNode, props, children) {
    if (!(vNode.flags & 28 /* Component */) && isNullOrUndef(children) && !isNullOrUndef(props.children)) {
        vNode.children = props.children;
    }
    if (props.ref) {
        vNode.ref = props.ref;
        delete props.ref;
    }
    if (props.events) {
        vNode.events = props.events;
    }
    if (!isNullOrUndef(props.key)) {
        vNode.key = props.key;
        delete props.key;
    }
}
function copyPropsTo(copyFrom, copyTo) {
    for (var prop in copyFrom) {
        if (isUndefined(copyTo[prop])) {
            copyTo[prop] = copyFrom[prop];
        }
    }
}
function normalizeElement(type, vNode) {
    if (type === 'svg') {
        vNode.flags = 128 /* SvgElement */;
    }
    else if (type === 'input') {
        vNode.flags = 512 /* InputElement */;
    }
    else if (type === 'select') {
        vNode.flags = 2048 /* SelectElement */;
    }
    else if (type === 'textarea') {
        vNode.flags = 1024 /* TextareaElement */;
    }
    else if (type === 'media') {
        vNode.flags = 256 /* MediaElement */;
    }
    else {
        vNode.flags = 2 /* HtmlElement */;
    }
}
function normalize(vNode) {
    var props = vNode.props;
    var hasProps = !isNull(props);
    var type = vNode.type;
    var children = vNode.children;
    // convert a wrongly created type back to element
    if (isString(type) && (vNode.flags & 28 /* Component */)) {
        normalizeElement(type, vNode);
        if (hasProps && props.children) {
            vNode.children = props.children;
            children = props.children;
        }
    }
    if (hasProps) {
        normalizeProps(vNode, props, children);
    }
    if (!isInvalid(children)) {
        vNode.children = normalizeChildren(children);
    }
    if (hasProps && !isInvalid(props.children)) {
        props.children = normalizeChildren(props.children);
    }
    if (process.env.NODE_ENV !== 'production') {
        // This code will be stripped out from production CODE
        // It will help users to track errors in their applications.
        var verifyKeys = function (vNodes) {
            var keyValues = vNodes.map(function (vnode) { return vnode.key; });
            keyValues.some(function (item, idx) {
                var hasDuplicate = keyValues.indexOf(item) !== idx;
                warning(!hasDuplicate, 'Inferno normalisation(...): Encountered two children with same key, all keys must be unique within its siblings. Duplicated key is:' + item);
                return hasDuplicate;
            });
        };
        if (vNode.children && Array.isArray(vNode.children)) {
            verifyKeys(vNode.children);
        }
    }
}

var options = {
    recyclingEnabled: true,
    findDOMNodeEnabled: false,
    roots: null,
    createVNode: null,
    beforeRender: null,
    afterRender: null,
    afterMount: null,
    afterUpdate: null,
    beforeUnmount: null,
};

function createVNode(flags, type, props, children, events, key, ref, noNormalise) {
    if (flags & 16 /* ComponentUnknown */) {
        flags = isStatefulComponent(type) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
    }
    var vNode = {
        children: isUndefined(children) ? null : children,
        dom: null,
        events: events || null,
        flags: flags,
        key: isUndefined(key) ? null : key,
        props: props || null,
        ref: ref || null,
        type: type,
    };
    if (!noNormalise) {
        normalize(vNode);
    }
    if (options.createVNode) {
        options.createVNode(vNode);
    }
    return vNode;
}
function cloneVNode(vNodeToClone, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    var children = _children;
    if (_children.length > 0 && !isNull(_children[0])) {
        if (!props) {
            props = {};
        }
        if (_children.length === 1) {
            children = _children[0];
        }
        if (isUndefined(props.children)) {
            props.children = children;
        }
        else {
            if (isArray(children)) {
                if (isArray(props.children)) {
                    props.children = props.children.concat(children);
                }
                else {
                    props.children = [props.children].concat(children);
                }
            }
            else {
                if (isArray(props.children)) {
                    props.children.push(children);
                }
                else {
                    props.children = [props.children];
                    props.children.push(children);
                }
            }
        }
    }
    children = null;
    var newVNode;
    if (isArray(vNodeToClone)) {
        var tmpArray = [];
        for (var i = 0; i < vNodeToClone.length; i++) {
            tmpArray.push(cloneVNode(vNodeToClone[i]));
        }
        newVNode = tmpArray;
    }
    else {
        var flags = vNodeToClone.flags;
        var events = vNodeToClone.events || (props && props.events) || null;
        var key = !isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : (props ? props.key : null);
        var ref = vNodeToClone.ref || (props ? props.ref : null);
        if (flags & 28 /* Component */) {
            newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), null, events, key, ref, true);
            var newProps = newVNode.props;
            if (newProps) {
                var newChildren = newProps.children;
                // we need to also clone component children that are in props
                // as the children may also have been hoisted
                if (newChildren) {
                    if (isArray(newChildren)) {
                        for (var i$1 = 0; i$1 < newChildren.length; i$1++) {
                            var child = newChildren[i$1];
                            if (!isInvalid(child) && isVNode(child)) {
                                newProps.children[i$1] = cloneVNode(child);
                            }
                        }
                    }
                    else if (isVNode(newChildren)) {
                        newProps.children = cloneVNode(newChildren);
                    }
                }
            }
            newVNode.children = null;
        }
        else if (flags & 3970 /* Element */) {
            children = (props && props.children) || vNodeToClone.children;
            newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), children, events, key, ref, !children);
        }
        else if (flags & 1 /* Text */) {
            newVNode = createTextVNode(vNodeToClone.children);
        }
    }
    return newVNode;
}
function createVoidVNode() {
    return createVNode(4096 /* Void */);
}
function createTextVNode(text) {
    return createVNode(1 /* Text */, null, null, text, null, null, null, true);
}
function isVNode(o) {
    return !!o.flags;
}

function constructDefaults(string, object, value) {
    /* eslint no-return-assign: 0 */
    string.split(',').forEach(function (i) { return object[i] = value; });
}
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var svgNS = 'http://www.w3.org/2000/svg';
var strictProps = {};
var booleanProps = {};
var namespaces = {};
var isUnitlessNumber = {};
var skipProps = {};
var dehyphenProps = {
    httpEquiv: 'http-equiv',
    acceptCharset: 'accept-charset',
};
var probablyKebabProps = /^(accentH|arabicF|capH|font[FSVW]|glyph[NO]|horiz[AO]|panose1|renderingI|strikethrough[PT]|underline[PT]|v[AHIM]|vert[AO]|xH|alignmentB|baselineS|clip[PR]|color[IPR]|dominantB|enableB|fill[OR]|flood[COF]|imageR|letterS|lightingC|marker[EMS]|pointerE|shapeR|stop[CO]|stroke[DLMOW]|text[ADR]|unicodeB|wordS|writingM).*/;
function kebabize(str, smallLetter, largeLetter) {
    return (smallLetter + "-" + (largeLetter.toLowerCase()));
}
var delegatedProps = {};
constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,defaultValue,defaultChecked', strictProps, true);
constructDefaults('children,childrenType,ref,key,selected,checked,multiple', skipProps, true);
constructDefaults('onClick,onMouseDown,onMouseUp,onMouseMove,onSubmit,onDblClick,onKeyDown,onKeyUp,onKeyPress', delegatedProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,readOnly,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate,hidden', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

var Lifecycle = function Lifecycle() {
    this.listeners = [];
    this.fastUnmount = true;
};
Lifecycle.prototype.addListener = function addListener (callback) {
    this.listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger () {
        var this$1 = this;

    for (var i = 0; i < this.listeners.length; i++) {
        this$1.listeners[i]();
    }
};

var isiOS = isBrowser && !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
var delegatedEvents = new Map();
function handleEvent(name, lastEvent, nextEvent, dom) {
    var delegatedRoots = delegatedEvents.get(name);
    if (nextEvent) {
        if (!delegatedRoots) {
            delegatedRoots = { items: new Map(), count: 0, docEvent: null };
            var docEvent = attachEventToDocument(name, delegatedRoots);
            delegatedRoots.docEvent = docEvent;
            delegatedEvents.set(name, delegatedRoots);
        }
        if (!lastEvent) {
            delegatedRoots.count++;
            if (isiOS && name === 'onClick') {
                trapClickOnNonInteractiveElement(dom);
            }
        }
        delegatedRoots.items.set(dom, nextEvent);
    }
    else if (delegatedRoots) {
        if (delegatedRoots.items.has(dom)) {
            delegatedRoots.count--;
            delegatedRoots.items.delete(dom);
            if (delegatedRoots.count === 0) {
                document.removeEventListener(normalizeEventName(name), delegatedRoots.docEvent);
                delegatedEvents.delete(name);
            }
        }
    }
}
function dispatchEvent(event, dom, items, count, eventData) {
    var eventsToTrigger = items.get(dom);
    if (eventsToTrigger) {
        count--;
        // linkEvent object
        eventData.dom = dom;
        if (eventsToTrigger.event) {
            eventsToTrigger.event(eventsToTrigger.data, event);
        }
        else {
            eventsToTrigger(event);
        }
        if (eventData.stopPropagation) {
            return;
        }
    }
    var parentDom = dom.parentNode;
    if (count > 0 && (parentDom || parentDom === document.body)) {
        dispatchEvent(event, parentDom, items, count, eventData);
    }
}
function normalizeEventName(name) {
    return name.substr(2).toLowerCase();
}
function attachEventToDocument(name, delegatedRoots) {
    var docEvent = function (event) {
        var eventData = {
            stopPropagation: false,
            dom: document
        };
        // we have to do this as some browsers recycle the same Event between calls
        // so we need to make the property configurable
        Object.defineProperty(event, 'currentTarget', {
            configurable: true,
            get: function get() {
                return eventData.dom;
            }
        });
        event.stopPropagation = function () {
            eventData.stopPropagation = true;
        };
        var count = delegatedRoots.count;
        if (count > 0) {
            dispatchEvent(event, event.target, delegatedRoots.items, count, eventData);
        }
    };
    document.addEventListener(normalizeEventName(name), docEvent);
    return docEvent;
}
function emptyFn() { }
function trapClickOnNonInteractiveElement(dom) {
    // Mobile Safari does not fire properly bubble click events on
    // non-interactive elements, which means delegated click listeners do not
    // fire. The workaround for this bug involves attaching an empty click
    // listener on the target node.
    // http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
    // Just set it using the onclick property so that we don't have to manage any
    // bookkeeping for it. Not sure if we need to clear it when the listener is
    // removed.
    // TODO: Only do this for the relevant Safaris maybe?
    dom.onclick = emptyFn;
}

var componentPools = new Map();
var elementPools = new Map();
function recycleElement(vNode, lifecycle, context, isSVG) {
    var tag = vNode.type;
    var key = vNode.key;
    var pools = elementPools.get(tag);
    if (!isUndefined(pools)) {
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!isUndefined(pool)) {
            var recycledVNode = pool.pop();
            if (!isUndefined(recycledVNode)) {
                patchElement(recycledVNode, vNode, null, lifecycle, context, isSVG, true);
                return vNode.dom;
            }
        }
    }
    return null;
}
function poolElement(vNode) {
    var tag = vNode.type;
    var key = vNode.key;
    var pools = elementPools.get(tag);
    if (isUndefined(pools)) {
        pools = {
            nonKeyed: [],
            keyed: new Map(),
        };
        elementPools.set(tag, pools);
    }
    if (isNull(key)) {
        pools.nonKeyed.push(vNode);
    }
    else {
        var pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vNode);
    }
}
function recycleComponent(vNode, lifecycle, context, isSVG) {
    var type = vNode.type;
    var key = vNode.key;
    var pools = componentPools.get(type);
    if (!isUndefined(pools)) {
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!isUndefined(pool)) {
            var recycledVNode = pool.pop();
            if (!isUndefined(recycledVNode)) {
                var flags = vNode.flags;
                var failed = patchComponent(recycledVNode, vNode, null, lifecycle, context, isSVG, flags & 4 /* ComponentClass */, true);
                if (!failed) {
                    return vNode.dom;
                }
            }
        }
    }
    return null;
}
function poolComponent(vNode) {
    var type = vNode.type;
    var key = vNode.key;
    var hooks = vNode.ref;
    var nonRecycleHooks = hooks && (hooks.onComponentWillMount ||
        hooks.onComponentWillUnmount ||
        hooks.onComponentDidMount ||
        hooks.onComponentWillUpdate ||
        hooks.onComponentDidUpdate);
    if (nonRecycleHooks) {
        return;
    }
    var pools = componentPools.get(type);
    if (isUndefined(pools)) {
        pools = {
            nonKeyed: [],
            keyed: new Map(),
        };
        componentPools.set(type, pools);
    }
    if (isNull(key)) {
        pools.nonKeyed.push(vNode);
    }
    else {
        var pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vNode);
    }
}

function unmount(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
    var flags = vNode.flags;
    if (flags & 28 /* Component */) {
        unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling);
    }
    else if (flags & 3970 /* Element */) {
        unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling);
    }
    else if (flags & (1 /* Text */ | 4096 /* Void */)) {
        unmountVoidOrText(vNode, parentDom);
    }
}
function unmountVoidOrText(vNode, parentDom) {
    if (parentDom) {
        removeChild(parentDom, vNode.dom);
    }
}
var alreadyUnmounted = new WeakMap();
function unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
    var instance = vNode.children;
    var flags = vNode.flags;
    var isStatefulComponent$$1 = flags & 4;
    var ref = vNode.ref;
    var dom = vNode.dom;
    if (alreadyUnmounted.has(vNode) && !isRecycling && !parentDom) {
        return;
    }
    alreadyUnmounted.set(vNode);
    if (!isRecycling) {
        if (isStatefulComponent$$1) {
            if (!instance._unmounted) {
                instance._ignoreSetState = true;
                options.beforeUnmount && options.beforeUnmount(vNode);
                instance.componentWillUnmount && instance.componentWillUnmount();
                if (ref && !isRecycling) {
                    ref(null);
                }
                instance._unmounted = true;
                options.findDOMNodeEnabled && componentToDOMNodeMap.delete(instance);
                var subLifecycle = instance._lifecycle;
                if (!subLifecycle.fastUnmount) {
                    unmount(instance._lastInput, null, subLifecycle, false, isRecycling);
                }
            }
        }
        else {
            if (!isNullOrUndef(ref)) {
                if (!isNullOrUndef(ref.onComponentWillUnmount)) {
                    ref.onComponentWillUnmount(dom);
                }
            }
            if (!lifecycle.fastUnmount) {
                unmount(instance, null, lifecycle, false, isRecycling);
            }
        }
    }
    if (parentDom) {
        var lastInput = instance._lastInput;
        if (isNullOrUndef(lastInput)) {
            lastInput = instance;
        }
        removeChild(parentDom, dom);
    }
    if (options.recyclingEnabled && !isStatefulComponent$$1 && (parentDom || canRecycle)) {
        poolComponent(vNode);
    }
}
function unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
    var dom = vNode.dom;
    var ref = vNode.ref;
    var events = vNode.events;
    if (alreadyUnmounted.has(vNode) && !isRecycling && !parentDom) {
        return;
    }
    alreadyUnmounted.set(vNode);
    if (!lifecycle.fastUnmount) {
        if (ref && !isRecycling) {
            unmountRef(ref);
        }
        var children = vNode.children;
        if (!isNullOrUndef(children)) {
            unmountChildren$1(children, lifecycle, isRecycling);
        }
    }
    if (!isNull(events)) {
        for (var name in events) {
            // do not add a hasOwnProperty check here, it affects performance
            patchEvent(name, events[name], null, dom);
            events[name] = null;
        }
    }
    if (parentDom) {
        removeChild(parentDom, dom);
    }
    if (options.recyclingEnabled && (parentDom || canRecycle)) {
        poolElement(vNode);
    }
}
function unmountChildren$1(children, lifecycle, isRecycling) {
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!isInvalid(child) && isObject(child)) {
                unmount(child, null, lifecycle, false, isRecycling);
            }
        }
    }
    else if (isObject(children)) {
        unmount(children, null, lifecycle, false, isRecycling);
    }
}
function unmountRef(ref) {
    if (isFunction(ref)) {
        ref(null);
    }
    else {
        if (isInvalid(ref)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
        throwError();
    }
}

function createClassComponentInstance(vNode, Component, props, context, isSVG) {
    if (isUndefined(context)) {
        context = {};
    }
    var instance = new Component(props, context);
    instance.context = context;
    if (instance.props === EMPTY_OBJ) {
        instance.props = props;
    }
    instance._patch = patch;
    if (options.findDOMNodeEnabled) {
        instance._componentToDOMNodeMap = componentToDOMNodeMap;
    }
    instance._unmounted = false;
    instance._pendingSetState = true;
    instance._isSVG = isSVG;
    if (isFunction(instance.componentWillMount)) {
        instance.componentWillMount();
    }
    var childContext = instance.getChildContext();
    if (!isNullOrUndef(childContext)) {
        instance._childContext = Object.assign({}, context, childContext);
    }
    else {
        instance._childContext = context;
    }
    options.beforeRender && options.beforeRender(instance);
    var input = instance.render(props, instance.state, context);
    options.afterRender && options.afterRender(instance);
    if (isArray(input)) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
        }
        throwError();
    }
    else if (isInvalid(input)) {
        input = createVoidVNode();
    }
    else if (isStringOrNumber(input)) {
        input = createTextVNode(input);
    }
    else {
        if (input.dom) {
            input = cloneVNode(input);
        }
        if (input.flags & 28 /* Component */) {
            // if we have an input that is also a component, we run into a tricky situation
            // where the root vNode needs to always have the correct DOM entry
            // so we break monomorphism on our input and supply it our vNode as parentVNode
            // we can optimise this in the future, but this gets us out of a lot of issues
            input.parentVNode = vNode;
        }
    }
    instance._pendingSetState = false;
    instance._lastInput = input;
    return instance;
}
function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling) {
    replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
}
function replaceVNode(parentDom, dom, vNode, lifecycle, isRecycling) {
    var shallowUnmount = false;
    // we cannot cache nodeType here as vNode might be re-assigned below
    if (vNode.flags & 28 /* Component */) {
        // if we are accessing a stateful or stateless component, we want to access their last rendered input
        // accessing their DOM node is not useful to us here
        unmount(vNode, null, lifecycle, false, isRecycling);
        vNode = vNode.children._lastInput || vNode.children;
        shallowUnmount = true;
    }
    replaceChild(parentDom, dom, vNode.dom);
    unmount(vNode, null, lifecycle, false, isRecycling);
}
function createFunctionalComponentInput(vNode, component, props, context) {
    var input = component(props, context);
    if (isArray(input)) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
        }
        throwError();
    }
    else if (isInvalid(input)) {
        input = createVoidVNode();
    }
    else if (isStringOrNumber(input)) {
        input = createTextVNode(input);
    }
    else {
        if (input.dom) {
            input = cloneVNode(input);
        }
        if (input.flags & 28 /* Component */) {
            // if we have an input that is also a component, we run into a tricky situation
            // where the root vNode needs to always have the correct DOM entry
            // so we break monomorphism on our input and supply it our vNode as parentVNode
            // we can optimise this in the future, but this gets us out of a lot of issues
            input.parentVNode = vNode;
        }
    }
    return input;
}
function setTextContent(dom, text) {
    if (text !== '') {
        dom.textContent = text;
    }
    else {
        dom.appendChild(document.createTextNode(''));
    }
}
function updateTextContent(dom, text) {
    dom.firstChild.nodeValue = text;
}
function appendChild(parentDom, dom) {
    parentDom.appendChild(dom);
}
function insertOrAppend(parentDom, newNode, nextNode) {
    if (isNullOrUndef(nextNode)) {
        appendChild(parentDom, newNode);
    }
    else {
        parentDom.insertBefore(newNode, nextNode);
    }
}
function documentCreateElement(tag, isSVG) {
    if (isSVG === true) {
        return document.createElementNS(svgNS, tag);
    }
    else {
        return document.createElement(tag);
    }
}
function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    unmount(lastNode, null, lifecycle, false, isRecycling);
    var dom = mount(nextNode, null, lifecycle, context, isSVG);
    nextNode.dom = dom;
    replaceChild(parentDom, dom, lastNode.dom);
}
function replaceChild(parentDom, nextDom, lastDom) {
    if (!parentDom) {
        parentDom = lastDom.parentNode;
    }
    parentDom.replaceChild(nextDom, lastDom);
}
function removeChild(parentDom, dom) {
    parentDom.removeChild(dom);
}
function removeAllChildren(dom, children, lifecycle, isRecycling) {
    dom.textContent = '';
    if (!lifecycle.fastUnmount || (lifecycle.fastUnmount && options.recyclingEnabled && !isRecycling)) {
        removeChildren(null, children, lifecycle, isRecycling);
    }
}
function removeChildren(dom, children, lifecycle, isRecycling) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!isInvalid(child)) {
            unmount(child, dom, lifecycle, true, isRecycling);
        }
    }
}
function isKeyed(lastChildren, nextChildren) {
    return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
        && lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}

function isCheckedType(type) {
    return type === 'checkbox' || type === 'radio';
}
function isControlled(props) {
    var usesChecked = isCheckedType(props.type);
    return usesChecked ? !isNullOrUndef(props.checked) : !isNullOrUndef(props.value);
}
function onTextInputChange(e) {
    var vNode = this.vNode;
    var events = vNode.events || EMPTY_OBJ;
    var dom = vNode.dom;
    if (events.onInput) {
        var event = events.onInput;
        if (event.event) {
            event.event(event.data, e);
        }
        else {
            event(e);
        }
    }
    else if (events.oninput) {
        events.oninput(e);
    }
    // the user may have updated the vNode from the above onInput events
    // so we need to get it from the context of `this` again
    applyValue(this.vNode, dom);
}
function wrappedOnChange(e) {
    var vNode = this.vNode;
    var events = vNode.events || EMPTY_OBJ;
    var event = events.onChange;
    if (event.event) {
        event.event(event.data, e);
    }
    else {
        event(e);
    }
}
function onCheckboxChange(e) {
    var vNode = this.vNode;
    var events = vNode.events || EMPTY_OBJ;
    var dom = vNode.dom;
    if (events.onClick) {
        var event = events.onClick;
        if (event.event) {
            event.event(event.data, e);
        }
        else {
            event(e);
        }
    }
    else if (events.onclick) {
        events.onclick(e);
    }
    // the user may have updated the vNode from the above onClick events
    // so we need to get it from the context of `this` again
    applyValue(this.vNode, dom);
}
function handleAssociatedRadioInputs(name) {
    var inputs = document.querySelectorAll(("input[type=\"radio\"][name=\"" + name + "\"]"));
    [].forEach.call(inputs, function (dom) {
        var inputWrapper = wrappers.get(dom);
        if (inputWrapper) {
            var props = inputWrapper.vNode.props;
            if (props) {
                dom.checked = inputWrapper.vNode.props.checked;
            }
        }
    });
}
function processInput(vNode, dom) {
    var props = vNode.props || EMPTY_OBJ;
    applyValue(vNode, dom);
    if (isControlled(props)) {
        var inputWrapper = wrappers.get(dom);
        if (!inputWrapper) {
            inputWrapper = {
                vNode: vNode,
            };
            if (isCheckedType(props.type)) {
                dom.onclick = onCheckboxChange.bind(inputWrapper);
                dom.onclick.wrapped = true;
            }
            else {
                dom.oninput = onTextInputChange.bind(inputWrapper);
                dom.oninput.wrapped = true;
            }
            if (props.onChange) {
                dom.onchange = wrappedOnChange.bind(inputWrapper);
                dom.onchange.wrapped = true;
            }
            wrappers.set(dom, inputWrapper);
        }
        inputWrapper.vNode = vNode;
        return true;
    }
    return false;
}
function applyValue(vNode, dom) {
    var props = vNode.props || EMPTY_OBJ;
    var type = props.type;
    var value = props.value;
    var checked = props.checked;
    var multiple = props.multiple;
    if (type && type !== dom.type) {
        dom.type = type;
    }
    if (multiple && multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    if (isCheckedType(type)) {
        if (!isNullOrUndef(value)) {
            dom.value = value;
        }
        dom.checked = checked;
        if (type === 'radio' && props.name) {
            handleAssociatedRadioInputs(props.name);
        }
    }
    else {
        if (!isNullOrUndef(value) && dom.value !== value) {
            dom.value = value;
        }
        else if (!isNullOrUndef(checked)) {
            dom.checked = checked;
        }
    }
}

function isControlled$1(props) {
    return !isNullOrUndef(props.value);
}
function updateChildOptionGroup(vNode, value) {
    var type = vNode.type;
    if (type === 'optgroup') {
        var children = vNode.children;
        if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                updateChildOption(children[i], value);
            }
        }
        else if (isVNode(children)) {
            updateChildOption(children, value);
        }
    }
    else {
        updateChildOption(vNode, value);
    }
}
function updateChildOption(vNode, value) {
    var props = vNode.props || EMPTY_OBJ;
    var dom = vNode.dom;
    // we do this as multiple may have changed
    dom.value = props.value;
    if ((isArray(value) && value.indexOf(props.value) !== -1) || props.value === value) {
        dom.selected = true;
    }
    else {
        dom.selected = props.selected || false;
    }
}
function onSelectChange(e) {
    var vNode = this.vNode;
    var events = vNode.events || EMPTY_OBJ;
    var dom = vNode.dom;
    if (events.onChange) {
        var event = events.onChange;
        if (event.event) {
            event.event(event.data, e);
        }
        else {
            event(e);
        }
    }
    else if (events.onchange) {
        events.onchange(e);
    }
    // the user may have updated the vNode from the above onChange events
    // so we need to get it from the context of `this` again
    applyValue$1(this.vNode, dom);
}
function processSelect(vNode, dom) {
    var props = vNode.props || EMPTY_OBJ;
    applyValue$1(vNode, dom);
    if (isControlled$1(props)) {
        var selectWrapper = wrappers.get(dom);
        if (!selectWrapper) {
            selectWrapper = {
                vNode: vNode
            };
            dom.onchange = onSelectChange.bind(selectWrapper);
            dom.onchange.wrapped = true;
            wrappers.set(dom, selectWrapper);
        }
        selectWrapper.vNode = vNode;
        return true;
    }
    return false;
}
function applyValue$1(vNode, dom) {
    var props = vNode.props || EMPTY_OBJ;
    if (props.multiple !== dom.multiple) {
        dom.multiple = props.multiple;
    }
    var children = vNode.children;
    if (!isInvalid(children)) {
        var value = props.value;
        if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                updateChildOptionGroup(children[i], value);
            }
        }
        else if (isVNode(children)) {
            updateChildOptionGroup(children, value);
        }
    }
}

function isControlled$2(props) {
    return !isNullOrUndef(props.value);
}
function wrappedOnChange$1(e) {
    var vNode = this.vNode;
    var events = vNode.events || EMPTY_OBJ;
    var event = events.onChange;
    if (event.event) {
        event.event(event.data, e);
    }
    else {
        event(e);
    }
}
function onTextareaInputChange(e) {
    var vNode = this.vNode;
    var events = vNode.events || EMPTY_OBJ;
    var dom = vNode.dom;
    if (events.onInput) {
        var event = events.onInput;
        if (event.event) {
            event.event(event.data, e);
        }
        else {
            event(e);
        }
    }
    else if (events.oninput) {
        events.oninput(e);
    }
    // the user may have updated the vNode from the above onInput events
    // so we need to get it from the context of `this` again
    applyValue$2(this.vNode, dom);
}
function processTextarea(vNode, dom) {
    var props = vNode.props || EMPTY_OBJ;
    applyValue$2(vNode, dom);
    var textareaWrapper = wrappers.get(dom);
    if (isControlled$2(props)) {
        if (!textareaWrapper) {
            textareaWrapper = {
                vNode: vNode
            };
            dom.oninput = onTextareaInputChange.bind(textareaWrapper);
            dom.oninput.wrapped = true;
            if (props.onChange) {
                dom.onchange = wrappedOnChange$1.bind(textareaWrapper);
                dom.onchange.wrapped = true;
            }
            wrappers.set(dom, textareaWrapper);
        }
        textareaWrapper.vNode = vNode;
        return true;
    }
    return false;
}
function applyValue$2(vNode, dom) {
    var props = vNode.props || EMPTY_OBJ;
    var value = props.value;
    var domValue = dom.value;
    if (domValue !== value) {
        if (!isNullOrUndef(value)) {
            dom.value = value;
        }
        else if (domValue !== '') {
            dom.value = '';
        }
    }
}

var wrappers = new Map();
function processElement(flags, vNode, dom) {
    if (flags & 512 /* InputElement */) {
        return processInput(vNode, dom);
    }
    if (flags & 2048 /* SelectElement */) {
        return processSelect(vNode, dom);
    }
    if (flags & 1024 /* TextareaElement */) {
        return processTextarea(vNode, dom);
    }
    return false;
}

function patch(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    if (lastVNode !== nextVNode) {
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        if (nextFlags & 28 /* Component */) {
            if (lastFlags & 28 /* Component */) {
                patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, nextFlags & 4 /* ComponentClass */, isRecycling);
            }
            else {
                replaceVNode(parentDom, mountComponent(nextVNode, null, lifecycle, context, isSVG, nextFlags & 4 /* ComponentClass */), lastVNode, lifecycle, isRecycling);
            }
        }
        else if (nextFlags & 3970 /* Element */) {
            if (lastFlags & 3970 /* Element */) {
                patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
            }
            else {
                replaceVNode(parentDom, mountElement(nextVNode, null, lifecycle, context, isSVG), lastVNode, lifecycle, isRecycling);
            }
        }
        else if (nextFlags & 1 /* Text */) {
            if (lastFlags & 1 /* Text */) {
                patchText(lastVNode, nextVNode);
            }
            else {
                replaceVNode(parentDom, mountText(nextVNode, null), lastVNode, lifecycle, isRecycling);
            }
        }
        else if (nextFlags & 4096 /* Void */) {
            if (lastFlags & 4096 /* Void */) {
                patchVoid(lastVNode, nextVNode);
            }
            else {
                replaceVNode(parentDom, mountVoid(nextVNode, null), lastVNode, lifecycle, isRecycling);
            }
        }
        else {
            // Error case: mount new one replacing old one
            replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
        }
    }
}
function unmountChildren(children, dom, lifecycle, isRecycling) {
    if (isVNode(children)) {
        unmount(children, dom, lifecycle, true, isRecycling);
    }
    else if (isArray(children)) {
        removeAllChildren(dom, children, lifecycle, isRecycling);
    }
    else {
        dom.textContent = '';
    }
}
function patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    var nextTag = nextVNode.type;
    var lastTag = lastVNode.type;
    if (lastTag !== nextTag) {
        replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
    }
    else {
        var dom = lastVNode.dom;
        var lastProps = lastVNode.props;
        var nextProps = nextVNode.props;
        var lastChildren = lastVNode.children;
        var nextChildren = nextVNode.children;
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        var lastRef = lastVNode.ref;
        var nextRef = nextVNode.ref;
        var lastEvents = lastVNode.events;
        var nextEvents = nextVNode.events;
        nextVNode.dom = dom;
        if (isSVG || (nextFlags & 128 /* SvgElement */)) {
            isSVG = true;
        }
        if (lastChildren !== nextChildren) {
            patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
        var hasControlledValue = false;
        if (!(nextFlags & 2 /* HtmlElement */)) {
            hasControlledValue = processElement(nextFlags, nextVNode, dom);
        }
        // inlined patchProps  -- starts --
        if (lastProps !== nextProps) {
            var lastPropsOrEmpty = lastProps || EMPTY_OBJ;
            var nextPropsOrEmpty = nextProps || EMPTY_OBJ;
            if (nextPropsOrEmpty !== EMPTY_OBJ) {
                for (var prop in nextPropsOrEmpty) {
                    // do not add a hasOwnProperty check here, it affects performance
                    var nextValue = nextPropsOrEmpty[prop];
                    var lastValue = lastPropsOrEmpty[prop];
                    if (isNullOrUndef(nextValue)) {
                        removeProp(prop, nextValue, dom);
                    }
                    else {
                        patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue);
                    }
                }
            }
            if (lastPropsOrEmpty !== EMPTY_OBJ) {
                for (var prop$1 in lastPropsOrEmpty) {
                    // do not add a hasOwnProperty check here, it affects performance
                    if (isNullOrUndef(nextPropsOrEmpty[prop$1])) {
                        removeProp(prop$1, lastPropsOrEmpty[prop$1], dom);
                    }
                }
            }
        }
        // inlined patchProps  -- ends --
        if (lastEvents !== nextEvents) {
            patchEvents(lastEvents, nextEvents, dom);
        }
        if (nextRef) {
            if (lastRef !== nextRef || isRecycling) {
                mountRef(dom, nextRef, lifecycle);
            }
        }
    }
}
function patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
    var patchArray = false;
    var patchKeyed = false;
    if (nextFlags & 64 /* HasNonKeyedChildren */) {
        patchArray = true;
    }
    else if ((lastFlags & 32 /* HasKeyedChildren */) && (nextFlags & 32 /* HasKeyedChildren */)) {
        patchKeyed = true;
        patchArray = true;
    }
    else if (isInvalid(nextChildren)) {
        unmountChildren(lastChildren, dom, lifecycle, isRecycling);
    }
    else if (isInvalid(lastChildren)) {
        if (isStringOrNumber(nextChildren)) {
            setTextContent(dom, nextChildren);
        }
        else {
            if (isArray(nextChildren)) {
                mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
            }
            else {
                mount(nextChildren, dom, lifecycle, context, isSVG);
            }
        }
    }
    else if (isStringOrNumber(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            updateTextContent(dom, nextChildren);
        }
        else {
            unmountChildren(lastChildren, dom, lifecycle, isRecycling);
            setTextContent(dom, nextChildren);
        }
    }
    else if (isArray(nextChildren)) {
        if (isArray(lastChildren)) {
            patchArray = true;
            if (isKeyed(lastChildren, nextChildren)) {
                patchKeyed = true;
            }
        }
        else {
            unmountChildren(lastChildren, dom, lifecycle, isRecycling);
            mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
        }
    }
    else if (isArray(lastChildren)) {
        removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
        mount(nextChildren, dom, lifecycle, context, isSVG);
    }
    else if (isVNode(nextChildren)) {
        if (isVNode(lastChildren)) {
            patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
        else {
            unmountChildren(lastChildren, dom, lifecycle, isRecycling);
            mount(nextChildren, dom, lifecycle, context, isSVG);
        }
    }
    if (patchArray) {
        if (patchKeyed) {
            patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
        else {
            patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
    }
}
function patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isClass, isRecycling) {
    var lastType = lastVNode.type;
    var nextType = nextVNode.type;
    var nextProps = nextVNode.props || EMPTY_OBJ;
    var lastKey = lastVNode.key;
    var nextKey = nextVNode.key;
    var defaultProps = nextType.defaultProps;
    if (!isUndefined(defaultProps)) {
        copyPropsTo(defaultProps, nextProps);
        nextVNode.props = nextProps;
    }
    if (lastType !== nextType) {
        if (isClass) {
            replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
        }
        else {
            var lastInput = lastVNode.children._lastInput || lastVNode.children;
            var nextInput = createFunctionalComponentInput(nextVNode, nextType, nextProps, context);
            unmount(lastVNode, null, lifecycle, false, isRecycling);
            patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling);
            var dom = nextVNode.dom = nextInput.dom;
            nextVNode.children = nextInput;
            mountFunctionalComponentCallbacks(nextVNode.ref, dom, lifecycle);
        }
    }
    else {
        if (isClass) {
            if (lastKey !== nextKey) {
                replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
                return false;
            }
            var instance = lastVNode.children;
            if (instance._unmounted) {
                if (isNull(parentDom)) {
                    return true;
                }
                replaceChild(parentDom, mountComponent(nextVNode, null, lifecycle, context, isSVG, nextVNode.flags & 4 /* ComponentClass */), lastVNode.dom);
            }
            else {
                var lastState = instance.state;
                var nextState = instance.state;
                var lastProps = instance.props;
                var childContext = instance.getChildContext();
                nextVNode.children = instance;
                instance._isSVG = isSVG;
                if (!isNullOrUndef(childContext)) {
                    childContext = Object.assign({}, context, childContext);
                }
                else {
                    childContext = context;
                }
                var lastInput$1 = instance._lastInput;
                var nextInput$1 = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false, false);
                var didUpdate = true;
                instance._childContext = childContext;
                if (isInvalid(nextInput$1)) {
                    nextInput$1 = createVoidVNode();
                }
                else if (nextInput$1 === NO_OP) {
                    nextInput$1 = lastInput$1;
                    didUpdate = false;
                }
                else if (isStringOrNumber(nextInput$1)) {
                    nextInput$1 = createTextVNode(nextInput$1);
                }
                else if (isArray(nextInput$1)) {
                    if (process.env.NODE_ENV !== 'production') {
                        throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
                    }
                    throwError();
                }
                else if (isObject(nextInput$1) && nextInput$1.dom) {
                    nextInput$1 = cloneVNode(nextInput$1);
                }
                if (nextInput$1.flags & 28 /* Component */) {
                    nextInput$1.parentVNode = nextVNode;
                }
                else if (lastInput$1.flags & 28 /* Component */) {
                    lastInput$1.parentVNode = nextVNode;
                }
                instance._lastInput = nextInput$1;
                instance._vNode = nextVNode;
                if (didUpdate) {
                    var fastUnmount = lifecycle.fastUnmount;
                    var subLifecycle = instance._lifecycle;
                    lifecycle.fastUnmount = subLifecycle.fastUnmount;
                    patch(lastInput$1, nextInput$1, parentDom, lifecycle, childContext, isSVG, isRecycling);
                    subLifecycle.fastUnmount = lifecycle.fastUnmount;
                    lifecycle.fastUnmount = fastUnmount;
                    instance.componentDidUpdate(lastProps, lastState);
                    options.afterUpdate && options.afterUpdate(nextVNode);
                    options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, nextInput$1.dom);
                }
                nextVNode.dom = nextInput$1.dom;
            }
        }
        else {
            var shouldUpdate = true;
            var lastProps$1 = lastVNode.props;
            var nextHooks = nextVNode.ref;
            var nextHooksDefined = !isNullOrUndef(nextHooks);
            var lastInput$2 = lastVNode.children;
            var nextInput$2 = lastInput$2;
            nextVNode.dom = lastVNode.dom;
            nextVNode.children = lastInput$2;
            if (lastKey !== nextKey) {
                shouldUpdate = true;
            }
            else {
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
                    shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps$1, nextProps);
                }
            }
            if (shouldUpdate !== false) {
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
                    nextHooks.onComponentWillUpdate(lastProps$1, nextProps);
                }
                nextInput$2 = nextType(nextProps, context);
                if (isInvalid(nextInput$2)) {
                    nextInput$2 = createVoidVNode();
                }
                else if (isStringOrNumber(nextInput$2) && nextInput$2 !== NO_OP) {
                    nextInput$2 = createTextVNode(nextInput$2);
                }
                else if (isArray(nextInput$2)) {
                    if (process.env.NODE_ENV !== 'production') {
                        throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
                    }
                    throwError();
                }
                else if (isObject(nextInput$2) && nextInput$2.dom) {
                    nextInput$2 = cloneVNode(nextInput$2);
                }
                if (nextInput$2 !== NO_OP) {
                    patch(lastInput$2, nextInput$2, parentDom, lifecycle, context, isSVG, isRecycling);
                    nextVNode.children = nextInput$2;
                    if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
                        nextHooks.onComponentDidUpdate(lastProps$1, nextProps);
                    }
                    nextVNode.dom = nextInput$2.dom;
                }
            }
            if (nextInput$2.flags & 28 /* Component */) {
                nextInput$2.parentVNode = nextVNode;
            }
            else if (lastInput$2.flags & 28 /* Component */) {
                lastInput$2.parentVNode = nextVNode;
            }
        }
    }
    return false;
}
function patchText(lastVNode, nextVNode) {
    var nextText = nextVNode.children;
    var dom = lastVNode.dom;
    nextVNode.dom = dom;
    if (lastVNode.children !== nextText) {
        dom.nodeValue = nextText;
    }
}
function patchVoid(lastVNode, nextVNode) {
    nextVNode.dom = lastVNode.dom;
}
function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
    var lastChildrenLength = lastChildren.length;
    var nextChildrenLength = nextChildren.length;
    var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    var i = 0;
    for (; i < commonLength; i++) {
        var nextChild = nextChildren[i];
        if (nextChild.dom) {
            nextChild = nextChildren[i] = cloneVNode(nextChild);
        }
        patch(lastChildren[i], nextChild, dom, lifecycle, context, isSVG, isRecycling);
    }
    if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; i++) {
            var nextChild$1 = nextChildren[i];
            if (nextChild$1.dom) {
                nextChild$1 = nextChildren[i] = cloneVNode(nextChild$1);
            }
            appendChild(dom, mount(nextChild$1, null, lifecycle, context, isSVG));
        }
    }
    else if (nextChildrenLength === 0) {
        removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
    }
    else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; i++) {
            unmount(lastChildren[i], dom, lifecycle, false, isRecycling);
        }
    }
}
function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, isRecycling) {
    var aLength = a.length;
    var bLength = b.length;
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i;
    var j;
    var aNode;
    var bNode;
    var nextNode;
    var nextPos;
    var node;
    if (aLength === 0) {
        if (bLength !== 0) {
            mountArrayChildren(b, dom, lifecycle, context, isSVG);
        }
        return;
    }
    else if (bLength === 0) {
        removeAllChildren(dom, a, lifecycle, isRecycling);
        return;
    }
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];
    if (bStartNode.dom) {
        b[bStart] = bStartNode = cloneVNode(bStartNode);
    }
    if (bEndNode.dom) {
        b[bEnd] = bEndNode = cloneVNode(bEndNode);
    }
    // Step 1
    /* eslint no-constant-condition: 0 */
    outer: while (true) {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
            aStart++;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
            if (bStartNode.dom) {
                b[bStart] = bStartNode = cloneVNode(bStartNode);
            }
        }
        // Sync nodes with the same key at the end.
        while (aEndNode.key === bEndNode.key) {
            patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
            aEnd--;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
            if (bEndNode.dom) {
                b[bEnd] = bEndNode = cloneVNode(bEndNode);
            }
        }
        // Move and sync nodes from right to left.
        if (aEndNode.key === bStartNode.key) {
            patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
            insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
            aEnd--;
            bStart++;
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            if (bStartNode.dom) {
                b[bStart] = bStartNode = cloneVNode(bStartNode);
            }
            continue;
        }
        // Move and sync nodes from left to right.
        if (aStartNode.key === bEndNode.key) {
            patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
            insertOrAppend(dom, bEndNode.dom, nextNode);
            aStart++;
            bEnd--;
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            if (bEndNode.dom) {
                b[bEnd] = bEndNode = cloneVNode(bEndNode);
            }
            continue;
        }
        break;
    }
    if (aStart > aEnd) {
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
            while (bStart <= bEnd) {
                node = b[bStart];
                if (node.dom) {
                    b[bStart] = node = cloneVNode(node);
                }
                bStart++;
                insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
            }
        }
    }
    else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            unmount(a[aStart++], dom, lifecycle, false, isRecycling);
        }
    }
    else {
        aLength = aEnd - aStart + 1;
        bLength = bEnd - bStart + 1;
        var aNullable = a;
        var sources = new Array(bLength);
        // Mark all nodes as inserted.
        for (i = 0; i < bLength; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;
        if ((bLength <= 4) || (aLength * bLength <= 16)) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            }
                            else {
                                pos = j;
                            }
                            if (bNode.dom) {
                                b[j] = bNode = cloneVNode(bNode);
                            }
                            patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
                            patched++;
                            aNullable[i] = null;
                            break;
                        }
                    }
                }
            }
        }
        else {
            var keyIndex = new Map();
            for (i = bStart; i <= bEnd; i++) {
                node = b[i];
                keyIndex.set(node.key, i);
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex.get(aNode.key);
                    if (!isUndefined(j)) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        }
                        else {
                            pos = j;
                        }
                        if (bNode.dom) {
                            b[j] = bNode = cloneVNode(bNode);
                        }
                        patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
                        patched++;
                        aNullable[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            removeAllChildren(dom, a, lifecycle, isRecycling);
            while (bStart < bLength) {
                node = b[bStart];
                if (node.dom) {
                    b[bStart] = node = cloneVNode(node);
                }
                bStart++;
                insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), null);
            }
        }
        else {
            i = aLength - patched;
            while (i > 0) {
                aNode = aNullable[aStart++];
                if (!isNull(aNode)) {
                    unmount(aNode, dom, lifecycle, true, isRecycling);
                    i--;
                }
            }
            if (moved) {
                var seq = lis_algorithm(sources);
                j = seq.length - 1;
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        if (node.dom) {
                            b[pos] = node = cloneVNode(node);
                        }
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG), nextNode);
                    }
                    else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            nextNode = nextPos < b.length ? b[nextPos].dom : null;
                            insertOrAppend(dom, node.dom, nextNode);
                        }
                        else {
                            j--;
                        }
                    }
                }
            }
            else if (patched !== bLength) {
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        if (node.dom) {
                            b[pos] = node = cloneVNode(node);
                        }
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
                    }
                }
            }
        }
    }
}
// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
    var p = a.slice(0);
    var result = [0];
    var i;
    var j;
    var u;
    var v;
    var c;
    for (i = 0; i < a.length; i++) {
        if (a[i] === -1) {
            continue;
        }
        j = result[result.length - 1];
        if (a[j] < a[i]) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = ((u + v) / 2) | 0;
            if (a[result[c]] < a[i]) {
                u = c + 1;
            }
            else {
                v = c;
            }
        }
        if (a[i] < a[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
function patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue) {
    if (skipProps[prop] || hasControlledValue && prop === 'value') {
        return;
    }
    if (booleanProps[prop]) {
        dom[prop] = !!nextValue;
    }
    else if (strictProps[prop]) {
        var value = isNullOrUndef(nextValue) ? '' : nextValue;
        if (dom[prop] !== value) {
            dom[prop] = value;
        }
    }
    else if (lastValue !== nextValue) {
        if (isAttrAnEvent(prop)) {
            patchEvent(prop, lastValue, nextValue, dom);
        }
        else if (isNullOrUndef(nextValue)) {
            dom.removeAttribute(prop);
        }
        else if (prop === 'className') {
            if (isSVG) {
                dom.setAttribute('class', nextValue);
            }
            else {
                dom.className = nextValue;
            }
        }
        else if (prop === 'style') {
            patchStyle(lastValue, nextValue, dom);
        }
        else if (prop === 'dangerouslySetInnerHTML') {
            var lastHtml = lastValue && lastValue.__html;
            var nextHtml = nextValue && nextValue.__html;
            if (lastHtml !== nextHtml) {
                if (!isNullOrUndef(nextHtml)) {
                    dom.innerHTML = nextHtml;
                }
            }
        }
        else {
            var dehyphenProp;
            if (dehyphenProps[prop]) {
                dehyphenProp = dehyphenProps[prop];
            }
            else if (isSVG && prop.match(probablyKebabProps)) {
                dehyphenProp = prop.replace(/([a-z])([A-Z]|1)/g, kebabize);
                dehyphenProps[prop] = dehyphenProp;
            }
            else {
                dehyphenProp = prop;
            }
            var ns = namespaces[prop];
            if (ns) {
                dom.setAttributeNS(ns, dehyphenProp, nextValue);
            }
            else {
                dom.setAttribute(dehyphenProp, nextValue);
            }
        }
    }
}
function patchEvents(lastEvents, nextEvents, dom) {
    lastEvents = lastEvents || EMPTY_OBJ;
    nextEvents = nextEvents || EMPTY_OBJ;
    if (nextEvents !== EMPTY_OBJ) {
        for (var name in nextEvents) {
            // do not add a hasOwnProperty check here, it affects performance
            patchEvent(name, lastEvents[name], nextEvents[name], dom);
        }
    }
    if (lastEvents !== EMPTY_OBJ) {
        for (var name$1 in lastEvents) {
            // do not add a hasOwnProperty check here, it affects performance
            if (isNullOrUndef(nextEvents[name$1])) {
                patchEvent(name$1, lastEvents[name$1], null, dom);
            }
        }
    }
}
function patchEvent(name, lastValue, nextValue, dom) {
    if (lastValue !== nextValue) {
        var nameLowerCase = name.toLowerCase();
        var domEvent = dom[nameLowerCase];
        // if the function is wrapped, that means it's been controlled by a wrapper
        if (domEvent && domEvent.wrapped) {
            return;
        }
        if (delegatedProps[name]) {
            handleEvent(name, lastValue, nextValue, dom);
        }
        else {
            if (lastValue !== nextValue) {
                if (!isFunction(nextValue) && !isNullOrUndef(nextValue)) {
                    var linkEvent = nextValue.event;
                    if (linkEvent && isFunction(linkEvent)) {
                        if (!dom._data) {
                            dom[nameLowerCase] = function (e) {
                                linkEvent(e.currentTarget._data, e);
                            };
                        }
                        dom._data = nextValue.data;
                    }
                    else {
                        if (process.env.NODE_ENV !== 'production') {
                            throwError(("an event on a VNode \"" + name + "\". was not a function or a valid linkEvent."));
                        }
                        throwError();
                    }
                }
                else {
                    dom[nameLowerCase] = nextValue;
                }
            }
        }
    }
}
// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
function patchStyle(lastAttrValue, nextAttrValue, dom) {
    if (isString(nextAttrValue)) {
        dom.style.cssText = nextAttrValue;
        return;
    }
    for (var style in nextAttrValue) {
        // do not add a hasOwnProperty check here, it affects performance
        var value = nextAttrValue[style];
        if (isNumber(value) && !isUnitlessNumber[style]) {
            dom.style[style] = value + 'px';
        }
        else {
            dom.style[style] = value;
        }
    }
    if (!isNullOrUndef(lastAttrValue)) {
        for (var style$1 in lastAttrValue) {
            if (isNullOrUndef(nextAttrValue[style$1])) {
                dom.style[style$1] = '';
            }
        }
    }
}
function removeProp(prop, lastValue, dom) {
    if (prop === 'className') {
        dom.removeAttribute('class');
    }
    else if (prop === 'value') {
        dom.value = '';
    }
    else if (prop === 'style') {
        dom.removeAttribute('style');
    }
    else if (isAttrAnEvent(prop)) {
        handleEvent(name, lastValue, null, dom);
    }
    else {
        dom.removeAttribute(prop);
    }
}

function mount(vNode, parentDom, lifecycle, context, isSVG) {
    var flags = vNode.flags;
    if (flags & 3970 /* Element */) {
        return mountElement(vNode, parentDom, lifecycle, context, isSVG);
    }
    else if (flags & 28 /* Component */) {
        return mountComponent(vNode, parentDom, lifecycle, context, isSVG, flags & 4 /* ComponentClass */);
    }
    else if (flags & 4096 /* Void */) {
        return mountVoid(vNode, parentDom);
    }
    else if (flags & 1 /* Text */) {
        return mountText(vNode, parentDom);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            if (typeof vNode === 'object') {
                throwError(("mount() received an object that's not a valid VNode, you should stringify it first. Object: \"" + (JSON.stringify(vNode)) + "\"."));
            }
            else {
                throwError(("mount() expects a valid VNode, instead it received an object with the type \"" + (typeof vNode) + "\"."));
            }
        }
        throwError();
    }
}
function mountText(vNode, parentDom) {
    var dom = document.createTextNode(vNode.children);
    vNode.dom = dom;
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVoid(vNode, parentDom) {
    var dom = document.createTextNode('');
    vNode.dom = dom;
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountElement(vNode, parentDom, lifecycle, context, isSVG) {
    if (options.recyclingEnabled) {
        var dom$1 = recycleElement(vNode, lifecycle, context, isSVG);
        if (!isNull(dom$1)) {
            if (!isNull(parentDom)) {
                appendChild(parentDom, dom$1);
            }
            return dom$1;
        }
    }
    var tag = vNode.type;
    var flags = vNode.flags;
    if (isSVG || (flags & 128 /* SvgElement */)) {
        isSVG = true;
    }
    var dom = documentCreateElement(tag, isSVG);
    var children = vNode.children;
    var props = vNode.props;
    var events = vNode.events;
    var ref = vNode.ref;
    vNode.dom = dom;
    if (!isNull(children)) {
        if (isStringOrNumber(children)) {
            setTextContent(dom, children);
        }
        else if (isArray(children)) {
            mountArrayChildren(children, dom, lifecycle, context, isSVG);
        }
        else if (isVNode(children)) {
            mount(children, dom, lifecycle, context, isSVG);
        }
    }
    var hasControlledValue = false;
    if (!(flags & 2 /* HtmlElement */)) {
        hasControlledValue = processElement(flags, vNode, dom);
    }
    if (!isNull(props)) {
        for (var prop in props) {
            // do not add a hasOwnProperty check here, it affects performance
            patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
        }
    }
    if (!isNull(events)) {
        for (var name in events) {
            // do not add a hasOwnProperty check here, it affects performance
            patchEvent(name, null, events[name], dom);
        }
    }
    if (!isNull(ref)) {
        mountRef(dom, ref, lifecycle);
    }
    if (!isNull(parentDom)) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountArrayChildren(children, dom, lifecycle, context, isSVG) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        // TODO: Verify can string/number be here. might cause de-opt
        if (!isInvalid(child)) {
            if (child.dom) {
                children[i] = child = cloneVNode(child);
            }
            mount(children[i], dom, lifecycle, context, isSVG);
        }
    }
}
function mountComponent(vNode, parentDom, lifecycle, context, isSVG, isClass) {
    if (options.recyclingEnabled) {
        var dom$1 = recycleComponent(vNode, lifecycle, context, isSVG);
        if (!isNull(dom$1)) {
            if (!isNull(parentDom)) {
                appendChild(parentDom, dom$1);
            }
            return dom$1;
        }
    }
    var type = vNode.type;
    var props = vNode.props || EMPTY_OBJ;
    var defaultProps = type.defaultProps;
    var ref = vNode.ref;
    var dom;
    if (!isUndefined(defaultProps)) {
        copyPropsTo(defaultProps, props);
        vNode.props = props;
    }
    if (isClass) {
        var instance = createClassComponentInstance(vNode, type, props, context, isSVG);
        // If instance does not have componentWillUnmount specified we can enable fastUnmount
        var input = instance._lastInput;
        var prevFastUnmount = lifecycle.fastUnmount;
        // we store the fastUnmount value, but we set it back to true on the lifecycle
        // we do this so we can determine if the component render has a fastUnmount or not
        lifecycle.fastUnmount = true;
        instance._vNode = vNode;
        vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
        // we now create a lifecycle for this component and store the fastUnmount value
        var subLifecycle = instance._lifecycle = new Lifecycle();
        // children lifecycle can fastUnmount if itself does need unmount callback and within its cycle there was none
        subLifecycle.fastUnmount = isUndefined(instance.componentWillUnmount) && lifecycle.fastUnmount;
        // higher lifecycle can fastUnmount only if previously it was able to and this children doesnt have any
        lifecycle.fastUnmount = prevFastUnmount && subLifecycle.fastUnmount;
        if (!isNull(parentDom)) {
            appendChild(parentDom, dom);
        }
        mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
        options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
        vNode.children = instance;
    }
    else {
        var input$1 = createFunctionalComponentInput(vNode, type, props, context);
        vNode.dom = dom = mount(input$1, null, lifecycle, context, isSVG);
        vNode.children = input$1;
        mountFunctionalComponentCallbacks(ref, dom, lifecycle);
        if (!isNull(parentDom)) {
            appendChild(parentDom, dom);
        }
    }
    return dom;
}
function mountClassComponentCallbacks(vNode, ref, instance, lifecycle) {
    if (ref) {
        if (isFunction(ref)) {
            ref(instance);
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                if (isStringOrNumber(ref)) {
                    throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
                }
                else if (isObject(ref) && (vNode.flags & 4 /* ComponentClass */)) {
                    throwError('functional component lifecycle events are not supported on ES2015 class components.');
                }
                else {
                    throwError(("a bad value for \"ref\" was used on component: \"" + (JSON.stringify(ref)) + "\""));
                }
            }
            throwError();
        }
    }
    var cDM = instance.componentDidMount;
    var afterMount = options.afterMount;
    if (!isUndefined(cDM) || !isNull(afterMount)) {
        lifecycle.addListener(function () {
            afterMount && afterMount(vNode);
            cDM && instance.componentDidMount();
        });
    }
}
function mountFunctionalComponentCallbacks(ref, dom, lifecycle) {
    if (ref) {
        if (!isNullOrUndef(ref.onComponentWillMount)) {
            ref.onComponentWillMount();
        }
        if (!isNullOrUndef(ref.onComponentDidMount)) {
            lifecycle.addListener(function () { return ref.onComponentDidMount(dom); });
        }
        if (!isNullOrUndef(ref.onComponentWillUnmount)) {
            lifecycle.fastUnmount = false;
        }
    }
}
function mountRef(dom, value, lifecycle) {
    if (isFunction(value)) {
        lifecycle.fastUnmount = false;
        lifecycle.addListener(function () { return value(dom); });
    }
    else {
        if (isInvalid(value)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
        throwError();
    }
}

function normalizeChildNodes(parentDom) {
    var dom = parentDom.firstChild;
    while (dom) {
        if (dom.nodeType === 8) {
            if (dom.data === '!') {
                var placeholder = document.createTextNode('');
                parentDom.replaceChild(placeholder, dom);
                dom = dom.nextSibling;
            }
            else {
                var lastDom = dom.previousSibling;
                parentDom.removeChild(dom);
                dom = lastDom || parentDom.firstChild;
            }
        }
        else {
            dom = dom.nextSibling;
        }
    }
}
function hydrateComponent(vNode, dom, lifecycle, context, isSVG, isClass) {
    var type = vNode.type;
    var props = vNode.props || EMPTY_OBJ;
    var ref = vNode.ref;
    vNode.dom = dom;
    if (isClass) {
        var _isSVG = dom.namespaceURI === svgNS;
        var defaultProps = type.defaultProps;
        if (!isUndefined(defaultProps)) {
            copyPropsTo(defaultProps, props);
            vNode.props = props;
        }
        var instance = createClassComponentInstance(vNode, type, props, context, _isSVG);
        // If instance does not have componentWillUnmount specified we can enable fastUnmount
        var prevFastUnmount = lifecycle.fastUnmount;
        var input = instance._lastInput;
        // we store the fastUnmount value, but we set it back to true on the lifecycle
        // we do this so we can determine if the component render has a fastUnmount or not
        lifecycle.fastUnmount = true;
        instance._vComponent = vNode;
        instance._vNode = vNode;
        hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
        // we now create a lifecycle for this component and store the fastUnmount value
        var subLifecycle = instance._lifecycle = new Lifecycle();
        // children lifecycle can fastUnmount if itself does need unmount callback and within its cycle there was none
        subLifecycle.fastUnmount = isUndefined(instance.componentWillUnmount) && lifecycle.fastUnmount;
        // higher lifecycle can fastUnmount only if previously it was able to and this children doesnt have any
        lifecycle.fastUnmount = prevFastUnmount && subLifecycle.fastUnmount;
        mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
        options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
        vNode.children = instance;
    }
    else {
        var input$1 = createFunctionalComponentInput(vNode, type, props, context);
        hydrate(input$1, dom, lifecycle, context, isSVG);
        vNode.children = input$1;
        vNode.dom = input$1.dom;
        mountFunctionalComponentCallbacks(ref, dom, lifecycle);
    }
    return dom;
}
function hydrateElement(vNode, dom, lifecycle, context, isSVG) {
    var tag = vNode.type;
    var children = vNode.children;
    var props = vNode.props;
    var events = vNode.events;
    var flags = vNode.flags;
    var ref = vNode.ref;
    if (isSVG || (flags & 128 /* SvgElement */)) {
        isSVG = true;
    }
    if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== tag) {
        if (process.env.NODE_ENV !== 'production') {
            warning(false, 'Inferno hydration: Server-side markup doesn\'t match client-side markup');
        }
        var newDom = mountElement(vNode, null, lifecycle, context, isSVG);
        vNode.dom = newDom;
        replaceChild(dom.parentNode, newDom, dom);
        return newDom;
    }
    vNode.dom = dom;
    if (children) {
        hydrateChildren(children, dom, lifecycle, context, isSVG);
    }
    var hasControlledValue = false;
    if (!(flags & 2 /* HtmlElement */)) {
        hasControlledValue = processElement(flags, vNode, dom);
    }
    if (props) {
        for (var prop in props) {
            patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
        }
    }
    if (events) {
        for (var name in events) {
            patchEvent(name, null, events[name], dom);
        }
    }
    if (ref) {
        mountRef(dom, ref, lifecycle);
    }
    return dom;
}
function hydrateChildren(children, parentDom, lifecycle, context, isSVG) {
    normalizeChildNodes(parentDom);
    var dom = parentDom.firstChild;
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!isNull(child) && isObject(child)) {
                if (dom) {
                    dom = hydrate(child, dom, lifecycle, context, isSVG);
                    dom = dom.nextSibling;
                }
                else {
                    mount(child, parentDom, lifecycle, context, isSVG);
                }
            }
        }
    }
    else if (isStringOrNumber(children)) {
        if (dom && dom.nodeType === 3) {
            if (dom.nodeValue !== children) {
                dom.nodeValue = children;
            }
        }
        else if (children) {
            parentDom.textContent = children;
        }
        dom = dom.nextSibling;
    }
    else if (isObject(children)) {
        hydrate(children, dom, lifecycle, context, isSVG);
        dom = dom.nextSibling;
    }
    // clear any other DOM nodes, there should be only a single entry for the root
    while (dom) {
        var nextSibling = dom.nextSibling;
        parentDom.removeChild(dom);
        dom = nextSibling;
    }
}
function hydrateText(vNode, dom) {
    if (dom.nodeType !== 3) {
        var newDom = mountText(vNode, null);
        vNode.dom = newDom;
        replaceChild(dom.parentNode, newDom, dom);
        return newDom;
    }
    var text = vNode.children;
    if (dom.nodeValue !== text) {
        dom.nodeValue = text;
    }
    vNode.dom = dom;
    return dom;
}
function hydrateVoid(vNode, dom) {
    vNode.dom = dom;
    return dom;
}
function hydrate(vNode, dom, lifecycle, context, isSVG) {
    var flags = vNode.flags;
    if (flags & 28 /* Component */) {
        return hydrateComponent(vNode, dom, lifecycle, context, isSVG, flags & 4 /* ComponentClass */);
    }
    else if (flags & 3970 /* Element */) {
        return hydrateElement(vNode, dom, lifecycle, context, isSVG);
    }
    else if (flags & 1 /* Text */) {
        return hydrateText(vNode, dom);
    }
    else if (flags & 4096 /* Void */) {
        return hydrateVoid(vNode, dom);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError(("hydrate() expects a valid VNode, instead it received an object with the type \"" + (typeof vNode) + "\"."));
        }
        throwError();
    }
}
function hydrateRoot(input, parentDom, lifecycle) {
    var dom = parentDom && parentDom.firstChild;
    if (dom) {
        hydrate(input, dom, lifecycle, {}, false);
        dom = parentDom.firstChild;
        // clear any other DOM nodes, there should be only a single entry for the root
        while (dom = dom.nextSibling) {
            parentDom.removeChild(dom);
        }
        return true;
    }
    return false;
}

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
var roots = [];
var componentToDOMNodeMap = new Map();
options.roots = roots;
function findDOMNode(ref) {
    if (!options.findDOMNodeEnabled) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('findDOMNode() has been disabled, use Inferno.options.findDOMNodeEnabled = true; enabled findDOMNode(). Warning this can significantly impact performance!');
        }
        throwError();
    }
    var dom = ref && ref.nodeType ? ref : null;
    return componentToDOMNodeMap.get(ref) || dom;
}
function getRoot(dom) {
    for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        if (root.dom === dom) {
            return root;
        }
    }
    return null;
}
function setRoot(dom, input, lifecycle) {
    var root = {
        dom: dom,
        input: input,
        lifecycle: lifecycle,
    };
    roots.push(root);
    return root;
}
function removeRoot(root) {
    for (var i = 0; i < roots.length; i++) {
        if (roots[i] === root) {
            roots.splice(i, 1);
            return;
        }
    }
}
if (process.env.NODE_ENV !== 'production') {
    if (isBrowser && document.body === null) {
        warning(false, 'Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.');
    }
}
var documentBody = isBrowser ? document.body : null;
function render(input, parentDom) {
    if (documentBody === parentDom) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
        }
        throwError();
    }
    if (input === NO_OP) {
        return;
    }
    var root = getRoot(parentDom);
    if (isNull(root)) {
        var lifecycle = new Lifecycle();
        if (!isInvalid(input)) {
            if (input.dom) {
                input = cloneVNode(input);
            }
            if (!hydrateRoot(input, parentDom, lifecycle)) {
                mount(input, parentDom, lifecycle, {}, false);
            }
            root = setRoot(parentDom, input, lifecycle);
            lifecycle.trigger();
        }
    }
    else {
        var lifecycle$1 = root.lifecycle;
        lifecycle$1.listeners = [];
        if (isNullOrUndef(input)) {
            unmount(root.input, parentDom, lifecycle$1, false, false);
            removeRoot(root);
        }
        else {
            if (input.dom) {
                input = cloneVNode(input);
            }
            patch(root.input, input, parentDom, lifecycle$1, {}, false, false);
        }
        lifecycle$1.trigger();
        root.input = input;
    }
    if (root) {
        var rootInput = root.input;
        if (rootInput && (rootInput.flags & 28 /* Component */)) {
            return rootInput.children;
        }
    }
}
function createRenderer(_parentDom) {
    var parentDom = _parentDom || null;
    return function renderer(lastInput, nextInput) {
        if (!parentDom) {
            parentDom = lastInput;
        }
        render(nextInput, parentDom);
    };
}

function linkEvent(data, event) {
    return { data: data, event: event };
}

if (process.env.NODE_ENV !== 'production') {
	Object.freeze(EMPTY_OBJ);
	var testFunc = function testFn() {};
	warning(
		(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
		'It looks like you\'re using a minified copy of the development build ' +
		'of Inferno. When deploying Inferno apps to production, make sure to use ' +
		'the production build which skips development warnings and is faster. ' +
		'See http://infernojs.org for more details.'
	);
}

// This will be replaced by rollup
var version = '1.2.1';

// we duplicate it so it plays nicely with different module loading systems
var index = {
	linkEvent: linkEvent,
	// core shapes
	createVNode: createVNode,

	// cloning
	cloneVNode: cloneVNode,

	// used to shared common items between Inferno libs
	NO_OP: NO_OP,
	EMPTY_OBJ: EMPTY_OBJ,

	// DOM
	render: render,
	findDOMNode: findDOMNode,
	createRenderer: createRenderer,
	options: options,
	version: version
};

exports['default'] = index;
exports.linkEvent = linkEvent;
exports.createVNode = createVNode;
exports.cloneVNode = cloneVNode;
exports.NO_OP = NO_OP;
exports.EMPTY_OBJ = EMPTY_OBJ;
exports.render = render;
exports.findDOMNode = findDOMNode;
exports.createRenderer = createRenderer;
exports.options = options;
exports.version = version;

Object.defineProperty(exports, '__esModule', { value: true });

})));

}).call(this,require('_process'))

},{"_process":144}],91:[function(require,module,exports){
module.exports = require('./dist/inferno.node');
module.exports.default = module.exports;
},{"./dist/inferno.node":90}],92:[function(require,module,exports){

module.exports = function load (src, opts, cb) {
  var head = document.head || document.getElementsByTagName('head')[0]
  var script = document.createElement('script')

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  cb = cb || function() {}

  script.type = opts.type || 'text/javascript'
  script.charset = opts.charset || 'utf8';
  script.async = 'async' in opts ? !!opts.async : true
  script.src = src

  if (opts.attrs) {
    setAttributes(script, opts.attrs)
  }

  if (opts.text) {
    script.text = '' + opts.text
  }

  var onend = 'onload' in script ? stdOnEnd : ieOnEnd
  onend(script, cb)

  // some good legacy browsers (firefox) fail the 'in' detection above
  // so as a fallback we always set onload
  // old IE will ignore this and new IE will set onload
  if (!script.onload) {
    stdOnEnd(script, cb);
  }

  head.appendChild(script)
}

function setAttributes(script, attrs) {
  for (var attr in attrs) {
    script.setAttribute(attr, attrs[attr]);
  }
}

function stdOnEnd (script, cb) {
  script.onload = function () {
    this.onerror = this.onload = null
    cb(null, script)
  }
  script.onerror = function () {
    // this.onload = null here is necessary
    // because even IE9 works not like others
    this.onerror = this.onload = null
    cb(new Error('Failed to load ' + this.src), script)
  }
}

function ieOnEnd (script, cb) {
  script.onreadystatechange = function () {
    if (this.readyState != 'complete' && this.readyState != 'loaded') return
    this.onreadystatechange = null
    cb(null, script) // there is no way to catch loading errors in IE8
  }
}

},{}],93:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],94:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":124}],95:[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],96:[function(require,module,exports){
var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isIndex = require('./_isIndex'),
    isTypedArray = require('./isTypedArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;

},{"./_baseTimes":107,"./_isIndex":118,"./isArguments":129,"./isArray":130,"./isBuffer":132,"./isTypedArray":139}],97:[function(require,module,exports){
/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],98:[function(require,module,exports){
/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

module.exports = asciiToArray;

},{}],99:[function(require,module,exports){
var baseForOwn = require('./_baseForOwn'),
    createBaseEach = require('./_createBaseEach');

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;

},{"./_baseForOwn":101,"./_createBaseEach":112}],100:[function(require,module,exports){
var createBaseFor = require('./_createBaseFor');

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"./_createBaseFor":113}],101:[function(require,module,exports){
var baseFor = require('./_baseFor'),
    keys = require('./keys');

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

},{"./_baseFor":100,"./keys":140}],102:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":94,"./_getRawTag":116,"./_objectToString":122}],103:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;

},{"./_baseGetTag":102,"./isObjectLike":136}],104:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isLength = require('./isLength'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;

},{"./_baseGetTag":102,"./isLength":134,"./isObjectLike":136}],105:[function(require,module,exports){
var isPrototype = require('./_isPrototype'),
    nativeKeys = require('./_nativeKeys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;

},{"./_isPrototype":119,"./_nativeKeys":120}],106:[function(require,module,exports){
/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;

},{}],107:[function(require,module,exports){
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;

},{}],108:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    arrayMap = require('./_arrayMap'),
    isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;

},{"./_Symbol":94,"./_arrayMap":97,"./isArray":130,"./isSymbol":138}],109:[function(require,module,exports){
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;

},{}],110:[function(require,module,exports){
var identity = require('./identity');

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : identity;
}

module.exports = castFunction;

},{"./identity":128}],111:[function(require,module,exports){
var baseSlice = require('./_baseSlice');

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

module.exports = castSlice;

},{"./_baseSlice":106}],112:[function(require,module,exports){
var isArrayLike = require('./isArrayLike');

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;

},{"./isArrayLike":131}],113:[function(require,module,exports){
/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{}],114:[function(require,module,exports){
var castSlice = require('./_castSlice'),
    hasUnicode = require('./_hasUnicode'),
    stringToArray = require('./_stringToArray'),
    toString = require('./toString');

/**
 * Creates a function like `_.lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function createCaseFirst(methodName) {
  return function(string) {
    string = toString(string);

    var strSymbols = hasUnicode(string)
      ? stringToArray(string)
      : undefined;

    var chr = strSymbols
      ? strSymbols[0]
      : string.charAt(0);

    var trailing = strSymbols
      ? castSlice(strSymbols, 1).join('')
      : string.slice(1);

    return chr[methodName]() + trailing;
  };
}

module.exports = createCaseFirst;

},{"./_castSlice":111,"./_hasUnicode":117,"./_stringToArray":125,"./toString":142}],115:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],116:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":94}],117:[function(require,module,exports){
/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

module.exports = hasUnicode;

},{}],118:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],119:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;

},{}],120:[function(require,module,exports){
var overArg = require('./_overArg');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;

},{"./_overArg":123}],121:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

},{"./_freeGlobal":115}],122:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],123:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],124:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":115}],125:[function(require,module,exports){
var asciiToArray = require('./_asciiToArray'),
    hasUnicode = require('./_hasUnicode'),
    unicodeToArray = require('./_unicodeToArray');

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

module.exports = stringToArray;

},{"./_asciiToArray":98,"./_hasUnicode":117,"./_unicodeToArray":126}],126:[function(require,module,exports){
/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

module.exports = unicodeToArray;

},{}],127:[function(require,module,exports){
var arrayEach = require('./_arrayEach'),
    baseEach = require('./_baseEach'),
    castFunction = require('./_castFunction'),
    isArray = require('./isArray');

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray(collection) ? arrayEach : baseEach;
  return func(collection, castFunction(iteratee));
}

module.exports = forEach;

},{"./_arrayEach":95,"./_baseEach":99,"./_castFunction":110,"./isArray":130}],128:[function(require,module,exports){
/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],129:[function(require,module,exports){
var baseIsArguments = require('./_baseIsArguments'),
    isObjectLike = require('./isObjectLike');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;

},{"./_baseIsArguments":103,"./isObjectLike":136}],130:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],131:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

},{"./isFunction":133,"./isLength":134}],132:[function(require,module,exports){
var root = require('./_root'),
    stubFalse = require('./stubFalse');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

},{"./_root":124,"./stubFalse":141}],133:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObject = require('./isObject');

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

},{"./_baseGetTag":102,"./isObject":135}],134:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],135:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],136:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],137:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isArray = require('./isArray'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

module.exports = isString;

},{"./_baseGetTag":102,"./isArray":130,"./isObjectLike":136}],138:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;

},{"./_baseGetTag":102,"./isObjectLike":136}],139:[function(require,module,exports){
var baseIsTypedArray = require('./_baseIsTypedArray'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;

},{"./_baseIsTypedArray":104,"./_baseUnary":109,"./_nodeUtil":121}],140:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeys = require('./_baseKeys'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

},{"./_arrayLikeKeys":96,"./_baseKeys":105,"./isArrayLike":131}],141:[function(require,module,exports){
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;

},{}],142:[function(require,module,exports){
var baseToString = require('./_baseToString');

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

},{"./_baseToString":108}],143:[function(require,module,exports){
var createCaseFirst = require('./_createCaseFirst');

/**
 * Converts the first character of `string` to upper case.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.upperFirst('fred');
 * // => 'Fred'
 *
 * _.upperFirst('FRED');
 * // => 'FRED'
 */
var upperFirst = createCaseFirst('toUpperCase');

module.exports = upperFirst;

},{"./_createCaseFirst":114}],144:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],145:[function(require,module,exports){
(function (global){
// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g =
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./runtime":146}],146:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = arg;

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":144}],147:[function(require,module,exports){
(function (global){
/**
* @link https://github.com/gajus/sister for the canonical source repository
* @license https://github.com/gajus/sister/blob/master/LICENSE BSD 3-Clause
*/
function Sister () {
    var sister = {},
        events = {};

    /**
     * @name handler
     * @function
     * @param {Object} data Event data.
     */

    /**
     * @param {String} name Event name.
     * @param {handler} handler
     * @return {listener}
     */
    sister.on = function (name, handler) {
        var listener = {name: name, handler: handler};
        events[name] = events[name] || [];
        events[name].unshift(listener);
        return listener;
    };

    /**
     * @param {listener}
     */
    sister.off = function (listener) {
        var index = events[listener.name].indexOf(listener);

        if (index != -1) {
            events[listener.name].splice(index, 1);
        }
    };

    /**
     * @param {String} name Event name.
     * @param {Object} data Event data.
     */
    sister.trigger = function (name, data) {
        var listeners = events[name],
            i;

        if (listeners) {
            i = listeners.length;
            while (i--) {
                listeners[i].handler(data);
            }
        }
    };

    return sister;
}

global.gajus = global.gajus || {};
global.gajus.Sister = Sister;

module.exports = Sister;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],148:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _upperFirst2 = require('lodash/upperFirst');

var _upperFirst3 = _interopRequireDefault(_upperFirst2);

var _forEach2 = require('lodash/forEach');

var _forEach3 = _interopRequireDefault(_forEach2);

var _functionNames = require('./functionNames');

var _functionNames2 = _interopRequireDefault(_functionNames);

var _eventNames = require('./eventNames');

var _eventNames2 = _interopRequireDefault(_eventNames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var YouTubePlayer = {};

/**
 * Construct an object that defines an event handler for all of the YouTube
 * player events. Proxy captured events through an event emitter.
 *
 * @todo Capture event parameters.
 * @see https://developers.google.com/youtube/iframe_api_reference#Events
 * @param {Sister} emitter
 * @returns {Object}
 */
YouTubePlayer.proxyEvents = function (emitter) {
  var events = {};

  (0, _forEach3.default)(_eventNames2.default, function (eventName) {
    var onEventName = 'on' + (0, _upperFirst3.default)(eventName);

    events[onEventName] = function (event) {
      emitter.trigger(eventName, event);
    };
  });

  return events;
};

/**
 * Delays player API method execution until player state is ready.
 *
 * @todo Proxy all of the methods using Object.keys.
 * @todo See TRICKY below.
 * @param {Promise} playerAPIReady Promise that resolves when player is ready.
 * @returns {Object}
 */
YouTubePlayer.promisifyPlayer = function (playerAPIReady) {
  var functions = {};

  (0, _forEach3.default)(_functionNames2.default, function (functionName) {
    functions[functionName] = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var player;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return playerAPIReady;

            case 2:
              player = _context.sent;
              return _context.abrupt('return', player[functionName].apply(player, args));

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));
  });

  return functions;
};

exports.default = YouTubePlayer;
module.exports = exports['default'];
},{"./eventNames":149,"./functionNames":150,"babel-runtime/helpers/asyncToGenerator":22,"babel-runtime/regenerator":23,"lodash/forEach":127,"lodash/upperFirst":143}],149:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @see https://developers.google.com/youtube/iframe_api_reference#Events
 */
exports.default = ['ready', 'stateChange', 'playbackQualityChange', 'playbackRateChange', 'error', 'apiChange'];
module.exports = exports['default'];
},{}],150:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @see https://developers.google.com/youtube/iframe_api_reference#Functions
 */
exports.default = ['cueVideoById', 'loadVideoById', 'cueVideoByUrl', 'loadVideoByUrl', 'playVideo', 'pauseVideo', 'stopVideo', 'clearVideo', 'getVideoBytesLoaded', 'getVideoBytesTotal', 'getVideoLoadedFraction', 'getVideoStartBytes', 'cuePlaylist', 'loadPlaylist', 'nextVideo', 'previousVideo', 'playVideoAt', 'setShuffle', 'setLoop', 'getPlaylist', 'getPlaylistIndex', 'getPlaylistId', 'loadModule', 'unloadModule', 'setOption', 'mute', 'unMute', 'isMuted', 'setVolume', 'getVolume', 'seekTo', 'getPlayerState', 'getPlaybackRate', 'setPlaybackRate', 'getAvailablePlaybackRates', 'getPlaybackQuality', 'setPlaybackQuality', 'getAvailableQualityLevels', 'getCurrentTime', 'getDuration', 'removeEventListener', 'getVideoUrl', 'getDebugText', 'getVideoData', 'addCueRange', 'removeCueRange', 'getApiInterface', 'showVideoInfo', 'hideVideoInfo', 'G', 'C', 'R', 'aa', '$', 'Z', 'getVideoEmbedCode', 'getOptions', 'getOption', 'Y', 'X', 'addEventListener', 'destroy', 'A', 'P', 'J', 'setSize', 'getIframe'];
module.exports = exports['default'];
},{}],151:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _sister = require('sister');

var _sister2 = _interopRequireDefault(_sister);

var _loadYouTubeIframeApi = require('./loadYouTubeIframeApi');

var _loadYouTubeIframeApi2 = _interopRequireDefault(_loadYouTubeIframeApi);

var _YouTubePlayer = require('./YouTubePlayer');

var _YouTubePlayer2 = _interopRequireDefault(_YouTubePlayer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @typedef options
 * @see https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
 * @param {Number} width
 * @param {Number} height
 * @param {String} videoId
 * @param {Object} playerVars
 * @param {Object} events
 */
var youtubeIframeAPI = void 0;

/**
 * A factory function used to produce an instance of YT.Player and queue function calls and proxy events of the resulting object.
 *
 * @param {HTMLElement|String} elementId Either the DOM element or the id of the HTML element where the API will insert an <iframe>.
 * @param {YouTubePlayer~options} options
 * @returns {Object}
 */

exports.default = function (elementId) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var emitter = (0, _sister2.default)();

  if (!youtubeIframeAPI) {
    youtubeIframeAPI = (0, _loadYouTubeIframeApi2.default)();
  }

  if (options.events) {
    throw new Error('Event handlers cannot be overwritten.');
  }

  if ((0, _isString3.default)(elementId) && !document.getElementById(elementId)) {
    throw new Error('Element "' + elementId + '" does not exist.');
  }

  options.events = _YouTubePlayer2.default.proxyEvents(emitter);

  var playerAPIReady = new _promise2.default(function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve) {
      var YT, player;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return youtubeIframeAPI;

            case 2:
              YT = _context.sent;
              player = new YT.Player(elementId, options);


              emitter.on('ready', function () {
                resolve(player);
              });

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x2) {
      return _ref.apply(this, arguments);
    };
  }());

  var playerAPI = _YouTubePlayer2.default.promisifyPlayer(playerAPIReady);

  playerAPI.on = emitter.on;
  playerAPI.off = emitter.off;

  return playerAPI;
};

module.exports = exports['default'];
},{"./YouTubePlayer":148,"./loadYouTubeIframeApi":152,"babel-runtime/core-js/promise":21,"babel-runtime/helpers/asyncToGenerator":22,"babel-runtime/regenerator":23,"lodash/isString":137,"sister":147}],152:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _loadScript = require('load-script');

var _loadScript2 = _interopRequireDefault(_loadScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  /**
   * A promise that is resolved when window.onYouTubeIframeAPIReady is called.
   * The promise is resolved with a reference to window.YT object.
   *
   * @param {Function} resolve
   * @member {Object} iframeAPIReady
   */
  var iframeAPIReady = new _promise2.default(function (resolve) {
    if (window.YT && window.YT.Player && window.YT.Player instanceof Function) {
      resolve(window.YT);

      return;
    }

    var previous = window.onYouTubeIframeAPIReady;

    // The API will call this function when page has finished downloading
    // the JavaScript for the player API.
    window.onYouTubeIframeAPIReady = function () {
      if (previous) {
        previous();
      }

      resolve(window.YT);
    };
  });
  var protocol = window.location.protocol === 'http:' ? 'http:' : 'https:';

  (0, _loadScript2.default)(protocol + '//www.youtube.com/iframe_api');

  return iframeAPIReady;
};

module.exports = exports['default'];
},{"babel-runtime/core-js/promise":21,"load-script":92}],153:[function(require,module,exports){
module.exports={
  "etag": "",
  "items": [
    {
      "id":  "UCAZ77vdqYbuGbCAWB62WbqQ",
      "title": "Channel 1",
      "thumbnails": {
        "high": {
          "url": "http://placehold.it/150x150"
        }
      }
    },
    {
      "id":  "UCAZ77vdqYbuGbCAWB62WbqQ",
      "title": "Channel 2",
      "thumbnails": {
        "high": {
          "url": "http://placehold.it/150x150"
        }
      }
    },
    {
      "id":  "UCAZ77vdqYbuGbCAWB62WbqQ",
      "title": "Channel 3",
      "thumbnails": {
        "high": {
          "url": "http://placehold.it/150x150"
        }
      }
    },
    {
      "id":  "UCAZ77vdqYbuGbCAWB62WbqQ",
      "title": "Channel 4",
      "thumbnails": {
        "high": {
          "url": "http://placehold.it/150x150"
        }
      }
    },
    {
      "id":  "UCAZ77vdqYbuGbCAWB62WbqQ",
      "title": "Channel 5",
      "thumbnails": {
        "high": {
          "url": "http://placehold.it/150x150"
        }
      }
    },
    {
      "id":  "UCAZ77vdqYbuGbCAWB62WbqQ",
      "title": "Channel 6",
      "thumbnails": {
        "high": {
          "url": "http://placehold.it/150x150"
        }
      }
    },
  ],
  "nextPageToken": "",
  "pageInfo": {
    "resultsPerPage": "",
    "totalResults": ""
  }
}

},{}],154:[function(require,module,exports){
module.exports={
  "items": [
    {
      "videoId": "Cz0LNu7o9p8",
      "title": "Eliran Ben Ishai - Travelling Far in Short Strides"
    },

    {
      "videoId": "eljpUhflqGY",
      "title": "Beat Plastic - Automatic"
    },

    {
      "videoId": "OuutLGugZ0Y",
      "title": "Nathan Dandy - Cat Vision"
    },

    {
      "videoId": "vezZ56aCQZQ",
      "title": "Juno Dreams - Be With Me"
    },

    {
      "videoId": "2MyAFIXl5qo",
      "title": "Waveshaper - Future Vision"
    },

    {
      "videoId": "Cz0LNu7o9p8",
      "title": "Eliran Ben Ishai - Travelling Far in Short Strides"
    },

    {
      "videoId": "eljpUhflqGY",
      "title": "Beat Plastic - Automatic"
    },

    {
      "videoId": "OuutLGugZ0Y",
      "title": "Nathan Dandy - Cat Vision"
    },

    {
      "videoId": "vezZ56aCQZQ",
      "title": "Juno Dreams - Be With Me"
    },

    {
      "videoId": "2MyAFIXl5qo",
      "title": "Waveshaper - Future Vision"
    },

    {
      "videoId": "Cz0LNu7o9p8",
      "title": "Eliran Ben Ishai - Travelling Far in Short Strides"
    },

    {
      "videoId": "eljpUhflqGY",
      "title": "Beat Plastic - Automatic"
    },

    {
      "videoId": "OuutLGugZ0Y",
      "title": "Nathan Dandy - Cat Vision"
    },

    {
      "videoId": "vezZ56aCQZQ",
      "title": "Juno Dreams - Be With Me"
    },

    {
      "videoId": "2MyAFIXl5qo",
      "title": "Waveshaper - Future Vision"
    },

    {
      "videoId": "Cz0LNu7o9p8",
      "title": "Eliran Ben Ishai - Travelling Far in Short Strides"
    },

    {
      "videoId": "eljpUhflqGY",
      "title": "Beat Plastic - Automatic"
    },

    {
      "videoId": "OuutLGugZ0Y",
      "title": "Nathan Dandy - Cat Vision"
    },

    {
      "videoId": "vezZ56aCQZQ",
      "title": "Juno Dreams - Be With Me"
    },

    {
      "videoId": "2MyAFIXl5qo",
      "title": "Waveshaper - Future Vision"
    }
  ],
  "nextPageToken": "",
  "pageInfo": {
    "resultsPerPage": "",
    "totalResults": ""
  }
}

},{}],155:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var channels = require('../fixtures/channels');
var videos = require('../fixtures/videos');

function getContent(q) {
  return Promise.resolve(channels);
}

function getPlaylist() {
  return Promise.resolve(videos);
}

function getPlaylistsByChannel() {
  return Promise.resolve(channels);
}

exports.getContent = getContent;
exports.getPlaylist = getPlaylist;
exports.getPlaylistsByChannel = getPlaylistsByChannel;

},{"../fixtures/channels":153,"../fixtures/videos":154}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvYXBpL2luZGV4LmpzIiwiYXBwL2NvbXBvbmVudHMvQ2hhbm5lbEdyaWQuanMiLCJhcHAvY29tcG9uZW50cy9DaGFubmVsSXRlbS5qcyIsImFwcC9jb21wb25lbnRzL0NvbnRlbnRUeXBlU2VsZWN0aW9uLmpzIiwiYXBwL2NvbXBvbmVudHMvTmF2LmpzIiwiYXBwL2NvbXBvbmVudHMvUGxheWVyLmpzIiwiYXBwL2NvbXBvbmVudHMvUGxheWVyQ29udHJvbHMuanMiLCJhcHAvY29tcG9uZW50cy9QbGF5bGlzdC5qcyIsImFwcC9jb21wb25lbnRzL1BsYXlsaXN0R3JpZC5qcyIsImFwcC9jb21wb25lbnRzL1BsYXlsaXN0SXRlbS5qcyIsImFwcC9jb21wb25lbnRzL1NlYXJjaEJhci5qcyIsImFwcC9jb25zdGFudHMvQXBwQ29uc3RhbnRzLmpzIiwiYXBwL2NvbnN0YW50cy9Db250ZW50VHlwZS5qcyIsImFwcC9jb25zdGFudHMvUGxheWVyU3RhdGUuanMiLCJhcHAvY29uc3RhbnRzL1NlYXJjaFR5cGUuanMiLCJhcHAvY29udGFpbmVycy9BcHBDb250YWluZXIuanMiLCJhcHAvaGVscGVycy9hcGlCcmlkZ2UuanMiLCJhcHAvaW5kZXguanMiLCJhcHBjb25maWcuanNvbiIsImNyZWRlbnRpYWxzLmpzb24iLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2ZhaWxzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGFzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19odG1sLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1zdGVwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2xpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21pY3JvdGFzay5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHBzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ3BvLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLWFsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Rhc2suanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9pbmZlcm5vLWNvbXBvbmVudC9pbmZlcm5vLWNvbXBvbmVudC5qcyIsIm5vZGVfbW9kdWxlcy9pbmZlcm5vL2Rpc3QvaW5mZXJuby1jb21wb25lbnQubm9kZS5qcyIsIm5vZGVfbW9kdWxlcy9pbmZlcm5vL2Rpc3QvaW5mZXJuby5ub2RlLmpzIiwibm9kZV9tb2R1bGVzL2luZmVybm8vaW5mZXJuby5qcyIsIm5vZGVfbW9kdWxlcy9sb2FkLXNjcmlwdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUVhY2guanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUxpa2VLZXlzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlNYXAuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19hc2NpaVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlRWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VGb3IuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlRm9yT3duLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc1R5cGVkQXJyYXkuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VTbGljZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VUaW1lcy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VVbmFyeS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nhc3RGdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nhc3RTbGljZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2NyZWF0ZUJhc2VFYWNoLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY3JlYXRlQmFzZUZvci5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2NyZWF0ZUNhc2VGaXJzdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2ZyZWVHbG9iYWwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRSYXdUYWcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19oYXNVbmljb2RlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9faXNJbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzUHJvdG90eXBlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlS2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX25vZGVVdGlsLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fb2JqZWN0VG9TdHJpbmcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vdmVyQXJnLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0cmluZ1RvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL191bmljb2RlVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvZm9yRWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaWRlbnRpdHkuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNCdWZmZXIuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzRnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzTGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNTeW1ib2wuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzVHlwZWRBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkZhbHNlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC90b1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvdXBwZXJGaXJzdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLW1vZHVsZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvc2lzdGVyL3NyYy9zaXN0ZXIuanMiLCJub2RlX21vZHVsZXMveW91dHViZS1wbGF5ZXIvZGlzdC9Zb3VUdWJlUGxheWVyLmpzIiwibm9kZV9tb2R1bGVzL3lvdXR1YmUtcGxheWVyL2Rpc3QvZXZlbnROYW1lcy5qcyIsIm5vZGVfbW9kdWxlcy95b3V0dWJlLXBsYXllci9kaXN0L2Z1bmN0aW9uTmFtZXMuanMiLCJub2RlX21vZHVsZXMveW91dHViZS1wbGF5ZXIvZGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy95b3V0dWJlLXBsYXllci9kaXN0L2xvYWRZb3VUdWJlSWZyYW1lQXBpLmpzIiwidGVzdC9maXh0dXJlcy9jaGFubmVscy5qc29uIiwidGVzdC9maXh0dXJlcy92aWRlb3MuanNvbiIsInRlc3QvaGVscGVycy9hcGlGaXh0dXJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0NBOzs7O0FBQ0E7Ozs7OztBQUZBLElBQU0sTUFBTSxRQUFRLG1CQUFSLEVBQTZCLEdBQXpDOzs7QUFJQSxJQUFNLGlEQUFOOztBQUVBLFNBQVMsVUFBVCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixFQUFpRDtBQUFBLE1BQWhCLFNBQWdCLHVFQUFKLEVBQUk7O0FBQy9DLE1BQU0sV0FBVyxRQUFqQjtBQUNBLE1BQUksK0JBQTZCLEdBQTdCLGNBQXlDLElBQTdDO0FBQ0EsNkJBQXlCLHVCQUFhLG1CQUF0QztBQUNBLE1BQUksTUFBUyxPQUFULFNBQW9CLFFBQXBCLFNBQWdDLE1BQWhDLFdBQTRDLEtBQWhEOztBQUVBLE1BQUksY0FBYyxFQUFsQixFQUFzQjtBQUNwQiwyQkFBcUIsU0FBckI7QUFDRDs7QUFFRCxTQUFPLE1BQU0sR0FBTixFQUNKLElBREksQ0FDQztBQUFBLFdBQU8sSUFBSSxJQUFKLEVBQVA7QUFBQSxHQURELEVBRUosSUFGSSxDQUVDLGdCQUFRO0FBQ1osUUFBTSxRQUFRLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxnQkFBUTtBQUNuQyxhQUFPO0FBQ0wsWUFBSSxLQUFLLEVBQUwsQ0FBVyxJQUFYLFFBREM7QUFFTCxlQUFPLEtBQUssT0FBTCxDQUFhLEtBRmY7QUFHTCxvQkFBWSxLQUFLLE9BQUwsQ0FBYSxVQUhwQjtBQUlMLG1CQUFXLEtBQUssT0FBTCxDQUFhLFNBSm5CO0FBS0wsc0JBQWMsS0FBSyxPQUFMLENBQWE7QUFMdEIsT0FBUDtBQU9ELEtBUmEsQ0FBZDs7QUFVQSxRQUFNLFVBQVUsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixJQUFsQixFQUF3QixFQUFDLFlBQUQsRUFBeEIsQ0FBaEI7QUFDQSxXQUFPLE9BQVA7QUFDRCxHQWZJLENBQVA7QUFnQkQ7O0FBRUQsU0FBUyxxQkFBVCxDQUErQixTQUEvQixFQUEwRDtBQUFBLE1BQWhCLFNBQWdCLHVFQUFKLEVBQUk7O0FBQ3hELE1BQU0sV0FBVyxXQUFqQjtBQUNBLE1BQUksK0JBQTZCLEdBQWpDO0FBQ0EsNkJBQXlCLHVCQUFhLG1CQUF0QztBQUNBLE1BQUksTUFBUyxPQUFULFNBQW9CLFFBQXBCLFNBQWdDLE1BQWhDLG1CQUFvRCxTQUF4RDs7QUFFQSxNQUFJLGNBQWMsRUFBbEIsRUFBc0I7QUFDcEIsMkJBQXFCLFNBQXJCO0FBQ0Q7O0FBRUQsU0FBTyxNQUFNLEdBQU4sRUFDSixJQURJLENBQ0M7QUFBQSxXQUFPLElBQUksSUFBSixFQUFQO0FBQUEsR0FERCxFQUVKLElBRkksQ0FFQyxnQkFBUTtBQUNaLFFBQU0sUUFBUSxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsZ0JBQVE7QUFDbkMsYUFBTztBQUNMLFlBQUksS0FBSyxFQURKO0FBRUwsZUFBTyxLQUFLLE9BQUwsQ0FBYSxLQUZmO0FBR0wscUJBQWEsS0FBSyxPQUFMLENBQWEsV0FIckI7QUFJTCxvQkFBWSxLQUFLLE9BQUwsQ0FBYSxVQUpwQjtBQUtMLHNCQUFjLEtBQUssT0FBTCxDQUFhLFlBTHRCO0FBTUwsbUJBQVcsS0FBSyxPQUFMLENBQWE7QUFObkIsT0FBUDtBQVFELEtBVGEsQ0FBZDtBQVVBLFFBQU0sVUFBVSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLElBQWxCLEVBQXdCLEVBQUMsWUFBRCxFQUF4QixDQUFoQjtBQUNBLFdBQU8sT0FBUDtBQUNELEdBZkksQ0FBUDtBQWdCRDs7QUFFRCxTQUFTLGdCQUFULEdBQTRCO0FBQzFCLE1BQU0sV0FBVyxlQUFqQjtBQUNBLE1BQU0sb0JBQWtCLEdBQXhCO0FBQ0EsTUFBTSxxQkFBTjtBQUNBLE1BQUksU0FBWSxJQUFaLG9CQUErQix1QkFBYSwwQkFBaEQ7QUFDQSw2QkFBeUIsUUFBekI7O0FBRUEsU0FBVSxPQUFWLFNBQXFCLFFBQXJCLFNBQWlDLE1BQWpDO0FBQ0Q7O0FBRUQsU0FBUyxXQUFULENBQXFCLEVBQXJCLEVBQXlCLElBQXpCLEVBQStCLFNBQS9CLEVBQTBDO0FBQ3hDLE1BQUksU0FBUyxzQkFBWSxPQUF6QixFQUFrQztBQUNoQyxXQUFPLG1CQUFtQixFQUFuQixFQUNKLElBREksQ0FDQztBQUFBLGFBQWEsaUJBQWlCLFNBQWpCLEVBQTRCLFNBQTVCLENBQWI7QUFBQSxLQURELENBQVA7QUFFRCxHQUhELE1BR087QUFDTCxXQUFPLGlCQUFpQixFQUFqQixFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRjs7QUFFRCxTQUFTLGdCQUFULENBQTBCLEVBQTFCLEVBQThCLFNBQTlCLEVBQXlDO0FBQ3ZDLFNBQU8sbUJBQW1CLEVBQW5CLEVBQXVCLFNBQXZCLENBQVA7QUFDRDs7QUFFRCxTQUFTLGtCQUFULENBQTRCLEVBQTVCLEVBQWdDLFNBQWhDLEVBQTJDO0FBQ3pDLE1BQU0sTUFBUyxrQkFBVCxvQkFBMEMsRUFBaEQ7QUFDQSxNQUFJLFNBQVUsU0FBRCxHQUNOLEdBRE0sbUJBQ1csU0FEWCxHQUVULEdBRko7O0FBSUEsU0FBTyxNQUFNLE1BQU4sRUFDSixJQURJLENBQ0M7QUFBQSxXQUFPLElBQUksSUFBSixFQUFQO0FBQUEsR0FERCxFQUVKLElBRkksQ0FFQyxnQkFBUTtBQUNaLFFBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsZ0JBQVE7QUFDakMsYUFBTztBQUNMLGVBQU8sS0FBSyxPQUFMLENBQWEsS0FEZjtBQUVMLGlCQUFTLEtBQUssT0FBTCxDQUFhLFVBQWIsQ0FBd0IsT0FGNUI7QUFHTCxvQkFBWSxLQUFLLE9BQUwsQ0FBYTtBQUhwQixPQUFQO0FBS0QsS0FOVyxDQUFaOztBQVFBLFFBQU0sVUFBVSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLElBQWxCLEVBQXdCLEVBQUMsWUFBRCxFQUFRLFlBQVksRUFBcEIsRUFBeEIsQ0FBaEI7QUFDQSxXQUFPLE9BQVA7QUFDRCxHQWJJLENBQVA7QUFjRDs7QUFFRDs7O0FBR0EsU0FBUyx3QkFBVCxDQUFrQyxFQUFsQyxFQUFtRTtBQUFBLE1BQTdCLE9BQTZCLHVFQUFuQixFQUFtQjtBQUFBLE1BQWYsYUFBZTs7QUFDakUsTUFBTSxNQUFTLGtCQUFULG9CQUEwQyxFQUFoRDtBQUNBLE1BQUksU0FBVSxhQUFELEdBQ04sR0FETSxtQkFDVyxhQURYLEdBRVQsR0FGSjs7QUFJQSxTQUFPLE1BQU0sTUFBTixFQUNKLElBREksQ0FDQztBQUFBLFdBQU8sSUFBSSxJQUFKLEVBQVA7QUFBQSxHQURELEVBRUosSUFGSSxDQUVDLGdCQUFROztBQUVaLFFBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsZ0JBQVE7QUFDakMsYUFBTztBQUNMLGVBQU8sS0FBSyxPQUFMLENBQWEsS0FEZjtBQUVMLGlCQUFTLEtBQUssT0FBTCxDQUFhLFVBQWIsQ0FBd0IsT0FGNUI7QUFHTCxvQkFBWSxLQUFLLE9BQUwsQ0FBYTtBQUhwQixPQUFQO0FBS0QsS0FOVyxDQUFaOztBQVFBLGNBQVUsUUFBUSxNQUFSLENBQWUsS0FBZixDQUFWOztBQUVBLFFBQUksS0FBSyxhQUFULEVBQXdCO0FBQ3RCLGFBQU8seUJBQXlCLEdBQXpCLEVBQThCLE9BQTlCLEVBQXVDLEtBQUssYUFBNUMsQ0FBUDtBQUNELEtBRkQsTUFFTztBQUNMLFVBQU0sVUFBVSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLElBQWxCLEVBQXdCLEVBQUMsT0FBTyxPQUFSLEVBQXhCLENBQWhCO0FBQ0EsYUFBTyxPQUFQO0FBQ0Q7QUFDRixHQXBCSSxDQUFQO0FBcUJEOztBQUVEOzs7O0FBSUEsU0FBUyxrQkFBVCxDQUE0QixFQUE1QixFQUFnQztBQUM5QixNQUFNLHFDQUFtQyxFQUFuQyxhQUE2QyxHQUFuRDtBQUNBLE1BQU0sTUFBUyxPQUFULGtCQUE2QixNQUFuQztBQUNBLFNBQU8sTUFBTSxHQUFOLEVBQ0osSUFESSxDQUNDO0FBQUEsV0FBTyxJQUFJLElBQUosRUFBUDtBQUFBLEdBREQsRUFFSixJQUZJLENBRUMsZ0JBQVE7QUFDWixXQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxjQUFkLENBQTZCLGdCQUE3QixDQUE4QyxPQUFyRDtBQUNELEdBSkksQ0FBUDtBQUtEOztRQUdDLFcsR0FBQSxXO1FBQ0EsVSxHQUFBLFU7UUFDQSxxQixHQUFBLHFCOzs7Ozs7Ozs7QUM1SkY7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxjQUFjLFNBQWQsV0FBYyxPQUVkO0FBQUEsTUFGaUIsS0FFakIsUUFGaUIsS0FFakI7QUFBQSxNQUZ3QixjQUV4QixRQUZ3QixjQUV4QjtBQUFBLE1BREosa0JBQ0ksUUFESixrQkFDSTtBQUFBLE1BRGdCLGdCQUNoQixRQURnQixnQkFDaEI7QUFBQSxNQURrQyxVQUNsQyxRQURrQyxVQUNsQzs7QUFDSixNQUFNLGlCQUFpQixNQUF2QjtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FHTyxNQUFNLEdBQU4sQ0FBVSxnQkFBUTtBQUNqQjtBQUFBLFlBRVEsS0FBSyxFQUZiO0FBQUEsZUFHVyxLQUFLLEtBSGhCO0FBQUEsb0JBSWdCLEtBQUssVUFKckI7QUFBQSxpQkFLYSxrQkFMYjtBQUFBLDBCQU1zQjtBQU50QjtBQVNELEdBVkEsQ0FIUDtBQUFBLGFBZWU7QUFmZjtBQUFBLGFBZ0JvQixjQWhCcEI7QUFBQSxnQkFnQjZDLENBQUM7QUFoQjlDO0FBQUEsZUFpQmlCO0FBakJqQjtBQXFCRCxDQXpCRDs7a0JBMkJlLFc7Ozs7Ozs7OztBQzlCZjs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNLGNBQWMsU0FBZCxXQUFjLE9BQTBEO0FBQUEsTUFBdkQsRUFBdUQsUUFBdkQsRUFBdUQ7QUFBQSxNQUFuRCxLQUFtRCxRQUFuRCxLQUFtRDtBQUFBLE1BQTVDLFVBQTRDLFFBQTVDLFVBQTRDO0FBQUEsTUFBaEMsUUFBZ0MsUUFBaEMsT0FBZ0M7QUFBQSxNQUF2QixnQkFBdUIsUUFBdkIsZ0JBQXVCOztBQUM1RSxNQUFJLFlBQVksRUFBaEI7QUFDQSxVQUFRLE1BQU0sTUFBTixHQUFlLFNBQWYsR0FDSixNQUFNLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIsRUFBbkIsRUFBdUIsTUFBdkIsQ0FBOEIsS0FBOUIsQ0FESSxHQUVKLEtBRko7QUFHQTtBQUFBLGFBRWU7QUFGZjtBQUFBLFlBR2M7QUFIZDtBQUFBLFdBSWtCLFdBQVcsSUFBWCxDQUFnQjtBQUpsQztBQUFBLGVBRzJCO0FBQUEsYUFBSyxTQUFRLENBQVIsRUFBVyxFQUFYLENBQUw7QUFBQTtBQUgzQjtBQUFBLGFBTWlCO0FBTmpCO0FBQUEsYUFPa0I7QUFQbEIsV0FPeUMsS0FQekM7QUFBQSxhQVFzQjtBQVJ0QjtBQUFBLGVBU21CLGlCQUFpQixJQUFqQixDQUFzQixJQUF0QixFQUE0QixFQUE1QixFQUFnQyxzQkFBWSxPQUE1QztBQVRuQjtBQWlCRCxDQXRCRDs7a0JBd0JlLFc7Ozs7Ozs7OztBQzNCZjs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNLHVCQUF1QixTQUF2QixvQkFBdUIsT0FBMEM7QUFBQSxNQUF2QyxrQkFBdUMsUUFBdkMsa0JBQXVDO0FBQUEsTUFBbkIsWUFBbUIsUUFBbkIsWUFBbUI7O0FBQ3JFLE1BQUksMkJBQUo7QUFBQSxNQUF3QiwwQkFBeEI7QUFDQSx1QkFBcUIsQ0FBQyxRQUFELEVBQVcsV0FBWCxDQUFyQjtBQUNBLHNCQUFvQixDQUFDLFFBQUQsRUFBVyxXQUFYLENBQXBCO0FBQ0EsTUFBSSxpQkFBaUIsc0JBQVksUUFBakMsRUFBMkMsbUJBQW1CLElBQW5CLENBQXdCLFFBQXhCLEVBQTNDLEtBQ0ssSUFBSSxpQkFBaUIsc0JBQVksT0FBakMsRUFBMEMsa0JBQWtCLElBQWxCLENBQXVCLFFBQXZCOztBQUUvQztBQUFBLGFBQ2E7QUFEYjtBQUFBLFlBRWlCLFFBRmpCO0FBQUEsYUFFaUMsbUJBQW1CLElBQW5CLENBQXdCLEdBQXhCO0FBRmpDO0FBQUEsZUFHZSxtQkFBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsRUFBOEIsc0JBQVksUUFBMUM7QUFIZjtBQUFBLFlBT2lCLFFBUGpCO0FBQUEsYUFPaUMsa0JBQWtCLElBQWxCLENBQXVCLEdBQXZCO0FBUGpDO0FBQUEsZUFRZSxtQkFBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsRUFBOEIsc0JBQVksT0FBMUM7QUFSZjtBQWFELENBcEJEOztrQkFzQmUsb0I7Ozs7Ozs7OztBQ3pCZjs7Ozs7O0FBRUEsSUFBTSxNQUFNLFNBQU4sR0FBTSxPQUFrQjtBQUFBLE1BQWYsUUFBZSxRQUFmLFFBQWU7O0FBQzVCO0FBQUEsYUFDYTtBQURiO0FBQUEsYUFFYSxNQUZiO0FBQUEsWUFFeUI7QUFGekI7QUFBQSxhQUlvQjtBQUpwQjtBQUFBLGFBSStDO0FBSi9DLGtCQU9LLFFBUEw7QUFBQSxhQVNlO0FBVGY7QUFjRCxDQWZEOztrQkFpQmUsRzs7Ozs7Ozs7Ozs7QUNuQmYsSUFBTSxTQUFTLFNBQVQsTUFBUyxPQUFxQjtBQUFBLE1BQWxCLFdBQWtCLFFBQWxCLFdBQWtCOztBQUNsQyxNQUFNLGdCQUFnQixjQUFjLFVBQWQsR0FBMkIsRUFBakQ7O0FBRUE7QUFBQSx5QkFDd0I7QUFEeEI7QUFBQTtBQUFBO0FBQUEsVUFHYztBQUhkO0FBU0QsQ0FaRDs7a0JBY2UsTTs7Ozs7Ozs7Ozs7QUNkZixJQUFNLGlCQUFpQixTQUFqQixjQUFpQixPQUVqQjtBQUFBLE1BREosTUFDSSxRQURKLE1BQ0k7QUFBQSxNQURJLFVBQ0osUUFESSxVQUNKO0FBQUEsTUFEZ0IsUUFDaEIsUUFEZ0IsUUFDaEI7QUFBQSxNQUQwQixTQUMxQixRQUQwQixTQUMxQjtBQUFBLE1BRHFDLGlCQUNyQyxRQURxQyxpQkFDckM7QUFBQSxNQUR3RCxjQUN4RCxRQUR3RCxjQUN4RDs7QUFDSixNQUFNLE9BQU8sWUFBWSxHQUFaLEdBQWtCLEdBQS9CO0FBQ0EsTUFBTSxlQUFlLEdBQXJCO0FBQ0EsTUFBTSxtQkFBbUIsb0JBQW9CLEVBQXBCLEdBQXlCLE1BQWxEO0FBQ0E7QUFBQSxhQUNhO0FBRGI7QUFBQSxhQUVjO0FBRmQ7QUFBQSxhQUdnQjtBQUhoQjtBQUFBLGFBS3dCO0FBTHhCO0FBQUEsZUFLMkM7QUFMM0M7QUFBQSxhQVN3QjtBQVR4QixLQVNzRCxJQVR0RDtBQUFBLGVBUzJDO0FBVDNDO0FBQUEsYUFhd0I7QUFieEI7QUFBQSxlQWEyQztBQWIzQztBQUFBLGFBaUJpQjtBQWpCakI7QUFBQTtBQUFBO0FBQUEsaUNBb0IwQztBQXBCMUMsS0FxQmEsWUFyQmI7QUFBQSxlQW1CbUI7QUFuQm5CO0FBNkJELENBbkNEOztrQkFxQ2UsYzs7Ozs7Ozs7O0FDckNmOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxXQUFXLFNBQVgsUUFBVyxPQUE4RDtBQUFBLE1BQTNELElBQTJELFFBQTNELElBQTJEO0FBQUEsTUFBckQsV0FBcUQsUUFBckQsV0FBcUQ7QUFBQSxNQUF4QyxTQUF3QyxRQUF4QyxTQUF3QztBQUFBLE1BQTdCLFlBQTZCLFFBQTdCLFlBQTZCO0FBQUEsTUFBZixRQUFlLFFBQWYsUUFBZTs7QUFDN0UsTUFBTSxxQkFBcUIsWUFBWSxNQUFaLEdBQXFCLEVBQWhEO0FBQ0E7QUFBQSx1Q0FDcUM7QUFEckMsS0FHSyxLQUFLLEdBQUwsQ0FBUyxVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWdCO0FBQ3hCLFFBQUksV0FBVyxnQkFBZ0IsS0FBL0I7QUFDQSx5Q0FDRyxJQURIO0FBQUEsaUJBRWEsSUFBSSxPQUZqQjtBQUFBLGVBR1csSUFBSSxLQUhmO0FBQUEsZUFJVyxLQUpYO0FBQUEsa0JBS2MsUUFMZDtBQUFBLGlCQU1hO0FBTmI7QUFTRCxHQVhBLENBSEw7QUFBQSxnQkFFYyxzQkFBUyxRQUFULEVBQW1CLHVCQUFhLGdCQUFoQztBQUZkO0FBaUJELENBbkJEOztBQXFCQSxJQUFNLE9BQU8sU0FBUCxJQUFPLFFBQWtEO0FBQUEsTUFBL0MsS0FBK0MsU0FBL0MsS0FBK0M7QUFBQSxNQUF4QyxPQUF3QyxTQUF4QyxPQUF3QztBQUFBLE1BQS9CLEtBQStCLFNBQS9CLEtBQStCO0FBQUEsTUFBeEIsUUFBd0IsU0FBeEIsUUFBd0I7QUFBQSxNQUFkLFFBQWMsU0FBZCxPQUFjOztBQUM3RCxNQUFNLGNBQWMsV0FBVyxRQUFYLEdBQXNCLEVBQTFDO0FBQ0E7QUFBQSxpQkFDaUI7QUFEakIsS0FFSyxLQUZMO0FBQUEsZUFDdUM7QUFBQSxhQUFNLFNBQVEsT0FBUixFQUFpQixLQUFqQixDQUFOO0FBQUE7QUFEdkM7QUFLRCxDQVBEOztrQkFTZSxROzs7Ozs7Ozs7QUNsQ2Y7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxlQUFlLFNBQWYsWUFBZSxPQUVmO0FBQUEsTUFGa0IsS0FFbEIsUUFGa0IsS0FFbEI7QUFBQSxNQUZ5QixTQUV6QixRQUZ5QixTQUV6QjtBQUFBLE1BRm9DLFFBRXBDLFFBRm9DLFFBRXBDO0FBQUEsTUFGOEMsY0FFOUMsUUFGOEMsY0FFOUM7QUFBQSxNQURKLGtCQUNJLFFBREosa0JBQ0k7QUFBQSxNQURnQixnQkFDaEIsUUFEZ0IsZ0JBQ2hCO0FBQUEsTUFEa0MsVUFDbEMsUUFEa0MsVUFDbEM7O0FBQ0osTUFBTSxpQkFBaUIsTUFBdkI7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBR1MsTUFBTSxHQUFOLENBQVUsZ0JBQVE7QUFDakI7QUFBQSxZQUVRLEtBQUssRUFGYjtBQUFBLG1CQUdlLEtBQUssU0FIcEI7QUFBQSxlQUlXLEtBQUssS0FKaEI7QUFBQSxvQkFLZ0IsS0FBSyxVQUxyQjtBQUFBLGlCQU1hLGtCQU5iO0FBQUEsa0JBT2MsUUFQZDtBQUFBLDBCQVFzQjtBQVJ0QjtBQVdELEdBWkEsQ0FIVDtBQUFBLGFBaUJpQjtBQWpCakI7QUFBQSxhQWtCc0IsY0FsQnRCO0FBQUEsZ0JBa0IrQyxDQUFDO0FBbEJoRDtBQUFBLGVBbUJtQjtBQW5CbkI7QUF3QkQsQ0E1QkQ7O2tCQThCZSxZOzs7Ozs7Ozs7QUNqQ2Y7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxlQUFlLFNBQWYsWUFBZSxPQUVmO0FBQUEsTUFGa0IsRUFFbEIsUUFGa0IsRUFFbEI7QUFBQSxNQUZzQixTQUV0QixRQUZzQixTQUV0QjtBQUFBLE1BRmlDLEtBRWpDLFFBRmlDLEtBRWpDO0FBQUEsTUFGd0MsVUFFeEMsUUFGd0MsVUFFeEM7QUFBQSxNQURKLFFBQ0ksUUFESixPQUNJO0FBQUEsTUFESyxnQkFDTCxRQURLLGdCQUNMO0FBQUEsTUFEdUIsUUFDdkIsUUFEdUIsUUFDdkI7O0FBQ0osTUFBSSxZQUFZLEVBQWhCO0FBQ0EsVUFBUSxNQUFNLE1BQU4sR0FBZSxTQUFmLEdBQ0osTUFBTSxTQUFOLENBQWdCLENBQWhCLEVBQW1CLEVBQW5CLEVBQXVCLE1BQXZCLENBQThCLEtBQTlCLENBREksR0FFSixLQUZKO0FBR0E7QUFBQSxhQUVlO0FBRmY7QUFBQSxZQUdjO0FBSGQ7QUFBQSxXQUlrQixXQUFXLElBQVgsQ0FBZ0I7QUFKbEM7QUFBQSxlQUcyQjtBQUFBLGFBQUssU0FBUSxDQUFSLEVBQVcsRUFBWCxDQUFMO0FBQUE7QUFIM0I7QUFBQSxhQU1pQjtBQU5qQjtBQUFBLGFBT2tCO0FBUGxCLFdBT3lDLEtBUHpDLFNBU1csYUFBYSxzQkFBWSxRQUExQjtBQUFBLGFBQ2tCO0FBRGxCO0FBQUEsZUFFYSxpQkFBaUIsSUFBakIsQ0FBc0IsSUFBdEIsRUFBNEIsU0FBNUIsRUFBdUMsc0JBQVksT0FBbkQ7QUFGYiwyQ0FUVjtBQXVCRCxDQTlCRDs7a0JBZ0NlLFk7Ozs7Ozs7OztBQ25DZjs7Ozs7O0FBRUEsSUFBTSxZQUFZLFNBQVosU0FBWSxPQUF5QztBQUFBLE1BQXRDLE9BQXNDLFFBQXRDLE9BQXNDO0FBQUEsTUFBN0IsUUFBNkIsUUFBN0IsUUFBNkI7QUFBQSxNQUFuQixZQUFtQixRQUFuQixZQUFtQjs7QUFDekQ7QUFBQSxpQkFDa0I7QUFEbEI7QUFBQSxpQkFFcUIsd0JBRnJCO0FBQUEsWUFFbUQsTUFGbkQ7QUFBQSwrQkFHNkIsWUFIN0I7QUFBQTtBQUFBLGVBSWU7QUFKZjtBQUFBLGFBTWtCLGdDQU5sQjtBQUFBLFlBTXdEO0FBTnhEO0FBQUEsZ0JBQ3lDO0FBRHpDO0FBV0QsQ0FaRDs7a0JBY2UsUzs7Ozs7Ozs7QUNoQmYsSUFBTSxlQUFlO0FBQ25CLFlBQVUsS0FEUztBQUVuQixhQUFXLE1BRlE7QUFHbkIsb0JBQWtCLElBSEM7QUFJbkIsdUJBQXFCLEVBSkY7QUFLbkIsOEJBQTRCO0FBTFQsQ0FBckI7O2tCQVFlLFk7Ozs7Ozs7O0FDUmYsSUFBTSxjQUFjO0FBQ2xCLFlBQVUsVUFEUTtBQUVsQixXQUFTO0FBRlMsQ0FBcEI7O2tCQUtlLFc7Ozs7Ozs7O0FDTGYsSUFBTSxjQUFjO0FBQ2xCLGFBQVcsQ0FBQyxDQURNO0FBRWxCLFNBQU8sQ0FGVztBQUdsQixXQUFTLENBSFM7QUFJbEIsVUFBUSxDQUpVO0FBS2xCLGFBQVcsQ0FMTztBQU1sQixjQUFZO0FBTk0sQ0FBcEI7O2tCQVNlLFc7Ozs7Ozs7O0FDVGYsSUFBTSxhQUFhO0FBQ2pCLGdCQUFjLE9BQU8sWUFBUCxDQURHO0FBRWpCLGdCQUFjLE9BQU8sWUFBUDtBQUZHLENBQW5COztrQkFLZSxVOzs7Ozs7Ozs7OztBQ0xmOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7Ozs7OztJQUlNLFk7OztBQUNKLHdCQUFZLEtBQVosRUFBbUI7QUFBQTs7QUFBQSw0SEFDWCxLQURXOztBQUVqQixVQUFLLEtBQUwsR0FBYTtBQUNYLGNBQVEsSUFERztBQUVYLGFBQU8sRUFGSTtBQUdYLFlBQU0sRUFISztBQUlYLGVBQVMsRUFKRTtBQUtYLHdCQUFrQixFQUxQO0FBTVgseUJBQW1CLElBTlI7QUFPWCxtQkFBYSxJQVBGO0FBUVgseUJBQW1CLElBUlI7QUFTWCx5QkFBbUIsSUFUUjtBQVVYLG9CQUFjLHNCQUFZLFFBVmY7QUFXWCxnQkFBVSxzQkFBWSxRQVhYO0FBWVgsa0JBQVkscUJBQVcsVUFaWjtBQWFYLGlCQUFXLEtBYkE7QUFjWCx5QkFBbUIsS0FkUjtBQWVYLHlCQUFtQjtBQWZSLEtBQWI7O0FBa0JBLFVBQUssaUJBQUwsR0FBeUIsTUFBSyxpQkFBTCxDQUF1QixJQUF2QixPQUF6QjtBQUNBLFVBQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsT0FBcEI7QUFDQSxVQUFLLHNCQUFMLEdBQThCLE1BQUssc0JBQUwsQ0FBNEIsSUFBNUIsT0FBOUI7QUFDQSxVQUFLLGdCQUFMLEdBQXdCLE1BQUssZ0JBQUwsQ0FBc0IsSUFBdEIsT0FBeEI7QUFDQSxVQUFLLGVBQUwsR0FBdUIsTUFBSyxlQUFMLENBQXFCLElBQXJCLE9BQXZCO0FBQ0EsVUFBSyxtQkFBTCxHQUEyQixNQUFLLG1CQUFMLENBQXlCLElBQXpCLE9BQTNCO0FBQ0E7QUFDQTtBQUNBLFVBQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsT0FBcEI7O0FBRUEsVUFBSyxrQkFBTCxHQUEwQixNQUFLLGtCQUFMLENBQXdCLElBQXhCLE9BQTFCO0FBQ0EsVUFBSyx1QkFBTCxHQUErQixNQUFLLHVCQUFMLENBQTZCLElBQTdCLE9BQS9CO0FBQ0EsVUFBSyxvQkFBTCxHQUE0QixNQUFLLG9CQUFMLENBQTBCLElBQTFCLE9BQTVCO0FBQ0EsVUFBSyxjQUFMLEdBQXNCLE1BQUssY0FBTCxDQUFvQixJQUFwQixPQUF0QjtBQUNBLFVBQUssb0JBQUwsR0FBNEIsTUFBSyxvQkFBTCxDQUEwQixJQUExQixPQUE1QjtBQUNBLFVBQUssY0FBTCxHQUFzQixNQUFLLGNBQUwsQ0FBb0IsSUFBcEIsT0FBdEI7QUFDQSxVQUFLLG9CQUFMLEdBQTRCLE1BQUssb0JBQUwsQ0FBMEIsSUFBMUIsT0FBNUI7QUFwQ2lCO0FBcUNsQjs7Ozt3Q0FFbUI7QUFBQTs7QUFDbEIsV0FBSyxRQUFMLENBQWM7QUFDWixnQkFBUSw2QkFBYyxjQUFkO0FBREksT0FBZCxFQUVHLFlBQU07QUFDUCxlQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLEVBQWxCLENBQXFCLGFBQXJCLEVBQW9DLGFBQUs7QUFDdkMsY0FBTSxRQUFRLEVBQUUsTUFBRixDQUFTLGNBQVQsRUFBZDs7QUFFQSxrQkFBTyxLQUFQO0FBQ0EsaUJBQUssc0JBQVksS0FBakI7QUFDRSxxQkFBSyxlQUFMO0FBQ0E7QUFDRixpQkFBSyxzQkFBWSxPQUFqQjtBQUNFLHFCQUFLLFFBQUwsQ0FBYyxFQUFFLFdBQVcsSUFBYixFQUFkO0FBQ0E7QUFDRixpQkFBSyxzQkFBWSxNQUFqQjtBQUNFLHFCQUFLLFFBQUwsQ0FBYyxFQUFFLFdBQVcsS0FBYixFQUFkO0FBUkY7QUFVRCxTQWJEO0FBY0QsT0FqQkQ7QUFrQkQ7OztxQ0FFZ0I7QUFDZixhQUFPLFFBQVEsS0FBSyxLQUFMLENBQVcsZ0JBQW5CLENBQVA7QUFDRDs7OzJDQUVzQjtBQUNyQixhQUFPLFFBQVEsS0FBSyxLQUFMLENBQVcsaUJBQW5CLENBQVA7QUFDRDs7O3NDQUVpQixDLEVBQUc7QUFDbkIsV0FBSyxRQUFMLENBQWM7QUFDWixlQUFPLEVBQUUsTUFBRixDQUFTO0FBREosT0FBZDtBQUdEOzs7NENBRXVCLEksRUFBTTtBQUM1QixXQUFLLFFBQUwsQ0FBYztBQUNaLGlCQUFTLEVBREc7QUFFWiwwQkFBa0IsRUFGTjtBQUdaLHNCQUFjLElBSEY7QUFJWiwyQkFBbUI7QUFKUCxPQUFkO0FBTUQ7OztpQ0FFWSxDLEVBQUc7QUFBQTs7QUFDZCxRQUFFLGNBQUY7O0FBRUEsVUFBSSxLQUFLLEtBQUwsQ0FBVyxLQUFYLEtBQXFCLEVBQXpCLEVBQTZCOztBQUU3QixXQUFLLFFBQUwsQ0FBYztBQUNaLGlCQUFTLEVBREc7QUFFWiwwQkFBa0IsRUFGTjtBQUdaLG9CQUFZLHFCQUFXLFVBSFg7QUFJWiwyQkFBbUIsS0FKUDtBQUtaLDJCQUFtQixJQUxQO0FBTVosMkJBQW1CO0FBTlAsT0FBZCxFQU9HLFlBQU07QUFDUCxlQUFLLFVBQUwsQ0FDRSxPQUFLLEtBQUwsQ0FBVyxLQURiLEVBRUUsT0FBSyxLQUFMLENBQVcsWUFGYixFQUdFLE9BQUssS0FBTCxDQUFXLGdCQUhiO0FBS0QsT0FiRDtBQWNEOzs7eUNBRW9CLEUsRUFBSSxRLEVBQVU7QUFBQTs7QUFDakMsV0FBSyxRQUFMLENBQWM7QUFDWixvQkFBWSxxQkFBVyxVQURYO0FBRVosaUJBQVMsRUFGRztBQUdaLDBCQUFrQjtBQUhOLE9BQWQsRUFJRztBQUFBLGVBQU0sT0FBSyxjQUFMLENBQW9CLEVBQXBCLEVBQXdCLFFBQXhCLENBQU47QUFBQSxPQUpIO0FBS0Q7OzttQ0FFYyxFLEVBQUksUSxFQUFVO0FBQUE7O0FBQzNCLDRDQUFzQixFQUF0QixFQUEwQixLQUFLLEtBQUwsQ0FBVyxnQkFBckMsRUFDRyxJQURILENBQ1EsZ0JBQVE7QUFDWixZQUFJLFdBQVc7QUFDYixtQkFBUyxPQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLE1BQW5CLENBQTBCLEtBQUssS0FBL0IsQ0FESTtBQUViLDRCQUFrQixLQUFLLGFBRlY7QUFHYix3QkFBYyxzQkFBWSxRQUhiO0FBSWIsNkJBQW1CO0FBSk4sU0FBZjtBQU1BLFlBQUksUUFBSixFQUFjLFdBQVcsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixRQUFsQixFQUE0QixFQUFDLGtCQUFELEVBQTVCLENBQVg7QUFDZCxlQUFLLFFBQUwsQ0FBYyxRQUFkO0FBQ0QsT0FWSCxFQVdHLEtBWEgsQ0FXUztBQUFBLGVBQU8sUUFBUSxHQUFSLENBQVksU0FBWixFQUF1QixHQUF2QixDQUFQO0FBQUEsT0FYVDtBQVlEOzs7bUNBRWMsQyxFQUFHO0FBQ2hCLGNBQVEsS0FBSyxLQUFMLENBQVcsVUFBbkI7QUFDRSxhQUFLLHFCQUFXLFVBQWhCO0FBQ0UsZUFBSyxVQUFMLENBQ0UsS0FBSyxLQUFMLENBQVcsS0FEYixFQUVFLEtBQUssS0FBTCxDQUFXLFlBRmIsRUFHRSxLQUFLLEtBQUwsQ0FBVyxnQkFIYjtBQUtBO0FBQ0YsYUFBSyxxQkFBVyxVQUFoQjtBQUNFLGVBQUssY0FBTCxDQUFvQixLQUFLLEtBQUwsQ0FBVyxpQkFBL0IsRUFBa0Qsc0JBQVksT0FBOUQ7QUFDRjtBQUNFO0FBWEo7QUFhRDs7OytCQUVVLEssRUFBTyxJLEVBQU0sYSxFQUFlO0FBQUE7O0FBQ3JDLGlDQUFXLEtBQVgsRUFBa0IsSUFBbEIsRUFBd0IsYUFBeEIsRUFDRyxJQURILENBQ1EsZ0JBQVE7QUFDWixlQUFLLFFBQUwsQ0FBYztBQUNaLG1CQUFTLE9BQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBSyxLQUEvQixDQURHO0FBRVosb0JBQVUsSUFGRTtBQUdaLDRCQUFrQixLQUFLO0FBSFgsU0FBZDtBQUtELE9BUEgsRUFRRyxLQVJILENBUVM7QUFBQSxlQUFPLFFBQVEsR0FBUixDQUFZLFNBQVosRUFBdUIsR0FBdkIsQ0FBUDtBQUFBLE9BUlQ7QUFTRDs7OzJDQUVzQixDLEVBQUcsRSxFQUFJO0FBQUE7O0FBQzVCLFFBQUUsY0FBRjs7QUFFQSxXQUFLLGFBQUwsQ0FBbUIsRUFBbkIsRUFBdUIsS0FBSyxLQUFMLENBQVcsWUFBbEMsRUFDRyxJQURILENBQ1EsWUFBTTtBQUNWLFlBQUksQ0FBQyxPQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLE1BQWpCLEdBQTBCLENBQTlCLEVBQWlDOztBQUVqQyxlQUFLLFFBQUwsQ0FBYztBQUNaLHVCQUFhLENBREQ7QUFFWixxQkFBVyxJQUZDO0FBR1osNkJBQW1CO0FBSFAsU0FBZCxFQUlHLE9BQUssU0FBTCxDQUFlLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEIsRUFBbUIsT0FBbEMsQ0FKSDtBQUtELE9BVEgsRUFVRyxLQVZILENBVVM7QUFBQSxlQUFPLFFBQVEsR0FBUixDQUFZLFNBQVosRUFBdUIsR0FBdkIsQ0FBUDtBQUFBLE9BVlQ7QUFXRDs7O2tDQUVhLEUsRUFBSSxJLEVBQU07QUFBQTs7QUFDdEIsYUFBTyw0QkFBWSxFQUFaLEVBQWdCLElBQWhCLEVBQ0osSUFESSxDQUNDLGdCQUFRO0FBQ1osZUFBSyxRQUFMLENBQWM7QUFDWixnQkFBTSxLQUFLLEtBREM7QUFFWiw2QkFBbUIsS0FBSyxVQUZaO0FBR1osNkJBQW1CLEtBQUs7QUFIWixTQUFkO0FBS0QsT0FQSSxDQUFQO0FBUUQ7Ozt5Q0FFb0IsQyxFQUFHO0FBQUE7O0FBQ3RCLFVBQU0sS0FBSyxFQUFFLE1BQWI7QUFDQSxVQUFNLFNBQVMsR0FBRyxZQUFILEdBQWtCLEdBQUcsU0FBcEM7QUFDQSxVQUFNLFNBQVMsR0FBRyxZQUFILEdBQW1CLEdBQWxDO0FBQ0EsVUFBTSxlQUFnQixNQUFELElBQWEsTUFBbEM7O0FBRUEsVUFBSSxnQkFBZ0IsS0FBSyxvQkFBTCxFQUFwQixFQUFpRDtBQUMvQyxvQ0FDRSxLQUFLLEtBQUwsQ0FBVyxpQkFEYixFQUVFLHNCQUFZLFFBRmQsRUFHRSxLQUFLLEtBQUwsQ0FBVyxpQkFIYixFQUtDLElBTEQsQ0FLTSxnQkFBUTtBQUNaLGlCQUFLLFFBQUwsQ0FBYztBQUNaLGtCQUFNLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsTUFBaEIsQ0FBdUIsS0FBSyxLQUE1QixDQURNO0FBRVosK0JBQW1CLEtBQUs7QUFGWixXQUFkO0FBSUQsU0FWRDtBQVdEO0FBQ0Y7OztxQ0FFZ0IsRSxFQUFJLEssRUFBTztBQUFBOztBQUMxQixXQUFLLFFBQUwsQ0FBYztBQUNaLHFCQUFhLEtBREQ7QUFFWixtQkFBVztBQUZDLE9BQWQsRUFHRztBQUFBLGVBQU0sUUFBSyxTQUFMLENBQWUsRUFBZixDQUFOO0FBQUEsT0FISDtBQUtEOzs7bUNBRWM7QUFDYixVQUFJLEtBQUssS0FBTCxDQUFXLFNBQWYsRUFDRSxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLFVBQWxCLEdBREYsS0FHRSxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLFNBQWxCOztBQUVGLFdBQUssUUFBTCxDQUFjO0FBQ1osbUJBQVcsQ0FBQyxLQUFLLEtBQUwsQ0FBVztBQURYLE9BQWQ7QUFHRDs7OzBDQUVxQjtBQUFBOztBQUNwQixVQUFNLGVBQWUsS0FBSyxLQUFMLENBQVcsV0FBWCxHQUF5QixDQUE5QztBQUNBLFVBQUksRUFBRSxnQkFBZ0IsQ0FBbEIsQ0FBSixFQUEwQjs7QUFFMUIsV0FBSyxRQUFMLENBQWM7QUFDWixxQkFBYTtBQURELE9BQWQsRUFFRztBQUFBLGVBQU0sUUFBSyxTQUFMLENBQWUsUUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixZQUFoQixFQUE4QixPQUE3QyxDQUFOO0FBQUEsT0FGSDtBQUdEOzs7c0NBRWlCO0FBQUE7O0FBQ2hCLFVBQU0sV0FBVyxLQUFLLEtBQUwsQ0FBVyxXQUFYLEdBQXlCLENBQTFDO0FBQ0EsVUFBSSxFQUFFLFdBQVcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixNQUE3QixDQUFKLEVBQTBDOztBQUUxQyxXQUFLLFFBQUwsQ0FBYztBQUNaLHFCQUFhO0FBREQsT0FBZCxFQUVHO0FBQUEsZUFBTSxRQUFLLFNBQUwsQ0FBZSxRQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFFBQWhCLEVBQTBCLE9BQXpDLENBQU47QUFBQSxPQUZIO0FBR0Q7Ozt5Q0FFb0I7QUFDbkIsV0FBSyxRQUFMLENBQWM7QUFDWiwyQkFBbUIsQ0FBQyxLQUFLLEtBQUwsQ0FBVztBQURuQixPQUFkO0FBR0Q7Ozs4QkFFUyxFLEVBQUc7QUFDWCxXQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLGFBQWxCLENBQWdDLEVBQWhDO0FBQ0Q7Ozs2QkFFUTtBQUNQO0FBQUEsaUJBRWtCO0FBRmxCO0FBQUE7QUFBQSwwQkFLd0IsS0FBSyxLQUFMLENBQVcsWUFMbkM7QUFBQSxxQkFNbUIsS0FBSyxpQkFOeEI7QUFBQSxzQkFPb0IsS0FBSztBQVB6QjtBQUFBO0FBQUEsOEJBVzRCLEtBQUssdUJBWGpDO0FBQUEsd0JBWXNCLEtBQUssS0FBTCxDQUFXO0FBWmpDO0FBQUEsaUJBZ0JlO0FBaEJmLFVBa0JTLEtBQUssS0FBTCxDQUFXLFlBQVgsS0FBNEIsc0JBQVksT0FBekM7QUFBQSxpQkFFVyxLQUFLLEtBQUwsQ0FBVyxPQUZ0QjtBQUFBLDBCQUdvQixLQUFLLGNBSHpCO0FBQUEsOEJBSXdCLEtBQUssc0JBSjdCO0FBQUEsNEJBS3NCLEtBQUssb0JBTDNCO0FBQUEsc0JBTWdCLEtBQUs7QUFOckI7QUFBQSxpQkFXVyxLQUFLLEtBQUwsQ0FBVyxPQVh0QjtBQUFBLG9CQVljLEtBQUssS0FBTCxDQUFXLFFBWnpCO0FBQUEsMEJBYW9CLEtBQUssY0FiekI7QUFBQSw4QkFjd0IsS0FBSyxzQkFkN0I7QUFBQSw0QkFlc0IsS0FBSyxvQkFmM0I7QUFBQSxzQkFnQmdCLEtBQUs7QUFoQnJCLFFBbEJSO0FBQUEsZ0JBdUNjLEtBQUssS0FBTCxDQUFXLElBdkN6QjtBQUFBLHVCQXdDcUIsS0FBSyxLQUFMLENBQVcsV0F4Q2hDO0FBQUEscUJBeUNtQixLQUFLLEtBQUwsQ0FBVyxpQkF6QzlCO0FBQUEsd0JBMENzQixLQUFLLGdCQTFDM0I7QUFBQSxvQkEyQ2tCLEtBQUs7QUEzQ3ZCO0FBQUEsdUJBZ0RtQixLQUFLLEtBQUwsQ0FBVztBQWhEOUI7QUFBQSxrQkFvRGMsS0FBSyxlQXBEbkI7QUFBQSxzQkFxRGtCLEtBQUssbUJBckR2QjtBQUFBLG9CQXNEZ0IsS0FBSyxZQXREckI7QUFBQSw2QkF1RHlCLEtBQUssS0FBTCxDQUFXLGlCQXZEcEM7QUFBQSxxQkF3RGlCLEtBQUssS0FBTCxDQUFXLFNBeEQ1QjtBQUFBLDBCQXlEc0IsS0FBSztBQXpEM0I7QUE4REQ7Ozs7OztrQkFHWSxZOzs7OztBQ2pWZjs7Ozs7O0FBREEsSUFBTSxVQUFVLFFBQVEsaUJBQVIsRUFBMkIsSUFBM0M7OztBQUdBLElBQUksWUFBYSxZQUFXO0FBQzFCLFNBQVEsWUFBWSx1QkFBYSxRQUExQixHQUNILFFBQVEsK0JBQVIsQ0FERyxHQUVILFFBQVEsUUFBUixDQUZKO0FBR0QsQ0FKZSxFQUFoQjs7QUFNQSxPQUFPLE9BQVAsR0FBaUIsU0FBakI7Ozs7O0FDVEE7Ozs7QUFDQTs7Ozs7O0FBRUEsa0JBQVEsTUFBUix3REFBaUMsU0FBUyxjQUFULENBQXdCLEtBQXhCLENBQWpDOzs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBOztBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7O0FDRkE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBOzs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JpRkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMzcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM1R0EsSUFBSSxXQUFXLFFBQVEsc0JBQVIsQ0FBZjtBQUNBLElBQUksU0FBUyxRQUFRLG9CQUFSLENBQWI7O0FBRUEsU0FBUyxVQUFULENBQW9CLENBQXBCLEVBQXVCO0FBQ3JCLFNBQU8sUUFBUSxPQUFSLENBQWdCLFFBQWhCLENBQVA7QUFDRDs7QUFFRCxTQUFTLFdBQVQsR0FBdUI7QUFDckIsU0FBTyxRQUFRLE9BQVIsQ0FBZ0IsTUFBaEIsQ0FBUDtBQUNEOztBQUVELFNBQVMscUJBQVQsR0FBaUM7QUFDL0IsU0FBTyxRQUFRLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBUDtBQUNEOztRQUdDLFUsR0FBQSxVO1FBQ0EsVyxHQUFBLFc7UUFDQSxxQixHQUFBLHFCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IGtleSA9IHJlcXVpcmUoJy4uLy4uL2NyZWRlbnRpYWxzJykua2V5XG5pbXBvcnQgQ29udGVudFR5cGUgZnJvbSAnLi4vY29uc3RhbnRzL0NvbnRlbnRUeXBlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICcuLi9jb25zdGFudHMvQXBwQ29uc3RhbnRzJ1xuXG5jb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3lvdXR1YmUvdjNgXG5cbmZ1bmN0aW9uIGdldENvbnRlbnQocXVlcnksIHR5cGUsIHBhZ2VUb2tlbiA9ICcnKSB7XG4gIGNvbnN0IHJlc291cmNlID0gJ3NlYXJjaCdcbiAgbGV0IHBhcmFtcyA9IGBwYXJ0PXNuaXBwZXQma2V5PSR7a2V5fSZ0eXBlPSR7dHlwZX1gXG4gIHBhcmFtcyArPSBgJm1heFJlc3VsdHM9JHtBcHBDb25zdGFudHMuQ09OVEVOVF9NQVhfUkVTVUxUU31gXG4gIGxldCB1cmwgPSBgJHtiYXNlVXJsfS8ke3Jlc291cmNlfT8ke3BhcmFtc30mcT0ke3F1ZXJ5fWBcblxuICBpZiAocGFnZVRva2VuICE9PSAnJykge1xuICAgIHVybCArPSBgJnBhZ2VUb2tlbj0ke3BhZ2VUb2tlbn1gXG4gIH1cblxuICByZXR1cm4gZmV0Y2godXJsKVxuICAgIC50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgY29uc3QgaXRlbXMgPSBkYXRhLml0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaXRlbS5pZFtgJHt0eXBlfUlkYF0sXG4gICAgICAgICAgdGl0bGU6IGl0ZW0uc25pcHBldC50aXRsZSxcbiAgICAgICAgICB0aHVtYm5haWxzOiBpdGVtLnNuaXBwZXQudGh1bWJuYWlscyxcbiAgICAgICAgICBjaGFubmVsSWQ6IGl0ZW0uc25pcHBldC5jaGFubmVsSWQsXG4gICAgICAgICAgY2hhbm5lbFRpdGxlOiBpdGVtLnNuaXBwZXQuY2hhbm5lbFRpdGxlXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IG5ld0RhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCB7aXRlbXN9KVxuICAgICAgcmV0dXJuIG5ld0RhdGFcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBnZXRQbGF5bGlzdHNCeUNoYW5uZWwoY2hhbm5lbElkLCBwYWdlVG9rZW4gPSAnJykge1xuICBjb25zdCByZXNvdXJjZSA9ICdwbGF5bGlzdHMnXG4gIGxldCBwYXJhbXMgPSBgcGFydD1zbmlwcGV0JmtleT0ke2tleX1gXG4gIHBhcmFtcyArPSBgJm1heFJlc3VsdHM9JHtBcHBDb25zdGFudHMuQ09OVEVOVF9NQVhfUkVTVUxUU31gXG4gIGxldCB1cmwgPSBgJHtiYXNlVXJsfS8ke3Jlc291cmNlfT8ke3BhcmFtc30mY2hhbm5lbElkPSR7Y2hhbm5lbElkfWBcblxuICBpZiAocGFnZVRva2VuICE9PSAnJykge1xuICAgIHVybCArPSBgJnBhZ2VUb2tlbj0ke3BhZ2VUb2tlbn1gXG4gIH1cblxuICByZXR1cm4gZmV0Y2godXJsKVxuICAgIC50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgY29uc3QgaXRlbXMgPSBkYXRhLml0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICB0aXRsZTogaXRlbS5zbmlwcGV0LnRpdGxlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLnNuaXBwZXQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgdGh1bWJuYWlsczogaXRlbS5zbmlwcGV0LnRodW1ibmFpbHMsXG4gICAgICAgICAgY2hhbm5lbFRpdGxlOiBpdGVtLnNuaXBwZXQuY2hhbm5lbFRpdGxlLFxuICAgICAgICAgIGNoYW5uZWxJZDogaXRlbS5zbmlwcGV0LmNoYW5uZWxJZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgY29uc3QgbmV3RGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEsIHtpdGVtc30pXG4gICAgICByZXR1cm4gbmV3RGF0YVxuICAgIH0pXG59XG5cbmZ1bmN0aW9uIHBsYXlsaXN0SXRlbXNBUEkoKSB7XG4gIGNvbnN0IHJlc291cmNlID0gJ3BsYXlsaXN0SXRlbXMnXG4gIGNvbnN0IHBhcmFtS2V5ID0gYGtleT0ke2tleX1gXG4gIGNvbnN0IHBhcnQgPSBgcGFydD1zbmlwcGV0YFxuICBsZXQgcGFyYW1zID0gYCR7cGFydH0mbWF4UmVzdWx0cz0ke0FwcENvbnN0YW50cy5QTEFZTElTVF9JVEVNU19NQVhfUkVTVUxUU31gXG4gIHBhcmFtcyArPSBgJm9yZGVyPWRhdGUmJHtwYXJhbUtleX1gXG5cbiAgcmV0dXJuIGAke2Jhc2VVcmx9LyR7cmVzb3VyY2V9PyR7cGFyYW1zfWBcbn1cblxuZnVuY3Rpb24gZ2V0UGxheWxpc3QoaWQsIHR5cGUsIHBhZ2VUb2tlbikge1xuICBpZiAodHlwZSA9PT0gQ29udGVudFR5cGUuQ0hBTk5FTCkge1xuICAgIHJldHVybiBnZXRDaGFubmVsUGxheWxpc3QoaWQpXG4gICAgICAudGhlbih1cGxvYWRzSWQgPT4gZ2V0UGxheWxpc3RJdGVtcyh1cGxvYWRzSWQsIHBhZ2VUb2tlbikpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGdldFBsYXlsaXN0SXRlbXMoaWQsIHBhZ2VUb2tlbilcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQbGF5bGlzdEl0ZW1zKGlkLCBwYWdlVG9rZW4pIHtcbiAgcmV0dXJuIGZldGNoUGxheWxpc3RJdGVtcyhpZCwgcGFnZVRva2VuKVxufVxuXG5mdW5jdGlvbiBmZXRjaFBsYXlsaXN0SXRlbXMoaWQsIHBhZ2VUb2tlbikge1xuICBjb25zdCB1cmwgPSBgJHtwbGF5bGlzdEl0ZW1zQVBJKCl9JnBsYXlsaXN0SWQ9JHtpZH1gXG4gIGxldCBuZXdVcmwgPSAocGFnZVRva2VuKVxuICAgID8gYCR7dXJsfSZwYWdlVG9rZW49JHtwYWdlVG9rZW59YFxuICAgIDogdXJsXG5cbiAgcmV0dXJuIGZldGNoKG5ld1VybClcbiAgICAudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIGxldCBpdGVtcyA9IGRhdGEuaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlOiBpdGVtLnNuaXBwZXQudGl0bGUsXG4gICAgICAgICAgdmlkZW9JZDogaXRlbS5zbmlwcGV0LnJlc291cmNlSWQudmlkZW9JZCxcbiAgICAgICAgICB0aHVtYm5haWxzOiBpdGVtLnNuaXBwZXQudGh1bWJuYWlsc1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBjb25zdCBuZXdEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwge2l0ZW1zLCBwbGF5bGlzdElkOiBpZH0pXG4gICAgICByZXR1cm4gbmV3RGF0YVxuICAgIH0pXG59XG5cbi8qXG4gIFJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IGZldGNoZXMgYWxsIHRoZSBQbGF5bGlzdEl0ZW1zLlxuKi9cbmZ1bmN0aW9uIGZldGNoUGxheWxpc3RJdGVtc0F0T25jZShpZCwgcmVzdWx0cyA9IFtdLCBuZXh0UGFnZVRva2VuKSB7XG4gIGNvbnN0IHVybCA9IGAke3BsYXlsaXN0SXRlbXNBUEkoKX0mcGxheWxpc3RJZD0ke2lkfWBcbiAgbGV0IG5ld1VybCA9IChuZXh0UGFnZVRva2VuKVxuICAgID8gYCR7dXJsfSZwYWdlVG9rZW49JHtuZXh0UGFnZVRva2VufWBcbiAgICA6IHVybFxuXG4gIHJldHVybiBmZXRjaChuZXdVcmwpXG4gICAgLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgIGxldCBpdGVtcyA9IGRhdGEuaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlOiBpdGVtLnNuaXBwZXQudGl0bGUsXG4gICAgICAgICAgdmlkZW9JZDogaXRlbS5zbmlwcGV0LnJlc291cmNlSWQudmlkZW9JZCxcbiAgICAgICAgICB0aHVtYm5haWxzOiBpdGVtLnNuaXBwZXQudGh1bWJuYWlsc1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoaXRlbXMpXG5cbiAgICAgIGlmIChkYXRhLm5leHRQYWdlVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIGZldGNoUGxheWxpc3RJdGVtc0F0T25jZSh1cmwsIHJlc3VsdHMsIGRhdGEubmV4dFBhZ2VUb2tlbilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCB7aXRlbXM6IHJlc3VsdHN9KVxuICAgICAgICByZXR1cm4gbmV3RGF0YVxuICAgICAgfVxuICAgIH0pXG59XG5cbi8qIFRoZSBsaXN0IG9mIHZpZGVvcy91cGxvYWRzIGZyb20gYSBjaGFubmVsIGlzIHRyZWF0ZWQgYXNcbiAgIGEgUGxheWxpc3QsIHNvIHdlIGhhdmUgdG8gZ2V0IHRoaXMgaWQgdG8gaGFuZCBpdFxuICAgdG8gdGhlIHBsYXlsaXN0SXRlbXMgcmVzb3VyY2UuXG4qL1xuZnVuY3Rpb24gZ2V0Q2hhbm5lbFBsYXlsaXN0KGlkKSB7XG4gIGNvbnN0IHBhcmFtcyA9IGBwYXJ0PWNvbnRlbnREZXRhaWxzJmlkPSR7aWR9JmtleT0ke2tleX1gXG4gIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9L2NoYW5uZWxzPyR7cGFyYW1zfWBcbiAgcmV0dXJuIGZldGNoKHVybClcbiAgICAudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJldHVybiBkYXRhLml0ZW1zWzBdLmNvbnRlbnREZXRhaWxzLnJlbGF0ZWRQbGF5bGlzdHMudXBsb2Fkc1xuICAgIH0pXG59XG5cbmV4cG9ydCB7XG4gIGdldFBsYXlsaXN0LFxuICBnZXRDb250ZW50LFxuICBnZXRQbGF5bGlzdHNCeUNoYW5uZWxcbn1cbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQ2hhbm5lbEl0ZW0gZnJvbSAnLi9DaGFubmVsSXRlbSdcblxuY29uc3QgQ2hhbm5lbEdyaWQgPSAoeyBpdGVtcywgaGFzTW9yZVJlc3VsdHMsXG4gIG9uQ29udGVudEl0ZW1DbGljaywgb25QbGF5bGlzdHNDbGljaywgb25Mb2FkTW9yZVxufSkgPT4ge1xuICBjb25zdCBncmlkVmlzaWJpbGl0eSA9ICdzaG93J1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3M9e2BtYWluIGZsYXQtc2Nyb2xsYH0+XG4gICAgICA8ZGl2IGNsYXNzPXtgY29udGVudGB9PlxuICAgICAgICB7aXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Q2hhbm5lbEl0ZW1cbiAgICAgICAgICAgICAgaWQ9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIHRpdGxlPXtpdGVtLnRpdGxlfVxuICAgICAgICAgICAgICB0aHVtYm5haWxzPXtpdGVtLnRodW1ibmFpbHN9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ29udGVudEl0ZW1DbGlja31cbiAgICAgICAgICAgICAgb25QbGF5bGlzdHNDbGljaz17b25QbGF5bGlzdHNDbGlja31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nYWxpZ24tY2VudGVyJz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nYnV0dG9uIG1pbm9yJyBkaXNhYmxlZD17IWhhc01vcmVSZXN1bHRzKCl9XG4gICAgICAgICAgb25DbGljaz17b25Mb2FkTW9yZX0+TG9hZCBtb3JlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBDaGFubmVsR3JpZFxuIiwiaW1wb3J0IEluZmVybm8gZnJvbSAnaW5mZXJubydcbmltcG9ydCBDb250ZW50VHlwZSBmcm9tICcuLi9jb25zdGFudHMvQ29udGVudFR5cGUnXG5cbmNvbnN0IENoYW5uZWxJdGVtID0gKHsgaWQsIHRpdGxlLCB0aHVtYm5haWxzLCBvbkNsaWNrLCBvblBsYXlsaXN0c0NsaWNrIH0pID0+IHtcbiAgbGV0IG1heExlbmd0aCA9IDIwXG4gIHRpdGxlID0gdGl0bGUubGVuZ3RoID4gbWF4TGVuZ3RoXG4gICAgPyB0aXRsZS5zdWJzdHJpbmcoMCwgMjApLmNvbmNhdCgnLi4uJylcbiAgICA6IHRpdGxlXG4gIHJldHVybiAoXG5cbiAgICAgIDxkaXYgY2xhc3M9J2NvbnRlbnQtaXRlbSc+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgb25DbGljaz17ZSA9PiBvbkNsaWNrKGUsIGlkKX0+XG4gICAgICAgICAgPGltZyBzcmM9e3RodW1ibmFpbHMuaGlnaC51cmx9IC8+XG4gICAgICAgIDwvYT5cbiAgICAgICAgPGRpdiBjbGFzcz0nY29udGVudC1pdGVtLWRldGFpbHMnPlxuICAgICAgICAgIDxoMiBjbGFzcz0nY29udGVudC1pdGVtLXRpdGxlJz4ge3RpdGxlfSA8L2gyPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J2J1dHRvbiBtYWpvciBzbWFsbCdcbiAgICAgICAgICAgIG9uQ2xpY2s9e29uUGxheWxpc3RzQ2xpY2suYmluZChudWxsLCBpZCwgQ29udGVudFR5cGUuQ0hBTk5FTCl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgUGxheWxpc3RzXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBDaGFubmVsSXRlbVxuIiwiaW1wb3J0IEluZmVybm8gZnJvbSAnaW5mZXJubydcbmltcG9ydCBDb250ZW50VHlwZSBmcm9tICcuLi9jb25zdGFudHMvQ29udGVudFR5cGUnXG5cbmNvbnN0IENvbnRlbnRUeXBlU2VsZWN0aW9uID0gKHsgb25Db250ZW50VHlwZUNsaWNrLCBzZWxlY3RlZFR5cGUgfSkgPT4ge1xuICBsZXQgYnRuUGxheWxpc3RDbGFzc2VzLCBidG5DaGFubmVsQ2xhc3Nlc1xuICBidG5QbGF5bGlzdENsYXNzZXMgPSBbJ2J1dHRvbicsICdzZWxlY3Rpb24nXVxuICBidG5DaGFubmVsQ2xhc3NlcyA9IFsnYnV0dG9uJywgJ3NlbGVjdGlvbiddXG4gIGlmIChzZWxlY3RlZFR5cGUgPT09IENvbnRlbnRUeXBlLlBMQVlMSVNUKSBidG5QbGF5bGlzdENsYXNzZXMucHVzaCgnYWN0aXZlJylcbiAgZWxzZSBpZiAoc2VsZWN0ZWRUeXBlID09PSBDb250ZW50VHlwZS5DSEFOTkVMKSBidG5DaGFubmVsQ2xhc3Nlcy5wdXNoKCdhY3RpdmUnKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzcz0nY29udGVudC10eXBlLXNlbGVjdGlvbic+XG4gICAgICA8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9e2J0blBsYXlsaXN0Q2xhc3Nlcy5qb2luKCcgJyl9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudFR5cGVDbGljay5iaW5kKG51bGwsIENvbnRlbnRUeXBlLlBMQVlMSVNUKX0+XG4gICAgICAgIFBsYXlsaXN0XG4gICAgICA8L2J1dHRvbj5cblxuICAgICAgPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPXtidG5DaGFubmVsQ2xhc3Nlcy5qb2luKCcgJyl9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudFR5cGVDbGljay5iaW5kKG51bGwsIENvbnRlbnRUeXBlLkNIQU5ORUwpfT5cbiAgICAgICAgQ2hhbm5lbFxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29udGVudFR5cGVTZWxlY3Rpb25cbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5cbmNvbnN0IE5hdiA9ICh7IGNoaWxkcmVuIH0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzPSduYXYnPlxuICAgICAgPGEgY2xhc3M9J2xvZ28nIGhyZWY9XCIjXCI+XG4gICAgICAgIDxoMT5cbiAgICAgICAgICA8c3BhbiBjbGFzcz0nbWluaSc+dDwvc3Bhbj48c3BhbiBjbGFzcz0nZnVsbCc+dGVrb2E8L3NwYW4+XG4gICAgICAgIDwvaDE+XG4gICAgICA8L2E+XG4gICAgICB7Y2hpbGRyZW59XG5cbiAgICAgIDxkaXYgY2xhc3M9J3NldHRpbmdzJz5cbiAgICAgICAgPHA+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgPC9uYXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTmF2XG4iLCJjb25zdCBQbGF5ZXIgPSAoeyBpc01pbmltaXplZCB9KSA9PiB7XG4gIGNvbnN0IHBsYXllckNsYXNzZXMgPSBpc01pbmltaXplZCA/ICdtaW5pbWl6ZScgOiAnJ1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzcz17YHBsYXllciAke3BsYXllckNsYXNzZXN9YH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YHBsYXllci1jb250YWluZXJgfT5cbiAgICAgICAgPGRpdiBpZD1cInZpZGVvLXBsYXllclwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyXG4iLCJjb25zdCBQbGF5ZXJDb250cm9scyA9ICh7XG4gIG9uTmV4dCwgb25QcmV2aW91cywgb25Ub2dnbGUsIGlzUGxheWluZywgaXNQbGF5ZXJNaW5pbWl6ZWQsIG9uVG9nZ2xlUGxheWVyXG59KSA9PiB7XG4gIGNvbnN0IHBsYXkgPSBpc1BsYXlpbmcgPyAn4o+4JyA6ICfij7UnXG4gIGNvbnN0IHRvZ2dsZVBsYXllciA9ICfij7YnXG4gIGNvbnN0IHRvZ2dsZVZpc2liaWxpdHkgPSBpc1BsYXllck1pbmltaXplZCA/ICcnIDogJ2ZsaXAnXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzcz0ncGxheWVyLWNvbnRyb2xzLWNvbnRhaW5lcic+XG4gICAgICA8dWwgY2xhc3M9J3BsYXllci1jb250cm9scy1saXN0Jz5cbiAgICAgICAgPHVsIGNsYXNzPSdwbGF5ZXItY29udHJvbHMnPlxuICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J2NvbnRyb2wnIG9uQ2xpY2s9e29uUHJldmlvdXN9PiYjeDIzZWE7PC9idXR0b24+XG4gICAgICAgICAgPC9saT5cblxuICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J2NvbnRyb2wnIG9uQ2xpY2s9e29uVG9nZ2xlfT57cGxheX08L2J1dHRvbj5cbiAgICAgICAgICA8L2xpPlxuXG4gICAgICAgICAgPGxpPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29udHJvbCcgb25DbGljaz17b25OZXh0fT4mI3gyM2U5OzwvYnV0dG9uPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvdWw+XG5cbiAgICAgICAgPGRpdiBjbGFzcz0ncGxheWVyLXRvZ2dsZSc+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz17YGNvbnRyb2xgfVxuICAgICAgICAgICAgb25DbGljaz17b25Ub2dnbGVQbGF5ZXJ9PlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPXtgY29udHJvbC10b2dnbGUgJHt0b2dnbGVWaXNpYmlsaXR5fWB9PlxuICAgICAgICAgICAgICB7dG9nZ2xlUGxheWVyfVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgIDwvdWw+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyQ29udHJvbHNcbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnbG9kYXNoLnRocm90dGxlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICcuLi9jb25zdGFudHMvQXBwQ29uc3RhbnRzJ1xuXG5jb25zdCBQbGF5bGlzdCA9ICh7IHZpZHMsIGN1cnJlbnRJdGVtLCBpc1Zpc2libGUsIG9uVmlkZW9DbGljaywgb25TY3JvbGwgfSkgPT4ge1xuICBjb25zdCBwbGF5bGlzdFZpc2liaWxpdHkgPSBpc1Zpc2libGUgPyAnc2hvdycgOiAnJ1xuICByZXR1cm4gKFxuICAgIDx1bCBjbGFzcz17YHBsYXlsaXN0IGZsYXQtc2Nyb2xsICR7cGxheWxpc3RWaXNpYmlsaXR5fWB9XG4gICAgICBvblNjcm9sbD17dGhyb3R0bGUob25TY3JvbGwsIEFwcENvbnN0YW50cy5USFJPVFRMRV9USU1FX01TKX0+XG4gICAgICB7dmlkcy5tYXAoKHZpZCwgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGlzQWN0aXZlID0gY3VycmVudEl0ZW0gPT09IGluZGV4XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPEl0ZW1cbiAgICAgICAgICAgIHZpZGVvSWQ9e3ZpZC52aWRlb0lkfVxuICAgICAgICAgICAgdGl0bGU9e3ZpZC50aXRsZX1cbiAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgIGlzQWN0aXZlPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uVmlkZW9DbGlja31cbiAgICAgICAgICAvPlxuICAgICAgKVxuICAgICAgfSl9XG4gICAgPC91bD5cbiAgKVxufVxuXG5jb25zdCBJdGVtID0gKHsgdGl0bGUsIHZpZGVvSWQsIGluZGV4LCBpc0FjdGl2ZSwgb25DbGljayB9KSA9PiB7XG4gIGNvbnN0IGl0ZW1DbGFzc2VzID0gaXNBY3RpdmUgPyAnYWN0aXZlJyA6ICcnXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17aXRlbUNsYXNzZXN9IG9uQ2xpY2s9eygpID0+IG9uQ2xpY2sodmlkZW9JZCwgaW5kZXgpfT5cbiAgICAgIHt0aXRsZX1cbiAgICA8L2xpPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlsaXN0XG4iLCJpbXBvcnQgSW5mZXJubyBmcm9tICdpbmZlcm5vJ1xuaW1wb3J0IFBsYXlsaXN0SXRlbSBmcm9tICcuL1BsYXlsaXN0SXRlbSdcblxuY29uc3QgUGxheWxpc3RHcmlkID0gKHsgaXRlbXMsIGlzVmlzaWJsZSwgdmlld1R5cGUsIGhhc01vcmVSZXN1bHRzLFxuICBvbkNvbnRlbnRJdGVtQ2xpY2ssIG9uUGxheWxpc3RzQ2xpY2ssIG9uTG9hZE1vcmVcbn0pID0+IHtcbiAgY29uc3QgZ3JpZFZpc2liaWxpdHkgPSAnc2hvdydcbiAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3M9e2BtYWluIGZsYXQtc2Nyb2xsYH0+XG4gICAgICAgIDxkaXYgY2xhc3M9e2Bjb250ZW50YH0+XG4gICAgICAgICAge2l0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxQbGF5bGlzdEl0ZW1cbiAgICAgICAgICAgICAgICBpZD17aXRlbS5pZH1cbiAgICAgICAgICAgICAgICBjaGFubmVsSWQ9e2l0ZW0uY2hhbm5lbElkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtpdGVtLnRpdGxlfVxuICAgICAgICAgICAgICAgIHRodW1ibmFpbHM9e2l0ZW0udGh1bWJuYWlsc31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRJdGVtQ2xpY2t9XG4gICAgICAgICAgICAgICAgdmlld1R5cGU9e3ZpZXdUeXBlfVxuICAgICAgICAgICAgICAgIG9uUGxheWxpc3RzQ2xpY2s9e29uUGxheWxpc3RzQ2xpY2t9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdhbGlnbi1jZW50ZXInPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J2J1dHRvbiBtaW5vcicgZGlzYWJsZWQ9eyFoYXNNb3JlUmVzdWx0cygpfVxuICAgICAgICAgICAgb25DbGljaz17b25Mb2FkTW9yZX0+TG9hZCBtb3JlPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5bGlzdEdyaWRcbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQ29udGVudFR5cGUgZnJvbSAnLi4vY29uc3RhbnRzL0NvbnRlbnRUeXBlJ1xuXG5jb25zdCBQbGF5bGlzdEl0ZW0gPSAoeyBpZCwgY2hhbm5lbElkLCB0aXRsZSwgdGh1bWJuYWlscyxcbiAgb25DbGljaywgb25QbGF5bGlzdHNDbGljaywgdmlld1R5cGVcbn0pID0+IHtcbiAgbGV0IG1heExlbmd0aCA9IDIwXG4gIHRpdGxlID0gdGl0bGUubGVuZ3RoID4gbWF4TGVuZ3RoXG4gICAgPyB0aXRsZS5zdWJzdHJpbmcoMCwgMjApLmNvbmNhdCgnLi4uJylcbiAgICA6IHRpdGxlXG4gIHJldHVybiAoXG5cbiAgICAgIDxkaXYgY2xhc3M9J2NvbnRlbnQtaXRlbSc+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgb25DbGljaz17ZSA9PiBvbkNsaWNrKGUsIGlkKX0+XG4gICAgICAgICAgPGltZyBzcmM9e3RodW1ibmFpbHMuaGlnaC51cmx9IC8+XG4gICAgICAgIDwvYT5cbiAgICAgICAgPGRpdiBjbGFzcz0nY29udGVudC1pdGVtLWRldGFpbHMnPlxuICAgICAgICAgIDxoMiBjbGFzcz0nY29udGVudC1pdGVtLXRpdGxlJz4ge3RpdGxlfSA8L2gyPlxuICAgICAgICAgIHtcbiAgICAgICAgICAgICh2aWV3VHlwZSA9PT0gQ29udGVudFR5cGUuUExBWUxJU1QpXG4gICAgICAgICAgICAgID8gPGJ1dHRvbiBjbGFzcz0nYnV0dG9uIG1ham9yIHNtYWxsJ1xuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uUGxheWxpc3RzQ2xpY2suYmluZChudWxsLCBjaGFubmVsSWQsIENvbnRlbnRUeXBlLkNIQU5ORUwpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgQ2hhbm5lbCBwbGF5bGlzdHNcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDogPHNwYW4+PC9zcGFuPlxuXG4gICAgICAgICAgfVxuXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5bGlzdEl0ZW1cbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5cbmNvbnN0IFNlYXJjaEJhciA9ICh7IG9uSW5wdXQsIG9uU3VibWl0LCBzZWxlY3RlZFR5cGUgfSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxmb3JtIGNsYXNzTmFtZT0nc2VhcmNoLWJhcicgb25TdWJtaXQ9e29uU3VibWl0fT5cbiAgICAgIDxpbnB1dCBjbGFzc05hbWU9J2lucHV0IHNlYXJjaC1iYXItcXVlcnknIHR5cGU9J3RleHQnXG4gICAgICAgIHBsYWNlaG9sZGVyPXtgVHlwZSBhICR7c2VsZWN0ZWRUeXBlfSBuYW1lYH1cbiAgICAgICAgb25JbnB1dD17b25JbnB1dH1cbiAgICAgIC8+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdidXR0b24gbWlub3Igc2VhcmNoLWJhci1hY3Rpb24nIHR5cGU9J3N1Ym1pdCc+XG4gICAgICAgIFNlYXJjaFxuICAgICAgPC9idXR0b24+XG4gICAgPC9mb3JtPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaEJhclxuIiwiY29uc3QgQXBwQ29uc3RhbnRzID0ge1xuICBERVZfTU9ERTogXCJkZXZcIixcbiAgUFJPRF9NT0RFOiBcInByb2RcIixcbiAgVEhST1RUTEVfVElNRV9NUzogMTAwMCxcbiAgQ09OVEVOVF9NQVhfUkVTVUxUUzogMjUsXG4gIFBMQVlMSVNUX0lURU1TX01BWF9SRVNVTFRTOiA1MFxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBDb25zdGFudHNcbiIsImNvbnN0IENvbnRlbnRUeXBlID0ge1xuICBQTEFZTElTVDogJ3BsYXlsaXN0JyxcbiAgQ0hBTk5FTDogJ2NoYW5uZWwnXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnRlbnRUeXBlXG4iLCJjb25zdCBQbGF5ZXJTdGF0ZSA9IHtcbiAgVU5TVEFSVEVEOiAtMSxcbiAgRU5ERUQ6IDAsXG4gIFBMQVlJTkc6IDEsXG4gIFBBVVNFRDogMixcbiAgQlVGRkVSSU5HOiAzLFxuICBWSURFT19DVUVEOiA1XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllclN0YXRlXG4iLCJjb25zdCBTZWFyY2hUeXBlID0ge1xuICAnQllfQ09OVEVOVCc6IFN5bWJvbCgnYnlfY29udGVudCcpLFxuICAnQllfQ0hBTk5FTCc6IFN5bWJvbCgnYnlfY2hhbm5lbCcpXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaFR5cGVcbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJ2luZmVybm8tY29tcG9uZW50J1xuaW1wb3J0IFlvdXR1YmVQbGF5ZXIgZnJvbSAneW91dHViZS1wbGF5ZXInXG5cbmltcG9ydCBTZWFyY2hCYXIgZnJvbSAnLi4vY29tcG9uZW50cy9TZWFyY2hCYXInXG5pbXBvcnQgUGxheWVyIGZyb20gJy4uL2NvbXBvbmVudHMvUGxheWVyJ1xuaW1wb3J0IENoYW5uZWxHcmlkIGZyb20gJy4uL2NvbXBvbmVudHMvQ2hhbm5lbEdyaWQnXG5pbXBvcnQgUGxheWxpc3RHcmlkIGZyb20gJy4uL2NvbXBvbmVudHMvUGxheWxpc3RHcmlkJ1xuaW1wb3J0IFBsYXlsaXN0IGZyb20gJy4uL2NvbXBvbmVudHMvUGxheWxpc3QnXG5pbXBvcnQgUGxheWVyQ29udHJvbHMgZnJvbSAnLi4vY29tcG9uZW50cy9QbGF5ZXJDb250cm9scydcbmltcG9ydCBOYXYgZnJvbSAnLi4vY29tcG9uZW50cy9OYXYnXG5pbXBvcnQgQ29udGVudFR5cGVTZWxlY3Rpb24gZnJvbSAnLi4vY29tcG9uZW50cy9Db250ZW50VHlwZVNlbGVjdGlvbidcblxuaW1wb3J0IFBsYXllclN0YXRlIGZyb20gJy4uL2NvbnN0YW50cy9QbGF5ZXJTdGF0ZSdcbmltcG9ydCBDb250ZW50VHlwZSBmcm9tICcuLi9jb25zdGFudHMvQ29udGVudFR5cGUnXG5pbXBvcnQgU2VhcmNoVHlwZSBmcm9tICcuLi9jb25zdGFudHMvU2VhcmNoVHlwZSdcblxuaW1wb3J0IHtcbiAgZ2V0Q29udGVudCwgZ2V0UGxheWxpc3QsIGdldFBsYXlsaXN0c0J5Q2hhbm5lbFxufSBmcm9tICcuLi9oZWxwZXJzL2FwaUJyaWRnZSdcblxuY2xhc3MgQXBwQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcGxheWVyOiBudWxsLFxuICAgICAgcXVlcnk6IFwiXCIsXG4gICAgICB2aWRzOiBbXSxcbiAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgcmVzdWx0c1BhZ2VUb2tlbjogJycsXG4gICAgICBwbGF5bGlzdFBhZ2VUb2tlbjogbnVsbCxcbiAgICAgIGN1cnJlbnRJdGVtOiBudWxsLFxuICAgICAgY3VycmVudFBsYXlsaXN0SWQ6IG51bGwsXG4gICAgICBzZWxlY3RlZENoYW5uZWxJZDogbnVsbCxcbiAgICAgIHNlbGVjdGVkVHlwZTogQ29udGVudFR5cGUuUExBWUxJU1QsXG4gICAgICB2aWV3VHlwZTogQ29udGVudFR5cGUuUExBWUxJU1QsXG4gICAgICBzZWFyY2hUeXBlOiBTZWFyY2hUeXBlLkJZX0NPTlRFTlQsXG4gICAgICBpc1BsYXlpbmc6IGZhbHNlLFxuICAgICAgaXNQbGF5bGlzdFZpc2libGU6IGZhbHNlLFxuICAgICAgaXNQbGF5ZXJNaW5pbWl6ZWQ6IHRydWUsXG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVRdWVyeUNoYW5nZSA9IHRoaXMuaGFuZGxlUXVlcnlDaGFuZ2UuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlU3VibWl0ID0gdGhpcy5oYW5kbGVTdWJtaXQuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlQ29udGVudEl0ZW1DbGljayA9IHRoaXMuaGFuZGxlQ29udGVudEl0ZW1DbGljay5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVWaWRlb0NsaWNrID0gdGhpcy5oYW5kbGVWaWRlb0NsaWNrLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZU5leHRWaWRlbyA9IHRoaXMuaGFuZGxlTmV4dFZpZGVvLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVByZXZpb3VzVmlkZW8gPSB0aGlzLmhhbmRsZVByZXZpb3VzVmlkZW8uYmluZCh0aGlzKVxuICAgIC8vIFRPRE9cbiAgICAvLyByZW5hbWUgaGFuZGxlVG9nbGVcbiAgICB0aGlzLmhhbmRsZVRvZ2dsZSA9IHRoaXMuaGFuZGxlVG9nZ2xlLmJpbmQodGhpcylcblxuICAgIHRoaXMuaGFuZGxlVG9nZ2xlUGxheWVyID0gdGhpcy5oYW5kbGVUb2dnbGVQbGF5ZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlQ29udGVudFR5cGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNvbnRlbnRUeXBlQ2hhbmdlLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVBsYXlsaXN0c0NsaWNrID0gdGhpcy5oYW5kbGVQbGF5bGlzdHNDbGljay5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVMb2FkTW9yZSA9IHRoaXMuaGFuZGxlTG9hZE1vcmUuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlUGxheWxpc3RTY3JvbGwgPSB0aGlzLmhhbmRsZVBsYXlsaXN0U2Nyb2xsLmJpbmQodGhpcylcbiAgICB0aGlzLmhhc01vcmVSZXN1bHRzID0gdGhpcy5oYXNNb3JlUmVzdWx0cy5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYXNNb3JlUGxheWxpc3RJdGVtcyA9IHRoaXMuaGFzTW9yZVBsYXlsaXN0SXRlbXMuYmluZCh0aGlzKVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwbGF5ZXI6IFlvdXR1YmVQbGF5ZXIoJ3ZpZGVvLXBsYXllcicpXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0ZS5wbGF5ZXIub24oJ3N0YXRlQ2hhbmdlJywgZSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gZS50YXJnZXQuZ2V0UGxheWVyU3RhdGUoKVxuXG4gICAgICAgIHN3aXRjaChzdGF0ZSl7XG4gICAgICAgIGNhc2UgUGxheWVyU3RhdGUuRU5ERUQ6XG4gICAgICAgICAgdGhpcy5oYW5kbGVOZXh0VmlkZW8oKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgUGxheWVyU3RhdGUuUExBWUlORzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNQbGF5aW5nOiB0cnVlIH0pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBQbGF5ZXJTdGF0ZS5QQVVTRUQ6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzUGxheWluZzogZmFsc2UgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgaGFzTW9yZVJlc3VsdHMoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5zdGF0ZS5yZXN1bHRzUGFnZVRva2VuKVxuICB9XG5cbiAgaGFzTW9yZVBsYXlsaXN0SXRlbXMoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5zdGF0ZS5wbGF5bGlzdFBhZ2VUb2tlbilcbiAgfVxuXG4gIGhhbmRsZVF1ZXJ5Q2hhbmdlKGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHF1ZXJ5OiBlLnRhcmdldC52YWx1ZVxuICAgIH0pXG4gIH1cblxuICBoYW5kbGVDb250ZW50VHlwZUNoYW5nZSh0eXBlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZXN1bHRzOiBbXSxcbiAgICAgIHJlc3VsdHNQYWdlVG9rZW46ICcnLFxuICAgICAgc2VsZWN0ZWRUeXBlOiB0eXBlLFxuICAgICAgc2VsZWN0ZWRDaGFubmVsSWQ6IG51bGxcbiAgICB9KVxuICB9XG5cbiAgaGFuZGxlU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGlmICh0aGlzLnN0YXRlLnF1ZXJ5ID09PSAnJykgcmV0dXJuXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgcmVzdWx0c1BhZ2VUb2tlbjogJycsXG4gICAgICBzZWFyY2hUeXBlOiBTZWFyY2hUeXBlLkJZX0NPTlRFTlQsXG4gICAgICBpc1BsYXlsaXN0VmlzaWJsZTogZmFsc2UsXG4gICAgICBpc1BsYXllck1pbmltaXplZDogdHJ1ZSxcbiAgICAgIHNlbGVjdGVkQ2hhbm5lbElkOiBudWxsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5mZXRjaFF1ZXJ5KFxuICAgICAgICB0aGlzLnN0YXRlLnF1ZXJ5LFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZSxcbiAgICAgICAgdGhpcy5zdGF0ZS5yZXN1bHRzUGFnZVRva2VuXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIGhhbmRsZVBsYXlsaXN0c0NsaWNrKGlkLCB2aWV3VHlwZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZS5CWV9DSEFOTkVMLFxuICAgICAgcmVzdWx0czogW10sXG4gICAgICByZXN1bHRzUGFnZVRva2VuOiAnJyxcbiAgICB9LCAoKSA9PiB0aGlzLmZldGNoUGxheWxpc3RzKGlkLCB2aWV3VHlwZSkpXG4gIH1cblxuICBmZXRjaFBsYXlsaXN0cyhpZCwgdmlld1R5cGUpIHtcbiAgICBnZXRQbGF5bGlzdHNCeUNoYW5uZWwoaWQsIHRoaXMuc3RhdGUucmVzdWx0c1BhZ2VUb2tlbilcbiAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICBsZXQgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgcmVzdWx0czogdGhpcy5zdGF0ZS5yZXN1bHRzLmNvbmNhdChkYXRhLml0ZW1zKSxcbiAgICAgICAgICByZXN1bHRzUGFnZVRva2VuOiBkYXRhLm5leHRQYWdlVG9rZW4sXG4gICAgICAgICAgc2VsZWN0ZWRUeXBlOiBDb250ZW50VHlwZS5QTEFZTElTVCxcbiAgICAgICAgICBzZWxlY3RlZENoYW5uZWxJZDogaWRcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld1R5cGUpIG5ld1N0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgbmV3U3RhdGUsIHt2aWV3VHlwZX0pXG4gICAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6ICcsIGVycikpXG4gIH1cblxuICBoYW5kbGVMb2FkTW9yZShlKSB7XG4gICAgc3dpdGNoICh0aGlzLnN0YXRlLnNlYXJjaFR5cGUpIHtcbiAgICAgIGNhc2UgU2VhcmNoVHlwZS5CWV9DT05URU5UOlxuICAgICAgICB0aGlzLmZldGNoUXVlcnkoXG4gICAgICAgICAgdGhpcy5zdGF0ZS5xdWVyeSxcbiAgICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZSxcbiAgICAgICAgICB0aGlzLnN0YXRlLnJlc3VsdHNQYWdlVG9rZW5cbiAgICAgICAgKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBTZWFyY2hUeXBlLkJZX0NIQU5ORUw6XG4gICAgICAgIHRoaXMuZmV0Y2hQbGF5bGlzdHModGhpcy5zdGF0ZS5zZWxlY3RlZENoYW5uZWxJZCwgQ29udGVudFR5cGUuQ0hBTk5FTClcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgZmV0Y2hRdWVyeShxdWVyeSwgdHlwZSwgbmV4dFBhZ2VUb2tlbikge1xuICAgIGdldENvbnRlbnQocXVlcnksIHR5cGUsIG5leHRQYWdlVG9rZW4pXG4gICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcmVzdWx0czogdGhpcy5zdGF0ZS5yZXN1bHRzLmNvbmNhdChkYXRhLml0ZW1zKSxcbiAgICAgICAgICB2aWV3VHlwZTogdHlwZSxcbiAgICAgICAgICByZXN1bHRzUGFnZVRva2VuOiBkYXRhLm5leHRQYWdlVG9rZW5cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogJywgZXJyKSlcbiAgfVxuXG4gIGhhbmRsZUNvbnRlbnRJdGVtQ2xpY2soZSwgaWQpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIHRoaXMuZmV0Y2hQbGF5bGlzdChpZCwgdGhpcy5zdGF0ZS5zZWxlY3RlZFR5cGUpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS52aWRzLmxlbmd0aCA+IDApIHJldHVyblxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGN1cnJlbnRJdGVtOiAwLFxuICAgICAgICAgIGlzUGxheWluZzogdHJ1ZSxcbiAgICAgICAgICBpc1BsYXlsaXN0VmlzaWJsZTogdHJ1ZVxuICAgICAgICB9LCB0aGlzLmxvYWRWaWRlbyh0aGlzLnN0YXRlLnZpZHNbMF0udmlkZW9JZCkpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6ICcsIGVycikpXG4gIH1cblxuICBmZXRjaFBsYXlsaXN0KGlkLCB0eXBlKSB7XG4gICAgcmV0dXJuIGdldFBsYXlsaXN0KGlkLCB0eXBlKVxuICAgICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHZpZHM6IGRhdGEuaXRlbXMsXG4gICAgICAgICAgY3VycmVudFBsYXlsaXN0SWQ6IGRhdGEucGxheWxpc3RJZCxcbiAgICAgICAgICBwbGF5bGlzdFBhZ2VUb2tlbjogZGF0YS5uZXh0UGFnZVRva2VuXG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9XG5cbiAgaGFuZGxlUGxheWxpc3RTY3JvbGwoZSkge1xuICAgIGNvbnN0IGVsID0gZS50YXJnZXRcbiAgICBjb25zdCBvZmZzZXQgPSBlbC5vZmZzZXRIZWlnaHQgKyBlbC5zY3JvbGxUb3BcbiAgICBjb25zdCBoZWlnaHQgPSBlbC5zY3JvbGxIZWlnaHQgIC0gMTAwXG4gICAgY29uc3QgaXNDbG9zZVRvRW5kID0gKG9mZnNldCkgPj0gKGhlaWdodClcblxuICAgIGlmIChpc0Nsb3NlVG9FbmQgJiYgdGhpcy5oYXNNb3JlUGxheWxpc3RJdGVtcygpKSB7XG4gICAgICBnZXRQbGF5bGlzdChcbiAgICAgICAgdGhpcy5zdGF0ZS5jdXJyZW50UGxheWxpc3RJZCxcbiAgICAgICAgQ29udGVudFR5cGUuUExBWUxJU1QsXG4gICAgICAgIHRoaXMuc3RhdGUucGxheWxpc3RQYWdlVG9rZW5cbiAgICAgIClcbiAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2aWRzOiB0aGlzLnN0YXRlLnZpZHMuY29uY2F0KGRhdGEuaXRlbXMpLFxuICAgICAgICAgIHBsYXlsaXN0UGFnZVRva2VuOiBkYXRhLm5leHRQYWdlVG9rZW5cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlVmlkZW9DbGljayhpZCwgaW5kZXgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRJdGVtOiBpbmRleCxcbiAgICAgIGlzUGxheWluZzogdHJ1ZVxuICAgIH0sICgpID0+IHRoaXMubG9hZFZpZGVvKGlkKSlcblxuICB9XG5cbiAgaGFuZGxlVG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzUGxheWluZylcbiAgICAgIHRoaXMuc3RhdGUucGxheWVyLnBhdXNlVmlkZW8oKVxuICAgIGVsc2VcbiAgICAgIHRoaXMuc3RhdGUucGxheWVyLnBsYXlWaWRlbygpXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzUGxheWluZzogIXRoaXMuc3RhdGUuaXNQbGF5aW5nXG4gICAgfSlcbiAgfVxuXG4gIGhhbmRsZVByZXZpb3VzVmlkZW8oKSB7XG4gICAgY29uc3QgcHJldmlvdXNJdGVtID0gdGhpcy5zdGF0ZS5jdXJyZW50SXRlbSAtIDFcbiAgICBpZiAoIShwcmV2aW91c0l0ZW0gPj0gMCkpIHJldHVyblxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50SXRlbTogcHJldmlvdXNJdGVtXG4gICAgfSwgKCkgPT4gdGhpcy5sb2FkVmlkZW8odGhpcy5zdGF0ZS52aWRzW3ByZXZpb3VzSXRlbV0udmlkZW9JZCkpXG4gIH1cblxuICBoYW5kbGVOZXh0VmlkZW8oKSB7XG4gICAgY29uc3QgbmV4dEl0ZW0gPSB0aGlzLnN0YXRlLmN1cnJlbnRJdGVtICsgMVxuICAgIGlmICghKG5leHRJdGVtIDwgdGhpcy5zdGF0ZS52aWRzLmxlbmd0aCkpIHJldHVyblxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50SXRlbTogbmV4dEl0ZW1cbiAgICB9LCAoKSA9PiB0aGlzLmxvYWRWaWRlbyh0aGlzLnN0YXRlLnZpZHNbbmV4dEl0ZW1dLnZpZGVvSWQpKVxuICB9XG5cbiAgaGFuZGxlVG9nZ2xlUGxheWVyKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNQbGF5ZXJNaW5pbWl6ZWQ6ICF0aGlzLnN0YXRlLmlzUGxheWVyTWluaW1pemVkXG4gICAgfSlcbiAgfVxuXG4gIGxvYWRWaWRlbyhpZCl7XG4gICAgdGhpcy5zdGF0ZS5wbGF5ZXIubG9hZFZpZGVvQnlJZChpZClcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGhlYWRlciBjbGFzcz0naGVhZGVyJz5cbiAgICAgICAgICA8TmF2PlxuICAgICAgICAgICAgPFNlYXJjaEJhclxuICAgICAgICAgICAgICBzZWxlY3RlZFR5cGU9e3RoaXMuc3RhdGUuc2VsZWN0ZWRUeXBlfVxuICAgICAgICAgICAgICBvbklucHV0PXt0aGlzLmhhbmRsZVF1ZXJ5Q2hhbmdlfVxuICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvTmF2PlxuICAgICAgICAgIDxDb250ZW50VHlwZVNlbGVjdGlvblxuICAgICAgICAgICAgb25Db250ZW50VHlwZUNsaWNrPXt0aGlzLmhhbmRsZUNvbnRlbnRUeXBlQ2hhbmdlfVxuICAgICAgICAgICAgc2VsZWN0ZWRUeXBlPXt0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2hlYWRlcj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2VudHJhbFwiPlxuICAgICAgICAgIHtcbiAgICAgICAgICAgICh0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZSA9PT0gQ29udGVudFR5cGUuQ0hBTk5FTClcbiAgICAgICAgICAgID8gPENoYW5uZWxHcmlkXG4gICAgICAgICAgICAgICAgaXRlbXM9e3RoaXMuc3RhdGUucmVzdWx0c31cbiAgICAgICAgICAgICAgICBoYXNNb3JlUmVzdWx0cz17dGhpcy5oYXNNb3JlUmVzdWx0c31cbiAgICAgICAgICAgICAgICBvbkNvbnRlbnRJdGVtQ2xpY2s9e3RoaXMuaGFuZGxlQ29udGVudEl0ZW1DbGlja31cbiAgICAgICAgICAgICAgICBvblBsYXlsaXN0c0NsaWNrPXt0aGlzLmhhbmRsZVBsYXlsaXN0c0NsaWNrfVxuICAgICAgICAgICAgICAgIG9uTG9hZE1vcmU9e3RoaXMuaGFuZGxlTG9hZE1vcmV9XG5cblxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgOiA8UGxheWxpc3RHcmlkXG4gICAgICAgICAgICAgICAgaXRlbXM9e3RoaXMuc3RhdGUucmVzdWx0c31cbiAgICAgICAgICAgICAgICB2aWV3VHlwZT17dGhpcy5zdGF0ZS52aWV3VHlwZX1cbiAgICAgICAgICAgICAgICBoYXNNb3JlUmVzdWx0cz17dGhpcy5oYXNNb3JlUmVzdWx0c31cbiAgICAgICAgICAgICAgICBvbkNvbnRlbnRJdGVtQ2xpY2s9e3RoaXMuaGFuZGxlQ29udGVudEl0ZW1DbGlja31cbiAgICAgICAgICAgICAgICBvblBsYXlsaXN0c0NsaWNrPXt0aGlzLmhhbmRsZVBsYXlsaXN0c0NsaWNrfVxuICAgICAgICAgICAgICAgIG9uTG9hZE1vcmU9e3RoaXMuaGFuZGxlTG9hZE1vcmV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgPFBsYXlsaXN0XG4gICAgICAgICAgICB2aWRzPXt0aGlzLnN0YXRlLnZpZHN9XG4gICAgICAgICAgICBjdXJyZW50SXRlbT17dGhpcy5zdGF0ZS5jdXJyZW50SXRlbX1cbiAgICAgICAgICAgIGlzVmlzaWJsZT17dGhpcy5zdGF0ZS5pc1BsYXlsaXN0VmlzaWJsZX1cbiAgICAgICAgICAgIG9uVmlkZW9DbGljaz17dGhpcy5oYW5kbGVWaWRlb0NsaWNrfVxuICAgICAgICAgICAgb25TY3JvbGw9e3RoaXMuaGFuZGxlUGxheWxpc3RTY3JvbGx9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPFBsYXllclxuICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnN0YXRlLmlzUGxheWVyTWluaW1pemVkfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxQbGF5ZXJDb250cm9sc1xuICAgICAgICAgIG9uTmV4dD17dGhpcy5oYW5kbGVOZXh0VmlkZW99XG4gICAgICAgICAgb25QcmV2aW91cz17dGhpcy5oYW5kbGVQcmV2aW91c1ZpZGVvfVxuICAgICAgICAgIG9uVG9nZ2xlPXt0aGlzLmhhbmRsZVRvZ2dsZX1cbiAgICAgICAgICBpc1BsYXllck1pbmltaXplZD17dGhpcy5zdGF0ZS5pc1BsYXllck1pbmltaXplZH1cbiAgICAgICAgICBpc1BsYXlpbmc9e3RoaXMuc3RhdGUuaXNQbGF5aW5nfVxuICAgICAgICAgIG9uVG9nZ2xlUGxheWVyPXt0aGlzLmhhbmRsZVRvZ2dsZVBsYXllcn1cbiAgICAgICAgLz5cblxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcENvbnRhaW5lclxuIiwiY29uc3QgQXBwTW9kZSA9IHJlcXVpcmUoJy4uLy4uL2FwcGNvbmZpZycpLm1vZGVcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnLi4vY29uc3RhbnRzL0FwcENvbnN0YW50cydcblxubGV0IGFwaUJyaWRnZSA9IChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIChBcHBNb2RlID09PSBBcHBDb25zdGFudHMuREVWX01PREUpXG4gICAgPyByZXF1aXJlKCcuLi8uLi90ZXN0L2hlbHBlcnMvYXBpRml4dHVyZScpXG4gICAgOiByZXF1aXJlKCcuLi9hcGknKVxufSkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaUJyaWRnZVxuIiwiaW1wb3J0IEluZmVybm8gZnJvbSAnaW5mZXJubydcbmltcG9ydCBBcHBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXJzL0FwcENvbnRhaW5lcidcblxuSW5mZXJuby5yZW5kZXIoPEFwcENvbnRhaW5lciAvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpKVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm1vZGVcIjogXCJkZXZcIlxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImtleVwiOiBcIkFJemFTeUN0Z09oaUY5a1NxdkhkeUdvYTFwUk1KaURjSlF6V0hta1wiXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX3Byb21pc2UgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9wcm9taXNlXCIpO1xuXG52YXIgX3Byb21pc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvbWlzZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW4gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBuZXcgX3Byb21pc2UyLmRlZmF1bHQoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gc3RlcChrZXksIGFyZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfcHJvbWlzZTIuZGVmYXVsdC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc3RlcChcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHN0ZXAoXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGVwKFwibmV4dFwiKTtcbiAgICB9KTtcbiAgfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5Qcm9taXNlOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXsgLyogZW1wdHkgKi8gfTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSwgZm9yYmlkZGVuRmllbGQpe1xuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHx8IChmb3JiaWRkZW5GaWVsZCAhPT0gdW5kZWZpbmVkICYmIGZvcmJpZGRlbkZpZWxkIGluIGl0KSl7XG4gICAgdGhyb3cgVHlwZUVycm9yKG5hbWUgKyAnOiBpbmNvcnJlY3QgaW52b2NhdGlvbiEnKTtcbiAgfSByZXR1cm4gaXQ7XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgdG9MZW5ndGggID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCB0b0luZGV4ICAgPSByZXF1aXJlKCcuL190by1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgZWwsIGZyb21JbmRleCl7XG4gICAgdmFyIE8gICAgICA9IHRvSU9iamVjdCgkdGhpcylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpXG4gICAgICAsIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICBpZihJU19JTkNMVURFUyAmJiBlbCAhPSBlbCl3aGlsZShsZW5ndGggPiBpbmRleCl7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICBpZih2YWx1ZSAhPSB2YWx1ZSlyZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSN0b0luZGV4IGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTsiLCIvLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpXG4gICwgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLy8gRVMzIHdyb25nIGhlcmVcbiAgLCBBUkcgPSBjb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59OyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMi40LjAnfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcbikuc3BsaXQoJywnKTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCBJU19XUkFQICAgPSB0eXBlICYgJGV4cG9ydC5XXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgZXhwUHJvdG8gID0gZXhwb3J0c1tQUk9UT1RZUEVdXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBrZXksIG93biwgb3V0O1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBleHBvcnRzW2tleV0gPSBJU19HTE9CQUwgJiYgdHlwZW9mIHRhcmdldFtrZXldICE9ICdmdW5jdGlvbicgPyBzb3VyY2Vba2V5XVxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgOiBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbClcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIDogSVNfV1JBUCAmJiB0YXJnZXRba2V5XSA9PSBvdXQgPyAoZnVuY3Rpb24oQyl7XG4gICAgICB2YXIgRiA9IGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQyl7XG4gICAgICAgICAgc3dpdGNoKGFyZ3VtZW50cy5sZW5ndGgpe1xuICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gbmV3IEM7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBuZXcgQyhhKTtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIG5ldyBDKGEsIGIpO1xuICAgICAgICAgIH0gcmV0dXJuIG5ldyBDKGEsIGIsIGMpO1xuICAgICAgICB9IHJldHVybiBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5tZXRob2RzLiVOQU1FJVxuICAgIGlmKElTX1BST1RPKXtcbiAgICAgIChleHBvcnRzLnZpcnR1YWwgfHwgKGV4cG9ydHMudmlydHVhbCA9IHt9KSlba2V5XSA9IG91dDtcbiAgICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5wcm90b3R5cGUuJU5BTUUlXG4gICAgICBpZih0eXBlICYgJGV4cG9ydC5SICYmIGV4cFByb3RvICYmICFleHBQcm90b1trZXldKWhpZGUoZXhwUHJvdG8sIGtleSwgb3V0KTtcbiAgICB9XG4gIH1cbn07XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgIFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsInZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi9faXMtYXJyYXktaXRlcicpXG4gICwgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCBnZXRJdGVyRm4gICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJylcbiAgLCBCUkVBSyAgICAgICA9IHt9XG4gICwgUkVUVVJOICAgICAgPSB7fTtcbnZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQsIElURVJBVE9SKXtcbiAgdmFyIGl0ZXJGbiA9IElURVJBVE9SID8gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXJhYmxlOyB9IDogZ2V0SXRlckZuKGl0ZXJhYmxlKVxuICAgICwgZiAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yLCByZXN1bHQ7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXRlcmFibGUgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgLy8gZmFzdCBjYXNlIGZvciBhcnJheXMgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yXG4gIGlmKGlzQXJyYXlJdGVyKGl0ZXJGbikpZm9yKGxlbmd0aCA9IHRvTGVuZ3RoKGl0ZXJhYmxlLmxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICByZXN1bHQgPSBlbnRyaWVzID8gZihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSkgOiBmKGl0ZXJhYmxlW2luZGV4XSk7XG4gICAgaWYocmVzdWx0ID09PSBCUkVBSyB8fCByZXN1bHQgPT09IFJFVFVSTilyZXR1cm4gcmVzdWx0O1xuICB9IGVsc2UgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7ICl7XG4gICAgcmVzdWx0ID0gY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gICAgaWYocmVzdWx0ID09PSBCUkVBSyB8fCByZXN1bHQgPT09IFJFVFVSTilyZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuZXhwb3J0cy5CUkVBSyAgPSBCUkVBSztcbmV4cG9ydHMuUkVUVVJOID0gUkVUVVJOOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTsiLCJ2YXIgZFAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7IiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTsiLCIvLyBmYXN0IGFwcGx5LCBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIGFyZ3MsIHRoYXQpe1xuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcbn07IiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07IiwiLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxudmFyIEl0ZXJhdG9ycyAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIElURVJBVE9SICAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2goZSl7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZihyZXQgIT09IHVuZGVmaW5lZClhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNyZWF0ZSAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi9fbGlicmFyeScpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIEl0ZXJhdG9ycyAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY3JlYXRlJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4vX29iamVjdC1ncG8nKVxuICAsIElURVJBVE9SICAgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBCVUdHWSAgICAgICAgICA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKSAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gICwgRkZfSVRFUkFUT1IgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKXtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgaWYoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHICAgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTXG4gICAgLCBWQUxVRVNfQlVHID0gZmFsc2VcbiAgICAsIHByb3RvICAgICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgJG5hdGl2ZSAgICA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgJGRlZmF1bHQgICA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpXG4gICAgLCAkZW50cmllcyAgID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZFxuICAgICwgJGFueU5hdGl2ZSA9IE5BTUUgPT0gJ0FycmF5JyA/IHByb3RvLmVudHJpZXMgfHwgJG5hdGl2ZSA6ICRuYXRpdmVcbiAgICAsIG1ldGhvZHMsIGtleSwgSXRlcmF0b3JQcm90b3R5cGU7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoJGFueU5hdGl2ZSl7XG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZigkYW55TmF0aXZlLmNhbGwobmV3IEJhc2UpKTtcbiAgICBpZihJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSl7XG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAgIC8vIGZpeCBmb3Igc29tZSBvbGQgZW5naW5lc1xuICAgICAgaWYoIUxJQlJBUlkgJiYgIWhhcyhJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZihERUZfVkFMVUVTICYmICRuYXRpdmUgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpe1xuICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCghTElCUkFSWSB8fCBGT1JDRUQpICYmIChCVUdHWSB8fCBWQUxVRVNfQlVHIHx8ICFwcm90b1tJVEVSQVRPUl0pKXtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9IHJldHVyblRoaXM7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6ICBERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICRlbnRyaWVzXG4gICAgfTtcbiAgICBpZihGT1JDRUQpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSlyZWRlZmluZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIChCVUdHWSB8fCBWQUxVRVNfQlVHKSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbiAgcmV0dXJuIG1ldGhvZHM7XG59OyIsInZhciBJVEVSQVRPUiAgICAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMsIHNraXBDbG9zaW5nKXtcbiAgaWYoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgcmV0dXJuIHtkb25lOiBzYWZlID0gdHJ1ZX07IH07XG4gICAgYXJyW0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkb25lLCB2YWx1ZSl7XG4gIHJldHVybiB7dmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmV9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHt9OyIsIm1vZHVsZS5leHBvcnRzID0gdHJ1ZTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBtYWNyb3Rhc2sgPSByZXF1aXJlKCcuL190YXNrJykuc2V0XG4gICwgT2JzZXJ2ZXIgID0gZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgZ2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXJcbiAgLCBwcm9jZXNzICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsIFByb21pc2UgICA9IGdsb2JhbC5Qcm9taXNlXG4gICwgaXNOb2RlICAgID0gcmVxdWlyZSgnLi9fY29mJykocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBoZWFkLCBsYXN0LCBub3RpZnk7XG5cbiAgdmFyIGZsdXNoID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcGFyZW50LCBmbjtcbiAgICBpZihpc05vZGUgJiYgKHBhcmVudCA9IHByb2Nlc3MuZG9tYWluKSlwYXJlbnQuZXhpdCgpO1xuICAgIHdoaWxlKGhlYWQpe1xuICAgICAgZm4gICA9IGhlYWQuZm47XG4gICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm4oKTtcbiAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIGlmKGhlYWQpbm90aWZ5KCk7XG4gICAgICAgIGVsc2UgbGFzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgaWYocGFyZW50KXBhcmVudC5lbnRlcigpO1xuICB9O1xuXG4gIC8vIE5vZGUuanNcbiAgaWYoaXNOb2RlKXtcbiAgICBub3RpZnkgPSBmdW5jdGlvbigpe1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgfTtcbiAgLy8gYnJvd3NlcnMgd2l0aCBNdXRhdGlvbk9ic2VydmVyXG4gIH0gZWxzZSBpZihPYnNlcnZlcil7XG4gICAgdmFyIHRvZ2dsZSA9IHRydWVcbiAgICAgICwgbm9kZSAgID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgIG5ldyBPYnNlcnZlcihmbHVzaCkub2JzZXJ2ZShub2RlLCB7Y2hhcmFjdGVyRGF0YTogdHJ1ZX0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uKCl7XG4gICAgICBub2RlLmRhdGEgPSB0b2dnbGUgPSAhdG9nZ2xlO1xuICAgIH07XG4gIC8vIGVudmlyb25tZW50cyB3aXRoIG1heWJlIG5vbi1jb21wbGV0ZWx5IGNvcnJlY3QsIGJ1dCBleGlzdGVudCBQcm9taXNlXG4gIH0gZWxzZSBpZihQcm9taXNlICYmIFByb21pc2UucmVzb2x2ZSl7XG4gICAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBub3RpZnkgPSBmdW5jdGlvbigpe1xuICAgICAgcHJvbWlzZS50aGVuKGZsdXNoKTtcbiAgICB9O1xuICAvLyBmb3Igb3RoZXIgZW52aXJvbm1lbnRzIC0gbWFjcm90YXNrIGJhc2VkIG9uOlxuICAvLyAtIHNldEltbWVkaWF0ZVxuICAvLyAtIE1lc3NhZ2VDaGFubmVsXG4gIC8vIC0gd2luZG93LnBvc3RNZXNzYWdcbiAgLy8gLSBvbnJlYWR5c3RhdGVjaGFuZ2VcbiAgLy8gLSBzZXRUaW1lb3V0XG4gIH0gZWxzZSB7XG4gICAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcbiAgICAgIC8vIHN0cmFuZ2UgSUUgKyB3ZWJwYWNrIGRldiBzZXJ2ZXIgYnVnIC0gdXNlIC5jYWxsKGdsb2JhbClcbiAgICAgIG1hY3JvdGFzay5jYWxsKGdsb2JhbCwgZmx1c2gpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oZm4pe1xuICAgIHZhciB0YXNrID0ge2ZuOiBmbiwgbmV4dDogdW5kZWZpbmVkfTtcbiAgICBpZihsYXN0KWxhc3QubmV4dCA9IHRhc2s7XG4gICAgaWYoIWhlYWQpe1xuICAgICAgaGVhZCA9IHRhc2s7XG4gICAgICBub3RpZnkoKTtcbiAgICB9IGxhc3QgPSB0YXNrO1xuICB9O1xufTsiLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbnZhciBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgZFBzICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHBzJylcbiAgLCBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKVxuICAsIElFX1BST1RPICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpXG4gICwgRW1wdHkgICAgICAgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9XG4gICwgUFJPVE9UWVBFICAgPSAncHJvdG90eXBlJztcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbigpe1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdpZnJhbWUnKVxuICAgICwgaSAgICAgID0gZW51bUJ1Z0tleXMubGVuZ3RoXG4gICAgLCBsdCAgICAgPSAnPCdcbiAgICAsIGd0ICAgICA9ICc+J1xuICAgICwgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICByZXF1aXJlKCcuL19odG1sJykuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUobHQgKyAnc2NyaXB0JyArIGd0ICsgJ2RvY3VtZW50LkY9T2JqZWN0JyArIGx0ICsgJy9zY3JpcHQnICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUoaS0tKWRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKXtcbiAgdmFyIHJlc3VsdDtcbiAgaWYoTyAhPT0gbnVsbCl7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG4iLCJ2YXIgYW5PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKVxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcbiAgLCBkUCAgICAgICAgICAgICA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpe1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmKCd2YWx1ZScgaW4gQXR0cmlidXRlcylPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59OyIsInZhciBkUCAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIGdldEtleXMgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpe1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgICA9IGdldEtleXMoUHJvcGVydGllcylcbiAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgLCBpID0gMFxuICAgICwgUDtcbiAgd2hpbGUobGVuZ3RoID4gaSlkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07IiwiLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcbnZhciBoYXMgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuL190by1vYmplY3QnKVxuICAsIElFX1BST1RPICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpXG4gICwgT2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbihPKXtcbiAgTyA9IHRvT2JqZWN0KE8pO1xuICBpZihoYXMoTywgSUVfUFJPVE8pKXJldHVybiBPW0lFX1BST1RPXTtcbiAgaWYodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcil7XG4gICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xufTsiLCJ2YXIgaGFzICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCB0b0lPYmplY3QgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCBhcnJheUluZGV4T2YgPSByZXF1aXJlKCcuL19hcnJheS1pbmNsdWRlcycpKGZhbHNlKVxuICAsIElFX1BST1RPICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIG5hbWVzKXtcbiAgdmFyIE8gICAgICA9IHRvSU9iamVjdChvYmplY3QpXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwga2V5O1xuICBmb3Ioa2V5IGluIE8paWYoa2V5ICE9IElFX1BST1RPKWhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpe1xuICAgIH5hcnJheUluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgJGtleXMgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpXG4gICwgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKXtcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsInZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYywgc2FmZSl7XG4gIGZvcih2YXIga2V5IGluIHNyYyl7XG4gICAgaWYoc2FmZSAmJiB0YXJnZXRba2V5XSl0YXJnZXRba2V5XSA9IHNyY1trZXldO1xuICAgIGVsc2UgaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICB9IHJldHVybiB0YXJnZXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faGlkZScpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBnbG9iYWwgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgY29yZSAgICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBkUCAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpXG4gICwgU1BFQ0lFUyAgICAgPSByZXF1aXJlKCcuL193a3MnKSgnc3BlY2llcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEtFWSl7XG4gIHZhciBDID0gdHlwZW9mIGNvcmVbS0VZXSA9PSAnZnVuY3Rpb24nID8gY29yZVtLRVldIDogZ2xvYmFsW0tFWV07XG4gIGlmKERFU0NSSVBUT1JTICYmIEMgJiYgIUNbU1BFQ0lFU10pZFAuZihDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH1cbiAgfSk7XG59OyIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mXG4gICwgaGFzID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTsiLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ2tleXMnKVxuICAsIHVpZCAgICA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc2hhcmVkW2tleV0gfHwgKHNoYXJlZFtrZXldID0gdWlkKGtleSkpO1xufTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJ1xuICAsIHN0b3JlICA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB7fSk7XG59OyIsIi8vIDcuMy4yMCBTcGVjaWVzQ29uc3RydWN0b3IoTywgZGVmYXVsdENvbnN0cnVjdG9yKVxudmFyIGFuT2JqZWN0ICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpXG4gICwgU1BFQ0lFUyAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTywgRCl7XG4gIHZhciBDID0gYW5PYmplY3QoTykuY29uc3RydWN0b3IsIFM7XG4gIHJldHVybiBDID09PSB1bmRlZmluZWQgfHwgKFMgPSBhbk9iamVjdChDKVtTUEVDSUVTXSkgPT0gdW5kZWZpbmVkID8gRCA6IGFGdW5jdGlvbihTKTtcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIGRlZmluZWQgICA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbi8vIHRydWUgIC0+IFN0cmluZyNhdFxuLy8gZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRPX1NUUklORyl7XG4gIHJldHVybiBmdW5jdGlvbih0aGF0LCBwb3Mpe1xuICAgIHZhciBzID0gU3RyaW5nKGRlZmluZWQodGhhdCkpXG4gICAgICAsIGkgPSB0b0ludGVnZXIocG9zKVxuICAgICAgLCBsID0gcy5sZW5ndGhcbiAgICAgICwgYSwgYjtcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcbiAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXG4gICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07IiwidmFyIGN0eCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgaW52b2tlICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faW52b2tlJylcbiAgLCBodG1sICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19odG1sJylcbiAgLCBjZWwgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJylcbiAgLCBnbG9iYWwgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxuICAsIGNsZWFyVGFzayAgICAgICAgICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxuICAsIE1lc3NhZ2VDaGFubmVsICAgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcbiAgLCBxdWV1ZSAgICAgICAgICAgICAgPSB7fVxuICAsIE9OUkVBRFlTVEFURUNIQU5HRSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XG52YXIgcnVuID0gZnVuY3Rpb24oKXtcbiAgdmFyIGlkID0gK3RoaXM7XG4gIGlmKHF1ZXVlLmhhc093blByb3BlcnR5KGlkKSl7XG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gICAgZm4oKTtcbiAgfVxufTtcbnZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcnVuLmNhbGwoZXZlbnQuZGF0YSk7XG59O1xuLy8gTm9kZS5qcyAwLjkrICYgSUUxMCsgaGFzIHNldEltbWVkaWF0ZSwgb3RoZXJ3aXNlOlxuaWYoIXNldFRhc2sgfHwgIWNsZWFyVGFzayl7XG4gIHNldFRhc2sgPSBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoZm4pe1xuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xuICAgIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uKCl7XG4gICAgICBpbnZva2UodHlwZW9mIGZuID09ICdmdW5jdGlvbicgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XG4gICAgfTtcbiAgICBkZWZlcihjb3VudGVyKTtcbiAgICByZXR1cm4gY291bnRlcjtcbiAgfTtcbiAgY2xlYXJUYXNrID0gZnVuY3Rpb24gY2xlYXJJbW1lZGlhdGUoaWQpe1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gIH07XG4gIC8vIE5vZGUuanMgMC44LVxuICBpZihyZXF1aXJlKCcuL19jb2YnKShwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjdHgocnVuLCBpZCwgMSkpO1xuICAgIH07XG4gIC8vIEJyb3dzZXJzIHdpdGggTWVzc2FnZUNoYW5uZWwsIGluY2x1ZGVzIFdlYldvcmtlcnNcbiAgfSBlbHNlIGlmKE1lc3NhZ2VDaGFubmVsKXtcbiAgICBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xuICAgIHBvcnQgICAgPSBjaGFubmVsLnBvcnQyO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdGVuZXI7XG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XG4gIC8vIEJyb3dzZXJzIHdpdGggcG9zdE1lc3NhZ2UsIHNraXAgV2ViV29ya2Vyc1xuICAvLyBJRTggaGFzIHBvc3RNZXNzYWdlLCBidXQgaXQncyBzeW5jICYgdHlwZW9mIGl0cyBwb3N0TWVzc2FnZSBpcyAnb2JqZWN0J1xuICB9IGVsc2UgaWYoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgdHlwZW9mIHBvc3RNZXNzYWdlID09ICdmdW5jdGlvbicgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShpZCArICcnLCAnKicpO1xuICAgIH07XG4gICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAvLyBJRTgtXG4gIH0gZWxzZSBpZihPTlJFQURZU1RBVEVDSEFOR0UgaW4gY2VsKCdzY3JpcHQnKSl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBodG1sLmFwcGVuZENoaWxkKGNlbCgnc2NyaXB0JykpW09OUkVBRFlTVEFURUNIQU5HRV0gPSBmdW5jdGlvbigpe1xuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICBydW4uY2FsbChpZCk7XG4gICAgICB9O1xuICAgIH07XG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXG4gIH0gZWxzZSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBzZXRUaW1lb3V0KGN0eChydW4sIGlkLCAxKSwgMCk7XG4gICAgfTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogICBzZXRUYXNrLFxuICBjbGVhcjogY2xlYXJUYXNrXG59OyIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtYXggICAgICAgPSBNYXRoLm1heFxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKXtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07IiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59OyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0JylcbiAgLCBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07IiwiLy8gNy4xLjEzIFRvT2JqZWN0KGFyZ3VtZW50KVxudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIFMpe1xuICBpZighaXNPYmplY3QoaXQpKXJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZighUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59OyIsInZhciBpZCA9IDBcbiAgLCBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59OyIsInZhciBzdG9yZSAgICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpXG4gICwgdWlkICAgICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpXG4gICwgU3ltYm9sICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbFxuICAsIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlOyIsInZhciBjbGFzc29mICAgPSByZXF1aXJlKCcuL19jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZClyZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBhZGRUb1Vuc2NvcGFibGVzID0gcmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJylcbiAgLCBJdGVyYXRvcnMgICAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCB0b0lPYmplY3QgICAgICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgdGhpcy5fdCA9IHRvSU9iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICB0aGlzLl9rID0ga2luZDsgICAgICAgICAgICAgICAgLy8ga2luZFxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBraW5kICA9IHRoaXMuX2tcbiAgICAsIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XG4gICAgdGhpcy5fdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3RlcCgxKTtcbiAgfVxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcbiAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuYWRkVG9VbnNjb3BhYmxlcygna2V5cycpO1xuYWRkVG9VbnNjb3BhYmxlcygndmFsdWVzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCdlbnRyaWVzJyk7IiwiIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKVxuICAsIGdsb2JhbCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgY3R4ICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBjbGFzc29mICAgICAgICAgICAgPSByZXF1aXJlKCcuL19jbGFzc29mJylcbiAgLCAkZXhwb3J0ICAgICAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIGlzT2JqZWN0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgYUZ1bmN0aW9uICAgICAgICAgID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpXG4gICwgYW5JbnN0YW5jZSAgICAgICAgID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKVxuICAsIGZvck9mICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2Zvci1vZicpXG4gICwgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9fc3BlY2llcy1jb25zdHJ1Y3RvcicpXG4gICwgdGFzayAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldFxuICAsIG1pY3JvdGFzayAgICAgICAgICA9IHJlcXVpcmUoJy4vX21pY3JvdGFzaycpKClcbiAgLCBQUk9NSVNFICAgICAgICAgICAgPSAnUHJvbWlzZSdcbiAgLCBUeXBlRXJyb3IgICAgICAgICAgPSBnbG9iYWwuVHlwZUVycm9yXG4gICwgcHJvY2VzcyAgICAgICAgICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCAkUHJvbWlzZSAgICAgICAgICAgPSBnbG9iYWxbUFJPTUlTRV1cbiAgLCBwcm9jZXNzICAgICAgICAgICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsIGlzTm9kZSAgICAgICAgICAgICA9IGNsYXNzb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnXG4gICwgZW1wdHkgICAgICAgICAgICAgID0gZnVuY3Rpb24oKXsgLyogZW1wdHkgKi8gfVxuICAsIEludGVybmFsLCBHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHksIFdyYXBwZXI7XG5cbnZhciBVU0VfTkFUSVZFID0gISFmdW5jdGlvbigpe1xuICB0cnkge1xuICAgIC8vIGNvcnJlY3Qgc3ViY2xhc3Npbmcgd2l0aCBAQHNwZWNpZXMgc3VwcG9ydFxuICAgIHZhciBwcm9taXNlICAgICA9ICRQcm9taXNlLnJlc29sdmUoMSlcbiAgICAgICwgRmFrZVByb21pc2UgPSAocHJvbWlzZS5jb25zdHJ1Y3RvciA9IHt9KVtyZXF1aXJlKCcuL193a3MnKSgnc3BlY2llcycpXSA9IGZ1bmN0aW9uKGV4ZWMpeyBleGVjKGVtcHR5LCBlbXB0eSk7IH07XG4gICAgLy8gdW5oYW5kbGVkIHJlamVjdGlvbnMgdHJhY2tpbmcgc3VwcG9ydCwgTm9kZUpTIFByb21pc2Ugd2l0aG91dCBpdCBmYWlscyBAQHNwZWNpZXMgdGVzdFxuICAgIHJldHVybiAoaXNOb2RlIHx8IHR5cGVvZiBQcm9taXNlUmVqZWN0aW9uRXZlbnQgPT0gJ2Z1bmN0aW9uJykgJiYgcHJvbWlzZS50aGVuKGVtcHR5KSBpbnN0YW5jZW9mIEZha2VQcm9taXNlO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG59KCk7XG5cbi8vIGhlbHBlcnNcbnZhciBzYW1lQ29uc3RydWN0b3IgPSBmdW5jdGlvbihhLCBiKXtcbiAgLy8gd2l0aCBsaWJyYXJ5IHdyYXBwZXIgc3BlY2lhbCBjYXNlXG4gIHJldHVybiBhID09PSBiIHx8IGEgPT09ICRQcm9taXNlICYmIGIgPT09IFdyYXBwZXI7XG59O1xudmFyIGlzVGhlbmFibGUgPSBmdW5jdGlvbihpdCl7XG4gIHZhciB0aGVuO1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmIHR5cGVvZiAodGhlbiA9IGl0LnRoZW4pID09ICdmdW5jdGlvbicgPyB0aGVuIDogZmFsc2U7XG59O1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24oQyl7XG4gIHJldHVybiBzYW1lQ29uc3RydWN0b3IoJFByb21pc2UsIEMpXG4gICAgPyBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICA6IG5ldyBHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG59O1xudmFyIFByb21pc2VDYXBhYmlsaXR5ID0gR2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24oQyl7XG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBDKGZ1bmN0aW9uKCQkcmVzb2x2ZSwgJCRyZWplY3Qpe1xuICAgIGlmKHJlc29sdmUgIT09IHVuZGVmaW5lZCB8fCByZWplY3QgIT09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoJ0JhZCBQcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgcmVzb2x2ZSA9ICQkcmVzb2x2ZTtcbiAgICByZWplY3QgID0gJCRyZWplY3Q7XG4gIH0pO1xuICB0aGlzLnJlc29sdmUgPSBhRnVuY3Rpb24ocmVzb2x2ZSk7XG4gIHRoaXMucmVqZWN0ICA9IGFGdW5jdGlvbihyZWplY3QpO1xufTtcbnZhciBwZXJmb3JtID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB7ZXJyb3I6IGV9O1xuICB9XG59O1xudmFyIG5vdGlmeSA9IGZ1bmN0aW9uKHByb21pc2UsIGlzUmVqZWN0KXtcbiAgaWYocHJvbWlzZS5fbilyZXR1cm47XG4gIHByb21pc2UuX24gPSB0cnVlO1xuICB2YXIgY2hhaW4gPSBwcm9taXNlLl9jO1xuICBtaWNyb3Rhc2soZnVuY3Rpb24oKXtcbiAgICB2YXIgdmFsdWUgPSBwcm9taXNlLl92XG4gICAgICAsIG9rICAgID0gcHJvbWlzZS5fcyA9PSAxXG4gICAgICAsIGkgICAgID0gMDtcbiAgICB2YXIgcnVuID0gZnVuY3Rpb24ocmVhY3Rpb24pe1xuICAgICAgdmFyIGhhbmRsZXIgPSBvayA/IHJlYWN0aW9uLm9rIDogcmVhY3Rpb24uZmFpbFxuICAgICAgICAsIHJlc29sdmUgPSByZWFjdGlvbi5yZXNvbHZlXG4gICAgICAgICwgcmVqZWN0ICA9IHJlYWN0aW9uLnJlamVjdFxuICAgICAgICAsIGRvbWFpbiAgPSByZWFjdGlvbi5kb21haW5cbiAgICAgICAgLCByZXN1bHQsIHRoZW47XG4gICAgICB0cnkge1xuICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICBpZighb2spe1xuICAgICAgICAgICAgaWYocHJvbWlzZS5faCA9PSAyKW9uSGFuZGxlVW5oYW5kbGVkKHByb21pc2UpO1xuICAgICAgICAgICAgcHJvbWlzZS5faCA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKGhhbmRsZXIgPT09IHRydWUpcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZihkb21haW4pZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyKHZhbHVlKTtcbiAgICAgICAgICAgIGlmKGRvbWFpbilkb21haW4uZXhpdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihyZXN1bHQgPT09IHJlYWN0aW9uLnByb21pc2Upe1xuICAgICAgICAgICAgcmVqZWN0KFR5cGVFcnJvcignUHJvbWlzZS1jaGFpbiBjeWNsZScpKTtcbiAgICAgICAgICB9IGVsc2UgaWYodGhlbiA9IGlzVGhlbmFibGUocmVzdWx0KSl7XG4gICAgICAgICAgICB0aGVuLmNhbGwocmVzdWx0LCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSByZWplY3QodmFsdWUpO1xuICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSlydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXG4gICAgcHJvbWlzZS5fYyA9IFtdO1xuICAgIHByb21pc2UuX24gPSBmYWxzZTtcbiAgICBpZihpc1JlamVjdCAmJiAhcHJvbWlzZS5faClvblVuaGFuZGxlZChwcm9taXNlKTtcbiAgfSk7XG59O1xudmFyIG9uVW5oYW5kbGVkID0gZnVuY3Rpb24ocHJvbWlzZSl7XG4gIHRhc2suY2FsbChnbG9iYWwsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdlxuICAgICAgLCBhYnJ1cHQsIGhhbmRsZXIsIGNvbnNvbGU7XG4gICAgaWYoaXNVbmhhbmRsZWQocHJvbWlzZSkpe1xuICAgICAgYWJydXB0ID0gcGVyZm9ybShmdW5jdGlvbigpe1xuICAgICAgICBpZihpc05vZGUpe1xuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9IGVsc2UgaWYoaGFuZGxlciA9IGdsb2JhbC5vbnVuaGFuZGxlZHJlamVjdGlvbil7XG4gICAgICAgICAgaGFuZGxlcih7cHJvbWlzZTogcHJvbWlzZSwgcmVhc29uOiB2YWx1ZX0pO1xuICAgICAgICB9IGVsc2UgaWYoKGNvbnNvbGUgPSBnbG9iYWwuY29uc29sZSkgJiYgY29uc29sZS5lcnJvcil7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEJyb3dzZXJzIHNob3VsZCBub3QgdHJpZ2dlciBgcmVqZWN0aW9uSGFuZGxlZGAgZXZlbnQgaWYgaXQgd2FzIGhhbmRsZWQgaGVyZSwgTm9kZUpTIC0gc2hvdWxkXG4gICAgICBwcm9taXNlLl9oID0gaXNOb2RlIHx8IGlzVW5oYW5kbGVkKHByb21pc2UpID8gMiA6IDE7XG4gICAgfSBwcm9taXNlLl9hID0gdW5kZWZpbmVkO1xuICAgIGlmKGFicnVwdCl0aHJvdyBhYnJ1cHQuZXJyb3I7XG4gIH0pO1xufTtcbnZhciBpc1VuaGFuZGxlZCA9IGZ1bmN0aW9uKHByb21pc2Upe1xuICBpZihwcm9taXNlLl9oID09IDEpcmV0dXJuIGZhbHNlO1xuICB2YXIgY2hhaW4gPSBwcm9taXNlLl9hIHx8IHByb21pc2UuX2NcbiAgICAsIGkgICAgID0gMFxuICAgICwgcmVhY3Rpb247XG4gIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpe1xuICAgIHJlYWN0aW9uID0gY2hhaW5baSsrXTtcbiAgICBpZihyZWFjdGlvbi5mYWlsIHx8ICFpc1VuaGFuZGxlZChyZWFjdGlvbi5wcm9taXNlKSlyZXR1cm4gZmFsc2U7XG4gIH0gcmV0dXJuIHRydWU7XG59O1xudmFyIG9uSGFuZGxlVW5oYW5kbGVkID0gZnVuY3Rpb24ocHJvbWlzZSl7XG4gIHRhc2suY2FsbChnbG9iYWwsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGhhbmRsZXI7XG4gICAgaWYoaXNOb2RlKXtcbiAgICAgIHByb2Nlc3MuZW1pdCgncmVqZWN0aW9uSGFuZGxlZCcsIHByb21pc2UpO1xuICAgIH0gZWxzZSBpZihoYW5kbGVyID0gZ2xvYmFsLm9ucmVqZWN0aW9uaGFuZGxlZCl7XG4gICAgICBoYW5kbGVyKHtwcm9taXNlOiBwcm9taXNlLCByZWFzb246IHByb21pc2UuX3Z9KTtcbiAgICB9XG4gIH0pO1xufTtcbnZhciAkcmVqZWN0ID0gZnVuY3Rpb24odmFsdWUpe1xuICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gIGlmKHByb21pc2UuX2QpcmV0dXJuO1xuICBwcm9taXNlLl9kID0gdHJ1ZTtcbiAgcHJvbWlzZSA9IHByb21pc2UuX3cgfHwgcHJvbWlzZTsgLy8gdW53cmFwXG4gIHByb21pc2UuX3YgPSB2YWx1ZTtcbiAgcHJvbWlzZS5fcyA9IDI7XG4gIGlmKCFwcm9taXNlLl9hKXByb21pc2UuX2EgPSBwcm9taXNlLl9jLnNsaWNlKCk7XG4gIG5vdGlmeShwcm9taXNlLCB0cnVlKTtcbn07XG52YXIgJHJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSl7XG4gIHZhciBwcm9taXNlID0gdGhpc1xuICAgICwgdGhlbjtcbiAgaWYocHJvbWlzZS5fZClyZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgdHJ5IHtcbiAgICBpZihwcm9taXNlID09PSB2YWx1ZSl0aHJvdyBUeXBlRXJyb3IoXCJQcm9taXNlIGNhbid0IGJlIHJlc29sdmVkIGl0c2VsZlwiKTtcbiAgICBpZih0aGVuID0gaXNUaGVuYWJsZSh2YWx1ZSkpe1xuICAgICAgbWljcm90YXNrKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB3cmFwcGVyID0ge193OiBwcm9taXNlLCBfZDogZmFsc2V9OyAvLyB3cmFwXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgoJHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgoJHJlamVjdCwgd3JhcHBlciwgMSkpO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICRyZWplY3QuY2FsbCh3cmFwcGVyLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb21pc2UuX3YgPSB2YWx1ZTtcbiAgICAgIHByb21pc2UuX3MgPSAxO1xuICAgICAgbm90aWZ5KHByb21pc2UsIGZhbHNlKTtcbiAgICB9XG4gIH0gY2F0Y2goZSl7XG4gICAgJHJlamVjdC5jYWxsKHtfdzogcHJvbWlzZSwgX2Q6IGZhbHNlfSwgZSk7IC8vIHdyYXBcbiAgfVxufTtcblxuLy8gY29uc3RydWN0b3IgcG9seWZpbGxcbmlmKCFVU0VfTkFUSVZFKXtcbiAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcbiAgJFByb21pc2UgPSBmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKXtcbiAgICBhbkluc3RhbmNlKHRoaXMsICRQcm9taXNlLCBQUk9NSVNFLCAnX2gnKTtcbiAgICBhRnVuY3Rpb24oZXhlY3V0b3IpO1xuICAgIEludGVybmFsLmNhbGwodGhpcyk7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dG9yKGN0eCgkcmVzb2x2ZSwgdGhpcywgMSksIGN0eCgkcmVqZWN0LCB0aGlzLCAxKSk7XG4gICAgfSBjYXRjaChlcnIpe1xuICAgICAgJHJlamVjdC5jYWxsKHRoaXMsIGVycik7XG4gICAgfVxuICB9O1xuICBJbnRlcm5hbCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xuICAgIHRoaXMuX2MgPSBbXTsgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXG4gICAgdGhpcy5fYSA9IHVuZGVmaW5lZDsgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xuICAgIHRoaXMuX3MgPSAwOyAgICAgICAgICAgICAgLy8gPC0gc3RhdGVcbiAgICB0aGlzLl9kID0gZmFsc2U7ICAgICAgICAgIC8vIDwtIGRvbmVcbiAgICB0aGlzLl92ID0gdW5kZWZpbmVkOyAgICAgIC8vIDwtIHZhbHVlXG4gICAgdGhpcy5faCA9IDA7ICAgICAgICAgICAgICAvLyA8LSByZWplY3Rpb24gc3RhdGUsIDAgLSBkZWZhdWx0LCAxIC0gaGFuZGxlZCwgMiAtIHVuaGFuZGxlZFxuICAgIHRoaXMuX24gPSBmYWxzZTsgICAgICAgICAgLy8gPC0gbm90aWZ5XG4gIH07XG4gIEludGVybmFsLnByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpKCRQcm9taXNlLnByb3RvdHlwZSwge1xuICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCl7XG4gICAgICB2YXIgcmVhY3Rpb24gICAgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShzcGVjaWVzQ29uc3RydWN0b3IodGhpcywgJFByb21pc2UpKTtcbiAgICAgIHJlYWN0aW9uLm9rICAgICA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlO1xuICAgICAgcmVhY3Rpb24uZmFpbCAgID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT0gJ2Z1bmN0aW9uJyAmJiBvblJlamVjdGVkO1xuICAgICAgcmVhY3Rpb24uZG9tYWluID0gaXNOb2RlID8gcHJvY2Vzcy5kb21haW4gOiB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9jLnB1c2gocmVhY3Rpb24pO1xuICAgICAgaWYodGhpcy5fYSl0aGlzLl9hLnB1c2gocmVhY3Rpb24pO1xuICAgICAgaWYodGhpcy5fcylub3RpZnkodGhpcywgZmFsc2UpO1xuICAgICAgcmV0dXJuIHJlYWN0aW9uLnByb21pc2U7XG4gICAgfSxcbiAgICAvLyAyNS40LjUuMSBQcm9taXNlLnByb3RvdHlwZS5jYXRjaChvblJlamVjdGVkKVxuICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpe1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xuICAgIH1cbiAgfSk7XG4gIFByb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcHJvbWlzZSAgPSBuZXcgSW50ZXJuYWw7XG4gICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgICB0aGlzLnJlc29sdmUgPSBjdHgoJHJlc29sdmUsIHByb21pc2UsIDEpO1xuICAgIHRoaXMucmVqZWN0ICA9IGN0eCgkcmVqZWN0LCBwcm9taXNlLCAxKTtcbiAgfTtcbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwge1Byb21pc2U6ICRQcm9taXNlfSk7XG5yZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpKCRQcm9taXNlLCBQUk9NSVNFKTtcbnJlcXVpcmUoJy4vX3NldC1zcGVjaWVzJykoUFJPTUlTRSk7XG5XcmFwcGVyID0gcmVxdWlyZSgnLi9fY29yZScpW1BST01JU0VdO1xuXG4vLyBzdGF0aWNzXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXG4gIHJlamVjdDogZnVuY3Rpb24gcmVqZWN0KHIpe1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkodGhpcylcbiAgICAgICwgJCRyZWplY3QgICA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgICQkcmVqZWN0KHIpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAoTElCUkFSWSB8fCAhVVNFX05BVElWRSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoeCl7XG4gICAgLy8gaW5zdGFuY2VvZiBpbnN0ZWFkIG9mIGludGVybmFsIHNsb3QgY2hlY2sgYmVjYXVzZSB3ZSBzaG91bGQgZml4IGl0IHdpdGhvdXQgcmVwbGFjZW1lbnQgbmF0aXZlIFByb21pc2UgY29yZVxuICAgIGlmKHggaW5zdGFuY2VvZiAkUHJvbWlzZSAmJiBzYW1lQ29uc3RydWN0b3IoeC5jb25zdHJ1Y3RvciwgdGhpcykpcmV0dXJuIHg7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKVxuICAgICAgLCAkJHJlc29sdmUgID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICQkcmVzb2x2ZSh4KTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIShVU0VfTkFUSVZFICYmIHJlcXVpcmUoJy4vX2l0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7XG4gICRQcm9taXNlLmFsbChpdGVyKVsnY2F0Y2gnXShlbXB0eSk7XG59KSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyAgICAgICAgICA9IHRoaXNcbiAgICAgICwgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KEMpXG4gICAgICAsIHJlc29sdmUgICAgPSBjYXBhYmlsaXR5LnJlc29sdmVcbiAgICAgICwgcmVqZWN0ICAgICA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciBhYnJ1cHQgPSBwZXJmb3JtKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdmFsdWVzICAgID0gW11cbiAgICAgICAgLCBpbmRleCAgICAgPSAwXG4gICAgICAgICwgcmVtYWluaW5nID0gMTtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24ocHJvbWlzZSl7XG4gICAgICAgIHZhciAkaW5kZXggICAgICAgID0gaW5kZXgrK1xuICAgICAgICAgICwgYWxyZWFkeUNhbGxlZCA9IGZhbHNlO1xuICAgICAgICB2YWx1ZXMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICByZW1haW5pbmcrKztcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIGlmKGFscmVhZHlDYWxsZWQpcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlDYWxsZWQgID0gdHJ1ZTtcbiAgICAgICAgICB2YWx1ZXNbJGluZGV4XSA9IHZhbHVlO1xuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgIH0pO1xuICAgIGlmKGFicnVwdClyZWplY3QoYWJydXB0LmVycm9yKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9LFxuICAvLyAyNS40LjQuNCBQcm9taXNlLnJhY2UoaXRlcmFibGUpXG4gIHJhY2U6IGZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgICAgID0gdGhpc1xuICAgICAgLCBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICAgICwgcmVqZWN0ICAgICA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciBhYnJ1cHQgPSBwZXJmb3JtKGZ1bmN0aW9uKCl7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihjYXBhYmlsaXR5LnJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZihhYnJ1cHQpcmVqZWN0KGFicnVwdC5lcnJvcik7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRhdCAgPSByZXF1aXJlKCcuL19zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XG4gIHRoaXMuX3QgPSBTdHJpbmcoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGluZGV4ID0gdGhpcy5faVxuICAgICwgcG9pbnQ7XG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiB7dmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZX07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7dmFsdWU6IHBvaW50LCBkb25lOiBmYWxzZX07XG59KTsiLCJyZXF1aXJlKCcuL2VzNi5hcnJheS5pdGVyYXRvcicpO1xudmFyIGdsb2JhbCAgICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGhpZGUgICAgICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCBJdGVyYXRvcnMgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCBUT19TVFJJTkdfVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbmZvcih2YXIgY29sbGVjdGlvbnMgPSBbJ05vZGVMaXN0JywgJ0RPTVRva2VuTGlzdCcsICdNZWRpYUxpc3QnLCAnU3R5bGVTaGVldExpc3QnLCAnQ1NTUnVsZUxpc3QnXSwgaSA9IDA7IGkgPCA1OyBpKyspe1xuICB2YXIgTkFNRSAgICAgICA9IGNvbGxlY3Rpb25zW2ldXG4gICAgLCBDb2xsZWN0aW9uID0gZ2xvYmFsW05BTUVdXG4gICAgLCBwcm90byAgICAgID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgaWYocHJvdG8gJiYgIXByb3RvW1RPX1NUUklOR19UQUddKWhpZGUocHJvdG8sIFRPX1NUUklOR19UQUcsIE5BTUUpO1xuICBJdGVyYXRvcnNbTkFNRV0gPSBJdGVyYXRvcnMuQXJyYXk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdpbmZlcm5vL2Rpc3QvaW5mZXJuby1jb21wb25lbnQubm9kZScpO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzOyIsIi8qIVxuICogaW5mZXJuby1jb21wb25lbnQgdjEuMi4xXG4gKiAoYykgMjAxNyBEb21pbmljIEdhbm5hd2F5XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdpbmZlcm5vJykpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnaW5mZXJubyddLCBmYWN0b3J5KSA6XG5cdChnbG9iYWwuSW5mZXJubyA9IGdsb2JhbC5JbmZlcm5vIHx8IHt9LCBnbG9iYWwuSW5mZXJuby5Db21wb25lbnQgPSBmYWN0b3J5KGdsb2JhbC5JbmZlcm5vKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoaW5mZXJubykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBFUlJPUl9NU0cgPSAnYSBydW50aW1lIGVycm9yIG9jY3VyZWQhIFVzZSBJbmZlcm5vIGluIGRldmVsb3BtZW50IGVudmlyb25tZW50IHRvIGZpbmQgdGhlIGVycm9yLic7XG52YXIgaXNCcm93c2VyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50O1xuXG4vLyB0aGlzIGlzIE1VQ0ggZmFzdGVyIHRoYW4gLmNvbnN0cnVjdG9yID09PSBBcnJheSBhbmQgaW5zdGFuY2VvZiBBcnJheVxuLy8gaW4gTm9kZSA3IGFuZCB0aGUgbGF0ZXIgdmVyc2lvbnMgb2YgVjgsIHNsb3dlciBpbiBvbGRlciB2ZXJzaW9ucyB0aG91Z2hcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuZnVuY3Rpb24gaXNTdHJpbmdPck51bWJlcihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdzdHJpbmcnIHx8IHR5cGUgPT09ICdudW1iZXInO1xufVxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZihvYmopIHtcbiAgICByZXR1cm4gaXNVbmRlZmluZWQob2JqKSB8fCBpc051bGwob2JqKTtcbn1cbmZ1bmN0aW9uIGlzSW52YWxpZChvYmopIHtcbiAgICByZXR1cm4gaXNOdWxsKG9iaikgfHwgb2JqID09PSBmYWxzZSB8fCBpc1RydWUob2JqKSB8fCBpc1VuZGVmaW5lZChvYmopO1xufVxuZnVuY3Rpb24gaXNGdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuXG5cbmZ1bmN0aW9uIGlzTnVsbChvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xufVxuZnVuY3Rpb24gaXNUcnVlKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWU7XG59XG5mdW5jdGlvbiBpc1VuZGVmaW5lZChvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHRocm93RXJyb3IobWVzc2FnZSkge1xuICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgICBtZXNzYWdlID0gRVJST1JfTVNHO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoKFwiSW5mZXJubyBFcnJvcjogXCIgKyBtZXNzYWdlKSk7XG59XG5cbnZhciBMaWZlY3ljbGUgPSBmdW5jdGlvbiBMaWZlY3ljbGUoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB0aGlzLmZhc3RVbm1vdW50ID0gdHJ1ZTtcbn07XG5MaWZlY3ljbGUucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIgKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG59O1xuTGlmZWN5Y2xlLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gdHJpZ2dlciAoKSB7XG4gICAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzJDEubGlzdGVuZXJzW2ldKCk7XG4gICAgfVxufTtcblxudmFyIG5vT3AgPSBFUlJPUl9NU0c7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIG5vT3AgPSAnSW5mZXJubyBFcnJvcjogQ2FuIG9ubHkgdXBkYXRlIGEgbW91bnRlZCBvciBtb3VudGluZyBjb21wb25lbnQuIFRoaXMgdXN1YWxseSBtZWFucyB5b3UgY2FsbGVkIHNldFN0YXRlKCkgb3IgZm9yY2VVcGRhdGUoKSBvbiBhbiB1bm1vdW50ZWQgY29tcG9uZW50LiBUaGlzIGlzIGEgbm8tb3AuJztcbn1cbnZhciBjb21wb25lbnRDYWxsYmFja1F1ZXVlID0gbmV3IE1hcCgpO1xuLy8gd2hlbiBhIGNvbXBvbmVudHMgcm9vdCBWTm9kZSBpcyBhbHNvIGEgY29tcG9uZW50LCB3ZSBjYW4gcnVuIGludG8gaXNzdWVzXG4vLyB0aGlzIHdpbGwgcmVjdXJzaXZlbHkgbG9vayBmb3Igdk5vZGUucGFyZW50Tm9kZSBpZiB0aGUgVk5vZGUgaXMgYSBjb21wb25lbnRcbmZ1bmN0aW9uIHVwZGF0ZVBhcmVudENvbXBvbmVudFZOb2Rlcyh2Tm9kZSwgZG9tKSB7XG4gICAgaWYgKHZOb2RlLmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgIHZhciBwYXJlbnRWTm9kZSA9IHZOb2RlLnBhcmVudFZOb2RlO1xuICAgICAgICBpZiAocGFyZW50Vk5vZGUpIHtcbiAgICAgICAgICAgIHBhcmVudFZOb2RlLmRvbSA9IGRvbTtcbiAgICAgICAgICAgIHVwZGF0ZVBhcmVudENvbXBvbmVudFZOb2RlcyhwYXJlbnRWTm9kZSwgZG9tKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIHRoaXMgaXMgaW4gc2hhcGVzIHRvbywgYnV0IHdlIGRvbid0IHdhbnQgdG8gaW1wb3J0IGZyb20gc2hhcGVzIGFzIGl0IHdpbGwgcHVsbCBpbiBhIGR1cGxpY2F0ZSBvZiBjcmVhdGVWTm9kZVxuZnVuY3Rpb24gY3JlYXRlVm9pZFZOb2RlKCkge1xuICAgIHJldHVybiBpbmZlcm5vLmNyZWF0ZVZOb2RlKDQwOTYgLyogVm9pZCAqLyk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Vk5vZGUodGV4dCkge1xuICAgIHJldHVybiBpbmZlcm5vLmNyZWF0ZVZOb2RlKDEgLyogVGV4dCAqLywgbnVsbCwgbnVsbCwgdGV4dCk7XG59XG5mdW5jdGlvbiBhZGRUb1F1ZXVlKGNvbXBvbmVudCwgZm9yY2UsIGNhbGxiYWNrKSB7XG4gICAgLy8gVE9ETyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJldmlzZWQgYW5kIGltcHJvdmVkIG9uXG4gICAgdmFyIHF1ZXVlID0gY29tcG9uZW50Q2FsbGJhY2tRdWV1ZS5nZXQoY29tcG9uZW50KTtcbiAgICBpZiAoIXF1ZXVlKSB7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIGNvbXBvbmVudENhbGxiYWNrUXVldWUuc2V0KGNvbXBvbmVudCwgcXVldWUpO1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudENhbGxiYWNrUXVldWUuZGVsZXRlKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBhcHBseVN0YXRlKGNvbXBvbmVudCwgZm9yY2UsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlW2ldKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgcXVldWUucHVzaChjYWxsYmFjayk7XG4gICAgfVxufVxuZnVuY3Rpb24gcXVldWVTdGF0ZUNoYW5nZXMoY29tcG9uZW50LCBuZXdTdGF0ZSwgY2FsbGJhY2ssIHN5bmMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihuZXdTdGF0ZSkpIHtcbiAgICAgICAgbmV3U3RhdGUgPSBuZXdTdGF0ZShjb21wb25lbnQuc3RhdGUpO1xuICAgIH1cbiAgICBmb3IgKHZhciBzdGF0ZUtleSBpbiBuZXdTdGF0ZSkge1xuICAgICAgICBjb21wb25lbnQuX3BlbmRpbmdTdGF0ZVtzdGF0ZUtleV0gPSBuZXdTdGF0ZVtzdGF0ZUtleV07XG4gICAgfVxuICAgIGlmICghY29tcG9uZW50Ll9wZW5kaW5nU2V0U3RhdGUgJiYgaXNCcm93c2VyKSB7XG4gICAgICAgIGlmIChzeW5jIHx8IGNvbXBvbmVudC5fYmxvY2tSZW5kZXIpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fcGVuZGluZ1NldFN0YXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGFwcGx5U3RhdGUoY29tcG9uZW50LCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWRkVG9RdWV1ZShjb21wb25lbnQsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIGNvbXBvbmVudC5zdGF0ZSwgY29tcG9uZW50Ll9wZW5kaW5nU3RhdGUpO1xuICAgICAgICBjb21wb25lbnQuX3BlbmRpbmdTdGF0ZSA9IHt9O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFwcGx5U3RhdGUoY29tcG9uZW50LCBmb3JjZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoKCFjb21wb25lbnQuX2RlZmVyU2V0U3RhdGUgfHwgZm9yY2UpICYmICFjb21wb25lbnQuX2Jsb2NrUmVuZGVyICYmICFjb21wb25lbnQuX3VubW91bnRlZCkge1xuICAgICAgICBjb21wb25lbnQuX3BlbmRpbmdTZXRTdGF0ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgcGVuZGluZ1N0YXRlID0gY29tcG9uZW50Ll9wZW5kaW5nU3RhdGU7XG4gICAgICAgIHZhciBwcmV2U3RhdGUgPSBjb21wb25lbnQuc3RhdGU7XG4gICAgICAgIHZhciBuZXh0U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBwcmV2U3RhdGUsIHBlbmRpbmdTdGF0ZSk7XG4gICAgICAgIHZhciBwcm9wcyA9IGNvbXBvbmVudC5wcm9wcztcbiAgICAgICAgdmFyIGNvbnRleHQgPSBjb21wb25lbnQuY29udGV4dDtcbiAgICAgICAgY29tcG9uZW50Ll9wZW5kaW5nU3RhdGUgPSB7fTtcbiAgICAgICAgdmFyIG5leHRJbnB1dCA9IGNvbXBvbmVudC5fdXBkYXRlQ29tcG9uZW50KHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwcm9wcywgcHJvcHMsIGNvbnRleHQsIGZvcmNlLCB0cnVlKTtcbiAgICAgICAgdmFyIGRpZFVwZGF0ZSA9IHRydWU7XG4gICAgICAgIGlmIChpc0ludmFsaWQobmV4dElucHV0KSkge1xuICAgICAgICAgICAgbmV4dElucHV0ID0gY3JlYXRlVm9pZFZOb2RlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV4dElucHV0ID09PSBpbmZlcm5vLk5PX09QKSB7XG4gICAgICAgICAgICBuZXh0SW5wdXQgPSBjb21wb25lbnQuX2xhc3RJbnB1dDtcbiAgICAgICAgICAgIGRpZFVwZGF0ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzU3RyaW5nT3JOdW1iZXIobmV4dElucHV0KSkge1xuICAgICAgICAgICAgbmV4dElucHV0ID0gY3JlYXRlVGV4dFZOb2RlKG5leHRJbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNBcnJheShuZXh0SW5wdXQpKSB7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoJ2EgdmFsaWQgSW5mZXJubyBWTm9kZSAob3IgbnVsbCkgbXVzdCBiZSByZXR1cm5lZCBmcm9tIGEgY29tcG9uZW50IHJlbmRlci4gWW91IG1heSBoYXZlIHJldHVybmVkIGFuIGFycmF5IG9yIGFuIGludmFsaWQgb2JqZWN0LicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsYXN0SW5wdXQgPSBjb21wb25lbnQuX2xhc3RJbnB1dDtcbiAgICAgICAgdmFyIHZOb2RlID0gY29tcG9uZW50Ll92Tm9kZTtcbiAgICAgICAgdmFyIHBhcmVudERvbSA9IChsYXN0SW5wdXQuZG9tICYmIGxhc3RJbnB1dC5kb20ucGFyZW50Tm9kZSkgfHwgKGxhc3RJbnB1dC5kb20gPSB2Tm9kZS5kb20pO1xuICAgICAgICBjb21wb25lbnQuX2xhc3RJbnB1dCA9IG5leHRJbnB1dDtcbiAgICAgICAgaWYgKGRpZFVwZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHN1YkxpZmVjeWNsZSA9IGNvbXBvbmVudC5fbGlmZWN5Y2xlO1xuICAgICAgICAgICAgaWYgKCFzdWJMaWZlY3ljbGUpIHtcbiAgICAgICAgICAgICAgICBzdWJMaWZlY3ljbGUgPSBuZXcgTGlmZWN5Y2xlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdWJMaWZlY3ljbGUubGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX2xpZmVjeWNsZSA9IHN1YkxpZmVjeWNsZTtcbiAgICAgICAgICAgIHZhciBjaGlsZENvbnRleHQgPSBjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KCk7XG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYoY2hpbGRDb250ZXh0KSkge1xuICAgICAgICAgICAgICAgIGNoaWxkQ29udGV4dCA9IE9iamVjdC5hc3NpZ24oe30sIGNvbnRleHQsIGNvbXBvbmVudC5fY2hpbGRDb250ZXh0LCBjaGlsZENvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hpbGRDb250ZXh0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29udGV4dCwgY29tcG9uZW50Ll9jaGlsZENvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50Ll9wYXRjaChsYXN0SW5wdXQsIG5leHRJbnB1dCwgcGFyZW50RG9tLCBzdWJMaWZlY3ljbGUsIGNoaWxkQ29udGV4dCwgY29tcG9uZW50Ll9pc1NWRywgZmFsc2UpO1xuICAgICAgICAgICAgc3ViTGlmZWN5Y2xlLnRyaWdnZXIoKTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUocHJvcHMsIHByZXZTdGF0ZSk7XG4gICAgICAgICAgICBpbmZlcm5vLm9wdGlvbnMuYWZ0ZXJVcGRhdGUgJiYgaW5mZXJuby5vcHRpb25zLmFmdGVyVXBkYXRlKHZOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZG9tID0gdk5vZGUuZG9tID0gbmV4dElucHV0LmRvbTtcbiAgICAgICAgdmFyIGNvbXBvbmVudFRvRE9NTm9kZU1hcCA9IGNvbXBvbmVudC5fY29tcG9uZW50VG9ET01Ob2RlTWFwO1xuICAgICAgICBjb21wb25lbnRUb0RPTU5vZGVNYXAgJiYgY29tcG9uZW50VG9ET01Ob2RlTWFwLnNldChjb21wb25lbnQsIG5leHRJbnB1dC5kb20pO1xuICAgICAgICB1cGRhdGVQYXJlbnRDb21wb25lbnRWTm9kZXModk5vZGUsIGRvbSk7XG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIWlzTnVsbE9yVW5kZWYoY2FsbGJhY2spKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxufVxudmFyIENvbXBvbmVudCQxID0gZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIHRoaXMucmVmcyA9IHt9O1xuICAgIHRoaXMuX2Jsb2NrUmVuZGVyID0gZmFsc2U7XG4gICAgdGhpcy5faWdub3JlU2V0U3RhdGUgPSBmYWxzZTtcbiAgICB0aGlzLl9ibG9ja1NldFN0YXRlID0gZmFsc2U7XG4gICAgdGhpcy5fZGVmZXJTZXRTdGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3BlbmRpbmdTZXRTdGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3BlbmRpbmdTdGF0ZSA9IHt9O1xuICAgIHRoaXMuX2xhc3RJbnB1dCA9IG51bGw7XG4gICAgdGhpcy5fdk5vZGUgPSBudWxsO1xuICAgIHRoaXMuX3VubW91bnRlZCA9IHRydWU7XG4gICAgdGhpcy5fbGlmZWN5Y2xlID0gbnVsbDtcbiAgICB0aGlzLl9jaGlsZENvbnRleHQgPSBudWxsO1xuICAgIHRoaXMuX3BhdGNoID0gbnVsbDtcbiAgICB0aGlzLl9pc1NWRyA9IGZhbHNlO1xuICAgIHRoaXMuX2NvbXBvbmVudFRvRE9NTm9kZU1hcCA9IG51bGw7XG4gICAgLyoqIEB0eXBlIHtvYmplY3R9ICovXG4gICAgdGhpcy5wcm9wcyA9IHByb3BzIHx8IGluZmVybm8uRU1QVFlfT0JKO1xuICAgIC8qKiBAdHlwZSB7b2JqZWN0fSAqL1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQgfHwge307XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAobmV4dFByb3BzLCBuZXh0U3RhdGUsIG5leHRDb250ZXh0KSB7XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLmZvcmNlVXBkYXRlID0gZnVuY3Rpb24gZm9yY2VVcGRhdGUgKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuX3VubW91bnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlzQnJvd3NlciAmJiBhcHBseVN0YXRlKHRoaXMsIHRydWUsIGNhbGxiYWNrKTtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiBzZXRTdGF0ZSAobmV3U3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuX3VubW91bnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5fYmxvY2tTZXRTdGF0ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2lnbm9yZVNldFN0YXRlKSB7XG4gICAgICAgICAgICBxdWV1ZVN0YXRlQ2hhbmdlcyh0aGlzLCBuZXdTdGF0ZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ2Nhbm5vdCB1cGRhdGUgc3RhdGUgdmlhIHNldFN0YXRlKCkgaW4gY29tcG9uZW50V2lsbFVwZGF0ZSgpLicpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLnNldFN0YXRlU3luYyA9IGZ1bmN0aW9uIHNldFN0YXRlU3luYyAobmV3U3RhdGUpIHtcbiAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9ibG9ja1NldFN0YXRlKSB7XG4gICAgICAgIGlmICghdGhpcy5faWdub3JlU2V0U3RhdGUpIHtcbiAgICAgICAgICAgIHF1ZXVlU3RhdGVDaGFuZ2VzKHRoaXMsIG5ld1N0YXRlLCBudWxsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ2Nhbm5vdCB1cGRhdGUgc3RhdGUgdmlhIHNldFN0YXRlKCkgaW4gY29tcG9uZW50V2lsbFVwZGF0ZSgpLicpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLmNvbXBvbmVudFdpbGxNb3VudCA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCAoKSB7XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLmNvbXBvbmVudERpZFVwZGF0ZSA9IGZ1bmN0aW9uIGNvbXBvbmVudERpZFVwZGF0ZSAocHJldlByb3BzLCBwcmV2U3RhdGUsIHByZXZDb250ZXh0KSB7XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLnNob3VsZENvbXBvbmVudFVwZGF0ZSA9IGZ1bmN0aW9uIHNob3VsZENvbXBvbmVudFVwZGF0ZSAobmV4dFByb3BzLCBuZXh0U3RhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgKG5leHRQcm9wcywgY29udGV4dCkge1xufTtcbkNvbXBvbmVudCQxLnByb3RvdHlwZS5jb21wb25lbnRXaWxsVXBkYXRlID0gZnVuY3Rpb24gY29tcG9uZW50V2lsbFVwZGF0ZSAobmV4dFByb3BzLCBuZXh0U3RhdGUsIG5leHRDb250ZXh0KSB7XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLmdldENoaWxkQ29udGV4dCA9IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCAoKSB7XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLl91cGRhdGVDb21wb25lbnQgPSBmdW5jdGlvbiBfdXBkYXRlQ29tcG9uZW50IChwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcHJldlByb3BzLCBuZXh0UHJvcHMsIGNvbnRleHQsIGZvcmNlLCBmcm9tU2V0U3RhdGUpIHtcbiAgICBpZiAodGhpcy5fdW5tb3VudGVkID09PSB0cnVlKSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKG5vT3ApO1xuICAgICAgICB9XG4gICAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKChwcmV2UHJvcHMgIT09IG5leHRQcm9wcyB8fCBuZXh0UHJvcHMgPT09IGluZmVybm8uRU1QVFlfT0JKKSB8fCBwcmV2U3RhdGUgIT09IG5leHRTdGF0ZSB8fCBmb3JjZSkge1xuICAgICAgICBpZiAocHJldlByb3BzICE9PSBuZXh0UHJvcHMgfHwgbmV4dFByb3BzID09PSBpbmZlcm5vLkVNUFRZX09CSikge1xuICAgICAgICAgICAgaWYgKCFmcm9tU2V0U3RhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibG9ja1JlbmRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmxvY2tSZW5kZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9wZW5kaW5nU2V0U3RhdGUpIHtcbiAgICAgICAgICAgICAgICBuZXh0U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBuZXh0U3RhdGUsIHRoaXMuX3BlbmRpbmdTdGF0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1NldFN0YXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1N0YXRlID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNob3VsZFVwZGF0ZSA9IHRoaXMuc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHNob3VsZFVwZGF0ZSAhPT0gZmFsc2UgfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2Jsb2NrU2V0U3RhdGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRXaWxsVXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHRoaXMuX2Jsb2NrU2V0U3RhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMgPSBuZXh0UHJvcHM7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlID0gbmV4dFN0YXRlO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIGluZmVybm8ub3B0aW9ucy5iZWZvcmVSZW5kZXIgJiYgaW5mZXJuby5vcHRpb25zLmJlZm9yZVJlbmRlcih0aGlzKTtcbiAgICAgICAgICAgIHZhciByZW5kZXIgPSB0aGlzLnJlbmRlcihuZXh0UHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGluZmVybm8ub3B0aW9ucy5hZnRlclJlbmRlciAmJiBpbmZlcm5vLm9wdGlvbnMuYWZ0ZXJSZW5kZXIodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbmZlcm5vLk5PX09QO1xufTtcblxucmV0dXJuIENvbXBvbmVudCQxO1xuXG59KSkpO1xuIiwiLyohXG4gKiBpbmZlcm5vIHYxLjIuMVxuICogKGMpIDIwMTcgRG9taW5pYyBHYW5uYXdheVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG5cdChmYWN0b3J5KChnbG9iYWwuSW5mZXJubyA9IGdsb2JhbC5JbmZlcm5vIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgTk9fT1AgPSAnJE5PX09QJztcbnZhciBFUlJPUl9NU0cgPSAnYSBydW50aW1lIGVycm9yIG9jY3VyZWQhIFVzZSBJbmZlcm5vIGluIGRldmVsb3BtZW50IGVudmlyb25tZW50IHRvIGZpbmQgdGhlIGVycm9yLic7XG52YXIgaXNCcm93c2VyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50O1xuXG4vLyB0aGlzIGlzIE1VQ0ggZmFzdGVyIHRoYW4gLmNvbnN0cnVjdG9yID09PSBBcnJheSBhbmQgaW5zdGFuY2VvZiBBcnJheVxuLy8gaW4gTm9kZSA3IGFuZCB0aGUgbGF0ZXIgdmVyc2lvbnMgb2YgVjgsIHNsb3dlciBpbiBvbGRlciB2ZXJzaW9ucyB0aG91Z2hcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmZ1bmN0aW9uIGlzU3RhdGVmdWxDb21wb25lbnQobykge1xuICAgIHJldHVybiAhaXNVbmRlZmluZWQoby5wcm90b3R5cGUpICYmICFpc1VuZGVmaW5lZChvLnByb3RvdHlwZS5yZW5kZXIpO1xufVxuZnVuY3Rpb24gaXNTdHJpbmdPck51bWJlcihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdzdHJpbmcnIHx8IHR5cGUgPT09ICdudW1iZXInO1xufVxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZihvYmopIHtcbiAgICByZXR1cm4gaXNVbmRlZmluZWQob2JqKSB8fCBpc051bGwob2JqKTtcbn1cbmZ1bmN0aW9uIGlzSW52YWxpZChvYmopIHtcbiAgICByZXR1cm4gaXNOdWxsKG9iaikgfHwgb2JqID09PSBmYWxzZSB8fCBpc1RydWUob2JqKSB8fCBpc1VuZGVmaW5lZChvYmopO1xufVxuZnVuY3Rpb24gaXNGdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIGlzQXR0ckFuRXZlbnQoYXR0cikge1xuICAgIHJldHVybiBhdHRyWzBdID09PSAnbycgJiYgYXR0clsxXSA9PT0gJ24nICYmIGF0dHIubGVuZ3RoID4gMztcbn1cbmZ1bmN0aW9uIGlzU3RyaW5nKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJztcbn1cbmZ1bmN0aW9uIGlzTnVtYmVyKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJztcbn1cbmZ1bmN0aW9uIGlzTnVsbChvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xufVxuZnVuY3Rpb24gaXNUcnVlKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWU7XG59XG5mdW5jdGlvbiBpc1VuZGVmaW5lZChvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBpc09iamVjdChvKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0Jztcbn1cbmZ1bmN0aW9uIHRocm93RXJyb3IobWVzc2FnZSkge1xuICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgICBtZXNzYWdlID0gRVJST1JfTVNHO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoKFwiSW5mZXJubyBFcnJvcjogXCIgKyBtZXNzYWdlKSk7XG59XG5mdW5jdGlvbiB3YXJuaW5nKGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgfVxufVxudmFyIEVNUFRZX09CSiA9IHt9O1xuXG5mdW5jdGlvbiBhcHBseUtleShrZXksIHZOb2RlKSB7XG4gICAgdk5vZGUua2V5ID0ga2V5O1xuICAgIHJldHVybiB2Tm9kZTtcbn1cbmZ1bmN0aW9uIGFwcGx5S2V5SWZNaXNzaW5nKGtleSwgdk5vZGUpIHtcbiAgICBpZiAoaXNOdW1iZXIoa2V5KSkge1xuICAgICAgICBrZXkgPSBcIi5cIiArIGtleTtcbiAgICB9XG4gICAgaWYgKGlzTnVsbCh2Tm9kZS5rZXkpIHx8IHZOb2RlLmtleVswXSA9PT0gJy4nKSB7XG4gICAgICAgIHJldHVybiBhcHBseUtleShrZXksIHZOb2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZOb2RlO1xufVxuZnVuY3Rpb24gYXBwbHlLZXlQcmVmaXgoa2V5LCB2Tm9kZSkge1xuICAgIHZOb2RlLmtleSA9IGtleSArIHZOb2RlLmtleTtcbiAgICByZXR1cm4gdk5vZGU7XG59XG5mdW5jdGlvbiBfbm9ybWFsaXplVk5vZGVzKG5vZGVzLCByZXN1bHQsIGluZGV4LCBjdXJyZW50S2V5KSB7XG4gICAgZm9yICg7IGluZGV4IDwgbm9kZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBuID0gbm9kZXNbaW5kZXhdO1xuICAgICAgICB2YXIga2V5ID0gY3VycmVudEtleSArIFwiLlwiICsgaW5kZXg7XG4gICAgICAgIGlmICghaXNJbnZhbGlkKG4pKSB7XG4gICAgICAgICAgICBpZiAoaXNBcnJheShuKSkge1xuICAgICAgICAgICAgICAgIF9ub3JtYWxpemVWTm9kZXMobiwgcmVzdWx0LCAwLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzU3RyaW5nT3JOdW1iZXIobikpIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IGNyZWF0ZVRleHRWTm9kZShuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNWTm9kZShuKSAmJiBuLmRvbSB8fCAobi5rZXkgJiYgbi5rZXlbMF0gPT09ICcuJykpIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IGNsb25lVk5vZGUobik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpc051bGwobi5rZXkpIHx8IG4ua2V5WzBdID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IGFwcGx5S2V5KGtleSwgbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuID0gYXBwbHlLZXlQcmVmaXgoY3VycmVudEtleSwgbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gbm9ybWFsaXplVk5vZGVzKG5vZGVzKSB7XG4gICAgdmFyIG5ld05vZGVzO1xuICAgIC8vIHdlIGFzc2lnbiAkIHdoaWNoIGJhc2ljYWxseSBtZWFucyB3ZSd2ZSBmbGFnZ2VkIHRoaXMgYXJyYXkgZm9yIGZ1dHVyZSBub3RlXG4gICAgLy8gaWYgaXQgY29tZXMgYmFjayBhZ2Fpbiwgd2UgbmVlZCB0byBjbG9uZSBpdCwgYXMgcGVvcGxlIGFyZSB1c2luZyBpdFxuICAgIC8vIGluIGFuIGltbXV0YWJsZSB3YXlcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZVxuICAgIGlmIChub2Rlc1snJCddKSB7XG4gICAgICAgIG5vZGVzID0gbm9kZXMuc2xpY2UoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vZGVzWyckJ10gPSB0cnVlO1xuICAgIH1cbiAgICAvLyB0c2xpbnQ6ZW5hYmxlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbiA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAoaXNJbnZhbGlkKG4pIHx8IGlzQXJyYXkobikpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAobmV3Tm9kZXMgfHwgbm9kZXMpLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgX25vcm1hbGl6ZVZOb2Rlcyhub2RlcywgcmVzdWx0LCBpLCBcIlwiKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihuKSkge1xuICAgICAgICAgICAgaWYgKCFuZXdOb2Rlcykge1xuICAgICAgICAgICAgICAgIG5ld05vZGVzID0gbm9kZXMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdOb2Rlcy5wdXNoKGFwcGx5S2V5SWZNaXNzaW5nKGksIGNyZWF0ZVRleHRWTm9kZShuKSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKChpc1ZOb2RlKG4pICYmIG4uZG9tKSB8fCAoaXNOdWxsKG4ua2V5KSAmJiAhKG4uZmxhZ3MgJiA2NCAvKiBIYXNOb25LZXllZENoaWxkcmVuICovKSkpIHtcbiAgICAgICAgICAgIGlmICghbmV3Tm9kZXMpIHtcbiAgICAgICAgICAgICAgICBuZXdOb2RlcyA9IG5vZGVzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3Tm9kZXMucHVzaChhcHBseUtleUlmTWlzc2luZyhpLCBjbG9uZVZOb2RlKG4pKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3Tm9kZXMpIHtcbiAgICAgICAgICAgIG5ld05vZGVzLnB1c2goYXBwbHlLZXlJZk1pc3NpbmcoaSwgY2xvbmVWTm9kZShuKSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdOb2RlcyB8fCBub2Rlcztcbn1cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKSB7XG4gICAgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIHJldHVybiBub3JtYWxpemVWTm9kZXMoY2hpbGRyZW4pO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc1ZOb2RlKGNoaWxkcmVuKSAmJiBjaGlsZHJlbi5kb20pIHtcbiAgICAgICAgcmV0dXJuIGNsb25lVk5vZGUoY2hpbGRyZW4pO1xuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG59XG5mdW5jdGlvbiBub3JtYWxpemVQcm9wcyh2Tm9kZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgaWYgKCEodk5vZGUuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pICYmIGlzTnVsbE9yVW5kZWYoY2hpbGRyZW4pICYmICFpc051bGxPclVuZGVmKHByb3BzLmNoaWxkcmVuKSkge1xuICAgICAgICB2Tm9kZS5jaGlsZHJlbiA9IHByb3BzLmNoaWxkcmVuO1xuICAgIH1cbiAgICBpZiAocHJvcHMucmVmKSB7XG4gICAgICAgIHZOb2RlLnJlZiA9IHByb3BzLnJlZjtcbiAgICAgICAgZGVsZXRlIHByb3BzLnJlZjtcbiAgICB9XG4gICAgaWYgKHByb3BzLmV2ZW50cykge1xuICAgICAgICB2Tm9kZS5ldmVudHMgPSBwcm9wcy5ldmVudHM7XG4gICAgfVxuICAgIGlmICghaXNOdWxsT3JVbmRlZihwcm9wcy5rZXkpKSB7XG4gICAgICAgIHZOb2RlLmtleSA9IHByb3BzLmtleTtcbiAgICAgICAgZGVsZXRlIHByb3BzLmtleTtcbiAgICB9XG59XG5mdW5jdGlvbiBjb3B5UHJvcHNUbyhjb3B5RnJvbSwgY29weVRvKSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBjb3B5RnJvbSkge1xuICAgICAgICBpZiAoaXNVbmRlZmluZWQoY29weVRvW3Byb3BdKSkge1xuICAgICAgICAgICAgY29weVRvW3Byb3BdID0gY29weUZyb21bcHJvcF07XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBub3JtYWxpemVFbGVtZW50KHR5cGUsIHZOb2RlKSB7XG4gICAgaWYgKHR5cGUgPT09ICdzdmcnKSB7XG4gICAgICAgIHZOb2RlLmZsYWdzID0gMTI4IC8qIFN2Z0VsZW1lbnQgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICAgICAgdk5vZGUuZmxhZ3MgPSA1MTIgLyogSW5wdXRFbGVtZW50ICovO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAnc2VsZWN0Jykge1xuICAgICAgICB2Tm9kZS5mbGFncyA9IDIwNDggLyogU2VsZWN0RWxlbWVudCAqLztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICB2Tm9kZS5mbGFncyA9IDEwMjQgLyogVGV4dGFyZWFFbGVtZW50ICovO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAnbWVkaWEnKSB7XG4gICAgICAgIHZOb2RlLmZsYWdzID0gMjU2IC8qIE1lZGlhRWxlbWVudCAqLztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZOb2RlLmZsYWdzID0gMiAvKiBIdG1sRWxlbWVudCAqLztcbiAgICB9XG59XG5mdW5jdGlvbiBub3JtYWxpemUodk5vZGUpIHtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcztcbiAgICB2YXIgaGFzUHJvcHMgPSAhaXNOdWxsKHByb3BzKTtcbiAgICB2YXIgdHlwZSA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG4gICAgLy8gY29udmVydCBhIHdyb25nbHkgY3JlYXRlZCB0eXBlIGJhY2sgdG8gZWxlbWVudFxuICAgIGlmIChpc1N0cmluZyh0eXBlKSAmJiAodk5vZGUuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pKSB7XG4gICAgICAgIG5vcm1hbGl6ZUVsZW1lbnQodHlwZSwgdk5vZGUpO1xuICAgICAgICBpZiAoaGFzUHJvcHMgJiYgcHJvcHMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHZOb2RlLmNoaWxkcmVuID0gcHJvcHMuY2hpbGRyZW47XG4gICAgICAgICAgICBjaGlsZHJlbiA9IHByb3BzLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChoYXNQcm9wcykge1xuICAgICAgICBub3JtYWxpemVQcm9wcyh2Tm9kZSwgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICB9XG4gICAgaWYgKCFpc0ludmFsaWQoY2hpbGRyZW4pKSB7XG4gICAgICAgIHZOb2RlLmNoaWxkcmVuID0gbm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4pO1xuICAgIH1cbiAgICBpZiAoaGFzUHJvcHMgJiYgIWlzSW52YWxpZChwcm9wcy5jaGlsZHJlbikpIHtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSBub3JtYWxpemVDaGlsZHJlbihwcm9wcy5jaGlsZHJlbik7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIC8vIFRoaXMgY29kZSB3aWxsIGJlIHN0cmlwcGVkIG91dCBmcm9tIHByb2R1Y3Rpb24gQ09ERVxuICAgICAgICAvLyBJdCB3aWxsIGhlbHAgdXNlcnMgdG8gdHJhY2sgZXJyb3JzIGluIHRoZWlyIGFwcGxpY2F0aW9ucy5cbiAgICAgICAgdmFyIHZlcmlmeUtleXMgPSBmdW5jdGlvbiAodk5vZGVzKSB7XG4gICAgICAgICAgICB2YXIga2V5VmFsdWVzID0gdk5vZGVzLm1hcChmdW5jdGlvbiAodm5vZGUpIHsgcmV0dXJuIHZub2RlLmtleTsgfSk7XG4gICAgICAgICAgICBrZXlWYWx1ZXMuc29tZShmdW5jdGlvbiAoaXRlbSwgaWR4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGhhc0R1cGxpY2F0ZSA9IGtleVZhbHVlcy5pbmRleE9mKGl0ZW0pICE9PSBpZHg7XG4gICAgICAgICAgICAgICAgd2FybmluZyghaGFzRHVwbGljYXRlLCAnSW5mZXJubyBub3JtYWxpc2F0aW9uKC4uLik6IEVuY291bnRlcmVkIHR3byBjaGlsZHJlbiB3aXRoIHNhbWUga2V5LCBhbGwga2V5cyBtdXN0IGJlIHVuaXF1ZSB3aXRoaW4gaXRzIHNpYmxpbmdzLiBEdXBsaWNhdGVkIGtleSBpczonICsgaXRlbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhc0R1cGxpY2F0ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBpZiAodk5vZGUuY2hpbGRyZW4gJiYgQXJyYXkuaXNBcnJheSh2Tm9kZS5jaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHZlcmlmeUtleXModk5vZGUuY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG52YXIgb3B0aW9ucyA9IHtcbiAgICByZWN5Y2xpbmdFbmFibGVkOiB0cnVlLFxuICAgIGZpbmRET01Ob2RlRW5hYmxlZDogZmFsc2UsXG4gICAgcm9vdHM6IG51bGwsXG4gICAgY3JlYXRlVk5vZGU6IG51bGwsXG4gICAgYmVmb3JlUmVuZGVyOiBudWxsLFxuICAgIGFmdGVyUmVuZGVyOiBudWxsLFxuICAgIGFmdGVyTW91bnQ6IG51bGwsXG4gICAgYWZ0ZXJVcGRhdGU6IG51bGwsXG4gICAgYmVmb3JlVW5tb3VudDogbnVsbCxcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVZOb2RlKGZsYWdzLCB0eXBlLCBwcm9wcywgY2hpbGRyZW4sIGV2ZW50cywga2V5LCByZWYsIG5vTm9ybWFsaXNlKSB7XG4gICAgaWYgKGZsYWdzICYgMTYgLyogQ29tcG9uZW50VW5rbm93biAqLykge1xuICAgICAgICBmbGFncyA9IGlzU3RhdGVmdWxDb21wb25lbnQodHlwZSkgPyA0IC8qIENvbXBvbmVudENsYXNzICovIDogOCAvKiBDb21wb25lbnRGdW5jdGlvbiAqLztcbiAgICB9XG4gICAgdmFyIHZOb2RlID0ge1xuICAgICAgICBjaGlsZHJlbjogaXNVbmRlZmluZWQoY2hpbGRyZW4pID8gbnVsbCA6IGNoaWxkcmVuLFxuICAgICAgICBkb206IG51bGwsXG4gICAgICAgIGV2ZW50czogZXZlbnRzIHx8IG51bGwsXG4gICAgICAgIGZsYWdzOiBmbGFncyxcbiAgICAgICAga2V5OiBpc1VuZGVmaW5lZChrZXkpID8gbnVsbCA6IGtleSxcbiAgICAgICAgcHJvcHM6IHByb3BzIHx8IG51bGwsXG4gICAgICAgIHJlZjogcmVmIHx8IG51bGwsXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgfTtcbiAgICBpZiAoIW5vTm9ybWFsaXNlKSB7XG4gICAgICAgIG5vcm1hbGl6ZSh2Tm9kZSk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmNyZWF0ZVZOb2RlKSB7XG4gICAgICAgIG9wdGlvbnMuY3JlYXRlVk5vZGUodk5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdk5vZGU7XG59XG5mdW5jdGlvbiBjbG9uZVZOb2RlKHZOb2RlVG9DbG9uZSwgcHJvcHMpIHtcbiAgICB2YXIgX2NoaWxkcmVuID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyO1xuICAgIHdoaWxlICggbGVuLS0gPiAwICkgX2NoaWxkcmVuWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuICsgMiBdO1xuXG4gICAgdmFyIGNoaWxkcmVuID0gX2NoaWxkcmVuO1xuICAgIGlmIChfY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiAhaXNOdWxsKF9jaGlsZHJlblswXSkpIHtcbiAgICAgICAgaWYgKCFwcm9wcykge1xuICAgICAgICAgICAgcHJvcHMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2NoaWxkcmVuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgY2hpbGRyZW4gPSBfY2hpbGRyZW5bMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWZpbmVkKHByb3BzLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KHByb3BzLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IHByb3BzLmNoaWxkcmVuLmNvbmNhdChjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IFtwcm9wcy5jaGlsZHJlbl0uY29uY2F0KGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheShwcm9wcy5jaGlsZHJlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuY2hpbGRyZW4ucHVzaChjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IFtwcm9wcy5jaGlsZHJlbl07XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmNoaWxkcmVuLnB1c2goY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGlsZHJlbiA9IG51bGw7XG4gICAgdmFyIG5ld1ZOb2RlO1xuICAgIGlmIChpc0FycmF5KHZOb2RlVG9DbG9uZSkpIHtcbiAgICAgICAgdmFyIHRtcEFycmF5ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdk5vZGVUb0Nsb25lLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0bXBBcnJheS5wdXNoKGNsb25lVk5vZGUodk5vZGVUb0Nsb25lW2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgbmV3Vk5vZGUgPSB0bXBBcnJheTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBmbGFncyA9IHZOb2RlVG9DbG9uZS5mbGFncztcbiAgICAgICAgdmFyIGV2ZW50cyA9IHZOb2RlVG9DbG9uZS5ldmVudHMgfHwgKHByb3BzICYmIHByb3BzLmV2ZW50cykgfHwgbnVsbDtcbiAgICAgICAgdmFyIGtleSA9ICFpc051bGxPclVuZGVmKHZOb2RlVG9DbG9uZS5rZXkpID8gdk5vZGVUb0Nsb25lLmtleSA6IChwcm9wcyA/IHByb3BzLmtleSA6IG51bGwpO1xuICAgICAgICB2YXIgcmVmID0gdk5vZGVUb0Nsb25lLnJlZiB8fCAocHJvcHMgPyBwcm9wcy5yZWYgOiBudWxsKTtcbiAgICAgICAgaWYgKGZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICBuZXdWTm9kZSA9IGNyZWF0ZVZOb2RlKGZsYWdzLCB2Tm9kZVRvQ2xvbmUudHlwZSwgT2JqZWN0LmFzc2lnbih7fSwgdk5vZGVUb0Nsb25lLnByb3BzLCBwcm9wcyksIG51bGwsIGV2ZW50cywga2V5LCByZWYsIHRydWUpO1xuICAgICAgICAgICAgdmFyIG5ld1Byb3BzID0gbmV3Vk5vZGUucHJvcHM7XG4gICAgICAgICAgICBpZiAobmV3UHJvcHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3Q2hpbGRyZW4gPSBuZXdQcm9wcy5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGFsc28gY2xvbmUgY29tcG9uZW50IGNoaWxkcmVuIHRoYXQgYXJlIGluIHByb3BzXG4gICAgICAgICAgICAgICAgLy8gYXMgdGhlIGNoaWxkcmVuIG1heSBhbHNvIGhhdmUgYmVlbiBob2lzdGVkXG4gICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KG5ld0NoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgbmV3Q2hpbGRyZW4ubGVuZ3RoOyBpJDErKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IG5ld0NoaWxkcmVuW2kkMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ludmFsaWQoY2hpbGQpICYmIGlzVk5vZGUoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Byb3BzLmNoaWxkcmVuW2kkMV0gPSBjbG9uZVZOb2RlKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNWTm9kZShuZXdDaGlsZHJlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Byb3BzLmNoaWxkcmVuID0gY2xvbmVWTm9kZShuZXdDaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdWTm9kZS5jaGlsZHJlbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmxhZ3MgJiAzOTcwIC8qIEVsZW1lbnQgKi8pIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gKHByb3BzICYmIHByb3BzLmNoaWxkcmVuKSB8fCB2Tm9kZVRvQ2xvbmUuY2hpbGRyZW47XG4gICAgICAgICAgICBuZXdWTm9kZSA9IGNyZWF0ZVZOb2RlKGZsYWdzLCB2Tm9kZVRvQ2xvbmUudHlwZSwgT2JqZWN0LmFzc2lnbih7fSwgdk5vZGVUb0Nsb25lLnByb3BzLCBwcm9wcyksIGNoaWxkcmVuLCBldmVudHMsIGtleSwgcmVmLCAhY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZsYWdzICYgMSAvKiBUZXh0ICovKSB7XG4gICAgICAgICAgICBuZXdWTm9kZSA9IGNyZWF0ZVRleHRWTm9kZSh2Tm9kZVRvQ2xvbmUuY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdWTm9kZTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVZvaWRWTm9kZSgpIHtcbiAgICByZXR1cm4gY3JlYXRlVk5vZGUoNDA5NiAvKiBWb2lkICovKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHRWTm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGNyZWF0ZVZOb2RlKDEgLyogVGV4dCAqLywgbnVsbCwgbnVsbCwgdGV4dCwgbnVsbCwgbnVsbCwgbnVsbCwgdHJ1ZSk7XG59XG5mdW5jdGlvbiBpc1ZOb2RlKG8pIHtcbiAgICByZXR1cm4gISFvLmZsYWdzO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3REZWZhdWx0cyhzdHJpbmcsIG9iamVjdCwgdmFsdWUpIHtcbiAgICAvKiBlc2xpbnQgbm8tcmV0dXJuLWFzc2lnbjogMCAqL1xuICAgIHN0cmluZy5zcGxpdCgnLCcpLmZvckVhY2goZnVuY3Rpb24gKGkpIHsgcmV0dXJuIG9iamVjdFtpXSA9IHZhbHVlOyB9KTtcbn1cbnZhciB4bGlua05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnO1xudmFyIHhtbE5TID0gJ2h0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZSc7XG52YXIgc3ZnTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xudmFyIHN0cmljdFByb3BzID0ge307XG52YXIgYm9vbGVhblByb3BzID0ge307XG52YXIgbmFtZXNwYWNlcyA9IHt9O1xudmFyIGlzVW5pdGxlc3NOdW1iZXIgPSB7fTtcbnZhciBza2lwUHJvcHMgPSB7fTtcbnZhciBkZWh5cGhlblByb3BzID0ge1xuICAgIGh0dHBFcXVpdjogJ2h0dHAtZXF1aXYnLFxuICAgIGFjY2VwdENoYXJzZXQ6ICdhY2NlcHQtY2hhcnNldCcsXG59O1xudmFyIHByb2JhYmx5S2ViYWJQcm9wcyA9IC9eKGFjY2VudEh8YXJhYmljRnxjYXBIfGZvbnRbRlNWV118Z2x5cGhbTk9dfGhvcml6W0FPXXxwYW5vc2UxfHJlbmRlcmluZ0l8c3RyaWtldGhyb3VnaFtQVF18dW5kZXJsaW5lW1BUXXx2W0FISU1dfHZlcnRbQU9dfHhIfGFsaWdubWVudEJ8YmFzZWxpbmVTfGNsaXBbUFJdfGNvbG9yW0lQUl18ZG9taW5hbnRCfGVuYWJsZUJ8ZmlsbFtPUl18Zmxvb2RbQ09GXXxpbWFnZVJ8bGV0dGVyU3xsaWdodGluZ0N8bWFya2VyW0VNU118cG9pbnRlckV8c2hhcGVSfHN0b3BbQ09dfHN0cm9rZVtETE1PV118dGV4dFtBRFJdfHVuaWNvZGVCfHdvcmRTfHdyaXRpbmdNKS4qLztcbmZ1bmN0aW9uIGtlYmFiaXplKHN0ciwgc21hbGxMZXR0ZXIsIGxhcmdlTGV0dGVyKSB7XG4gICAgcmV0dXJuIChzbWFsbExldHRlciArIFwiLVwiICsgKGxhcmdlTGV0dGVyLnRvTG93ZXJDYXNlKCkpKTtcbn1cbnZhciBkZWxlZ2F0ZWRQcm9wcyA9IHt9O1xuY29uc3RydWN0RGVmYXVsdHMoJ3hsaW5rOmhyZWYseGxpbms6YXJjcm9sZSx4bGluazphY3R1YXRlLHhsaW5rOnJvbGUseGxpbms6dGl0bGVmLHhsaW5rOnR5cGUnLCBuYW1lc3BhY2VzLCB4bGlua05TKTtcbmNvbnN0cnVjdERlZmF1bHRzKCd4bWw6YmFzZSx4bWw6bGFuZyx4bWw6c3BhY2UnLCBuYW1lc3BhY2VzLCB4bWxOUyk7XG5jb25zdHJ1Y3REZWZhdWx0cygndm9sdW1lLGRlZmF1bHRWYWx1ZSxkZWZhdWx0Q2hlY2tlZCcsIHN0cmljdFByb3BzLCB0cnVlKTtcbmNvbnN0cnVjdERlZmF1bHRzKCdjaGlsZHJlbixjaGlsZHJlblR5cGUscmVmLGtleSxzZWxlY3RlZCxjaGVja2VkLG11bHRpcGxlJywgc2tpcFByb3BzLCB0cnVlKTtcbmNvbnN0cnVjdERlZmF1bHRzKCdvbkNsaWNrLG9uTW91c2VEb3duLG9uTW91c2VVcCxvbk1vdXNlTW92ZSxvblN1Ym1pdCxvbkRibENsaWNrLG9uS2V5RG93bixvbktleVVwLG9uS2V5UHJlc3MnLCBkZWxlZ2F0ZWRQcm9wcywgdHJ1ZSk7XG5jb25zdHJ1Y3REZWZhdWx0cygnbXV0ZWQsc2NvcGVkLGxvb3Asb3BlbixjaGVja2VkLGRlZmF1bHQsY2FwdHVyZSxkaXNhYmxlZCxyZWFkT25seSxyZXF1aXJlZCxhdXRvcGxheSxjb250cm9scyxzZWFtbGVzcyxyZXZlcnNlZCxhbGxvd2Z1bGxzY3JlZW4sbm92YWxpZGF0ZSxoaWRkZW4nLCBib29sZWFuUHJvcHMsIHRydWUpO1xuY29uc3RydWN0RGVmYXVsdHMoJ2FuaW1hdGlvbkl0ZXJhdGlvbkNvdW50LGJvcmRlckltYWdlT3V0c2V0LGJvcmRlckltYWdlU2xpY2UsYm9yZGVySW1hZ2VXaWR0aCxib3hGbGV4LGJveEZsZXhHcm91cCxib3hPcmRpbmFsR3JvdXAsY29sdW1uQ291bnQsZmxleCxmbGV4R3JvdyxmbGV4UG9zaXRpdmUsZmxleFNocmluayxmbGV4TmVnYXRpdmUsZmxleE9yZGVyLGdyaWRSb3csZ3JpZENvbHVtbixmb250V2VpZ2h0LGxpbmVDbGFtcCxsaW5lSGVpZ2h0LG9wYWNpdHksb3JkZXIsb3JwaGFucyx0YWJTaXplLHdpZG93cyx6SW5kZXgsem9vbSxmaWxsT3BhY2l0eSxmbG9vZE9wYWNpdHksc3RvcE9wYWNpdHksc3Ryb2tlRGFzaGFycmF5LHN0cm9rZURhc2hvZmZzZXQsc3Ryb2tlTWl0ZXJsaW1pdCxzdHJva2VPcGFjaXR5LHN0cm9rZVdpZHRoLCcsIGlzVW5pdGxlc3NOdW1iZXIsIHRydWUpO1xuXG52YXIgTGlmZWN5Y2xlID0gZnVuY3Rpb24gTGlmZWN5Y2xlKCkge1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gICAgdGhpcy5mYXN0VW5tb3VudCA9IHRydWU7XG59O1xuTGlmZWN5Y2xlLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyIChjYWxsYmFjaykge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xufTtcbkxpZmVjeWNsZS5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIHRyaWdnZXIgKCkge1xuICAgICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcyQxLmxpc3RlbmVyc1tpXSgpO1xuICAgIH1cbn07XG5cbnZhciBpc2lPUyA9IGlzQnJvd3NlciAmJiAhIW5hdmlnYXRvci5wbGF0Zm9ybSAmJiAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pO1xudmFyIGRlbGVnYXRlZEV2ZW50cyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGhhbmRsZUV2ZW50KG5hbWUsIGxhc3RFdmVudCwgbmV4dEV2ZW50LCBkb20pIHtcbiAgICB2YXIgZGVsZWdhdGVkUm9vdHMgPSBkZWxlZ2F0ZWRFdmVudHMuZ2V0KG5hbWUpO1xuICAgIGlmIChuZXh0RXZlbnQpIHtcbiAgICAgICAgaWYgKCFkZWxlZ2F0ZWRSb290cykge1xuICAgICAgICAgICAgZGVsZWdhdGVkUm9vdHMgPSB7IGl0ZW1zOiBuZXcgTWFwKCksIGNvdW50OiAwLCBkb2NFdmVudDogbnVsbCB9O1xuICAgICAgICAgICAgdmFyIGRvY0V2ZW50ID0gYXR0YWNoRXZlbnRUb0RvY3VtZW50KG5hbWUsIGRlbGVnYXRlZFJvb3RzKTtcbiAgICAgICAgICAgIGRlbGVnYXRlZFJvb3RzLmRvY0V2ZW50ID0gZG9jRXZlbnQ7XG4gICAgICAgICAgICBkZWxlZ2F0ZWRFdmVudHMuc2V0KG5hbWUsIGRlbGVnYXRlZFJvb3RzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxhc3RFdmVudCkge1xuICAgICAgICAgICAgZGVsZWdhdGVkUm9vdHMuY291bnQrKztcbiAgICAgICAgICAgIGlmIChpc2lPUyAmJiBuYW1lID09PSAnb25DbGljaycpIHtcbiAgICAgICAgICAgICAgICB0cmFwQ2xpY2tPbk5vbkludGVyYWN0aXZlRWxlbWVudChkb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlbGVnYXRlZFJvb3RzLml0ZW1zLnNldChkb20sIG5leHRFdmVudCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGRlbGVnYXRlZFJvb3RzKSB7XG4gICAgICAgIGlmIChkZWxlZ2F0ZWRSb290cy5pdGVtcy5oYXMoZG9tKSkge1xuICAgICAgICAgICAgZGVsZWdhdGVkUm9vdHMuY291bnQtLTtcbiAgICAgICAgICAgIGRlbGVnYXRlZFJvb3RzLml0ZW1zLmRlbGV0ZShkb20pO1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlZFJvb3RzLmNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihub3JtYWxpemVFdmVudE5hbWUobmFtZSksIGRlbGVnYXRlZFJvb3RzLmRvY0V2ZW50KTtcbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZWRFdmVudHMuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCwgZG9tLCBpdGVtcywgY291bnQsIGV2ZW50RGF0YSkge1xuICAgIHZhciBldmVudHNUb1RyaWdnZXIgPSBpdGVtcy5nZXQoZG9tKTtcbiAgICBpZiAoZXZlbnRzVG9UcmlnZ2VyKSB7XG4gICAgICAgIGNvdW50LS07XG4gICAgICAgIC8vIGxpbmtFdmVudCBvYmplY3RcbiAgICAgICAgZXZlbnREYXRhLmRvbSA9IGRvbTtcbiAgICAgICAgaWYgKGV2ZW50c1RvVHJpZ2dlci5ldmVudCkge1xuICAgICAgICAgICAgZXZlbnRzVG9UcmlnZ2VyLmV2ZW50KGV2ZW50c1RvVHJpZ2dlci5kYXRhLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBldmVudHNUb1RyaWdnZXIoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudERhdGEuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIHBhcmVudERvbSA9IGRvbS5wYXJlbnROb2RlO1xuICAgIGlmIChjb3VudCA+IDAgJiYgKHBhcmVudERvbSB8fCBwYXJlbnREb20gPT09IGRvY3VtZW50LmJvZHkpKSB7XG4gICAgICAgIGRpc3BhdGNoRXZlbnQoZXZlbnQsIHBhcmVudERvbSwgaXRlbXMsIGNvdW50LCBldmVudERhdGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG5vcm1hbGl6ZUV2ZW50TmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUuc3Vic3RyKDIpLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBhdHRhY2hFdmVudFRvRG9jdW1lbnQobmFtZSwgZGVsZWdhdGVkUm9vdHMpIHtcbiAgICB2YXIgZG9jRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGV2ZW50RGF0YSA9IHtcbiAgICAgICAgICAgIHN0b3BQcm9wYWdhdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBkb206IGRvY3VtZW50XG4gICAgICAgIH07XG4gICAgICAgIC8vIHdlIGhhdmUgdG8gZG8gdGhpcyBhcyBzb21lIGJyb3dzZXJzIHJlY3ljbGUgdGhlIHNhbWUgRXZlbnQgYmV0d2VlbiBjYWxsc1xuICAgICAgICAvLyBzbyB3ZSBuZWVkIHRvIG1ha2UgdGhlIHByb3BlcnR5IGNvbmZpZ3VyYWJsZVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXZlbnQsICdjdXJyZW50VGFyZ2V0Jywge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50RGF0YS5kb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBldmVudERhdGEuc3RvcFByb3BhZ2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGNvdW50ID0gZGVsZWdhdGVkUm9vdHMuY291bnQ7XG4gICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoZXZlbnQsIGV2ZW50LnRhcmdldCwgZGVsZWdhdGVkUm9vdHMuaXRlbXMsIGNvdW50LCBldmVudERhdGEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG5vcm1hbGl6ZUV2ZW50TmFtZShuYW1lKSwgZG9jRXZlbnQpO1xuICAgIHJldHVybiBkb2NFdmVudDtcbn1cbmZ1bmN0aW9uIGVtcHR5Rm4oKSB7IH1cbmZ1bmN0aW9uIHRyYXBDbGlja09uTm9uSW50ZXJhY3RpdmVFbGVtZW50KGRvbSkge1xuICAgIC8vIE1vYmlsZSBTYWZhcmkgZG9lcyBub3QgZmlyZSBwcm9wZXJseSBidWJibGUgY2xpY2sgZXZlbnRzIG9uXG4gICAgLy8gbm9uLWludGVyYWN0aXZlIGVsZW1lbnRzLCB3aGljaCBtZWFucyBkZWxlZ2F0ZWQgY2xpY2sgbGlzdGVuZXJzIGRvIG5vdFxuICAgIC8vIGZpcmUuIFRoZSB3b3JrYXJvdW5kIGZvciB0aGlzIGJ1ZyBpbnZvbHZlcyBhdHRhY2hpbmcgYW4gZW1wdHkgY2xpY2tcbiAgICAvLyBsaXN0ZW5lciBvbiB0aGUgdGFyZ2V0IG5vZGUuXG4gICAgLy8gaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9ibG9nL2FyY2hpdmVzLzIwMTAvMDkvY2xpY2tfZXZlbnRfZGVsLmh0bWxcbiAgICAvLyBKdXN0IHNldCBpdCB1c2luZyB0aGUgb25jbGljayBwcm9wZXJ0eSBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gbWFuYWdlIGFueVxuICAgIC8vIGJvb2trZWVwaW5nIGZvciBpdC4gTm90IHN1cmUgaWYgd2UgbmVlZCB0byBjbGVhciBpdCB3aGVuIHRoZSBsaXN0ZW5lciBpc1xuICAgIC8vIHJlbW92ZWQuXG4gICAgLy8gVE9ETzogT25seSBkbyB0aGlzIGZvciB0aGUgcmVsZXZhbnQgU2FmYXJpcyBtYXliZT9cbiAgICBkb20ub25jbGljayA9IGVtcHR5Rm47XG59XG5cbnZhciBjb21wb25lbnRQb29scyA9IG5ldyBNYXAoKTtcbnZhciBlbGVtZW50UG9vbHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiByZWN5Y2xlRWxlbWVudCh2Tm9kZSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRykge1xuICAgIHZhciB0YWcgPSB2Tm9kZS50eXBlO1xuICAgIHZhciBrZXkgPSB2Tm9kZS5rZXk7XG4gICAgdmFyIHBvb2xzID0gZWxlbWVudFBvb2xzLmdldCh0YWcpO1xuICAgIGlmICghaXNVbmRlZmluZWQocG9vbHMpKSB7XG4gICAgICAgIHZhciBwb29sID0ga2V5ID09PSBudWxsID8gcG9vbHMubm9uS2V5ZWQgOiBwb29scy5rZXllZC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChwb29sKSkge1xuICAgICAgICAgICAgdmFyIHJlY3ljbGVkVk5vZGUgPSBwb29sLnBvcCgpO1xuICAgICAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChyZWN5Y2xlZFZOb2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoRWxlbWVudChyZWN5Y2xlZFZOb2RlLCB2Tm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZOb2RlLmRvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIHBvb2xFbGVtZW50KHZOb2RlKSB7XG4gICAgdmFyIHRhZyA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIGtleSA9IHZOb2RlLmtleTtcbiAgICB2YXIgcG9vbHMgPSBlbGVtZW50UG9vbHMuZ2V0KHRhZyk7XG4gICAgaWYgKGlzVW5kZWZpbmVkKHBvb2xzKSkge1xuICAgICAgICBwb29scyA9IHtcbiAgICAgICAgICAgIG5vbktleWVkOiBbXSxcbiAgICAgICAgICAgIGtleWVkOiBuZXcgTWFwKCksXG4gICAgICAgIH07XG4gICAgICAgIGVsZW1lbnRQb29scy5zZXQodGFnLCBwb29scyk7XG4gICAgfVxuICAgIGlmIChpc051bGwoa2V5KSkge1xuICAgICAgICBwb29scy5ub25LZXllZC5wdXNoKHZOb2RlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBwb29sID0gcG9vbHMua2V5ZWQuZ2V0KGtleSk7XG4gICAgICAgIGlmIChpc1VuZGVmaW5lZChwb29sKSkge1xuICAgICAgICAgICAgcG9vbCA9IFtdO1xuICAgICAgICAgICAgcG9vbHMua2V5ZWQuc2V0KGtleSwgcG9vbCk7XG4gICAgICAgIH1cbiAgICAgICAgcG9vbC5wdXNoKHZOb2RlKTtcbiAgICB9XG59XG5mdW5jdGlvbiByZWN5Y2xlQ29tcG9uZW50KHZOb2RlLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSB7XG4gICAgdmFyIHR5cGUgPSB2Tm9kZS50eXBlO1xuICAgIHZhciBrZXkgPSB2Tm9kZS5rZXk7XG4gICAgdmFyIHBvb2xzID0gY29tcG9uZW50UG9vbHMuZ2V0KHR5cGUpO1xuICAgIGlmICghaXNVbmRlZmluZWQocG9vbHMpKSB7XG4gICAgICAgIHZhciBwb29sID0ga2V5ID09PSBudWxsID8gcG9vbHMubm9uS2V5ZWQgOiBwb29scy5rZXllZC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChwb29sKSkge1xuICAgICAgICAgICAgdmFyIHJlY3ljbGVkVk5vZGUgPSBwb29sLnBvcCgpO1xuICAgICAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChyZWN5Y2xlZFZOb2RlKSkge1xuICAgICAgICAgICAgICAgIHZhciBmbGFncyA9IHZOb2RlLmZsYWdzO1xuICAgICAgICAgICAgICAgIHZhciBmYWlsZWQgPSBwYXRjaENvbXBvbmVudChyZWN5Y2xlZFZOb2RlLCB2Tm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgZmxhZ3MgJiA0IC8qIENvbXBvbmVudENsYXNzICovLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAoIWZhaWxlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdk5vZGUuZG9tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIHBvb2xDb21wb25lbnQodk5vZGUpIHtcbiAgICB2YXIgdHlwZSA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIGtleSA9IHZOb2RlLmtleTtcbiAgICB2YXIgaG9va3MgPSB2Tm9kZS5yZWY7XG4gICAgdmFyIG5vblJlY3ljbGVIb29rcyA9IGhvb2tzICYmIChob29rcy5vbkNvbXBvbmVudFdpbGxNb3VudCB8fFxuICAgICAgICBob29rcy5vbkNvbXBvbmVudFdpbGxVbm1vdW50IHx8XG4gICAgICAgIGhvb2tzLm9uQ29tcG9uZW50RGlkTW91bnQgfHxcbiAgICAgICAgaG9va3Mub25Db21wb25lbnRXaWxsVXBkYXRlIHx8XG4gICAgICAgIGhvb2tzLm9uQ29tcG9uZW50RGlkVXBkYXRlKTtcbiAgICBpZiAobm9uUmVjeWNsZUhvb2tzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHBvb2xzID0gY29tcG9uZW50UG9vbHMuZ2V0KHR5cGUpO1xuICAgIGlmIChpc1VuZGVmaW5lZChwb29scykpIHtcbiAgICAgICAgcG9vbHMgPSB7XG4gICAgICAgICAgICBub25LZXllZDogW10sXG4gICAgICAgICAgICBrZXllZDogbmV3IE1hcCgpLFxuICAgICAgICB9O1xuICAgICAgICBjb21wb25lbnRQb29scy5zZXQodHlwZSwgcG9vbHMpO1xuICAgIH1cbiAgICBpZiAoaXNOdWxsKGtleSkpIHtcbiAgICAgICAgcG9vbHMubm9uS2V5ZWQucHVzaCh2Tm9kZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgcG9vbCA9IHBvb2xzLmtleWVkLmdldChrZXkpO1xuICAgICAgICBpZiAoaXNVbmRlZmluZWQocG9vbCkpIHtcbiAgICAgICAgICAgIHBvb2wgPSBbXTtcbiAgICAgICAgICAgIHBvb2xzLmtleWVkLnNldChrZXksIHBvb2wpO1xuICAgICAgICB9XG4gICAgICAgIHBvb2wucHVzaCh2Tm9kZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1bm1vdW50KHZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY2FuUmVjeWNsZSwgaXNSZWN5Y2xpbmcpIHtcbiAgICB2YXIgZmxhZ3MgPSB2Tm9kZS5mbGFncztcbiAgICBpZiAoZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgdW5tb3VudENvbXBvbmVudCh2Tm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNhblJlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmxhZ3MgJiAzOTcwIC8qIEVsZW1lbnQgKi8pIHtcbiAgICAgICAgdW5tb3VudEVsZW1lbnQodk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjYW5SZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZsYWdzICYgKDEgLyogVGV4dCAqLyB8IDQwOTYgLyogVm9pZCAqLykpIHtcbiAgICAgICAgdW5tb3VudFZvaWRPclRleHQodk5vZGUsIHBhcmVudERvbSk7XG4gICAgfVxufVxuZnVuY3Rpb24gdW5tb3VudFZvaWRPclRleHQodk5vZGUsIHBhcmVudERvbSkge1xuICAgIGlmIChwYXJlbnREb20pIHtcbiAgICAgICAgcmVtb3ZlQ2hpbGQocGFyZW50RG9tLCB2Tm9kZS5kb20pO1xuICAgIH1cbn1cbnZhciBhbHJlYWR5VW5tb3VudGVkID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHVubW91bnRDb21wb25lbnQodk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjYW5SZWN5Y2xlLCBpc1JlY3ljbGluZykge1xuICAgIHZhciBpbnN0YW5jZSA9IHZOb2RlLmNoaWxkcmVuO1xuICAgIHZhciBmbGFncyA9IHZOb2RlLmZsYWdzO1xuICAgIHZhciBpc1N0YXRlZnVsQ29tcG9uZW50JCQxID0gZmxhZ3MgJiA0O1xuICAgIHZhciByZWYgPSB2Tm9kZS5yZWY7XG4gICAgdmFyIGRvbSA9IHZOb2RlLmRvbTtcbiAgICBpZiAoYWxyZWFkeVVubW91bnRlZC5oYXModk5vZGUpICYmICFpc1JlY3ljbGluZyAmJiAhcGFyZW50RG9tKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYWxyZWFkeVVubW91bnRlZC5zZXQodk5vZGUpO1xuICAgIGlmICghaXNSZWN5Y2xpbmcpIHtcbiAgICAgICAgaWYgKGlzU3RhdGVmdWxDb21wb25lbnQkJDEpIHtcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UuX3VubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9pZ25vcmVTZXRTdGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5iZWZvcmVVbm1vdW50ICYmIG9wdGlvbnMuYmVmb3JlVW5tb3VudCh2Tm9kZSk7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuY29tcG9uZW50V2lsbFVubW91bnQgJiYgaW5zdGFuY2UuY29tcG9uZW50V2lsbFVubW91bnQoKTtcbiAgICAgICAgICAgICAgICBpZiAocmVmICYmICFpc1JlY3ljbGluZykge1xuICAgICAgICAgICAgICAgICAgICByZWYobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZmluZERPTU5vZGVFbmFibGVkICYmIGNvbXBvbmVudFRvRE9NTm9kZU1hcC5kZWxldGUoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHZhciBzdWJMaWZlY3ljbGUgPSBpbnN0YW5jZS5fbGlmZWN5Y2xlO1xuICAgICAgICAgICAgICAgIGlmICghc3ViTGlmZWN5Y2xlLmZhc3RVbm1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHVubW91bnQoaW5zdGFuY2UuX2xhc3RJbnB1dCwgbnVsbCwgc3ViTGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZihyZWYpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKHJlZi5vbkNvbXBvbmVudFdpbGxVbm1vdW50KSkge1xuICAgICAgICAgICAgICAgICAgICByZWYub25Db21wb25lbnRXaWxsVW5tb3VudChkb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghbGlmZWN5Y2xlLmZhc3RVbm1vdW50KSB7XG4gICAgICAgICAgICAgICAgdW5tb3VudChpbnN0YW5jZSwgbnVsbCwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJlbnREb20pIHtcbiAgICAgICAgdmFyIGxhc3RJbnB1dCA9IGluc3RhbmNlLl9sYXN0SW5wdXQ7XG4gICAgICAgIGlmIChpc051bGxPclVuZGVmKGxhc3RJbnB1dCkpIHtcbiAgICAgICAgICAgIGxhc3RJbnB1dCA9IGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZUNoaWxkKHBhcmVudERvbSwgZG9tKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucmVjeWNsaW5nRW5hYmxlZCAmJiAhaXNTdGF0ZWZ1bENvbXBvbmVudCQkMSAmJiAocGFyZW50RG9tIHx8IGNhblJlY3ljbGUpKSB7XG4gICAgICAgIHBvb2xDb21wb25lbnQodk5vZGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVubW91bnRFbGVtZW50KHZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY2FuUmVjeWNsZSwgaXNSZWN5Y2xpbmcpIHtcbiAgICB2YXIgZG9tID0gdk5vZGUuZG9tO1xuICAgIHZhciByZWYgPSB2Tm9kZS5yZWY7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cztcbiAgICBpZiAoYWxyZWFkeVVubW91bnRlZC5oYXModk5vZGUpICYmICFpc1JlY3ljbGluZyAmJiAhcGFyZW50RG9tKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYWxyZWFkeVVubW91bnRlZC5zZXQodk5vZGUpO1xuICAgIGlmICghbGlmZWN5Y2xlLmZhc3RVbm1vdW50KSB7XG4gICAgICAgIGlmIChyZWYgJiYgIWlzUmVjeWNsaW5nKSB7XG4gICAgICAgICAgICB1bm1vdW50UmVmKHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZihjaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHVubW91bnRDaGlsZHJlbiQxKGNoaWxkcmVuLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzTnVsbChldmVudHMpKSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICAvLyBkbyBub3QgYWRkIGEgaGFzT3duUHJvcGVydHkgY2hlY2sgaGVyZSwgaXQgYWZmZWN0cyBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgcGF0Y2hFdmVudChuYW1lLCBldmVudHNbbmFtZV0sIG51bGwsIGRvbSk7XG4gICAgICAgICAgICBldmVudHNbbmFtZV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJlbnREb20pIHtcbiAgICAgICAgcmVtb3ZlQ2hpbGQocGFyZW50RG9tLCBkb20pO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5yZWN5Y2xpbmdFbmFibGVkICYmIChwYXJlbnREb20gfHwgY2FuUmVjeWNsZSkpIHtcbiAgICAgICAgcG9vbEVsZW1lbnQodk5vZGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVubW91bnRDaGlsZHJlbiQxKGNoaWxkcmVuLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKSB7XG4gICAgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKCFpc0ludmFsaWQoY2hpbGQpICYmIGlzT2JqZWN0KGNoaWxkKSkge1xuICAgICAgICAgICAgICAgIHVubW91bnQoY2hpbGQsIG51bGwsIGxpZmVjeWNsZSwgZmFsc2UsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc09iamVjdChjaGlsZHJlbikpIHtcbiAgICAgICAgdW5tb3VudChjaGlsZHJlbiwgbnVsbCwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVubW91bnRSZWYocmVmKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24ocmVmKSkge1xuICAgICAgICByZWYobnVsbCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoaXNJbnZhbGlkKHJlZikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcignc3RyaW5nIFwicmVmc1wiIGFyZSBub3Qgc3VwcG9ydGVkIGluIEluZmVybm8gMS4wLiBVc2UgY2FsbGJhY2sgXCJyZWZzXCIgaW5zdGVhZC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDbGFzc0NvbXBvbmVudEluc3RhbmNlKHZOb2RlLCBDb21wb25lbnQsIHByb3BzLCBjb250ZXh0LCBpc1NWRykge1xuICAgIGlmIChpc1VuZGVmaW5lZChjb250ZXh0KSkge1xuICAgICAgICBjb250ZXh0ID0ge307XG4gICAgfVxuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpO1xuICAgIGluc3RhbmNlLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIGlmIChpbnN0YW5jZS5wcm9wcyA9PT0gRU1QVFlfT0JKKSB7XG4gICAgICAgIGluc3RhbmNlLnByb3BzID0gcHJvcHM7XG4gICAgfVxuICAgIGluc3RhbmNlLl9wYXRjaCA9IHBhdGNoO1xuICAgIGlmIChvcHRpb25zLmZpbmRET01Ob2RlRW5hYmxlZCkge1xuICAgICAgICBpbnN0YW5jZS5fY29tcG9uZW50VG9ET01Ob2RlTWFwID0gY29tcG9uZW50VG9ET01Ob2RlTWFwO1xuICAgIH1cbiAgICBpbnN0YW5jZS5fdW5tb3VudGVkID0gZmFsc2U7XG4gICAgaW5zdGFuY2UuX3BlbmRpbmdTZXRTdGF0ZSA9IHRydWU7XG4gICAgaW5zdGFuY2UuX2lzU1ZHID0gaXNTVkc7XG4gICAgaWYgKGlzRnVuY3Rpb24oaW5zdGFuY2UuY29tcG9uZW50V2lsbE1vdW50KSkge1xuICAgICAgICBpbnN0YW5jZS5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgICB9XG4gICAgdmFyIGNoaWxkQ29udGV4dCA9IGluc3RhbmNlLmdldENoaWxkQ29udGV4dCgpO1xuICAgIGlmICghaXNOdWxsT3JVbmRlZihjaGlsZENvbnRleHQpKSB7XG4gICAgICAgIGluc3RhbmNlLl9jaGlsZENvbnRleHQgPSBPYmplY3QuYXNzaWduKHt9LCBjb250ZXh0LCBjaGlsZENvbnRleHQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaW5zdGFuY2UuX2NoaWxkQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgfVxuICAgIG9wdGlvbnMuYmVmb3JlUmVuZGVyICYmIG9wdGlvbnMuYmVmb3JlUmVuZGVyKGluc3RhbmNlKTtcbiAgICB2YXIgaW5wdXQgPSBpbnN0YW5jZS5yZW5kZXIocHJvcHMsIGluc3RhbmNlLnN0YXRlLCBjb250ZXh0KTtcbiAgICBvcHRpb25zLmFmdGVyUmVuZGVyICYmIG9wdGlvbnMuYWZ0ZXJSZW5kZXIoaW5zdGFuY2UpO1xuICAgIGlmIChpc0FycmF5KGlucHV0KSkge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcignYSB2YWxpZCBJbmZlcm5vIFZOb2RlIChvciBudWxsKSBtdXN0IGJlIHJldHVybmVkIGZyb20gYSBjb21wb25lbnQgcmVuZGVyLiBZb3UgbWF5IGhhdmUgcmV0dXJuZWQgYW4gYXJyYXkgb3IgYW4gaW52YWxpZCBvYmplY3QuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0ludmFsaWQoaW5wdXQpKSB7XG4gICAgICAgIGlucHV0ID0gY3JlYXRlVm9pZFZOb2RlKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzU3RyaW5nT3JOdW1iZXIoaW5wdXQpKSB7XG4gICAgICAgIGlucHV0ID0gY3JlYXRlVGV4dFZOb2RlKGlucHV0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpbnB1dC5kb20pIHtcbiAgICAgICAgICAgIGlucHV0ID0gY2xvbmVWTm9kZShpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0LmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYXZlIGFuIGlucHV0IHRoYXQgaXMgYWxzbyBhIGNvbXBvbmVudCwgd2UgcnVuIGludG8gYSB0cmlja3kgc2l0dWF0aW9uXG4gICAgICAgICAgICAvLyB3aGVyZSB0aGUgcm9vdCB2Tm9kZSBuZWVkcyB0byBhbHdheXMgaGF2ZSB0aGUgY29ycmVjdCBET00gZW50cnlcbiAgICAgICAgICAgIC8vIHNvIHdlIGJyZWFrIG1vbm9tb3JwaGlzbSBvbiBvdXIgaW5wdXQgYW5kIHN1cHBseSBpdCBvdXIgdk5vZGUgYXMgcGFyZW50Vk5vZGVcbiAgICAgICAgICAgIC8vIHdlIGNhbiBvcHRpbWlzZSB0aGlzIGluIHRoZSBmdXR1cmUsIGJ1dCB0aGlzIGdldHMgdXMgb3V0IG9mIGEgbG90IG9mIGlzc3Vlc1xuICAgICAgICAgICAgaW5wdXQucGFyZW50Vk5vZGUgPSB2Tm9kZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbnN0YW5jZS5fcGVuZGluZ1NldFN0YXRlID0gZmFsc2U7XG4gICAgaW5zdGFuY2UuX2xhc3RJbnB1dCA9IGlucHV0O1xuICAgIHJldHVybiBpbnN0YW5jZTtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VMYXN0Q2hpbGRBbmRVbm1vdW50KGxhc3RJbnB1dCwgbmV4dElucHV0LCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKSB7XG4gICAgcmVwbGFjZVZOb2RlKHBhcmVudERvbSwgbW91bnQobmV4dElucHV0LCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSwgbGFzdElucHV0LCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VWTm9kZShwYXJlbnREb20sIGRvbSwgdk5vZGUsIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpIHtcbiAgICB2YXIgc2hhbGxvd1VubW91bnQgPSBmYWxzZTtcbiAgICAvLyB3ZSBjYW5ub3QgY2FjaGUgbm9kZVR5cGUgaGVyZSBhcyB2Tm9kZSBtaWdodCBiZSByZS1hc3NpZ25lZCBiZWxvd1xuICAgIGlmICh2Tm9kZS5mbGFncyAmIDI4IC8qIENvbXBvbmVudCAqLykge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgYWNjZXNzaW5nIGEgc3RhdGVmdWwgb3Igc3RhdGVsZXNzIGNvbXBvbmVudCwgd2Ugd2FudCB0byBhY2Nlc3MgdGhlaXIgbGFzdCByZW5kZXJlZCBpbnB1dFxuICAgICAgICAvLyBhY2Nlc3NpbmcgdGhlaXIgRE9NIG5vZGUgaXMgbm90IHVzZWZ1bCB0byB1cyBoZXJlXG4gICAgICAgIHVubW91bnQodk5vZGUsIG51bGwsIGxpZmVjeWNsZSwgZmFsc2UsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgdk5vZGUgPSB2Tm9kZS5jaGlsZHJlbi5fbGFzdElucHV0IHx8IHZOb2RlLmNoaWxkcmVuO1xuICAgICAgICBzaGFsbG93VW5tb3VudCA9IHRydWU7XG4gICAgfVxuICAgIHJlcGxhY2VDaGlsZChwYXJlbnREb20sIGRvbSwgdk5vZGUuZG9tKTtcbiAgICB1bm1vdW50KHZOb2RlLCBudWxsLCBsaWZlY3ljbGUsIGZhbHNlLCBpc1JlY3ljbGluZyk7XG59XG5mdW5jdGlvbiBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50SW5wdXQodk5vZGUsIGNvbXBvbmVudCwgcHJvcHMsIGNvbnRleHQpIHtcbiAgICB2YXIgaW5wdXQgPSBjb21wb25lbnQocHJvcHMsIGNvbnRleHQpO1xuICAgIGlmIChpc0FycmF5KGlucHV0KSkge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcignYSB2YWxpZCBJbmZlcm5vIFZOb2RlIChvciBudWxsKSBtdXN0IGJlIHJldHVybmVkIGZyb20gYSBjb21wb25lbnQgcmVuZGVyLiBZb3UgbWF5IGhhdmUgcmV0dXJuZWQgYW4gYXJyYXkgb3IgYW4gaW52YWxpZCBvYmplY3QuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0ludmFsaWQoaW5wdXQpKSB7XG4gICAgICAgIGlucHV0ID0gY3JlYXRlVm9pZFZOb2RlKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzU3RyaW5nT3JOdW1iZXIoaW5wdXQpKSB7XG4gICAgICAgIGlucHV0ID0gY3JlYXRlVGV4dFZOb2RlKGlucHV0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpbnB1dC5kb20pIHtcbiAgICAgICAgICAgIGlucHV0ID0gY2xvbmVWTm9kZShpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0LmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYXZlIGFuIGlucHV0IHRoYXQgaXMgYWxzbyBhIGNvbXBvbmVudCwgd2UgcnVuIGludG8gYSB0cmlja3kgc2l0dWF0aW9uXG4gICAgICAgICAgICAvLyB3aGVyZSB0aGUgcm9vdCB2Tm9kZSBuZWVkcyB0byBhbHdheXMgaGF2ZSB0aGUgY29ycmVjdCBET00gZW50cnlcbiAgICAgICAgICAgIC8vIHNvIHdlIGJyZWFrIG1vbm9tb3JwaGlzbSBvbiBvdXIgaW5wdXQgYW5kIHN1cHBseSBpdCBvdXIgdk5vZGUgYXMgcGFyZW50Vk5vZGVcbiAgICAgICAgICAgIC8vIHdlIGNhbiBvcHRpbWlzZSB0aGlzIGluIHRoZSBmdXR1cmUsIGJ1dCB0aGlzIGdldHMgdXMgb3V0IG9mIGEgbG90IG9mIGlzc3Vlc1xuICAgICAgICAgICAgaW5wdXQucGFyZW50Vk5vZGUgPSB2Tm9kZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG59XG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChkb20sIHRleHQpIHtcbiAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgZG9tLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRvbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJykpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZVRleHRDb250ZW50KGRvbSwgdGV4dCkge1xuICAgIGRvbS5maXJzdENoaWxkLm5vZGVWYWx1ZSA9IHRleHQ7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChwYXJlbnREb20sIGRvbSkge1xuICAgIHBhcmVudERvbS5hcHBlbmRDaGlsZChkb20pO1xufVxuZnVuY3Rpb24gaW5zZXJ0T3JBcHBlbmQocGFyZW50RG9tLCBuZXdOb2RlLCBuZXh0Tm9kZSkge1xuICAgIGlmIChpc051bGxPclVuZGVmKG5leHROb2RlKSkge1xuICAgICAgICBhcHBlbmRDaGlsZChwYXJlbnREb20sIG5ld05vZGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcGFyZW50RG9tLmluc2VydEJlZm9yZShuZXdOb2RlLCBuZXh0Tm9kZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gZG9jdW1lbnRDcmVhdGVFbGVtZW50KHRhZywgaXNTVkcpIHtcbiAgICBpZiAoaXNTVkcgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhzdmdOUywgdGFnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gcmVwbGFjZVdpdGhOZXdOb2RlKGxhc3ROb2RlLCBuZXh0Tm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZykge1xuICAgIHVubW91bnQobGFzdE5vZGUsIG51bGwsIGxpZmVjeWNsZSwgZmFsc2UsIGlzUmVjeWNsaW5nKTtcbiAgICB2YXIgZG9tID0gbW91bnQobmV4dE5vZGUsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgIG5leHROb2RlLmRvbSA9IGRvbTtcbiAgICByZXBsYWNlQ2hpbGQocGFyZW50RG9tLCBkb20sIGxhc3ROb2RlLmRvbSk7XG59XG5mdW5jdGlvbiByZXBsYWNlQ2hpbGQocGFyZW50RG9tLCBuZXh0RG9tLCBsYXN0RG9tKSB7XG4gICAgaWYgKCFwYXJlbnREb20pIHtcbiAgICAgICAgcGFyZW50RG9tID0gbGFzdERvbS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICBwYXJlbnREb20ucmVwbGFjZUNoaWxkKG5leHREb20sIGxhc3REb20pO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ2hpbGQocGFyZW50RG9tLCBkb20pIHtcbiAgICBwYXJlbnREb20ucmVtb3ZlQ2hpbGQoZG9tKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkcmVuKGRvbSwgY2hpbGRyZW4sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpIHtcbiAgICBkb20udGV4dENvbnRlbnQgPSAnJztcbiAgICBpZiAoIWxpZmVjeWNsZS5mYXN0VW5tb3VudCB8fCAobGlmZWN5Y2xlLmZhc3RVbm1vdW50ICYmIG9wdGlvbnMucmVjeWNsaW5nRW5hYmxlZCAmJiAhaXNSZWN5Y2xpbmcpKSB7XG4gICAgICAgIHJlbW92ZUNoaWxkcmVuKG51bGwsIGNoaWxkcmVuLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiByZW1vdmVDaGlsZHJlbihkb20sIGNoaWxkcmVuLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKCFpc0ludmFsaWQoY2hpbGQpKSB7XG4gICAgICAgICAgICB1bm1vdW50KGNoaWxkLCBkb20sIGxpZmVjeWNsZSwgdHJ1ZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaXNLZXllZChsYXN0Q2hpbGRyZW4sIG5leHRDaGlsZHJlbikge1xuICAgIHJldHVybiBuZXh0Q2hpbGRyZW4ubGVuZ3RoICYmICFpc051bGxPclVuZGVmKG5leHRDaGlsZHJlblswXSkgJiYgIWlzTnVsbE9yVW5kZWYobmV4dENoaWxkcmVuWzBdLmtleSlcbiAgICAgICAgJiYgbGFzdENoaWxkcmVuLmxlbmd0aCAmJiAhaXNOdWxsT3JVbmRlZihsYXN0Q2hpbGRyZW5bMF0pICYmICFpc051bGxPclVuZGVmKGxhc3RDaGlsZHJlblswXS5rZXkpO1xufVxuXG5mdW5jdGlvbiBpc0NoZWNrZWRUeXBlKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2NoZWNrYm94JyB8fCB0eXBlID09PSAncmFkaW8nO1xufVxuZnVuY3Rpb24gaXNDb250cm9sbGVkKHByb3BzKSB7XG4gICAgdmFyIHVzZXNDaGVja2VkID0gaXNDaGVja2VkVHlwZShwcm9wcy50eXBlKTtcbiAgICByZXR1cm4gdXNlc0NoZWNrZWQgPyAhaXNOdWxsT3JVbmRlZihwcm9wcy5jaGVja2VkKSA6ICFpc051bGxPclVuZGVmKHByb3BzLnZhbHVlKTtcbn1cbmZ1bmN0aW9uIG9uVGV4dElucHV0Q2hhbmdlKGUpIHtcbiAgICB2YXIgdk5vZGUgPSB0aGlzLnZOb2RlO1xuICAgIHZhciBldmVudHMgPSB2Tm9kZS5ldmVudHMgfHwgRU1QVFlfT0JKO1xuICAgIHZhciBkb20gPSB2Tm9kZS5kb207XG4gICAgaWYgKGV2ZW50cy5vbklucHV0KSB7XG4gICAgICAgIHZhciBldmVudCA9IGV2ZW50cy5vbklucHV0O1xuICAgICAgICBpZiAoZXZlbnQuZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50KGV2ZW50LmRhdGEsIGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoZXZlbnRzLm9uaW5wdXQpIHtcbiAgICAgICAgZXZlbnRzLm9uaW5wdXQoZSk7XG4gICAgfVxuICAgIC8vIHRoZSB1c2VyIG1heSBoYXZlIHVwZGF0ZWQgdGhlIHZOb2RlIGZyb20gdGhlIGFib3ZlIG9uSW5wdXQgZXZlbnRzXG4gICAgLy8gc28gd2UgbmVlZCB0byBnZXQgaXQgZnJvbSB0aGUgY29udGV4dCBvZiBgdGhpc2AgYWdhaW5cbiAgICBhcHBseVZhbHVlKHRoaXMudk5vZGUsIGRvbSk7XG59XG5mdW5jdGlvbiB3cmFwcGVkT25DaGFuZ2UoZSkge1xuICAgIHZhciB2Tm9kZSA9IHRoaXMudk5vZGU7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGV2ZW50ID0gZXZlbnRzLm9uQ2hhbmdlO1xuICAgIGlmIChldmVudC5ldmVudCkge1xuICAgICAgICBldmVudC5ldmVudChldmVudC5kYXRhLCBlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGV2ZW50KGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG9uQ2hlY2tib3hDaGFuZ2UoZSkge1xuICAgIHZhciB2Tm9kZSA9IHRoaXMudk5vZGU7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGRvbSA9IHZOb2RlLmRvbTtcbiAgICBpZiAoZXZlbnRzLm9uQ2xpY2spIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZXZlbnRzLm9uQ2xpY2s7XG4gICAgICAgIGlmIChldmVudC5ldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuZXZlbnQoZXZlbnQuZGF0YSwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBldmVudChlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChldmVudHMub25jbGljaykge1xuICAgICAgICBldmVudHMub25jbGljayhlKTtcbiAgICB9XG4gICAgLy8gdGhlIHVzZXIgbWF5IGhhdmUgdXBkYXRlZCB0aGUgdk5vZGUgZnJvbSB0aGUgYWJvdmUgb25DbGljayBldmVudHNcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIGdldCBpdCBmcm9tIHRoZSBjb250ZXh0IG9mIGB0aGlzYCBhZ2FpblxuICAgIGFwcGx5VmFsdWUodGhpcy52Tm9kZSwgZG9tKTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUFzc29jaWF0ZWRSYWRpb0lucHV0cyhuYW1lKSB7XG4gICAgdmFyIGlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoKFwiaW5wdXRbdHlwZT1cXFwicmFkaW9cXFwiXVtuYW1lPVxcXCJcIiArIG5hbWUgKyBcIlxcXCJdXCIpKTtcbiAgICBbXS5mb3JFYWNoLmNhbGwoaW5wdXRzLCBmdW5jdGlvbiAoZG9tKSB7XG4gICAgICAgIHZhciBpbnB1dFdyYXBwZXIgPSB3cmFwcGVycy5nZXQoZG9tKTtcbiAgICAgICAgaWYgKGlucHV0V3JhcHBlcikge1xuICAgICAgICAgICAgdmFyIHByb3BzID0gaW5wdXRXcmFwcGVyLnZOb2RlLnByb3BzO1xuICAgICAgICAgICAgaWYgKHByb3BzKSB7XG4gICAgICAgICAgICAgICAgZG9tLmNoZWNrZWQgPSBpbnB1dFdyYXBwZXIudk5vZGUucHJvcHMuY2hlY2tlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuZnVuY3Rpb24gcHJvY2Vzc0lucHV0KHZOb2RlLCBkb20pIHtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgYXBwbHlWYWx1ZSh2Tm9kZSwgZG9tKTtcbiAgICBpZiAoaXNDb250cm9sbGVkKHByb3BzKSkge1xuICAgICAgICB2YXIgaW5wdXRXcmFwcGVyID0gd3JhcHBlcnMuZ2V0KGRvbSk7XG4gICAgICAgIGlmICghaW5wdXRXcmFwcGVyKSB7XG4gICAgICAgICAgICBpbnB1dFdyYXBwZXIgPSB7XG4gICAgICAgICAgICAgICAgdk5vZGU6IHZOb2RlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChpc0NoZWNrZWRUeXBlKHByb3BzLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgZG9tLm9uY2xpY2sgPSBvbkNoZWNrYm94Q2hhbmdlLmJpbmQoaW5wdXRXcmFwcGVyKTtcbiAgICAgICAgICAgICAgICBkb20ub25jbGljay53cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbS5vbmlucHV0ID0gb25UZXh0SW5wdXRDaGFuZ2UuYmluZChpbnB1dFdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIGRvbS5vbmlucHV0LndyYXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgZG9tLm9uY2hhbmdlID0gd3JhcHBlZE9uQ2hhbmdlLmJpbmQoaW5wdXRXcmFwcGVyKTtcbiAgICAgICAgICAgICAgICBkb20ub25jaGFuZ2Uud3JhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3cmFwcGVycy5zZXQoZG9tLCBpbnB1dFdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlucHV0V3JhcHBlci52Tm9kZSA9IHZOb2RlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gYXBwbHlWYWx1ZSh2Tm9kZSwgZG9tKSB7XG4gICAgdmFyIHByb3BzID0gdk5vZGUucHJvcHMgfHwgRU1QVFlfT0JKO1xuICAgIHZhciB0eXBlID0gcHJvcHMudHlwZTtcbiAgICB2YXIgdmFsdWUgPSBwcm9wcy52YWx1ZTtcbiAgICB2YXIgY2hlY2tlZCA9IHByb3BzLmNoZWNrZWQ7XG4gICAgdmFyIG11bHRpcGxlID0gcHJvcHMubXVsdGlwbGU7XG4gICAgaWYgKHR5cGUgJiYgdHlwZSAhPT0gZG9tLnR5cGUpIHtcbiAgICAgICAgZG9tLnR5cGUgPSB0eXBlO1xuICAgIH1cbiAgICBpZiAobXVsdGlwbGUgJiYgbXVsdGlwbGUgIT09IGRvbS5tdWx0aXBsZSkge1xuICAgICAgICBkb20ubXVsdGlwbGUgPSBtdWx0aXBsZTtcbiAgICB9XG4gICAgaWYgKGlzQ2hlY2tlZFR5cGUodHlwZSkpIHtcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKHZhbHVlKSkge1xuICAgICAgICAgICAgZG9tLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZG9tLmNoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3JhZGlvJyAmJiBwcm9wcy5uYW1lKSB7XG4gICAgICAgICAgICBoYW5kbGVBc3NvY2lhdGVkUmFkaW9JbnB1dHMocHJvcHMubmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZih2YWx1ZSkgJiYgZG9tLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgZG9tLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWlzTnVsbE9yVW5kZWYoY2hlY2tlZCkpIHtcbiAgICAgICAgICAgIGRvbS5jaGVja2VkID0gY2hlY2tlZDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDb250cm9sbGVkJDEocHJvcHMpIHtcbiAgICByZXR1cm4gIWlzTnVsbE9yVW5kZWYocHJvcHMudmFsdWUpO1xufVxuZnVuY3Rpb24gdXBkYXRlQ2hpbGRPcHRpb25Hcm91cCh2Tm9kZSwgdmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IHZOb2RlLnR5cGU7XG4gICAgaWYgKHR5cGUgPT09ICdvcHRncm91cCcpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChpc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUNoaWxkT3B0aW9uKGNoaWxkcmVuW2ldLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNWTm9kZShjaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHVwZGF0ZUNoaWxkT3B0aW9uKGNoaWxkcmVuLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHVwZGF0ZUNoaWxkT3B0aW9uKHZOb2RlLCB2YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gdXBkYXRlQ2hpbGRPcHRpb24odk5vZGUsIHZhbHVlKSB7XG4gICAgdmFyIHByb3BzID0gdk5vZGUucHJvcHMgfHwgRU1QVFlfT0JKO1xuICAgIHZhciBkb20gPSB2Tm9kZS5kb207XG4gICAgLy8gd2UgZG8gdGhpcyBhcyBtdWx0aXBsZSBtYXkgaGF2ZSBjaGFuZ2VkXG4gICAgZG9tLnZhbHVlID0gcHJvcHMudmFsdWU7XG4gICAgaWYgKChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5pbmRleE9mKHByb3BzLnZhbHVlKSAhPT0gLTEpIHx8IHByb3BzLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICBkb20uc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZG9tLnNlbGVjdGVkID0gcHJvcHMuc2VsZWN0ZWQgfHwgZmFsc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gb25TZWxlY3RDaGFuZ2UoZSkge1xuICAgIHZhciB2Tm9kZSA9IHRoaXMudk5vZGU7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGRvbSA9IHZOb2RlLmRvbTtcbiAgICBpZiAoZXZlbnRzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHZhciBldmVudCA9IGV2ZW50cy5vbkNoYW5nZTtcbiAgICAgICAgaWYgKGV2ZW50LmV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5ldmVudChldmVudC5kYXRhLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50cy5vbmNoYW5nZSkge1xuICAgICAgICBldmVudHMub25jaGFuZ2UoZSk7XG4gICAgfVxuICAgIC8vIHRoZSB1c2VyIG1heSBoYXZlIHVwZGF0ZWQgdGhlIHZOb2RlIGZyb20gdGhlIGFib3ZlIG9uQ2hhbmdlIGV2ZW50c1xuICAgIC8vIHNvIHdlIG5lZWQgdG8gZ2V0IGl0IGZyb20gdGhlIGNvbnRleHQgb2YgYHRoaXNgIGFnYWluXG4gICAgYXBwbHlWYWx1ZSQxKHRoaXMudk5vZGUsIGRvbSk7XG59XG5mdW5jdGlvbiBwcm9jZXNzU2VsZWN0KHZOb2RlLCBkb20pIHtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgYXBwbHlWYWx1ZSQxKHZOb2RlLCBkb20pO1xuICAgIGlmIChpc0NvbnRyb2xsZWQkMShwcm9wcykpIHtcbiAgICAgICAgdmFyIHNlbGVjdFdyYXBwZXIgPSB3cmFwcGVycy5nZXQoZG9tKTtcbiAgICAgICAgaWYgKCFzZWxlY3RXcmFwcGVyKSB7XG4gICAgICAgICAgICBzZWxlY3RXcmFwcGVyID0ge1xuICAgICAgICAgICAgICAgIHZOb2RlOiB2Tm9kZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRvbS5vbmNoYW5nZSA9IG9uU2VsZWN0Q2hhbmdlLmJpbmQoc2VsZWN0V3JhcHBlcik7XG4gICAgICAgICAgICBkb20ub25jaGFuZ2Uud3JhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB3cmFwcGVycy5zZXQoZG9tLCBzZWxlY3RXcmFwcGVyKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RXcmFwcGVyLnZOb2RlID0gdk5vZGU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBhcHBseVZhbHVlJDEodk5vZGUsIGRvbSkge1xuICAgIHZhciBwcm9wcyA9IHZOb2RlLnByb3BzIHx8IEVNUFRZX09CSjtcbiAgICBpZiAocHJvcHMubXVsdGlwbGUgIT09IGRvbS5tdWx0aXBsZSkge1xuICAgICAgICBkb20ubXVsdGlwbGUgPSBwcm9wcy5tdWx0aXBsZTtcbiAgICB9XG4gICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG4gICAgaWYgKCFpc0ludmFsaWQoY2hpbGRyZW4pKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuICAgICAgICBpZiAoaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVDaGlsZE9wdGlvbkdyb3VwKGNoaWxkcmVuW2ldLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNWTm9kZShjaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHVwZGF0ZUNoaWxkT3B0aW9uR3JvdXAoY2hpbGRyZW4sIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDb250cm9sbGVkJDIocHJvcHMpIHtcbiAgICByZXR1cm4gIWlzTnVsbE9yVW5kZWYocHJvcHMudmFsdWUpO1xufVxuZnVuY3Rpb24gd3JhcHBlZE9uQ2hhbmdlJDEoZSkge1xuICAgIHZhciB2Tm9kZSA9IHRoaXMudk5vZGU7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGV2ZW50ID0gZXZlbnRzLm9uQ2hhbmdlO1xuICAgIGlmIChldmVudC5ldmVudCkge1xuICAgICAgICBldmVudC5ldmVudChldmVudC5kYXRhLCBlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGV2ZW50KGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG9uVGV4dGFyZWFJbnB1dENoYW5nZShlKSB7XG4gICAgdmFyIHZOb2RlID0gdGhpcy52Tm9kZTtcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgZG9tID0gdk5vZGUuZG9tO1xuICAgIGlmIChldmVudHMub25JbnB1dCkge1xuICAgICAgICB2YXIgZXZlbnQgPSBldmVudHMub25JbnB1dDtcbiAgICAgICAgaWYgKGV2ZW50LmV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5ldmVudChldmVudC5kYXRhLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50cy5vbmlucHV0KSB7XG4gICAgICAgIGV2ZW50cy5vbmlucHV0KGUpO1xuICAgIH1cbiAgICAvLyB0aGUgdXNlciBtYXkgaGF2ZSB1cGRhdGVkIHRoZSB2Tm9kZSBmcm9tIHRoZSBhYm92ZSBvbklucHV0IGV2ZW50c1xuICAgIC8vIHNvIHdlIG5lZWQgdG8gZ2V0IGl0IGZyb20gdGhlIGNvbnRleHQgb2YgYHRoaXNgIGFnYWluXG4gICAgYXBwbHlWYWx1ZSQyKHRoaXMudk5vZGUsIGRvbSk7XG59XG5mdW5jdGlvbiBwcm9jZXNzVGV4dGFyZWEodk5vZGUsIGRvbSkge1xuICAgIHZhciBwcm9wcyA9IHZOb2RlLnByb3BzIHx8IEVNUFRZX09CSjtcbiAgICBhcHBseVZhbHVlJDIodk5vZGUsIGRvbSk7XG4gICAgdmFyIHRleHRhcmVhV3JhcHBlciA9IHdyYXBwZXJzLmdldChkb20pO1xuICAgIGlmIChpc0NvbnRyb2xsZWQkMihwcm9wcykpIHtcbiAgICAgICAgaWYgKCF0ZXh0YXJlYVdyYXBwZXIpIHtcbiAgICAgICAgICAgIHRleHRhcmVhV3JhcHBlciA9IHtcbiAgICAgICAgICAgICAgICB2Tm9kZTogdk5vZGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBkb20ub25pbnB1dCA9IG9uVGV4dGFyZWFJbnB1dENoYW5nZS5iaW5kKHRleHRhcmVhV3JhcHBlcik7XG4gICAgICAgICAgICBkb20ub25pbnB1dC53cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgICAgIGRvbS5vbmNoYW5nZSA9IHdyYXBwZWRPbkNoYW5nZSQxLmJpbmQodGV4dGFyZWFXcmFwcGVyKTtcbiAgICAgICAgICAgICAgICBkb20ub25jaGFuZ2Uud3JhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3cmFwcGVycy5zZXQoZG9tLCB0ZXh0YXJlYVdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRleHRhcmVhV3JhcHBlci52Tm9kZSA9IHZOb2RlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gYXBwbHlWYWx1ZSQyKHZOb2RlLCBkb20pIHtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG4gICAgdmFyIGRvbVZhbHVlID0gZG9tLnZhbHVlO1xuICAgIGlmIChkb21WYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKHZhbHVlKSkge1xuICAgICAgICAgICAgZG9tLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZG9tVmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICBkb20udmFsdWUgPSAnJztcbiAgICAgICAgfVxuICAgIH1cbn1cblxudmFyIHdyYXBwZXJzID0gbmV3IE1hcCgpO1xuZnVuY3Rpb24gcHJvY2Vzc0VsZW1lbnQoZmxhZ3MsIHZOb2RlLCBkb20pIHtcbiAgICBpZiAoZmxhZ3MgJiA1MTIgLyogSW5wdXRFbGVtZW50ICovKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzSW5wdXQodk5vZGUsIGRvbSk7XG4gICAgfVxuICAgIGlmIChmbGFncyAmIDIwNDggLyogU2VsZWN0RWxlbWVudCAqLykge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc1NlbGVjdCh2Tm9kZSwgZG9tKTtcbiAgICB9XG4gICAgaWYgKGZsYWdzICYgMTAyNCAvKiBUZXh0YXJlYUVsZW1lbnQgKi8pIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NUZXh0YXJlYSh2Tm9kZSwgZG9tKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwYXRjaChsYXN0Vk5vZGUsIG5leHRWTm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZykge1xuICAgIGlmIChsYXN0Vk5vZGUgIT09IG5leHRWTm9kZSkge1xuICAgICAgICB2YXIgbGFzdEZsYWdzID0gbGFzdFZOb2RlLmZsYWdzO1xuICAgICAgICB2YXIgbmV4dEZsYWdzID0gbmV4dFZOb2RlLmZsYWdzO1xuICAgICAgICBpZiAobmV4dEZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICBpZiAobGFzdEZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hDb21wb25lbnQobGFzdFZOb2RlLCBuZXh0Vk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgbmV4dEZsYWdzICYgNCAvKiBDb21wb25lbnRDbGFzcyAqLywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwbGFjZVZOb2RlKHBhcmVudERvbSwgbW91bnRDb21wb25lbnQobmV4dFZOb2RlLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBuZXh0RmxhZ3MgJiA0IC8qIENvbXBvbmVudENsYXNzICovKSwgbGFzdFZOb2RlLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChuZXh0RmxhZ3MgJiAzOTcwIC8qIEVsZW1lbnQgKi8pIHtcbiAgICAgICAgICAgIGlmIChsYXN0RmxhZ3MgJiAzOTcwIC8qIEVsZW1lbnQgKi8pIHtcbiAgICAgICAgICAgICAgICBwYXRjaEVsZW1lbnQobGFzdFZOb2RlLCBuZXh0Vk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwbGFjZVZOb2RlKHBhcmVudERvbSwgbW91bnRFbGVtZW50KG5leHRWTm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyksIGxhc3RWTm9kZSwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV4dEZsYWdzICYgMSAvKiBUZXh0ICovKSB7XG4gICAgICAgICAgICBpZiAobGFzdEZsYWdzICYgMSAvKiBUZXh0ICovKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hUZXh0KGxhc3RWTm9kZSwgbmV4dFZOb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcGxhY2VWTm9kZShwYXJlbnREb20sIG1vdW50VGV4dChuZXh0Vk5vZGUsIG51bGwpLCBsYXN0Vk5vZGUsIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5leHRGbGFncyAmIDQwOTYgLyogVm9pZCAqLykge1xuICAgICAgICAgICAgaWYgKGxhc3RGbGFncyAmIDQwOTYgLyogVm9pZCAqLykge1xuICAgICAgICAgICAgICAgIHBhdGNoVm9pZChsYXN0Vk5vZGUsIG5leHRWTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlVk5vZGUocGFyZW50RG9tLCBtb3VudFZvaWQobmV4dFZOb2RlLCBudWxsKSwgbGFzdFZOb2RlLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEVycm9yIGNhc2U6IG1vdW50IG5ldyBvbmUgcmVwbGFjaW5nIG9sZCBvbmVcbiAgICAgICAgICAgIHJlcGxhY2VMYXN0Q2hpbGRBbmRVbm1vdW50KGxhc3RWTm9kZSwgbmV4dFZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHVubW91bnRDaGlsZHJlbihjaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKSB7XG4gICAgaWYgKGlzVk5vZGUoY2hpbGRyZW4pKSB7XG4gICAgICAgIHVubW91bnQoY2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCB0cnVlLCBpc1JlY3ljbGluZyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIHJlbW92ZUFsbENoaWxkcmVuKGRvbSwgY2hpbGRyZW4sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZG9tLnRleHRDb250ZW50ID0gJyc7XG4gICAgfVxufVxuZnVuY3Rpb24gcGF0Y2hFbGVtZW50KGxhc3RWTm9kZSwgbmV4dFZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKSB7XG4gICAgdmFyIG5leHRUYWcgPSBuZXh0Vk5vZGUudHlwZTtcbiAgICB2YXIgbGFzdFRhZyA9IGxhc3RWTm9kZS50eXBlO1xuICAgIGlmIChsYXN0VGFnICE9PSBuZXh0VGFnKSB7XG4gICAgICAgIHJlcGxhY2VXaXRoTmV3Tm9kZShsYXN0Vk5vZGUsIG5leHRWTm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgZG9tID0gbGFzdFZOb2RlLmRvbTtcbiAgICAgICAgdmFyIGxhc3RQcm9wcyA9IGxhc3RWTm9kZS5wcm9wcztcbiAgICAgICAgdmFyIG5leHRQcm9wcyA9IG5leHRWTm9kZS5wcm9wcztcbiAgICAgICAgdmFyIGxhc3RDaGlsZHJlbiA9IGxhc3RWTm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIG5leHRDaGlsZHJlbiA9IG5leHRWTm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGxhc3RGbGFncyA9IGxhc3RWTm9kZS5mbGFncztcbiAgICAgICAgdmFyIG5leHRGbGFncyA9IG5leHRWTm9kZS5mbGFncztcbiAgICAgICAgdmFyIGxhc3RSZWYgPSBsYXN0Vk5vZGUucmVmO1xuICAgICAgICB2YXIgbmV4dFJlZiA9IG5leHRWTm9kZS5yZWY7XG4gICAgICAgIHZhciBsYXN0RXZlbnRzID0gbGFzdFZOb2RlLmV2ZW50cztcbiAgICAgICAgdmFyIG5leHRFdmVudHMgPSBuZXh0Vk5vZGUuZXZlbnRzO1xuICAgICAgICBuZXh0Vk5vZGUuZG9tID0gZG9tO1xuICAgICAgICBpZiAoaXNTVkcgfHwgKG5leHRGbGFncyAmIDEyOCAvKiBTdmdFbGVtZW50ICovKSkge1xuICAgICAgICAgICAgaXNTVkcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsYXN0Q2hpbGRyZW4gIT09IG5leHRDaGlsZHJlbikge1xuICAgICAgICAgICAgcGF0Y2hDaGlsZHJlbihsYXN0RmxhZ3MsIG5leHRGbGFncywgbGFzdENoaWxkcmVuLCBuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBoYXNDb250cm9sbGVkVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgaWYgKCEobmV4dEZsYWdzICYgMiAvKiBIdG1sRWxlbWVudCAqLykpIHtcbiAgICAgICAgICAgIGhhc0NvbnRyb2xsZWRWYWx1ZSA9IHByb2Nlc3NFbGVtZW50KG5leHRGbGFncywgbmV4dFZOb2RlLCBkb20pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlubGluZWQgcGF0Y2hQcm9wcyAgLS0gc3RhcnRzIC0tXG4gICAgICAgIGlmIChsYXN0UHJvcHMgIT09IG5leHRQcm9wcykge1xuICAgICAgICAgICAgdmFyIGxhc3RQcm9wc09yRW1wdHkgPSBsYXN0UHJvcHMgfHwgRU1QVFlfT0JKO1xuICAgICAgICAgICAgdmFyIG5leHRQcm9wc09yRW1wdHkgPSBuZXh0UHJvcHMgfHwgRU1QVFlfT0JKO1xuICAgICAgICAgICAgaWYgKG5leHRQcm9wc09yRW1wdHkgIT09IEVNUFRZX09CSikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gbmV4dFByb3BzT3JFbXB0eSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBkbyBub3QgYWRkIGEgaGFzT3duUHJvcGVydHkgY2hlY2sgaGVyZSwgaXQgYWZmZWN0cyBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dFZhbHVlID0gbmV4dFByb3BzT3JFbXB0eVtwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RWYWx1ZSA9IGxhc3RQcm9wc09yRW1wdHlbcHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc051bGxPclVuZGVmKG5leHRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZVByb3AocHJvcCwgbmV4dFZhbHVlLCBkb20pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hQcm9wKHByb3AsIGxhc3RWYWx1ZSwgbmV4dFZhbHVlLCBkb20sIGlzU1ZHLCBoYXNDb250cm9sbGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxhc3RQcm9wc09yRW1wdHkgIT09IEVNUFRZX09CSikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AkMSBpbiBsYXN0UHJvcHNPckVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRvIG5vdCBhZGQgYSBoYXNPd25Qcm9wZXJ0eSBjaGVjayBoZXJlLCBpdCBhZmZlY3RzIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc051bGxPclVuZGVmKG5leHRQcm9wc09yRW1wdHlbcHJvcCQxXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZVByb3AocHJvcCQxLCBsYXN0UHJvcHNPckVtcHR5W3Byb3AkMV0sIGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW5saW5lZCBwYXRjaFByb3BzICAtLSBlbmRzIC0tXG4gICAgICAgIGlmIChsYXN0RXZlbnRzICE9PSBuZXh0RXZlbnRzKSB7XG4gICAgICAgICAgICBwYXRjaEV2ZW50cyhsYXN0RXZlbnRzLCBuZXh0RXZlbnRzLCBkb20pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXh0UmVmKSB7XG4gICAgICAgICAgICBpZiAobGFzdFJlZiAhPT0gbmV4dFJlZiB8fCBpc1JlY3ljbGluZykge1xuICAgICAgICAgICAgICAgIG1vdW50UmVmKGRvbSwgbmV4dFJlZiwgbGlmZWN5Y2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4obGFzdEZsYWdzLCBuZXh0RmxhZ3MsIGxhc3RDaGlsZHJlbiwgbmV4dENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKSB7XG4gICAgdmFyIHBhdGNoQXJyYXkgPSBmYWxzZTtcbiAgICB2YXIgcGF0Y2hLZXllZCA9IGZhbHNlO1xuICAgIGlmIChuZXh0RmxhZ3MgJiA2NCAvKiBIYXNOb25LZXllZENoaWxkcmVuICovKSB7XG4gICAgICAgIHBhdGNoQXJyYXkgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmICgobGFzdEZsYWdzICYgMzIgLyogSGFzS2V5ZWRDaGlsZHJlbiAqLykgJiYgKG5leHRGbGFncyAmIDMyIC8qIEhhc0tleWVkQ2hpbGRyZW4gKi8pKSB7XG4gICAgICAgIHBhdGNoS2V5ZWQgPSB0cnVlO1xuICAgICAgICBwYXRjaEFycmF5ID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNJbnZhbGlkKG5leHRDaGlsZHJlbikpIHtcbiAgICAgICAgdW5tb3VudENoaWxkcmVuKGxhc3RDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNJbnZhbGlkKGxhc3RDaGlsZHJlbikpIHtcbiAgICAgICAgaWYgKGlzU3RyaW5nT3JOdW1iZXIobmV4dENoaWxkcmVuKSkge1xuICAgICAgICAgICAgc2V0VGV4dENvbnRlbnQoZG9tLCBuZXh0Q2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzQXJyYXkobmV4dENoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIG1vdW50QXJyYXlDaGlsZHJlbihuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb3VudChuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihuZXh0Q2hpbGRyZW4pKSB7XG4gICAgICAgIGlmIChpc1N0cmluZ09yTnVtYmVyKGxhc3RDaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHVwZGF0ZVRleHRDb250ZW50KGRvbSwgbmV4dENoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHVubW91bnRDaGlsZHJlbihsYXN0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICBzZXRUZXh0Q29udGVudChkb20sIG5leHRDaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNBcnJheShuZXh0Q2hpbGRyZW4pKSB7XG4gICAgICAgIGlmIChpc0FycmF5KGxhc3RDaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHBhdGNoQXJyYXkgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGlzS2V5ZWQobGFzdENoaWxkcmVuLCBuZXh0Q2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hLZXllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB1bm1vdW50Q2hpbGRyZW4obGFzdENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgbW91bnRBcnJheUNoaWxkcmVuKG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc0FycmF5KGxhc3RDaGlsZHJlbikpIHtcbiAgICAgICAgcmVtb3ZlQWxsQ2hpbGRyZW4oZG9tLCBsYXN0Q2hpbGRyZW4sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICBtb3VudChuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzVk5vZGUobmV4dENoaWxkcmVuKSkge1xuICAgICAgICBpZiAoaXNWTm9kZShsYXN0Q2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBwYXRjaChsYXN0Q2hpbGRyZW4sIG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB1bm1vdW50Q2hpbGRyZW4obGFzdENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgbW91bnQobmV4dENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwYXRjaEFycmF5KSB7XG4gICAgICAgIGlmIChwYXRjaEtleWVkKSB7XG4gICAgICAgICAgICBwYXRjaEtleWVkQ2hpbGRyZW4obGFzdENoaWxkcmVuLCBuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcGF0Y2hOb25LZXllZENoaWxkcmVuKGxhc3RDaGlsZHJlbiwgbmV4dENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoQ29tcG9uZW50KGxhc3RWTm9kZSwgbmV4dFZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzQ2xhc3MsIGlzUmVjeWNsaW5nKSB7XG4gICAgdmFyIGxhc3RUeXBlID0gbGFzdFZOb2RlLnR5cGU7XG4gICAgdmFyIG5leHRUeXBlID0gbmV4dFZOb2RlLnR5cGU7XG4gICAgdmFyIG5leHRQcm9wcyA9IG5leHRWTm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGxhc3RLZXkgPSBsYXN0Vk5vZGUua2V5O1xuICAgIHZhciBuZXh0S2V5ID0gbmV4dFZOb2RlLmtleTtcbiAgICB2YXIgZGVmYXVsdFByb3BzID0gbmV4dFR5cGUuZGVmYXVsdFByb3BzO1xuICAgIGlmICghaXNVbmRlZmluZWQoZGVmYXVsdFByb3BzKSkge1xuICAgICAgICBjb3B5UHJvcHNUbyhkZWZhdWx0UHJvcHMsIG5leHRQcm9wcyk7XG4gICAgICAgIG5leHRWTm9kZS5wcm9wcyA9IG5leHRQcm9wcztcbiAgICB9XG4gICAgaWYgKGxhc3RUeXBlICE9PSBuZXh0VHlwZSkge1xuICAgICAgICBpZiAoaXNDbGFzcykge1xuICAgICAgICAgICAgcmVwbGFjZVdpdGhOZXdOb2RlKGxhc3RWTm9kZSwgbmV4dFZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBsYXN0SW5wdXQgPSBsYXN0Vk5vZGUuY2hpbGRyZW4uX2xhc3RJbnB1dCB8fCBsYXN0Vk5vZGUuY2hpbGRyZW47XG4gICAgICAgICAgICB2YXIgbmV4dElucHV0ID0gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudElucHV0KG5leHRWTm9kZSwgbmV4dFR5cGUsIG5leHRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICB1bm1vdW50KGxhc3RWTm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgcGF0Y2gobGFzdElucHV0LCBuZXh0SW5wdXQsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgdmFyIGRvbSA9IG5leHRWTm9kZS5kb20gPSBuZXh0SW5wdXQuZG9tO1xuICAgICAgICAgICAgbmV4dFZOb2RlLmNoaWxkcmVuID0gbmV4dElucHV0O1xuICAgICAgICAgICAgbW91bnRGdW5jdGlvbmFsQ29tcG9uZW50Q2FsbGJhY2tzKG5leHRWTm9kZS5yZWYsIGRvbSwgbGlmZWN5Y2xlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGlzQ2xhc3MpIHtcbiAgICAgICAgICAgIGlmIChsYXN0S2V5ICE9PSBuZXh0S2V5KSB7XG4gICAgICAgICAgICAgICAgcmVwbGFjZVdpdGhOZXdOb2RlKGxhc3RWTm9kZSwgbmV4dFZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBsYXN0Vk5vZGUuY2hpbGRyZW47XG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuX3VubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIGlmIChpc051bGwocGFyZW50RG9tKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVwbGFjZUNoaWxkKHBhcmVudERvbSwgbW91bnRDb21wb25lbnQobmV4dFZOb2RlLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBuZXh0Vk5vZGUuZmxhZ3MgJiA0IC8qIENvbXBvbmVudENsYXNzICovKSwgbGFzdFZOb2RlLmRvbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFN0YXRlID0gaW5zdGFuY2Uuc3RhdGU7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRTdGF0ZSA9IGluc3RhbmNlLnN0YXRlO1xuICAgICAgICAgICAgICAgIHZhciBsYXN0UHJvcHMgPSBpbnN0YW5jZS5wcm9wcztcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRDb250ZXh0ID0gaW5zdGFuY2UuZ2V0Q2hpbGRDb250ZXh0KCk7XG4gICAgICAgICAgICAgICAgbmV4dFZOb2RlLmNoaWxkcmVuID0gaW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2lzU1ZHID0gaXNTVkc7XG4gICAgICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKGNoaWxkQ29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRDb250ZXh0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29udGV4dCwgY2hpbGRDb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBsYXN0SW5wdXQkMSA9IGluc3RhbmNlLl9sYXN0SW5wdXQ7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRJbnB1dCQxID0gaW5zdGFuY2UuX3VwZGF0ZUNvbXBvbmVudChsYXN0U3RhdGUsIG5leHRTdGF0ZSwgbGFzdFByb3BzLCBuZXh0UHJvcHMsIGNvbnRleHQsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdmFyIGRpZFVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2NoaWxkQ29udGV4dCA9IGNoaWxkQ29udGV4dDtcbiAgICAgICAgICAgICAgICBpZiAoaXNJbnZhbGlkKG5leHRJbnB1dCQxKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMSA9IGNyZWF0ZVZvaWRWTm9kZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChuZXh0SW5wdXQkMSA9PT0gTk9fT1ApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dElucHV0JDEgPSBsYXN0SW5wdXQkMTtcbiAgICAgICAgICAgICAgICAgICAgZGlkVXBkYXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzU3RyaW5nT3JOdW1iZXIobmV4dElucHV0JDEpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRJbnB1dCQxID0gY3JlYXRlVGV4dFZOb2RlKG5leHRJbnB1dCQxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNBcnJheShuZXh0SW5wdXQkMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoJ2EgdmFsaWQgSW5mZXJubyBWTm9kZSAob3IgbnVsbCkgbXVzdCBiZSByZXR1cm5lZCBmcm9tIGEgY29tcG9uZW50IHJlbmRlci4gWW91IG1heSBoYXZlIHJldHVybmVkIGFuIGFycmF5IG9yIGFuIGludmFsaWQgb2JqZWN0LicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNPYmplY3QobmV4dElucHV0JDEpICYmIG5leHRJbnB1dCQxLmRvbSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMSA9IGNsb25lVk5vZGUobmV4dElucHV0JDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV4dElucHV0JDEuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dElucHV0JDEucGFyZW50Vk5vZGUgPSBuZXh0Vk5vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxhc3RJbnB1dCQxLmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RJbnB1dCQxLnBhcmVudFZOb2RlID0gbmV4dFZOb2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fbGFzdElucHV0ID0gbmV4dElucHV0JDE7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX3ZOb2RlID0gbmV4dFZOb2RlO1xuICAgICAgICAgICAgICAgIGlmIChkaWRVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhc3RVbm1vdW50ID0gbGlmZWN5Y2xlLmZhc3RVbm1vdW50O1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3ViTGlmZWN5Y2xlID0gaW5zdGFuY2UuX2xpZmVjeWNsZTtcbiAgICAgICAgICAgICAgICAgICAgbGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gc3ViTGlmZWN5Y2xlLmZhc3RVbm1vdW50O1xuICAgICAgICAgICAgICAgICAgICBwYXRjaChsYXN0SW5wdXQkMSwgbmV4dElucHV0JDEsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjaGlsZENvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICAgICAgICAgIHN1YkxpZmVjeWNsZS5mYXN0VW5tb3VudCA9IGxpZmVjeWNsZS5mYXN0VW5tb3VudDtcbiAgICAgICAgICAgICAgICAgICAgbGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gZmFzdFVubW91bnQ7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmNvbXBvbmVudERpZFVwZGF0ZShsYXN0UHJvcHMsIGxhc3RTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuYWZ0ZXJVcGRhdGUgJiYgb3B0aW9ucy5hZnRlclVwZGF0ZShuZXh0Vk5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZpbmRET01Ob2RlRW5hYmxlZCAmJiBjb21wb25lbnRUb0RPTU5vZGVNYXAuc2V0KGluc3RhbmNlLCBuZXh0SW5wdXQkMS5kb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXh0Vk5vZGUuZG9tID0gbmV4dElucHV0JDEuZG9tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbGFzdFByb3BzJDEgPSBsYXN0Vk5vZGUucHJvcHM7XG4gICAgICAgICAgICB2YXIgbmV4dEhvb2tzID0gbmV4dFZOb2RlLnJlZjtcbiAgICAgICAgICAgIHZhciBuZXh0SG9va3NEZWZpbmVkID0gIWlzTnVsbE9yVW5kZWYobmV4dEhvb2tzKTtcbiAgICAgICAgICAgIHZhciBsYXN0SW5wdXQkMiA9IGxhc3RWTm9kZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIHZhciBuZXh0SW5wdXQkMiA9IGxhc3RJbnB1dCQyO1xuICAgICAgICAgICAgbmV4dFZOb2RlLmRvbSA9IGxhc3RWTm9kZS5kb207XG4gICAgICAgICAgICBuZXh0Vk5vZGUuY2hpbGRyZW4gPSBsYXN0SW5wdXQkMjtcbiAgICAgICAgICAgIGlmIChsYXN0S2V5ICE9PSBuZXh0S2V5KSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuZXh0SG9va3NEZWZpbmVkICYmICFpc051bGxPclVuZGVmKG5leHRIb29rcy5vbkNvbXBvbmVudFNob3VsZFVwZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkVXBkYXRlID0gbmV4dEhvb2tzLm9uQ29tcG9uZW50U2hvdWxkVXBkYXRlKGxhc3RQcm9wcyQxLCBuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaG91bGRVcGRhdGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRIb29rc0RlZmluZWQgJiYgIWlzTnVsbE9yVW5kZWYobmV4dEhvb2tzLm9uQ29tcG9uZW50V2lsbFVwZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEhvb2tzLm9uQ29tcG9uZW50V2lsbFVwZGF0ZShsYXN0UHJvcHMkMSwgbmV4dFByb3BzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV4dElucHV0JDIgPSBuZXh0VHlwZShuZXh0UHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChpc0ludmFsaWQobmV4dElucHV0JDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRJbnB1dCQyID0gY3JlYXRlVm9pZFZOb2RlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzU3RyaW5nT3JOdW1iZXIobmV4dElucHV0JDIpICYmIG5leHRJbnB1dCQyICE9PSBOT19PUCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMiA9IGNyZWF0ZVRleHRWTm9kZShuZXh0SW5wdXQkMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzQXJyYXkobmV4dElucHV0JDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKCdhIHZhbGlkIEluZmVybm8gVk5vZGUgKG9yIG51bGwpIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBhIGNvbXBvbmVudCByZW5kZXIuIFlvdSBtYXkgaGF2ZSByZXR1cm5lZCBhbiBhcnJheSBvciBhbiBpbnZhbGlkIG9iamVjdC4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzT2JqZWN0KG5leHRJbnB1dCQyKSAmJiBuZXh0SW5wdXQkMi5kb20pIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dElucHV0JDIgPSBjbG9uZVZOb2RlKG5leHRJbnB1dCQyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5leHRJbnB1dCQyICE9PSBOT19PUCkge1xuICAgICAgICAgICAgICAgICAgICBwYXRjaChsYXN0SW5wdXQkMiwgbmV4dElucHV0JDIsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgICAgICAgICBuZXh0Vk5vZGUuY2hpbGRyZW4gPSBuZXh0SW5wdXQkMjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRIb29rc0RlZmluZWQgJiYgIWlzTnVsbE9yVW5kZWYobmV4dEhvb2tzLm9uQ29tcG9uZW50RGlkVXBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEhvb2tzLm9uQ29tcG9uZW50RGlkVXBkYXRlKGxhc3RQcm9wcyQxLCBuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5leHRWTm9kZS5kb20gPSBuZXh0SW5wdXQkMi5kb207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5leHRJbnB1dCQyLmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICAgICAgbmV4dElucHV0JDIucGFyZW50Vk5vZGUgPSBuZXh0Vk5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChsYXN0SW5wdXQkMi5mbGFncyAmIDI4IC8qIENvbXBvbmVudCAqLykge1xuICAgICAgICAgICAgICAgIGxhc3RJbnB1dCQyLnBhcmVudFZOb2RlID0gbmV4dFZOb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIHBhdGNoVGV4dChsYXN0Vk5vZGUsIG5leHRWTm9kZSkge1xuICAgIHZhciBuZXh0VGV4dCA9IG5leHRWTm9kZS5jaGlsZHJlbjtcbiAgICB2YXIgZG9tID0gbGFzdFZOb2RlLmRvbTtcbiAgICBuZXh0Vk5vZGUuZG9tID0gZG9tO1xuICAgIGlmIChsYXN0Vk5vZGUuY2hpbGRyZW4gIT09IG5leHRUZXh0KSB7XG4gICAgICAgIGRvbS5ub2RlVmFsdWUgPSBuZXh0VGV4dDtcbiAgICB9XG59XG5mdW5jdGlvbiBwYXRjaFZvaWQobGFzdFZOb2RlLCBuZXh0Vk5vZGUpIHtcbiAgICBuZXh0Vk5vZGUuZG9tID0gbGFzdFZOb2RlLmRvbTtcbn1cbmZ1bmN0aW9uIHBhdGNoTm9uS2V5ZWRDaGlsZHJlbihsYXN0Q2hpbGRyZW4sIG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZykge1xuICAgIHZhciBsYXN0Q2hpbGRyZW5MZW5ndGggPSBsYXN0Q2hpbGRyZW4ubGVuZ3RoO1xuICAgIHZhciBuZXh0Q2hpbGRyZW5MZW5ndGggPSBuZXh0Q2hpbGRyZW4ubGVuZ3RoO1xuICAgIHZhciBjb21tb25MZW5ndGggPSBsYXN0Q2hpbGRyZW5MZW5ndGggPiBuZXh0Q2hpbGRyZW5MZW5ndGggPyBuZXh0Q2hpbGRyZW5MZW5ndGggOiBsYXN0Q2hpbGRyZW5MZW5ndGg7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAoOyBpIDwgY29tbW9uTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG5leHRDaGlsZCA9IG5leHRDaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKG5leHRDaGlsZC5kb20pIHtcbiAgICAgICAgICAgIG5leHRDaGlsZCA9IG5leHRDaGlsZHJlbltpXSA9IGNsb25lVk5vZGUobmV4dENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICBwYXRjaChsYXN0Q2hpbGRyZW5baV0sIG5leHRDaGlsZCwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgfVxuICAgIGlmIChsYXN0Q2hpbGRyZW5MZW5ndGggPCBuZXh0Q2hpbGRyZW5MZW5ndGgpIHtcbiAgICAgICAgZm9yIChpID0gY29tbW9uTGVuZ3RoOyBpIDwgbmV4dENoaWxkcmVuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0Q2hpbGQkMSA9IG5leHRDaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChuZXh0Q2hpbGQkMS5kb20pIHtcbiAgICAgICAgICAgICAgICBuZXh0Q2hpbGQkMSA9IG5leHRDaGlsZHJlbltpXSA9IGNsb25lVk5vZGUobmV4dENoaWxkJDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBwZW5kQ2hpbGQoZG9tLCBtb3VudChuZXh0Q2hpbGQkMSwgbnVsbCwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG5leHRDaGlsZHJlbkxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZW1vdmVBbGxDaGlsZHJlbihkb20sIGxhc3RDaGlsZHJlbiwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGxhc3RDaGlsZHJlbkxlbmd0aCA+IG5leHRDaGlsZHJlbkxlbmd0aCkge1xuICAgICAgICBmb3IgKGkgPSBjb21tb25MZW5ndGg7IGkgPCBsYXN0Q2hpbGRyZW5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdW5tb3VudChsYXN0Q2hpbGRyZW5baV0sIGRvbSwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gcGF0Y2hLZXllZENoaWxkcmVuKGEsIGIsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpIHtcbiAgICB2YXIgYUxlbmd0aCA9IGEubGVuZ3RoO1xuICAgIHZhciBiTGVuZ3RoID0gYi5sZW5ndGg7XG4gICAgdmFyIGFFbmQgPSBhTGVuZ3RoIC0gMTtcbiAgICB2YXIgYkVuZCA9IGJMZW5ndGggLSAxO1xuICAgIHZhciBhU3RhcnQgPSAwO1xuICAgIHZhciBiU3RhcnQgPSAwO1xuICAgIHZhciBpO1xuICAgIHZhciBqO1xuICAgIHZhciBhTm9kZTtcbiAgICB2YXIgYk5vZGU7XG4gICAgdmFyIG5leHROb2RlO1xuICAgIHZhciBuZXh0UG9zO1xuICAgIHZhciBub2RlO1xuICAgIGlmIChhTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmIChiTGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBtb3VudEFycmF5Q2hpbGRyZW4oYiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKGJMZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVtb3ZlQWxsQ2hpbGRyZW4oZG9tLCBhLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYVN0YXJ0Tm9kZSA9IGFbYVN0YXJ0XTtcbiAgICB2YXIgYlN0YXJ0Tm9kZSA9IGJbYlN0YXJ0XTtcbiAgICB2YXIgYUVuZE5vZGUgPSBhW2FFbmRdO1xuICAgIHZhciBiRW5kTm9kZSA9IGJbYkVuZF07XG4gICAgaWYgKGJTdGFydE5vZGUuZG9tKSB7XG4gICAgICAgIGJbYlN0YXJ0XSA9IGJTdGFydE5vZGUgPSBjbG9uZVZOb2RlKGJTdGFydE5vZGUpO1xuICAgIH1cbiAgICBpZiAoYkVuZE5vZGUuZG9tKSB7XG4gICAgICAgIGJbYkVuZF0gPSBiRW5kTm9kZSA9IGNsb25lVk5vZGUoYkVuZE5vZGUpO1xuICAgIH1cbiAgICAvLyBTdGVwIDFcbiAgICAvKiBlc2xpbnQgbm8tY29uc3RhbnQtY29uZGl0aW9uOiAwICovXG4gICAgb3V0ZXI6IHdoaWxlICh0cnVlKSB7XG4gICAgICAgIC8vIFN5bmMgbm9kZXMgd2l0aCB0aGUgc2FtZSBrZXkgYXQgdGhlIGJlZ2lubmluZy5cbiAgICAgICAgd2hpbGUgKGFTdGFydE5vZGUua2V5ID09PSBiU3RhcnROb2RlLmtleSkge1xuICAgICAgICAgICAgcGF0Y2goYVN0YXJ0Tm9kZSwgYlN0YXJ0Tm9kZSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICBhU3RhcnQrKztcbiAgICAgICAgICAgIGJTdGFydCsrO1xuICAgICAgICAgICAgaWYgKGFTdGFydCA+IGFFbmQgfHwgYlN0YXJ0ID4gYkVuZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrIG91dGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYVN0YXJ0Tm9kZSA9IGFbYVN0YXJ0XTtcbiAgICAgICAgICAgIGJTdGFydE5vZGUgPSBiW2JTdGFydF07XG4gICAgICAgICAgICBpZiAoYlN0YXJ0Tm9kZS5kb20pIHtcbiAgICAgICAgICAgICAgICBiW2JTdGFydF0gPSBiU3RhcnROb2RlID0gY2xvbmVWTm9kZShiU3RhcnROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTeW5jIG5vZGVzIHdpdGggdGhlIHNhbWUga2V5IGF0IHRoZSBlbmQuXG4gICAgICAgIHdoaWxlIChhRW5kTm9kZS5rZXkgPT09IGJFbmROb2RlLmtleSkge1xuICAgICAgICAgICAgcGF0Y2goYUVuZE5vZGUsIGJFbmROb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIGFFbmQtLTtcbiAgICAgICAgICAgIGJFbmQtLTtcbiAgICAgICAgICAgIGlmIChhU3RhcnQgPiBhRW5kIHx8IGJTdGFydCA+IGJFbmQpIHtcbiAgICAgICAgICAgICAgICBicmVhayBvdXRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFFbmROb2RlID0gYVthRW5kXTtcbiAgICAgICAgICAgIGJFbmROb2RlID0gYltiRW5kXTtcbiAgICAgICAgICAgIGlmIChiRW5kTm9kZS5kb20pIHtcbiAgICAgICAgICAgICAgICBiW2JFbmRdID0gYkVuZE5vZGUgPSBjbG9uZVZOb2RlKGJFbmROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBNb3ZlIGFuZCBzeW5jIG5vZGVzIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAgICAgICAgaWYgKGFFbmROb2RlLmtleSA9PT0gYlN0YXJ0Tm9kZS5rZXkpIHtcbiAgICAgICAgICAgIHBhdGNoKGFFbmROb2RlLCBiU3RhcnROb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIGluc2VydE9yQXBwZW5kKGRvbSwgYlN0YXJ0Tm9kZS5kb20sIGFTdGFydE5vZGUuZG9tKTtcbiAgICAgICAgICAgIGFFbmQtLTtcbiAgICAgICAgICAgIGJTdGFydCsrO1xuICAgICAgICAgICAgYUVuZE5vZGUgPSBhW2FFbmRdO1xuICAgICAgICAgICAgYlN0YXJ0Tm9kZSA9IGJbYlN0YXJ0XTtcbiAgICAgICAgICAgIGlmIChiU3RhcnROb2RlLmRvbSkge1xuICAgICAgICAgICAgICAgIGJbYlN0YXJ0XSA9IGJTdGFydE5vZGUgPSBjbG9uZVZOb2RlKGJTdGFydE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTW92ZSBhbmQgc3luYyBub2RlcyBmcm9tIGxlZnQgdG8gcmlnaHQuXG4gICAgICAgIGlmIChhU3RhcnROb2RlLmtleSA9PT0gYkVuZE5vZGUua2V5KSB7XG4gICAgICAgICAgICBwYXRjaChhU3RhcnROb2RlLCBiRW5kTm9kZSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICBuZXh0UG9zID0gYkVuZCArIDE7XG4gICAgICAgICAgICBuZXh0Tm9kZSA9IG5leHRQb3MgPCBiLmxlbmd0aCA/IGJbbmV4dFBvc10uZG9tIDogbnVsbDtcbiAgICAgICAgICAgIGluc2VydE9yQXBwZW5kKGRvbSwgYkVuZE5vZGUuZG9tLCBuZXh0Tm9kZSk7XG4gICAgICAgICAgICBhU3RhcnQrKztcbiAgICAgICAgICAgIGJFbmQtLTtcbiAgICAgICAgICAgIGFTdGFydE5vZGUgPSBhW2FTdGFydF07XG4gICAgICAgICAgICBiRW5kTm9kZSA9IGJbYkVuZF07XG4gICAgICAgICAgICBpZiAoYkVuZE5vZGUuZG9tKSB7XG4gICAgICAgICAgICAgICAgYltiRW5kXSA9IGJFbmROb2RlID0gY2xvbmVWTm9kZShiRW5kTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGFTdGFydCA+IGFFbmQpIHtcbiAgICAgICAgaWYgKGJTdGFydCA8PSBiRW5kKSB7XG4gICAgICAgICAgICBuZXh0UG9zID0gYkVuZCArIDE7XG4gICAgICAgICAgICBuZXh0Tm9kZSA9IG5leHRQb3MgPCBiLmxlbmd0aCA/IGJbbmV4dFBvc10uZG9tIDogbnVsbDtcbiAgICAgICAgICAgIHdoaWxlIChiU3RhcnQgPD0gYkVuZCkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBiW2JTdGFydF07XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGJbYlN0YXJ0XSA9IG5vZGUgPSBjbG9uZVZOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiU3RhcnQrKztcbiAgICAgICAgICAgICAgICBpbnNlcnRPckFwcGVuZChkb20sIG1vdW50KG5vZGUsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpLCBuZXh0Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYlN0YXJ0ID4gYkVuZCkge1xuICAgICAgICB3aGlsZSAoYVN0YXJ0IDw9IGFFbmQpIHtcbiAgICAgICAgICAgIHVubW91bnQoYVthU3RhcnQrK10sIGRvbSwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhTGVuZ3RoID0gYUVuZCAtIGFTdGFydCArIDE7XG4gICAgICAgIGJMZW5ndGggPSBiRW5kIC0gYlN0YXJ0ICsgMTtcbiAgICAgICAgdmFyIGFOdWxsYWJsZSA9IGE7XG4gICAgICAgIHZhciBzb3VyY2VzID0gbmV3IEFycmF5KGJMZW5ndGgpO1xuICAgICAgICAvLyBNYXJrIGFsbCBub2RlcyBhcyBpbnNlcnRlZC5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc291cmNlc1tpXSA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtb3ZlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgcG9zID0gMDtcbiAgICAgICAgdmFyIHBhdGNoZWQgPSAwO1xuICAgICAgICBpZiAoKGJMZW5ndGggPD0gNCkgfHwgKGFMZW5ndGggKiBiTGVuZ3RoIDw9IDE2KSkge1xuICAgICAgICAgICAgZm9yIChpID0gYVN0YXJ0OyBpIDw9IGFFbmQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGFOb2RlID0gYVtpXTtcbiAgICAgICAgICAgICAgICBpZiAocGF0Y2hlZCA8IGJMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gYlN0YXJ0OyBqIDw9IGJFbmQ7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYk5vZGUgPSBiW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFOb2RlLmtleSA9PT0gYk5vZGUua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlc1tqIC0gYlN0YXJ0XSA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA+IGopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJOb2RlLmRvbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiW2pdID0gYk5vZGUgPSBjbG9uZVZOb2RlKGJOb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2goYU5vZGUsIGJOb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYU51bGxhYmxlW2ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBrZXlJbmRleCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAoaSA9IGJTdGFydDsgaSA8PSBiRW5kOyBpKyspIHtcbiAgICAgICAgICAgICAgICBub2RlID0gYltpXTtcbiAgICAgICAgICAgICAgICBrZXlJbmRleC5zZXQobm9kZS5rZXksIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gYVN0YXJ0OyBpIDw9IGFFbmQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGFOb2RlID0gYVtpXTtcbiAgICAgICAgICAgICAgICBpZiAocGF0Y2hlZCA8IGJMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaiA9IGtleUluZGV4LmdldChhTm9kZS5rZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKGopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiTm9kZSA9IGJbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VzW2ogLSBiU3RhcnRdID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3MgPiBqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiTm9kZS5kb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiW2pdID0gYk5vZGUgPSBjbG9uZVZOb2RlKGJOb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoKGFOb2RlLCBiTm9kZSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaGVkKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBhTnVsbGFibGVbaV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhTGVuZ3RoID09PSBhLmxlbmd0aCAmJiBwYXRjaGVkID09PSAwKSB7XG4gICAgICAgICAgICByZW1vdmVBbGxDaGlsZHJlbihkb20sIGEsIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgd2hpbGUgKGJTdGFydCA8IGJMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gYltiU3RhcnRdO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmRvbSkge1xuICAgICAgICAgICAgICAgICAgICBiW2JTdGFydF0gPSBub2RlID0gY2xvbmVWTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYlN0YXJ0Kys7XG4gICAgICAgICAgICAgICAgaW5zZXJ0T3JBcHBlbmQoZG9tLCBtb3VudChub2RlLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpID0gYUxlbmd0aCAtIHBhdGNoZWQ7XG4gICAgICAgICAgICB3aGlsZSAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICBhTm9kZSA9IGFOdWxsYWJsZVthU3RhcnQrK107XG4gICAgICAgICAgICAgICAgaWYgKCFpc051bGwoYU5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVubW91bnQoYU5vZGUsIGRvbSwgbGlmZWN5Y2xlLCB0cnVlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW92ZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VxID0gbGlzX2FsZ29yaXRobShzb3VyY2VzKTtcbiAgICAgICAgICAgICAgICBqID0gc2VxLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gYkxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VzW2ldID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0gaSArIGJTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgPSBiW3Bvc107XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5kb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiW3Bvc10gPSBub2RlID0gY2xvbmVWTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQb3MgPSBwb3MgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBuZXh0UG9zIDwgYi5sZW5ndGggPyBiW25leHRQb3NdLmRvbSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRPckFwcGVuZChkb20sIG1vdW50KG5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyksIG5leHROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqIDwgMCB8fCBpICE9PSBzZXFbal0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSBpICsgYlN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgPSBiW3Bvc107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBvcyA9IHBvcyArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBuZXh0UG9zIDwgYi5sZW5ndGggPyBiW25leHRQb3NdLmRvbSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0T3JBcHBlbmQoZG9tLCBub2RlLmRvbSwgbmV4dE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgai0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocGF0Y2hlZCAhPT0gYkxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IGJMZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlc1tpXSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IGkgKyBiU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlID0gYltwb3NdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYltwb3NdID0gbm9kZSA9IGNsb25lVk5vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0UG9zID0gcG9zICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHROb2RlID0gbmV4dFBvcyA8IGIubGVuZ3RoID8gYltuZXh0UG9zXS5kb20gOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0T3JBcHBlbmQoZG9tLCBtb3VudChub2RlLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSwgbmV4dE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLy8gLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9uZ2VzdF9pbmNyZWFzaW5nX3N1YnNlcXVlbmNlXG5mdW5jdGlvbiBsaXNfYWxnb3JpdGhtKGEpIHtcbiAgICB2YXIgcCA9IGEuc2xpY2UoMCk7XG4gICAgdmFyIHJlc3VsdCA9IFswXTtcbiAgICB2YXIgaTtcbiAgICB2YXIgajtcbiAgICB2YXIgdTtcbiAgICB2YXIgdjtcbiAgICB2YXIgYztcbiAgICBmb3IgKGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYVtpXSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGogPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoYVtqXSA8IGFbaV0pIHtcbiAgICAgICAgICAgIHBbaV0gPSBqO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goaSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB1ID0gMDtcbiAgICAgICAgdiA9IHJlc3VsdC5sZW5ndGggLSAxO1xuICAgICAgICB3aGlsZSAodSA8IHYpIHtcbiAgICAgICAgICAgIGMgPSAoKHUgKyB2KSAvIDIpIHwgMDtcbiAgICAgICAgICAgIGlmIChhW3Jlc3VsdFtjXV0gPCBhW2ldKSB7XG4gICAgICAgICAgICAgICAgdSA9IGMgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdiA9IGM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFbaV0gPCBhW3Jlc3VsdFt1XV0pIHtcbiAgICAgICAgICAgIGlmICh1ID4gMCkge1xuICAgICAgICAgICAgICAgIHBbaV0gPSByZXN1bHRbdSAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W3VdID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1ID0gcmVzdWx0Lmxlbmd0aDtcbiAgICB2ID0gcmVzdWx0W3UgLSAxXTtcbiAgICB3aGlsZSAodS0tID4gMCkge1xuICAgICAgICByZXN1bHRbdV0gPSB2O1xuICAgICAgICB2ID0gcFt2XTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHBhdGNoUHJvcChwcm9wLCBsYXN0VmFsdWUsIG5leHRWYWx1ZSwgZG9tLCBpc1NWRywgaGFzQ29udHJvbGxlZFZhbHVlKSB7XG4gICAgaWYgKHNraXBQcm9wc1twcm9wXSB8fCBoYXNDb250cm9sbGVkVmFsdWUgJiYgcHJvcCA9PT0gJ3ZhbHVlJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChib29sZWFuUHJvcHNbcHJvcF0pIHtcbiAgICAgICAgZG9tW3Byb3BdID0gISFuZXh0VmFsdWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKHN0cmljdFByb3BzW3Byb3BdKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGlzTnVsbE9yVW5kZWYobmV4dFZhbHVlKSA/ICcnIDogbmV4dFZhbHVlO1xuICAgICAgICBpZiAoZG9tW3Byb3BdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgZG9tW3Byb3BdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobGFzdFZhbHVlICE9PSBuZXh0VmFsdWUpIHtcbiAgICAgICAgaWYgKGlzQXR0ckFuRXZlbnQocHJvcCkpIHtcbiAgICAgICAgICAgIHBhdGNoRXZlbnQocHJvcCwgbGFzdFZhbHVlLCBuZXh0VmFsdWUsIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNOdWxsT3JVbmRlZihuZXh0VmFsdWUpKSB7XG4gICAgICAgICAgICBkb20ucmVtb3ZlQXR0cmlidXRlKHByb3ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHByb3AgPT09ICdjbGFzc05hbWUnKSB7XG4gICAgICAgICAgICBpZiAoaXNTVkcpIHtcbiAgICAgICAgICAgICAgICBkb20uc2V0QXR0cmlidXRlKCdjbGFzcycsIG5leHRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb20uY2xhc3NOYW1lID0gbmV4dFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHByb3AgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgIHBhdGNoU3R5bGUobGFzdFZhbHVlLCBuZXh0VmFsdWUsIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocHJvcCA9PT0gJ2Rhbmdlcm91c2x5U2V0SW5uZXJIVE1MJykge1xuICAgICAgICAgICAgdmFyIGxhc3RIdG1sID0gbGFzdFZhbHVlICYmIGxhc3RWYWx1ZS5fX2h0bWw7XG4gICAgICAgICAgICB2YXIgbmV4dEh0bWwgPSBuZXh0VmFsdWUgJiYgbmV4dFZhbHVlLl9faHRtbDtcbiAgICAgICAgICAgIGlmIChsYXN0SHRtbCAhPT0gbmV4dEh0bWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYobmV4dEh0bWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbS5pbm5lckhUTUwgPSBuZXh0SHRtbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZGVoeXBoZW5Qcm9wO1xuICAgICAgICAgICAgaWYgKGRlaHlwaGVuUHJvcHNbcHJvcF0pIHtcbiAgICAgICAgICAgICAgICBkZWh5cGhlblByb3AgPSBkZWh5cGhlblByb3BzW3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNTVkcgJiYgcHJvcC5tYXRjaChwcm9iYWJseUtlYmFiUHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgZGVoeXBoZW5Qcm9wID0gcHJvcC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdfDEpL2csIGtlYmFiaXplKTtcbiAgICAgICAgICAgICAgICBkZWh5cGhlblByb3BzW3Byb3BdID0gZGVoeXBoZW5Qcm9wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVoeXBoZW5Qcm9wID0gcHJvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBucyA9IG5hbWVzcGFjZXNbcHJvcF07XG4gICAgICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICAgICAgICBkb20uc2V0QXR0cmlidXRlTlMobnMsIGRlaHlwaGVuUHJvcCwgbmV4dFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoZGVoeXBoZW5Qcm9wLCBuZXh0VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gcGF0Y2hFdmVudHMobGFzdEV2ZW50cywgbmV4dEV2ZW50cywgZG9tKSB7XG4gICAgbGFzdEV2ZW50cyA9IGxhc3RFdmVudHMgfHwgRU1QVFlfT0JKO1xuICAgIG5leHRFdmVudHMgPSBuZXh0RXZlbnRzIHx8IEVNUFRZX09CSjtcbiAgICBpZiAobmV4dEV2ZW50cyAhPT0gRU1QVFlfT0JKKSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gbmV4dEV2ZW50cykge1xuICAgICAgICAgICAgLy8gZG8gbm90IGFkZCBhIGhhc093blByb3BlcnR5IGNoZWNrIGhlcmUsIGl0IGFmZmVjdHMgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIHBhdGNoRXZlbnQobmFtZSwgbGFzdEV2ZW50c1tuYW1lXSwgbmV4dEV2ZW50c1tuYW1lXSwgZG9tKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobGFzdEV2ZW50cyAhPT0gRU1QVFlfT0JKKSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUkMSBpbiBsYXN0RXZlbnRzKSB7XG4gICAgICAgICAgICAvLyBkbyBub3QgYWRkIGEgaGFzT3duUHJvcGVydHkgY2hlY2sgaGVyZSwgaXQgYWZmZWN0cyBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWYobmV4dEV2ZW50c1tuYW1lJDFdKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoRXZlbnQobmFtZSQxLCBsYXN0RXZlbnRzW25hbWUkMV0sIG51bGwsIGRvbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBwYXRjaEV2ZW50KG5hbWUsIGxhc3RWYWx1ZSwgbmV4dFZhbHVlLCBkb20pIHtcbiAgICBpZiAobGFzdFZhbHVlICE9PSBuZXh0VmFsdWUpIHtcbiAgICAgICAgdmFyIG5hbWVMb3dlckNhc2UgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciBkb21FdmVudCA9IGRvbVtuYW1lTG93ZXJDYXNlXTtcbiAgICAgICAgLy8gaWYgdGhlIGZ1bmN0aW9uIGlzIHdyYXBwZWQsIHRoYXQgbWVhbnMgaXQncyBiZWVuIGNvbnRyb2xsZWQgYnkgYSB3cmFwcGVyXG4gICAgICAgIGlmIChkb21FdmVudCAmJiBkb21FdmVudC53cmFwcGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlbGVnYXRlZFByb3BzW25hbWVdKSB7XG4gICAgICAgICAgICBoYW5kbGVFdmVudChuYW1lLCBsYXN0VmFsdWUsIG5leHRWYWx1ZSwgZG9tKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChsYXN0VmFsdWUgIT09IG5leHRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghaXNGdW5jdGlvbihuZXh0VmFsdWUpICYmICFpc051bGxPclVuZGVmKG5leHRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpbmtFdmVudCA9IG5leHRWYWx1ZS5ldmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmtFdmVudCAmJiBpc0Z1bmN0aW9uKGxpbmtFdmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZG9tLl9kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tW25hbWVMb3dlckNhc2VdID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua0V2ZW50KGUuY3VycmVudFRhcmdldC5fZGF0YSwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbS5fZGF0YSA9IG5leHRWYWx1ZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKChcImFuIGV2ZW50IG9uIGEgVk5vZGUgXFxcIlwiICsgbmFtZSArIFwiXFxcIi4gd2FzIG5vdCBhIGZ1bmN0aW9uIG9yIGEgdmFsaWQgbGlua0V2ZW50LlwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbVtuYW1lTG93ZXJDYXNlXSA9IG5leHRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBXZSBhcmUgYXNzdW1pbmcgaGVyZSB0aGF0IHdlIGNvbWUgZnJvbSBwYXRjaFByb3Agcm91dGluZVxuLy8gLW5leHRBdHRyVmFsdWUgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkXG5mdW5jdGlvbiBwYXRjaFN0eWxlKGxhc3RBdHRyVmFsdWUsIG5leHRBdHRyVmFsdWUsIGRvbSkge1xuICAgIGlmIChpc1N0cmluZyhuZXh0QXR0clZhbHVlKSkge1xuICAgICAgICBkb20uc3R5bGUuY3NzVGV4dCA9IG5leHRBdHRyVmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yICh2YXIgc3R5bGUgaW4gbmV4dEF0dHJWYWx1ZSkge1xuICAgICAgICAvLyBkbyBub3QgYWRkIGEgaGFzT3duUHJvcGVydHkgY2hlY2sgaGVyZSwgaXQgYWZmZWN0cyBwZXJmb3JtYW5jZVxuICAgICAgICB2YXIgdmFsdWUgPSBuZXh0QXR0clZhbHVlW3N0eWxlXTtcbiAgICAgICAgaWYgKGlzTnVtYmVyKHZhbHVlKSAmJiAhaXNVbml0bGVzc051bWJlcltzdHlsZV0pIHtcbiAgICAgICAgICAgIGRvbS5zdHlsZVtzdHlsZV0gPSB2YWx1ZSArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb20uc3R5bGVbc3R5bGVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc051bGxPclVuZGVmKGxhc3RBdHRyVmFsdWUpKSB7XG4gICAgICAgIGZvciAodmFyIHN0eWxlJDEgaW4gbGFzdEF0dHJWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWYobmV4dEF0dHJWYWx1ZVtzdHlsZSQxXSkpIHtcbiAgICAgICAgICAgICAgICBkb20uc3R5bGVbc3R5bGUkMV0gPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHJlbW92ZVByb3AocHJvcCwgbGFzdFZhbHVlLCBkb20pIHtcbiAgICBpZiAocHJvcCA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgICAgZG9tLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocHJvcCA9PT0gJ3ZhbHVlJykge1xuICAgICAgICBkb20udmFsdWUgPSAnJztcbiAgICB9XG4gICAgZWxzZSBpZiAocHJvcCA9PT0gJ3N0eWxlJykge1xuICAgICAgICBkb20ucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0F0dHJBbkV2ZW50KHByb3ApKSB7XG4gICAgICAgIGhhbmRsZUV2ZW50KG5hbWUsIGxhc3RWYWx1ZSwgbnVsbCwgZG9tKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRvbS5yZW1vdmVBdHRyaWJ1dGUocHJvcCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBtb3VudCh2Tm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSB7XG4gICAgdmFyIGZsYWdzID0gdk5vZGUuZmxhZ3M7XG4gICAgaWYgKGZsYWdzICYgMzk3MCAvKiBFbGVtZW50ICovKSB7XG4gICAgICAgIHJldHVybiBtb3VudEVsZW1lbnQodk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgIHJldHVybiBtb3VudENvbXBvbmVudCh2Tm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBmbGFncyAmIDQgLyogQ29tcG9uZW50Q2xhc3MgKi8pO1xuICAgIH1cbiAgICBlbHNlIGlmIChmbGFncyAmIDQwOTYgLyogVm9pZCAqLykge1xuICAgICAgICByZXR1cm4gbW91bnRWb2lkKHZOb2RlLCBwYXJlbnREb20pO1xuICAgIH1cbiAgICBlbHNlIGlmIChmbGFncyAmIDEgLyogVGV4dCAqLykge1xuICAgICAgICByZXR1cm4gbW91bnRUZXh0KHZOb2RlLCBwYXJlbnREb20pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygdk5vZGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dFcnJvcigoXCJtb3VudCgpIHJlY2VpdmVkIGFuIG9iamVjdCB0aGF0J3Mgbm90IGEgdmFsaWQgVk5vZGUsIHlvdSBzaG91bGQgc3RyaW5naWZ5IGl0IGZpcnN0LiBPYmplY3Q6IFxcXCJcIiArIChKU09OLnN0cmluZ2lmeSh2Tm9kZSkpICsgXCJcXFwiLlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKChcIm1vdW50KCkgZXhwZWN0cyBhIHZhbGlkIFZOb2RlLCBpbnN0ZWFkIGl0IHJlY2VpdmVkIGFuIG9iamVjdCB3aXRoIHRoZSB0eXBlIFxcXCJcIiArICh0eXBlb2Ygdk5vZGUpICsgXCJcXFwiLlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1vdW50VGV4dCh2Tm9kZSwgcGFyZW50RG9tKSB7XG4gICAgdmFyIGRvbSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZOb2RlLmNoaWxkcmVuKTtcbiAgICB2Tm9kZS5kb20gPSBkb207XG4gICAgaWYgKHBhcmVudERvbSkge1xuICAgICAgICBhcHBlbmRDaGlsZChwYXJlbnREb20sIGRvbSk7XG4gICAgfVxuICAgIHJldHVybiBkb207XG59XG5mdW5jdGlvbiBtb3VudFZvaWQodk5vZGUsIHBhcmVudERvbSkge1xuICAgIHZhciBkb20gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgdk5vZGUuZG9tID0gZG9tO1xuICAgIGlmIChwYXJlbnREb20pIHtcbiAgICAgICAgYXBwZW5kQ2hpbGQocGFyZW50RG9tLCBkb20pO1xuICAgIH1cbiAgICByZXR1cm4gZG9tO1xufVxuZnVuY3Rpb24gbW91bnRFbGVtZW50KHZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpIHtcbiAgICBpZiAob3B0aW9ucy5yZWN5Y2xpbmdFbmFibGVkKSB7XG4gICAgICAgIHZhciBkb20kMSA9IHJlY3ljbGVFbGVtZW50KHZOb2RlLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgaWYgKCFpc051bGwoZG9tJDEpKSB7XG4gICAgICAgICAgICBpZiAoIWlzTnVsbChwYXJlbnREb20pKSB7XG4gICAgICAgICAgICAgICAgYXBwZW5kQ2hpbGQocGFyZW50RG9tLCBkb20kMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZG9tJDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIHRhZyA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIGZsYWdzID0gdk5vZGUuZmxhZ3M7XG4gICAgaWYgKGlzU1ZHIHx8IChmbGFncyAmIDEyOCAvKiBTdmdFbGVtZW50ICovKSkge1xuICAgICAgICBpc1NWRyA9IHRydWU7XG4gICAgfVxuICAgIHZhciBkb20gPSBkb2N1bWVudENyZWF0ZUVsZW1lbnQodGFnLCBpc1NWRyk7XG4gICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG4gICAgdmFyIHByb3BzID0gdk5vZGUucHJvcHM7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cztcbiAgICB2YXIgcmVmID0gdk5vZGUucmVmO1xuICAgIHZOb2RlLmRvbSA9IGRvbTtcbiAgICBpZiAoIWlzTnVsbChjaGlsZHJlbikpIHtcbiAgICAgICAgaWYgKGlzU3RyaW5nT3JOdW1iZXIoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBzZXRUZXh0Q29udGVudChkb20sIGNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgbW91bnRBcnJheUNoaWxkcmVuKGNoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzVk5vZGUoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBtb3VudChjaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaGFzQ29udHJvbGxlZFZhbHVlID0gZmFsc2U7XG4gICAgaWYgKCEoZmxhZ3MgJiAyIC8qIEh0bWxFbGVtZW50ICovKSkge1xuICAgICAgICBoYXNDb250cm9sbGVkVmFsdWUgPSBwcm9jZXNzRWxlbWVudChmbGFncywgdk5vZGUsIGRvbSk7XG4gICAgfVxuICAgIGlmICghaXNOdWxsKHByb3BzKSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XG4gICAgICAgICAgICAvLyBkbyBub3QgYWRkIGEgaGFzT3duUHJvcGVydHkgY2hlY2sgaGVyZSwgaXQgYWZmZWN0cyBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgcGF0Y2hQcm9wKHByb3AsIG51bGwsIHByb3BzW3Byb3BdLCBkb20sIGlzU1ZHLCBoYXNDb250cm9sbGVkVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghaXNOdWxsKGV2ZW50cykpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdCBhZGQgYSBoYXNPd25Qcm9wZXJ0eSBjaGVjayBoZXJlLCBpdCBhZmZlY3RzIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICBwYXRjaEV2ZW50KG5hbWUsIG51bGwsIGV2ZW50c1tuYW1lXSwgZG9tKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzTnVsbChyZWYpKSB7XG4gICAgICAgIG1vdW50UmVmKGRvbSwgcmVmLCBsaWZlY3ljbGUpO1xuICAgIH1cbiAgICBpZiAoIWlzTnVsbChwYXJlbnREb20pKSB7XG4gICAgICAgIGFwcGVuZENoaWxkKHBhcmVudERvbSwgZG9tKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvbTtcbn1cbmZ1bmN0aW9uIG1vdW50QXJyYXlDaGlsZHJlbihjaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgLy8gVE9ETzogVmVyaWZ5IGNhbiBzdHJpbmcvbnVtYmVyIGJlIGhlcmUuIG1pZ2h0IGNhdXNlIGRlLW9wdFxuICAgICAgICBpZiAoIWlzSW52YWxpZChjaGlsZCkpIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5kb20pIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IGNoaWxkID0gY2xvbmVWTm9kZShjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtb3VudChjaGlsZHJlbltpXSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIG1vdW50Q29tcG9uZW50KHZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzQ2xhc3MpIHtcbiAgICBpZiAob3B0aW9ucy5yZWN5Y2xpbmdFbmFibGVkKSB7XG4gICAgICAgIHZhciBkb20kMSA9IHJlY3ljbGVDb21wb25lbnQodk5vZGUsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICBpZiAoIWlzTnVsbChkb20kMSkpIHtcbiAgICAgICAgICAgIGlmICghaXNOdWxsKHBhcmVudERvbSkpIHtcbiAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZChwYXJlbnREb20sIGRvbSQxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkb20kMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgdHlwZSA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIHByb3BzID0gdk5vZGUucHJvcHMgfHwgRU1QVFlfT0JKO1xuICAgIHZhciBkZWZhdWx0UHJvcHMgPSB0eXBlLmRlZmF1bHRQcm9wcztcbiAgICB2YXIgcmVmID0gdk5vZGUucmVmO1xuICAgIHZhciBkb207XG4gICAgaWYgKCFpc1VuZGVmaW5lZChkZWZhdWx0UHJvcHMpKSB7XG4gICAgICAgIGNvcHlQcm9wc1RvKGRlZmF1bHRQcm9wcywgcHJvcHMpO1xuICAgICAgICB2Tm9kZS5wcm9wcyA9IHByb3BzO1xuICAgIH1cbiAgICBpZiAoaXNDbGFzcykge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBjcmVhdGVDbGFzc0NvbXBvbmVudEluc3RhbmNlKHZOb2RlLCB0eXBlLCBwcm9wcywgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICAvLyBJZiBpbnN0YW5jZSBkb2VzIG5vdCBoYXZlIGNvbXBvbmVudFdpbGxVbm1vdW50IHNwZWNpZmllZCB3ZSBjYW4gZW5hYmxlIGZhc3RVbm1vdW50XG4gICAgICAgIHZhciBpbnB1dCA9IGluc3RhbmNlLl9sYXN0SW5wdXQ7XG4gICAgICAgIHZhciBwcmV2RmFzdFVubW91bnQgPSBsaWZlY3ljbGUuZmFzdFVubW91bnQ7XG4gICAgICAgIC8vIHdlIHN0b3JlIHRoZSBmYXN0VW5tb3VudCB2YWx1ZSwgYnV0IHdlIHNldCBpdCBiYWNrIHRvIHRydWUgb24gdGhlIGxpZmVjeWNsZVxuICAgICAgICAvLyB3ZSBkbyB0aGlzIHNvIHdlIGNhbiBkZXRlcm1pbmUgaWYgdGhlIGNvbXBvbmVudCByZW5kZXIgaGFzIGEgZmFzdFVubW91bnQgb3Igbm90XG4gICAgICAgIGxpZmVjeWNsZS5mYXN0VW5tb3VudCA9IHRydWU7XG4gICAgICAgIGluc3RhbmNlLl92Tm9kZSA9IHZOb2RlO1xuICAgICAgICB2Tm9kZS5kb20gPSBkb20gPSBtb3VudChpbnB1dCwgbnVsbCwgbGlmZWN5Y2xlLCBpbnN0YW5jZS5fY2hpbGRDb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIC8vIHdlIG5vdyBjcmVhdGUgYSBsaWZlY3ljbGUgZm9yIHRoaXMgY29tcG9uZW50IGFuZCBzdG9yZSB0aGUgZmFzdFVubW91bnQgdmFsdWVcbiAgICAgICAgdmFyIHN1YkxpZmVjeWNsZSA9IGluc3RhbmNlLl9saWZlY3ljbGUgPSBuZXcgTGlmZWN5Y2xlKCk7XG4gICAgICAgIC8vIGNoaWxkcmVuIGxpZmVjeWNsZSBjYW4gZmFzdFVubW91bnQgaWYgaXRzZWxmIGRvZXMgbmVlZCB1bm1vdW50IGNhbGxiYWNrIGFuZCB3aXRoaW4gaXRzIGN5Y2xlIHRoZXJlIHdhcyBub25lXG4gICAgICAgIHN1YkxpZmVjeWNsZS5mYXN0VW5tb3VudCA9IGlzVW5kZWZpbmVkKGluc3RhbmNlLmNvbXBvbmVudFdpbGxVbm1vdW50KSAmJiBsaWZlY3ljbGUuZmFzdFVubW91bnQ7XG4gICAgICAgIC8vIGhpZ2hlciBsaWZlY3ljbGUgY2FuIGZhc3RVbm1vdW50IG9ubHkgaWYgcHJldmlvdXNseSBpdCB3YXMgYWJsZSB0byBhbmQgdGhpcyBjaGlsZHJlbiBkb2VzbnQgaGF2ZSBhbnlcbiAgICAgICAgbGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gcHJldkZhc3RVbm1vdW50ICYmIHN1YkxpZmVjeWNsZS5mYXN0VW5tb3VudDtcbiAgICAgICAgaWYgKCFpc051bGwocGFyZW50RG9tKSkge1xuICAgICAgICAgICAgYXBwZW5kQ2hpbGQocGFyZW50RG9tLCBkb20pO1xuICAgICAgICB9XG4gICAgICAgIG1vdW50Q2xhc3NDb21wb25lbnRDYWxsYmFja3Modk5vZGUsIHJlZiwgaW5zdGFuY2UsIGxpZmVjeWNsZSk7XG4gICAgICAgIG9wdGlvbnMuZmluZERPTU5vZGVFbmFibGVkICYmIGNvbXBvbmVudFRvRE9NTm9kZU1hcC5zZXQoaW5zdGFuY2UsIGRvbSk7XG4gICAgICAgIHZOb2RlLmNoaWxkcmVuID0gaW5zdGFuY2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgaW5wdXQkMSA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnRJbnB1dCh2Tm9kZSwgdHlwZSwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB2Tm9kZS5kb20gPSBkb20gPSBtb3VudChpbnB1dCQxLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgdk5vZGUuY2hpbGRyZW4gPSBpbnB1dCQxO1xuICAgICAgICBtb3VudEZ1bmN0aW9uYWxDb21wb25lbnRDYWxsYmFja3MocmVmLCBkb20sIGxpZmVjeWNsZSk7XG4gICAgICAgIGlmICghaXNOdWxsKHBhcmVudERvbSkpIHtcbiAgICAgICAgICAgIGFwcGVuZENoaWxkKHBhcmVudERvbSwgZG9tKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZG9tO1xufVxuZnVuY3Rpb24gbW91bnRDbGFzc0NvbXBvbmVudENhbGxiYWNrcyh2Tm9kZSwgcmVmLCBpbnN0YW5jZSwgbGlmZWN5Y2xlKSB7XG4gICAgaWYgKHJlZikge1xuICAgICAgICBpZiAoaXNGdW5jdGlvbihyZWYpKSB7XG4gICAgICAgICAgICByZWYoaW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNTdHJpbmdPck51bWJlcihyZWYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoJ3N0cmluZyBcInJlZnNcIiBhcmUgbm90IHN1cHBvcnRlZCBpbiBJbmZlcm5vIDEuMC4gVXNlIGNhbGxiYWNrIFwicmVmc1wiIGluc3RlYWQuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzT2JqZWN0KHJlZikgJiYgKHZOb2RlLmZsYWdzICYgNCAvKiBDb21wb25lbnRDbGFzcyAqLykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcignZnVuY3Rpb25hbCBjb21wb25lbnQgbGlmZWN5Y2xlIGV2ZW50cyBhcmUgbm90IHN1cHBvcnRlZCBvbiBFUzIwMTUgY2xhc3MgY29tcG9uZW50cy4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoKFwiYSBiYWQgdmFsdWUgZm9yIFxcXCJyZWZcXFwiIHdhcyB1c2VkIG9uIGNvbXBvbmVudDogXFxcIlwiICsgKEpTT04uc3RyaW5naWZ5KHJlZikpICsgXCJcXFwiXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGNETSA9IGluc3RhbmNlLmNvbXBvbmVudERpZE1vdW50O1xuICAgIHZhciBhZnRlck1vdW50ID0gb3B0aW9ucy5hZnRlck1vdW50O1xuICAgIGlmICghaXNVbmRlZmluZWQoY0RNKSB8fCAhaXNOdWxsKGFmdGVyTW91bnQpKSB7XG4gICAgICAgIGxpZmVjeWNsZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhZnRlck1vdW50ICYmIGFmdGVyTW91bnQodk5vZGUpO1xuICAgICAgICAgICAgY0RNICYmIGluc3RhbmNlLmNvbXBvbmVudERpZE1vdW50KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1vdW50RnVuY3Rpb25hbENvbXBvbmVudENhbGxiYWNrcyhyZWYsIGRvbSwgbGlmZWN5Y2xlKSB7XG4gICAgaWYgKHJlZikge1xuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYocmVmLm9uQ29tcG9uZW50V2lsbE1vdW50KSkge1xuICAgICAgICAgICAgcmVmLm9uQ29tcG9uZW50V2lsbE1vdW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKHJlZi5vbkNvbXBvbmVudERpZE1vdW50KSkge1xuICAgICAgICAgICAgbGlmZWN5Y2xlLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlZi5vbkNvbXBvbmVudERpZE1vdW50KGRvbSk7IH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZihyZWYub25Db21wb25lbnRXaWxsVW5tb3VudCkpIHtcbiAgICAgICAgICAgIGxpZmVjeWNsZS5mYXN0VW5tb3VudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gbW91bnRSZWYoZG9tLCB2YWx1ZSwgbGlmZWN5Y2xlKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGxpZmVjeWNsZS5mYXN0VW5tb3VudCA9IGZhbHNlO1xuICAgICAgICBsaWZlY3ljbGUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWUoZG9tKTsgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoaXNJbnZhbGlkKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCdzdHJpbmcgXCJyZWZzXCIgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gSW5mZXJubyAxLjAuIFVzZSBjYWxsYmFjayBcInJlZnNcIiBpbnN0ZWFkLicpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNoaWxkTm9kZXMocGFyZW50RG9tKSB7XG4gICAgdmFyIGRvbSA9IHBhcmVudERvbS5maXJzdENoaWxkO1xuICAgIHdoaWxlIChkb20pIHtcbiAgICAgICAgaWYgKGRvbS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICAgICAgaWYgKGRvbS5kYXRhID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGxhY2Vob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICAgICAgICAgICAgcGFyZW50RG9tLnJlcGxhY2VDaGlsZChwbGFjZWhvbGRlciwgZG9tKTtcbiAgICAgICAgICAgICAgICBkb20gPSBkb20ubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdERvbSA9IGRvbS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICAgICAgcGFyZW50RG9tLnJlbW92ZUNoaWxkKGRvbSk7XG4gICAgICAgICAgICAgICAgZG9tID0gbGFzdERvbSB8fCBwYXJlbnREb20uZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvbSA9IGRvbS5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGh5ZHJhdGVDb21wb25lbnQodk5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNDbGFzcykge1xuICAgIHZhciB0eXBlID0gdk5vZGUudHlwZTtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIHJlZiA9IHZOb2RlLnJlZjtcbiAgICB2Tm9kZS5kb20gPSBkb207XG4gICAgaWYgKGlzQ2xhc3MpIHtcbiAgICAgICAgdmFyIF9pc1NWRyA9IGRvbS5uYW1lc3BhY2VVUkkgPT09IHN2Z05TO1xuICAgICAgICB2YXIgZGVmYXVsdFByb3BzID0gdHlwZS5kZWZhdWx0UHJvcHM7XG4gICAgICAgIGlmICghaXNVbmRlZmluZWQoZGVmYXVsdFByb3BzKSkge1xuICAgICAgICAgICAgY29weVByb3BzVG8oZGVmYXVsdFByb3BzLCBwcm9wcyk7XG4gICAgICAgICAgICB2Tm9kZS5wcm9wcyA9IHByb3BzO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IGNyZWF0ZUNsYXNzQ29tcG9uZW50SW5zdGFuY2Uodk5vZGUsIHR5cGUsIHByb3BzLCBjb250ZXh0LCBfaXNTVkcpO1xuICAgICAgICAvLyBJZiBpbnN0YW5jZSBkb2VzIG5vdCBoYXZlIGNvbXBvbmVudFdpbGxVbm1vdW50IHNwZWNpZmllZCB3ZSBjYW4gZW5hYmxlIGZhc3RVbm1vdW50XG4gICAgICAgIHZhciBwcmV2RmFzdFVubW91bnQgPSBsaWZlY3ljbGUuZmFzdFVubW91bnQ7XG4gICAgICAgIHZhciBpbnB1dCA9IGluc3RhbmNlLl9sYXN0SW5wdXQ7XG4gICAgICAgIC8vIHdlIHN0b3JlIHRoZSBmYXN0VW5tb3VudCB2YWx1ZSwgYnV0IHdlIHNldCBpdCBiYWNrIHRvIHRydWUgb24gdGhlIGxpZmVjeWNsZVxuICAgICAgICAvLyB3ZSBkbyB0aGlzIHNvIHdlIGNhbiBkZXRlcm1pbmUgaWYgdGhlIGNvbXBvbmVudCByZW5kZXIgaGFzIGEgZmFzdFVubW91bnQgb3Igbm90XG4gICAgICAgIGxpZmVjeWNsZS5mYXN0VW5tb3VudCA9IHRydWU7XG4gICAgICAgIGluc3RhbmNlLl92Q29tcG9uZW50ID0gdk5vZGU7XG4gICAgICAgIGluc3RhbmNlLl92Tm9kZSA9IHZOb2RlO1xuICAgICAgICBoeWRyYXRlKGlucHV0LCBkb20sIGxpZmVjeWNsZSwgaW5zdGFuY2UuX2NoaWxkQ29udGV4dCwgX2lzU1ZHKTtcbiAgICAgICAgLy8gd2Ugbm93IGNyZWF0ZSBhIGxpZmVjeWNsZSBmb3IgdGhpcyBjb21wb25lbnQgYW5kIHN0b3JlIHRoZSBmYXN0VW5tb3VudCB2YWx1ZVxuICAgICAgICB2YXIgc3ViTGlmZWN5Y2xlID0gaW5zdGFuY2UuX2xpZmVjeWNsZSA9IG5ldyBMaWZlY3ljbGUoKTtcbiAgICAgICAgLy8gY2hpbGRyZW4gbGlmZWN5Y2xlIGNhbiBmYXN0VW5tb3VudCBpZiBpdHNlbGYgZG9lcyBuZWVkIHVubW91bnQgY2FsbGJhY2sgYW5kIHdpdGhpbiBpdHMgY3ljbGUgdGhlcmUgd2FzIG5vbmVcbiAgICAgICAgc3ViTGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gaXNVbmRlZmluZWQoaW5zdGFuY2UuY29tcG9uZW50V2lsbFVubW91bnQpICYmIGxpZmVjeWNsZS5mYXN0VW5tb3VudDtcbiAgICAgICAgLy8gaGlnaGVyIGxpZmVjeWNsZSBjYW4gZmFzdFVubW91bnQgb25seSBpZiBwcmV2aW91c2x5IGl0IHdhcyBhYmxlIHRvIGFuZCB0aGlzIGNoaWxkcmVuIGRvZXNudCBoYXZlIGFueVxuICAgICAgICBsaWZlY3ljbGUuZmFzdFVubW91bnQgPSBwcmV2RmFzdFVubW91bnQgJiYgc3ViTGlmZWN5Y2xlLmZhc3RVbm1vdW50O1xuICAgICAgICBtb3VudENsYXNzQ29tcG9uZW50Q2FsbGJhY2tzKHZOb2RlLCByZWYsIGluc3RhbmNlLCBsaWZlY3ljbGUpO1xuICAgICAgICBvcHRpb25zLmZpbmRET01Ob2RlRW5hYmxlZCAmJiBjb21wb25lbnRUb0RPTU5vZGVNYXAuc2V0KGluc3RhbmNlLCBkb20pO1xuICAgICAgICB2Tm9kZS5jaGlsZHJlbiA9IGluc3RhbmNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGlucHV0JDEgPSBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50SW5wdXQodk5vZGUsIHR5cGUsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgaHlkcmF0ZShpbnB1dCQxLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB2Tm9kZS5jaGlsZHJlbiA9IGlucHV0JDE7XG4gICAgICAgIHZOb2RlLmRvbSA9IGlucHV0JDEuZG9tO1xuICAgICAgICBtb3VudEZ1bmN0aW9uYWxDb21wb25lbnRDYWxsYmFja3MocmVmLCBkb20sIGxpZmVjeWNsZSk7XG4gICAgfVxuICAgIHJldHVybiBkb207XG59XG5mdW5jdGlvbiBoeWRyYXRlRWxlbWVudCh2Tm9kZSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSB7XG4gICAgdmFyIHRhZyA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG4gICAgdmFyIHByb3BzID0gdk5vZGUucHJvcHM7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cztcbiAgICB2YXIgZmxhZ3MgPSB2Tm9kZS5mbGFncztcbiAgICB2YXIgcmVmID0gdk5vZGUucmVmO1xuICAgIGlmIChpc1NWRyB8fCAoZmxhZ3MgJiAxMjggLyogU3ZnRWxlbWVudCAqLykpIHtcbiAgICAgICAgaXNTVkcgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoZG9tLm5vZGVUeXBlICE9PSAxIHx8IGRvbS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRhZykge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgd2FybmluZyhmYWxzZSwgJ0luZmVybm8gaHlkcmF0aW9uOiBTZXJ2ZXItc2lkZSBtYXJrdXAgZG9lc25cXCd0IG1hdGNoIGNsaWVudC1zaWRlIG1hcmt1cCcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdEb20gPSBtb3VudEVsZW1lbnQodk5vZGUsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB2Tm9kZS5kb20gPSBuZXdEb207XG4gICAgICAgIHJlcGxhY2VDaGlsZChkb20ucGFyZW50Tm9kZSwgbmV3RG9tLCBkb20pO1xuICAgICAgICByZXR1cm4gbmV3RG9tO1xuICAgIH1cbiAgICB2Tm9kZS5kb20gPSBkb207XG4gICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICAgIGh5ZHJhdGVDaGlsZHJlbihjaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICB9XG4gICAgdmFyIGhhc0NvbnRyb2xsZWRWYWx1ZSA9IGZhbHNlO1xuICAgIGlmICghKGZsYWdzICYgMiAvKiBIdG1sRWxlbWVudCAqLykpIHtcbiAgICAgICAgaGFzQ29udHJvbGxlZFZhbHVlID0gcHJvY2Vzc0VsZW1lbnQoZmxhZ3MsIHZOb2RlLCBkb20pO1xuICAgIH1cbiAgICBpZiAocHJvcHMpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBwcm9wcykge1xuICAgICAgICAgICAgcGF0Y2hQcm9wKHByb3AsIG51bGwsIHByb3BzW3Byb3BdLCBkb20sIGlzU1ZHLCBoYXNDb250cm9sbGVkVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChldmVudHMpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIHBhdGNoRXZlbnQobmFtZSwgbnVsbCwgZXZlbnRzW25hbWVdLCBkb20pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChyZWYpIHtcbiAgICAgICAgbW91bnRSZWYoZG9tLCByZWYsIGxpZmVjeWNsZSk7XG4gICAgfVxuICAgIHJldHVybiBkb207XG59XG5mdW5jdGlvbiBoeWRyYXRlQ2hpbGRyZW4oY2hpbGRyZW4sIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRykge1xuICAgIG5vcm1hbGl6ZUNoaWxkTm9kZXMocGFyZW50RG9tKTtcbiAgICB2YXIgZG9tID0gcGFyZW50RG9tLmZpcnN0Q2hpbGQ7XG4gICAgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKCFpc051bGwoY2hpbGQpICYmIGlzT2JqZWN0KGNoaWxkKSkge1xuICAgICAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tID0gaHlkcmF0ZShjaGlsZCwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgICAgICAgICAgICAgZG9tID0gZG9tLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbW91bnQoY2hpbGQsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzU3RyaW5nT3JOdW1iZXIoY2hpbGRyZW4pKSB7XG4gICAgICAgIGlmIChkb20gJiYgZG9tLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgICBpZiAoZG9tLm5vZGVWYWx1ZSAhPT0gY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBkb20ubm9kZVZhbHVlID0gY2hpbGRyZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHBhcmVudERvbS50ZXh0Q29udGVudCA9IGNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIGRvbSA9IGRvbS5uZXh0U2libGluZztcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNPYmplY3QoY2hpbGRyZW4pKSB7XG4gICAgICAgIGh5ZHJhdGUoY2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIGRvbSA9IGRvbS5uZXh0U2libGluZztcbiAgICB9XG4gICAgLy8gY2xlYXIgYW55IG90aGVyIERPTSBub2RlcywgdGhlcmUgc2hvdWxkIGJlIG9ubHkgYSBzaW5nbGUgZW50cnkgZm9yIHRoZSByb290XG4gICAgd2hpbGUgKGRvbSkge1xuICAgICAgICB2YXIgbmV4dFNpYmxpbmcgPSBkb20ubmV4dFNpYmxpbmc7XG4gICAgICAgIHBhcmVudERvbS5yZW1vdmVDaGlsZChkb20pO1xuICAgICAgICBkb20gPSBuZXh0U2libGluZztcbiAgICB9XG59XG5mdW5jdGlvbiBoeWRyYXRlVGV4dCh2Tm9kZSwgZG9tKSB7XG4gICAgaWYgKGRvbS5ub2RlVHlwZSAhPT0gMykge1xuICAgICAgICB2YXIgbmV3RG9tID0gbW91bnRUZXh0KHZOb2RlLCBudWxsKTtcbiAgICAgICAgdk5vZGUuZG9tID0gbmV3RG9tO1xuICAgICAgICByZXBsYWNlQ2hpbGQoZG9tLnBhcmVudE5vZGUsIG5ld0RvbSwgZG9tKTtcbiAgICAgICAgcmV0dXJuIG5ld0RvbTtcbiAgICB9XG4gICAgdmFyIHRleHQgPSB2Tm9kZS5jaGlsZHJlbjtcbiAgICBpZiAoZG9tLm5vZGVWYWx1ZSAhPT0gdGV4dCkge1xuICAgICAgICBkb20ubm9kZVZhbHVlID0gdGV4dDtcbiAgICB9XG4gICAgdk5vZGUuZG9tID0gZG9tO1xuICAgIHJldHVybiBkb207XG59XG5mdW5jdGlvbiBoeWRyYXRlVm9pZCh2Tm9kZSwgZG9tKSB7XG4gICAgdk5vZGUuZG9tID0gZG9tO1xuICAgIHJldHVybiBkb207XG59XG5mdW5jdGlvbiBoeWRyYXRlKHZOb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpIHtcbiAgICB2YXIgZmxhZ3MgPSB2Tm9kZS5mbGFncztcbiAgICBpZiAoZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgcmV0dXJuIGh5ZHJhdGVDb21wb25lbnQodk5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgZmxhZ3MgJiA0IC8qIENvbXBvbmVudENsYXNzICovKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmxhZ3MgJiAzOTcwIC8qIEVsZW1lbnQgKi8pIHtcbiAgICAgICAgcmV0dXJuIGh5ZHJhdGVFbGVtZW50KHZOb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgIH1cbiAgICBlbHNlIGlmIChmbGFncyAmIDEgLyogVGV4dCAqLykge1xuICAgICAgICByZXR1cm4gaHlkcmF0ZVRleHQodk5vZGUsIGRvbSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZsYWdzICYgNDA5NiAvKiBWb2lkICovKSB7XG4gICAgICAgIHJldHVybiBoeWRyYXRlVm9pZCh2Tm9kZSwgZG9tKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKChcImh5ZHJhdGUoKSBleHBlY3RzIGEgdmFsaWQgVk5vZGUsIGluc3RlYWQgaXQgcmVjZWl2ZWQgYW4gb2JqZWN0IHdpdGggdGhlIHR5cGUgXFxcIlwiICsgKHR5cGVvZiB2Tm9kZSkgKyBcIlxcXCIuXCIpKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gaHlkcmF0ZVJvb3QoaW5wdXQsIHBhcmVudERvbSwgbGlmZWN5Y2xlKSB7XG4gICAgdmFyIGRvbSA9IHBhcmVudERvbSAmJiBwYXJlbnREb20uZmlyc3RDaGlsZDtcbiAgICBpZiAoZG9tKSB7XG4gICAgICAgIGh5ZHJhdGUoaW5wdXQsIGRvbSwgbGlmZWN5Y2xlLCB7fSwgZmFsc2UpO1xuICAgICAgICBkb20gPSBwYXJlbnREb20uZmlyc3RDaGlsZDtcbiAgICAgICAgLy8gY2xlYXIgYW55IG90aGVyIERPTSBub2RlcywgdGhlcmUgc2hvdWxkIGJlIG9ubHkgYSBzaW5nbGUgZW50cnkgZm9yIHRoZSByb290XG4gICAgICAgIHdoaWxlIChkb20gPSBkb20ubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIHBhcmVudERvbS5yZW1vdmVDaGlsZChkb20pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIHJhdGhlciB0aGFuIHVzZSBhIE1hcCwgbGlrZSB3ZSBkaWQgYmVmb3JlLCB3ZSBjYW4gdXNlIGFuIGFycmF5IGhlcmVcbi8vIGdpdmVuIHRoZXJlIHNob3VsZG4ndCBiZSBUSEFUIG1hbnkgcm9vdHMgb24gdGhlIHBhZ2UsIHRoZSBkaWZmZXJlbmNlXG4vLyBpbiBwZXJmb3JtYW5jZSBpcyBodWdlOiBodHRwczovL2VzYmVuY2guY29tL2JlbmNoLzU4MDJhNjkxMzMwYWIwOTkwMGExYTJkYVxudmFyIHJvb3RzID0gW107XG52YXIgY29tcG9uZW50VG9ET01Ob2RlTWFwID0gbmV3IE1hcCgpO1xub3B0aW9ucy5yb290cyA9IHJvb3RzO1xuZnVuY3Rpb24gZmluZERPTU5vZGUocmVmKSB7XG4gICAgaWYgKCFvcHRpb25zLmZpbmRET01Ob2RlRW5hYmxlZCkge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcignZmluZERPTU5vZGUoKSBoYXMgYmVlbiBkaXNhYmxlZCwgdXNlIEluZmVybm8ub3B0aW9ucy5maW5kRE9NTm9kZUVuYWJsZWQgPSB0cnVlOyBlbmFibGVkIGZpbmRET01Ob2RlKCkuIFdhcm5pbmcgdGhpcyBjYW4gc2lnbmlmaWNhbnRseSBpbXBhY3QgcGVyZm9ybWFuY2UhJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgZG9tID0gcmVmICYmIHJlZi5ub2RlVHlwZSA/IHJlZiA6IG51bGw7XG4gICAgcmV0dXJuIGNvbXBvbmVudFRvRE9NTm9kZU1hcC5nZXQocmVmKSB8fCBkb207XG59XG5mdW5jdGlvbiBnZXRSb290KGRvbSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJvb3QgPSByb290c1tpXTtcbiAgICAgICAgaWYgKHJvb3QuZG9tID09PSBkb20pIHtcbiAgICAgICAgICAgIHJldHVybiByb290O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gc2V0Um9vdChkb20sIGlucHV0LCBsaWZlY3ljbGUpIHtcbiAgICB2YXIgcm9vdCA9IHtcbiAgICAgICAgZG9tOiBkb20sXG4gICAgICAgIGlucHV0OiBpbnB1dCxcbiAgICAgICAgbGlmZWN5Y2xlOiBsaWZlY3ljbGUsXG4gICAgfTtcbiAgICByb290cy5wdXNoKHJvb3QpO1xuICAgIHJldHVybiByb290O1xufVxuZnVuY3Rpb24gcmVtb3ZlUm9vdChyb290KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb290cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocm9vdHNbaV0gPT09IHJvb3QpIHtcbiAgICAgICAgICAgIHJvb3RzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgaWYgKGlzQnJvd3NlciAmJiBkb2N1bWVudC5ib2R5ID09PSBudWxsKSB7XG4gICAgICAgIHdhcm5pbmcoZmFsc2UsICdJbmZlcm5vIHdhcm5pbmc6IHlvdSBjYW5ub3QgaW5pdGlhbGl6ZSBpbmZlcm5vIHdpdGhvdXQgXCJkb2N1bWVudC5ib2R5XCIuIFdhaXQgb24gXCJET01Db250ZW50TG9hZGVkXCIgZXZlbnQsIGFkZCBzY3JpcHQgdG8gYm90dG9tIG9mIGJvZHksIG9yIHVzZSBhc3luYy9kZWZlciBhdHRyaWJ1dGVzIG9uIHNjcmlwdCB0YWcuJyk7XG4gICAgfVxufVxudmFyIGRvY3VtZW50Qm9keSA9IGlzQnJvd3NlciA/IGRvY3VtZW50LmJvZHkgOiBudWxsO1xuZnVuY3Rpb24gcmVuZGVyKGlucHV0LCBwYXJlbnREb20pIHtcbiAgICBpZiAoZG9jdW1lbnRCb2R5ID09PSBwYXJlbnREb20pIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ3lvdSBjYW5ub3QgcmVuZGVyKCkgdG8gdGhlIFwiZG9jdW1lbnQuYm9keVwiLiBVc2UgYW4gZW1wdHkgZWxlbWVudCBhcyBhIGNvbnRhaW5lciBpbnN0ZWFkLicpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKGlucHV0ID09PSBOT19PUCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByb290ID0gZ2V0Um9vdChwYXJlbnREb20pO1xuICAgIGlmIChpc051bGwocm9vdCkpIHtcbiAgICAgICAgdmFyIGxpZmVjeWNsZSA9IG5ldyBMaWZlY3ljbGUoKTtcbiAgICAgICAgaWYgKCFpc0ludmFsaWQoaW5wdXQpKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZG9tKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBjbG9uZVZOb2RlKGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaHlkcmF0ZVJvb3QoaW5wdXQsIHBhcmVudERvbSwgbGlmZWN5Y2xlKSkge1xuICAgICAgICAgICAgICAgIG1vdW50KGlucHV0LCBwYXJlbnREb20sIGxpZmVjeWNsZSwge30sIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJvb3QgPSBzZXRSb290KHBhcmVudERvbSwgaW5wdXQsIGxpZmVjeWNsZSk7XG4gICAgICAgICAgICBsaWZlY3ljbGUudHJpZ2dlcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgbGlmZWN5Y2xlJDEgPSByb290LmxpZmVjeWNsZTtcbiAgICAgICAgbGlmZWN5Y2xlJDEubGlzdGVuZXJzID0gW107XG4gICAgICAgIGlmIChpc051bGxPclVuZGVmKGlucHV0KSkge1xuICAgICAgICAgICAgdW5tb3VudChyb290LmlucHV0LCBwYXJlbnREb20sIGxpZmVjeWNsZSQxLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgICAgcmVtb3ZlUm9vdChyb290KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5kb20pIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGNsb25lVk5vZGUoaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0Y2gocm9vdC5pbnB1dCwgaW5wdXQsIHBhcmVudERvbSwgbGlmZWN5Y2xlJDEsIHt9LCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGxpZmVjeWNsZSQxLnRyaWdnZXIoKTtcbiAgICAgICAgcm9vdC5pbnB1dCA9IGlucHV0O1xuICAgIH1cbiAgICBpZiAocm9vdCkge1xuICAgICAgICB2YXIgcm9vdElucHV0ID0gcm9vdC5pbnB1dDtcbiAgICAgICAgaWYgKHJvb3RJbnB1dCAmJiAocm9vdElucHV0LmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb3RJbnB1dC5jaGlsZHJlbjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKF9wYXJlbnREb20pIHtcbiAgICB2YXIgcGFyZW50RG9tID0gX3BhcmVudERvbSB8fCBudWxsO1xuICAgIHJldHVybiBmdW5jdGlvbiByZW5kZXJlcihsYXN0SW5wdXQsIG5leHRJbnB1dCkge1xuICAgICAgICBpZiAoIXBhcmVudERvbSkge1xuICAgICAgICAgICAgcGFyZW50RG9tID0gbGFzdElucHV0O1xuICAgICAgICB9XG4gICAgICAgIHJlbmRlcihuZXh0SW5wdXQsIHBhcmVudERvbSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gbGlua0V2ZW50KGRhdGEsIGV2ZW50KSB7XG4gICAgcmV0dXJuIHsgZGF0YTogZGF0YSwgZXZlbnQ6IGV2ZW50IH07XG59XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG5cdE9iamVjdC5mcmVlemUoRU1QVFlfT0JKKTtcblx0dmFyIHRlc3RGdW5jID0gZnVuY3Rpb24gdGVzdEZuKCkge307XG5cdHdhcm5pbmcoXG5cdFx0KHRlc3RGdW5jLm5hbWUgfHwgdGVzdEZ1bmMudG9TdHJpbmcoKSkuaW5kZXhPZigndGVzdEZuJykgIT09IC0xLFxuXHRcdCdJdCBsb29rcyBsaWtlIHlvdVxcJ3JlIHVzaW5nIGEgbWluaWZpZWQgY29weSBvZiB0aGUgZGV2ZWxvcG1lbnQgYnVpbGQgJyArXG5cdFx0J29mIEluZmVybm8uIFdoZW4gZGVwbG95aW5nIEluZmVybm8gYXBwcyB0byBwcm9kdWN0aW9uLCBtYWtlIHN1cmUgdG8gdXNlICcgK1xuXHRcdCd0aGUgcHJvZHVjdGlvbiBidWlsZCB3aGljaCBza2lwcyBkZXZlbG9wbWVudCB3YXJuaW5ncyBhbmQgaXMgZmFzdGVyLiAnICtcblx0XHQnU2VlIGh0dHA6Ly9pbmZlcm5vanMub3JnIGZvciBtb3JlIGRldGFpbHMuJ1xuXHQpO1xufVxuXG4vLyBUaGlzIHdpbGwgYmUgcmVwbGFjZWQgYnkgcm9sbHVwXG52YXIgdmVyc2lvbiA9ICcxLjIuMSc7XG5cbi8vIHdlIGR1cGxpY2F0ZSBpdCBzbyBpdCBwbGF5cyBuaWNlbHkgd2l0aCBkaWZmZXJlbnQgbW9kdWxlIGxvYWRpbmcgc3lzdGVtc1xudmFyIGluZGV4ID0ge1xuXHRsaW5rRXZlbnQ6IGxpbmtFdmVudCxcblx0Ly8gY29yZSBzaGFwZXNcblx0Y3JlYXRlVk5vZGU6IGNyZWF0ZVZOb2RlLFxuXG5cdC8vIGNsb25pbmdcblx0Y2xvbmVWTm9kZTogY2xvbmVWTm9kZSxcblxuXHQvLyB1c2VkIHRvIHNoYXJlZCBjb21tb24gaXRlbXMgYmV0d2VlbiBJbmZlcm5vIGxpYnNcblx0Tk9fT1A6IE5PX09QLFxuXHRFTVBUWV9PQko6IEVNUFRZX09CSixcblxuXHQvLyBET01cblx0cmVuZGVyOiByZW5kZXIsXG5cdGZpbmRET01Ob2RlOiBmaW5kRE9NTm9kZSxcblx0Y3JlYXRlUmVuZGVyZXI6IGNyZWF0ZVJlbmRlcmVyLFxuXHRvcHRpb25zOiBvcHRpb25zLFxuXHR2ZXJzaW9uOiB2ZXJzaW9uXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBpbmRleDtcbmV4cG9ydHMubGlua0V2ZW50ID0gbGlua0V2ZW50O1xuZXhwb3J0cy5jcmVhdGVWTm9kZSA9IGNyZWF0ZVZOb2RlO1xuZXhwb3J0cy5jbG9uZVZOb2RlID0gY2xvbmVWTm9kZTtcbmV4cG9ydHMuTk9fT1AgPSBOT19PUDtcbmV4cG9ydHMuRU1QVFlfT0JKID0gRU1QVFlfT0JKO1xuZXhwb3J0cy5yZW5kZXIgPSByZW5kZXI7XG5leHBvcnRzLmZpbmRET01Ob2RlID0gZmluZERPTU5vZGU7XG5leHBvcnRzLmNyZWF0ZVJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXI7XG5leHBvcnRzLm9wdGlvbnMgPSBvcHRpb25zO1xuZXhwb3J0cy52ZXJzaW9uID0gdmVyc2lvbjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kaXN0L2luZmVybm8ubm9kZScpO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzOyIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsb2FkIChzcmMsIG9wdHMsIGNiKSB7XG4gIHZhciBoZWFkID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdXG4gIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuXG4gIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0c1xuICAgIG9wdHMgPSB7fVxuICB9XG5cbiAgb3B0cyA9IG9wdHMgfHwge31cbiAgY2IgPSBjYiB8fCBmdW5jdGlvbigpIHt9XG5cbiAgc2NyaXB0LnR5cGUgPSBvcHRzLnR5cGUgfHwgJ3RleHQvamF2YXNjcmlwdCdcbiAgc2NyaXB0LmNoYXJzZXQgPSBvcHRzLmNoYXJzZXQgfHwgJ3V0ZjgnO1xuICBzY3JpcHQuYXN5bmMgPSAnYXN5bmMnIGluIG9wdHMgPyAhIW9wdHMuYXN5bmMgOiB0cnVlXG4gIHNjcmlwdC5zcmMgPSBzcmNcblxuICBpZiAob3B0cy5hdHRycykge1xuICAgIHNldEF0dHJpYnV0ZXMoc2NyaXB0LCBvcHRzLmF0dHJzKVxuICB9XG5cbiAgaWYgKG9wdHMudGV4dCkge1xuICAgIHNjcmlwdC50ZXh0ID0gJycgKyBvcHRzLnRleHRcbiAgfVxuXG4gIHZhciBvbmVuZCA9ICdvbmxvYWQnIGluIHNjcmlwdCA/IHN0ZE9uRW5kIDogaWVPbkVuZFxuICBvbmVuZChzY3JpcHQsIGNiKVxuXG4gIC8vIHNvbWUgZ29vZCBsZWdhY3kgYnJvd3NlcnMgKGZpcmVmb3gpIGZhaWwgdGhlICdpbicgZGV0ZWN0aW9uIGFib3ZlXG4gIC8vIHNvIGFzIGEgZmFsbGJhY2sgd2UgYWx3YXlzIHNldCBvbmxvYWRcbiAgLy8gb2xkIElFIHdpbGwgaWdub3JlIHRoaXMgYW5kIG5ldyBJRSB3aWxsIHNldCBvbmxvYWRcbiAgaWYgKCFzY3JpcHQub25sb2FkKSB7XG4gICAgc3RkT25FbmQoc2NyaXB0LCBjYik7XG4gIH1cblxuICBoZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhzY3JpcHQsIGF0dHJzKSB7XG4gIGZvciAodmFyIGF0dHIgaW4gYXR0cnMpIHtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJzW2F0dHJdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGRPbkVuZCAoc2NyaXB0LCBjYikge1xuICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25lcnJvciA9IHRoaXMub25sb2FkID0gbnVsbFxuICAgIGNiKG51bGwsIHNjcmlwdClcbiAgfVxuICBzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB0aGlzLm9ubG9hZCA9IG51bGwgaGVyZSBpcyBuZWNlc3NhcnlcbiAgICAvLyBiZWNhdXNlIGV2ZW4gSUU5IHdvcmtzIG5vdCBsaWtlIG90aGVyc1xuICAgIHRoaXMub25lcnJvciA9IHRoaXMub25sb2FkID0gbnVsbFxuICAgIGNiKG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgJyArIHRoaXMuc3JjKSwgc2NyaXB0KVxuICB9XG59XG5cbmZ1bmN0aW9uIGllT25FbmQgKHNjcmlwdCwgY2IpIHtcbiAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9ICdjb21wbGV0ZScgJiYgdGhpcy5yZWFkeVN0YXRlICE9ICdsb2FkZWQnKSByZXR1cm5cbiAgICB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGxcbiAgICBjYihudWxsLCBzY3JpcHQpIC8vIHRoZXJlIGlzIG5vIHdheSB0byBjYXRjaCBsb2FkaW5nIGVycm9ycyBpbiBJRThcbiAgfVxufVxuIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICByZXN1bHQgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nID8gbmF0aXZlTWluKHJlc3VsdCwgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRocm90dGxlZCBmdW5jdGlvbiB0aGF0IG9ubHkgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmNlIHBlclxuICogZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGBcbiAqIG1ldGhvZCB0byBjYW5jZWwgZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG9cbiAqIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYFxuICogc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YFxuICogdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZVxuICogdGhyb3R0bGVkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gcmV0dXJuIHRoZVxuICogcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLnRocm90dGxlYCBhbmQgYF8uZGVib3VuY2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCkpO1xuICpcbiAqIC8vIEludm9rZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzLlxuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7ICd0cmFpbGluZyc6IGZhbHNlIH0pO1xuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIHRocm90dGxlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyB0aHJvdHRsZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRocm90dGxlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwge1xuICAgICdsZWFkaW5nJzogbGVhZGluZyxcbiAgICAnbWF4V2FpdCc6IHdhaXQsXG4gICAgJ3RyYWlsaW5nJzogdHJhaWxpbmdcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVUcmltLCAnJyk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUVhY2g7XG4iLCJ2YXIgYmFzZVRpbWVzID0gcmVxdWlyZSgnLi9fYmFzZVRpbWVzJyksXG4gICAgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL19pc0luZGV4JyksXG4gICAgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pc1R5cGVkQXJyYXknKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBhcnJheS1saWtlIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSBpbmhlcml0ZWQgU3BlY2lmeSByZXR1cm5pbmcgaW5oZXJpdGVkIHByb3BlcnR5IG5hbWVzLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlS2V5cyh2YWx1ZSwgaW5oZXJpdGVkKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHModmFsdWUpLFxuICAgICAgaXNCdWZmID0gIWlzQXJyICYmICFpc0FyZyAmJiBpc0J1ZmZlcih2YWx1ZSksXG4gICAgICBpc1R5cGUgPSAhaXNBcnIgJiYgIWlzQXJnICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gYmFzZVRpbWVzKHZhbHVlLmxlbmd0aCwgU3RyaW5nKSA6IFtdLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZiAoKGluaGVyaXRlZCB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIGlzSW5kZXgoa2V5LCBsZW5ndGgpXG4gICAgICAgICkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TGlrZUtleXM7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5tYXBgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlNYXAoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TWFwO1xuIiwiLyoqXG4gKiBDb252ZXJ0cyBhbiBBU0NJSSBgc3RyaW5nYCB0byBhbiBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXNjaWlUb0FycmF5KHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnNwbGl0KCcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc2NpaVRvQXJyYXk7XG4iLCJ2YXIgYmFzZUZvck93biA9IHJlcXVpcmUoJy4vX2Jhc2VGb3JPd24nKSxcbiAgICBjcmVhdGVCYXNlRWFjaCA9IHJlcXVpcmUoJy4vX2NyZWF0ZUJhc2VFYWNoJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yRWFjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKi9cbnZhciBiYXNlRWFjaCA9IGNyZWF0ZUJhc2VFYWNoKGJhc2VGb3JPd24pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VFYWNoO1xuIiwidmFyIGNyZWF0ZUJhc2VGb3IgPSByZXF1aXJlKCcuL19jcmVhdGVCYXNlRm9yJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGJhc2VGb3JPd25gIHdoaWNoIGl0ZXJhdGVzIG92ZXIgYG9iamVjdGBcbiAqIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgYGtleXNGdW5jYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG52YXIgYmFzZUZvciA9IGNyZWF0ZUJhc2VGb3IoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRm9yO1xuIiwidmFyIGJhc2VGb3IgPSByZXF1aXJlKCcuL19iYXNlRm9yJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUZvck93bjtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0FyZ3VtZW50cztcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNUeXBlZEFycmF5O1xuIiwidmFyIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKSxcbiAgICBuYXRpdmVLZXlzID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5cycpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIGlmICghaXNQcm90b3R5cGUob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYga2V5ICE9ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXM7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnNsaWNlYCB3aXRob3V0IGFuIGl0ZXJhdGVlIGNhbGwgZ3VhcmQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzbGljZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9MF0gVGhlIHN0YXJ0IHBvc2l0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtlbmQ9YXJyYXkubGVuZ3RoXSBUaGUgZW5kIHBvc2l0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBzbGljZSBvZiBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBiYXNlU2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gLXN0YXJ0ID4gbGVuZ3RoID8gMCA6IChsZW5ndGggKyBzdGFydCk7XG4gIH1cbiAgZW5kID0gZW5kID4gbGVuZ3RoID8gbGVuZ3RoIDogZW5kO1xuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5ndGg7XG4gIH1cbiAgbGVuZ3RoID0gc3RhcnQgPiBlbmQgPyAwIDogKChlbmQgLSBzdGFydCkgPj4+IDApO1xuICBzdGFydCA+Pj49IDA7XG5cbiAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W2luZGV4ICsgc3RhcnRdO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVNsaWNlO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVGltZXM7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgYXJyYXlNYXAgPSByZXF1aXJlKCcuL19hcnJheU1hcCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBjb252ZXJ0IHZhbHVlcyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHJldHVybiBhcnJheU1hcCh2YWx1ZSwgYmFzZVRvU3RyaW5nKSArICcnO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVG9TdHJpbmc7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVVuYXJ5O1xuIiwidmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eScpO1xuXG4vKipcbiAqIENhc3RzIGB2YWx1ZWAgdG8gYGlkZW50aXR5YCBpZiBpdCdzIG5vdCBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGNhc3QgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNhc3RGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicgPyB2YWx1ZSA6IGlkZW50aXR5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNhc3RGdW5jdGlvbjtcbiIsInZhciBiYXNlU2xpY2UgPSByZXF1aXJlKCcuL19iYXNlU2xpY2UnKTtcblxuLyoqXG4gKiBDYXN0cyBgYXJyYXlgIHRvIGEgc2xpY2UgaWYgaXQncyBuZWVkZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IFRoZSBzdGFydCBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kPWFycmF5Lmxlbmd0aF0gVGhlIGVuZCBwb3NpdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY2FzdCBzbGljZS5cbiAqL1xuZnVuY3Rpb24gY2FzdFNsaWNlKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogZW5kO1xuICByZXR1cm4gKCFzdGFydCAmJiBlbmQgPj0gbGVuZ3RoKSA/IGFycmF5IDogYmFzZVNsaWNlKGFycmF5LCBzdGFydCwgZW5kKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYXN0U2xpY2U7XG4iLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBiYXNlRWFjaGAgb3IgYGJhc2VFYWNoUmlnaHRgIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlYWNoRnVuYyBUaGUgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGEgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUVhY2goZWFjaEZ1bmMsIGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5TGlrZShjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIGVhY2hGdW5jKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IGZyb21SaWdodCA/IGxlbmd0aCA6IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChjb2xsZWN0aW9uKTtcblxuICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQmFzZUVhY2g7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBiYXNlIGZ1bmN0aW9uIGZvciBtZXRob2RzIGxpa2UgYF8uZm9ySW5gIGFuZCBgXy5mb3JPd25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VGb3IoZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzRnVuYykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChvYmplY3QpLFxuICAgICAgICBwcm9wcyA9IGtleXNGdW5jKG9iamVjdCksXG4gICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgdmFyIGtleSA9IHByb3BzW2Zyb21SaWdodCA/IGxlbmd0aCA6ICsraW5kZXhdO1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2tleV0sIGtleSwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVCYXNlRm9yO1xuIiwidmFyIGNhc3RTbGljZSA9IHJlcXVpcmUoJy4vX2Nhc3RTbGljZScpLFxuICAgIGhhc1VuaWNvZGUgPSByZXF1aXJlKCcuL19oYXNVbmljb2RlJyksXG4gICAgc3RyaW5nVG9BcnJheSA9IHJlcXVpcmUoJy4vX3N0cmluZ1RvQXJyYXknKSxcbiAgICB0b1N0cmluZyA9IHJlcXVpcmUoJy4vdG9TdHJpbmcnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gbGlrZSBgXy5sb3dlckZpcnN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZE5hbWUgVGhlIG5hbWUgb2YgdGhlIGBTdHJpbmdgIGNhc2UgbWV0aG9kIHRvIHVzZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNhc2VGaXJzdChtZXRob2ROYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICBzdHJpbmcgPSB0b1N0cmluZyhzdHJpbmcpO1xuXG4gICAgdmFyIHN0clN5bWJvbHMgPSBoYXNVbmljb2RlKHN0cmluZylcbiAgICAgID8gc3RyaW5nVG9BcnJheShzdHJpbmcpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIHZhciBjaHIgPSBzdHJTeW1ib2xzXG4gICAgICA/IHN0clN5bWJvbHNbMF1cbiAgICAgIDogc3RyaW5nLmNoYXJBdCgwKTtcblxuICAgIHZhciB0cmFpbGluZyA9IHN0clN5bWJvbHNcbiAgICAgID8gY2FzdFNsaWNlKHN0clN5bWJvbHMsIDEpLmpvaW4oJycpXG4gICAgICA6IHN0cmluZy5zbGljZSgxKTtcblxuICAgIHJldHVybiBjaHJbbWV0aG9kTmFtZV0oKSArIHRyYWlsaW5nO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNhc2VGaXJzdDtcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJlZUdsb2JhbDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjaGFyYWN0ZXIgY2xhc3Nlcy4gKi9cbnZhciByc0FzdHJhbFJhbmdlID0gJ1xcXFx1ZDgwMC1cXFxcdWRmZmYnLFxuICAgIHJzQ29tYm9NYXJrc1JhbmdlID0gJ1xcXFx1MDMwMC1cXFxcdTAzNmYnLFxuICAgIHJlQ29tYm9IYWxmTWFya3NSYW5nZSA9ICdcXFxcdWZlMjAtXFxcXHVmZTJmJyxcbiAgICByc0NvbWJvU3ltYm9sc1JhbmdlID0gJ1xcXFx1MjBkMC1cXFxcdTIwZmYnLFxuICAgIHJzQ29tYm9SYW5nZSA9IHJzQ29tYm9NYXJrc1JhbmdlICsgcmVDb21ib0hhbGZNYXJrc1JhbmdlICsgcnNDb21ib1N5bWJvbHNSYW5nZSxcbiAgICByc1ZhclJhbmdlID0gJ1xcXFx1ZmUwZVxcXFx1ZmUwZic7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjYXB0dXJlIGdyb3Vwcy4gKi9cbnZhciByc1pXSiA9ICdcXFxcdTIwMGQnO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgc3RyaW5ncyB3aXRoIFt6ZXJvLXdpZHRoIGpvaW5lcnMgb3IgY29kZSBwb2ludHMgZnJvbSB0aGUgYXN0cmFsIHBsYW5lc10oaHR0cDovL2Vldi5lZS9ibG9nLzIwMTUvMDkvMTIvZGFyay1jb3JuZXJzLW9mLXVuaWNvZGUvKS4gKi9cbnZhciByZUhhc1VuaWNvZGUgPSBSZWdFeHAoJ1snICsgcnNaV0ogKyByc0FzdHJhbFJhbmdlICArIHJzQ29tYm9SYW5nZSArIHJzVmFyUmFuZ2UgKyAnXScpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgc3RyaW5nYCBjb250YWlucyBVbmljb2RlIHN5bWJvbHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBpbnNwZWN0LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGEgc3ltYm9sIGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc1VuaWNvZGUoc3RyaW5nKSB7XG4gIHJldHVybiByZUhhc1VuaWNvZGUudGVzdChzdHJpbmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc1VuaWNvZGU7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8IHJlSXNVaW50LnRlc3QodmFsdWUpKSAmJlxuICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0luZGV4O1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUHJvdG90eXBlO1xuIiwidmFyIG92ZXJBcmcgPSByZXF1aXJlKCcuL19vdmVyQXJnJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVLZXlzID0gb3ZlckFyZyhPYmplY3Qua2V5cywgT2JqZWN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVLZXlzO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlVXRpbDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlckFyZztcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiIsInZhciBhc2NpaVRvQXJyYXkgPSByZXF1aXJlKCcuL19hc2NpaVRvQXJyYXknKSxcbiAgICBoYXNVbmljb2RlID0gcmVxdWlyZSgnLi9faGFzVW5pY29kZScpLFxuICAgIHVuaWNvZGVUb0FycmF5ID0gcmVxdWlyZSgnLi9fdW5pY29kZVRvQXJyYXknKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBgc3RyaW5nYCB0byBhbiBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gc3RyaW5nVG9BcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIGhhc1VuaWNvZGUoc3RyaW5nKVxuICAgID8gdW5pY29kZVRvQXJyYXkoc3RyaW5nKVxuICAgIDogYXNjaWlUb0FycmF5KHN0cmluZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RyaW5nVG9BcnJheTtcbiIsIi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjaGFyYWN0ZXIgY2xhc3Nlcy4gKi9cbnZhciByc0FzdHJhbFJhbmdlID0gJ1xcXFx1ZDgwMC1cXFxcdWRmZmYnLFxuICAgIHJzQ29tYm9NYXJrc1JhbmdlID0gJ1xcXFx1MDMwMC1cXFxcdTAzNmYnLFxuICAgIHJlQ29tYm9IYWxmTWFya3NSYW5nZSA9ICdcXFxcdWZlMjAtXFxcXHVmZTJmJyxcbiAgICByc0NvbWJvU3ltYm9sc1JhbmdlID0gJ1xcXFx1MjBkMC1cXFxcdTIwZmYnLFxuICAgIHJzQ29tYm9SYW5nZSA9IHJzQ29tYm9NYXJrc1JhbmdlICsgcmVDb21ib0hhbGZNYXJrc1JhbmdlICsgcnNDb21ib1N5bWJvbHNSYW5nZSxcbiAgICByc1ZhclJhbmdlID0gJ1xcXFx1ZmUwZVxcXFx1ZmUwZic7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjYXB0dXJlIGdyb3Vwcy4gKi9cbnZhciByc0FzdHJhbCA9ICdbJyArIHJzQXN0cmFsUmFuZ2UgKyAnXScsXG4gICAgcnNDb21ibyA9ICdbJyArIHJzQ29tYm9SYW5nZSArICddJyxcbiAgICByc0ZpdHogPSAnXFxcXHVkODNjW1xcXFx1ZGZmYi1cXFxcdWRmZmZdJyxcbiAgICByc01vZGlmaWVyID0gJyg/OicgKyByc0NvbWJvICsgJ3wnICsgcnNGaXR6ICsgJyknLFxuICAgIHJzTm9uQXN0cmFsID0gJ1teJyArIHJzQXN0cmFsUmFuZ2UgKyAnXScsXG4gICAgcnNSZWdpb25hbCA9ICcoPzpcXFxcdWQ4M2NbXFxcXHVkZGU2LVxcXFx1ZGRmZl0pezJ9JyxcbiAgICByc1N1cnJQYWlyID0gJ1tcXFxcdWQ4MDAtXFxcXHVkYmZmXVtcXFxcdWRjMDAtXFxcXHVkZmZmXScsXG4gICAgcnNaV0ogPSAnXFxcXHUyMDBkJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIHJlZ2V4ZXMuICovXG52YXIgcmVPcHRNb2QgPSByc01vZGlmaWVyICsgJz8nLFxuICAgIHJzT3B0VmFyID0gJ1snICsgcnNWYXJSYW5nZSArICddPycsXG4gICAgcnNPcHRKb2luID0gJyg/OicgKyByc1pXSiArICcoPzonICsgW3JzTm9uQXN0cmFsLCByc1JlZ2lvbmFsLCByc1N1cnJQYWlyXS5qb2luKCd8JykgKyAnKScgKyByc09wdFZhciArIHJlT3B0TW9kICsgJykqJyxcbiAgICByc1NlcSA9IHJzT3B0VmFyICsgcmVPcHRNb2QgKyByc09wdEpvaW4sXG4gICAgcnNTeW1ib2wgPSAnKD86JyArIFtyc05vbkFzdHJhbCArIHJzQ29tYm8gKyAnPycsIHJzQ29tYm8sIHJzUmVnaW9uYWwsIHJzU3VyclBhaXIsIHJzQXN0cmFsXS5qb2luKCd8JykgKyAnKSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIFtzdHJpbmcgc3ltYm9sc10oaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtdW5pY29kZSkuICovXG52YXIgcmVVbmljb2RlID0gUmVnRXhwKHJzRml0eiArICcoPz0nICsgcnNGaXR6ICsgJyl8JyArIHJzU3ltYm9sICsgcnNTZXEsICdnJyk7XG5cbi8qKlxuICogQ29udmVydHMgYSBVbmljb2RlIGBzdHJpbmdgIHRvIGFuIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY29udmVydGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiB1bmljb2RlVG9BcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5tYXRjaChyZVVuaWNvZGUpIHx8IFtdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVuaWNvZGVUb0FycmF5O1xuIiwidmFyIGFycmF5RWFjaCA9IHJlcXVpcmUoJy4vX2FycmF5RWFjaCcpLFxuICAgIGJhc2VFYWNoID0gcmVxdWlyZSgnLi9fYmFzZUVhY2gnKSxcbiAgICBjYXN0RnVuY3Rpb24gPSByZXF1aXJlKCcuL19jYXN0RnVuY3Rpb24nKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5Jyk7XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBlbGVtZW50cyBvZiBgY29sbGVjdGlvbmAgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBlbGVtZW50LlxuICogVGhlIGl0ZXJhdGVlIGlzIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiAqKk5vdGU6KiogQXMgd2l0aCBvdGhlciBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcywgb2JqZWN0cyB3aXRoIGEgXCJsZW5ndGhcIlxuICogcHJvcGVydHkgYXJlIGl0ZXJhdGVkIGxpa2UgYXJyYXlzLiBUbyBhdm9pZCB0aGlzIGJlaGF2aW9yIHVzZSBgXy5mb3JJbmBcbiAqIG9yIGBfLmZvck93bmAgZm9yIG9iamVjdCBpdGVyYXRpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGFsaWFzIGVhY2hcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICogQHNlZSBfLmZvckVhY2hSaWdodFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZvckVhY2goWzEsIDJdLCBmdW5jdGlvbih2YWx1ZSkge1xuICogICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgYDFgIHRoZW4gYDJgLlxuICpcbiAqIF8uZm9yRWFjaCh7ICdhJzogMSwgJ2InOiAyIH0sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAqICAgY29uc29sZS5sb2coa2V5KTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyAnYScgdGhlbiAnYicgKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCkuXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2goY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGZ1bmMgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gYXJyYXlFYWNoIDogYmFzZUVhY2g7XG4gIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGNhc3RGdW5jdGlvbihpdGVyYXRlZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2g7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuIiwidmFyIGJhc2VJc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vX2Jhc2VJc0FyZ3VtZW50cycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FyZ3VtZW50cyA9IGJhc2VJc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA/IGJhc2VJc0FyZ3VtZW50cyA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJlxuICAgICFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJndW1lbnRzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290JyksXG4gICAgc3R1YkZhbHNlID0gcmVxdWlyZSgnLi9zdHViRmFsc2UnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmZmVyO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN0cmluZ2AgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN0cmluZywgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3RyaW5nKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3RyaW5nKDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fFxuICAgICghaXNBcnJheSh2YWx1ZSkgJiYgaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzdHJpbmdUYWcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaW5nO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3ltYm9sO1xuIiwidmFyIGJhc2VJc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL19iYXNlSXNUeXBlZEFycmF5JyksXG4gICAgYmFzZVVuYXJ5ID0gcmVxdWlyZSgnLi9fYmFzZVVuYXJ5JyksXG4gICAgbm9kZVV0aWwgPSByZXF1aXJlKCcuL19ub2RlVXRpbCcpO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc1R5cGVkQXJyYXk7XG4iLCJ2YXIgYXJyYXlMaWtlS2V5cyA9IHJlcXVpcmUoJy4vX2FycmF5TGlrZUtleXMnKSxcbiAgICBiYXNlS2V5cyA9IHJlcXVpcmUoJy4vX2Jhc2VLZXlzJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkZhbHNlO1xuIiwidmFyIGJhc2VUb1N0cmluZyA9IHJlcXVpcmUoJy4vX2Jhc2VUb1N0cmluZycpO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gKiBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLiBUaGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9TdHJpbmcobnVsbCk7XG4gKiAvLyA9PiAnJ1xuICpcbiAqIF8udG9TdHJpbmcoLTApO1xuICogLy8gPT4gJy0wJ1xuICpcbiAqIF8udG9TdHJpbmcoWzEsIDIsIDNdKTtcbiAqIC8vID0+ICcxLDIsMydcbiAqL1xuZnVuY3Rpb24gdG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IGJhc2VUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9TdHJpbmc7XG4iLCJ2YXIgY3JlYXRlQ2FzZUZpcnN0ID0gcmVxdWlyZSgnLi9fY3JlYXRlQ2FzZUZpcnN0Jyk7XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBgc3RyaW5nYCB0byB1cHBlciBjYXNlLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgc3RyaW5nIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnVwcGVyRmlyc3QoJ2ZyZWQnKTtcbiAqIC8vID0+ICdGcmVkJ1xuICpcbiAqIF8udXBwZXJGaXJzdCgnRlJFRCcpO1xuICogLy8gPT4gJ0ZSRUQnXG4gKi9cbnZhciB1cHBlckZpcnN0ID0gY3JlYXRlQ2FzZUZpcnN0KCd0b1VwcGVyQ2FzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVwcGVyRmlyc3Q7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLy8gVGhpcyBtZXRob2Qgb2Ygb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IG5lZWRzIHRvIGJlXG4vLyBrZXB0IGlkZW50aWNhbCB0byB0aGUgd2F5IGl0IGlzIG9idGFpbmVkIGluIHJ1bnRpbWUuanNcbnZhciBnID1cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOlxuICB0eXBlb2Ygc2VsZiA9PT0gXCJvYmplY3RcIiA/IHNlbGYgOiB0aGlzO1xuXG4vLyBVc2UgYGdldE93blByb3BlcnR5TmFtZXNgIGJlY2F1c2Ugbm90IGFsbCBicm93c2VycyBzdXBwb3J0IGNhbGxpbmdcbi8vIGBoYXNPd25Qcm9wZXJ0eWAgb24gdGhlIGdsb2JhbCBgc2VsZmAgb2JqZWN0IGluIGEgd29ya2VyLiBTZWUgIzE4My5cbnZhciBoYWRSdW50aW1lID0gZy5yZWdlbmVyYXRvclJ1bnRpbWUgJiZcbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZykuaW5kZXhPZihcInJlZ2VuZXJhdG9yUnVudGltZVwiKSA+PSAwO1xuXG4vLyBTYXZlIHRoZSBvbGQgcmVnZW5lcmF0b3JSdW50aW1lIGluIGNhc2UgaXQgbmVlZHMgdG8gYmUgcmVzdG9yZWQgbGF0ZXIuXG52YXIgb2xkUnVudGltZSA9IGhhZFJ1bnRpbWUgJiYgZy5yZWdlbmVyYXRvclJ1bnRpbWU7XG5cbi8vIEZvcmNlIHJlZXZhbHV0YXRpb24gb2YgcnVudGltZS5qcy5cbmcucmVnZW5lcmF0b3JSdW50aW1lID0gdW5kZWZpbmVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3J1bnRpbWVcIik7XG5cbmlmIChoYWRSdW50aW1lKSB7XG4gIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHJ1bnRpbWUuXG4gIGcucmVnZW5lcmF0b3JSdW50aW1lID0gb2xkUnVudGltZTtcbn0gZWxzZSB7XG4gIC8vIFJlbW92ZSB0aGUgZ2xvYmFsIHByb3BlcnR5IGFkZGVkIGJ5IHJ1bnRpbWUuanMuXG4gIHRyeSB7XG4gICAgZGVsZXRlIGcucmVnZW5lcmF0b3JSdW50aW1lO1xuICB9IGNhdGNoKGUpIHtcbiAgICBnLnJlZ2VuZXJhdG9yUnVudGltZSA9IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9tYXN0ZXIvTElDRU5TRSBmaWxlLiBBblxuICogYWRkaXRpb25hbCBncmFudCBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluXG4gKiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLiBJZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCwgaG93ZXZlciwgdGhlXG4gICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAgIC8vIHRocm93biBiYWNrIGludG8gdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgYXMgaXMgdGhlIGNhc2VcbiAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgICAgLy8gYWxsb3dzIHRoZSBjb25zdW1lciB0byBkZWNpZGUgd2hhdCB0byBkbyB3aXRoIHRoZSB5aWVsZGVkXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgICAvLyBhd2FpdCwgYnkgY29udHJhc3QsIHRoZXJlIGlzIG5vIG9wcG9ydHVuaXR5IHRvIGV4YW1pbmUgdGhlXG4gICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAgIC8vIGxldCB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhbmRsZSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICBpbnZva2UgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKGludm9rZSk7XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBydW50aW1lLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdClcbiAgICApO1xuXG4gICAgcmV0dXJuIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIgfHxcbiAgICAgICAgICAgICAgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiICYmIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIC8vIEEgcmV0dXJuIG9yIHRocm93ICh3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gdGhyb3dcbiAgICAgICAgICAgIC8vIG1ldGhvZCkgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICAgIHZhciByZXR1cm5NZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXTtcbiAgICAgICAgICAgIGlmIChyZXR1cm5NZXRob2QpIHtcbiAgICAgICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKHJldHVybk1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGFyZyk7XG4gICAgICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJldHVybiBtZXRob2QgdGhyZXcgYW4gZXhjZXB0aW9uLCBsZXQgdGhhdFxuICAgICAgICAgICAgICAgIC8vIGV4Y2VwdGlvbiBwcmV2YWlsIG92ZXIgdGhlIG9yaWdpbmFsIHJldHVybiBvciB0aHJvdy5cbiAgICAgICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGggdGhlIG91dGVyIHJldHVybiwgbm93IHRoYXQgdGhlIGRlbGVnYXRlXG4gICAgICAgICAgICAgIC8vIGl0ZXJhdG9yIGhhcyBiZWVuIHRlcm1pbmF0ZWQuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0sXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvcixcbiAgICAgICAgICAgIGFyZ1xuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIExpa2UgcmV0dXJuaW5nIGdlbmVyYXRvci50aHJvdyh1bmNhdWdodCksIGJ1dCB3aXRob3V0IHRoZVxuICAgICAgICAgICAgLy8gb3ZlcmhlYWQgb2YgYW4gZXh0cmEgZnVuY3Rpb24gY2FsbC5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEZWxlZ2F0ZSBnZW5lcmF0b3IgcmFuIGFuZCBoYW5kbGVkIGl0cyBvd24gZXhjZXB0aW9ucyBzb1xuICAgICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hhdCB0aGUgbWV0aG9kIHdhcywgd2UgY29udGludWUgYXMgaWYgaXQgaXNcbiAgICAgICAgICAvLyBcIm5leHRcIiB3aXRoIGFuIHVuZGVmaW5lZCBhcmcuXG4gICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuICAgICAgICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5kZWxlZ2F0ZSAmJiBtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yXCI7XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIHJ1bnRpbWUua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBydW50aW1lLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuICAgICAgICByZXR1cm4gISFjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xufSkoXG4gIC8vIEFtb25nIHRoZSB2YXJpb3VzIHRyaWNrcyBmb3Igb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWxcbiAgLy8gb2JqZWN0LCB0aGlzIHNlZW1zIHRvIGJlIHRoZSBtb3N0IHJlbGlhYmxlIHRlY2huaXF1ZSB0aGF0IGRvZXMgbm90XG4gIC8vIHVzZSBpbmRpcmVjdCBldmFsICh3aGljaCB2aW9sYXRlcyBDb250ZW50IFNlY3VyaXR5IFBvbGljeSkuXG4gIHR5cGVvZiBnbG9iYWwgPT09IFwib2JqZWN0XCIgPyBnbG9iYWwgOlxuICB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiID8gd2luZG93IDpcbiAgdHlwZW9mIHNlbGYgPT09IFwib2JqZWN0XCIgPyBzZWxmIDogdGhpc1xuKTtcbiIsIi8qKlxuKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vZ2FqdXMvc2lzdGVyIGZvciB0aGUgY2Fub25pY2FsIHNvdXJjZSByZXBvc2l0b3J5XG4qIEBsaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS9nYWp1cy9zaXN0ZXIvYmxvYi9tYXN0ZXIvTElDRU5TRSBCU0QgMy1DbGF1c2VcbiovXG5mdW5jdGlvbiBTaXN0ZXIgKCkge1xuICAgIHZhciBzaXN0ZXIgPSB7fSxcbiAgICAgICAgZXZlbnRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAbmFtZSBoYW5kbGVyXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgRXZlbnQgZGF0YS5cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIEV2ZW50IG5hbWUuXG4gICAgICogQHBhcmFtIHtoYW5kbGVyfSBoYW5kbGVyXG4gICAgICogQHJldHVybiB7bGlzdGVuZXJ9XG4gICAgICovXG4gICAgc2lzdGVyLm9uID0gZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0ge25hbWU6IG5hbWUsIGhhbmRsZXI6IGhhbmRsZXJ9O1xuICAgICAgICBldmVudHNbbmFtZV0gPSBldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIGV2ZW50c1tuYW1lXS51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2xpc3RlbmVyfVxuICAgICAqL1xuICAgIHNpc3Rlci5vZmYgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZXZlbnRzW2xpc3RlbmVyLm5hbWVdLmluZGV4T2YobGlzdGVuZXIpO1xuXG4gICAgICAgIGlmIChpbmRleCAhPSAtMSkge1xuICAgICAgICAgICAgZXZlbnRzW2xpc3RlbmVyLm5hbWVdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgRXZlbnQgbmFtZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBFdmVudCBkYXRhLlxuICAgICAqL1xuICAgIHNpc3Rlci50cmlnZ2VyID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IGV2ZW50c1tuYW1lXSxcbiAgICAgICAgICAgIGk7XG5cbiAgICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAgICAgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmhhbmRsZXIoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHNpc3Rlcjtcbn1cblxuZ2xvYmFsLmdhanVzID0gZ2xvYmFsLmdhanVzIHx8IHt9O1xuZ2xvYmFsLmdhanVzLlNpc3RlciA9IFNpc3RlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBTaXN0ZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlZ2VuZXJhdG9yID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvcicpO1xuXG52YXIgX3JlZ2VuZXJhdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlZ2VuZXJhdG9yKTtcblxudmFyIF9hc3luY1RvR2VuZXJhdG9yMiA9IHJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yJyk7XG5cbnZhciBfYXN5bmNUb0dlbmVyYXRvcjMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3luY1RvR2VuZXJhdG9yMik7XG5cbnZhciBfdXBwZXJGaXJzdDIgPSByZXF1aXJlKCdsb2Rhc2gvdXBwZXJGaXJzdCcpO1xuXG52YXIgX3VwcGVyRmlyc3QzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXBwZXJGaXJzdDIpO1xuXG52YXIgX2ZvckVhY2gyID0gcmVxdWlyZSgnbG9kYXNoL2ZvckVhY2gnKTtcblxudmFyIF9mb3JFYWNoMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZvckVhY2gyKTtcblxudmFyIF9mdW5jdGlvbk5hbWVzID0gcmVxdWlyZSgnLi9mdW5jdGlvbk5hbWVzJyk7XG5cbnZhciBfZnVuY3Rpb25OYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9mdW5jdGlvbk5hbWVzKTtcblxudmFyIF9ldmVudE5hbWVzID0gcmVxdWlyZSgnLi9ldmVudE5hbWVzJyk7XG5cbnZhciBfZXZlbnROYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ldmVudE5hbWVzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFlvdVR1YmVQbGF5ZXIgPSB7fTtcblxuLyoqXG4gKiBDb25zdHJ1Y3QgYW4gb2JqZWN0IHRoYXQgZGVmaW5lcyBhbiBldmVudCBoYW5kbGVyIGZvciBhbGwgb2YgdGhlIFlvdVR1YmVcbiAqIHBsYXllciBldmVudHMuIFByb3h5IGNhcHR1cmVkIGV2ZW50cyB0aHJvdWdoIGFuIGV2ZW50IGVtaXR0ZXIuXG4gKlxuICogQHRvZG8gQ2FwdHVyZSBldmVudCBwYXJhbWV0ZXJzLlxuICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS95b3V0dWJlL2lmcmFtZV9hcGlfcmVmZXJlbmNlI0V2ZW50c1xuICogQHBhcmFtIHtTaXN0ZXJ9IGVtaXR0ZXJcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cbllvdVR1YmVQbGF5ZXIucHJveHlFdmVudHMgPSBmdW5jdGlvbiAoZW1pdHRlcikge1xuICB2YXIgZXZlbnRzID0ge307XG5cbiAgKDAsIF9mb3JFYWNoMy5kZWZhdWx0KShfZXZlbnROYW1lczIuZGVmYXVsdCwgZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgIHZhciBvbkV2ZW50TmFtZSA9ICdvbicgKyAoMCwgX3VwcGVyRmlyc3QzLmRlZmF1bHQpKGV2ZW50TmFtZSk7XG5cbiAgICBldmVudHNbb25FdmVudE5hbWVdID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBlbWl0dGVyLnRyaWdnZXIoZXZlbnROYW1lLCBldmVudCk7XG4gICAgfTtcbiAgfSk7XG5cbiAgcmV0dXJuIGV2ZW50cztcbn07XG5cbi8qKlxuICogRGVsYXlzIHBsYXllciBBUEkgbWV0aG9kIGV4ZWN1dGlvbiB1bnRpbCBwbGF5ZXIgc3RhdGUgaXMgcmVhZHkuXG4gKlxuICogQHRvZG8gUHJveHkgYWxsIG9mIHRoZSBtZXRob2RzIHVzaW5nIE9iamVjdC5rZXlzLlxuICogQHRvZG8gU2VlIFRSSUNLWSBiZWxvdy5cbiAqIEBwYXJhbSB7UHJvbWlzZX0gcGxheWVyQVBJUmVhZHkgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gcGxheWVyIGlzIHJlYWR5LlxuICogQHJldHVybnMge09iamVjdH1cbiAqL1xuWW91VHViZVBsYXllci5wcm9taXNpZnlQbGF5ZXIgPSBmdW5jdGlvbiAocGxheWVyQVBJUmVhZHkpIHtcbiAgdmFyIGZ1bmN0aW9ucyA9IHt9O1xuXG4gICgwLCBfZm9yRWFjaDMuZGVmYXVsdCkoX2Z1bmN0aW9uTmFtZXMyLmRlZmF1bHQsIGZ1bmN0aW9uIChmdW5jdGlvbk5hbWUpIHtcbiAgICBmdW5jdGlvbnNbZnVuY3Rpb25OYW1lXSA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjMuZGVmYXVsdCkoX3JlZ2VuZXJhdG9yMi5kZWZhdWx0Lm1hcmsoZnVuY3Rpb24gX2NhbGxlZSgpIHtcbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIHZhciBwbGF5ZXI7XG4gICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yMi5kZWZhdWx0LndyYXAoZnVuY3Rpb24gX2NhbGxlZSQoX2NvbnRleHQpIHtcbiAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICBzd2l0Y2ggKF9jb250ZXh0LnByZXYgPSBfY29udGV4dC5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIF9jb250ZXh0Lm5leHQgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gcGxheWVyQVBJUmVhZHk7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgcGxheWVyID0gX2NvbnRleHQuc2VudDtcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0LmFicnVwdCgncmV0dXJuJywgcGxheWVyW2Z1bmN0aW9uTmFtZV0uYXBwbHkocGxheWVyLCBhcmdzKSk7XG5cbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dC5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBfY2FsbGVlLCB1bmRlZmluZWQpO1xuICAgIH0pKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9ucztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFlvdVR1YmVQbGF5ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20veW91dHViZS9pZnJhbWVfYXBpX3JlZmVyZW5jZSNFdmVudHNcbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gWydyZWFkeScsICdzdGF0ZUNoYW5nZScsICdwbGF5YmFja1F1YWxpdHlDaGFuZ2UnLCAncGxheWJhY2tSYXRlQ2hhbmdlJywgJ2Vycm9yJywgJ2FwaUNoYW5nZSddO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3lvdXR1YmUvaWZyYW1lX2FwaV9yZWZlcmVuY2UjRnVuY3Rpb25zXG4gKi9cbmV4cG9ydHMuZGVmYXVsdCA9IFsnY3VlVmlkZW9CeUlkJywgJ2xvYWRWaWRlb0J5SWQnLCAnY3VlVmlkZW9CeVVybCcsICdsb2FkVmlkZW9CeVVybCcsICdwbGF5VmlkZW8nLCAncGF1c2VWaWRlbycsICdzdG9wVmlkZW8nLCAnY2xlYXJWaWRlbycsICdnZXRWaWRlb0J5dGVzTG9hZGVkJywgJ2dldFZpZGVvQnl0ZXNUb3RhbCcsICdnZXRWaWRlb0xvYWRlZEZyYWN0aW9uJywgJ2dldFZpZGVvU3RhcnRCeXRlcycsICdjdWVQbGF5bGlzdCcsICdsb2FkUGxheWxpc3QnLCAnbmV4dFZpZGVvJywgJ3ByZXZpb3VzVmlkZW8nLCAncGxheVZpZGVvQXQnLCAnc2V0U2h1ZmZsZScsICdzZXRMb29wJywgJ2dldFBsYXlsaXN0JywgJ2dldFBsYXlsaXN0SW5kZXgnLCAnZ2V0UGxheWxpc3RJZCcsICdsb2FkTW9kdWxlJywgJ3VubG9hZE1vZHVsZScsICdzZXRPcHRpb24nLCAnbXV0ZScsICd1bk11dGUnLCAnaXNNdXRlZCcsICdzZXRWb2x1bWUnLCAnZ2V0Vm9sdW1lJywgJ3NlZWtUbycsICdnZXRQbGF5ZXJTdGF0ZScsICdnZXRQbGF5YmFja1JhdGUnLCAnc2V0UGxheWJhY2tSYXRlJywgJ2dldEF2YWlsYWJsZVBsYXliYWNrUmF0ZXMnLCAnZ2V0UGxheWJhY2tRdWFsaXR5JywgJ3NldFBsYXliYWNrUXVhbGl0eScsICdnZXRBdmFpbGFibGVRdWFsaXR5TGV2ZWxzJywgJ2dldEN1cnJlbnRUaW1lJywgJ2dldER1cmF0aW9uJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAnZ2V0VmlkZW9VcmwnLCAnZ2V0RGVidWdUZXh0JywgJ2dldFZpZGVvRGF0YScsICdhZGRDdWVSYW5nZScsICdyZW1vdmVDdWVSYW5nZScsICdnZXRBcGlJbnRlcmZhY2UnLCAnc2hvd1ZpZGVvSW5mbycsICdoaWRlVmlkZW9JbmZvJywgJ0cnLCAnQycsICdSJywgJ2FhJywgJyQnLCAnWicsICdnZXRWaWRlb0VtYmVkQ29kZScsICdnZXRPcHRpb25zJywgJ2dldE9wdGlvbicsICdZJywgJ1gnLCAnYWRkRXZlbnRMaXN0ZW5lcicsICdkZXN0cm95JywgJ0EnLCAnUCcsICdKJywgJ3NldFNpemUnLCAnZ2V0SWZyYW1lJ107XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVnZW5lcmF0b3IgPSByZXF1aXJlKCdiYWJlbC1ydW50aW1lL3JlZ2VuZXJhdG9yJyk7XG5cbnZhciBfcmVnZW5lcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVnZW5lcmF0b3IpO1xuXG52YXIgX2FzeW5jVG9HZW5lcmF0b3IyID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3InKTtcblxudmFyIF9hc3luY1RvR2VuZXJhdG9yMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FzeW5jVG9HZW5lcmF0b3IyKTtcblxudmFyIF9wcm9taXNlID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UnKTtcblxudmFyIF9wcm9taXNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb21pc2UpO1xuXG52YXIgX2lzU3RyaW5nMiA9IHJlcXVpcmUoJ2xvZGFzaC9pc1N0cmluZycpO1xuXG52YXIgX2lzU3RyaW5nMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzU3RyaW5nMik7XG5cbnZhciBfc2lzdGVyID0gcmVxdWlyZSgnc2lzdGVyJyk7XG5cbnZhciBfc2lzdGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Npc3Rlcik7XG5cbnZhciBfbG9hZFlvdVR1YmVJZnJhbWVBcGkgPSByZXF1aXJlKCcuL2xvYWRZb3VUdWJlSWZyYW1lQXBpJyk7XG5cbnZhciBfbG9hZFlvdVR1YmVJZnJhbWVBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9hZFlvdVR1YmVJZnJhbWVBcGkpO1xuXG52YXIgX1lvdVR1YmVQbGF5ZXIgPSByZXF1aXJlKCcuL1lvdVR1YmVQbGF5ZXInKTtcblxudmFyIF9Zb3VUdWJlUGxheWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1lvdVR1YmVQbGF5ZXIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKipcbiAqIEB0eXBlZGVmIG9wdGlvbnNcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20veW91dHViZS9pZnJhbWVfYXBpX3JlZmVyZW5jZSNMb2FkaW5nX2FfVmlkZW9fUGxheWVyXG4gKiBAcGFyYW0ge051bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2aWRlb0lkXG4gKiBAcGFyYW0ge09iamVjdH0gcGxheWVyVmFyc1xuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50c1xuICovXG52YXIgeW91dHViZUlmcmFtZUFQSSA9IHZvaWQgMDtcblxuLyoqXG4gKiBBIGZhY3RvcnkgZnVuY3Rpb24gdXNlZCB0byBwcm9kdWNlIGFuIGluc3RhbmNlIG9mIFlULlBsYXllciBhbmQgcXVldWUgZnVuY3Rpb24gY2FsbHMgYW5kIHByb3h5IGV2ZW50cyBvZiB0aGUgcmVzdWx0aW5nIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fFN0cmluZ30gZWxlbWVudElkIEVpdGhlciB0aGUgRE9NIGVsZW1lbnQgb3IgdGhlIGlkIG9mIHRoZSBIVE1MIGVsZW1lbnQgd2hlcmUgdGhlIEFQSSB3aWxsIGluc2VydCBhbiA8aWZyYW1lPi5cbiAqIEBwYXJhbSB7WW91VHViZVBsYXllcn5vcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChlbGVtZW50SWQpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gIHZhciBlbWl0dGVyID0gKDAsIF9zaXN0ZXIyLmRlZmF1bHQpKCk7XG5cbiAgaWYgKCF5b3V0dWJlSWZyYW1lQVBJKSB7XG4gICAgeW91dHViZUlmcmFtZUFQSSA9ICgwLCBfbG9hZFlvdVR1YmVJZnJhbWVBcGkyLmRlZmF1bHQpKCk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5ldmVudHMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V2ZW50IGhhbmRsZXJzIGNhbm5vdCBiZSBvdmVyd3JpdHRlbi4nKTtcbiAgfVxuXG4gIGlmICgoMCwgX2lzU3RyaW5nMy5kZWZhdWx0KShlbGVtZW50SWQpICYmICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFbGVtZW50IFwiJyArIGVsZW1lbnRJZCArICdcIiBkb2VzIG5vdCBleGlzdC4nKTtcbiAgfVxuXG4gIG9wdGlvbnMuZXZlbnRzID0gX1lvdVR1YmVQbGF5ZXIyLmRlZmF1bHQucHJveHlFdmVudHMoZW1pdHRlcik7XG5cbiAgdmFyIHBsYXllckFQSVJlYWR5ID0gbmV3IF9wcm9taXNlMi5kZWZhdWx0KGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3JlZiA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjMuZGVmYXVsdCkoX3JlZ2VuZXJhdG9yMi5kZWZhdWx0Lm1hcmsoZnVuY3Rpb24gX2NhbGxlZShyZXNvbHZlKSB7XG4gICAgICB2YXIgWVQsIHBsYXllcjtcbiAgICAgIHJldHVybiBfcmVnZW5lcmF0b3IyLmRlZmF1bHQud3JhcChmdW5jdGlvbiBfY2FsbGVlJChfY29udGV4dCkge1xuICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQucHJldiA9IF9jb250ZXh0Lm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiB5b3V0dWJlSWZyYW1lQVBJO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIFlUID0gX2NvbnRleHQuc2VudDtcbiAgICAgICAgICAgICAgcGxheWVyID0gbmV3IFlULlBsYXllcihlbGVtZW50SWQsIG9wdGlvbnMpO1xuXG5cbiAgICAgICAgICAgICAgZW1pdHRlci5vbigncmVhZHknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShwbGF5ZXIpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0LnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIF9jYWxsZWUsIHVuZGVmaW5lZCk7XG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChfeDIpIHtcbiAgICAgIHJldHVybiBfcmVmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSgpKTtcblxuICB2YXIgcGxheWVyQVBJID0gX1lvdVR1YmVQbGF5ZXIyLmRlZmF1bHQucHJvbWlzaWZ5UGxheWVyKHBsYXllckFQSVJlYWR5KTtcblxuICBwbGF5ZXJBUEkub24gPSBlbWl0dGVyLm9uO1xuICBwbGF5ZXJBUEkub2ZmID0gZW1pdHRlci5vZmY7XG5cbiAgcmV0dXJuIHBsYXllckFQSTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9wcm9taXNlID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UnKTtcblxudmFyIF9wcm9taXNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb21pc2UpO1xuXG52YXIgX2xvYWRTY3JpcHQgPSByZXF1aXJlKCdsb2FkLXNjcmlwdCcpO1xuXG52YXIgX2xvYWRTY3JpcHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9hZFNjcmlwdCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gd2luZG93Lm9uWW91VHViZUlmcmFtZUFQSVJlYWR5IGlzIGNhbGxlZC5cbiAgICogVGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBhIHJlZmVyZW5jZSB0byB3aW5kb3cuWVQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlXG4gICAqIEBtZW1iZXIge09iamVjdH0gaWZyYW1lQVBJUmVhZHlcbiAgICovXG4gIHZhciBpZnJhbWVBUElSZWFkeSA9IG5ldyBfcHJvbWlzZTIuZGVmYXVsdChmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIGlmICh3aW5kb3cuWVQgJiYgd2luZG93LllULlBsYXllciAmJiB3aW5kb3cuWVQuUGxheWVyIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJlc29sdmUod2luZG93LllUKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBwcmV2aW91cyA9IHdpbmRvdy5vbllvdVR1YmVJZnJhbWVBUElSZWFkeTtcblxuICAgIC8vIFRoZSBBUEkgd2lsbCBjYWxsIHRoaXMgZnVuY3Rpb24gd2hlbiBwYWdlIGhhcyBmaW5pc2hlZCBkb3dubG9hZGluZ1xuICAgIC8vIHRoZSBKYXZhU2NyaXB0IGZvciB0aGUgcGxheWVyIEFQSS5cbiAgICB3aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgcHJldmlvdXMoKTtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZSh3aW5kb3cuWVQpO1xuICAgIH07XG4gIH0pO1xuICB2YXIgcHJvdG9jb2wgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwOicgPyAnaHR0cDonIDogJ2h0dHBzOic7XG5cbiAgKDAsIF9sb2FkU2NyaXB0Mi5kZWZhdWx0KShwcm90b2NvbCArICcvL3d3dy55b3V0dWJlLmNvbS9pZnJhbWVfYXBpJyk7XG5cbiAgcmV0dXJuIGlmcmFtZUFQSVJlYWR5O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImV0YWdcIjogXCJcIixcbiAgXCJpdGVtc1wiOiBbXG4gICAge1xuICAgICAgXCJpZFwiOiAgXCJVQ0FaNzd2ZHFZYnVHYkNBV0I2MldicVFcIixcbiAgICAgIFwidGl0bGVcIjogXCJDaGFubmVsIDFcIixcbiAgICAgIFwidGh1bWJuYWlsc1wiOiB7XG4gICAgICAgIFwiaGlnaFwiOiB7XG4gICAgICAgICAgXCJ1cmxcIjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzE1MHgxNTBcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6ICBcIlVDQVo3N3ZkcVlidUdiQ0FXQjYyV2JxUVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkNoYW5uZWwgMlwiLFxuICAgICAgXCJ0aHVtYm5haWxzXCI6IHtcbiAgICAgICAgXCJoaWdoXCI6IHtcbiAgICAgICAgICBcInVybFwiOiBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvMTUweDE1MFwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogIFwiVUNBWjc3dmRxWWJ1R2JDQVdCNjJXYnFRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQ2hhbm5lbCAzXCIsXG4gICAgICBcInRodW1ibmFpbHNcIjoge1xuICAgICAgICBcImhpZ2hcIjoge1xuICAgICAgICAgIFwidXJsXCI6IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xNTB4MTUwXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiAgXCJVQ0FaNzd2ZHFZYnVHYkNBV0I2MldicVFcIixcbiAgICAgIFwidGl0bGVcIjogXCJDaGFubmVsIDRcIixcbiAgICAgIFwidGh1bWJuYWlsc1wiOiB7XG4gICAgICAgIFwiaGlnaFwiOiB7XG4gICAgICAgICAgXCJ1cmxcIjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzE1MHgxNTBcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6ICBcIlVDQVo3N3ZkcVlidUdiQ0FXQjYyV2JxUVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkNoYW5uZWwgNVwiLFxuICAgICAgXCJ0aHVtYm5haWxzXCI6IHtcbiAgICAgICAgXCJoaWdoXCI6IHtcbiAgICAgICAgICBcInVybFwiOiBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvMTUweDE1MFwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogIFwiVUNBWjc3dmRxWWJ1R2JDQVdCNjJXYnFRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQ2hhbm5lbCA2XCIsXG4gICAgICBcInRodW1ibmFpbHNcIjoge1xuICAgICAgICBcImhpZ2hcIjoge1xuICAgICAgICAgIFwidXJsXCI6IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xNTB4MTUwXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIF0sXG4gIFwibmV4dFBhZ2VUb2tlblwiOiBcIlwiLFxuICBcInBhZ2VJbmZvXCI6IHtcbiAgICBcInJlc3VsdHNQZXJQYWdlXCI6IFwiXCIsXG4gICAgXCJ0b3RhbFJlc3VsdHNcIjogXCJcIlxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaXRlbXNcIjogW1xuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIkN6MExOdTdvOXA4XCIsXG4gICAgICBcInRpdGxlXCI6IFwiRWxpcmFuIEJlbiBJc2hhaSAtIFRyYXZlbGxpbmcgRmFyIGluIFNob3J0IFN0cmlkZXNcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCJlbGpwVWhmbHFHWVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkJlYXQgUGxhc3RpYyAtIEF1dG9tYXRpY1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIk91dXRMR3VnWjBZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiTmF0aGFuIERhbmR5IC0gQ2F0IFZpc2lvblwiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcInZlelo1NmFDUVpRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiSnVubyBEcmVhbXMgLSBCZSBXaXRoIE1lXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiMk15QUZJWGw1cW9cIixcbiAgICAgIFwidGl0bGVcIjogXCJXYXZlc2hhcGVyIC0gRnV0dXJlIFZpc2lvblwiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIkN6MExOdTdvOXA4XCIsXG4gICAgICBcInRpdGxlXCI6IFwiRWxpcmFuIEJlbiBJc2hhaSAtIFRyYXZlbGxpbmcgRmFyIGluIFNob3J0IFN0cmlkZXNcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCJlbGpwVWhmbHFHWVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkJlYXQgUGxhc3RpYyAtIEF1dG9tYXRpY1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIk91dXRMR3VnWjBZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiTmF0aGFuIERhbmR5IC0gQ2F0IFZpc2lvblwiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcInZlelo1NmFDUVpRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiSnVubyBEcmVhbXMgLSBCZSBXaXRoIE1lXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiMk15QUZJWGw1cW9cIixcbiAgICAgIFwidGl0bGVcIjogXCJXYXZlc2hhcGVyIC0gRnV0dXJlIFZpc2lvblwiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIkN6MExOdTdvOXA4XCIsXG4gICAgICBcInRpdGxlXCI6IFwiRWxpcmFuIEJlbiBJc2hhaSAtIFRyYXZlbGxpbmcgRmFyIGluIFNob3J0IFN0cmlkZXNcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCJlbGpwVWhmbHFHWVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkJlYXQgUGxhc3RpYyAtIEF1dG9tYXRpY1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIk91dXRMR3VnWjBZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiTmF0aGFuIERhbmR5IC0gQ2F0IFZpc2lvblwiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcInZlelo1NmFDUVpRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiSnVubyBEcmVhbXMgLSBCZSBXaXRoIE1lXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiMk15QUZJWGw1cW9cIixcbiAgICAgIFwidGl0bGVcIjogXCJXYXZlc2hhcGVyIC0gRnV0dXJlIFZpc2lvblwiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIkN6MExOdTdvOXA4XCIsXG4gICAgICBcInRpdGxlXCI6IFwiRWxpcmFuIEJlbiBJc2hhaSAtIFRyYXZlbGxpbmcgRmFyIGluIFNob3J0IFN0cmlkZXNcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCJlbGpwVWhmbHFHWVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkJlYXQgUGxhc3RpYyAtIEF1dG9tYXRpY1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcIk91dXRMR3VnWjBZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiTmF0aGFuIERhbmR5IC0gQ2F0IFZpc2lvblwiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcInZlelo1NmFDUVpRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiSnVubyBEcmVhbXMgLSBCZSBXaXRoIE1lXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiMk15QUZJWGw1cW9cIixcbiAgICAgIFwidGl0bGVcIjogXCJXYXZlc2hhcGVyIC0gRnV0dXJlIFZpc2lvblwiXG4gICAgfVxuICBdLFxuICBcIm5leHRQYWdlVG9rZW5cIjogXCJcIixcbiAgXCJwYWdlSW5mb1wiOiB7XG4gICAgXCJyZXN1bHRzUGVyUGFnZVwiOiBcIlwiLFxuICAgIFwidG90YWxSZXN1bHRzXCI6IFwiXCJcbiAgfVxufVxuIiwibGV0IGNoYW5uZWxzID0gcmVxdWlyZSgnLi4vZml4dHVyZXMvY2hhbm5lbHMnKVxubGV0IHZpZGVvcyA9IHJlcXVpcmUoJy4uL2ZpeHR1cmVzL3ZpZGVvcycpXG5cbmZ1bmN0aW9uIGdldENvbnRlbnQocSkge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYW5uZWxzKVxufVxuXG5mdW5jdGlvbiBnZXRQbGF5bGlzdCgpIHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2aWRlb3MpXG59XG5cbmZ1bmN0aW9uIGdldFBsYXlsaXN0c0J5Q2hhbm5lbCgpIHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFubmVscylcbn1cblxuZXhwb3J0IHtcbiAgZ2V0Q29udGVudCxcbiAgZ2V0UGxheWxpc3QsXG4gIGdldFBsYXlsaXN0c0J5Q2hhbm5lbFxufVxuIl19
