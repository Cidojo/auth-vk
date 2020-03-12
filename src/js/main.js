import AuthController from './modules/auth';

const Selector = {
  LOGIN_BUTTON: '#login',
  LOGOUT_BUTTON: '#logout',
  FRAME: '.app__frame',
  FRIENDS_LIST: '.user-block__friends-list',
  SEARCH_INPUT: '#friends-search',
  USER_AVATAR: '.user-block__img img',
  USER_NAME: '.user-block__info h3',
  FRIENDS_COUNT: 'span.user-block__friends-count'
};

const ClassName = {
  LOGGED: 'js-logged'
};

const NO_FRIENDS_MSG = 'ни одного друга не найдено';

const createFriendListItem = (friend) => {
  return `
    <li>
        <a href="https://vk.com/${friend.domain}" target="blank">
            <img src="${friend['photo_50']}">
        </a>
        <p>
            <a href="https://vk.com/${friend.domain}" target="blank">${friend['first_name']} ${friend['last_name']}</a>
        </p>
    </li>
  `;
};

const init = () => {
  const loginEl = document.querySelector(Selector.LOGIN_BUTTON);
  const logoutEl = document.querySelector(Selector.LOGOUT_BUTTON);
  const frameEl = document.querySelector(Selector.FRAME);
  const friendsListEl = document.querySelector(Selector.FRIENDS_LIST);
  const userAvatarEl = document.querySelector(Selector.USER_AVATAR);
  const userNameEl = document.querySelector(Selector.USER_NAME);
  const userFriendsCountEl = document.querySelector(Selector.FRIENDS_COUNT);
  const searchInputEl = document.querySelector(Selector.SEARCH_INPUT);

  const handleLogout = () => {
    frameEl.classList.remove(ClassName.LOGGED);
  };

  const handleUserData = (userData, count) => {
    userNameEl.textContent = `${userData['first_name']} ${userData['last_name']}`;
    userAvatarEl.alt = `${userData['first_name']} ${userData['last_name']}`;
    userAvatarEl.src = userData['photo_max'];
    userFriendsCountEl.textContent = count;
  };

  const handleLogin = ({ items }) => {
    frameEl.classList.add(ClassName.LOGGED);

    if (items.length) {
      friendsListEl.innerHTML = items
        .map(createFriendListItem).join('');
    } else {
      friendsListEl.innerHTML = NO_FRIENDS_MSG;
    }
  };

  const settings = {
    loginEl,
    logoutEl,
    frameEl,
    searchInputEl,
    onLogout: handleLogout,
    onLogin: handleLogin,
    onUserData: handleUserData
  };

  const authController = new AuthController(settings);

  authController.init();
};

window.addEventListener('DOMContentLoaded', init);
