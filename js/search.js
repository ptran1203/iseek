
const template_map = {
  // <img src="#post_img#" width="200" />
  1: `
  <div class="search-result" pk="#id#" onclick="viewDetail(this)">
<div class="icon">
  
</div>
<div class="content">
  <h4 class="job-title">#title_m#</h4>
  <p>
    <span class="salary">#salary_range#</span>
  </p>
  <div>
    <p>#content_m#</p>
  </div>
  <div class="actions">
    <span class="post-date">#post_date#</span>
  </div>
</div>
</div>
  `,
2:`
<li class="keyword">
  <a href="?q=#word#">
    #word#
  </a>
</li>
` ,
3: `
<div class="modal-dialog">
  <div class="modal-header">
  <h4 class="job-detail-title"><a href="#post_url#" target="_blank">#title#</a></h4>
  <button class="close-btn"onclick="closeDetail(this)">⛌</button>
  </div>
  <div class="modal-body">
      <img src="#post_img#" width="200" style="display:block;margin: 10px auto;"/>
      <div class="job-infos">
        <div class="job-info far fa-money-bill-alt">
          <span style="color:#a95508">#salary_range#</span>
        </div>
        <div class="job-info far fa-clock	">
          <span style="color:#a95508">#post_date#</span>
        </div>
        <div class="job-info fas fa-map-marker-alt">
          <span style="color:#a95508">#address#</span>
        </div>
      </div>

      <div class="job-desc" style="white-space: pre-line">#content#</div>
  </div>
  <div class="modal-footer">
      <a href="#post_url#" class="btn">Appy</a>
  </div>
</div>
`
}
// const hostUrl = 'http://localhost:8000/'
const hostUrl = 'https://iseek.herokuapp.com/'


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

let keywords = [],
  jobs = []

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
  ele.style.display = "none"
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
  ele.classList.remove('detail')
  ele.style.display = 'block'

  const pk = self.getAttribute('pk')
  let job = jobs.find(j => j.id == pk)
  ele.className += ' detail'
  
  ele.innerHTML = generate_html(job, 3)
  ele.style.overflowY = 'scroll'
  if (!ele.className.split(' ').includes('opened')) {
    ele.className += ' opened'
  }
  activeElement(self)
}

/**
* Jquery
*/
jQuery(document).ready(function() {
  let loading = $('#loading'),
    instance = $('#jobs'),
    query = qs['q'],
    footer = $('#footer')
  if (query) {
    $('form').attr('class', 'search-form')
    $.ajax({
      url : getUrl('api/search?q=' + query),
      method : "GET",
      beforeSend: function() {
        instance.html('')
        loading.addClass('spinner')

      },
      success : function(data){
        loading.removeClass('spinner')
        let html = data.reduce((acc, item) => {
          acc += generate_html(item, 1)
          return acc
        }, '')
        jobs = data

        let style = "font-family:monospace;text-align:center;padding:4px;color:#2c5656;",
          query_styled = `<span style="color:#982e2e">${query}</span>`
        
        if (jobs.length){
          instance.append(
            `<h3 style="${style}">
              ${jobs.length} ${query_styled} jobs for you
            </h3>`
          )
          instance.append(html)
        } else {
          instance.append(
          `<div class="empty-jobs">
           <p> Sorry, we can't find any ${query_styled} jobs for you </p>
          </div>`)
        }
        footer.css('margin-top', '50px')
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
    url : getUrl('api/keywords?sort_type=1&limit=10'),
    method : "GET",
    success : function(data){
      keywords = data
      let html = data.slice(0, 10).reduce((acc, item) => {
        acc += generate_html(item, 2)
        return acc
      }, '')
      $('.left-side ol').html(html)
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
})