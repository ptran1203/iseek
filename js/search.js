
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
  2: `
<li class="keyword">
  <a href="?q=#word#">
    #word#
  </a>
</li>
` ,
  3: `
<div class="modal-dialog">
  <div class="modal-header">
    <h3 class="job-detail-title"><a rel="nofollow" href="#post_url#" target="_blank">#title_m#</a></h3>
      <h4 id="job-title" style="text-align:center;color:#4182e4" ></h4>
      <a class="apply-btn" target="_blank" rel="nofollow" href="#post_url#">Apply</a>
    <div class="job-infos">
        <div class="job-info far fa-money-bill-alt">
          <span id="salary" style="color:#9e9e9e">#salary_range#</span>
          (<span id="salary_est" style="color:#9e9e9e"></span>)
        </div>
        <div class="job-info far fa-clock">
          <span style="color:#58595b">#post_date#</span>
        </div>
        <div class="job-info fas fa-map-marker-alt">
          <span style="color:#58595b">#address#</span> - 
          <a style="border-bottom:1px dashed; color: #69695b;font-weight:100" target="_blank" href="https://www.google.com/maps?q=#address#">
          Google map
          </a>
        </div>
      </div>
    <button class="close-btn"onclick="closeDetail(this)">⛌</button>
  </div>
  <div class="modal-body scrollbar">
      <div class="job-desc" id="job-content" style="white-space-old: pre-line"></div>
  </div>
</div>
`
}
// const hostUrl = 'http://localhost:8000/'
const hostUrl = 'https://iseek.herokuapp.com/'

let gquery
let qs = (function (a) {
  if (a == "") return {};
  let b = {};
  for (let i = 0; i < a.length; ++i) {
    let p = a[i].split('=', 2);
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
  // ele.style.overflowY = 'scroll'
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

function _singleLine(acc, line) {
  if (line.endsWith(':')) {
    return acc + "<b>" + line + "</b>";
  }

  if (line.startsWith('-')) {
    return acc + line.replace('-');
  }

  return acc + "<li>" + line + "</li>";
}

function cleanedContent(content) {
  let blocks = content.split("\n\n");
  return blocks.reduce((acc, block) => {
    let [head, ...tail] = block.split("\n");
    let tailList = tail.reduce((a, t) => {
      return _singleLine(a, t);
    }, "");
    acc.push(`<b>${head}</b>\n<ul style="list-style-type: disc">${tailList}</ul>`);
    return acc;
  }, []).join("");
}

async function fetchContent(postId) {
  let instance = document.getElementById("job-content");
  instance.classList.add('spinner', 'spinner-detail')
  fetch(getUrl(`api/posts/${postId}?fields=content`))
    .then(response => response.json())
    .then(data => {
      instance.classList.remove('spinner', 'spinner-detail')
      instance.innerHTML = cleanedContent(data['content'])

    })

  getMoreInfo(postId)
}

async function getMoreInfo(postId) {
  let instance = document.getElementById("salary_est");
  if (instance.innerHTML != '') {
    return
  }
  fetch(getUrl(`api/posts/${postId}/salary`))
    .then(response => response.json())
    .then(data => {
      instance.style.pointer = 'cursor'
      instance.innerHTML = data['salary_estimate']
      if (data['years_exp']) {
        let expText = data['years_exp'].join("~");
        if (data['years_exp'][0] == data['years_exp'][1]) {
          expText = data['years_exp'][0];
        }
        document.getElementById("job-title").innerHTML = "kinh nghiệm: " + expText + " năm";
      }
    })
}

function pagingData(page = 1) {
  let q = qs['q']
  if (!q) {
    return `?page=${page}`
  }
  return `?q=${qs['q']}&page=${page}`
}

function listPage(total_page, currentPage) {
  let html = ''
  for (let i = 1; i <= total_page; i++) {
    html += `<li class="${currentPage == i ? 'active' : ''}">` +
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
jQuery(document).ready(function () {
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
      method: "GET",
      beforeSend: function () {
        footer.css('display', 'none')
        instance.html('')
        loading.addClass('spinner')
      },
      success: function (response) {
        loading.removeClass('spinner')
        let html = response.data.reduce((acc, item) => {
          acc += generate_html(item, 1)
          return acc
        }, '')
        jobs = response.data
        if (jobs.length) {
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
      error: function (error) {
        console.log(error.message)
      }
    })
  }

  $.ajax({
    url: getUrl('api/keywords?sort_type=1&limit=10'),
    method: "GET",
    success: function (data) {
      keywords = data
      let html = data.slice(0, 10).reduce((acc, item) => {
        acc += generate_html(item, 2)
        return acc
      }, '')
      $('.left-side ol').html(html)
    },
    error: function (error) {
      console.log(error.message)
    }
  })

  $.ajax({
    url: getUrl('api/count'),
    method: "GET",
    success: function (data) {
      keywords = data
      $('input:text').attr('placeholder', `search ${data.count || 0} IT jobs`);
    },
    error: function (error) {
      console.log(error.message)
    }
  })

  // Ajax get search data
  $('.search-form').on('submit', function () {
    let query = $('.searchTerm').val()
    window.location.replace(`?q=${query}&page=1`)
    return false
  })
})