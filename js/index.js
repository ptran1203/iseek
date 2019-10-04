const footer = `<div class="lh-footer">
<div class="logo">
  <a href="/itseek" style="margin:15px"><img src="/imgs/logo.png"></a>
</div>
<p>Get It jobs for you!</p>
</div>
<div class="mid-footer">
<h4>Navigation</h4>
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="/resume">Resume</a></li>
</ul>
</div>
<div class="rh-footer">
  <h4>Info</h4>
  <p>created by ptran1203</p>
</div>`

jQuery(document).ready(function() {
  $('#footer').append(footer)
})