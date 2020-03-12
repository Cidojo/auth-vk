import './scss/common.scss';
import './js/main.js';
import pages from './../webpack.pages.js';

if (process.env.NODE_ENV !== 'production') {
  pages.forEach((page) => {
    require(`./templates/pages/${page.path}.pug`);
  });
}
