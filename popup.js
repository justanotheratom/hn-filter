function formatAge(ms) {
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return mins + 'm'
    const hrs = Math.floor(mins / 60)
    return hrs + 'h'
}

const COLORS = {
    recent: [0, 255, 0, 0.1],
    low: [255, 255, 0, 0.1],
    topc: [255, 102, 0, 0.1],
    oldest: [128, 128, 128, 0.1]
}

document.addEventListener('DOMContentLoaded', () => {
    const recentEl = document.getElementById('recent')
    const lowEl = document.getElementById('low')
    const topEl = document.getElementById('topc')
    const oldestEl = document.getElementById('oldest')
    chrome.storage.sync.get({
        recent: false,
        low: false,
        topc: false,
        oldest: false
    }, opts => {
        recentEl.checked = opts.recent
        lowEl.checked = opts.low
        topEl.checked = opts.topc
        oldestEl.checked = opts.oldest
        fetchAndRender(opts)
    })
    const updateAndRender = () => {
        const settings = {
            recent: recentEl.checked,
            low: lowEl.checked,
            topc: topEl.checked,
            oldest: oldestEl.checked
        }
        chrome.storage.sync.set(settings, () => fetchAndRender(settings))
    }
    [recentEl, lowEl, topEl, oldestEl].forEach(el =>
        el.addEventListener('change', updateAndRender)
    )
})

async function fetchAndRender(opts) {
    const resultsEl = document.getElementById('results')
    resultsEl.className = 'loading'
    resultsEl.textContent = 'Loading…'
    try {
        const resp = await fetch('https://news.ycombinator.com/')
        const html = await resp.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const rows = Array.from(doc.querySelectorAll('tr.athing'))
        const posts = rows.map(row => {
            const titleEl = row.querySelector('.storylink') || row.querySelector('td.title a')
            const title = titleEl.textContent
            const url = titleEl.href
            const sub = row.nextElementSibling
            const ageText = sub.querySelector('span.age')?.textContent || ''
            const timeMs = parseAge(ageText)
            const commentLink = Array.from(sub.querySelectorAll('a')).find(a =>
                a.textContent.trim().endsWith('comments') ||
                a.textContent.trim() === 'discuss'
            )
            const comments = commentLink
                ? (commentLink.textContent.trim() === 'discuss' ? 0 : parseInt(commentLink.textContent.trim().split(' ')[0]) || 0)
                : 0
            return { id: row.id, title, url, comments, timeMs }
        })
        render(posts, opts)
    } catch (e) {
        const resultsEl = document.getElementById('results')
        resultsEl.className = ''
        resultsEl.textContent = 'Error: ' + e.message
    }
}

function blendColors(keys) {
    const blended = keys
        .map(key => COLORS[key])
        .reduce((acc, col) => acc.map((v, i) => v + col[i]), [0, 0, 0, 0])
        .map((v, i) => v / keys.length)
    return `rgba(${blended[0]}, ${blended[1]}, ${blended[2]}, ${blended[3]})`
}

function render(posts, opts) {
    const resultsEl = document.getElementById('results')
    resultsEl.innerHTML = ''
    let list = []
    if (opts.recent) list = list.concat(posts.filter(p => p.timeMs <= 2 * 3600 * 1000))
    if (opts.low) list = list.concat(posts.filter(p => p.comments < 10))
    if (opts.topc) list = list.concat([...posts].sort((a,b) => b.comments - a.comments).slice(0,3))
    if (opts.oldest) list = list.concat([...posts].sort((a,b) => b.timeMs - a.timeMs).slice(0,3))
    const unique = Array.from(new Map(list.map(p => [p.id, p])).values())
    if (!unique.length) {
        resultsEl.className = 'no-match'
        resultsEl.textContent = 'No posts match'
        return
    }
    unique.forEach(p => {
        const el = document.createElement('div')
        el.className = 'item'
        const applied = []
        if (opts.recent && p.timeMs <= 2 * 3600 * 1000) applied.push('recent')
        if (opts.low && p.comments < 10) applied.push('low')
        if (opts.topc && [...posts].sort((a,b) => b.comments - a.comments).slice(0,3).some(x => x.id === p.id)) applied.push('topc')
        if (opts.oldest && [...posts].sort((a,b) => b.timeMs - a.timeMs).slice(0,3).some(x => x.id === p.id)) applied.push('oldest')
        if (applied.length) {
            el.style.backgroundColor = blendColors(applied)
        }
        const link = document.createElement('a')
        link.href = p.url
        link.textContent = p.title
        link.target = '_blank'
        link.className = 'title'
        const ageEl = document.createElement('span')
        ageEl.className = 'age'
        ageEl.textContent = formatAge(p.timeMs)
        const commentsLink = document.createElement('a')
        commentsLink.href = 'https://news.ycombinator.com/item?id=' + p.id
        commentsLink.textContent = '(' + p.comments + ' comments)'
        commentsLink.target = '_blank'
        commentsLink.className = 'comments'
        el.appendChild(link)
        el.appendChild(ageEl)
        el.appendChild(commentsLink)
        resultsEl.appendChild(el)
    })
}

function parseAge(text) {
    const [num, unit] = text.split(' ')
    const n = parseInt(num) || 0
    if (unit.startsWith('minute')) return n * 60 * 1000
    if (unit.startsWith('hour')) return n * 3600 * 1000
    if (unit.startsWith('day')) return n * 24 * 3600 * 1000
    return Infinity
}