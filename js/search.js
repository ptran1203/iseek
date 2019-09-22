
const template_map = {
  1: `
  <div class="search-result" pk="#id#" onclick="viewDetail(this)">
<div class="icon">
  <img src="#post_img#" width="200" />
</div>
<div class="content">
  <h4 class="job-title">#title#</h4>
  <a href="#post_url#" target="_blank">Goto page</a>
  <p>
    <span class="salary">#salary_range#</span>
  </p>
  <div>
    <p>#content#</p>
  </div>
  <div class="actions">
    <span class="date">#post_date#</span>
  </div>
</div>
</div>
  `,
3: `
<div class="modal-dialog">
  <div class="modal-header">
  <h4 style="text-align:center;"><a href="#post_url#" target="_blank">#title#</a></h4>
  <button 
    class="close-btn"
    onclick="closeDetail(this)">
    &times;
  </button>
  </div>
  <div class="modal-body">
      <img src="#post_img#" width="200" style="display:block;margin: 10px auto;"/>
      <div style="padding:14px" class="far fa-money-bill-alt">  <span style="color:#fd8925">#salary_range#</span></div>
      <div class="job-desc" style="white-space: pre-line">#content#</div>
  </div>
  <div class="modal-footer">
      <p>
      <span>#post_date#</span>
      <span>#address#</span>
      </p>
      <a href="#post_url#" class="btn" id="btn_ingresar">Appy</a>
  </div>
</div>
`
}
const hostUrl = 'http://localhost:8000/'
let qs = (function(a) {
  if (a == "") return {};
  let b = {};
  for (let i = 0; i < a.length; ++i)
  {
      let p=a[i].split('=', 2);
      if (p.length == 1)
          b[p[0]] = "";
      else
          b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
})(window.location.search.substr(1).split('&'))


function getUrl(url) {
  return hostUrl + url
}

let keywords = []

function generate_html(data, templateId) {
let content = template_map[templateId] || ''
Object.keys(data).map(record => {
  let key = '#' + record + '#'
  content = content.split(key).join(data[record])
})

return content
}

function closeDetail() {
  let ele = document.getElementById('view-detail')
  ele.style.overflowY = ''
  ele.innerHTML = ''
}

function activeElement(self) {
let classList = self.className.split(' '),
  activeEle = document.getElementsByClassName('active')

activeEle = activeEle[0]
if (activeEle) {
  activeEle.classList.remove("active")
}
// remove all pre-active element

if (!classList.includes('active')) {
  self.className += ' active'
}
}

function viewDetail(self) {
  let ele = document.getElementById('view-detail')
  // beforsend
  ele.className += ' bar'
  ele.classList.remove('detail')

  const xhr = new XMLHttpRequest()
  const pk = self.getAttribute('pk')

  xhr.open('GET', getUrl('api/post/') + pk)
  xhr.onload = function () {
    if (xhr.status == 200) {
      ele.className += ' detail'
      ele.innerHTML = generate_html(JSON.parse(xhr.response), 3)
      ele.style.overflowY = 'scroll'
      ele.classList.remove('bar')
      if (!ele.className.split(' ').includes('opened')) {
        ele.className += ' opened'
      }
      activeElement(self)
    }
  }
  xhr.send()
}

/**
* Jquery
*/
jQuery(document).ready(function() {
  let instance = $('#jobs'),
    query = qs['q']
  if (query) {
    $('form').attr('class', 'search-form')
    $.ajax({
      url : getUrl('api/search?q=' + qs['q']),
      method : "GET",
      beforeSend: function() {
        instance.html('')
        instance.addClass("bar")
      },
      success : function(data){
        instance.removeClass("bar")
        let html = data.reduce((acc, item) => {
          acc += generate_html(item, 1)
          return acc
        }, '')
  
        instance.append(html)
  
        // $('#keywords').html(data.length + ' results: ' + query)
        // Set default
        // inputBox.val('')
      },
      error: function(error){
        console.log(error)
      }
    })
  }

$.ajax({
  url : getUrl('api/keywords'),
  method : "GET",
  success : function(data){
    keywords = data
  },
  error: function(error){
    console.log(error)
  }
})

$.ajax({
  url : getUrl('api/count'),
  method : "GET",
  success : function(data){
    keywords = data
    $('input:text').attr('placeholder',`search ${data.count || 0} jobs`);
  },
  error: function(error){
    console.log(error)
  }
})

// Ajax get search data
$('.search-form').on('submit', function() {
  let query = $('.searchTerm').val()
  window.location.replace(`?q=${query}`)
  return false
})

$('.search-forms').on('submit', function(e) {
  e.preventDefault()
  let inputBox = $('.searchTerm'),
    instance = $('#jobs'),
    self = $(this)
  console.log('?',qs)
  $.ajax({
    url : getUrl('api/search?q=' + qs['q']),
    method : "GET",
    beforeSend: function() {
      instance.html('')
      instance.addClass("bar")
    },
    success : function(data){
      self.removeClass('center-from')
      instance.removeClass("bar")
      let html = data.reduce((acc, item) => {
        acc += generate_html(item, 1)
        return acc
      }, '')

      instance.append(html)

      $('#keywords').html(data.length + ' results: ' + query)
      // Set default
      inputBox.val('')
    },
    error: function(error){
      console.log(error)
    }
  })
})
})