
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
  <h4 class="job-detail-title"><a rel="nofollow" href="#post_url#" target="_blank">#title_m#</a></h4>
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

      <div class="job-desc" id="job-content" style="white-space: pre-line"></div>
  </div>
  <div class="modal-footer" id="job-footer">
      <a rel="nofollow" href="#post_url#" class="btn">Appy</a>
  </div>
</div>
`
}
// const hostUrl = 'http://localhost:8000/'
const hostUrl = 'https://iseek.herokuapp.com/'

let gquery
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

function setMainWidth(width) {
  if (window.screen.width <= 959) {
    return;
  }
  document.getElementById('jobs').style.width = width
}

function viewDetail(self) {
  let ele = document.getElementById('view-detail')

  setMainWidth('40%')
  ele.classList.remove('detail')
  ele.style.display = 'block'
  const pk = self.getAttribute('pk')
  let job = jobs.find(j => j.id == pk)
  ele.className += ' detail'
  ele.innerHTML = generate_html(job, 3)
  // Get content and then append data to hmtl
  fetchContent(pk)
  ele.style.overflowY = 'scroll'
  if (!ele.className.split(' ').includes('opened')) {
    ele.className += ' opened'
  }
  activeElement(self)
}

function closeDetail() {
  let ele = document.getElementById('view-detail')
  ele.style.display = "none"
  setMainWidth('50%')
}

async function fetchContent(postId) {
  let instance = document.getElementById("job-content"),
    footer = document.getElementById("job-footer")

  instance.classList.add('spinner', 'spinner-detail')
  footer.style.display = 'none'
  fetch(getUrl(`api/posts/${postId}?fields=content`))
    .then(response => response.json())
    .then(data => {
      instance.classList.remove('spinner', 'spinner-detail')
      instance.innerHTML = data['content']
      footer.style.display = 'block'
      // footer.style.position = 'fixed'
    })
}

function pagingData(page=1) {
  let q = qs['q']
  if (!q) {
    return `?page=${page}`
  }
  return `?q=${qs['q']}&page=${page}`
}

function listPage(total_page, currentPage) {
  let html = ''
  for (let i = 1; i <= total_page; i++) {
    html += `<li class="${currentPage == i ? 'active': ''}">` +
            `<a href="${pagingData(i)}">${i}</a></li>`
  }
  return html
}

function pagingBar(total_page) {
  let currentPage = parseInt(qs['page'] || 1),
    html = '<div class="pagination"><ul>'
  if (currentPage > 1) {
    html += `<li><a href="${pagingData(currentPage - 1)}">&lt;</a></li><li>`
  }
  html += listPage(total_page, currentPage) + '</li>'
  if (currentPage < total_page) {
    html += `<li class="next"><a href="${pagingData(currentPage + 1)}">&gt;</a></li>`
  }
  html += '</ul></div>'
  return html
}
/**
* Jquery
*/
jQuery(document).ready(function() {
  if (qs['page'] == undefined) qs['page'] = 1
  fetchQuery()

  function fetchQuery() {
    let loading = $('#loading'),
      instance = $('#jobs'),
      query = qs['q'],
      page = qs['page'] || 1,
      footer = $('#footer'),
      style = "font-family:monospace;text-align:center;padding:4px;color:#2c5656;",
      url,
      query_styled

    if (query) {
      url = getUrl(`api/search?q=${query}&page=${page}`)
      query_styled = `<span style="color:#982e2e">${query}</span>`
    } else {
      url = getUrl(`api/posts?page=${page}`)
      query_styled = `<span style="color:#982e2e">newest</span>`
    }
    $.ajax({
      url: url,
      method : "GET", 
      beforeSend: function() {
        footer.css('display', 'none')
        instance.html('')
        loading.addClass('spinner')
      },
      success : function(response){
        loading.removeClass('spinner')
        let html = response.data.reduce((acc, item) => {
          acc += generate_html(item, 1)
          return acc
        }, '')
        jobs = response.data
        if (jobs.length){
          instance.append(
            `<h3 style="${style}">
              ${response.total} ${query_styled} jobs found
            </h3>
            <i style=${style}>page ${qs['page']}/${response.total_page}</i>
            `
          )
          instance.append(html)
          instance.append(pagingBar(response.total_page))
        } else {
          instance.append(
          `<div class="empty-jobs">
          <p> Sorry, we can't find any ${query_styled} jobs</p>
          </div>`)
        }
        footer.css('margin-top', '50px')
        footer.css('display', 'block')
      },
      error: function(error){
        console.log(error.message)
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
      console.log(error.message)
    }
  })

  $.ajax({
    url : getUrl('api/count'),
    method : "GET",
    success : function(data){
      keywords = data
      $('input:text').attr('placeholder',`search ${data.count || 0} IT jobs`);
    },
    error: function(error){
      console.log(error.message)
    }
  })

  // Ajax get search data
  $('.search-form').on('submit', function() {
    let query = $('.searchTerm').val()
    window.location.replace(`?q=${query}&page=1`)
    return false
  })
})