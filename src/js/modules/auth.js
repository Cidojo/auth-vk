import debounce from 'debounce';

const API_ID = 7351903;
const SEARCH_TIMEOUT = 500;

const SessionStatus = {
  CONNECTED: 'connected',
  NOT_AUTHORIZED: 'not_authorized',
  UNKNOWN: 'unknown'
};

const ApiSettings = {
  FRIENDS_SEARCH: {
    user_id: '',
    count: 1000, // max
    fields: 'id, lists, domain, photo_50',
    q: '',
    v: 5.103
  },
  USER_DATA: {
    user_ids: '',
    fields: 'photo_max',
    v: 5.103
  },
  FRIENDS_GET: {
    user_id: '',
    order: 'number',
    fields: 'id, lists, domain, photo_50',
    count: '5000', // max
    v: 5.103
  }
};

class Auth {
  _api = window.VK;

  constructor (settings) {
    const {
      loginEl,
      logoutEl,
      searchInputEl,
      onLogout,
      onLogin,
      onUserData
    } = settings;

    this.userData = {
      'photo_200': '',
      'first_name': '',
      'last_name': ''
    };

    this.loginButton = loginEl;
    this.logoutButton = logoutEl;
    this.searchField = searchInputEl;

    this.onLogout = onLogout;
    this.onLogin = onLogin;
    this.onUserData = onUserData;
  }

  login = (e) => {
    e.preventDefault();

    this._api.Auth.login(this.handleLoginStatus, this._api.access.FRIENDS);
  };

  logout = (e) => {
    e.preventDefault();
    this._api.Auth.logout();

    this.onLogout();
  };

  handleLoginStatus = (res) => {
    if (res.status === SessionStatus.CONNECTED) {
      this.getUserWideData(res.session.mid, this.handleAccessGranted);
    }
  };

  handleAccessGranted = (r) => {
    this.userData = r.response[0];
    this.getFriends(this.userData.id);
  };

  handleAllFriendsLoad = (r) => {
    this.onLogin(r.response);
    this.onUserData(this.userData, r.response.count);
  };

  handleFriendsLoad = (r) => {
    this.onLogin(r.response);
  };

  handleSearchInput = (e) => {
    const query = e.target.value;

    if (query) {
      this.getFriendsByQuery(e.target.value, this.handleFriendsLoad);
    } else {
      this.getFriends(this.userData.id);
    }
  };

  getLoginStatus = () => {
    this._api.Auth.getLoginStatus(this.handleLoginStatus);
  };

  getUserWideData = (id, cb) => {
    this._api.Api.call('users.get', {
      ...ApiSettings.USER_DATA,
      user_ids: id
    }, cb);
  };

  getFriends = (userId) => {
    this._api.Api.call('friends.get', {
      ...ApiSettings.FRIENDS_GET,
      user_id: userId
    }, this.handleAllFriendsLoad);
  };

  getFriendsByQuery (query = '', cb = () => {}) {
    this._api.Api.call('friends.search', {
      ...ApiSettings.FRIENDS_SEARCH,
      user_id: this.userData.id,
      q: query
    }, cb);
  }

  init = () => {
    this._api.init({
      apiId: API_ID
    });

    this.logoutButton && this.logoutButton.addEventListener('click', this.logout);
    this.loginButton && this.loginButton.addEventListener('click', this.login);
    this.searchField && this.searchField.addEventListener('input', debounce(this.handleSearchInput, SEARCH_TIMEOUT));
    this.getLoginStatus();
  };
}

export default Auth;
