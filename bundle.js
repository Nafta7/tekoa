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
  params += '&maxResults=' + _AppConstants2.default.MAX_RESULTS;
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
  params += '&maxResults=' + _AppConstants2.default.MAX_RESULTS;
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

function getPlaylist(id, type) {
  var resource = 'playlistItems';
  var paramKey = 'key=' + key;
  var part = 'part=snippet';
  var params = part + '&maxResults=50&order=date&' + paramKey;

  var url = baseUrl + '/' + resource + '?' + params;

  if (type === _ContentType2.default.CHANNEL) {
    return getChannelPlaylist(id).then(function (uploadsId) {
      return getPlaylistItems(url + '&playlistId=' + uploadsId);
    });
  } else {
    return getPlaylistItems(url + '&playlistId=' + id);
  }
}

function getPlaylistItems(url) {
  return fetchPlaylistItems(url);
}

/*
  Recursive function that fetches all the PlaylistItems.
*/
function fetchPlaylistItems(url) {
  var results = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var nextPageToken = arguments[2];

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
      return fetchPlaylistItems(url, results, data.nextPageToken);
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
      onItemClick = _ref.onItemClick,
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
      'onClick': onItemClick,
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Playlist = function Playlist(_ref) {
  var vids = _ref.vids,
      currentItem = _ref.currentItem,
      isVisible = _ref.isVisible,
      onVideoClick = _ref.onVideoClick;

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
  }));
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

},{"inferno":91}],9:[function(require,module,exports){
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
      onItemClick = _ref.onItemClick,
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
      'onClick': onItemClick,
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
  MAX_RESULTS: 10
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
      currentItem: null,
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
    _this.handleItemClick = _this.handleItemClick.bind(_this);
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
    _this.hasMoreResults = _this.hasMoreResults.bind(_this);
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
    key: 'handleItemClick',
    value: function handleItemClick(e, id) {
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
          vids: data.items
        });
      });
    }
  }, {
    key: 'handleVideoClick',
    value: function handleVideoClick(id, index) {
      var _this9 = this;

      this.setState({
        currentItem: index,
        isPlaying: true
      }, function () {
        return _this9.loadVideo(id);
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
      var _this10 = this;

      var previousItem = this.state.currentItem - 1;
      if (!(previousItem >= 0)) return;

      this.setState({
        currentItem: previousItem
      }, function () {
        return _this10.loadVideo(_this10.state.vids[previousItem].videoId);
      });
    }
  }, {
    key: 'handleNextVideo',
    value: function handleNextVideo() {
      var _this11 = this;

      var nextItem = this.state.currentItem + 1;
      if (!(nextItem < this.state.vids.length)) return;

      this.setState({
        currentItem: nextItem
      }, function () {
        return _this11.loadVideo(_this11.state.vids[nextItem].videoId);
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
        'onItemClick': this.handleItemClick,
        'onPlaylistsClick': this.handlePlaylistsClick,
        'onLoadMore': this.handleLoadMore
      }) : (0, _inferno.createVNode)(16, _PlaylistGrid2.default, {
        'items': this.state.results,
        'viewType': this.state.viewType,
        'hasMoreResults': this.hasMoreResults,
        'onItemClick': this.handleItemClick,
        'onPlaylistsClick': this.handlePlaylistsClick,
        'onLoadMore': this.handleLoadMore
      }), (0, _inferno.createVNode)(16, _Playlist2.default, {
        'vids': this.state.vids,
        'onVideoClick': this.handleVideoClick,
        'currentItem': this.state.currentItem,
        'isVisible': this.state.isPlaylistVisible
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

},{"../components/ChannelGrid":2,"../components/ContentTypeSelection":4,"../components/Nav":5,"../components/Player":6,"../components/PlayerControls":7,"../components/Playlist":8,"../components/PlaylistGrid":9,"../components/SearchBar":11,"../constants/ContentType":13,"../constants/PlayerState":14,"../constants/SearchType":15,"../helpers/apiBridge":17,"inferno":91,"inferno-component":88,"youtube-player":150}],17:[function(require,module,exports){
'use strict';

var _AppConstants = require('../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AppMode = require('../../appconfig').mode;


var apiBridge = function () {
  return AppMode === _AppConstants2.default.DEV_MODE ? require('../../test/helpers/apiFixture') : require('../api');
}();

module.exports = apiBridge;

},{"../../appconfig":19,"../../test/helpers/apiFixture":154,"../api":1,"../constants/AppConstants":12}],18:[function(require,module,exports){
'use strict';

var _inferno = require('inferno');

var _inferno2 = _interopRequireDefault(_inferno);

var _AppContainer = require('./containers/AppContainer');

var _AppContainer2 = _interopRequireDefault(_AppContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_inferno2.default.render((0, _inferno.createVNode)(16, _AppContainer2.default), document.getElementById('app'));

},{"./containers/AppContainer":16,"inferno":91}],19:[function(require,module,exports){
module.exports={
  "mode": "prod"
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

},{"regenerator-runtime":144}],24:[function(require,module,exports){
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

},{"_process":143,"inferno":91}],90:[function(require,module,exports){
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

},{"_process":143}],91:[function(require,module,exports){
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
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":123}],94:[function(require,module,exports){
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

},{}],95:[function(require,module,exports){
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

},{"./_baseTimes":106,"./_isIndex":117,"./isArguments":128,"./isArray":129,"./isBuffer":131,"./isTypedArray":138}],96:[function(require,module,exports){
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

},{}],97:[function(require,module,exports){
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

},{}],98:[function(require,module,exports){
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

},{"./_baseForOwn":100,"./_createBaseEach":111}],99:[function(require,module,exports){
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

},{"./_createBaseFor":112}],100:[function(require,module,exports){
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

},{"./_baseFor":99,"./keys":139}],101:[function(require,module,exports){
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

},{"./_Symbol":93,"./_getRawTag":115,"./_objectToString":121}],102:[function(require,module,exports){
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

},{"./_baseGetTag":101,"./isObjectLike":135}],103:[function(require,module,exports){
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

},{"./_baseGetTag":101,"./isLength":133,"./isObjectLike":135}],104:[function(require,module,exports){
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

},{"./_isPrototype":118,"./_nativeKeys":119}],105:[function(require,module,exports){
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

},{}],106:[function(require,module,exports){
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

},{}],107:[function(require,module,exports){
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

},{"./_Symbol":93,"./_arrayMap":96,"./isArray":129,"./isSymbol":137}],108:[function(require,module,exports){
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

},{}],109:[function(require,module,exports){
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

},{"./identity":127}],110:[function(require,module,exports){
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

},{"./_baseSlice":105}],111:[function(require,module,exports){
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

},{"./isArrayLike":130}],112:[function(require,module,exports){
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

},{}],113:[function(require,module,exports){
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

},{"./_castSlice":110,"./_hasUnicode":116,"./_stringToArray":124,"./toString":141}],114:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],115:[function(require,module,exports){
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

},{"./_Symbol":93}],116:[function(require,module,exports){
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

},{}],117:[function(require,module,exports){
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

},{}],118:[function(require,module,exports){
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

},{}],119:[function(require,module,exports){
var overArg = require('./_overArg');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;

},{"./_overArg":122}],120:[function(require,module,exports){
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

},{"./_freeGlobal":114}],121:[function(require,module,exports){
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

},{}],122:[function(require,module,exports){
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

},{}],123:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":114}],124:[function(require,module,exports){
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

},{"./_asciiToArray":97,"./_hasUnicode":116,"./_unicodeToArray":125}],125:[function(require,module,exports){
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

},{}],126:[function(require,module,exports){
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

},{"./_arrayEach":94,"./_baseEach":98,"./_castFunction":109,"./isArray":129}],127:[function(require,module,exports){
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

},{}],128:[function(require,module,exports){
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

},{"./_baseIsArguments":102,"./isObjectLike":135}],129:[function(require,module,exports){
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

},{}],130:[function(require,module,exports){
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

},{"./isFunction":132,"./isLength":133}],131:[function(require,module,exports){
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

},{"./_root":123,"./stubFalse":140}],132:[function(require,module,exports){
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

},{"./_baseGetTag":101,"./isObject":134}],133:[function(require,module,exports){
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

},{}],134:[function(require,module,exports){
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

},{}],135:[function(require,module,exports){
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

},{}],136:[function(require,module,exports){
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

},{"./_baseGetTag":101,"./isArray":129,"./isObjectLike":135}],137:[function(require,module,exports){
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

},{"./_baseGetTag":101,"./isObjectLike":135}],138:[function(require,module,exports){
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

},{"./_baseIsTypedArray":103,"./_baseUnary":108,"./_nodeUtil":120}],139:[function(require,module,exports){
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

},{"./_arrayLikeKeys":95,"./_baseKeys":104,"./isArrayLike":130}],140:[function(require,module,exports){
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

},{}],141:[function(require,module,exports){
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

},{"./_baseToString":107}],142:[function(require,module,exports){
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

},{"./_createCaseFirst":113}],143:[function(require,module,exports){
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

},{}],144:[function(require,module,exports){
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

},{"./runtime":145}],145:[function(require,module,exports){
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

},{"_process":143}],146:[function(require,module,exports){
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

},{}],147:[function(require,module,exports){
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
},{"./eventNames":148,"./functionNames":149,"babel-runtime/helpers/asyncToGenerator":22,"babel-runtime/regenerator":23,"lodash/forEach":126,"lodash/upperFirst":142}],148:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @see https://developers.google.com/youtube/iframe_api_reference#Events
 */
exports.default = ['ready', 'stateChange', 'playbackQualityChange', 'playbackRateChange', 'error', 'apiChange'];
module.exports = exports['default'];
},{}],149:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @see https://developers.google.com/youtube/iframe_api_reference#Functions
 */
exports.default = ['cueVideoById', 'loadVideoById', 'cueVideoByUrl', 'loadVideoByUrl', 'playVideo', 'pauseVideo', 'stopVideo', 'clearVideo', 'getVideoBytesLoaded', 'getVideoBytesTotal', 'getVideoLoadedFraction', 'getVideoStartBytes', 'cuePlaylist', 'loadPlaylist', 'nextVideo', 'previousVideo', 'playVideoAt', 'setShuffle', 'setLoop', 'getPlaylist', 'getPlaylistIndex', 'getPlaylistId', 'loadModule', 'unloadModule', 'setOption', 'mute', 'unMute', 'isMuted', 'setVolume', 'getVolume', 'seekTo', 'getPlayerState', 'getPlaybackRate', 'setPlaybackRate', 'getAvailablePlaybackRates', 'getPlaybackQuality', 'setPlaybackQuality', 'getAvailableQualityLevels', 'getCurrentTime', 'getDuration', 'removeEventListener', 'getVideoUrl', 'getDebugText', 'getVideoData', 'addCueRange', 'removeCueRange', 'getApiInterface', 'showVideoInfo', 'hideVideoInfo', 'G', 'C', 'R', 'aa', '$', 'Z', 'getVideoEmbedCode', 'getOptions', 'getOption', 'Y', 'X', 'addEventListener', 'destroy', 'A', 'P', 'J', 'setSize', 'getIframe'];
module.exports = exports['default'];
},{}],150:[function(require,module,exports){
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
},{"./YouTubePlayer":147,"./loadYouTubeIframeApi":151,"babel-runtime/core-js/promise":21,"babel-runtime/helpers/asyncToGenerator":22,"babel-runtime/regenerator":23,"lodash/isString":136,"sister":146}],151:[function(require,module,exports){
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
},{"babel-runtime/core-js/promise":21,"load-script":92}],152:[function(require,module,exports){
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

},{}],153:[function(require,module,exports){
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

},{}],154:[function(require,module,exports){
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

},{"../fixtures/channels":152,"../fixtures/videos":153}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvYXBpL2luZGV4LmpzIiwiYXBwL2NvbXBvbmVudHMvQ2hhbm5lbEdyaWQuanMiLCJhcHAvY29tcG9uZW50cy9DaGFubmVsSXRlbS5qcyIsImFwcC9jb21wb25lbnRzL0NvbnRlbnRUeXBlU2VsZWN0aW9uLmpzIiwiYXBwL2NvbXBvbmVudHMvTmF2LmpzIiwiYXBwL2NvbXBvbmVudHMvUGxheWVyLmpzIiwiYXBwL2NvbXBvbmVudHMvUGxheWVyQ29udHJvbHMuanMiLCJhcHAvY29tcG9uZW50cy9QbGF5bGlzdC5qcyIsImFwcC9jb21wb25lbnRzL1BsYXlsaXN0R3JpZC5qcyIsImFwcC9jb21wb25lbnRzL1BsYXlsaXN0SXRlbS5qcyIsImFwcC9jb21wb25lbnRzL1NlYXJjaEJhci5qcyIsImFwcC9jb25zdGFudHMvQXBwQ29uc3RhbnRzLmpzIiwiYXBwL2NvbnN0YW50cy9Db250ZW50VHlwZS5qcyIsImFwcC9jb25zdGFudHMvUGxheWVyU3RhdGUuanMiLCJhcHAvY29uc3RhbnRzL1NlYXJjaFR5cGUuanMiLCJhcHAvY29udGFpbmVycy9BcHBDb250YWluZXIuanMiLCJhcHAvaGVscGVycy9hcGlCcmlkZ2UuanMiLCJhcHAvaW5kZXguanMiLCJhcHBjb25maWcuanNvbiIsImNyZWRlbnRpYWxzLmpzb24iLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2ZhaWxzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGFzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19odG1sLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1zdGVwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2xpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21pY3JvdGFzay5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHBzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ3BvLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLWFsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Rhc2suanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9pbmZlcm5vLWNvbXBvbmVudC9pbmZlcm5vLWNvbXBvbmVudC5qcyIsIm5vZGVfbW9kdWxlcy9pbmZlcm5vL2Rpc3QvaW5mZXJuby1jb21wb25lbnQubm9kZS5qcyIsIm5vZGVfbW9kdWxlcy9pbmZlcm5vL2Rpc3QvaW5mZXJuby5ub2RlLmpzIiwibm9kZV9tb2R1bGVzL2luZmVybm8vaW5mZXJuby5qcyIsIm5vZGVfbW9kdWxlcy9sb2FkLXNjcmlwdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5RWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5TGlrZUtleXMuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheU1hcC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2FzY2lpVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VFYWNoLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUZvci5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VGb3JPd24uanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0VGFnLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzQXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VLZXlzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNsaWNlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRpbWVzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVVuYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY2FzdEZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY2FzdFNsaWNlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY3JlYXRlQmFzZUVhY2guanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19jcmVhdGVCYXNlRm9yLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY3JlYXRlQ2FzZUZpcnN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc1VuaWNvZGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19pc0luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9faXNQcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fbm9kZVV0aWwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJBcmcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19yb290LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RyaW5nVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX3VuaWNvZGVUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9mb3JFYWNoLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pZGVudGl0eS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXkuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXlMaWtlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0J1ZmZlci5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNGdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNMZW5ndGguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc1N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9zdHViRmFsc2UuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL3RvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC91cHBlckZpcnN0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUtbW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zaXN0ZXIvc3JjL3Npc3Rlci5qcyIsIm5vZGVfbW9kdWxlcy95b3V0dWJlLXBsYXllci9kaXN0L1lvdVR1YmVQbGF5ZXIuanMiLCJub2RlX21vZHVsZXMveW91dHViZS1wbGF5ZXIvZGlzdC9ldmVudE5hbWVzLmpzIiwibm9kZV9tb2R1bGVzL3lvdXR1YmUtcGxheWVyL2Rpc3QvZnVuY3Rpb25OYW1lcy5qcyIsIm5vZGVfbW9kdWxlcy95b3V0dWJlLXBsYXllci9kaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3lvdXR1YmUtcGxheWVyL2Rpc3QvbG9hZFlvdVR1YmVJZnJhbWVBcGkuanMiLCJ0ZXN0L2ZpeHR1cmVzL2NoYW5uZWxzLmpzb24iLCJ0ZXN0L2ZpeHR1cmVzL3ZpZGVvcy5qc29uIiwidGVzdC9oZWxwZXJzL2FwaUZpeHR1cmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDQ0E7Ozs7QUFDQTs7Ozs7O0FBRkEsSUFBTSxNQUFNLFFBQVEsbUJBQVIsRUFBNkIsR0FBekM7OztBQUlBLElBQU0saURBQU47O0FBRUEsU0FBUyxVQUFULENBQW9CLEtBQXBCLEVBQTJCLElBQTNCLEVBQWlEO0FBQUEsTUFBaEIsU0FBZ0IsdUVBQUosRUFBSTs7QUFDL0MsTUFBTSxXQUFXLFFBQWpCO0FBQ0EsTUFBSSwrQkFBNkIsR0FBN0IsY0FBeUMsSUFBN0M7QUFDQSw2QkFBeUIsdUJBQWEsV0FBdEM7QUFDQSxNQUFJLE1BQVMsT0FBVCxTQUFvQixRQUFwQixTQUFnQyxNQUFoQyxXQUE0QyxLQUFoRDs7QUFFQSxNQUFJLGNBQWMsRUFBbEIsRUFBc0I7QUFDcEIsMkJBQXFCLFNBQXJCO0FBQ0Q7O0FBRUQsU0FBTyxNQUFNLEdBQU4sRUFDSixJQURJLENBQ0M7QUFBQSxXQUFPLElBQUksSUFBSixFQUFQO0FBQUEsR0FERCxFQUVKLElBRkksQ0FFQyxnQkFBUTtBQUNaLFFBQU0sUUFBUSxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsZ0JBQVE7QUFDbkMsYUFBTztBQUNMLFlBQUksS0FBSyxFQUFMLENBQVcsSUFBWCxRQURDO0FBRUwsZUFBTyxLQUFLLE9BQUwsQ0FBYSxLQUZmO0FBR0wsb0JBQVksS0FBSyxPQUFMLENBQWEsVUFIcEI7QUFJTCxtQkFBVyxLQUFLLE9BQUwsQ0FBYSxTQUpuQjtBQUtMLHNCQUFjLEtBQUssT0FBTCxDQUFhO0FBTHRCLE9BQVA7QUFPRCxLQVJhLENBQWQ7O0FBVUEsUUFBTSxVQUFVLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsSUFBbEIsRUFBd0IsRUFBQyxZQUFELEVBQXhCLENBQWhCO0FBQ0EsV0FBTyxPQUFQO0FBQ0QsR0FmSSxDQUFQO0FBZ0JEOztBQUVELFNBQVMscUJBQVQsQ0FBK0IsU0FBL0IsRUFBMEQ7QUFBQSxNQUFoQixTQUFnQix1RUFBSixFQUFJOztBQUN4RCxNQUFNLFdBQVcsV0FBakI7QUFDQSxNQUFJLCtCQUE2QixHQUFqQztBQUNBLDZCQUF5Qix1QkFBYSxXQUF0QztBQUNBLE1BQUksTUFBUyxPQUFULFNBQW9CLFFBQXBCLFNBQWdDLE1BQWhDLG1CQUFvRCxTQUF4RDs7QUFFQSxNQUFJLGNBQWMsRUFBbEIsRUFBc0I7QUFDcEIsMkJBQXFCLFNBQXJCO0FBQ0Q7O0FBRUQsU0FBTyxNQUFNLEdBQU4sRUFDSixJQURJLENBQ0M7QUFBQSxXQUFPLElBQUksSUFBSixFQUFQO0FBQUEsR0FERCxFQUVKLElBRkksQ0FFQyxnQkFBUTtBQUNaLFFBQU0sUUFBUSxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsZ0JBQVE7QUFDbkMsYUFBTztBQUNMLFlBQUksS0FBSyxFQURKO0FBRUwsZUFBTyxLQUFLLE9BQUwsQ0FBYSxLQUZmO0FBR0wscUJBQWEsS0FBSyxPQUFMLENBQWEsV0FIckI7QUFJTCxvQkFBWSxLQUFLLE9BQUwsQ0FBYSxVQUpwQjtBQUtMLHNCQUFjLEtBQUssT0FBTCxDQUFhLFlBTHRCO0FBTUwsbUJBQVcsS0FBSyxPQUFMLENBQWE7QUFObkIsT0FBUDtBQVFELEtBVGEsQ0FBZDtBQVVBLFFBQU0sVUFBVSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLElBQWxCLEVBQXdCLEVBQUMsWUFBRCxFQUF4QixDQUFoQjtBQUNBLFdBQU8sT0FBUDtBQUNELEdBZkksQ0FBUDtBQWdCRDs7QUFFRCxTQUFTLFdBQVQsQ0FBcUIsRUFBckIsRUFBeUIsSUFBekIsRUFBK0I7QUFDN0IsTUFBTSxXQUFXLGVBQWpCO0FBQ0EsTUFBTSxvQkFBa0IsR0FBeEI7QUFDQSxNQUFNLHFCQUFOO0FBQ0EsTUFBTSxTQUFZLElBQVosa0NBQTZDLFFBQW5EOztBQUVBLE1BQUksTUFBUyxPQUFULFNBQW9CLFFBQXBCLFNBQWdDLE1BQXBDOztBQUVBLE1BQUksU0FBUyxzQkFBWSxPQUF6QixFQUFrQztBQUNoQyxXQUFPLG1CQUFtQixFQUFuQixFQUNKLElBREksQ0FDQyxxQkFBYTtBQUNqQixhQUFPLGlCQUFvQixHQUFwQixvQkFBc0MsU0FBdEMsQ0FBUDtBQUNELEtBSEksQ0FBUDtBQUlELEdBTEQsTUFLTztBQUNMLFdBQU8saUJBQW9CLEdBQXBCLG9CQUFzQyxFQUF0QyxDQUFQO0FBQ0Q7QUFDRjs7QUFFRCxTQUFTLGdCQUFULENBQTBCLEdBQTFCLEVBQStCO0FBQzdCLFNBQU8sbUJBQW1CLEdBQW5CLENBQVA7QUFDRDs7QUFFRDs7O0FBR0EsU0FBUyxrQkFBVCxDQUE0QixHQUE1QixFQUE4RDtBQUFBLE1BQTdCLE9BQTZCLHVFQUFuQixFQUFtQjtBQUFBLE1BQWYsYUFBZTs7QUFDNUQsTUFBSSxTQUFVLGFBQUQsR0FDTixHQURNLG1CQUNXLGFBRFgsR0FFVCxHQUZKOztBQUlBLFNBQU8sTUFBTSxNQUFOLEVBQ0osSUFESSxDQUNDO0FBQUEsV0FBTyxJQUFJLElBQUosRUFBUDtBQUFBLEdBREQsRUFFSixJQUZJLENBRUMsZ0JBQVE7O0FBRVosUUFBSSxRQUFRLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxnQkFBUTtBQUNqQyxhQUFPO0FBQ0wsZUFBTyxLQUFLLE9BQUwsQ0FBYSxLQURmO0FBRUwsaUJBQVMsS0FBSyxPQUFMLENBQWEsVUFBYixDQUF3QixPQUY1QjtBQUdMLG9CQUFZLEtBQUssT0FBTCxDQUFhO0FBSHBCLE9BQVA7QUFLRCxLQU5XLENBQVo7O0FBUUEsY0FBVSxRQUFRLE1BQVIsQ0FBZSxLQUFmLENBQVY7O0FBRUEsUUFBSSxLQUFLLGFBQVQsRUFBd0I7QUFDdEIsYUFBTyxtQkFBbUIsR0FBbkIsRUFBd0IsT0FBeEIsRUFBaUMsS0FBSyxhQUF0QyxDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsVUFBTSxVQUFVLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsSUFBbEIsRUFBd0IsRUFBQyxPQUFPLE9BQVIsRUFBeEIsQ0FBaEI7QUFDQSxhQUFPLE9BQVA7QUFDRDtBQUNGLEdBcEJJLENBQVA7QUFxQkQ7O0FBRUQ7Ozs7QUFJQSxTQUFTLGtCQUFULENBQTRCLEVBQTVCLEVBQWdDO0FBQzlCLE1BQU0scUNBQW1DLEVBQW5DLGFBQTZDLEdBQW5EO0FBQ0EsTUFBTSxNQUFTLE9BQVQsa0JBQTZCLE1BQW5DO0FBQ0EsU0FBTyxNQUFNLEdBQU4sRUFDSixJQURJLENBQ0M7QUFBQSxXQUFPLElBQUksSUFBSixFQUFQO0FBQUEsR0FERCxFQUVKLElBRkksQ0FFQyxnQkFBUTtBQUNaLFdBQU8sS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLGNBQWQsQ0FBNkIsZ0JBQTdCLENBQThDLE9BQXJEO0FBQ0QsR0FKSSxDQUFQO0FBS0Q7O1FBR0MsVyxHQUFBLFc7UUFDQSxVLEdBQUEsVTtRQUNBLHFCLEdBQUEscUI7Ozs7Ozs7OztBQ3BJRjs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNLGNBQWMsU0FBZCxXQUFjLE9BRWQ7QUFBQSxNQUZpQixLQUVqQixRQUZpQixLQUVqQjtBQUFBLE1BRndCLGNBRXhCLFFBRndCLGNBRXhCO0FBQUEsTUFESixXQUNJLFFBREosV0FDSTtBQUFBLE1BRFMsZ0JBQ1QsUUFEUyxnQkFDVDtBQUFBLE1BRDJCLFVBQzNCLFFBRDJCLFVBQzNCOztBQUNKLE1BQU0saUJBQWlCLE1BQXZCO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUdPLE1BQU0sR0FBTixDQUFVLGdCQUFRO0FBQ2pCO0FBQUEsWUFFUSxLQUFLLEVBRmI7QUFBQSxlQUdXLEtBQUssS0FIaEI7QUFBQSxvQkFJZ0IsS0FBSyxVQUpyQjtBQUFBLGlCQUthLFdBTGI7QUFBQSwwQkFNc0I7QUFOdEI7QUFTRCxHQVZBLENBSFA7QUFBQSxhQWVlO0FBZmY7QUFBQSxhQWdCb0IsY0FoQnBCO0FBQUEsZ0JBZ0I2QyxDQUFDO0FBaEI5QztBQUFBLGVBaUJpQjtBQWpCakI7QUFxQkQsQ0F6QkQ7O2tCQTJCZSxXOzs7Ozs7Ozs7QUM5QmY7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxjQUFjLFNBQWQsV0FBYyxPQUEwRDtBQUFBLE1BQXZELEVBQXVELFFBQXZELEVBQXVEO0FBQUEsTUFBbkQsS0FBbUQsUUFBbkQsS0FBbUQ7QUFBQSxNQUE1QyxVQUE0QyxRQUE1QyxVQUE0QztBQUFBLE1BQWhDLFFBQWdDLFFBQWhDLE9BQWdDO0FBQUEsTUFBdkIsZ0JBQXVCLFFBQXZCLGdCQUF1Qjs7QUFDNUUsTUFBSSxZQUFZLEVBQWhCO0FBQ0EsVUFBUSxNQUFNLE1BQU4sR0FBZSxTQUFmLEdBQ0osTUFBTSxTQUFOLENBQWdCLENBQWhCLEVBQW1CLEVBQW5CLEVBQXVCLE1BQXZCLENBQThCLEtBQTlCLENBREksR0FFSixLQUZKO0FBR0E7QUFBQSxhQUVlO0FBRmY7QUFBQSxZQUdjO0FBSGQ7QUFBQSxXQUlrQixXQUFXLElBQVgsQ0FBZ0I7QUFKbEM7QUFBQSxlQUcyQjtBQUFBLGFBQUssU0FBUSxDQUFSLEVBQVcsRUFBWCxDQUFMO0FBQUE7QUFIM0I7QUFBQSxhQU1pQjtBQU5qQjtBQUFBLGFBT2tCO0FBUGxCLFdBT3lDLEtBUHpDO0FBQUEsYUFRc0I7QUFSdEI7QUFBQSxlQVNtQixpQkFBaUIsSUFBakIsQ0FBc0IsSUFBdEIsRUFBNEIsRUFBNUIsRUFBZ0Msc0JBQVksT0FBNUM7QUFUbkI7QUFpQkQsQ0F0QkQ7O2tCQXdCZSxXOzs7Ozs7Ozs7QUMzQmY7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSx1QkFBdUIsU0FBdkIsb0JBQXVCLE9BQTBDO0FBQUEsTUFBdkMsa0JBQXVDLFFBQXZDLGtCQUF1QztBQUFBLE1BQW5CLFlBQW1CLFFBQW5CLFlBQW1COztBQUNyRSxNQUFJLDJCQUFKO0FBQUEsTUFBd0IsMEJBQXhCO0FBQ0EsdUJBQXFCLENBQUMsUUFBRCxFQUFXLFdBQVgsQ0FBckI7QUFDQSxzQkFBb0IsQ0FBQyxRQUFELEVBQVcsV0FBWCxDQUFwQjtBQUNBLE1BQUksaUJBQWlCLHNCQUFZLFFBQWpDLEVBQTJDLG1CQUFtQixJQUFuQixDQUF3QixRQUF4QixFQUEzQyxLQUNLLElBQUksaUJBQWlCLHNCQUFZLE9BQWpDLEVBQTBDLGtCQUFrQixJQUFsQixDQUF1QixRQUF2Qjs7QUFFL0M7QUFBQSxhQUNhO0FBRGI7QUFBQSxZQUVpQixRQUZqQjtBQUFBLGFBRWlDLG1CQUFtQixJQUFuQixDQUF3QixHQUF4QjtBQUZqQztBQUFBLGVBR2UsbUJBQW1CLElBQW5CLENBQXdCLElBQXhCLEVBQThCLHNCQUFZLFFBQTFDO0FBSGY7QUFBQSxZQU9pQixRQVBqQjtBQUFBLGFBT2lDLGtCQUFrQixJQUFsQixDQUF1QixHQUF2QjtBQVBqQztBQUFBLGVBUWUsbUJBQW1CLElBQW5CLENBQXdCLElBQXhCLEVBQThCLHNCQUFZLE9BQTFDO0FBUmY7QUFhRCxDQXBCRDs7a0JBc0JlLG9COzs7Ozs7Ozs7QUN6QmY7Ozs7OztBQUVBLElBQU0sTUFBTSxTQUFOLEdBQU0sT0FBa0I7QUFBQSxNQUFmLFFBQWUsUUFBZixRQUFlOztBQUM1QjtBQUFBLGFBQ2E7QUFEYjtBQUFBLGFBRWEsTUFGYjtBQUFBLFlBRXlCO0FBRnpCO0FBQUEsYUFJb0I7QUFKcEI7QUFBQSxhQUkrQztBQUovQyxrQkFPSyxRQVBMO0FBQUEsYUFTZTtBQVRmO0FBY0QsQ0FmRDs7a0JBaUJlLEc7Ozs7Ozs7Ozs7O0FDbkJmLElBQU0sU0FBUyxTQUFULE1BQVMsT0FBcUI7QUFBQSxNQUFsQixXQUFrQixRQUFsQixXQUFrQjs7QUFDbEMsTUFBTSxnQkFBZ0IsY0FBYyxVQUFkLEdBQTJCLEVBQWpEOztBQUVBO0FBQUEseUJBQ3dCO0FBRHhCO0FBQUE7QUFBQTtBQUFBLFVBR2M7QUFIZDtBQVNELENBWkQ7O2tCQWNlLE07Ozs7Ozs7Ozs7O0FDZGYsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsT0FFakI7QUFBQSxNQURKLE1BQ0ksUUFESixNQUNJO0FBQUEsTUFESSxVQUNKLFFBREksVUFDSjtBQUFBLE1BRGdCLFFBQ2hCLFFBRGdCLFFBQ2hCO0FBQUEsTUFEMEIsU0FDMUIsUUFEMEIsU0FDMUI7QUFBQSxNQURxQyxpQkFDckMsUUFEcUMsaUJBQ3JDO0FBQUEsTUFEd0QsY0FDeEQsUUFEd0QsY0FDeEQ7O0FBQ0osTUFBTSxPQUFPLFlBQVksR0FBWixHQUFrQixHQUEvQjtBQUNBLE1BQU0sZUFBZSxHQUFyQjtBQUNBLE1BQU0sbUJBQW1CLG9CQUFvQixFQUFwQixHQUF5QixNQUFsRDtBQUNBO0FBQUEsYUFDYTtBQURiO0FBQUEsYUFFYztBQUZkO0FBQUEsYUFHZ0I7QUFIaEI7QUFBQSxhQUt3QjtBQUx4QjtBQUFBLGVBSzJDO0FBTDNDO0FBQUEsYUFTd0I7QUFUeEIsS0FTc0QsSUFUdEQ7QUFBQSxlQVMyQztBQVQzQztBQUFBLGFBYXdCO0FBYnhCO0FBQUEsZUFhMkM7QUFiM0M7QUFBQSxhQWlCaUI7QUFqQmpCO0FBQUE7QUFBQTtBQUFBLGlDQW9CMEM7QUFwQjFDLEtBcUJhLFlBckJiO0FBQUEsZUFtQm1CO0FBbkJuQjtBQTZCRCxDQW5DRDs7a0JBcUNlLGM7Ozs7Ozs7OztBQ3JDZjs7Ozs7O0FBRUEsSUFBTSxXQUFXLFNBQVgsUUFBVyxPQUFvRDtBQUFBLE1BQWpELElBQWlELFFBQWpELElBQWlEO0FBQUEsTUFBM0MsV0FBMkMsUUFBM0MsV0FBMkM7QUFBQSxNQUE5QixTQUE4QixRQUE5QixTQUE4QjtBQUFBLE1BQW5CLFlBQW1CLFFBQW5CLFlBQW1COztBQUNuRSxNQUFNLHFCQUFxQixZQUFZLE1BQVosR0FBcUIsRUFBaEQ7QUFDQTtBQUFBLHVDQUNxQztBQURyQyxLQUVLLEtBQUssR0FBTCxDQUFTLFVBQUMsR0FBRCxFQUFNLEtBQU4sRUFBZ0I7QUFDeEIsUUFBSSxXQUFXLGdCQUFnQixLQUEvQjtBQUNBLHlDQUNHLElBREg7QUFBQSxpQkFFYSxJQUFJLE9BRmpCO0FBQUEsZUFHVyxJQUFJLEtBSGY7QUFBQSxlQUlXLEtBSlg7QUFBQSxrQkFLYyxRQUxkO0FBQUEsaUJBTWE7QUFOYjtBQVNELEdBWEEsQ0FGTDtBQWdCRCxDQWxCRDs7QUFvQkEsSUFBTSxPQUFPLFNBQVAsSUFBTyxRQUFrRDtBQUFBLE1BQS9DLEtBQStDLFNBQS9DLEtBQStDO0FBQUEsTUFBeEMsT0FBd0MsU0FBeEMsT0FBd0M7QUFBQSxNQUEvQixLQUErQixTQUEvQixLQUErQjtBQUFBLE1BQXhCLFFBQXdCLFNBQXhCLFFBQXdCO0FBQUEsTUFBZCxRQUFjLFNBQWQsT0FBYzs7QUFDN0QsTUFBTSxjQUFjLFdBQVcsUUFBWCxHQUFzQixFQUExQztBQUNBO0FBQUEsaUJBQ2lCO0FBRGpCLEtBRUssS0FGTDtBQUFBLGVBQ3VDO0FBQUEsYUFBTSxTQUFRLE9BQVIsRUFBaUIsS0FBakIsQ0FBTjtBQUFBO0FBRHZDO0FBS0QsQ0FQRDs7a0JBU2UsUTs7Ozs7Ozs7O0FDL0JmOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU0sZUFBZSxTQUFmLFlBQWUsT0FFZjtBQUFBLE1BRmtCLEtBRWxCLFFBRmtCLEtBRWxCO0FBQUEsTUFGeUIsU0FFekIsUUFGeUIsU0FFekI7QUFBQSxNQUZvQyxRQUVwQyxRQUZvQyxRQUVwQztBQUFBLE1BRjhDLGNBRTlDLFFBRjhDLGNBRTlDO0FBQUEsTUFESixXQUNJLFFBREosV0FDSTtBQUFBLE1BRFMsZ0JBQ1QsUUFEUyxnQkFDVDtBQUFBLE1BRDJCLFVBQzNCLFFBRDJCLFVBQzNCOztBQUNKLE1BQU0saUJBQWlCLE1BQXZCO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUdTLE1BQU0sR0FBTixDQUFVLGdCQUFRO0FBQ2pCO0FBQUEsWUFFUSxLQUFLLEVBRmI7QUFBQSxtQkFHZSxLQUFLLFNBSHBCO0FBQUEsZUFJVyxLQUFLLEtBSmhCO0FBQUEsb0JBS2dCLEtBQUssVUFMckI7QUFBQSxpQkFNYSxXQU5iO0FBQUEsa0JBT2MsUUFQZDtBQUFBLDBCQVFzQjtBQVJ0QjtBQVdELEdBWkEsQ0FIVDtBQUFBLGFBaUJpQjtBQWpCakI7QUFBQSxhQWtCc0IsY0FsQnRCO0FBQUEsZ0JBa0IrQyxDQUFDO0FBbEJoRDtBQUFBLGVBbUJtQjtBQW5CbkI7QUF3QkQsQ0E1QkQ7O2tCQThCZSxZOzs7Ozs7Ozs7QUNqQ2Y7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxlQUFlLFNBQWYsWUFBZSxPQUVmO0FBQUEsTUFGa0IsRUFFbEIsUUFGa0IsRUFFbEI7QUFBQSxNQUZzQixTQUV0QixRQUZzQixTQUV0QjtBQUFBLE1BRmlDLEtBRWpDLFFBRmlDLEtBRWpDO0FBQUEsTUFGd0MsVUFFeEMsUUFGd0MsVUFFeEM7QUFBQSxNQURKLFFBQ0ksUUFESixPQUNJO0FBQUEsTUFESyxnQkFDTCxRQURLLGdCQUNMO0FBQUEsTUFEdUIsUUFDdkIsUUFEdUIsUUFDdkI7O0FBQ0osTUFBSSxZQUFZLEVBQWhCO0FBQ0EsVUFBUSxNQUFNLE1BQU4sR0FBZSxTQUFmLEdBQ0osTUFBTSxTQUFOLENBQWdCLENBQWhCLEVBQW1CLEVBQW5CLEVBQXVCLE1BQXZCLENBQThCLEtBQTlCLENBREksR0FFSixLQUZKO0FBR0E7QUFBQSxhQUVlO0FBRmY7QUFBQSxZQUdjO0FBSGQ7QUFBQSxXQUlrQixXQUFXLElBQVgsQ0FBZ0I7QUFKbEM7QUFBQSxlQUcyQjtBQUFBLGFBQUssU0FBUSxDQUFSLEVBQVcsRUFBWCxDQUFMO0FBQUE7QUFIM0I7QUFBQSxhQU1pQjtBQU5qQjtBQUFBLGFBT2tCO0FBUGxCLFdBT3lDLEtBUHpDLFNBU1csYUFBYSxzQkFBWSxRQUExQjtBQUFBLGFBQ2tCO0FBRGxCO0FBQUEsZUFFYSxpQkFBaUIsSUFBakIsQ0FBc0IsSUFBdEIsRUFBNEIsU0FBNUIsRUFBdUMsc0JBQVksT0FBbkQ7QUFGYiwyQ0FUVjtBQXVCRCxDQTlCRDs7a0JBZ0NlLFk7Ozs7Ozs7OztBQ25DZjs7Ozs7O0FBRUEsSUFBTSxZQUFZLFNBQVosU0FBWSxPQUF5QztBQUFBLE1BQXRDLE9BQXNDLFFBQXRDLE9BQXNDO0FBQUEsTUFBN0IsUUFBNkIsUUFBN0IsUUFBNkI7QUFBQSxNQUFuQixZQUFtQixRQUFuQixZQUFtQjs7QUFDekQ7QUFBQSxpQkFDa0I7QUFEbEI7QUFBQSxpQkFFcUIsd0JBRnJCO0FBQUEsWUFFbUQsTUFGbkQ7QUFBQSwrQkFHNkIsWUFIN0I7QUFBQTtBQUFBLGVBSWU7QUFKZjtBQUFBLGFBTWtCLGdDQU5sQjtBQUFBLFlBTXdEO0FBTnhEO0FBQUEsZ0JBQ3lDO0FBRHpDO0FBV0QsQ0FaRDs7a0JBY2UsUzs7Ozs7Ozs7QUNoQmYsSUFBTSxlQUFlO0FBQ25CLFlBQVUsS0FEUztBQUVuQixhQUFXLE1BRlE7QUFHbkIsZUFBYTtBQUhNLENBQXJCOztrQkFNZSxZOzs7Ozs7OztBQ05mLElBQU0sY0FBYztBQUNsQixZQUFVLFVBRFE7QUFFbEIsV0FBUztBQUZTLENBQXBCOztrQkFLZSxXOzs7Ozs7OztBQ0xmLElBQU0sY0FBYztBQUNsQixhQUFXLENBQUMsQ0FETTtBQUVsQixTQUFPLENBRlc7QUFHbEIsV0FBUyxDQUhTO0FBSWxCLFVBQVEsQ0FKVTtBQUtsQixhQUFXLENBTE87QUFNbEIsY0FBWTtBQU5NLENBQXBCOztrQkFTZSxXOzs7Ozs7OztBQ1RmLElBQU0sYUFBYTtBQUNqQixnQkFBYyxPQUFPLFlBQVAsQ0FERztBQUVqQixnQkFBYyxPQUFPLFlBQVA7QUFGRyxDQUFuQjs7a0JBS2UsVTs7Ozs7Ozs7Ozs7QUNMZjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7Ozs7Ozs7SUFJTSxZOzs7QUFDSix3QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsNEhBQ1gsS0FEVzs7QUFFakIsVUFBSyxLQUFMLEdBQWE7QUFDWCxjQUFRLElBREc7QUFFWCxhQUFPLEVBRkk7QUFHWCxZQUFNLEVBSEs7QUFJWCxlQUFTLEVBSkU7QUFLWCx3QkFBa0IsRUFMUDtBQU1YLG1CQUFhLElBTkY7QUFPWCx5QkFBbUIsSUFQUjtBQVFYLG9CQUFjLHNCQUFZLFFBUmY7QUFTWCxnQkFBVSxzQkFBWSxRQVRYO0FBVVgsa0JBQVkscUJBQVcsVUFWWjtBQVdYLGlCQUFXLEtBWEE7QUFZWCx5QkFBbUIsS0FaUjtBQWFYLHlCQUFtQjtBQWJSLEtBQWI7O0FBZ0JBLFVBQUssaUJBQUwsR0FBeUIsTUFBSyxpQkFBTCxDQUF1QixJQUF2QixPQUF6QjtBQUNBLFVBQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsT0FBcEI7QUFDQSxVQUFLLGVBQUwsR0FBdUIsTUFBSyxlQUFMLENBQXFCLElBQXJCLE9BQXZCO0FBQ0EsVUFBSyxnQkFBTCxHQUF3QixNQUFLLGdCQUFMLENBQXNCLElBQXRCLE9BQXhCO0FBQ0EsVUFBSyxlQUFMLEdBQXVCLE1BQUssZUFBTCxDQUFxQixJQUFyQixPQUF2QjtBQUNBLFVBQUssbUJBQUwsR0FBMkIsTUFBSyxtQkFBTCxDQUF5QixJQUF6QixPQUEzQjtBQUNBO0FBQ0E7QUFDQSxVQUFLLFlBQUwsR0FBb0IsTUFBSyxZQUFMLENBQWtCLElBQWxCLE9BQXBCOztBQUVBLFVBQUssa0JBQUwsR0FBMEIsTUFBSyxrQkFBTCxDQUF3QixJQUF4QixPQUExQjtBQUNBLFVBQUssdUJBQUwsR0FBK0IsTUFBSyx1QkFBTCxDQUE2QixJQUE3QixPQUEvQjtBQUNBLFVBQUssb0JBQUwsR0FBNEIsTUFBSyxvQkFBTCxDQUEwQixJQUExQixPQUE1QjtBQUNBLFVBQUssY0FBTCxHQUFzQixNQUFLLGNBQUwsQ0FBb0IsSUFBcEIsT0FBdEI7QUFDQSxVQUFLLGNBQUwsR0FBc0IsTUFBSyxjQUFMLENBQW9CLElBQXBCLE9BQXRCO0FBaENpQjtBQWlDbEI7Ozs7d0NBRW1CO0FBQUE7O0FBQ2xCLFdBQUssUUFBTCxDQUFjO0FBQ1osZ0JBQVEsNkJBQWMsY0FBZDtBQURJLE9BQWQsRUFFRyxZQUFNO0FBQ1AsZUFBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixFQUFsQixDQUFxQixhQUFyQixFQUFvQyxhQUFLO0FBQ3ZDLGNBQU0sUUFBUSxFQUFFLE1BQUYsQ0FBUyxjQUFULEVBQWQ7O0FBRUEsa0JBQU8sS0FBUDtBQUNBLGlCQUFLLHNCQUFZLEtBQWpCO0FBQ0UscUJBQUssZUFBTDtBQUNBO0FBQ0YsaUJBQUssc0JBQVksT0FBakI7QUFDRSxxQkFBSyxRQUFMLENBQWMsRUFBRSxXQUFXLElBQWIsRUFBZDtBQUNBO0FBQ0YsaUJBQUssc0JBQVksTUFBakI7QUFDRSxxQkFBSyxRQUFMLENBQWMsRUFBRSxXQUFXLEtBQWIsRUFBZDtBQVJGO0FBVUQsU0FiRDtBQWNELE9BakJEO0FBa0JEOzs7cUNBRWdCO0FBQ2YsYUFBTyxRQUFRLEtBQUssS0FBTCxDQUFXLGdCQUFuQixDQUFQO0FBQ0Q7OztzQ0FFaUIsQyxFQUFHO0FBQ25CLFdBQUssUUFBTCxDQUFjO0FBQ1osZUFBTyxFQUFFLE1BQUYsQ0FBUztBQURKLE9BQWQ7QUFHRDs7OzRDQUV1QixJLEVBQU07QUFDNUIsV0FBSyxRQUFMLENBQWM7QUFDWixpQkFBUyxFQURHO0FBRVosMEJBQWtCLEVBRk47QUFHWixzQkFBYyxJQUhGO0FBSVosMkJBQW1CO0FBSlAsT0FBZDtBQU1EOzs7aUNBRVksQyxFQUFHO0FBQUE7O0FBQ2QsUUFBRSxjQUFGOztBQUVBLFVBQUksS0FBSyxLQUFMLENBQVcsS0FBWCxLQUFxQixFQUF6QixFQUE2Qjs7QUFFN0IsV0FBSyxRQUFMLENBQWM7QUFDWixpQkFBUyxFQURHO0FBRVosMEJBQWtCLEVBRk47QUFHWixvQkFBWSxxQkFBVyxVQUhYO0FBSVosMkJBQW1CLEtBSlA7QUFLWiwyQkFBbUIsSUFMUDtBQU1aLDJCQUFtQjtBQU5QLE9BQWQsRUFPRyxZQUFNO0FBQ1AsZUFBSyxVQUFMLENBQ0UsT0FBSyxLQUFMLENBQVcsS0FEYixFQUVFLE9BQUssS0FBTCxDQUFXLFlBRmIsRUFHRSxPQUFLLEtBQUwsQ0FBVyxnQkFIYjtBQUtELE9BYkQ7QUFjRDs7O3lDQUVvQixFLEVBQUksUSxFQUFVO0FBQUE7O0FBQ2pDLFdBQUssUUFBTCxDQUFjO0FBQ1osb0JBQVkscUJBQVcsVUFEWDtBQUVaLGlCQUFTLEVBRkc7QUFHWiwwQkFBa0I7QUFITixPQUFkLEVBSUc7QUFBQSxlQUFNLE9BQUssY0FBTCxDQUFvQixFQUFwQixFQUF3QixRQUF4QixDQUFOO0FBQUEsT0FKSDtBQUtEOzs7bUNBRWMsRSxFQUFJLFEsRUFBVTtBQUFBOztBQUMzQiw0Q0FBc0IsRUFBdEIsRUFBMEIsS0FBSyxLQUFMLENBQVcsZ0JBQXJDLEVBQ0csSUFESCxDQUNRLGdCQUFRO0FBQ1osWUFBSSxXQUFXO0FBQ2IsbUJBQVMsT0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixNQUFuQixDQUEwQixLQUFLLEtBQS9CLENBREk7QUFFYiw0QkFBa0IsS0FBSyxhQUZWO0FBR2Isd0JBQWMsc0JBQVksUUFIYjtBQUliLDZCQUFtQjtBQUpOLFNBQWY7QUFNQSxZQUFJLFFBQUosRUFBYyxXQUFXLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsUUFBbEIsRUFBNEIsRUFBQyxrQkFBRCxFQUE1QixDQUFYO0FBQ2QsZUFBSyxRQUFMLENBQWMsUUFBZDtBQUNELE9BVkgsRUFXRyxLQVhILENBV1M7QUFBQSxlQUFPLFFBQVEsR0FBUixDQUFZLFNBQVosRUFBdUIsR0FBdkIsQ0FBUDtBQUFBLE9BWFQ7QUFZRDs7O21DQUVjLEMsRUFBRztBQUNoQixjQUFRLEtBQUssS0FBTCxDQUFXLFVBQW5CO0FBQ0UsYUFBSyxxQkFBVyxVQUFoQjtBQUNFLGVBQUssVUFBTCxDQUNFLEtBQUssS0FBTCxDQUFXLEtBRGIsRUFFRSxLQUFLLEtBQUwsQ0FBVyxZQUZiLEVBR0UsS0FBSyxLQUFMLENBQVcsZ0JBSGI7QUFLQTtBQUNGLGFBQUsscUJBQVcsVUFBaEI7QUFDRSxlQUFLLGNBQUwsQ0FBb0IsS0FBSyxLQUFMLENBQVcsaUJBQS9CLEVBQWtELHNCQUFZLE9BQTlEO0FBQ0Y7QUFDRTtBQVhKO0FBYUQ7OzsrQkFFVSxLLEVBQU8sSSxFQUFNLGEsRUFBZTtBQUFBOztBQUNyQyxpQ0FBVyxLQUFYLEVBQWtCLElBQWxCLEVBQXdCLGFBQXhCLEVBQ0csSUFESCxDQUNRLGdCQUFRO0FBQ1osZUFBSyxRQUFMLENBQWM7QUFDWixtQkFBUyxPQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLE1BQW5CLENBQTBCLEtBQUssS0FBL0IsQ0FERztBQUVaLG9CQUFVLElBRkU7QUFHWiw0QkFBa0IsS0FBSztBQUhYLFNBQWQ7QUFLRCxPQVBILEVBUUcsS0FSSCxDQVFTO0FBQUEsZUFBTyxRQUFRLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLEdBQXZCLENBQVA7QUFBQSxPQVJUO0FBU0Q7OztvQ0FFZSxDLEVBQUcsRSxFQUFJO0FBQUE7O0FBQ3JCLFFBQUUsY0FBRjs7QUFFQSxXQUFLLGFBQUwsQ0FBbUIsRUFBbkIsRUFBdUIsS0FBSyxLQUFMLENBQVcsWUFBbEMsRUFDRyxJQURILENBQ1EsWUFBTTtBQUNWLFlBQUksQ0FBQyxPQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLE1BQWpCLEdBQTBCLENBQTlCLEVBQWlDOztBQUVqQyxlQUFLLFFBQUwsQ0FBYztBQUNaLHVCQUFhLENBREQ7QUFFWixxQkFBVyxJQUZDO0FBR1osNkJBQW1CO0FBSFAsU0FBZCxFQUlHLE9BQUssU0FBTCxDQUFlLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEIsRUFBbUIsT0FBbEMsQ0FKSDtBQUtELE9BVEgsRUFVRyxLQVZILENBVVM7QUFBQSxlQUFPLFFBQVEsR0FBUixDQUFZLFNBQVosRUFBdUIsR0FBdkIsQ0FBUDtBQUFBLE9BVlQ7QUFXRDs7O2tDQUVhLEUsRUFBSSxJLEVBQU07QUFBQTs7QUFDdEIsYUFBTyw0QkFBWSxFQUFaLEVBQWdCLElBQWhCLEVBQ0osSUFESSxDQUNDLGdCQUFRO0FBQ1osZUFBSyxRQUFMLENBQWM7QUFDWixnQkFBTSxLQUFLO0FBREMsU0FBZDtBQUdELE9BTEksQ0FBUDtBQU1EOzs7cUNBRWdCLEUsRUFBSSxLLEVBQU87QUFBQTs7QUFDMUIsV0FBSyxRQUFMLENBQWM7QUFDWixxQkFBYSxLQUREO0FBRVosbUJBQVc7QUFGQyxPQUFkLEVBR0c7QUFBQSxlQUFNLE9BQUssU0FBTCxDQUFlLEVBQWYsQ0FBTjtBQUFBLE9BSEg7QUFLRDs7O21DQUVjO0FBQ2IsVUFBSSxLQUFLLEtBQUwsQ0FBVyxTQUFmLEVBQ0UsS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixVQUFsQixHQURGLEtBR0UsS0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixTQUFsQjs7QUFFRixXQUFLLFFBQUwsQ0FBYztBQUNaLG1CQUFXLENBQUMsS0FBSyxLQUFMLENBQVc7QUFEWCxPQUFkO0FBR0Q7OzswQ0FFcUI7QUFBQTs7QUFDcEIsVUFBTSxlQUFlLEtBQUssS0FBTCxDQUFXLFdBQVgsR0FBeUIsQ0FBOUM7QUFDQSxVQUFJLEVBQUUsZ0JBQWdCLENBQWxCLENBQUosRUFBMEI7O0FBRTFCLFdBQUssUUFBTCxDQUFjO0FBQ1oscUJBQWE7QUFERCxPQUFkLEVBRUc7QUFBQSxlQUFNLFFBQUssU0FBTCxDQUFlLFFBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsWUFBaEIsRUFBOEIsT0FBN0MsQ0FBTjtBQUFBLE9BRkg7QUFHRDs7O3NDQUVpQjtBQUFBOztBQUNoQixVQUFNLFdBQVcsS0FBSyxLQUFMLENBQVcsV0FBWCxHQUF5QixDQUExQztBQUNBLFVBQUksRUFBRSxXQUFXLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsTUFBN0IsQ0FBSixFQUEwQzs7QUFFMUMsV0FBSyxRQUFMLENBQWM7QUFDWixxQkFBYTtBQURELE9BQWQsRUFFRztBQUFBLGVBQU0sUUFBSyxTQUFMLENBQWUsUUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixRQUFoQixFQUEwQixPQUF6QyxDQUFOO0FBQUEsT0FGSDtBQUdEOzs7eUNBRW9CO0FBQ25CLFdBQUssUUFBTCxDQUFjO0FBQ1osMkJBQW1CLENBQUMsS0FBSyxLQUFMLENBQVc7QUFEbkIsT0FBZDtBQUdEOzs7OEJBRVMsRSxFQUFHO0FBQ1gsV0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixhQUFsQixDQUFnQyxFQUFoQztBQUNEOzs7NkJBRVE7QUFDUDtBQUFBLGlCQUVrQjtBQUZsQjtBQUFBO0FBQUEsMEJBS3dCLEtBQUssS0FBTCxDQUFXLFlBTG5DO0FBQUEscUJBTW1CLEtBQUssaUJBTnhCO0FBQUEsc0JBT29CLEtBQUs7QUFQekI7QUFBQTtBQUFBLDhCQVc0QixLQUFLLHVCQVhqQztBQUFBLHdCQVlzQixLQUFLLEtBQUwsQ0FBVztBQVpqQztBQUFBLGlCQWdCZTtBQWhCZixVQWtCUyxLQUFLLEtBQUwsQ0FBVyxZQUFYLEtBQTRCLHNCQUFZLE9BQXpDO0FBQUEsaUJBRVcsS0FBSyxLQUFMLENBQVcsT0FGdEI7QUFBQSwwQkFHb0IsS0FBSyxjQUh6QjtBQUFBLHVCQUlpQixLQUFLLGVBSnRCO0FBQUEsNEJBS3NCLEtBQUssb0JBTDNCO0FBQUEsc0JBTWdCLEtBQUs7QUFOckI7QUFBQSxpQkFXVyxLQUFLLEtBQUwsQ0FBVyxPQVh0QjtBQUFBLG9CQVljLEtBQUssS0FBTCxDQUFXLFFBWnpCO0FBQUEsMEJBYW9CLEtBQUssY0FiekI7QUFBQSx1QkFjaUIsS0FBSyxlQWR0QjtBQUFBLDRCQWVzQixLQUFLLG9CQWYzQjtBQUFBLHNCQWdCZ0IsS0FBSztBQWhCckIsUUFsQlI7QUFBQSxnQkF1Q2MsS0FBSyxLQUFMLENBQVcsSUF2Q3pCO0FBQUEsd0JBd0NzQixLQUFLLGdCQXhDM0I7QUFBQSx1QkF5Q3FCLEtBQUssS0FBTCxDQUFXLFdBekNoQztBQUFBLHFCQTBDbUIsS0FBSyxLQUFMLENBQVc7QUExQzlCO0FBQUEsdUJBK0NtQixLQUFLLEtBQUwsQ0FBVztBQS9DOUI7QUFBQSxrQkFtRGMsS0FBSyxlQW5EbkI7QUFBQSxzQkFvRGtCLEtBQUssbUJBcER2QjtBQUFBLG9CQXFEZ0IsS0FBSyxZQXJEckI7QUFBQSw2QkFzRHlCLEtBQUssS0FBTCxDQUFXLGlCQXREcEM7QUFBQSxxQkF1RGlCLEtBQUssS0FBTCxDQUFXLFNBdkQ1QjtBQUFBLDBCQXdEc0IsS0FBSztBQXhEM0I7QUE2REQ7Ozs7OztrQkFHWSxZOzs7OztBQ2pUZjs7Ozs7O0FBREEsSUFBTSxVQUFVLFFBQVEsaUJBQVIsRUFBMkIsSUFBM0M7OztBQUdBLElBQUksWUFBYSxZQUFXO0FBQzFCLFNBQVEsWUFBWSx1QkFBYSxRQUExQixHQUNILFFBQVEsK0JBQVIsQ0FERyxHQUVILFFBQVEsUUFBUixDQUZKO0FBR0QsQ0FKZSxFQUFoQjs7QUFNQSxPQUFPLE9BQVAsR0FBaUIsU0FBakI7Ozs7O0FDVEE7Ozs7QUFDQTs7Ozs7O0FBRUEsa0JBQVEsTUFBUix3REFBaUMsU0FBUyxjQUFULENBQXdCLEtBQXhCLENBQWpDOzs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBOztBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7O0FDRkE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBOzs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JpRkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMzcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM1R0EsSUFBSSxXQUFXLFFBQVEsc0JBQVIsQ0FBZjtBQUNBLElBQUksU0FBUyxRQUFRLG9CQUFSLENBQWI7O0FBRUEsU0FBUyxVQUFULENBQW9CLENBQXBCLEVBQXVCO0FBQ3JCLFNBQU8sUUFBUSxPQUFSLENBQWdCLFFBQWhCLENBQVA7QUFDRDs7QUFFRCxTQUFTLFdBQVQsR0FBdUI7QUFDckIsU0FBTyxRQUFRLE9BQVIsQ0FBZ0IsTUFBaEIsQ0FBUDtBQUNEOztBQUVELFNBQVMscUJBQVQsR0FBaUM7QUFDL0IsU0FBTyxRQUFRLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBUDtBQUNEOztRQUdDLFUsR0FBQSxVO1FBQ0EsVyxHQUFBLFc7UUFDQSxxQixHQUFBLHFCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IGtleSA9IHJlcXVpcmUoJy4uLy4uL2NyZWRlbnRpYWxzJykua2V5XG5pbXBvcnQgQ29udGVudFR5cGUgZnJvbSAnLi4vY29uc3RhbnRzL0NvbnRlbnRUeXBlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICcuLi9jb25zdGFudHMvQXBwQ29uc3RhbnRzJ1xuXG5jb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3lvdXR1YmUvdjNgXG5cbmZ1bmN0aW9uIGdldENvbnRlbnQocXVlcnksIHR5cGUsIHBhZ2VUb2tlbiA9ICcnKSB7XG4gIGNvbnN0IHJlc291cmNlID0gJ3NlYXJjaCdcbiAgbGV0IHBhcmFtcyA9IGBwYXJ0PXNuaXBwZXQma2V5PSR7a2V5fSZ0eXBlPSR7dHlwZX1gXG4gIHBhcmFtcyArPSBgJm1heFJlc3VsdHM9JHtBcHBDb25zdGFudHMuTUFYX1JFU1VMVFN9YFxuICBsZXQgdXJsID0gYCR7YmFzZVVybH0vJHtyZXNvdXJjZX0/JHtwYXJhbXN9JnE9JHtxdWVyeX1gXG5cbiAgaWYgKHBhZ2VUb2tlbiAhPT0gJycpIHtcbiAgICB1cmwgKz0gYCZwYWdlVG9rZW49JHtwYWdlVG9rZW59YFxuICB9XG5cbiAgcmV0dXJuIGZldGNoKHVybClcbiAgICAudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gZGF0YS5pdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGl0ZW0uaWRbYCR7dHlwZX1JZGBdLFxuICAgICAgICAgIHRpdGxlOiBpdGVtLnNuaXBwZXQudGl0bGUsXG4gICAgICAgICAgdGh1bWJuYWlsczogaXRlbS5zbmlwcGV0LnRodW1ibmFpbHMsXG4gICAgICAgICAgY2hhbm5lbElkOiBpdGVtLnNuaXBwZXQuY2hhbm5lbElkLFxuICAgICAgICAgIGNoYW5uZWxUaXRsZTogaXRlbS5zbmlwcGV0LmNoYW5uZWxUaXRsZVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBjb25zdCBuZXdEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwge2l0ZW1zfSlcbiAgICAgIHJldHVybiBuZXdEYXRhXG4gICAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0UGxheWxpc3RzQnlDaGFubmVsKGNoYW5uZWxJZCwgcGFnZVRva2VuID0gJycpIHtcbiAgY29uc3QgcmVzb3VyY2UgPSAncGxheWxpc3RzJ1xuICBsZXQgcGFyYW1zID0gYHBhcnQ9c25pcHBldCZrZXk9JHtrZXl9YFxuICBwYXJhbXMgKz0gYCZtYXhSZXN1bHRzPSR7QXBwQ29uc3RhbnRzLk1BWF9SRVNVTFRTfWBcbiAgbGV0IHVybCA9IGAke2Jhc2VVcmx9LyR7cmVzb3VyY2V9PyR7cGFyYW1zfSZjaGFubmVsSWQ9JHtjaGFubmVsSWR9YFxuXG4gIGlmIChwYWdlVG9rZW4gIT09ICcnKSB7XG4gICAgdXJsICs9IGAmcGFnZVRva2VuPSR7cGFnZVRva2VufWBcbiAgfVxuXG4gIHJldHVybiBmZXRjaCh1cmwpXG4gICAgLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICBjb25zdCBpdGVtcyA9IGRhdGEuaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgIHRpdGxlOiBpdGVtLnNuaXBwZXQudGl0bGUsXG4gICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uc25pcHBldC5kZXNjcmlwdGlvbixcbiAgICAgICAgICB0aHVtYm5haWxzOiBpdGVtLnNuaXBwZXQudGh1bWJuYWlscyxcbiAgICAgICAgICBjaGFubmVsVGl0bGU6IGl0ZW0uc25pcHBldC5jaGFubmVsVGl0bGUsXG4gICAgICAgICAgY2hhbm5lbElkOiBpdGVtLnNuaXBwZXQuY2hhbm5lbElkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBjb25zdCBuZXdEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwge2l0ZW1zfSlcbiAgICAgIHJldHVybiBuZXdEYXRhXG4gICAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0UGxheWxpc3QoaWQsIHR5cGUpIHtcbiAgY29uc3QgcmVzb3VyY2UgPSAncGxheWxpc3RJdGVtcydcbiAgY29uc3QgcGFyYW1LZXkgPSBga2V5PSR7a2V5fWBcbiAgY29uc3QgcGFydCA9IGBwYXJ0PXNuaXBwZXRgXG4gIGNvbnN0IHBhcmFtcyA9IGAke3BhcnR9Jm1heFJlc3VsdHM9NTAmb3JkZXI9ZGF0ZSYke3BhcmFtS2V5fWBcblxuICBsZXQgdXJsID0gYCR7YmFzZVVybH0vJHtyZXNvdXJjZX0/JHtwYXJhbXN9YFxuXG4gIGlmICh0eXBlID09PSBDb250ZW50VHlwZS5DSEFOTkVMKSB7XG4gICAgcmV0dXJuIGdldENoYW5uZWxQbGF5bGlzdChpZClcbiAgICAgIC50aGVuKHVwbG9hZHNJZCA9PiB7XG4gICAgICAgIHJldHVybiBnZXRQbGF5bGlzdEl0ZW1zKGAke3VybH0mcGxheWxpc3RJZD0ke3VwbG9hZHNJZH1gKVxuICAgICAgfSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZ2V0UGxheWxpc3RJdGVtcyhgJHt1cmx9JnBsYXlsaXN0SWQ9JHtpZH1gKVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBsYXlsaXN0SXRlbXModXJsKSB7XG4gIHJldHVybiBmZXRjaFBsYXlsaXN0SXRlbXModXJsKVxufVxuXG4vKlxuICBSZWN1cnNpdmUgZnVuY3Rpb24gdGhhdCBmZXRjaGVzIGFsbCB0aGUgUGxheWxpc3RJdGVtcy5cbiovXG5mdW5jdGlvbiBmZXRjaFBsYXlsaXN0SXRlbXModXJsLCByZXN1bHRzID0gW10sIG5leHRQYWdlVG9rZW4pIHtcbiAgbGV0IG5ld1VybCA9IChuZXh0UGFnZVRva2VuKVxuICAgID8gYCR7dXJsfSZwYWdlVG9rZW49JHtuZXh0UGFnZVRva2VufWBcbiAgICA6IHVybFxuXG4gIHJldHVybiBmZXRjaChuZXdVcmwpXG4gICAgLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG5cbiAgICAgIGxldCBpdGVtcyA9IGRhdGEuaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlOiBpdGVtLnNuaXBwZXQudGl0bGUsXG4gICAgICAgICAgdmlkZW9JZDogaXRlbS5zbmlwcGV0LnJlc291cmNlSWQudmlkZW9JZCxcbiAgICAgICAgICB0aHVtYm5haWxzOiBpdGVtLnNuaXBwZXQudGh1bWJuYWlsc1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoaXRlbXMpXG5cbiAgICAgIGlmIChkYXRhLm5leHRQYWdlVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIGZldGNoUGxheWxpc3RJdGVtcyh1cmwsIHJlc3VsdHMsIGRhdGEubmV4dFBhZ2VUb2tlbilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCB7aXRlbXM6IHJlc3VsdHN9KVxuICAgICAgICByZXR1cm4gbmV3RGF0YVxuICAgICAgfVxuICAgIH0pXG59XG5cbi8qIFRoZSBsaXN0IG9mIHZpZGVvcy91cGxvYWRzIGZyb20gYSBjaGFubmVsIGlzIHRyZWF0ZWQgYXNcbiAgIGEgUGxheWxpc3QsIHNvIHdlIGhhdmUgdG8gZ2V0IHRoaXMgaWQgdG8gaGFuZCBpdFxuICAgdG8gdGhlIHBsYXlsaXN0SXRlbXMgcmVzb3VyY2UuXG4qL1xuZnVuY3Rpb24gZ2V0Q2hhbm5lbFBsYXlsaXN0KGlkKSB7XG4gIGNvbnN0IHBhcmFtcyA9IGBwYXJ0PWNvbnRlbnREZXRhaWxzJmlkPSR7aWR9JmtleT0ke2tleX1gXG4gIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9L2NoYW5uZWxzPyR7cGFyYW1zfWBcbiAgcmV0dXJuIGZldGNoKHVybClcbiAgICAudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJldHVybiBkYXRhLml0ZW1zWzBdLmNvbnRlbnREZXRhaWxzLnJlbGF0ZWRQbGF5bGlzdHMudXBsb2Fkc1xuICAgIH0pXG59XG5cbmV4cG9ydCB7XG4gIGdldFBsYXlsaXN0LFxuICBnZXRDb250ZW50LFxuICBnZXRQbGF5bGlzdHNCeUNoYW5uZWxcbn1cbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQ2hhbm5lbEl0ZW0gZnJvbSAnLi9DaGFubmVsSXRlbSdcblxuY29uc3QgQ2hhbm5lbEdyaWQgPSAoeyBpdGVtcywgaGFzTW9yZVJlc3VsdHMsXG4gIG9uSXRlbUNsaWNrLCBvblBsYXlsaXN0c0NsaWNrLCBvbkxvYWRNb3JlXG59KSA9PiB7XG4gIGNvbnN0IGdyaWRWaXNpYmlsaXR5ID0gJ3Nob3cnXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzcz17YG1haW4gZmxhdC1zY3JvbGxgfT5cbiAgICAgIDxkaXYgY2xhc3M9e2Bjb250ZW50YH0+XG4gICAgICAgIHtpdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxDaGFubmVsSXRlbVxuICAgICAgICAgICAgICBpZD17aXRlbS5pZH1cbiAgICAgICAgICAgICAgdGl0bGU9e2l0ZW0udGl0bGV9XG4gICAgICAgICAgICAgIHRodW1ibmFpbHM9e2l0ZW0udGh1bWJuYWlsc31cbiAgICAgICAgICAgICAgb25DbGljaz17b25JdGVtQ2xpY2t9XG4gICAgICAgICAgICAgIG9uUGxheWxpc3RzQ2xpY2s9e29uUGxheWxpc3RzQ2xpY2t9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2FsaWduLWNlbnRlcic+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2J1dHRvbiBtaW5vcicgZGlzYWJsZWQ9eyFoYXNNb3JlUmVzdWx0cygpfVxuICAgICAgICAgIG9uQ2xpY2s9e29uTG9hZE1vcmV9PkxvYWQgbW9yZTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbm5lbEdyaWRcbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQ29udGVudFR5cGUgZnJvbSAnLi4vY29uc3RhbnRzL0NvbnRlbnRUeXBlJ1xuXG5jb25zdCBDaGFubmVsSXRlbSA9ICh7IGlkLCB0aXRsZSwgdGh1bWJuYWlscywgb25DbGljaywgb25QbGF5bGlzdHNDbGljayB9KSA9PiB7XG4gIGxldCBtYXhMZW5ndGggPSAyMFxuICB0aXRsZSA9IHRpdGxlLmxlbmd0aCA+IG1heExlbmd0aFxuICAgID8gdGl0bGUuc3Vic3RyaW5nKDAsIDIwKS5jb25jYXQoJy4uLicpXG4gICAgOiB0aXRsZVxuICByZXR1cm4gKFxuXG4gICAgICA8ZGl2IGNsYXNzPSdjb250ZW50LWl0ZW0nPlxuICAgICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e2UgPT4gb25DbGljayhlLCBpZCl9PlxuICAgICAgICAgIDxpbWcgc3JjPXt0aHVtYm5haWxzLmhpZ2gudXJsfSAvPlxuICAgICAgICA8L2E+XG4gICAgICAgIDxkaXYgY2xhc3M9J2NvbnRlbnQtaXRlbS1kZXRhaWxzJz5cbiAgICAgICAgICA8aDIgY2xhc3M9J2NvbnRlbnQtaXRlbS10aXRsZSc+IHt0aXRsZX0gPC9oMj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdidXR0b24gbWFqb3Igc21hbGwnXG4gICAgICAgICAgICBvbkNsaWNrPXtvblBsYXlsaXN0c0NsaWNrLmJpbmQobnVsbCwgaWQsIENvbnRlbnRUeXBlLkNIQU5ORUwpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFBsYXlsaXN0c1xuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbm5lbEl0ZW1cbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQ29udGVudFR5cGUgZnJvbSAnLi4vY29uc3RhbnRzL0NvbnRlbnRUeXBlJ1xuXG5jb25zdCBDb250ZW50VHlwZVNlbGVjdGlvbiA9ICh7IG9uQ29udGVudFR5cGVDbGljaywgc2VsZWN0ZWRUeXBlIH0pID0+IHtcbiAgbGV0IGJ0blBsYXlsaXN0Q2xhc3NlcywgYnRuQ2hhbm5lbENsYXNzZXNcbiAgYnRuUGxheWxpc3RDbGFzc2VzID0gWydidXR0b24nLCAnc2VsZWN0aW9uJ11cbiAgYnRuQ2hhbm5lbENsYXNzZXMgPSBbJ2J1dHRvbicsICdzZWxlY3Rpb24nXVxuICBpZiAoc2VsZWN0ZWRUeXBlID09PSBDb250ZW50VHlwZS5QTEFZTElTVCkgYnRuUGxheWxpc3RDbGFzc2VzLnB1c2goJ2FjdGl2ZScpXG4gIGVsc2UgaWYgKHNlbGVjdGVkVHlwZSA9PT0gQ29udGVudFR5cGUuQ0hBTk5FTCkgYnRuQ2hhbm5lbENsYXNzZXMucHVzaCgnYWN0aXZlJylcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3M9J2NvbnRlbnQtdHlwZS1zZWxlY3Rpb24nPlxuICAgICAgPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPXtidG5QbGF5bGlzdENsYXNzZXMuam9pbignICcpfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRUeXBlQ2xpY2suYmluZChudWxsLCBDb250ZW50VHlwZS5QTEFZTElTVCl9PlxuICAgICAgICBQbGF5bGlzdFxuICAgICAgPC9idXR0b24+XG5cbiAgICAgIDxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz17YnRuQ2hhbm5lbENsYXNzZXMuam9pbignICcpfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRUeXBlQ2xpY2suYmluZChudWxsLCBDb250ZW50VHlwZS5DSEFOTkVMKX0+XG4gICAgICAgIENoYW5uZWxcbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnRlbnRUeXBlU2VsZWN0aW9uXG4iLCJpbXBvcnQgSW5mZXJubyBmcm9tICdpbmZlcm5vJ1xuXG5jb25zdCBOYXYgPSAoeyBjaGlsZHJlbiB9KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzcz0nbmF2Jz5cbiAgICAgIDxhIGNsYXNzPSdsb2dvJyBocmVmPVwiI1wiPlxuICAgICAgICA8aDE+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9J21pbmknPnQ8L3NwYW4+PHNwYW4gY2xhc3M9J2Z1bGwnPnRla29hPC9zcGFuPlxuICAgICAgICA8L2gxPlxuICAgICAgPC9hPlxuICAgICAge2NoaWxkcmVufVxuXG4gICAgICA8ZGl2IGNsYXNzPSdzZXR0aW5ncyc+XG4gICAgICAgIDxwPjwvcD5cbiAgICAgIDwvZGl2PlxuICAgIDwvbmF2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5hdlxuIiwiY29uc3QgUGxheWVyID0gKHsgaXNNaW5pbWl6ZWQgfSkgPT4ge1xuICBjb25zdCBwbGF5ZXJDbGFzc2VzID0gaXNNaW5pbWl6ZWQgPyAnbWluaW1pemUnIDogJydcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3M9e2BwbGF5ZXIgJHtwbGF5ZXJDbGFzc2VzfWB9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2BwbGF5ZXItY29udGFpbmVyYH0+XG4gICAgICAgIDxkaXYgaWQ9XCJ2aWRlby1wbGF5ZXJcIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllclxuIiwiY29uc3QgUGxheWVyQ29udHJvbHMgPSAoe1xuICBvbk5leHQsIG9uUHJldmlvdXMsIG9uVG9nZ2xlLCBpc1BsYXlpbmcsIGlzUGxheWVyTWluaW1pemVkLCBvblRvZ2dsZVBsYXllclxufSkgPT4ge1xuICBjb25zdCBwbGF5ID0gaXNQbGF5aW5nID8gJ+KPuCcgOiAn4o+1J1xuICBjb25zdCB0b2dnbGVQbGF5ZXIgPSAn4o+2J1xuICBjb25zdCB0b2dnbGVWaXNpYmlsaXR5ID0gaXNQbGF5ZXJNaW5pbWl6ZWQgPyAnJyA6ICdmbGlwJ1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3M9J3BsYXllci1jb250cm9scy1jb250YWluZXInPlxuICAgICAgPHVsIGNsYXNzPSdwbGF5ZXItY29udHJvbHMtbGlzdCc+XG4gICAgICAgIDx1bCBjbGFzcz0ncGxheWVyLWNvbnRyb2xzJz5cbiAgICAgICAgICA8bGk+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb250cm9sJyBvbkNsaWNrPXtvblByZXZpb3VzfT4mI3gyM2VhOzwvYnV0dG9uPlxuICAgICAgICAgIDwvbGk+XG5cbiAgICAgICAgICA8bGk+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb250cm9sJyBvbkNsaWNrPXtvblRvZ2dsZX0+e3BsYXl9PC9idXR0b24+XG4gICAgICAgICAgPC9saT5cblxuICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J2NvbnRyb2wnIG9uQ2xpY2s9e29uTmV4dH0+JiN4MjNlOTs8L2J1dHRvbj5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICA8L3VsPlxuXG4gICAgICAgIDxkaXYgY2xhc3M9J3BsYXllci10b2dnbGUnPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9e2Bjb250cm9sYH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlUGxheWVyfT5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz17YGNvbnRyb2wtdG9nZ2xlICR7dG9nZ2xlVmlzaWJpbGl0eX1gfT5cbiAgICAgICAgICAgICAge3RvZ2dsZVBsYXllcn1cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICA8L3VsPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckNvbnRyb2xzXG4iLCJpbXBvcnQgSW5mZXJubyBmcm9tICdpbmZlcm5vJ1xuXG5jb25zdCBQbGF5bGlzdCA9ICh7IHZpZHMsIGN1cnJlbnRJdGVtLCBpc1Zpc2libGUsIG9uVmlkZW9DbGljayB9KSA9PiB7XG4gIGNvbnN0IHBsYXlsaXN0VmlzaWJpbGl0eSA9IGlzVmlzaWJsZSA/ICdzaG93JyA6ICcnXG4gIHJldHVybiAoXG4gICAgPHVsIGNsYXNzPXtgcGxheWxpc3QgZmxhdC1zY3JvbGwgJHtwbGF5bGlzdFZpc2liaWxpdHl9YH0+XG4gICAgICB7dmlkcy5tYXAoKHZpZCwgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGlzQWN0aXZlID0gY3VycmVudEl0ZW0gPT09IGluZGV4XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPEl0ZW1cbiAgICAgICAgICAgIHZpZGVvSWQ9e3ZpZC52aWRlb0lkfVxuICAgICAgICAgICAgdGl0bGU9e3ZpZC50aXRsZX1cbiAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgIGlzQWN0aXZlPXtpc0FjdGl2ZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uVmlkZW9DbGlja31cbiAgICAgICAgICAvPlxuICAgICAgKVxuICAgICAgfSl9XG4gICAgPC91bD5cbiAgKVxufVxuXG5jb25zdCBJdGVtID0gKHsgdGl0bGUsIHZpZGVvSWQsIGluZGV4LCBpc0FjdGl2ZSwgb25DbGljayB9KSA9PiB7XG4gIGNvbnN0IGl0ZW1DbGFzc2VzID0gaXNBY3RpdmUgPyAnYWN0aXZlJyA6ICcnXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17aXRlbUNsYXNzZXN9IG9uQ2xpY2s9eygpID0+IG9uQ2xpY2sodmlkZW9JZCwgaW5kZXgpfT5cbiAgICAgIHt0aXRsZX1cbiAgICA8L2xpPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlsaXN0XG4iLCJpbXBvcnQgSW5mZXJubyBmcm9tICdpbmZlcm5vJ1xuaW1wb3J0IFBsYXlsaXN0SXRlbSBmcm9tICcuL1BsYXlsaXN0SXRlbSdcblxuY29uc3QgUGxheWxpc3RHcmlkID0gKHsgaXRlbXMsIGlzVmlzaWJsZSwgdmlld1R5cGUsIGhhc01vcmVSZXN1bHRzLFxuICBvbkl0ZW1DbGljaywgb25QbGF5bGlzdHNDbGljaywgb25Mb2FkTW9yZVxufSkgPT4ge1xuICBjb25zdCBncmlkVmlzaWJpbGl0eSA9ICdzaG93J1xuICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzcz17YG1haW4gZmxhdC1zY3JvbGxgfT5cbiAgICAgICAgPGRpdiBjbGFzcz17YGNvbnRlbnRgfT5cbiAgICAgICAgICB7aXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPFBsYXlsaXN0SXRlbVxuICAgICAgICAgICAgICAgIGlkPXtpdGVtLmlkfVxuICAgICAgICAgICAgICAgIGNoYW5uZWxJZD17aXRlbS5jaGFubmVsSWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2l0ZW0udGl0bGV9XG4gICAgICAgICAgICAgICAgdGh1bWJuYWlscz17aXRlbS50aHVtYm5haWxzfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uSXRlbUNsaWNrfVxuICAgICAgICAgICAgICAgIHZpZXdUeXBlPXt2aWV3VHlwZX1cbiAgICAgICAgICAgICAgICBvblBsYXlsaXN0c0NsaWNrPXtvblBsYXlsaXN0c0NsaWNrfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nYWxpZ24tY2VudGVyJz5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdidXR0b24gbWlub3InIGRpc2FibGVkPXshaGFzTW9yZVJlc3VsdHMoKX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uTG9hZE1vcmV9PkxvYWQgbW9yZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWxpc3RHcmlkXG4iLCJpbXBvcnQgSW5mZXJubyBmcm9tICdpbmZlcm5vJ1xuaW1wb3J0IENvbnRlbnRUeXBlIGZyb20gJy4uL2NvbnN0YW50cy9Db250ZW50VHlwZSdcblxuY29uc3QgUGxheWxpc3RJdGVtID0gKHsgaWQsIGNoYW5uZWxJZCwgdGl0bGUsIHRodW1ibmFpbHMsXG4gIG9uQ2xpY2ssIG9uUGxheWxpc3RzQ2xpY2ssIHZpZXdUeXBlXG59KSA9PiB7XG4gIGxldCBtYXhMZW5ndGggPSAyMFxuICB0aXRsZSA9IHRpdGxlLmxlbmd0aCA+IG1heExlbmd0aFxuICAgID8gdGl0bGUuc3Vic3RyaW5nKDAsIDIwKS5jb25jYXQoJy4uLicpXG4gICAgOiB0aXRsZVxuICByZXR1cm4gKFxuXG4gICAgICA8ZGl2IGNsYXNzPSdjb250ZW50LWl0ZW0nPlxuICAgICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e2UgPT4gb25DbGljayhlLCBpZCl9PlxuICAgICAgICAgIDxpbWcgc3JjPXt0aHVtYm5haWxzLmhpZ2gudXJsfSAvPlxuICAgICAgICA8L2E+XG4gICAgICAgIDxkaXYgY2xhc3M9J2NvbnRlbnQtaXRlbS1kZXRhaWxzJz5cbiAgICAgICAgICA8aDIgY2xhc3M9J2NvbnRlbnQtaXRlbS10aXRsZSc+IHt0aXRsZX0gPC9oMj5cbiAgICAgICAgICB7XG4gICAgICAgICAgICAodmlld1R5cGUgPT09IENvbnRlbnRUeXBlLlBMQVlMSVNUKVxuICAgICAgICAgICAgICA/IDxidXR0b24gY2xhc3M9J2J1dHRvbiBtYWpvciBzbWFsbCdcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblBsYXlsaXN0c0NsaWNrLmJpbmQobnVsbCwgY2hhbm5lbElkLCBDb250ZW50VHlwZS5DSEFOTkVMKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIENoYW5uZWwgcGxheWxpc3RzXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA6IDxzcGFuPjwvc3Bhbj5cblxuICAgICAgICAgIH1cblxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWxpc3RJdGVtXG4iLCJpbXBvcnQgSW5mZXJubyBmcm9tICdpbmZlcm5vJ1xuXG5jb25zdCBTZWFyY2hCYXIgPSAoeyBvbklucHV0LCBvblN1Ym1pdCwgc2VsZWN0ZWRUeXBlIH0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8Zm9ybSBjbGFzc05hbWU9J3NlYXJjaC1iYXInIG9uU3VibWl0PXtvblN1Ym1pdH0+XG4gICAgICA8aW5wdXQgY2xhc3NOYW1lPSdpbnB1dCBzZWFyY2gtYmFyLXF1ZXJ5JyB0eXBlPSd0ZXh0J1xuICAgICAgICBwbGFjZWhvbGRlcj17YFR5cGUgYSAke3NlbGVjdGVkVHlwZX0gbmFtZWB9XG4gICAgICAgIG9uSW5wdXQ9e29uSW5wdXR9XG4gICAgICAvPlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYnV0dG9uIG1pbm9yIHNlYXJjaC1iYXItYWN0aW9uJyB0eXBlPSdzdWJtaXQnPlxuICAgICAgICBTZWFyY2hcbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZm9ybT5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hCYXJcbiIsImNvbnN0IEFwcENvbnN0YW50cyA9IHtcbiAgREVWX01PREU6IFwiZGV2XCIsXG4gIFBST0RfTU9ERTogXCJwcm9kXCIsXG4gIE1BWF9SRVNVTFRTOiAxMFxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBDb25zdGFudHNcbiIsImNvbnN0IENvbnRlbnRUeXBlID0ge1xuICBQTEFZTElTVDogJ3BsYXlsaXN0JyxcbiAgQ0hBTk5FTDogJ2NoYW5uZWwnXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnRlbnRUeXBlXG4iLCJjb25zdCBQbGF5ZXJTdGF0ZSA9IHtcbiAgVU5TVEFSVEVEOiAtMSxcbiAgRU5ERUQ6IDAsXG4gIFBMQVlJTkc6IDEsXG4gIFBBVVNFRDogMixcbiAgQlVGRkVSSU5HOiAzLFxuICBWSURFT19DVUVEOiA1XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllclN0YXRlXG4iLCJjb25zdCBTZWFyY2hUeXBlID0ge1xuICAnQllfQ09OVEVOVCc6IFN5bWJvbCgnYnlfY29udGVudCcpLFxuICAnQllfQ0hBTk5FTCc6IFN5bWJvbCgnYnlfY2hhbm5lbCcpXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaFR5cGVcbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJ2luZmVybm8tY29tcG9uZW50J1xuaW1wb3J0IFlvdXR1YmVQbGF5ZXIgZnJvbSAneW91dHViZS1wbGF5ZXInXG5cbmltcG9ydCBTZWFyY2hCYXIgZnJvbSAnLi4vY29tcG9uZW50cy9TZWFyY2hCYXInXG5pbXBvcnQgUGxheWVyIGZyb20gJy4uL2NvbXBvbmVudHMvUGxheWVyJ1xuaW1wb3J0IENoYW5uZWxHcmlkIGZyb20gJy4uL2NvbXBvbmVudHMvQ2hhbm5lbEdyaWQnXG5pbXBvcnQgUGxheWxpc3RHcmlkIGZyb20gJy4uL2NvbXBvbmVudHMvUGxheWxpc3RHcmlkJ1xuaW1wb3J0IFBsYXlsaXN0IGZyb20gJy4uL2NvbXBvbmVudHMvUGxheWxpc3QnXG5pbXBvcnQgUGxheWVyQ29udHJvbHMgZnJvbSAnLi4vY29tcG9uZW50cy9QbGF5ZXJDb250cm9scydcbmltcG9ydCBOYXYgZnJvbSAnLi4vY29tcG9uZW50cy9OYXYnXG5pbXBvcnQgQ29udGVudFR5cGVTZWxlY3Rpb24gZnJvbSAnLi4vY29tcG9uZW50cy9Db250ZW50VHlwZVNlbGVjdGlvbidcblxuaW1wb3J0IFBsYXllclN0YXRlIGZyb20gJy4uL2NvbnN0YW50cy9QbGF5ZXJTdGF0ZSdcbmltcG9ydCBDb250ZW50VHlwZSBmcm9tICcuLi9jb25zdGFudHMvQ29udGVudFR5cGUnXG5pbXBvcnQgU2VhcmNoVHlwZSBmcm9tICcuLi9jb25zdGFudHMvU2VhcmNoVHlwZSdcblxuaW1wb3J0IHtcbiAgZ2V0Q29udGVudCwgZ2V0UGxheWxpc3QsIGdldFBsYXlsaXN0c0J5Q2hhbm5lbFxufSBmcm9tICcuLi9oZWxwZXJzL2FwaUJyaWRnZSdcblxuY2xhc3MgQXBwQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcGxheWVyOiBudWxsLFxuICAgICAgcXVlcnk6IFwiXCIsXG4gICAgICB2aWRzOiBbXSxcbiAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgcmVzdWx0c1BhZ2VUb2tlbjogJycsXG4gICAgICBjdXJyZW50SXRlbTogbnVsbCxcbiAgICAgIHNlbGVjdGVkQ2hhbm5lbElkOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUeXBlOiBDb250ZW50VHlwZS5QTEFZTElTVCxcbiAgICAgIHZpZXdUeXBlOiBDb250ZW50VHlwZS5QTEFZTElTVCxcbiAgICAgIHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUuQllfQ09OVEVOVCxcbiAgICAgIGlzUGxheWluZzogZmFsc2UsXG4gICAgICBpc1BsYXlsaXN0VmlzaWJsZTogZmFsc2UsXG4gICAgICBpc1BsYXllck1pbmltaXplZDogdHJ1ZSxcbiAgICB9XG5cbiAgICB0aGlzLmhhbmRsZVF1ZXJ5Q2hhbmdlID0gdGhpcy5oYW5kbGVRdWVyeUNoYW5nZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVTdWJtaXQgPSB0aGlzLmhhbmRsZVN1Ym1pdC5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVJdGVtQ2xpY2sgPSB0aGlzLmhhbmRsZUl0ZW1DbGljay5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVWaWRlb0NsaWNrID0gdGhpcy5oYW5kbGVWaWRlb0NsaWNrLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZU5leHRWaWRlbyA9IHRoaXMuaGFuZGxlTmV4dFZpZGVvLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVByZXZpb3VzVmlkZW8gPSB0aGlzLmhhbmRsZVByZXZpb3VzVmlkZW8uYmluZCh0aGlzKVxuICAgIC8vIFRPRE9cbiAgICAvLyByZW5hbWUgaGFuZGxlVG9nbGVcbiAgICB0aGlzLmhhbmRsZVRvZ2dsZSA9IHRoaXMuaGFuZGxlVG9nZ2xlLmJpbmQodGhpcylcblxuICAgIHRoaXMuaGFuZGxlVG9nZ2xlUGxheWVyID0gdGhpcy5oYW5kbGVUb2dnbGVQbGF5ZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlQ29udGVudFR5cGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNvbnRlbnRUeXBlQ2hhbmdlLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVBsYXlsaXN0c0NsaWNrID0gdGhpcy5oYW5kbGVQbGF5bGlzdHNDbGljay5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVMb2FkTW9yZSA9IHRoaXMuaGFuZGxlTG9hZE1vcmUuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFzTW9yZVJlc3VsdHMgPSB0aGlzLmhhc01vcmVSZXN1bHRzLmJpbmQodGhpcylcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcGxheWVyOiBZb3V0dWJlUGxheWVyKCd2aWRlby1wbGF5ZXInKVxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMuc3RhdGUucGxheWVyLm9uKCdzdGF0ZUNoYW5nZScsIGUgPT4ge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGUudGFyZ2V0LmdldFBsYXllclN0YXRlKClcblxuICAgICAgICBzd2l0Y2goc3RhdGUpe1xuICAgICAgICBjYXNlIFBsYXllclN0YXRlLkVOREVEOlxuICAgICAgICAgIHRoaXMuaGFuZGxlTmV4dFZpZGVvKClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFBsYXllclN0YXRlLlBMQVlJTkc6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzUGxheWluZzogdHJ1ZSB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgUGxheWVyU3RhdGUuUEFVU0VEOlxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc1BsYXlpbmc6IGZhbHNlIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGhhc01vcmVSZXN1bHRzKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuc3RhdGUucmVzdWx0c1BhZ2VUb2tlbilcbiAgfVxuXG4gIGhhbmRsZVF1ZXJ5Q2hhbmdlKGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHF1ZXJ5OiBlLnRhcmdldC52YWx1ZVxuICAgIH0pXG4gIH1cblxuICBoYW5kbGVDb250ZW50VHlwZUNoYW5nZSh0eXBlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZXN1bHRzOiBbXSxcbiAgICAgIHJlc3VsdHNQYWdlVG9rZW46ICcnLFxuICAgICAgc2VsZWN0ZWRUeXBlOiB0eXBlLFxuICAgICAgc2VsZWN0ZWRDaGFubmVsSWQ6IG51bGxcbiAgICB9KVxuICB9XG5cbiAgaGFuZGxlU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGlmICh0aGlzLnN0YXRlLnF1ZXJ5ID09PSAnJykgcmV0dXJuXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgcmVzdWx0c1BhZ2VUb2tlbjogJycsXG4gICAgICBzZWFyY2hUeXBlOiBTZWFyY2hUeXBlLkJZX0NPTlRFTlQsXG4gICAgICBpc1BsYXlsaXN0VmlzaWJsZTogZmFsc2UsXG4gICAgICBpc1BsYXllck1pbmltaXplZDogdHJ1ZSxcbiAgICAgIHNlbGVjdGVkQ2hhbm5lbElkOiBudWxsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5mZXRjaFF1ZXJ5KFxuICAgICAgICB0aGlzLnN0YXRlLnF1ZXJ5LFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZSxcbiAgICAgICAgdGhpcy5zdGF0ZS5yZXN1bHRzUGFnZVRva2VuXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIGhhbmRsZVBsYXlsaXN0c0NsaWNrKGlkLCB2aWV3VHlwZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZS5CWV9DSEFOTkVMLFxuICAgICAgcmVzdWx0czogW10sXG4gICAgICByZXN1bHRzUGFnZVRva2VuOiAnJyxcbiAgICB9LCAoKSA9PiB0aGlzLmZldGNoUGxheWxpc3RzKGlkLCB2aWV3VHlwZSkpXG4gIH1cblxuICBmZXRjaFBsYXlsaXN0cyhpZCwgdmlld1R5cGUpIHtcbiAgICBnZXRQbGF5bGlzdHNCeUNoYW5uZWwoaWQsIHRoaXMuc3RhdGUucmVzdWx0c1BhZ2VUb2tlbilcbiAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICBsZXQgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgcmVzdWx0czogdGhpcy5zdGF0ZS5yZXN1bHRzLmNvbmNhdChkYXRhLml0ZW1zKSxcbiAgICAgICAgICByZXN1bHRzUGFnZVRva2VuOiBkYXRhLm5leHRQYWdlVG9rZW4sXG4gICAgICAgICAgc2VsZWN0ZWRUeXBlOiBDb250ZW50VHlwZS5QTEFZTElTVCxcbiAgICAgICAgICBzZWxlY3RlZENoYW5uZWxJZDogaWRcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld1R5cGUpIG5ld1N0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgbmV3U3RhdGUsIHt2aWV3VHlwZX0pXG4gICAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6ICcsIGVycikpXG4gIH1cblxuICBoYW5kbGVMb2FkTW9yZShlKSB7XG4gICAgc3dpdGNoICh0aGlzLnN0YXRlLnNlYXJjaFR5cGUpIHtcbiAgICAgIGNhc2UgU2VhcmNoVHlwZS5CWV9DT05URU5UOlxuICAgICAgICB0aGlzLmZldGNoUXVlcnkoXG4gICAgICAgICAgdGhpcy5zdGF0ZS5xdWVyeSxcbiAgICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZSxcbiAgICAgICAgICB0aGlzLnN0YXRlLnJlc3VsdHNQYWdlVG9rZW5cbiAgICAgICAgKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBTZWFyY2hUeXBlLkJZX0NIQU5ORUw6XG4gICAgICAgIHRoaXMuZmV0Y2hQbGF5bGlzdHModGhpcy5zdGF0ZS5zZWxlY3RlZENoYW5uZWxJZCwgQ29udGVudFR5cGUuQ0hBTk5FTClcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgZmV0Y2hRdWVyeShxdWVyeSwgdHlwZSwgbmV4dFBhZ2VUb2tlbikge1xuICAgIGdldENvbnRlbnQocXVlcnksIHR5cGUsIG5leHRQYWdlVG9rZW4pXG4gICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcmVzdWx0czogdGhpcy5zdGF0ZS5yZXN1bHRzLmNvbmNhdChkYXRhLml0ZW1zKSxcbiAgICAgICAgICB2aWV3VHlwZTogdHlwZSxcbiAgICAgICAgICByZXN1bHRzUGFnZVRva2VuOiBkYXRhLm5leHRQYWdlVG9rZW5cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogJywgZXJyKSlcbiAgfVxuXG4gIGhhbmRsZUl0ZW1DbGljayhlLCBpZCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgdGhpcy5mZXRjaFBsYXlsaXN0KGlkLCB0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnZpZHMubGVuZ3RoID4gMCkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudEl0ZW06IDAsXG4gICAgICAgICAgaXNQbGF5aW5nOiB0cnVlLFxuICAgICAgICAgIGlzUGxheWxpc3RWaXNpYmxlOiB0cnVlXG4gICAgICAgIH0sIHRoaXMubG9hZFZpZGVvKHRoaXMuc3RhdGUudmlkc1swXS52aWRlb0lkKSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogJywgZXJyKSlcbiAgfVxuXG4gIGZldGNoUGxheWxpc3QoaWQsIHR5cGUpIHtcbiAgICByZXR1cm4gZ2V0UGxheWxpc3QoaWQsIHR5cGUpXG4gICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmlkczogZGF0YS5pdGVtc1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgfVxuXG4gIGhhbmRsZVZpZGVvQ2xpY2soaWQsIGluZGV4KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50SXRlbTogaW5kZXgsXG4gICAgICBpc1BsYXlpbmc6IHRydWVcbiAgICB9LCAoKSA9PiB0aGlzLmxvYWRWaWRlbyhpZCkpXG5cbiAgfVxuXG4gIGhhbmRsZVRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc1BsYXlpbmcpXG4gICAgICB0aGlzLnN0YXRlLnBsYXllci5wYXVzZVZpZGVvKClcbiAgICBlbHNlXG4gICAgICB0aGlzLnN0YXRlLnBsYXllci5wbGF5VmlkZW8oKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1BsYXlpbmc6ICF0aGlzLnN0YXRlLmlzUGxheWluZ1xuICAgIH0pXG4gIH1cblxuICBoYW5kbGVQcmV2aW91c1ZpZGVvKCkge1xuICAgIGNvbnN0IHByZXZpb3VzSXRlbSA9IHRoaXMuc3RhdGUuY3VycmVudEl0ZW0gLSAxXG4gICAgaWYgKCEocHJldmlvdXNJdGVtID49IDApKSByZXR1cm5cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudEl0ZW06IHByZXZpb3VzSXRlbVxuICAgIH0sICgpID0+IHRoaXMubG9hZFZpZGVvKHRoaXMuc3RhdGUudmlkc1twcmV2aW91c0l0ZW1dLnZpZGVvSWQpKVxuICB9XG5cbiAgaGFuZGxlTmV4dFZpZGVvKCkge1xuICAgIGNvbnN0IG5leHRJdGVtID0gdGhpcy5zdGF0ZS5jdXJyZW50SXRlbSArIDFcbiAgICBpZiAoIShuZXh0SXRlbSA8IHRoaXMuc3RhdGUudmlkcy5sZW5ndGgpKSByZXR1cm5cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudEl0ZW06IG5leHRJdGVtXG4gICAgfSwgKCkgPT4gdGhpcy5sb2FkVmlkZW8odGhpcy5zdGF0ZS52aWRzW25leHRJdGVtXS52aWRlb0lkKSlcbiAgfVxuXG4gIGhhbmRsZVRvZ2dsZVBsYXllcigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzUGxheWVyTWluaW1pemVkOiAhdGhpcy5zdGF0ZS5pc1BsYXllck1pbmltaXplZFxuICAgIH0pXG4gIH1cblxuICBsb2FkVmlkZW8oaWQpe1xuICAgIHRoaXMuc3RhdGUucGxheWVyLmxvYWRWaWRlb0J5SWQoaWQpXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoZWFkZXIgY2xhc3M9J2hlYWRlcic+XG4gICAgICAgICAgPE5hdj5cbiAgICAgICAgICAgIDxTZWFyY2hCYXJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUeXBlPXt0aGlzLnN0YXRlLnNlbGVjdGVkVHlwZX1cbiAgICAgICAgICAgICAgb25JbnB1dD17dGhpcy5oYW5kbGVRdWVyeUNoYW5nZX1cbiAgICAgICAgICAgICAgb25TdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L05hdj5cbiAgICAgICAgICA8Q29udGVudFR5cGVTZWxlY3Rpb25cbiAgICAgICAgICAgIG9uQ29udGVudFR5cGVDbGljaz17dGhpcy5oYW5kbGVDb250ZW50VHlwZUNoYW5nZX1cbiAgICAgICAgICAgIHNlbGVjdGVkVHlwZT17dGhpcy5zdGF0ZS5zZWxlY3RlZFR5cGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9oZWFkZXI+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNlbnRyYWxcIj5cbiAgICAgICAgICB7XG4gICAgICAgICAgICAodGhpcy5zdGF0ZS5zZWxlY3RlZFR5cGUgPT09IENvbnRlbnRUeXBlLkNIQU5ORUwpXG4gICAgICAgICAgICA/IDxDaGFubmVsR3JpZFxuICAgICAgICAgICAgICAgIGl0ZW1zPXt0aGlzLnN0YXRlLnJlc3VsdHN9XG4gICAgICAgICAgICAgICAgaGFzTW9yZVJlc3VsdHM9e3RoaXMuaGFzTW9yZVJlc3VsdHN9XG4gICAgICAgICAgICAgICAgb25JdGVtQ2xpY2s9e3RoaXMuaGFuZGxlSXRlbUNsaWNrfVxuICAgICAgICAgICAgICAgIG9uUGxheWxpc3RzQ2xpY2s9e3RoaXMuaGFuZGxlUGxheWxpc3RzQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25Mb2FkTW9yZT17dGhpcy5oYW5kbGVMb2FkTW9yZX1cblxuXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA6IDxQbGF5bGlzdEdyaWRcbiAgICAgICAgICAgICAgICBpdGVtcz17dGhpcy5zdGF0ZS5yZXN1bHRzfVxuICAgICAgICAgICAgICAgIHZpZXdUeXBlPXt0aGlzLnN0YXRlLnZpZXdUeXBlfVxuICAgICAgICAgICAgICAgIGhhc01vcmVSZXN1bHRzPXt0aGlzLmhhc01vcmVSZXN1bHRzfVxuICAgICAgICAgICAgICAgIG9uSXRlbUNsaWNrPXt0aGlzLmhhbmRsZUl0ZW1DbGlja31cbiAgICAgICAgICAgICAgICBvblBsYXlsaXN0c0NsaWNrPXt0aGlzLmhhbmRsZVBsYXlsaXN0c0NsaWNrfVxuICAgICAgICAgICAgICAgIG9uTG9hZE1vcmU9e3RoaXMuaGFuZGxlTG9hZE1vcmV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgPFBsYXlsaXN0XG4gICAgICAgICAgICB2aWRzPXt0aGlzLnN0YXRlLnZpZHN9XG4gICAgICAgICAgICBvblZpZGVvQ2xpY2s9e3RoaXMuaGFuZGxlVmlkZW9DbGlja31cbiAgICAgICAgICAgIGN1cnJlbnRJdGVtPXt0aGlzLnN0YXRlLmN1cnJlbnRJdGVtfVxuICAgICAgICAgICAgaXNWaXNpYmxlPXt0aGlzLnN0YXRlLmlzUGxheWxpc3RWaXNpYmxlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxQbGF5ZXJcbiAgICAgICAgICBpc01pbmltaXplZD17dGhpcy5zdGF0ZS5pc1BsYXllck1pbmltaXplZH1cbiAgICAgICAgLz5cblxuICAgICAgICA8UGxheWVyQ29udHJvbHNcbiAgICAgICAgICBvbk5leHQ9e3RoaXMuaGFuZGxlTmV4dFZpZGVvfVxuICAgICAgICAgIG9uUHJldmlvdXM9e3RoaXMuaGFuZGxlUHJldmlvdXNWaWRlb31cbiAgICAgICAgICBvblRvZ2dsZT17dGhpcy5oYW5kbGVUb2dnbGV9XG4gICAgICAgICAgaXNQbGF5ZXJNaW5pbWl6ZWQ9e3RoaXMuc3RhdGUuaXNQbGF5ZXJNaW5pbWl6ZWR9XG4gICAgICAgICAgaXNQbGF5aW5nPXt0aGlzLnN0YXRlLmlzUGxheWluZ31cbiAgICAgICAgICBvblRvZ2dsZVBsYXllcj17dGhpcy5oYW5kbGVUb2dnbGVQbGF5ZXJ9XG4gICAgICAgIC8+XG5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBDb250YWluZXJcbiIsImNvbnN0IEFwcE1vZGUgPSByZXF1aXJlKCcuLi8uLi9hcHBjb25maWcnKS5tb2RlXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJy4uL2NvbnN0YW50cy9BcHBDb25zdGFudHMnXG5cbmxldCBhcGlCcmlkZ2UgPSAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiAoQXBwTW9kZSA9PT0gQXBwQ29uc3RhbnRzLkRFVl9NT0RFKVxuICAgID8gcmVxdWlyZSgnLi4vLi4vdGVzdC9oZWxwZXJzL2FwaUZpeHR1cmUnKVxuICAgIDogcmVxdWlyZSgnLi4vYXBpJylcbn0pKClcblxubW9kdWxlLmV4cG9ydHMgPSBhcGlCcmlkZ2VcbiIsImltcG9ydCBJbmZlcm5vIGZyb20gJ2luZmVybm8nXG5pbXBvcnQgQXBwQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVycy9BcHBDb250YWluZXInXG5cbkluZmVybm8ucmVuZGVyKDxBcHBDb250YWluZXIgLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKSlcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJtb2RlXCI6IFwicHJvZFwiXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwia2V5XCI6IFwiQUl6YVN5Q3RnT2hpRjlrU3F2SGR5R29hMXBSTUppRGNKUXpXSG1rXCJcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9wcm9taXNlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfcHJvbWlzZSA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL3Byb21pc2VcIik7XG5cbnZhciBfcHJvbWlzZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9taXNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIG5ldyBfcHJvbWlzZTIuZGVmYXVsdChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmdW5jdGlvbiBzdGVwKGtleSwgYXJnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGluZm8udmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIF9wcm9taXNlMi5kZWZhdWx0LnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBzdGVwKFwibmV4dFwiLCB2YWx1ZSk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgc3RlcChcInRocm93XCIsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0ZXAoXCJuZXh0XCIpO1xuICAgIH0pO1xuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnByb21pc2UnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlByb21pc2U7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lLCBmb3JiaWRkZW5GaWVsZCl7XG4gIGlmKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikgfHwgKGZvcmJpZGRlbkZpZWxkICE9PSB1bmRlZmluZWQgJiYgZm9yYmlkZGVuRmllbGQgaW4gaXQpKXtcbiAgICB0aHJvdyBUeXBlRXJyb3IobmFtZSArICc6IGluY29ycmVjdCBpbnZvY2F0aW9uIScpO1xuICB9IHJldHVybiBpdDtcbn07IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIHRvSW5kZXggICA9IHJlcXVpcmUoJy4vX3RvLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKElTX0lOQ0xVREVTKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcbiAgICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KCR0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIGlmKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKXdoaWxlKGxlbmd0aCA+IGluZGV4KXtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I3RvSW5kZXggaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59OyIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKVxuICAvLyBFUzMgd3JvbmcgaGVyZVxuICAsIEFSRyA9IGNvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG4vLyBmYWxsYmFjayBmb3IgSUUxMSBTY3JpcHQgQWNjZXNzIERlbmllZCBlcnJvclxudmFyIHRyeUdldCA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gdHJ5R2V0KE8gPSBPYmplY3QoaXQpLCBUQUcpKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07IiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTsiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcyLjQuMCd9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpOyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGN0eCAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgaGlkZSAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkZcbiAgICAsIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0LkdcbiAgICAsIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlNcbiAgICAsIElTX1BST1RPICA9IHR5cGUgJiAkZXhwb3J0LlBcbiAgICAsIElTX0JJTkQgICA9IHR5cGUgJiAkZXhwb3J0LkJcbiAgICAsIElTX1dSQVAgICA9IHR5cGUgJiAkZXhwb3J0LldcbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCBleHBQcm90byAgPSBleHBvcnRzW1BST1RPVFlQRV1cbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGtleSwgb3duLCBvdXQ7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbihDKXtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBDKXtcbiAgICAgICAgICBzd2l0Y2goYXJndW1lbnRzLmxlbmd0aCl7XG4gICAgICAgICAgICBjYXNlIDA6IHJldHVybiBuZXcgQztcbiAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIG5ldyBDKGEpO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gbmV3IEMoYSwgYik7XG4gICAgICAgICAgfSByZXR1cm4gbmV3IEMoYSwgYiwgYyk7XG4gICAgICAgIH0gcmV0dXJuIEMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgICBGW1BST1RPVFlQRV0gPSBDW1BST1RPVFlQRV07XG4gICAgICByZXR1cm4gRjtcbiAgICAvLyBtYWtlIHN0YXRpYyB2ZXJzaW9ucyBmb3IgcHJvdG90eXBlIG1ldGhvZHNcbiAgICB9KShvdXQpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLm1ldGhvZHMuJU5BTUUlXG4gICAgaWYoSVNfUFJPVE8pe1xuICAgICAgKGV4cG9ydHMudmlydHVhbCB8fCAoZXhwb3J0cy52aXJ0dWFsID0ge30pKVtrZXldID0gb3V0O1xuICAgICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLnByb3RvdHlwZS4lTkFNRSVcbiAgICAgIGlmKHR5cGUgJiAkZXhwb3J0LlIgJiYgZXhwUHJvdG8gJiYgIWV4cFByb3RvW2tleV0paGlkZShleHBQcm90bywga2V5LCBvdXQpO1xuICAgIH1cbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWAgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07IiwidmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuL19pcy1hcnJheS1pdGVyJylcbiAgLCBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgdG9MZW5ndGggICAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKVxuICAsIEJSRUFLICAgICAgID0ge31cbiAgLCBSRVRVUk4gICAgICA9IHt9O1xudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCwgSVRFUkFUT1Ipe1xuICB2YXIgaXRlckZuID0gSVRFUkFUT1IgPyBmdW5jdGlvbigpeyByZXR1cm4gaXRlcmFibGU7IH0gOiBnZXRJdGVyRm4oaXRlcmFibGUpXG4gICAgLCBmICAgICAgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGxlbmd0aCwgc3RlcCwgaXRlcmF0b3IsIHJlc3VsdDtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYoaXNBcnJheUl0ZXIoaXRlckZuKSlmb3IobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgIHJlc3VsdCA9IGVudHJpZXMgPyBmKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKSA6IGYoaXRlcmFibGVbaW5kZXhdKTtcbiAgICBpZihyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKXJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChpdGVyYWJsZSk7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgKXtcbiAgICByZXN1bHQgPSBjYWxsKGl0ZXJhdG9yLCBmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKTtcbiAgICBpZihyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKXJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5leHBvcnRzLkJSRUFLICA9IEJSRUFLO1xuZXhwb3J0cy5SRVRVUk4gPSBSRVRVUk47IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59OyIsInZhciBkUCAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsIi8vIGZhc3QgYXBwbHksIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgYXJncywgdGhhdCl7XG4gIHZhciB1biA9IHRoYXQgPT09IHVuZGVmaW5lZDtcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoKXtcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCk7XG4gICAgY2FzZSAxOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgY2FzZSA0OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcbiAgfSByZXR1cm4gICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xufTsiLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCAhPT0gdW5kZWZpbmVkICYmIChJdGVyYXRvcnMuQXJyYXkgPT09IGl0IHx8IEFycmF5UHJvdG9bSVRFUkFUT1JdID09PSBpdCk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTsiLCIvLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhbk9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgfSBjYXRjaChlKXtcbiAgICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG52YXIgY3JlYXRlICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJylcbiAgLCBkZXNjcmlwdG9yICAgICA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuL19oaWRlJykoSXRlcmF0b3JQcm90b3R5cGUsIHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpe1xuICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBjcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHtuZXh0OiBkZXNjcmlwdG9yKDEsIG5leHQpfSk7XG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSAgICAgICAgPSByZXF1aXJlKCcuL19saWJyYXJ5JylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgcmVkZWZpbmUgICAgICAgPSByZXF1aXJlKCcuL19yZWRlZmluZScpXG4gICwgaGlkZSAgICAgICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgSXRlcmF0b3JzICAgICAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsICRpdGVyQ3JlYXRlICAgID0gcmVxdWlyZSgnLi9faXRlci1jcmVhdGUnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpXG4gICwgSVRFUkFUT1IgICAgICAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIEJVR0dZICAgICAgICAgID0gIShbXS5rZXlzICYmICduZXh0JyBpbiBbXS5rZXlzKCkpIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgLCBGRl9JVEVSQVRPUiAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEtFWVMgICAgICAgICAgID0gJ2tleXMnXG4gICwgVkFMVUVTICAgICAgICAgPSAndmFsdWVzJztcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRUQpe1xuICAkaXRlckNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihraW5kKXtcbiAgICBpZighQlVHR1kgJiYga2luZCBpbiBwcm90bylyZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoKGtpbmQpe1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgICAgICAgID0gTkFNRSArICcgSXRlcmF0b3InXG4gICAgLCBERUZfVkFMVUVTID0gREVGQVVMVCA9PSBWQUxVRVNcbiAgICAsIFZBTFVFU19CVUcgPSBmYWxzZVxuICAgICwgcHJvdG8gICAgICA9IEJhc2UucHJvdG90eXBlXG4gICAgLCAkbmF0aXZlICAgID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCAkZGVmYXVsdCAgID0gJG5hdGl2ZSB8fCBnZXRNZXRob2QoREVGQVVMVClcbiAgICAsICRlbnRyaWVzICAgPSBERUZBVUxUID8gIURFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZCgnZW50cmllcycpIDogdW5kZWZpbmVkXG4gICAgLCAkYW55TmF0aXZlID0gTkFNRSA9PSAnQXJyYXknID8gcHJvdG8uZW50cmllcyB8fCAkbmF0aXZlIDogJG5hdGl2ZVxuICAgICwgbWV0aG9kcywga2V5LCBJdGVyYXRvclByb3RvdHlwZTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZigkYW55TmF0aXZlKXtcbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvdHlwZU9mKCRhbnlOYXRpdmUuY2FsbChuZXcgQmFzZSkpO1xuICAgIGlmKEl0ZXJhdG9yUHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlKXtcbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICAgIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgICAgLy8gZml4IGZvciBzb21lIG9sZCBlbmdpbmVzXG4gICAgICBpZighTElCUkFSWSAmJiAhaGFzKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUikpaGlkZShJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IsIHJldHVyblRoaXMpO1xuICAgIH1cbiAgfVxuICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gIGlmKERFRl9WQUxVRVMgJiYgJG5hdGl2ZSAmJiAkbmF0aXZlLm5hbWUgIT09IFZBTFVFUyl7XG4gICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgJGRlZmF1bHQgPSBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuICRuYXRpdmUuY2FsbCh0aGlzKTsgfTtcbiAgfVxuICAvLyBEZWZpbmUgaXRlcmF0b3JcbiAgaWYoKCFMSUJSQVJZIHx8IEZPUkNFRCkgJiYgKEJVR0dZIHx8IFZBTFVFU19CVUcgfHwgIXByb3RvW0lURVJBVE9SXSkpe1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gID0gcmV0dXJuVGhpcztcbiAgaWYoREVGQVVMVCl7XG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIHZhbHVlczogIERFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogICAgSVNfU0VUICAgICA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKEtFWVMpLFxuICAgICAgZW50cmllczogJGVudHJpZXNcbiAgICB9O1xuICAgIGlmKEZPUkNFRClmb3Ioa2V5IGluIG1ldGhvZHMpe1xuICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKXJlZGVmaW5lKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XG4gICAgfSBlbHNlICRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5GICogKEJVR0dZIHx8IFZBTFVFU19CVUcpLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxuICByZXR1cm4gbWV0aG9kcztcbn07IiwidmFyIElURVJBVE9SICAgICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtJVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYywgc2tpcENsb3Npbmcpe1xuICBpZighc2tpcENsb3NpbmcgJiYgIVNBRkVfQ0xPU0lORylyZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciAgPSBbN11cbiAgICAgICwgaXRlciA9IGFycltJVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyByZXR1cm4ge2RvbmU6IHNhZmUgPSB0cnVlfTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge307IiwibW9kdWxlLmV4cG9ydHMgPSB0cnVlOyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIG1hY3JvdGFzayA9IHJlcXVpcmUoJy4vX3Rhc2snKS5zZXRcbiAgLCBPYnNlcnZlciAgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlclxuICAsIHByb2Nlc3MgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgUHJvbWlzZSAgID0gZ2xvYmFsLlByb21pc2VcbiAgLCBpc05vZGUgICAgPSByZXF1aXJlKCcuL19jb2YnKShwcm9jZXNzKSA9PSAncHJvY2Vzcyc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGhlYWQsIGxhc3QsIG5vdGlmeTtcblxuICB2YXIgZmx1c2ggPSBmdW5jdGlvbigpe1xuICAgIHZhciBwYXJlbnQsIGZuO1xuICAgIGlmKGlzTm9kZSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKXBhcmVudC5leGl0KCk7XG4gICAgd2hpbGUoaGVhZCl7XG4gICAgICBmbiAgID0gaGVhZC5mbjtcbiAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICB0cnkge1xuICAgICAgICBmbigpO1xuICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgaWYoaGVhZClub3RpZnkoKTtcbiAgICAgICAgZWxzZSBsYXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0gbGFzdCA9IHVuZGVmaW5lZDtcbiAgICBpZihwYXJlbnQpcGFyZW50LmVudGVyKCk7XG4gIH07XG5cbiAgLy8gTm9kZS5qc1xuICBpZihpc05vZGUpe1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uKCl7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcbiAgICB9O1xuICAvLyBicm93c2VycyB3aXRoIE11dGF0aW9uT2JzZXJ2ZXJcbiAgfSBlbHNlIGlmKE9ic2VydmVyKXtcbiAgICB2YXIgdG9nZ2xlID0gdHJ1ZVxuICAgICAgLCBub2RlICAgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgbmV3IE9ic2VydmVyKGZsdXNoKS5vYnNlcnZlKG5vZGUsIHtjaGFyYWN0ZXJEYXRhOiB0cnVlfSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gICAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcbiAgICAgIG5vZGUuZGF0YSA9IHRvZ2dsZSA9ICF0b2dnbGU7XG4gICAgfTtcbiAgLy8gZW52aXJvbm1lbnRzIHdpdGggbWF5YmUgbm9uLWNvbXBsZXRlbHkgY29ycmVjdCwgYnV0IGV4aXN0ZW50IFByb21pc2VcbiAgfSBlbHNlIGlmKFByb21pc2UgJiYgUHJvbWlzZS5yZXNvbHZlKXtcbiAgICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uKCl7XG4gICAgICBwcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH07XG4gIC8vIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLSBtYWNyb3Rhc2sgYmFzZWQgb246XG4gIC8vIC0gc2V0SW1tZWRpYXRlXG4gIC8vIC0gTWVzc2FnZUNoYW5uZWxcbiAgLy8gLSB3aW5kb3cucG9zdE1lc3NhZ1xuICAvLyAtIG9ucmVhZHlzdGF0ZWNoYW5nZVxuICAvLyAtIHNldFRpbWVvdXRcbiAgfSBlbHNlIHtcbiAgICBub3RpZnkgPSBmdW5jdGlvbigpe1xuICAgICAgLy8gc3RyYW5nZSBJRSArIHdlYnBhY2sgZGV2IHNlcnZlciBidWcgLSB1c2UgLmNhbGwoZ2xvYmFsKVxuICAgICAgbWFjcm90YXNrLmNhbGwoZ2xvYmFsLCBmbHVzaCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihmbil7XG4gICAgdmFyIHRhc2sgPSB7Zm46IGZuLCBuZXh0OiB1bmRlZmluZWR9O1xuICAgIGlmKGxhc3QpbGFzdC5uZXh0ID0gdGFzaztcbiAgICBpZighaGVhZCl7XG4gICAgICBoZWFkID0gdGFzaztcbiAgICAgIG5vdGlmeSgpO1xuICAgIH0gbGFzdCA9IHRhc2s7XG4gIH07XG59OyIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBkUHMgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKVxuICAsIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpXG4gICwgSUVfUFJPVE8gICAgPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJylcbiAgLCBFbXB0eSAgICAgICA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH1cbiAgLCBQUk9UT1RZUEUgICA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uKCl7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpXG4gICAgLCBpICAgICAgPSBlbnVtQnVnS2V5cy5sZW5ndGhcbiAgICAsIGx0ICAgICA9ICc8J1xuICAgICwgZ3QgICAgID0gJz4nXG4gICAgLCBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZShpLS0pZGVsZXRlIGNyZWF0ZURpY3RbUFJPVE9UWVBFXVtlbnVtQnVnS2V5c1tpXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpe1xuICB2YXIgcmVzdWx0O1xuICBpZihPICE9PSBudWxsKXtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5O1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcbiIsInZhciBhbk9iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGRQICAgICAgICAgICAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyl7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKU9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07IiwidmFyIGRQICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgZ2V0S2V5cyAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcyl7XG4gIGFuT2JqZWN0KE8pO1xuICB2YXIga2V5cyAgID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKVxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAsIGkgPSAwXG4gICAgLCBQO1xuICB3aGlsZShsZW5ndGggPiBpKWRQLmYoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XG4gIHJldHVybiBPO1xufTsiLCIvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCB0b09iamVjdCAgICA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXG4gICwgSUVfUFJPVE8gICAgPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJylcbiAgLCBPYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uKE8pe1xuICBPID0gdG9PYmplY3QoTyk7XG4gIGlmKGhhcyhPLCBJRV9QUk9UTykpcmV0dXJuIE9bSUVfUFJPVE9dO1xuICBpZih0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKXtcbiAgICByZXR1cm4gTy5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gIH0gcmV0dXJuIE8gaW5zdGFuY2VvZiBPYmplY3QgPyBPYmplY3RQcm90byA6IG51bGw7XG59OyIsInZhciBoYXMgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIHRvSU9iamVjdCAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIGFycmF5SW5kZXhPZiA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykoZmFsc2UpXG4gICwgSUVfUFJPVE8gICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgbmFtZXMpe1xuICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KG9iamVjdClcbiAgICAsIGkgICAgICA9IDBcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBrZXk7XG4gIGZvcihrZXkgaW4gTylpZihrZXkgIT0gSUVfUFJPVE8paGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSl7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTsiLCIvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbnZhciAka2V5cyAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJylcbiAgLCBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pe1xuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJpdG1hcCwgdmFsdWUpe1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcbiAgfTtcbn07IiwidmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgc3JjLCBzYWZlKXtcbiAgZm9yKHZhciBrZXkgaW4gc3JjKXtcbiAgICBpZihzYWZlICYmIHRhcmdldFtrZXldKXRhcmdldFtrZXldID0gc3JjW2tleV07XG4gICAgZWxzZSBoaWRlKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XG4gIH0gcmV0dXJuIHRhcmdldDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19oaWRlJyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGRQICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJylcbiAgLCBTUEVDSUVTICAgICA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSB0eXBlb2YgY29yZVtLRVldID09ICdmdW5jdGlvbicgPyBjb3JlW0tFWV0gOiBnbG9iYWxbS0VZXTtcbiAgaWYoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSlkUC5mKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07IiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZcbiAgLCBoYXMgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xuICBpZihpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKWRlZihpdCwgVEFHLCB7Y29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnfSk7XG59OyIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpXG4gICwgdWlkICAgID0gcmVxdWlyZSgnLi9fdWlkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59OyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07IiwiLy8gNy4zLjIwIFNwZWNpZXNDb25zdHJ1Y3RvcihPLCBkZWZhdWx0Q29uc3RydWN0b3IpXG52YXIgYW5PYmplY3QgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJylcbiAgLCBTUEVDSUVTICAgPSByZXF1aXJlKCcuL193a3MnKSgnc3BlY2llcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihPLCBEKXtcbiAgdmFyIEMgPSBhbk9iamVjdChPKS5jb25zdHJ1Y3RvciwgUztcbiAgcmV0dXJuIEMgPT09IHVuZGVmaW5lZCB8fCAoUyA9IGFuT2JqZWN0KEMpW1NQRUNJRVNdKSA9PSB1bmRlZmluZWQgPyBEIDogYUZ1bmN0aW9uKFMpO1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgZGVmaW5lZCAgID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTsiLCJ2YXIgY3R4ICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBpbnZva2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19pbnZva2UnKVxuICAsIGh0bWwgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2h0bWwnKVxuICAsIGNlbCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKVxuICAsIGdsb2JhbCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgcHJvY2VzcyAgICAgICAgICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBzZXRUYXNrICAgICAgICAgICAgPSBnbG9iYWwuc2V0SW1tZWRpYXRlXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXG4gICwgTWVzc2FnZUNoYW5uZWwgICAgID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsXG4gICwgY291bnRlciAgICAgICAgICAgID0gMFxuICAsIHF1ZXVlICAgICAgICAgICAgICA9IHt9XG4gICwgT05SRUFEWVNUQVRFQ0hBTkdFID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSdcbiAgLCBkZWZlciwgY2hhbm5lbCwgcG9ydDtcbnZhciBydW4gPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSArdGhpcztcbiAgaWYocXVldWUuaGFzT3duUHJvcGVydHkoaWQpKXtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59O1xudmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICBydW4uY2FsbChldmVudC5kYXRhKTtcbn07XG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBvdGhlcndpc2U6XG5pZighc2V0VGFzayB8fCAhY2xlYXJUYXNrKXtcbiAgc2V0VGFzayA9IGZ1bmN0aW9uIHNldEltbWVkaWF0ZShmbil7XG4gICAgdmFyIGFyZ3MgPSBbXSwgaSA9IDE7XG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICBxdWV1ZVsrK2NvdW50ZXJdID0gZnVuY3Rpb24oKXtcbiAgICAgIGludm9rZSh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJyA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcbiAgICB9O1xuICAgIGRlZmVyKGNvdW50ZXIpO1xuICAgIHJldHVybiBjb3VudGVyO1xuICB9O1xuICBjbGVhclRhc2sgPSBmdW5jdGlvbiBjbGVhckltbWVkaWF0ZShpZCl7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbiAgLy8gTm9kZS5qcyAwLjgtXG4gIGlmKHJlcXVpcmUoJy4vX2NvZicpKHByb2Nlc3MpID09ICdwcm9jZXNzJyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGN0eChydW4sIGlkLCAxKSk7XG4gICAgfTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBNZXNzYWdlQ2hhbm5lbCwgaW5jbHVkZXMgV2ViV29ya2Vyc1xuICB9IGVsc2UgaWYoTWVzc2FnZUNoYW5uZWwpe1xuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgcG9ydCAgICA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0ZW5lcjtcbiAgICBkZWZlciA9IGN0eChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBwb3N0TWVzc2FnZSwgc2tpcCBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzICdvYmplY3QnXG4gIH0gZWxzZSBpZihnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiB0eXBlb2YgcG9zdE1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJyAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKGlkICsgJycsICcqJyk7XG4gICAgfTtcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyLCBmYWxzZSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjZWwoJ3NjcmlwdCcpKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHJ1bi5jYWxsKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiAgIHNldFRhc2ssXG4gIGNsZWFyOiBjbGVhclRhc2tcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1heCAgICAgICA9IE1hdGgubWF4XG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTsiLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgUyl7XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZih0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07IiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07IiwidmFyIHN0b3JlICAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJylcbiAgLCB1aWQgICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJylcbiAgLCBTeW1ib2wgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sXG4gICwgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcblxudmFyICRleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7IiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgIT0gdW5kZWZpbmVkKXJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuL19hZGQtdG8tdW5zY29wYWJsZXMnKVxuICAsIHN0ZXAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKVxuICAsIEl0ZXJhdG9ycyAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICB0aGlzLl90ID0gdG9JT2JqZWN0KGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4gIHRoaXMuX2sgPSBraW5kOyAgICAgICAgICAgICAgICAvLyBraW5kXG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGtpbmQgID0gdGhpcy5fa1xuICAgICwgaW5kZXggPSB0aGlzLl9pKys7XG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcbiAgICB0aGlzLl90ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcbiAgcmV0dXJuIHN0ZXAoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xuXG5hZGRUb1Vuc2NvcGFibGVzKCdrZXlzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCd2YWx1ZXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ2VudHJpZXMnKTsiLCIiLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fbGlicmFyeScpXG4gICwgZ2xvYmFsICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjdHggICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGNsYXNzb2YgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKVxuICAsICRleHBvcnQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgaXNPYmplY3QgICAgICAgICAgID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBhRnVuY3Rpb24gICAgICAgICAgPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJylcbiAgLCBhbkluc3RhbmNlICAgICAgICAgPSByZXF1aXJlKCcuL19hbi1pbnN0YW5jZScpXG4gICwgZm9yT2YgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fZm9yLW9mJylcbiAgLCBzcGVjaWVzQ29uc3RydWN0b3IgPSByZXF1aXJlKCcuL19zcGVjaWVzLWNvbnN0cnVjdG9yJylcbiAgLCB0YXNrICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL190YXNrJykuc2V0XG4gICwgbWljcm90YXNrICAgICAgICAgID0gcmVxdWlyZSgnLi9fbWljcm90YXNrJykoKVxuICAsIFBST01JU0UgICAgICAgICAgICA9ICdQcm9taXNlJ1xuICAsIFR5cGVFcnJvciAgICAgICAgICA9IGdsb2JhbC5UeXBlRXJyb3JcbiAgLCBwcm9jZXNzICAgICAgICAgICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsICRQcm9taXNlICAgICAgICAgICA9IGdsb2JhbFtQUk9NSVNFXVxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgaXNOb2RlICAgICAgICAgICAgID0gY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2VzcydcbiAgLCBlbXB0eSAgICAgICAgICAgICAgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9XG4gICwgSW50ZXJuYWwsIEdlbmVyaWNQcm9taXNlQ2FwYWJpbGl0eSwgV3JhcHBlcjtcblxudmFyIFVTRV9OQVRJVkUgPSAhIWZ1bmN0aW9uKCl7XG4gIHRyeSB7XG4gICAgLy8gY29ycmVjdCBzdWJjbGFzc2luZyB3aXRoIEBAc3BlY2llcyBzdXBwb3J0XG4gICAgdmFyIHByb21pc2UgICAgID0gJFByb21pc2UucmVzb2x2ZSgxKVxuICAgICAgLCBGYWtlUHJvbWlzZSA9IChwcm9taXNlLmNvbnN0cnVjdG9yID0ge30pW3JlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyldID0gZnVuY3Rpb24oZXhlYyl7IGV4ZWMoZW1wdHksIGVtcHR5KTsgfTtcbiAgICAvLyB1bmhhbmRsZWQgcmVqZWN0aW9ucyB0cmFja2luZyBzdXBwb3J0LCBOb2RlSlMgUHJvbWlzZSB3aXRob3V0IGl0IGZhaWxzIEBAc3BlY2llcyB0ZXN0XG4gICAgcmV0dXJuIChpc05vZGUgfHwgdHlwZW9mIFByb21pc2VSZWplY3Rpb25FdmVudCA9PSAnZnVuY3Rpb24nKSAmJiBwcm9taXNlLnRoZW4oZW1wdHkpIGluc3RhbmNlb2YgRmFrZVByb21pc2U7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbn0oKTtcblxuLy8gaGVscGVyc1xudmFyIHNhbWVDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKGEsIGIpe1xuICAvLyB3aXRoIGxpYnJhcnkgd3JhcHBlciBzcGVjaWFsIGNhc2VcbiAgcmV0dXJuIGEgPT09IGIgfHwgYSA9PT0gJFByb21pc2UgJiYgYiA9PT0gV3JhcHBlcjtcbn07XG52YXIgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIHRoZW47XG4gIHJldHVybiBpc09iamVjdChpdCkgJiYgdHlwZW9mICh0aGVuID0gaXQudGhlbikgPT0gJ2Z1bmN0aW9uJyA/IHRoZW4gOiBmYWxzZTtcbn07XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbihDKXtcbiAgcmV0dXJuIHNhbWVDb25zdHJ1Y3RvcigkUHJvbWlzZSwgQylcbiAgICA/IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKVxuICAgIDogbmV3IEdlbmVyaWNQcm9taXNlQ2FwYWJpbGl0eShDKTtcbn07XG52YXIgUHJvbWlzZUNhcGFiaWxpdHkgPSBHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbihDKXtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdGhpcy5wcm9taXNlID0gbmV3IEMoZnVuY3Rpb24oJCRyZXNvbHZlLCAkJHJlamVjdCl7XG4gICAgaWYocmVzb2x2ZSAhPT0gdW5kZWZpbmVkIHx8IHJlamVjdCAhPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcignQmFkIFByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICByZXNvbHZlID0gJCRyZXNvbHZlO1xuICAgIHJlamVjdCAgPSAkJHJlamVjdDtcbiAgfSk7XG4gIHRoaXMucmVzb2x2ZSA9IGFGdW5jdGlvbihyZXNvbHZlKTtcbiAgdGhpcy5yZWplY3QgID0gYUZ1bmN0aW9uKHJlamVjdCk7XG59O1xudmFyIHBlcmZvcm0gPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICBleGVjKCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHtlcnJvcjogZX07XG4gIH1cbn07XG52YXIgbm90aWZ5ID0gZnVuY3Rpb24ocHJvbWlzZSwgaXNSZWplY3Qpe1xuICBpZihwcm9taXNlLl9uKXJldHVybjtcbiAgcHJvbWlzZS5fbiA9IHRydWU7XG4gIHZhciBjaGFpbiA9IHByb21pc2UuX2M7XG4gIG1pY3JvdGFzayhmdW5jdGlvbigpe1xuICAgIHZhciB2YWx1ZSA9IHByb21pc2UuX3ZcbiAgICAgICwgb2sgICAgPSBwcm9taXNlLl9zID09IDFcbiAgICAgICwgaSAgICAgPSAwO1xuICAgIHZhciBydW4gPSBmdW5jdGlvbihyZWFjdGlvbil7XG4gICAgICB2YXIgaGFuZGxlciA9IG9rID8gcmVhY3Rpb24ub2sgOiByZWFjdGlvbi5mYWlsXG4gICAgICAgICwgcmVzb2x2ZSA9IHJlYWN0aW9uLnJlc29sdmVcbiAgICAgICAgLCByZWplY3QgID0gcmVhY3Rpb24ucmVqZWN0XG4gICAgICAgICwgZG9tYWluICA9IHJlYWN0aW9uLmRvbWFpblxuICAgICAgICAsIHJlc3VsdCwgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgIGlmKCFvayl7XG4gICAgICAgICAgICBpZihwcm9taXNlLl9oID09IDIpb25IYW5kbGVVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgICAgICAgICBwcm9taXNlLl9oID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoaGFuZGxlciA9PT0gdHJ1ZSlyZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmKGRvbWFpbilkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZXIodmFsdWUpO1xuICAgICAgICAgICAgaWYoZG9tYWluKWRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKHJlc3VsdCA9PT0gcmVhY3Rpb24ucHJvbWlzZSl7XG4gICAgICAgICAgICByZWplY3QoVHlwZUVycm9yKCdQcm9taXNlLWNoYWluIGN5Y2xlJykpO1xuICAgICAgICAgIH0gZWxzZSBpZih0aGVuID0gaXNUaGVuYWJsZShyZXN1bHQpKXtcbiAgICAgICAgICAgIHRoZW4uY2FsbChyZXN1bHQsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHJlamVjdCh2YWx1ZSk7XG4gICAgICB9IGNhdGNoKGUpe1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXJ1bihjaGFpbltpKytdKTsgLy8gdmFyaWFibGUgbGVuZ3RoIC0gY2FuJ3QgdXNlIGZvckVhY2hcbiAgICBwcm9taXNlLl9jID0gW107XG4gICAgcHJvbWlzZS5fbiA9IGZhbHNlO1xuICAgIGlmKGlzUmVqZWN0ICYmICFwcm9taXNlLl9oKW9uVW5oYW5kbGVkKHByb21pc2UpO1xuICB9KTtcbn07XG52YXIgb25VbmhhbmRsZWQgPSBmdW5jdGlvbihwcm9taXNlKXtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24oKXtcbiAgICB2YXIgdmFsdWUgPSBwcm9taXNlLl92XG4gICAgICAsIGFicnVwdCwgaGFuZGxlciwgY29uc29sZTtcbiAgICBpZihpc1VuaGFuZGxlZChwcm9taXNlKSl7XG4gICAgICBhYnJ1cHQgPSBwZXJmb3JtKGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKGlzTm9kZSl7XG4gICAgICAgICAgcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSBpZihoYW5kbGVyID0gZ2xvYmFsLm9udW5oYW5kbGVkcmVqZWN0aW9uKXtcbiAgICAgICAgICBoYW5kbGVyKHtwcm9taXNlOiBwcm9taXNlLCByZWFzb246IHZhbHVlfSk7XG4gICAgICAgIH0gZWxzZSBpZigoY29uc29sZSA9IGdsb2JhbC5jb25zb2xlKSAmJiBjb25zb2xlLmVycm9yKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24nLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gQnJvd3NlcnMgc2hvdWxkIG5vdCB0cmlnZ2VyIGByZWplY3Rpb25IYW5kbGVkYCBldmVudCBpZiBpdCB3YXMgaGFuZGxlZCBoZXJlLCBOb2RlSlMgLSBzaG91bGRcbiAgICAgIHByb21pc2UuX2ggPSBpc05vZGUgfHwgaXNVbmhhbmRsZWQocHJvbWlzZSkgPyAyIDogMTtcbiAgICB9IHByb21pc2UuX2EgPSB1bmRlZmluZWQ7XG4gICAgaWYoYWJydXB0KXRocm93IGFicnVwdC5lcnJvcjtcbiAgfSk7XG59O1xudmFyIGlzVW5oYW5kbGVkID0gZnVuY3Rpb24ocHJvbWlzZSl7XG4gIGlmKHByb21pc2UuX2ggPT0gMSlyZXR1cm4gZmFsc2U7XG4gIHZhciBjaGFpbiA9IHByb21pc2UuX2EgfHwgcHJvbWlzZS5fY1xuICAgICwgaSAgICAgPSAwXG4gICAgLCByZWFjdGlvbjtcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XG4gICAgcmVhY3Rpb24gPSBjaGFpbltpKytdO1xuICAgIGlmKHJlYWN0aW9uLmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0aW9uLnByb21pc2UpKXJldHVybiBmYWxzZTtcbiAgfSByZXR1cm4gdHJ1ZTtcbn07XG52YXIgb25IYW5kbGVVbmhhbmRsZWQgPSBmdW5jdGlvbihwcm9taXNlKXtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24oKXtcbiAgICB2YXIgaGFuZGxlcjtcbiAgICBpZihpc05vZGUpe1xuICAgICAgcHJvY2Vzcy5lbWl0KCdyZWplY3Rpb25IYW5kbGVkJywgcHJvbWlzZSk7XG4gICAgfSBlbHNlIGlmKGhhbmRsZXIgPSBnbG9iYWwub25yZWplY3Rpb25oYW5kbGVkKXtcbiAgICAgIGhhbmRsZXIoe3Byb21pc2U6IHByb21pc2UsIHJlYXNvbjogcHJvbWlzZS5fdn0pO1xuICAgIH1cbiAgfSk7XG59O1xudmFyICRyZWplY3QgPSBmdW5jdGlvbih2YWx1ZSl7XG4gIHZhciBwcm9taXNlID0gdGhpcztcbiAgaWYocHJvbWlzZS5fZClyZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgcHJvbWlzZS5fdiA9IHZhbHVlO1xuICBwcm9taXNlLl9zID0gMjtcbiAgaWYoIXByb21pc2UuX2EpcHJvbWlzZS5fYSA9IHByb21pc2UuX2Muc2xpY2UoKTtcbiAgbm90aWZ5KHByb21pc2UsIHRydWUpO1xufTtcbnZhciAkcmVzb2x2ZSA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdmFyIHByb21pc2UgPSB0aGlzXG4gICAgLCB0aGVuO1xuICBpZihwcm9taXNlLl9kKXJldHVybjtcbiAgcHJvbWlzZS5fZCA9IHRydWU7XG4gIHByb21pc2UgPSBwcm9taXNlLl93IHx8IHByb21pc2U7IC8vIHVud3JhcFxuICB0cnkge1xuICAgIGlmKHByb21pc2UgPT09IHZhbHVlKXRocm93IFR5cGVFcnJvcihcIlByb21pc2UgY2FuJ3QgYmUgcmVzb2x2ZWQgaXRzZWxmXCIpO1xuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XG4gICAgICBtaWNyb3Rhc2soZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSB7X3c6IHByb21pc2UsIF9kOiBmYWxzZX07IC8vIHdyYXBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eCgkcmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eCgkcmVqZWN0LCB3cmFwcGVyLCAxKSk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgJHJlamVjdC5jYWxsKHdyYXBwZXIsIGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvbWlzZS5fdiA9IHZhbHVlO1xuICAgICAgcHJvbWlzZS5fcyA9IDE7XG4gICAgICBub3RpZnkocHJvbWlzZSwgZmFsc2UpO1xuICAgIH1cbiAgfSBjYXRjaChlKXtcbiAgICAkcmVqZWN0LmNhbGwoe193OiBwcm9taXNlLCBfZDogZmFsc2V9LCBlKTsgLy8gd3JhcFxuICB9XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBwb2x5ZmlsbFxuaWYoIVVTRV9OQVRJVkUpe1xuICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxuICAkUHJvbWlzZSA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xuICAgIGFuSW5zdGFuY2UodGhpcywgJFByb21pc2UsIFBST01JU0UsICdfaCcpO1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgSW50ZXJuYWwuY2FsbCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCB0aGlzLCAxKSwgY3R4KCRyZWplY3QsIHRoaXMsIDEpKTtcbiAgICB9IGNhdGNoKGVycil7XG4gICAgICAkcmVqZWN0LmNhbGwodGhpcywgZXJyKTtcbiAgICB9XG4gIH07XG4gIEludGVybmFsID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcil7XG4gICAgdGhpcy5fYyA9IFtdOyAgICAgICAgICAgICAvLyA8LSBhd2FpdGluZyByZWFjdGlvbnNcbiAgICB0aGlzLl9hID0gdW5kZWZpbmVkOyAgICAgIC8vIDwtIGNoZWNrZWQgaW4gaXNVbmhhbmRsZWQgcmVhY3Rpb25zXG4gICAgdGhpcy5fcyA9IDA7ICAgICAgICAgICAgICAvLyA8LSBzdGF0ZVxuICAgIHRoaXMuX2QgPSBmYWxzZTsgICAgICAgICAgLy8gPC0gZG9uZVxuICAgIHRoaXMuX3YgPSB1bmRlZmluZWQ7ICAgICAgLy8gPC0gdmFsdWVcbiAgICB0aGlzLl9oID0gMDsgICAgICAgICAgICAgIC8vIDwtIHJlamVjdGlvbiBzdGF0ZSwgMCAtIGRlZmF1bHQsIDEgLSBoYW5kbGVkLCAyIC0gdW5oYW5kbGVkXG4gICAgdGhpcy5fbiA9IGZhbHNlOyAgICAgICAgICAvLyA8LSBub3RpZnlcbiAgfTtcbiAgSW50ZXJuYWwucHJvdG90eXBlID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUtYWxsJykoJFByb21pc2UucHJvdG90eXBlLCB7XG4gICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcbiAgICB0aGVuOiBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKXtcbiAgICAgIHZhciByZWFjdGlvbiAgICA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHNwZWNpZXNDb25zdHJ1Y3Rvcih0aGlzLCAkUHJvbWlzZSkpO1xuICAgICAgcmVhY3Rpb24ub2sgICAgID0gdHlwZW9mIG9uRnVsZmlsbGVkID09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IHRydWU7XG4gICAgICByZWFjdGlvbi5mYWlsICAgPSB0eXBlb2Ygb25SZWplY3RlZCA9PSAnZnVuY3Rpb24nICYmIG9uUmVqZWN0ZWQ7XG4gICAgICByZWFjdGlvbi5kb21haW4gPSBpc05vZGUgPyBwcm9jZXNzLmRvbWFpbiA6IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2MucHVzaChyZWFjdGlvbik7XG4gICAgICBpZih0aGlzLl9hKXRoaXMuX2EucHVzaChyZWFjdGlvbik7XG4gICAgICBpZih0aGlzLl9zKW5vdGlmeSh0aGlzLCBmYWxzZSk7XG4gICAgICByZXR1cm4gcmVhY3Rpb24ucHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3RlZCl7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG4gICAgfVxuICB9KTtcbiAgUHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbigpe1xuICAgIHZhciBwcm9taXNlICA9IG5ldyBJbnRlcm5hbDtcbiAgICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICAgIHRoaXMucmVzb2x2ZSA9IGN0eCgkcmVzb2x2ZSwgcHJvbWlzZSwgMSk7XG4gICAgdGhpcy5yZWplY3QgID0gY3R4KCRyZWplY3QsIHByb21pc2UsIDEpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7UHJvbWlzZTogJFByb21pc2V9KTtcbnJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJykoJFByb21pc2UsIFBST01JU0UpO1xucmVxdWlyZSgnLi9fc2V0LXNwZWNpZXMnKShQUk9NSVNFKTtcbldyYXBwZXIgPSByZXF1aXJlKCcuL19jb3JlJylbUFJPTUlTRV07XG5cbi8vIHN0YXRpY3NcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjUgUHJvbWlzZS5yZWplY3QocilcbiAgcmVqZWN0OiBmdW5jdGlvbiByZWplY3Qocil7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKVxuICAgICAgLCAkJHJlamVjdCAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgJCRyZWplY3Qocik7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIChMSUJSQVJZIHx8ICFVU0VfTkFUSVZFKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNiBQcm9taXNlLnJlc29sdmUoeClcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh4KXtcbiAgICAvLyBpbnN0YW5jZW9mIGluc3RlYWQgb2YgaW50ZXJuYWwgc2xvdCBjaGVjayBiZWNhdXNlIHdlIHNob3VsZCBmaXggaXQgd2l0aG91dCByZXBsYWNlbWVudCBuYXRpdmUgUHJvbWlzZSBjb3JlXG4gICAgaWYoeCBpbnN0YW5jZW9mICRQcm9taXNlICYmIHNhbWVDb25zdHJ1Y3Rvcih4LmNvbnN0cnVjdG9yLCB0aGlzKSlyZXR1cm4geDtcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHRoaXMpXG4gICAgICAsICQkcmVzb2x2ZSAgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgJCRyZXNvbHZlKHgpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhKFVTRV9OQVRJVkUgJiYgcmVxdWlyZSgnLi9faXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXtcbiAgJFByb21pc2UuYWxsKGl0ZXIpWydjYXRjaCddKGVtcHR5KTtcbn0pKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgICAgID0gdGhpc1xuICAgICAgLCBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICAgICwgcmVzb2x2ZSAgICA9IGNhcGFiaWxpdHkucmVzb2x2ZVxuICAgICAgLCByZWplY3QgICAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIGFicnVwdCA9IHBlcmZvcm0oZnVuY3Rpb24oKXtcbiAgICAgIHZhciB2YWx1ZXMgICAgPSBbXVxuICAgICAgICAsIGluZGV4ICAgICA9IDBcbiAgICAgICAgLCByZW1haW5pbmcgPSAxO1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcbiAgICAgICAgdmFyICRpbmRleCAgICAgICAgPSBpbmRleCsrXG4gICAgICAgICAgLCBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgaWYoYWxyZWFkeUNhbGxlZClyZXR1cm47XG4gICAgICAgICAgYWxyZWFkeUNhbGxlZCAgPSB0cnVlO1xuICAgICAgICAgIHZhbHVlc1skaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgfSk7XG4gICAgaWYoYWJydXB0KXJlamVjdChhYnJ1cHQuZXJyb3IpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH0sXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSl7XG4gICAgdmFyIEMgICAgICAgICAgPSB0aGlzXG4gICAgICAsIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShDKVxuICAgICAgLCByZWplY3QgICAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIGFicnVwdCA9IHBlcmZvcm0oZnVuY3Rpb24oKXtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24ocHJvbWlzZSl7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGNhcGFiaWxpdHkucmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmKGFicnVwdClyZWplY3QoYWJydXB0LmVycm9yKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGF0ICA9IHJlcXVpcmUoJy4vX3N0cmluZy1hdCcpKHRydWUpO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuL19pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwgaW5kZXggPSB0aGlzLl9pXG4gICAgLCBwb2ludDtcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHt2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlfTtcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xuICB0aGlzLl9pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHt2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlfTtcbn0pOyIsInJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XG52YXIgZ2xvYmFsICAgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgaGlkZSAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIEl0ZXJhdG9ycyAgICAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIFRPX1NUUklOR19UQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxuZm9yKHZhciBjb2xsZWN0aW9ucyA9IFsnTm9kZUxpc3QnLCAnRE9NVG9rZW5MaXN0JywgJ01lZGlhTGlzdCcsICdTdHlsZVNoZWV0TGlzdCcsICdDU1NSdWxlTGlzdCddLCBpID0gMDsgaSA8IDU7IGkrKyl7XG4gIHZhciBOQU1FICAgICAgID0gY29sbGVjdGlvbnNbaV1cbiAgICAsIENvbGxlY3Rpb24gPSBnbG9iYWxbTkFNRV1cbiAgICAsIHByb3RvICAgICAgPSBDb2xsZWN0aW9uICYmIENvbGxlY3Rpb24ucHJvdG90eXBlO1xuICBpZihwcm90byAmJiAhcHJvdG9bVE9fU1RSSU5HX1RBR10paGlkZShwcm90bywgVE9fU1RSSU5HX1RBRywgTkFNRSk7XG4gIEl0ZXJhdG9yc1tOQU1FXSA9IEl0ZXJhdG9ycy5BcnJheTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2luZmVybm8vZGlzdC9pbmZlcm5vLWNvbXBvbmVudC5ub2RlJyk7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbW9kdWxlLmV4cG9ydHM7IiwiLyohXG4gKiBpbmZlcm5vLWNvbXBvbmVudCB2MS4yLjFcbiAqIChjKSAyMDE3IERvbWluaWMgR2FubmF3YXlcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2luZmVybm8nKSkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydpbmZlcm5vJ10sIGZhY3RvcnkpIDpcblx0KGdsb2JhbC5JbmZlcm5vID0gZ2xvYmFsLkluZmVybm8gfHwge30sIGdsb2JhbC5JbmZlcm5vLkNvbXBvbmVudCA9IGZhY3RvcnkoZ2xvYmFsLkluZmVybm8pKTtcbn0odGhpcywgKGZ1bmN0aW9uIChpbmZlcm5vKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIEVSUk9SX01TRyA9ICdhIHJ1bnRpbWUgZXJyb3Igb2NjdXJlZCEgVXNlIEluZmVybm8gaW4gZGV2ZWxvcG1lbnQgZW52aXJvbm1lbnQgdG8gZmluZCB0aGUgZXJyb3IuJztcbnZhciBpc0Jyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuZG9jdW1lbnQ7XG5cbi8vIHRoaXMgaXMgTVVDSCBmYXN0ZXIgdGhhbiAuY29uc3RydWN0b3IgPT09IEFycmF5IGFuZCBpbnN0YW5jZW9mIEFycmF5XG4vLyBpbiBOb2RlIDcgYW5kIHRoZSBsYXRlciB2ZXJzaW9ucyBvZiBWOCwgc2xvd2VyIGluIG9sZGVyIHZlcnNpb25zIHRob3VnaFxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5mdW5jdGlvbiBpc1N0cmluZ09yTnVtYmVyKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ3N0cmluZycgfHwgdHlwZSA9PT0gJ251bWJlcic7XG59XG5mdW5jdGlvbiBpc051bGxPclVuZGVmKG9iaikge1xuICAgIHJldHVybiBpc1VuZGVmaW5lZChvYmopIHx8IGlzTnVsbChvYmopO1xufVxuZnVuY3Rpb24gaXNJbnZhbGlkKG9iaikge1xuICAgIHJldHVybiBpc051bGwob2JqKSB8fCBvYmogPT09IGZhbHNlIHx8IGlzVHJ1ZShvYmopIHx8IGlzVW5kZWZpbmVkKG9iaik7XG59XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nO1xufVxuXG5cblxuZnVuY3Rpb24gaXNOdWxsKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG59XG5mdW5jdGlvbiBpc1RydWUob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gdGhyb3dFcnJvcihtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBFUlJPUl9NU0c7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigoXCJJbmZlcm5vIEVycm9yOiBcIiArIG1lc3NhZ2UpKTtcbn1cblxudmFyIExpZmVjeWNsZSA9IGZ1bmN0aW9uIExpZmVjeWNsZSgpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuZmFzdFVubW91bnQgPSB0cnVlO1xufTtcbkxpZmVjeWNsZS5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lciAoY2FsbGJhY2spIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbn07XG5MaWZlY3ljbGUucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiB0cmlnZ2VyICgpIHtcbiAgICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMkMS5saXN0ZW5lcnNbaV0oKTtcbiAgICB9XG59O1xuXG52YXIgbm9PcCA9IEVSUk9SX01TRztcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgbm9PcCA9ICdJbmZlcm5vIEVycm9yOiBDYW4gb25seSB1cGRhdGUgYSBtb3VudGVkIG9yIG1vdW50aW5nIGNvbXBvbmVudC4gVGhpcyB1c3VhbGx5IG1lYW5zIHlvdSBjYWxsZWQgc2V0U3RhdGUoKSBvciBmb3JjZVVwZGF0ZSgpIG9uIGFuIHVubW91bnRlZCBjb21wb25lbnQuIFRoaXMgaXMgYSBuby1vcC4nO1xufVxudmFyIGNvbXBvbmVudENhbGxiYWNrUXVldWUgPSBuZXcgTWFwKCk7XG4vLyB3aGVuIGEgY29tcG9uZW50cyByb290IFZOb2RlIGlzIGFsc28gYSBjb21wb25lbnQsIHdlIGNhbiBydW4gaW50byBpc3N1ZXNcbi8vIHRoaXMgd2lsbCByZWN1cnNpdmVseSBsb29rIGZvciB2Tm9kZS5wYXJlbnROb2RlIGlmIHRoZSBWTm9kZSBpcyBhIGNvbXBvbmVudFxuZnVuY3Rpb24gdXBkYXRlUGFyZW50Q29tcG9uZW50Vk5vZGVzKHZOb2RlLCBkb20pIHtcbiAgICBpZiAodk5vZGUuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgdmFyIHBhcmVudFZOb2RlID0gdk5vZGUucGFyZW50Vk5vZGU7XG4gICAgICAgIGlmIChwYXJlbnRWTm9kZSkge1xuICAgICAgICAgICAgcGFyZW50Vk5vZGUuZG9tID0gZG9tO1xuICAgICAgICAgICAgdXBkYXRlUGFyZW50Q29tcG9uZW50Vk5vZGVzKHBhcmVudFZOb2RlLCBkb20pO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gdGhpcyBpcyBpbiBzaGFwZXMgdG9vLCBidXQgd2UgZG9uJ3Qgd2FudCB0byBpbXBvcnQgZnJvbSBzaGFwZXMgYXMgaXQgd2lsbCBwdWxsIGluIGEgZHVwbGljYXRlIG9mIGNyZWF0ZVZOb2RlXG5mdW5jdGlvbiBjcmVhdGVWb2lkVk5vZGUoKSB7XG4gICAgcmV0dXJuIGluZmVybm8uY3JlYXRlVk5vZGUoNDA5NiAvKiBWb2lkICovKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHRWTm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGluZmVybm8uY3JlYXRlVk5vZGUoMSAvKiBUZXh0ICovLCBudWxsLCBudWxsLCB0ZXh0KTtcbn1cbmZ1bmN0aW9uIGFkZFRvUXVldWUoY29tcG9uZW50LCBmb3JjZSwgY2FsbGJhY2spIHtcbiAgICAvLyBUT0RPIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV2aXNlZCBhbmQgaW1wcm92ZWQgb25cbiAgICB2YXIgcXVldWUgPSBjb21wb25lbnRDYWxsYmFja1F1ZXVlLmdldChjb21wb25lbnQpO1xuICAgIGlmICghcXVldWUpIHtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgY29tcG9uZW50Q2FsbGJhY2tRdWV1ZS5zZXQoY29tcG9uZW50LCBxdWV1ZSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29tcG9uZW50Q2FsbGJhY2tRdWV1ZS5kZWxldGUoY29tcG9uZW50KTtcbiAgICAgICAgICAgIGFwcGx5U3RhdGUoY29tcG9uZW50LCBmb3JjZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWVbaV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBxdWV1ZS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG59XG5mdW5jdGlvbiBxdWV1ZVN0YXRlQ2hhbmdlcyhjb21wb25lbnQsIG5ld1N0YXRlLCBjYWxsYmFjaywgc3luYykge1xuICAgIGlmIChpc0Z1bmN0aW9uKG5ld1N0YXRlKSkge1xuICAgICAgICBuZXdTdGF0ZSA9IG5ld1N0YXRlKGNvbXBvbmVudC5zdGF0ZSk7XG4gICAgfVxuICAgIGZvciAodmFyIHN0YXRlS2V5IGluIG5ld1N0YXRlKSB7XG4gICAgICAgIGNvbXBvbmVudC5fcGVuZGluZ1N0YXRlW3N0YXRlS2V5XSA9IG5ld1N0YXRlW3N0YXRlS2V5XTtcbiAgICB9XG4gICAgaWYgKCFjb21wb25lbnQuX3BlbmRpbmdTZXRTdGF0ZSAmJiBpc0Jyb3dzZXIpIHtcbiAgICAgICAgaWYgKHN5bmMgfHwgY29tcG9uZW50Ll9ibG9ja1JlbmRlcikge1xuICAgICAgICAgICAgY29tcG9uZW50Ll9wZW5kaW5nU2V0U3RhdGUgPSB0cnVlO1xuICAgICAgICAgICAgYXBwbHlTdGF0ZShjb21wb25lbnQsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhZGRUb1F1ZXVlKGNvbXBvbmVudCwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29tcG9uZW50LnN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgY29tcG9uZW50LnN0YXRlLCBjb21wb25lbnQuX3BlbmRpbmdTdGF0ZSk7XG4gICAgICAgIGNvbXBvbmVudC5fcGVuZGluZ1N0YXRlID0ge307XG4gICAgfVxufVxuZnVuY3Rpb24gYXBwbHlTdGF0ZShjb21wb25lbnQsIGZvcmNlLCBjYWxsYmFjaykge1xuICAgIGlmICgoIWNvbXBvbmVudC5fZGVmZXJTZXRTdGF0ZSB8fCBmb3JjZSkgJiYgIWNvbXBvbmVudC5fYmxvY2tSZW5kZXIgJiYgIWNvbXBvbmVudC5fdW5tb3VudGVkKSB7XG4gICAgICAgIGNvbXBvbmVudC5fcGVuZGluZ1NldFN0YXRlID0gZmFsc2U7XG4gICAgICAgIHZhciBwZW5kaW5nU3RhdGUgPSBjb21wb25lbnQuX3BlbmRpbmdTdGF0ZTtcbiAgICAgICAgdmFyIHByZXZTdGF0ZSA9IGNvbXBvbmVudC5zdGF0ZTtcbiAgICAgICAgdmFyIG5leHRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHByZXZTdGF0ZSwgcGVuZGluZ1N0YXRlKTtcbiAgICAgICAgdmFyIHByb3BzID0gY29tcG9uZW50LnByb3BzO1xuICAgICAgICB2YXIgY29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0O1xuICAgICAgICBjb21wb25lbnQuX3BlbmRpbmdTdGF0ZSA9IHt9O1xuICAgICAgICB2YXIgbmV4dElucHV0ID0gY29tcG9uZW50Ll91cGRhdGVDb21wb25lbnQocHJldlN0YXRlLCBuZXh0U3RhdGUsIHByb3BzLCBwcm9wcywgY29udGV4dCwgZm9yY2UsIHRydWUpO1xuICAgICAgICB2YXIgZGlkVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgaWYgKGlzSW52YWxpZChuZXh0SW5wdXQpKSB7XG4gICAgICAgICAgICBuZXh0SW5wdXQgPSBjcmVhdGVWb2lkVk5vZGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChuZXh0SW5wdXQgPT09IGluZmVybm8uTk9fT1ApIHtcbiAgICAgICAgICAgIG5leHRJbnB1dCA9IGNvbXBvbmVudC5fbGFzdElucHV0O1xuICAgICAgICAgICAgZGlkVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihuZXh0SW5wdXQpKSB7XG4gICAgICAgICAgICBuZXh0SW5wdXQgPSBjcmVhdGVUZXh0Vk5vZGUobmV4dElucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0FycmF5KG5leHRJbnB1dCkpIHtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dFcnJvcignYSB2YWxpZCBJbmZlcm5vIFZOb2RlIChvciBudWxsKSBtdXN0IGJlIHJldHVybmVkIGZyb20gYSBjb21wb25lbnQgcmVuZGVyLiBZb3UgbWF5IGhhdmUgcmV0dXJuZWQgYW4gYXJyYXkgb3IgYW4gaW52YWxpZCBvYmplY3QuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxhc3RJbnB1dCA9IGNvbXBvbmVudC5fbGFzdElucHV0O1xuICAgICAgICB2YXIgdk5vZGUgPSBjb21wb25lbnQuX3ZOb2RlO1xuICAgICAgICB2YXIgcGFyZW50RG9tID0gKGxhc3RJbnB1dC5kb20gJiYgbGFzdElucHV0LmRvbS5wYXJlbnROb2RlKSB8fCAobGFzdElucHV0LmRvbSA9IHZOb2RlLmRvbSk7XG4gICAgICAgIGNvbXBvbmVudC5fbGFzdElucHV0ID0gbmV4dElucHV0O1xuICAgICAgICBpZiAoZGlkVXBkYXRlKSB7XG4gICAgICAgICAgICB2YXIgc3ViTGlmZWN5Y2xlID0gY29tcG9uZW50Ll9saWZlY3ljbGU7XG4gICAgICAgICAgICBpZiAoIXN1YkxpZmVjeWNsZSkge1xuICAgICAgICAgICAgICAgIHN1YkxpZmVjeWNsZSA9IG5ldyBMaWZlY3ljbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1YkxpZmVjeWNsZS5saXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC5fbGlmZWN5Y2xlID0gc3ViTGlmZWN5Y2xlO1xuICAgICAgICAgICAgdmFyIGNoaWxkQ29udGV4dCA9IGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQoKTtcbiAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZihjaGlsZENvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRDb250ZXh0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29udGV4dCwgY29tcG9uZW50Ll9jaGlsZENvbnRleHQsIGNoaWxkQ29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGlsZENvbnRleHQgPSBPYmplY3QuYXNzaWduKHt9LCBjb250ZXh0LCBjb21wb25lbnQuX2NoaWxkQ29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX3BhdGNoKGxhc3RJbnB1dCwgbmV4dElucHV0LCBwYXJlbnREb20sIHN1YkxpZmVjeWNsZSwgY2hpbGRDb250ZXh0LCBjb21wb25lbnQuX2lzU1ZHLCBmYWxzZSk7XG4gICAgICAgICAgICBzdWJMaWZlY3ljbGUudHJpZ2dlcigpO1xuICAgICAgICAgICAgY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZShwcm9wcywgcHJldlN0YXRlKTtcbiAgICAgICAgICAgIGluZmVybm8ub3B0aW9ucy5hZnRlclVwZGF0ZSAmJiBpbmZlcm5vLm9wdGlvbnMuYWZ0ZXJVcGRhdGUodk5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkb20gPSB2Tm9kZS5kb20gPSBuZXh0SW5wdXQuZG9tO1xuICAgICAgICB2YXIgY29tcG9uZW50VG9ET01Ob2RlTWFwID0gY29tcG9uZW50Ll9jb21wb25lbnRUb0RPTU5vZGVNYXA7XG4gICAgICAgIGNvbXBvbmVudFRvRE9NTm9kZU1hcCAmJiBjb21wb25lbnRUb0RPTU5vZGVNYXAuc2V0KGNvbXBvbmVudCwgbmV4dElucHV0LmRvbSk7XG4gICAgICAgIHVwZGF0ZVBhcmVudENvbXBvbmVudFZOb2Rlcyh2Tm9kZSwgZG9tKTtcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICghaXNOdWxsT3JVbmRlZihjYWxsYmFjaykpIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG59XG52YXIgQ29tcG9uZW50JDEgPSBmdW5jdGlvbiBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpIHtcbiAgICB0aGlzLnN0YXRlID0ge307XG4gICAgdGhpcy5yZWZzID0ge307XG4gICAgdGhpcy5fYmxvY2tSZW5kZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9pZ25vcmVTZXRTdGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMuX2Jsb2NrU2V0U3RhdGUgPSBmYWxzZTtcbiAgICB0aGlzLl9kZWZlclNldFN0YXRlID0gZmFsc2U7XG4gICAgdGhpcy5fcGVuZGluZ1NldFN0YXRlID0gZmFsc2U7XG4gICAgdGhpcy5fcGVuZGluZ1N0YXRlID0ge307XG4gICAgdGhpcy5fbGFzdElucHV0ID0gbnVsbDtcbiAgICB0aGlzLl92Tm9kZSA9IG51bGw7XG4gICAgdGhpcy5fdW5tb3VudGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9saWZlY3ljbGUgPSBudWxsO1xuICAgIHRoaXMuX2NoaWxkQ29udGV4dCA9IG51bGw7XG4gICAgdGhpcy5fcGF0Y2ggPSBudWxsO1xuICAgIHRoaXMuX2lzU1ZHID0gZmFsc2U7XG4gICAgdGhpcy5fY29tcG9uZW50VG9ET01Ob2RlTWFwID0gbnVsbDtcbiAgICAvKiogQHR5cGUge29iamVjdH0gKi9cbiAgICB0aGlzLnByb3BzID0gcHJvcHMgfHwgaW5mZXJuby5FTVBUWV9PQko7XG4gICAgLyoqIEB0eXBlIHtvYmplY3R9ICovXG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dCB8fCB7fTtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChuZXh0UHJvcHMsIG5leHRTdGF0ZSwgbmV4dENvbnRleHQpIHtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuZm9yY2VVcGRhdGUgPSBmdW5jdGlvbiBmb3JjZVVwZGF0ZSAoY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXNCcm93c2VyICYmIGFwcGx5U3RhdGUodGhpcywgdHJ1ZSwgY2FsbGJhY2spO1xufTtcbkNvbXBvbmVudCQxLnByb3RvdHlwZS5zZXRTdGF0ZSA9IGZ1bmN0aW9uIHNldFN0YXRlIChuZXdTdGF0ZSwgY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9ibG9ja1NldFN0YXRlKSB7XG4gICAgICAgIGlmICghdGhpcy5faWdub3JlU2V0U3RhdGUpIHtcbiAgICAgICAgICAgIHF1ZXVlU3RhdGVDaGFuZ2VzKHRoaXMsIG5ld1N0YXRlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcignY2Fubm90IHVwZGF0ZSBzdGF0ZSB2aWEgc2V0U3RhdGUoKSBpbiBjb21wb25lbnRXaWxsVXBkYXRlKCkuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuc2V0U3RhdGVTeW5jID0gZnVuY3Rpb24gc2V0U3RhdGVTeW5jIChuZXdTdGF0ZSkge1xuICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2Jsb2NrU2V0U3RhdGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pZ25vcmVTZXRTdGF0ZSkge1xuICAgICAgICAgICAgcXVldWVTdGF0ZUNoYW5nZXModGhpcywgbmV3U3RhdGUsIG51bGwsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcignY2Fubm90IHVwZGF0ZSBzdGF0ZSB2aWEgc2V0U3RhdGUoKSBpbiBjb21wb25lbnRXaWxsVXBkYXRlKCkuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuY29tcG9uZW50V2lsbE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50ICgpIHtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuY29tcG9uZW50RGlkVXBkYXRlID0gZnVuY3Rpb24gY29tcG9uZW50RGlkVXBkYXRlIChwcmV2UHJvcHMsIHByZXZTdGF0ZSwgcHJldkNvbnRleHQpIHtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuc2hvdWxkQ29tcG9uZW50VXBkYXRlID0gZnVuY3Rpb24gc2hvdWxkQ29tcG9uZW50VXBkYXRlIChuZXh0UHJvcHMsIG5leHRTdGF0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xufTtcbkNvbXBvbmVudCQxLnByb3RvdHlwZS5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyAobmV4dFByb3BzLCBjb250ZXh0KSB7XG59O1xuQ29tcG9uZW50JDEucHJvdG90eXBlLmNvbXBvbmVudFdpbGxVcGRhdGUgPSBmdW5jdGlvbiBjb21wb25lbnRXaWxsVXBkYXRlIChuZXh0UHJvcHMsIG5leHRTdGF0ZSwgbmV4dENvbnRleHQpIHtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuZ2V0Q2hpbGRDb250ZXh0ID0gZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0ICgpIHtcbn07XG5Db21wb25lbnQkMS5wcm90b3R5cGUuX3VwZGF0ZUNvbXBvbmVudCA9IGZ1bmN0aW9uIF91cGRhdGVDb21wb25lbnQgKHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwcmV2UHJvcHMsIG5leHRQcm9wcywgY29udGV4dCwgZm9yY2UsIGZyb21TZXRTdGF0ZSkge1xuICAgIGlmICh0aGlzLl91bm1vdW50ZWQgPT09IHRydWUpIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Iobm9PcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbiAgICBpZiAoKHByZXZQcm9wcyAhPT0gbmV4dFByb3BzIHx8IG5leHRQcm9wcyA9PT0gaW5mZXJuby5FTVBUWV9PQkopIHx8IHByZXZTdGF0ZSAhPT0gbmV4dFN0YXRlIHx8IGZvcmNlKSB7XG4gICAgICAgIGlmIChwcmV2UHJvcHMgIT09IG5leHRQcm9wcyB8fCBuZXh0UHJvcHMgPT09IGluZmVybm8uRU1QVFlfT0JKKSB7XG4gICAgICAgICAgICBpZiAoIWZyb21TZXRTdGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Jsb2NrUmVuZGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ibG9ja1JlbmRlciA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdTZXRTdGF0ZSkge1xuICAgICAgICAgICAgICAgIG5leHRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIG5leHRTdGF0ZSwgdGhpcy5fcGVuZGluZ1N0YXRlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nU2V0U3RhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nU3RhdGUgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgc2hvdWxkVXBkYXRlID0gdGhpcy5zaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUsIGNvbnRleHQpO1xuICAgICAgICBpZiAoc2hvdWxkVXBkYXRlICE9PSBmYWxzZSB8fCBmb3JjZSkge1xuICAgICAgICAgICAgdGhpcy5fYmxvY2tTZXRTdGF0ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgdGhpcy5fYmxvY2tTZXRTdGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5wcm9wcyA9IG5leHRQcm9wcztcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGUgPSBuZXh0U3RhdGU7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgaW5mZXJuby5vcHRpb25zLmJlZm9yZVJlbmRlciAmJiBpbmZlcm5vLm9wdGlvbnMuYmVmb3JlUmVuZGVyKHRoaXMpO1xuICAgICAgICAgICAgdmFyIHJlbmRlciA9IHRoaXMucmVuZGVyKG5leHRQcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgaW5mZXJuby5vcHRpb25zLmFmdGVyUmVuZGVyICYmIGluZmVybm8ub3B0aW9ucy5hZnRlclJlbmRlcih0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGluZmVybm8uTk9fT1A7XG59O1xuXG5yZXR1cm4gQ29tcG9uZW50JDE7XG5cbn0pKSk7XG4iLCIvKiFcbiAqIGluZmVybm8gdjEuMi4xXG4gKiAoYykgMjAxNyBEb21pbmljIEdhbm5hd2F5XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcblx0KGZhY3RvcnkoKGdsb2JhbC5JbmZlcm5vID0gZ2xvYmFsLkluZmVybm8gfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBOT19PUCA9ICckTk9fT1AnO1xudmFyIEVSUk9SX01TRyA9ICdhIHJ1bnRpbWUgZXJyb3Igb2NjdXJlZCEgVXNlIEluZmVybm8gaW4gZGV2ZWxvcG1lbnQgZW52aXJvbm1lbnQgdG8gZmluZCB0aGUgZXJyb3IuJztcbnZhciBpc0Jyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuZG9jdW1lbnQ7XG5cbi8vIHRoaXMgaXMgTVVDSCBmYXN0ZXIgdGhhbiAuY29uc3RydWN0b3IgPT09IEFycmF5IGFuZCBpbnN0YW5jZW9mIEFycmF5XG4vLyBpbiBOb2RlIDcgYW5kIHRoZSBsYXRlciB2ZXJzaW9ucyBvZiBWOCwgc2xvd2VyIGluIG9sZGVyIHZlcnNpb25zIHRob3VnaFxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gaXNTdGF0ZWZ1bENvbXBvbmVudChvKSB7XG4gICAgcmV0dXJuICFpc1VuZGVmaW5lZChvLnByb3RvdHlwZSkgJiYgIWlzVW5kZWZpbmVkKG8ucHJvdG90eXBlLnJlbmRlcik7XG59XG5mdW5jdGlvbiBpc1N0cmluZ09yTnVtYmVyKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ3N0cmluZycgfHwgdHlwZSA9PT0gJ251bWJlcic7XG59XG5mdW5jdGlvbiBpc051bGxPclVuZGVmKG9iaikge1xuICAgIHJldHVybiBpc1VuZGVmaW5lZChvYmopIHx8IGlzTnVsbChvYmopO1xufVxuZnVuY3Rpb24gaXNJbnZhbGlkKG9iaikge1xuICAgIHJldHVybiBpc051bGwob2JqKSB8fCBvYmogPT09IGZhbHNlIHx8IGlzVHJ1ZShvYmopIHx8IGlzVW5kZWZpbmVkKG9iaik7XG59XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gaXNBdHRyQW5FdmVudChhdHRyKSB7XG4gICAgcmV0dXJuIGF0dHJbMF0gPT09ICdvJyAmJiBhdHRyWzFdID09PSAnbicgJiYgYXR0ci5sZW5ndGggPiAzO1xufVxuZnVuY3Rpb24gaXNTdHJpbmcob2JqKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdzdHJpbmcnO1xufVxuZnVuY3Rpb24gaXNOdW1iZXIob2JqKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdudW1iZXInO1xufVxuZnVuY3Rpb24gaXNOdWxsKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG59XG5mdW5jdGlvbiBpc1RydWUob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcbiAgICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnO1xufVxuZnVuY3Rpb24gdGhyb3dFcnJvcihtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBFUlJPUl9NU0c7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigoXCJJbmZlcm5vIEVycm9yOiBcIiArIG1lc3NhZ2UpKTtcbn1cbmZ1bmN0aW9uIHdhcm5pbmcoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICB9XG59XG52YXIgRU1QVFlfT0JKID0ge307XG5cbmZ1bmN0aW9uIGFwcGx5S2V5KGtleSwgdk5vZGUpIHtcbiAgICB2Tm9kZS5rZXkgPSBrZXk7XG4gICAgcmV0dXJuIHZOb2RlO1xufVxuZnVuY3Rpb24gYXBwbHlLZXlJZk1pc3Npbmcoa2V5LCB2Tm9kZSkge1xuICAgIGlmIChpc051bWJlcihrZXkpKSB7XG4gICAgICAgIGtleSA9IFwiLlwiICsga2V5O1xuICAgIH1cbiAgICBpZiAoaXNOdWxsKHZOb2RlLmtleSkgfHwgdk5vZGUua2V5WzBdID09PSAnLicpIHtcbiAgICAgICAgcmV0dXJuIGFwcGx5S2V5KGtleSwgdk5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdk5vZGU7XG59XG5mdW5jdGlvbiBhcHBseUtleVByZWZpeChrZXksIHZOb2RlKSB7XG4gICAgdk5vZGUua2V5ID0ga2V5ICsgdk5vZGUua2V5O1xuICAgIHJldHVybiB2Tm9kZTtcbn1cbmZ1bmN0aW9uIF9ub3JtYWxpemVWTm9kZXMobm9kZXMsIHJlc3VsdCwgaW5kZXgsIGN1cnJlbnRLZXkpIHtcbiAgICBmb3IgKDsgaW5kZXggPCBub2Rlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIG4gPSBub2Rlc1tpbmRleF07XG4gICAgICAgIHZhciBrZXkgPSBjdXJyZW50S2V5ICsgXCIuXCIgKyBpbmRleDtcbiAgICAgICAgaWYgKCFpc0ludmFsaWQobikpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KG4pKSB7XG4gICAgICAgICAgICAgICAgX25vcm1hbGl6ZVZOb2RlcyhuLCByZXN1bHQsIDAsIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNTdHJpbmdPck51bWJlcihuKSkge1xuICAgICAgICAgICAgICAgICAgICBuID0gY3JlYXRlVGV4dFZOb2RlKG4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc1ZOb2RlKG4pICYmIG4uZG9tIHx8IChuLmtleSAmJiBuLmtleVswXSA9PT0gJy4nKSkge1xuICAgICAgICAgICAgICAgICAgICBuID0gY2xvbmVWTm9kZShuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzTnVsbChuLmtleSkgfHwgbi5rZXlbMF0gPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICBuID0gYXBwbHlLZXkoa2V5LCBuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBhcHBseUtleVByZWZpeChjdXJyZW50S2V5LCBuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBub3JtYWxpemVWTm9kZXMobm9kZXMpIHtcbiAgICB2YXIgbmV3Tm9kZXM7XG4gICAgLy8gd2UgYXNzaWduICQgd2hpY2ggYmFzaWNhbGx5IG1lYW5zIHdlJ3ZlIGZsYWdnZWQgdGhpcyBhcnJheSBmb3IgZnV0dXJlIG5vdGVcbiAgICAvLyBpZiBpdCBjb21lcyBiYWNrIGFnYWluLCB3ZSBuZWVkIHRvIGNsb25lIGl0LCBhcyBwZW9wbGUgYXJlIHVzaW5nIGl0XG4gICAgLy8gaW4gYW4gaW1tdXRhYmxlIHdheVxuICAgIC8vIHRzbGludDpkaXNhYmxlXG4gICAgaWYgKG5vZGVzWyckJ10pIHtcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5zbGljZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm9kZXNbJyQnXSA9IHRydWU7XG4gICAgfVxuICAgIC8vIHRzbGludDplbmFibGVcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBuID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChpc0ludmFsaWQobikgfHwgaXNBcnJheShuKSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IChuZXdOb2RlcyB8fCBub2Rlcykuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICBfbm9ybWFsaXplVk5vZGVzKG5vZGVzLCByZXN1bHQsIGksIFwiXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1N0cmluZ09yTnVtYmVyKG4pKSB7XG4gICAgICAgICAgICBpZiAoIW5ld05vZGVzKSB7XG4gICAgICAgICAgICAgICAgbmV3Tm9kZXMgPSBub2Rlcy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld05vZGVzLnB1c2goYXBwbHlLZXlJZk1pc3NpbmcoaSwgY3JlYXRlVGV4dFZOb2RlKG4pKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoKGlzVk5vZGUobikgJiYgbi5kb20pIHx8IChpc051bGwobi5rZXkpICYmICEobi5mbGFncyAmIDY0IC8qIEhhc05vbktleWVkQ2hpbGRyZW4gKi8pKSkge1xuICAgICAgICAgICAgaWYgKCFuZXdOb2Rlcykge1xuICAgICAgICAgICAgICAgIG5ld05vZGVzID0gbm9kZXMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdOb2Rlcy5wdXNoKGFwcGx5S2V5SWZNaXNzaW5nKGksIGNsb25lVk5vZGUobikpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChuZXdOb2Rlcykge1xuICAgICAgICAgICAgbmV3Tm9kZXMucHVzaChhcHBseUtleUlmTWlzc2luZyhpLCBjbG9uZVZOb2RlKG4pKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld05vZGVzIHx8IG5vZGVzO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4pIHtcbiAgICBpZiAoaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZVZOb2RlcyhjaGlsZHJlbik7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzVk5vZGUoY2hpbGRyZW4pICYmIGNoaWxkcmVuLmRvbSkge1xuICAgICAgICByZXR1cm4gY2xvbmVWTm9kZShjaGlsZHJlbik7XG4gICAgfVxuICAgIHJldHVybiBjaGlsZHJlbjtcbn1cbmZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BzKHZOb2RlLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICBpZiAoISh2Tm9kZS5mbGFncyAmIDI4IC8qIENvbXBvbmVudCAqLykgJiYgaXNOdWxsT3JVbmRlZihjaGlsZHJlbikgJiYgIWlzTnVsbE9yVW5kZWYocHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICAgIHZOb2RlLmNoaWxkcmVuID0gcHJvcHMuY2hpbGRyZW47XG4gICAgfVxuICAgIGlmIChwcm9wcy5yZWYpIHtcbiAgICAgICAgdk5vZGUucmVmID0gcHJvcHMucmVmO1xuICAgICAgICBkZWxldGUgcHJvcHMucmVmO1xuICAgIH1cbiAgICBpZiAocHJvcHMuZXZlbnRzKSB7XG4gICAgICAgIHZOb2RlLmV2ZW50cyA9IHByb3BzLmV2ZW50cztcbiAgICB9XG4gICAgaWYgKCFpc051bGxPclVuZGVmKHByb3BzLmtleSkpIHtcbiAgICAgICAgdk5vZGUua2V5ID0gcHJvcHMua2V5O1xuICAgICAgICBkZWxldGUgcHJvcHMua2V5O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNvcHlQcm9wc1RvKGNvcHlGcm9tLCBjb3B5VG8pIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIGNvcHlGcm9tKSB7XG4gICAgICAgIGlmIChpc1VuZGVmaW5lZChjb3B5VG9bcHJvcF0pKSB7XG4gICAgICAgICAgICBjb3B5VG9bcHJvcF0gPSBjb3B5RnJvbVtwcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIG5vcm1hbGl6ZUVsZW1lbnQodHlwZSwgdk5vZGUpIHtcbiAgICBpZiAodHlwZSA9PT0gJ3N2ZycpIHtcbiAgICAgICAgdk5vZGUuZmxhZ3MgPSAxMjggLyogU3ZnRWxlbWVudCAqLztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2lucHV0Jykge1xuICAgICAgICB2Tm9kZS5mbGFncyA9IDUxMiAvKiBJbnB1dEVsZW1lbnQgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgIHZOb2RlLmZsYWdzID0gMjA0OCAvKiBTZWxlY3RFbGVtZW50ICovO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndGV4dGFyZWEnKSB7XG4gICAgICAgIHZOb2RlLmZsYWdzID0gMTAyNCAvKiBUZXh0YXJlYUVsZW1lbnQgKi87XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdtZWRpYScpIHtcbiAgICAgICAgdk5vZGUuZmxhZ3MgPSAyNTYgLyogTWVkaWFFbGVtZW50ICovO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdk5vZGUuZmxhZ3MgPSAyIC8qIEh0bWxFbGVtZW50ICovO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG5vcm1hbGl6ZSh2Tm9kZSkge1xuICAgIHZhciBwcm9wcyA9IHZOb2RlLnByb3BzO1xuICAgIHZhciBoYXNQcm9wcyA9ICFpc051bGwocHJvcHMpO1xuICAgIHZhciB0eXBlID0gdk5vZGUudHlwZTtcbiAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcbiAgICAvLyBjb252ZXJ0IGEgd3JvbmdseSBjcmVhdGVkIHR5cGUgYmFjayB0byBlbGVtZW50XG4gICAgaWYgKGlzU3RyaW5nKHR5cGUpICYmICh2Tm9kZS5mbGFncyAmIDI4IC8qIENvbXBvbmVudCAqLykpIHtcbiAgICAgICAgbm9ybWFsaXplRWxlbWVudCh0eXBlLCB2Tm9kZSk7XG4gICAgICAgIGlmIChoYXNQcm9wcyAmJiBwcm9wcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgdk5vZGUuY2hpbGRyZW4gPSBwcm9wcy5jaGlsZHJlbjtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gcHJvcHMuY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGhhc1Byb3BzKSB7XG4gICAgICAgIG5vcm1hbGl6ZVByb3BzKHZOb2RlLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgIH1cbiAgICBpZiAoIWlzSW52YWxpZChjaGlsZHJlbikpIHtcbiAgICAgICAgdk5vZGUuY2hpbGRyZW4gPSBub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbik7XG4gICAgfVxuICAgIGlmIChoYXNQcm9wcyAmJiAhaXNJbnZhbGlkKHByb3BzLmNoaWxkcmVuKSkge1xuICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IG5vcm1hbGl6ZUNoaWxkcmVuKHByb3BzLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgLy8gVGhpcyBjb2RlIHdpbGwgYmUgc3RyaXBwZWQgb3V0IGZyb20gcHJvZHVjdGlvbiBDT0RFXG4gICAgICAgIC8vIEl0IHdpbGwgaGVscCB1c2VycyB0byB0cmFjayBlcnJvcnMgaW4gdGhlaXIgYXBwbGljYXRpb25zLlxuICAgICAgICB2YXIgdmVyaWZ5S2V5cyA9IGZ1bmN0aW9uICh2Tm9kZXMpIHtcbiAgICAgICAgICAgIHZhciBrZXlWYWx1ZXMgPSB2Tm9kZXMubWFwKGZ1bmN0aW9uICh2bm9kZSkgeyByZXR1cm4gdm5vZGUua2V5OyB9KTtcbiAgICAgICAgICAgIGtleVZhbHVlcy5zb21lKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaGFzRHVwbGljYXRlID0ga2V5VmFsdWVzLmluZGV4T2YoaXRlbSkgIT09IGlkeDtcbiAgICAgICAgICAgICAgICB3YXJuaW5nKCFoYXNEdXBsaWNhdGUsICdJbmZlcm5vIG5vcm1hbGlzYXRpb24oLi4uKTogRW5jb3VudGVyZWQgdHdvIGNoaWxkcmVuIHdpdGggc2FtZSBrZXksIGFsbCBrZXlzIG11c3QgYmUgdW5pcXVlIHdpdGhpbiBpdHMgc2libGluZ3MuIER1cGxpY2F0ZWQga2V5IGlzOicgKyBpdGVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFzRHVwbGljYXRlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh2Tm9kZS5jaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KHZOb2RlLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgdmVyaWZ5S2V5cyh2Tm9kZS5jaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnZhciBvcHRpb25zID0ge1xuICAgIHJlY3ljbGluZ0VuYWJsZWQ6IHRydWUsXG4gICAgZmluZERPTU5vZGVFbmFibGVkOiBmYWxzZSxcbiAgICByb290czogbnVsbCxcbiAgICBjcmVhdGVWTm9kZTogbnVsbCxcbiAgICBiZWZvcmVSZW5kZXI6IG51bGwsXG4gICAgYWZ0ZXJSZW5kZXI6IG51bGwsXG4gICAgYWZ0ZXJNb3VudDogbnVsbCxcbiAgICBhZnRlclVwZGF0ZTogbnVsbCxcbiAgICBiZWZvcmVVbm1vdW50OiBudWxsLFxufTtcblxuZnVuY3Rpb24gY3JlYXRlVk5vZGUoZmxhZ3MsIHR5cGUsIHByb3BzLCBjaGlsZHJlbiwgZXZlbnRzLCBrZXksIHJlZiwgbm9Ob3JtYWxpc2UpIHtcbiAgICBpZiAoZmxhZ3MgJiAxNiAvKiBDb21wb25lbnRVbmtub3duICovKSB7XG4gICAgICAgIGZsYWdzID0gaXNTdGF0ZWZ1bENvbXBvbmVudCh0eXBlKSA/IDQgLyogQ29tcG9uZW50Q2xhc3MgKi8gOiA4IC8qIENvbXBvbmVudEZ1bmN0aW9uICovO1xuICAgIH1cbiAgICB2YXIgdk5vZGUgPSB7XG4gICAgICAgIGNoaWxkcmVuOiBpc1VuZGVmaW5lZChjaGlsZHJlbikgPyBudWxsIDogY2hpbGRyZW4sXG4gICAgICAgIGRvbTogbnVsbCxcbiAgICAgICAgZXZlbnRzOiBldmVudHMgfHwgbnVsbCxcbiAgICAgICAgZmxhZ3M6IGZsYWdzLFxuICAgICAgICBrZXk6IGlzVW5kZWZpbmVkKGtleSkgPyBudWxsIDoga2V5LFxuICAgICAgICBwcm9wczogcHJvcHMgfHwgbnVsbCxcbiAgICAgICAgcmVmOiByZWYgfHwgbnVsbCxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICB9O1xuICAgIGlmICghbm9Ob3JtYWxpc2UpIHtcbiAgICAgICAgbm9ybWFsaXplKHZOb2RlKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuY3JlYXRlVk5vZGUpIHtcbiAgICAgICAgb3B0aW9ucy5jcmVhdGVWTm9kZSh2Tm9kZSk7XG4gICAgfVxuICAgIHJldHVybiB2Tm9kZTtcbn1cbmZ1bmN0aW9uIGNsb25lVk5vZGUodk5vZGVUb0Nsb25lLCBwcm9wcykge1xuICAgIHZhciBfY2hpbGRyZW4gPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDI7XG4gICAgd2hpbGUgKCBsZW4tLSA+IDAgKSBfY2hpbGRyZW5bIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gKyAyIF07XG5cbiAgICB2YXIgY2hpbGRyZW4gPSBfY2hpbGRyZW47XG4gICAgaWYgKF9jaGlsZHJlbi5sZW5ndGggPiAwICYmICFpc051bGwoX2NoaWxkcmVuWzBdKSkge1xuICAgICAgICBpZiAoIXByb3BzKSB7XG4gICAgICAgICAgICBwcm9wcyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfY2hpbGRyZW4ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IF9jaGlsZHJlblswXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNVbmRlZmluZWQocHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkocHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmNoaWxkcmVuID0gcHJvcHMuY2hpbGRyZW4uY29uY2F0KGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmNoaWxkcmVuID0gW3Byb3BzLmNoaWxkcmVuXS5jb25jYXQoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KHByb3BzLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jaGlsZHJlbi5wdXNoKGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmNoaWxkcmVuID0gW3Byb3BzLmNoaWxkcmVuXTtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuY2hpbGRyZW4ucHVzaChjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNoaWxkcmVuID0gbnVsbDtcbiAgICB2YXIgbmV3Vk5vZGU7XG4gICAgaWYgKGlzQXJyYXkodk5vZGVUb0Nsb25lKSkge1xuICAgICAgICB2YXIgdG1wQXJyYXkgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2Tm9kZVRvQ2xvbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRtcEFycmF5LnB1c2goY2xvbmVWTm9kZSh2Tm9kZVRvQ2xvbmVbaV0pKTtcbiAgICAgICAgfVxuICAgICAgICBuZXdWTm9kZSA9IHRtcEFycmF5O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGZsYWdzID0gdk5vZGVUb0Nsb25lLmZsYWdzO1xuICAgICAgICB2YXIgZXZlbnRzID0gdk5vZGVUb0Nsb25lLmV2ZW50cyB8fCAocHJvcHMgJiYgcHJvcHMuZXZlbnRzKSB8fCBudWxsO1xuICAgICAgICB2YXIga2V5ID0gIWlzTnVsbE9yVW5kZWYodk5vZGVUb0Nsb25lLmtleSkgPyB2Tm9kZVRvQ2xvbmUua2V5IDogKHByb3BzID8gcHJvcHMua2V5IDogbnVsbCk7XG4gICAgICAgIHZhciByZWYgPSB2Tm9kZVRvQ2xvbmUucmVmIHx8IChwcm9wcyA/IHByb3BzLnJlZiA6IG51bGwpO1xuICAgICAgICBpZiAoZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgIG5ld1ZOb2RlID0gY3JlYXRlVk5vZGUoZmxhZ3MsIHZOb2RlVG9DbG9uZS50eXBlLCBPYmplY3QuYXNzaWduKHt9LCB2Tm9kZVRvQ2xvbmUucHJvcHMsIHByb3BzKSwgbnVsbCwgZXZlbnRzLCBrZXksIHJlZiwgdHJ1ZSk7XG4gICAgICAgICAgICB2YXIgbmV3UHJvcHMgPSBuZXdWTm9kZS5wcm9wcztcbiAgICAgICAgICAgIGlmIChuZXdQcm9wcykge1xuICAgICAgICAgICAgICAgIHZhciBuZXdDaGlsZHJlbiA9IG5ld1Byb3BzLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gYWxzbyBjbG9uZSBjb21wb25lbnQgY2hpbGRyZW4gdGhhdCBhcmUgaW4gcHJvcHNcbiAgICAgICAgICAgICAgICAvLyBhcyB0aGUgY2hpbGRyZW4gbWF5IGFsc28gaGF2ZSBiZWVuIGhvaXN0ZWRcbiAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkobmV3Q2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBuZXdDaGlsZHJlbi5sZW5ndGg7IGkkMSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gbmV3Q2hpbGRyZW5baSQxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW52YWxpZChjaGlsZCkgJiYgaXNWTm9kZShjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3UHJvcHMuY2hpbGRyZW5baSQxXSA9IGNsb25lVk5vZGUoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc1ZOb2RlKG5ld0NoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UHJvcHMuY2hpbGRyZW4gPSBjbG9uZVZOb2RlKG5ld0NoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1ZOb2RlLmNoaWxkcmVuID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmbGFncyAmIDM5NzAgLyogRWxlbWVudCAqLykge1xuICAgICAgICAgICAgY2hpbGRyZW4gPSAocHJvcHMgJiYgcHJvcHMuY2hpbGRyZW4pIHx8IHZOb2RlVG9DbG9uZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIG5ld1ZOb2RlID0gY3JlYXRlVk5vZGUoZmxhZ3MsIHZOb2RlVG9DbG9uZS50eXBlLCBPYmplY3QuYXNzaWduKHt9LCB2Tm9kZVRvQ2xvbmUucHJvcHMsIHByb3BzKSwgY2hpbGRyZW4sIGV2ZW50cywga2V5LCByZWYsICFjaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmxhZ3MgJiAxIC8qIFRleHQgKi8pIHtcbiAgICAgICAgICAgIG5ld1ZOb2RlID0gY3JlYXRlVGV4dFZOb2RlKHZOb2RlVG9DbG9uZS5jaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZOb2RlO1xufVxuZnVuY3Rpb24gY3JlYXRlVm9pZFZOb2RlKCkge1xuICAgIHJldHVybiBjcmVhdGVWTm9kZSg0MDk2IC8qIFZvaWQgKi8pO1xufVxuZnVuY3Rpb24gY3JlYXRlVGV4dFZOb2RlKHRleHQpIHtcbiAgICByZXR1cm4gY3JlYXRlVk5vZGUoMSAvKiBUZXh0ICovLCBudWxsLCBudWxsLCB0ZXh0LCBudWxsLCBudWxsLCBudWxsLCB0cnVlKTtcbn1cbmZ1bmN0aW9uIGlzVk5vZGUobykge1xuICAgIHJldHVybiAhIW8uZmxhZ3M7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdERlZmF1bHRzKHN0cmluZywgb2JqZWN0LCB2YWx1ZSkge1xuICAgIC8qIGVzbGludCBuby1yZXR1cm4tYXNzaWduOiAwICovXG4gICAgc3RyaW5nLnNwbGl0KCcsJykuZm9yRWFjaChmdW5jdGlvbiAoaSkgeyByZXR1cm4gb2JqZWN0W2ldID0gdmFsdWU7IH0pO1xufVxudmFyIHhsaW5rTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc7XG52YXIgeG1sTlMgPSAnaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlJztcbnZhciBzdmdOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG52YXIgc3RyaWN0UHJvcHMgPSB7fTtcbnZhciBib29sZWFuUHJvcHMgPSB7fTtcbnZhciBuYW1lc3BhY2VzID0ge307XG52YXIgaXNVbml0bGVzc051bWJlciA9IHt9O1xudmFyIHNraXBQcm9wcyA9IHt9O1xudmFyIGRlaHlwaGVuUHJvcHMgPSB7XG4gICAgaHR0cEVxdWl2OiAnaHR0cC1lcXVpdicsXG4gICAgYWNjZXB0Q2hhcnNldDogJ2FjY2VwdC1jaGFyc2V0Jyxcbn07XG52YXIgcHJvYmFibHlLZWJhYlByb3BzID0gL14oYWNjZW50SHxhcmFiaWNGfGNhcEh8Zm9udFtGU1ZXXXxnbHlwaFtOT118aG9yaXpbQU9dfHBhbm9zZTF8cmVuZGVyaW5nSXxzdHJpa2V0aHJvdWdoW1BUXXx1bmRlcmxpbmVbUFRdfHZbQUhJTV18dmVydFtBT118eEh8YWxpZ25tZW50QnxiYXNlbGluZVN8Y2xpcFtQUl18Y29sb3JbSVBSXXxkb21pbmFudEJ8ZW5hYmxlQnxmaWxsW09SXXxmbG9vZFtDT0ZdfGltYWdlUnxsZXR0ZXJTfGxpZ2h0aW5nQ3xtYXJrZXJbRU1TXXxwb2ludGVyRXxzaGFwZVJ8c3RvcFtDT118c3Ryb2tlW0RMTU9XXXx0ZXh0W0FEUl18dW5pY29kZUJ8d29yZFN8d3JpdGluZ00pLiovO1xuZnVuY3Rpb24ga2ViYWJpemUoc3RyLCBzbWFsbExldHRlciwgbGFyZ2VMZXR0ZXIpIHtcbiAgICByZXR1cm4gKHNtYWxsTGV0dGVyICsgXCItXCIgKyAobGFyZ2VMZXR0ZXIudG9Mb3dlckNhc2UoKSkpO1xufVxudmFyIGRlbGVnYXRlZFByb3BzID0ge307XG5jb25zdHJ1Y3REZWZhdWx0cygneGxpbms6aHJlZix4bGluazphcmNyb2xlLHhsaW5rOmFjdHVhdGUseGxpbms6cm9sZSx4bGluazp0aXRsZWYseGxpbms6dHlwZScsIG5hbWVzcGFjZXMsIHhsaW5rTlMpO1xuY29uc3RydWN0RGVmYXVsdHMoJ3htbDpiYXNlLHhtbDpsYW5nLHhtbDpzcGFjZScsIG5hbWVzcGFjZXMsIHhtbE5TKTtcbmNvbnN0cnVjdERlZmF1bHRzKCd2b2x1bWUsZGVmYXVsdFZhbHVlLGRlZmF1bHRDaGVja2VkJywgc3RyaWN0UHJvcHMsIHRydWUpO1xuY29uc3RydWN0RGVmYXVsdHMoJ2NoaWxkcmVuLGNoaWxkcmVuVHlwZSxyZWYsa2V5LHNlbGVjdGVkLGNoZWNrZWQsbXVsdGlwbGUnLCBza2lwUHJvcHMsIHRydWUpO1xuY29uc3RydWN0RGVmYXVsdHMoJ29uQ2xpY2ssb25Nb3VzZURvd24sb25Nb3VzZVVwLG9uTW91c2VNb3ZlLG9uU3VibWl0LG9uRGJsQ2xpY2ssb25LZXlEb3duLG9uS2V5VXAsb25LZXlQcmVzcycsIGRlbGVnYXRlZFByb3BzLCB0cnVlKTtcbmNvbnN0cnVjdERlZmF1bHRzKCdtdXRlZCxzY29wZWQsbG9vcCxvcGVuLGNoZWNrZWQsZGVmYXVsdCxjYXB0dXJlLGRpc2FibGVkLHJlYWRPbmx5LHJlcXVpcmVkLGF1dG9wbGF5LGNvbnRyb2xzLHNlYW1sZXNzLHJldmVyc2VkLGFsbG93ZnVsbHNjcmVlbixub3ZhbGlkYXRlLGhpZGRlbicsIGJvb2xlYW5Qcm9wcywgdHJ1ZSk7XG5jb25zdHJ1Y3REZWZhdWx0cygnYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQsYm9yZGVySW1hZ2VPdXRzZXQsYm9yZGVySW1hZ2VTbGljZSxib3JkZXJJbWFnZVdpZHRoLGJveEZsZXgsYm94RmxleEdyb3VwLGJveE9yZGluYWxHcm91cCxjb2x1bW5Db3VudCxmbGV4LGZsZXhHcm93LGZsZXhQb3NpdGl2ZSxmbGV4U2hyaW5rLGZsZXhOZWdhdGl2ZSxmbGV4T3JkZXIsZ3JpZFJvdyxncmlkQ29sdW1uLGZvbnRXZWlnaHQsbGluZUNsYW1wLGxpbmVIZWlnaHQsb3BhY2l0eSxvcmRlcixvcnBoYW5zLHRhYlNpemUsd2lkb3dzLHpJbmRleCx6b29tLGZpbGxPcGFjaXR5LGZsb29kT3BhY2l0eSxzdG9wT3BhY2l0eSxzdHJva2VEYXNoYXJyYXksc3Ryb2tlRGFzaG9mZnNldCxzdHJva2VNaXRlcmxpbWl0LHN0cm9rZU9wYWNpdHksc3Ryb2tlV2lkdGgsJywgaXNVbml0bGVzc051bWJlciwgdHJ1ZSk7XG5cbnZhciBMaWZlY3ljbGUgPSBmdW5jdGlvbiBMaWZlY3ljbGUoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB0aGlzLmZhc3RVbm1vdW50ID0gdHJ1ZTtcbn07XG5MaWZlY3ljbGUucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIgKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG59O1xuTGlmZWN5Y2xlLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gdHJpZ2dlciAoKSB7XG4gICAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzJDEubGlzdGVuZXJzW2ldKCk7XG4gICAgfVxufTtcblxudmFyIGlzaU9TID0gaXNCcm93c2VyICYmICEhbmF2aWdhdG9yLnBsYXRmb3JtICYmIC9pUGFkfGlQaG9uZXxpUG9kLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk7XG52YXIgZGVsZWdhdGVkRXZlbnRzID0gbmV3IE1hcCgpO1xuZnVuY3Rpb24gaGFuZGxlRXZlbnQobmFtZSwgbGFzdEV2ZW50LCBuZXh0RXZlbnQsIGRvbSkge1xuICAgIHZhciBkZWxlZ2F0ZWRSb290cyA9IGRlbGVnYXRlZEV2ZW50cy5nZXQobmFtZSk7XG4gICAgaWYgKG5leHRFdmVudCkge1xuICAgICAgICBpZiAoIWRlbGVnYXRlZFJvb3RzKSB7XG4gICAgICAgICAgICBkZWxlZ2F0ZWRSb290cyA9IHsgaXRlbXM6IG5ldyBNYXAoKSwgY291bnQ6IDAsIGRvY0V2ZW50OiBudWxsIH07XG4gICAgICAgICAgICB2YXIgZG9jRXZlbnQgPSBhdHRhY2hFdmVudFRvRG9jdW1lbnQobmFtZSwgZGVsZWdhdGVkUm9vdHMpO1xuICAgICAgICAgICAgZGVsZWdhdGVkUm9vdHMuZG9jRXZlbnQgPSBkb2NFdmVudDtcbiAgICAgICAgICAgIGRlbGVnYXRlZEV2ZW50cy5zZXQobmFtZSwgZGVsZWdhdGVkUm9vdHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbGFzdEV2ZW50KSB7XG4gICAgICAgICAgICBkZWxlZ2F0ZWRSb290cy5jb3VudCsrO1xuICAgICAgICAgICAgaWYgKGlzaU9TICYmIG5hbWUgPT09ICdvbkNsaWNrJykge1xuICAgICAgICAgICAgICAgIHRyYXBDbGlja09uTm9uSW50ZXJhY3RpdmVFbGVtZW50KGRvbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGVsZWdhdGVkUm9vdHMuaXRlbXMuc2V0KGRvbSwgbmV4dEV2ZW50KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZGVsZWdhdGVkUm9vdHMpIHtcbiAgICAgICAgaWYgKGRlbGVnYXRlZFJvb3RzLml0ZW1zLmhhcyhkb20pKSB7XG4gICAgICAgICAgICBkZWxlZ2F0ZWRSb290cy5jb3VudC0tO1xuICAgICAgICAgICAgZGVsZWdhdGVkUm9vdHMuaXRlbXMuZGVsZXRlKGRvbSk7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVkUm9vdHMuY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG5vcm1hbGl6ZUV2ZW50TmFtZShuYW1lKSwgZGVsZWdhdGVkUm9vdHMuZG9jRXZlbnQpO1xuICAgICAgICAgICAgICAgIGRlbGVnYXRlZEV2ZW50cy5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50LCBkb20sIGl0ZW1zLCBjb3VudCwgZXZlbnREYXRhKSB7XG4gICAgdmFyIGV2ZW50c1RvVHJpZ2dlciA9IGl0ZW1zLmdldChkb20pO1xuICAgIGlmIChldmVudHNUb1RyaWdnZXIpIHtcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgLy8gbGlua0V2ZW50IG9iamVjdFxuICAgICAgICBldmVudERhdGEuZG9tID0gZG9tO1xuICAgICAgICBpZiAoZXZlbnRzVG9UcmlnZ2VyLmV2ZW50KSB7XG4gICAgICAgICAgICBldmVudHNUb1RyaWdnZXIuZXZlbnQoZXZlbnRzVG9UcmlnZ2VyLmRhdGEsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50c1RvVHJpZ2dlcihldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50RGF0YS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgcGFyZW50RG9tID0gZG9tLnBhcmVudE5vZGU7XG4gICAgaWYgKGNvdW50ID4gMCAmJiAocGFyZW50RG9tIHx8IHBhcmVudERvbSA9PT0gZG9jdW1lbnQuYm9keSkpIHtcbiAgICAgICAgZGlzcGF0Y2hFdmVudChldmVudCwgcGFyZW50RG9tLCBpdGVtcywgY291bnQsIGV2ZW50RGF0YSk7XG4gICAgfVxufVxuZnVuY3Rpb24gbm9ybWFsaXplRXZlbnROYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmFtZS5zdWJzdHIoMikudG9Mb3dlckNhc2UoKTtcbn1cbmZ1bmN0aW9uIGF0dGFjaEV2ZW50VG9Eb2N1bWVudChuYW1lLCBkZWxlZ2F0ZWRSb290cykge1xuICAgIHZhciBkb2NFdmVudCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgZXZlbnREYXRhID0ge1xuICAgICAgICAgICAgc3RvcFByb3BhZ2F0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRvbTogZG9jdW1lbnRcbiAgICAgICAgfTtcbiAgICAgICAgLy8gd2UgaGF2ZSB0byBkbyB0aGlzIGFzIHNvbWUgYnJvd3NlcnMgcmVjeWNsZSB0aGUgc2FtZSBFdmVudCBiZXR3ZWVuIGNhbGxzXG4gICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gbWFrZSB0aGUgcHJvcGVydHkgY29uZmlndXJhYmxlXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShldmVudCwgJ2N1cnJlbnRUYXJnZXQnLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnREYXRhLmRvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV2ZW50RGF0YS5zdG9wUHJvcGFnYXRpb24gPSB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgY291bnQgPSBkZWxlZ2F0ZWRSb290cy5jb3VudDtcbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudChldmVudCwgZXZlbnQudGFyZ2V0LCBkZWxlZ2F0ZWRSb290cy5pdGVtcywgY291bnQsIGV2ZW50RGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobm9ybWFsaXplRXZlbnROYW1lKG5hbWUpLCBkb2NFdmVudCk7XG4gICAgcmV0dXJuIGRvY0V2ZW50O1xufVxuZnVuY3Rpb24gZW1wdHlGbigpIHsgfVxuZnVuY3Rpb24gdHJhcENsaWNrT25Ob25JbnRlcmFjdGl2ZUVsZW1lbnQoZG9tKSB7XG4gICAgLy8gTW9iaWxlIFNhZmFyaSBkb2VzIG5vdCBmaXJlIHByb3Blcmx5IGJ1YmJsZSBjbGljayBldmVudHMgb25cbiAgICAvLyBub24taW50ZXJhY3RpdmUgZWxlbWVudHMsIHdoaWNoIG1lYW5zIGRlbGVnYXRlZCBjbGljayBsaXN0ZW5lcnMgZG8gbm90XG4gICAgLy8gZmlyZS4gVGhlIHdvcmthcm91bmQgZm9yIHRoaXMgYnVnIGludm9sdmVzIGF0dGFjaGluZyBhbiBlbXB0eSBjbGlja1xuICAgIC8vIGxpc3RlbmVyIG9uIHRoZSB0YXJnZXQgbm9kZS5cbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2Jsb2cvYXJjaGl2ZXMvMjAxMC8wOS9jbGlja19ldmVudF9kZWwuaHRtbFxuICAgIC8vIEp1c3Qgc2V0IGl0IHVzaW5nIHRoZSBvbmNsaWNrIHByb3BlcnR5IHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSB0byBtYW5hZ2UgYW55XG4gICAgLy8gYm9va2tlZXBpbmcgZm9yIGl0LiBOb3Qgc3VyZSBpZiB3ZSBuZWVkIHRvIGNsZWFyIGl0IHdoZW4gdGhlIGxpc3RlbmVyIGlzXG4gICAgLy8gcmVtb3ZlZC5cbiAgICAvLyBUT0RPOiBPbmx5IGRvIHRoaXMgZm9yIHRoZSByZWxldmFudCBTYWZhcmlzIG1heWJlP1xuICAgIGRvbS5vbmNsaWNrID0gZW1wdHlGbjtcbn1cblxudmFyIGNvbXBvbmVudFBvb2xzID0gbmV3IE1hcCgpO1xudmFyIGVsZW1lbnRQb29scyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIHJlY3ljbGVFbGVtZW50KHZOb2RlLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSB7XG4gICAgdmFyIHRhZyA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIGtleSA9IHZOb2RlLmtleTtcbiAgICB2YXIgcG9vbHMgPSBlbGVtZW50UG9vbHMuZ2V0KHRhZyk7XG4gICAgaWYgKCFpc1VuZGVmaW5lZChwb29scykpIHtcbiAgICAgICAgdmFyIHBvb2wgPSBrZXkgPT09IG51bGwgPyBwb29scy5ub25LZXllZCA6IHBvb2xzLmtleWVkLmdldChrZXkpO1xuICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKHBvb2wpKSB7XG4gICAgICAgICAgICB2YXIgcmVjeWNsZWRWTm9kZSA9IHBvb2wucG9wKCk7XG4gICAgICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKHJlY3ljbGVkVk5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hFbGVtZW50KHJlY3ljbGVkVk5vZGUsIHZOb2RlLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdk5vZGUuZG9tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gcG9vbEVsZW1lbnQodk5vZGUpIHtcbiAgICB2YXIgdGFnID0gdk5vZGUudHlwZTtcbiAgICB2YXIga2V5ID0gdk5vZGUua2V5O1xuICAgIHZhciBwb29scyA9IGVsZW1lbnRQb29scy5nZXQodGFnKTtcbiAgICBpZiAoaXNVbmRlZmluZWQocG9vbHMpKSB7XG4gICAgICAgIHBvb2xzID0ge1xuICAgICAgICAgICAgbm9uS2V5ZWQ6IFtdLFxuICAgICAgICAgICAga2V5ZWQ6IG5ldyBNYXAoKSxcbiAgICAgICAgfTtcbiAgICAgICAgZWxlbWVudFBvb2xzLnNldCh0YWcsIHBvb2xzKTtcbiAgICB9XG4gICAgaWYgKGlzTnVsbChrZXkpKSB7XG4gICAgICAgIHBvb2xzLm5vbktleWVkLnB1c2godk5vZGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHBvb2wgPSBwb29scy5rZXllZC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGlzVW5kZWZpbmVkKHBvb2wpKSB7XG4gICAgICAgICAgICBwb29sID0gW107XG4gICAgICAgICAgICBwb29scy5rZXllZC5zZXQoa2V5LCBwb29sKTtcbiAgICAgICAgfVxuICAgICAgICBwb29sLnB1c2godk5vZGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlY3ljbGVDb21wb25lbnQodk5vZGUsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpIHtcbiAgICB2YXIgdHlwZSA9IHZOb2RlLnR5cGU7XG4gICAgdmFyIGtleSA9IHZOb2RlLmtleTtcbiAgICB2YXIgcG9vbHMgPSBjb21wb25lbnRQb29scy5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1VuZGVmaW5lZChwb29scykpIHtcbiAgICAgICAgdmFyIHBvb2wgPSBrZXkgPT09IG51bGwgPyBwb29scy5ub25LZXllZCA6IHBvb2xzLmtleWVkLmdldChrZXkpO1xuICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKHBvb2wpKSB7XG4gICAgICAgICAgICB2YXIgcmVjeWNsZWRWTm9kZSA9IHBvb2wucG9wKCk7XG4gICAgICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKHJlY3ljbGVkVk5vZGUpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZsYWdzID0gdk5vZGUuZmxhZ3M7XG4gICAgICAgICAgICAgICAgdmFyIGZhaWxlZCA9IHBhdGNoQ29tcG9uZW50KHJlY3ljbGVkVk5vZGUsIHZOb2RlLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBmbGFncyAmIDQgLyogQ29tcG9uZW50Q2xhc3MgKi8sIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmICghZmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2Tm9kZS5kb207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gcG9vbENvbXBvbmVudCh2Tm9kZSkge1xuICAgIHZhciB0eXBlID0gdk5vZGUudHlwZTtcbiAgICB2YXIga2V5ID0gdk5vZGUua2V5O1xuICAgIHZhciBob29rcyA9IHZOb2RlLnJlZjtcbiAgICB2YXIgbm9uUmVjeWNsZUhvb2tzID0gaG9va3MgJiYgKGhvb2tzLm9uQ29tcG9uZW50V2lsbE1vdW50IHx8XG4gICAgICAgIGhvb2tzLm9uQ29tcG9uZW50V2lsbFVubW91bnQgfHxcbiAgICAgICAgaG9va3Mub25Db21wb25lbnREaWRNb3VudCB8fFxuICAgICAgICBob29rcy5vbkNvbXBvbmVudFdpbGxVcGRhdGUgfHxcbiAgICAgICAgaG9va3Mub25Db21wb25lbnREaWRVcGRhdGUpO1xuICAgIGlmIChub25SZWN5Y2xlSG9va3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcG9vbHMgPSBjb21wb25lbnRQb29scy5nZXQodHlwZSk7XG4gICAgaWYgKGlzVW5kZWZpbmVkKHBvb2xzKSkge1xuICAgICAgICBwb29scyA9IHtcbiAgICAgICAgICAgIG5vbktleWVkOiBbXSxcbiAgICAgICAgICAgIGtleWVkOiBuZXcgTWFwKCksXG4gICAgICAgIH07XG4gICAgICAgIGNvbXBvbmVudFBvb2xzLnNldCh0eXBlLCBwb29scyk7XG4gICAgfVxuICAgIGlmIChpc051bGwoa2V5KSkge1xuICAgICAgICBwb29scy5ub25LZXllZC5wdXNoKHZOb2RlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBwb29sID0gcG9vbHMua2V5ZWQuZ2V0KGtleSk7XG4gICAgICAgIGlmIChpc1VuZGVmaW5lZChwb29sKSkge1xuICAgICAgICAgICAgcG9vbCA9IFtdO1xuICAgICAgICAgICAgcG9vbHMua2V5ZWQuc2V0KGtleSwgcG9vbCk7XG4gICAgICAgIH1cbiAgICAgICAgcG9vbC5wdXNoKHZOb2RlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVubW91bnQodk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjYW5SZWN5Y2xlLCBpc1JlY3ljbGluZykge1xuICAgIHZhciBmbGFncyA9IHZOb2RlLmZsYWdzO1xuICAgIGlmIChmbGFncyAmIDI4IC8qIENvbXBvbmVudCAqLykge1xuICAgICAgICB1bm1vdW50Q29tcG9uZW50KHZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY2FuUmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgIH1cbiAgICBlbHNlIGlmIChmbGFncyAmIDM5NzAgLyogRWxlbWVudCAqLykge1xuICAgICAgICB1bm1vdW50RWxlbWVudCh2Tm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNhblJlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmxhZ3MgJiAoMSAvKiBUZXh0ICovIHwgNDA5NiAvKiBWb2lkICovKSkge1xuICAgICAgICB1bm1vdW50Vm9pZE9yVGV4dCh2Tm9kZSwgcGFyZW50RG9tKTtcbiAgICB9XG59XG5mdW5jdGlvbiB1bm1vdW50Vm9pZE9yVGV4dCh2Tm9kZSwgcGFyZW50RG9tKSB7XG4gICAgaWYgKHBhcmVudERvbSkge1xuICAgICAgICByZW1vdmVDaGlsZChwYXJlbnREb20sIHZOb2RlLmRvbSk7XG4gICAgfVxufVxudmFyIGFscmVhZHlVbm1vdW50ZWQgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gdW5tb3VudENvbXBvbmVudCh2Tm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNhblJlY3ljbGUsIGlzUmVjeWNsaW5nKSB7XG4gICAgdmFyIGluc3RhbmNlID0gdk5vZGUuY2hpbGRyZW47XG4gICAgdmFyIGZsYWdzID0gdk5vZGUuZmxhZ3M7XG4gICAgdmFyIGlzU3RhdGVmdWxDb21wb25lbnQkJDEgPSBmbGFncyAmIDQ7XG4gICAgdmFyIHJlZiA9IHZOb2RlLnJlZjtcbiAgICB2YXIgZG9tID0gdk5vZGUuZG9tO1xuICAgIGlmIChhbHJlYWR5VW5tb3VudGVkLmhhcyh2Tm9kZSkgJiYgIWlzUmVjeWNsaW5nICYmICFwYXJlbnREb20pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhbHJlYWR5VW5tb3VudGVkLnNldCh2Tm9kZSk7XG4gICAgaWYgKCFpc1JlY3ljbGluZykge1xuICAgICAgICBpZiAoaXNTdGF0ZWZ1bENvbXBvbmVudCQkMSkge1xuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZS5fdW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2lnbm9yZVNldFN0YXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmJlZm9yZVVubW91bnQgJiYgb3B0aW9ucy5iZWZvcmVVbm1vdW50KHZOb2RlKTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5jb21wb25lbnRXaWxsVW5tb3VudCAmJiBpbnN0YW5jZS5jb21wb25lbnRXaWxsVW5tb3VudCgpO1xuICAgICAgICAgICAgICAgIGlmIChyZWYgJiYgIWlzUmVjeWNsaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZihudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX3VubW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5maW5kRE9NTm9kZUVuYWJsZWQgJiYgY29tcG9uZW50VG9ET01Ob2RlTWFwLmRlbGV0ZShpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgdmFyIHN1YkxpZmVjeWNsZSA9IGluc3RhbmNlLl9saWZlY3ljbGU7XG4gICAgICAgICAgICAgICAgaWYgKCFzdWJMaWZlY3ljbGUuZmFzdFVubW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5tb3VudChpbnN0YW5jZS5fbGFzdElucHV0LCBudWxsLCBzdWJMaWZlY3ljbGUsIGZhbHNlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKHJlZikpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYocmVmLm9uQ29tcG9uZW50V2lsbFVubW91bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZi5vbkNvbXBvbmVudFdpbGxVbm1vdW50KGRvbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsaWZlY3ljbGUuZmFzdFVubW91bnQpIHtcbiAgICAgICAgICAgICAgICB1bm1vdW50KGluc3RhbmNlLCBudWxsLCBsaWZlY3ljbGUsIGZhbHNlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhcmVudERvbSkge1xuICAgICAgICB2YXIgbGFzdElucHV0ID0gaW5zdGFuY2UuX2xhc3RJbnB1dDtcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWYobGFzdElucHV0KSkge1xuICAgICAgICAgICAgbGFzdElucHV0ID0gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlQ2hpbGQocGFyZW50RG9tLCBkb20pO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5yZWN5Y2xpbmdFbmFibGVkICYmICFpc1N0YXRlZnVsQ29tcG9uZW50JCQxICYmIChwYXJlbnREb20gfHwgY2FuUmVjeWNsZSkpIHtcbiAgICAgICAgcG9vbENvbXBvbmVudCh2Tm9kZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gdW5tb3VudEVsZW1lbnQodk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjYW5SZWN5Y2xlLCBpc1JlY3ljbGluZykge1xuICAgIHZhciBkb20gPSB2Tm9kZS5kb207XG4gICAgdmFyIHJlZiA9IHZOb2RlLnJlZjtcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzO1xuICAgIGlmIChhbHJlYWR5VW5tb3VudGVkLmhhcyh2Tm9kZSkgJiYgIWlzUmVjeWNsaW5nICYmICFwYXJlbnREb20pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhbHJlYWR5VW5tb3VudGVkLnNldCh2Tm9kZSk7XG4gICAgaWYgKCFsaWZlY3ljbGUuZmFzdFVubW91bnQpIHtcbiAgICAgICAgaWYgKHJlZiAmJiAhaXNSZWN5Y2xpbmcpIHtcbiAgICAgICAgICAgIHVubW91bnRSZWYocmVmKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgdW5tb3VudENoaWxkcmVuJDEoY2hpbGRyZW4sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghaXNOdWxsKGV2ZW50cykpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdCBhZGQgYSBoYXNPd25Qcm9wZXJ0eSBjaGVjayBoZXJlLCBpdCBhZmZlY3RzIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICBwYXRjaEV2ZW50KG5hbWUsIGV2ZW50c1tuYW1lXSwgbnVsbCwgZG9tKTtcbiAgICAgICAgICAgIGV2ZW50c1tuYW1lXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhcmVudERvbSkge1xuICAgICAgICByZW1vdmVDaGlsZChwYXJlbnREb20sIGRvbSk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnJlY3ljbGluZ0VuYWJsZWQgJiYgKHBhcmVudERvbSB8fCBjYW5SZWN5Y2xlKSkge1xuICAgICAgICBwb29sRWxlbWVudCh2Tm9kZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gdW5tb3VudENoaWxkcmVuJDEoY2hpbGRyZW4sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpIHtcbiAgICBpZiAoaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAoIWlzSW52YWxpZChjaGlsZCkgJiYgaXNPYmplY3QoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgdW5tb3VudChjaGlsZCwgbnVsbCwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzT2JqZWN0KGNoaWxkcmVuKSkge1xuICAgICAgICB1bm1vdW50KGNoaWxkcmVuLCBudWxsLCBsaWZlY3ljbGUsIGZhbHNlLCBpc1JlY3ljbGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gdW5tb3VudFJlZihyZWYpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihyZWYpKSB7XG4gICAgICAgIHJlZihudWxsKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpc0ludmFsaWQocmVmKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCdzdHJpbmcgXCJyZWZzXCIgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gSW5mZXJubyAxLjAuIFVzZSBjYWxsYmFjayBcInJlZnNcIiBpbnN0ZWFkLicpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNsYXNzQ29tcG9uZW50SW5zdGFuY2Uodk5vZGUsIENvbXBvbmVudCwgcHJvcHMsIGNvbnRleHQsIGlzU1ZHKSB7XG4gICAgaWYgKGlzVW5kZWZpbmVkKGNvbnRleHQpKSB7XG4gICAgICAgIGNvbnRleHQgPSB7fTtcbiAgICB9XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IENvbXBvbmVudChwcm9wcywgY29udGV4dCk7XG4gICAgaW5zdGFuY2UuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgaWYgKGluc3RhbmNlLnByb3BzID09PSBFTVBUWV9PQkopIHtcbiAgICAgICAgaW5zdGFuY2UucHJvcHMgPSBwcm9wcztcbiAgICB9XG4gICAgaW5zdGFuY2UuX3BhdGNoID0gcGF0Y2g7XG4gICAgaWYgKG9wdGlvbnMuZmluZERPTU5vZGVFbmFibGVkKSB7XG4gICAgICAgIGluc3RhbmNlLl9jb21wb25lbnRUb0RPTU5vZGVNYXAgPSBjb21wb25lbnRUb0RPTU5vZGVNYXA7XG4gICAgfVxuICAgIGluc3RhbmNlLl91bm1vdW50ZWQgPSBmYWxzZTtcbiAgICBpbnN0YW5jZS5fcGVuZGluZ1NldFN0YXRlID0gdHJ1ZTtcbiAgICBpbnN0YW5jZS5faXNTVkcgPSBpc1NWRztcbiAgICBpZiAoaXNGdW5jdGlvbihpbnN0YW5jZS5jb21wb25lbnRXaWxsTW91bnQpKSB7XG4gICAgICAgIGluc3RhbmNlLmNvbXBvbmVudFdpbGxNb3VudCgpO1xuICAgIH1cbiAgICB2YXIgY2hpbGRDb250ZXh0ID0gaW5zdGFuY2UuZ2V0Q2hpbGRDb250ZXh0KCk7XG4gICAgaWYgKCFpc051bGxPclVuZGVmKGNoaWxkQ29udGV4dCkpIHtcbiAgICAgICAgaW5zdGFuY2UuX2NoaWxkQ29udGV4dCA9IE9iamVjdC5hc3NpZ24oe30sIGNvbnRleHQsIGNoaWxkQ29udGV4dCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbnN0YW5jZS5fY2hpbGRDb250ZXh0ID0gY29udGV4dDtcbiAgICB9XG4gICAgb3B0aW9ucy5iZWZvcmVSZW5kZXIgJiYgb3B0aW9ucy5iZWZvcmVSZW5kZXIoaW5zdGFuY2UpO1xuICAgIHZhciBpbnB1dCA9IGluc3RhbmNlLnJlbmRlcihwcm9wcywgaW5zdGFuY2Uuc3RhdGUsIGNvbnRleHQpO1xuICAgIG9wdGlvbnMuYWZ0ZXJSZW5kZXIgJiYgb3B0aW9ucy5hZnRlclJlbmRlcihpbnN0YW5jZSk7XG4gICAgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCdhIHZhbGlkIEluZmVybm8gVk5vZGUgKG9yIG51bGwpIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBhIGNvbXBvbmVudCByZW5kZXIuIFlvdSBtYXkgaGF2ZSByZXR1cm5lZCBhbiBhcnJheSBvciBhbiBpbnZhbGlkIG9iamVjdC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzSW52YWxpZChpbnB1dCkpIHtcbiAgICAgICAgaW5wdXQgPSBjcmVhdGVWb2lkVk5vZGUoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihpbnB1dCkpIHtcbiAgICAgICAgaW5wdXQgPSBjcmVhdGVUZXh0Vk5vZGUoaW5wdXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGlucHV0LmRvbSkge1xuICAgICAgICAgICAgaW5wdXQgPSBjbG9uZVZOb2RlKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGhhdmUgYW4gaW5wdXQgdGhhdCBpcyBhbHNvIGEgY29tcG9uZW50LCB3ZSBydW4gaW50byBhIHRyaWNreSBzaXR1YXRpb25cbiAgICAgICAgICAgIC8vIHdoZXJlIHRoZSByb290IHZOb2RlIG5lZWRzIHRvIGFsd2F5cyBoYXZlIHRoZSBjb3JyZWN0IERPTSBlbnRyeVxuICAgICAgICAgICAgLy8gc28gd2UgYnJlYWsgbW9ub21vcnBoaXNtIG9uIG91ciBpbnB1dCBhbmQgc3VwcGx5IGl0IG91ciB2Tm9kZSBhcyBwYXJlbnRWTm9kZVxuICAgICAgICAgICAgLy8gd2UgY2FuIG9wdGltaXNlIHRoaXMgaW4gdGhlIGZ1dHVyZSwgYnV0IHRoaXMgZ2V0cyB1cyBvdXQgb2YgYSBsb3Qgb2YgaXNzdWVzXG4gICAgICAgICAgICBpbnB1dC5wYXJlbnRWTm9kZSA9IHZOb2RlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluc3RhbmNlLl9wZW5kaW5nU2V0U3RhdGUgPSBmYWxzZTtcbiAgICBpbnN0YW5jZS5fbGFzdElucHV0ID0gaW5wdXQ7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuZnVuY3Rpb24gcmVwbGFjZUxhc3RDaGlsZEFuZFVubW91bnQobGFzdElucHV0LCBuZXh0SW5wdXQsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpIHtcbiAgICByZXBsYWNlVk5vZGUocGFyZW50RG9tLCBtb3VudChuZXh0SW5wdXQsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpLCBsYXN0SW5wdXQsIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xufVxuZnVuY3Rpb24gcmVwbGFjZVZOb2RlKHBhcmVudERvbSwgZG9tLCB2Tm9kZSwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZykge1xuICAgIHZhciBzaGFsbG93VW5tb3VudCA9IGZhbHNlO1xuICAgIC8vIHdlIGNhbm5vdCBjYWNoZSBub2RlVHlwZSBoZXJlIGFzIHZOb2RlIG1pZ2h0IGJlIHJlLWFzc2lnbmVkIGJlbG93XG4gICAgaWYgKHZOb2RlLmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSBhY2Nlc3NpbmcgYSBzdGF0ZWZ1bCBvciBzdGF0ZWxlc3MgY29tcG9uZW50LCB3ZSB3YW50IHRvIGFjY2VzcyB0aGVpciBsYXN0IHJlbmRlcmVkIGlucHV0XG4gICAgICAgIC8vIGFjY2Vzc2luZyB0aGVpciBET00gbm9kZSBpcyBub3QgdXNlZnVsIHRvIHVzIGhlcmVcbiAgICAgICAgdW5tb3VudCh2Tm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB2Tm9kZSA9IHZOb2RlLmNoaWxkcmVuLl9sYXN0SW5wdXQgfHwgdk5vZGUuY2hpbGRyZW47XG4gICAgICAgIHNoYWxsb3dVbm1vdW50ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmVwbGFjZUNoaWxkKHBhcmVudERvbSwgZG9tLCB2Tm9kZS5kb20pO1xuICAgIHVubW91bnQodk5vZGUsIG51bGwsIGxpZmVjeWNsZSwgZmFsc2UsIGlzUmVjeWNsaW5nKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnRJbnB1dCh2Tm9kZSwgY29tcG9uZW50LCBwcm9wcywgY29udGV4dCkge1xuICAgIHZhciBpbnB1dCA9IGNvbXBvbmVudChwcm9wcywgY29udGV4dCk7XG4gICAgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCdhIHZhbGlkIEluZmVybm8gVk5vZGUgKG9yIG51bGwpIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBhIGNvbXBvbmVudCByZW5kZXIuIFlvdSBtYXkgaGF2ZSByZXR1cm5lZCBhbiBhcnJheSBvciBhbiBpbnZhbGlkIG9iamVjdC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzSW52YWxpZChpbnB1dCkpIHtcbiAgICAgICAgaW5wdXQgPSBjcmVhdGVWb2lkVk5vZGUoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihpbnB1dCkpIHtcbiAgICAgICAgaW5wdXQgPSBjcmVhdGVUZXh0Vk5vZGUoaW5wdXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGlucHV0LmRvbSkge1xuICAgICAgICAgICAgaW5wdXQgPSBjbG9uZVZOb2RlKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGhhdmUgYW4gaW5wdXQgdGhhdCBpcyBhbHNvIGEgY29tcG9uZW50LCB3ZSBydW4gaW50byBhIHRyaWNreSBzaXR1YXRpb25cbiAgICAgICAgICAgIC8vIHdoZXJlIHRoZSByb290IHZOb2RlIG5lZWRzIHRvIGFsd2F5cyBoYXZlIHRoZSBjb3JyZWN0IERPTSBlbnRyeVxuICAgICAgICAgICAgLy8gc28gd2UgYnJlYWsgbW9ub21vcnBoaXNtIG9uIG91ciBpbnB1dCBhbmQgc3VwcGx5IGl0IG91ciB2Tm9kZSBhcyBwYXJlbnRWTm9kZVxuICAgICAgICAgICAgLy8gd2UgY2FuIG9wdGltaXNlIHRoaXMgaW4gdGhlIGZ1dHVyZSwgYnV0IHRoaXMgZ2V0cyB1cyBvdXQgb2YgYSBsb3Qgb2YgaXNzdWVzXG4gICAgICAgICAgICBpbnB1dC5wYXJlbnRWTm9kZSA9IHZOb2RlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbnB1dDtcbn1cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KGRvbSwgdGV4dCkge1xuICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICBkb20udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZG9tLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSk7XG4gICAgfVxufVxuZnVuY3Rpb24gdXBkYXRlVGV4dENvbnRlbnQoZG9tLCB0ZXh0KSB7XG4gICAgZG9tLmZpcnN0Q2hpbGQubm9kZVZhbHVlID0gdGV4dDtcbn1cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKHBhcmVudERvbSwgZG9tKSB7XG4gICAgcGFyZW50RG9tLmFwcGVuZENoaWxkKGRvbSk7XG59XG5mdW5jdGlvbiBpbnNlcnRPckFwcGVuZChwYXJlbnREb20sIG5ld05vZGUsIG5leHROb2RlKSB7XG4gICAgaWYgKGlzTnVsbE9yVW5kZWYobmV4dE5vZGUpKSB7XG4gICAgICAgIGFwcGVuZENoaWxkKHBhcmVudERvbSwgbmV3Tm9kZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwYXJlbnREb20uaW5zZXJ0QmVmb3JlKG5ld05vZGUsIG5leHROb2RlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkb2N1bWVudENyZWF0ZUVsZW1lbnQodGFnLCBpc1NWRykge1xuICAgIGlmIChpc1NWRyA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Z05TLCB0YWcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICB9XG59XG5mdW5jdGlvbiByZXBsYWNlV2l0aE5ld05vZGUobGFzdE5vZGUsIG5leHROb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKSB7XG4gICAgdW5tb3VudChsYXN0Tm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBmYWxzZSwgaXNSZWN5Y2xpbmcpO1xuICAgIHZhciBkb20gPSBtb3VudChuZXh0Tm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgbmV4dE5vZGUuZG9tID0gZG9tO1xuICAgIHJlcGxhY2VDaGlsZChwYXJlbnREb20sIGRvbSwgbGFzdE5vZGUuZG9tKTtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VDaGlsZChwYXJlbnREb20sIG5leHREb20sIGxhc3REb20pIHtcbiAgICBpZiAoIXBhcmVudERvbSkge1xuICAgICAgICBwYXJlbnREb20gPSBsYXN0RG9tLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHBhcmVudERvbS5yZXBsYWNlQ2hpbGQobmV4dERvbSwgbGFzdERvbSk7XG59XG5mdW5jdGlvbiByZW1vdmVDaGlsZChwYXJlbnREb20sIGRvbSkge1xuICAgIHBhcmVudERvbS5yZW1vdmVDaGlsZChkb20pO1xufVxuZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGRyZW4oZG9tLCBjaGlsZHJlbiwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZykge1xuICAgIGRvbS50ZXh0Q29udGVudCA9ICcnO1xuICAgIGlmICghbGlmZWN5Y2xlLmZhc3RVbm1vdW50IHx8IChsaWZlY3ljbGUuZmFzdFVubW91bnQgJiYgb3B0aW9ucy5yZWN5Y2xpbmdFbmFibGVkICYmICFpc1JlY3ljbGluZykpIHtcbiAgICAgICAgcmVtb3ZlQ2hpbGRyZW4obnVsbCwgY2hpbGRyZW4sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKGRvbSwgY2hpbGRyZW4sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoIWlzSW52YWxpZChjaGlsZCkpIHtcbiAgICAgICAgICAgIHVubW91bnQoY2hpbGQsIGRvbSwgbGlmZWN5Y2xlLCB0cnVlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBpc0tleWVkKGxhc3RDaGlsZHJlbiwgbmV4dENoaWxkcmVuKSB7XG4gICAgcmV0dXJuIG5leHRDaGlsZHJlbi5sZW5ndGggJiYgIWlzTnVsbE9yVW5kZWYobmV4dENoaWxkcmVuWzBdKSAmJiAhaXNOdWxsT3JVbmRlZihuZXh0Q2hpbGRyZW5bMF0ua2V5KVxuICAgICAgICAmJiBsYXN0Q2hpbGRyZW4ubGVuZ3RoICYmICFpc051bGxPclVuZGVmKGxhc3RDaGlsZHJlblswXSkgJiYgIWlzTnVsbE9yVW5kZWYobGFzdENoaWxkcmVuWzBdLmtleSk7XG59XG5cbmZ1bmN0aW9uIGlzQ2hlY2tlZFR5cGUodHlwZSkge1xuICAgIHJldHVybiB0eXBlID09PSAnY2hlY2tib3gnIHx8IHR5cGUgPT09ICdyYWRpbyc7XG59XG5mdW5jdGlvbiBpc0NvbnRyb2xsZWQocHJvcHMpIHtcbiAgICB2YXIgdXNlc0NoZWNrZWQgPSBpc0NoZWNrZWRUeXBlKHByb3BzLnR5cGUpO1xuICAgIHJldHVybiB1c2VzQ2hlY2tlZCA/ICFpc051bGxPclVuZGVmKHByb3BzLmNoZWNrZWQpIDogIWlzTnVsbE9yVW5kZWYocHJvcHMudmFsdWUpO1xufVxuZnVuY3Rpb24gb25UZXh0SW5wdXRDaGFuZ2UoZSkge1xuICAgIHZhciB2Tm9kZSA9IHRoaXMudk5vZGU7XG4gICAgdmFyIGV2ZW50cyA9IHZOb2RlLmV2ZW50cyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGRvbSA9IHZOb2RlLmRvbTtcbiAgICBpZiAoZXZlbnRzLm9uSW5wdXQpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZXZlbnRzLm9uSW5wdXQ7XG4gICAgICAgIGlmIChldmVudC5ldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuZXZlbnQoZXZlbnQuZGF0YSwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBldmVudChlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChldmVudHMub25pbnB1dCkge1xuICAgICAgICBldmVudHMub25pbnB1dChlKTtcbiAgICB9XG4gICAgLy8gdGhlIHVzZXIgbWF5IGhhdmUgdXBkYXRlZCB0aGUgdk5vZGUgZnJvbSB0aGUgYWJvdmUgb25JbnB1dCBldmVudHNcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIGdldCBpdCBmcm9tIHRoZSBjb250ZXh0IG9mIGB0aGlzYCBhZ2FpblxuICAgIGFwcGx5VmFsdWUodGhpcy52Tm9kZSwgZG9tKTtcbn1cbmZ1bmN0aW9uIHdyYXBwZWRPbkNoYW5nZShlKSB7XG4gICAgdmFyIHZOb2RlID0gdGhpcy52Tm9kZTtcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgZXZlbnQgPSBldmVudHMub25DaGFuZ2U7XG4gICAgaWYgKGV2ZW50LmV2ZW50KSB7XG4gICAgICAgIGV2ZW50LmV2ZW50KGV2ZW50LmRhdGEsIGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZXZlbnQoZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gb25DaGVja2JveENoYW5nZShlKSB7XG4gICAgdmFyIHZOb2RlID0gdGhpcy52Tm9kZTtcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgZG9tID0gdk5vZGUuZG9tO1xuICAgIGlmIChldmVudHMub25DbGljaykge1xuICAgICAgICB2YXIgZXZlbnQgPSBldmVudHMub25DbGljaztcbiAgICAgICAgaWYgKGV2ZW50LmV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5ldmVudChldmVudC5kYXRhLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50cy5vbmNsaWNrKSB7XG4gICAgICAgIGV2ZW50cy5vbmNsaWNrKGUpO1xuICAgIH1cbiAgICAvLyB0aGUgdXNlciBtYXkgaGF2ZSB1cGRhdGVkIHRoZSB2Tm9kZSBmcm9tIHRoZSBhYm92ZSBvbkNsaWNrIGV2ZW50c1xuICAgIC8vIHNvIHdlIG5lZWQgdG8gZ2V0IGl0IGZyb20gdGhlIGNvbnRleHQgb2YgYHRoaXNgIGFnYWluXG4gICAgYXBwbHlWYWx1ZSh0aGlzLnZOb2RlLCBkb20pO1xufVxuZnVuY3Rpb24gaGFuZGxlQXNzb2NpYXRlZFJhZGlvSW5wdXRzKG5hbWUpIHtcbiAgICB2YXIgaW5wdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgoXCJpbnB1dFt0eXBlPVxcXCJyYWRpb1xcXCJdW25hbWU9XFxcIlwiICsgbmFtZSArIFwiXFxcIl1cIikpO1xuICAgIFtdLmZvckVhY2guY2FsbChpbnB1dHMsIGZ1bmN0aW9uIChkb20pIHtcbiAgICAgICAgdmFyIGlucHV0V3JhcHBlciA9IHdyYXBwZXJzLmdldChkb20pO1xuICAgICAgICBpZiAoaW5wdXRXcmFwcGVyKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBpbnB1dFdyYXBwZXIudk5vZGUucHJvcHM7XG4gICAgICAgICAgICBpZiAocHJvcHMpIHtcbiAgICAgICAgICAgICAgICBkb20uY2hlY2tlZCA9IGlucHV0V3JhcHBlci52Tm9kZS5wcm9wcy5jaGVja2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5mdW5jdGlvbiBwcm9jZXNzSW5wdXQodk5vZGUsIGRvbSkge1xuICAgIHZhciBwcm9wcyA9IHZOb2RlLnByb3BzIHx8IEVNUFRZX09CSjtcbiAgICBhcHBseVZhbHVlKHZOb2RlLCBkb20pO1xuICAgIGlmIChpc0NvbnRyb2xsZWQocHJvcHMpKSB7XG4gICAgICAgIHZhciBpbnB1dFdyYXBwZXIgPSB3cmFwcGVycy5nZXQoZG9tKTtcbiAgICAgICAgaWYgKCFpbnB1dFdyYXBwZXIpIHtcbiAgICAgICAgICAgIGlucHV0V3JhcHBlciA9IHtcbiAgICAgICAgICAgICAgICB2Tm9kZTogdk5vZGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGlzQ2hlY2tlZFR5cGUocHJvcHMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBkb20ub25jbGljayA9IG9uQ2hlY2tib3hDaGFuZ2UuYmluZChpbnB1dFdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIGRvbS5vbmNsaWNrLndyYXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9tLm9uaW5wdXQgPSBvblRleHRJbnB1dENoYW5nZS5iaW5kKGlucHV0V3JhcHBlcik7XG4gICAgICAgICAgICAgICAgZG9tLm9uaW5wdXQud3JhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBkb20ub25jaGFuZ2UgPSB3cmFwcGVkT25DaGFuZ2UuYmluZChpbnB1dFdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIGRvbS5vbmNoYW5nZS53cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdyYXBwZXJzLnNldChkb20sIGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgaW5wdXRXcmFwcGVyLnZOb2RlID0gdk5vZGU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBhcHBseVZhbHVlKHZOb2RlLCBkb20pIHtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIHR5cGUgPSBwcm9wcy50eXBlO1xuICAgIHZhciB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuICAgIHZhciBjaGVja2VkID0gcHJvcHMuY2hlY2tlZDtcbiAgICB2YXIgbXVsdGlwbGUgPSBwcm9wcy5tdWx0aXBsZTtcbiAgICBpZiAodHlwZSAmJiB0eXBlICE9PSBkb20udHlwZSkge1xuICAgICAgICBkb20udHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIGlmIChtdWx0aXBsZSAmJiBtdWx0aXBsZSAhPT0gZG9tLm11bHRpcGxlKSB7XG4gICAgICAgIGRvbS5tdWx0aXBsZSA9IG11bHRpcGxlO1xuICAgIH1cbiAgICBpZiAoaXNDaGVja2VkVHlwZSh0eXBlKSkge1xuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYodmFsdWUpKSB7XG4gICAgICAgICAgICBkb20udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBkb20uY2hlY2tlZCA9IGNoZWNrZWQ7XG4gICAgICAgIGlmICh0eXBlID09PSAncmFkaW8nICYmIHByb3BzLm5hbWUpIHtcbiAgICAgICAgICAgIGhhbmRsZUFzc29jaWF0ZWRSYWRpb0lucHV0cyhwcm9wcy5uYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKHZhbHVlKSAmJiBkb20udmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBkb20udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghaXNOdWxsT3JVbmRlZihjaGVja2VkKSkge1xuICAgICAgICAgICAgZG9tLmNoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0NvbnRyb2xsZWQkMShwcm9wcykge1xuICAgIHJldHVybiAhaXNOdWxsT3JVbmRlZihwcm9wcy52YWx1ZSk7XG59XG5mdW5jdGlvbiB1cGRhdGVDaGlsZE9wdGlvbkdyb3VwKHZOb2RlLCB2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gdk5vZGUudHlwZTtcbiAgICBpZiAodHlwZSA9PT0gJ29wdGdyb3VwJykge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRPcHRpb24oY2hpbGRyZW5baV0sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1ZOb2RlKGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgdXBkYXRlQ2hpbGRPcHRpb24oY2hpbGRyZW4sIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdXBkYXRlQ2hpbGRPcHRpb24odk5vZGUsIHZhbHVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiB1cGRhdGVDaGlsZE9wdGlvbih2Tm9kZSwgdmFsdWUpIHtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGRvbSA9IHZOb2RlLmRvbTtcbiAgICAvLyB3ZSBkbyB0aGlzIGFzIG11bHRpcGxlIG1heSBoYXZlIGNoYW5nZWRcbiAgICBkb20udmFsdWUgPSBwcm9wcy52YWx1ZTtcbiAgICBpZiAoKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmluZGV4T2YocHJvcHMudmFsdWUpICE9PSAtMSkgfHwgcHJvcHMudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgIGRvbS5zZWxlY3RlZCA9IHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkb20uc2VsZWN0ZWQgPSBwcm9wcy5zZWxlY3RlZCB8fCBmYWxzZTtcbiAgICB9XG59XG5mdW5jdGlvbiBvblNlbGVjdENoYW5nZShlKSB7XG4gICAgdmFyIHZOb2RlID0gdGhpcy52Tm9kZTtcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgZG9tID0gdk5vZGUuZG9tO1xuICAgIGlmIChldmVudHMub25DaGFuZ2UpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZXZlbnRzLm9uQ2hhbmdlO1xuICAgICAgICBpZiAoZXZlbnQuZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50KGV2ZW50LmRhdGEsIGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoZXZlbnRzLm9uY2hhbmdlKSB7XG4gICAgICAgIGV2ZW50cy5vbmNoYW5nZShlKTtcbiAgICB9XG4gICAgLy8gdGhlIHVzZXIgbWF5IGhhdmUgdXBkYXRlZCB0aGUgdk5vZGUgZnJvbSB0aGUgYWJvdmUgb25DaGFuZ2UgZXZlbnRzXG4gICAgLy8gc28gd2UgbmVlZCB0byBnZXQgaXQgZnJvbSB0aGUgY29udGV4dCBvZiBgdGhpc2AgYWdhaW5cbiAgICBhcHBseVZhbHVlJDEodGhpcy52Tm9kZSwgZG9tKTtcbn1cbmZ1bmN0aW9uIHByb2Nlc3NTZWxlY3Qodk5vZGUsIGRvbSkge1xuICAgIHZhciBwcm9wcyA9IHZOb2RlLnByb3BzIHx8IEVNUFRZX09CSjtcbiAgICBhcHBseVZhbHVlJDEodk5vZGUsIGRvbSk7XG4gICAgaWYgKGlzQ29udHJvbGxlZCQxKHByb3BzKSkge1xuICAgICAgICB2YXIgc2VsZWN0V3JhcHBlciA9IHdyYXBwZXJzLmdldChkb20pO1xuICAgICAgICBpZiAoIXNlbGVjdFdyYXBwZXIpIHtcbiAgICAgICAgICAgIHNlbGVjdFdyYXBwZXIgPSB7XG4gICAgICAgICAgICAgICAgdk5vZGU6IHZOb2RlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZG9tLm9uY2hhbmdlID0gb25TZWxlY3RDaGFuZ2UuYmluZChzZWxlY3RXcmFwcGVyKTtcbiAgICAgICAgICAgIGRvbS5vbmNoYW5nZS53cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHdyYXBwZXJzLnNldChkb20sIHNlbGVjdFdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdFdyYXBwZXIudk5vZGUgPSB2Tm9kZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGFwcGx5VmFsdWUkMSh2Tm9kZSwgZG9tKSB7XG4gICAgdmFyIHByb3BzID0gdk5vZGUucHJvcHMgfHwgRU1QVFlfT0JKO1xuICAgIGlmIChwcm9wcy5tdWx0aXBsZSAhPT0gZG9tLm11bHRpcGxlKSB7XG4gICAgICAgIGRvbS5tdWx0aXBsZSA9IHByb3BzLm11bHRpcGxlO1xuICAgIH1cbiAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcbiAgICBpZiAoIWlzSW52YWxpZChjaGlsZHJlbikpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG4gICAgICAgIGlmIChpc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUNoaWxkT3B0aW9uR3JvdXAoY2hpbGRyZW5baV0sIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1ZOb2RlKGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgdXBkYXRlQ2hpbGRPcHRpb25Hcm91cChjaGlsZHJlbiwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0NvbnRyb2xsZWQkMihwcm9wcykge1xuICAgIHJldHVybiAhaXNOdWxsT3JVbmRlZihwcm9wcy52YWx1ZSk7XG59XG5mdW5jdGlvbiB3cmFwcGVkT25DaGFuZ2UkMShlKSB7XG4gICAgdmFyIHZOb2RlID0gdGhpcy52Tm9kZTtcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgZXZlbnQgPSBldmVudHMub25DaGFuZ2U7XG4gICAgaWYgKGV2ZW50LmV2ZW50KSB7XG4gICAgICAgIGV2ZW50LmV2ZW50KGV2ZW50LmRhdGEsIGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZXZlbnQoZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gb25UZXh0YXJlYUlucHV0Q2hhbmdlKGUpIHtcbiAgICB2YXIgdk5vZGUgPSB0aGlzLnZOb2RlO1xuICAgIHZhciBldmVudHMgPSB2Tm9kZS5ldmVudHMgfHwgRU1QVFlfT0JKO1xuICAgIHZhciBkb20gPSB2Tm9kZS5kb207XG4gICAgaWYgKGV2ZW50cy5vbklucHV0KSB7XG4gICAgICAgIHZhciBldmVudCA9IGV2ZW50cy5vbklucHV0O1xuICAgICAgICBpZiAoZXZlbnQuZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50KGV2ZW50LmRhdGEsIGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoZXZlbnRzLm9uaW5wdXQpIHtcbiAgICAgICAgZXZlbnRzLm9uaW5wdXQoZSk7XG4gICAgfVxuICAgIC8vIHRoZSB1c2VyIG1heSBoYXZlIHVwZGF0ZWQgdGhlIHZOb2RlIGZyb20gdGhlIGFib3ZlIG9uSW5wdXQgZXZlbnRzXG4gICAgLy8gc28gd2UgbmVlZCB0byBnZXQgaXQgZnJvbSB0aGUgY29udGV4dCBvZiBgdGhpc2AgYWdhaW5cbiAgICBhcHBseVZhbHVlJDIodGhpcy52Tm9kZSwgZG9tKTtcbn1cbmZ1bmN0aW9uIHByb2Nlc3NUZXh0YXJlYSh2Tm9kZSwgZG9tKSB7XG4gICAgdmFyIHByb3BzID0gdk5vZGUucHJvcHMgfHwgRU1QVFlfT0JKO1xuICAgIGFwcGx5VmFsdWUkMih2Tm9kZSwgZG9tKTtcbiAgICB2YXIgdGV4dGFyZWFXcmFwcGVyID0gd3JhcHBlcnMuZ2V0KGRvbSk7XG4gICAgaWYgKGlzQ29udHJvbGxlZCQyKHByb3BzKSkge1xuICAgICAgICBpZiAoIXRleHRhcmVhV3JhcHBlcikge1xuICAgICAgICAgICAgdGV4dGFyZWFXcmFwcGVyID0ge1xuICAgICAgICAgICAgICAgIHZOb2RlOiB2Tm9kZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRvbS5vbmlucHV0ID0gb25UZXh0YXJlYUlucHV0Q2hhbmdlLmJpbmQodGV4dGFyZWFXcmFwcGVyKTtcbiAgICAgICAgICAgIGRvbS5vbmlucHV0LndyYXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgZG9tLm9uY2hhbmdlID0gd3JhcHBlZE9uQ2hhbmdlJDEuYmluZCh0ZXh0YXJlYVdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIGRvbS5vbmNoYW5nZS53cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdyYXBwZXJzLnNldChkb20sIHRleHRhcmVhV3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgdGV4dGFyZWFXcmFwcGVyLnZOb2RlID0gdk5vZGU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBhcHBseVZhbHVlJDIodk5vZGUsIGRvbSkge1xuICAgIHZhciBwcm9wcyA9IHZOb2RlLnByb3BzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgdmFsdWUgPSBwcm9wcy52YWx1ZTtcbiAgICB2YXIgZG9tVmFsdWUgPSBkb20udmFsdWU7XG4gICAgaWYgKGRvbVZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYodmFsdWUpKSB7XG4gICAgICAgICAgICBkb20udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkb21WYWx1ZSAhPT0gJycpIHtcbiAgICAgICAgICAgIGRvbS52YWx1ZSA9ICcnO1xuICAgICAgICB9XG4gICAgfVxufVxuXG52YXIgd3JhcHBlcnMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBwcm9jZXNzRWxlbWVudChmbGFncywgdk5vZGUsIGRvbSkge1xuICAgIGlmIChmbGFncyAmIDUxMiAvKiBJbnB1dEVsZW1lbnQgKi8pIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NJbnB1dCh2Tm9kZSwgZG9tKTtcbiAgICB9XG4gICAgaWYgKGZsYWdzICYgMjA0OCAvKiBTZWxlY3RFbGVtZW50ICovKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzU2VsZWN0KHZOb2RlLCBkb20pO1xuICAgIH1cbiAgICBpZiAoZmxhZ3MgJiAxMDI0IC8qIFRleHRhcmVhRWxlbWVudCAqLykge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc1RleHRhcmVhKHZOb2RlLCBkb20pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHBhdGNoKGxhc3RWTm9kZSwgbmV4dFZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKSB7XG4gICAgaWYgKGxhc3RWTm9kZSAhPT0gbmV4dFZOb2RlKSB7XG4gICAgICAgIHZhciBsYXN0RmxhZ3MgPSBsYXN0Vk5vZGUuZmxhZ3M7XG4gICAgICAgIHZhciBuZXh0RmxhZ3MgPSBuZXh0Vk5vZGUuZmxhZ3M7XG4gICAgICAgIGlmIChuZXh0RmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgIGlmIChsYXN0RmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgICAgICBwYXRjaENvbXBvbmVudChsYXN0Vk5vZGUsIG5leHRWTm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBuZXh0RmxhZ3MgJiA0IC8qIENvbXBvbmVudENsYXNzICovLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlVk5vZGUocGFyZW50RG9tLCBtb3VudENvbXBvbmVudChuZXh0Vk5vZGUsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIG5leHRGbGFncyAmIDQgLyogQ29tcG9uZW50Q2xhc3MgKi8pLCBsYXN0Vk5vZGUsIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5leHRGbGFncyAmIDM5NzAgLyogRWxlbWVudCAqLykge1xuICAgICAgICAgICAgaWYgKGxhc3RGbGFncyAmIDM5NzAgLyogRWxlbWVudCAqLykge1xuICAgICAgICAgICAgICAgIHBhdGNoRWxlbWVudChsYXN0Vk5vZGUsIG5leHRWTm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlVk5vZGUocGFyZW50RG9tLCBtb3VudEVsZW1lbnQobmV4dFZOb2RlLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSwgbGFzdFZOb2RlLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChuZXh0RmxhZ3MgJiAxIC8qIFRleHQgKi8pIHtcbiAgICAgICAgICAgIGlmIChsYXN0RmxhZ3MgJiAxIC8qIFRleHQgKi8pIHtcbiAgICAgICAgICAgICAgICBwYXRjaFRleHQobGFzdFZOb2RlLCBuZXh0Vk5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwbGFjZVZOb2RlKHBhcmVudERvbSwgbW91bnRUZXh0KG5leHRWTm9kZSwgbnVsbCksIGxhc3RWTm9kZSwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV4dEZsYWdzICYgNDA5NiAvKiBWb2lkICovKSB7XG4gICAgICAgICAgICBpZiAobGFzdEZsYWdzICYgNDA5NiAvKiBWb2lkICovKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWb2lkKGxhc3RWTm9kZSwgbmV4dFZOb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcGxhY2VWTm9kZShwYXJlbnREb20sIG1vdW50Vm9pZChuZXh0Vk5vZGUsIG51bGwpLCBsYXN0Vk5vZGUsIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gRXJyb3IgY2FzZTogbW91bnQgbmV3IG9uZSByZXBsYWNpbmcgb2xkIG9uZVxuICAgICAgICAgICAgcmVwbGFjZUxhc3RDaGlsZEFuZFVubW91bnQobGFzdFZOb2RlLCBuZXh0Vk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gdW5tb3VudENoaWxkcmVuKGNoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpIHtcbiAgICBpZiAoaXNWTm9kZShjaGlsZHJlbikpIHtcbiAgICAgICAgdW5tb3VudChjaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIHRydWUsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgcmVtb3ZlQWxsQ2hpbGRyZW4oZG9tLCBjaGlsZHJlbiwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkb20udGV4dENvbnRlbnQgPSAnJztcbiAgICB9XG59XG5mdW5jdGlvbiBwYXRjaEVsZW1lbnQobGFzdFZOb2RlLCBuZXh0Vk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpIHtcbiAgICB2YXIgbmV4dFRhZyA9IG5leHRWTm9kZS50eXBlO1xuICAgIHZhciBsYXN0VGFnID0gbGFzdFZOb2RlLnR5cGU7XG4gICAgaWYgKGxhc3RUYWcgIT09IG5leHRUYWcpIHtcbiAgICAgICAgcmVwbGFjZVdpdGhOZXdOb2RlKGxhc3RWTm9kZSwgbmV4dFZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBkb20gPSBsYXN0Vk5vZGUuZG9tO1xuICAgICAgICB2YXIgbGFzdFByb3BzID0gbGFzdFZOb2RlLnByb3BzO1xuICAgICAgICB2YXIgbmV4dFByb3BzID0gbmV4dFZOb2RlLnByb3BzO1xuICAgICAgICB2YXIgbGFzdENoaWxkcmVuID0gbGFzdFZOb2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgbmV4dENoaWxkcmVuID0gbmV4dFZOb2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgbGFzdEZsYWdzID0gbGFzdFZOb2RlLmZsYWdzO1xuICAgICAgICB2YXIgbmV4dEZsYWdzID0gbmV4dFZOb2RlLmZsYWdzO1xuICAgICAgICB2YXIgbGFzdFJlZiA9IGxhc3RWTm9kZS5yZWY7XG4gICAgICAgIHZhciBuZXh0UmVmID0gbmV4dFZOb2RlLnJlZjtcbiAgICAgICAgdmFyIGxhc3RFdmVudHMgPSBsYXN0Vk5vZGUuZXZlbnRzO1xuICAgICAgICB2YXIgbmV4dEV2ZW50cyA9IG5leHRWTm9kZS5ldmVudHM7XG4gICAgICAgIG5leHRWTm9kZS5kb20gPSBkb207XG4gICAgICAgIGlmIChpc1NWRyB8fCAobmV4dEZsYWdzICYgMTI4IC8qIFN2Z0VsZW1lbnQgKi8pKSB7XG4gICAgICAgICAgICBpc1NWRyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhc3RDaGlsZHJlbiAhPT0gbmV4dENoaWxkcmVuKSB7XG4gICAgICAgICAgICBwYXRjaENoaWxkcmVuKGxhc3RGbGFncywgbmV4dEZsYWdzLCBsYXN0Q2hpbGRyZW4sIG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGhhc0NvbnRyb2xsZWRWYWx1ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoIShuZXh0RmxhZ3MgJiAyIC8qIEh0bWxFbGVtZW50ICovKSkge1xuICAgICAgICAgICAgaGFzQ29udHJvbGxlZFZhbHVlID0gcHJvY2Vzc0VsZW1lbnQobmV4dEZsYWdzLCBuZXh0Vk5vZGUsIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW5saW5lZCBwYXRjaFByb3BzICAtLSBzdGFydHMgLS1cbiAgICAgICAgaWYgKGxhc3RQcm9wcyAhPT0gbmV4dFByb3BzKSB7XG4gICAgICAgICAgICB2YXIgbGFzdFByb3BzT3JFbXB0eSA9IGxhc3RQcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgICAgICAgICB2YXIgbmV4dFByb3BzT3JFbXB0eSA9IG5leHRQcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzT3JFbXB0eSAhPT0gRU1QVFlfT0JKKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBuZXh0UHJvcHNPckVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRvIG5vdCBhZGQgYSBoYXNPd25Qcm9wZXJ0eSBjaGVjayBoZXJlLCBpdCBhZmZlY3RzIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0VmFsdWUgPSBuZXh0UHJvcHNPckVtcHR5W3Byb3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFZhbHVlID0gbGFzdFByb3BzT3JFbXB0eVtwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWYobmV4dFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlUHJvcChwcm9wLCBuZXh0VmFsdWUsIGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaFByb3AocHJvcCwgbGFzdFZhbHVlLCBuZXh0VmFsdWUsIGRvbSwgaXNTVkcsIGhhc0NvbnRyb2xsZWRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGFzdFByb3BzT3JFbXB0eSAhPT0gRU1QVFlfT0JKKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCQxIGluIGxhc3RQcm9wc09yRW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZG8gbm90IGFkZCBhIGhhc093blByb3BlcnR5IGNoZWNrIGhlcmUsIGl0IGFmZmVjdHMgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWYobmV4dFByb3BzT3JFbXB0eVtwcm9wJDFdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlUHJvcChwcm9wJDEsIGxhc3RQcm9wc09yRW1wdHlbcHJvcCQxXSwgZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBpbmxpbmVkIHBhdGNoUHJvcHMgIC0tIGVuZHMgLS1cbiAgICAgICAgaWYgKGxhc3RFdmVudHMgIT09IG5leHRFdmVudHMpIHtcbiAgICAgICAgICAgIHBhdGNoRXZlbnRzKGxhc3RFdmVudHMsIG5leHRFdmVudHMsIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5leHRSZWYpIHtcbiAgICAgICAgICAgIGlmIChsYXN0UmVmICE9PSBuZXh0UmVmIHx8IGlzUmVjeWNsaW5nKSB7XG4gICAgICAgICAgICAgICAgbW91bnRSZWYoZG9tLCBuZXh0UmVmLCBsaWZlY3ljbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gcGF0Y2hDaGlsZHJlbihsYXN0RmxhZ3MsIG5leHRGbGFncywgbGFzdENoaWxkcmVuLCBuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpIHtcbiAgICB2YXIgcGF0Y2hBcnJheSA9IGZhbHNlO1xuICAgIHZhciBwYXRjaEtleWVkID0gZmFsc2U7XG4gICAgaWYgKG5leHRGbGFncyAmIDY0IC8qIEhhc05vbktleWVkQ2hpbGRyZW4gKi8pIHtcbiAgICAgICAgcGF0Y2hBcnJheSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKChsYXN0RmxhZ3MgJiAzMiAvKiBIYXNLZXllZENoaWxkcmVuICovKSAmJiAobmV4dEZsYWdzICYgMzIgLyogSGFzS2V5ZWRDaGlsZHJlbiAqLykpIHtcbiAgICAgICAgcGF0Y2hLZXllZCA9IHRydWU7XG4gICAgICAgIHBhdGNoQXJyYXkgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0ludmFsaWQobmV4dENoaWxkcmVuKSkge1xuICAgICAgICB1bm1vdW50Q2hpbGRyZW4obGFzdENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0ludmFsaWQobGFzdENoaWxkcmVuKSkge1xuICAgICAgICBpZiAoaXNTdHJpbmdPck51bWJlcihuZXh0Q2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBzZXRUZXh0Q29udGVudChkb20sIG5leHRDaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXNBcnJheShuZXh0Q2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgbW91bnRBcnJheUNoaWxkcmVuKG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdW50KG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc1N0cmluZ09yTnVtYmVyKG5leHRDaGlsZHJlbikpIHtcbiAgICAgICAgaWYgKGlzU3RyaW5nT3JOdW1iZXIobGFzdENoaWxkcmVuKSkge1xuICAgICAgICAgICAgdXBkYXRlVGV4dENvbnRlbnQoZG9tLCBuZXh0Q2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdW5tb3VudENoaWxkcmVuKGxhc3RDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIHNldFRleHRDb250ZW50KGRvbSwgbmV4dENoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc0FycmF5KG5leHRDaGlsZHJlbikpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkobGFzdENoaWxkcmVuKSkge1xuICAgICAgICAgICAgcGF0Y2hBcnJheSA9IHRydWU7XG4gICAgICAgICAgICBpZiAoaXNLZXllZChsYXN0Q2hpbGRyZW4sIG5leHRDaGlsZHJlbikpIHtcbiAgICAgICAgICAgICAgICBwYXRjaEtleWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHVubW91bnRDaGlsZHJlbihsYXN0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICBtb3VudEFycmF5Q2hpbGRyZW4obmV4dENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQXJyYXkobGFzdENoaWxkcmVuKSkge1xuICAgICAgICByZW1vdmVBbGxDaGlsZHJlbihkb20sIGxhc3RDaGlsZHJlbiwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgIG1vdW50KG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNWTm9kZShuZXh0Q2hpbGRyZW4pKSB7XG4gICAgICAgIGlmIChpc1ZOb2RlKGxhc3RDaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHBhdGNoKGxhc3RDaGlsZHJlbiwgbmV4dENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHVubW91bnRDaGlsZHJlbihsYXN0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICBtb3VudChuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhdGNoQXJyYXkpIHtcbiAgICAgICAgaWYgKHBhdGNoS2V5ZWQpIHtcbiAgICAgICAgICAgIHBhdGNoS2V5ZWRDaGlsZHJlbihsYXN0Q2hpbGRyZW4sIG5leHRDaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXRjaE5vbktleWVkQ2hpbGRyZW4obGFzdENoaWxkcmVuLCBuZXh0Q2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gcGF0Y2hDb21wb25lbnQobGFzdFZOb2RlLCBuZXh0Vk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNDbGFzcywgaXNSZWN5Y2xpbmcpIHtcbiAgICB2YXIgbGFzdFR5cGUgPSBsYXN0Vk5vZGUudHlwZTtcbiAgICB2YXIgbmV4dFR5cGUgPSBuZXh0Vk5vZGUudHlwZTtcbiAgICB2YXIgbmV4dFByb3BzID0gbmV4dFZOb2RlLnByb3BzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgbGFzdEtleSA9IGxhc3RWTm9kZS5rZXk7XG4gICAgdmFyIG5leHRLZXkgPSBuZXh0Vk5vZGUua2V5O1xuICAgIHZhciBkZWZhdWx0UHJvcHMgPSBuZXh0VHlwZS5kZWZhdWx0UHJvcHM7XG4gICAgaWYgKCFpc1VuZGVmaW5lZChkZWZhdWx0UHJvcHMpKSB7XG4gICAgICAgIGNvcHlQcm9wc1RvKGRlZmF1bHRQcm9wcywgbmV4dFByb3BzKTtcbiAgICAgICAgbmV4dFZOb2RlLnByb3BzID0gbmV4dFByb3BzO1xuICAgIH1cbiAgICBpZiAobGFzdFR5cGUgIT09IG5leHRUeXBlKSB7XG4gICAgICAgIGlmIChpc0NsYXNzKSB7XG4gICAgICAgICAgICByZXBsYWNlV2l0aE5ld05vZGUobGFzdFZOb2RlLCBuZXh0Vk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGxhc3RJbnB1dCA9IGxhc3RWTm9kZS5jaGlsZHJlbi5fbGFzdElucHV0IHx8IGxhc3RWTm9kZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIHZhciBuZXh0SW5wdXQgPSBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50SW5wdXQobmV4dFZOb2RlLCBuZXh0VHlwZSwgbmV4dFByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHVubW91bnQobGFzdFZOb2RlLCBudWxsLCBsaWZlY3ljbGUsIGZhbHNlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICBwYXRjaChsYXN0SW5wdXQsIG5leHRJbnB1dCwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICB2YXIgZG9tID0gbmV4dFZOb2RlLmRvbSA9IG5leHRJbnB1dC5kb207XG4gICAgICAgICAgICBuZXh0Vk5vZGUuY2hpbGRyZW4gPSBuZXh0SW5wdXQ7XG4gICAgICAgICAgICBtb3VudEZ1bmN0aW9uYWxDb21wb25lbnRDYWxsYmFja3MobmV4dFZOb2RlLnJlZiwgZG9tLCBsaWZlY3ljbGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoaXNDbGFzcykge1xuICAgICAgICAgICAgaWYgKGxhc3RLZXkgIT09IG5leHRLZXkpIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlV2l0aE5ld05vZGUobGFzdFZOb2RlLCBuZXh0Vk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IGxhc3RWTm9kZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5fdW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTnVsbChwYXJlbnREb20pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXBsYWNlQ2hpbGQocGFyZW50RG9tLCBtb3VudENvbXBvbmVudChuZXh0Vk5vZGUsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIG5leHRWTm9kZS5mbGFncyAmIDQgLyogQ29tcG9uZW50Q2xhc3MgKi8pLCBsYXN0Vk5vZGUuZG9tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsYXN0U3RhdGUgPSBpbnN0YW5jZS5zdGF0ZTtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFN0YXRlID0gaW5zdGFuY2Uuc3RhdGU7XG4gICAgICAgICAgICAgICAgdmFyIGxhc3RQcm9wcyA9IGluc3RhbmNlLnByb3BzO1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZENvbnRleHQgPSBpbnN0YW5jZS5nZXRDaGlsZENvbnRleHQoKTtcbiAgICAgICAgICAgICAgICBuZXh0Vk5vZGUuY2hpbGRyZW4gPSBpbnN0YW5jZTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5faXNTVkcgPSBpc1NWRztcbiAgICAgICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYoY2hpbGRDb250ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZENvbnRleHQgPSBPYmplY3QuYXNzaWduKHt9LCBjb250ZXh0LCBjaGlsZENvbnRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRDb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGxhc3RJbnB1dCQxID0gaW5zdGFuY2UuX2xhc3RJbnB1dDtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dElucHV0JDEgPSBpbnN0YW5jZS5fdXBkYXRlQ29tcG9uZW50KGxhc3RTdGF0ZSwgbmV4dFN0YXRlLCBsYXN0UHJvcHMsIG5leHRQcm9wcywgY29udGV4dCwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB2YXIgZGlkVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2hpbGRDb250ZXh0ID0gY2hpbGRDb250ZXh0O1xuICAgICAgICAgICAgICAgIGlmIChpc0ludmFsaWQobmV4dElucHV0JDEpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRJbnB1dCQxID0gY3JlYXRlVm9pZFZOb2RlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5leHRJbnB1dCQxID09PSBOT19PUCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMSA9IGxhc3RJbnB1dCQxO1xuICAgICAgICAgICAgICAgICAgICBkaWRVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihuZXh0SW5wdXQkMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dElucHV0JDEgPSBjcmVhdGVUZXh0Vk5vZGUobmV4dElucHV0JDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0FycmF5KG5leHRJbnB1dCQxKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcignYSB2YWxpZCBJbmZlcm5vIFZOb2RlIChvciBudWxsKSBtdXN0IGJlIHJldHVybmVkIGZyb20gYSBjb21wb25lbnQgcmVuZGVyLiBZb3UgbWF5IGhhdmUgcmV0dXJuZWQgYW4gYXJyYXkgb3IgYW4gaW52YWxpZCBvYmplY3QuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc09iamVjdChuZXh0SW5wdXQkMSkgJiYgbmV4dElucHV0JDEuZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRJbnB1dCQxID0gY2xvbmVWTm9kZShuZXh0SW5wdXQkMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXh0SW5wdXQkMS5mbGFncyAmIDI4IC8qIENvbXBvbmVudCAqLykge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMS5wYXJlbnRWTm9kZSA9IG5leHRWTm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobGFzdElucHV0JDEuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdElucHV0JDEucGFyZW50Vk5vZGUgPSBuZXh0Vk5vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9sYXN0SW5wdXQgPSBuZXh0SW5wdXQkMTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fdk5vZGUgPSBuZXh0Vk5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKGRpZFVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFzdFVubW91bnQgPSBsaWZlY3ljbGUuZmFzdFVubW91bnQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJMaWZlY3ljbGUgPSBpbnN0YW5jZS5fbGlmZWN5Y2xlO1xuICAgICAgICAgICAgICAgICAgICBsaWZlY3ljbGUuZmFzdFVubW91bnQgPSBzdWJMaWZlY3ljbGUuZmFzdFVubW91bnQ7XG4gICAgICAgICAgICAgICAgICAgIHBhdGNoKGxhc3RJbnB1dCQxLCBuZXh0SW5wdXQkMSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNoaWxkQ29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgc3ViTGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gbGlmZWN5Y2xlLmZhc3RVbm1vdW50O1xuICAgICAgICAgICAgICAgICAgICBsaWZlY3ljbGUuZmFzdFVubW91bnQgPSBmYXN0VW5tb3VudDtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuY29tcG9uZW50RGlkVXBkYXRlKGxhc3RQcm9wcywgbGFzdFN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5hZnRlclVwZGF0ZSAmJiBvcHRpb25zLmFmdGVyVXBkYXRlKG5leHRWTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZmluZERPTU5vZGVFbmFibGVkICYmIGNvbXBvbmVudFRvRE9NTm9kZU1hcC5zZXQoaW5zdGFuY2UsIG5leHRJbnB1dCQxLmRvbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5leHRWTm9kZS5kb20gPSBuZXh0SW5wdXQkMS5kb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBsYXN0UHJvcHMkMSA9IGxhc3RWTm9kZS5wcm9wcztcbiAgICAgICAgICAgIHZhciBuZXh0SG9va3MgPSBuZXh0Vk5vZGUucmVmO1xuICAgICAgICAgICAgdmFyIG5leHRIb29rc0RlZmluZWQgPSAhaXNOdWxsT3JVbmRlZihuZXh0SG9va3MpO1xuICAgICAgICAgICAgdmFyIGxhc3RJbnB1dCQyID0gbGFzdFZOb2RlLmNoaWxkcmVuO1xuICAgICAgICAgICAgdmFyIG5leHRJbnB1dCQyID0gbGFzdElucHV0JDI7XG4gICAgICAgICAgICBuZXh0Vk5vZGUuZG9tID0gbGFzdFZOb2RlLmRvbTtcbiAgICAgICAgICAgIG5leHRWTm9kZS5jaGlsZHJlbiA9IGxhc3RJbnB1dCQyO1xuICAgICAgICAgICAgaWYgKGxhc3RLZXkgIT09IG5leHRLZXkpIHtcbiAgICAgICAgICAgICAgICBzaG91bGRVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRIb29rc0RlZmluZWQgJiYgIWlzTnVsbE9yVW5kZWYobmV4dEhvb2tzLm9uQ29tcG9uZW50U2hvdWxkVXBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRVcGRhdGUgPSBuZXh0SG9va3Mub25Db21wb25lbnRTaG91bGRVcGRhdGUobGFzdFByb3BzJDEsIG5leHRQcm9wcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3VsZFVwZGF0ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV4dEhvb2tzRGVmaW5lZCAmJiAhaXNOdWxsT3JVbmRlZihuZXh0SG9va3Mub25Db21wb25lbnRXaWxsVXBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SG9va3Mub25Db21wb25lbnRXaWxsVXBkYXRlKGxhc3RQcm9wcyQxLCBuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMiA9IG5leHRUeXBlKG5leHRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzSW52YWxpZChuZXh0SW5wdXQkMikpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dElucHV0JDIgPSBjcmVhdGVWb2lkVk5vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihuZXh0SW5wdXQkMikgJiYgbmV4dElucHV0JDIgIT09IE5PX09QKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRJbnB1dCQyID0gY3JlYXRlVGV4dFZOb2RlKG5leHRJbnB1dCQyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNBcnJheShuZXh0SW5wdXQkMikpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoJ2EgdmFsaWQgSW5mZXJubyBWTm9kZSAob3IgbnVsbCkgbXVzdCBiZSByZXR1cm5lZCBmcm9tIGEgY29tcG9uZW50IHJlbmRlci4gWW91IG1heSBoYXZlIHJldHVybmVkIGFuIGFycmF5IG9yIGFuIGludmFsaWQgb2JqZWN0LicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNPYmplY3QobmV4dElucHV0JDIpICYmIG5leHRJbnB1dCQyLmRvbSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMiA9IGNsb25lVk5vZGUobmV4dElucHV0JDIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV4dElucHV0JDIgIT09IE5PX09QKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGNoKGxhc3RJbnB1dCQyLCBuZXh0SW5wdXQkMiwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICAgICAgICAgIG5leHRWTm9kZS5jaGlsZHJlbiA9IG5leHRJbnB1dCQyO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEhvb2tzRGVmaW5lZCAmJiAhaXNOdWxsT3JVbmRlZihuZXh0SG9va3Mub25Db21wb25lbnREaWRVcGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SG9va3Mub25Db21wb25lbnREaWRVcGRhdGUobGFzdFByb3BzJDEsIG5leHRQcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV4dFZOb2RlLmRvbSA9IG5leHRJbnB1dCQyLmRvbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmV4dElucHV0JDIuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgICAgICAgICBuZXh0SW5wdXQkMi5wYXJlbnRWTm9kZSA9IG5leHRWTm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxhc3RJbnB1dCQyLmZsYWdzICYgMjggLyogQ29tcG9uZW50ICovKSB7XG4gICAgICAgICAgICAgICAgbGFzdElucHV0JDIucGFyZW50Vk5vZGUgPSBuZXh0Vk5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gcGF0Y2hUZXh0KGxhc3RWTm9kZSwgbmV4dFZOb2RlKSB7XG4gICAgdmFyIG5leHRUZXh0ID0gbmV4dFZOb2RlLmNoaWxkcmVuO1xuICAgIHZhciBkb20gPSBsYXN0Vk5vZGUuZG9tO1xuICAgIG5leHRWTm9kZS5kb20gPSBkb207XG4gICAgaWYgKGxhc3RWTm9kZS5jaGlsZHJlbiAhPT0gbmV4dFRleHQpIHtcbiAgICAgICAgZG9tLm5vZGVWYWx1ZSA9IG5leHRUZXh0O1xuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoVm9pZChsYXN0Vk5vZGUsIG5leHRWTm9kZSkge1xuICAgIG5leHRWTm9kZS5kb20gPSBsYXN0Vk5vZGUuZG9tO1xufVxuZnVuY3Rpb24gcGF0Y2hOb25LZXllZENoaWxkcmVuKGxhc3RDaGlsZHJlbiwgbmV4dENoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKSB7XG4gICAgdmFyIGxhc3RDaGlsZHJlbkxlbmd0aCA9IGxhc3RDaGlsZHJlbi5sZW5ndGg7XG4gICAgdmFyIG5leHRDaGlsZHJlbkxlbmd0aCA9IG5leHRDaGlsZHJlbi5sZW5ndGg7XG4gICAgdmFyIGNvbW1vbkxlbmd0aCA9IGxhc3RDaGlsZHJlbkxlbmd0aCA+IG5leHRDaGlsZHJlbkxlbmd0aCA/IG5leHRDaGlsZHJlbkxlbmd0aCA6IGxhc3RDaGlsZHJlbkxlbmd0aDtcbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPCBjb21tb25MZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dENoaWxkID0gbmV4dENoaWxkcmVuW2ldO1xuICAgICAgICBpZiAobmV4dENoaWxkLmRvbSkge1xuICAgICAgICAgICAgbmV4dENoaWxkID0gbmV4dENoaWxkcmVuW2ldID0gY2xvbmVWTm9kZShuZXh0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHBhdGNoKGxhc3RDaGlsZHJlbltpXSwgbmV4dENoaWxkLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG4gICAgaWYgKGxhc3RDaGlsZHJlbkxlbmd0aCA8IG5leHRDaGlsZHJlbkxlbmd0aCkge1xuICAgICAgICBmb3IgKGkgPSBjb21tb25MZW5ndGg7IGkgPCBuZXh0Q2hpbGRyZW5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5leHRDaGlsZCQxID0gbmV4dENoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKG5leHRDaGlsZCQxLmRvbSkge1xuICAgICAgICAgICAgICAgIG5leHRDaGlsZCQxID0gbmV4dENoaWxkcmVuW2ldID0gY2xvbmVWTm9kZShuZXh0Q2hpbGQkMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcHBlbmRDaGlsZChkb20sIG1vdW50KG5leHRDaGlsZCQxLCBudWxsLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobmV4dENoaWxkcmVuTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlbW92ZUFsbENoaWxkcmVuKGRvbSwgbGFzdENoaWxkcmVuLCBsaWZlY3ljbGUsIGlzUmVjeWNsaW5nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobGFzdENoaWxkcmVuTGVuZ3RoID4gbmV4dENoaWxkcmVuTGVuZ3RoKSB7XG4gICAgICAgIGZvciAoaSA9IGNvbW1vbkxlbmd0aDsgaSA8IGxhc3RDaGlsZHJlbkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB1bm1vdW50KGxhc3RDaGlsZHJlbltpXSwgZG9tLCBsaWZlY3ljbGUsIGZhbHNlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBwYXRjaEtleWVkQ2hpbGRyZW4oYSwgYiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc1JlY3ljbGluZykge1xuICAgIHZhciBhTGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgdmFyIGJMZW5ndGggPSBiLmxlbmd0aDtcbiAgICB2YXIgYUVuZCA9IGFMZW5ndGggLSAxO1xuICAgIHZhciBiRW5kID0gYkxlbmd0aCAtIDE7XG4gICAgdmFyIGFTdGFydCA9IDA7XG4gICAgdmFyIGJTdGFydCA9IDA7XG4gICAgdmFyIGk7XG4gICAgdmFyIGo7XG4gICAgdmFyIGFOb2RlO1xuICAgIHZhciBiTm9kZTtcbiAgICB2YXIgbmV4dE5vZGU7XG4gICAgdmFyIG5leHRQb3M7XG4gICAgdmFyIG5vZGU7XG4gICAgaWYgKGFMZW5ndGggPT09IDApIHtcbiAgICAgICAgaWYgKGJMZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIG1vdW50QXJyYXlDaGlsZHJlbihiLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoYkxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZW1vdmVBbGxDaGlsZHJlbihkb20sIGEsIGxpZmVjeWNsZSwgaXNSZWN5Y2xpbmcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBhU3RhcnROb2RlID0gYVthU3RhcnRdO1xuICAgIHZhciBiU3RhcnROb2RlID0gYltiU3RhcnRdO1xuICAgIHZhciBhRW5kTm9kZSA9IGFbYUVuZF07XG4gICAgdmFyIGJFbmROb2RlID0gYltiRW5kXTtcbiAgICBpZiAoYlN0YXJ0Tm9kZS5kb20pIHtcbiAgICAgICAgYltiU3RhcnRdID0gYlN0YXJ0Tm9kZSA9IGNsb25lVk5vZGUoYlN0YXJ0Tm9kZSk7XG4gICAgfVxuICAgIGlmIChiRW5kTm9kZS5kb20pIHtcbiAgICAgICAgYltiRW5kXSA9IGJFbmROb2RlID0gY2xvbmVWTm9kZShiRW5kTm9kZSk7XG4gICAgfVxuICAgIC8vIFN0ZXAgMVxuICAgIC8qIGVzbGludCBuby1jb25zdGFudC1jb25kaXRpb246IDAgKi9cbiAgICBvdXRlcjogd2hpbGUgKHRydWUpIHtcbiAgICAgICAgLy8gU3luYyBub2RlcyB3aXRoIHRoZSBzYW1lIGtleSBhdCB0aGUgYmVnaW5uaW5nLlxuICAgICAgICB3aGlsZSAoYVN0YXJ0Tm9kZS5rZXkgPT09IGJTdGFydE5vZGUua2V5KSB7XG4gICAgICAgICAgICBwYXRjaChhU3RhcnROb2RlLCBiU3RhcnROb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIGFTdGFydCsrO1xuICAgICAgICAgICAgYlN0YXJ0Kys7XG4gICAgICAgICAgICBpZiAoYVN0YXJ0ID4gYUVuZCB8fCBiU3RhcnQgPiBiRW5kKSB7XG4gICAgICAgICAgICAgICAgYnJlYWsgb3V0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhU3RhcnROb2RlID0gYVthU3RhcnRdO1xuICAgICAgICAgICAgYlN0YXJ0Tm9kZSA9IGJbYlN0YXJ0XTtcbiAgICAgICAgICAgIGlmIChiU3RhcnROb2RlLmRvbSkge1xuICAgICAgICAgICAgICAgIGJbYlN0YXJ0XSA9IGJTdGFydE5vZGUgPSBjbG9uZVZOb2RlKGJTdGFydE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFN5bmMgbm9kZXMgd2l0aCB0aGUgc2FtZSBrZXkgYXQgdGhlIGVuZC5cbiAgICAgICAgd2hpbGUgKGFFbmROb2RlLmtleSA9PT0gYkVuZE5vZGUua2V5KSB7XG4gICAgICAgICAgICBwYXRjaChhRW5kTm9kZSwgYkVuZE5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgYUVuZC0tO1xuICAgICAgICAgICAgYkVuZC0tO1xuICAgICAgICAgICAgaWYgKGFTdGFydCA+IGFFbmQgfHwgYlN0YXJ0ID4gYkVuZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrIG91dGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYUVuZE5vZGUgPSBhW2FFbmRdO1xuICAgICAgICAgICAgYkVuZE5vZGUgPSBiW2JFbmRdO1xuICAgICAgICAgICAgaWYgKGJFbmROb2RlLmRvbSkge1xuICAgICAgICAgICAgICAgIGJbYkVuZF0gPSBiRW5kTm9kZSA9IGNsb25lVk5vZGUoYkVuZE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE1vdmUgYW5kIHN5bmMgbm9kZXMgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAgICBpZiAoYUVuZE5vZGUua2V5ID09PSBiU3RhcnROb2RlLmtleSkge1xuICAgICAgICAgICAgcGF0Y2goYUVuZE5vZGUsIGJTdGFydE5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgaW5zZXJ0T3JBcHBlbmQoZG9tLCBiU3RhcnROb2RlLmRvbSwgYVN0YXJ0Tm9kZS5kb20pO1xuICAgICAgICAgICAgYUVuZC0tO1xuICAgICAgICAgICAgYlN0YXJ0Kys7XG4gICAgICAgICAgICBhRW5kTm9kZSA9IGFbYUVuZF07XG4gICAgICAgICAgICBiU3RhcnROb2RlID0gYltiU3RhcnRdO1xuICAgICAgICAgICAgaWYgKGJTdGFydE5vZGUuZG9tKSB7XG4gICAgICAgICAgICAgICAgYltiU3RhcnRdID0gYlN0YXJ0Tm9kZSA9IGNsb25lVk5vZGUoYlN0YXJ0Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNb3ZlIGFuZCBzeW5jIG5vZGVzIGZyb20gbGVmdCB0byByaWdodC5cbiAgICAgICAgaWYgKGFTdGFydE5vZGUua2V5ID09PSBiRW5kTm9kZS5rZXkpIHtcbiAgICAgICAgICAgIHBhdGNoKGFTdGFydE5vZGUsIGJFbmROb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgIG5leHRQb3MgPSBiRW5kICsgMTtcbiAgICAgICAgICAgIG5leHROb2RlID0gbmV4dFBvcyA8IGIubGVuZ3RoID8gYltuZXh0UG9zXS5kb20gOiBudWxsO1xuICAgICAgICAgICAgaW5zZXJ0T3JBcHBlbmQoZG9tLCBiRW5kTm9kZS5kb20sIG5leHROb2RlKTtcbiAgICAgICAgICAgIGFTdGFydCsrO1xuICAgICAgICAgICAgYkVuZC0tO1xuICAgICAgICAgICAgYVN0YXJ0Tm9kZSA9IGFbYVN0YXJ0XTtcbiAgICAgICAgICAgIGJFbmROb2RlID0gYltiRW5kXTtcbiAgICAgICAgICAgIGlmIChiRW5kTm9kZS5kb20pIHtcbiAgICAgICAgICAgICAgICBiW2JFbmRdID0gYkVuZE5vZGUgPSBjbG9uZVZOb2RlKGJFbmROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoYVN0YXJ0ID4gYUVuZCkge1xuICAgICAgICBpZiAoYlN0YXJ0IDw9IGJFbmQpIHtcbiAgICAgICAgICAgIG5leHRQb3MgPSBiRW5kICsgMTtcbiAgICAgICAgICAgIG5leHROb2RlID0gbmV4dFBvcyA8IGIubGVuZ3RoID8gYltuZXh0UG9zXS5kb20gOiBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKGJTdGFydCA8PSBiRW5kKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGJbYlN0YXJ0XTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kb20pIHtcbiAgICAgICAgICAgICAgICAgICAgYltiU3RhcnRdID0gbm9kZSA9IGNsb25lVk5vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJTdGFydCsrO1xuICAgICAgICAgICAgICAgIGluc2VydE9yQXBwZW5kKGRvbSwgbW91bnQobm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyksIG5leHROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiU3RhcnQgPiBiRW5kKSB7XG4gICAgICAgIHdoaWxlIChhU3RhcnQgPD0gYUVuZCkge1xuICAgICAgICAgICAgdW5tb3VudChhW2FTdGFydCsrXSwgZG9tLCBsaWZlY3ljbGUsIGZhbHNlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGFMZW5ndGggPSBhRW5kIC0gYVN0YXJ0ICsgMTtcbiAgICAgICAgYkxlbmd0aCA9IGJFbmQgLSBiU3RhcnQgKyAxO1xuICAgICAgICB2YXIgYU51bGxhYmxlID0gYTtcbiAgICAgICAgdmFyIHNvdXJjZXMgPSBuZXcgQXJyYXkoYkxlbmd0aCk7XG4gICAgICAgIC8vIE1hcmsgYWxsIG5vZGVzIGFzIGluc2VydGVkLlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb3VyY2VzW2ldID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1vdmVkID0gZmFsc2U7XG4gICAgICAgIHZhciBwb3MgPSAwO1xuICAgICAgICB2YXIgcGF0Y2hlZCA9IDA7XG4gICAgICAgIGlmICgoYkxlbmd0aCA8PSA0KSB8fCAoYUxlbmd0aCAqIGJMZW5ndGggPD0gMTYpKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSBhU3RhcnQ7IGkgPD0gYUVuZDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYU5vZGUgPSBhW2ldO1xuICAgICAgICAgICAgICAgIGlmIChwYXRjaGVkIDwgYkxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSBiU3RhcnQ7IGogPD0gYkVuZDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiTm9kZSA9IGJbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYU5vZGUua2V5ID09PSBiTm9kZS5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VzW2ogLSBiU3RhcnRdID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zID4gaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYk5vZGUuZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJbal0gPSBiTm9kZSA9IGNsb25lVk5vZGUoYk5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaChhTm9kZSwgYk5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNSZWN5Y2xpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhTnVsbGFibGVbaV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGtleUluZGV4ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgZm9yIChpID0gYlN0YXJ0OyBpIDw9IGJFbmQ7IGkrKykge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBiW2ldO1xuICAgICAgICAgICAgICAgIGtleUluZGV4LnNldChub2RlLmtleSwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSBhU3RhcnQ7IGkgPD0gYUVuZDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYU5vZGUgPSBhW2ldO1xuICAgICAgICAgICAgICAgIGlmIChwYXRjaGVkIDwgYkxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBqID0ga2V5SW5kZXguZ2V0KGFOb2RlLmtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNVbmRlZmluZWQoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJOb2RlID0gYltqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZXNbaiAtIGJTdGFydF0gPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA+IGopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJOb2RlLmRvbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJbal0gPSBiTm9kZSA9IGNsb25lVk5vZGUoYk5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2goYU5vZGUsIGJOb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGFOdWxsYWJsZVtpXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFMZW5ndGggPT09IGEubGVuZ3RoICYmIHBhdGNoZWQgPT09IDApIHtcbiAgICAgICAgICAgIHJlbW92ZUFsbENoaWxkcmVuKGRvbSwgYSwgbGlmZWN5Y2xlLCBpc1JlY3ljbGluZyk7XG4gICAgICAgICAgICB3aGlsZSAoYlN0YXJ0IDwgYkxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBiW2JTdGFydF07XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGJbYlN0YXJ0XSA9IG5vZGUgPSBjbG9uZVZOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiU3RhcnQrKztcbiAgICAgICAgICAgICAgICBpbnNlcnRPckFwcGVuZChkb20sIG1vdW50KG5vZGUsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGkgPSBhTGVuZ3RoIC0gcGF0Y2hlZDtcbiAgICAgICAgICAgIHdoaWxlIChpID4gMCkge1xuICAgICAgICAgICAgICAgIGFOb2RlID0gYU51bGxhYmxlW2FTdGFydCsrXTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTnVsbChhTm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5tb3VudChhTm9kZSwgZG9tLCBsaWZlY3ljbGUsIHRydWUsIGlzUmVjeWNsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb3ZlZCkge1xuICAgICAgICAgICAgICAgIHZhciBzZXEgPSBsaXNfYWxnb3JpdGhtKHNvdXJjZXMpO1xuICAgICAgICAgICAgICAgIGogPSBzZXEubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBiTGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZXNbaV0gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSBpICsgYlN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSA9IGJbcG9zXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmRvbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJbcG9zXSA9IG5vZGUgPSBjbG9uZVZOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBvcyA9IHBvcyArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Tm9kZSA9IG5leHRQb3MgPCBiLmxlbmd0aCA/IGJbbmV4dFBvc10uZG9tIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydE9yQXBwZW5kKGRvbSwgbW91bnQobm9kZSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSwgbmV4dE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPCAwIHx8IGkgIT09IHNlcVtqXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IGkgKyBiU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSA9IGJbcG9zXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0UG9zID0gcG9zICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Tm9kZSA9IG5leHRQb3MgPCBiLmxlbmd0aCA/IGJbbmV4dFBvc10uZG9tIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRPckFwcGVuZChkb20sIG5vZGUuZG9tLCBuZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwYXRjaGVkICE9PSBiTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gYkxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VzW2ldID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0gaSArIGJTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgPSBiW3Bvc107XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5kb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiW3Bvc10gPSBub2RlID0gY2xvbmVWTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQb3MgPSBwb3MgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBuZXh0UG9zIDwgYi5sZW5ndGggPyBiW25leHRQb3NdLmRvbSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRPckFwcGVuZChkb20sIG1vdW50KG5vZGUsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpLCBuZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb25nZXN0X2luY3JlYXNpbmdfc3Vic2VxdWVuY2VcbmZ1bmN0aW9uIGxpc19hbGdvcml0aG0oYSkge1xuICAgIHZhciBwID0gYS5zbGljZSgwKTtcbiAgICB2YXIgcmVzdWx0ID0gWzBdO1xuICAgIHZhciBpO1xuICAgIHZhciBqO1xuICAgIHZhciB1O1xuICAgIHZhciB2O1xuICAgIHZhciBjO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhW2ldID09PSAtMSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaiA9IHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChhW2pdIDwgYVtpXSkge1xuICAgICAgICAgICAgcFtpXSA9IGo7XG4gICAgICAgICAgICByZXN1bHQucHVzaChpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHUgPSAwO1xuICAgICAgICB2ID0gcmVzdWx0Lmxlbmd0aCAtIDE7XG4gICAgICAgIHdoaWxlICh1IDwgdikge1xuICAgICAgICAgICAgYyA9ICgodSArIHYpIC8gMikgfCAwO1xuICAgICAgICAgICAgaWYgKGFbcmVzdWx0W2NdXSA8IGFbaV0pIHtcbiAgICAgICAgICAgICAgICB1ID0gYyArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2ID0gYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYVtpXSA8IGFbcmVzdWx0W3VdXSkge1xuICAgICAgICAgICAgaWYgKHUgPiAwKSB7XG4gICAgICAgICAgICAgICAgcFtpXSA9IHJlc3VsdFt1IC0gMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbdV0gPSBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHUgPSByZXN1bHQubGVuZ3RoO1xuICAgIHYgPSByZXN1bHRbdSAtIDFdO1xuICAgIHdoaWxlICh1LS0gPiAwKSB7XG4gICAgICAgIHJlc3VsdFt1XSA9IHY7XG4gICAgICAgIHYgPSBwW3ZdO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gcGF0Y2hQcm9wKHByb3AsIGxhc3RWYWx1ZSwgbmV4dFZhbHVlLCBkb20sIGlzU1ZHLCBoYXNDb250cm9sbGVkVmFsdWUpIHtcbiAgICBpZiAoc2tpcFByb3BzW3Byb3BdIHx8IGhhc0NvbnRyb2xsZWRWYWx1ZSAmJiBwcm9wID09PSAndmFsdWUnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGJvb2xlYW5Qcm9wc1twcm9wXSkge1xuICAgICAgICBkb21bcHJvcF0gPSAhIW5leHRWYWx1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc3RyaWN0UHJvcHNbcHJvcF0pIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXNOdWxsT3JVbmRlZihuZXh0VmFsdWUpID8gJycgOiBuZXh0VmFsdWU7XG4gICAgICAgIGlmIChkb21bcHJvcF0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBkb21bcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChsYXN0VmFsdWUgIT09IG5leHRWYWx1ZSkge1xuICAgICAgICBpZiAoaXNBdHRyQW5FdmVudChwcm9wKSkge1xuICAgICAgICAgICAgcGF0Y2hFdmVudChwcm9wLCBsYXN0VmFsdWUsIG5leHRWYWx1ZSwgZG9tKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc051bGxPclVuZGVmKG5leHRWYWx1ZSkpIHtcbiAgICAgICAgICAgIGRvbS5yZW1vdmVBdHRyaWJ1dGUocHJvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocHJvcCA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgICAgICAgIGlmIChpc1NWRykge1xuICAgICAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgbmV4dFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbS5jbGFzc05hbWUgPSBuZXh0VmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocHJvcCA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgcGF0Y2hTdHlsZShsYXN0VmFsdWUsIG5leHRWYWx1ZSwgZG9tKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwcm9wID09PSAnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnKSB7XG4gICAgICAgICAgICB2YXIgbGFzdEh0bWwgPSBsYXN0VmFsdWUgJiYgbGFzdFZhbHVlLl9faHRtbDtcbiAgICAgICAgICAgIHZhciBuZXh0SHRtbCA9IG5leHRWYWx1ZSAmJiBuZXh0VmFsdWUuX19odG1sO1xuICAgICAgICAgICAgaWYgKGxhc3RIdG1sICE9PSBuZXh0SHRtbCkge1xuICAgICAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZihuZXh0SHRtbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tLmlubmVySFRNTCA9IG5leHRIdG1sO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBkZWh5cGhlblByb3A7XG4gICAgICAgICAgICBpZiAoZGVoeXBoZW5Qcm9wc1twcm9wXSkge1xuICAgICAgICAgICAgICAgIGRlaHlwaGVuUHJvcCA9IGRlaHlwaGVuUHJvcHNbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc1NWRyAmJiBwcm9wLm1hdGNoKHByb2JhYmx5S2ViYWJQcm9wcykpIHtcbiAgICAgICAgICAgICAgICBkZWh5cGhlblByb3AgPSBwcm9wLnJlcGxhY2UoLyhbYS16XSkoW0EtWl18MSkvZywga2ViYWJpemUpO1xuICAgICAgICAgICAgICAgIGRlaHlwaGVuUHJvcHNbcHJvcF0gPSBkZWh5cGhlblByb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWh5cGhlblByb3AgPSBwcm9wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5zID0gbmFtZXNwYWNlc1twcm9wXTtcbiAgICAgICAgICAgIGlmIChucykge1xuICAgICAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGVOUyhucywgZGVoeXBoZW5Qcm9wLCBuZXh0VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9tLnNldEF0dHJpYnV0ZShkZWh5cGhlblByb3AsIG5leHRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBwYXRjaEV2ZW50cyhsYXN0RXZlbnRzLCBuZXh0RXZlbnRzLCBkb20pIHtcbiAgICBsYXN0RXZlbnRzID0gbGFzdEV2ZW50cyB8fCBFTVBUWV9PQko7XG4gICAgbmV4dEV2ZW50cyA9IG5leHRFdmVudHMgfHwgRU1QVFlfT0JKO1xuICAgIGlmIChuZXh0RXZlbnRzICE9PSBFTVBUWV9PQkopIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBuZXh0RXZlbnRzKSB7XG4gICAgICAgICAgICAvLyBkbyBub3QgYWRkIGEgaGFzT3duUHJvcGVydHkgY2hlY2sgaGVyZSwgaXQgYWZmZWN0cyBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgcGF0Y2hFdmVudChuYW1lLCBsYXN0RXZlbnRzW25hbWVdLCBuZXh0RXZlbnRzW25hbWVdLCBkb20pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChsYXN0RXZlbnRzICE9PSBFTVBUWV9PQkopIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSQxIGluIGxhc3RFdmVudHMpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdCBhZGQgYSBoYXNPd25Qcm9wZXJ0eSBjaGVjayBoZXJlLCBpdCBhZmZlY3RzIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZihuZXh0RXZlbnRzW25hbWUkMV0pKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hFdmVudChuYW1lJDEsIGxhc3RFdmVudHNbbmFtZSQxXSwgbnVsbCwgZG9tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoRXZlbnQobmFtZSwgbGFzdFZhbHVlLCBuZXh0VmFsdWUsIGRvbSkge1xuICAgIGlmIChsYXN0VmFsdWUgIT09IG5leHRWYWx1ZSkge1xuICAgICAgICB2YXIgbmFtZUxvd2VyQ2FzZSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdmFyIGRvbUV2ZW50ID0gZG9tW25hbWVMb3dlckNhc2VdO1xuICAgICAgICAvLyBpZiB0aGUgZnVuY3Rpb24gaXMgd3JhcHBlZCwgdGhhdCBtZWFucyBpdCdzIGJlZW4gY29udHJvbGxlZCBieSBhIHdyYXBwZXJcbiAgICAgICAgaWYgKGRvbUV2ZW50ICYmIGRvbUV2ZW50LndyYXBwZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsZWdhdGVkUHJvcHNbbmFtZV0pIHtcbiAgICAgICAgICAgIGhhbmRsZUV2ZW50KG5hbWUsIGxhc3RWYWx1ZSwgbmV4dFZhbHVlLCBkb20pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGxhc3RWYWx1ZSAhPT0gbmV4dFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0Z1bmN0aW9uKG5leHRWYWx1ZSkgJiYgIWlzTnVsbE9yVW5kZWYobmV4dFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGlua0V2ZW50ID0gbmV4dFZhbHVlLmV2ZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlua0V2ZW50ICYmIGlzRnVuY3Rpb24obGlua0V2ZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkb20uX2RhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21bbmFtZUxvd2VyQ2FzZV0gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rRXZlbnQoZS5jdXJyZW50VGFyZ2V0Ll9kYXRhLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tLl9kYXRhID0gbmV4dFZhbHVlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoKFwiYW4gZXZlbnQgb24gYSBWTm9kZSBcXFwiXCIgKyBuYW1lICsgXCJcXFwiLiB3YXMgbm90IGEgZnVuY3Rpb24gb3IgYSB2YWxpZCBsaW5rRXZlbnQuXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tW25hbWVMb3dlckNhc2VdID0gbmV4dFZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIFdlIGFyZSBhc3N1bWluZyBoZXJlIHRoYXQgd2UgY29tZSBmcm9tIHBhdGNoUHJvcCByb3V0aW5lXG4vLyAtbmV4dEF0dHJWYWx1ZSBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWRcbmZ1bmN0aW9uIHBhdGNoU3R5bGUobGFzdEF0dHJWYWx1ZSwgbmV4dEF0dHJWYWx1ZSwgZG9tKSB7XG4gICAgaWYgKGlzU3RyaW5nKG5leHRBdHRyVmFsdWUpKSB7XG4gICAgICAgIGRvbS5zdHlsZS5jc3NUZXh0ID0gbmV4dEF0dHJWYWx1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKHZhciBzdHlsZSBpbiBuZXh0QXR0clZhbHVlKSB7XG4gICAgICAgIC8vIGRvIG5vdCBhZGQgYSBoYXNPd25Qcm9wZXJ0eSBjaGVjayBoZXJlLCBpdCBhZmZlY3RzIHBlcmZvcm1hbmNlXG4gICAgICAgIHZhciB2YWx1ZSA9IG5leHRBdHRyVmFsdWVbc3R5bGVdO1xuICAgICAgICBpZiAoaXNOdW1iZXIodmFsdWUpICYmICFpc1VuaXRsZXNzTnVtYmVyW3N0eWxlXSkge1xuICAgICAgICAgICAgZG9tLnN0eWxlW3N0eWxlXSA9IHZhbHVlICsgJ3B4JztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvbS5zdHlsZVtzdHlsZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzTnVsbE9yVW5kZWYobGFzdEF0dHJWYWx1ZSkpIHtcbiAgICAgICAgZm9yICh2YXIgc3R5bGUkMSBpbiBsYXN0QXR0clZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZihuZXh0QXR0clZhbHVlW3N0eWxlJDFdKSkge1xuICAgICAgICAgICAgICAgIGRvbS5zdHlsZVtzdHlsZSQxXSA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gcmVtb3ZlUHJvcChwcm9wLCBsYXN0VmFsdWUsIGRvbSkge1xuICAgIGlmIChwcm9wID09PSAnY2xhc3NOYW1lJykge1xuICAgICAgICBkb20ucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwcm9wID09PSAndmFsdWUnKSB7XG4gICAgICAgIGRvbS52YWx1ZSA9ICcnO1xuICAgIH1cbiAgICBlbHNlIGlmIChwcm9wID09PSAnc3R5bGUnKSB7XG4gICAgICAgIGRvbS5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQXR0ckFuRXZlbnQocHJvcCkpIHtcbiAgICAgICAgaGFuZGxlRXZlbnQobmFtZSwgbGFzdFZhbHVlLCBudWxsLCBkb20pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZG9tLnJlbW92ZUF0dHJpYnV0ZShwcm9wKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1vdW50KHZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpIHtcbiAgICB2YXIgZmxhZ3MgPSB2Tm9kZS5mbGFncztcbiAgICBpZiAoZmxhZ3MgJiAzOTcwIC8qIEVsZW1lbnQgKi8pIHtcbiAgICAgICAgcmV0dXJuIG1vdW50RWxlbWVudCh2Tm9kZSwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pIHtcbiAgICAgICAgcmV0dXJuIG1vdW50Q29tcG9uZW50KHZOb2RlLCBwYXJlbnREb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcsIGZsYWdzICYgNCAvKiBDb21wb25lbnRDbGFzcyAqLyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZsYWdzICYgNDA5NiAvKiBWb2lkICovKSB7XG4gICAgICAgIHJldHVybiBtb3VudFZvaWQodk5vZGUsIHBhcmVudERvbSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZsYWdzICYgMSAvKiBUZXh0ICovKSB7XG4gICAgICAgIHJldHVybiBtb3VudFRleHQodk5vZGUsIHBhcmVudERvbSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2Tm9kZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKChcIm1vdW50KCkgcmVjZWl2ZWQgYW4gb2JqZWN0IHRoYXQncyBub3QgYSB2YWxpZCBWTm9kZSwgeW91IHNob3VsZCBzdHJpbmdpZnkgaXQgZmlyc3QuIE9iamVjdDogXFxcIlwiICsgKEpTT04uc3RyaW5naWZ5KHZOb2RlKSkgKyBcIlxcXCIuXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoKFwibW91bnQoKSBleHBlY3RzIGEgdmFsaWQgVk5vZGUsIGluc3RlYWQgaXQgcmVjZWl2ZWQgYW4gb2JqZWN0IHdpdGggdGhlIHR5cGUgXFxcIlwiICsgKHR5cGVvZiB2Tm9kZSkgKyBcIlxcXCIuXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gbW91bnRUZXh0KHZOb2RlLCBwYXJlbnREb20pIHtcbiAgICB2YXIgZG9tID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodk5vZGUuY2hpbGRyZW4pO1xuICAgIHZOb2RlLmRvbSA9IGRvbTtcbiAgICBpZiAocGFyZW50RG9tKSB7XG4gICAgICAgIGFwcGVuZENoaWxkKHBhcmVudERvbSwgZG9tKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvbTtcbn1cbmZ1bmN0aW9uIG1vdW50Vm9pZCh2Tm9kZSwgcGFyZW50RG9tKSB7XG4gICAgdmFyIGRvbSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICB2Tm9kZS5kb20gPSBkb207XG4gICAgaWYgKHBhcmVudERvbSkge1xuICAgICAgICBhcHBlbmRDaGlsZChwYXJlbnREb20sIGRvbSk7XG4gICAgfVxuICAgIHJldHVybiBkb207XG59XG5mdW5jdGlvbiBtb3VudEVsZW1lbnQodk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRykge1xuICAgIGlmIChvcHRpb25zLnJlY3ljbGluZ0VuYWJsZWQpIHtcbiAgICAgICAgdmFyIGRvbSQxID0gcmVjeWNsZUVsZW1lbnQodk5vZGUsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICBpZiAoIWlzTnVsbChkb20kMSkpIHtcbiAgICAgICAgICAgIGlmICghaXNOdWxsKHBhcmVudERvbSkpIHtcbiAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZChwYXJlbnREb20sIGRvbSQxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkb20kMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgdGFnID0gdk5vZGUudHlwZTtcbiAgICB2YXIgZmxhZ3MgPSB2Tm9kZS5mbGFncztcbiAgICBpZiAoaXNTVkcgfHwgKGZsYWdzICYgMTI4IC8qIFN2Z0VsZW1lbnQgKi8pKSB7XG4gICAgICAgIGlzU1ZHID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGRvbSA9IGRvY3VtZW50Q3JlYXRlRWxlbWVudCh0YWcsIGlzU1ZHKTtcbiAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcztcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzO1xuICAgIHZhciByZWYgPSB2Tm9kZS5yZWY7XG4gICAgdk5vZGUuZG9tID0gZG9tO1xuICAgIGlmICghaXNOdWxsKGNoaWxkcmVuKSkge1xuICAgICAgICBpZiAoaXNTdHJpbmdPck51bWJlcihjaGlsZHJlbikpIHtcbiAgICAgICAgICAgIHNldFRleHRDb250ZW50KGRvbSwgY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBtb3VudEFycmF5Q2hpbGRyZW4oY2hpbGRyZW4sIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNWTm9kZShjaGlsZHJlbikpIHtcbiAgICAgICAgICAgIG1vdW50KGNoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBoYXNDb250cm9sbGVkVmFsdWUgPSBmYWxzZTtcbiAgICBpZiAoIShmbGFncyAmIDIgLyogSHRtbEVsZW1lbnQgKi8pKSB7XG4gICAgICAgIGhhc0NvbnRyb2xsZWRWYWx1ZSA9IHByb2Nlc3NFbGVtZW50KGZsYWdzLCB2Tm9kZSwgZG9tKTtcbiAgICB9XG4gICAgaWYgKCFpc051bGwocHJvcHMpKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gcHJvcHMpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdCBhZGQgYSBoYXNPd25Qcm9wZXJ0eSBjaGVjayBoZXJlLCBpdCBhZmZlY3RzIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICBwYXRjaFByb3AocHJvcCwgbnVsbCwgcHJvcHNbcHJvcF0sIGRvbSwgaXNTVkcsIGhhc0NvbnRyb2xsZWRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc051bGwoZXZlbnRzKSkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIGV2ZW50cykge1xuICAgICAgICAgICAgLy8gZG8gbm90IGFkZCBhIGhhc093blByb3BlcnR5IGNoZWNrIGhlcmUsIGl0IGFmZmVjdHMgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIHBhdGNoRXZlbnQobmFtZSwgbnVsbCwgZXZlbnRzW25hbWVdLCBkb20pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghaXNOdWxsKHJlZikpIHtcbiAgICAgICAgbW91bnRSZWYoZG9tLCByZWYsIGxpZmVjeWNsZSk7XG4gICAgfVxuICAgIGlmICghaXNOdWxsKHBhcmVudERvbSkpIHtcbiAgICAgICAgYXBwZW5kQ2hpbGQocGFyZW50RG9tLCBkb20pO1xuICAgIH1cbiAgICByZXR1cm4gZG9tO1xufVxuZnVuY3Rpb24gbW91bnRBcnJheUNoaWxkcmVuKGNoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAvLyBUT0RPOiBWZXJpZnkgY2FuIHN0cmluZy9udW1iZXIgYmUgaGVyZS4gbWlnaHQgY2F1c2UgZGUtb3B0XG4gICAgICAgIGlmICghaXNJbnZhbGlkKGNoaWxkKSkge1xuICAgICAgICAgICAgaWYgKGNoaWxkLmRvbSkge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gY2hpbGQgPSBjbG9uZVZOb2RlKGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vdW50KGNoaWxkcmVuW2ldLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gbW91bnRDb21wb25lbnQodk5vZGUsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRywgaXNDbGFzcykge1xuICAgIGlmIChvcHRpb25zLnJlY3ljbGluZ0VuYWJsZWQpIHtcbiAgICAgICAgdmFyIGRvbSQxID0gcmVjeWNsZUNvbXBvbmVudCh2Tm9kZSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIGlmICghaXNOdWxsKGRvbSQxKSkge1xuICAgICAgICAgICAgaWYgKCFpc051bGwocGFyZW50RG9tKSkge1xuICAgICAgICAgICAgICAgIGFwcGVuZENoaWxkKHBhcmVudERvbSwgZG9tJDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRvbSQxO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciB0eXBlID0gdk5vZGUudHlwZTtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcyB8fCBFTVBUWV9PQko7XG4gICAgdmFyIGRlZmF1bHRQcm9wcyA9IHR5cGUuZGVmYXVsdFByb3BzO1xuICAgIHZhciByZWYgPSB2Tm9kZS5yZWY7XG4gICAgdmFyIGRvbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKGRlZmF1bHRQcm9wcykpIHtcbiAgICAgICAgY29weVByb3BzVG8oZGVmYXVsdFByb3BzLCBwcm9wcyk7XG4gICAgICAgIHZOb2RlLnByb3BzID0gcHJvcHM7XG4gICAgfVxuICAgIGlmIChpc0NsYXNzKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IGNyZWF0ZUNsYXNzQ29tcG9uZW50SW5zdGFuY2Uodk5vZGUsIHR5cGUsIHByb3BzLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIC8vIElmIGluc3RhbmNlIGRvZXMgbm90IGhhdmUgY29tcG9uZW50V2lsbFVubW91bnQgc3BlY2lmaWVkIHdlIGNhbiBlbmFibGUgZmFzdFVubW91bnRcbiAgICAgICAgdmFyIGlucHV0ID0gaW5zdGFuY2UuX2xhc3RJbnB1dDtcbiAgICAgICAgdmFyIHByZXZGYXN0VW5tb3VudCA9IGxpZmVjeWNsZS5mYXN0VW5tb3VudDtcbiAgICAgICAgLy8gd2Ugc3RvcmUgdGhlIGZhc3RVbm1vdW50IHZhbHVlLCBidXQgd2Ugc2V0IGl0IGJhY2sgdG8gdHJ1ZSBvbiB0aGUgbGlmZWN5Y2xlXG4gICAgICAgIC8vIHdlIGRvIHRoaXMgc28gd2UgY2FuIGRldGVybWluZSBpZiB0aGUgY29tcG9uZW50IHJlbmRlciBoYXMgYSBmYXN0VW5tb3VudCBvciBub3RcbiAgICAgICAgbGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gdHJ1ZTtcbiAgICAgICAgaW5zdGFuY2UuX3ZOb2RlID0gdk5vZGU7XG4gICAgICAgIHZOb2RlLmRvbSA9IGRvbSA9IG1vdW50KGlucHV0LCBudWxsLCBsaWZlY3ljbGUsIGluc3RhbmNlLl9jaGlsZENvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgLy8gd2Ugbm93IGNyZWF0ZSBhIGxpZmVjeWNsZSBmb3IgdGhpcyBjb21wb25lbnQgYW5kIHN0b3JlIHRoZSBmYXN0VW5tb3VudCB2YWx1ZVxuICAgICAgICB2YXIgc3ViTGlmZWN5Y2xlID0gaW5zdGFuY2UuX2xpZmVjeWNsZSA9IG5ldyBMaWZlY3ljbGUoKTtcbiAgICAgICAgLy8gY2hpbGRyZW4gbGlmZWN5Y2xlIGNhbiBmYXN0VW5tb3VudCBpZiBpdHNlbGYgZG9lcyBuZWVkIHVubW91bnQgY2FsbGJhY2sgYW5kIHdpdGhpbiBpdHMgY3ljbGUgdGhlcmUgd2FzIG5vbmVcbiAgICAgICAgc3ViTGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gaXNVbmRlZmluZWQoaW5zdGFuY2UuY29tcG9uZW50V2lsbFVubW91bnQpICYmIGxpZmVjeWNsZS5mYXN0VW5tb3VudDtcbiAgICAgICAgLy8gaGlnaGVyIGxpZmVjeWNsZSBjYW4gZmFzdFVubW91bnQgb25seSBpZiBwcmV2aW91c2x5IGl0IHdhcyBhYmxlIHRvIGFuZCB0aGlzIGNoaWxkcmVuIGRvZXNudCBoYXZlIGFueVxuICAgICAgICBsaWZlY3ljbGUuZmFzdFVubW91bnQgPSBwcmV2RmFzdFVubW91bnQgJiYgc3ViTGlmZWN5Y2xlLmZhc3RVbm1vdW50O1xuICAgICAgICBpZiAoIWlzTnVsbChwYXJlbnREb20pKSB7XG4gICAgICAgICAgICBhcHBlbmRDaGlsZChwYXJlbnREb20sIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgbW91bnRDbGFzc0NvbXBvbmVudENhbGxiYWNrcyh2Tm9kZSwgcmVmLCBpbnN0YW5jZSwgbGlmZWN5Y2xlKTtcbiAgICAgICAgb3B0aW9ucy5maW5kRE9NTm9kZUVuYWJsZWQgJiYgY29tcG9uZW50VG9ET01Ob2RlTWFwLnNldChpbnN0YW5jZSwgZG9tKTtcbiAgICAgICAgdk5vZGUuY2hpbGRyZW4gPSBpbnN0YW5jZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBpbnB1dCQxID0gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudElucHV0KHZOb2RlLCB0eXBlLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHZOb2RlLmRvbSA9IGRvbSA9IG1vdW50KGlucHV0JDEsIG51bGwsIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICB2Tm9kZS5jaGlsZHJlbiA9IGlucHV0JDE7XG4gICAgICAgIG1vdW50RnVuY3Rpb25hbENvbXBvbmVudENhbGxiYWNrcyhyZWYsIGRvbSwgbGlmZWN5Y2xlKTtcbiAgICAgICAgaWYgKCFpc051bGwocGFyZW50RG9tKSkge1xuICAgICAgICAgICAgYXBwZW5kQ2hpbGQocGFyZW50RG9tLCBkb20pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkb207XG59XG5mdW5jdGlvbiBtb3VudENsYXNzQ29tcG9uZW50Q2FsbGJhY2tzKHZOb2RlLCByZWYsIGluc3RhbmNlLCBsaWZlY3ljbGUpIHtcbiAgICBpZiAocmVmKSB7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKHJlZikpIHtcbiAgICAgICAgICAgIHJlZihpbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICAgIGlmIChpc1N0cmluZ09yTnVtYmVyKHJlZikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcignc3RyaW5nIFwicmVmc1wiIGFyZSBub3Qgc3VwcG9ydGVkIGluIEluZmVybm8gMS4wLiBVc2UgY2FsbGJhY2sgXCJyZWZzXCIgaW5zdGVhZC4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNPYmplY3QocmVmKSAmJiAodk5vZGUuZmxhZ3MgJiA0IC8qIENvbXBvbmVudENsYXNzICovKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKCdmdW5jdGlvbmFsIGNvbXBvbmVudCBsaWZlY3ljbGUgZXZlbnRzIGFyZSBub3Qgc3VwcG9ydGVkIG9uIEVTMjAxNSBjbGFzcyBjb21wb25lbnRzLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcigoXCJhIGJhZCB2YWx1ZSBmb3IgXFxcInJlZlxcXCIgd2FzIHVzZWQgb24gY29tcG9uZW50OiBcXFwiXCIgKyAoSlNPTi5zdHJpbmdpZnkocmVmKSkgKyBcIlxcXCJcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93RXJyb3IoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgY0RNID0gaW5zdGFuY2UuY29tcG9uZW50RGlkTW91bnQ7XG4gICAgdmFyIGFmdGVyTW91bnQgPSBvcHRpb25zLmFmdGVyTW91bnQ7XG4gICAgaWYgKCFpc1VuZGVmaW5lZChjRE0pIHx8ICFpc051bGwoYWZ0ZXJNb3VudCkpIHtcbiAgICAgICAgbGlmZWN5Y2xlLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFmdGVyTW91bnQgJiYgYWZ0ZXJNb3VudCh2Tm9kZSk7XG4gICAgICAgICAgICBjRE0gJiYgaW5zdGFuY2UuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gbW91bnRGdW5jdGlvbmFsQ29tcG9uZW50Q2FsbGJhY2tzKHJlZiwgZG9tLCBsaWZlY3ljbGUpIHtcbiAgICBpZiAocmVmKSB7XG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZihyZWYub25Db21wb25lbnRXaWxsTW91bnQpKSB7XG4gICAgICAgICAgICByZWYub25Db21wb25lbnRXaWxsTW91bnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWYocmVmLm9uQ29tcG9uZW50RGlkTW91bnQpKSB7XG4gICAgICAgICAgICBsaWZlY3ljbGUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVmLm9uQ29tcG9uZW50RGlkTW91bnQoZG9tKTsgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmKHJlZi5vbkNvbXBvbmVudFdpbGxVbm1vdW50KSkge1xuICAgICAgICAgICAgbGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBtb3VudFJlZihkb20sIHZhbHVlLCBsaWZlY3ljbGUpIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgbGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gZmFsc2U7XG4gICAgICAgIGxpZmVjeWNsZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZShkb20pOyB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpc0ludmFsaWQodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ3N0cmluZyBcInJlZnNcIiBhcmUgbm90IHN1cHBvcnRlZCBpbiBJbmZlcm5vIDEuMC4gVXNlIGNhbGxiYWNrIFwicmVmc1wiIGluc3RlYWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQ2hpbGROb2RlcyhwYXJlbnREb20pIHtcbiAgICB2YXIgZG9tID0gcGFyZW50RG9tLmZpcnN0Q2hpbGQ7XG4gICAgd2hpbGUgKGRvbSkge1xuICAgICAgICBpZiAoZG9tLm5vZGVUeXBlID09PSA4KSB7XG4gICAgICAgICAgICBpZiAoZG9tLmRhdGEgPT09ICchJykge1xuICAgICAgICAgICAgICAgIHZhciBwbGFjZWhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgICAgICAgICAgICBwYXJlbnREb20ucmVwbGFjZUNoaWxkKHBsYWNlaG9sZGVyLCBkb20pO1xuICAgICAgICAgICAgICAgIGRvbSA9IGRvbS5uZXh0U2libGluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsYXN0RG9tID0gZG9tLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgICAgICBwYXJlbnREb20ucmVtb3ZlQ2hpbGQoZG9tKTtcbiAgICAgICAgICAgICAgICBkb20gPSBsYXN0RG9tIHx8IHBhcmVudERvbS5maXJzdENoaWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9tID0gZG9tLm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaHlkcmF0ZUNvbXBvbmVudCh2Tm9kZSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBpc0NsYXNzKSB7XG4gICAgdmFyIHR5cGUgPSB2Tm9kZS50eXBlO1xuICAgIHZhciBwcm9wcyA9IHZOb2RlLnByb3BzIHx8IEVNUFRZX09CSjtcbiAgICB2YXIgcmVmID0gdk5vZGUucmVmO1xuICAgIHZOb2RlLmRvbSA9IGRvbTtcbiAgICBpZiAoaXNDbGFzcykge1xuICAgICAgICB2YXIgX2lzU1ZHID0gZG9tLm5hbWVzcGFjZVVSSSA9PT0gc3ZnTlM7XG4gICAgICAgIHZhciBkZWZhdWx0UHJvcHMgPSB0eXBlLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChkZWZhdWx0UHJvcHMpKSB7XG4gICAgICAgICAgICBjb3B5UHJvcHNUbyhkZWZhdWx0UHJvcHMsIHByb3BzKTtcbiAgICAgICAgICAgIHZOb2RlLnByb3BzID0gcHJvcHM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluc3RhbmNlID0gY3JlYXRlQ2xhc3NDb21wb25lbnRJbnN0YW5jZSh2Tm9kZSwgdHlwZSwgcHJvcHMsIGNvbnRleHQsIF9pc1NWRyk7XG4gICAgICAgIC8vIElmIGluc3RhbmNlIGRvZXMgbm90IGhhdmUgY29tcG9uZW50V2lsbFVubW91bnQgc3BlY2lmaWVkIHdlIGNhbiBlbmFibGUgZmFzdFVubW91bnRcbiAgICAgICAgdmFyIHByZXZGYXN0VW5tb3VudCA9IGxpZmVjeWNsZS5mYXN0VW5tb3VudDtcbiAgICAgICAgdmFyIGlucHV0ID0gaW5zdGFuY2UuX2xhc3RJbnB1dDtcbiAgICAgICAgLy8gd2Ugc3RvcmUgdGhlIGZhc3RVbm1vdW50IHZhbHVlLCBidXQgd2Ugc2V0IGl0IGJhY2sgdG8gdHJ1ZSBvbiB0aGUgbGlmZWN5Y2xlXG4gICAgICAgIC8vIHdlIGRvIHRoaXMgc28gd2UgY2FuIGRldGVybWluZSBpZiB0aGUgY29tcG9uZW50IHJlbmRlciBoYXMgYSBmYXN0VW5tb3VudCBvciBub3RcbiAgICAgICAgbGlmZWN5Y2xlLmZhc3RVbm1vdW50ID0gdHJ1ZTtcbiAgICAgICAgaW5zdGFuY2UuX3ZDb21wb25lbnQgPSB2Tm9kZTtcbiAgICAgICAgaW5zdGFuY2UuX3ZOb2RlID0gdk5vZGU7XG4gICAgICAgIGh5ZHJhdGUoaW5wdXQsIGRvbSwgbGlmZWN5Y2xlLCBpbnN0YW5jZS5fY2hpbGRDb250ZXh0LCBfaXNTVkcpO1xuICAgICAgICAvLyB3ZSBub3cgY3JlYXRlIGEgbGlmZWN5Y2xlIGZvciB0aGlzIGNvbXBvbmVudCBhbmQgc3RvcmUgdGhlIGZhc3RVbm1vdW50IHZhbHVlXG4gICAgICAgIHZhciBzdWJMaWZlY3ljbGUgPSBpbnN0YW5jZS5fbGlmZWN5Y2xlID0gbmV3IExpZmVjeWNsZSgpO1xuICAgICAgICAvLyBjaGlsZHJlbiBsaWZlY3ljbGUgY2FuIGZhc3RVbm1vdW50IGlmIGl0c2VsZiBkb2VzIG5lZWQgdW5tb3VudCBjYWxsYmFjayBhbmQgd2l0aGluIGl0cyBjeWNsZSB0aGVyZSB3YXMgbm9uZVxuICAgICAgICBzdWJMaWZlY3ljbGUuZmFzdFVubW91bnQgPSBpc1VuZGVmaW5lZChpbnN0YW5jZS5jb21wb25lbnRXaWxsVW5tb3VudCkgJiYgbGlmZWN5Y2xlLmZhc3RVbm1vdW50O1xuICAgICAgICAvLyBoaWdoZXIgbGlmZWN5Y2xlIGNhbiBmYXN0VW5tb3VudCBvbmx5IGlmIHByZXZpb3VzbHkgaXQgd2FzIGFibGUgdG8gYW5kIHRoaXMgY2hpbGRyZW4gZG9lc250IGhhdmUgYW55XG4gICAgICAgIGxpZmVjeWNsZS5mYXN0VW5tb3VudCA9IHByZXZGYXN0VW5tb3VudCAmJiBzdWJMaWZlY3ljbGUuZmFzdFVubW91bnQ7XG4gICAgICAgIG1vdW50Q2xhc3NDb21wb25lbnRDYWxsYmFja3Modk5vZGUsIHJlZiwgaW5zdGFuY2UsIGxpZmVjeWNsZSk7XG4gICAgICAgIG9wdGlvbnMuZmluZERPTU5vZGVFbmFibGVkICYmIGNvbXBvbmVudFRvRE9NTm9kZU1hcC5zZXQoaW5zdGFuY2UsIGRvbSk7XG4gICAgICAgIHZOb2RlLmNoaWxkcmVuID0gaW5zdGFuY2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgaW5wdXQkMSA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnRJbnB1dCh2Tm9kZSwgdHlwZSwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICBoeWRyYXRlKGlucHV0JDEsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIHZOb2RlLmNoaWxkcmVuID0gaW5wdXQkMTtcbiAgICAgICAgdk5vZGUuZG9tID0gaW5wdXQkMS5kb207XG4gICAgICAgIG1vdW50RnVuY3Rpb25hbENvbXBvbmVudENhbGxiYWNrcyhyZWYsIGRvbSwgbGlmZWN5Y2xlKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvbTtcbn1cbmZ1bmN0aW9uIGh5ZHJhdGVFbGVtZW50KHZOb2RlLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpIHtcbiAgICB2YXIgdGFnID0gdk5vZGUudHlwZTtcbiAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcbiAgICB2YXIgcHJvcHMgPSB2Tm9kZS5wcm9wcztcbiAgICB2YXIgZXZlbnRzID0gdk5vZGUuZXZlbnRzO1xuICAgIHZhciBmbGFncyA9IHZOb2RlLmZsYWdzO1xuICAgIHZhciByZWYgPSB2Tm9kZS5yZWY7XG4gICAgaWYgKGlzU1ZHIHx8IChmbGFncyAmIDEyOCAvKiBTdmdFbGVtZW50ICovKSkge1xuICAgICAgICBpc1NWRyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChkb20ubm9kZVR5cGUgIT09IDEgfHwgZG9tLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gdGFnKSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB3YXJuaW5nKGZhbHNlLCAnSW5mZXJubyBoeWRyYXRpb246IFNlcnZlci1zaWRlIG1hcmt1cCBkb2VzblxcJ3QgbWF0Y2ggY2xpZW50LXNpZGUgbWFya3VwJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld0RvbSA9IG1vdW50RWxlbWVudCh2Tm9kZSwgbnVsbCwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgICAgIHZOb2RlLmRvbSA9IG5ld0RvbTtcbiAgICAgICAgcmVwbGFjZUNoaWxkKGRvbS5wYXJlbnROb2RlLCBuZXdEb20sIGRvbSk7XG4gICAgICAgIHJldHVybiBuZXdEb207XG4gICAgfVxuICAgIHZOb2RlLmRvbSA9IGRvbTtcbiAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgaHlkcmF0ZUNoaWxkcmVuKGNoaWxkcmVuLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgIH1cbiAgICB2YXIgaGFzQ29udHJvbGxlZFZhbHVlID0gZmFsc2U7XG4gICAgaWYgKCEoZmxhZ3MgJiAyIC8qIEh0bWxFbGVtZW50ICovKSkge1xuICAgICAgICBoYXNDb250cm9sbGVkVmFsdWUgPSBwcm9jZXNzRWxlbWVudChmbGFncywgdk5vZGUsIGRvbSk7XG4gICAgfVxuICAgIGlmIChwcm9wcykge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XG4gICAgICAgICAgICBwYXRjaFByb3AocHJvcCwgbnVsbCwgcHJvcHNbcHJvcF0sIGRvbSwgaXNTVkcsIGhhc0NvbnRyb2xsZWRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2ZW50cykge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIGV2ZW50cykge1xuICAgICAgICAgICAgcGF0Y2hFdmVudChuYW1lLCBudWxsLCBldmVudHNbbmFtZV0sIGRvbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlZikge1xuICAgICAgICBtb3VudFJlZihkb20sIHJlZiwgbGlmZWN5Y2xlKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvbTtcbn1cbmZ1bmN0aW9uIGh5ZHJhdGVDaGlsZHJlbihjaGlsZHJlbiwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKSB7XG4gICAgbm9ybWFsaXplQ2hpbGROb2RlcyhwYXJlbnREb20pO1xuICAgIHZhciBkb20gPSBwYXJlbnREb20uZmlyc3RDaGlsZDtcbiAgICBpZiAoaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAoIWlzTnVsbChjaGlsZCkgJiYgaXNPYmplY3QoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgICAgICBkb20gPSBoeWRyYXRlKGNoaWxkLCBkb20sIGxpZmVjeWNsZSwgY29udGV4dCwgaXNTVkcpO1xuICAgICAgICAgICAgICAgICAgICBkb20gPSBkb20ubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtb3VudChjaGlsZCwgcGFyZW50RG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTdHJpbmdPck51bWJlcihjaGlsZHJlbikpIHtcbiAgICAgICAgaWYgKGRvbSAmJiBkb20ubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgICAgIGlmIChkb20ubm9kZVZhbHVlICE9PSBjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGRvbS5ub2RlVmFsdWUgPSBjaGlsZHJlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgICAgcGFyZW50RG9tLnRleHRDb250ZW50ID0gY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICAgICAgZG9tID0gZG9tLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc09iamVjdChjaGlsZHJlbikpIHtcbiAgICAgICAgaHlkcmF0ZShjaGlsZHJlbiwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHKTtcbiAgICAgICAgZG9tID0gZG9tLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICAvLyBjbGVhciBhbnkgb3RoZXIgRE9NIG5vZGVzLCB0aGVyZSBzaG91bGQgYmUgb25seSBhIHNpbmdsZSBlbnRyeSBmb3IgdGhlIHJvb3RcbiAgICB3aGlsZSAoZG9tKSB7XG4gICAgICAgIHZhciBuZXh0U2libGluZyA9IGRvbS5uZXh0U2libGluZztcbiAgICAgICAgcGFyZW50RG9tLnJlbW92ZUNoaWxkKGRvbSk7XG4gICAgICAgIGRvbSA9IG5leHRTaWJsaW5nO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGh5ZHJhdGVUZXh0KHZOb2RlLCBkb20pIHtcbiAgICBpZiAoZG9tLm5vZGVUeXBlICE9PSAzKSB7XG4gICAgICAgIHZhciBuZXdEb20gPSBtb3VudFRleHQodk5vZGUsIG51bGwpO1xuICAgICAgICB2Tm9kZS5kb20gPSBuZXdEb207XG4gICAgICAgIHJlcGxhY2VDaGlsZChkb20ucGFyZW50Tm9kZSwgbmV3RG9tLCBkb20pO1xuICAgICAgICByZXR1cm4gbmV3RG9tO1xuICAgIH1cbiAgICB2YXIgdGV4dCA9IHZOb2RlLmNoaWxkcmVuO1xuICAgIGlmIChkb20ubm9kZVZhbHVlICE9PSB0ZXh0KSB7XG4gICAgICAgIGRvbS5ub2RlVmFsdWUgPSB0ZXh0O1xuICAgIH1cbiAgICB2Tm9kZS5kb20gPSBkb207XG4gICAgcmV0dXJuIGRvbTtcbn1cbmZ1bmN0aW9uIGh5ZHJhdGVWb2lkKHZOb2RlLCBkb20pIHtcbiAgICB2Tm9kZS5kb20gPSBkb207XG4gICAgcmV0dXJuIGRvbTtcbn1cbmZ1bmN0aW9uIGh5ZHJhdGUodk5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRykge1xuICAgIHZhciBmbGFncyA9IHZOb2RlLmZsYWdzO1xuICAgIGlmIChmbGFncyAmIDI4IC8qIENvbXBvbmVudCAqLykge1xuICAgICAgICByZXR1cm4gaHlkcmF0ZUNvbXBvbmVudCh2Tm9kZSwgZG9tLCBsaWZlY3ljbGUsIGNvbnRleHQsIGlzU1ZHLCBmbGFncyAmIDQgLyogQ29tcG9uZW50Q2xhc3MgKi8pO1xuICAgIH1cbiAgICBlbHNlIGlmIChmbGFncyAmIDM5NzAgLyogRWxlbWVudCAqLykge1xuICAgICAgICByZXR1cm4gaHlkcmF0ZUVsZW1lbnQodk5vZGUsIGRvbSwgbGlmZWN5Y2xlLCBjb250ZXh0LCBpc1NWRyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZsYWdzICYgMSAvKiBUZXh0ICovKSB7XG4gICAgICAgIHJldHVybiBoeWRyYXRlVGV4dCh2Tm9kZSwgZG9tKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmxhZ3MgJiA0MDk2IC8qIFZvaWQgKi8pIHtcbiAgICAgICAgcmV0dXJuIGh5ZHJhdGVWb2lkKHZOb2RlLCBkb20pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoKFwiaHlkcmF0ZSgpIGV4cGVjdHMgYSB2YWxpZCBWTm9kZSwgaW5zdGVhZCBpdCByZWNlaXZlZCBhbiBvYmplY3Qgd2l0aCB0aGUgdHlwZSBcXFwiXCIgKyAodHlwZW9mIHZOb2RlKSArIFwiXFxcIi5cIikpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93RXJyb3IoKTtcbiAgICB9XG59XG5mdW5jdGlvbiBoeWRyYXRlUm9vdChpbnB1dCwgcGFyZW50RG9tLCBsaWZlY3ljbGUpIHtcbiAgICB2YXIgZG9tID0gcGFyZW50RG9tICYmIHBhcmVudERvbS5maXJzdENoaWxkO1xuICAgIGlmIChkb20pIHtcbiAgICAgICAgaHlkcmF0ZShpbnB1dCwgZG9tLCBsaWZlY3ljbGUsIHt9LCBmYWxzZSk7XG4gICAgICAgIGRvbSA9IHBhcmVudERvbS5maXJzdENoaWxkO1xuICAgICAgICAvLyBjbGVhciBhbnkgb3RoZXIgRE9NIG5vZGVzLCB0aGVyZSBzaG91bGQgYmUgb25seSBhIHNpbmdsZSBlbnRyeSBmb3IgdGhlIHJvb3RcbiAgICAgICAgd2hpbGUgKGRvbSA9IGRvbS5uZXh0U2libGluZykge1xuICAgICAgICAgICAgcGFyZW50RG9tLnJlbW92ZUNoaWxkKGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLy8gcmF0aGVyIHRoYW4gdXNlIGEgTWFwLCBsaWtlIHdlIGRpZCBiZWZvcmUsIHdlIGNhbiB1c2UgYW4gYXJyYXkgaGVyZVxuLy8gZ2l2ZW4gdGhlcmUgc2hvdWxkbid0IGJlIFRIQVQgbWFueSByb290cyBvbiB0aGUgcGFnZSwgdGhlIGRpZmZlcmVuY2Vcbi8vIGluIHBlcmZvcm1hbmNlIGlzIGh1Z2U6IGh0dHBzOi8vZXNiZW5jaC5jb20vYmVuY2gvNTgwMmE2OTEzMzBhYjA5OTAwYTFhMmRhXG52YXIgcm9vdHMgPSBbXTtcbnZhciBjb21wb25lbnRUb0RPTU5vZGVNYXAgPSBuZXcgTWFwKCk7XG5vcHRpb25zLnJvb3RzID0gcm9vdHM7XG5mdW5jdGlvbiBmaW5kRE9NTm9kZShyZWYpIHtcbiAgICBpZiAoIW9wdGlvbnMuZmluZERPTU5vZGVFbmFibGVkKSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCdmaW5kRE9NTm9kZSgpIGhhcyBiZWVuIGRpc2FibGVkLCB1c2UgSW5mZXJuby5vcHRpb25zLmZpbmRET01Ob2RlRW5hYmxlZCA9IHRydWU7IGVuYWJsZWQgZmluZERPTU5vZGUoKS4gV2FybmluZyB0aGlzIGNhbiBzaWduaWZpY2FudGx5IGltcGFjdCBwZXJmb3JtYW5jZSEnKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKCk7XG4gICAgfVxuICAgIHZhciBkb20gPSByZWYgJiYgcmVmLm5vZGVUeXBlID8gcmVmIDogbnVsbDtcbiAgICByZXR1cm4gY29tcG9uZW50VG9ET01Ob2RlTWFwLmdldChyZWYpIHx8IGRvbTtcbn1cbmZ1bmN0aW9uIGdldFJvb3QoZG9tKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb290cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcm9vdCA9IHJvb3RzW2ldO1xuICAgICAgICBpZiAocm9vdC5kb20gPT09IGRvbSkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBzZXRSb290KGRvbSwgaW5wdXQsIGxpZmVjeWNsZSkge1xuICAgIHZhciByb290ID0ge1xuICAgICAgICBkb206IGRvbSxcbiAgICAgICAgaW5wdXQ6IGlucHV0LFxuICAgICAgICBsaWZlY3ljbGU6IGxpZmVjeWNsZSxcbiAgICB9O1xuICAgIHJvb3RzLnB1c2gocm9vdCk7XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5mdW5jdGlvbiByZW1vdmVSb290KHJvb3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyb290c1tpXSA9PT0gcm9vdCkge1xuICAgICAgICAgICAgcm9vdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBpZiAoaXNCcm93c2VyICYmIGRvY3VtZW50LmJvZHkgPT09IG51bGwpIHtcbiAgICAgICAgd2FybmluZyhmYWxzZSwgJ0luZmVybm8gd2FybmluZzogeW91IGNhbm5vdCBpbml0aWFsaXplIGluZmVybm8gd2l0aG91dCBcImRvY3VtZW50LmJvZHlcIi4gV2FpdCBvbiBcIkRPTUNvbnRlbnRMb2FkZWRcIiBldmVudCwgYWRkIHNjcmlwdCB0byBib3R0b20gb2YgYm9keSwgb3IgdXNlIGFzeW5jL2RlZmVyIGF0dHJpYnV0ZXMgb24gc2NyaXB0IHRhZy4nKTtcbiAgICB9XG59XG52YXIgZG9jdW1lbnRCb2R5ID0gaXNCcm93c2VyID8gZG9jdW1lbnQuYm9keSA6IG51bGw7XG5mdW5jdGlvbiByZW5kZXIoaW5wdXQsIHBhcmVudERvbSkge1xuICAgIGlmIChkb2N1bWVudEJvZHkgPT09IHBhcmVudERvbSkge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcigneW91IGNhbm5vdCByZW5kZXIoKSB0byB0aGUgXCJkb2N1bWVudC5ib2R5XCIuIFVzZSBhbiBlbXB0eSBlbGVtZW50IGFzIGEgY29udGFpbmVyIGluc3RlYWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcigpO1xuICAgIH1cbiAgICBpZiAoaW5wdXQgPT09IE5PX09QKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJvb3QgPSBnZXRSb290KHBhcmVudERvbSk7XG4gICAgaWYgKGlzTnVsbChyb290KSkge1xuICAgICAgICB2YXIgbGlmZWN5Y2xlID0gbmV3IExpZmVjeWNsZSgpO1xuICAgICAgICBpZiAoIWlzSW52YWxpZChpbnB1dCkpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5kb20pIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGNsb25lVk5vZGUoaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFoeWRyYXRlUm9vdChpbnB1dCwgcGFyZW50RG9tLCBsaWZlY3ljbGUpKSB7XG4gICAgICAgICAgICAgICAgbW91bnQoaW5wdXQsIHBhcmVudERvbSwgbGlmZWN5Y2xlLCB7fSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcm9vdCA9IHNldFJvb3QocGFyZW50RG9tLCBpbnB1dCwgbGlmZWN5Y2xlKTtcbiAgICAgICAgICAgIGxpZmVjeWNsZS50cmlnZ2VyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBsaWZlY3ljbGUkMSA9IHJvb3QubGlmZWN5Y2xlO1xuICAgICAgICBsaWZlY3ljbGUkMS5saXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWYoaW5wdXQpKSB7XG4gICAgICAgICAgICB1bm1vdW50KHJvb3QuaW5wdXQsIHBhcmVudERvbSwgbGlmZWN5Y2xlJDEsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgICByZW1vdmVSb290KHJvb3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlucHV0LmRvbSkge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gY2xvbmVWTm9kZShpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRjaChyb290LmlucHV0LCBpbnB1dCwgcGFyZW50RG9tLCBsaWZlY3ljbGUkMSwge30sIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGlmZWN5Y2xlJDEudHJpZ2dlcigpO1xuICAgICAgICByb290LmlucHV0ID0gaW5wdXQ7XG4gICAgfVxuICAgIGlmIChyb290KSB7XG4gICAgICAgIHZhciByb290SW5wdXQgPSByb290LmlucHV0O1xuICAgICAgICBpZiAocm9vdElucHV0ICYmIChyb290SW5wdXQuZmxhZ3MgJiAyOCAvKiBDb21wb25lbnQgKi8pKSB7XG4gICAgICAgICAgICByZXR1cm4gcm9vdElucHV0LmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXIoX3BhcmVudERvbSkge1xuICAgIHZhciBwYXJlbnREb20gPSBfcGFyZW50RG9tIHx8IG51bGw7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHJlbmRlcmVyKGxhc3RJbnB1dCwgbmV4dElucHV0KSB7XG4gICAgICAgIGlmICghcGFyZW50RG9tKSB7XG4gICAgICAgICAgICBwYXJlbnREb20gPSBsYXN0SW5wdXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyKG5leHRJbnB1dCwgcGFyZW50RG9tKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBsaW5rRXZlbnQoZGF0YSwgZXZlbnQpIHtcbiAgICByZXR1cm4geyBkYXRhOiBkYXRhLCBldmVudDogZXZlbnQgfTtcbn1cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcblx0T2JqZWN0LmZyZWV6ZShFTVBUWV9PQkopO1xuXHR2YXIgdGVzdEZ1bmMgPSBmdW5jdGlvbiB0ZXN0Rm4oKSB7fTtcblx0d2FybmluZyhcblx0XHQodGVzdEZ1bmMubmFtZSB8fCB0ZXN0RnVuYy50b1N0cmluZygpKS5pbmRleE9mKCd0ZXN0Rm4nKSAhPT0gLTEsXG5cdFx0J0l0IGxvb2tzIGxpa2UgeW91XFwncmUgdXNpbmcgYSBtaW5pZmllZCBjb3B5IG9mIHRoZSBkZXZlbG9wbWVudCBidWlsZCAnICtcblx0XHQnb2YgSW5mZXJuby4gV2hlbiBkZXBsb3lpbmcgSW5mZXJubyBhcHBzIHRvIHByb2R1Y3Rpb24sIG1ha2Ugc3VyZSB0byB1c2UgJyArXG5cdFx0J3RoZSBwcm9kdWN0aW9uIGJ1aWxkIHdoaWNoIHNraXBzIGRldmVsb3BtZW50IHdhcm5pbmdzIGFuZCBpcyBmYXN0ZXIuICcgK1xuXHRcdCdTZWUgaHR0cDovL2luZmVybm9qcy5vcmcgZm9yIG1vcmUgZGV0YWlscy4nXG5cdCk7XG59XG5cbi8vIFRoaXMgd2lsbCBiZSByZXBsYWNlZCBieSByb2xsdXBcbnZhciB2ZXJzaW9uID0gJzEuMi4xJztcblxuLy8gd2UgZHVwbGljYXRlIGl0IHNvIGl0IHBsYXlzIG5pY2VseSB3aXRoIGRpZmZlcmVudCBtb2R1bGUgbG9hZGluZyBzeXN0ZW1zXG52YXIgaW5kZXggPSB7XG5cdGxpbmtFdmVudDogbGlua0V2ZW50LFxuXHQvLyBjb3JlIHNoYXBlc1xuXHRjcmVhdGVWTm9kZTogY3JlYXRlVk5vZGUsXG5cblx0Ly8gY2xvbmluZ1xuXHRjbG9uZVZOb2RlOiBjbG9uZVZOb2RlLFxuXG5cdC8vIHVzZWQgdG8gc2hhcmVkIGNvbW1vbiBpdGVtcyBiZXR3ZWVuIEluZmVybm8gbGlic1xuXHROT19PUDogTk9fT1AsXG5cdEVNUFRZX09CSjogRU1QVFlfT0JKLFxuXG5cdC8vIERPTVxuXHRyZW5kZXI6IHJlbmRlcixcblx0ZmluZERPTU5vZGU6IGZpbmRET01Ob2RlLFxuXHRjcmVhdGVSZW5kZXJlcjogY3JlYXRlUmVuZGVyZXIsXG5cdG9wdGlvbnM6IG9wdGlvbnMsXG5cdHZlcnNpb246IHZlcnNpb25cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluZGV4O1xuZXhwb3J0cy5saW5rRXZlbnQgPSBsaW5rRXZlbnQ7XG5leHBvcnRzLmNyZWF0ZVZOb2RlID0gY3JlYXRlVk5vZGU7XG5leHBvcnRzLmNsb25lVk5vZGUgPSBjbG9uZVZOb2RlO1xuZXhwb3J0cy5OT19PUCA9IE5PX09QO1xuZXhwb3J0cy5FTVBUWV9PQkogPSBFTVBUWV9PQko7XG5leHBvcnRzLnJlbmRlciA9IHJlbmRlcjtcbmV4cG9ydHMuZmluZERPTU5vZGUgPSBmaW5kRE9NTm9kZTtcbmV4cG9ydHMuY3JlYXRlUmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcjtcbmV4cG9ydHMub3B0aW9ucyA9IG9wdGlvbnM7XG5leHBvcnRzLnZlcnNpb24gPSB2ZXJzaW9uO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvaW5mZXJuby5ub2RlJyk7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbW9kdWxlLmV4cG9ydHM7IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvYWQgKHNyYywgb3B0cywgY2IpIHtcbiAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF1cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG5cbiAgaWYgKHR5cGVvZiBvcHRzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRzXG4gICAgb3B0cyA9IHt9XG4gIH1cblxuICBvcHRzID0gb3B0cyB8fCB7fVxuICBjYiA9IGNiIHx8IGZ1bmN0aW9uKCkge31cblxuICBzY3JpcHQudHlwZSA9IG9wdHMudHlwZSB8fCAndGV4dC9qYXZhc2NyaXB0J1xuICBzY3JpcHQuY2hhcnNldCA9IG9wdHMuY2hhcnNldCB8fCAndXRmOCc7XG4gIHNjcmlwdC5hc3luYyA9ICdhc3luYycgaW4gb3B0cyA/ICEhb3B0cy5hc3luYyA6IHRydWVcbiAgc2NyaXB0LnNyYyA9IHNyY1xuXG4gIGlmIChvcHRzLmF0dHJzKSB7XG4gICAgc2V0QXR0cmlidXRlcyhzY3JpcHQsIG9wdHMuYXR0cnMpXG4gIH1cblxuICBpZiAob3B0cy50ZXh0KSB7XG4gICAgc2NyaXB0LnRleHQgPSAnJyArIG9wdHMudGV4dFxuICB9XG5cbiAgdmFyIG9uZW5kID0gJ29ubG9hZCcgaW4gc2NyaXB0ID8gc3RkT25FbmQgOiBpZU9uRW5kXG4gIG9uZW5kKHNjcmlwdCwgY2IpXG5cbiAgLy8gc29tZSBnb29kIGxlZ2FjeSBicm93c2VycyAoZmlyZWZveCkgZmFpbCB0aGUgJ2luJyBkZXRlY3Rpb24gYWJvdmVcbiAgLy8gc28gYXMgYSBmYWxsYmFjayB3ZSBhbHdheXMgc2V0IG9ubG9hZFxuICAvLyBvbGQgSUUgd2lsbCBpZ25vcmUgdGhpcyBhbmQgbmV3IElFIHdpbGwgc2V0IG9ubG9hZFxuICBpZiAoIXNjcmlwdC5vbmxvYWQpIHtcbiAgICBzdGRPbkVuZChzY3JpcHQsIGNiKTtcbiAgfVxuXG4gIGhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxufVxuXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKHNjcmlwdCwgYXR0cnMpIHtcbiAgZm9yICh2YXIgYXR0ciBpbiBhdHRycykge1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoYXR0ciwgYXR0cnNbYXR0cl0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0ZE9uRW5kIChzY3JpcHQsIGNiKSB7XG4gIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vbmVycm9yID0gdGhpcy5vbmxvYWQgPSBudWxsXG4gICAgY2IobnVsbCwgc2NyaXB0KVxuICB9XG4gIHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHRoaXMub25sb2FkID0gbnVsbCBoZXJlIGlzIG5lY2Vzc2FyeVxuICAgIC8vIGJlY2F1c2UgZXZlbiBJRTkgd29ya3Mgbm90IGxpa2Ugb3RoZXJzXG4gICAgdGhpcy5vbmVycm9yID0gdGhpcy5vbmxvYWQgPSBudWxsXG4gICAgY2IobmV3IEVycm9yKCdGYWlsZWQgdG8gbG9hZCAnICsgdGhpcy5zcmMpLCBzY3JpcHQpXG4gIH1cbn1cblxuZnVuY3Rpb24gaWVPbkVuZCAoc2NyaXB0LCBjYikge1xuICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT0gJ2NvbXBsZXRlJyAmJiB0aGlzLnJlYWR5U3RhdGUgIT0gJ2xvYWRlZCcpIHJldHVyblxuICAgIHRoaXMub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbFxuICAgIGNiKG51bGwsIHNjcmlwdCkgLy8gdGhlcmUgaXMgbm8gd2F5IHRvIGNhdGNoIGxvYWRpbmcgZXJyb3JzIGluIElFOFxuICB9XG59XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ltYm9sO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RWFjaChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RWFjaDtcbiIsInZhciBiYXNlVGltZXMgPSByZXF1aXJlKCcuL19iYXNlVGltZXMnKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL2lzVHlwZWRBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlMaWtlS2V5cztcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlNYXA7XG4iLCIvKipcbiAqIENvbnZlcnRzIGFuIEFTQ0lJIGBzdHJpbmdgIHRvIGFuIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY29udmVydGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhc2NpaVRvQXJyYXkoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcuc3BsaXQoJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzY2lpVG9BcnJheTtcbiIsInZhciBiYXNlRm9yT3duID0gcmVxdWlyZSgnLi9fYmFzZUZvck93bicpLFxuICAgIGNyZWF0ZUJhc2VFYWNoID0gcmVxdWlyZSgnLi9fY3JlYXRlQmFzZUVhY2gnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JFYWNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xudmFyIGJhc2VFYWNoID0gY3JlYXRlQmFzZUVhY2goYmFzZUZvck93bik7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUVhY2g7XG4iLCJ2YXIgY3JlYXRlQmFzZUZvciA9IHJlcXVpcmUoJy4vX2NyZWF0ZUJhc2VGb3InKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VGb3I7XG4iLCJ2YXIgYmFzZUZvciA9IHJlcXVpcmUoJy4vX2Jhc2VGb3InKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yT3duYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUZvck93bihvYmplY3QsIGl0ZXJhdGVlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgYmFzZUZvcihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRm9yT3duO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNBcmd1bWVudHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqL1xuZnVuY3Rpb24gYmFzZUlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IGFyZ3NUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzQXJndW1lbnRzO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc1R5cGVkQXJyYXk7XG4iLCJ2YXIgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXMgPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5cztcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uc2xpY2VgIHdpdGhvdXQgYW4gaXRlcmF0ZWUgY2FsbCBndWFyZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNsaWNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD0wXSBUaGUgc3RhcnQgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gW2VuZD1hcnJheS5sZW5ndGhdIFRoZSBlbmQgcG9zaXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHNsaWNlIG9mIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VTbGljZShhcnJheSwgc3RhcnQsIGVuZCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAtc3RhcnQgPiBsZW5ndGggPyAwIDogKGxlbmd0aCArIHN0YXJ0KTtcbiAgfVxuICBlbmQgPSBlbmQgPiBsZW5ndGggPyBsZW5ndGggOiBlbmQ7XG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlbmd0aDtcbiAgfVxuICBsZW5ndGggPSBzdGFydCA+IGVuZCA/IDAgOiAoKGVuZCAtIHN0YXJ0KSA+Pj4gMCk7XG4gIHN0YXJ0ID4+Pj0gMDtcblxuICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gYXJyYXlbaW5kZXggKyBzdGFydF07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlU2xpY2U7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRpbWVzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHNcbiAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcmVzdWx0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRpbWVzKG4sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBuKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUaW1lcztcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBhcnJheU1hcCA9IHJlcXVpcmUoJy4vX2FycmF5TWFwJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzU3ltYm9sID0gcmVxdWlyZSgnLi9pc1N5bWJvbCcpO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgdmFsdWVzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgcmV0dXJuIGFycmF5TWFwKHZhbHVlLCBiYXNlVG9TdHJpbmcpICsgJyc7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBzeW1ib2xUb1N0cmluZyA/IHN5bWJvbFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUb1N0cmluZztcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVW5hcnk7XG4iLCJ2YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5Jyk7XG5cbi8qKlxuICogQ2FzdHMgYHZhbHVlYCB0byBgaWRlbnRpdHlgIGlmIGl0J3Mgbm90IGEgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgY2FzdCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY2FzdEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlIDogaWRlbnRpdHk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FzdEZ1bmN0aW9uO1xuIiwidmFyIGJhc2VTbGljZSA9IHJlcXVpcmUoJy4vX2Jhc2VTbGljZScpO1xuXG4vKipcbiAqIENhc3RzIGBhcnJheWAgdG8gYSBzbGljZSBpZiBpdCdzIG5lZWRlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IHBvc2l0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtlbmQ9YXJyYXkubGVuZ3RoXSBUaGUgZW5kIHBvc2l0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBjYXN0IHNsaWNlLlxuICovXG5mdW5jdGlvbiBjYXN0U2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW5ndGggOiBlbmQ7XG4gIHJldHVybiAoIXN0YXJ0ICYmIGVuZCA+PSBsZW5ndGgpID8gYXJyYXkgOiBiYXNlU2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNhc3RTbGljZTtcbiIsInZhciBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgYGJhc2VFYWNoYCBvciBgYmFzZUVhY2hSaWdodGAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gZnJvbVJpZ2h0ID8gbGVuZ3RoIDogLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KGNvbGxlY3Rpb24pO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVCYXNlRWFjaDtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIG1ldGhvZHMgbGlrZSBgXy5mb3JJbmAgYW5kIGBfLmZvck93bmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUZvcihmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgaXRlcmF0ZWUsIGtleXNGdW5jKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KG9iamVjdCksXG4gICAgICAgIHByb3BzID0ga2V5c0Z1bmMob2JqZWN0KSxcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbZnJvbVJpZ2h0ID8gbGVuZ3RoIDogKytpbmRleF07XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJhc2VGb3I7XG4iLCJ2YXIgY2FzdFNsaWNlID0gcmVxdWlyZSgnLi9fY2FzdFNsaWNlJyksXG4gICAgaGFzVW5pY29kZSA9IHJlcXVpcmUoJy4vX2hhc1VuaWNvZGUnKSxcbiAgICBzdHJpbmdUb0FycmF5ID0gcmVxdWlyZSgnLi9fc3RyaW5nVG9BcnJheScpLFxuICAgIHRvU3RyaW5nID0gcmVxdWlyZSgnLi90b1N0cmluZycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBsaWtlIGBfLmxvd2VyRmlyc3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZSBUaGUgbmFtZSBvZiB0aGUgYFN0cmluZ2AgY2FzZSBtZXRob2QgdG8gdXNlLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2FzZUZpcnN0KG1ldGhvZE5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG5cbiAgICB2YXIgc3RyU3ltYm9scyA9IGhhc1VuaWNvZGUoc3RyaW5nKVxuICAgICAgPyBzdHJpbmdUb0FycmF5KHN0cmluZylcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgdmFyIGNociA9IHN0clN5bWJvbHNcbiAgICAgID8gc3RyU3ltYm9sc1swXVxuICAgICAgOiBzdHJpbmcuY2hhckF0KDApO1xuXG4gICAgdmFyIHRyYWlsaW5nID0gc3RyU3ltYm9sc1xuICAgICAgPyBjYXN0U2xpY2Uoc3RyU3ltYm9scywgMSkuam9pbignJylcbiAgICAgIDogc3RyaW5nLnNsaWNlKDEpO1xuXG4gICAgcmV0dXJuIGNoclttZXRob2ROYW1lXSgpICsgdHJhaWxpbmc7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQ2FzZUZpcnN0O1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIGNoYXJhY3RlciBjbGFzc2VzLiAqL1xudmFyIHJzQXN0cmFsUmFuZ2UgPSAnXFxcXHVkODAwLVxcXFx1ZGZmZicsXG4gICAgcnNDb21ib01hcmtzUmFuZ2UgPSAnXFxcXHUwMzAwLVxcXFx1MDM2ZicsXG4gICAgcmVDb21ib0hhbGZNYXJrc1JhbmdlID0gJ1xcXFx1ZmUyMC1cXFxcdWZlMmYnLFxuICAgIHJzQ29tYm9TeW1ib2xzUmFuZ2UgPSAnXFxcXHUyMGQwLVxcXFx1MjBmZicsXG4gICAgcnNDb21ib1JhbmdlID0gcnNDb21ib01hcmtzUmFuZ2UgKyByZUNvbWJvSGFsZk1hcmtzUmFuZ2UgKyByc0NvbWJvU3ltYm9sc1JhbmdlLFxuICAgIHJzVmFyUmFuZ2UgPSAnXFxcXHVmZTBlXFxcXHVmZTBmJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIGNhcHR1cmUgZ3JvdXBzLiAqL1xudmFyIHJzWldKID0gJ1xcXFx1MjAwZCc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBzdHJpbmdzIHdpdGggW3plcm8td2lkdGggam9pbmVycyBvciBjb2RlIHBvaW50cyBmcm9tIHRoZSBhc3RyYWwgcGxhbmVzXShodHRwOi8vZWV2LmVlL2Jsb2cvMjAxNS8wOS8xMi9kYXJrLWNvcm5lcnMtb2YtdW5pY29kZS8pLiAqL1xudmFyIHJlSGFzVW5pY29kZSA9IFJlZ0V4cCgnWycgKyByc1pXSiArIHJzQXN0cmFsUmFuZ2UgICsgcnNDb21ib1JhbmdlICsgcnNWYXJSYW5nZSArICddJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBzdHJpbmdgIGNvbnRhaW5zIFVuaWNvZGUgc3ltYm9scy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYSBzeW1ib2wgaXMgZm91bmQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzVW5pY29kZShzdHJpbmcpIHtcbiAgcmV0dXJuIHJlSGFzVW5pY29kZS50ZXN0KHN0cmluZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzVW5pY29kZTtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpICYmXG4gICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSW5kZXg7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNQcm90b3R5cGU7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXM7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJlZVByb2Nlc3MgJiYgZnJlZVByb2Nlc3MuYmluZGluZyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nKCd1dGlsJyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGVVdGlsO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVyQXJnO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIGFzY2lpVG9BcnJheSA9IHJlcXVpcmUoJy4vX2FzY2lpVG9BcnJheScpLFxuICAgIGhhc1VuaWNvZGUgPSByZXF1aXJlKCcuL19oYXNVbmljb2RlJyksXG4gICAgdW5pY29kZVRvQXJyYXkgPSByZXF1aXJlKCcuL191bmljb2RlVG9BcnJheScpO1xuXG4vKipcbiAqIENvbnZlcnRzIGBzdHJpbmdgIHRvIGFuIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY29udmVydGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBzdHJpbmdUb0FycmF5KHN0cmluZykge1xuICByZXR1cm4gaGFzVW5pY29kZShzdHJpbmcpXG4gICAgPyB1bmljb2RlVG9BcnJheShzdHJpbmcpXG4gICAgOiBhc2NpaVRvQXJyYXkoc3RyaW5nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHJpbmdUb0FycmF5O1xuIiwiLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIGNoYXJhY3RlciBjbGFzc2VzLiAqL1xudmFyIHJzQXN0cmFsUmFuZ2UgPSAnXFxcXHVkODAwLVxcXFx1ZGZmZicsXG4gICAgcnNDb21ib01hcmtzUmFuZ2UgPSAnXFxcXHUwMzAwLVxcXFx1MDM2ZicsXG4gICAgcmVDb21ib0hhbGZNYXJrc1JhbmdlID0gJ1xcXFx1ZmUyMC1cXFxcdWZlMmYnLFxuICAgIHJzQ29tYm9TeW1ib2xzUmFuZ2UgPSAnXFxcXHUyMGQwLVxcXFx1MjBmZicsXG4gICAgcnNDb21ib1JhbmdlID0gcnNDb21ib01hcmtzUmFuZ2UgKyByZUNvbWJvSGFsZk1hcmtzUmFuZ2UgKyByc0NvbWJvU3ltYm9sc1JhbmdlLFxuICAgIHJzVmFyUmFuZ2UgPSAnXFxcXHVmZTBlXFxcXHVmZTBmJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIGNhcHR1cmUgZ3JvdXBzLiAqL1xudmFyIHJzQXN0cmFsID0gJ1snICsgcnNBc3RyYWxSYW5nZSArICddJyxcbiAgICByc0NvbWJvID0gJ1snICsgcnNDb21ib1JhbmdlICsgJ10nLFxuICAgIHJzRml0eiA9ICdcXFxcdWQ4M2NbXFxcXHVkZmZiLVxcXFx1ZGZmZl0nLFxuICAgIHJzTW9kaWZpZXIgPSAnKD86JyArIHJzQ29tYm8gKyAnfCcgKyByc0ZpdHogKyAnKScsXG4gICAgcnNOb25Bc3RyYWwgPSAnW14nICsgcnNBc3RyYWxSYW5nZSArICddJyxcbiAgICByc1JlZ2lvbmFsID0gJyg/OlxcXFx1ZDgzY1tcXFxcdWRkZTYtXFxcXHVkZGZmXSl7Mn0nLFxuICAgIHJzU3VyclBhaXIgPSAnW1xcXFx1ZDgwMC1cXFxcdWRiZmZdW1xcXFx1ZGMwMC1cXFxcdWRmZmZdJyxcbiAgICByc1pXSiA9ICdcXFxcdTIwMGQnO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIHVuaWNvZGUgcmVnZXhlcy4gKi9cbnZhciByZU9wdE1vZCA9IHJzTW9kaWZpZXIgKyAnPycsXG4gICAgcnNPcHRWYXIgPSAnWycgKyByc1ZhclJhbmdlICsgJ10/JyxcbiAgICByc09wdEpvaW4gPSAnKD86JyArIHJzWldKICsgJyg/OicgKyBbcnNOb25Bc3RyYWwsIHJzUmVnaW9uYWwsIHJzU3VyclBhaXJdLmpvaW4oJ3wnKSArICcpJyArIHJzT3B0VmFyICsgcmVPcHRNb2QgKyAnKSonLFxuICAgIHJzU2VxID0gcnNPcHRWYXIgKyByZU9wdE1vZCArIHJzT3B0Sm9pbixcbiAgICByc1N5bWJvbCA9ICcoPzonICsgW3JzTm9uQXN0cmFsICsgcnNDb21ibyArICc/JywgcnNDb21ibywgcnNSZWdpb25hbCwgcnNTdXJyUGFpciwgcnNBc3RyYWxdLmpvaW4oJ3wnKSArICcpJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggW3N0cmluZyBzeW1ib2xzXShodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC11bmljb2RlKS4gKi9cbnZhciByZVVuaWNvZGUgPSBSZWdFeHAocnNGaXR6ICsgJyg/PScgKyByc0ZpdHogKyAnKXwnICsgcnNTeW1ib2wgKyByc1NlcSwgJ2cnKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIFVuaWNvZGUgYHN0cmluZ2AgdG8gYW4gYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHVuaWNvZGVUb0FycmF5KHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLm1hdGNoKHJlVW5pY29kZSkgfHwgW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdW5pY29kZVRvQXJyYXk7XG4iLCJ2YXIgYXJyYXlFYWNoID0gcmVxdWlyZSgnLi9fYXJyYXlFYWNoJyksXG4gICAgYmFzZUVhY2ggPSByZXF1aXJlKCcuL19iYXNlRWFjaCcpLFxuICAgIGNhc3RGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2Nhc3RGdW5jdGlvbicpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIGVsZW1lbnQuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqICoqTm90ZToqKiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBcImxlbmd0aFwiXG4gKiBwcm9wZXJ0eSBhcmUgaXRlcmF0ZWQgbGlrZSBhcnJheXMuIFRvIGF2b2lkIHRoaXMgYmVoYXZpb3IgdXNlIGBfLmZvckluYFxuICogb3IgYF8uZm9yT3duYCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAYWxpYXMgZWFjaFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKiBAc2VlIF8uZm9yRWFjaFJpZ2h0XG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZm9yRWFjaChbMSwgMl0sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gKiAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyBgMWAgdGhlbiBgMmAuXG4gKlxuICogXy5mb3JFYWNoKHsgJ2EnOiAxLCAnYic6IDIgfSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaDtcbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgY2FzdEZ1bmN0aW9uKGl0ZXJhdGVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgaXQgcmVjZWl2ZXMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKlxuICogY29uc29sZS5sb2coXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaWRlbnRpdHk7XG4iLCJ2YXIgYmFzZUlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9fYmFzZUlzQXJndW1lbnRzJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5O1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2U7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKSxcbiAgICBzdHViRmFsc2UgPSByZXF1aXJlKCcuL3N0dWJGYWxzZScpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNCdWZmZXI7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3RyaW5nYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3RyaW5nLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTdHJpbmcoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTdHJpbmcoMSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgKCFpc0FycmF5KHZhbHVlKSAmJiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IHN0cmluZ1RhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTdHJpbmc7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTeW1ib2w7XG4iLCJ2YXIgYmFzZUlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Jhc2VJc1R5cGVkQXJyYXknKSxcbiAgICBiYXNlVW5hcnkgPSByZXF1aXJlKCcuL19iYXNlVW5hcnknKSxcbiAgICBub2RlVXRpbCA9IHJlcXVpcmUoJy4vX25vZGVVdGlsJyk7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzVHlwZWRBcnJheSA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzVHlwZWRBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzVHlwZWRBcnJheSA9IG5vZGVJc1R5cGVkQXJyYXkgPyBiYXNlVW5hcnkobm9kZUlzVHlwZWRBcnJheSkgOiBiYXNlSXNUeXBlZEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVHlwZWRBcnJheTtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUtleXMnKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViRmFsc2U7XG4iLCJ2YXIgYmFzZVRvU3RyaW5nID0gcmVxdWlyZSgnLi9fYmFzZVRvU3RyaW5nJyk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1N0cmluZztcbiIsInZhciBjcmVhdGVDYXNlRmlyc3QgPSByZXF1aXJlKCcuL19jcmVhdGVDYXNlRmlyc3QnKTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIGBzdHJpbmdgIHRvIHVwcGVyIGNhc2UuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtzdHJpbmc9JyddIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udXBwZXJGaXJzdCgnZnJlZCcpO1xuICogLy8gPT4gJ0ZyZWQnXG4gKlxuICogXy51cHBlckZpcnN0KCdGUkVEJyk7XG4gKiAvLyA9PiAnRlJFRCdcbiAqL1xudmFyIHVwcGVyRmlyc3QgPSBjcmVhdGVDYXNlRmlyc3QoJ3RvVXBwZXJDYXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdXBwZXJGaXJzdDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvLyBUaGlzIG1ldGhvZCBvZiBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QgbmVlZHMgdG8gYmVcbi8vIGtlcHQgaWRlbnRpY2FsIHRvIHRoZSB3YXkgaXQgaXMgb2J0YWluZWQgaW4gcnVudGltZS5qc1xudmFyIGcgPVxuICB0eXBlb2YgZ2xvYmFsID09PSBcIm9iamVjdFwiID8gZ2xvYmFsIDpcbiAgdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiA/IHdpbmRvdyA6XG4gIHR5cGVvZiBzZWxmID09PSBcIm9iamVjdFwiID8gc2VsZiA6IHRoaXM7XG5cbi8vIFVzZSBgZ2V0T3duUHJvcGVydHlOYW1lc2AgYmVjYXVzZSBub3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgY2FsbGluZ1xuLy8gYGhhc093blByb3BlcnR5YCBvbiB0aGUgZ2xvYmFsIGBzZWxmYCBvYmplY3QgaW4gYSB3b3JrZXIuIFNlZSAjMTgzLlxudmFyIGhhZFJ1bnRpbWUgPSBnLnJlZ2VuZXJhdG9yUnVudGltZSAmJlxuICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhnKS5pbmRleE9mKFwicmVnZW5lcmF0b3JSdW50aW1lXCIpID49IDA7XG5cbi8vIFNhdmUgdGhlIG9sZCByZWdlbmVyYXRvclJ1bnRpbWUgaW4gY2FzZSBpdCBuZWVkcyB0byBiZSByZXN0b3JlZCBsYXRlci5cbnZhciBvbGRSdW50aW1lID0gaGFkUnVudGltZSAmJiBnLnJlZ2VuZXJhdG9yUnVudGltZTtcblxuLy8gRm9yY2UgcmVldmFsdXRhdGlvbiBvZiBydW50aW1lLmpzLlxuZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSB1bmRlZmluZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vcnVudGltZVwiKTtcblxuaWYgKGhhZFJ1bnRpbWUpIHtcbiAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcnVudGltZS5cbiAgZy5yZWdlbmVyYXRvclJ1bnRpbWUgPSBvbGRSdW50aW1lO1xufSBlbHNlIHtcbiAgLy8gUmVtb3ZlIHRoZSBnbG9iYWwgcHJvcGVydHkgYWRkZWQgYnkgcnVudGltZS5qcy5cbiAgdHJ5IHtcbiAgICBkZWxldGUgZy5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIH0gY2F0Y2goZSkge1xuICAgIGcucmVnZW5lcmF0b3JSdW50aW1lID0gdW5kZWZpbmVkO1xuICB9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL21hc3Rlci9MSUNFTlNFIGZpbGUuIEFuXG4gKiBhZGRpdGlvbmFsIGdyYW50IG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW5cbiAqIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4hKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIHZhciBpbk1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCI7XG4gIHZhciBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgaWYgKHJ1bnRpbWUpIHtcbiAgICBpZiAoaW5Nb2R1bGUpIHtcbiAgICAgIC8vIElmIHJlZ2VuZXJhdG9yUnVudGltZSBpcyBkZWZpbmVkIGdsb2JhbGx5IGFuZCB3ZSdyZSBpbiBhIG1vZHVsZSxcbiAgICAgIC8vIG1ha2UgdGhlIGV4cG9ydHMgb2JqZWN0IGlkZW50aWNhbCB0byByZWdlbmVyYXRvclJ1bnRpbWUuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJ1bnRpbWU7XG4gICAgfVxuICAgIC8vIERvbid0IGJvdGhlciBldmFsdWF0aW5nIHRoZSByZXN0IG9mIHRoaXMgZmlsZSBpZiB0aGUgcnVudGltZSB3YXNcbiAgICAvLyBhbHJlYWR5IGRlZmluZWQgZ2xvYmFsbHkuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRGVmaW5lIHRoZSBydW50aW1lIGdsb2JhbGx5IChhcyBleHBlY3RlZCBieSBnZW5lcmF0ZWQgY29kZSkgYXMgZWl0aGVyXG4gIC8vIG1vZHVsZS5leHBvcnRzIChpZiB3ZSdyZSBpbiBhIG1vZHVsZSkgb3IgYSBuZXcsIGVtcHR5IG9iamVjdC5cbiAgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWUgPSBpbk1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDoge307XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgcnVudGltZS53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGVbdG9TdHJpbmdUYWdTeW1ib2xdID1cbiAgICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBydW50aW1lLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGlmICghKHRvU3RyaW5nVGFnU3ltYm9sIGluIGdlbkZ1bikpIHtcbiAgICAgICAgZ2VuRnVuW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgcnVudGltZS5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uIElmIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkLCBob3dldmVyLCB0aGVcbiAgICAgICAgICAvLyByZXN1bHQgZm9yIHRoaXMgaXRlcmF0aW9uIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCB0aGUgc2FtZVxuICAgICAgICAgIC8vIHJlYXNvbi4gTm90ZSB0aGF0IHJlamVjdGlvbnMgb2YgeWllbGRlZCBQcm9taXNlcyBhcmUgbm90XG4gICAgICAgICAgLy8gdGhyb3duIGJhY2sgaW50byB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uLCBhcyBpcyB0aGUgY2FzZVxuICAgICAgICAgIC8vIHdoZW4gYW4gYXdhaXRlZCBQcm9taXNlIGlzIHJlamVjdGVkLiBUaGlzIGRpZmZlcmVuY2UgaW5cbiAgICAgICAgICAvLyBiZWhhdmlvciBiZXR3ZWVuIHlpZWxkIGFuZCBhd2FpdCBpcyBpbXBvcnRhbnQsIGJlY2F1c2UgaXRcbiAgICAgICAgICAvLyBhbGxvd3MgdGhlIGNvbnN1bWVyIHRvIGRlY2lkZSB3aGF0IHRvIGRvIHdpdGggdGhlIHlpZWxkZWRcbiAgICAgICAgICAvLyByZWplY3Rpb24gKHN3YWxsb3cgaXQgYW5kIGNvbnRpbnVlLCBtYW51YWxseSAudGhyb3cgaXQgYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGdlbmVyYXRvciwgYWJhbmRvbiBpdGVyYXRpb24sIHdoYXRldmVyKS4gV2l0aFxuICAgICAgICAgIC8vIGF3YWl0LCBieSBjb250cmFzdCwgdGhlcmUgaXMgbm8gb3Bwb3J0dW5pdHkgdG8gZXhhbWluZSB0aGVcbiAgICAgICAgICAvLyByZWplY3Rpb24gcmVhc29uIG91dHNpZGUgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgc28gdGhlXG4gICAgICAgICAgLy8gb25seSBvcHRpb24gaXMgdG8gdGhyb3cgaXQgZnJvbSB0aGUgYXdhaXQgZXhwcmVzc2lvbiwgYW5kXG4gICAgICAgICAgLy8gbGV0IHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24gaGFuZGxlIHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2Vzcy5kb21haW4pIHtcbiAgICAgIGludm9rZSA9IHByb2Nlc3MuZG9tYWluLmJpbmQoaW52b2tlKTtcbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIHJ1bnRpbWUuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIHJ1bnRpbWUuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KVxuICAgICk7XG5cbiAgICByZXR1cm4gcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIiB8fFxuICAgICAgICAgICAgICAobWV0aG9kID09PSBcInRocm93XCIgJiYgZGVsZWdhdGUuaXRlcmF0b3JbbWV0aG9kXSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgLy8gQSByZXR1cm4gb3IgdGhyb3cgKHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyB0aHJvd1xuICAgICAgICAgICAgLy8gbWV0aG9kKSBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgICAgdmFyIHJldHVybk1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdO1xuICAgICAgICAgICAgaWYgKHJldHVybk1ldGhvZCkge1xuICAgICAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gocmV0dXJuTWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgYXJnKTtcbiAgICAgICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcmV0dXJuIG1ldGhvZCB0aHJldyBhbiBleGNlcHRpb24sIGxldCB0aGF0XG4gICAgICAgICAgICAgICAgLy8gZXhjZXB0aW9uIHByZXZhaWwgb3ZlciB0aGUgb3JpZ2luYWwgcmV0dXJuIG9yIHRocm93LlxuICAgICAgICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICAgICAgLy8gQ29udGludWUgd2l0aCB0aGUgb3V0ZXIgcmV0dXJuLCBub3cgdGhhdCB0aGUgZGVsZWdhdGVcbiAgICAgICAgICAgICAgLy8gaXRlcmF0b3IgaGFzIGJlZW4gdGVybWluYXRlZC5cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3JbbWV0aG9kXSxcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yLFxuICAgICAgICAgICAgYXJnXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gTGlrZSByZXR1cm5pbmcgZ2VuZXJhdG9yLnRocm93KHVuY2F1Z2h0KSwgYnV0IHdpdGhvdXQgdGhlXG4gICAgICAgICAgICAvLyBvdmVyaGVhZCBvZiBhbiBleHRyYSBmdW5jdGlvbiBjYWxsLlxuICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIERlbGVnYXRlIGdlbmVyYXRvciByYW4gYW5kIGhhbmRsZWQgaXRzIG93biBleGNlcHRpb25zIHNvXG4gICAgICAgICAgLy8gcmVnYXJkbGVzcyBvZiB3aGF0IHRoZSBtZXRob2Qgd2FzLCB3ZSBjb250aW51ZSBhcyBpZiBpdCBpc1xuICAgICAgICAgIC8vIFwibmV4dFwiIHdpdGggYW4gdW5kZWZpbmVkIGFyZy5cbiAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG4gICAgICAgICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBhcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIHZhciBpbmZvID0ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmRlbGVnYXRlICYmIG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG4gICAgICAgIHJldHVybiAhIWNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gQW1vbmcgdGhlIHZhcmlvdXMgdHJpY2tzIGZvciBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbFxuICAvLyBvYmplY3QsIHRoaXMgc2VlbXMgdG8gYmUgdGhlIG1vc3QgcmVsaWFibGUgdGVjaG5pcXVlIHRoYXQgZG9lcyBub3RcbiAgLy8gdXNlIGluZGlyZWN0IGV2YWwgKHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5KS5cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOlxuICB0eXBlb2Ygc2VsZiA9PT0gXCJvYmplY3RcIiA/IHNlbGYgOiB0aGlzXG4pO1xuIiwiLyoqXG4qIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9nYWp1cy9zaXN0ZXIgZm9yIHRoZSBjYW5vbmljYWwgc291cmNlIHJlcG9zaXRvcnlcbiogQGxpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL2dhanVzL3Npc3Rlci9ibG9iL21hc3Rlci9MSUNFTlNFIEJTRCAzLUNsYXVzZVxuKi9cbmZ1bmN0aW9uIFNpc3RlciAoKSB7XG4gICAgdmFyIHNpc3RlciA9IHt9LFxuICAgICAgICBldmVudHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEBuYW1lIGhhbmRsZXJcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBFdmVudCBkYXRhLlxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgRXZlbnQgbmFtZS5cbiAgICAgKiBAcGFyYW0ge2hhbmRsZXJ9IGhhbmRsZXJcbiAgICAgKiBAcmV0dXJuIHtsaXN0ZW5lcn1cbiAgICAgKi9cbiAgICBzaXN0ZXIub24gPSBmdW5jdGlvbiAobmFtZSwgaGFuZGxlcikge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB7bmFtZTogbmFtZSwgaGFuZGxlcjogaGFuZGxlcn07XG4gICAgICAgIGV2ZW50c1tuYW1lXSA9IGV2ZW50c1tuYW1lXSB8fCBbXTtcbiAgICAgICAgZXZlbnRzW25hbWVdLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7bGlzdGVuZXJ9XG4gICAgICovXG4gICAgc2lzdGVyLm9mZiA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICB2YXIgaW5kZXggPSBldmVudHNbbGlzdGVuZXIubmFtZV0uaW5kZXhPZihsaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgICAgICBldmVudHNbbGlzdGVuZXIubmFtZV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBFdmVudCBuYW1lLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIEV2ZW50IGRhdGEuXG4gICAgICovXG4gICAgc2lzdGVyLnRyaWdnZXIgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSkge1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gZXZlbnRzW25hbWVdLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uaGFuZGxlcihkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gc2lzdGVyO1xufVxuXG5nbG9iYWwuZ2FqdXMgPSBnbG9iYWwuZ2FqdXMgfHwge307XG5nbG9iYWwuZ2FqdXMuU2lzdGVyID0gU2lzdGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpc3RlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVnZW5lcmF0b3IgPSByZXF1aXJlKCdiYWJlbC1ydW50aW1lL3JlZ2VuZXJhdG9yJyk7XG5cbnZhciBfcmVnZW5lcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVnZW5lcmF0b3IpO1xuXG52YXIgX2FzeW5jVG9HZW5lcmF0b3IyID0gcmVxdWlyZSgnYmFiZWwtcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3InKTtcblxudmFyIF9hc3luY1RvR2VuZXJhdG9yMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FzeW5jVG9HZW5lcmF0b3IyKTtcblxudmFyIF91cHBlckZpcnN0MiA9IHJlcXVpcmUoJ2xvZGFzaC91cHBlckZpcnN0Jyk7XG5cbnZhciBfdXBwZXJGaXJzdDMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF91cHBlckZpcnN0Mik7XG5cbnZhciBfZm9yRWFjaDIgPSByZXF1aXJlKCdsb2Rhc2gvZm9yRWFjaCcpO1xuXG52YXIgX2ZvckVhY2gzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZm9yRWFjaDIpO1xuXG52YXIgX2Z1bmN0aW9uTmFtZXMgPSByZXF1aXJlKCcuL2Z1bmN0aW9uTmFtZXMnKTtcblxudmFyIF9mdW5jdGlvbk5hbWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Z1bmN0aW9uTmFtZXMpO1xuXG52YXIgX2V2ZW50TmFtZXMgPSByZXF1aXJlKCcuL2V2ZW50TmFtZXMnKTtcblxudmFyIF9ldmVudE5hbWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2V2ZW50TmFtZXMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgWW91VHViZVBsYXllciA9IHt9O1xuXG4vKipcbiAqIENvbnN0cnVjdCBhbiBvYmplY3QgdGhhdCBkZWZpbmVzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIGFsbCBvZiB0aGUgWW91VHViZVxuICogcGxheWVyIGV2ZW50cy4gUHJveHkgY2FwdHVyZWQgZXZlbnRzIHRocm91Z2ggYW4gZXZlbnQgZW1pdHRlci5cbiAqXG4gKiBAdG9kbyBDYXB0dXJlIGV2ZW50IHBhcmFtZXRlcnMuXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3lvdXR1YmUvaWZyYW1lX2FwaV9yZWZlcmVuY2UjRXZlbnRzXG4gKiBAcGFyYW0ge1Npc3Rlcn0gZW1pdHRlclxuICogQHJldHVybnMge09iamVjdH1cbiAqL1xuWW91VHViZVBsYXllci5wcm94eUV2ZW50cyA9IGZ1bmN0aW9uIChlbWl0dGVyKSB7XG4gIHZhciBldmVudHMgPSB7fTtcblxuICAoMCwgX2ZvckVhY2gzLmRlZmF1bHQpKF9ldmVudE5hbWVzMi5kZWZhdWx0LCBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgdmFyIG9uRXZlbnROYW1lID0gJ29uJyArICgwLCBfdXBwZXJGaXJzdDMuZGVmYXVsdCkoZXZlbnROYW1lKTtcblxuICAgIGV2ZW50c1tvbkV2ZW50TmFtZV0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGVtaXR0ZXIudHJpZ2dlcihldmVudE5hbWUsIGV2ZW50KTtcbiAgICB9O1xuICB9KTtcblxuICByZXR1cm4gZXZlbnRzO1xufTtcblxuLyoqXG4gKiBEZWxheXMgcGxheWVyIEFQSSBtZXRob2QgZXhlY3V0aW9uIHVudGlsIHBsYXllciBzdGF0ZSBpcyByZWFkeS5cbiAqXG4gKiBAdG9kbyBQcm94eSBhbGwgb2YgdGhlIG1ldGhvZHMgdXNpbmcgT2JqZWN0LmtleXMuXG4gKiBAdG9kbyBTZWUgVFJJQ0tZIGJlbG93LlxuICogQHBhcmFtIHtQcm9taXNlfSBwbGF5ZXJBUElSZWFkeSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBwbGF5ZXIgaXMgcmVhZHkuXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5Zb3VUdWJlUGxheWVyLnByb21pc2lmeVBsYXllciA9IGZ1bmN0aW9uIChwbGF5ZXJBUElSZWFkeSkge1xuICB2YXIgZnVuY3Rpb25zID0ge307XG5cbiAgKDAsIF9mb3JFYWNoMy5kZWZhdWx0KShfZnVuY3Rpb25OYW1lczIuZGVmYXVsdCwgZnVuY3Rpb24gKGZ1bmN0aW9uTmFtZSkge1xuICAgIGZ1bmN0aW9uc1tmdW5jdGlvbk5hbWVdID0gKDAsIF9hc3luY1RvR2VuZXJhdG9yMy5kZWZhdWx0KShfcmVnZW5lcmF0b3IyLmRlZmF1bHQubWFyayhmdW5jdGlvbiBfY2FsbGVlKCkge1xuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBsYXllcjtcbiAgICAgIHJldHVybiBfcmVnZW5lcmF0b3IyLmRlZmF1bHQud3JhcChmdW5jdGlvbiBfY2FsbGVlJChfY29udGV4dCkge1xuICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQucHJldiA9IF9jb250ZXh0Lm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiBwbGF5ZXJBUElSZWFkeTtcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICBwbGF5ZXIgPSBfY29udGV4dC5zZW50O1xuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuYWJydXB0KCdyZXR1cm4nLCBwbGF5ZXJbZnVuY3Rpb25OYW1lXS5hcHBseShwbGF5ZXIsIGFyZ3MpKTtcblxuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0LnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIF9jYWxsZWUsIHVuZGVmaW5lZCk7XG4gICAgfSkpO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb25zO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gWW91VHViZVBsYXllcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS95b3V0dWJlL2lmcmFtZV9hcGlfcmVmZXJlbmNlI0V2ZW50c1xuICovXG5leHBvcnRzLmRlZmF1bHQgPSBbJ3JlYWR5JywgJ3N0YXRlQ2hhbmdlJywgJ3BsYXliYWNrUXVhbGl0eUNoYW5nZScsICdwbGF5YmFja1JhdGVDaGFuZ2UnLCAnZXJyb3InLCAnYXBpQ2hhbmdlJ107XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20veW91dHViZS9pZnJhbWVfYXBpX3JlZmVyZW5jZSNGdW5jdGlvbnNcbiAqL1xuZXhwb3J0cy5kZWZhdWx0ID0gWydjdWVWaWRlb0J5SWQnLCAnbG9hZFZpZGVvQnlJZCcsICdjdWVWaWRlb0J5VXJsJywgJ2xvYWRWaWRlb0J5VXJsJywgJ3BsYXlWaWRlbycsICdwYXVzZVZpZGVvJywgJ3N0b3BWaWRlbycsICdjbGVhclZpZGVvJywgJ2dldFZpZGVvQnl0ZXNMb2FkZWQnLCAnZ2V0VmlkZW9CeXRlc1RvdGFsJywgJ2dldFZpZGVvTG9hZGVkRnJhY3Rpb24nLCAnZ2V0VmlkZW9TdGFydEJ5dGVzJywgJ2N1ZVBsYXlsaXN0JywgJ2xvYWRQbGF5bGlzdCcsICduZXh0VmlkZW8nLCAncHJldmlvdXNWaWRlbycsICdwbGF5VmlkZW9BdCcsICdzZXRTaHVmZmxlJywgJ3NldExvb3AnLCAnZ2V0UGxheWxpc3QnLCAnZ2V0UGxheWxpc3RJbmRleCcsICdnZXRQbGF5bGlzdElkJywgJ2xvYWRNb2R1bGUnLCAndW5sb2FkTW9kdWxlJywgJ3NldE9wdGlvbicsICdtdXRlJywgJ3VuTXV0ZScsICdpc011dGVkJywgJ3NldFZvbHVtZScsICdnZXRWb2x1bWUnLCAnc2Vla1RvJywgJ2dldFBsYXllclN0YXRlJywgJ2dldFBsYXliYWNrUmF0ZScsICdzZXRQbGF5YmFja1JhdGUnLCAnZ2V0QXZhaWxhYmxlUGxheWJhY2tSYXRlcycsICdnZXRQbGF5YmFja1F1YWxpdHknLCAnc2V0UGxheWJhY2tRdWFsaXR5JywgJ2dldEF2YWlsYWJsZVF1YWxpdHlMZXZlbHMnLCAnZ2V0Q3VycmVudFRpbWUnLCAnZ2V0RHVyYXRpb24nLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdnZXRWaWRlb1VybCcsICdnZXREZWJ1Z1RleHQnLCAnZ2V0VmlkZW9EYXRhJywgJ2FkZEN1ZVJhbmdlJywgJ3JlbW92ZUN1ZVJhbmdlJywgJ2dldEFwaUludGVyZmFjZScsICdzaG93VmlkZW9JbmZvJywgJ2hpZGVWaWRlb0luZm8nLCAnRycsICdDJywgJ1InLCAnYWEnLCAnJCcsICdaJywgJ2dldFZpZGVvRW1iZWRDb2RlJywgJ2dldE9wdGlvbnMnLCAnZ2V0T3B0aW9uJywgJ1knLCAnWCcsICdhZGRFdmVudExpc3RlbmVyJywgJ2Rlc3Ryb3knLCAnQScsICdQJywgJ0onLCAnc2V0U2l6ZScsICdnZXRJZnJhbWUnXTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWdlbmVyYXRvciA9IHJlcXVpcmUoJ2JhYmVsLXJ1bnRpbWUvcmVnZW5lcmF0b3InKTtcblxudmFyIF9yZWdlbmVyYXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWdlbmVyYXRvcik7XG5cbnZhciBfYXN5bmNUb0dlbmVyYXRvcjIgPSByZXF1aXJlKCdiYWJlbC1ydW50aW1lL2hlbHBlcnMvYXN5bmNUb0dlbmVyYXRvcicpO1xuXG52YXIgX2FzeW5jVG9HZW5lcmF0b3IzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXN5bmNUb0dlbmVyYXRvcjIpO1xuXG52YXIgX3Byb21pc2UgPSByZXF1aXJlKCdiYWJlbC1ydW50aW1lL2NvcmUtanMvcHJvbWlzZScpO1xuXG52YXIgX3Byb21pc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvbWlzZSk7XG5cbnZhciBfaXNTdHJpbmcyID0gcmVxdWlyZSgnbG9kYXNoL2lzU3RyaW5nJyk7XG5cbnZhciBfaXNTdHJpbmczID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNTdHJpbmcyKTtcblxudmFyIF9zaXN0ZXIgPSByZXF1aXJlKCdzaXN0ZXInKTtcblxudmFyIF9zaXN0ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2lzdGVyKTtcblxudmFyIF9sb2FkWW91VHViZUlmcmFtZUFwaSA9IHJlcXVpcmUoJy4vbG9hZFlvdVR1YmVJZnJhbWVBcGknKTtcblxudmFyIF9sb2FkWW91VHViZUlmcmFtZUFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2FkWW91VHViZUlmcmFtZUFwaSk7XG5cbnZhciBfWW91VHViZVBsYXllciA9IHJlcXVpcmUoJy4vWW91VHViZVBsYXllcicpO1xuXG52YXIgX1lvdVR1YmVQbGF5ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfWW91VHViZVBsYXllcik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKlxuICogQHR5cGVkZWYgb3B0aW9uc1xuICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS95b3V0dWJlL2lmcmFtZV9hcGlfcmVmZXJlbmNlI0xvYWRpbmdfYV9WaWRlb19QbGF5ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodFxuICogQHBhcmFtIHtTdHJpbmd9IHZpZGVvSWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBwbGF5ZXJWYXJzXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRzXG4gKi9cbnZhciB5b3V0dWJlSWZyYW1lQVBJID0gdm9pZCAwO1xuXG4vKipcbiAqIEEgZmFjdG9yeSBmdW5jdGlvbiB1c2VkIHRvIHByb2R1Y2UgYW4gaW5zdGFuY2Ugb2YgWVQuUGxheWVyIGFuZCBxdWV1ZSBmdW5jdGlvbiBjYWxscyBhbmQgcHJveHkgZXZlbnRzIG9mIHRoZSByZXN1bHRpbmcgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8U3RyaW5nfSBlbGVtZW50SWQgRWl0aGVyIHRoZSBET00gZWxlbWVudCBvciB0aGUgaWQgb2YgdGhlIEhUTUwgZWxlbWVudCB3aGVyZSB0aGUgQVBJIHdpbGwgaW5zZXJ0IGFuIDxpZnJhbWU+LlxuICogQHBhcmFtIHtZb3VUdWJlUGxheWVyfm9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKGVsZW1lbnRJZCkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgdmFyIGVtaXR0ZXIgPSAoMCwgX3Npc3RlcjIuZGVmYXVsdCkoKTtcblxuICBpZiAoIXlvdXR1YmVJZnJhbWVBUEkpIHtcbiAgICB5b3V0dWJlSWZyYW1lQVBJID0gKDAsIF9sb2FkWW91VHViZUlmcmFtZUFwaTIuZGVmYXVsdCkoKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmV2ZW50cykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXZlbnQgaGFuZGxlcnMgY2Fubm90IGJlIG92ZXJ3cml0dGVuLicpO1xuICB9XG5cbiAgaWYgKCgwLCBfaXNTdHJpbmczLmRlZmF1bHQpKGVsZW1lbnRJZCkgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VsZW1lbnQgXCInICsgZWxlbWVudElkICsgJ1wiIGRvZXMgbm90IGV4aXN0LicpO1xuICB9XG5cbiAgb3B0aW9ucy5ldmVudHMgPSBfWW91VHViZVBsYXllcjIuZGVmYXVsdC5wcm94eUV2ZW50cyhlbWl0dGVyKTtcblxuICB2YXIgcGxheWVyQVBJUmVhZHkgPSBuZXcgX3Byb21pc2UyLmRlZmF1bHQoZnVuY3Rpb24gKCkge1xuICAgIHZhciBfcmVmID0gKDAsIF9hc3luY1RvR2VuZXJhdG9yMy5kZWZhdWx0KShfcmVnZW5lcmF0b3IyLmRlZmF1bHQubWFyayhmdW5jdGlvbiBfY2FsbGVlKHJlc29sdmUpIHtcbiAgICAgIHZhciBZVCwgcGxheWVyO1xuICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvcjIuZGVmYXVsdC53cmFwKGZ1bmN0aW9uIF9jYWxsZWUkKF9jb250ZXh0KSB7XG4gICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgc3dpdGNoIChfY29udGV4dC5wcmV2ID0gX2NvbnRleHQubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBfY29udGV4dC5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHlvdXR1YmVJZnJhbWVBUEk7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgWVQgPSBfY29udGV4dC5zZW50O1xuICAgICAgICAgICAgICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKGVsZW1lbnRJZCwgb3B0aW9ucyk7XG5cblxuICAgICAgICAgICAgICBlbWl0dGVyLm9uKCdyZWFkeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBsYXllcik7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgX2NhbGxlZSwgdW5kZWZpbmVkKTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKF94Mikge1xuICAgICAgcmV0dXJuIF9yZWYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9KCkpO1xuXG4gIHZhciBwbGF5ZXJBUEkgPSBfWW91VHViZVBsYXllcjIuZGVmYXVsdC5wcm9taXNpZnlQbGF5ZXIocGxheWVyQVBJUmVhZHkpO1xuXG4gIHBsYXllckFQSS5vbiA9IGVtaXR0ZXIub247XG4gIHBsYXllckFQSS5vZmYgPSBlbWl0dGVyLm9mZjtcblxuICByZXR1cm4gcGxheWVyQVBJO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3Byb21pc2UgPSByZXF1aXJlKCdiYWJlbC1ydW50aW1lL2NvcmUtanMvcHJvbWlzZScpO1xuXG52YXIgX3Byb21pc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvbWlzZSk7XG5cbnZhciBfbG9hZFNjcmlwdCA9IHJlcXVpcmUoJ2xvYWQtc2NyaXB0Jyk7XG5cbnZhciBfbG9hZFNjcmlwdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2FkU2NyaXB0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB3aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgaXMgY2FsbGVkLlxuICAgKiBUaGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIGEgcmVmZXJlbmNlIHRvIHdpbmRvdy5ZVCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmVcbiAgICogQG1lbWJlciB7T2JqZWN0fSBpZnJhbWVBUElSZWFkeVxuICAgKi9cbiAgdmFyIGlmcmFtZUFQSVJlYWR5ID0gbmV3IF9wcm9taXNlMi5kZWZhdWx0KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgaWYgKHdpbmRvdy5ZVCAmJiB3aW5kb3cuWVQuUGxheWVyICYmIHdpbmRvdy5ZVC5QbGF5ZXIgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmVzb2x2ZSh3aW5kb3cuWVQpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzID0gd2luZG93Lm9uWW91VHViZUlmcmFtZUFQSVJlYWR5O1xuXG4gICAgLy8gVGhlIEFQSSB3aWxsIGNhbGwgdGhpcyBmdW5jdGlvbiB3aGVuIHBhZ2UgaGFzIGZpbmlzaGVkIGRvd25sb2FkaW5nXG4gICAgLy8gdGhlIEphdmFTY3JpcHQgZm9yIHRoZSBwbGF5ZXIgQVBJLlxuICAgIHdpbmRvdy5vbllvdVR1YmVJZnJhbWVBUElSZWFkeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChwcmV2aW91cykge1xuICAgICAgICBwcmV2aW91cygpO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlKHdpbmRvdy5ZVCk7XG4gICAgfTtcbiAgfSk7XG4gIHZhciBwcm90b2NvbCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHA6JyA/ICdodHRwOicgOiAnaHR0cHM6JztcblxuICAoMCwgX2xvYWRTY3JpcHQyLmRlZmF1bHQpKHByb3RvY29sICsgJy8vd3d3LnlvdXR1YmUuY29tL2lmcmFtZV9hcGknKTtcblxuICByZXR1cm4gaWZyYW1lQVBJUmVhZHk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZXRhZ1wiOiBcIlwiLFxuICBcIml0ZW1zXCI6IFtcbiAgICB7XG4gICAgICBcImlkXCI6ICBcIlVDQVo3N3ZkcVlidUdiQ0FXQjYyV2JxUVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkNoYW5uZWwgMVwiLFxuICAgICAgXCJ0aHVtYm5haWxzXCI6IHtcbiAgICAgICAgXCJoaWdoXCI6IHtcbiAgICAgICAgICBcInVybFwiOiBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvMTUweDE1MFwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogIFwiVUNBWjc3dmRxWWJ1R2JDQVdCNjJXYnFRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQ2hhbm5lbCAyXCIsXG4gICAgICBcInRodW1ibmFpbHNcIjoge1xuICAgICAgICBcImhpZ2hcIjoge1xuICAgICAgICAgIFwidXJsXCI6IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xNTB4MTUwXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiAgXCJVQ0FaNzd2ZHFZYnVHYkNBV0I2MldicVFcIixcbiAgICAgIFwidGl0bGVcIjogXCJDaGFubmVsIDNcIixcbiAgICAgIFwidGh1bWJuYWlsc1wiOiB7XG4gICAgICAgIFwiaGlnaFwiOiB7XG4gICAgICAgICAgXCJ1cmxcIjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzE1MHgxNTBcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6ICBcIlVDQVo3N3ZkcVlidUdiQ0FXQjYyV2JxUVwiLFxuICAgICAgXCJ0aXRsZVwiOiBcIkNoYW5uZWwgNFwiLFxuICAgICAgXCJ0aHVtYm5haWxzXCI6IHtcbiAgICAgICAgXCJoaWdoXCI6IHtcbiAgICAgICAgICBcInVybFwiOiBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvMTUweDE1MFwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogIFwiVUNBWjc3dmRxWWJ1R2JDQVdCNjJXYnFRXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQ2hhbm5lbCA1XCIsXG4gICAgICBcInRodW1ibmFpbHNcIjoge1xuICAgICAgICBcImhpZ2hcIjoge1xuICAgICAgICAgIFwidXJsXCI6IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xNTB4MTUwXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiAgXCJVQ0FaNzd2ZHFZYnVHYkNBV0I2MldicVFcIixcbiAgICAgIFwidGl0bGVcIjogXCJDaGFubmVsIDZcIixcbiAgICAgIFwidGh1bWJuYWlsc1wiOiB7XG4gICAgICAgIFwiaGlnaFwiOiB7XG4gICAgICAgICAgXCJ1cmxcIjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzE1MHgxNTBcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgXSxcbiAgXCJuZXh0UGFnZVRva2VuXCI6IFwiXCIsXG4gIFwicGFnZUluZm9cIjoge1xuICAgIFwicmVzdWx0c1BlclBhZ2VcIjogXCJcIixcbiAgICBcInRvdGFsUmVzdWx0c1wiOiBcIlwiXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJpdGVtc1wiOiBbXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiQ3owTE51N285cDhcIixcbiAgICAgIFwidGl0bGVcIjogXCJFbGlyYW4gQmVuIElzaGFpIC0gVHJhdmVsbGluZyBGYXIgaW4gU2hvcnQgU3RyaWRlc1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcImVsanBVaGZscUdZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQmVhdCBQbGFzdGljIC0gQXV0b21hdGljXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiT3V1dExHdWdaMFlcIixcbiAgICAgIFwidGl0bGVcIjogXCJOYXRoYW4gRGFuZHkgLSBDYXQgVmlzaW9uXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwidmV6WjU2YUNRWlFcIixcbiAgICAgIFwidGl0bGVcIjogXCJKdW5vIERyZWFtcyAtIEJlIFdpdGggTWVcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCIyTXlBRklYbDVxb1wiLFxuICAgICAgXCJ0aXRsZVwiOiBcIldhdmVzaGFwZXIgLSBGdXR1cmUgVmlzaW9uXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiQ3owTE51N285cDhcIixcbiAgICAgIFwidGl0bGVcIjogXCJFbGlyYW4gQmVuIElzaGFpIC0gVHJhdmVsbGluZyBGYXIgaW4gU2hvcnQgU3RyaWRlc1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcImVsanBVaGZscUdZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQmVhdCBQbGFzdGljIC0gQXV0b21hdGljXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiT3V1dExHdWdaMFlcIixcbiAgICAgIFwidGl0bGVcIjogXCJOYXRoYW4gRGFuZHkgLSBDYXQgVmlzaW9uXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwidmV6WjU2YUNRWlFcIixcbiAgICAgIFwidGl0bGVcIjogXCJKdW5vIERyZWFtcyAtIEJlIFdpdGggTWVcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCIyTXlBRklYbDVxb1wiLFxuICAgICAgXCJ0aXRsZVwiOiBcIldhdmVzaGFwZXIgLSBGdXR1cmUgVmlzaW9uXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiQ3owTE51N285cDhcIixcbiAgICAgIFwidGl0bGVcIjogXCJFbGlyYW4gQmVuIElzaGFpIC0gVHJhdmVsbGluZyBGYXIgaW4gU2hvcnQgU3RyaWRlc1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcImVsanBVaGZscUdZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQmVhdCBQbGFzdGljIC0gQXV0b21hdGljXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiT3V1dExHdWdaMFlcIixcbiAgICAgIFwidGl0bGVcIjogXCJOYXRoYW4gRGFuZHkgLSBDYXQgVmlzaW9uXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwidmV6WjU2YUNRWlFcIixcbiAgICAgIFwidGl0bGVcIjogXCJKdW5vIERyZWFtcyAtIEJlIFdpdGggTWVcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCIyTXlBRklYbDVxb1wiLFxuICAgICAgXCJ0aXRsZVwiOiBcIldhdmVzaGFwZXIgLSBGdXR1cmUgVmlzaW9uXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiQ3owTE51N285cDhcIixcbiAgICAgIFwidGl0bGVcIjogXCJFbGlyYW4gQmVuIElzaGFpIC0gVHJhdmVsbGluZyBGYXIgaW4gU2hvcnQgU3RyaWRlc1wiXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwidmlkZW9JZFwiOiBcImVsanBVaGZscUdZXCIsXG4gICAgICBcInRpdGxlXCI6IFwiQmVhdCBQbGFzdGljIC0gQXV0b21hdGljXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwiT3V1dExHdWdaMFlcIixcbiAgICAgIFwidGl0bGVcIjogXCJOYXRoYW4gRGFuZHkgLSBDYXQgVmlzaW9uXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJ2aWRlb0lkXCI6IFwidmV6WjU2YUNRWlFcIixcbiAgICAgIFwidGl0bGVcIjogXCJKdW5vIERyZWFtcyAtIEJlIFdpdGggTWVcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcInZpZGVvSWRcIjogXCIyTXlBRklYbDVxb1wiLFxuICAgICAgXCJ0aXRsZVwiOiBcIldhdmVzaGFwZXIgLSBGdXR1cmUgVmlzaW9uXCJcbiAgICB9XG4gIF0sXG4gIFwibmV4dFBhZ2VUb2tlblwiOiBcIlwiLFxuICBcInBhZ2VJbmZvXCI6IHtcbiAgICBcInJlc3VsdHNQZXJQYWdlXCI6IFwiXCIsXG4gICAgXCJ0b3RhbFJlc3VsdHNcIjogXCJcIlxuICB9XG59XG4iLCJsZXQgY2hhbm5lbHMgPSByZXF1aXJlKCcuLi9maXh0dXJlcy9jaGFubmVscycpXG5sZXQgdmlkZW9zID0gcmVxdWlyZSgnLi4vZml4dHVyZXMvdmlkZW9zJylcblxuZnVuY3Rpb24gZ2V0Q29udGVudChxKSB7XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2hhbm5lbHMpXG59XG5cbmZ1bmN0aW9uIGdldFBsYXlsaXN0KCkge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZpZGVvcylcbn1cblxuZnVuY3Rpb24gZ2V0UGxheWxpc3RzQnlDaGFubmVsKCkge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYW5uZWxzKVxufVxuXG5leHBvcnQge1xuICBnZXRDb250ZW50LFxuICBnZXRQbGF5bGlzdCxcbiAgZ2V0UGxheWxpc3RzQnlDaGFubmVsXG59XG4iXX0=
