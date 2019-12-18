const footer = `
<div class="footer">
  <a href="https://facebook.com/css1412" target="_blank"><i class="fab fa-facebook-square"></i></a>
  <a href="https://github.com/ptran1203" target="_blank"><i class="fab fa-github"></i></a>
</div>`

window.onscroll = function() {
  let top  = window.pageYOffset || document.documentElement.scrollTop,
    left = window.pageXOffset || document.documentElement.scrollLeft,
    ele = document.getElementById('view-detail')

  if (window.screen.width <= 959) {
    return;
  }

  if (top < 150) {
    ele.style.top = '150px';
    ele.style.position = 'absolute'
    // ele.style.top = 'px';
  } else {
    ele.style.position = 'fixed'
    ele.style.top = '0px';
  }
};


jQuery(document).ready(function() {
  $('#footer').append(footer)
})